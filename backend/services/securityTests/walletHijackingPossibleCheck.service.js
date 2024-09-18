function walletHijackingPossibleCheck(endpoint, headers, body) {
    
    let issueFound = false;
    let description = [];

    // Check if the endpoint is related to wallet operations
    const walletRelatedEndpoint = /wallet|account|transfer|withdraw|deposit|transaction/i.test(endpoint.url);

    if (walletRelatedEndpoint) {
        // Check for proper authentication
        const authHeaders = ['authorization', 'x-api-key', 'api-key', 'token'];
        const hasAuthHeader = authHeaders.some(header => headers[header.toLowerCase()]);

        if (!hasAuthHeader) {
            issueFound = true;
            description.push("Wallet-related endpoint lacks proper authentication headers.");
        }

        // Check for secure connection
        if (!endpoint.url.startsWith('https')) {
            issueFound = true;
            description.push("Wallet operation not using HTTPS, risking data interception.");
        }

        // Check for potential sensitive data in URL
        if (/key|seed|private/i.test(endpoint.url)) {
            issueFound = true;
            description.push("Potential sensitive wallet data exposed in URL.");
        }

        // Analyze body for suspicious patterns
        let bodyString = typeof body === 'string' ? body : JSON.stringify(body);

        // Check for operations that might indicate hijacking attempts
        const suspiciousOperations = [
            { regex: /change.*address/i, desc: "address change" },
            { regex: /update.*key/i, desc: "key update" },
            { regex: /new.*owner/i, desc: "ownership transfer" },
            { regex: /reset.*password/i, desc: "password reset" },
            { regex: /add.*device/i, desc: "new device addition" }
        ];

        suspiciousOperations.forEach(op => {
            if (op.regex.test(bodyString)) {
                issueFound = true;
                description.push(`Potential wallet hijacking: ${op.desc} operation detected.`);
            }
        });

        // Check for large value transfers
        if (/amount|value|sum/i.test(bodyString)) {
            const amountMatch = bodyString.match(/["']?(\d+(?:\.\d+)?)["']?/);
            if (amountMatch && parseFloat(amountMatch[1]) > 10000) { // Arbitrary threshold
                issueFound = true;
                description.push("Large value transfer detected, ensure proper authorization checks.");
            }
        }

        // Check for multi-factor authentication on critical operations
        if (endpoint.method !== 'GET' && !headers['x-mfa-token']) {
            issueFound = true;
            description.push("Critical wallet operation without multi-factor authentication.");
        }

        // Check for potential data leakage in response
        if (body && typeof body === 'object') {
            const sensitiveFields = ['privateKey', 'seedPhrase', 'mnemonic', 'secret'];
            if (sensitiveFields.some(field => field in body)) {
                issueFound = true;
                description.push("Response contains sensitive wallet data.");
            }
        }
    }

    return {
        issueFound,
        description: description.join(" ")
    };
}

module.exports = {
    walletHijackingPossibleCheck,
};