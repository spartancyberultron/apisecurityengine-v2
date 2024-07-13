const asyncHandler = require('express-async-handler');
const path = require("path")
const fs = require("fs")
const fsextra = require('fs-extra');
const sharp = require('sharp');
const https = require('https');

const { User } = require('../models/user.model');
const Project = require("../models/project.model");

const { none } = require('../config/multerUpload');
const APICollection = require('../models/apicollection.model');
const Vulnerability = require('../models/vulnerability.model');
const ProjectVulnerability = require('../models/projectVulnerability.model');
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

//test comment
// Get all vulnerabilities of a project
module.exports.getProjectVulnerabilities = asyncHandler(async (req, res) => {

    const projectVulnerabilities = await ProjectVulnerability.find({
      project: req.query.projectId,
    }).populate('vulnerability');
  
    const project = await Project.findById(req.query.projectId);
  
    const result = {
      vulnerabilities: projectVulnerabilities,
      projectName: project.projectName,
      piiFields: project.piiFields,
    };
  
    res.status(200).json(result);
  });
  



// Receive request info from a mirrored API traffic
module.exports.sendRequestInfo = asyncHandler(async (req, res) => {


    // Fetch the body params
    const { api_key, the_request } = req.body;
    const { requestId, method, url, headers, body, query, timestamp, projectType, protocol, host } = the_request;

    // Fetch individual fields from the request object dynamically
    const requestBody = { ...body }; // Copy the body object
    const queryParameters = { ...query }; // Copy the query object


    // Trim the quotes around api_key, in case someone has inputted with quotes in their env file
    const trimmed_api_key = api_key.replace(/^['"](.*)['"]$/, '$1');
    const project = await Project.findOne({ projectIntegrationID: trimmed_api_key });
    project.projectType = projectType;
    await project.save();


    // Check for Sensitive Data in Query Params  
    var pIIData = await runTestForSensitiveDataInQueryParams(queryParameters)

    var piiArray = [];

    for (var p = 0; p < pIIData.length; p++) {

        if (!piiArray.includes(pIIData[p])) {
            piiArray.push(pIIData[p]);
        }
    }

    var description = 'The query params of this API contain sensitive data. The data classes found are as follows :: ' + piiArray.join(' ');

    if (pIIData.length > 0) {

        const vuln = await Vulnerability.findOne({ vulnerabilityCode: 6 })

        const theProjectVulnerability = await ProjectVulnerability.create({

            project: project,
            vulnerability: vuln,
            endpoint: url,
            description: description,
        });

        const uniquePiiFields = [];

        for (const piiField of pIIData) {

            if (!project.piiFields.includes(piiField)) {
                uniquePiiFields.push(piiField);
            }
        }

        project.piiFields.push(...uniquePiiFields);
        project.save();
        
    }
    // END - Check for Sensitive Data in Query Params  


    // Check for Sensitive Data in Path Params
    var pIIData = await runTestForSensitiveDataInPathParams(url)

    var piiArray = [];

    for (var p = 0; p < pIIData.length; p++) {
        if (!piiArray.includes(pIIData[p])) {
            piiArray.push(pIIData[p]);
        }
    }

    var description = 'The query params of this API contain sensitive data. The data classes found are as follows :: ' + piiArray.join(' ');

    if (pIIData.length > 0) {

        const vuln = await Vulnerability.findOne({ vulnerabilityCode: 6 })

        const theProjectVulnerability = await ProjectVulnerability.create({

            project: project,
            vulnerability: vuln,
            endpoint: url,
            description: description,
        });

        const uniquePiiFields = [];

        for (const piiField of pIIData) {

            if (!project.piiFields.includes(piiField)) {
                uniquePiiFields.push(piiField);
            }
        }

        project.piiFields.push(...uniquePiiFields);
        project.save();
    }
    // END - Check for Sensitive Data in Path Params



    // Check for Basic Authentication Detected
    var basicAuthFound = await runTestForBasicAuthenticationDetected(headers)

    if (basicAuthFound) {

        const vuln = await Vulnerability.findOne({ vulnerabilityCode: 3 })

        var description = 'This API has basic authentication on it. A stronger authentication method like Bearer token, is recommended.'

        const theProjectVulnerability = await ProjectVulnerability.create({

            project: project,
            vulnerability: vuln,
            endpoint: url,
            description: description,
        });

    }
    // END - Check for Basic Authentication Detected



    // Check for Endpoint Not Secured by SSL
    try {

        var sslIssues = await runTestForEndpointNotSecuredBySSL(protocol, host);

        if (sslIssues.length > 0) {

            const vuln = await Vulnerability.findOne({ vulnerabilityCode: 4 })

            var description = sslIssues.join('\n');

            const theProjectVulnerability = await ProjectVulnerability.create({

                project: project,
                vulnerability: vuln,
                endpoint: url,
                description: description,
            });

        }

    } catch (error) {
        console.log('execption occured in check for ENDPOINT NOT SECURED BY SSL');
    }
    // END - Check for Endpoint Not Secured by SSL



    // Check for HTTP Verb Tampering Possible
    var tamperableMethods = await runTestForHTTPVerbTamperingPossible(protocol, host, method);


    if (tamperableMethods.length > 0) {

        const vuln = await Vulnerability.findOne({ vulnerabilityCode: 8 })

        var description = 'The method on this endpoint can be tampered to any of the following:' + tamperableMethods.join(',');

        const theProjectVulnerability = await ProjectVulnerability.create({

            project: project,
            vulnerability: vuln,
            endpoint: url,
            description: description,
        });

    }
    // END - Check for HTTP Verb Tampering Possible




    // Check for Security Headers not Enabled in Host
    var missingHeaders = await runTestForSecurityHeadersNotEnabledOnHost(protocol, host);

    if (missingHeaders.length > 0) {

        const vuln = await Vulnerability.findOne({ vulnerabilityCode: 10 })

        var description = 'The following security headers are not enabled on the host:' + missingHeaders.join(',');

        const theProjectVulnerability = await ProjectVulnerability.create({

            project: project,
            vulnerability: vuln,
            endpoint: url,
            description: description,
        });
    }

    // END - Check for HTTP Verb Tampering Possible


    // Return the active scans, currentPage, totalRecords, and totalPages in the response
    res.status(200).json({
        status: 'received',
    });

});


// Receive response info from a mirrrored API traffic
module.exports.sendResponseInfo = asyncHandler(async (req, res) => {



    // Return the active scans, currentPage, totalRecords, and totalPages in the response
    res.status(200).json({
        status: 'received',
    });
});


// Check for SENSITIVE DATA IN QUERY PARAMS
const runTestForSensitiveDataInQueryParams = async (queryParams) => {

    var pIIData = [];

    for (const key in queryParams) {

        const theKey = key.toLowerCase();

        if (theKey.includes('name')
            || theKey.includes('first_name')
            || theKey.includes('last_name')
            || theKey.includes('full_name')
            || theKey.includes('firstname')
            || theKey.includes('lastname')
            || theKey.includes('fullname')
            || theKey.includes('first-name')
            || theKey.includes('last-name')
            || theKey.includes('full-name')
            || theKey.includes('firstName')
            || theKey.includes('lastname')
            || theKey.includes('fullName')) {

            pIIData.push("Name");
        }

        if (theKey.includes('address')
            || theKey.includes('address_line_1')
            || theKey.includes('address_line_2')
            || theKey.includes('city')
            || theKey.includes('pincode')
            || theKey.includes('zip')
            || theKey.includes('postal')
            || theKey.includes('state')
            || theKey.includes('country')
            || theKey.includes('house_number')
            || theKey.includes('house_no')
            || theKey.includes('house-number')
            || theKey.includes('house-no')) {

            pIIData.push("Address");
        }

        if (theKey.includes('phone')) {
            pIIData.push("Phone Number")
        }

        if (theKey.includes('ip')
            || theKey.includes('ip_address')
            || theKey.includes('ip-address')
            || theKey.includes('ipaddress')
            || theKey.includes('internet protocol')) {

            pIIData.push("Internet Protocol (IP)");
        }

        if (theKey.includes('media_access_control')
            || theKey.includes('mac')
            || theKey.includes('media-access-control')
        ) {

            pIIData.push("Media Access Control (MAC)");
        }

        if (theKey.includes('social_security_number')
            || theKey.includes('ssn')
            || theKey.includes('social-security-number')
            || theKey.includes('socialsecuritynumber')
        ) {

            pIIData.push("Social Security Number (SSN)");
        }

        if (theKey.includes('passport_number')
            || theKey.includes('passportnumber')
            || theKey.includes('passport-number')
        ) {

            pIIData.push("Passport Number");
        }

        if (theKey.includes('driving_license_number')
            || theKey.includes('drivinglicensenumber')
            || theKey.includes('driving-license-number')
        ) {

            pIIData.push("Driving License Number")
        }

        if (theKey.includes('bank_account_number')
            || theKey.includes('bankaccountnumber')
            || theKey.includes('bank-account-number')
        ) {

            pIIData.push("Bank Account Number")
        }

        if (theKey.includes('credit_card_number')
            || theKey.includes('creditcardnumber')
            || theKey.includes('credit-card-number')
            || theKey.includes('debitcardnumber')
            || theKey.includes('debit-card-number')
            || theKey.includes('debit_card_number')
        ) {

            pIIData.push("Credit/Debit Card Number")
        }

        if (theKey.includes('pan_number')
            || theKey.includes('pannumber')
            || theKey.includes('pan-number')
            || theKey.includes('pancardnumber')
            || theKey.includes('pan-card-number')
            || theKey.includes('pan_card_number')
        ) {

            pIIData.push("PAN Number")
        }

        if (theKey.includes('aadhaar_number')
            || theKey.includes('aadhaarnumber')
            || theKey.includes('aadhaar-number')
            || theKey.includes('aadhaarcardnumber')
            || theKey.includes('aadhaar-card-number')
            || theKey.includes('aadhaar_card_number')
        ) {

            pIIData.push("Aadhaar Number")
        }

        if (theKey.includes('voter_id')
            || theKey.includes('voterid')
            || theKey.includes('voter-id')
        ) {

            pIIData.push("Voter ID Number")
        }

        if (theKey.includes('vehicle_registration_number')
            || theKey.includes('vehicle-registration-number')
            || theKey.includes('vehicleregistrationnumber')
        ) {

            pIIData.push("Vehicle Registration Number")
        }

        if (theKey.includes('date_of_birth')
            || theKey.includes('date-of-birth')
            || theKey.includes('dateofbirth')
            || theKey.includes('dob')
        ) {

            pIIData.push("Date of Birth")
        }

        if (theKey.includes('place_of_birth')
            || theKey.includes('place-of-birth')
            || theKey.includes('placeofbirth')
            || theKey.includes('pob')
        ) {

            pIIData.push("Place of Birth")
        }

        if (theKey.includes('race')

        ) {

            pIIData.push("Race")
        }

        if (theKey.includes('religion')
        ) {

            pIIData.push("Religion")
        }

        if (theKey.includes('weight')
        ) {

            pIIData.push("Weight")
        }

        if (theKey.includes('height')
        ) {

            pIIData.push("Height")
        }

        if (theKey.includes('latitude')
        ) {

            pIIData.push("Latitude")
        }

        if (theKey.includes('longitude')
        ) {

            pIIData.push("Longitude")
        }

        if (theKey.includes('employee_id') || theKey.includes('employeeid') || theKey.includes('employee-id')
        ) {

            pIIData.push("Employee ID")
        }

        if (theKey.includes('bmi') || theKey.includes('body-mass-index') || theKey.includes('body_mass_index')
        ) {

            pIIData.push("BMI")
        }

        if (theKey.includes('heartrate') || theKey.includes('heart-rate') || theKey.includes('heart_rate')
        ) {

            pIIData.push("Heart Rate")
        }

        if (theKey.includes('bloodpressure') || theKey.includes('blood-pressure') || theKey.includes('blood_pressure')
        ) {

            pIIData.push("Blood Pressure")
        }

        if (theKey.includes('fathername') || theKey.includes('father-name') || theKey.includes('father_name')
        ) {

            pIIData.push("Father Name")
        }

        if (theKey.includes('mothername') || theKey.includes('mother-name') || theKey.includes('mother_name')
        ) {

            pIIData.push("Mother Name")
        }

        if (theKey.includes('brothername') || theKey.includes('brother-name') || theKey.includes('brother_name')
        ) {

            pIIData.push("Brother Name")
        }

        if (theKey.includes('sistername') || theKey.includes('sister-name') || theKey.includes('sister_name')
        ) {

            pIIData.push("Sister Name")
        }

        if (theKey.includes('daughtername') || theKey.includes('daughter-name') || theKey.includes('daughter_name')
        ) {

            pIIData.push("Daugther Name")
        }

        if (theKey.includes('sonname') || theKey.includes('son-name') || theKey.includes('son_name')
        ) {

            pIIData.push("Son Name")
        }

        if (theKey.includes('orderid') || theKey.includes('order-id') || theKey.includes('order_id')
        ) {

            pIIData.push("Order ID")
        }

        if (theKey.includes('transactionid') || theKey.includes('transaction-id') || theKey.includes('transaction_id')
        ) {

            pIIData.push("Transaction ID")
        }

        if (theKey.includes('cookiedata') || theKey.includes('cookie-data') || theKey.includes('cookie_data')
        ) {

            pIIData.push("Cookie Data")
        }
    }

    return pIIData;

};



// Check for SENSITIVE DATA IN PATH PARAMS
const runTestForSensitiveDataInPathParams = async (endpoint) => {

    const pIIData = [];

    const processPathParam = (param, parentKey = '') => {

        const theKey = parentKey ? `${parentKey}.${param.key}` : param.key.toLowerCase();

        if (
            theKey.includes('name') ||
            theKey.includes('first_name') ||
            theKey.includes('last_name') ||
            theKey.includes('full_name') ||
            theKey.includes('firstname') ||
            theKey.includes('lastname') ||
            theKey.includes('fullname') ||
            theKey.includes('first-name') ||
            theKey.includes('last-name') ||
            theKey.includes('full-name') ||
            theKey.includes('firstName') ||
            theKey.includes('lastname') ||
            theKey.includes('fullName')
        ) {
            pIIData.push('Name');
        }

        if (
            theKey.includes('address') ||
            theKey.includes('address_line_1') ||
            theKey.includes('address_line_2') ||
            theKey.includes('city') ||
            theKey.includes('pincode') ||
            theKey.includes('zip') ||
            theKey.includes('postal') ||
            theKey.includes('state') ||
            theKey.includes('country') ||
            theKey.includes('house_number') ||
            theKey.includes('house_no') ||
            theKey.includes('house-number') ||
            theKey.includes('house-no')
        ) {
            pIIData.push('Address');
        }

        if (theKey.includes('phone')) {
            pIIData.push("Phone Number")
        }

        if (theKey.includes('ip')
            || theKey.includes('ip_address')
            || theKey.includes('ip-address')
            || theKey.includes('ipaddress')
            || theKey.includes('internet protocol')) {

            pIIData.push("Internet Protocol (IP)");
        }

        if (theKey.includes('media_access_control')
            || theKey.includes('mac')
            || theKey.includes('media-access-control')
        ) {

            pIIData.push("Media Access Control (MAC)");
        }

        if (theKey.includes('social_security_number')
            || theKey.includes('ssn')
            || theKey.includes('social-security-number')
            || theKey.includes('socialsecuritynumber')
        ) {

            pIIData.push("Social Security Number (SSN)");
        }

        if (theKey.includes('passport_number')
            || theKey.includes('passportnumber')
            || theKey.includes('passport-number')
        ) {

            pIIData.push("Passport Number");
        }

        if (theKey.includes('driving_license_number')
            || theKey.includes('drivinglicensenumber')
            || theKey.includes('driving-license-number')
        ) {

            pIIData.push("Driving License Number")
        }

        if (theKey.includes('bank_account_number')
            || theKey.includes('bankaccountnumber')
            || theKey.includes('bank-account-number')
        ) {

            pIIData.push("Bank Account Number")
        }

        if (theKey.includes('credit_card_number')
            || theKey.includes('creditcardnumber')
            || theKey.includes('credit-card-number')
            || theKey.includes('debitcardnumber')
            || theKey.includes('debit-card-number')
            || theKey.includes('debit_card_number')
        ) {

            pIIData.push("Credit/Debit Card Number")
        }

        if (theKey.includes('pan_number')
            || theKey.includes('pannumber')
            || theKey.includes('pan-number')
            || theKey.includes('pancardnumber')
            || theKey.includes('pan-card-number')
            || theKey.includes('pan_card_number')
        ) {

            pIIData.push("PAN Number")
        }

        if (theKey.includes('aadhaar_number')
            || theKey.includes('aadhaarnumber')
            || theKey.includes('aadhaar-number')
            || theKey.includes('aadhaarcardnumber')
            || theKey.includes('aadhaar-card-number')
            || theKey.includes('aadhaar_card_number')
        ) {

            pIIData.push("Aadhaar Number")
        }

        if (theKey.includes('voter_id')
            || theKey.includes('voterid')
            || theKey.includes('voter-id')
        ) {

            pIIData.push("Voter ID Number")
        }

        if (theKey.includes('vehicle_registration_number')
            || theKey.includes('vehicle-registration-number')
            || theKey.includes('vehicleregistrationnumber')
        ) {

            pIIData.push("Vehicle Registration Number")
        }

        if (theKey.includes('date_of_birth')
            || theKey.includes('date-of-birth')
            || theKey.includes('dateofbirth')
            || theKey.includes('dob')
        ) {

            pIIData.push("Date of Birth")
        }

        if (theKey.includes('place_of_birth')
            || theKey.includes('place-of-birth')
            || theKey.includes('placeofbirth')
            || theKey.includes('pob')
        ) {

            pIIData.push("Place of Birth")
        }

        if (theKey.includes('race')

        ) {

            pIIData.push("Race")
        }

        if (theKey.includes('religion')
        ) {

            pIIData.push("Religion")
        }

        if (theKey.includes('weight')
        ) {

            pIIData.push("Weight")
        }

        if (theKey.includes('height')
        ) {

            pIIData.push("Height")
        }

        if (theKey.includes('latitude')
        ) {

            pIIData.push("Latitude")
        }

        if (theKey.includes('longitude')
        ) {

            pIIData.push("Longitude")
        }

        if (theKey.includes('employee_id') || theKey.includes('employeeid') || theKey.includes('employee-id')
        ) {

            pIIData.push("Employee ID")
        }

        if (theKey.includes('bmi') || theKey.includes('body-mass-index') || theKey.includes('body_mass_index')
        ) {

            pIIData.push("BMI")
        }

        if (theKey.includes('heartrate') || theKey.includes('heart-rate') || theKey.includes('heart_rate')
        ) {

            pIIData.push("Heart Rate")
        }

        if (theKey.includes('bloodpressure') || theKey.includes('blood-pressure') || theKey.includes('blood_pressure')
        ) {

            pIIData.push("Blood Pressure")
        }

        if (theKey.includes('fathername') || theKey.includes('father-name') || theKey.includes('father_name')
        ) {

            pIIData.push("Father Name")
        }

        if (theKey.includes('mothername') || theKey.includes('mother-name') || theKey.includes('mother_name')
        ) {

            pIIData.push("Mother Name")
        }

        if (theKey.includes('brothername') || theKey.includes('brother-name') || theKey.includes('brother_name')
        ) {

            pIIData.push("Brother Name")
        }

        if (theKey.includes('sistername') || theKey.includes('sister-name') || theKey.includes('sister_name')
        ) {

            pIIData.push("Sister Name")
        }

        if (theKey.includes('daughtername') || theKey.includes('daughter-name') || theKey.includes('daughter_name')
        ) {

            pIIData.push("Daugther Name")
        }

        if (theKey.includes('sonname') || theKey.includes('son-name') || theKey.includes('son_name')
        ) {

            pIIData.push("Son Name")
        }

        if (theKey.includes('orderid') || theKey.includes('order-id') || theKey.includes('order_id')
        ) {

            pIIData.push("Order ID")
        }

        if (theKey.includes('transactionid') || theKey.includes('transaction-id') || theKey.includes('transaction_id')
        ) {

            pIIData.push("Transaction ID")
        }

        if (theKey.includes('cookiedata') || theKey.includes('cookie-data') || theKey.includes('cookie_data')
        ) {

            pIIData.push("Cookie Data")
        }


    };

    const processPathParams = (params, parentKey = '') => {

        for (const param of params) {
            if (param.pathParams && param.pathParams.length > 0) {
                const newParentKey = parentKey ? `${parentKey}.${param.key}` : param.key;
                processPathParams(param.pathParams, newParentKey);
            } else {
                processPathParam(param, parentKey);
            }
        }
    };

    if (endpoint.pathParams && endpoint.pathParams.length > 0) {
        processPathParams(endpoint.pathParams);
    }

    return pIIData;
};




// Check for BASIC AUTHENTICATION DETECTED
const runTestForBasicAuthenticationDetected = async (headers) => {

    const headerEntries = Object.entries(headers);
    
    const authorizationHeader = headerEntries.find(([key, value]) =>
      key.toLowerCase() === 'authorization' && value.toLowerCase().startsWith('basic ')
    );
    
    if (authorizationHeader) {
      const [, authCredentials] = authorizationHeader;
      return !!authCredentials;
    }
    
    return false;
  };
  



// Check for ENDPOINT NOT SECURED BY SSL
const runTestForEndpointNotSecuredBySSL = async (protocol, host) => {

    try {
        if (protocol === 'http') {
            return ['The API host does not have an SSL certificate installed.'];
        } else {
            // If the endpoint has HTTPS enabled, do other SSL related checks
            const issues = await makeDetailedSSLChecks(host);
            return issues;
        }
    } catch (error) {
        console.log('Error while checking for SSL issues', error);
        // Return an array containing the error message
        // return [error.message];
    }
};



function makeDetailedSSLChecks(url) {

    return new Promise((resolve, reject) => {

        const options = {
            method: 'HEAD',
            hostname: url,
            port: 443,
            rejectUnauthorized: true, // Enable strict certificate validation
            family: 4, // Use IPv6
        };

        const req = https.request(options, (res) => {

            const certificate = res.socket.getPeerCertificate();

            // Check certificate validity
            if (!res.socket.authorized) {
                reject(new Error('Invalid SSL certificate.'));
            }

            // Check individual parameters
            const problems = [];

            // Common Name (CN)
            if (certificate.subject && !certificate.subject.CN) {
                problems.push('Missing Common Name (CN).');
            }

            // Organization (O)
            if (certificate.subject && !certificate.subject.O) {
                problems.push('Missing Organization (O).');
            }

            // Validity dates
            const validFrom = new Date(certificate.valid_from);
            const validTo = new Date(certificate.valid_to);

            if (isNaN(validFrom.getTime()) || isNaN(validTo.getTime())) {
                problems.push('Invalid validity dates.');
            }

            // Issuer
            if (!certificate.issuer || !certificate.issuer.O) {
                problems.push('Missing Issuer information.');
            }

            // Subject Alternative Names (SANs)
            if (!certificate.subjectaltname) {
                problems.push('Missing Subject Alternative Names (SANs).');
            }

            // Key length
            if (!certificate.bits || certificate.bits < 2048) {
                problems.push('Weak key length.');
            }

            // Signature algorithm
            if (!certificate.sigalg) {
                problems.push('Missing signature algorithm.');
            }

            // Signature hash algorithm
            if (!certificate.signatureAlgorithm) {
                problems.push('Missing signature hash algorithm.');
            }

            // Key usage
            if (!certificate.keyUsage) {
                problems.push('Missing key usage information.');
            }

            // Extended Key Usage (EKU)
            if (!certificate.ext_key_usage || certificate.ext_key_usage.length === 0) {
                problems.push('Missing Extended Key Usage (EKU).');
            }

            // Certificate revocation status
            if (!certificate.crls || certificate.crls.length === 0) {
                problems.push('Certificate revocation status unknown.');
            }

            // Certificate revocation lists (CRLs) retrieval
            if (!certificate.crls || certificate.crls.length === 0) {
                problems.push('Failed to retrieve Certificate Revocation Lists (CRLs).');
            }

            if (problems.length === 0) {
                resolve([]);
            } else {
                resolve(problems);
            }
        });

        req.on('error', (error) => {

            console.log('error:', error)

            reject(error);
        });

        req.end();
    });
}



// Check for HTTP VERB TAMPERTING POSSIBLE
const runTestForHTTPVerbTamperingPossible = async (protocol, host, method) => {

    const tamperableMethods = [];

    const supportedMethods = [
        'GET',
        'POST',
        'PUT',
        'DELETE',
        'PATCH',
        'OPTIONS',
        'HEAD',
        'TRACE',
        // 'CONNECT',
        // Add any additional HTTP methods to check here
    ];

    // Remove the intended method from the supported methods
    const unauthorizedMethods = supportedMethods.filter((m) => m !== method);

    for (const unauthorizedMethod of unauthorizedMethods) {

        try {
            const requestUrl = `${protocol}://${host}${path}`;
            const response = await axios.request({
                method: unauthorizedMethod,
                url: requestUrl,
                validateStatus: (status) => true, // Treat all status codes as valid
            });

            if (response.status !== 405) {
                tamperableMethods.push(unauthorizedMethod);
            }
        } catch (error) {
            // Error occurred during the request, consider the method as tamperable
            tamperableMethods.push(unauthorizedMethod);
            console.log('Error in runTestForHTTPVerbTamperingPossible:', error);
        }
    }

    return tamperableMethods;
};



// Check for SECURITY HEADERS NOT ENABLED ON HOST
const runTestForSecurityHeadersNotEnabledOnHost = async (protocol, host) => {

    const securityHeaders = [
        'Strict-Transport-Security',
        'Content-Security-Policy',
        'X-Content-Type-Options',
        'X-Frame-Options',
        'X-XSS-Protection',
        'Referrer-Policy',
        'Feature-Policy',
        'Content-Security-Policy-Report-Only',
        'Expect-CT',
        'Public-Key-Pins',
        'Public-Key-Pins-Report-Only',
        'Clear-Site-Data',
    ];

    const missingHeaders = [];

    for (const header of securityHeaders) {
        try {
            const url = `${protocol}://${host}`;
            const response = await axios.head(url);

            if (!response.headers[header.toLowerCase()]) {
                missingHeaders.push(header);
            }
        } catch (error) {
            // Error occurred during the request, consider the header as missing
            missingHeaders.push(header);
        }
    }

    return missingHeaders;

};


