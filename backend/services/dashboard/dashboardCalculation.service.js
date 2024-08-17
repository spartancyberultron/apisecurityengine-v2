
const Organization = require("../../models/organization.model");

async function calculateDashboard() {

    /*** Calculate dashboard data of all organizations **/

    const orgs = await Organization.find({});

    for(var i=0;i<orgs.length;i++){
        const organization = orgs[i];

        calculateDashboardCardData(organization)
        calculateVulnerabilityDistribution(organization);
        calculateTopEndpoints(organization);
        calculateVulnerabilityTrends(organization);
        calculateSeverityDistribution(organization);
        calculateNumberOfOpenVulnerabilities(organization);
        calculateTimeToResolveVulnerabilities(organization);
        calculateTop10Vulnerabilities(organization);
        calculateComplianceStatus(organization);
        calculateSSDLCScore(organization);
        calculateAuditFindings(organization);
        calculateThreatAlerts(organization);
        calculateThreatTrends(organization);
        calculateRiskScore(organization);
        calculateTopRisks(organization);
    }


}

function getRiskValue(riskScore) {
    switch (riskScore) {
        case 'LOW':
            return 1;
        case 'MEDIUM':
            return 2;
        case 'HIGH':
            return 3;
        case 'CRITICAL':
            return 4;
        default:
            return 0; // Default value for unknown risk scores
    }
}

function getRiskLevel(riskValue) {
    if (riskValue >= 3.5) {
        return 'CRITICAL';
    } else if (riskValue >= 2.5) {
        return 'HIGH';
    } else if (riskValue >= 1.5) {
        return 'MEDIUM';
    } else {
        return 'LOW';
    }
}


async function calculateVulnerabilityDistribution(organization) {



    var vuln1Count = 0;
    var vuln2Count = 0;
    var vuln3Count = 0;
    var vuln4Count = 0;
    var vuln5Count = 0;
    var vuln6Count = 0;
    var vuln7Count = 0;
    var vuln8Count = 0;
    var vuln9Count = 0;
    var vuln10Count = 0;
    var vuln11Count = 0;
    var vuln12Count = 0;
    var vuln13Count = 0;
    var vuln14Count = 0;
    var vuln15Count = 0;
    var vuln16Count = 0;
    var vuln17Count = 0;
    var vuln18Count = 0;

    const activeScans = await ActiveScan.find({ user: user._id });
    const activeScanVulns = [];

    for (var i = 0; i < activeScans.length; i++) {

        const activeScanVulnerabilities = await ActiveScanVulnerability.find({ activeScan: activeScans[i] }).populate('vulnerability');

        for (var j = 0; j < activeScanVulnerabilities.length; j++) {

            if (activeScanVulnerabilities[j].vulnerability.vulnerabilityCode == 1) {
                vuln1Count++;
            }

            if (activeScanVulnerabilities[j].vulnerability.vulnerabilityCode == 2) {
                vuln2Count++;
            }

            if (activeScanVulnerabilities[j].vulnerability.vulnerabilityCode == 3) {
                vuln3Count++;
            }

            if (activeScanVulnerabilities[j].vulnerability.vulnerabilityCode == 4) {
                vuln4Count++;
            }

            if (activeScanVulnerabilities[j].vulnerability.vulnerabilityCode == 5) {
                vuln5Count++;
            }

            if (activeScanVulnerabilities[j].vulnerability.vulnerabilityCode == 6) {
                vuln6Count++;
            }

            if (activeScanVulnerabilities[j].vulnerability.vulnerabilityCode == 7) {
                vuln7Count++;
            }

            if (activeScanVulnerabilities[j].vulnerability.vulnerabilityCode == 8) {
                vuln8Count++;
            }

            if (activeScanVulnerabilities[j].vulnerability.vulnerabilityCode == 9) {
                vuln9Count++;
            }

            if (activeScanVulnerabilities[j].vulnerability.vulnerabilityCode == 10) {
                vuln10Count++;
            }

            if (activeScanVulnerabilities[j].vulnerability.vulnerabilityCode == 11) {
                vuln11Count++;
            }

            if (activeScanVulnerabilities[j].vulnerability.vulnerabilityCode == 12) {
                vuln12Count++;
            }

            if (activeScanVulnerabilities[j].vulnerability.vulnerabilityCode == 13) {
                vuln13Count++;
            }

            if (activeScanVulnerabilities[j].vulnerability.vulnerabilityCode == 14) {
                vuln14Count++;
            }

            if (activeScanVulnerabilities[j].vulnerability.vulnerabilityCode == 15) {
                vuln15Count++;
            }

            if (activeScanVulnerabilities[j].vulnerability.vulnerabilityCode == 16) {
                vuln16Count++;
            }

            if (activeScanVulnerabilities[j].vulnerability.vulnerabilityCode == 17) {
                vuln17Count++;
            }

            if (activeScanVulnerabilities[j].vulnerability.vulnerabilityCode == 18) {
                vuln18Count++;
            }
        }
    }

    var vulnerabilityCounts = {};

    vulnerabilityCounts.vuln1Count = vuln1Count;
    vulnerabilityCounts.vuln2Count = vuln2Count;
    vulnerabilityCounts.vuln3Count = vuln3Count;
    vulnerabilityCounts.vuln4Count = vuln4Count;
    vulnerabilityCounts.vuln5Count = vuln5Count;
    vulnerabilityCounts.vuln6Count = vuln6Count;
    vulnerabilityCounts.vuln7Count = vuln7Count;
    vulnerabilityCounts.vuln8Count = vuln8Count;
    vulnerabilityCounts.vuln9Count = vuln9Count;
    vulnerabilityCounts.vuln10Count = vuln10Count;
    vulnerabilityCounts.vuln11Count = vuln11Count;
    vulnerabilityCounts.vuln12Count = vuln12Count;
    vulnerabilityCounts.vuln13Count = vuln13Count;
    vulnerabilityCounts.vuln14Count = vuln14Count;
    vulnerabilityCounts.vuln15Count = vuln15Count;
    vulnerabilityCounts.vuln16Count = vuln16Count;
    vulnerabilityCounts.vuln17Count = vuln17Count;
    vulnerabilityCounts.vuln18Count = vuln18Count;

}

