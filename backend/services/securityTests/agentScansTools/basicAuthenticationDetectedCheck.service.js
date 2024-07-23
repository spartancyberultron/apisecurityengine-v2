/* Test for "Basic Authentication Detected" */
async function basicAuthenticationDetectedCheck(headers) {    
    
    const authorizationHeader = headers['Authorization'] || headers['authorization'];
    
    if (authorizationHeader && authorizationHeader.startsWith('Basic ')) {
        return {
            issueFound: true,
        };
    } else {
        return {
            issueFound: false,
        };
    }   
}

module.exports = {
    basicAuthenticationDetectedCheck,
};
