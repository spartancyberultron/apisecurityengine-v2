function resourceDeletionPossibleCheck(endpoint, headers, body) {
    
    let issueFound = false;
    let description = [];

    // Check if the HTTP method is DELETE or if the endpoint suggests deletion
    const isDeletionEndpoint = endpoint.method === 'DELETE' || 
                               endpoint.url.toLowerCase().includes('delete') ||
                               endpoint.url.toLowerCase().includes('remove');

    if (isDeletionEndpoint) {
        // Check for proper authentication
        const authHeaders = ['authorization', 'x-api-key', 'api-key', 'token'];
        const hasAuthHeader = authHeaders.some(header => headers[header.toLowerCase()]);

        if (!hasAuthHeader) {
            issueFound = true;
            description.push("Deletion endpoint lacks proper authentication headers.");
        }

        // Check for CSRF token in headers for DELETE requests
        const hasCsrfToken = 'x-csrf-token' in headers || 'csrf-token' in headers;
        if (!hasCsrfToken) {
            issueFound = true;
            description.push("DELETE request lacks CSRF token, potentially vulnerable to CSRF attacks.");
        }

        // Check for confirmation mechanism in the body
        let bodyString = typeof body === 'string' ? body : JSON.stringify(body);
        const hasConfirmation = bodyString.includes('confirm') || bodyString.includes('verification');
        if (!hasConfirmation) {
            issueFound = true;
            description.push("Deletion request lacks a confirmation mechanism in the body.");
        }

        // Check if the endpoint includes an ID or specific resource identifier
        const hasResourceIdentifier = /\/[a-zA-Z0-9-_]+\/\d+/.test(endpoint.url) || 
                                      /\bid\b/.test(endpoint.url);
        if (!hasResourceIdentifier) {
            issueFound = true;
            description.push("Deletion endpoint does not specify a resource identifier, risking bulk deletion.");
        }

        // Check for potential bulk deletion capabilities
        if (bodyString.includes('bulk') || bodyString.includes('multiple') || 
            (typeof body === 'object' && Array.isArray(body.ids))) {
            issueFound = true;
            description.push("Endpoint appears to support bulk deletion, which requires careful access control.");
        }
    }

    // Check for indirect deletion via PUT or PATCH methods
    if (endpoint.method === 'PUT' || endpoint.method === 'PATCH') {
        let bodyString = typeof body === 'string' ? body : JSON.stringify(body);
        if (bodyString.includes('"deleted":true') || bodyString.includes('"active":false')) {
            issueFound = true;
            description.push(`${endpoint.method} request can potentially mark resource as deleted or inactive.`);
        }
    }

    return {
        issueFound,
        description: description.join(" ")
    };
}

module.exports = {
    resourceDeletionPossibleCheck,
};