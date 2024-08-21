const asyncHandler = require('express-async-handler');
const path = require("path")
const fs = require("fs")
const fsextra = require('fs-extra');
const sharp = require('sharp');
const https = require('https');

const { User } = require('../models/user.model');

const { none } = require('../config/multerUpload');
const APICollection = require('../models/apicollection.model');
const Vulnerability = require('../models/vulnerability.model');
const ProjectVulnerability = require('../models/projectVulnerability.model');
const TrafficProjectEndpoint = require('../models/trafficprojectendpoint.model');
const Organization = require('../models/organization.model');

const Project = require('../models/project.model');
const OrgProject = require('../models/orgproject.model');

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


const remediations = require('./remediations/rest-remediations.json');


const { basicAuthenticationDetectedCheck } = require("../services/securityTests/agentScansTools/basicAuthenticationDetectedCheck.service");
const { brokenAuthenticationCheck } = require("../services/securityTests/brokenAuthenticationCheck.service");
const { brokenObjectLevelAuthoriztionCheck } = require("../services/securityTests/brokenObjectLevelAuthoriztionCheck.service");
const { contentTypeInjectionPossibleCheck } = require("../services/securityTests/contentTypeInjectionPossibleCheck.service");
const { endpointNotSecuredBySSLCheck } = require("../services/securityTests/agentScansTools/endpointNotSecuredBySSLCheck.service");
const { excessiveDataExposureCheck } = require("../services/securityTests/excessiveDataExposureCheck.service");
const { httpVerbTamperingPossibleCheck } = require("../services/securityTests/agentScansTools/httpVerbTamperingPossibleCheck.service");
const { injectionCheck } = require("../services/securityTests/injectionCheck.service");
const { lackOfResourcesAndRateLimitingCheck } = require("../services/securityTests/lackOfResourcesAndRateLimitingCheck.service");
const { piiDataDetectedInResponseCheck } = require("../services/securityTests/piiDataDetectedInResponseCheck.service");
const { preImageAttackPossibleCheck } = require("../services/securityTests/preImageAttackPossibleCheck.service");
const { resourceDeletionPossibleCheck } = require("../services/securityTests/resourceDeletionPossibleCheck.service");
const { securityHeadersNotEnabledOnHostCheck } = require("../services/securityTests/agentScansTools/securityHeadersNotEnabledOnHostCheck.service");
const { sensitiveDataInPathParamsCheck } = require("../services/securityTests/agentScansTools/sensitiveDataInPathParamsCheck.service");
const { sensitiveDataInQueryParamsCheck } = require("../services/securityTests/agentScansTools/sensitiveDataInQueryParamsCheck.service");
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
        projectId:project._id
    };

    res.status(200).json(result);
});



