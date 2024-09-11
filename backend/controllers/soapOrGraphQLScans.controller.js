const asyncHandler = require('express-async-handler');
const path = require("path")
const fs = require("fs")
const SOAPOrGraphQLScan = require("../models/soapOrGraphQLScan.model")
const SOAPOrGraphQLScanVulnerability = require("../models/soapOrGraphQLScanVulnerability.model")
const Organization = require("../models/organization.model")

const { User } = require('../models/user.model');
const { exec } = require('child_process');

const remediations = require('./remediations/soap-graphql-remediations.json');

const { calculateDashboard } = require("../services/dashboard/dashboardCalculation.service");

const util = require('util');

// Promisify the exec function
const execPromise = util.promisify(exec);

function getObjectByName(name) {
    // Find the object with the given index
    const result = remediations.find(item => item.testCaseName === name);
    return result || null; // Return null if no object is found
}

module.exports.getAllSOAPOrGraphQLScans = asyncHandler(async (req, res) => {

    const user = await User.findById(req.user._id)
    const organization = await Organization.findById(user.organization)   

    // Now proceed

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


        const soapOrGraphQLScans = await SOAPOrGraphQLScan.aggregate([
            { $match: { user: req.user._id } },
            { $sort: { createdAt: -1 } },
            { $skip: skip },
            { $limit: limit },
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
                    from: 'soaporgraphqlscanvulnerabilities',
                    let: { scanId: '$_id' },
                    pipeline: [
                        { $match: { $expr: { $eq: ['$soapOrGraphQLScan', '$$scanId'] } } },
                        { $count: 'count' }
                    ],
                    as: 'vulnerabilitiesCount'
                }
            },
            {
                $addFields: {
                    vulnerabilities: { $ifNull: [{ $arrayElemAt: ['$vulnerabilitiesCount.count', 0] }, 0] }
                }
            },
            {
                $project: {
                    vulnerabilitiesCount: 0
                }
            }
        ]);

        const countQuery = await SOAPOrGraphQLScan.aggregate([
            { $match: { user: req.user._id } },
            { $count: 'total' }
        ]);
        
        const totalCount = countQuery.length > 0 ? countQuery[0].total : 0;

        // Trigger an async function that checks if all the scans have got the result files and also the results saved in database.
        // If not,  do that for the scans that do not have records
        // checkAndPopulateScans(organization);

        // Return the SOAP/GraphQL scans, currentPage, totalRecords, and totalPages in the response
    res.status(200).json({
        soapOrGraphQLScans,
        totalCount
    });


});


async function checkAndPopulateScans(organization) {

    const soapOrGraphQLScans = await SOAPOrGraphQLScan.find({}).lean();

    for (var i = 0; i < soapOrGraphQLScans.length; i++) {

        const vulnCount = await SOAPOrGraphQLScanVulnerability.countDocuments({ soapOrGraphQLScan: soapOrGraphQLScans[i]._id })

        if (vulnCount == 0) {
            // Check if file exists and it has lines that start with WARN-NEW: or AIL-NEW: 0

            const result  = await parseScanResults('./soap-graphql-scan-results/' + soapOrGraphQLScans[i]._id + '.txt', soapOrGraphQLScans[i]);

            if (result.error) {
                console.error('Error parsing scan results:', result.error);
                // Handle the error case here
            } else {
                console.log('Scan results parsed successfully');
                console.log('result:',result)

                // Now update the scan status
                const scan = await SOAPOrGraphQLScan.findById(soapOrGraphQLScans[i]._id);
                scan.scanCompletedAt = new Date();

                const vulns = await SOAPOrGraphQLScanVulnerability.countDocuments({soapOrGraphQLScan:scan._id})


                if(vulns==0){
                    const fifteenMinutes = 15 * 60 * 1000; // 15 minutes in milliseconds
                    const currentTime = new Date();
    
                    // Check if 15 minutes have passed since scan.createdAt
                    if (currentTime - scan.createdAt > fifteenMinutes) {
                        scan.status = 'completed';
                        await scan.save();
                    }
                    

                }else{
                    scan.status = 'completed';
                    await scan.save();
                }
                
               
            }
            

        }
    }

    calculateDashboard(organization)

}


async function parseScanResults(filename, soapOrGraphQLScan) {
    const toolCommand = 'cat ' + filename;

    try {
        // Execute the command and await its result
        const { stdout, stderr } = await execPromise(toolCommand);

        // Handle any potential errors in stderr
        if (stderr) {
            console.error(`Error in command output: ${stderr}`);
            // Return a value to indicate an error
            return { error: 'Error in command output' };
        }

        const testCases = parseText(stdout);

        for (const testCase of testCases) {
            const result = getMappings(testCase.vulnName);

            if (result.hasOwnProperty('testCaseName')) {
                const obj = getObjectByName(result.testCaseName);
                console.log('obj:', obj);

                // Save the vulnerabilities
                const newVuln = new SOAPOrGraphQLScanVulnerability({
                    soapOrGraphQLScan: soapOrGraphQLScan._id,
                    testCaseName: result.testCaseName,
                    description: result.description,
                    exploitability: result.exploitability,
                    owasp: result.owasp,
                    cwe: result.cwe,
                    endpoints: testCase.endpoints,
                    remediation: obj.remediation,
                    severity: obj.severity,
                });

                await newVuln.save();
            }
        }


        // Return a success indicator
        return { success: true };
    } catch (error) {
        // Catch and log any errors from exec or other async operations
        console.error(`Error executing command: ${error.message}`);
        // Return an error object
        return { error: error.message };
    }
}