async function calculateTopEndpoints(organization) {

    try {

        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Top endpoints - endpoints on which most vulns are reported
        let topEndpoints = [];

        const apiEndpoints = await ApiEndpoint.find({ 'user': user._id, vulnCount: { $exists: true, $ne: null } })
            .sort({ vulnCount: -1 }) // Sort by vulnCount in descending order
            .limit(5).lean(); // Limit to top 5


        for (var i = 0; i < apiEndpoints.length; i++) {

            const activeScanVulnerabilities = await ActiveScanVulnerability.find({ endpoint: apiEndpoints[i]._id }).populate('vulnerability');
        
            var vulnArray = [];
        
            for (var j = 0; j < activeScanVulnerabilities.length; j++) {
                const riskScore = activeScanVulnerabilities[j].vulnerability.riskScore;
        
                // Map risk scores to numerical values
                const riskValue = getRiskValue(riskScore);
        
                vulnArray.push(riskValue);
            }
        
            // Calculate average risk score
            const avgRiskScore = calculateAverage(vulnArray);
        
            // Reverse map the average numerical value back to the risk level
            const avgRiskLevel = getRiskLevel(avgRiskScore);
        

            apiEndpoints[i].riskScore = avgRiskLevel; 
        }


        if (apiEndpoints && apiEndpoints.length > 0) {
            topEndpoints = apiEndpoints.map(endpoint => endpoint);
        }

        res.status(200).json({ topEndpoints });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }

}

async function calculateVulnerabilityTrends(organization) {

    const today = new Date();
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11); // 12 months ago

    const activeScansByMonth = [];

    for (let i = 0; i < 12; i++) {
        
        const startDate = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const endDate = new Date(today.getFullYear(), today.getMonth() - i + 1, 0, 23, 59, 59, 999);

        const activeScans = await ActiveScan.find({
            user: req.user._id,
            createdAt: { $gte: startDate, $lte: endDate }
        })
            .populate({
                path: 'vulnerabilities',
                model: 'ActiveScanVulnerability',
                populate: [
                    { path: 'vulnerability', model: 'Vulnerability' },
                    { path: 'endpoint', model: 'ApiEndpoint' }
                ]
            });

        const vulnCounts = {};
        for (let j = 1; j <= 18; j++) {
            const vulnerabilityCode = 'vuln' + j + 'Count';
            vulnCounts[vulnerabilityCode] = 0;
        }

        activeScans.forEach(scan => {
            scan.vulnerabilities.forEach(vuln => {
                const vulnerabilityCode = 'vuln' + vuln.vulnerability.vulnerabilityCode + 'Count';
                if (vulnCounts.hasOwnProperty(vulnerabilityCode)) {
                    vulnCounts[vulnerabilityCode]++;
                }
            });
        });

        const monthName = startDate.toLocaleString('default', { month: 'short' }) + '-' + startDate.getFullYear();
        const monthData = { [monthName]: vulnCounts };
        activeScansByMonth.push(monthData);
    }
    

}

async function calculateSeverityDistribution(organization) {
  // Comes from getVulnerabilityDistribution itself
}

