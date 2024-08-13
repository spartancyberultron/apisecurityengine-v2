const asyncHandler = require('express-async-handler');
const path = require("path")
const fs = require("fs")
const fsextra = require('fs-extra');
const sharp = require('sharp');
const https = require('https');

const Collection = require('postman-collection').Collection;

const AttackSurfaceEndpoint = require("../models/attacksurfaceendpoint.model");
const { User } = require('../models/user.model');
const AttackSurfaceScan = require("../models/attacksurfacescan.model");
const AttackSurfaceScanVulnerability = require("../models/attacksurfacescanvulnerability.model");

const { none } = require('../config/multerUpload');
const Vulnerability = require('../models/vulnerability.model');
const Organization = require('../models/organization.model');

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

const { exec } = require('child_process');


// Fetch and save subdomains as endpoints
const Subfinder = require("@sooluh/subfinder");
const subfinder = new Subfinder();

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

const remediations = require('./remediations/rest-remediations.json');


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



// Get all attack surface scans 
module.exports.getAllAttackSurfaceScans = asyncHandler(async (req, res) => {

    const pageNumber = parseInt(req.query.pageNumber) || 1; // Get the pageNumber from the query parameters (default to 1 if not provided)
    const pageSize = 10; // Number of attack surface scans per page

    const totalRecords = await AttackSurfaceScan.countDocuments({ user: req.user._id });
    const totalPages = Math.ceil(totalRecords / pageSize);

    // Calculate the skip value based on the pageNumber and pageSize
    const skip = (pageNumber - 1) * pageSize;

    const attackSurfaceScans = await AttackSurfaceScan.find({ user: req.user._id })
        
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageSize)
        .lean()
        .populate('orgProject');

        /*
    for (var i = 0; i < attackSurfaceScans.length; i++) {

        var vulnerabilitiesCount = await AttackSurfaceScanVulnerability.countDocuments({ attackSurfaceScan: attackSurfaceScans[i]._id })

        //console.log('vulnerabilities:',vulnerabilities)

        attackSurfaceScans[i].vulnerabilitiesCount = vulnerabilitiesCount;
    }


    // Retrieve the IDs of the attack surface scans
    const attackSurfaceScanIds = attackSurfaceScans.map((scan) => scan._id);

    // Fetch counts of endpoints for each attack surface scan
    const endpointsCountsPromises = attackSurfaceScanIds.map(async (scanId) => {
        const count = await AttackSurfaceEndpoint.countDocuments({ attackSurfaceScan: scanId }).exec();
        return { scanId, count };
    });

    const endpointsCounts = await Promise.all(endpointsCountsPromises);

    // Create a map of attack surface scan IDs and their corresponding endpoint counts
    const endpointsCountMap = new Map();
    endpointsCounts.forEach((countObj) => {
        endpointsCountMap.set(countObj.scanId.toString(), countObj.count);
    });

    // Add the endpointsCount property to each attack surface scan
    attackSurfaceScans.forEach((scan, index) => {
        const endpointsCount = endpointsCountMap.get(scan._id.toString()) || 0;
        scan.endpointsCount = endpointsCount;
        const globalIndex = skip + index + 1;
        scan.index = globalIndex; 
    });

    */

    // Return the sttack surface scans, currentPage, totalRecords, and totalPages in the response
    res.status(200).json({
        attackSurfaceScans,
        currentPage: pageNumber,
        totalRecords,
        totalPages,
    });
});



module.exports.getAttackSurfaceScanDetails = asyncHandler(async (req, res) => {

    const { scanId } = req.body;

    const attackSurfaceScan = await AttackSurfaceScan.findById(scanId).populate('user').lean();

    const vulnerabilities = await AttackSurfaceScanVulnerability.find({ attackSurfaceScan: scanId }).populate('vulnerability endpoint').lean();

    attackSurfaceScan.vulnerabilities = vulnerabilities;

    const endpointsCount = await AttackSurfaceEndpoint.count({ attackSurfaceScan: attackSurfaceScan._id })
    attackSurfaceScan.endpointsCount = endpointsCount;

    // Return the scans
    res.status(200);
    res.json({ attackSurfaceScan })
});