function getMappings(vulnName) {

    var result = {};

    if (vulnName.startsWith("Directory Browsing")) {
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


    if (vulnName.startsWith("Cookie No HttpOnly Flag")) {
        result.testCaseName = "Cookie lacks the 'Secure' attribute, exposing it to network attacks.";
        result.description = "The absence of the Secure flag in a cookie allows it to be transmitted over unencrypted HTTP connections. This increases the risk of interception by attackers during transit.";
        result.exploitability = "Attackers can intercept cookies over non-secure channels, potentially gaining unauthorized access to sensitive data or user sessions. This vulnerability is easily exploitable on unencrypted networks like public Wi-Fi.";
        result.owasp = [
            'A8:2023 - Security Misconfiguration'
        ]
        result.cwe = [
            'CWE-614: Sensitive Cookie in HTTPS Session Without \'Secure\' Attribute'
        ]
    }

    if (vulnName.startsWith("Cookie Without Secure Flag")) {
        result.testCaseName = "Cookie set without the secure flag, risking transmission over insecure connections.";
        result.description = "\"Cookie Without Secure Flag\" is a vulnerability where cookies are set without the secure attribute. This allows cookies to be transmitted over unencrypted HTTP connections, exposing them to interception.";
        result.exploitability = "An attacker can exploit this vulnerability by intercepting the cookie during transmission over an insecure connection. This can lead to session hijacking and unauthorized access to user accounts.";
        result.owasp = [
            'A8:2023 - Security Misconfiguration'
        ]
        result.cwe = [
            'CWE-311: Missing Encryption of Sensitive Data',
            'CWE-614: Sensitive Cookie in HTTPS Session Without \'Secure\' Attribute'
        ]
    }

    if (vulnName.startsWith("Password Autocomplete in Browser")) {
        result.testCaseName = "Browser saves passwords automatically, exposing them to unauthorized access.";
        result.description = "Password autocomplete in browsers can inadvertently store sensitive credentials. This stored information can be accessed by malicious scripts or unauthorized users.";
        result.exploitability = "Exploitation involves tricking users into saving passwords in browsers. Malicious scripts or attackers with local access can retrieve these stored passwords.";
        result.owasp = [
            'A8:2023 - Security Misconfiguration'
        ]
        result.cwe = [
            'CWE-256: Plaintext Storage of a Password',
            'CWE-522: Insufficiently Protected Credentials'
        ]
    }

    if (vulnName.startsWith("Incomplete or No Cache-control and Pragma HTTP Header Set")) {
        result.testCaseName = "Absence of HTTP headers preventing sensitive data caching in browsers.";
        result.description = "This vulnerability occurs when web applications fail to set Cache-control and Pragma HTTP headers, allowing browsers to cache sensitive information. This can lead to unauthorized access to private data if the browser cache is compromised.";
        result.exploitability = "Attackers can exploit this by accessing cached data from a shared or public browser, potentially revealing sensitive information. Exploitation requires physical access to the browser or a method to read its cache.";
        result.owasp = [
            'A8:2023 Security Misconfiguration'
        ]
        result.cwe = [
            'CWE-525: Use of Web Browser Cache Containing Sensitive Information',
            'CWE-384: Session Fixation'
        ]
    }

    if (vulnName.startsWith("Web Browser XSS Protection Not Enabled")) {
        result.testCaseName = "Browser's XSS protection is disabled, leaving users vulnerable to attacks.";
        result.description = "This vulnerability occurs when a web application does not enable the browser's built-in XSS (Cross-Site Scripting) protection, allowing malicious scripts to be executed in the user's browser. This can lead to data theft, session hijacking, or other malicious activities.";
        result.exploitability = "Attackers can exploit this vulnerability by injecting malicious scripts into web pages viewed by users with unprotected browsers. Without XSS protection, these scripts can run in the user's browser, compromising their data and potentially controlling their interactions with the web application.";
        result.owasp = [
            'A8:2023 Security Misconfiguration'
        ]
        result.cwe = [
            'CWE-933: OWASP Top Ten 2019 Category A7-Cross-Site Scripting',
            'CWE-79: Improper Neutralization of Input During Web Page Generation (\'Cross-site Scripting\')'
        ]
    }

    if (vulnName.startsWith("Cross-Domain JavaScript Source File Inclusion")) {
        result.testCaseName = "Inclusion of external JavaScript files from untrusted domains causes security risks.";
        result.description = "This vulnerability occurs when a web application includes JavaScript files from external sources without proper validation. It can lead to cross-site scripting (XSS), data theft, and other malicious activities.";
        result.exploitability = "Attackers exploit this by tricking the application into loading malicious scripts. These scripts can then execute arbitrary code, steal cookies, or manipulate content on the web page.";
        result.owasp = [
            'A8:2023 Security Misconfiguration'
        ]
        result.cwe = [
            'CWE-829: Inclusion of Functionality from Untrusted Control Sphere',
            'CWE-94: Improper Control of Generation of Code (\'Code Injection\')'
        ]
    }

    if (vulnName.startsWith("Content-Type Header Missing")) {
        result.testCaseName = "The Content-Type header is not included in HTTP requests.";
        result.description = "When the Content-Type header is missing, the server cannot determine the format of the incoming request data, leading to potential mishandling. This can result in unexpected behavior or security vulnerabilities.";
        result.exploitability = "Attackers can exploit this vulnerability by sending data in unexpected formats, bypassing server-side validation, and potentially injecting malicious content. This can lead to security breaches such as cross-site scripting (XSS) or SQL injection.";
        result.owasp = [
            'A8:2023 Security Misconfiguration'
        ]
        result.cwe = [
            'CWE-79: Improper Neutralization of Input During Web Page Generation (\'Cross-site Scripting\')',
            'CWE-116: Improper Encoding or Escaping of Output',
            'CWE-113: Improper Neutralization of CRLF Sequences in HTTP Headers (\'HTTP Response Splitting\')'
        ]
    }

    if (vulnName.startsWith("X-Frame-Options Header Scanner")) {
        result.testCaseName = "Missing X-Frame-Options header allows clickjacking attacks on web applications.";
        result.description = "The X-Frame-Options header prevents a web page from being framed by another site, mitigating clickjacking attacks. If absent, attackers can trick users into performing unintended actions on vulnerable sites.";
        result.exploitability = "Attackers can embed the vulnerable site within an iframe on a malicious site. This can trick users into clicking on elements, potentially performing unintended actions like form submissions or transactions.";
        result.owasp = [
            'A8:2023 Security Misconfiguration'
        ]
        result.cwe = [
            'CWE-1021: Improper Restriction of Rendered UI Layers or Frames',
            'CWE-693: Protection Mechanism Failure'
        ]
    }

    if (vulnName.startsWith("X-Content-Type-Options Header Missing")) {
        result.testCaseName = "Lack of X-Content-Type-Options header allows MIME-type mismatch attacks.";
        result.description = "Without the X-Content-Type-Options header, browsers may interpret files as a different MIME type than specified, leading to security vulnerabilities. This can allow attackers to execute unintended scripts or files.";
        result.exploitability = "Exploitable by tricking a browser into interpreting files inappropriately, leading to cross-site scripting (XSS) or other malicious content execution. This vulnerability can be targeted via crafted links or compromised sites.";
        result.owasp = [
            'A8:2023 Security Misconfiguration'
        ]
        result.cwe = [
            'CWE-16: Configuration',
            'CWE-933: OWASP Top Ten 2013 Category A5 – Security Misconfiguration',
            'CWE-20: Improper Input Validation'
        ]
    }

    if (vulnName.startsWith("Information Disclosure - Debug Error Messages")) {
        result.testCaseName = "Exposure of sensitive information through debug error messages.";
        result.description = "This vulnerability occurs when applications display debug error messages that reveal internal system information. Attackers can exploit this data to gain insights into the system's architecture and potential weaknesses.";
        result.exploitability = "Exploitability is high because attackers can trigger errors and access sensitive information. Properly crafted inputs can lead to significant data leaks about the application's backend and configuration.";
        result.owasp = [
            'A8:2023 Security Misconfiguration'
        ]
        result.cwe = [
            'CWE-209: Information Exposure Through an Error Message',
            'CWE-532: Information Exposure Through Log Files'
        ]
    }

    if (vulnName.startsWith("Information Disclosure - Sensitive Informations in URL")) {
        result.testCaseName = "Sensitive data exposed in URLs, risking interception and unauthorized access.";
        result.description = "Sensitive information, such as credentials or personal data, is included in URLs, making it vulnerable to exposure through browser history, logs, and referer headers. This can lead to unauthorized access and data breaches.";
        result.exploitability = "Attackers can easily intercept URLs containing sensitive data through network traffic monitoring, browser history inspection, or server logs. This allows them to gain unauthorized access to sensitive information without advanced skills or tools.";
        result.owasp = [
            'A8:2023 Security Misconfiguration'
        ]
        result.cwe = [
            'CWE-598: Information Exposure Through Query Strings in GET Request',
            'CWE-200: Exposure of Sensitive Information to an Unauthorized Actor'
        ]
    }

    if (vulnName.startsWith("Information Disclosure - Sensitive Information in HTTP Referrer Header")) {
        result.testCaseName = "Exposure of sensitive data through HTTP referrer headers in requests.";
        result.description = "When users navigate from a secure page to another site, the HTTP referrer header can inadvertently expose sensitive information, such as session tokens or personal data, to the new site. This leakage occurs due to improper handling of referrer headers.";
        result.exploitability = "Attackers can exploit this vulnerability by luring users to click on links that send sensitive information via referrer headers to malicious sites. This information can be intercepted and misused for unauthorized access or data breaches.";
        result.owasp = [
            'A8:2023 Security Misconfiguration'
        ]
        result.cwe = [
            'CWE-598: Information Exposure Through Query Strings in GET Request',
            'CWE-200: Exposure of Sensitive Information to an Unauthorized Actor'
        ]
    }

    if (vulnName.startsWith("HTTP Parameter Override")) {
        result.testCaseName = "Malicious user manipulates web app parameters";
        result.description = "Attacker alters HTTP request parameters to gain unauthorized access or modify application behavior. This can bypass security checks.";
        result.exploitability = "Depends on application logic and validation. Possible attacks include privilege escalation, SQL injection, or Cross-Site Scripting (XSS).";
        result.owasp = [
            'A1:2023 - Broken Authentication'
        ]
        result.cwe = [
            'CWE-937 (Remote Parameter Tampering)',
            'CWE-802 (Dynamically Modifiable Code Execution)'
        ]
    }

    if (vulnName.startsWith("Information Disclosure - Suspicious Comments")) {
        result.testCaseName = "Unintended secrets revealed in code comments";
        result.description = "Source code comments leak sensitive information like credentials, internal logic, or hidden functionalities. Attackers can exploit these comments to gain an advantage.";
        result.exploitability = "Depends on comment content. Highly risky if passwords or API keys are revealed. Requires access to source code (leak, breach).";
        result.owasp = [
            'A8:2023 Security Misconfiguration'
        ]
        result.cwe = [
            'CWE-201 (Exposure of Sensitive Data Through Untrusted Data Channels)',
            'CWE-611 (Exposure of Private Implementation Details)'
        ]
    }

    if (vulnName.startsWith("Viewstate Scanner")) {
        result.testCaseName = "Insecure Deserialization of ViewState";
        result.description = "ASP.NET applications store form data in ViewState. Unsigned ViewState allows attackers to tamper with data, potentially leading to code execution.";
        result.exploitability = "Requires modifying ViewState and exploiting deserialization vulnerabilities in the .NET framework.";
        result.owasp = [
            'A8:2023 Security Misconfiguration'
        ]
        result.cwe = [
            'CWE-642 (External Control of Critical State Data)',
            'CWE-502 (Deserialization of Untrusted Data)'
        ]
    }

    if (vulnName.startsWith("Secure Pages Include Mixed Content")) {
        result.testCaseName = "Mixed content on HTTPS pages";
        result.description = "Unencrypted resources (images, scripts) on secure sites. Vulnerable to eavesdropping and data alteration.";
        result.exploitability = "Easy to identify, moderate exploit effort.";
        result.owasp = [
            'A8:2023 Security Misconfiguration'
        ]
        result.cwe = [
            'CWE-894: Improper Control of Resource Identifiers in a Web Application'
        ]
    }

    if (vulnName.startsWith("Source Code Disclosure - /WEB-INF folder")) {
        result.testCaseName = "Unprotected sensitive files exposed.";
        result.description = "Web server misconfiguration allows access to the \"/WEB-INF\" folder containing critical application files.";
        result.exploitability = "Attackers can steal source code, configuration data, or bypass security controls.";
        result.owasp = [
            'A8:2023 Security Misconfiguration'
        ]
        result.cwe = [
            'CWE-200 - Exposure of Sensitive Data or Information',
            'CWE-601 - Unintended Information Disclosure'
        ]
    }

    if (vulnName.startsWith("Remote Code Execution - Shell Shock")) {
        result.testCaseName = "Bash bug allows env var code execution.";
        result.description = "Shellshock lets attackers inject malicious code into vulnerable systems through environment variables. This grants remote control of the system.";
        result.exploitability = "Easy to exploit, widespread in web services, critical for mitigation.";
        result.owasp = [
            'A8:2023 Security Misconfiguration'
        ]
        result.cwe = [
            'CWE-400 (Uncontrolled Resource Consumption)',
            'CWE-77 (Command Injection)'
        ]
    }

    if (vulnName.startsWith("Backup File Disclosure")) {
        result.testCaseName = "Unintended access to backup files.";
        result.description = "Backup files, containing sensitive data, are exposed on a server due to misconfiguration. Attackers can steal this data or gain system access.";
        result.exploitability = "Easy to discover, moderate effort to exploit, potential for high impact.";
        result.owasp = [
            'A8:2023 Security Misconfiguration'
        ]
        result.cwe = [
            'CWE-200 (Exposure of Sensitive Data)',
            'CWE-532 (Insecure Direct Object References)'
        ]
    }



    if (vulnName.startsWith("Weak Authentication Method")) {
        result.testCaseName = "Insecure login methods";
        result.description = "Weak authentication allows unauthorized access through easily guessed passwords, basic authentication, or lack of multi-factor authentication.";
        result.exploitability = "Attackers can steal credentials or bypass authentication with low effort.";
        result.owasp = [
            'API2:2023 - Broken Authentication'
        ]
        result.cwe = [
            'CWE-287 (Improper Authentication)',
            'CWE-1390 (Weak Authentication)'
        ]
    }

    if (vulnName.startsWith("Absence of Anti-CSRF Tokens")) {
        result.testCaseName = "Missing protection against forged requests.";
        result.description = "Applications lack tokens to prevent attackers from tricking users into unwanted actions.";
        result.exploitability = "Attackers can steal data or perform actions as the victim through malicious links or forms.";
        result.owasp = [
            'API2:2023 - Broken Authentication'
        ]
        result.cwe = [
            'CWE-352: Cross-Site Request Forgery (CSRF)'
        ]
    }

    if (vulnName.startsWith("Private IP Disclosure")) {
        result.testCaseName = "Unintended reveal of internal network IPs.";
        result.description = "Private IP addresses, used within a network, are exposed publicly. This grants attackers network layout knowledge.";
        result.exploitability = "Attackers can use revealed IPs for reconnaissance, potentially launching further attacks on internal systems.";
        result.owasp = [
            'API6:2023 - Unrestricted Access to Sensitive Business Flows'
        ]
        result.cwe = [
            'CWE-200 (Improper Resource Handling)',
            'CWE-613 (Sensitive Data Exposure)'
        ]
    }

    if (vulnName.startsWith("Anti CSRF Tokens Scanner")) {
        result.testCaseName = "Missing CSRF protection";
        result.description = "Web app lacks anti-CSRF tokens, allowing attackers to forge requests in a user's session.";
        result.exploitability = "Attacker tricks user into sending malicious requests that perform unauthorized actions.";
        result.owasp = [
            'API2:2023 - Broken Authentication'
        ]
        result.cwe = [
            'CWE-352: Cross-Site Request Forgery (CSRF)'
        ]
    }

    if (vulnName.startsWith("HTTP Parameter Pollution scanner")) {
        result.testCaseName = "Duplicate params confuse application logic";
        result.description = "Unsanitized user input creates unintended behavior with repeated parameters in a request.";
        result.exploitability = "Easy to automate, bypasses validation, impacts functionality.";
        result.owasp = [
            'API3:2023 - Broken Object Property Level Authorization'
        ]
        result.cwe = [
            'CWE-20 (Improper Input Validation)',
            'CWE-233 (Improper Handling of Parameters)'
        ]
    }

    if (vulnName.startsWith("Cross-Domain Misconfiguration")) {
        result.testCaseName = "CORS settings allowing unauthorized access";
        result.description = "Websites restrict data sharing across domains. Misconfigured Cross-Origin Resource Sharing (CORS) weakens this protection.";
        result.exploitability = "Attackers can steal data or perform actions on your behalf on another website.";
        result.owasp = [
            'API2:2023 - Broken Authentication'
        ]
        result.cwe = [
            'CWE-894: Improper Access Control',
            'CWE-614: Broken Access Control'
        ]
    }

    if (vulnName.startsWith("Source Code Disclosure")) {
        result.testCaseName = "Unintended revealing of server-side code";
        result.description = "Source code, meant to be hidden, becomes accessible to users. This can expose sensitive information like passwords or application logic.";
        result.exploitability = "Easy to exploit through misconfiguration or bugs. Attackers can steal secrets, find vulnerabilities, or understand app functionality.";
        result.owasp = [
            'A8:2023 Security Misconfiguration'
        ]
        result.cwe = [
            'CWE-200 (Exposure of Sensitive Information)',
            'CWE-601 (Unintended Information Disclosure)'
        ]
    }

    if (vulnName.startsWith("Remote Code Execution")) {
        result.testCaseName = "Run attacker code on remote system";
        result.description = "RCE lets attackers execute malicious code on a victim's computer, granting control and potential data theft.";
        result.exploitability = "Achieved through vulnerabilities in apps or systems, allowing attackers to inject and run their own code.";
        result.owasp = [
            'API1:2023 - Broken Object Level Authorization'
        ]
        result.cwe = [
            'CWE-79 (Improper Neutralization of Special Elements used in an SQL Command (\'SQL Injection\'))',
            'CWE-20 (Improper Input Validation)'
        ]
    }

    if (vulnName.startsWith("External Redirect")) {
        result.testCaseName = "Unintended redirection to external website.";
        result.description = "User reaches intended site, but gets sent elsewhere. Often caused by malicious input or server misconfiguration.";
        result.exploitability = "Easy to automate, requires some user interaction. Can be used for phishing or malware distribution.";
        result.owasp = [
            'API1:2023 - Broken Object Level Authorization'
        ]
        result.cwe = [
            'CWE-601 (URL Redirection)',
            'CWE-794 (Insecure Direct Object Reference)'
        ]
    }

    if (vulnName.startsWith("Session ID in URL Rewrite")) {
        result.testCaseName = "Exposing session ID in URL parameters";
        result.description = "Web app stores session ID in URL, visible to attackers.";
        result.exploitability = "Attackers can steal/guess ID, hijacking user sessions.";
        result.owasp = [
            'API2:2023 - Broken Authentication'
        ]
        result.cwe = [
            'CWE-311 - Improper Restriction of URL Access Within Web Page',
            'CWE-613 - Sensitive Data Leakage'
        ]
    }

    if (vulnName.startsWith("Buffer Overflow")) {
        result.testCaseName = "Memory overrun when data exceeds buffer capacity";
        result.description = "Program writes too much data to a buffer, corrupting adjacent memory.";
        result.exploitability = "Attackers craft input to overflow buffer, overwrite program instructions, gain control.";
        result.owasp = [
            'API1:2023 - Broken Object Level Authorization'
        ]
        result.cwe = [
            'CWE-120 (Stack-based buffer overflow)',
            'CWE-121 (Heap-based buffer overflow)'
        ]
    }

    if (vulnName.startsWith("Format String Error")) {
        result.testCaseName = "Misinterpreting a string meant for formatting as code";
        result.description = "Untrusted input influences format specifiers in a formatting function. This lets attackers inject malicious code for the application to execute.";
        result.exploitability = "Attackers can inject arbitrary code to be run by the application, potentially compromising the entire system.";
        result.owasp = [
            'API1:2023 - Broken Object Level Authorization'
        ]
        result.cwe = [
            'CWE-78 (OS Command Injection)',
            'CWE-400 (Uncontrolled Resource Consumption)'
        ]
    }

    if (vulnName.startsWith("Integer Overflow Error")) {
        result.testCaseName = "Arithmetic on integers exceeding data type limits.";
        result.description = "Occurs during mathematical operations (addition, subtraction, multiplication) when the result is too large or small for the integer variable's data type. Leads to unexpected behavior, program crashes, or potential security vulnerabilities.";
        result.exploitability = "Requires knowledge of data type sizes and boundaries. Attackers can craft inputs that trigger overflows for malicious purposes.";
        result.owasp = [
            'API2:2023 - Broken Authentication'
        ]
        result.cwe = [
            'CWE-190 Integer Overflow or Underflow'
        ]
    }

    if (vulnName.startsWith("CRLF Injection")) {
        result.testCaseName = "Carriage return & line feed injection";
        result.description = "Injects newline characters, manipulating app logic.";
        result.exploitability = "Inserted in forms, URLs, tricking apps to split responses.";
        result.owasp = [
            'API2:2023 - Broken Authentication'
        ]
        result.cwe = [
            'CWE-800 (Integer Overflow)',
            'CWE-934 (Stack Buffer Overflow)'
        ]
    }

    if (vulnName.startsWith("Parameter Tampering")) {
        result.testCaseName = "Malicious modification of data sent to applications.";
        result.description = "Attackers tamper with data (URLs, forms) to manipulate app behavior (access unauthorized data, change prices).";
        result.exploitability = "Easy to perform, requires knowledge of app logic and parameters.";
        result.owasp = [
            'API2:2023 - Broken Authentication'
        ]
        result.cwe = [
            'CWE-937 (Broken Component Validation)',
            'CWE-802 (Dynamic Linking Errors)'
        ]
    }

    if (vulnName.startsWith("Server Side Include")) {
        result.testCaseName = "Insecure code execution on web server.";
        result.description = "SSI directives in webpages are interpreted by the server. Malicious input can lead to unintended code execution. Vuln. allows attackers to compromise the server.";
        result.exploitability = "Requires attacker control over input processed by SSI. Can be used to steal data, deface websites, or launch further attacks.";
        result.owasp = [
            'API6:2023 - Unrestricted Access to Sensitive Business Flows'
        ]
        result.cwe = [
            'CWE-73: External Control of File System Encoding',
            'CWE-78: OS Command Injection'
        ]
    }

    if (vulnName.startsWith("Cross Site Scripting (Reflected)")) {
        result.testCaseName = "Malicious script reflected in user input.";
        result.description = "Vulnerable app echoes user input without sanitizing, allowing attackers to inject scripts executed in victim's browser.";
        result.exploitability = "Easy to exploit via crafted links or forms. Tricking users to click is the challenge.";
        result.owasp = [
            'API8:2023 - Security Misconfiguration'
        ]
        result.cwe = [
            'CWE-79 (Improper Neutralization of Special Elements used in an SQL Command (SQL Injection))',
            'CWE-80 (XSS)'
        ]
    }

    if (vulnName.startsWith("Session Fixation")) {
        result.testCaseName = "Trick user's session ID.";
        result.description = "Attacker predicts session ID, tricks user to use it, steals user's session.";
        result.exploitability = "Requires valid session ID, social engineering for user.";
        result.owasp = [
            'API8:2023 - Security Misconfiguration'
        ]
        result.cwe = [
            'CWE-287 (Insecure Session Management)'
        ]
    }

    if (vulnName.startsWith("Cross Site Scripting (Persistent)")) {
        result.testCaseName = "Injected script in stored data.";
        result.description = "Attacker injects malicious script, stored by the application, affecting other users.";
        result.exploitability = "Easy to inject, impacts all users, wide range of attacks possible.";
        result.owasp = [
            'API8:2023 - Security Misconfiguration'
        ]
        result.cwe = [
            'CWE-79 (Improper Neutralization of Special Elements used in an SQL Command (SQL Injection))',
            'CWE-80 (XSS)'
        ]
    }

    if (vulnName.startsWith("SQL Injection")) {
        result.testCaseName = "Malicious SQL code injected in user input.";
        result.description = "Exploiting a security flaw to manipulate database queries. Attackers can steal, alter, or delete data.";
        result.exploitability = "Easy to implement, often automated in hacker tools. Widespread in web applications with poor validation.";
        result.owasp = [
            'API1:2023 - Broken Object Level Authorization'
        ]
        result.cwe = [
            'CWE-89 (SQL Injection)',
            'CWE-680 (Validation of Command-Line Parameters)'
        ]
    }


    if (vulnName.startsWith("SQL Injection - MySQL")) {
        result.testCaseName = "Malicious code injection in SQL statements.";
        result.description = "Insecure data handling lets attackers manipulate database queries.";
        result.exploitability = "Widespread, affecting web apps using MySQL databases.";
        result.owasp = [
            'API1:2023 - Broken Object Level Authorization'
        ]
        result.cwe = [
            'CWE-89 (SQL Injection)',
            'CWE-20 (Improper Input Validation)'
        ]
    }

    if (vulnName.startsWith("SQL Injection - Hypersonic SQL")) {
        result.testCaseName = "Insecure data in SQL queries (Hypersonic SQL).";
        result.description = "Untrusted user input can manipulate database queries, allowing attackers to steal data or gain unauthorized access.";
        result.exploitability = "Easy to exploit, requires minimal knowledge. Can impact confidentiality, integrity, and availability.";
        result.owasp = [
            'API1:2023 - Broken Object Level Authorization'
        ]
        result.cwe = [
            'CWE-89 (SQL Injection)',
            'CWE-20 (Improper Input Validation)'
        ]
    }

    if (vulnName.startsWith("SQL Injection - Oracle")) {
        result.testCaseName = "Unsanitized user input in Oracle SQL queries";
        result.description = "Attackers inject malicious code into queries, bypassing security measures and potentially accessing data.";
        result.exploitability = "Widespread in web applications, injectable parameters can lead to data theft, control flow manipulation, and server compromise.";
        result.owasp = [
            'API1:2023 - Broken Object Level Authorization'
        ]
        result.cwe = [
            'CWE-89 (SQL Injection)',
            'CWE-20 (Improper Input Validation)'
        ]
    }

    if (vulnName.startsWith("SQL Injection - PostgreSQL")) {
        result.testCaseName = "Unsanitized user input in PostgreSQL queries.";
        result.description = "Malicious code injected through user input manipulates database queries.";
        result.exploitability = "Infiltrators can steal data, modify databases, or gain unauthorized access.";
        result.owasp = [
            'API1:2023 - Broken Object Level Authorization'
        ]
        result.cwe = [
            'CWE-89 (SQL Injection)',
            'CWE-20 (Improper Input Validation)'
        ]
    }

    if (vulnName.startsWith("Possible Username Enumeration")) {
        result.testCaseName = "Leaking user existence";
        result.description = "Attacker discovers valid usernames through application responses.";
        result.exploitability = "Fuels brute-force attacks, credential stuffing, social engineering.";
        result.owasp = [
            'API2:2023 - Broken Authentication'
        ]
        result.cwe = [
            'CWE-200 (Exposure of Sensitive Information to an Unauthorized Actor)'
        ]
    }

    if (vulnName.startsWith("Path Traversal")) {
        result.testCaseName = "Accessing unauthorized files/directories.";
        result.description = "Exploiting user input to navigate beyond intended folders. Vulnerable applications trust unvalidated user input for file paths.";
        result.exploitability = "Tricking app with \"../\" or absolute paths to reach sensitive files. Moderate effort, various tools available for attackers.";
        result.owasp = [
            'API1:2023 - Broken Object Level Authorization'
        ]
        result.cwe = [
            'CWE-22 (Path Traversal)',
            'CWE-434 (Unrestricted File Upload)'
        ]
    }

    if (vulnName.startsWith("Remote File Inclusion")) {
        result.testCaseName = "Including remote files instead of local.";
        result.description = "RFI tricks applications to run malicious code from an attacker's server. Unsanitized user input leads to this vulnerability.";
        result.exploitability = "Attackers can steal data, take over the server, or deface the website.";
        result.owasp = [
            'API1:2023 - Broken Object Level Authorization'
        ]
        result.cwe = [
            'CWE-400 (Uncontrolled Resource Consumption)',
            'CWE-78 (OS Command Injection)'
        ]
    }

    if (vulnName.startsWith("Insecure JSF ViewState")) {
        result.testCaseName = "Unsecured JSF application state";
        result.description = "JSF ViewState stores UI data, insecure version exposes information or allows tampering.";
        result.exploitability = "Attacker modifies ViewState to gain unauthorized access or manipulate data.";
        result.owasp = [
            'API2:2023 - Broken Authentication'
        ]
        result.cwe = [
            'CWE-20 (Improper Input Validation)',
            'CWE-502 (Deserialization of Untrusted Data)'
        ]
    }

    if (vulnName.startsWith("Charset Mismatch")) {
        result.testCaseName = "Character encoding discrepancy.";
        result.description = "Mismatch between declared & actual character sets in web content. This confuses browsers, displaying garbled text or enabling unintended behavior.";
        result.exploitability = "Attackers can inject malicious scripts using a different encoding, potentially leading to cross-site scripting (XSS).";
        result.owasp = [
            'API1:2023 - Broken Object Level Authorization'
        ]
        result.cwe = [
            'CWE-76 (Invalid Encoding)',
            'CWE-854 (Request Handling without Determining Charset)'
        ]
    }

    if (vulnName.startsWith("Server Side Code Injection")) {
        result.testCaseName = "Untrusted code execution on server.";
        result.description = "Injects malicious code into web server processes, granting attacker control.";
        result.exploitability = "Requires user input & poor validation, common in various web technologies.";
        result.owasp = [
            'API1:2023 - Broken Object Level Authorization'
        ]
        result.cwe = [
            'CWE-79 (Improper Neutralization of Special Elements used in an SQL Command (\'SQL Injection\'))',
            'CWE-89 (Improper Neutralization of Special Elements used in an OS Command (\'OS Command Injection\'))'
        ]
    }

    if (vulnName.startsWith("Remote OS Command Injection")) {
        result.testCaseName = "Unsanitized user input executes OS commands.";
        result.description = "Vulnerable applications treat user input as commands, allowing attackers to control system actions.";
        result.exploitability = "Injections can be hidden within various inputs (forms, URLs). Attackers can gain unauthorized access, steal data, or disrupt systems.";
        result.owasp = [
            'API2:2023 - Broken Authentication'
        ]
        result.cwe = [
            'CWE-78 (OS Command Injection)',
            'CWE-807 (Improper Neutralization of Special Elements used in an OS Command (\'Shell Injection\'))'
        ]
    }

    if (vulnName.startsWith("XPath Injection")) {
        result.testCaseName = "Malicious input in XPath queries.";
        result.description = "Exploiting applications that build XML queries with user input. Attackers craft inputs to manipulate queries, potentially accessing unauthorized data.";
        result.exploitability = "Requires user input used in XPath queries. Moderate effort, potential for data breaches.";
        result.owasp = [
            'API1:2023 - Broken Object Level Authorization'
        ]
        result.cwe = [
            'CWE-643: Improper Neutralization of Special Elements used in an XPath Expression',
            'CWE-798: Cross-site Scripting (XSS)'
        ]
    }

    if (vulnName.startsWith("Application Error Disclosure")) {
        result.testCaseName = "Revealing sensitive info in error messages.";
        result.description = "Application exposes details like file paths or internal configurations in error messages.";
        result.exploitability = "Attackers can use leaked info to craft further attacks or gain insights into application internals.";
        result.owasp = [
            'API8:2023 - Security Misconfiguration'
        ]
        result.cwe = [
            'CWE-200 (Exposure of Sensitive Information to an Unauthorized Actor)',
            'CWE-611 (Information Exposure Through Error Messages)'
        ]
    }

    if (vulnName.startsWith("XML External Entity Attack")) {
        result.testCaseName = "Insecure processing of external data in XML.";
        result.description = "XXE lets attackers inject malicious code into XML data. This code can steal files, perform denial-of-service attacks, or execute on the server.";
        result.exploitability = "Weak parser configurations and untrusted XML sources increase risk. Can be automated in scans and lead to significant breaches.";
        result.owasp = [
            'API8:2023 - Security Misconfiguration'
        ]
        result.cwe = [
            'CWE-611: Improper Restriction of External Entity References in XML'
        ]
    }

    if (vulnName.startsWith("Generic Padding Oracle")) {
        result.testCaseName = "Encryption flaw leaks padding info.";
        result.description = "Attackers manipulate padding in encrypted data to trick applications, revealing decryption errors. This allows attackers to decrypt sensitive information.";
        result.exploitability = "Requires modifying encrypted data and observing application response. Can be complex but yields valuable data.";
        result.owasp = [
            'API8:2023 - Security Misconfiguration'
        ]
        result.cwe = [
            'CWE-317 [Improper Cryptographic Use]',
            'CWE-209 [Information Leakage Through Unexpected Channels]'
        ]
    }

    if (vulnName.startsWith("Expression Language Injection")) {
        result.testCaseName = "Malicious code injection in expressions.";
        result.description = "Untrusted input triggers server-side code execution, exposing data and compromising functionality.";
        result.exploitability = "Requires user input and weak validation. Impact depends on expression language capabilities.";
        result.owasp = [
            'API1:2023 - Broken Object Level Authorization'
        ]
        result.cwe = [
            'CWE-917: Improper Neutralization of Special Elements used in an Expression Language Statement'
        ]
    }

    if (vulnName.startsWith("SOAP Action Spoofing")) {
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

    if (vulnName.startsWith("Insecure HTTP Method")) {
        result.testCaseName = "Unintended actions with HTTP methods.";
        result.description = "Enabling methods like PUT/DELETE without proper controls allows unauthorized actions.";
        result.exploitability = "Attackers can modify or delete data through crafted requests.";
        result.owasp = [
            'API2:2023 - Broken Authentication'
        ]
        result.cwe = [
            'CWE-201 (Sensitive Data Exposure)',
            'CWE-680 (Striped Functionality)'
        ]
    }

    if (vulnName.startsWith("WSDL File Passive Scanner")) {
        result.testCaseName = "Insecure parsing of WSDL files.";
        result.description = "Scans WSDL files for potential security vulnerabilities. Can identify insecure configurations or exposed functionalities. Often used as part of web application security testing.";
        result.exploitability = "Passive scanner, doesn't actively exploit vulnerabilities. Relies on identifying weaknesses in WSDL configuration. May require manual exploitation after identifying weaknesses.";
        result.owasp = [
            'API2:2023 - Broken Authentication'
        ]
        result.cwe = [
            'CWE-200: Information Exposure'
        ]
    }

    if (vulnName.startsWith("Loosely Scoped Cookie")) {
        result.testCaseName = "Unrestricted cookie scope";
        result.description = "Cookies accessible by more than intended subdomains, exposing data.";
        result.exploitability = "Enables attackers on subdomains to steal sensitive information.";
        result.owasp = [
            'API2:2023 - Broken Authentication'
        ]
        result.cwe = [
            'CWE-611 (Exposure of Sensitive Data Through Unintended Channel)'
        ]
    }


    // Below are unused    
    /*
    
    if(vulnName.startsWith("In Page Banner Information Leak")){
        result.testCaseName = "In-Page Error Message Information Leak";
        result.description = "Application displays error messages containing sensitive details directly in the user's browser window. Attackers can view these messages to gain unauthorized information.";
        result.exploitability = "Easy to exploit if sensitive data (error codes, internal references) is displayed. Requires access to the user interface during an error condition.";
        result.owasp = [
            'API8:2023 - Security Misconfiguration'
        ];
        result.cwe = [
            'CWE-201 (Exposure of Sensitive Data Through Untrusted Data Channels)',
            'CWE-202 (Credential Exposure)'
        ];
    }
    
    if(vulnName.startsWith("Re-examine Cache-control Directives")){
        result.testCaseName = "Improper Cache-Control Directives";
        result.description = "Lack of proper Cache-Control directives allows browsers/proxies to cache outdated content. Users might see old information, impacting security or functionality.";
        result.exploitability = "Easy to exploit if sensitive content (login forms, data updates) is cached. Requires no specific attacker action, just relying on cached data.";
        result.owasp = [
            'API8:2023 - Security Misconfiguration'
        ];
        result.cwe = [
            'CWE-611 (Exposure of Sensitive Data Through Web Cache)',
            'CWE-665 (Improper Authorization Level Control)'
        ];
    }
    
    if(vulnName.startsWith("Information Disclosure - Sensitive Information in URL")){
        result.testCaseName = "Sensitive Information in URL";
        result.description = "App reveals sensitive info (passwords, tokens) in the URL, visible to anyone who sees the link. Attackers can steal this data.";
        result.exploitability = "Easy to exploit for attackers if sensitive data is in the URL. Requires social engineering or accidentally sharing the link.";
        result.owasp = [
            'API1:2023 - Broken Object Level Authorization'
        ];
        result.cwe = [
            'CWE-201 (Exposure of Sensitive Data Through Untrusted Data Channels)',
            'CWE-804 (Insecure Direct Object References)'
        ];
    }
    
    if(vulnName.startsWith("Open Redirect")){
        result.testCaseName = "Open Redirect";
        result.description = "Application redirects user to attacker-controlled URL based on user input. Attacker can steal credentials or perform phishing attacks.";
        result.exploitability = "Easy to exploit if application blindly trusts user-supplied URLs in redirects. Requires attacker to identify vulnerable endpoint and craft URL.";
        result.owasp = [
            'API7:2023 - Server Side Request Forgery'
        ];
        result.cwe = [
            'CWE-601 (URL Redirection Tampering)',
            'CWE-937 (Redirect Manipulation)'
        ];
    }
    
    if(vulnName.startsWith("Cookie Poisoning")){
        result.testCaseName = "Cookie Poisoning";
        result.description = "Attacker alters victim's cookies to impersonate them or gain unauthorized access to accounts. This can be done through XSS attacks or tricking users into clicking malicious links.";
        result.exploitability = "Depends on cookie content (session IDs, tokens) and website security. XSS attacks or social engineering are required.";
        result.owasp = [
            'API8:2023 - Security Misconfiguration'
        ];
        result.cwe = [
            'CWE-201 (Exposure of Sensitive Data Through Untrusted Data Channels)',
            'CWE-306 (Tampering with URL Parameters)'
        ];
    }
    
    if(vulnName.startsWith("Heartbleed OpenSSL Vulnerability")){
        result.testCaseName = "Heartbleed OpenSSL Vulnerability";
        result.description = "Bug in OpenSSL library allows attackers to steal encryption keys and user data from vulnerable servers. This breaks communication security.";
        result.exploitability = "Moderate. Requires attacker to know the server is vulnerable and exploit the specific flaw.";
        result.owasp = [
            'API8:2023 - Security Misconfiguration'
        ];
        result.cwe = [
            'CWE-89 (Improper Neutralization of Special Elements used in an SQL Command (\'SQL Injection\'))',
            'CWE-201 (Exposure of Sensitive Data Through Untrusted Data Channels)'
        ];
    }
    
    if(vulnName.startsWith("Strict-Transport-Security Header")){
        result.testCaseName = "Missing Strict-Transport-Security Header";
        result.description = "Web server doesn't enforce HTTPS, allowing attackers to intercept traffic or downgrade to insecure HTTP.";
        result.exploitability = "Moderate. Requires MitM attack or attacker controlling network. More dangerous with sensitive data exchange.";
        result.owasp = [
            'API8:2023 - Security Misconfiguration'
        ];
        result.cwe = [
            'CWE-295 (Improper Access Control)',
            'CWE-319 (Improper Restriction of Operations within a Session)'
        ];
    }
    
    if(vulnName.startsWith("HTTP Server Response Header")){
        result.testCaseName = "Sensitive Data in Server Response Headers";
        result.description = "Sensitive information leaks in server response headers due to misconfiguration. Attackers can exploit this to steal data or gain insights.";
        result.exploitability = "Varies depending on leaked data. Easy for attackers to intercept headers. May require additional information for full exploitation.";
        result.owasp = [
            'API8:2023 - Security Misconfiguration'
        ];
        result.cwe = [
            'CWE-201 (Exposure of Sensitive Data Through Untrusted Data Channels)',
            'CWE-611 (Exposure of Non-Public Information Through Debug Information)'
        ];
    }
    
    if(vulnName.startsWith("Server Leaks Information via \"X-Powered-By\" HTTP Response Header Field(s)")){
        result.testCaseName = "Leaky Server Information via X-Powered-By Header";
        result.description = "Server reveals details (software, frameworks) in response header. Attackers can use this info to target vulnerabilities.";
        result.exploitability = "Low impact, but aids attackers. Requires knowledge of specific software/framework vulnerabilities.";
        result.owasp = [
            'API8:2023 - Security Misconfiguration'
        ];
        result.cwe = [
            'CWE-201 (Exposure of Sensitive Data Through Untrusted Data Channels)',
            'CWE-613 (Sensitive Data Leakage)'
        ];
    }
    
    if(vulnName.startsWith("Content Security Policy (CSP) Header Not Set")){
        result.testCaseName = "Missing Content Security Policy Header";
        result.description = "Website lacks Content Security Policy (CSP), allowing unauthorized scripts and preventing attack mitigation.";
        result.exploitability = "Moderate. Attackers can inject malicious scripts (XSS) for data theft or site defacement. Requires some technical knowledge.";
        result.owasp = [
            'API8:2023 - Security Misconfiguration'
        ];
        result.cwe = [
            'CWE-20 (Improper Input Validation)',
            'CWE-676 (Cross-site Scripting (XSS))'
        ];
    }
    
    
    if(vulnName.startsWith("X-Backend-Server Header Information Leak")){
        result.testCaseName = "Backend Server Information Leak via X-Backend-Server Header";
        result.description = "Server reveals details (hostname, version) in \"X-Backend-Server\" header. Attackers can use this info to target backend systems or craft attacks.";
        result.exploitability = "Moderate. Requires intercepting traffic (MITM attack) to analyze headers. Valuable info for attackers if combined with other vulnerabilities.";
        result.owasp = [
            'API8:2023 - Security Misconfiguration'
        ];
        result.cwe = [
            'CWE-201 (Exposure of Sensitive Data Through Untrusted Data Channels)',
            'CWE-613 (Sensitive Data Exposure in Error Message)'
        ];
    }
    
    if(vulnName.startsWith("Secure Pages Include Mixed Content")){
        result.testCaseName = "Mixed Content on Secure Pages";
        result.description = "HTTPS page loads resources (images, scripts) via HTTP, exposing data to attackers.";
        result.exploitability = "Moderately easy. Attackers can intercept data or inject malicious content. Requires compromising user's connection.";
        result.owasp = [
            'API8:2023 - Security Misconfiguration'
        ];
        result.cwe = [
            'CWE-295 (Improper Access Control)',
            'CWE-311 (Missing Encryption When Needed)'
        ];
    }
    
    if(vulnName.startsWith("HTTP to HTTPS Insecure Transition in Form Post")){
        result.testCaseName = "Insecure HTTP to HTTPS Transition in Form Post";
        result.description = "Form data (potentially sensitive) sent over HTTP instead of HTTPS, exposing it to eavesdropping.";
        result.exploitability = "Moderate. Requires intercepting traffic (MITM attack) to steal data. More critical if sensitive information (passwords, credit cards) is submitted.";
        result.owasp = [
            'API8:2023 - Security Misconfiguration'
        ];
        result.cwe = [
            'CWE-319 (Cleartext Transmission of Sensitive Information)',
            'CWE-806 (Insecure Direct Object Reference (IDOR))'
        ];
    }
    
    if(vulnName.startsWith("HTTPS to HTTP Insecure Transition in Form Post")){
        result.testCaseName = "Insecure HTTPS to HTTP Transition in Form Post";
        result.description = "Form data (potentially sensitive) sent over HTTP instead of HTTPS, exposing it to eavesdropping.";
        result.exploitability = "Moderate. Requires intercepting traffic (MITM attack) to steal data. More critical if sensitive information (passwords, credit cards) is submitted.";
        result.owasp = [
            'API8:2023 - Security Misconfiguration'
        ];
        result.cwe = [
            'CWE-319 (Cleartext Transmission of Sensitive Information)',
            'CWE-806 (Insecure Direct Object Reference (IDOR))'
        ];
    }
    
    if(vulnName.startsWith("User Controllable JavaScript Event (XSS)")){
        result.testCaseName = "User Controllable JavaScript Event (XSS)";
        result.description = "Untrusted user input is incorporated into JavaScript code, allowing attackers to inject scripts that steal data or manipulate the application.";
        result.exploitability = "Easy to exploit if user input is directly inserted into JavaScript without proper validation or sanitization. Can be used for data theft, session hijacking, or defacement.";
        result.owasp = [
            'API10:2023 - Unsafe Consumption of APIs'
        ];
        result.cwe = [
            'CWE-79 (Cross-Site Scripting)',
            'CWE-804 (Command Injection via Untrusted Input in a JavaScript Environment)'
        ];
    }
    
    if(vulnName.startsWith("Big Redirect Detected (Potential Sensitive Information Leak)")){
        result.testCaseName = "Sensitive Information Leak via Redirect";
        result.description = "Application redirects user to a URL containing sensitive data (tokens, passwords) due to manipulated input. Attackers can steal this leaked data.";
        result.exploitability = "Moderately easy. Requires attacker to manipulate input and potentially intercept traffic (MITM) to steal data.";
        result.owasp = [
            'API8:2023 - Security Misconfiguration'
        ];
        result.cwe = [
            'CWE-601 (URL Redirection Tampering)',
            'CWE-201 (Exposure of Sensitive Data Through Untrusted Data Channels)'
        ];
    }
    
    if(vulnName.startsWith("Content Cacheability")){
        result.testCaseName = "Sensitive Content Cacheability";
        result.description = "API responses containing sensitive data (tokens, passwords) are cached by browsers or intermediaries, allowing unauthorized access later.";
        result.exploitability = "Depends on cache invalidation and user access controls. Easy to exploit if sensitive data is cached indefinitely and accessible to unauthorized users.";
        result.owasp = [
            'API8:2023 - Security Misconfiguration'
        ];
        result.cwe = [
            'CWE-201 (Exposure of Sensitive Data Through Untrusted Data Channels)',
            'CWE-611 (Information Exposure Through Insecure Data Storage)'
        ];
    }
    
    if(vulnName.startsWith("Retrieved from Cache")){
        result.testCaseName = "Stale Data Served from Cache";
        result.description = "Application serves outdated data from cache instead of fetching latest version, potentially exposing inconsistencies.";
        result.exploitability = "Low risk unless cached data is sensitive (e.g., financial info). Attacker might need additional vulnerabilities to exploit.";
        result.owasp = [
            'API8:2023 - Security Misconfiguration'
        ];
        result.cwe = [
            'CWE-611 (Data Injection)',
            'CWE-201 (Exposure of Sensitive Data Through Untrusted Data Channels)'
        ];
    }
    
    if(vulnName.startsWith("Cookie without SameSite Attribute")){
        result.testCaseName = "Cookie Without SameSite Attribute";
        result.description = "Cookie lacks \"SameSite\" attribute, making it vulnerable to being sent with cross-site requests. Attackers can potentially steal session IDs or other sensitive data.";
        result.exploitability = "Moderately exploitable. Requires attacker control over another site or crafting a specific scenario (CSRF) to steal data.";
        result.owasp = [
            'API8:2023 - Security Misconfiguration'
        ];
        result.cwe = [
            'CWE-619 (Improper Control of Resource Based on User Identity)',
            'CWE-894 (Improper Access Control of a File or Resource)'
        ];
    }
    
    if(vulnName.startsWith("X-Debug-Token Information Leak")){
        result.testCaseName = "X-Debug-Token Information Leak";
        result.description = "Server response includes X-Debug-Token header, revealing debugging data meant for development only. Attackers can exploit this to gain insights into app functionality.";
        result.exploitability = "Moderate. Requires intercepting the response (e.g., MITM attack) and knowledge of X-Debug functionality.";
        result.owasp = [
            'API8:2023 - Security Misconfiguration'
        ];
        result.cwe = [
            'CWE-201 (Exposure of Sensitive Data Through Untrusted Data Channels)',
            'CWE-611 (Exposure of Non-Public Information Through Debug Information)'
        ];
    }
    
    
    if(vulnName.startsWith("Username Hash Found")){
        result.testCaseName = "Username Hash Exposure";
        result.description = "Application exposes a hashed username in its response, revealing partial user information. Attackers can potentially use this hash for further attacks.";
        result.exploitability = "Depends on hashing algorithm strength. Weaker hashes increase risk of brute-forcing the original username. Requires analyzing the response.";
        result.owasp = [
            'API8:2023 - Security Misconfiguration'
        ];
        result.cwe = [
            'CWE-201 (Exposure of Sensitive Data Through Untrusted Data Channels)',
            'CWE-300 (Uncontrolled Disclosure of Private Information)'
        ];
    }
    
    if(vulnName.startsWith("GET for POST")){
        result.testCaseName = "GET Method Used for POST Actions";
        result.description = "API allows modifying data with a GET request, meant for creating data (POST). Attackers can manipulate data without proper authentication.";
        result.exploitability = "Depends on the impact of data modification. May require some knowledge of the API and specific values to exploit.";
        result.owasp = [
            'API2:2023 - Broken Authentication'
        ];
        result.cwe = [
            'CWE-269 (Improper Access Control)',
            'CWE-863 (Incorrectly Restricted Operation Within a Function)'
        ];
    }
    
    if(vulnName.startsWith("X-AspNet-Version Response Header")){
        result.testCaseName = "ASP.NET Version Disclosure";
        result.description = "Web server reveals ASP.NET framework version in \"X-AspNet-Version\" header. Attackers can use this info to target known vulnerabilities in that version.";
        result.exploitability = "Easy to discover. Attackers can exploit by launching targeted attacks against the specific ASP.NET version.";
        result.owasp = [
            'API8:2023 - Security Misconfiguration'
        ];
        result.cwe = [
            'CWE-201 (Exposure of Sensitive Data Through Untrusted Data Channels)',
            'CWE-613 (Sensitive Data Leakage)'
        ];
    }
    
    if(vulnName.startsWith("PII Disclosure")){
        result.testCaseName = "PII Disclosure";
        result.description = "API endpoint leaks Personally Identifiable Information (PII) like names, addresses, or social security numbers in its response. Attackers can exploit this to steal user data.";
        result.exploitability = "Depends on the type of PII exposed. Easier to exploit for high-risk data (e.g., credit card numbers). Requires access to the API (through hacking or misuse).";
        result.owasp = [
            'API10:2023 - Unsafe Consumption of APIs'
        ];
        result.cwe = [
            'CWE-200 (Exposure of Sensitive Information to an Unauthorized Actor)',
            'CWE-359 (Exposure of Private Personal Information to an Unauthorized Actor)'
        ];
    }
    
    if(vulnName.startsWith("Permissions Policy Header Not Set")){
        result.testCaseName = "Missing Permissions Policy Header";
        result.description = "API lacks \"Permissions-Policy\" header, limiting browser's ability to protect against features like unauthorized camera access.";
        result.exploitability = "Medium. Attackers can't directly exploit, but missing policy weakens browser security, potentially aiding other attacks.";
        result.owasp = [
            'API8:2023 - Security Misconfiguration'
        ];
        result.cwe = [
            'CWE-611 (Exposure of Private Implementation Details)',
            'CWE-894 (Improper Control of External Resource References)'
        ];
    }
    
    if(vulnName.startsWith("Timestamp Disclosure")){
        result.testCaseName = "Timestamp Disclosure";
        result.description = "Application leaks timestamps in responses, exposing development/server time or internal process timing. Attackers can use this data for timing attacks or gain insights into server operations.";
        result.exploitability = "Moderately exploitable. Useful for attackers in specific scenarios (e.g., correlation with other attacks, identifying server workload).";
        result.owasp = [
            'API8:2023 - Security Misconfiguration'
        ];
        result.cwe = [
            'CWE-201 (Exposure of Sensitive Data Through Untrusted Data Channels)',
            'CWE-798 (Use of Hardcoded Credentials)'
        ];
    }
    
    if(vulnName.startsWith("Hash Disclosure")){
        result.testCaseName = "Password Hash Disclosure";
        result.description = "Application stores passwords using weak or exposed hashes. Attackers can steal these hashes and crack them to access user accounts.";
        result.exploitability = "Depends on hash strength and storage method. Strong hashes with salting are harder to crack. Publicly accessible hashes are easier to exploit.";
        result.owasp = [
            'API6:2023 - Unrestricted Access to Sensitive Business Flows'
        ];
        result.cwe = [
            'CWE-311 (Missing Encryption)',
            'CWE-310 (Cryptographic Issues)'
        ];
    }
    
    if(vulnName.startsWith("User Agent Fuzzer")){
        result.testCaseName = "User Agent Fuzzing";
        result.description = "Attacker alters user agent to exploit flaws in how the application handles this data. This can lead to unauthorized access or unintended behavior.";
        result.exploitability = "Moderately difficult. Requires knowledge of specific vulnerabilities and crafting user agent strings to trigger them. Interception (MITM) might be needed.";
        result.owasp = [
            'API8:2023 - Security Misconfiguration'
        ];
        result.cwe = [
            'CWE-20 (Improper Input Validation)',
            'CWE-643 (Unrestricted Upload of File (with Dangerous Content))'
        ];
    }
    
    if(vulnName.startsWith("Authentication Request Identified")){
        result.testCaseName = "Authentication Request Log Message";
        result.description = "The message \"Authentication Request Identified\" alone doesn't provide enough information to define a vulnerability. It could be a legitimate log message during login attempts.";
        result.exploitability = "Not applicable without additional context. The message itself isn't exploitable.";
        result.owasp = [
            'API2:2023 - Broken Authentication'
        ];
        result.cwe = [
            'CWE-269 (Improper Access Control)',
            'CWE-863 (Incorrectly Restricted Operation Within a Function)'
        ];
    }
    
    if(vulnName.startsWith("Session Management Response Identified")){
        result.testCaseName = "Session Management Details in Response";
        result.description = "API response leaks information about user session (ID, state), potentially aiding attackers.";
        result.exploitability = "Varies depending on leaked details. Can be used for session hijacking or identifying valid sessions for brute-force attacks. Requires intercepting the response.";
        result.owasp = [
            'API1:2023 - Broken Object Level Authorization'
        ];
        result.cwe = [
            'CWE-201 (Exposure of Sensitive Data Through Untrusted Data Channels)',
            'CWE-385 (Buffer Overflow) (if implementation flaw causes leak)'
        ];
    }
    
    
    
    if(vulnName.startsWith("Verification Request Identified")){
        result.testCaseName = "Verification Request Exposure";
        result.description = "API reveals details about a verification process (e.g., account verification) through an error message, potentially aiding attackers.";
        result.exploitability = "Depends on information exposed. Can help attackers bypass verification or craft targeted attacks. Requires access to the error message.";
        result.owasp = [
            'API2:2023 - Broken Authentication'
        ];
        result.cwe = [
            'CWE-201 (Exposure of Sensitive Data Through Untrusted Data Channels)',
            'CWE-522 (Insufficient Proper Input Validation)'
        ];
    }
    
    if(vulnName.startsWith("SQL Injection - MsSQL")){
        result.testCaseName = "SQL Injection in MsSQL";
        result.description = "Unsanitized user input in SQL statements allows attackers to execute unauthorized commands, potentially stealing data or compromising the database.";
        result.exploitability = "Moderately easy. Requires crafting specific input to bypass filters and depends on the application logic and data access permissions.";
        result.owasp = [
            'API4:2023 - Unrestricted Resource Consumption'
        ];
        result.cwe = [
            'CWE-89 (Improper Neutralization of Special Elements used in an SQL Command)',
            'CWE-20 (Improper Input Validation)'
        ];
    }
    
    if(vulnName.startsWith("ELMAH Information Leak")){
        result.testCaseName = "ELMAH Error Information Leak";
        result.description = "ELMAH (error logging module) leaks sensitive info (passwords, stack traces) in error messages displayed on web pages.";
        result.exploitability = "Easy to exploit if accessed by unauthorized users. Requires tricking users into triggering errors (social engineering).";
        result.owasp = [
            'API8:2023 - Security Misconfiguration'
        ];
        result.cwe = [
            'CWE-201 (Exposure of Sensitive Data Through Untrusted Data Channels)',
            'CWE-894 (Improper Control of Error Message Information)'
        ];
    }
    
    if(vulnName.startsWith("Trace.axd Information Leak")){
        result.testCaseName = "Trace.axd Information Leak";
        result.description = "ASP.NET application exposes sensitive info through Trace.axd, a debugging tool. Attackers can access this to steal data.";
        result.exploitability = "Moderate. Requires knowledge of ASP.NET and possibly server access/social engineering to trigger trace information.";
        result.owasp = [
            'API8:2023 - Security Misconfiguration'
        ];
        result.cwe = [
            'CWE-201 (Exposure of Sensitive Data Through Untrusted Data Channels)',
            'CWE-611 (Information Exposure Through Insecure Configuration)'
        ];
    }
    
    if(vulnName.startsWith(".htaccess Information Leak")){
        result.testCaseName = "HTACCESS Information Leak";
        result.description = "Server misconfiguration leaks sensitive data through access control rules in the .htaccess file. Attackers can exploit this to gain unauthorized access to information.";
        result.exploitability = "Depends on exposed data (passwords, paths). Requires server access or tricking users into revealing the info.";
        result.owasp = [
            'API8:2023 - Security Misconfiguration'
        ];
        result.cwe = [
            'CWE-201 (Exposure of Sensitive Data Through Untrusted Data Channels)',
            'CWE-611 (Information Exposure Through Unintended Channel)'
        ];
    }
    
    if(vulnName.startsWith(".env Information Leak")){
        result.testCaseName = "Environment File Information Leak";
        result.description = "Application leaks information from a .env file containing secrets (passwords, API keys) due to improper access control. Attackers can exploit this to gain unauthorized access.";
        result.exploitability = "Easy to exploit if .env is publicly accessible (web root, server misconfiguration). Requires attacker access to the system.";
        result.owasp = [
            'API8:2023 - Security Misconfiguration'
        ];
        result.cwe = [
            'CWE-200 (Exposure of Sensitive Information to an Unauthorized Actor)',
            'CWE-611 (Exposure of Private Implementation Details)'
        ];
    }
    
    if(vulnName.startsWith("Hidden File Finder")){
        result.testCaseName = "Hidden File Finder";
        result.description = "Malicious tool scans for hidden files and directories on a server, potentially revealing sensitive data.";
        result.exploitability = "Easy to exploit if server doesn't restrict directory listing and common hidden file naming conventions are used.";
        result.owasp = [
            'API8:2023 - Security Misconfiguration'
        ];
        result.cwe = [
            'CWE-22 (Path Traversal)',
            'CWE-434 (Unrestricted File Upload)'
        ];
    }
    
    if(vulnName.startsWith("Spring Actuator Information Leak")){
        result.testCaseName = "Spring Actuator Information Leak";
        result.description = "Improperly configured Spring Actuator exposes sensitive information about the application. Attackers can exploit this to gain unauthorized access or steal data.";
        result.exploitability = "Varies depending on exposed endpoints. Easy to exploit if sensitive info (credentials, endpoints) is accessible. Requires attacker knowledge of Spring Actuator.";
        result.owasp = [
            'API8:2023 - Security Misconfiguration'
        ];
        result.cwe = [
            'CWE-201 (Exposure of Sensitive Data Through Untrusted Data Channels)',
            'CWE-611 (Information Exposure Through Insecure Direct Object References)'
        ];
    }
    
    if(vulnName.startsWith("Log4Shell")){
        result.testCaseName = "Log4Shell Remote Code Execution";
        result.description = "Flaw in Log4j library allows attackers to run malicious code on vulnerable systems. Grants full control if exploited.";
        result.exploitability = "Easy to exploit remotely. Requires sending crafted data to a vulnerable application. Widespread due to Log4j usage.";
        result.owasp = [
            'API5:2023 - Broken Function Level Authorization'
        ];
        result.cwe = [
            'CWE-20 (Improper Input Validation)',
            'CWE-400 (Unrestricted File Upload)'
        ];
    }
    
    if(vulnName.startsWith("Spring4Shell")){
        result.testCaseName = "Spring4Shell Remote Code Execution";
        result.description = "Spring4Shell (CVE-2022-22965) allows attackers to execute malicious code on vulnerable Java applications using Spring.";
        result.exploitability = "High. Attackers can exploit via crafted HTTP requests. Especially dangerous due to widespread Spring Framework usage.";
        result.owasp = [
            'API1:2023 - Broken Object Level Authorization'
        ];
        result.cwe = [
            'CWE-20 (Improper Input Validation)',
            'CWE-502 (Deserialization of Untrusted Data)'
        ];
    }
    
    if(vulnName.startsWith("Remote File Inclusion")){
        result.testCaseName = "Remote File Inclusion";
        result.description = "Application includes a file from an external URL based on user input. Attacker can trick it to include malicious code for unauthorized access or attacks.";
        result.exploitability = "Moderately easy. Requires attacker knowledge of directory structure and vulnerable code. Can be used for code execution, sensitive data theft, or denial-of-service.";
        result.owasp = [
            'API1:2023 - Broken Object Level Authorization'
        ];
        result.cwe = [
            'CWE-400 (Unrestricted File Upload)',
            'CWE-78 (OS Command Injection)'
        ];
    }
    
    if(vulnName.startsWith("Java Serialization Object")){
        result.testCaseName = "Java Serialization Vulnerability";
        result.description = "Deserializing untrusted data can create malicious objects, potentially allowing attackers to execute code on the server.";
        result.exploitability = "Depends on the implementation and context. Requires untrusted data to be deserialized and can vary in difficulty.";
        result.owasp = [
            'API8:2023 - Security Misconfiguration'
        ];
        result.cwe = [
            'CWE-502 (Deserialization of Untrusted Data)',
            'CWE-20 (Improper Input Validation)'
        ];
    }
    
    if(vulnName.startsWith("Sub Resource Integrity Attribute Missing")){
        result.testCaseName = "Missing Sub Resource Integrity (SRI) Attribute";
        result.description = "External scripts/stylesheets lack verification, allowing attackers to inject malicious code.";
        result.exploitability = "Moderate. Requires compromising the external resource source or MITM attack to inject code.";
        result.owasp = [
            'API8:2023 - Security Misconfiguration'
        ];
        result.cwe = [
            'CWE-937 (Remote Code Execution)',
            'CWE-79 (Improper Neutralization of Input During Web Page Generation)'
        ];
    }
    
    if(vulnName.startsWith("Insufficient Site Isolation Against Spectre Vulnerability")){
        result.testCaseName = "Spectre Vulnerability Due to Insufficient Site Isolation";
        result.description = "Web app vulnerability allowing attackers to steal data from other users through Spectre side-channel attacks. Insufficient isolation lets attackers infer information from processing on other users' data.";
        result.exploitability = "Moderate difficulty. Requires knowledge of Spectre techniques and the application's code. More feasible on local networks or shared hosting.";
        result.owasp = [
            'API8:2023 - Security Misconfiguration'
        ];
        result.cwe = [
            'CWE-200 (Exposure of Sensitive Information to an Unauthorized Actor)',
            'CWE-894 (Improper Control of Resource Usage)'
        ];
    }
    
    if(vulnName.startsWith("XSLT Injection")){
        result.testCaseName = "XSLT Injection";
        result.description = "Untrusted data injected into XSL stylesheets can be executed, potentially leading to data breaches or server compromise.";
        result.exploitability = "Requires crafting malicious XSL code and injecting it into a vulnerable application. Can be difficult for low-skilled attackers.";
        result.owasp = [
            'API10:2023 - Unsafe Consumption of APIs'
        ];
        result.cwe = [
            'CWE-676 (Unrestricted File Upload)',
            'CWE-937 (XML Injection)'
        ];
    }
    
    if(vulnName.startsWith("SOAP XML Injection")){
        result.testCaseName = "SOAP XML Injection";
        result.description = "Application processes user-supplied data in SOAP requests without proper validation. Attackers can inject malicious XML code to manipulate data, steal information, or take control of the system.";
        result.exploitability = "Moderately difficult. Requires crafting a valid SOAP message with malicious XML payload. Successful exploitation depends on the application's functionality and access controls.";
        result.owasp = [
            'API1:2023 - Broken Object Level Authorization'
        ];
        result.cwe = [
            'CWE-611 (Data Injection)',
            'CWE-200 (Improper Resource Handling)'
        ];
    }
    
    if(vulnName.startsWith("WSDL File Detection")){
        result.testCaseName = "WSDL File Exposure";
        result.description = "Public WSDL file reveals details of web services (operations, parameters). Attackers can use this to exploit vulnerabilities or launch attacks.";
        result.exploitability = "Moderately easy. Needs access to the WSDL file. Highly exploitable if sensitive information (internal functions, authentication details) is present.";
        result.owasp = [
            'API1:2023 - Broken Object Level Authorization'
        ];
        result.cwe = [
            'CWE-651 (Exposure of Sensitive Information Through File Handling Errors)',
            'CWE-200 (Exposure of Sensitive Information to an Unauthorized Actor)'
        ];
    }
    
    if(vulnName.startsWith("Cloud Metadata Potentially Exposed")){
        result.testCaseName = "Exposed Cloud Metadata";
        result.description = "Cloud instance metadata (e.g., IP address, security credentials) leaks due to misconfiguration, allowing attackers to gain valuable intel or compromise the system.";
        result.exploitability = "Moderately easy. Requires attacker access to the vulnerable endpoint and knowledge of the specific cloud platform.";
        result.owasp = [
            'API8:2023 - Security Misconfiguration'
        ];
        result.cwe = [
            'CWE-201 (Exposure of Sensitive Data Through Untrusted Data Channels)',
            'CWE-89 (Improper Access Control)'
        ];
    }
    
    if(vulnName.startsWith("Server Side Template Injection")){
        result.testCaseName = "Server-Side Template Injection";
        result.description = "Attacker injects code into templates processed by the server, potentially taking control or stealing data.";
        result.exploitability = "Varies depending on template engine and context. May allow code execution, information disclosure, or denial-of-service.";
        result.owasp = [
            'API10:2023 - Unsafe Consumption of APIs'
        ];
        result.cwe = [
            'CWE-1336 (Improper Neutralization of Special Elements used in a Template Engine)',
            'CWE-79 (Improper Neutralization of Input During Web Page Generation)'
        ];
    }
    
    if(vulnName.startsWith("Server Side Template Injection (Blind)")){
        result.testCaseName = "Blind Server-Side Template Injection";
        result.description = "Untrusted data in templates gets processed, potentially allowing for code execution on the server. Effects might not be immediately visible.";
        result.exploitability = "Requires knowledge of template syntax and potential for delayed response. Difficulty depends on application logic and attacker skill.";
        result.owasp = [
            'API1:2023 - Broken Object Level Authorization'
        ];
        result.cwe = [
            'CWE-79 (Improper Neutralization of Input During Web Page Generation)',
            'CWE-89 (SQL Injection) (if applicable)'
        ];
    }
    
    if(vulnName.startsWith("Unexpected Content-Type")){
        result.testCaseName = "Unexpected Content-Type Handling";
        result.description = "API expects specific data format (Content-Type header), but accepts unexpected ones. Attackers might use this to bypass security checks or inject malicious data.";
        result.exploitability = "Depends on server behavior. May allow attackers to upload unauthorized files, inject scripts, or trigger unintended functionality.";
        result.owasp = [
            'API8:2023 - Security Misconfiguration'
        ];
        result.cwe = [
            'CWE-20 (Improper Input Validation)',
            'CWE-400 (Unrestricted File Upload)'
        ];
    }
    
    if(vulnName.startsWith("SOAP Action Spoofing")){
        result.testCaseName = "SOAP Action Spoofing";
        result.description = "Attacker modifies SOAP Action header to trick server into performing unintended functionalities. This can lead to unauthorized access or data manipulation.";
        result.exploitability = "Requires knowledge of valid SOAP Actions and potential for MitM attacks. More difficult to exploit if strong access control exists.";
        result.owasp = [
            'API1:2023 - Broken Object Level Authorization'
        ];
        result.cwe = [
            'CWE-287 (Improper Authentication)',
            'CWE-643 (Unrestricted Function Calls)'
        ];
    }
    */

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

    const { scanName, type, collectionUrl, projectId, projectPhase } = req.body;

    console.log('req.body:', req.body);

    //const originalname = req.file.originalname
    //const fileformat = originalname.split('.').pop();

    const newScan = new SOAPOrGraphQLScan({
        scanName: scanName,
        user: user._id,
        collectionUrl: collectionUrl,
        type: type,
        status: 'in progress',
        orgProject: projectId,
        projectPhase: projectPhase
    });
    newScan.save();    

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

    exec(toolCommand);

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


    try {
        const { id } = req.body;

        const scan = await SOAPOrGraphQLScan.findById(id);
        if (!scan) {
            return res.status(404).json({ error: 'Scan not found.' });
        }


        // Delete the scan
        const deletedScan = await SOAPOrGraphQLScan.findByIdAndDelete(id);
        if (!deletedScan) {
            return res.status(404).json({ error: 'Failed to delete the scan.' });
        }       

        // Delete related Vulnerabilities
        await SOAPOrGraphQLScanVulnerability.deleteMany({ soapOrGraphQLScan: id });

        const user = await User.findById(req.user._id)
        const organization = await Organization.findById(user.organization)
        calculateDashboard(organization);

        res.json({ message: 'Scan and related vulnerabilities deleted successfully.' });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }


});