async function calculateNumberOfOpenVulnerabilities(organization) {

    const user = req.user;
    
    if (!user || !user.organization) {
        return res.status(400).json({
            success: false,
            message: 'User or user organization not found'
        });
    }


    // REST
    const openTicketsCountRest = await Ticket.countDocuments({
        organization: user.organization,
        status: 'OPEN',
        'source':"REST API Scan"
    });



    // Attack Surface
    const openTicketsCountAttackSurface = await Ticket.countDocuments({
        organization: user.organization,
        status: 'OPEN',
        'source':"Attack Surface Scan"
    });


    // Agent Traffic
    const openTicketsCountAPITrafficScan = await Ticket.countDocuments({
        organization: user.organization,
        status: 'OPEN',
        'source':"API Traffic Scan"
    });



    // SOAP
    const openTicketsCountSOAPScan = await Ticket.countDocuments({
        organization: user.organization,
        status: 'OPEN',
        'source':"SOAP Scan"
    });



    // GraphQL
    const openTicketsCountGraphQLScan = await Ticket.countDocuments({
        organization: user.organization,
        status: 'OPEN',
        'source':"GraphQL Scan"
    });



    // SBOM
    const openTicketsCountSBOMScan = await Ticket.countDocuments({
        organization: user.organization,
        status: 'OPEN',
        'source':"SBOM Scan"
    });



    // LLM
    const openTicketsCountLLMScan = await Ticket.countDocuments({
        organization: user.organization,
        status: 'OPEN',
        'source':"LLM Scan"
    });



    var vulnerabilities ={};
    vulnerabilities.openTicketsCountRest = openTicketsCountRest;
    vulnerabilities.openTicketsCountAttackSurface = openTicketsCountAttackSurface;
    vulnerabilities.openTicketsCountAPITrafficScan = openTicketsCountAPITrafficScan;
    vulnerabilities.openTicketsCountSOAPScan = openTicketsCountSOAPScan;
    vulnerabilities.openTicketsCountGraphQLScan = openTicketsCountGraphQLScan;
    vulnerabilities.openTicketsCountSBOMScan = openTicketsCountSBOMScan;
    vulnerabilities.openTicketsCountLLMScan = openTicketsCountLLMScan;
}

async function calculateTimeToResolveVulnerabilities(organization) {

    const user = req.user;
    
    if (!user || !user.organization) {
        return res.status(400).json({
            success: false,
            message: 'User or user organization not found'
        });
    }

    const averageResolutionTimeMs = await Ticket.aggregate([
        {
            $match: {
                organization: user.organization,
                status: 'RESOLVED',
                resolutionTime: { $exists: true, $ne: null }
            }
        },
        {
            $group: {
                _id: null,
                averageTime: { $avg: '$resolutionTime' }
            }
        }
    ]);

    if (averageResolutionTimeMs.length === 0) {
        return res.status(200).json({
            success: true,
            averageResolutionTime: 0,
            unit: 'minutes'
        });
    }

    // Convert milliseconds to minutes
    const averageResolutionTimeMinutes = averageResolutionTimeMs[0].averageTime / (1000 * 60);
}

async function calculateTop10Vulnerabilities(organization) {
 // Write code
}

async function calculateComplianceStatus(organization) {

    // takes from getThreatAlerts itself
}


