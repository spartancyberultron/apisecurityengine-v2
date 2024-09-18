const url = require('url');

function brokenAuthenticationCheck(endpoint, headers, body) {
    
    let issueFound = false;
    let description = [];

    // Check if HTTPS is used
    const parsedUrl = new URL(endpoint);
    if (parsedUrl.protocol !== 'https:') {
        issueFound = true;
        description.push("The API endpoint is not using HTTPS, which can lead to man-in-the-middle attacks.");
    }

    // Check for missing or weak authentication headers
    if (!headers['Authorization'] && !headers['X-API-Key']) {
        issueFound = true;
        description.push("No authentication header (Authorization or X-API-Key) found.");
    } else if (headers['Authorization'] && headers['Authorization'].startsWith('Basic ')) {
        issueFound = true;
        description.push("Basic authentication is being used, which is generally considered insecure for APIs.");
    }

    // Check for weak password policy (if password is in the body)
    if (body && body.password) {
        if (body.password.length < 8) {
            issueFound = true;
            description.push("Weak password policy: password is less than 8 characters.");
        }
        if (!/[A-Z]/.test(body.password) || !/[a-z]/.test(body.password) || !/[0-9]/.test(body.password)) {
            issueFound = true;
            description.push("Weak password policy: password should contain uppercase, lowercase, and numbers.");
        }
    }

    // Check for potential session-related issues
    if (headers['Set-Cookie']) {
        const cookieHeader = headers['Set-Cookie'];
        if (!cookieHeader.includes('HttpOnly')) {
            issueFound = true;
            description.push("Session cookie is not set with HttpOnly flag, making it vulnerable to XSS attacks.");
        }
        if (!cookieHeader.includes('Secure')) {
            issueFound = true;
            description.push("Session cookie is not set with Secure flag, allowing transmission over non-HTTPS connections.");
        }
        if (!cookieHeader.includes('SameSite')) {
            issueFound = true;
            description.push("Session cookie is not set with SameSite attribute, potentially vulnerable to CSRF attacks.");
        }
    }

    // Check for missing or weak CORS policy
    if (headers['Access-Control-Allow-Origin'] === '*') {
        issueFound = true;
        description.push("CORS policy is set to allow all origins (*), which can be a security risk.");
    }

    return {
        issueFound,
        description: description.join(" "),
    };
}

module.exports = {
    brokenAuthenticationCheck,
};