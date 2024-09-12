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
const Organization = require("../models/organization.model");

const { none } = require('../config/multerUpload');
const APICollection = require('../models/apicollection.model');
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
const mongoose = require('mongoose');

const remediations = require('./remediations/rest-remediations.json');


const cron = require('node-cron');

const { basicAuthenticationDetectedCheck } = require("../services/securityTests/basicAuthenticationDetectedCheck.service");
const { brokenAuthenticationCheck } = require("../services/securityTests/brokenAuthenticationCheck.service");
const { brokenObjectLevelAuthoriztionCheck } = require("../services/securityTests/brokenObjectLevelAuthoriztionCheck.service");
const { contentTypeInjectionPossibleCheck } = require("../services/securityTests/contentTypeInjectionPossibleCheck.service");
const { endpointNotSecuredBySSLCheck } = require("../services/securityTests/endpointNotSecuredBySSLCheck.service");
const { excessiveDataExposureCheck } = require("../services/securityTests/excessiveDataExposureCheck.service");
const { httpVerbTamperingPossibleCheck } = require("../services/securityTests/httpVerbTamperingPossibleCheck.service");
const { injectionCheck } = require("../services/securityTests/injectionCheck.service");
const { lackOfResourcesAndRateLimitingCheck } = require("../services/securityTests/lackOfResourcesAndRateLimitingCheck.service");
const { piiDataDetectedInResponseCheck } = require("../services/securityTests/piiDataDetectedInResponseCheck.service");
const { preImageAttackPossibleCheck } = require("../services/securityTests/preImageAttackPossibleCheck.service");
const { resourceDeletionPossibleCheck } = require("../services/securityTests/resourceDeletionPossibleCheck.service");
const { securityHeadersNotEnabledOnHostCheck } = require("../services/securityTests/securityHeadersNotEnabledOnHostCheck.service");
const { sensitiveDataInPathParamsCheck } = require("../services/securityTests/sensitiveDataInPathParamsCheck.service");
const { sensitiveDataInQueryParamsCheck } = require("../services/securityTests/sensitiveDataInQueryParamsCheck.service");
const { unauthenticatedEndpointReturningSensitiveDataCheck } = require("../services/securityTests/unauthenticatedEndpointReturningSensitiveDataCheck.service");
const { walletHijackingPossibleCheck } = require("../services/securityTests/walletHijackingPossibleCheck.service");

const { calculateDashboard } = require("../services/dashboard/dashboardCalculation.service");



const {
    checkCipherSuitesVulnerabilities,
    gettlsCompressionIssue,
    gettls13EarlyDataIssue,
    getopenSSLCCSInjectionIssue,
    gettlsFallbackSCSVIssue,
    getheartbleedIssue,
    getrobotIssue,
    getsessionRenegotiationIssue,
    getsessionResumptionIssue,
    getellipticCurvesIssue,
} = require("../services/securityTests/helpers/findSSLIssues.service");


function getObjectByIndex(index) {
    // Find the object with the given index
    const result = remediations.find(item => item.index === index);
    return result || null; // Return null if no object is found
}

async function getVulnSeverityAndPriority(vulnId) {
    try {
        // Find the organization document that contains the specified vulnId
        const organization = await Organization.findOne({
            'vulnSeverityAndPriority.vulnId': vulnId
        }, {
            'vulnSeverityAndPriority.$': 1 // Project only the matching element from the array
        }).exec();

        if (organization && organization.vulnSeverityAndPriority.length > 0) {
            // Return the severity and priority for the specified vulnId
            return organization.vulnSeverityAndPriority[0];
        } else {
            // If no matching element is found, return null
            return null;
        }
    } catch (error) {
        console.error('Error retrieving vulnerability details:', error);
        throw error;
    }
}


// Get all quick scans 
module.exports.getAllActiveScans = asyncHandler(async (req, res) => {

    const user = await User.findById(req.user._id);
    const organization = await Organization.findById(user.organization);   

  
    const page = req.params.page ? parseInt(req.params.page, 10) : 1;
    const rowsPerPage = req.params.rowsPerPage ? parseInt(req.params.rowsPerPage, 10) : 10;   

    // Validate and parse page and rowsPerPage
    const pageNumber = parseInt(page, 10) + 1;
    const rowsPerPageNumber = parseInt(rowsPerPage, 10);


    if (isNaN(pageNumber) || isNaN(rowsPerPageNumber) || pageNumber < 1 || rowsPerPageNumber < 1) {
        return res.status(400).json({ success: false, message: "Invalid pagination parameters" });
    }

    const skip = (pageNumber - 1) * rowsPerPageNumber;
    const limit = rowsPerPageNumber;    

    const totalCount = await ActiveScan.aggregate([
        {
          $lookup: {
            from: 'apicollectionversions',
            localField: 'theCollectionVersion',
            foreignField: '_id',
            as: 'collectionVersion'
          }
        },
        { $unwind: '$collectionVersion' },
        {
          $lookup: {
            from: 'apicollections',
            localField: 'collectionVersion.apiCollection',
            foreignField: '_id',
            as: 'apiCollection'
          }
        },
        { $unwind: '$apiCollection' },
        {
          $lookup: {
            from: 'orgprojects',
            localField: 'apiCollection.orgProject',
            foreignField: '_id',
            as: 'orgProject'
          }
        },
        { $unwind: '$orgProject' },
        {
          $match: {
            'orgProject.organization': user.organization._id
          }
        },
        {
          $count: 'totalCount'
        }
      ]).then(result => result[0]?.totalCount || 0);


      const activeScans = await ActiveScan.aggregate([
        {
            $lookup: {
                from: 'apicollectionversions',
                localField: 'theCollectionVersion',
                foreignField: '_id',
                as: 'theCollectionVersion'
            }
        },
        { $unwind: { path: '$theCollectionVersion', preserveNullAndEmptyArrays: true } },
        
        {
            $lookup: {
                from: 'apicollections',
                localField: 'theCollectionVersion.apiCollection',
                foreignField: '_id',
                as: 'theCollectionVersion.apiCollection'
            }
        },
        { $unwind: { path: '$theCollectionVersion.apiCollection', preserveNullAndEmptyArrays: true } },
        
        {
            $lookup: {
                from: 'orgprojects',
                localField: 'theCollectionVersion.apiCollection.orgProject',
                foreignField: '_id',
                as: 'theCollectionVersion.apiCollection.orgProject'
            }
        },
        { $unwind: { path: '$theCollectionVersion.apiCollection.orgProject', preserveNullAndEmptyArrays: true } },
        
        {
            $match: {
                'theCollectionVersion.apiCollection.orgProject.organization': organization._id
            }
        },
        
        {
            $addFields: {
                'theCollectionVersion.apiCollection.orgProject': {
                    $ifNull: ['$theCollectionVersion.apiCollection.orgProject', null]
                }
            }
        },
        
        { $sort: { createdAt: -1 } },
        { $skip: skip },
        { $limit: limit }
    ]).exec();

   

    // Return the active scans, currentPage, totalRecords, and totalPages in the response
    res.status(200).json({
        activeScans,
        totalCount,
        
    });
});