async function calculateSSDLCScore(organization) {

    const user = req.user;
    
    if (!user || !user.organization) {
        return res.status(400).json({
            success: false,
            message: 'User or user organization not found'
        });
    }

    const organizationId = await Organization.findById(user.organization);
    const projectPhases = ['Development', 'Design', 'Testing', 'Maintenance'];

  // Initialize counts for each phase
  const counts = {
    ActiveScanVulnerability: {},
    SOAPOrGraphQLScanVulnerability: {},
    SBOMScanVulnerability: {},
    LLMScan: {}
  };

  projectPhases.forEach(phase => {
    counts.ActiveScanVulnerability[phase] = 0;
    counts.SOAPOrGraphQLScanVulnerability[phase] = 0;
    counts.SBOMScanVulnerability[phase] = 0;
    counts.LLMScan[phase] = 0;
  });

  // Fetch ActiveScanVulnerabilities and count by projectPhase
  const activeScanVulnerabilities = await ActiveScanVulnerability.find({})
    .populate({
      path: 'activeScan',
      match: { organization: organizationId } // Assuming there's a reference to organization
    });

  activeScanVulnerabilities.forEach(vuln => {
    const phase = vuln.activeScan.projectPhase; // Use 'Development' if projectPhase is not present
    if(phase=='Maintenance'){
    }else{
    }
    if (projectPhases.includes(phase)) {
      counts.ActiveScanVulnerability[phase]++;
    }
  });

  // Fetch SOAPOrGraphQLScanVulnerabilities and count by projectPhase
  const soapOrGraphQLScanVulnerabilities = await SOAPOrGraphQLScanVulnerability.find({})
    .populate({
      path: 'soapOrGraphQLScan',
      match: { organization: organizationId } // Assuming there's a reference to organization
    });

  soapOrGraphQLScanVulnerabilities.forEach(vuln => {
    const phase = vuln.soapOrGraphQLScan.projectPhase; // Use 'Development' if projectPhase is not present
    if (projectPhases.includes(phase)) {
      counts.SOAPOrGraphQLScanVulnerability[phase]++;
    }
  });

  // Fetch SBOMScanVulnerabilities and count by projectPhase
  const sbomScanVulnerabilities = await SBOMScanVulnerability.find({})
    .populate({
      path: 'sbomScan',
      match: { organization: organizationId } // Assuming there's a reference to organization
    });

  sbomScanVulnerabilities.forEach(vuln => {
    const phase = vuln.sbomScan?.projectPhase; // Use 'Development' if projectPhase is not present
    if (projectPhases.includes(phase)) {
      counts.SBOMScanVulnerability[phase]++;
    }
  });

  // Fetch LLMScans and count by resultFileContents length
  const llmScans = await LLMScan.find({});
  
  llmScans.forEach(scan => {
    const phase = scan.projectPhase; // Use 'Development' if projectPhase is not present
    const numVulns = scan.resultFileContents.length; // Count of vulnerabilities
    if (projectPhases.includes(phase)) {
      counts.LLMScan[phase] = (counts.LLMScan[phase] || 0) + numVulns; // Aggregate vulnerabilities by projectPhase
    }else{
        counts.LLMScan[phase] = 0;
    }
  });
}

async function calculateAuditFindings(organization) {

    const user = req.user;
    
    if (!user || !user.organization) {
        return res.status(400).json({
            success: false,
            message: 'User or user organization not found'
        });
    }

    const categories = ['REST API Scan', 'Attack Surface Scan', 'API Traffic Scan', 'SOAP Scan', 'GraphQL Scan', 'SBOM Scan','LLM Scan' ];
    
    const auditFindings = await Promise.all(categories.map(async (category) => {
        const sourceRegex = new RegExp(category, 'i'); // 'i' flag for case-insensitive

        const reportedIssues = await Ticket.countDocuments({
            organization: user.organization,
            source: sourceRegex
        });

        const remediatedIssues = await Ticket.countDocuments({
            organization: user.organization,
            source: sourceRegex,
            status: 'RESOLVED'
        });

        return {
            category,
            reportedIssues,
            remediatedIssues
        };
    }));
}

