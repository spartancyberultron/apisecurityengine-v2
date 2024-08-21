const Organization = require("../../models/organization.model");

/* Test for "Sensitive Data in Path Params" */
async function sensitiveDataInPathParamsCheck(endpoint, organizationId) {

   // console.log('organizationId:',organizationId)

    const enabledPIIDataForOrg = await getEnabledPIIData(organizationId);


   // console.log('enabledPIIDataForOrg:',enabledPIIDataForOrg)


    let issueFound = false;
    let findings = [];


    const { protocol, host, url, endpoint: path } = endpoint;
    //const url = `${protocol}://${host}/${path}`;
    const pIIData = [];

    // Extract path parameters from the URL using regular expressions
    const pathParams = url.match(/{(.*?)}/g) || [];

    for (let i = 0; i < pathParams.length; i++) {

        const theParam = pathParams[i].replace(/[{}]/g, '').toLowerCase();

        for(var j=0;j<enabledPIIDataForOrg.length;j++){
          

            //console.log('theParam:',theParam)
           // console.log('enabledPIIDataForOrg[j]:',enabledPIIDataForOrg[j])
    
            if (enabledPIIDataForOrg[j].includes(theParam)){
                // First letter of each word caps
                pIIData.push(enabledPIIDataForOrg[j].split(' ').map(word => word.charAt(0).toUpperCase() + word.toLowerCase().slice(1)).join(' '));
            }
    
            }     


      

        // Continue checking for other sensitive data types in path parameters...
    }

    //return pIIData;

    if(pIIData.length> 0){
        findings = pIIData;
        issueFound = true;
    }
    

    return {
        issueFound:issueFound,
        findings: findings,
    };
}


async function getEnabledPIIData(organizationId) {
    try {
      const organization = await Organization.findById(organizationId).exec();
      if (!organization) {
        throw new Error('Organization not found');
      }
  
      // Extract enabled PII fields
      return organization.piiField
        .filter(field => field.enabled)
        .map(field => field.piiField.toLowerCase()); // Convert to lowercase for consistency
    } catch (error) {
      console.error('Error fetching organization data:', error);
      throw error;
    }
  }

module.exports = {
    sensitiveDataInPathParamsCheck,
};  