// Get all scans of an api collection version
module.exports.fetchAPICollectionVersionScans = asyncHandler(async (req, res) => {

    const user = await User.findById(req.user._id);  


    const theCollectionVersionId = req.params.theCollectionVersionId;
    const page = req.params.page ? parseInt(req.params.page, 10) : 1;
    const rowsPerPage = req.params.rowsPerPage ? parseInt(req.params.rowsPerPage, 10) : 10;

   

    // Validate and parse page and rowsPerPage
    const pageNumber = parseInt(page, 10) + 1;
    const rowsPerPageNumber = parseInt(rowsPerPage, 10);


    if (isNaN(pageNumber) || isNaN(rowsPerPageNumber) || pageNumber < 1 || rowsPerPageNumber < 1) {
        return res.status(400).json({ success: false, message: "Invalid pagination parameters" });
    }

    const skip = (pageNumber - 1) * rowsPerPageNumber;
    const limit = rowsPerPageNumber;

    

    const activeScans = await ActiveScan.find({ 
        //user: req.user._id, 
        theCollectionVersion: theCollectionVersionId // Filter by theCollectionVersionId
    })
    .populate({
        path: 'theCollectionVersion',
        populate: {
            path: 'apiCollection',
            model: 'APICollection',
            populate: {
                path: 'orgProject',
                model: 'OrgProject' 
            }
        }
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();  


    const totalCount = await ActiveScan.countDocuments({ 
        theCollectionVersion: theCollectionVersionId // Filter by theCollectionVersionId
    })
    .populate({
        path: 'theCollectionVersion',
        populate: {
            path: 'apiCollection',
            model: 'APICollection',
            populate: {
                path: 'orgProject',
                model: 'OrgProject' 
            }
        }
    })
     

    // Return the active scans, currentPage, totalRecords, and totalPages in the response
    res.status(200).json({
        activeScans,
        totalCount        
    });
});



module.exports.getActiveScanDetails = asyncHandler(async (req, res) => {

    const { scanId } = req.body;

    const page = req.params.page ? parseInt(req.params.page, 10) : 1;
    const rowsPerPage = req.params.rowsPerPage ? parseInt(req.params.rowsPerPage, 10) : 10;

    

    // Validate and parse page and rowsPerPage
    const pageNumber = parseInt(page, 10) + 1;
    const rowsPerPageNumber = parseInt(rowsPerPage, 10);


    if (isNaN(pageNumber) || isNaN(rowsPerPageNumber) || pageNumber < 1 || rowsPerPageNumber < 1) {
        return res.status(400).json({ success: false, message: "Invalid pagination parameters" });
    }

    const skip = (pageNumber - 1) * rowsPerPageNumber;
    const limit = rowsPerPageNumber;
    

    const activeScan = await ActiveScan.findById(scanId)
        .populate({
            path: 'user', // Populate user field
        })
        .populate({
            path: 'theCollectionVersion', // Populate theCollectionVersion field
            populate: {
                path: 'apiCollection', // Further nested populate: apiCollection field within theCollectionVersion
            }
        })
       
        .lean();
        

    const vulnerabilities = await ActiveScanVulnerability.find({ activeScan: scanId }).populate('vulnerability endpoint')
    .skip(skip)
    .limit(limit).lean();



    const totalCount = await ActiveScanVulnerability.countDocuments({ activeScan: scanId })

    activeScan.vulnerabilities = vulnerabilities;
    
    const endpointsCount = await ApiEndpoint.count({ theCollection: activeScan.theCollection })
    activeScan.endpointsCount = endpointsCount;

    // Return the scans
    res.status(200);
    res.json({ activeScan, totalCount })
});




module.exports.deleteActiveScan = asyncHandler(async (req, res) => {

    try {
        const { id } = req.body;        

        // Find the active scan and its associated APICollection
        const activeScan = await ActiveScan.findById(id);
        if (!activeScan) {
            return res.status(404).json({ error: 'Scan not found.' });
        }


        // Delete the ActiveScan
        const deletedActiveScan = await ActiveScan.findByIdAndDelete(id);
        if (!deletedActiveScan) {
            return res.status(404).json({ error: 'Failed to delete the scan.' });
        }

       

        // Delete related ActiveScanVulnerabilities
        await ActiveScanVulnerability.deleteMany({ activeScan: id });

        const user = await User.findById(req.user._id)
        const organization = await Organization.findById(user.organization)
        calculateDashboard(organization);

        res.json({ message: 'Scan and related vulnerabilities deleted successfully.' });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});




// Helper function to check if a password is plain text
const isPlainText = (password) => {

    // Perform any checks to identify plain text passwords
    // Example: Check if the password matches a list of known plain text passwords
    const plainTextPasswords = ['plaintext', 'admin123', /* Add more plain text passwords */];
    return plainTextPasswords.includes(password);
};

// Helper function to check if a password is weakly hashed
const isWeaklyHashed = (password, algorithm) => {

    // Perform checks to identify weakly hashed passwords
    // Example: Check if the password matches a known weak hash algorithm and its hash value
    const weakHashes = {
        md5: '5f4dcc3b5aa765d61d8327deb882cf99',
        sha1: 'a94a8fe5ccb19ba61c4c0873d391e987982fbbd3',
        sha256: 'a94a8fe5ccb19ba61c4c0873d391e987982fbbd3',
        sha512: 'a94a8fe5ccb19ba61c4c0873d391e987982fbbd3',
    };

    const hash = crypto.createHash(algorithm).update(password).digest('hex');
    return weakHashes[algorithm] === hash;
};


// 13. Run test for "EXCESSIVE DATA EXPOSURE"
const runTestForExcessiveDataExposure = async (endpoint) => {

    const responseData = await callEndpoint(endpoint);
    const fieldCombinations = [];

    if (
        (responseData.hasOwnProperty('createdAt') || responseData.hasOwnProperty('created_at')) &&
        (responseData.hasOwnProperty('id') || responseData.hasOwnProperty('_id'))
    ) {
        fieldCombinations.push('createdAt + id');
    }

    if (
        (responseData.hasOwnProperty('updatedAt') || responseData.hasOwnProperty('updated_at')) &&
        (responseData.hasOwnProperty('id') || responseData.hasOwnProperty('_id'))
    ) {
        fieldCombinations.push('updatedAt + id');
    }

    if (
        (responseData.hasOwnProperty('createdAt') || responseData.hasOwnProperty('created_at')) &&
        (responseData.hasOwnProperty('_id'))
    ) {
        fieldCombinations.push('createdAt + _id');
    }

    if (
        (responseData.hasOwnProperty('updatedAt') || responseData.hasOwnProperty('updated_at')) &&
        (responseData.hasOwnProperty('_id'))
    ) {
        fieldCombinations.push('updatedAt + _id');
    }

    return fieldCombinations;
};


const callEndpoint = async (endpoint) => {

    const { protocol, host, url, endpoint: path, queryParams, body, authorization } = endpoint;
    //const url = `${protocol}://${host}/${path}`;
    const headers = {};

    // Set query parameters if provided
    if (queryParams) {
        url += '?' + new URLSearchParams(queryParams).toString();
    }

    // Set request body if provided
    const data = body ? JSON.stringify(body) : undefined;

    // Set appropriate authorization header based on the authentication type
    switch (authorization.type) {
        case 'bearer':
            headers['Authorization'] = `Bearer ${authorization.bearerToken}`;
            break;
        case 'apikey':
            headers['X-API-Key'] = authorization.apiKey;
            break;
        case 'digest':
            headers['Authorization'] = `Digest username="${authorization.username}", realm="${authorization.realm}", nonce="${authorization.nonce}", uri="${url}", response="${authorization.response}", opaque="${authorization.opaque}", qop="${authorization.qop}", nc=${authorization.nc}, cnonce="${authorization.cnonce}"`;
            break;
        case 'jwt':
            headers['Authorization'] = `Bearer ${authorization.token}`;
            break;
        case 'oauth1':
            // Implement OAuth1 token extraction and signing logic
            break;
        case 'oauth2':
            // Implement OAuth2 token extraction and handling logic
            break;
        case 'basic':
            headers['Authorization'] = `Basic ${Buffer.from(`${authorization.username}:${authorization.password}`).toString('base64')}`;
            break;
        default:
            console.log('Unsupported authentication type');
            break;
    }

    try {
        const response = await axios({
            method: 'POST',
            url,
            headers,
            data,
        });

        return response.data;
    } catch (error) {
        console.log('Error occurred during API request:', error);
        return null;
    }
};



const callEndpointWithPayload = async (endpoint, payload) => {

    const { protocol, host, url, endpoint: path, queryParams, body, authorization } = endpoint;
    //const url = `${protocol}://${host}/${path}`;
    const headers = {};

    // Set query parameters if provided
    if (queryParams) {
        url += '?' + new URLSearchParams(queryParams).toString();
    }

    // Set request body if provided
    const data = body ? JSON.stringify(body) : undefined;

    // Set appropriate authorization header based on the authentication type
    switch (authorization.type) {

        case 'None':
            // No authorization required
            break;
        case 'APIKey':
            headers['Authorization'] = `APIKey ${authorization.key}`;
            break;
        case 'BearerToken':
            headers['Authorization'] = `Bearer ${authorization.token}`;
            break;
        case 'BasicAuth':
            const { username, password } = authorization;
            headers['Authorization'] = `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`;
            break;
        default:
            // Unsupported authentication type
            console.error(`Unsupported authentication type: ${authorization.type}`);
            break;
    }

    try {
        const response = await axios({
            method: 'POST',
            url,
            headers,
            data,
            params: payload, // Include the payload in the request
        });

        return response.data;
    } catch (error) {
        console.log('Error occurred during API request:', error);
        return null;
    }
};


const runTestForInjectionPossible = async (endpoint) => {

    const sqlPayload = {
        param: "'; SELECT * FROM users; --",
    };

    const nosqlPayload = {
        param: '{"$gt": ""}',
    };

    const ldapPayload = {
        param: '*',
    };

    const osCommandPayload = {
        param: '; ls -l',
    };

    const injectionTypes = [];

    const sqlResponse = await callEndpointWithPayload(endpoint, sqlPayload);
    if (sqlResponse && sqlResponse.includes('error')) {
        injectionTypes.push('SQL Injection');
    }

    const nosqlResponse = await callEndpointWithPayload(endpoint, nosqlPayload);
    if (nosqlResponse && nosqlResponse.includes('error')) {
        injectionTypes.push('NoSQL Injection');
    }

    const ldapResponse = await callEndpointWithPayload(endpoint, ldapPayload);
    if (ldapResponse && ldapResponse.includes('error')) {
        injectionTypes.push('LDAP Injection');
    }

    const osCommandResponse = await callEndpointWithPayload(endpoint, osCommandPayload);
    if (osCommandResponse && osCommandResponse.includes('error')) {
        injectionTypes.push('OS Command Injection');
    }

    return injectionTypes;
};



// 15. Run test for "XSS VULNERABILITY FOUND"
const runTestForXSSVulnerabilityFound = async (endpoint) => {


    const { protocol, host, url, endpoint: path, query, body } = endpoint;
    //const url = `${protocol}://${host}/${path}`;

    // Construct the payload with potential XSS injections
    const payloads = [
        '<script>alert("XSS");</script>',
        '<img src="x" onerror="alert(\'XSS\');" />',
        '<svg onload="alert(\'XSS\');"></svg>',
        '<a href="javascript:alert(\'XSS\');">Click me</a>',
    ];

    // Make a request to the endpoint with each payload
    for (const payload of payloads) {
        try {
            const response = await axios.post(url, body, { params: { ...query, payload } });

            // Check if the response contains the injected payload
            if (response.data.includes(payload)) {
                return true; // XSS vulnerability detected
            }
        } catch (error) {
            console.log('Error occurred during API request:', error);
        }
    }

    return false; // No XSS vulnerability detected
};




// 16. Run test for "WALLET HIJACKING POSSIBLE"
const runTestForWalletHijackingPossible = async (endpoint) => {


    const { protocol, host, url, endpoint: path, query, body } = endpoint;
    //const url = `${protocol}://${host}/${path}`;

    try {
        // Make a request to the endpoint
        const response = await axios.post(url, body, { params: query });

        // Check if the sensitive data is present in the request or response
        const sensitiveData = [
            'Private key',
            'Public key',
            'Wallet ID',
            'Mnemonics'
        ];

        const requestDataPresent = checkDataInObject(body, sensitiveData);
        const responseDataPresent = checkDataInObject(response.data, sensitiveData);

        return {
            request: requestDataPresent,
            response: responseDataPresent
        };
    } catch (error) {
        console.log('Error occurred during API request:', error);
        return {
            request: false,
            response: false
        };
    }
};




const checkDataInObject = (object, data) => {
    if (typeof object === 'object' && object !== null) {
        for (const key in object) {
            if (object.hasOwnProperty(key)) {
                const value = object[key];
                if (typeof value === 'string') {
                    if (data.some(item => containsSensitiveData(value, item))) {
                        return true;
                    }
                } else if (typeof value === 'object') {
                    if (checkDataInObject(value, data)) {
                        return true;
                    }
                }
            }
        }
    }
    return false;
};

const containsSensitiveData = (value, sensitiveData) => {
    const variations = [
        sensitiveData, // Original sensitive data
        sensitiveData.replace(/ /g, '_'), // Underscore-separated version
        sensitiveData.replace(/_/g, '-'), // Hyphen-separated version
    ];

    return variations.some(variation => value.includes(variation));
};


// 17. Run test for "PRE IMAGE ATTACK POSSIBLE"
const runTestForPreImageAttackPossible = async (endpoint) => {

    const { protocol, host, url, endpoint: path } = endpoint;
    //const url = `${protocol}://${host}/${path}`;

    try {
        // Make a request to the endpoint
        const response = await axios.get(url);

        // Extract the response data
        const responseData = response.data;

        // Check if the response contains a hash
        if (typeof responseData === 'string') {
            const isHash = Web3.utils.isHexStrict(responseData);
            if (isHash) {
                // Hash found, Pre-Image attack is possible
                return true;
            }
        }

        // No hash found, Pre-Image attack is not possible
        return false;
    } catch (error) {
        console.log('Error occurred during API request:', error);
        return false;
    }
};

// 18. Run test for "LACK OF RESOURCE AND RATE LIMITING"
/*const runTestForLackOfResourcesAndRateLimiting = async (apiEndpoint) => {

    try {

        const { method, protocol, host, port, endpoint, headers, queryParams, authorization, requestBody } = apiEndpoint;
        const requestCount = 10; // Number of requests to make
        const interval = 3000; // Interval between requests in milliseconds (2 seconds)

        const requestOptions = {
            method,
            url: endpoint.url,
            headers: {},
            params: queryParams,
            data: requestBody
        };

        // Set authorization headers based on the specified type
        switch (authorization.type) {
            case 'bearer':
                requestOptions.headers['Authorization'] = `Bearer ${authorization.bearer[0].value}`;
                break;
            case 'apikey':
                requestOptions.headers['X-API-Key'] = authorization.apikey[0].value;
                break;
            case 'digest':
                requestOptions.auth = {
                    username: authorization.digest[0].value,
                    password: authorization.digest[1].value
                };
                break;
            case 'basic':
                requestOptions.auth = {
                    username: authorization.basic[0].value,
                    password: authorization.basic[1].value
                };
                break;
        }

        // Set additional headers if provided
        if (headers && headers.length > 0) {
            headers.forEach(header => {
                requestOptions.headers[header.key] = header.value;
            });
        }

        let rateLimitHeadersFound = false;


        for (let i = 0; i < requestCount; i++) {

            console.log(`Making request ${i + 1}/${requestCount}`);
            const response = await axios(requestOptions).catch(error => error.response);

            console.log("response.status", response.status);

            if (response) {

                if (response.headers['x-rate-limit']) {
                    rateLimitHeadersFound = true;
                    break;
                }

                if (response.status === 429) {
                    console.log('rate limiting is enabled');
                    return false; // Return false if rate limit exceeded
                }

                if (i === requestCount - 1 && response.status !== 429) {
                    return true;
                }
            } else {
                continue;
            }

            await new Promise(resolve => setTimeout(resolve, interval));
        }

        console.log('Rate Limit Headers Found:', rateLimitHeadersFound);
        return !rateLimitHeadersFound; // Return true if rate limit headers are not found

    } catch (error) {
        console.error('Error1:', error.message);
        return false; // Return false in case of any error
    }
};
*/


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

/*
// Parse Postman JSON
const parsePostmanJSON = async (collectiondata, user, collectionFilePath, projectName, email) => {

    //if (collectiondata.info._postman_id && collectiondata.item && Array.isArray(collectiondata.item)) {
    if (collectiondata.info && collectiondata.item && Array.isArray(collectiondata.item)) {
        // If the collection is a valid Postman collection, save the collection object in DB
        const theCollection = await APICollection.create({
            user: user,
            collectionType: 'PostMan',
            collectionName: collectiondata.info.name,
            collectionNativeId: collectiondata.info._postman_id,
            collectionSchemaURL: collectiondata.info.schema,
            collectionFilePath: collectionFilePath,
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
                            theCollection: theCollection,
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
                                theCollection: theCollection,
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
                                theCollection: theCollection,
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
                                theCollection: theCollection,
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
                                theCollection: theCollection,
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
        const theScan = await runActiveScan(user, theCollection, projectName, email);
        return theScan;
    } else {
        return { message: 'Not a valid PostMan Collection' };
    }
};
*/




const parsePostmanYAML = async (collectionData, user, collectionFilePath, projectName, email) => {

    try {

        // Parse the YAML data
        const collection = collectionData;

        if (collection.info._postman_id && collection.item && Array.isArray(collection.item)) {

            // If the collection is a valid Postman collection, save the collection object in DB
            const theCollection = await APICollection.create({
                user: user,
                collectionType: 'PostMan',
                collectionName: collection.info.name,
                collectionNativeId: collection.info._postman_id,
                collectionSchemaURL: collection.info.schema,
                collectionFilePath: collectionFilePath,
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
                    theCollection: theCollection,
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
            const theScan = await runActiveScan(user, theCollection, projectName, email);

            return theScan;
        } else {
            return { message: 'Not a valid Postman Collection' };
        }
    } catch (error) {
        console.error('Error3:', error);
        return { message: 'An error occurred while parsing the collection' };
    }
};




// Parse Swagger JSON
const parseSwaggerJSON = async (swaggerData, user, collectionFilePath, projectName, email) => {

    let theCollection;

    if (collectionFilePath) {

        theCollection = await APICollection.create({
            user: user,
            collectionType: 'Swagger',
            collectionName: swaggerData.info.title,
            collectionFilePath: collectionFilePath,
        });
    } else {

        theCollection = await APICollection.create({
            user: user,
            collectionType: 'Swagger',
            collectionName: swaggerData.info.title,

        });
    }

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
                    theCollection: theCollection,
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

        var theScan = await runActiveScan(user, theCollection, projectName, email);

        return theScan;

    } catch (err) {
        //console.error('Error saving endpoints:', err);
    }

}




// Parse OpenAPI JSON
const parseOpenAPIJSON = async (openAPIData, user, collectionFilePath, projectName, email) => {

    let theCollection;

    if (collectionFilePath) {

        theCollection = await APICollection.create({
            user: user,
            collectionType: 'OpenAPI',
            collectionName: openAPIData.info.title,
            collectionFilePath: collectionFilePath,
        });
    } else {

        theCollection = await APICollection.create({
            user: user,
            collectionType: 'OpenAPI',
            collectionName: openAPIData.info.title,

        });
    }

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
                    theCollection: theCollection,
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

        var theScan = await runActiveScan(user, theCollection, projectName, email);

        return theScan;

    } catch (err) {
        //console.error('Error saving endpoints:', err);
    }

}

// Parse Swagger YAML
const parseSwaggerYAML = async (swaggerData, user, collectionFilePath, projectName, email) => {

    const theCollection = await APICollection.create({
        user: user,
        collectionType: 'Swagger',
        collectionName: swaggerData.info.title,
        collectionFilePath: collectionFilePath,
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
                    theCollection: theCollection,
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
        var theScan = await runActiveScan(user, theCollection, projectName, email);

        return theScan;

    } catch (err) {
        // console.error('Error saving endpoints:', err);
    }
}



// Parse OpenAPI YAML
const parseOpenAPIYAML = async (openAPIData, user, collectionFilePath, projectName, email) => {

    const theCollection = await APICollection.create({
        user: user,
        collectionType: 'OpenAPI',
        collectionName: openAPIData.info.title,
        collectionFilePath: collectionFilePath,
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
                    theCollection: theCollection,
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

        var theScan = await runActiveScan(user, theCollection, projectName, email);

        return theScan;

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


// Start quick scan 
module.exports.startActiveScan = asyncHandler(async (req, res) => {

    const user = await User.findById(req.user._id);

    const { theCollectionVersion, scanScheduleType,
        specificDateTime,
        recurringSchedule, selectedEndpointIdsToScan, projectPhase } = req.body;

    const endpoints = await ApiEndpoint.find({
        _id: { $in: selectedEndpointIdsToScan }
    });
    
/*
    const newScan = new ActiveScan({
        user: user._id,
        theCollectionVersion,
        scanScheduleType,
        specificDateTime: scanScheduleType === 'specificTime' ? new Date(specificDateTime) : undefined,
        recurringSchedule: scanScheduleType === 'recurring' ? recurringSchedule : undefined,
        status: scanScheduleType == 'now' ? 'in progress' : 'scheduled',
        endpointsScanned: selectedEndpointIdsToScan.length,
        projectPhase: projectPhase
    });
    */



	const newScan = new ActiveScan({
    user: user._id,
    theCollectionVersion,
    scanScheduleType,
    specificDateTime: scanScheduleType === 'specificTime'
        ? new Date(specificDateTime).toUTCString()
        : undefined,
    recurringSchedule: scanScheduleType === 'recurring' ? recurringSchedule : undefined,
    status: scanScheduleType == 'now' ? 'in progress' : 'scheduled',
    endpointsScanned: selectedEndpointIdsToScan.length,
    projectPhase: projectPhase
});


    await newScan.save();


    if (scanScheduleType === 'now') {

        // Run the scan immediately
        runActiveScan(user, theCollectionVersion, endpoints, newScan._id);
        res.status(200).json({ "status": "started" });

    } else if (scanScheduleType === 'specificTime') {

        // Schedule the scan for a specific time
        const scanTime = new Date(specificDateTime);
        

        const scheduledTask = cron.schedule('* * * * *', () => {

            if (new Date().getTime() >= scanTime.getTime()) {

                runActiveScan(user, theCollectionVersion, endpoints, newScan._id);

                // Stop the scheduled task
                scheduledTask.cancel();

            }
        });

        
        res.status(200).json({ "status": "scheduled" });

    } else if (scanScheduleType === 'recurring') {

        // Schedule recurring scans
        let cronExpression;
        switch (recurringSchedule) {
            case 'daily':
                cronExpression = '0 0 * * *'; // Run at midnight every day
                break;
            case 'weekly':
                cronExpression = '0 0 * * 0'; // Run at midnight every Sunday
                break;
            case 'biweekly':
                cronExpression = '0 0 1,15 * *'; // Run at midnight on the 1st and 15th of every month
                break;
            case 'monthly':
                cronExpression = '0 0 1 * *'; // Run at midnight on the 1st of every month
                break;
            default:
                throw new Error('Invalid recurring schedule');
        }

        cron.schedule(cronExpression, () => {

            const newScan1 = new ActiveScan({
                user: user._id,
                theCollectionVersion,
                scanScheduleType,
                specificDateTime: scanScheduleType === 'specificTime' ? new Date(specificDateTime) : undefined,
                recurringSchedule: scanScheduleType === 'recurring' ? recurringSchedule : undefined,
                status: scanScheduleType == 'now' ? 'in progress' : 'scheduled',
                endpointsScanned: selectedEndpointIdsToScan.length
            });

            runActiveScan(user, theCollectionVersion, endpoints, newScan1._id);
        });
        res.status(200).json({ "status": "scheduled" });
    } else {
        throw new Error('Invalid scan schedule type');
    }    

});


// Run scan from Postman
module.exports.runScanFromPostman = asyncHandler(async (req, res) => {


    const { collectionID, apisecurityengineClientId, apisecurityengineClientSecret } = req.body;

    const organization = await Organization.findOne({ clientId: apisecurityengineClientId, clientSecret: apisecurityengineClientSecret })

    //console.log('organization:',organization)
    const user = await User.findById(organization.primaryUser).populate('organization')

    console.log('user:', user)

    const apiKey = organization.postmanAPIKey;// 'PMAK-66b22f121aa5e100014fae49-9d74842c0ddfebba8af5cbbdd652361f0d';
    console.log('apiKey:',apiKey)
    const collectionId = collectionID;
    const apiUrl = `https://api.getpostman.com/collections/${collectionId}`;

    async function getPostmanCollection() {

        try {
            const response = await axios.get(apiUrl, {
                headers: {
                    'X-API-Key': apiKey
                }
            });

            const collection = response.data;
            console.log('Collection retrieved successfully');
            // You can now use the collection object as needed
            return collection;
        } catch (error) {
            console.error('Error fetching Postman collection:', error.message);
            if (error.response) {
                console.error('Response status:', error.response.status);
                console.error('Response data:', error.response.data);
            }
            throw error;
        }
    }    


    getPostmanCollection()
        .then(async (collection) => {  // Note the async keyword here           

            const endpoints = await parsePostmanJSON(collection.collection, user, null, null, null);

            const newScan = new ActiveScan({
                status: 'in progress',
                user:user
            });

            await newScan.save();


            // Run the scan immediately
            const theScan = await runActiveScan(user, null, endpoints, newScan._id);
            res.status(200).json({ scanResult: theScan });
        })
        .catch(error => {
            console.error('Failed to retrieve collection:', error);
        });



});


// Run scan from Jenkins
module.exports.sendCollectionURLToScan = asyncHandler(async (req, res) => {


    const { collectionUrl, apisecurityengineClientId, apisecurityengineClientSecret } = req.body;

    const organization = await Organization.findOne({ clientId: apisecurityengineClientId, clientSecret: apisecurityengineClientSecret })

    //console.log('organization:',organization)
    const user = await User.findById(organization.primaryUser).populate('organization')    

    let theVersion = '';

    let theCollection;

    let endpoints = [];

    if (collectionUrl !== '') {

        const result = await fetchAndCheckContentType(collectionUrl);

        console.log('result:',result)

        if (result.contentType == 'application/yaml') {

            const collectionFile = result.content;
            const collectionData = collectionFile;

            if (collectionData.swagger) {
                
                endpoints = await parseSwaggerYAML(collectionData, user, null, theCollection, theVersion);

                

            } else if (collectionData.info && collectionData.info._postman_id) {               


                endpoints = await parsePostmanYAML(collectionData, user, null, theCollection, theVersion);

               
            } else if (collectionData.openapi) {              


                endpoints = await parseOpenAPIYAML(collectionData, user, null, theCollection, theVersion);               
            }



        } else if (result.contentType == 'application/json') {


            var collectionJson = result.content;

            const variables = extractVariablesFromJSON(JSON.stringify(collectionJson));

            console.log('variables:',variables)

            collectionJson = replaceVariablesInJSON(JSON.stringify(collectionJson), variables);

            console.log('collectionJson:',collectionJson)

            // console.log('collectionJson:',collectionJson)
            const collection = new Collection(JSON.parse(collectionJson));

            console.log('collection:',collection)

            const collectiondata = JSON.parse(collectionJson);

            if (collection && collectiondata.info._postman_id && collectiondata.item && Array.isArray(collectiondata.item)) {              


                endpoints = await parsePostmanJSON(collectiondata, user, null, theCollection, theVersion);
                

            } else if (collection && (collectiondata.swagger)) {               


                endpoints = await parseSwaggerJSON(collectiondata, user, null, theCollection, theVersion);

                
            } else if (collection && (collectiondata.openapi)) {

                endpoints = await parseOpenAPIJSON(collectiondata, user, null, theCollection, theVersion);

            }


        } else {

            res.send({ error: "The URL does not contain a valid Postman/Swagger collection2" });
        }

    }

    //console.log('endpoints:',endpoints);
   
    const newScan = new ActiveScan({
                status: 'in progress',
                user:user
    });

    await newScan.save();


    // Run the scan immediately
    const theScan = await runActiveScan(user, null, endpoints, newScan._id);

    const scan = await ActiveScan.findById(theScan._id).lean()
    const vulns = await ActiveScanVulnerability.find({activeScan:theScan._id});

    scan.vulns = vulns;

    res.status(200).json({ scanResult: convertScanResultToHTML(scan) });       


});

function convertScanResultToHTML(scanResult) {
    const vulns = scanResult.vulns || [];
    
    let html = `
      <h1>Scan Result</h1>
      <table>
        <tr><th>ID</th><td>${scanResult._id}</td></tr>
        <tr><th>Status</th><td>${scanResult.status}</td></tr>
        <tr><th>Started At</th><td>${new Date(scanResult.createdAt).toLocaleString()}</td></tr>
        <tr><th>Vulnerability Count</th><td>${scanResult.vulnCount}</td></tr>
        <tr><th>Completed At</th><td>${new Date(scanResult.scanCompletedAt).toLocaleString()}</td></tr>
      </table>
  
      <h2>Vulnerabilities</h2>
      <table border="1">
        <thead>
          <tr>
            <th>ID</th>
            <th>Description</th>
            <th>Severity</th>
            <th>Priority</th>
            <th>Findings</th>
            <th>Created At</th>
          </tr>
        </thead>
        <tbody>
          ${vulns.map(vuln => `
            <tr>
              <td>${vuln._id}</td>
              <td>${vuln.description}</td>
              <td>${vuln.severity}</td>
              <td>${vuln.priority}</td>
              <td>${vuln.findings.join(', ')}</td>
              <td>${new Date(vuln.createdAt).toLocaleString()}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
  
      <h3>Remediation</h3>
      ${vulns.length > 0 ? vulns[0].remediation : 'No remediation information available.'}
    `;
  
    // Remove all newline characters and extra spaces
    return html.replace(/\s+/g, ' ').trim();
  }

// Parse Postman JSON
const parsePostmanJSON = async (collectiondata, user, collectionFilePath, theCollection, version) => {

    //if (collectiondata.info._postman_id && collectiondata.item && Array.isArray(collectiondata.item)) {
    if (collectiondata.info && collectiondata.item && Array.isArray(collectiondata.item)) {


        // Function to recursively process items
        const processItems = async (items) => {

            const endpoints = [];

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
                            //theCollectionVersion: theCollectionVersion._id,
                            //user: user,
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
                        endpoints.push(data)
                        //}

                    } else if (typeof item.request.url === 'object' && item.request.url !== null) {

                        const rawUrl = item.request.url.raw;

                        if (rawUrl && typeof rawUrl === 'string' && rawUrl !== "") {

                            // Case 2: If "raw" URL exists, use it directly
                            data = new ApiEndpoint({
                                //theCollectionVersion: theCollectionVersion._id,
                                //user: user,
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
                            endpoints.push(data)

                        } else if (Array.isArray(item.request.url.host) && Array.isArray(item.request.url.path)) { // if host and path are arrays

                            // Case 3: If "protocol" is not present but "host" and "path" exist, generate URL
                            const generatedUrl = `${item.request.url.protocol}://${Array.isArray(item.request.url.host) ? item.request.url.host.join('.') : item.request.url.host}/${Array.isArray(item.request.url.path) ? item.request.url.path.join('/') : item.request.url.path}`;


                            data = new ApiEndpoint({
                                
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
                            endpoints.push(data)
                            // }

                        } else if (!Array.isArray(item.request.url.host) && Array.isArray(item.request.url.path)) { // path is array but host is string

                            const host = typeof item.request.url.host === 'string' ? item.request.url.host : (Array.isArray(item.request.url.host) ? item.request.url.host.join('.') : '');
                            const path = Array.isArray(item.request.url.path) ? item.request.url.path.join('/') : item.request.url.path;

                            const generatedUrl = `${item.request.url.protocol}://${host}/${path}`;

                            data = new ApiEndpoint({
                                
                                url: generatedUrl,
                                name: item.name,
                                method: item.request.method,
                                queryParams: item.request.url.query,
                                headers: item.request.header,
                                requestBody: item.request.body,
                                authorization: authorizationObject
                            });

                            await data.save();
                            endpoints.push(data)
                            


                        } else if (Array.isArray(item.request.url.host) && !Array.isArray(item.request.url.path)) { // host is array but path is string

                            const host = Array.isArray(item.request.url.host) ? item.request.url.host.join('.') : item.request.url.host;
                            const path = typeof item.request.url.path === 'string' ? item.request.url.path : (Array.isArray(item.request.url.path) ? item.request.url.path.join('/') : '');

                            const generatedUrl = `${item.request.url.protocol}://${host}/${path}`;


                            data = new ApiEndpoint({
                                
                                url: generatedUrl,
                                name: item.name,
                                method: item.request.method,
                                queryParams: item.request.url.query,
                                headers: item.request.header,
                                requestBody: item.request.body,
                                authorization: authorizationObject
                            });

                            await data.save();
                            endpoints.push(data)
                            

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
                }
            }

            return endpoints;
        };

        const endpoints1 = await processItems(collectiondata.item);

        
        return endpoints1;
    } else {
        return { message: 'Not a valid PostMan Collection' };
    }
};


async function runActiveScan(user, theCollectionVersion, endpoints, scanId) {


    try {

        const theActiveScan = await ActiveScan.findById(scanId);        

        const organization = await Organization.findById(user.organization);        

        const theEndpoints = await ApiEndpoint.find({ _id: { $in: endpoints } });

        var theVulns = [];

        // 1. Test for ENDPOINT NOT SECURED BY SSL
        try {


            console.log('Test for ENDPOINT NOT SECURED BY SSL:')
            // This check will happen only on unique hosts found across all endpoints

            // Extract unique hosts
            var uniqueHosts = [];

            for (var i = 0; i < theEndpoints.length; i++) {
                var url = new URL(theEndpoints[i].url);
                var host = url.host;

                if (!uniqueHosts.includes(host)) {
                    uniqueHosts.push(host);
                }
            }


            var findings = await endpointNotSecuredBySSLCheck(theActiveScan._id, uniqueHosts.join(','));

            var hostsResults = [];

            for (var i = 0; i < findings.server_scan_results.length; i++) {

                var serverScanResult = findings.server_scan_results[i];

                var hostsResult = {};

                var host = serverScanResult.server_location.hostname;

                if (!(host.includes('localhost') || (host.includes('127.0')))) {

                    hostsResult.host = host;

                    if (serverScanResult.scan_result) {

                        var ssl20CipherSuites = serverScanResult.scan_result.ssl_2_0_cipher_suites;
                        var ssl30CipherSuites = serverScanResult.scan_result.ssl_3_0_cipher_suites;
                        var tls10CipherSuites = serverScanResult.scan_result.tls_1_0_cipher_suites;
                        var tls11CipherSuites = serverScanResult.scan_result.tls_1_1_cipher_suites;
                        var tls12CipherSuites = serverScanResult.scan_result.tls_1_2_cipher_suites;
                        var tls13CipherSuites = serverScanResult.scan_result.tls_1_3_cipher_suites;
                        var tlsCompression = serverScanResult.scan_result.tls_compression;
                        var tls13EarlyData = serverScanResult.scan_result.tls_1_3_early_data;
                        var openSSLCCSInjection = serverScanResult.scan_result.openssl_ccs_injection;
                        var tlsFallbackSCSV = serverScanResult.scan_result.tls_fallback_scsv;
                        var heartbleed = serverScanResult.scan_result.heartbleed;
                        var sessionRenegotiation = serverScanResult.scan_result.session_renegotiation;
                        var sessionResumption = serverScanResult.scan_result.session_resumption;
                        var ellipticCurves = serverScanResult.scan_result.elliptic_curves;


                        var cipherSuitesIssues = await checkCipherSuitesVulnerabilities(ssl20CipherSuites,
                            ssl30CipherSuites, tls10CipherSuites, tls11CipherSuites, tls12CipherSuites, tls13CipherSuites); // cipher suites check
                        var tlsCompressionIssues = await gettlsCompressionIssue(tlsCompression); // Crime check
                        var tls13EarlyDataIssues = await gettls13EarlyDataIssue(tls13EarlyData); // TLS 1.3 eary data check
                        var openSSLCCSInjectionIssues = await getopenSSLCCSInjectionIssue(openSSLCCSInjection); //OpenSSL CCS Injection check
                        var tlsFallbackSCSVIssues = await gettlsFallbackSCSVIssue(tlsFallbackSCSV); // Downgrade prevention check
                        var heartbleedIssues = await getheartbleedIssue(heartbleed); //Heartbleed check
                        var sessionRenegotiationIssues = await getsessionRenegotiationIssue(sessionRenegotiation); // Insecure renegotiation check
                        var sessionResumptionIssues = await getsessionResumptionIssue(sessionResumption); // Session resumption support check
                        var ellipticCurvesIssues = await getellipticCurvesIssue(ellipticCurves); // Supported weak elliptic curve

                        console.log(cipherSuitesIssues, tlsCompressionIssues, tls13EarlyDataIssues, openSSLCCSInjectionIssues,
                            tlsFallbackSCSVIssues, heartbleedIssues, sessionRenegotiationIssues, sessionResumptionIssues, ellipticCurvesIssues)

                        if (cipherSuitesIssues) {
                            hostsResult.cipherSuitesIssues = true;
                        }

                        if (tlsCompressionIssues) {
                            hostsResult.crimeIssue = true;
                        }

                        if (tls13EarlyDataIssues) {
                            hostsResult.tls13EarlyCheckIssue = true;
                        }

                        if (openSSLCCSInjectionIssues) {
                            hostsResult.openSSLCCSInjectionIssues = true;
                        }

                        if (tlsFallbackSCSVIssues) {
                            hostsResult.downgradePreventionIssue = true;
                        }

                        if (heartbleedIssues) {
                            hostsResult.heartbleedIssues = true;
                        }

                        if (sessionRenegotiationIssues) {
                            hostsResult.insecureNegotiationIssue = true;
                        }

                        if (sessionResumptionIssues) {
                            hostsResult.sessionResumptionIssues = true;
                        }

                        if (ellipticCurvesIssues) {
                            hostsResult.ellipticCurvesIssues = true;
                        }


                    } else {
                        hostsResult.certificateMissing = true;
                    }

                    hostsResults.push(hostsResult);

                }
            }




            if (hostsResults) {

                for (var i = 0; i < theEndpoints.length; i++) {

                    // Initialize the findings array
                    let findings = [];

                    let additionalCWEs = [];

                    // Find matching records from the JSON array
                    const matchingHosts = hostsResults.filter(hostResult => theEndpoints[i].url.includes(hostResult.host));


                    // Only proceed if there are matching hosts
                    if (matchingHosts.length > 0) {

                        // Check for SSL-related issues from hostsResults
                        const hostResult = hostsResults.find(hostResult => theEndpoints[i].url.includes(hostResult.host));

                        if (hostResult) {

                            var remediation = '';

                            if (hostResult.certificateMissing) {

                                findings.push({ description: 'SSL Certificate not installed', exploitability: '' });
                            }

                            if (hostResult.cipherSuitesIssues) {


                                var description = 'The vulnerability arises when an endpoint is not secured with SSL, specifically when it fails to implement strong encryption standards or secure cipher suites. This leaves the data transmitted between the client and server susceptible to interception and eavesdropping.';

                                var exploitability = 'Attackers can exploit this vulnerability by performing man-in-the-middle (MITM) attacks, intercepting, and potentially altering the communication, which can lead to data breaches and unauthorized access to sensitive information.';

                                findings.push({ description, exploitability });


                                additionalCWEs.push('CWE-259: Use of a Hardcoded Password')
                                additionalCWEs.push('CWE-327: Broken or Risky Cryptographic Algorithm')

                                remediation = remediation + '<br/><br/>' + (getObjectByIndex(1)).remediation;


                            }

                            if (hostResult.crimeIssue) {

                                var description = 'The ""Endpoint Not Secured by SSL - CRIME"" vulnerability occurs when SSL/TLS is not properly implemented, leaving endpoints vulnerable to CRIME (Compression Ratio Info-leak Made Easy) attacks.';

                                var exploitability = 'Attackers can exploit this by manipulating cipher suites to compress and intercept data, potentially revealing sensitive information through side-channel attacks.'


                                findings.push({ description, exploitability });

                                additionalCWEs.push('CWE-295: Improper Access Control')
                                additionalCWEs.push('CWE-300: Insufficient Cryptographic Strength')
                                additionalCWEs.push('CWE-758: Use of a Broken or Risky Cryptographic Algorithm')

                                remediation = remediation + '<br/><br/>' + (getObjectByIndex(7)).remediation;
                            }

                            if (hostResult.tls13EarlyCheckIssue) {

                                var description = 'The vulnerability ""Endpoint Not Secured by SSL - TLS 1.3 Early Data"" refers to endpoints using the TLS 1.3 early data feature without proper security measures, risking exposure of sensitive data during the handshake process.';

                                var exploitability = 'Attackers can exploit this by intercepting or replaying the early data before the encryption keys are fully established, particularly in weak cipher suites, leading to potential data breaches and unauthorized access.';
                                findings.push({ description, exploitability });

                                additionalCWEs.push('CWE-319: Cleartext Transmission of Sensitive Information')
                                additionalCWEs.push('CWE-352: Cross-Site Request Forgery (CSRF)')
                                additionalCWEs.push('CWE-294: Authentication Bypass by Capture-replay')

                                remediation = remediation + '<br/><br/>' + (getObjectByIndex(11)).remediation;
                            }

                            if (hostResult.openSSLCCSInjectionIssues) {

                                var description = 'The vulnerability ""EndPoint Not Secured by SSL - OpenSSL CCS Injection"" involves the improper handling of the ChangeCipherSpec (CCS) protocol in OpenSSL, allowing an attacker to intercept or manipulate encrypted data.';

                                var exploitability = 'This flaw can be exploited if the endpoint uses vulnerable versions of OpenSSL with certain cipher suites, enabling attackers to perform man-in-the-middle attacks and decrypt sensitive information.';

                                findings.push({ description, exploitability });

                                additionalCWEs.push('CWE-295: Improper Access Control')
                                additionalCWEs.push('CWE-894: Improper Control of TLS Communication')

                                remediation = remediation + '<br/><br/>' + (getObjectByIndex(6)).remediation;
                            }

                            if (hostResult.downgradePreventionIssue) {

                                var description = 'This vulnerability occurs when an endpoint is not secured by SSL, allowing attackers to force the use of weaker, insecure cipher suites by preventing the use of secure ones through downgrade attacks.';

                                var exploitability = 'Attackers can intercept and manipulate traffic, exploiting the vulnerability to decrypt or alter sensitive information, leading to data breaches and unauthorized access.';
                                findings.push({ description, exploitability });

                                additionalCWEs.push('CWE Reference: CWE-2001: Sensitive Information Disclosure')

                                remediation = remediation + '<br/><br/>' + (getObjectByIndex(10)).remediation;
                            }

                            if (hostResult.heartbleedIssues) {

                                var description = 'The vulnerability occurs when an endpoint is not secured by SSL, making it susceptible to the Heartbleed exploit, which allows attackers to read memory of the vulnerable system, potentially exposing sensitive data such as encryption keys and passwords.';

                                var exploitability = 'This vulnerability can be exploited in cipher suites where improper implementation of the SSL/TLS protocol exists, allowing attackers to exploit the Heartbleed bug to retrieve sensitive information directly from the memory of the affected systems.';

                                findings.push({ description, exploitability });

                                additionalCWEs.push('CWE-311: Improper Restriction of Operation within the Bounds of a Memory Buffer')
                                additionalCWEs.push('CWE-255: Improper Check for Certificate Revocation')

                                remediation = remediation + '<br/><br/>' + (getObjectByIndex(2)).remediation;
                            }

                            if (hostResult.insecureNegotiationIssue) {

                                var description = 'The vulnerability ""Endpoint Not Secured by SSL - Insecure Renegotiation"" occurs when a server endpoint uses SSL/TLS but does not secure renegotiation processes, making it susceptible to man-in-the-middle attacks.';

                                var exploitability = 'Attackers can exploit this vulnerability by intercepting and injecting data into the encrypted communication, potentially compromising the integrity and confidentiality of the data exchanged between the client and server.';
                                findings.push({ description, exploitability });

                                additionalCWEs.push('CWE-2001: Sensitive Information Not Protected')

                                remediation = remediation + '<br/><br/>' + (getObjectByIndex(9)).remediation;
                            }

                            if (hostResult.sessionResumptionIssues) {

                                var description = 'The endpoint lacks SSL protection, making it vulnerable to interception and man-in-the-middle attacks. Additionally, the support for session resumption in cipher suites can be exploited to hijack sessions and decrypt sensitive data.';

                                var exploitability = 'Attackers can exploit this vulnerability by intercepting unencrypted traffic and leveraging session resumption to gain unauthorized access to encrypted sessions, compromising data confidentiality and integrity.';
                                findings.push({ description, exploitability });

                                additionalCWEs.push('CWE-319: Cleartext Transmission of Sensitive Information')

                                remediation = remediation + '<br/><br/>' + (getObjectByIndex(8)).remediation;
                            }

                            if (hostResult.ellipticCurvesIssues) {

                                var description = 'The endpoint is not secured by SSL, indicating that the communication between the client and server is unencrypted and susceptible to interception. This vulnerability particularly involves the use of weak or unsupported elliptic curves in cipher suites, compromising the strength of the encryption.';

                                var exploitability = 'Attackers can exploit this by intercepting and manipulating the data transmitted, leading to potential data breaches and unauthorized access to sensitive information.';

                                findings.push({ description, exploitability });

                                additionalCWEs.push('CWE-326: Inadequate Encryption Strength')

                                remediation = remediation + '<br/><br/>' + (getObjectByIndex(3)).remediation;
                            }
                        }

                        

                        // Ensure findings array is not empty before creating the vulnerability
                        if (findings.length > 0) {

                            const vuln = await Vulnerability.findOne({ vulnerabilityCode: 4 });

                            var description = 'This host has SSL related problems';

                            const result = await getVulnSeverityAndPriority(4);
                            const severity = result ? result.severity : null;
                            const priority = result ? result.priority : null;

                            const theActiveScanVulnerability = await ActiveScanVulnerability.create({
                                activeScan: theActiveScan,
                                vulnerability: vuln,
                                endpoint: theEndpoints[i],
                                description: description,
                                sslFindings: findings,
                                additionalCWEs: additionalCWEs,
                                remediation: remediation,
                                severity: severity,
                                priority: priority
                            });

                            theVulns.push(theActiveScanVulnerability);
                            theEndpoints[i].vulnCount = (theEndpoints[i].vulnCount || 0) + 1;
                            await theEndpoints[i].save();
                        }
                    }
                }
            }

            theActiveScan.vulnCount = theVulns.length;
            await theActiveScan.save();

        } catch (error) {

            console.log('error:', error)
            console.log('execption occured in check for SSL issues')
        }


        try {

            // 2. Test for BASIC AUTHENTICATION DETECTED  
            console.log('Test for BASIC AUTHENTICATION DETECTED  ')
            for (var i = 0; i < theEndpoints.length; i++) {

               

                var result = await basicAuthenticationDetectedCheck(theEndpoints[i]);

                if (result.issueFound) {

                    const vuln = await Vulnerability.findOne({ vulnerabilityCode: 3 })

                    var description = 'This API has basic authentication on it. A stronger authentication method like Bearer token, is recommended.'

                    var remediation = (getObjectByIndex(20)).remediation;

                    const result = await getVulnSeverityAndPriority(3);
                    const severity = result ? result.severity : null;
                    const priority = result ? result.priority : null;

                    const theActiveScanVulnerability = await ActiveScanVulnerability.create({

                        activeScan: theActiveScan,
                        vulnerability: vuln,
                        endpoint: theEndpoints[i],
                        description: description,
                        remediation: remediation,
                        severity: severity,
                        priority: priority
                    });

                    theVulns.push(theActiveScanVulnerability);
                    theEndpoints[i].vulnCount = theEndpoints[i].vulnCount + 1;
                    theEndpoints[i].save();
                }

              

            }

            theActiveScan.vulnCount = theVulns.length;
            await theActiveScan.save();
        } catch (error) {
            console.log('execption occured in check for BASIC AUTHENTICATION DETECTED ')
        }




        try {

            // 3. Test for SENSITIVE DATA IN QUERY PARAMS
            console.log('Test for SENSITIVE DATA IN QUERY PARAMS ')
            for (var i = 0; i < theEndpoints.length; i++) {

                var result = await sensitiveDataInQueryParamsCheck(theEndpoints[i], organization._id);

                const anEndpoint = await ApiEndpoint.findById(theEndpoints[i]._id)

                if (result.issueFound && result.findings.length > 0) {
                    anEndpoint.piiFields = result.findings;
                    anEndpoint.save();
                }

                var piiArray = [];
                for (var p = 0; p < result.findings.length; p++) {
                    if (!piiArray.includes(result.findings[p])) {
                        piiArray.push(result.findings[p]);
                    }
                }

                var description = 'The query params of this API contain sensitive data.';

                if (result.issueFound && piiArray.length > 0) {

                    const vuln = await Vulnerability.findOne({ vulnerabilityCode: 6 })

                    var remediation = (getObjectByIndex(23)).remediation;

                    const result = await getVulnSeverityAndPriority(6);
                    const severity = result ? result.severity : null;
                    const priority = result ? result.priority : null;

                    const theActiveScanVulnerability = await ActiveScanVulnerability.create({

                        activeScan: theActiveScan,
                        vulnerability: vuln,
                        endpoint: theEndpoints[i],
                        description: description,
                        findings: piiArray,
                        remediation: remediation,
                        severity: severity,
                        priority: priority

                    });

                    theVulns.push(theActiveScanVulnerability);
                    theEndpoints[i].vulnCount = theEndpoints[i].vulnCount + 1;
                    theEndpoints[i].save();
                }
            }

            theActiveScan.vulnCount = theVulns.length;
            await theActiveScan.save();
        } catch (error) {
            console.log('execption occured in check for SENSITIVE DATA IN QUERY PARAMS')
        }



        try {

            // 2. Test for SENSITIVE DATA IN PATH PARAMS
            console.log('Test for SENSITIVE DATA IN PATH PARAMS ')
            for (var i = 0; i < theEndpoints.length; i++) {                


                var result = await sensitiveDataInPathParamsCheck(theEndpoints[i], organization._id);

                const anEndpoint = await ApiEndpoint.findById(theEndpoints[i]._id)

                if (result.issueFound && result.findings.length > 0) {
                    anEndpoint.piiFields = result.findings;
                    anEndpoint.save();
                }

                var piiArray = [];
                for (var p = 0; p < result.findings.length; p++) {
                    if (!piiArray.includes(result.findings[p])) {
                        piiArray.push(result.findings[p]);
                    }
                }

                var description = 'The path params of this API contain sensitive data.';

                if (result.issueFound && piiArray.length > 0) {

                    const vuln = await Vulnerability.findOne({ vulnerabilityCode: 2 })

                    var remediation = (getObjectByIndex(24)).remediation;

                    const result = await getVulnSeverityAndPriority(2);
                    const severity = result ? result.severity : null;
                    const priority = result ? result.priority : null;

                    const theActiveScanVulnerability = await ActiveScanVulnerability.create({

                        activeScan: theActiveScan,
                        vulnerability: vuln,
                        //projectName: projectName,
                        endpoint: theEndpoints[i],
                        description: description,
                        findings: piiArray,
                        remediation: remediation,
                        severity: severity,
                        priority: priority
                    });

                    theVulns.push(theActiveScanVulnerability);
                    theEndpoints[i].vulnCount = theEndpoints[i].vulnCount + 1;
                    theEndpoints[i].save();
                }
            }

            theActiveScan.vulnCount = theVulns.length;
            await theActiveScan.save();
        } catch (error) {
            console.log('execption occured in check for SENSITIVE DATA IN PATH PARAMS')
        }




        // 4. Test for LACK OF RESOURCES AND RATE LIMITING    
        console.log('Test for LACK OF RESOURCES AND RATE LIMITING  ')
        for (var i = 0; i < theEndpoints.length; i++) {

            //console.log('fifth loop')
/*
            try {

                // var isRateLimitingNotApplied = await runTestForLackOfResourcesAndRateLimiting(theEndpoints[i])

                var result = await lackOfResourcesAndRateLimitingCheck(theEndpoints[i]);

                if (result.issueFound) {

                    var description = 'There is no rate limiting applied to this endpoint. This may result into Brute Force and DoS attacks.';

                    const vuln = await Vulnerability.findOne({ vulnerabilityCode: 18 })

                    var remediation = (getObjectByIndex(34)).remediation;

                    const result = await getVulnSeverityAndPriority(18);
                    const severity = result ? result.severity : null;
                    const priority = result ? result.priority : null;


                    const theActiveScanVulnerability = await ActiveScanVulnerability.create({

                        activeScan: theActiveScan,
                        vulnerability: vuln,
                        //projectName: projectName,
                        endpoint: theEndpoints[i],
                        description: description,
                        remediation: remediation,
                        severity: severity,
                        priority: priority
                    });

                    theVulns.push(theActiveScanVulnerability);
                    theEndpoints[i].vulnCount = theEndpoints[i].vulnCount + 1;
                    theEndpoints[i].save();
                }

                theActiveScan.vulnCount = theVulns.length;
                await theActiveScan.save();

            } catch (error) {
                console.log('execption occured in check for LACK OF RESOURCES AND RATE LIMITING');
                continue;
            } */
        }




        // 4. Test for HTTP VERB TAMPERING POSSIBLE    
        console.log('Test for HTTP VERB TAMPERING POSSIBLE    ')
        try {
            for (var i = 0; i < theEndpoints.length; i++) {
              

                var result = await httpVerbTamperingPossibleCheck(theEndpoints[i]);


                if (result.issueFound) {

                    const vuln = await Vulnerability.findOne({ vulnerabilityCode: 8 })

                    try {

                        var remediation = (getObjectByIndex(26)).remediation;

                        const result1 = await getVulnSeverityAndPriority(8);
                        const severity = result1 ? result1.severity : null;
                        const priority = result1 ? result1.priority : null;

                        const theActiveScanVulnerability = await ActiveScanVulnerability.create({
                            activeScan: theActiveScan,
                            vulnerability: vuln,
                            endpoint: theEndpoints[i],
                            description: result.description,
                            findings: result.findings,
                            remediation: remediation,
                            severity: severity,
                            priority: priority
                        });

                        theVulns.push(theActiveScanVulnerability);
                        theEndpoints[i].vulnCount = theEndpoints[i].vulnCount + 1;
                        await theEndpoints[i].save();
                    } catch (createError) {
                        console.log('Error creating ActiveScanVulnerability:', createError);
                        continue;
                    }
                }
            }

            theActiveScan.vulnCount = theVulns.length;
            await theActiveScan.save();
        } catch (error) {
            console.log('Exception occurred in check for HTTP VERB TAMPERING POSSIBLE:', error);
            // Handle the error condition here, log the error, and continue or take appropriate actions.
        }





        // 4. Test for SECURITY HEADERS NOT ENABLED ON HOST
        console.log('Test for SECURITY HEADERS NOT ENABLED ON HOST  ')
        try {

            // This check will happen only on unique hosts found across all endpoints

            // Extract unique hosts
            var uniqueHosts = [];

            for (var i = 0; i < theEndpoints.length; i++) {
                var url = new URL(theEndpoints[i].url);
                var host = url.host;

                if (!uniqueHosts.includes(host)) {
                    uniqueHosts.push(host);
                }
            }


            var findingsArray = await securityHeadersNotEnabledOnHostCheck(theActiveScan._id, uniqueHosts.join(','));



            if (findingsArray) {

                for (var i = 0; i < theEndpoints.length; i++) {

                    // Initialize the findings array
                    let findings = [];

                    // Find matching records from the JSON array
                    const matchingFindings = findingsArray.filter(finding => theEndpoints[i].url.startsWith(new URL(finding.url).origin));

                    // Only proceed if there are matching findings
                    if (matchingFindings.length > 0) {
                        // Populate the findings array with appropriate strings
                        matchingFindings.forEach(finding => {
                            if (finding.severity !== "NONE" && finding.severity !== "ERROR") {
                                findings.push(finding.header + ':' + finding.description);
                            }
                        });

                        // Ensure findings array is not empty before creating the vulnerability
                        if (findings.length > 0) {

                            console.log('findingsSecurityHeaders:', findings)
                            const vuln = await Vulnerability.findOne({ vulnerabilityCode: 10 });

                            var description = 'Some security headers are not enabled on this host.';

                            var remediation = '';

                            var findingsString = JSON.stringify(findings);


                            if (findingsString.includes("content-security-policy")) {
                                remediation = remediation + '<br/><br>' + (getObjectByIndex(12)).remediation;
                            }

                            if (findingsString.includes("strict-transport-security")) {
                                remediation = remediation + '<br/><br>' + (getObjectByIndex(13)).remediation;
                            }

                            if (findingsString.includes("x-frame-options")) {
                                remediation = remediation + '<br/><br>' + (getObjectByIndex(14)).remediation;
                            }

                            if (findingsString.includes("x-content-type-options")) {
                                remediation = remediation + '<br/><br>' + (getObjectByIndex(15)).remediation;
                            }

                            if (findingsString.includes("x-xss-protection")) {
                                remediation = remediation + '<br/><br>' + (getObjectByIndex(16)).remediation;
                            }

                            if (findingsString.includes("cross-origin")) {
                                remediation = remediation + '<br/><br>' + (getObjectByIndex(17)).remediation;
                            }

                            if (findingsString.includes("referrer-policy")) {
                                remediation = remediation + '<br/><br>' + (getObjectByIndex(18)).remediation;
                            }

                            if (findingsString.includes("feature-policy")) {
                                remediation = remediation + '<br/><br>' + (getObjectByIndex(19)).remediation;
                            }


                            const result = await getVulnSeverityAndPriority(10);
                            const severity = result ? result.severity : null;
                            const priority = result ? result.priority : null;

                            const theActiveScanVulnerability = await ActiveScanVulnerability.create({
                                activeScan: theActiveScan,
                                vulnerability: vuln,
                                endpoint: theEndpoints[i],
                                description: description,
                                findings: findings,
                                remediation: remediation,
                                severity: severity,
                                priority: priority
                            });

                            theVulns.push(theActiveScanVulnerability);
                            theEndpoints[i].vulnCount = (theEndpoints[i].vulnCount || 0) + 1;
                            await theEndpoints[i].save();
                        }
                    }
                }

            }


            theActiveScan.vulnCount = theVulns.length;
            await theActiveScan.save();

        } catch (error) {

            console.log('error:', error)
            console.log('execption occured in check for SECURITY HEADERS NOT ENABLED ON HOST')
        }

        // Scan completion
        theActiveScan.scanCompletedAt = new Date();
        theActiveScan.status = 'completed';
        theActiveScan.vulnCount = theVulns.length;
        await theActiveScan.save();

        calculateDashboard(organization);

        return theActiveScan;

    } catch (error) {
        console.log('from', error)
    }
}