async function calculateThreatAlerts(organization) {
    const user = req.user;
    
    if (!user || !user.organization) {
        return res.status(400).json({
            success: false,
            message: 'User or user organization not found'
        });
    }

    const organization = await Organization.findById(user.organization);

   

    // Initialize counters for each compliance standard
const restCounts = {
    iso27001: 0, nistCSF: 0, gdpr: 0, pciDSS: 0, hipaa: 0, mitreATTACK: 0,
    nist80053: 0, asvs: 0, cmmc: 0, ccpa: 0, fips: 0, fisma: 0, rbiCSF: 0
};
const soapGraphQLCounts = {
    iso27001: 0, nistCSF: 0, gdpr: 0, pciDSS: 0, hipaa: 0, mitreATTACK: 0,
    nist80053: 0, asvs: 0, cmmc: 0, ccpa: 0, fips: 0, fisma: 0, rbiCSF: 0
};




// Iterate through ActiveScanVulnerability and SOAPOrGraphQLScanVulnerability
function processVulnerabilities(vulnerabilities, countsObject) {

    // List of all compliance standards for easier iteration
const complianceStandards = [
    "iso27001", "nistCSF", "gdpr", "pciDSS", "hipaa", "mitreATTACK",
    "nist80053", "asvs", "cmmc", "ccpa", "fips", "fisma", "rbiCSF"
];


    if(vulnerabilities){
    vulnerabilities.forEach(vuln => {

        if(vuln.owasp){
        vuln.owasp.forEach(apiItem => {
            // Check if the OWASP API item corresponds to compliance standards
            if (apiItem.startsWith("API")) {
                complianceStandards.forEach(standard => {
                    countsObject[standard]++;
                });
            }
        });
    }
    });
}

}

function processVulnerabilities1(vulnerabilities, countsObject) {

    // List of all compliance standards for easier iteration
const complianceStandards = [
    "iso27001", "nistCSF", "gdpr", "pciDSS", "hipaa", "mitreATTACK",
    "nist80053", "asvs", "cmmc", "ccpa", "fips", "fisma", "rbiCSF"
];


    if(vulnerabilities){
    vulnerabilities.forEach(vuln => {


        if(vuln.vulnerability && vuln.vulnerability.owasp){
        vuln.vulnerability.owasp.forEach(apiItem => {
            // Check if the OWASP API item corresponds to compliance standards
            if (apiItem.startsWith("API")) {
                complianceStandards.forEach(standard => {
                    countsObject[standard]++;
                });
            }
        });
    }
    });
}

}

// Fetching ActiveScanVulnerabilities that belong to the given organization
const activeScanVulnerabilities = await ActiveScanVulnerability.find({})
    .populate({
        path: 'activeScan',
        populate: {
            path: 'theCollectionVersion',
            populate: {
                path: 'apiCollection',
                populate: {
                    path: 'orgProject',
                    match: { organization: organization } // Filter by organization
                }
            }
        }
    }).populate('vulnerability');


// Filter out documents where orgProject is null or undefined
const filteredVulnerabilities = activeScanVulnerabilities.filter(vuln => 
    vuln.activeScan?.theCollectionVersion?.apiCollection?.orgProject
);



// Fetching SOAPOrGraphQLScanVulnerabilities that belong to the given organization
const soapOrGraphQLScanVulnerabilities = await SOAPOrGraphQLScanVulnerability.find({})
    .populate({
        path: 'soapOrGraphQLScan',
        populate: {
            path: 'orgProject',
            match: { organization: organization } // Filter by organization
        }
    })
    .then(vulns => vulns.filter(vuln => vuln.soapOrGraphQLScan?.orgProject)); // Filter out null results

    const llmScans = await LLMScan.find({})
    .populate({
        path: 'orgProject',
        match: { organization: organization } // Filter by organization
    })
    .then(scans => scans.filter(scan => scan.orgProject)); // Filter out null results

    const uniqueAffectedProbes = [];

    for(var i=0;i<llmScans.length;i++){

        if((JSON.stringify(llmScans[i].resultFileContents)).includes('blank')){
            uniqueAffectedProbes.push('blank')
        }
        if((JSON.stringify(llmScans[i].resultFileContents)).includes('atkgen')){
            uniqueAffectedProbes.push('atkgen')
        }
        if((JSON.stringify(llmScans[i].resultFileContents)).includes('continuation')){
            uniqueAffectedProbes.push('continuation')
        }
        if((JSON.stringify(llmScans[i].resultFileContents)).includes('dan')){
            uniqueAffectedProbes.push('dan')
        }
        if((JSON.stringify(llmScans[i].resultFileContents)).includes('donotanswer')){
            uniqueAffectedProbes.push('donotanswer')
        }
        if((JSON.stringify(llmScans[i].resultFileContents)).includes('encoding')){
            uniqueAffectedProbes.push('encoding')
        }
        if((JSON.stringify(llmScans[i].resultFileContents)).includes('gcg')){
            uniqueAffectedProbes.push('gcg')
        }
        if((JSON.stringify(llmScans[i].resultFileContents)).includes('glitch')){
            uniqueAffectedProbes.push('glitch')
        }
        if((JSON.stringify(llmScans[i].resultFileContents)).includes('goodside')){
            uniqueAffectedProbes.push('goodside')
        }
        if((JSON.stringify(llmScans[i].resultFileContents)).includes('knownbadsignatures')){
            uniqueAffectedProbes.push('knownbadsignatures')
        }
        if((JSON.stringify(llmScans[i].resultFileContents)).includes('leakerplay')){
            uniqueAffectedProbes.push('leakerplay')
        }
        if((JSON.stringify(llmScans[i].resultFileContents)).includes('lmrc')){
            uniqueAffectedProbes.push('lmrc')
        }
        if((JSON.stringify(llmScans[i].resultFileContents)).includes('malwaregen')){
            uniqueAffectedProbes.push('malwaregen')
        }
        if((JSON.stringify(llmScans[i].resultFileContents)).includes('misleading')){
            uniqueAffectedProbes.push('misleading')
        }
        if((JSON.stringify(llmScans[i].resultFileContents)).includes('packagehallucination')){
            uniqueAffectedProbes.push('packagehallucination')
        }
        if((JSON.stringify(llmScans[i].resultFileContents)).includes('promptinject')){
            uniqueAffectedProbes.push('promptinject')
        }
        if((JSON.stringify(llmScans[i].resultFileContents)).includes('realtoxicityprompts')){
            uniqueAffectedProbes.push('realtoxicityprompts')
        }
        if((JSON.stringify(llmScans[i].resultFileContents)).includes('snowball')){
            uniqueAffectedProbes.push('snowball')
        }
        if((JSON.stringify(llmScans[i].resultFileContents)).includes('xss')){
            uniqueAffectedProbes.push('xss')
        }
    }

  
    



// Assuming activeScanVulnerabilities, soapOrGraphQLScanVulnerabilities, and llmVulnerabilities are arrays of vulnerabilities
processVulnerabilities1(filteredVulnerabilities, restCounts);
processVulnerabilities(soapOrGraphQLScanVulnerabilities, soapGraphQLCounts);

// Prepare the response
const response = {
    categories: [
        "ISO 27001", "NIST CISF", "GDPR", "PCI DSS", "HIPAA", "MITRE ATT&CK",
        "NIST 800-53", "ASVS", "CMMC", "CCPA", "FIPS", "FISMA", "RBI CSF"
    ],
    rest: Object.values(restCounts),
    soapGraphQL: Object.values(soapGraphQLCounts),
    llm:[uniqueAffectedProbes.length,
        uniqueAffectedProbes.length,
        uniqueAffectedProbes.length,
        uniqueAffectedProbes.length,
        uniqueAffectedProbes.length,
        uniqueAffectedProbes.length,
        uniqueAffectedProbes.length,
        uniqueAffectedProbes.length,
        uniqueAffectedProbes.length,
        uniqueAffectedProbes.length,
        uniqueAffectedProbes.length,
        uniqueAffectedProbes.length,
        uniqueAffectedProbes.length, ]
};

}

