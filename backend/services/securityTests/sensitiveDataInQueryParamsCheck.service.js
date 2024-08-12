const Organization = require("../../models/organization.model");


/* Test for "Sensitive Data in Query Params" */
async function sensitiveDataInQueryParamsCheck(endpoint, organizationId) {

    console.log('organizationId:',organizationId)

    const enabledPIIDataForOrg = await getEnabledPIIData(organizationId);


    console.log('enabledPIIDataForOrg:',enabledPIIDataForOrg)

    let issueFound = false;
    let findings = [];


    var pIIData = [];

    for (var j = 0; j < endpoint.queryParams.length; j++) {

        const theKey = (endpoint.queryParams[j].key || '').toLowerCase();

        for(var j=0;j<enabledPIIDataForOrg.length;j++){
          

        console.log('theKey:',theKey)
        console.log('enabledPIIDataForOrg[j]:',enabledPIIDataForOrg[j])

        if (enabledPIIDataForOrg[j].includes(theKey)){
            // First letter of each word caps
            pIIData.push(enabledPIIDataForOrg[j].split(' ').map(word => word.charAt(0).toUpperCase() + word.toLowerCase().slice(1)).join(' '));
        }

        }        
    }

    console.log('pIIData:',pIIData)

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
    sensitiveDataInQueryParamsCheck,
};  