const Organization = require("../../../models/organization.model");


/* Test for "Sensitive Data in Path Params" */
async function sensitiveDataInPathParamsCheck(url, organizationId) {

    console.log('organizationId:',organizationId)

    const enabledPIIDataForOrg = await getEnabledPIIData(organizationId);


    console.log('enabledPIIDataForOrg:',enabledPIIDataForOrg)


    let issueFound = false;
    let findings = [];


   // const { protocol, host, url, endpoint: path } = endpoint;
    //const url = `${protocol}://${host}/${path}`;
    const pIIData = [];

    // Extract path parameters from the URL using regular expressions
    const pathParams = url.match(/{(.*?)}/g) || [];

    for (let i = 0; i < pathParams.length; i++) {
        const theParam = pathParams[i].replace(/[{}]/g, '').toLowerCase();


        for(var j=0;j<enabledPIIDataForOrg.length;j++){
          

            console.log('theParam:',theParam)
            console.log('enabledPIIDataForOrg[j]:',enabledPIIDataForOrg[j])
    
            if (enabledPIIDataForOrg[j].includes(theParam)){
                // First letter of each word caps
                pIIData.push(enabledPIIDataForOrg[j].split(' ').map(word => word.charAt(0).toUpperCase() + word.toLowerCase().slice(1)).join(' '));
            }
    
            }    


            /*
        if (
            theParam.includes('name') ||
            theParam.includes('first_name') ||
            theParam.includes('last_name') ||
            theParam.includes('full_name') ||
            theParam.includes('firstname') ||
            theParam.includes('lastname') ||
            theParam.includes('fullname') ||
            theParam.includes('first-name') ||
            theParam.includes('last-name') ||
            theParam.includes('full-name') ||
            theParam.includes('firstName') ||
            theParam.includes('lastname') ||
            theParam.includes('fullName')
        ) {
            pIIData.push('Name');
        }

        if (
            theParam.includes('address') ||
            theParam.includes('address_line_1') ||
            theParam.includes('address_line_2') ||
            theParam.includes('city') ||
            theParam.includes('pincode') ||
            theParam.includes('zip') ||
            theParam.includes('postal') ||
            theParam.includes('state') ||
            theParam.includes('country') ||
            theParam.includes('house_number') ||
            theParam.includes('house_no') ||
            theParam.includes('house-number') ||
            theParam.includes('house-no')
        ) {
            pIIData.push('Address');
        }

        if (theKey.includes('phone')) {
            pIIData.push("Phone Number")
        }

        if (theKey.includes('ip')
            || theKey.includes('ip_address')
            || theKey.includes('ip-address')
            || theKey.includes('ipaddress')
            || theKey.includes('internet protocol')) {

            pIIData.push("Internet Protocol (IP)")
        }

        if (theKey.includes('media_access_control')
            || theKey.includes('mac')
            || theKey.includes('media-access-control')
        ) {

            pIIData.push("Media Access Control (MAC)")
        }

        if (theKey.includes('social_security_number')
            || theKey.includes('ssn')
            || theKey.includes('social-security-number')
            || theKey.includes('socialsecuritynumber')
        ) {

            pIIData.push("Social Security Number (SSN)")
        }

        if (theKey.includes('passport_number')
            || theKey.includes('passportnumber')
            || theKey.includes('passport-number')
        ) {

            pIIData.push("Passport Number")
        }

        if (theKey.includes('driving_license_number')
            || theKey.includes('drivinglicensenumber')
            || theKey.includes('driving-license-number')
        ) {

            pIIData.push("Driving License Number")
        }

        if (theKey.includes('bank_account_number')
            || theKey.includes('bankaccountnumber')
            || theKey.includes('bank-account-number')
        ) {

            pIIData.push("Bank Account Number")
        }

        if (theKey.includes('credit_card_number')
            || theKey.includes('creditcardnumber')
            || theKey.includes('credit-card-number')
            || theKey.includes('debitcardnumber')
            || theKey.includes('debit-card-number')
            || theKey.includes('debit_card_number')
        ) {

            pIIData.push("Credit/Debit Card Number")
        }

        if (theKey.includes('pan_number')
            || theKey.includes('pannumber')
            || theKey.includes('pan-number')
            || theKey.includes('pancardnumber')
            || theKey.includes('pan-card-number')
            || theKey.includes('pan_card_number')
        ) {

            pIIData.push("PAN Number")
        }

        if (theKey.includes('aadhaar_number')
            || theKey.includes('aadhaarnumber')
            || theKey.includes('aadhaar-number')
            || theKey.includes('aadhaarcardnumber')
            || theKey.includes('aadhaar-card-number')
            || theKey.includes('aadhaar_card_number')
        ) {

            pIIData.push("Aadhaar Number")
        }

        if (theKey.includes('voter_id')
            || theKey.includes('voterid')
            || theKey.includes('voter-id')
        ) {

            pIIData.push("Voter ID Number")
        }

        if (theKey.includes('vehicle_registration_number')
            || theKey.includes('vehicle-registration-number')
            || theKey.includes('vehicleregistrationnumber')
        ) {

            pIIData.push("Vehicle Registration Number")
        }

        if (theKey.includes('date_of_birth')
            || theKey.includes('date-of-birth')
            || theKey.includes('dateofbirth')
            || theKey.includes('dob')
        ) {

            pIIData.push("Date of Birth")
        }

        if (theKey.includes('place_of_birth')
            || theKey.includes('place-of-birth')
            || theKey.includes('placeofbirth')
            || theKey.includes('pob')
        ) {

            pIIData.push("Place of Birth")
        }

        if (theKey.includes('race')

        ) {

            pIIData.push("Race")
        }

        if (theKey.includes('religion')
        ) {

            pIIData.push("Religion")
        }

        if (theKey.includes('weight')
        ) {

            pIIData.push("Weight")
        }

        if (theKey.includes('height')
        ) {

            pIIData.push("Height")
        }

        if (theKey.includes('latitude')
        ) {

            pIIData.push("Latitude")
        }

        if (theKey.includes('longitude')
        ) {

            pIIData.push("Longitude")
        }

        if (theKey.includes('employee_id') || theKey.includes('employeeid') || theKey.includes('employee-id')
        ) {

            pIIData.push("Employee ID")
        }

        if (theKey.includes('bmi') || theKey.includes('body-mass-index') || theKey.includes('body_mass_index')
        ) {

            pIIData.push("BMI")
        }

        if (theKey.includes('heartrate') || theKey.includes('heart-rate') || theKey.includes('heart_rate')
        ) {

            pIIData.push("Heart Rate")
        }

        if (theKey.includes('bloodpressure') || theKey.includes('blood-pressure') || theKey.includes('blood_pressure')
        ) {

            pIIData.push("Blood Pressure")
        }

        if (theKey.includes('fathername') || theKey.includes('father-name') || theKey.includes('father_name')
        ) {

            pIIData.push("Father Name")
        }

        if (theKey.includes('mothername') || theKey.includes('mother-name') || theKey.includes('mother_name')
        ) {

            pIIData.push("Mother Name")
        }

        if (theKey.includes('brothername') || theKey.includes('brother-name') || theKey.includes('brother_name')
        ) {

            pIIData.push("Brother Name")
        }

        if (theKey.includes('sistername') || theKey.includes('sister-name') || theKey.includes('sister_name')
        ) {

            pIIData.push("Sister Name")
        }

        if (theKey.includes('daughtername') || theKey.includes('daughter-name') || theKey.includes('daughter_name')
        ) {

            pIIData.push("Daugther Name")
        }

        if (theKey.includes('sonname') || theKey.includes('son-name') || theKey.includes('son_name')
        ) {

            pIIData.push("Son Name")
        }

        if (theKey.includes('orderid') || theKey.includes('order-id') || theKey.includes('order_id')
        ) {

            pIIData.push("Order ID")
        }

        if (theKey.includes('transactionid') || theKey.includes('transaction-id') || theKey.includes('transaction_id')
        ) {

            pIIData.push("Transaction ID")
        }

        if (theKey.includes('cookiedata') || theKey.includes('cookie-data') || theKey.includes('cookie_data')
        ) {

            pIIData.push("Cookie Data")
        }

        */

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
