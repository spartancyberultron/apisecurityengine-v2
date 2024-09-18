const url = require('url');

function brokenObjectLevelAuthorizationCheck(endpoint, headers, body) {
    let issueFound = false;
    let description = [];

    // Parse the endpoint URL
    const parsedUrl = new URL(endpoint);
    const pathSegments = parsedUrl.pathname.split('/').filter(Boolean);

    // Check for missing or weak authorization headers
    if (!headers['Authorization'] && !headers['X-API-Key']) {
        issueFound = true;
        description.push("No authorization header found. This may allow unauthorized access to objects.");
    }

    // Check for potential IDOR (Insecure Direct Object References) in the URL
    const potentialIdPattern = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$|^\d+$/;
    pathSegments.forEach((segment, index) => {
        if (potentialIdPattern.test(segment)) {
            issueFound = true;
            description.push(`Potential IDOR found in URL segment ${index + 1}. Ensure proper authorization checks are in place for accessing objects by ID.`);
        }
    });

    // Check for suspicious query parameters that might bypass authorization
    const suspiciousParams = ['admin', 'bypass', 'debug', 'test', 'role'];
    suspiciousParams.forEach(param => {
        if (parsedUrl.searchParams.has(param)) {
            issueFound = true;
            description.push(`Suspicious query parameter '${param}' found. This might be used to bypass object level authorization.`);
        }
    });

    // Check the request body for potential issues
    if (body) {
        // Check for attempts to modify object ownership
        if (body.owner_id || body.user_id) {
            issueFound = true;
            description.push("Request attempts to modify object ownership. Ensure proper authorization checks are in place.");
        }

        // Check for attempts to escalate privileges
        if (body.role || body.permissions || body.is_admin) {
            issueFound = true;
            description.push("Request attempts to modify user roles or permissions. This should be carefully restricted and validated.");
        }
    }

    // Check for common endpoints that might be vulnerable
    const sensitiveEndpoints = ['users', 'accounts', 'orders', 'transactions', 'documents'];
    sensitiveEndpoints.forEach(endpoint => {
        if (pathSegments.includes(endpoint)) {
            issueFound = true;
            description.push(`Sensitive endpoint '${endpoint}' detected. Ensure strict object level authorization is implemented.`);
        }
    });

    return {
        issueFound,
        description: description.join(" "),
    };
}

module.exports = {
    brokenObjectLevelAuthorizationCheck,
};