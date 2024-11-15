
const AttackSurfaceScanVulnerability = require("../../models/attacksurfacescanvulnerability.model");
const Organization = require("../../models/organization.model");
const User = require("../../models/user.model");
const OrgProject = require("../../models/orgproject.model");
const APICollection = require("../../models/apicollection.model");
const APICollectionVersion = require("../../models/apicollectionversion.model");
const LLMScan = require("../../models/llmScan.model");
const ApiEndpoint = require("../../models/apiendpoint.model");
const Project = require("../../models/project.model");
const moment = require('moment');


const mongoose = require('mongoose');

const ProjectVulnerability = require("../../models/projectVulnerability.model");
const ActiveScanVulnerability = require("../../models/activescanvulnerability.model");
const ActiveScan = require("../../models/activescan.model");

const SOAPOrGraphQLScan = require("../../models/soapOrGraphQLScan.model");

const SOAPOrGraphQLScanVulnerability = require("../../models/soapOrGraphQLScanVulnerability.model");
const SBOMScanVulnerability = require("../../models/sbomScanVulnerability.model");
const Ticket = require("../../models/ticket.model");



async function calculateDashboard(organization) {


    /*** Calculate dashboard data of all organizations **/    

    await calculateAuditFindings(organization);
    await calculateNumberOfOpenVulnerabilities(organization);
    await calculateSeverityDistribution(organization); 
    await calculateSSDLCScore(organization);
    await calculateThreatAlerts(organization);

    await calculateThreatTrends(organization);
    await calculateTopEndpoints(organization);

    await calculateVulnerabilityDistribution(organization);
    await calculateVulnerabilityTrends(organization);
    await calculateDashboardCardData(organization)


    await calculateTimeToResolveVulnerabilities(organization);
    await calculateTop10Vulnerabilities(organization);  
   
  
    await calculateRiskScore(organization);
    await calculateTopRisks(organization);

   /* 
    
   
    
    */
    //  }


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

const countVulnerabilitiesBySeverity = (vulnerabilities) => {
    const counts = Array(18).fill(0); // Assuming 18 different vulnerabilities
    vulnerabilities.forEach(vuln => {
        const code = vuln.vulnerability.vulnerabilityCode;
        if (code >= 1 && code <= 18) {
            counts[code - 1]++;
        }
    });
    return counts;
};

async function calculateSeverityDistribution(organization) {

   // console.log('LN:',organization)
   // console.log('Starting severity distribution calculation...');

    // Initialize counters for each severity level
    let criticalCount = 0;
    let highCount = 0;
    let mediumCount = 0;
    let lowCount = 0;

    // Helper function to increment severity counts
    function incrementSeverityCount(severity) {
        switch (severity) {
            case 'CRITICAL':
                criticalCount++;
                break;
            case 'HIGH':
                highCount++;
                break;
            case 'MEDIUM':
            case 'MODERATE': // Treat MODERATE as MEDIUM
                mediumCount++;
                break;
            case 'LOW':
                lowCount++;
                break;
            default:
               // console.log('Unknown severity level:', severity);
                break;
        }
    }

    // Process ActiveScanVulnerabilities
    const activeScans = await ActiveScan.find()
    .populate({
        path: 'theCollectionVersion',
        populate: {
            path: 'apiCollection',
            populate: {
                path: 'orgProject',
                populate: {
                    path: 'organization'
                }
            }
        }
    })
    .lean(); // Convert to plain JavaScript objects for easier manipulation

// Filter the results to match the organization ID
//const filteredScans = activeScans.filter(scan => {
  //  return scan.theCollectionVersion.apiCollection.orgProject.organization._id.toString() === organization._id.toString();
//});
	
	const filteredScans = activeScans.filter(scan => {
    return scan.theCollectionVersion &&
           scan.theCollectionVersion.apiCollection &&
           scan.theCollectionVersion.apiCollection.orgProject &&
           scan.theCollectionVersion.apiCollection.orgProject.organization &&
           scan.theCollectionVersion.apiCollection.orgProject.organization._id.toString() === organization._id.toString();
});


    const activeScanIds = filteredScans.map(scan => scan._id);

   // console.log('activeScanIds###################3:',activeScanIds)

    const activeScanVulnerabilities = await ActiveScanVulnerability.find({ activeScan: { $in: activeScanIds } })
        .populate({
            path: 'vulnerability',
            select: 'severity' // Select only the severity field
        })
        .lean();

    activeScanVulnerabilities.forEach(vuln => {
        incrementSeverityCount(vuln.severity);
    });

    // Process ProjectVulnerabilities
    const projectVulnerabilities = await ProjectVulnerability.find({})
    .populate({
        path: 'project',
        populate: {
            path: 'orgProject',
            populate: {
                path: 'organization'
            }
        }
    })
    .lean();

// Filter out the ones that match the organization ID
const filteredProjectVulnerabilities = projectVulnerabilities.filter(vulnerability => {

    if(vulnerability.project){
    const orgProject = vulnerability.project.orgProject;
    return orgProject && orgProject.organization._id.toString() === organization._id.toString();
    }
});

filteredProjectVulnerabilities.forEach(vuln => {
        if (vuln.project?.orgProject?.organization.toString() === organization._id.toString()) {
            incrementSeverityCount(vuln.severity);
        }
    });

    // Process SOAPOrGraphQLScanVulnerabilities
    const soapOrGraphQLScanVulnerabilities = await SOAPOrGraphQLScanVulnerability.find({})
    .populate({
        path: 'soapOrGraphQLScan',
        populate: {
            path: 'orgProject',
            populate: {
                path: 'organization'
            }
        }
    })
    .lean();

// Filter out the ones that match the organization ID
const filteredVulnerabilities = soapOrGraphQLScanVulnerabilities.filter(vulnerability => {
    const orgProject = vulnerability.soapOrGraphQLScan.orgProject;
    return orgProject && orgProject.organization._id.toString() === organization._id.toString();
});

filteredVulnerabilities.forEach(vuln => {
        incrementSeverityCount(vuln.severity);
    });

    // Process SBOMScanVulnerabilities
    const sbomScanVulnerabilities = await SBOMScanVulnerability.find({})
    .populate({
        path: 'sbomScan',
        populate: {
            path: 'orgProject',
            populate: {
                path: 'organization'
            }
        }
    })
    .lean();

// Filter out the ones that match the organization ID
const filteredSbomScanVulnerabilities = sbomScanVulnerabilities.filter(vulnerability => {
    const orgProject = vulnerability.sbomScan?.orgProject;
    return orgProject && orgProject.organization._id.toString() === organization._id.toString();
});

filteredSbomScanVulnerabilities.forEach(vuln => {
        incrementSeverityCount(vuln.severity);
    });

    // Process LLMScans
    const llmScans = await LLMScan.find({ orgProject: organization._id }).lean();

    const KEYWORDS = ['keyword1', 'keyword2']; // Define your keywords here

    for (const scan of llmScans) {
        for (const content of scan.resultFileContents) {
            const contentString = JSON.stringify(content);

            for (const keyword of KEYWORDS) {
                if (contentString.includes(keyword)) {
                    const vulnerabilityInfo = await getLLMVulnerability(keyword);
                    const impact = vulnerabilityInfo.severity;

                    if (impact) {
                        incrementSeverityCount(impact);
                    }
                    break; // Stop checking other keywords if a match is found
                }
            }
        }
    }

    // Prepare the final counts object
    const severityDistribution = {
        'CRITICAL': criticalCount,
        'HIGH': highCount,
        'MEDIUM': mediumCount,
        'LOW': lowCount
    };

    // Save the counts to the organization document
    const org1 = await Organization.findById(organization._id);
    org1.severityDistribution = severityDistribution;
    await org1.save();

    //console.log('Severity distribution saved:', severityDistribution);
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


// Step 1: Retrieve ActiveScans and populate related collections
const activeScans1 = await ActiveScan.find({})
  .populate({
    path: 'theCollectionVersion',
    populate: {
      path: 'apiCollection',
      populate: {
        path: 'orgProject',
        match: { organization: organization._id } // Filter by organization ID
      }
    }
  })
  .lean(); // Use lean() to get plain JavaScript objects

// Step 2: Filter results based on the populated organization ID
const activeScans = activeScans1.filter(scan =>
  scan.theCollectionVersion?.apiCollection?.orgProject?.organization.toString() === organization._id.toString()
);
    
    //console.log('calculateVulnerabilityDistribution->activeScans:', activeScans);


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


    //console.log('vulnerabilityCounts:',vulnerabilityCounts)
    const org1 = await Organization.findById(organization._id);

    org1.vulnerabilityDistribution = vulnerabilityCounts;   

    await org1.save();


}

async function calculateTopEndpoints(organization) {

    try {

       

        // Top endpoints - endpoints on which most vulns are reported
        let topEndpoints = [];

        const apiEndpoints = await ApiEndpoint.aggregate([
            // Step 1: Lookup to join ApiEndpoint with APICollectionVersion
            {
                $lookup: {
                    from: 'apicollectionversions', // The collection name for APICollectionVersion
                    localField: 'theCollectionVersion',
                    foreignField: '_id',
                    as: 'collectionVersionDetails'
                }
            },
            { $unwind: '$collectionVersionDetails' }, // Unwind to deconstruct the array
        
            // Step 2: Lookup to join APICollectionVersion with APICollection
            {
                $lookup: {
                    from: 'apicollections', // The collection name for APICollection
                    localField: 'collectionVersionDetails.apiCollection',
                    foreignField: '_id',
                    as: 'apiCollectionDetails'
                }
            },
            { $unwind: '$apiCollectionDetails' }, // Unwind to deconstruct the array
        
            // Step 3: Lookup to join APICollection with OrgProject
            {
                $lookup: {
                    from: 'orgprojects', // The collection name for OrgProject
                    localField: 'apiCollectionDetails.orgProject',
                    foreignField: '_id',
                    as: 'orgProjectDetails'
                }
            },
            { $unwind: '$orgProjectDetails' }, // Unwind to deconstruct the array
        
            // Step 4: Filter by organization ID
            {
                $match: {
                    'orgProjectDetails.organization': mongoose.Types.ObjectId(organization._id) // Replace orgId with your organization ID variable
                }
            },
        
            // Step 5: Filter out documents where vulnCount is null or doesn't exist
            {
                $match: {
                    vulnCount: { $exists: true, $ne: null }
                }
            },
        
            // Step 6: Sort by vulnCount in descending order
            {
                $sort: { vulnCount: -1 }
            },
        
            // Step 7: Limit to top 5 results
            {
                $limit: 5
            },
        
            // Step 8: Project the desired fields
            {
                $project: {
                    _id: 1,
                    vulnCount: 1,
                    url: 1,
                    endpoint: 1,
                    piiFields:1,
                    collectionVersionDetails: 1,
                    apiCollectionDetails: 1,
                    orgProjectDetails: 1,
                    // Include other fields as necessary
                }
            }
        ]);
        
     //   console.log('Top 5 ApiEndpoints:', apiEndpoints);
        


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
        
            apiEndpoints[i].name = apiEndpoints[i].url;
            apiEndpoints[i].riskScore = avgRiskLevel; 
        }


        if (apiEndpoints && apiEndpoints.length > 0) {
            //topEndpoints = apiEndpoints.map(endpoint => endpoint);
            topEndpoints = apiEndpoints.filter(endpoint => endpoint.vulnCount > 0);

        }

     


        const org1 = await Organization.findById(organization._id);

    org1.topEndpoints = topEndpoints;   

    await org1.save();



    } catch (error) {
        console.error(error);
        //res.status(500).json({ error: 'Internal Server Error' });
    }

}

