const asyncHandler = require('express-async-handler');
const path = require("path")
const fs = require("fs")
const fsextra = require('fs-extra');
const sharp = require('sharp');
const https = require('https');

const Collection = require('postman-collection').Collection;

const ApiEndpoint = require("../models/apiendpoint.model");
const { User } = require('../models/user.model');
const ActiveScan = require("../models/activescan.model");
const ActiveScanVulnerability = require("../models/activescanvulnerability.model");

const { none } = require('../config/multerUpload');
const APICollection = require('../models/apicollection.model');
const APICollectionVersion = require('../models/apicollectionversion.model');
const OrgProject = require('../models/orgproject.model');

const Vulnerability = require('../models/vulnerability.model');
const jsyaml = require('js-yaml');
const pdfkit = require('pdfkit-table');
const YAML = require('yaml');
const Chart = require('chart.js');
const { ChartJSNodeCanvas } = require('chartjs-node-canvas');
const nodemailer = require('nodemailer');
const { type } = require('os');
const axios = require('axios');
const { URL } = require('url');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');


// Get all api collections
module.exports.fetchAPICollections = asyncHandler(async (req, res) => {
    const page = parseInt(req.params.page, 10) || 1;
    const rowsPerPage = parseInt(req.params.rowsPerPage, 10) || 10;

    if (page < 1 || rowsPerPage < 1) {
        return res.status(400).json({ success: false, message: "Invalid pagination parameters" });
    }

    const skip = (page - 1) * rowsPerPage;

    const pipeline = [
        { $match: { organization: req.user.organization } },
        { $project: { _id: 1 } },
        {
            $lookup: {
                from: 'apicollections',
                localField: '_id',
                foreignField: 'orgProject',
                as: 'apiCollections'
            }
        },
        { $unwind: '$apiCollections' },
        {
            $replaceRoot: { newRoot: '$apiCollections' }
        },
        {
            $lookup: {
                from: 'orgprojects',
                localField: 'orgProject',
                foreignField: '_id',
                as: 'orgProject'
            }
        },
        { $unwind: '$orgProject' },
        {
            $lookup: {
                from: 'apicollectionversions',
                let: { apiCollectionId: '$_id' },
                pipeline: [
                    { $match: { $expr: { $eq: ['$apiCollection', '$$apiCollectionId'] } } },
                    { $sort: { createdAt: -1 } },
                    { $limit: 1 }
                ],
                as: 'latestVersion'
            }
        },
        {
            $addFields: {
                versionCount: { $size: '$latestVersion' },
                latestVersion: { $arrayElemAt: ['$latestVersion', 0] }
            }
        },
        { $sort: { createdAt: -1 } },
        {
            $facet: {
                metadata: [{ $count: 'totalCount' }],
                data: [{ $skip: skip }, { $limit: rowsPerPage }]
            }
        }
    ];

    const result = await OrgProject.aggregate(pipeline);

    const apiCollections = result[0].data;
    const totalCount = result[0].metadata[0]?.totalCount || 0;

    res.status(200).json({
        apiCollections,
        totalCount,
    });
});


// Fetch versions of an API collection
module.exports.fetchAPICollectionVersions = asyncHandler(async (req, res) => {

    const { collectionId, pageNumber } = req.query;

    const apiCollection = await APICollection.findById(collectionId).populate('user').lean();

    const pageSize = 10; // Number of active scans per page

    const totalRecords = await APICollectionVersion.countDocuments({ apiCollection: collectionId });
    const totalPages = Math.ceil(totalRecords / pageSize);

    // Calculate the skip value based on the pageNumber and pageSize
    const skip = (pageNumber - 1) * pageSize;

    const apiCollectionVersions = await APICollectionVersion.find({ apiCollection: collectionId }).sort({ createdAt: -1 })
    .skip(skip)
    .limit(pageSize).lean();

    for (var i = 0; i < apiCollectionVersions.length; i++) {

        var endpointsCount = await ApiEndpoint.countDocuments({ theCollectionVersion: apiCollectionVersions[i]._id })
        apiCollectionVersions[i].endpointsCount = endpointsCount;

        var scansCount = await ActiveScan.countDocuments({ theCollectionVersion: apiCollectionVersions[i]._id })
        apiCollectionVersions[i].scansCount = scansCount;

    }

    // Return the scans
    res.status(200);
    res.json({ apiCollection, apiCollectionVersions, totalRecords, currentPage: pageNumber,
        totalPages, })
});



// Fetch endpoints of an API collection version
module.exports.fetchEndpointsofAVersion = asyncHandler(async (req, res) => {

    const { versionId } = req.query;

    const apiEndpoints = await ApiEndpoint.find({theCollectionVersion:versionId})

    // Return the endpoints
    res.status(200);
    res.json({ apiEndpoints,  })
});



