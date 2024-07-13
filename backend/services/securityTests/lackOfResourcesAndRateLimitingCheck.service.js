/* Test for "Lack of Resoources and Rate Limiting" */
async function lackOfResourcesAndRateLimitingCheck(theEndpoint) {
    
    let issueFound = false;
    let description = '';
    let findings = [];

    try {

        const { method, protocol, host, port, endpoint, headers, queryParams, authorization, requestBody, url } = theEndpoint;
        const requestCount = 10; // Number of requests to make
        const interval = 3000; // Interval between requests in milliseconds (2 seconds)

        const requestOptions = {
            method,
            url: url,
            headers: {},
            params: queryParams,
            data: requestBody
        };

        // Set authorization headers based on the specified type
        switch (authorization.type) {

            case 'bearer':
                requestOptions.headers['Authorization'] = `Bearer ${authorization.bearer[0].value}`;
                break;
            case 'apikey':
                requestOptions.headers['X-API-Key'] = authorization.apikey[0].value;
                break;
            case 'digest':
                requestOptions.auth = {
                    username: authorization.digest[0].value,
                    password: authorization.digest[1].value
                };
                break;
            case 'basic':
                requestOptions.auth = {
                    username: authorization.basic[0].value,
                    password: authorization.basic[1].value
                };
                break;
        }

        // Set additional headers if provided
        if (headers && headers.length > 0) {
            headers.forEach(header => {
                requestOptions.headers[header.key] = header.value;
            });
        }

        let rateLimitHeadersFound = false;


        for (let i = 0; i < requestCount; i++) {

            console.log(`Making request ${i + 1}/${requestCount}`);
            const response = await axios(requestOptions).catch(error => error.response);

            console.log("response.status", response.status);

            if (response) {

                if (response.headers['x-rate-limit']) {
                    rateLimitHeadersFound = true;
                    break;
                }

                if (response.status === 429) {
                    console.log('rate limiting is enabled');
                    return false; // Return false if rate limit exceeded
                }

                if (i === requestCount - 1 && response.status !== 429) {
                    return true;
                }
            } else {
                continue;
            }

            await new Promise(resolve => setTimeout(resolve, interval));
        }

        console.log('Rate Limit Headers Found:', rateLimitHeadersFound);
        //return !rateLimitHeadersFound; // Return true if rate limit headers are not found
        issueFound = !rateLimitHeadersFound;

    } catch (error) {
        console.error('Error1:', error.message);
        return false; // Return false in case of any error
        issueFound = false;
    }

    return {
        issueFound:issueFound,
    };
}

module.exports = {
    lackOfResourcesAndRateLimitingCheck,
};  
