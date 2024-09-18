const axios = require('axios');

async function lackOfResourcesAndRateLimitingCheck(theEndpoint) {
    let issueFound = false;
    let description = [];
    let findings = [];

    try {
        const { method, url, headers, queryParams, authorization, requestBody } = theEndpoint;
        const requestCount = 5; 
        const interval = 1000; 

        const requestOptions = {
            method,
            url: url,
            headers: headers || {},
            params: queryParams,
            data: requestBody
        };

        // Set authorization headers based on the specified type
        if (authorization) {
            switch (authorization.type) {
                case 'bearer':
                    requestOptions.headers['Authorization'] = `Bearer ${authorization.bearer[0].value}`;
                    break;
                case 'apikey':
                    requestOptions.headers['X-API-Key'] = authorization.apikey[0].value;
                    break;
                case 'digest':
                case 'basic':
                    requestOptions.auth = {
                        username: authorization[authorization.type][0].value,
                        password: authorization[authorization.type][1].value
                    };
                    break;
            }
        }

        let rateLimitHeadersFound = false;
        let rateLimitExceeded = false;
        let responseTimes = [];

        for (let i = 0; i < requestCount; i++) {
            console.log(`Making request ${i + 1}/${requestCount}`);
            const startTime = Date.now();
            const response = await axios(requestOptions).catch(error => error.response);
            const endTime = Date.now();
            responseTimes.push(endTime - startTime);

            if (response) {
                const rateLimitHeaders = ['x-rate-limit', 'x-ratelimit-limit', 'retry-after', 'x-ratelimit-remaining'];
                rateLimitHeadersFound = rateLimitHeaders.some(header => response.headers[header.toLowerCase()]);

                if (rateLimitHeadersFound) {
                    description.push(`Rate limit headers found: ${rateLimitHeaders.filter(header => response.headers[header.toLowerCase()]).join(', ')}`);
                    break;
                }

                if (response.status === 429) {
                    rateLimitExceeded = true;
                    description.push('Rate limiting is enabled (received 429 status code)');
                    break;
                }
            }

            await new Promise(resolve => setTimeout(resolve, interval));
        }

        if (!rateLimitHeadersFound && !rateLimitExceeded) {
            issueFound = true;
            description.push('No rate limit headers or 429 responses detected. The API may lack proper rate limiting.');
        }

        // Check for potential resource exhaustion
        const avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
        const lastResponseTime = responseTimes[responseTimes.length - 1];
        if (lastResponseTime > avgResponseTime * 2) {
            issueFound = true;
            description.push('Response time increased significantly during testing, indicating potential resource exhaustion.');
        }

        findings = description;

    } catch (error) {
        console.error('Error:', error.message);
        description.push(`Error occurred during testing: ${error.message}`);
        issueFound = true; // Consider any error as a potential issue
    }

    return {
        issueFound,
        description: description.join(' '),
        findings
    };
}

module.exports = {
    lackOfResourcesAndRateLimitingCheck,
};