// Receive request info from a mirrored API traffic
module.exports.sendRequestInfo = asyncHandler(async (req, res) => {

    try{

    // Fetch the body params
    const { api_key, the_request } = req.body;
    const { requestId, method, url, headers, body, query, timestamp, projectType, protocol, host } = the_request;

    console.log('the_request:', the_request)

    // Fetch individual fields from the request object dynamically
    const requestBody = { ...body }; // Copy the body object
    //const queryParameters = { ...query }; // Copy the query object


    const queryParameters = getQueryParameters(url)
    console.log('queryParameters:',queryParameters)


    const application = await Project.findOne({projectIntegrationID:api_key}).populate('orgProject')
    console.log('application:',application.orgProject)
    const orgProject = await OrgProject.findById(application.orgProject._id);

    const organization = await Organization.findById(orgProject.organization._id);

    console.log('orgProject:',orgProject)




    // Trim the quotes around api_key, in case someone has inputted with quotes in their env file
    const trimmed_api_key = api_key.replace(/^['"](.*)['"]$/, '$1');
    const project = await Project.findOne({ projectIntegrationID: trimmed_api_key });

    console.log('project', project)


    if (project.capturingStatus == 'Capturing') {
        console.log('comess in')


        console.log('method:', method)
        console.log('url:', url)
        console.log('headers:', headers)
        console.log('body:', body)

        console.log('%%%%%%%%%%%%%%%%%%%%%%%:')

        // Check if a record with matching method and url exists
        TrafficProjectEndpoint.findOne({ method, url }, (err, existingEndpoint) => {

            if (err) {
                console.error('Error checking for existing TrafficProjectEndpoint:', err);
                return res.status(500).json({ error: 'An error occurred while processing the request' });
            }

            if (!existingEndpoint) {

                // If no matching record found, create a new one
                const newEndpoint = new TrafficProjectEndpoint({
                    project: project._id,
                    method,
                    url,
                    headers: headers && Object.entries(headers).map(([key, value]) => {
                        // Check if the key is a number (TCP packet info) or a string (HTTP header)
                        if (isNaN(key)) {
                            return {
                                key: key,
                                value: value,
                                type: 'HTTP'
                            };
                        } else {
                            return {
                                key: 'TCP Info',
                                value: value,
                                type: 'TCP'
                            };
                        }
                    }).filter(header => header !== null),
                    queryParams: Object.entries(queryParameters).map(([key, value]) => ({ key, value })),
                    requestBody,
                    // Add other fields as needed
                    firstDetected: new Date().toISOString(),
                    lastActive: new Date().toISOString(),
                });

                newEndpoint.save((saveErr) => {
                    if (saveErr) {
                        console.error('Error saving new TrafficProjectEndpoint:', saveErr);
                        return res.status(500).json({ error: 'An error occurred while saving the new endpoint' });
                    }
                    console.log('New TrafficProjectEndpoint created');
                    // Continue with your logic here
                });
            } else {
                // If a matching record is found, update the lastActive field
                existingEndpoint.lastActive = new Date().toISOString();
                existingEndpoint.save((saveErr) => {
                    if (saveErr) {
                        console.error('Error updating existing TrafficProjectEndpoint:', saveErr);
                        return res.status(500).json({ error: 'An error occurred while updating the existing endpoint' });
                    }
                    console.log('Existing TrafficProjectEndpoint found and updated');
                    // Continue with your logic here
                });
            }
        });



        console.log('project.capturingStatus:', project.capturingStatus)

        project.projectType = projectType;
        await project.save();

        ///////*** Run the scan ***////////        

        // Check for Sensitive Data in Query Params 

        var { issueFound, findings } = await sensitiveDataInQueryParamsCheck(queryParameters, orgProject.organization._id)

        console.log('issueFound:',issueFound)

        if (issueFound) {

            var piiArray = [];

            for (var p = 0; p < findings.length; p++) {

                if (!piiArray.includes(findings[p])) {
                    piiArray.push(findings[p]);
                }
            }

            var description = 'The query params of this endpoint contain sensitive data.';

            if (findings.length > 0) {

                const vuln = await Vulnerability.findOne({ vulnerabilityCode: 6 })

                var remediation = (getObjectByIndex(23)).remediation;

                    const result = await getVulnSeverityAndPriority(6);
                    const severity = result ? result.severity : null;
                    const priority = result ? result.priority : null;

                const theProjectVulnerability = await ProjectVulnerability.create({

                    project: project,
                    vulnerability: vuln,
                    endpoint: url,
                    description: description,
                    findings: piiArray,
                    remediation:remediation,
                        severity:severity,
                        priority:priority
                });

                const uniquePiiFields = [];

                for (const piiField of findings) {

                    if (!project.piiFields.includes(piiField)) {
                        uniquePiiFields.push(piiField);
                    }
                }

                project.piiFields.push(...uniquePiiFields);
                project.save();

            }
        }

        // END - Check for Sensitive Data in Query Params  



        // Check for Sensitive Data in Path Params
        var { issueFound, findings } = await sensitiveDataInPathParamsCheck(url, orgProject.organization._id)

        console.log('issueFound11:',issueFound)

        if (issueFound) {

            var piiArray = [];

            for (var p = 0; p < findings.length; p++) {
                if (!piiArray.includes(findings[p])) {
                    piiArray.push(findings[p]);
                }
            }

            var description = 'The path params of this API contain sensitive data.';

            if (findings.length > 0) {

                const vuln = await Vulnerability.findOne({ vulnerabilityCode: 2 })

                var remediation = (getObjectByIndex(24)).remediation;

                    const result = await getVulnSeverityAndPriority(2);
                    const severity = result ? result.severity : null;
                    const priority = result ? result.priority : null;

                const theProjectVulnerability = await ProjectVulnerability.create({

                    project: project,
                    vulnerability: vuln,
                    endpoint: url,
                    description: description,
                    findings: piiArray,
                    remediation:remediation,
                        severity:severity,
                        priority:priority
                });

                const uniquePiiFields = [];

                for (const piiField of findings) {

                    if (!project.piiFields.includes(piiField)) {
                        uniquePiiFields.push(piiField);
                    }
                }

                project.piiFields.push(...uniquePiiFields);
                project.save();
            }
            // END - Check for Sensitive Data in Path Params
        }

            console.log('headers:', headers)

            // Check for Basic Authentication Detected
            var basicAuthFound = await basicAuthenticationDetectedCheck(headers)

            
            console.log('basicAuthFound:',basicAuthFound)

            if (basicAuthFound) {

                const vuln = await Vulnerability.findOne({ vulnerabilityCode: 3 })

                var description = 'This API has basic authentication on it. A stronger authentication method like Bearer token, is recommended.'

                var remediation = (getObjectByIndex(20)).remediation;

                const result = await getVulnSeverityAndPriority(3);
                const severity = result ? result.severity : null;
                const priority = result ? result.priority : null;

                const theProjectVulnerability = await ProjectVulnerability.create({

                    project: project,
                    vulnerability: vuln,
                    endpoint: url,
                    description: description,
                    remediation:remediation,
                        severity:severity,
                        priority:priority
                });

            }
            // END - Check for Basic Authentication Detected
        



        // 1. Test for ENDPOINT NOT SECURED BY SSL
        try {

            // This check will happen only on unique hosts found across all endpoints

            // Extract unique hosts

            var uniqueHosts = [url];

            console.log('uniqueHosts:', uniqueHosts)

            var findings = await endpointNotSecuredBySSLCheck(uniqueHosts.join(','));

            var hostsResults = [];

            for (var i = 0; i < findings.server_scan_results.length; i++) {

                var serverScanResult = findings.server_scan_results[i];

                var hostsResult = {};

                var theHost = serverScanResult.server_location.hostname;

                if (!(theHost.includes('localhost') || (theHost.includes('127.0')))) {

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

                    console.log('matchingHosts:', matchingHosts)

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

                        console.log('findings:', findings)
                        console.log('additionalCWEs:', additionalCWEs)

                        // Ensure findings array is not empty before creating the vulnerability
                        if (findings.length > 0) {

                            const vuln = await Vulnerability.findOne({ vulnerabilityCode: 4 });

                            var description = 'This host has SSL related problems';

                            /*  const theActiveScanVulnerability = await ActiveScanVulnerability.create({
                                  activeScan: theActiveScan,
                                  vulnerability: vuln,
                                  endpoint: theEndpoints[i],
                                  description: description,
                                  sslFindings: findings,
                                  additionalCWEs:additionalCWEs
                              }); */

                              const result = await getVulnSeverityAndPriority(4);
                            const severity = result ? result.severity : null;
                            const priority = result ? result.priority : null;

                            const theProjectVulnerability = await ProjectVulnerability.create({

                                project: project,
                                vulnerability: vuln,
                                endpoint: url,
                                description: description,
                                sslFindings: findings,
                                additionalCWEs: additionalCWEs,
                                remediation:remediation,
                                severity:severity,
                                priority:priority
                            });

                        }
                    }
                }
            }



        } catch (error) {

            console.log('error:', error)
            console.log('execption occured in check for SSL issues')
        }      



        // Check for HTTP Verb Tampering Possible
        var { issueFound, findings, description } = await httpVerbTamperingPossibleCheck(protocol, host, method);

        if (issueFound) {

            if (findings.length > 0) {

                const vuln = await Vulnerability.findOne({ vulnerabilityCode: 8 })

                //var description = 'The method on this endpoint can be tampered to any of the following:' + tamperableMethods.join(',');

                var remediation = (getObjectByIndex(26)).remediation;

                        const result1 = await getVulnSeverityAndPriority(8);
                        const severity = result1 ? result1.severity : null;
                        const priority = result1 ? result1.priority : null;

                const theProjectVulnerability = await ProjectVulnerability.create({

                    project: project,
                    vulnerability: vuln,
                    endpoint: url,
                    description: description,
                    findings: findings,
                    remediation:remediation,
                            severity:severity,
                            priority:priority
                });

            }
        }
        // END - Check for HTTP Verb Tampering Possible


        // 4. Test for SECURITY HEADERS NOT ENABLED ON HOST
        try {

            // This check will happen only on unique hosts found across all endpoints

            // Extract unique hosts
            var uniqueHosts = [url];          

            console.log('uniqueHosts:',uniqueHosts)

            var findingsArray = await securityHeadersNotEnabledOnHostCheck(uniqueHosts.join(','));

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

                       // var remediation = (getObjectByIndex(12)).remediation;

                        const result = await getVulnSeverityAndPriority(10);
                        const severity = result ? result.severity : null;
                        const priority = result ? result.priority : null;


                        const theProjectVulnerability = await ProjectVulnerability.create({

                            project: project,
                            vulnerability: vuln,
                            endpoint: url,
                            description: description,
                            findings:findings,
                            remediation:remediation,
                            severity:severity,
                            priority:priority
                        });            
                        
                    }
                }
            }

        }             


        } catch (error) {

            console.log('error:',error)
            console.log('execption occured in check for SECURITY HEADERS NOT ENABLED ON HOST')
        }         


        calculateDashboard(organization);



        res.status(200).json({
            status: 'received',
        });

        


    }

} catch (error) {

    console.log('error:', error)
}


});