async function calculateThreatTrends(organization) {

    
    const endDate = moment().endOf('day');
    const startDate = moment(endDate).subtract(9, 'days').startOf('day');
  
    const dateRange = [];
    for (let m = moment(startDate); m.isSameOrBefore(endDate); m.add(1, 'days')) {
      dateRange.push(m.format('YYYY-MM-DD'));
    }
  
    const [restThreats, soapThreats, graphqlThreats, sbomThreats] = await Promise.all([
      ActiveScanVulnerability.aggregate([
        { $match: { createdAt: { $gte: startDate.toDate(), $lte: endDate.toDate() } } },
        { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } }
      ]),
      SOAPOrGraphQLScanVulnerability.aggregate([
        { $match: { createdAt: { $gte: startDate.toDate(), $lte: endDate.toDate() }, 'soapOrGraphQLScan.type': 'soap' } },
        { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } }
      ]),
      SOAPOrGraphQLScanVulnerability.aggregate([
        { $match: { createdAt: { $gte: startDate.toDate(), $lte: endDate.toDate() }, 'soapOrGraphQLScan.type': 'graphql' } },
        { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } }
      ]),
      SBOMScanVulnerability.aggregate([
        { $match: { createdAt: { $gte: startDate.toDate(), $lte: endDate.toDate() } } },
        { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } }
      ])
    ]);
  
    const formatData = (threats) => {
      const threatMap = new Map(threats.map(t => [t._id, t.count]));
      return dateRange.map(date => threatMap.get(date) || 0);
    };
  
    const data = {
      categories: dateRange,
      rest: formatData(restThreats),
      soap: formatData(soapThreats),
      graphql: formatData(graphqlThreats),
      sbom: formatData(sbomThreats)
    };
}

async function calculateRiskScore(organization) {

    const [activeScanVulns, sbomScanVulns] = await Promise.all([
        ActiveScanVulnerability.find(),
        SBOMScanVulnerability.find()
      ]);
    
      const severityWeights = {
        CRITICAL: 1,
        HIGH: 0.75,
        MEDIUM: 0.5,
        LOW: 0.25
      };
    
      let totalWeight = 0;
      let weightedSum = 0;
    
      activeScanVulns.forEach(vuln => {
        const riskScore = vuln.vulnerability && vuln.vulnerability.riskScore;
        if (riskScore && severityWeights[riskScore.toUpperCase()]) {
          weightedSum += severityWeights[riskScore.toUpperCase()];
          totalWeight += 1;
        }
      });
    
      sbomScanVulns.forEach(vuln => {
        const severity = vuln.severity;
        if (severity && severityWeights[severity.toUpperCase()]) {
          weightedSum += severityWeights[severity.toUpperCase()];
          totalWeight += 1;
        }
      });
    
      const averageRiskScore = totalWeight > 0 ? (weightedSum / totalWeight) : 0;
      const riskScorePercentage = Math.round(averageRiskScore * 100);
}

