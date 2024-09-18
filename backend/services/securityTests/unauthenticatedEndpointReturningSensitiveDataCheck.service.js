function unauthenticatedEndpointReturningSensitiveDataCheck(endpoint, headers, body) {
    
    let issueFound = false;
    let description = [];

    // Check for authentication headers
    const authHeaders = ['authorization', 'x-api-key', 'api-key', 'token'];
    const hasAuthHeader = authHeaders.some(header => headers[header.toLowerCase()]);

    if (!hasAuthHeader) {

        // If no authentication header is present, check for sensitive data in the response
        const sensitivePatterns = [
            { regex: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/, name: "email" },
            { regex: /\b(?:\d{3}[-.]?){2}\d{4}\b/, name: "social security number" },
            { regex: /\b(?:\d{4}[-\s]?){3}\d{4}\b/, name: "credit card number" },
            { regex: /password\s*[:=]\s*["']?\w+["']?/i, name: "password" },
            { regex: /\btoken\s*[:=]\s*["']?\w+["']?/i, name: "token" },
            { regex: /\bsecret\s*[:=]\s*["']?\w+["']?/i, name: "secret" },
            { regex: /\bapi[-_]?key\s*[:=]\s*["']?\w+["']?/i, name: "API key" }
        ];

        let bodyString = typeof body === 'string' ? body : JSON.stringify(body);

        sensitivePatterns.forEach(pattern => {
            if (pattern.regex.test(bodyString)) {
                issueFound = true;
                description.push(`Potential exposure of sensitive data (${pattern.name}) in unauthenticated endpoint.`);
            }
        });

        // Check for endpoints that typically require authentication
        const sensitiveEndpoints = ['user', 'account', 'profile', 'admin', 'settings', 'password', 'email'];
        if (sensitiveEndpoints.some(e => endpoint.toLowerCase().includes(e))) {
            issueFound = true;
            description.push(`Potentially sensitive endpoint (${endpoint}) accessible without authentication.`);
        }

        // Check for response size that might indicate bulk data retrieval
        if (bodyString.length > 10000) { // Arbitrary threshold, adjust as needed
            issueFound = true;
            description.push("Large response body from unauthenticated endpoint. Potential bulk data exposure.");
        }

        // Check for specific data structures that might indicate sensitive information
        if (typeof body === 'object') {
            const sensitiveKeys = ['id', 'user_id', 'account_number', 'ssn', 'dob', 'address'];
            if (sensitiveKeys.some(key => key in body)) {
                issueFound = true;
                description.push("Response contains potentially sensitive data fields in an unauthenticated endpoint.");
            }
        }
    }

    return {
        issueFound,
        description: description.join(" ")
    };
}

module.exports = {
    unauthenticatedEndpointReturningSensitiveDataCheck,
};