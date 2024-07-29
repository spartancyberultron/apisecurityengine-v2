/* Test for "Sensitive Data in Query Params" */
async function sensitiveDataInQueryParamsCheck(queryParams) {

    let issueFound = false;
    let findings = [];

    console.log('queryParamsinfunction:', queryParams)

    var pIIData = [];

    for (const key in queryParams) {
        if (queryParams.hasOwnProperty(key)) {
            const theKey = key.toLowerCase();
            console.log('theKey:', theKey)

            if (theKey.includes('name')
                || theKey.includes('first_name')
                || theKey.includes('last_name')
                || theKey.includes('full_name')
                || theKey.includes('firstname')
                || theKey.includes('lastname')
                || theKey.includes('fullname')
                || theKey.includes('first-name')
                || theKey.includes('last-name')
                || theKey.includes('full-name')
                || theKey.includes('firstName')
                || theKey.includes('lastName')
                || theKey.includes('fullName')) {

                pIIData.push("Name")
            }

            if (theKey.includes('email')
                || theKey.includes('mail')
                || theKey.includes('email_address')
                || theKey.includes('email-address')
                ) {

                pIIData.push("Email")
            }

            if (theKey.includes('address')
                || theKey.includes('address_line_1')
                || theKey.includes('address_line_2')
                || theKey.includes('city')
                || theKey.includes('pincode')
                || theKey.includes('zip')
                || theKey.includes('postal')
                || theKey.includes('state')
                || theKey.includes('country')
                || theKey.includes('house_number')
                || theKey.includes('house_no')
                || theKey.includes('house-number')
                || theKey.includes('house-no')) {

                pIIData.push("Address")
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

            if (theKey.includes('employee_id')
                || theKey.includes('employeeid')
                || theKey.includes('employee-id')
            ) {

                pIIData.push("Employee ID")
            }

            if (theKey.includes('bmi')
                || theKey.includes('body-mass-index')
                || theKey.includes('body_mass_index')
            ) {

                pIIData.push("BMI")
            }

            if (theKey.includes('heartrate')
                || theKey.includes('heart-rate')
                || theKey.includes('heart_rate')
            ) {

                pIIData.push("Heart Rate")
            }

            if (theKey.includes('bloodpressure')
                || theKey.includes('blood-pressure')
                || theKey.includes('blood_pressure')
            ) {

                pIIData.push("Blood Pressure")
            }

            if (theKey.includes('fathername')
                || theKey.includes('father-name')
                || theKey.includes('father_name')
            ) {

                pIIData.push("Father Name")
            }

            if (theKey.includes('mothername')
                || theKey.includes('mother-name')
                || theKey.includes('mother_name')
            ) {

                pIIData.push("Mother Name")
            }

            if (theKey.includes('brothername')
                || theKey.includes('brother-name')
                || theKey.includes('brother_name')
            ) {

                pIIData.push("Brother Name")
            }

            if (theKey.includes('sistername')
                || theKey.includes('sister-name')
                || theKey.includes('sister_name')
            ) {

                pIIData.push("Sister Name")
            }

            if (theKey.includes('daughtername')
                || theKey.includes('daughter-name')
                || theKey.includes('daughter_name')
            ) {

                pIIData.push("Daughter Name")
            }

            if (theKey.includes('sonname')
                || theKey.includes('son-name')
                || theKey.includes('son_name')
            ) {

                pIIData.push("Son Name")
            }

            if (theKey.includes('orderid')
                || theKey.includes('order-id')
                || theKey.includes('order_id')
            ) {

                pIIData.push("Order ID")
            }

            if (theKey.includes('transactionid')
                || theKey.includes('transaction-id')
                || theKey.includes('transaction_id')
            ) {

                pIIData.push("Transaction ID")
            }

            if (theKey.includes('cookiedata')
                || theKey.includes('cookie-data')
                || theKey.includes('cookie_data')
            ) {

                pIIData.push("Cookie Data")
            }
        }
    }

    if (pIIData.length > 0) {
        findings = pIIData;
        issueFound = true;
    }

    return {
        issueFound: issueFound,
        findings: findings,
    };
}

module.exports = {
    sensitiveDataInQueryParamsCheck,
};