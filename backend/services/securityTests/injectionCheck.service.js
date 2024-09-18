function injectionCheck(endpoint, headers, body) {


    let issueFound = false;
    let description = [];

    // Helper function to check for injection patterns
    function checkInjection(data, patterns, injectionType) {
        for (let pattern of patterns) {
            if (pattern.test(data)) {
                issueFound = true;
                description.push(`Potential ${injectionType} injection detected: ${pattern}`);
            }
        }
    }

    // SQL Injection patterns
    const sqlPatterns = [
        /('|")?\s*(OR|AND)\s*('|")?\s*['"]?\s*[0-9]+\s*['"]?\s*(=|>|<|>=|<=)\s*['"]?\s*[0-9]+/i,
        /UNION\s+(ALL\s+)?SELECT/i,
        /;\s*DROP\s+TABLE/i,
        /'\s*OR\s*'1'='1/i,
        /--/,
        /\/\*/,
        /EXEC(\s|\+)+(x|%)(p|%)/i
    ];

    // NoSQL Injection patterns
    const noSqlPatterns = [
        /\$where\s*:/i,
        /\$regex\s*:/i,
        /\$ne\s*:/i,
        /\$gt\s*:/i,
        /\{\s*\$\s*\{/
    ];

    // OS Command Injection patterns
    const osCommandPatterns = [
        /;\s*rm\s+-rf/i,
        /\|\s*wget/i,
        /`.*`/,
        /\$\(.*\)/
    ];

    // XSS patterns
    const xssPatterns = [
        /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/i,
        /javascript\s*:/i,
        /on\w+\s*=/i,
        /data\s*:\s*text\/html/i
    ];

    // Check headers
    for (let [headerName, headerValue] of Object.entries(headers)) {
        if (typeof headerValue === 'string') {
            checkInjection(headerValue, sqlPatterns, 'SQL');
            checkInjection(headerValue, noSqlPatterns, 'NoSQL');
            checkInjection(headerValue, osCommandPatterns, 'OS Command');
            checkInjection(headerValue, xssPatterns, 'XSS');
        }
    }

    // Check body
    if (body) {
        let bodyString = typeof body === 'string' ? body : JSON.stringify(body);
        checkInjection(bodyString, sqlPatterns, 'SQL');
        checkInjection(bodyString, noSqlPatterns, 'NoSQL');
        checkInjection(bodyString, osCommandPatterns, 'OS Command');
        checkInjection(bodyString, xssPatterns, 'XSS');

        // Additional check for JSON-based NoSQL injection
        if (typeof body === 'object') {
            const jsonString = JSON.stringify(body);
            if (jsonString.includes('$where') || jsonString.includes('$ne') || jsonString.includes('$gt')) {
                issueFound = true;
                description.push('Potential NoSQL injection detected in JSON body');
            }
        }
    }

    // Check for potential LDAP injection
    const ldapInjectionPattern = /[()&|!@<>]/;
    if (body && typeof body === 'string' && ldapInjectionPattern.test(body)) {
        issueFound = true;
        description.push('Potential LDAP injection detected');
    }

    // Check for potential XML injection
    if (headers['Content-Type'] && headers['Content-Type'].toLowerCase().includes('xml')) {
        const xmlInjectionPatterns = [
            /<!ENTITY/i,
            /<!DOCTYPE/i,
            /<!\[CDATA\[/i
        ];
        if (body && typeof body === 'string') {
            checkInjection(body, xmlInjectionPatterns, 'XML');
        }
    }

    return {
        issueFound,
        description: description.join(" "),
    };
}

module.exports = {
    injectionCheck,
};