module.exports.deleteAttackSurfaceScan = asyncHandler(async (req, res) => {

    try {
        const { id } = req.body;

        // Find the attack surface scan and its associated APICollection
        const attackSurfaceScan = await AttackSurfaceScan.findById(id);
        if (!attackSurfaceScan) {
            return res.status(404).json({ error: 'Attack Surface scan not found.' });
        }


        // Delete the AttackSurfaceScan
        const deletedAttackSurfaceScan = await AttackSurfaceScan.findByIdAndDelete(id);
        if (!deletedAttackSurfaceScan) {
            return res.status(404).json({ error: 'Failed to delete the attack surface scan.' });
        }        

        res.json({ message: 'Scan deleted successfully.' });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

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


// Start quick scan 
module.exports.startAttackSurfaceScan = asyncHandler(async (req, res) => {

    const user = await User.findById(req.user._id);

    const { domain, projectId } = req.body;  

console.log('projectId:',projectId)


    const attackSurfaceScan = new AttackSurfaceScan;
    attackSurfaceScan.user = req.user._id;
    attackSurfaceScan.projectName = '';
    attackSurfaceScan.orgProject = projectId;
    attackSurfaceScan.domain = domain;
    attackSurfaceScan.status = 'in progress';
    attackSurfaceScan.save();

    
    let theSubdomains = [];
    
    console.log('domain', domain)

    // callback
    subfinder.lookup(domain, function (subdomains, error) {
      if (error) return console.error(error);
    
      console.log(subdomains);
      theSubdomains = subdomains;

      console.log('theSubdomains:',theSubdomains);
      const commaSeparatedList = theSubdomains.map(item => item.subdomain).join(",");

      console.log('commaSeparatedList:',commaSeparatedList)


    // Fetch and save the crawled sub urls of subdomains as endpoints

    const command = "docker run projectdiscovery/katana:latest -u " + commaSeparatedList;

    const childProcess = exec(command);

    // Initialize an empty array to store the output lines
    const outputLines = [];

    // Listen for stdout data
    childProcess.stdout.on('data', (data) => {

            // Split the data into lines
            const lines = data.toString().split('\n');

            // Filter out empty strings and push non-empty lines into the outputLines array
            lines.filter(line => line.trim() !== '').forEach(line => outputLines.push(line));
    });

    // Listen for errors
    childProcess.on('error', (error) => {
            console.error('Error executing command:', error);
    });

    // Listen for process exit
    childProcess.on('exit', (code, signal) => {

        // Log the exit code and signal
        console.log('Process exited with code', code, 'and signal', signal);

        // Log the captured output
        console.log('Captured output:', outputLines); 

        var endpoints = [];

        for(var i=0;i<outputLines.length;i++){        
        
            const theEndpoint = new AttackSurfaceEndpoint;
            theEndpoint.user = req.user._id;
            theEndpoint.attackSurfaceScan = attackSurfaceScan._id;
            theEndpoint.url = outputLines[i];
            theEndpoint.save();

            endpoints.push(theEndpoint)
        }   
        
        
        console.log('endpoints:',endpoints)

        attackSurfaceScan.endpointsCount = endpoints.length;
        attackSurfaceScan.save();
        
        
        runAttackSurfaceScan(user, attackSurfaceScan, endpoints);

        res.status(200).json({
            "status": "started"
        });   

    });  

    });


     



    

});


async function runAttackSurfaceScan(user, theAttackSurfaceScan, theEndpoints) {

    try {        

        //console.log('theEndpoints:',theEndpoints);

        var theVulns = [];

        const organization = await Organization.findById(user.organization);       


        // 1. Test for ENDPOINT NOT SECURED BY SSL
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

            console.log('uniqueHosts:', uniqueHosts)

            var findings = await endpointNotSecuredBySSLCheck(theAttackSurfaceScan._id, uniqueHosts.join(','));

            var hostsResults = [];

            for (var i = 0; i < findings.server_scan_results.length; i++) {

                var serverScanResult = findings.server_scan_results[i];

                var hostsResult = {};

                var host = serverScanResult.server_location.hostname;

                if(!(host.includes('localhost')||(host.includes('127.0') ))){

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


            console.log('hostsResults:', hostsResults)


            if (hostsResults) {

                for (var i = 0; i < theEndpoints.length; i++) {

                    // Initialize the findings array
                    let findings = [];

                    let additionalCWEs = [];
            
                    // Find matching records from the JSON array
                    const matchingHosts = hostsResults.filter(hostResult => theEndpoints[i].url.includes(hostResult.host));

                    console.log('matchingHosts:',matchingHosts)
            
                    // Only proceed if there are matching hosts
                    if (matchingHosts.length > 0) {                       
            
                        // Check for SSL-related issues from hostsResults
                        const hostResult = hostsResults.find(hostResult => theEndpoints[i].url.includes(hostResult.host));
            
                        if (hostResult) {

                            var remediation = '';

                            if (hostResult.certificateMissing) {

                                findings.push({description:'SSL Certificate not installed', exploitability:''});
                            }
            
                            if (hostResult.cipherSuitesIssues) {
                                

                               var description = 'The vulnerability arises when an endpoint is not secured with SSL, specifically when it fails to implement strong encryption standards or secure cipher suites. This leaves the data transmitted between the client and server susceptible to interception and eavesdropping.';

                               var exploitability = 'Attackers can exploit this vulnerability by performing man-in-the-middle (MITM) attacks, intercepting, and potentially altering the communication, which can lead to data breaches and unauthorized access to sensitive information.';

                               findings.push({description, exploitability});

                               
                               additionalCWEs.push('CWE-259: Use of a Hardcoded Password') 
                               additionalCWEs.push('CWE-327: Broken or Risky Cryptographic Algorithm') 

                               remediation = remediation + '<br/><br/>' + (getObjectByIndex(1)).remediation;

                            }
            
                            if (hostResult.crimeIssue) {

                                var description = 'The ""Endpoint Not Secured by SSL - CRIME"" vulnerability occurs when SSL/TLS is not properly implemented, leaving endpoints vulnerable to CRIME (Compression Ratio Info-leak Made Easy) attacks.';

                                var exploitability = 'Attackers can exploit this by manipulating cipher suites to compress and intercept data, potentially revealing sensitive information through side-channel attacks.'


                                findings.push({description, exploitability});

                                additionalCWEs.push('CWE-295: Improper Access Control') 
                                additionalCWEs.push('CWE-300: Insufficient Cryptographic Strength') 
                                additionalCWEs.push('CWE-758: Use of a Broken or Risky Cryptographic Algorithm') 

                                remediation = remediation + '<br/><br/>' + (getObjectByIndex(7)).remediation;
                            }
            
                            if (hostResult.tls13EarlyCheckIssue) {

                                var description = 'The vulnerability ""Endpoint Not Secured by SSL - TLS 1.3 Early Data"" refers to endpoints using the TLS 1.3 early data feature without proper security measures, risking exposure of sensitive data during the handshake process.';

                                var exploitability = 'Attackers can exploit this by intercepting or replaying the early data before the encryption keys are fully established, particularly in weak cipher suites, leading to potential data breaches and unauthorized access.';
                                findings.push({description, exploitability});

                                additionalCWEs.push('CWE-319: Cleartext Transmission of Sensitive Information') 
                                additionalCWEs.push('CWE-352: Cross-Site Request Forgery (CSRF)') 
                                additionalCWEs.push('CWE-294: Authentication Bypass by Capture-replay')
                                
                                remediation = remediation + '<br/><br/>' + (getObjectByIndex(11)).remediation;
                            }
            
                            if (hostResult.openSSLCCSInjectionIssues) {

                                var description = 'The vulnerability ""EndPoint Not Secured by SSL - OpenSSL CCS Injection"" involves the improper handling of the ChangeCipherSpec (CCS) protocol in OpenSSL, allowing an attacker to intercept or manipulate encrypted data.';

                                var exploitability = 'This flaw can be exploited if the endpoint uses vulnerable versions of OpenSSL with certain cipher suites, enabling attackers to perform man-in-the-middle attacks and decrypt sensitive information.';

                                findings.push({description, exploitability});

                                additionalCWEs.push('CWE-295: Improper Access Control') 
                                additionalCWEs.push('CWE-894: Improper Control of TLS Communication') 

                                remediation = remediation + '<br/><br/>' + (getObjectByIndex(6)).remediation;
                            }
            
                            if (hostResult.downgradePreventionIssue) {

                                var description = 'This vulnerability occurs when an endpoint is not secured by SSL, allowing attackers to force the use of weaker, insecure cipher suites by preventing the use of secure ones through downgrade attacks.';

                                var exploitability = 'Attackers can intercept and manipulate traffic, exploiting the vulnerability to decrypt or alter sensitive information, leading to data breaches and unauthorized access.';
                                findings.push({description, exploitability});

                                additionalCWEs.push('CWE Reference: CWE-2001: Sensitive Information Disclosure') 

                                remediation = remediation + '<br/><br/>' + (getObjectByIndex(10)).remediation;
                            }
            
                            if (hostResult.heartbleedIssues) {

                                var description = 'The vulnerability occurs when an endpoint is not secured by SSL, making it susceptible to the Heartbleed exploit, which allows attackers to read memory of the vulnerable system, potentially exposing sensitive data such as encryption keys and passwords.';

                                var exploitability = 'This vulnerability can be exploited in cipher suites where improper implementation of the SSL/TLS protocol exists, allowing attackers to exploit the Heartbleed bug to retrieve sensitive information directly from the memory of the affected systems.';

                                findings.push({description, exploitability});

                                additionalCWEs.push('CWE-311: Improper Restriction of Operation within the Bounds of a Memory Buffer') 
                                additionalCWEs.push('CWE-255: Improper Check for Certificate Revocation') 

                                remediation = remediation + '<br/><br/>' + (getObjectByIndex(2)).remediation;
                            }
            
                            if (hostResult.insecureNegotiationIssue) {

                                var description = 'The vulnerability ""Endpoint Not Secured by SSL - Insecure Renegotiation"" occurs when a server endpoint uses SSL/TLS but does not secure renegotiation processes, making it susceptible to man-in-the-middle attacks.';

                                var exploitability = 'Attackers can exploit this vulnerability by intercepting and injecting data into the encrypted communication, potentially compromising the integrity and confidentiality of the data exchanged between the client and server.';
                                findings.push({description, exploitability});

                                additionalCWEs.push('CWE-2001: Sensitive Information Not Protected') 

                                remediation = remediation + '<br/><br/>' + (getObjectByIndex(9)).remediation;
                            }
            
                            if (hostResult.sessionResumptionIssues) {

                                var description = 'The endpoint lacks SSL protection, making it vulnerable to interception and man-in-the-middle attacks. Additionally, the support for session resumption in cipher suites can be exploited to hijack sessions and decrypt sensitive data.';

                                var exploitability = 'Attackers can exploit this vulnerability by intercepting unencrypted traffic and leveraging session resumption to gain unauthorized access to encrypted sessions, compromising data confidentiality and integrity.';
                                findings.push({description, exploitability});

                                additionalCWEs.push('CWE-319: Cleartext Transmission of Sensitive Information') 

                                remediation = remediation + '<br/><br/>' + (getObjectByIndex(8)).remediation;
                            }
            
                            if (hostResult.ellipticCurvesIssues) {

                                var description = 'The endpoint is not secured by SSL, indicating that the communication between the client and server is unencrypted and susceptible to interception. This vulnerability particularly involves the use of weak or unsupported elliptic curves in cipher suites, compromising the strength of the encryption.';

                                var exploitability = 'Attackers can exploit this by intercepting and manipulating the data transmitted, leading to potential data breaches and unauthorized access to sensitive information.';

                                findings.push({description, exploitability});

                                additionalCWEs.push('CWE-326: Inadequate Encryption Strength') 

                                remediation = remediation + '<br/><br/>' + (getObjectByIndex(3)).remediation;
                            }
                        }

                        console.log('findings:', findings)
                        console.log('additionalCWEs:', additionalCWEs)
            
                        // Ensure findings array is not empty before creating the vulnerability
                        if (findings.length > 0) {

                            const vuln = await Vulnerability.findOne({ vulnerabilityCode: 4 });
            
                            var description = 'This host has SSL related problems';

                            const result = await getVulnSeverityAndPriority(4);
                            const severity = result ? result.severity : null;
                            const priority = result ? result.priority : null;
            
                            const theAttackSurfaceScanVulnerability = await AttackSurfaceScanVulnerability.create({
                                attackSurfaceScan: theAttackSurfaceScan,
                                vulnerability: vuln,
                                endpoint: theEndpoints[i],
                                description: description,
                                sslFindings: findings,
                                additionalCWEs:additionalCWEs,
                                remediation: remediation,
                                severity: severity,
                                priority: priority                            });
            
                            theVulns.push(theAttackSurfaceScanVulnerability);
                            theEndpoints[i].vulnCount = (theEndpoints[i].vulnCount || 0) + 1;
                            await theEndpoints[i].save();
                        }
                    }
                }
            }



        } catch (error) {

            console.log('error:', error)
            console.log('execption occured in check for SSL issues')
        }
       
        


        
       


        
        try {

            // 2. Test for SENSITIVE DATA IN PATH PARAMS
            for (var i = 0; i < theEndpoints.length; i++) {

                //console.log('fourth loop')

                //var pIIData = await runTestForSensitiveDataInQueryParams(theEndpoints[i])

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

                    const theAttackSurfaceScanVulnerability = await AttackSurfaceScanVulnerability.create({

                        attackSurfaceScan: theAttackSurfaceScan,
                        vulnerability: vuln,
                        //projectName: projectName,
                        endpoint: theEndpoints[i],
                        description: description,
                        findings: piiArray,
                        remediation: remediation,
                        severity: severity,
                        priority: priority
                    });

                    theVulns.push(theAttackSurfaceScanVulnerability);
                    theEndpoints[i].vulnCount = theEndpoints[i].vulnCount + 1;
                    theEndpoints[i].save();
                }
            }
        } catch (error) {
            console.log('execption occured in check for SENSITIVE DATA IN PATH PARAMS')
        }       
      
        


        
        // 4. Test for HTTP VERB TAMPERING POSSIBLE    
        try {
            for (var i = 0; i < theEndpoints.length; i++) {

                //console.log('sixth loop')

                // var tamperableMethods = await runTestForHTTPVerbTamperingPossible(theEndpoints[i], 10000); // 10 scond timeout

                var result = await httpVerbTamperingPossibleCheck(theEndpoints[i]);

                //console.log('tamperableMethods', tamperableMethods)

                if (result.issueFound) {
                    const vuln = await Vulnerability.findOne({ vulnerabilityCode: 8 })

                    //var description = 'The method on this endpoint can be tampered to any of the following:' + tamperableMethods.join(',');

                    try {

                        var remediation = (getObjectByIndex(26)).remediation;

                        const result1 = await getVulnSeverityAndPriority(8);
                        const severity = result1 ? result1.severity : null;
                        const priority = result1 ? result1.priority : null;

                        const theAttackSurfaceScanVulnerability = await AttackSurfaceScanVulnerability.create({
                            attackSurfaceScan: theAttackSurfaceScan,
                            vulnerability: vuln,
                            //projectName: projectName,
                            endpoint: theEndpoints[i],
                            description: result.description,
                            findings: result.findings,
                            remediation: remediation,
                            severity: severity,
                            priority: priority
                        });

                        theVulns.push(theAttackSurfaceScanVulnerability);
                        theEndpoints[i].vulnCount = theEndpoints[i].vulnCount + 1;
                        await theEndpoints[i].save();
                    } catch (createError) {
                        console.log('Error creating AttackSurfaceScanVulnerability:', createError);
                        continue;
                    }
                }
            }
        } catch (error) {
            console.log('Exception occurred in check for HTTP VERB TAMPERING POSSIBLE:', error);
            // Handle the error condition here, log the error, and continue or take appropriate actions.
        }
        


        

        // 4. Test for SECURITY HEADERS NOT ENABLED ON HOST
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

            console.log('uniqueHosts:',uniqueHosts)

            var findingsArray = await securityHeadersNotEnabledOnHostCheck(theAttackSurfaceScan._id, uniqueHosts.join(','));

            console.log('findingsArray:',findingsArray)           
          

            if(findingsArray){

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
                        const vuln = await Vulnerability.findOne({ vulnerabilityCode: 10 });
            
                        var description = 'Some security headers are not enabled on this host.';

                        var remediation = '';

                        
                        if (findings.includes("Content-Security-Policy")) {
                            remediation = remediation + '<br/><br>' + (getObjectByIndex(12)).remediation;
                        }

                        if (findings.includes("Strict-Transport-Security")) {
                            remediation = remediation + '<br/><br>' + (getObjectByIndex(13)).remediation;
                        }

                        if (findings.includes("X-Frame-Options")) {
                            remediation = remediation + '<br/><br>' + (getObjectByIndex(14)).remediation;
                        }

                        if (findings.includes("X-Content-Type-Options")) {
                            remediation = remediation + '<br/><br>' + (getObjectByIndex(15)).remediation;
                        }

                        if (findings.includes("X-XSS-Protection")) {
                            remediation = remediation + '<br/><br>' + (getObjectByIndex(16)).remediation;
                        }

                        if (findings.includes("Cross-Origin Resource Sharing")) {
                            remediation = remediation + '<br/><br>' + (getObjectByIndex(17)).remediation;
                        }

                        if (findings.includes("Referrer-Policy")) {
                            remediation = remediation + '<br/><br>' + (getObjectByIndex(18)).remediation;
                        }

                        if (findings.includes("Feature-Policy")) {
                            remediation = remediation + '<br/><br>' + (getObjectByIndex(19)).remediation;
                        }

                        const result = await getVulnSeverityAndPriority(10);
                        const severity = result ? result.severity : null;
                        const priority = result ? result.priority : null;
            
                        const theAttackSurfaceScanVulnerability = await AttackSurfaceScanVulnerability.create({
                            attackSurfaceScan: theAttackSurfaceScan,
                            vulnerability: vuln,
                            endpoint: theEndpoints[i],
                            description: description,
                            findings: findings,
                            remediation: remediation,
                            severity: severity,
                            priority: priority
                        });
            
                        theVulns.push(theAttackSurfaceScanVulnerability);
                        theEndpoints[i].vulnCount = (theEndpoints[i].vulnCount || 0) + 1;
                        await theEndpoints[i].save();
                    }
                }
            }

        }             


        } catch (error) {

            console.log('error:',error)
            console.log('execption occured in check for SECURITY HEADERS NOT ENABLED ON HOST')
        }        


        // Scan completion
        theAttackSurfaceScan.scanCompletedAt = new Date();
        theAttackSurfaceScan.status = 'completed';
        theAttackSurfaceScan.vulnerabilities = theVulns;
        theAttackSurfaceScan.vulnCount = theVulns.length;
        await theAttackSurfaceScan.save();


        //createPDFAndSendEmail(theActiveScan._id);

        return theAttackSurfaceScan;

    } catch (error) {
        console.log('from', error)
    }
}

