function excessiveDataExposureCheck(endpoint, headers, body) {
    
    let issueFound = false;
    let description = [];

    // Check response size
    const contentLength = headers['Content-Length'];
    if (contentLength && parseInt(contentLength) > 1000000) { // 1MB threshold
        issueFound = true;
        description.push("Large response detected. Consider pagination or limiting the data returned.");
    }

    // Check for sensitive data patterns in the response body
    if (body) {
        const sensitivePatterns = [
            { regex: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/, name: "email addresses" },
            { regex: /\b(?:\d{3}[-.]?){2}\d{4}\b/, name: "social security numbers" },
            { regex: /\b(?:\d{4}[-\s]?){3}\d{4}\b/, name: "credit card numbers" },
            { regex: /password\s*[:=]\s*["']?\w+["']?/i, name: "passwords" },
            { regex: /\btoken\s*[:=]\s*["']?\w+["']?/i, name: "tokens" },
            { regex: /\bsecret\s*[:=]\s*["']?\w+["']?/i, name: "secrets" },
            { regex: /\bapi[-_]?key\s*[:=]\s*["']?\w+["']?/i, name: "API keys" }
        ];

        let bodyString = typeof body === 'string' ? body : JSON.stringify(body);

        sensitivePatterns.forEach(pattern => {
            if (pattern.regex.test(bodyString)) {
                issueFound = true;
                description.push(`Potential exposure of sensitive data: ${pattern.name} detected in the response.`);
            }
        });
    }

    // Check for indications of data dumping
    if (body && typeof body === 'object') {
        const keys = Object.keys(body);
        if (keys.length > 20) { // Arbitrary threshold
            issueFound = true;
            description.push("Response contains a large number of fields. Consider implementing field selection or GraphQL to reduce data exposure.");
        }

        // Check for nested arrays or objects that might indicate bulk data retrieval
        const hasNestedArrays = JSON.stringify(body).includes('[[');
        const hasNestedObjects = JSON.stringify(body).includes('{{');
        if (hasNestedArrays || hasNestedObjects) {
            issueFound = true;
            description.push("Response contains nested arrays or objects, which might indicate bulk data retrieval. Consider implementing pagination.");
        }
    }

    // Check for specific headers that might indicate excessive data
    if (headers['X-Total-Count'] && parseInt(headers['X-Total-Count']) > 1000) {
        issueFound = true;
        description.push("Large total count detected. Ensure pagination is properly implemented.");
    }

    // Check endpoint for potential full data dump indicators
    const dumpIndicators = ['all', 'dump', 'export', 'backup'];
    if (dumpIndicators.some(indicator => endpoint.toLowerCase().includes(indicator))) {
        issueFound = true;
        description.push(`Endpoint "${endpoint}" suggests potential full data dump. Ensure this is intended and properly secured.`);
    }

    return {
        issueFound,
        description: description.join(" "),
    };
}

module.exports = {
    excessiveDataExposureCheck,
};