async function calculateTopRisks(organization) {
// Aggregation for ActiveScanVulnerability
const activeScanAgg = ActiveScanVulnerability.aggregate([
    { $unwind: "$vulnerability" },
    { $group: { _id: "$vulnerability.vulnerabilityName", count: { $sum: 1 }, riskScore: { $first: "$vulnerability.riskScore" } } },
    { $project: { title: "$_id", count: 1, riskScore: { $ifNull: ["$riskScore", "UNKNOWN"] }, _id: 0 } }
]);

// Aggregation for LLMScanVulnerability
const llmScanAgg = LLMScanVulnerability.aggregate([
    { $group: { _id: "$vulnerabilityName", count: { $sum: 1 } } },
    { $addFields: { riskScore: "HIGH" } },
    { $project: { title: "$_id", count: 1, riskScore: 1, _id: 0 } }
]);

// Aggregation for SBOMScanVulnerability
const sbomScanAgg = SBOMScanVulnerability.aggregate([
    { $group: { _id: "$title", count: { $sum: 1 } } },
    { $addFields: { riskScore: "HIGH" } },
    { $project: { title: "$_id", count: 1, riskScore: 1, _id: 0 } }
]);

// Aggregation for SOAPOrGraphQLScanVulnerability
const soapOrGraphQLScanAgg = SOAPOrGraphQLScanVulnerability.aggregate([
    { $group: { _id: "$testCaseName", count: { $sum: 1 } } },
    { $addFields: { riskScore: "HIGH" } },
    { $project: { title: "$_id", count: 1, riskScore: 1, _id: 0 } }
]);


// Execute all aggregations in parallel
const [activeScanResults, llmScanResults, sbomScanResults, soapOrGraphQLScanResults] = await Promise.all([
    activeScanAgg.exec(),
    llmScanAgg.exec(),
    sbomScanAgg.exec(),
    soapOrGraphQLScanAgg.exec()
]);

// Combine all results
const combinedResults = [
    ...activeScanResults,
    ...llmScanResults,
    ...sbomScanResults,
    ...soapOrGraphQLScanResults
];

// Filter out invalid entries (e.g., null titles or counts less than 1)
const validResults = combinedResults.filter(result => result.title && result.count > 0);


// Sort combined results by count in descending order
validResults.sort((a, b) => b.count - a.count);
}

