const axios = require('axios');

/* Test for "HTTP Verb Tampering Possible" */
async function httpVerbTamperingPossibleCheck(endpoint, timeout = 10000) {
    
    const { url, protocol, host, port, endpoint: path, method: intendedMethod } = endpoint;
    const tamperableMethods = [];

    let issueFound = false;
    let findings = [];
    let description = '';

    const supportedMethods = [
        'GET',
        'POST',
        'PUT',
        'DELETE',
        'PATCH',
        'OPTIONS',
        'HEAD',
        'TRACE',
        // 'CONNECT',
        // Add any additional HTTP methods to check here
    ];

    // Remove the intended method from the supported methods
    const unauthorizedMethods = supportedMethods.filter((method) => method !== intendedMethod);

    for (const method of unauthorizedMethods) {
        try {
            let requestUrl;

            if (url) {
                requestUrl = url;
            } else {
                requestUrl = `${protocol}://${host}${port ? `:${port}` : '/'}${path}`;
            }

            const response = await axios.request({
                method,
                url: requestUrl,
                validateStatus: (status) => true, // Treat all status codes as valid
                timeout, // Set the timeout
            });

            if (response.status !== 405) {
                tamperableMethods.push(method);
            }
        } catch (error) {
            if (axios.isCancel(error)) {
                console.log(`Request timed out for method ${method}. Skipping.`);
            } else {
                // Error occurred during the request, consider the method as tamperable
                tamperableMethods.push(method);
                console.log('Error in runTestForHTTPVerbTamperingPossible:', error);
            }
        }
    }

    if(tamperableMethods.length > 0){

        issueFound = true;
        findings = tamperableMethods;
        description = 'HTTP Verb Tampering on several HTTP methods is possible on this host'

    }else{
        issueFound = false;
    }

    //return tamperableMethods;

    return {
        issueFound:issueFound,
        findings:findings,
        description: description,
    };
}

module.exports = {
    httpVerbTamperingPossibleCheck,
};  
