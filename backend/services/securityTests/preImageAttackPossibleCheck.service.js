function preImageAttackPossibleCheck(endpoint, headers, body) {
    
    let issueFound = false;
    let description = "";
    let findings = [];

    // Helper function to check for short hash patterns
    function checkForShortHashes(str) {
        const shortHashPattern = /\b[a-fA-F0-9]{1,31}\b/g;
        const matches = str.match(shortHashPattern);
        if (matches) {
            findings.push(`Potential short hash detected: ${matches.join(', ')}`);
            return true;
        }
        return false;
    }

    // Check URL for hash-related operations
    if (/hash|digest|checksum/i.test(endpoint.url)) {
        findings.push("Endpoint involves hash-related operations");
        
        // Check for insecure hash algorithms in the URL
        if (/md5|sha1/i.test(endpoint.url)) {
            issueFound = true;
            findings.push("Insecure hash algorithm (MD5 or SHA1) potentially in use");
        }
    }

    // Analyze headers
    Object.entries(headers).forEach(([key, value]) => {
        if (typeof value === 'string') {
            if (checkForShortHashes(value)) {
                issueFound = true;
            }
            if (/etag/i.test(key) && value.length < 32) {
                issueFound = true;
                findings.push("ETag header uses potentially weak hash");
            }
        }
    });

    // Analyze body
    let bodyString = typeof body === 'string' ? body : JSON.stringify(body);
    
    // Check for potential hash comparisons
    if (/compare|verify|check/i.test(bodyString) && /hash|digest|checksum/i.test(bodyString)) {
        findings.push("Potential hash comparison operation detected");
        
        if (checkForShortHashes(bodyString)) {
            issueFound = true;
        }
    }

    // Check for signs of improper hash usage
    const improperUsagePatterns = [
        { regex: /password.*hash/i, desc: "Possible direct password hash comparison" },
        { regex: /hash.*==/i, desc: "Potential unsafe hash comparison using '==' operator" },
        { regex: /md5|sha1/i, desc: "Use of weak hash algorithms (MD5 or SHA1)" }
    ];

    improperUsagePatterns.forEach(pattern => {
        if (pattern.regex.test(bodyString)) {
            issueFound = true;
            findings.push(pattern.desc);
        }
    });

    // Check for potential timing attack vulnerabilities
    if (/time|duration|elapsed/i.test(bodyString) && /hash|compare/i.test(bodyString)) {
        issueFound = true;
        findings.push("Potential timing attack vulnerability in hash comparison");
    }

    // Compile description from findings
    if (issueFound) {
        description = "Potential pre-image attack vulnerability detected. " + findings.join(". ");
    } else {
        description = "No clear signs of pre-image attack vulnerability found.";
    }

    return {
        issueFound,
        description,
        findings
    };
}

module.exports = {
    preImageAttackPossibleCheck,
};