/* Test for "Basic Authentication Detected" */
async function basicAuthenticationDetectedCheck(endpoint) {    
    
    if (endpoint.authorization.type == 'basic') {
        return {
            issueFound:true,
        };
    } else {
        return {
            issueFound:false,
        };
    }   
}

module.exports = {
    basicAuthenticationDetectedCheck,
};  