// Receive response info from a mirrrored API traffic
module.exports.sendResponseInfo = asyncHandler(async (req, res) => {



    // Return the active scans, currentPage, totalRecords, and totalPages in the response
    res.status(200).json({
        status: 'received',
    });
});






// Set capturing status to either Capturing or Stopped
module.exports.setCapturingStatus = asyncHandler(async (req, res) => {
    const { projectId, status } = req.body;

    // Validate input
    if (!projectId || !status) {
        return res.status(400).json({ error: 'Project ID and status are required' });
    }

    if (status !== 'Capturing' && status !== 'Stopped') {
        return res.status(400).json({ error: 'Status must be either Capturing or Stopped' });
    }

    try {
        // Find the project and update its status
        const updatedProject = await Project.findByIdAndUpdate(
            projectId,
            { capturingStatus: status },
            { new: true, runValidators: true }
        );

        if (!updatedProject) {
            return res.status(404).json({ error: 'Project not found' });
        }

        // Send the updated project as the response
        res.status(200).json({
            message: 'Capturing status updated successfully',
            project: {
                id: updatedProject._id,
                projectName: updatedProject.projectName,
                capturingStatus: updatedProject.capturingStatus
            }
        });
    } catch (error) {
        console.error('Error updating capturing status:', error);
        res.status(500).json({ error: 'Failed to update capturing status' });
    }
});



module.exports.getInventoryOfProject = asyncHandler(async (req, res) => {

    const projectId = req.params.projectId;

    const endpoints = await TrafficProjectEndpoint.find({ project: projectId }).populate('project');

    if (!endpoints) {
        return res.status(404).json({ message: 'No endpoints found for the project' });
    }

    res.status(200).json(endpoints);

});

function getQueryParameters(urlString) {

    let queryParameters = {};

    // Find the index of the query string in the URL
    const queryIndex = urlString.indexOf('?');
    if (queryIndex !== -1) {
        // Extract the query string part from the URL
        const queryString = urlString.substring(queryIndex + 1);

        // Split the query string into key-value pairs
        const pairs = queryString.split('&');
        pairs.forEach(pair => {
            const [key, value] = pair.split('=');
            if (key) {
                queryParameters[decodeURIComponent(key)] = decodeURIComponent(value || '');
            }
        });
    }

    console.log('queryParameters:', queryParameters);
    return queryParameters;
}
