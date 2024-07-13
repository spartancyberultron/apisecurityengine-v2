const asyncHandler = require('express-async-handler');
const path = require("path")
const fs = require("fs")
const SOAPOrGraphQLScan = require("../models/soapOrGraphQLScan.model")
const SOAPOrGraphQLScanVulnerability = require("../models/soapOrGraphQLScanVulnerability.model")
const { User } = require('../models/user.model');
const { exec } = require('child_process');


module.exports.getAllSOAPOrGraphQLScans = asyncHandler(async (req, res) => {


    // Trigger an async function that checks if all the scans have got the result files and also the results saved in database.
    // If not,  do that for the scans that do not have records
    checkAndPopulateScans();

    // Now proceed

    const pageNumber = parseInt(req.query.pageNumber) || 1; // Get the pageNumber from the query parameters (default to 1 if not provided)
    const pageSize = 10; // Number of active scans per page

    const totalRecords = await SOAPOrGraphQLScan.countDocuments({ user: req.user._id });
    const totalPages = Math.ceil(totalRecords / pageSize);

    // Calculate the skip value based on the pageNumber and pageSize
    const skip = (pageNumber - 1) * pageSize;

    const soapOrGraphQLScans = await SOAPOrGraphQLScan.find({ user: req.user._id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageSize)
        .lean();




    for (var i = 0; i < soapOrGraphQLScans.length; i++) {

        var vulnerabilities = await SOAPOrGraphQLScanVulnerability.countDocuments({ soapOrGraphQLScan: soapOrGraphQLScans[i]._id })
        soapOrGraphQLScans[i].vulnerabilities = vulnerabilities;
    }

    // Return the SOAP/GraphQL scans, currentPage, totalRecords, and totalPages in the response
    res.status(200).json({
        soapOrGraphQLScans,
        currentPage: pageNumber,
        totalRecords,
        totalPages,
    });


});


async function checkAndPopulateScans() {

    const soapOrGraphQLScans = await SOAPOrGraphQLScan.find({}).lean();

    for (var i = 0; i < soapOrGraphQLScans.length; i++) {

        const vulnCount = await SOAPOrGraphQLScanVulnerability.countDocuments({ soapOrGraphQLScan: soapOrGraphQLScans[i]._id })

        if (vulnCount == 0) {
            // Check if file exists and it has lines that start with WARN-NEW: or AIL-NEW: 0

            parseScanResults('./soap-graphql-scan-results/' + soapOrGraphQLScans[i]._id + '.txt', soapOrGraphQLScans[i]);

        }
    }

}




async function parseScanResults(filename, soapOrGraphQLScan) {

    const toolCommand = 'cat ' + filename;

    exec(toolCommand, async(error, stdout, stderr) => {

        if (error) {
            console.error(`Error executing command: ${error}`);
            return;
        }
        if (stderr) {
            console.error(`Error in command output: ${stderr}`);
            return;
        }


        const testCases = parseText(stdout);


        for (var i = 0; i < testCases.length; i++) {


            const result = getMappings(testCases[i].vulnName);

            // Save the vulnerabilities
            const newVuln = new SOAPOrGraphQLScanVulnerability({
                soapOrGraphQLScan: soapOrGraphQLScan._id,
                testCaseName: result.testCaseName,
                description: result.description,
                exploitability: result.exploitability,
                owasp:result.owasp,
                cwe:result.cwe,
                endpoints:testCases[i].endpoints

            });
            newVuln.save();
        }


        const scan = await SOAPOrGraphQLScan.findById(soapOrGraphQLScan._id)
        scan.scanCompletedAt = new Date();
        scan.save()

    });

}


function getMappings(vulnName){

     var result = {};

     if(vulnName.startsWith("Directory Browsing")){

        result.testCaseName = "Unauthorized Directory Listing Vulnerability";
        result.description = "Directory Browsing Vulnerability occurs when a web server or application allows unauthorized users to view the contents of directories that should be restricted, potentially exposing sensitive information";
        result.exploitability = "This vulnerability is easily exploitable by simply accessing URLs directly to discover and view directory contents.";
        result.owasp = [
            'A8:2023 - Security Misconfiguration'
        ]

        result.cwe = [
            'CWE-548 (Information Exposure Through Directory Listing)'
        ]        

     }


     /*
 Vulnerable JS Library


 In Page Banner Information Leak


 Cookie No HttpOnly Flag


 Cookie Without Secure Flag


 Re-examine Cache-control Directives


 Cross-Domain JavaScript Source File Inclusion


 Content-Type Header Missing


 Anti-clickjacking Header


 X-Content-Type-Options Header Missing


 Information Disclosure - Debug Error Messages


 Information Disclosure - Sensitive Information in URL


 Information Disclosure - Sensitive Information in HTTP Referrer Header


 HTTP Parameter Override


 Information Disclosure - Suspicious Comments


 Open Redirect


 Cookie Poisoning


 User Controllable Charset


 User Controllable HTML Element Attribute (Potential XSS)


 Viewstate


 Directory Browsing


 Heartbleed OpenSSL Vulnerability


 Strict-Transport-Security Header


 HTTP Server Response Header


 Server Leaks Information via "X-Powered-By" HTTP Response Header Field(s)


 Content Security Policy (CSP) Header Not Set


 X-Backend-Server Header Information Leak


 Secure Pages Include Mixed Content


HTTP to HTTPS Insecure Transition in Form Post


 HTTPS to HTTP Insecure Transition in Form Post


 User Controllable JavaScript Event (XSS)


 Big Redirect Detected (Potential Sensitive Information Leak)


 Source Code Disclosure - /WEB-INF Folder


 Content Cacheability


 Retrieved from Cache


 X-ChromeLogger-Data (XCOLD) Header Information Leak


 Cookie without SameSite Attribute


 CSP


 X-Debug-Token Information Leak


 Username Hash Found


 GET for POST


 X-AspNet-Version Response Header

 PII Disclosure


 Permissions Policy Header Not Set

 Timestamp Disclosure


 Hash Disclosure


 Cross-Domain Misconfiguration


 Source Code Disclosure


 User Agent Fuzzer


 Weak Authentication Method


 Reverse Tabnabbing


 Modern Web Application


 Dangerous JS Functions

 Authentication Request Identified


 Session Management Response Identified

 Verification Request Identified

 Absence of Anti-CSRF Tokens

 Private IP Disclosure


 Heartbleed OpenSSL Vulnerability


 Source Code Disclosure



 Remote Code Execution


 External Redirect


 Session ID in URL Rewrite


 Buffer Overflow


 Format String Error


 CRLF Injection


 Parameter Tampering


 Server Side Include


 Cross Site Scripting (Reflected)


Cross Site Scripting (Persistent)


 Cross Site Scripting (Persistent)


Cross Site Scripting (Persistent)


 SQL Injection
 
 SQL Injection - MySQL


 SQL Injection - Hypersonic SQL


 SQL Injection - Oracle




 SQL Injection - PostgreSQL


 SQL Injection - SQLite


 Cross Site Scripting (DOM Based)


 SQL Injection - MsSQL


 ELMAH Information Leak


 Trace.axd Information Leak


 .htaccess Information Leak


 .env Information Leak


 Hidden File Finder


 Spring Actuator Information Leak


 Log4Shell


 Spring4Shell


 Script Active Scan Rules

 Script Passive Scan Rules


 Path Traversal


 Remote File Inclusion


 Insecure JSF ViewState


 Java Serialization Object


 Sub Resource Integrity Attribute Missing


 Insufficient Site Isolation Against Spectre Vulnerability


 Charset Mismatch


 XSLT Injection


 Server Side Code Injection


 Remote OS Command Injection


 XPath Injection


 Application Error Disclosure


 XML External Entity Attack


 Generic Padding Oracle


 SOAP XML Injection


 WSDL File Detection


 Loosely Scoped Cookie


 Cloud Metadata Potentially Exposed


Server Side Template Injection


Server Side Template Injection (Blind)




*/

if(vulnName.startsWith("Unexpected Content-Type was returned")){


        result.testCaseName = "Unexpected Content-Type was returned";
        result.description = "Unexpected Content-Type was returned";
        result.exploitability = "Unexpected Content-Type was returned";
        result.owasp = [
            'A8:2023 - Security Misconfiguration'
        ]

        result.cwe = [
            'CWE-548 (Information Exposure Through Directory Listing)'
        ]        



}	

if(vulnName.startsWith("SOAP Action Spoofing")){


        result.testCaseName = "Malicious manipulation of SOAP action header.";
        result.description = "Attacker tricks server with fake SOAP action, causing unintended operations.";
        result.exploitability = "Requires MitM attack, knowledge of valid actions.";
        result.owasp = [
            'API2:2023 - Broken Authentication'
        ]

        result.cwe = [
            'CWE-643 (Unrestricted Function Calls)',
            'CWE-287 (Improper Authorization)'
        ]        


}




return result;

}


module.exports.getSOAPOrGraphQLScanDetails = asyncHandler(async (req, res) => {


    const { scanId } = req.body;

    const soapOrGraphQLScan = await SOAPOrGraphQLScan.findById(scanId).populate('user').lean();

    const vulnerabilities = await SOAPOrGraphQLScanVulnerability.find({ soapOrGraphQLScan: scanId }).lean();

    soapOrGraphQLScan.vulnerabilities = vulnerabilities;

    // Return the scans
    res.status(200);
    res.json({ soapOrGraphQLScan })

});


module.exports.startSOAPOrGraphQLScan = asyncHandler(async (req, res) => {

    const user = await User.findById(req.user._id);

    const { scanName, type, collectionUrl } = req.body;

    console.log('req.body:', req.body);

    //const originalname = req.file.originalname
    //const fileformat = originalname.split('.').pop();

    const newScan = new SOAPOrGraphQLScan({
        scanName: scanName,
        user: user._id,
        collectionUrl: collectionUrl,
        type: type,
        status: 'in progress'
    });
    newScan.save();

    /*
    var filePath = path.join(__dirname, "..", "uploads", "soap-and-graphql-files", originalname);
    //var jsonContent = fs.readFileSync(filePath, 'utf8');

    const newScan = new SBOMScan({
        scanName: scanName,
        user: user._id,
        sbomFilePath: filePath
    });
    newScan.save();

    console.log('filePath:', filePath);

    // Set the target directory
    const targetDirectory = path.join(__dirname, "..", "uploads", "sbom-files", "result-files");

    // Change directory to the target directory
    process.chdir(targetDirectory);

    */

    let toolCommand;

    if (type == 'soap') {

        //toolCommand = 'docker run -t zaproxy/zap-stable zap-api-scan.py -t https://www.w3schools.com/xml/tempconvert.asmx?WSDL -f soap > ./soap-graphql-scan-results/results.txt';
        toolCommand = 'docker run -t zaproxy/zap-stable zap-api-scan.py -t ' + collectionUrl + ' -f soap > ./soap-graphql-scan-results/' + newScan._id + '.txt';

    } else if (type == 'graphql') {

        //toolCommand = 'docker run -t zaproxy/zap-stable zap-api-scan.py -t https://raw.githubusercontent.com/OlegIlyenko/graphql-gateway/master/testSchema.graphql -f graphql > ./soap-graphql-scan-results/results.txt';
        toolCommand = 'docker run -t zaproxy/zap-stable zap-api-scan.py -t ' + collectionUrl + ' -f graphql > ./soap-graphql-scan-results/' + newScan._id + '.txt';

    }

    //toolCommand = 'docker run bitnami/laravel';

    console.log('toolCommand:', toolCommand)

    //exec(toolCommand);

    //const resultFilePath = path.join(__dirname, "..", "uploads", "sbom-files", "sbom-scan-result-files", `${newScan._id}_result.json`);


    res.send({ success: "Scan started" });

});


function parseText(text) {

    var lines = text.split('\n');
    lines = lines.slice(0, lines.length - 1);

    const testCases = [];

    lines.forEach((line, index) => {

        if (line.startsWith("WARN-NEW:")) {
            // Extract vuln name (including following bracketed info)
            const vulnName = line.slice(line.indexOf(":") + 1).trim();

            const endpoints = [];
            let isCollectingEndpoints = true;

            // Process subsequent lines until a delimiter is found
            while (isCollectingEndpoints && index < lines.length - 1) {
                const nextLine = lines[index + 1].trim();
                if (nextLine.toUpperCase().startsWith("PASS") ||
                    nextLine.toUpperCase().startsWith("FAIL") ||
                    nextLine.toUpperCase().startsWith("WARN") ||
                    nextLine.toUpperCase().startsWith("INFO") ||
                    nextLine.toUpperCase().startsWith("IGNORE")) {
                    isCollectingEndpoints = false;
                } else {
                    endpoints.push(nextLine);
                }
                index++; // Move to the next line after processing
            }



            testCases.push({ vulnName, endpoints });
        }
    });

    console.log('testCases:', testCases)

    return testCases;
}



module.exports.deleteSOAPOrGraphQLScan = asyncHandler(async (req, res) => {



});