// Delete API Collection
module.exports.deleteAPICollection = asyncHandler(async (req, res) => {

    try {
        const { id } = req.body;

        // Find the APICollection
        const apiCollection = await APICollection.findById(id);
        if (!apiCollection) {
            return res.status(404).json({ error: 'Collection not found.' });
        }


        const deletedAPICollection = await APICollection.findByIdAndDelete(id);
        if (!deletedAPICollection) {
            return res.status(404).json({ error: 'Failed to delete the collection.' });
        }


        // Find and delete all APICollectionVersions related to the deleted collection
        const deletedCollectionVersions = await APICollectionVersion.find({ apiCollection: id });
        const deletedCollectionVersionIds = deletedCollectionVersions.map(version => version._id);

        await APICollectionVersion.deleteMany({ apiCollection: id });

        // Delete ApiEndpoints that have theCollectionVersion set to any of the deleted collection versions
        await ApiEndpoint.deleteMany({ theCollectionVersion: { $in: deletedCollectionVersionIds } });


        res.json({ message: 'Collection, related collectionVersions and their endpoints are deleted successfully' });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


// Delete API Collection version
module.exports.deleteAPICollectionVersion = asyncHandler(async (req, res) => {

    try {
        const { id } = req.body;

        // Find the APICollection
        const apiCollectionVersion = await APICollectionVersion.findById(id);
        if (!apiCollectionVersion) {
            return res.status(404).json({ error: 'Collection version not found.' });
        }


        const deletedAPICollectionVersion = await APICollectionVersion.findByIdAndDelete(id);
        if (!deletedAPICollectionVersion) {
            return res.status(404).json({ error: 'Failed to delete the collection version.' });
        }

        // Delete ApiEndpoints that have theCollectionVersion set to any of the deleted collection versions
        await ApiEndpoint.deleteMany({ theCollectionVersion: id });


        res.json({ message: 'CollectionVersion and its endpoints are deleted successfully' });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});



module.exports.startActiveScanOfACollectionVersion = asyncHandler(async (req, res) => {

});

module.exports.fetchActiveScansOfACollectionVersion = asyncHandler(async (req, res) => {

});

// Fetch content from a link and check its type
const fetchAndCheckContentType = async (link) => {

    try {
        // Fetch the text content from the link
        const response = await axios.get(link);

        // Get the text content
        const textContent = response.data;

        // Check if it is Swagger JSON
        let parsedContent;

        try {
            parsedContent = textContent;

            if (parsedContent.openapi || parsedContent.swagger) {
                return {
                    contentType: 'application/json',
                    content: parsedContent,
                    detectedType: 'Swagger JSON',
                };
            }
        } catch (error) {
            // console.log('error', error)
            // Not Swagger JSON
            console.log('Not Swagger JSON', error)
        }

        // Check if it is Swagger YAML
        try {
            parsedContent = jsyaml.load(textContent);
            if (parsedContent.openapi || parsedContent.swagger) {
                //console.log('Swagger YAML Content:', parsedContent);
                return {
                    contentType: 'application/yaml',
                    content: parsedContent,
                    detectedType: 'Swagger YAML',
                };
            }
        } catch (error) {
            // Not Swagger YAML
            //console.log('error', error)
            console.log('Not Swagger YAML', error)
        }

        // Check if it is Postman JSON
        try {
            parsedContent = textContent;
            //if (parsedContent.info && parsedContent.info._postman_id) {
            if (parsedContent.info) {
                //console.log('Postman JSON Content:', parsedContent);
                return {
                    contentType: 'application/json',
                    content: parsedContent,
                    detectedType: 'Postman JSON',
                };
            }
        } catch (error) {
            // Not Postman JSON
            console.log('Not Postman JSON', error)
        }

        // Check if it is Postman YAML
        try {
            parsedContent = jsyaml.load(textContent);
            //if (parsedContent.info && parsedContent.info._postman_id) {
            if (parsedContent.info) {
                //console.log('Postman YAML Content:', parsedContent);
                return {
                    contentType: 'application/yaml',
                    content: parsedContent,
                    detectedType: 'Postman YAML',
                };
            }
        } catch (error) {
            // Not Postman YAML
            console.log('Not Postman YAML', error)
        }

        //console.log('Not Swagger JSON, Swagger YAML, Postman JSON, or Postman YAML content');

        // If none of the checks match, return as plain text
        return {
            contentType: 'text/plain',
            content: textContent,
            detectedType: 'Unknown',
        };
    } catch (error) {
        console.error('Error2:', error);
        return {
            contentType: 'Error',
            content: null,
            detectedType: 'Unknown',
        };
    }
};


// Parse Postman JSON
const parsePostmanJSON = async (collectiondata, user, collectionFilePath, theCollection, version) => {

    //if (collectiondata.info._postman_id && collectiondata.item && Array.isArray(collectiondata.item)) {
    if (collectiondata.info && collectiondata.item && Array.isArray(collectiondata.item)) {


        const theCollectionVersion = await APICollectionVersion.create({
            apiCollection: theCollection._id,
            version: version,
        });


        // Function to recursively process items
        const processItems = async (items) => {

            for (const item of items) {
                let authorizationObject = { type: 'None' };


                if (item.item && Array.isArray(item.item)) {

                    await processItems(item.item);

                } else {

                    if (item.request.auth) {
                        const authType = item.request.auth.type;
                        if (authType === 'bearer') {
                            authorizationObject = {
                                type: 'bearer',
                                bearerToken: item.request.auth.bearer
                            };
                        } else if (authType === 'apikey' || authType === 'jwt' || authType === 'digest' || authType === 'basic' || authType === 'oauth1' || authType === 'oauth2') {
                            authorizationObject = {
                                type: authType,
                                apiKey: item.request.auth.apikey
                            };
                        }
                    }

                    ////////////////////

                    let data;

                    if (typeof item.request.url === 'string') {

                        //   if(!item.request.url.includes('{{')){

                        // Case 1: If "url" is a string, use it directly
                        data = new ApiEndpoint({
                            theCollectionVersion: theCollectionVersion._id,
                            user: user,
                            protocol: '',
                            url: item.request.url,
                            name: item.name,
                            method: item.request.method,
                            queryParams: item.request.url.query,
                            headers: item.request.header,
                            requestBody: item.request.body,
                            authorization: authorizationObject
                        });

                        await data.save();
                        //}

                    } else if (typeof item.request.url === 'object' && item.request.url !== null) {

                        const rawUrl = item.request.url.raw;

                        if (rawUrl && typeof rawUrl === 'string' && rawUrl !== "") {

                            // Case 2: If "raw" URL exists, use it directly
                            data = new ApiEndpoint({
                                theCollectionVersion: theCollectionVersion._id,
                                user: user,
                                protocol: item.request.url.protocol,
                                url: rawUrl,
                                name: item.name,
                                method: item.request.method,
                                queryParams: item.request.url.query,
                                headers: item.request.header,
                                requestBody: item.request.body,
                                authorization: authorizationObject
                            });

                            await data.save();

                        } else if (Array.isArray(item.request.url.host) && Array.isArray(item.request.url.path)) { // if host and path are arrays

                            // Case 3: If "protocol" is not present but "host" and "path" exist, generate URL
                            const generatedUrl = `${item.request.url.protocol}://${Array.isArray(item.request.url.host) ? item.request.url.host.join('.') : item.request.url.host}/${Array.isArray(item.request.url.path) ? item.request.url.path.join('/') : item.request.url.path}`;

                            // if(!generatedUrl.includes('{{')){

                            data = new ApiEndpoint({
                                theCollectionVersion: theCollectionVersion._id,
                                user: user,
                                protocol: item.request.url.protocol,
                                url: generatedUrl,
                                name: item.name,
                                method: item.request.method,
                                queryParams: item.request.url.query,
                                headers: item.request.header,
                                requestBody: item.request.body,
                                authorization: authorizationObject
                            });

                            await data.save();
                            // }

                        } else if (!Array.isArray(item.request.url.host) && Array.isArray(item.request.url.path)) { // path is array but host is string

                            const host = typeof item.request.url.host === 'string' ? item.request.url.host : (Array.isArray(item.request.url.host) ? item.request.url.host.join('.') : '');
                            const path = Array.isArray(item.request.url.path) ? item.request.url.path.join('/') : item.request.url.path;

                            const generatedUrl = `${item.request.url.protocol}://${host}/${path}`;

                            // if(!generatedUrl.includes('{{')){
                            data = new ApiEndpoint({
                                theCollectionVersion: theCollectionVersion._id,
                                user: user,
                                url: generatedUrl,
                                name: item.name,
                                method: item.request.method,
                                queryParams: item.request.url.query,
                                headers: item.request.header,
                                requestBody: item.request.body,
                                authorization: authorizationObject
                            });

                            await data.save();
                            //}


                        } else if (Array.isArray(item.request.url.host) && !Array.isArray(item.request.url.path)) { // host is array but path is string

                            const host = Array.isArray(item.request.url.host) ? item.request.url.host.join('.') : item.request.url.host;
                            const path = typeof item.request.url.path === 'string' ? item.request.url.path : (Array.isArray(item.request.url.path) ? item.request.url.path.join('/') : '');

                            const generatedUrl = `${item.request.url.protocol}://${host}/${path}`;

                            //  if(!generatedUrl.includes('{{')){

                            data = new ApiEndpoint({
                                theCollectionVersion: theCollectionVersion._id,
                                user: user,
                                url: generatedUrl,
                                name: item.name,
                                method: item.request.method,
                                queryParams: item.request.url.query,
                                headers: item.request.header,
                                requestBody: item.request.body,
                                authorization: authorizationObject
                            });

                            await data.save();
                            // }

                        } else {
                            console.log("item.request:", item.request)
                            // Handle the case where neither "raw" nor "host" and "path" are present
                            //throw new Error('Invalid format for item.request.url');
                        }
                    } else {

                        console.log("item.request:", item.request)
                        // Handle the case where item.request.url is not an object or string
                        //throw new Error('Invalid type for item.request.url');
                    }

                    ////////////


                    try {
                        // await data.save();
                    } catch (error) {
                        return { message: 'An error occurred', error: error };
                    }
                }
            }
        };

        await processItems(collectiondata.item, null);

        // Call the runActiveScan function and return the result
        //const theScan = await runActiveScan(user, theCollection, projectName, email);
        //return theScan;
        return { message: 'Collection added' };
    } else {
        return { message: 'Not a valid PostMan Collection' };
    }
};


// Parse Postman YAML
const parsePostmanYAML = async (collectionData, user, collectionFilePath, theCollection, version) => {

    try {

        // Parse the YAML data
        const collection = collectionData;

        if (collection.info._postman_id && collection.item && Array.isArray(collection.item)) {


            const theCollectionVersion = await APICollectionVersion.create({
                apiCollection: theCollection._id,
                version: version,
            });

            // Save all endpoints data in DB
            for (const item of collection.item) {
                let authorizationObject = { type: 'None' };

                if (item.request.auth) {
                    const authType = item.request.auth.type;

                    switch (authType) {
                        case 'bearer':
                            authorizationObject = {
                                type: 'bearer',
                                bearerToken: item.request.auth.bearer,
                            };
                            break;
                        case 'apikey':
                            authorizationObject = {
                                type: 'apikey',
                                apiKey: item.request.auth.apikey,
                            };
                            break;
                        case 'jwt':
                            authorizationObject = {
                                type: 'jwt',
                                apiKey: item.request.auth.apikey,
                            };
                            break;
                        case 'digest':
                            authorizationObject = {
                                type: 'digest',
                                apiKey: item.request.auth.apikey,
                            };
                            break;
                        case 'basic':
                            authorizationObject = {
                                type: 'basic',
                                basicAuth: item.request.auth.basic,
                            };
                            break;
                        case 'oauth1':
                            authorizationObject = {
                                type: 'oauth1',
                                basicAuth: item.request.auth.basic,
                            };
                            break;
                        case 'oauth2':
                            authorizationObject = {
                                type: 'oauth2',
                                basicAuth: item.request.auth.basic,
                            };
                            break;
                        default:
                            break;
                    }
                }

                const protocol = item.request.url.startsWith('https://') ? 'https' : 'http';
                const urlParts = new URL(item.request.url);
                const host = urlParts.hostname;
                const port = urlParts.port || '';
                const endpoint = urlParts.pathname.substr(1); // Remove leading slash

                const queryParams = {};
                urlParts.searchParams.forEach((value, key) => {
                    queryParams[key] = value;
                });

                const data = new ApiEndpoint({
                    theCollectionVersion: theCollectionVersion._id,
                    user: user,
                    protocol: protocol,
                    host: host,
                    port: port,
                    endpoint: endpoint,
                    name: item.name,
                    method: item.request.method,
                    queryParams: queryParams,
                    headers: item.request.header,
                    requestBody: item.request.body,
                    authorization: authorizationObject,
                });

                await data.save();
            }

            //res.send({ message: "Scan Started" });
            //const theScan = await runActiveScan(user, theCollection, projectName, email);

            //return theScan;
            return { message: 'Collection added' };
        } else {
            return { message: 'Not a valid Postman Collection' };
        }
    } catch (error) {
        console.error('Error3:', error);
        return { message: 'An error occurred while parsing the collection' };
    }
};




// Parse Swagger JSON
const parseSwaggerJSON = async (swaggerData, user, collectionFilePath, theCollection, version) => {

    // let theCollection;



    const theCollectionVersion = await APICollectionVersion.create({
        apiCollection: theCollection._id,
        version: version,
    });

    // Function to extract endpoints from Swagger collection
    function extractEndpoints(swaggerData) {
        const paths = swaggerData.paths;
        const host = swaggerData.host || '';
        const protocol = (swaggerData.schemes && swaggerData.schemes[0]) || '';
        const port = swaggerData.host ? swaggerData.host.split(':')[1] || '' : '';

        const endpoints = [];

        const securityDefinitions = swaggerData.securityDefinitions || {};
        const defaultSecurity = swaggerData.security || [];

        for (const path in paths) {
            const methods = paths[path];
            for (const method in methods) {
                const endpointData = methods[method];
                const endpoint = {
                    theCollectionVersion: theCollectionVersion._id,
                    name: endpointData.summary || '',
                    protocol: protocol,
                    host: host,
                    port: port,
                    endpoint: path,
                    url: host + path,
                    method: method.toUpperCase(),
                    headers: [],
                    queryParams: [],
                    authorization: {
                        type: 'None',
                        apikey: [],
                        bearer: [],
                        basic: [],
                        digest: [],
                        oauth1: [],
                        oauth2: [],
                    },
                    requestBody: {},
                    responseBody: {},
                    description: '',
                    riskScore: '',
                    piiFields: [],
                    alerts: [],
                    firstDetected: '',
                    lastActive: '',
                    isAuthenticated: '',
                };

                // Extract headers
                if (endpointData.hasOwnProperty('parameters')) {
                    const parameters = endpointData.parameters;
                    for (const parameter of parameters) {
                        if (parameter.in === 'header') {
                            const header = {
                                key: parameter.name,
                                value: '',
                                type: '', // Set the appropriate type value
                            };
                            endpoint.headers.push(header);
                        } else if (parameter.in === 'query') {
                            const queryParam = {
                                key: parameter.name,
                                value: '',
                            };
                            endpoint.queryParams.push(queryParam);
                        }
                    }
                }

                // Extract authorization
                const endpointSecurity = endpointData.security || defaultSecurity;
                for (const security of endpointSecurity) {
                    for (const key in security) {
                        const securityDefinition = securityDefinitions[key];
                        if (securityDefinition) {
                            const securityType = securityDefinition.type || '';
                            const securityDetails = {
                                name: key,
                                type: securityType,
                            };

                            switch (securityType) {
                                case 'apiKey':
                                    securityDetails.in = securityDefinition.in || '';
                                    endpoint.authorization.apikey.push(securityDetails);
                                    break;
                                case 'oauth2':
                                    securityDetails.flow = securityDefinition.flow || '';
                                    endpoint.authorization.oauth2.push(securityDetails);
                                    break;
                                case 'basic':
                                    endpoint.authorization.basic.push(securityDetails);
                                    break;
                                case 'bearer':
                                    endpoint.authorization.bearer.push(securityDetails);
                                    break;
                                case 'digest':
                                    endpoint.authorization.digest.push(securityDetails);
                                    break;
                                case 'jwt':
                                    endpoint.authorization.jwt.push(securityDetails);
                                    break;
                                case 'oauth1':
                                    endpoint.authorization.oauth1.push(securityDetails);
                                    break;
                                case 'None':
                                    endpoint.authorization.None.push(securityDetails);
                                    break;
                                default:
                                    break;
                            }
                        }
                    }
                }

                // Save the endpoint
                endpoints.push(endpoint);
            }
        }

        return endpoints;
    }


    // Save endpoints to the database
    const endpoints = extractEndpoints(swaggerData);


    try {
        const savedEndpoints = await ApiEndpoint.insertMany(endpoints);

        //var theScan = await runActiveScan(user, theCollection, projectName, email);
        //return theScan;
        return { message: 'Collection added' };

    } catch (err) {
        //console.error('Error saving endpoints:', err);
    }

}




// Parse OpenAPI JSON
const parseOpenAPIJSON = async (openAPIData, user, collectionFilePath, theCollection, version) => {


    const theCollectionVersion = await APICollectionVersion.create({
        apiCollection: theCollection._id,
        version: version,
    });

    // Function to extract endpoints from Swagger collection
    function extractEndpoints(openAPIData) {

        const paths = openAPIData.paths;
        const host = openAPIData.servers[0].url || '';
        const protocol = (openAPIData.schemes && openAPIData.schemes[0]) || '';
        const port = openAPIData.host ? openAPIData.host.split(':')[1] || '' : '';

        const endpoints = [];

        const securityDefinitions = openAPIData.securityDefinitions || {};
        const defaultSecurity = openAPIData.security || [];

        for (const path in paths) {
            const methods = paths[path];
            for (const method in methods) {
                const endpointData = methods[method];
                const endpoint = {
                    theCollectionVersion: theCollectionVersion._id,
                    name: endpointData.summary || '',
                    protocol: protocol,
                    host: host,
                    port: port,
                    endpoint: path,
                    url: host + path,
                    method: method.toUpperCase(),
                    headers: [],
                    queryParams: [],
                    authorization: {
                        type: 'None',
                        apikey: [],
                        bearer: [],
                        basic: [],
                        digest: [],
                        oauth1: [],
                        oauth2: [],
                    },
                    requestBody: {},
                    responseBody: {},
                    description: '',
                    riskScore: '',
                    piiFields: [],
                    alerts: [],
                    firstDetected: '',
                    lastActive: '',
                    isAuthenticated: '',
                };

                // Extract headers
                if (endpointData.hasOwnProperty('parameters')) {
                    const parameters = endpointData.parameters;
                    for (const parameter of parameters) {
                        if (parameter.in === 'header') {
                            const header = {
                                key: parameter.name,
                                value: '',
                                type: '', // Set the appropriate type value
                            };
                            endpoint.headers.push(header);
                        } else if (parameter.in === 'query') {
                            const queryParam = {
                                key: parameter.name,
                                value: '',
                            };
                            endpoint.queryParams.push(queryParam);
                        }
                    }
                }

                // Extract authorization
                const endpointSecurity = endpointData.security || defaultSecurity;
                for (const security of endpointSecurity) {
                    for (const key in security) {
                        const securityDefinition = securityDefinitions[key];
                        if (securityDefinition) {
                            const securityType = securityDefinition.type || '';
                            const securityDetails = {
                                name: key,
                                type: securityType,
                            };

                            switch (securityType) {
                                case 'apiKey':
                                    securityDetails.in = securityDefinition.in || '';
                                    endpoint.authorization.apikey.push(securityDetails);
                                    break;
                                case 'oauth2':
                                    securityDetails.flow = securityDefinition.flow || '';
                                    endpoint.authorization.oauth2.push(securityDetails);
                                    break;
                                case 'basic':
                                    endpoint.authorization.basic.push(securityDetails);
                                    break;
                                case 'bearer':
                                    endpoint.authorization.bearer.push(securityDetails);
                                    break;
                                case 'digest':
                                    endpoint.authorization.digest.push(securityDetails);
                                    break;
                                case 'jwt':
                                    endpoint.authorization.jwt.push(securityDetails);
                                    break;
                                case 'oauth1':
                                    endpoint.authorization.oauth1.push(securityDetails);
                                    break;
                                case 'None':
                                    endpoint.authorization.None.push(securityDetails);
                                    break;
                                default:
                                    break;
                            }
                        }
                    }
                }

                // Save the endpoint
                endpoints.push(endpoint);
            }
        }

        return endpoints;
    }


    // Save endpoints to the database
    const endpoints = extractEndpoints(openAPIData);


    try {
        const savedEndpoints = await ApiEndpoint.insertMany(endpoints);

        //var theScan = await runActiveScan(user, theCollection, projectName, email);

        //return theScan;

        return { message: 'Collection added' };

    } catch (err) {
        //console.error('Error saving endpoints:', err);
    }

}

// Parse Swagger YAML
const parseSwaggerYAML = async (swaggerData, user, collectionFilePath, theCollection, version) => {



    const theCollectionVersion = await APICollectionVersion.create({
        apiCollection: theCollection._id,
        version: version,
    });

    // Function to extract endpoints from Swagger collection
    function extractEndpoints(swaggerData) {

        const paths = swaggerData.paths;
        const host = swaggerData.host || '';
        const protocol = (swaggerData.schemes && swaggerData.schemes[0]) || '';
        const port = swaggerData.host ? swaggerData.host.split(':')[1] || '' : '';

        const endpoints = [];

        const securityDefinitions = swaggerData.securityDefinitions || {};
        const defaultSecurity = swaggerData.security || [];

        for (const path in paths) {
            const methods = paths[path];
            for (const method in methods) {
                const endpointData = methods[method];
                const endpoint = {
                    theCollectionVersion: theCollectionVersion._id,
                    user: user,
                    name: endpointData.summary || '',
                    protocol: protocol,
                    host: host,
                    port: port,
                    endpoint: path,
                    url: host + path,
                    method: method.toUpperCase(),
                    headers: [],
                    queryParams: [],
                    authorization: {
                        type: 'None',
                        apikey: [],
                        bearer: [],
                        basic: [],
                        digest: [],
                        oauth1: [],
                        oauth2: []
                    },
                    requestBody: {},
                    responseBody: {},
                    description: '',
                    riskScore: '',
                    piiFields: [],
                    alerts: [],
                    firstDetected: '',
                    lastActive: '',
                    isAuthenticated: ''
                };

                // Extract headers
                if (endpointData.hasOwnProperty('parameters')) {
                    const parameters = endpointData.parameters;
                    for (const parameter of parameters) {
                        if (parameter.in === 'header') {
                            const header = {
                                key: parameter.name,
                                value: '',
                                type: '' // Set the appropriate type value
                            };
                            endpoint.headers.push(header);
                        } else if (parameter.in === 'query') {
                            const queryParam = {
                                key: parameter.name,
                                value: ''
                            };
                            endpoint.queryParams.push(queryParam);
                        }
                    }
                }

                // Extract authorization
                const endpointSecurity = endpointData.security || defaultSecurity;
                for (const security of endpointSecurity) {
                    for (const key in security) {
                        const securityDefinition = securityDefinitions[key];
                        if (securityDefinition) {
                            const securityType = securityDefinition.type || '';
                            const securityDetails = {
                                name: key,
                                type: securityType
                            };


                            switch (securityType) {
                                case 'apiKey':
                                    securityDetails.in = securityDefinition.in || '';
                                    endpoint.authorization.apikey.push(securityDetails);
                                    break;
                                case 'oauth2':
                                    securityDetails.flow = securityDefinition.flow || '';
                                    endpoint.authorization.oauth2.push(securityDetails);
                                    break;
                                case 'basic':
                                    endpoint.authorization.basic.push(securityDetails);
                                    break;
                                case 'bearer':
                                    endpoint.authorization.bearer.push(securityDetails);
                                    break;
                                case 'digest':
                                    endpoint.authorization.digest.push(securityDetails);
                                    break;
                                case 'jwt':
                                    endpoint.authorization.jwt.push(securityDetails);
                                    break;
                                case 'oauth1':
                                    endpoint.authorization.oauth1.push(securityDetails);
                                    break;
                                case 'None':
                                    endpoint.authorization.None.push(securityDetails);
                                    break;
                                default:
                                    break;
                            }
                        }
                    }
                }

                // Save the endpoint
                endpoints.push(endpoint);
            }
        }

        return endpoints;
    }


    // Save endpoints to the database
    const endpoints = extractEndpoints(swaggerData);

    try {
        const savedEndpoints = await ApiEndpoint.insertMany(endpoints);


        //res.send({ message: "Scan Started" });
        //var theScan = await runActiveScan(user, theCollection, projectName, email);
        return { message: 'Collection added' };

        //return theScan;

    } catch (err) {
        // console.error('Error saving endpoints:', err);
    }
}



// Parse OpenAPI YAML
const parseOpenAPIYAML = async (openAPIData, user, collectionFilePath, theCollection, version) => {


    const theCollectionVersion = await APICollectionVersion.create({
        apiCollection: theCollection._id,
        version: version,
    });


    // Function to extract endpoints from Swagger collection
    function extractEndpoints(openAPIData) {

        console.log('openAPIData.servers:', openAPIData.servers)

        const paths = openAPIData.paths;
        const host = openAPIData.servers[0].url || '';
        const protocol = (openAPIData.schemes && openAPIData.schemes[0]) || '';
        const port = openAPIData.host ? openAPIData.host.split(':')[1] || '' : '';

        const endpoints = [];

        const securityDefinitions = openAPIData.securityDefinitions || {};
        const defaultSecurity = openAPIData.security || [];

        for (const path in paths) {
            const methods = paths[path];
            for (const method in methods) {
                const endpointData = methods[method];
                const endpoint = {
                    theCollectionVersion: theCollectionVersion._id,
                    user: user,
                    name: endpointData.summary || '',
                    protocol: protocol,
                    host: host,
                    port: port,
                    endpoint: path,
                    url: host + path,
                    method: method.toUpperCase(),
                    headers: [],
                    queryParams: [],
                    authorization: {
                        type: 'None',
                        apikey: [],
                        bearer: [],
                        basic: [],
                        digest: [],
                        oauth1: [],
                        oauth2: []
                    },
                    requestBody: {},
                    responseBody: {},
                    description: '',
                    riskScore: '',
                    piiFields: [],
                    alerts: [],
                    firstDetected: '',
                    lastActive: '',
                    isAuthenticated: ''
                };

                // Extract headers
                if (endpointData.hasOwnProperty('parameters')) {
                    const parameters = endpointData.parameters;
                    for (const parameter of parameters) {
                        if (parameter.in === 'header') {
                            const header = {
                                key: parameter.name,
                                value: '',
                                type: '' // Set the appropriate type value
                            };
                            endpoint.headers.push(header);
                        } else if (parameter.in === 'query') {
                            const queryParam = {
                                key: parameter.name,
                                value: ''
                            };
                            endpoint.queryParams.push(queryParam);
                        }
                    }
                }

                // Extract authorization
                const endpointSecurity = endpointData.security || defaultSecurity;
                for (const security of endpointSecurity) {
                    for (const key in security) {
                        const securityDefinition = securityDefinitions[key];
                        if (securityDefinition) {
                            const securityType = securityDefinition.type || '';
                            const securityDetails = {
                                name: key,
                                type: securityType
                            };


                            switch (securityType) {
                                case 'apiKey':
                                    securityDetails.in = securityDefinition.in || '';
                                    endpoint.authorization.apikey.push(securityDetails);
                                    break;
                                case 'oauth2':
                                    securityDetails.flow = securityDefinition.flow || '';
                                    endpoint.authorization.oauth2.push(securityDetails);
                                    break;
                                case 'basic':
                                    endpoint.authorization.basic.push(securityDetails);
                                    break;
                                case 'bearer':
                                    endpoint.authorization.bearer.push(securityDetails);
                                    break;
                                case 'digest':
                                    endpoint.authorization.digest.push(securityDetails);
                                    break;
                                case 'jwt':
                                    endpoint.authorization.jwt.push(securityDetails);
                                    break;
                                case 'oauth1':
                                    endpoint.authorization.oauth1.push(securityDetails);
                                    break;
                                case 'None':
                                    endpoint.authorization.None.push(securityDetails);
                                    break;
                                default:
                                    break;
                            }
                        }
                    }
                }

                // Save the endpoint
                endpoints.push(endpoint);
            }
        }

        return endpoints;
    }


    // Save endpoints to the database
    const endpoints = extractEndpoints(openAPIData);

    try {
        const savedEndpoints = await ApiEndpoint.insertMany(endpoints);


        //res.send({ message: "Scan Started" });
        //var theScan = await runActiveScan(user, theCollection, projectName, email);

        //return theScan;

        return { message: 'Collection added' };

    } catch (err) {
        // console.error('Error saving endpoints:', err);
    }
}


const replaceVariablesInJSON = (jsonString, variables) => {
    const replaceVariable = (text) => {
        return text.replace(/{{(.*?)}}/g, (match, variableName) => {
            const variable = variables.find((v) => v.key === variableName);
            return variable ? variable.value : match;
        });
    };

    return replaceVariable(jsonString);
};

const extractVariablesFromJSON = (jsonString) => {
    const collection = JSON.parse(jsonString);
    return collection.variable || [];
};


function createNextVersionName(currentVersion) {
    // Split the version string into parts
    const parts = currentVersion.split('.');

    // Extract major, minor, and patch versions
    let major = parseInt(parts[0]);
    let minor = parts.length > 1 ? parseInt(parts[1]) : 0;
    let patch = parts.length > 2 ? parseInt(parts[2]) : 0;

    // Increment the patch version
    patch++;

    // Check if patch has reached 100, then increment minor and reset patch
    if (patch > 100) {
        minor++;
        patch = 1;
    }

    // Check if minor has reached 100, then increment major and reset minor
    if (minor > 100) {
        major++;
        minor = 1;
        patch = 1; // Reset patch when incrementing major
    }

    // Return the new version string
    return `${major}.${minor}.${patch}`;
}

// Add API Collection version 
module.exports.addAPICollectionVersion = asyncHandler(async (req, res) => {

    const user = await User.findById(req.user._id);

    const { collectionName, collectionUrl, version, collectionId, projectId } = req.body;

    let theVersion = version;

    let theCollection;

    if (collectionUrl !== '') {

        const result = await fetchAndCheckContentType(collectionUrl);

        if (result.contentType == 'application/yaml') {

            const collectionFile = result.content;
            const collectionData = collectionFile;

            if (collectionData.swagger) {

                if (theVersion == '1') {
                    theCollection = await APICollection.create({
                        user: user,
                        collectionType: 'Swagger',
                        collectionName: collectionName,
                        collectionFilePath: collectionFilePath,
                        orgProject:projectId
                    });
                } else {
                    theCollection = await APICollection.findById(collectionId)

                    // Find suitable name for the version
                    const latestVersion = await APICollectionVersion.findOne({ apiCollection: theCollection._id })
                                .sort({ createdAt: -1 }) // Sort in descending order based on createdAt
                                .exec();

                    console.log("latestVersion:", latestVersion.version)      
                    theVersion =   createNextVersionName(latestVersion.version);  

                }

                var theScan = await parseSwaggerYAML(collectionData, user, collectionFilePath, theCollection, theVersion);

                if (theScan) {
                    return res.send({ message: "Collection added" })
                } else {
                    return res.send({ error: "Collection saving for some reason. Please try again." })
                }

            } else if (collectionData.info && collectionData.info._postman_id) {


                if (version == '1') {

                    theCollection = await APICollection.create({
                        user: user,
                        collectionType: 'PostMan',
                        collectionName: collectionName,
                        collectionNativeId: collectionData.info._postman_id,
                        collectionSchemaURL: collectionData.info.schema,
                        collectionFilePath: collectionFilePath,
                        orgProject:projectId
                    });

                } else {
                    theCollection = await APICollection.findById(collectionId)

                    // Find suitable name for the version
                    const latestVersion = await APICollectionVersion.findOne({ apiCollection: theCollection._id })
                                .sort({ createdAt: -1 }) // Sort in descending order based on createdAt
                                .exec();

                    console.log("latestVersion:", latestVersion.version)      
                    theVersion =   createNextVersionName(latestVersion.version);  

                }


                var theScan = await parsePostmanYAML(collectionData, user, collectionFilePath, theCollection, theVersion);

                if (theScan) {
                    return res.send({ message: "Collection added" })
                } else {
                    return res.send({ error: "Collection saving failed for some reason. Please try again." })
                }
            } else if (collectionData.openapi) {


                if (version == '1') {

                    theCollection = await APICollection.create({
                        user: user,
                        collectionType: 'OpenAPI',
                        collectionName: collectionName,
                        collectionFilePath: collectionFilePath,
                        orgProject:projectId
                    });
                } else {
                    theCollection = await APICollection.findById(collectionId)


                    // Find suitable name for the version
                    const latestVersion = await APICollectionVersion.findOne({ apiCollection: theCollection._id })
                                .sort({ createdAt: -1 }) // Sort in descending order based on createdAt
                                .exec();

                    console.log("latestVersion:", latestVersion.version)      
                    theVersion =   createNextVersionName(latestVersion.version);  

                }


                var theScan = await parseOpenAPIYAML(collectionData, user, collectionFilePath, theCollection, theVersion);

                if (theScan) {
                    return res.send({ message: "Collection added" })
                } else {
                    return res.send({ error: "Collection saving failed for some reason. Please try again." })
                }
            }



        } else if (result.contentType == 'application/json') {


            var collectionJson = result.content;

            const variables = extractVariablesFromJSON(JSON.stringify(collectionJson));
            collectionJson = replaceVariablesInJSON(JSON.stringify(collectionJson), variables);

            // console.log('collectionJson:',collectionJson)
            const collection = new Collection(JSON.parse(collectionJson));

            const collectiondata = JSON.parse(collectionJson);

            if (collection && collectiondata.info._postman_id && collectiondata.item && Array.isArray(collectiondata.item)) {

                if (version == '1') {

                  

                    theCollection = await APICollection.create({
                        user: user,
                        collectionType: 'PostMan',
                        collectionName: collectionName,
                        collectionNativeId: collectiondata.info._postman_id,
                        collectionSchemaURL: collectiondata.info.schema,
                        collectionFilePath: collectionFilePath,
                        orgProject:projectId
                    });
                } else {
                    theCollection = await APICollection.findById(collectionId)


                    // Find suitable name for the version
                    const latestVersion = await APICollectionVersion.findOne({ apiCollection: theCollection._id })
                                .sort({ createdAt: -1 }) // Sort in descending order based on createdAt
                                .exec();

                    console.log("latestVersion:", latestVersion.version)      
                    theVersion =   createNextVersionName(latestVersion.version);  

                }


                var theScan = await parsePostmanJSON(collectiondata, user, collectionFilePath, theCollection, theVersion);

                if (theScan) {
                    return res.send({ message: "Collection added" });
                } else {
                    return res.send({ error: "Collection saving failed for some reason. Please try again." });
                }

            } else if (collection && (collectiondata.swagger)) {

                if (version == '1') {

                    if (collectionFilePath) {

                        theCollection = await APICollection.create({
                            user: user,
                            collectionType: 'Swagger',
                            collectionName: collectionName,
                            collectionFilePath: collectionFilePath,
                            orgProject:projectId
                        });

                    } else {

                        theCollection = await APICollection.create({
                            user: user,
                            collectionType: 'Swagger',
                            collectionName: collectionName,
                            orgProject:projectId
                        });

                        
                    }

                } else {
                    theCollection = await APICollection.findById(collectionId)


                    // Find suitable name for the version
                    const latestVersion = await APICollectionVersion.findOne({ apiCollection: theCollection._id })
                                .sort({ createdAt: -1 }) // Sort in descending order based on createdAt
                                .exec();

                    console.log("latestVersion:", latestVersion.version)      
                    theVersion =   createNextVersionName(latestVersion.version);  


                }


                var theScan = await parseSwaggerJSON(collectiondata, user, collectionFilePath, theCollection, theVersion);

                if (theScan) {
                    return res.send({ message: "Collection added" });
                } else {
                    return res.send({ error: "Collection saving failed for some reason. Please try again." });
                }
            } else if (collection && (collectiondata.openapi)) {

                if (version == '1') {

                    if (collectionFilePath) {

                        theCollection = await APICollection.create({
                            user: user,
                            collectionType: 'OpenAPI',
                            collectionName: collectionName,
                            collectionFilePath: collectionFilePath,
                            orgProject:projectId
                        });
                    } else {

                        theCollection = await APICollection.create({
                            user: user,
                            collectionType: 'OpenAPI',
                            collectionName: collectionName,
                            orgProject:projectId
                        });
                    }

                } else {

                    theCollection = await APICollection.findById(collectionId)

                    // Find suitable name for the version
                    const latestVersion = await APICollectionVersion.findOne({ apiCollection: theCollection._id })
                                .sort({ createdAt: -1 }) // Sort in descending order based on createdAt
                                .exec();

                    console.log("latestVersion:", latestVersion.version)      
                    theVersion =   createNextVersionName(latestVersion.version);  

                }


                var theScan = await parseOpenAPIJSON(collectiondata, user, collectionFilePath, theCollection, theVersion);

                if (theScan) {
                    return res.send({ message: "Collection added" });
                } else {
                    return res.send({ error: "Collection saving failed for some reason. Please try again." });
                }
            }


        } else {

            res.send({ error: "The URL does not contain a valid Postman/Swagger collection2" });
        }

    } else {

        try {

            const originalname = req.file.originalname
            const fileformat = originalname.split('.').pop();

            if (fileformat === "json") {


                var collectionFilePath = path.join(__dirname, "..", "uploads", "postman-collections", originalname);
                var collectionJson = fs.readFileSync(collectionFilePath, 'utf8');


                const variables = extractVariablesFromJSON(collectionJson);
                collectionJson = replaceVariablesInJSON(collectionJson, variables);


                const collection = new Collection(JSON.parse(collectionJson));

                const collectiondata = JSON.parse(collectionJson);

                if (collection && collectiondata.info._postman_id && collectiondata.item && Array.isArray(collectiondata.item)) {

                    if (version == '1') {
                 

                        theCollection = await APICollection.create({
                            user: user,
                            collectionType: 'PostMan',
                            collectionName: collectionName,
                            collectionNativeId: collectiondata.info._postman_id,
                            collectionSchemaURL: collectiondata.info.schema,
                            collectionFilePath: collectionFilePath,
                            orgProject:projectId
                        });
                    } else {
                        theCollection = await APICollection.findById(collectionId)

                        // Find suitable name for the version
                        const latestVersion = await APICollectionVersion.findOne({ apiCollection: theCollection._id })
                            .sort({ createdAt: -1 }) // Sort in descending order based on createdAt
                            .exec();

                        console.log("latestVersion:", latestVersion.version)      
                        theVersion =   createNextVersionName(latestVersion.version);  


                    }


                    var theScan = await parsePostmanJSON(collectiondata, user, collectionFilePath, theCollection, theVersion);

                    if (theScan) {
                        return res.send({ message: "Collection added" });
                    } else {
                        return res.send({ error: "Collection saving failed for some reason. Please try again." });
                    }

                } else if (collection && (collectiondata.swagger)) {

                    if (version == '1') {

                        if (collectionFilePath) {
    
                            theCollection = await APICollection.create({
                                user: user,
                                collectionType: 'Swagger',
                                collectionName: collectionName,
                                collectionFilePath: collectionFilePath,
                                orgProject:projectId
                            });
    
                        } else {
    
                            theCollection = await APICollection.create({
                                user: user,
                                collectionType: 'Swagger',
                                collectionName: collectionName,
                                orgProject:projectId
                            });
                        }
    
                    } else {
                        theCollection = await APICollection.findById(collectionId)


                        // Find suitable name for the version
                    const latestVersion = await APICollectionVersion.findOne({ apiCollection: theCollection._id })
                    .sort({ createdAt: -1 }) // Sort in descending order based on createdAt
                    .exec();

        console.log("latestVersion:", latestVersion.version)      
        theVersion =   createNextVersionName(latestVersion.version);   

                    }

                    var theScan = await parseSwaggerJSON(collectiondata, user, collectionFilePath, theCollection, theVersion);

                    if (theScan) {
                        return res.send({ message: "Collection added" });
                    } else {
                        return res.send({ error: "Collection saving failed for some reason. Please try again." });
                    }
                } else if (collection && (collectiondata.openapi)) {                    


                    if (version == '1') {

                        if (collectionFilePath) {
    
                            theCollection = await APICollection.create({
                                user: user,
                                collectionType: 'OpenAPI',
                                collectionName: collectionName,
                                collectionFilePath: collectionFilePath,
                                orgProject:projectId
                            });
                        } else {
    
                            theCollection = await APICollection.create({
                                user: user,
                                collectionType: 'OpenAPI',
                                collectionName: collectionName,
                                orgProject:projectId
                            });
                        }
    
                    } else {
    
                        theCollection = await APICollection.findById(collectionId)


                        // Find suitable name for the version
                    const latestVersion = await APICollectionVersion.findOne({ apiCollection: theCollection._id })
                    .sort({ createdAt: -1 }) // Sort in descending order based on createdAt
                    .exec();

        console.log("latestVersion:", latestVersion.version)      
        theVersion =   createNextVersionName(latestVersion.version);  

                    }

                    var theScan = await parseOpenAPIJSON(collectiondata, user, collectionFilePath, theCollection, theVersion);

                    if (theScan) {
                        return res.send({ message: "Collection added" });
                    } else {
                        return res.send({ error: "Collection saving failed for some reason. Please try again." });
                    }
                }

            }
            else if (fileformat === "yaml") {


                var collectionFilePath = path.join(__dirname, "..", "uploads", "postman-collections", originalname);
                const collectionFile = fs.readFileSync(collectionFilePath, 'utf8');
                const collectionData = YAML.parse(collectionFile);

                if (collectionData.swagger) {

                    if (version == '1') {
                        theCollection = await APICollection.create({
                            user: user,
                            collectionType: 'Swagger',
                            collectionName: collectionName,
                            collectionFilePath: collectionFilePath,
                            orgProject:projectId
                        });
                    } else {
                        theCollection = await APICollection.findById(collectionId)

                        // Find suitable name for the version
                    const latestVersion = await APICollectionVersion.findOne({ apiCollection: theCollection._id })
                    .sort({ createdAt: -1 }) // Sort in descending order based on createdAt
                    .exec();

        console.log("latestVersion:", latestVersion.version)      
        theVersion =   createNextVersionName(latestVersion.version);  

                    }


                    var theScan = await parseSwaggerYAML(collectionData, user, collectionFilePath, theCollection, theVersion);

                    if (theScan) {
                        return res.send({ message: "Collection added" })
                    } else {
                        return res.send({ error: "Collection saving failed for some reason. Please try again." })
                    }

                } else if (collectionData.info && collectionData.info._postman_id) {

                    if (version == '1') {

                        theCollection = await APICollection.create({
                            user: user,
                            collectionType: 'PostMan',
                            collectionName: collectionName,
                            collectionNativeId: collectionData.info._postman_id,
                            collectionSchemaURL: collectionData.info.schema,
                            collectionFilePath: collectionFilePath,
                            orgProject:projectId
                        });
    
                    } else {
                        theCollection = await APICollection.findById(collectionId)


                        // Find suitable name for the version
                    const latestVersion = await APICollectionVersion.findOne({ apiCollection: theCollection._id })
                    .sort({ createdAt: -1 }) // Sort in descending order based on createdAt
                    .exec();

        console.log("latestVersion:", latestVersion.version)      
        theVersion =   createNextVersionName(latestVersion.version);  

                    }

                    var theScan = await parsePostmanYAML(collectionData, user, collectionFilePath, theCollection, theVersion);

                    if (theScan) {
                        return res.send({ message: "Collection added" })
                    } else {
                        return res.send({ error: "Collection saving failed for some reason. Please try again." })
                    }
                } else if (collectionData.openapi) {

                    if (version == '1') {

                        theCollection = await APICollection.create({
                            user: user,
                            collectionType: 'OpenAPI',
                            collectionName: collectionName,
                            collectionFilePath: collectionFilePath,
                            orgProject:projectId
                        });
                    } else {
                        theCollection = await APICollection.findById(collectionId)


                        // Find suitable name for the version
                    const latestVersion = await APICollectionVersion.findOne({ apiCollection: theCollection._id })
                    .sort({ createdAt: -1 }) // Sort in descending order based on createdAt
                    .exec();

        console.log("latestVersion:", latestVersion.version)      
        theVersion =   createNextVersionName(latestVersion.version);  

                    }

                    var theScan = await parseOpenAPIYAML(collectionData, user, collectionFilePath, theCollection, theVersion);

                    if (theScan) {
                        return res.send({ message: "Collection added" })
                    } else {
                        return res.send({ error: "Collection saving failed for some reason. Please try again." })
                    }
                }
            }

        }
        catch (err) {
            console.log('err1', err)
            return res.send({ err: err })
        }

    }

});


// Generate PDF for a scan and download it
module.exports.generatePDFForAScan = asyncHandler(async (req, res) => {


    const { scanId } = req.body;

    const baseUrl = `${req.protocol}://${req.hostname}:${req.socket.localPort}`;

    const activeScan = await ActiveScan.findById(scanId).populate('user theCollection')
        .populate({
            path: 'vulnerabilities',
            model: 'ActiveScanVulnerability',
            populate: {
                path: 'vulnerability',
                model: 'Vulnerability',
            },

        })
        .populate({
            path: 'vulnerabilities',
            model: 'ActiveScanVulnerability',
            populate: {
                path: 'endpoint',
                model: 'ApiEndpoint',
            },

        }).lean();

    const endpointsCount = await ApiEndpoint.count({ theCollection: activeScan.theCollection })
    activeScan.endpointsCount = endpointsCount;



    var pdfPath = await createPDFAndDownload(activeScan, baseUrl);

    return res.send({ path: pdfPath })

});






// Generate PDF function
const generatePDF = async (activeScan) => {


    var numOfHighVulns = 0
    var numOfMediumVulns = 0;

    if (activeScan) {

        for (var i = 0; i < activeScan.vulnerabilities.length; i++) {

            if (activeScan.vulnerabilities[i].vulnerability.riskScore == 'HIGH') {
                numOfHighVulns++;
            }

            if (activeScan.vulnerabilities[i].vulnerability.riskScore == 'MEDIUM') {
                numOfMediumVulns++;
            }
        }
    }



    const table = {

        headers: ['SEVERITY', 'CRITICAL', 'HIGH', "MEDIUM", "LOW"],
        rows: [
            ['# of issues', '0', '' + numOfHighVulns, '' + numOfMediumVulns, '0']
        ]
    };


    const doc = new pdfkit({
        margin: 20,
    });


    // Create an instance of ChartJSNodeCanvas
    const chartNode = new ChartJSNodeCanvas({ width: 250, height: 1000 });

    // Generate pie chart image using Chart.js
    const generatePieChartImage = async (data, chartNum) => {

        const width = 600;
        const height = 600;

        let configuration;

        if (chartNum == 1) {

            configuration = {
                type: 'pie',
                data: {
                    labels: data.labels,
                    datasets: [
                        {
                            data: data.data,
                            backgroundColor: data.colors,
                        },
                    ],
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            display: true,
                            position: 'right',
                            labels: {
                                usePointStyle: true,
                                font: {
                                    size: 12, // Adjust the font size as needed
                                    color: 'red', // Set the font color to black
                                    family: 'Arial, sans-serif'
                                }
                            }
                        },
                        datalabels: {
                            display: true,
                            font: {
                                size: 12,
                                color: 'white',
                                family: 'Arial, sans-serif'
                            },
                            formatter: (value, context) => {
                                const total = context.dataset.data.reduce((acc, val) => acc + val, 0);
                                const percentage = ((value / total) * 100).toFixed(2);
                                return `${percentage}%`;
                            }
                        }
                    },
                },
            };

        } else {


            configuration = {
                type: 'pie',
                data: {
                    labels: data.labels,
                    datasets: [
                        {
                            data: data.data,
                            backgroundColor: data.colors,
                        },
                    ],
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            display: true,
                            position: 'right',
                            labels: {
                                usePointStyle: true,
                                font: {
                                    size: 12, // Adjust the font size as needed
                                    color: 'red', // Set the font color to black
                                    family: 'Arial, sans-serif'
                                }
                            }
                        },
                        datalabels: {
                            display: true,
                            font: {
                                size: 12,
                                color: 'white',
                                family: 'Arial, sans-serif'
                            },
                            formatter: (value, context) => {
                                const total = context.dataset.data.reduce((acc, val) => acc + val, 0);
                                const percentage = ((value / total) * 100).toFixed(2);
                                return `${percentage}%`;
                            }
                        }
                    },
                },
            };


        }


        // Create a chart instance using ChartJSNodeCanvas
        const chartJSNodeCanvas = new ChartJSNodeCanvas({
            width, height, plugins: {
                requireLegacyFiles: ['chartjs-plugin-datalabels']
            }
        });
        const imageBuffer = await chartJSNodeCanvas.renderToBuffer(configuration);

        return imageBuffer;
    };


    var pageCount = 0;
    pageCount = pageCount + 4; // static pages

    pageCount = pageCount + (activeScan.vulnerabilities.length / 5); // vuln sections pages


    var uniqueVulnsCodes = [];

    for (var i = 0; i < activeScan.vulnerabilities.length; i++) {

        if (!(uniqueVulnsCodes.includes((activeScan.vulnerabilities)[i].vulnerability.vulnerabilityCode))) {

            var currentVulnerability = (activeScan.vulnerabilities)[i].vulnerability;
            uniqueVulnsCodes.push(currentVulnerability.vulnerabilityCode);
        }
    }


    pageCount = pageCount + uniqueVulnsCodes.length;
    pageCount = Math.ceil(pageCount);

    var currentPageCount = 2;



    // Set the background color using a colored rectangle
    const pageWidth1 = doc.page.width;
    const pageHeight1 = doc.page.height;

    // Set the background image
    const backgroundImagePath = path.join(__dirname, 'firstpagebackground.png');
    const backgroundImage = doc.openImage(backgroundImagePath);

    // Draw the background image
    doc.image(backgroundImage, 0, 0, { width: pageWidth1, height: pageHeight1 });

    const logoPath = path.join(__dirname, 'intrucept-white-logo.png');
    const logoImage = doc.openImage(logoPath);

    // Center the logo and text on the first page
    const logoWidth = 300; // Adjust the width as per your requirement
    const logoHeight = (logoImage.height * logoWidth) / logoImage.width;
    const logoX = (pageWidth1 - logoWidth) / 2;
    const logoY = 50;

    doc.image(logoImage, logoX, logoY, {
        width: logoWidth,
        height: logoHeight,
    });

    doc.moveDown(15);
    doc.font('Helvetica').fontSize(23).fillColor('#FFFFFF').text(`API Security Scan Report for ${activeScan.projectName}`, { align: 'center' });

    // Add a new page for the content
    doc.addPage();


    /** Start -add header */
    doc.font('Helvetica').fontSize(8).fillColor('#0180ff').text('API Security Report by intruceptlabs.com', {
        align: 'center',
    });
    doc.moveDown(1);

    doc.font('Helvetica').fontSize(8).fillColor('#000000').text(currentPageCount + '/' + pageCount, {
        align: 'center',
    });
    currentPageCount = currentPageCount + 1;
    /** End -add header */

    doc.moveDown(2);

    // Set the summary table heading
    const summaryHeadingX = 50;
    const summaryHeadingY = 50;
    doc.font('Helvetica-Bold').fontSize(20).fillColor('#0180ff').text('SUMMARY', {
        align: 'center',
        lineGap: 0,
        indent: 0, // Optional, to remove any indent
        lineBreak: false, // Optional, to disable line breaks
        continued: false, // Optional, to start a new paragraph
        width: doc.page.width - doc.page.margins.left - doc.page.margins.right, // Optional, to limit the width of the text
    });
    doc.moveDown(1);

    // Set the table header row style
    const tableHeaderRowX = 50;
    const tableHeaderRowY = summaryHeadingY + 70;
    const tableHeaderCellWidth = pageWidth1 - 100; // 100 is the total horizontal padding
    const tableHeaderCellHeight = 30;
    doc.rect(tableHeaderRowX - 2, tableHeaderRowY, tableHeaderCellWidth + 3, tableHeaderCellHeight).fill('#563EE0');
    doc.font('Helvetica-Bold').fontSize(12).fillColor('#FFFFFF')
        .text('Intrucept Labs - API Security Test Report', tableHeaderRowX + 5, tableHeaderRowY + 10,
            { width: tableHeaderCellWidth - 10, height: tableHeaderCellHeight, align: 'center', lineBreak: false });

    // Set the table data and style
    const tableData = [
        ['Scan ID', activeScan._id, 'Endpoints', activeScan.endpointsCount],
        ['Project Name', activeScan.projectName, 'Vulnerabilities', activeScan.vulnerabilities.length],
        ['Collection Name', activeScan.theCollection.collectionName, 'Scan Completed At',
            (new Date(activeScan.scanCompletedAt)).toLocaleDateString('en-US') + ' - ' + (new Date(activeScan.scanCompletedAt)).toLocaleTimeString('en-US')]
    ];

    const tableX = 50;
    const tableY1 = tableHeaderRowY + tableHeaderCellHeight + 0;
    const tableCellWidth = (pageWidth1 - 100) / 4; // 100 is the total horizontal padding
    const tableCellHeight = 40;
    const tableBorderWidth = 3;
    const tableBorderColor = '#563EE0';

    for (let i = 0; i < tableData.length; i++) {
        const rowData = tableData[i];

        for (let j = 0; j < rowData.length; j++) {
            const cellData = rowData[j];
            const cellX = tableX + j * tableCellWidth;
            const cellY = tableY1 + i * tableCellHeight;

            doc.rect(cellX, cellY, tableCellWidth, tableCellHeight).lineWidth(tableBorderWidth).strokeColor(tableBorderColor).stroke();
            doc.font('Helvetica').fontSize(12).fillColor('#000000');

            if (j === 0 || j === 2) { // Check if the column is the first or third column
                doc.font('Helvetica-Bold'); // Apply bold font style
            }

            doc.text(cellData, cellX + 5, cellY + 5, { width: tableCellWidth - 10, height: tableCellHeight, align: 'center', lineBreak: false });
        }
    }


    doc.fontSize(12);
    doc.moveDown(5);
    let tableWidth = 500;
    let cellHeight1 = 30;

    for (let j = 0; j < table.headers.length; j++) {

        const header = table.headers[j];
        const positionX = 50 + (j * (tableWidth / table.headers.length));
        const positionY = 300;

        doc.rect(positionX, positionY, tableWidth / table.headers.length, cellHeight1).stroke();


        if (header == 'CRITICAL') {

            doc.fillColor('#FF0000').font('Helvetica').text(header, positionX + 5, positionY + 10, {
                width: tableWidth / table.headers.length - 10,
                align: 'center'
            });

        } else if (header == 'HIGH') {

            doc.fillColor('#A6001B').font('Helvetica').text(header, positionX + 5, positionY + 10, {
                width: tableWidth / table.headers.length - 10,
                align: 'center'
            });

        } else if (header == 'MEDIUM') {

            doc.fillColor('#F6BE00').font('Helvetica').text(header, positionX + 5, positionY + 10, {
                width: tableWidth / table.headers.length - 10,
                align: 'center'
            });

        } else if (header == 'LOW') {

            doc.fillColor('green').font('Helvetica').text(header, positionX + 5, positionY + 10, {
                width: tableWidth / table.headers.length - 10,
                align: 'center'
            });
        }
    }

    doc.fillColor('#000000')
    doc.font('Helvetica')

    // Draw the table
    for (let i = 0; i < table.rows.length; i++) {
        const row = table.rows[i];

        for (let j = 0; j < row.length; j++) {
            const cell = row[j];
            const positionX = 50 + (j * (tableWidth / table.headers.length));
            const positionY = 300 + cellHeight1 + (i * cellHeight1);

            // Draw the cell with a border and padding
            doc.rect(positionX, positionY, tableWidth / table.headers.length, cellHeight1).stroke();
            doc.text(cell, positionX + 5, positionY + 10, {
                width: tableWidth / table.headers.length - 10,
                align: 'center',
            });
        }
    }



    doc.moveDown(5);
    doc.x = 30; // Move the cursor to the left side
    doc.font('Helvetica-Bold').fontSize(20).fillColor('#0180ff').text('SEVERITY SCORING', { align: 'center' });

    doc.moveDown();
    doc.font('Helvetica-Bold').fontSize(14).fillColor('#ff0000').text('CRITICAL');
    doc.fillColor('#000000')
    doc.font('Helvetica').fontSize(12).text('Vulnerabilities that can be exploited remotely, leading to immediate and widespread impact on the confidentiality, integrity, and availability of systems or data');
    doc.moveDown(1);
    doc.font('Helvetica-Bold').fontSize(14).fillColor('#A6001B').text('HIGH');
    doc.fillColor('#000000')
    doc.font('Helvetica').fontSize(12).text('Vulnerabilities that can be exploited but require some form of user interaction or other preconditions to be met, potentially resulting in significant impact on system or data');
    doc.moveDown(1);
    doc.font('Helvetica-Bold').fontSize(14).fillColor('#F6BE00').text('MEDIUM');
    doc.fillColor('#000000')
    doc.font('Helvetica').fontSize(12).text('Vulnerabilities that could result in a compromise of system or data security, but require more complex exploitation techniques or have limited impact');
    doc.moveDown(1);
    doc.font('Helvetica-Bold').fontSize(14).fillColor('green').text('LOW');
    doc.fillColor('#000000')
    doc.font('Helvetica').fontSize(12).text('Vulnerabilities that have a low likelihood of being exploited or have minimal impact on system or data security');

    doc.fillColor('#000000')


    /**Start- add footer */
    const text = "All rights to this document are reserved with Intrucept Labs. No information from this document can be copied or redistributed without the consent of Intrucept Labs";

    // Calculate the remaining space at the bottom of the page
    const bottomMargin = 0; // Adjust this value as needed
    const remainingSpace = doc.page.height - doc.y - bottomMargin;

    doc.x = 0;
    doc.y = 730// - 70;

    // Place the text at the bottom
    doc.font('Helvetica').fontSize(8).fillColor('#0180ff').text(text, {
        align: 'center',
        baseline: doc.page.margins.bottom - 30,
    });

    /**End- add footer */


    // Draw the border
    doc.rect(0, 0, doc.page.width, doc.page.height)
        .lineWidth(5)
        .strokeColor('#0180ff')
        .stroke();


    // Draw the rest of the pages only if there are vulns found   
    if (activeScan.vulnerabilities.length > 0) {


        doc.addPage();

        /** Start -add header */
        doc.font('Helvetica').fontSize(8).fillColor('#0180ff').text('API Security Report by intruceptlabs.com', {
            align: 'center',
        });
        doc.moveDown(1);
        doc.font('Helvetica').fontSize(8).fillColor('#000000').text(currentPageCount + '/' + pageCount, {
            align: 'center',
        });
        currentPageCount = currentPageCount + 1;
        /** End -add header */


        doc.moveDown(2);
        doc.font('Helvetica-Bold').fontSize(20).fillColor('#0180ff').text('VULNERABILITY DISTRIBUTION', { align: 'center' });


        // Add horizontally placed pie charts
        // Pie charts start

        var vuln1Count = 0;
        var vuln2Count = 0;
        var vuln3Count = 0;
        var vuln4Count = 0;
        var vuln5Count = 0;
        var vuln6Count = 0;
        var vuln7Count = 0;
        var vuln8Count = 0;
        var vuln9Count = 0;
        var vuln10Count = 0;
        var vuln11Count = 0;
        var vuln12Count = 0;
        var vuln13Count = 0;
        var vuln14Count = 0;
        var vuln15Count = 0;
        var vuln16Count = 0;
        var vuln17Count = 0;
        var vuln18Count = 0;

        if (activeScan) {

            for (var i = 0; i < activeScan.vulnerabilities.length; i++) {

                if (activeScan.vulnerabilities[i].vulnerability.vulnerabilityCode == 1) {
                    vuln1Count++;
                }

                if (activeScan.vulnerabilities[i].vulnerability.vulnerabilityCode == 2) {
                    vuln2Count++;
                }

                if (activeScan.vulnerabilities[i].vulnerability.vulnerabilityCode == 3) {
                    vuln3Count++;
                }

                if (activeScan.vulnerabilities[i].vulnerability.vulnerabilityCode == 4) {
                    vuln4Count++;
                }

                if (activeScan.vulnerabilities[i].vulnerability.vulnerabilityCode == 5) {
                    vuln5Count++;
                }

                if (activeScan.vulnerabilities[i].vulnerability.vulnerabilityCode == 6) {
                    vuln6Count++;
                }

                if (activeScan.vulnerabilities[i].vulnerability.vulnerabilityCode == 7) {
                    vuln7Count++;
                }

                if (activeScan.vulnerabilities[i].vulnerability.vulnerabilityCode == 8) {
                    vuln8Count++;
                }

                if (activeScan.vulnerabilities[i].vulnerability.vulnerabilityCode == 9) {
                    vuln9Count++;
                }

                if (activeScan.vulnerabilities[i].vulnerability.vulnerabilityCode == 10) {
                    vuln10Count++;
                }

                if (activeScan.vulnerabilities[i].vulnerability.vulnerabilityCode == 11) {
                    vuln11Count++;
                }

                if (activeScan.vulnerabilities[i].vulnerability.vulnerabilityCode == 12) {
                    vuln12Count++;
                }

                if (activeScan.vulnerabilities[i].vulnerability.vulnerabilityCode == 13) {
                    vuln13Count++;
                }

                if (activeScan.vulnerabilities[i].vulnerability.vulnerabilityCode == 14) {
                    vuln14Count++;
                }

                if (activeScan.vulnerabilities[i].vulnerability.vulnerabilityCode == 15) {
                    vuln15Count++;
                }

                if (activeScan.vulnerabilities[i].vulnerability.vulnerabilityCode == 16) {
                    vuln16Count++;
                }

                if (activeScan.vulnerabilities[i].vulnerability.vulnerabilityCode == 17) {
                    vuln17Count++;
                }

                if (activeScan.vulnerabilities[i].vulnerability.vulnerabilityCode == 18) {
                    vuln18Count++;
                }

            }
        }

        var labelsArray = [];
        if (vuln1Count > 0) {
            labelsArray.push('Broken Object Level Authorization');
        }
        if (vuln2Count > 0) {
            labelsArray.push('Sensitive Data in Path Params');
        }
        if (vuln3Count > 0) {
            labelsArray.push('Basic Authentication Detected');
        }
        if (vuln4Count > 0) {
            labelsArray.push('Endpoint Not Secured by SSL');
        }
        if (vuln5Count > 0) {
            labelsArray.push('Unauthenticated Endpoint Returning Sensitive Data');
        }
        if (vuln6Count > 0) {
            labelsArray.push('Sensitive Data in Query Params');
        }
        if (vuln7Count > 0) {
            labelsArray.push('PII Data Detected in Response');
        }
        if (vuln8Count > 0) {
            labelsArray.push('HTTP Verb Tampering Possible');
        }
        if (vuln9Count > 0) {
            labelsArray.push('Content Type Injection Possible');
        }
        if (vuln10Count > 0) {
            labelsArray.push('Security Headers not Enabled on Host');
        }
        if (vuln11Count > 0) {
            labelsArray.push('Resource Deletion Possible');
        }
        if (vuln12Count > 0) {
            labelsArray.push('Broken Authentication');
        }
        if (vuln13Count > 0) {
            labelsArray.push('Excessive Data Exposure');
        }
        if (vuln14Count > 0) {
            labelsArray.push('Injection');
        }
        if (vuln15Count > 0) {
            labelsArray.push('XSS Vulnerability Found');
        }
        if (vuln16Count > 0) {
            labelsArray.push('Wallet Hijacking Possible');
        }
        if (vuln17Count > 0) {
            labelsArray.push('Pre Image Attack Possible');
        }
        if (vuln18Count > 0) {
            labelsArray.push('Lack of Resource & Rate Limiting');
        }


        var dataArray = [];
        var bgColorArray = [];

        if (vuln1Count > 0) {
            dataArray.push(vuln1Count);
            bgColorArray.push('#FF6384');
        }
        if (vuln2Count > 0) {
            dataArray.push(vuln2Count);
            bgColorArray.push('#36A2EB');
        }
        if (vuln3Count > 0) {
            dataArray.push(vuln3Count);
            bgColorArray.push('#FFCE56');
        }
        if (vuln4Count > 0) {
            dataArray.push(vuln4Count);
            bgColorArray.push('#EE82EE');
        }
        if (vuln5Count > 0) {
            dataArray.push(vuln5Count);
            bgColorArray.push('#FFA500');
        }
        if (vuln6Count > 0) {
            dataArray.push(vuln6Count);
            bgColorArray.push('#1E90FF');
        }
        if (vuln7Count > 0) {
            dataArray.push(vuln7Count);
            bgColorArray.push('#FFD700');
        }
        if (vuln8Count > 0) {
            dataArray.push(vuln8Count);
            bgColorArray.push('#FF69B4');
        }
        if (vuln9Count > 0) {
            dataArray.push(vuln9Count);
            bgColorArray.push('#00CED1');
        }
        if (vuln10Count > 0) {
            dataArray.push(vuln10Count);
            bgColorArray.push('#FF4500');
        }
        if (vuln11Count > 0) {
            dataArray.push(vuln11Count);
            bgColorArray.push('#FF7F50');
        }
        if (vuln12Count > 0) {
            dataArray.push(vuln12Count);
            bgColorArray.push('#9370DB');
        }
        if (vuln13Count > 0) {
            dataArray.push(vuln13Count);
            bgColorArray.push('#FFC0CB');
        }
        if (vuln14Count > 0) {
            dataArray.push(vuln14Count);
            bgColorArray.push('#7B68EE');
        }
        if (vuln15Count > 0) {
            dataArray.push(vuln15Count);
            bgColorArray.push('#FFB6C1');
        }
        if (vuln16Count > 0) {
            dataArray.push(vuln16Count);
            bgColorArray.push('#00FF7F');
        }
        if (vuln17Count > 0) {
            dataArray.push(vuln17Count);
            bgColorArray.push('#8F00FF');
        }
        if (vuln18Count > 0) {
            dataArray.push(vuln18Count);
            bgColorArray.push('#ff0088');
        }


        // Add the first pie chart
        const pieChart1Data = {
            labels: labelsArray,
            data: dataArray,
            colors: bgColorArray,
        };


        // Add the first pie chart

        const chartImage1 = await generatePieChartImage(pieChart1Data, 1);


        var nameCount = 0;
        var addressCount = 0;
        var phoneCount = 0;
        var ipCount = 0;
        var macCount = 0;
        var ssnCount = 0;
        var passportNumCount = 0;
        var dlCount = 0;
        var bankAccountNumCount = 0;
        var creditDebitCardNumCount = 0;
        var panNumCount = 0;
        var aadhaarNumCount = 0;
        var voterIDNumCount = 0;
        var vehicleRegistrationNumCount = 0;
        var dobCount = 0;
        var pobCount = 0;
        var raceCount = 0;
        var religionCount = 0;
        var weightCount = 0;
        var heightCount = 0;
        var latitudeCount = 0;
        var longitudeCount = 0;
        var employeeIDCount = 0;
        var bmiCount = 0;
        var heartRateCount = 0;
        var bloodPressureCount = 0;
        var fatherNameCount = 0;
        var motherNameCount = 0;
        var brotherNameCount = 0;
        var sisterNameCount = 0;
        var daughterNameCount = 0;
        var sonNameCount = 0;
        var orderIDCount = 0;
        var transactionIDCount = 0;
        var cookieDataCount = 0;


        if (activeScan) {

            for (var i = 0; i < activeScan.vulnerabilities.length; i++) {

                if (activeScan.vulnerabilities[i].vulnerability.vulnerabilityCode == 6) {

                    var endpoint = activeScan.vulnerabilities[i].endpoint;
                    var piiFields = endpoint.piiFields;

                    if (piiFields.includes("Name")) {
                        nameCount++;
                    }

                    if (piiFields.includes("Address")) {
                        addressCount++;
                    }

                    if (piiFields.includes("Phone Number")) {
                        phoneCount++;
                    }

                    if (piiFields.includes("Internet Protocol (IP)")) {
                        ipCount++;
                    }

                    if (piiFields.includes("Media Access Control (MAC)")) {
                        macCount++;
                    }

                    if (piiFields.includes("Social Security Number (SSN)")) {
                        ssnCount++;
                    }

                    if (piiFields.includes("Passport Number")) {
                        passportNumCount++;
                    }

                    if (piiFields.includes("Driving License Number")) {
                        dlCount++;
                    }

                    if (piiFields.includes("Bank Account Number")) {
                        bankAccountNumCount++;
                    }

                    if (piiFields.includes("Credit/Debit Card Number")) {
                        creditDebitCardNumCount++;
                    }

                    if (piiFields.includes("PAN Number")) {
                        panNumCount++;
                    }

                    if (piiFields.includes("Aadhaar Number")) {
                        aadhaarNumCount++;
                    }

                    if (piiFields.includes("Voter ID Number")) {
                        voterIDNumCount++;
                    }

                    if (piiFields.includes("Vehicle Registration Number")) {
                        vehicleRegistrationNumCount++;
                    }

                    if (piiFields.includes("Date of Birth")) {
                        dobCount++;
                    }

                    if (piiFields.includes("Place of Birth")) {
                        pobCount++;
                    }

                    if (piiFields.includes("Race")) {
                        raceCount++;
                    }

                    if (piiFields.includes("Religion")) {
                        religionCount++;
                    }

                    if (piiFields.includes("Weight")) {
                        weightCount++;
                    }

                    if (piiFields.includes("Height")) {
                        heightCount++;
                    }

                    if (piiFields.includes("Latitude")) {
                        latitudeCount++;
                    }

                    if (piiFields.includes("Longitude")) {
                        longitudeCount++;
                    }

                    if (piiFields.includes("Employee ID")) {
                        employeeIDCount++;
                    }

                    if (piiFields.includes("BMI")) {
                        bmiCount++;
                    }

                    if (piiFields.includes("Heart Rate")) {
                        heartRateCount++;
                    }

                    if (piiFields.includes("Blood Pressure")) {
                        bloodPressureCount++;
                    }

                    if (piiFields.includes("Father Name")) {
                        fatherNameCount++;
                    }

                    if (piiFields.includes("Mother Name")) {
                        motherNameCount++;
                    }

                    if (piiFields.includes("Brother Name")) {
                        brotherNameCount++;
                    }

                    if (piiFields.includes("Sister Name")) {
                        sisterNameCount++;
                    }

                    if (piiFields.includes("Daughter Name")) {
                        daughterNameCount++;
                    }

                    if (piiFields.includes("Son Name")) {
                        sonNameCount++;
                    }

                    if (piiFields.includes("Order ID")) {
                        orderIDCount++;
                    }

                    if (piiFields.includes("Transaction ID")) {
                        transactionIDCount++;
                    }

                    if (piiFields.includes("Cookie Data")) {
                        cookieDataCount++;
                    }
                }

            }
        }


        var piiLabelsArray = [];
        var piiDataArray = [];
        var piiBgColorsArray = [];

        if (nameCount > 0) {
            piiLabelsArray.push('Name');
            piiDataArray.push(nameCount);
            piiBgColorsArray.push('#FF6384');
        }

        if (addressCount > 0) {
            piiLabelsArray.push('Address');
            piiDataArray.push(addressCount);
            piiBgColorsArray.push('#36A2EB');
        }

        if (phoneCount > 0) {
            piiLabelsArray.push('Phone');
            piiDataArray.push(phoneCount);
            piiBgColorsArray.push('#FFCE56');
        }

        if (ipCount > 0) {
            piiLabelsArray.push('IP Address');
            piiDataArray.push(ipCount);
            piiBgColorsArray.push('#EE82EE');
        }

        if (macCount > 0) {
            piiLabelsArray.push('MAC Address');
            piiDataArray.push(macCount);
            piiBgColorsArray.push('#FFA500');
        }

        if (ssnCount > 0) {
            piiLabelsArray.push('SSN');
            piiDataArray.push(ssnCount);
            piiBgColorsArray.push('#1E90FF');
        }

        if (passportNumCount > 0) {
            piiLabelsArray.push('Passport Num');
            piiDataArray.push(passportNumCount);
            piiBgColorsArray.push('#FFD700');
        }

        if (dlCount > 0) {
            piiLabelsArray.push('DL Num');
            piiDataArray.push(dlCount);
            piiBgColorsArray.push('#FF69B4');
        }

        if (bankAccountNumCount > 0) {
            piiLabelsArray.push('Bank Account Num');
            piiDataArray.push(bankAccountNumCount);
            piiBgColorsArray.push('#00CED1');
        }

        if (creditDebitCardNumCount > 0) {
            piiLabelsArray.push('Credit/Debit Card Num');
            piiDataArray.push(creditDebitCardNumCount);
            piiBgColorsArray.push('#FF4500');
        }

        if (panNumCount > 0) {
            piiLabelsArray.push('PAN Num');
            piiDataArray.push(panNumCount);
            piiBgColorsArray.push('#FF7F50');
        }

        if (aadhaarNumCount > 0) {
            piiLabelsArray.push('Aadhaar Num');
            piiDataArray.push(aadhaarNumCount);
            piiBgColorsArray.push('#9370DB');
        }

        if (voterIDNumCount > 0) {
            piiLabelsArray.push('Voter ID Num');
            piiDataArray.push(voterIDNumCount);
            piiBgColorsArray.push('#FFC0CB');
        }

        if (vehicleRegistrationNumCount > 0) {
            piiLabelsArray.push('Vehicle Registration Num');
            piiDataArray.push(vehicleRegistrationNumCount);
            piiBgColorsArray.push('#7B68EE');
        }

        if (dobCount > 0) {
            piiLabelsArray.push('DOB');
            piiDataArray.push(dobCount);
            piiBgColorsArray.push('#00FF00');
        }

        if (pobCount > 0) {
            piiLabelsArray.push('Place of Birth');
            piiDataArray.push(pobCount);
            piiBgColorsArray.push('#800080');
        }

        if (raceCount > 0) {
            piiLabelsArray.push('Race');
            piiDataArray.push(raceCount);
            piiBgColorsArray.push('#FFFF00');
        }

        if (religionCount > 0) {
            piiLabelsArray.push('Religion');
            piiDataArray.push(religionCount);
            piiBgColorsArray.push('#008080');
        }

        if (weightCount > 0) {
            piiLabelsArray.push('Weight');
            piiDataArray.push(weightCount);
            piiBgColorsArray.push('#8B0000');
        }

        if (heightCount > 0) {
            piiLabelsArray.push('Height');
            piiDataArray.push(heightCount);
            piiBgColorsArray.push('#FF00FF');
        }

        if (latitudeCount > 0) {
            piiLabelsArray.push('Latitude');
            piiDataArray.push(latitudeCount);
            piiBgColorsArray.push('#00FFFF');
        }

        if (longitudeCount > 0) {
            piiLabelsArray.push('Longitude');
            piiDataArray.push(longitudeCount);
            piiBgColorsArray.push('#800000');
        }

        if (employeeIDCount > 0) {
            piiLabelsArray.push('Employee ID');
            piiDataArray.push(employeeIDCount);
            piiBgColorsArray.push('#FFFF99');
        }

        if (bmiCount > 0) {
            piiLabelsArray.push('BMI');
            piiDataArray.push(bmiCount);
            piiBgColorsArray.push('#008000');
        }

        if (heartRateCount > 0) {
            piiLabelsArray.push('Heart Rate');
            piiDataArray.push(heartRateCount);
            piiBgColorsArray.push('#808080');
        }

        if (bloodPressureCount > 0) {
            piiLabelsArray.push('Blood Pressure');
            piiDataArray.push(bloodPressureCount);
            piiBgColorsArray.push('#FF1493');
        }

        if (fatherNameCount > 0) {
            piiLabelsArray.push('Father Name');
            piiDataArray.push(fatherNameCount);
            piiBgColorsArray.push('#00FF7F');
        }

        if (motherNameCount > 0) {
            piiLabelsArray.push('Mother Name');
            piiDataArray.push(motherNameCount);
            piiBgColorsArray.push('#9400D3');
        }

        if (brotherNameCount > 0) {
            piiLabelsArray.push('Brother Name');
            piiDataArray.push(brotherNameCount);
            piiBgColorsArray.push('#FF8C00');
        }

        if (sisterNameCount > 0) {
            piiLabelsArray.push('Sister Name');
            piiDataArray.push(sisterNameCount);
            piiBgColorsArray.push('#00BFFF');
        }

        if (daughterNameCount > 0) {
            piiLabelsArray.push('Daughter Name');
            piiDataArray.push(daughterNameCount);
            piiBgColorsArray.push('#FF00FF');
        }

        if (sonNameCount > 0) {
            piiLabelsArray.push('Son Name');
            piiDataArray.push(sonNameCount);
            piiBgColorsArray.push('#32CD32');
        }

        if (orderIDCount > 0) {
            piiLabelsArray.push('Order ID');
            piiDataArray.push(orderIDCount);
            piiBgColorsArray.push('#BA55D3');
        }

        if (transactionIDCount > 0) {
            piiLabelsArray.push('Transaction ID');
            piiDataArray.push(transactionIDCount);
            piiBgColorsArray.push('#FFD700');
        }

        if (cookieDataCount > 0) {
            piiLabelsArray.push('Cookie Data');
            piiDataArray.push(cookieDataCount);
            piiBgColorsArray.push('#4682B4');
        }


        // Add the second pie chart
        const pieChart2Data = {
            labels: piiLabelsArray,
            data: piiDataArray,
            colors: piiBgColorsArray,
        };

        const chartImage2 = await generatePieChartImage(pieChart2Data, 2);

        // Set the page width and height
        const pageWidth = doc.page.width;
        const pageHeight = doc.page.height;

        // Calculate the available vertical space for the pie charts
        const availableHeight = pageHeight - doc.y;

        // Calculate the maximum chart height based on the available space
        const maxChartHeight = availableHeight / 2;

        // Calculate the chart width based on the maximum height
        const chartWidth = 200;

        // Calculate the vertical positions for the pie charts
        const chart1Y = 180;
        const chart2Y = 180;

        // Add the first pie chart
        doc.image(chartImage1, {
            width: 300,
            height: 300,
            align: 'center',
            valign: 'center',
            x: ((pageWidth - chartWidth) / 2) - 50,
            y: chart1Y,
        });


        doc.moveDown(5);


        var legendData = [];

        if (labelsArray.includes("Broken Object Level Authorization")) {
            legendData.push({ label: 'Broken Object Level Authorization', color: '#FF6384' })
        }
        if (labelsArray.includes("Sensitive Data in Path Params")) {
            legendData.push({ label: 'Sensitive Data in Path Params', color: '#36A2EB' },)
        }
        if (labelsArray.includes("Basic Authentication Detected")) {
            legendData.push({ label: 'Basic Authentication Detected', color: '#FFCE56' },)
        }
        if (labelsArray.includes("Endpoint Not Secured by SSL")) {
            legendData.push({ label: 'Endpoint Not Secured by SSL', color: '#EE82EE' },)
        }
        if (labelsArray.includes("Unauthenticated Endpoint Returning Sensitive Dat")) {
            legendData.push({ label: 'Unauthenticated Endpoint Returning Sensitive Data', color: '#FFA500' },)
        }
        if (labelsArray.includes("Sensitive Data in Query Params")) {
            legendData.push({ label: 'Sensitive Data in Query Params', color: '#1E90FF' })
        }
        if (labelsArray.includes("PII Data Detected in Response")) {
            legendData.push({ label: 'PII Data Detected in Response', color: '#FFD700' })
        }
        if (labelsArray.includes("HTTP Verb Tampering Possible")) {
            legendData.push({ label: 'HTTP Verb Tampering Possible', color: '#FF69B4' })
        }
        if (labelsArray.includes("Content Type Injection Possible")) {
            legendData.push({ label: 'Content Type Injection Possible', color: '#00CED1' })
        }
        if (labelsArray.includes("Security Headers not Enabled on Host")) {
            legendData.push({ label: 'Security Headers not Enabled on Host', color: '#FF4500' })
        }
        if (labelsArray.includes("Resource Deletion Possible")) {
            legendData.push({ label: 'Resource Deletion Possible', color: '#FF7F50' })
        }
        if (labelsArray.includes("Broken Authentication")) {
            legendData.push({ label: 'Broken Authentication', color: '#9370DB' })
        }
        if (labelsArray.includes("Excessive Data Exposure")) {
            legendData.push({ label: 'Excessive Data Exposure', color: '#FFC0CB' })
        }
        if (labelsArray.includes("Injection")) {
            legendData.push({ label: 'Injection', color: '#7B68EE' })
        }
        if (labelsArray.includes("XSS Vulnerability Found")) {
            legendData.push({ label: 'XSS Vulnerability Found', color: '#FFB6C1' })
        }
        if (labelsArray.includes("Wallet Hijacking Possible")) {
            legendData.push({ label: 'Wallet Hijacking Possible', color: '#00FF7F' })
        }
        if (labelsArray.includes("Pre Image Attack Possible")) {
            legendData.push({ label: 'Pre Image Attack Possible', color: '#8F00FF' })
        }
        if (labelsArray.includes("Lack of Resource & Rate Limiting")) {
            legendData.push({ label: 'Lack of Resource & Rate Limiting', color: '#ff0088' })
        }


        /*
        const legendWidth = 500; // Width of the legend rectangle
        const legendHeight = 100; // Height of the legend rectangle
        const legendX = (doc.page.width - legendWidth) / 2; // X position of the legend rectangle
        const legendY = 500; // Y position of the legend rectangle            


        // Calculate the maximum available width for legends inside the rectangle
        const maxLegendWidth = legendWidth - 10; // Subtract 10 for padding

        // Center the legend rectangle horizontally
        const centerLegendX = legendX + (legendWidth - maxLegendWidth) / 2;

        // Set the initial position for the first legend item
        let currentX = centerLegendX;
        let currentY = legendY + 5;

        // Check if there is only one legend
        if (legendData.length === 1) {

            const legendItem = legendData[0];

            // Write label
            const labelWidth = doc.widthOfString(legendItem.label); // Get the width of the label

            // Center the legend horizontally within the legend rectangle
            currentX = centerLegendX + (maxLegendWidth - labelWidth) / 2;

            // Draw circular shape
            doc.circle(currentX, currentY, 5).fill(legendItem.color);

            // Write label
            doc.font('Helvetica').fontSize(9).fillColor('#000000')
                .text(legendItem.label, currentX + 10, currentY - 5, { width: maxLegendWidth, lineBreak: false });
        } else {

            // Calculate the available width for each legend item on one line
            const availableWidth = maxLegendWidth / 2;

            // Check if there are more than two legend items
            if (legendData.length > 2) {
                currentY += doc.currentLineHeight() + 5;
            }

            // Draw legends inside the rectangle
            for (let i = 0; i < legendData.length; i++) {
                const legendItem = legendData[i];

                // Write label
                const labelWidth = doc.widthOfString(legendItem.label); // Get the width of the label

                // Check if the current line exceeds the available width, then move to the next line
                if (currentX + labelWidth > centerLegendX + availableWidth) {
                    currentX = centerLegendX;
                    currentY += doc.currentLineHeight() + 5;
                }

                // Draw circular shape
                doc.circle(currentX, currentY, 5).fill(legendItem.color);

                // Write label
                doc.font('Helvetica').fontSize(9).fillColor('#000000')
                    .text(legendItem.label, currentX + 10, currentY - 5, { width: availableWidth, lineBreak: false });

                // Update the currentX position for the next legend item
                currentX += availableWidth + 20; // Add 20 for spacing between legend items
            }
        }*/


        /**Start- add footer */
        {
            const text = "All rights to this document are reserved with Intrucept Labs. No information from this document can be copied or redistributed without the consent of Intrucept Labs";

            // Calculate the remaining space at the bottom of the page
            const bottomMargin = 0; // Adjust this value as needed
            const remainingSpace = doc.page.height - doc.y - bottomMargin;

            doc.x = 0;
            doc.y = 730;

            // Place the text at the bottom
            doc.font('Helvetica').fontSize(8).fillColor('#0180ff').text(text, {
                align: 'center',
                baseline: doc.page.margins.bottom - 30,
            });

        }
        /**End- add footer */


        // Draw the border
        doc.rect(0, 0, doc.page.width, doc.page.height)
            .lineWidth(5)
            .strokeColor('#0180ff')
            .stroke();


        doc.addPage();

        /** Start -add header */
        doc.font('Helvetica').fontSize(8).fillColor('#0180ff').text('API Security Report by intruceptlabs.com', {
            align: 'center',
        });
        doc.moveDown(1);
        doc.font('Helvetica').fontSize(8).fillColor('#000000').text(currentPageCount + '/' + pageCount, {
            align: 'center',
        });
        currentPageCount = currentPageCount + 1;
        /** End -add header */

        doc.moveDown(2);
        doc.font('Helvetica-Bold').fontSize(20).fillColor('#0180ff').text('SENSITIVE DATA', { align: 'center' });


        // Add the second pie chart
        doc.image(chartImage2, {
            width: 300,
            height: 300,
            align: 'center',
            valign: 'center',
            x: ((pageWidth - chartWidth) / 2) - 50,
            y: chart2Y,
        });

        // Pie charts end


        // Move the cursor below the pie charts
        doc.moveDown(3);

        var legendDataPII = [];

        if (piiLabelsArray.includes("Name")) {
            legendDataPII.push({ label: 'Name', color: '#FF6384' })
        }

        if (piiLabelsArray.includes("Address")) {
            legendDataPII.push({ label: 'Address', color: '#36A2EB' })
        }

        if (piiLabelsArray.includes("Phone")) {
            legendDataPII.push({ label: 'Phone', color: '#FFCE56' })
        }

        if (piiLabelsArray.includes("IP Address")) {
            legendDataPII.push({ label: 'IP Address', color: '#EE82EE' })
        }

        if (piiLabelsArray.includes("MAC Address")) {
            legendDataPII.push({ label: 'MAC Address', color: '#FFA500' })
        }

        if (piiLabelsArray.includes("SSN")) {
            legendDataPII.push({ label: 'SSN', color: '#1E90FF' })
        }


        if (piiLabelsArray.includes("Passport Num")) {
            legendDataPII.push({ label: 'Passport Num', color: '#FFD700' })
        }


        if (piiLabelsArray.includes("DL Num")) {
            legendDataPII.push({ label: 'DL Num', color: '#FF69B4' })
        }

        if (piiLabelsArray.includes("Bank Account Num")) {
            legendDataPII.push({ label: 'Bank Account Num', color: '#00CED1' })
        }

        if (piiLabelsArray.includes("Credit/Debit Card Num")) {
            legendDataPII.push({ label: 'Credit/Debit Card Num', color: '#FF4500' })
        }

        if (piiLabelsArray.includes("PAN Num")) {
            legendDataPII.push({ label: 'PAN Num', color: '#FF7F50' })
        }


        if (piiLabelsArray.includes("Aadhaar Num")) {
            legendDataPII.push({ label: 'Aadhaar Num', color: '#9370DB' })
        }

        if (piiLabelsArray.includes("Voter ID Num")) {
            legendDataPII.push({ label: 'Voter ID Num', color: '#FFC0CB' })
        }

        if (piiLabelsArray.includes("Vehicle Registration Num")) {
            legendDataPII.push({ label: 'Vehicle Registration Num', color: '#7B68EE' })
        }

        if (piiLabelsArray.includes("DOB")) {
            legendDataPII.push({ label: 'DOB', color: '#00FF00' })
        }


        if (piiLabelsArray.includes("Place of Birth")) {
            legendDataPII.push({ label: 'Place of Birth', color: '#800080' })
        }

        if (piiLabelsArray.includes("Race")) {
            legendDataPII.push({ label: 'Race', color: '#FFFF00' })
        }

        if (piiLabelsArray.includes("Religion")) {
            legendDataPII.push({ label: 'Religion', color: '#008080' })
        }

        if (piiLabelsArray.includes("Weight")) {
            legendDataPII.push({ label: 'Weight', color: '#8B0000' })
        }


        if (piiLabelsArray.includes("Height")) {
            legendDataPII.push({ label: 'Height', color: '#FF00FF' })
        }


        if (piiLabelsArray.includes("Latitude")) {
            legendDataPII.push({ label: 'Latitude', color: '#00FFFF' })
        }

        if (piiLabelsArray.includes("Longitude")) {
            legendDataPII.push({ label: 'Longitude', color: '#800000' })
        }

        if (piiLabelsArray.includes("Employee ID")) {
            legendDataPII.push({ label: 'Employee ID', color: '#FFFF99' })
        }


        if (piiLabelsArray.includes("BMI")) {
            legendDataPII.push({ label: 'BMI', color: '#008000' })
        }

        if (piiLabelsArray.includes("Heart Rate")) {
            legendDataPII.push({ label: 'Heart Rate', color: '#808080' })
        }

        if (piiLabelsArray.includes("Blood Pressure")) {
            legendDataPII.push({ label: 'Blood Pressure', color: '#FF1493' })
        }

        if (piiLabelsArray.includes("Father Name")) {
            legendDataPII.push({ label: 'Father Name', color: '#00FF7F' })
        }

        if (piiLabelsArray.includes("Mother Name")) {
            legendDataPII.push({ label: 'Mother Name', color: '#9400D3' })
        }

        if (piiLabelsArray.includes("Brother Name")) {
            legendDataPII.push({ label: 'Brother Name', color: '#FF8C00' })
        }

        if (piiLabelsArray.includes("Sister Name")) {
            legendDataPII.push({ label: 'Sister Name', color: '#00BFFF' })
        }

        if (piiLabelsArray.includes("Daughter Name")) {
            legendDataPII.push({ label: 'Daughter Name', color: '#FF00FF' })
        }


        if (piiLabelsArray.includes("Son Name")) {
            legendDataPII.push({ label: 'Son Name', color: '#32CD32' })
        }

        if (piiLabelsArray.includes("Order ID")) {
            legendDataPII.push({ label: 'Order ID', color: '#BA55D3' })
        }

        if (piiLabelsArray.includes("Transaction ID")) {
            legendDataPII.push({ label: 'Transaction ID', color: '#FFD700' })
        }

        if (piiLabelsArray.includes("Cookie Data")) {
            legendDataPII.push({ label: 'Cookie Data', color: '#4682B4' })
        }


        /*

        // Set the initial position for the first legend item
        currentX = centerLegendX;
        currentY = legendY + 5;

        // Check if there is only one legend
        if (legendDataPII.length === 1) {
            const legendItem = legendDataPII[0];

            // Write label
            const labelWidth = doc.widthOfString(legendItem.label); // Get the width of the label

            // Center the legend horizontally within the legend rectangle
            currentX = centerLegendX + (maxLegendWidth - labelWidth) / 2;

            // Draw circular shape
            doc.circle(currentX, currentY, 5).fill(legendItem.color);

            // Write label
            doc.font('Helvetica').fontSize(9).fillColor('#000000')
                .text(legendItem.label, currentX + 10, currentY - 5, { width: maxLegendWidth, lineBreak: false });
        } else {

            // Calculate the available width for each legend item on one line
            const availableWidth = maxLegendWidth / 2;

            // Check if there are more than two legend items
            if (legendDataPII.length > 2) {
                currentY += doc.currentLineHeight() + 5;
            }

            // Draw legends inside the rectangle
            for (let i = 0; i < legendDataPII.length; i++) {

                const legendItem = legendDataPII[i];

                // Write label
                const labelWidth = doc.widthOfString(legendItem.label); // Get the width of the label

                // Check if the current line exceeds the available width, then move to the next line
                if (currentX + labelWidth > centerLegendX + availableWidth) {
                    currentX = centerLegendX;
                    currentY += doc.currentLineHeight() + 5;
                }

                // Draw circular shape
                doc.circle(currentX, currentY, 5).fill(legendItem.color);

                // Write label
                doc.font('Helvetica').fontSize(9).fillColor('#000000')
                    .text(legendItem.label, currentX + 10, currentY - 5, { width: availableWidth, lineBreak: false });

                // Update the currentX position for the next legend item
                currentX += availableWidth + 20; // Add 20 for spacing between legend items
            }
        }

        */


        /**Start- add footer */
        {
            const text = "All rights to this document are reserved with Intrucept Labs. No information from this document can be copied or redistributed without the consent of Intrucept Labs";

            // Calculate the remaining space at the bottom of the page
            const bottomMargin = 0; // Adjust this value as needed
            const remainingSpace = doc.page.height - doc.y - bottomMargin;

            doc.x = 0;
            doc.y = 730;

            // Place the text at the bottom
            doc.font('Helvetica').fontSize(8).fillColor('#0180ff').text(text, {
                align: 'center',
                baseline: doc.page.margins.bottom - 30,
            });

        }
        /**End- add footer */


        // Draw the border
        doc.rect(0, 0, doc.page.width, doc.page.height)
            .lineWidth(5)
            .strokeColor('#0180ff')
            .stroke();

        doc.addPage();

        doc.font('Helvetica').fontSize(8).fillColor('#000000').text('API Security Report by intruceptlabs.com', {
            align: 'center',
            baseline: doc.page.margins.top - 30,
        });
        doc.moveDown(1);
        doc.font('Helvetica').fontSize(8).fillColor('#000000').text(currentPageCount + '/' + pageCount, {
            align: 'center',
        });
        currentPageCount = currentPageCount + 1;


        doc.moveDown(2);
        doc.font('Helvetica-Bold').fontSize(20).fillColor('#0180ff').text('VULNERABILITIES FOUND', { align: 'center' });
        doc.moveDown(2);

        doc.fillColor("#000000");

        // Helper function to format the field label and value
        function formatField(label, value) {

            if (label == 'Severity') {

                let theColor;
                if (value == 'CRITICAL') {
                    theColor = '#ff0000';
                } else if (value == 'HIGH') {
                    theColor = '#A6001B';
                } else if (value == 'MEDIUM') {
                    theColor = '#F6BE00';
                } else if (value == 'LOW') {
                    theColor = 'green';
                }

                doc.font('Helvetica-Bold').fontSize(12).text(label + ' : ', { continued: true })
                    .font('Helvetica').fillColor(theColor).text(value);
                doc.fillColor('#000000');

            } else {

                doc.font('Helvetica-Bold').fontSize(12).text(label + ' : ', { continued: true })
                    .font('Helvetica').text(value);
                doc.fillColor('#000000');
            }
        }


        for (var i = 0; i < activeScan.vulnerabilities.length; i++) {


            var endpointObject = activeScan.vulnerabilities[i].endpoint;
            var authType = endpointObject.authorization.type === 'None' ? 'Unauthenticated' : 'Authenticated';

            formatField('Vuln #', i + 1);
            formatField('Vulnerability', activeScan.vulnerabilities[i].vulnerability.vulnerabilityName);


            if (endpointObject.url) {
                formatField('Endpoint', endpointObject.url);
            } else {
                formatField('Endpoint', endpointObject.protocol + '://' + endpointObject.host + '/' + endpointObject.endpoint);
            }


            formatField('Method', endpointObject.method);
            formatField('Auth Type', authType);
            formatField('Description', activeScan.vulnerabilities[i].description);
            formatField('Severity', activeScan.vulnerabilities[i].vulnerability.riskScore);


            doc.moveDown(1);
            doc.moveDown(3);



            // break page at every 3 blocks
            if ((i + 1) % 2 == 0) {


                /**Start- add footer */
                {
                    const text = "All rights to this document are reserved with Intrucept Labs. No information from this document can be copied or redistributed without the consent of Intrucept Labs";

                    // Calculate the remaining space at the bottom of the page
                    const bottomMargin = 0; // Adjust this value as needed
                    const remainingSpace = doc.page.height - doc.y - bottomMargin;

                    doc.x = 0;
                    doc.y = 730;

                    // Place the text at the bottom
                    doc.font('Helvetica').fontSize(8).fillColor('#0180ff').text(text, {
                        align: 'center',
                        baseline: doc.page.margins.bottom - 30,
                    });

                }
                /**End- add footer */



                // Draw the border
                doc.rect(0, 0, doc.page.width, doc.page.height)
                    .lineWidth(5)
                    .strokeColor('#0180ff')
                    .stroke();

                doc.addPage();


                // Draw the header
                /** Start -add header */
                doc.font('Helvetica').fontSize(8).fillColor('#0180ff').text('API Security Report by intruceptlabs.com', {
                    align: 'center',
                });
                doc.moveDown(1);
                doc.font('Helvetica').fontSize(8).fillColor('#000000').text(currentPageCount + '/' + pageCount, {
                    align: 'center',
                });
                currentPageCount = currentPageCount + 1;
                /** End -add header */
                doc.moveDown(3);

            }

        }

        doc.moveDown(3);

        doc.rect(0, 0, doc.page.width, doc.page.height)
            .lineWidth(5)
            .strokeColor('#0180ff')
            .stroke();



        doc.addPage();

        // Draw the header
        /** Start -add header */
        doc.font('Helvetica').fontSize(8).fillColor('#0180ff').text('API Security Report by intruceptlabs.com', {
            align: 'center',
        });
        doc.moveDown(1);
        doc.font('Helvetica').fontSize(8).fillColor('#000000').text(currentPageCount + '/' + pageCount, {
            align: 'center',
        });
        currentPageCount = currentPageCount + 1;
        /** End -add header */


        doc.x = 50;

        var vulnsCoveredForRemediations = [];

        var uniqueVulns = [];

        for (var i = 0; i < activeScan.vulnerabilities.length; i++) {

            if (!(vulnsCoveredForRemediations.includes((activeScan.vulnerabilities)[i].vulnerability.vulnerabilityCode))) {

                var currentVulnerability = (activeScan.vulnerabilities)[i].vulnerability;
                vulnsCoveredForRemediations.push(currentVulnerability.vulnerabilityCode);
                uniqueVulns.push(currentVulnerability);
            }
        }



        for (var i = 0; i < uniqueVulns.length; i++) {

            var currentVulnerability = uniqueVulns[i];
            // vulnsCoveredForRemediations.push(currentVulnerability.vulnerabilityCode);

            doc.moveDown(1);

            doc.font('Helvetica-Bold').fontSize(16).fillColor('#563EE0').text('Vulnerability - ' + currentVulnerability.vulnerabilityName, { align: 'left' });
            doc.moveDown(1)
            doc.fillColor('#000000');

            doc.font('Helvetica-Bold').fontSize(14).text('Remediations', { align: 'left' });
            doc.moveDown(1)

            for (var j = 0; j < currentVulnerability.remediations.length; j++) {

                doc.font('Helvetica-Bold').fontSize(13).text((currentVulnerability.remediations)[j].remediationHeading);
                doc.moveDown();
                doc.font('Helvetica').fontSize(10).text((currentVulnerability.remediations)[j].remediationContent);
                doc.moveDown(1);
            }


            /**Start- add footer */
            {
                const text = "All rights to this document are reserved with Intrucept Labs. No information from this document can be copied or redistributed without the consent of Intrucept Labs";

                // Calculate the remaining space at the bottom of the page
                const bottomMargin = 0; // Adjust this value as needed
                const remainingSpace = doc.page.height - doc.y - bottomMargin;

                doc.x = 0;
                doc.y = 730// - 70;    


                // Place the text at the bottom
                doc.font('Helvetica').fontSize(8).fillColor('#0180ff').text(text, {
                    align: 'center',
                    baseline: doc.page.margins.bottom - 30,
                });

            }
            /**End- add footer */



            // Draw the border
            doc.rect(0, 0, doc.page.width, doc.page.height)
                .lineWidth(5)
                .strokeColor('#0180ff')
                .stroke();



            if (i !== uniqueVulns.length - 1) {

                doc.addPage();


                // Draw the header
                /** Start -add header */
                doc.font('Helvetica').fontSize(8).fillColor('#0180ff').text('API Security Report by intruceptlabs.com', {
                    align: 'center',
                });
                doc.moveDown(1);
                doc.font('Helvetica').fontSize(8).fillColor('#000000').text(currentPageCount + '/' + pageCount, {
                    align: 'center',
                });
                currentPageCount = currentPageCount + 1;
                /** End -add header */
            }
        }

        doc.rect(0, 0, doc.page.width, doc.page.height)
            .lineWidth(5)
            .strokeColor('#0180ff')
            .stroke();

    } // end - if vulns are found


    // Finalize the PDF document
    doc.end();

    return doc;
};




// Create PDF and download
async function createPDFAndDownload(activeScan, baseUrl) {


    // Generate PDF and download
    (async () => {
        try {
            const pdf = await generatePDF(activeScan);
            const timestamp = new Date().getTime();

            const filePath = path.join(__dirname, '..', 'public', 'downloads', 'scanreport_' + activeScan._id + '.pdf');

            // Delete the file if it exists
            //await fsextra.remove(filePath);

            const filePath1 = path.join(__dirname, '..', 'public', 'downloads', 'scanreport_' + activeScan._id + '.pdf');
            pdf.pipe(fs.createWriteStream(filePath1))
                .on('finish', () => {
                    //console.log('PDF downloaded successfully');
                    return baseUrl;
                })
                .on('error', (error) => {
                    //console.log('Error downloading PDF:', error);
                });


        } catch (error) {
            //console.log('Error generating PDF:', error);
        }
    })();

}