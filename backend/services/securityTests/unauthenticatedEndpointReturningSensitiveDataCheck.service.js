/* Broken Object Level Authorization Check */
function unauthenticatedEndpointReturningSensitiveDataCheck(headers, body) {

    

    return {
        issueFound:true,
        description: "",
    };
}

module.exports = {
    unauthenticatedEndpointReturningSensitiveDataCheck,
};  