async function calculateDashboardCardData(organization){
    const user = await User.findById(req.user._id);

    const orgProjects = await OrgProject.find({ organization: user.organization })
    .select('_id')
    .lean();

    // Step 2: Get the IDs of these OrgProjects
    const orgProjectIds = orgProjects.map(project => project._id);

    const dashboardData = {};    

    //const collectionsCount = await APICollection.countDocuments({user:user._id})
    const collectionsCount = await APICollection.countDocuments({
        orgProject: { $in: orgProjectIds }
    });


    //const endpointsCount = await ApiEndpoint.countDocuments({user:user._id})
    const apiCollections = await APICollection.find({
        orgProject: { $in: orgProjectIds }
    })
    .select('_id')
    .lean();
    
    // Step 4: Get the IDs of these APICollections
    const apiCollectionIds = apiCollections.map(collection => collection._id);
    
    // Step 5: Find all APICollectionVersions for these APICollections
    const apiCollectionVersions = await APICollectionVersion.find({
        apiCollection: { $in: apiCollectionIds }
    })
    .select('_id')
    .lean();
    
    // Step 6: Get the IDs of these APICollectionVersions
    const apiCollectionVersionIds = apiCollectionVersions.map(version => version._id);
    
    // Step 7: Count ApiEndpoints for all these APICollectionVersions
    const endpointsCount = await ApiEndpoint.countDocuments({
        'theCollectionVersion': { $in: apiCollectionVersionIds }
    });


    //const agentsCount = await Project.countDocuments({user:user._id})
    const agentsCount = await Project.countDocuments({
        orgProject: { $in: orgProjectIds }
    });
    

    //const collectionsPromise = APICollection.find({ user: user._id }).select('_id').lean().exec();

    const collectionsPromise = OrgProject.aggregate([
        { $match: { organization: user.organization } },
        {
            $lookup: {
                from: 'apicollections',  // Adjust if your collection name is different
                localField: '_id',
                foreignField: 'orgProject',
                as: 'collections'
            }
        },
        { $unwind: '$collections' },
        {
            $replaceRoot: { newRoot: '$collections' }
        },
        {
            $project: { _id: 1 }
        }
    ]).exec();

    //const activeScansPromise = ActiveScan.find({ user: user._id }).select('_id').lean().exec();
    const activeScansPromise = OrgProject.aggregate([
        { $match: { organization: user.organization } },
        {
            $lookup: {
                from: 'apicollections',  // Adjust if your collection name is different
                localField: '_id',
                foreignField: 'orgProject',
                as: 'collections'
            }
        },
        { $unwind: '$collections' },
        {
            $lookup: {
                from: 'apicollectionversions',  // Adjust if your collection name is different
                localField: 'collections._id',
                foreignField: 'apiCollection',
                as: 'versions'
            }
        },
        { $unwind: '$versions' },
        {
            $lookup: {
                from: 'activescans',  // Adjust if your collection name is different
                localField: 'versions._id',
                foreignField: 'theCollectionVersion',
                as: 'scans'
            }
        },
        { $unwind: '$scans' },
        {
            $replaceRoot: { newRoot: '$scans' }
        },
        {
            $project: { _id: 1 }
        }
    ]).exec();

    const [collections, activeScans] = await Promise.all([collectionsPromise, activeScansPromise]);



    const collectionVersionIds = await APICollectionVersion.find(
        { apiCollection: { $in: collections.map(collection => collection._id) } }
    )
    .select('_id')
    .lean()
    .then(versions => versions.map(v => v._id));
    
   

    const endpointsArray = await ApiEndpoint.find({ 
        theCollectionVersion: { $in: collectionVersionIds } 
    })
    .select('_id piiFields')
    .lean();
    

    const activeScansVulnsCount = await ActiveScanVulnerability.countDocuments({ activeScan: { $in: activeScans.map(activeScan => activeScan._id) } });

    const attackSurfaceVulns = await AttackSurfaceScanVulnerability.aggregate([
        {
          $lookup: {
            from: 'attacksurfacescans', // Ensure this matches the actual collection name
            localField: 'attackSurfaceScan',
            foreignField: '_id',
            as: 'attackSurfaceScan'
          }
        },
        { $unwind: '$attackSurfaceScan' },
        {
          $match: {
            'attackSurfaceScan.orgProject': { $in: orgProjectIds }
          }
        },
        {
          $count: 'totalCount'
        }
      ]);
      const attackSurfaceVulnCount = attackSurfaceVulns.length > 0 ? attackSurfaceVulns[0].totalCount : 0;

//////////////////
      const projectVulns = await ProjectVulnerability.aggregate([
        {
          $lookup: {
            from: 'projects', // Ensure this matches the actual collection name
            localField: 'project',
            foreignField: '_id',
            as: 'project'
          }
        },
        { $unwind: '$project' },
        {
          $match: {
            'project.orgProject': { $in: orgProjectIds }
          }
        },
        {
          $count: 'totalCount'
        }
      ]);
      
      const projectVulnsCount = projectVulns.length > 0 ? projectVulns[0].totalCount : 0;
/////////////////////


const soapGraphQLVulns = await SOAPOrGraphQLScanVulnerability.aggregate([
    {
      $lookup: {
        from: 'soaporgraphqlscans', // Ensure this matches the actual collection name
        localField: 'soapOrGraphQLScan',
        foreignField: '_id',
        as: 'soapOrGraphQLScan'
      }
    },
    { $unwind: '$soapOrGraphQLScan' },
    {
      $match: {
        'soapOrGraphQLScan.orgProject': { $in: orgProjectIds }
      }
    },
    {
      $count: 'totalCount'
    }
  ]);

  
  const soapGraphQLVulnsCount = soapGraphQLVulns.length > 0 ? soapGraphQLVulns[0].totalCount : 0;
  ////////////////////////////


  const sbomScanVulns = await SBOMScanVulnerability.aggregate([
    {
      $lookup: {
        from: 'sbomscans', // Ensure this matches the actual collection name
        localField: 'sbomScan',
        foreignField: '_id',
        as: 'sbomScan'
      }
    },
    { $unwind: '$sbomScan' },
    {
      $match: {
        'sbomScan.orgProject': { $in: orgProjectIds }
      }
    },
    {
      $count: 'totalCount'
    }
  ]);
  
  const sbomScanVulnsCount = sbomScanVulns.length > 0 ? sbomScanVulns[0].totalCount : 0;

  //////////////////

    // Calculate PII fields count
    const piiFieldsCount = endpointsArray.reduce((count, endpoint) => count + endpoint.piiFields.length, 0);

    dashboardData.collectionsCount = collectionsCount;//collections.length;
    dashboardData.endPointsCount = endpointsCount;//endpointsArray.length;
    dashboardData.agentsCount = agentsCount;

    

    dashboardData.vulnerabilitiesCount = activeScansVulnsCount + attackSurfaceVulnCount + projectVulnsCount+
    soapGraphQLVulnsCount + sbomScanVulnsCount;//activeScansVulnsArray.length;
    
    dashboardData.alertsCount = activeScansVulnsCount;//0;
    dashboardData.piiDataFieldsCount = piiFieldsCount;
    dashboardData.falsePositivesCount = 0;

}

module.exports = {
    calculateDashboard,
};  
