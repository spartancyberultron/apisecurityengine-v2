/* Test for "Content Type Injection Possible" */
function contentTypeInjectionPossibleCheck(endpoint, headers, body) {
    
    let issueFound = false;
    let description = [];

    // Check if Content-Type header is present
    if (!headers['Content-Type']) {
        issueFound = true;
        description.push("Missing Content-Type header. This could allow an attacker to inject unexpected content types.");
    } else {
        const contentType = headers['Content-Type'].toLowerCase();

        // Check for suspicious or multiple Content-Type headers
        if (Array.isArray(headers['Content-Type'])) {
            issueFound = true;
            description.push("Multiple Content-Type headers detected. This could be exploited for content type injection.");
        }

        // Check for potentially dangerous content types
        const dangerousTypes = ['text/html', 'application/xhtml+xml', 'application/xml', 'text/xml'];
        if (dangerousTypes.some(type => contentType.includes(type))) {
            issueFound = true;
            description.push(`Potentially dangerous Content-Type detected: ${contentType}. This could allow injection of active content.`);
        }

        // Check for inconsistency between Content-Type and body content
        if (body) {
            if (contentType.includes('application/json') && !isValidJSON(body)) {
                issueFound = true;
                description.push("Content-Type is application/json but body is not valid JSON. This mismatch could be exploited.");
            }
            if (contentType.includes('application/xml') && !isValidXML(body)) {
                issueFound = true;
                description.push("Content-Type is application/xml but body is not valid XML. This mismatch could be exploited.");
            }
        }

        // Check for potential polyglot payloads
        if (body && typeof body === 'string') {
            if (body.includes('<?xml') && body.includes('{') && body.includes('}')) {
                issueFound = true;
                description.push("Potential polyglot (XML/JSON) payload detected. This could be used for content type injection.");
            }
        }

        // Check for charset manipulation in Content-Type
        if (contentType.includes('charset=') && !contentType.includes('charset=utf-8')) {
            issueFound = true;
            description.push("Non-UTF-8 charset detected in Content-Type. This could be used for encoding-based attacks.");
        }
    }

    // Check if the endpoint accepts file uploads
    if (endpoint.toLowerCase().includes('upload') || endpoint.toLowerCase().includes('file')) {
        issueFound = true;
        description.push("Endpoint appears to handle file uploads. Ensure strict content type validation is in place to prevent malicious file uploads.");
    }

    return {
        issueFound,
        description: description.join(" "),
    };
}

// Helper function to check if a string is valid JSON
function isValidJSON(str) {
    try {
        JSON.parse(str);
        return true;
    } catch (e) {
        return false;
    }
}

// Helper function to check if a string is valid XML
function isValidXML(str) {
    const parser = new DOMParser();
    const dom = parser.parseFromString(str, 'text/xml');
    return !dom.querySelector('parsererror');
}

module.exports = {
    contentTypeInjectionPossibleCheck,
};