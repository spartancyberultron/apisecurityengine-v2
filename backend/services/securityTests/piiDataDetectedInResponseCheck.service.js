const Organization = require("../../models/organization.model");

const commonPIIPatterns = {
    'email': /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/,
    'phone number': /\b(\+\d{1,2}\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}\b/,
    'social security number': /\b\d{3}[-.]?\d{2}[-.]?\d{4}\b/,
    'credit card number': /\b(?:\d{4}[-\s]?){3}\d{4}\b/,
    'date of birth': /\b\d{1,2}\/\d{1,2}\/\d{2,4}\b/,
    'address': /\b\d{1,5}\s\w+\s\w+\.?\s?(?:street|st|avenue|ave|road|rd|highway|hwy|square|sq|trail|trl|drive|dr|court|ct|park|parkway|pkwy|circle|cir|boulevard|blvd)\b/i,
    'ip address': /\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/,
    'passport number': /\b[A-Z]{1,2}[0-9]{6,9}\b/,
    'driver license': /\b[A-Z]{1,2}[-\s]?\d{3,7}[-\s]?\d{3,7}\b/,
    'bank account number': /\b\d{8,17}\b/
};

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

async function piiDataDetectedInResponseCheck(endpoint, headers, body, organizationId) {
    let issueFound = false;
    let description = [];
    let findings = [];

    try {
        const enabledPIIData = await getEnabledPIIData(organizationId);

        // Function to check for PII in a string
        function checkForPII(str) {
            enabledPIIData.forEach(piiType => {
                const regex = commonPIIPatterns[piiType];
                if (regex && regex.test(str)) {
                    issueFound = true;
                    findings.push(piiType);
                }
            });
        }

        // Check headers
        Object.values(headers).forEach(value => {
            if (typeof value === 'string') {
                checkForPII(value);
            }
        });

        // Check body
        if (typeof body === 'string') {
            checkForPII(body);
        } else if (typeof body === 'object') {
            JSON.stringify(body).split('"').forEach(str => checkForPII(str));
        }

        if (issueFound) {
            description.push(`PII data detected in the response: ${findings.join(', ')}`);
        }

    } catch (error) {
        console.error('Error in PII data check:', error);
        issueFound = true;
        description.push(`Error occurred during PII data check: ${error.message}`);
    }

    return {
        issueFound,
        description: description.join(' '),
        findings
    };
}

module.exports = {
    piiDataDetectedInResponseCheck,
};