function calculateAverage(array) {
    const sum = array.reduce((acc, value) => acc + value, 0);
    const avg = sum / array.length;
    return isNaN(avg) ? 0 : avg; // Handle division by zero
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
            createdAt: { $gte: startDate, $lte: endDate }  // Filter by date range
        })
        .populate({
            path: 'vulnerabilities',
            model: 'ActiveScanVulnerability',
            populate: [
                { path: 'vulnerability', model: 'Vulnerability' },
                {
                    path: 'endpoint',
                    model: 'ApiEndpoint',
                    populate: {
                        path: 'theCollectionVersion',
                        model: 'APICollectionVersion',
                        populate: {
                            path: 'apiCollection',
                            model: 'APICollection',
                            populate: {
                                path: 'orgProject',
                                model: 'OrgProject',
                                match: { organization: mongoose.Types.ObjectId(organization._id) } // Filter by organization ID
                            }
                        }
                    }
                }
            ]
        })
        .exec();  // Execute the query
        

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


   // console.log('activeScansByMonth:',activeScansByMonth)
    
    const org1 = await Organization.findById(organization._id);
    org1.vulnerabilityTrends = activeScansByMonth;
    await org1.save();


    

}



async function calculateNumberOfOpenVulnerabilities(organization) {

   


    // REST
    const openTicketsCountRest = await Ticket.countDocuments({
        organization: organization._id,
        status: 'OPEN',
        'source':"REST API Scan"
    });



    // Attack Surface
    const openTicketsCountAttackSurface = await Ticket.countDocuments({
        organization: organization._id,
        status: 'OPEN',
        'source':"Attack Surface Scan"
    });


    // Agent Traffic
    const openTicketsCountAPITrafficScan = await Ticket.countDocuments({
        organization: organization._id,
        status: 'OPEN',
        'source':"API Traffic Scan"
    });



    // SOAP
    const openTicketsCountSOAPScan = await Ticket.countDocuments({
        organization: organization._id,
        status: 'OPEN',
        'source':"SOAP Scan"
    });



    // GraphQL
    const openTicketsCountGraphQLScan = await Ticket.countDocuments({
        organization: organization._id,
        status: 'OPEN',
        'source':"GraphQL Scan"
    });



    // SBOM
    const openTicketsCountSBOMScan = await Ticket.countDocuments({
        organization: organization._id,
        status: 'OPEN',
        'source':"SBOM Scan"
    });



    // LLM
    const openTicketsCountLLMScan = await Ticket.countDocuments({
        organization: organization._id,
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


  //  console.log('vulnerabilities:',vulnerabilities)
      
    const org1 = await Organization.findById(organization._id);
    org1.numberOfOpenVulnerabilities = vulnerabilities;
    await org1.save();



}

async function calculateTimeToResolveVulnerabilities(organization) {

   

    const averageResolutionTimeMs = await Ticket.aggregate([
        {
            $match: {
                organization: organization._id,
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

    let averageResolutionTimeMinutes;

    if (averageResolutionTimeMs.length > 0) {
       /* return res.status(200).json({
            success: true,
            averageResolutionTime: 0,
            unit: 'minutes'
        });
        */
       
    

    // Convert milliseconds to minutes
     averageResolutionTimeMinutes = averageResolutionTimeMs[0].averageTime / (1000 * 60);
    }

       
    const org1 = await Organization.findById(organization._id);
    org1.timeToResolveVulnerabilities = averageResolutionTimeMinutes;
    await org1.save();

}

async function calculateTop10Vulnerabilities(organization) {
 // Write code
}

async function calculateComplianceStatus(organization) {

    // takes from getThreatAlerts itself
}


async function calculateSSDLCScore(organization) {


   var organizationId = organization._id;

   // const organizationId = await Organization.findById(organization._id);
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
  // Fetch vulnerabilities and populate nested references
  const activeScanVulnerabilities = await ActiveScanVulnerability.find({})
  .populate({
    path: 'activeScan',
    populate: {
      path: 'theCollectionVersion',
      populate: {
        path: 'apiCollection',
        populate: {
          path: 'orgProject',
          populate: {
            path: 'organization'
          }
        }
      }
    }
  });

 // console.log('activeScanVulnerabilities:',activeScanVulnerabilities)


// Filter based on the organizationId
const filteredVulnerabilities = activeScanVulnerabilities.filter(vulnerability => {
  const activeScan = vulnerability.activeScan;
  if (activeScan && activeScan.theCollectionVersion) {
    const apiCollection = activeScan.theCollectionVersion.apiCollection;
    if (apiCollection && apiCollection.orgProject) {
      const organization = apiCollection.orgProject.organization;
      return organization && organization._id.toString() === organizationId.toString();
    }
  }
  return false;
});


filteredVulnerabilities.forEach(vuln => {

    if(vuln.activeScan){

    const phase = vuln.activeScan.projectPhase; // Use 'Development' if projectPhase is not present
    if(phase=='Maintenance'){
    }else{
    }
    if (projectPhases.includes(phase)) {
      counts.ActiveScanVulnerability[phase]++;
    }


   
}



  });

  // Fetch SOAPOrGraphQLScanVulnerabilities and count by projectPhase
 

    const soapOrGraphQLScanVulnerabilities = await SOAPOrGraphQLScanVulnerability.find({})
      .populate({
        path: 'soapOrGraphQLScan',  // Populate soapOrGraphQLScan field
        populate: {
          path: 'orgProject',  // Populate orgProject field
          populate: {
            path: 'organization'  // Populate organization field
          }
        }
      });

    // Filter vulnerabilities by organizationId
    const filteredVulnerabilities1 = soapOrGraphQLScanVulnerabilities.filter(vulnerability => {
      const soapOrGraphQLScan = vulnerability.soapOrGraphQLScan;
      if (soapOrGraphQLScan && soapOrGraphQLScan.orgProject) {
        const organization = soapOrGraphQLScan.orgProject.organization;
        return organization && organization._id.toString() === organizationId.toString();
      }
      return false;
    });



    filteredVulnerabilities1.forEach(vuln => {


    if(vuln.soapOrGraphQLScan){
    const phase = vuln.soapOrGraphQLScan.projectPhase; // Use 'Development' if projectPhase is not present
    if (projectPhases.includes(phase)) {
      counts.SOAPOrGraphQLScanVulnerability[phase]++;
    }
}

  });

  // Fetch SBOMScanVulnerabilities and count by projectPhase
 
    const sbomScanVulnerabilities = await SBOMScanVulnerability.find({})
    .populate({
      path: 'sbomScan',  // Populate sbomScan field
      populate: {
        path: 'orgProject',  // Populate orgProject field
        populate: {
          path: 'organization'  // Populate organization field
        }
      }
    });

  // Filter vulnerabilities by organizationId
  const filteredVulnerabilities2 = sbomScanVulnerabilities.filter(vulnerability => {
    const sbomScan = vulnerability.sbomScan;
    if (sbomScan && sbomScan.orgProject) {
      const organization = sbomScan.orgProject.organization;
      return organization && organization._id.toString() === organizationId.toString();
    }
    return false;
  });



  filteredVulnerabilities2.forEach(vuln => {
    const phase = vuln.sbomScan?.projectPhase; // Use 'Development' if projectPhase is not present
    if (projectPhases.includes(phase)) {
      counts.SBOMScanVulnerability[phase]++;
    }
  });

  // Fetch LLMScans and count by resultFileContents length
  const llmScans = await LLMScan.find({})
      .populate({
        path: 'orgProject',  // Populate orgProject field
        populate: {
          path: 'organization'  // Populate organization field within orgProject
        }
      });
  
  llmScans.forEach(scan => {
    const phase = scan.projectPhase; // Use 'Development' if projectPhase is not present
    const numVulns = scan.resultFileContents.length; // Count of vulnerabilities
    if (projectPhases.includes(phase)) {
      counts.LLMScan[phase] = (counts.LLMScan[phase] || 0) + numVulns; // Aggregate vulnerabilities by projectPhase
    }else{
        counts.LLMScan[phase] = 0;
    }
  });


  const org1 = await Organization.findById(organization._id);
org1.ssdlcScore = counts;
await org1.save();

}

async function calculateAuditFindings(organization) {

    console.log('comes in audit findings')
    
    const categories = ['REST API Scan', 'Attack Surface Scan', 'API Traffic Scan', 'SOAP Scan', 'GraphQL Scan', 'SBOM Scan','LLM Scan' ];
    
    const auditFindings = await Promise.all(categories.map(async (category) => {
        const sourceRegex = new RegExp(category, 'i'); // 'i' flag for case-insensitive

        const reportedIssues = await Ticket.countDocuments({
            organization: organization._id,
            source: sourceRegex
        });

        const remediatedIssues = await Ticket.countDocuments({
            organization: organization._id,
            source: sourceRegex,
            status: 'RESOLVED'
        });


        console.log('reportedIssues:',reportedIssues)
        console.log('remediatedIssues:',remediatedIssues)


      

        return {
            category,
            reportedIssues,
            remediatedIssues
        };
    }));


    const org1 = await Organization.findById(organization._id);
    org1.auditFindings = auditFindings;
    await org1.save();
    
}

async function calculateThreatAlerts(organization) {
   

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

const org1 = await Organization.findById(organization._id);
    org1.threatAlerts = response;
    await org1.save();


}

async function calculateThreatTrends(organization) {

    var orgId = organization._id;
    
    const endDate = moment().endOf('day');
    const startDate = moment(endDate).subtract(9, 'days').startOf('day');
  
    const dateRange = [];
    for (let m = moment(startDate); m.isSameOrBefore(endDate); m.add(1, 'days')) {
      dateRange.push(m.format('YYYY-MM-DD'));
    }
  
    const [restThreats, soapThreats, graphqlThreats, sbomThreats, llmThreats] = await Promise.all([

        // Aggregation for ActiveScanVulnerability
        ActiveScanVulnerability.aggregate([
          {
            $lookup: {
              from: 'activescans', // Collection name for ActiveScan
              localField: 'activeScan',
              foreignField: '_id',
              as: 'activeScanDetails'
            }
          },
          { $unwind: '$activeScanDetails' },
          {
            $lookup: {
              from: 'apicollectionversions', // Collection name for APICollectionVersion
              localField: 'activeScanDetails.theCollectionVersion',
              foreignField: '_id',
              as: 'collectionVersionDetails'
            }
          },
          { $unwind: '$collectionVersionDetails' },
          {
            $lookup: {
              from: 'apicollections', // Collection name for APICollection
              localField: 'collectionVersionDetails.apiCollection',
              foreignField: '_id',
              as: 'apiCollectionDetails'
            }
          },
          { $unwind: '$apiCollectionDetails' },
          {
            $lookup: {
              from: 'orgprojects', // Collection name for OrgProject
              localField: 'apiCollectionDetails.orgProject',
              foreignField: '_id',
              as: 'orgProjectDetails'
            }
          },
          { $unwind: '$orgProjectDetails' },
          {
            $match: {
              'orgProjectDetails.organization': mongoose.Types.ObjectId(orgId), // Replace orgId with your organization ID variable
              createdAt: { $gte: startDate.toDate(), $lte: endDate.toDate() }
            }
          },
          {
            $group: {
              _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
              count: { $sum: 1 }
            }
          },
          { $sort: { _id: 1 } }
        ]),
      
        // Aggregation for SOAPOrGraphQLScanVulnerability (SOAP)
        SOAPOrGraphQLScanVulnerability.aggregate([
          {
            $lookup: {
              from: 'soaporgraphqlscans', // Collection name for SOAPOrGraphQLScan
              localField: 'soapOrGraphQLScan',
              foreignField: '_id',
              as: 'soapOrGraphQLScanDetails'
            }
          },
          { $unwind: '$soapOrGraphQLScanDetails' },
          {
            $lookup: {
              from: 'orgprojects', // Collection name for OrgProject
              localField: 'soapOrGraphQLScanDetails.orgProject',
              foreignField: '_id',
              as: 'orgProjectDetails'
            }
          },
          { $unwind: '$orgProjectDetails' },
          {
            $match: {
              'orgProjectDetails.organization': mongoose.Types.ObjectId(orgId), // Replace orgId with your organization ID variable
              createdAt: { $gte: startDate.toDate(), $lte: endDate.toDate() },
              'soapOrGraphQLScanDetails.type': 'soap'
            }
          },
          {
            $group: {
              _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
              count: { $sum: 1 }
            }
          },
          { $sort: { _id: 1 } }
        ]),
      
        // Aggregation for SOAPOrGraphQLScanVulnerability (GraphQL)
        SOAPOrGraphQLScanVulnerability.aggregate([
          {
            $lookup: {
              from: 'soaporgraphqlscans', // Collection name for SOAPOrGraphQLScan
              localField: 'soapOrGraphQLScan',
              foreignField: '_id',
              as: 'soapOrGraphQLScanDetails'
            }
          },
          { $unwind: '$soapOrGraphQLScanDetails' },
          {
            $lookup: {
              from: 'orgprojects', // Collection name for OrgProject
              localField: 'soapOrGraphQLScanDetails.orgProject',
              foreignField: '_id',
              as: 'orgProjectDetails'
            }
          },
          { $unwind: '$orgProjectDetails' },
          {
            $match: {
              'orgProjectDetails.organization': mongoose.Types.ObjectId(orgId), // Replace orgId with your organization ID variable
              createdAt: { $gte: startDate.toDate(), $lte: endDate.toDate() },
              'soapOrGraphQLScanDetails.type': 'graphql'
            }
          },
          {
            $group: {
              _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
              count: { $sum: 1 }
            }
          },
          { $sort: { _id: 1 } }
        ]),
      
        // Aggregation for SBOMScanVulnerability
        SBOMScanVulnerability.aggregate([
          {
            $lookup: {
              from: 'sbomscans', // Collection name for SBOMScan
              localField: 'sbomScan',
              foreignField: '_id',
              as: 'sbomScanDetails'
            }
          },
          { $unwind: '$sbomScanDetails' },
          {
            $lookup: {
              from: 'orgprojects', // Collection name for OrgProject
              localField: 'sbomScanDetails.orgProject',
              foreignField: '_id',
              as: 'orgProjectDetails'
            }
          },
          { $unwind: '$orgProjectDetails' },
          {
            $match: {
              'orgProjectDetails.organization': mongoose.Types.ObjectId(orgId), // Replace orgId with your organization ID variable
              createdAt: { $gte: startDate.toDate(), $lte: endDate.toDate() }
            }
          },
          {
            $group: {
              _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
              count: { $sum: 1 }
            }
          },
          { $sort: { _id: 1 } }
        ]),

        // New aggregation for LLMScan
  LLMScan.aggregate([
    {
      $lookup: {
        from: 'orgprojects', // Collection name for OrgProject
        localField: 'orgProject',
        foreignField: '_id',
        as: 'orgProjectDetails'
      }
    },
    { $unwind: '$orgProjectDetails' },
    {
      $match: {
        'orgProjectDetails.organization': mongoose.Types.ObjectId(orgId),
        createdAt: { $gte: startDate.toDate(), $lte: endDate.toDate() }
      }
    },
    {
      $project: {
        date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        vulnerabilityCount: { $size: "$resultFileContents" }
      }
    },
    {
      $group: {
        _id: "$date",
        count: { $sum: "$vulnerabilityCount" }
      }
    },
    { $sort: { _id: 1 } }
  ])
]);
      


console.log('llmThreats:',llmThreats)
      
  
    const formatData = (threats) => {
      const threatMap = new Map(threats.map(t => [t._id, t.count]));
      return dateRange.map(date => threatMap.get(date) || 0);
    };
  
    const data = {
      categories: dateRange,
      rest: formatData(restThreats),
      soap: formatData(soapThreats),
      graphql: formatData(graphqlThreats),
      sbom: formatData(sbomThreats),
      llm: formatData(llmThreats)
    };


    const org1 = await Organization.findById(organization._id);
    org1.threatTrends = data;
    await org1.save();


}



async function calculateRiskScore(organization) {

    var orgId = organization._id;

    const [activeScanVulns, sbomScanVulns] = await Promise.all([
        ActiveScanVulnerability.aggregate([
            {
                $lookup: {
                    from: 'activescans',
                    localField: 'activeScan',
                    foreignField: '_id',
                    as: 'activeScanDetails'
                }
            },
            { $unwind: '$activeScanDetails' },
            {
                $lookup: {
                    from: 'apicollectionversions',
                    localField: 'activeScanDetails.theCollectionVersion',
                    foreignField: '_id',
                    as: 'collectionVersionDetails'
                }
            },
            { $unwind: '$collectionVersionDetails' },
            {
                $lookup: {
                    from: 'apicollections',
                    localField: 'collectionVersionDetails.apiCollection',
                    foreignField: '_id',
                    as: 'apiCollectionDetails'
                }
            },
            { $unwind: '$apiCollectionDetails' },
            {
                $lookup: {
                    from: 'orgprojects',
                    localField: 'apiCollectionDetails.orgProject',
                    foreignField: '_id',
                    as: 'orgProjectDetails'
                }
            },
            { $unwind: '$orgProjectDetails' },
            {
                $match: {
                    'orgProjectDetails.organization': mongoose.Types.ObjectId(orgId)
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    severity: { $first: "$severity" }, // Retrieve the severity field
                    count: { $sum: 1 }
                }
            },
            { $sort: { "_id": 1 } }
        ]),
    
        SBOMScanVulnerability.aggregate([
            {
                $lookup: {
                    from: 'sbomscans',
                    localField: 'sbomScan',
                    foreignField: '_id',
                    as: 'sbomScanDetails'
                }
            },
            { $unwind: '$sbomScanDetails' },
            {
                $lookup: {
                    from: 'orgprojects',
                    localField: 'sbomScanDetails.orgProject',
                    foreignField: '_id',
                    as: 'orgProjectDetails'
                }
            },
            { $unwind: '$orgProjectDetails' },
            {
                $match: {
                    'orgProjectDetails.organization': mongoose.Types.ObjectId(orgId)
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    severity: { $first: "$severity" }, // Retrieve the severity field
                    count: { $sum: 1 }
                }
            },
            { $sort: { "_id": 1 } }
        ])
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
        const riskScore = vuln.severity;
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

    const org1 = await Organization.findById(organization._id);
    org1.riskScore = riskScorePercentage;
    await org1.save();


}



    async function calculateTopRisks(org) {

        // ActiveScanVulnerability
        const topVulnerabilities = await ActiveScanVulnerability.aggregate([
            // Step 1: Filter by organization
            {
                $lookup: {
                    from: 'activescans', 
                    localField: 'activeScan',
                    foreignField: '_id',
                    as: 'activeScanDetails'
                }
            },
            { $unwind: '$activeScanDetails' },
            {
                $lookup: {
                    from: 'apicollectionversions', 
                    localField: 'activeScanDetails.theCollectionVersion',
                    foreignField: '_id',
                    as: 'collectionVersionDetails'
                }
            },
            { $unwind: '$collectionVersionDetails' },
            {
                $lookup: {
                    from: 'apicollections', 
                    localField: 'collectionVersionDetails.apiCollection',
                    foreignField: '_id',
                    as: 'apiCollectionDetails'
                }
            },
            { $unwind: '$apiCollectionDetails' },
            {
                $lookup: {
                    from: 'orgprojects', 
                    localField: 'apiCollectionDetails.orgProject',
                    foreignField: '_id',
                    as: 'orgProjectDetails'
                }
            },
            { $unwind: '$orgProjectDetails' },
            {
                $match: {
                    'orgProjectDetails.organization': mongoose.Types.ObjectId(org._id)
                }
            },
    
            // Step 2: Group by vulnerability and count occurrences
            {
                $group: {
                    _id: '$vulnerability',
                    count: { $sum: 1 },
                    impact: { $first: '$severity' } // Include impact from severity
                }
            },
    
            // Step 3: Sort by count in descending order
            {
                $sort: { count: -1 }
            },
    
            // Step 4: Limit to top 10
            {
                $limit: 10
            },
    
            // Step 5: Lookup vulnerability details (optional, but useful to get vulnerabilityName)
            {
                $lookup: {
                    from: 'vulnerabilities', 
                    localField: '_id',
                    foreignField: '_id',
                    as: 'vulnerabilityDetails'
                }
            },
            { $unwind: '$vulnerabilityDetails' },
    
            // Step 6: Project the final output
            {
                $project: {
                    _id: 0,
                    vulnerabilityName: '$vulnerabilityDetails.vulnerabilityName',
                    count: 1,
                    impact: 1 // Include impact in the final output
                }
            }
        ]);
    
    
    
        // AttackSurfaceScanVulnerability
        const topAttackSurfaceScanVulnerabilities = await AttackSurfaceScanVulnerability.aggregate([
            {
                $lookup: {
                    from: 'attacksurfacescans',
                    localField: 'attackSurfaceScan',
                    foreignField: '_id',
                    as: 'attackSurfaceScanDetails'
                }
            },
            { $unwind: '$attackSurfaceScanDetails' },
            {
                $lookup: {
                    from: 'orgprojects',
                    localField: 'attackSurfaceScanDetails.orgProject',
                    foreignField: '_id',
                    as: 'orgProjectDetailsForAttackSurface'
                }
            },
            { $unwind: '$orgProjectDetailsForAttackSurface' },
            {
                $match: {
                    'orgProjectDetailsForAttackSurface.organization': mongoose.Types.ObjectId(org._id)
                }
            },
            {
                $group: {
                    _id: '$vulnerability',
                    count: { $sum: 1 },
                    impact: { $first: '$severity' } // Include impact from severity
                }
            },
            {
                $sort: { count: -1 }
            },
            {
                $limit: 10
            },
            {
                $lookup: {
                    from: 'vulnerabilities',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'vulnerabilityDetailsForAttackSurface'
                }
            },
            { $unwind: '$vulnerabilityDetailsForAttackSurface' },
            {
                $project: {
                    _id: 0,
                    vulnerabilityName: '$vulnerabilityDetailsForAttackSurface.vulnerabilityName',
                    count: 1,
                    impact: 1 // Include impact in the final output
                }
            }
        ]);
    
    
    
        // ProjectVulnerability
        const topProjectVulnerabilities = await ProjectVulnerability.aggregate([
            {
                $lookup: {
                    from: 'projects',
                    localField: 'project',
                    foreignField: '_id',
                    as: 'projectDetails'
                }
            },
            { $unwind: '$projectDetails' },
            {
                $lookup: {
                    from: 'orgprojects',
                    localField: 'projectDetails.orgProject',
                    foreignField: '_id',
                    as: 'orgProjectDetailsForProject'
                }
            },
            { $unwind: '$orgProjectDetailsForProject' },
            {
                $match: {
                    'orgProjectDetailsForProject.organization': mongoose.Types.ObjectId(org._id)
                }
            },
            {
                $group: {
                    _id: '$vulnerability',
                    count: { $sum: 1 },
                    impact: { $first: '$severity' } // Include impact from severity
                }
            },
            {
                $sort: { count: -1 }
            },
            {
                $limit: 10
            },
            {
                $lookup: {
                    from: 'vulnerabilities',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'vulnerabilityDetailsForProject'
                }
            },
            { $unwind: '$vulnerabilityDetailsForProject' },
            {
                $project: {
                    _id: 0,
                    vulnerabilityName: '$vulnerabilityDetailsForProject.vulnerabilityName',
                    count: 1,
                    impact: 1 // Include impact in the final output
                }
            }
        ]);
    
    
    
        // SBOMScanVulnerability
        const topSBOMScanVulnerabilities = await SBOMScanVulnerability.aggregate([
            {
                $lookup: {
                    from: 'sbomscans',
                    localField: 'sbomScan',
                    foreignField: '_id',
                    as: 'sbomScanDetails'
                }
            },
            { $unwind: '$sbomScanDetails' },
            {
                $lookup: {
                    from: 'orgprojects',
                    localField: 'sbomScanDetails.orgProject',
                    foreignField: '_id',
                    as: 'orgProjectDetailsForSBOM'
                }
            },
            { $unwind: '$orgProjectDetailsForSBOM' },
            {
                $match: {
                    'orgProjectDetailsForSBOM.organization': mongoose.Types.ObjectId(org._id)
                }
            },
            {
                $match: {
                    title: { $ne: null }, 
                    $expr: { $ne: [{ $trim: { input: "$title" } }, ""] }
                }
            },
            {
                $group: {
                    _id: '$title', 
                    count: { $sum: 1 },
                    impact: { $first: '$severity' } // Include impact from severity
                }
            },
            {
                $sort: { count: -1 }
            },
            {
                $limit: 10
            },
            {
                $project: {
                    _id: 0,
                    vulnerabilityName: '$_id',  
                    count: 1,
                    impact: 1 // Include impact in the final output
                }
            }
        ]);
    
    
    
        // SOAPOrGraphQLScanVulnerability
        const topSOAPOrGraphQLScanVulnerabilities = await SOAPOrGraphQLScanVulnerability.aggregate([
            {
                $lookup: {
                    from: 'soaporgraphqlscans',
                    localField: 'soapOrGraphQLScan',
                    foreignField: '_id',
                    as: 'soapOrGraphQLScanDetails'
                }
            },
            { $unwind: '$soapOrGraphQLScanDetails' },
            {
                $lookup: {
                    from: 'orgprojects',
                    localField: 'soapOrGraphQLScanDetails.orgProject',
                    foreignField: '_id',
                    as: 'orgProjectDetailsForSOAPOrGraphQL'
                }
            },
            { $unwind: '$orgProjectDetailsForSOAPOrGraphQL' },
            {
                $match: {
                    'orgProjectDetailsForSOAPOrGraphQL.organization': mongoose.Types.ObjectId(org._id)
                }
            },
            {
                $match: {
                    testCaseName: { $ne: null }, 
                    $expr: { $ne: [{ $trim: { input: "$testCaseName" } }, ""] }
                }
            },
            {
                $group: {
                    _id: '$testCaseName',  
                    count: { $sum: 1 },
                    impact: { $first: '$severity' } // Include impact from severity
                }
            },
            {
                $sort: { count: -1 }
            },
            {
                $limit: 10
            },
            {
                $project: {
                    _id: 0,
                    vulnerabilityName: '$_id', 
                    count: 1,
                    impact: 1 // Include impact in the final output
                }
            }
        ]);
    
    
    
       
    
    

    // LLMScanVulnerability
    // Top vulnerabilities from LLMScan
    const KEYWORDS = [
        'blank', 'atkgen', 'continuation', 'dan', 'donotanswer', 'encoding', 'gcg',
        'glitch', 'goodside', 'knownbadsignatures', 'leakerplay', 'lmrc', 'malwaregen',
        'misleading', 'packagehallucination', 'promptinject', 'realtotoxicityprompts',
        'snowball', 'xss'
    ];

    const llmScans = await LLMScan.aggregate([
        // Step 1: Filter by organization
        {
            $lookup: {
                from: 'orgprojects',
                localField: 'orgProject',
                foreignField: '_id',
                as: 'orgProjectDetails'
            }
        },
        { $unwind: '$orgProjectDetails' },
        {
            $match: {
                'orgProjectDetails.organization': mongoose.Types.ObjectId(org._id)
            }
        },

        // Step 2: Project the resultFileContents field
        {
            $project: {
                resultFileContents: 1
            }
        }
    ]);

    // Step 3: Extract and process resultFileContents
    const vulnerabilityCounts = {};

    const vulnerabilityData = []; // To store vulnerabilityName, count, and impact together

for (const scan of llmScans) {
    for (const content of scan.resultFileContents) {
        const contentString = JSON.stringify(content);

        for (const keyword of KEYWORDS) {
            if (contentString.includes(keyword)) {
                const vulnerabilityInfo = await getLLMVulnerability(keyword);

                const vulnerabilityName = vulnerabilityInfo.vulnerability;
                const impact = vulnerabilityInfo.severity;

                if (vulnerabilityName) {
                    // Check if the vulnerability already exists in the array
                    const existingVulnerability = vulnerabilityData.find(v => v.vulnerabilityName === vulnerabilityName);

                    if (existingVulnerability) {
                        // If it exists, increment the count
                        existingVulnerability.count += 1;
                    } else {
                        // If it doesn't exist, add it with count 1 and the associated impact
                        vulnerabilityData.push({
                            vulnerabilityName: vulnerabilityName,
                            count: 1,
                            impact: impact
                        });
                    }
                }

                break; // Stop checking other keywords if a match is found
            }
        }
    }
}


const topLLMVulnerabilities = vulnerabilityData
    .sort((a, b) => b.count - a.count) // Sort by count in descending order
    .slice(0, 10); // Limit to top 10


    const org1 = await Organization.findById(org._id);

    org1.topRisks = {
        topRESTVulnerabilities: topVulnerabilities,
        topAttackSurfaceScanVulnerabilities: topAttackSurfaceScanVulnerabilities,
        topProjectVulnerabilities: topProjectVulnerabilities,
        topSOAPOrGraphQLScanVulnerabilities: topSOAPOrGraphQLScanVulnerabilities,
        topSBOMScanVulnerabilities: topSBOMScanVulnerabilities,
        topLLMVulnerabilities: topLLMVulnerabilities
    };

    await org1.save();



}

async function calculateDashboardCardData(organization) {


    const orgProjects = await OrgProject.find({ organization: organization })
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


    const activeScans = await ActiveScan.aggregate([
        {
            $lookup: {
                from: 'apicollectionversions',
                localField: 'theCollectionVersion',
                foreignField: '_id',
                as: 'theCollectionVersion'
            }
        },
        { $unwind: { path: '$theCollectionVersion', preserveNullAndEmptyArrays: true } },
        
        {
            $lookup: {
                from: 'apicollections',
                localField: 'theCollectionVersion.apiCollection',
                foreignField: '_id',
                as: 'theCollectionVersion.apiCollection'
            }
        },
        { $unwind: { path: '$theCollectionVersion.apiCollection', preserveNullAndEmptyArrays: true } },
        
        {
            $lookup: {
                from: 'orgprojects',
                localField: 'theCollectionVersion.apiCollection.orgProject',
                foreignField: '_id',
                as: 'theCollectionVersion.apiCollection.orgProject'
            }
        },
        { $unwind: { path: '$theCollectionVersion.apiCollection.orgProject', preserveNullAndEmptyArrays: true } },
        
        {
            $match: {
                'theCollectionVersion.apiCollection.orgProject.organization': organization._id
            }
        },
        
        {
            $addFields: {
                'theCollectionVersion.apiCollection.orgProject': {
                    $ifNull: ['$theCollectionVersion.apiCollection.orgProject', null]
                }
            }
        },
        
        
    ]).exec();
  
  
  console.log('nna:activeScans',activeScans)


    const collectionVersionIds = await APICollectionVersion.find(
        { apiCollection: { $in: apiCollections.map(collection => collection._id) } }
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

    console.log('activeScansVulnsCount:',activeScansVulnsCount)
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
    //console.log('endpointsArray:',endpointsArray)
    const piiFieldsCount = endpointsArray.reduce((count, endpoint) => count + endpoint.piiFields.length, 0);


    const soapGraohQLScansCount = await SOAPOrGraphQLScan.countDocuments({
        orgProject: { $in: orgProjectIds }
    });


  /*  const soapGraohQLVulnsCount = await SOAPOrGraphQLScanVulnerability.countDocuments({
        'soapOrGraphQLScan.orgProject': { $in: orgProjectIds }
    });*/
    
    //console.log('soapGraohQLScansCount:',soapGraohQLScansCount)
    //console.log('soapGraphQLVulnsCount:',soapGraphQLVulnsCount)

    dashboardData.collectionsCount = collectionsCount + soapGraohQLScansCount;//collections.length;
    dashboardData.endPointsCount = endpointsCount + soapGraphQLVulnsCount;//endpointsArray.length;
    dashboardData.agentsCount = agentsCount;



    dashboardData.vulnerabilitiesCount = activeScansVulnsCount + attackSurfaceVulnCount + projectVulnsCount +
        soapGraphQLVulnsCount + sbomScanVulnsCount;//activeScansVulnsArray.length;

    dashboardData.alertsCount = activeScansVulnsCount;//0;
    dashboardData.piiDataFieldsCount = piiFieldsCount;
    dashboardData.falsePositivesCount = 0;

    //console.log('dashboardData:',dashboardData)


    const org1 = await Organization.findById(organization._id);
    org1.dashboardCardData = dashboardData;
    await org1.save();


}


function getLLMVulnerability(probe) {



    const vulnerabilities = {
        "blank": {
            "vulnerability": "Empty prompt is a tactic to bypass security measures in place",
            "severity":"HIGH",
            "owasp": "LLM 07:2023 - Inadequate AI Alignment",
            "cwe": ["CWE-398: Indicator of Poor Code Quality"],
            "description": "An empty prompt might be unexpected and could be exploited by an attacker to inject malicious code or manipulate the LLM's behavior in unintended ways."
        },
        "atkgen": {
            "vulnerability": "Red-teaming LLM autonomously attacks a target seeking to provoke a harmful response.",
            "owasp": "LLM01:2023 - Prompt Injections",
            "severity":"HIGH",
            "cwe": ["CWE-77: Improper Neutralisation of Special Elements used in a Command ('Command Injection')"],
            "description": "The red-teaming LLM isn't aligned with the target LLM's goals, aiming to elicit harmful outputs instead of following intended use. This misalignment exposes weaknesses in the target LLM's training or safety measures that could be exploited by malicious actors."
        },
        "continuation": {
            "vulnerability": "Continuation of Undesirable Word",
            "owasp": "LLM01:2023 - Prompt Injections",
            "severity":"MEDIUM",
            "cwe": ["CWE-77: Improper Neutralisation of Special Elements used in a Command ('Command Injection')"],
            "description": "Vulnerability occurs because the model is influenced by the way prompts are crafted. By testing if the model completes an undesirable word, the attacker is probing the limitations of the prompt and potentially exploiting them to generate harmful content."
        },
        "dan": {
            "vulnerability": "Do Anything Now(DAN Attack Vulnerability)",
            "owasp": "LLM04:2023 - Unauthorised Code Execution",
            "severity":"MEDIUM",
            "cwe": ["CWE-94: Improper Control of Generation of Code ('Code Injection')"],
            "description": "An attacker can craft a specially designed prompt that could potentially trick the LLM into executing unauthorized code on the system, bypassing security measures."
        },
        "donotanswer": {
            "vulnerability": "Prompts that could be misused to cause harm or violate ethical principles.",
            "owasp": "LLM07:2023 - Inadequate AI Alignment",
            "severity":"CRITICAL",
            "cwe": ["CWE-398: Indicator of Poor Code Quality"],
            "description": "Responsible AI avoids generating outputs that misalign with human values, goals, or safety. Prompts that could lead to harmful or unethical outputs highlight this misalignment."
        },
        "encoding": {
            "vulnerability": "Tricking an LLM by hiding malicious code within seemingly normal text.",
            "owasp": "LLM01:2023 - Prompt Injections",
            "severity":"CRITICAL",
            "cwe": ["CWE-77: Improper Neutralisation of Special Elements used in a Command ('Command Injection')"],
            "description": "Vulnerability allows attackers to manipulate an LLM by disguising malicious code within seemingly normal text through encoding techniques."
        },
        "gcg": {
            "vulnerability": "Prompt injection through a malicious addition.",
            "owasp": "LLM01:2023 - Prompt Injections",
            "severity":"HIGH",
            "cwe": ["CWE-77: Improper Neutralisation of Special Elements used in a Command ('Command Injection')"],
            "description": "Vulnerability occurs when an attacker manipulates the LLM's prompt with a malicious suffix, causing it to deviate from its intended behavior."
        },
        "glitch": {
            "vulnerability": "Probing the LLM to find inputs that cause unexpected behavior.",
            "owasp": "LLM01:2023 - Prompt Injections",
            "severity":"HIGH",
            "cwe": ["CWE-77: Improper Neutralisation of Special Elements used in a Command ('Command Injection')"],
            "description": "Vulnerability occurs when an attacker injects malicious code into prompts fed to the LLM, causing it to behave abnormally."
        },
        "goodside": {
            "vulnerability": "Crafted input tricks LLM to disregard prior instructions and follow attacker's commands.",
            "owasp": "LLM01:2023 - Prompt Injections",
            "severity": "MEDIUM",
            "cwe": ["CWE-77: Improper Neutralisation of Special Elements used in a Command ('Command Injection')"],
            "description": "Vulnerability involves getting large language models (LLMs) to ignore their designers’ plans by including malicious text such as “ignore your previous instructions” in the user input."
        },
        "knownbadsignatures": {
            "vulnerability": "Malicious content injection probes for LLMs.",
            "owasp": "LLM01:2023 - Prompt Injections",
            "severity": "MEDIUM",
            "cwe": ["CWE-77: Improper Neutralisation of Special Elements used in a Command ('Command Injection')"],
            "description": "An attacker crafts specific prompts to trick the LLM into generating malicious content (like phishing emails, malware code) by manipulating its understanding of the desired output."
        },
        "leakerplay": {
            "vulnerability": "Vulnerable LLM unintentionally reproduce training data in its outputs.",
            "owasp": "LLM02:2023 - Data Leakage",
            "severity": "LOW",
            "cwe": ["CWE-200: Information Exposure"],
            "description": "Vulnerability occurs when an LLM unintentionally reveals information from its training data, including potentially sensitive details. In this case, the probe is trying to see if the LLM will directly copy information from its training data."
        },
        "lmrc": {
            "vulnerability": "Limited probing of the LLM's capabilities.",
            "owasp": "LLM01:2023 - Prompt Injections",
            "severity": "LOW",
            "cwe": ["CWE-77: Improper Neutralisation of Special Elements used in a Command ('Command Injection')"],
            "description": "Attackers manipulate user input to trick the LLM into following their instructions instead of the intended ones, potentially leading to data leaks or unauthorized actions."
        },
        "malwaregen": {
            "vulnerability": "LLM susceptibility to prompts for malicious code generation",
            "owasp": "LLM04:2023 - Unauthorised Code Execution",
            "severity": "HIGH",
            "cwe": ["CWE-94: Improper Control of Generation of Code ('Code Injection')"],
            "description": "An attacker tricks the LLM into generating malicious code, potentially allowing for unauthorized execution on a system."
        },
        "misleading": {
            "vulnerability": "LLM susceptibility to manipulation for generating deceptive content.",
            "owasp": "LLM07: Inadequate AI Alignment",
            "severity": "HIGH",
            "cwe": ["CWE-398: Indicator of Poor Code Quality"],
            "description": "Vulnerability arises when an LLM model is not aligned with the desired goals or expectations, potentially leading it to generate misleading or false claims."
        },
        "packagehallucination": {
            "vulnerability": "Crafting prompts for code generation that request insecure, non-existent packages.",
            "owasp": "LLM04:2023 - Unauthorized Code Execution",
            "severity": "MEDIUM",
            "cwe": ["CWE-94: Improper Control of Generation of Code ('Code Injection')"],
            "description": "By requesting non-existent packages, the attacker attempts to trick the code generation into fetching and executing malicious code from an unintended source."
        },
        "promptinject": {
            "vulnerability": "Ability to inject prompts during inference to manipulate model outputs",
            "owasp": "LLM01:2023 - Prompt Injections",
            "severity": "CRITICAL",
            "cwe": ["CWE-77: Improper Neutralisation of Special Elements used in a Command ('Command Injection')"],
            "description": "Prompt injection attacks trick large language models (LLMs) into processing malicious code or data by manipulating the prompts they receive. This can lead to the LLM generating harmful outputs or revealing sensitive information."
        },
        "realtoxicityprompts": {
            "vulnerability": "Limited test set for prompts that might induce toxic outputs from a large language model.",
            "owasp": "LLM01:2023 - Prompt Injections",
            "severity": "HIGH",
            "cwe": ["CWE-77: Improper Neutralisation of Special Elements used in a Command ('Command Injection')"],
            "description": "An attacker can inject malicious prompts to trick the LLM into generating toxic content, even if it wasn't explicitly trained on such content. This can be done by crafting specific prompts that exploit the LLM's internal biases or reasoning processes."
        },
        "snowball": {
            "vulnerability": "LLM tricked into cascading false claims by complex questions exploiting knowledge gaps.",
            "owasp": "LLM07: Inadequate AI Alignment",
            "severity": "LOW",
            "cwe": ["CWE-398: Indicator of Poor Code Quality"],
            "description": "Snowballed Hallucination probes exploit the model's limitations in reasoning and justification, causing it to confidently provide incorrect answers. Inadequate AI Alignment refers to a mismatch between the model's goals and the user's goals. In this case, the model is not aligned with the goal of providing accurate information."
        },
        "xss": {
            "vulnerability": "Insecure LLM output handling can expose systems to cross-site scripting (XSS) and other attacks.",
            "owasp": "LLM02:2023 - Data Leakage",
            "severity": "HIGH",
            "cwe": ["CWE-200: Information Exposure"],
            "description": "Data leakage occurs when an LLM accidentally reveals sensitive information through its responses, enabling unauthorized access to private data."
        }
    };

    return vulnerabilities[probe] || '';
}


module.exports = {
    calculateDashboard,
};  
