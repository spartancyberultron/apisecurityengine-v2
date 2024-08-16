const asyncHandler = require('express-async-handler');
const { User } = require('../models/user.model');
const bcrypt = require('bcryptjs');

const { generateToken } = require('../utils/generateToken');
const APICollection = require('../models/apicollection.model');
const APICollectionVersion = require('../models/apicollectionversion.model');

const ApiEndpoint = require('../models/apiendpoint.model');
const Vulnerability = require('../models/vulnerability.model');
const ActiveScan = require('../models/activescan.model');
const LLMScan = require('../models/llmScan.model');

const ActiveScanVulnerability = require('../models/activescanvulnerability.model');
const Project = require('../models/project.model');
const OrgProject = require('../models/orgproject.model');

const ProjectVulnerability = require('../models/projectVulnerability.model');
const ProtectionHost = require('../models/protectionHost.model');
const Organization = require('../models/organization.model');
const Ticket = require('../models/ticket.model');

const SOAPOrGraphQLScanVulnerability = require('../models/soapOrGraphQLScanVulnerability.model');

const SBOMScanVulnerability = require('../models/sbomScanVulnerability.model');
const LLMScanVulnerability = require('../models/llmScanVulnerability.model');

const moment = require('moment');
const AttackSurfaceScanVulnerability = require('../models/attacksurfacescanvulnerability.model');

// Sign Up 
module.exports.signUp = asyncHandler(async (req, res) => {

    const { firstName, lastName, email, password, companyName } = req.body;

    const salt = await bcrypt.genSalt(10);
    var hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
        firstName: firstName,
        lastName: lastName,
        email: email,
        userType: 'user',
        status: 'active',
        companyName: companyName,
        password: hashedPassword,
    });

    let data = {
        user,
        token: generateToken(user._id),
    };

    res.status(200);
    res.json({ data })
});


// Delete all endpoints (for testing purposes)
module.exports.deleteAllEndpoints = asyncHandler(async (req, res) => {

    ApiEndpoint.deleteMany({})
        .then(() => {
            res.status(200);
            res.json({ status: 'Deleted' })
        })
        .catch((err) => {
            console.error(err);
        });

});


// Delete all project vulnerabilities (for testing purposes)
module.exports.deleteAllProjectVulnerabilities = asyncHandler(async (req, res) => {

    ProjectVulnerability.deleteMany({})
        .then(() => {
            res.status(200);
            res.json({ status: 'Deleted' })
        })
        .catch((err) => {
            console.error(err);
        });

});

// Add PII data to all endpoints (for testing purposes)
module.exports.addPIIDataToAllEndpoints = asyncHandler(async (req, res) => {

    const endpoints = await ApiEndpoint.find({});

    for (var i = 0; i < endpoints.length; i++) {

        endpoints[i].piiFields = [
            'Name',
            'Address',
            'Phone',
            'IP',
            'MAC',
            'SSN',
            'Passport Number',
            'Driving License Number',
            'Bank Account Number',
            'Credit/Debit Card Number',
            'PAN Number',
            'Aadhaar Number',
            'Voter ID Number',
            'Vehicle Registration Number',
            'DOB',
            'Place of Birth',
            'Race',
            'Religion',
            'Weight',
            'Height',
            'Latitude',
            'Longitude',
            'Employee ID',
            'BMI',
            'Heart Rate',
            'Blood Pressure',
            'Father Name',
            'Mother Name',
            'Brother Name',
            'Sister Name',
            'Son Name',
            'Daughter Name',
            'Order ID',
            'Transaction ID',
            'Cookie Data',
        ];

        await endpoints[i].save();
    }

    res.status(200);
    res.json({ status: 'Done' })

});



// Delete all endpoints (for testing purposes)
module.exports.deleteAllCollections = asyncHandler(async (req, res) => {

    APICollection.deleteMany({})
        .then(() => {
            res.status(200);
            res.json({ status: 'Deleted' })
        })
        .catch((err) => {
            console.error(err);
        });
});


// Delete all vulnerabilities (for testing purposes)
module.exports.deleteAllVulnerabilities = asyncHandler(async (req, res) => {

    Vulnerability.deleteMany({})
        .then(() => {
            res.status(200);
            res.json({ status: 'Deleted' })
        })
        .catch((err) => {
            console.error(err);
        });
});


// Add a vulnerability (data entry)
module.exports.addAVulnerability = asyncHandler(async (req, res) => {

    const { vulnerabilityCategory, vulnerabilityName, riskScore, remediations } = req.body;

    const vulnerability = await Vulnerability.create({
        vulnerabilityCategory: vulnerabilityCategory,
        vulnerabilityName: vulnerabilityName,
        riskScore: riskScore,
        remediations: remediations,
    });

    // Return the vulnerability
    res.status(200);
    res.json({ vulnerability })

});


// User Login
module.exports.userLogin = asyncHandler(async (req, res) => {

    const { email, password } = req.body;

    // Check whether the email exists
    const user = await User.findOne({ email: email }).populate('organization');

    if (!user) {

        res.status(401);
        res.json({ error: 'Incorrect email or password' });

    } else {

        var isValidLogin = await bcrypt.compare(password, user.password);

        if (isValidLogin) {

            let data = {
                user,
                token: generateToken(user._id),
            };

            res.status(200);
            res.json({ data })

        } else {
            res.status(401);
            res.json({ error: 'Incorrect email or password' });
        }
    }

});


module.exports.getUserDashboardCardsData = asyncHandler(async (req, res) => {

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


    console.log('collections:',collections)

    const collectionVersionIds = await APICollectionVersion.find(
        { apiCollection: { $in: collections.map(collection => collection._id) } }
    )
    .select('_id')
    .lean()
    .then(versions => versions.map(v => v._id));
    
    console.log("Number of collection versions found:", collectionVersionIds.length);
    console.log("Collection Version IDs:", collectionVersionIds);

    const endpointsArray = await ApiEndpoint.find({ 
        theCollectionVersion: { $in: collectionVersionIds } 
    })
    .select('_id piiFields')
    .lean();
    
    console.log("Number of endpoints found:", endpointsArray.length);

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

  console.log('soapGraphQLVulns:',soapGraphQLVulns)
  
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


    console.log('endpointsArray:',endpointsArray)

    // Calculate PII fields count
    const piiFieldsCount = endpointsArray.reduce((count, endpoint) => count + endpoint.piiFields.length, 0);

    dashboardData.collectionsCount = collectionsCount;//collections.length;
    dashboardData.endPointsCount = endpointsCount;//endpointsArray.length;
    dashboardData.agentsCount = agentsCount;

    console.log('activeScansVulnsCount:',activeScansVulnsCount)
    console.log('attackSurfaceVulnCount:',attackSurfaceVulnCount)
    console.log('projectVulnsCount:',projectVulnsCount)
    console.log('soapGraphQLVulnsCount:',soapGraphQLVulnsCount)
    console.log('sbomScanVulnsCount:',sbomScanVulnsCount)

    dashboardData.vulnerabilitiesCount = activeScansVulnsCount + attackSurfaceVulnCount + projectVulnsCount+
    soapGraphQLVulnsCount + sbomScanVulnsCount;//activeScansVulnsArray.length;
    
    dashboardData.alertsCount = activeScansVulnsCount;//0;
    dashboardData.piiDataFieldsCount = piiFieldsCount;
    dashboardData.falsePositivesCount = 0;

    res.status(200).json({ dashboardData });

});

module.exports.getVulnerabilityDistribution = asyncHandler(async (req, res) => {

    const user = await User.findById(req.user._id);

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

    res.status(200);
    res.json({ vulnerabilityCounts })
});

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

function calculateAverage(array) {
    const sum = array.reduce((acc, value) => acc + value, 0);
    const avg = sum / array.length;
    return isNaN(avg) ? 0 : avg; // Handle division by zero
}



module.exports.getTopEndPoints = asyncHandler(async (req, res) => {

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
});

module.exports.getLast10Alerts = asyncHandler(async (req, res) => {

    const user = await User.findById(req.user._id);

    const activeScans = await ActiveScan.find({ user: user._id })
        .populate({
            path: 'vulnerabilities',
            model: 'ActiveScanVulnerability',
            populate: {
                path: 'vulnerability',
                model: 'Vulnerability',
            },
        })
        .populate({
            path: 'vulnerabilities',
            model: 'ActiveScanVulnerability',
            populate: {
                path: 'endpoint',
                model: 'ApiEndpoint',
            },
        });

    var activeScanVulnsArray = [];

    for (var i = 0; i < activeScans.length; i++) {

        activeScanVulnsArray = activeScanVulnsArray.concat(activeScans[i].vulnerabilities);
    }

    activeScanVulnsArray = activeScanVulnsArray.reverse();
    activeScanVulnsArray = activeScanVulnsArray.slice(0, 4);

    res.status(200);
    res.json({ activeScanVulnsArray })

});


module.exports.getLast5DaysVulnerabilityTrends = asyncHandler(async (req, res) => {

    const today = new Date();
    const fiveDaysAgo = new Date();
    fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);

    const result = await ActiveScan.aggregate([
        {
            $match: {
                user: req.user._id,
                createdAt: { $gte: fiveDaysAgo, $lte: today }
            }
        },
        {
            $lookup: {
                from: 'activescanvulnerabilities',
                localField: '_id',
                foreignField: 'activeScan',
                as: 'vulnerabilities'
            }
        },
        {
            $unwind: {
                path: '$vulnerabilities',
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $lookup: {
                from: 'vulnerabilities',
                localField: 'vulnerabilities.vulnerability',
                foreignField: '_id',
                as: 'vulnerability'
            }
        },
        {
            $unwind: {
                path: '$vulnerability',
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $group: {
                _id: {
                    date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    vulnerabilityCode: '$vulnerability.vulnerabilityCode'
                },
                count: { $sum: 1 }
            }
        },
        {
            $group: {
                _id: '$_id.date',
                vulnerabilities: {
                    $push: {
                        vulnerabilityCode: '$_id.vulnerabilityCode',
                        count: '$count'
                    }
                }
            }
        },
        {
            $sort: { _id: 1 }
        }
    ]);

    const vulnArrays = result.map(item => {
        const obj = { date: item._id };
        item.vulnerabilities.forEach(vulnerability => {
            obj['vuln' + vulnerability.vulnerabilityCode + 'Count'] = vulnerability.count;
        });
        return obj;
    });

    res.status(200).json({ vulnArrays });
});



module.exports.getMonthlyVulnerabilityTrends = asyncHandler(async (req, res) => {

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
    

    res.status(200).json({ activeScansByMonth });
});



module.exports.getAllEndpoints = asyncHandler(async (req, res) => {    

    const pipeline = [
        {
            $match: {
                user: req.user._id
            }
        },
        {
            $lookup: {
                from: "activescanvulnerabilities",
                localField: "_id",
                foreignField: "endpoint",
                as: "vulnerabilities"
            }
        },
        {
            $addFields: {
                vulnsCount: { $size: "$vulnerabilities" }
            }
        },
        {
            $project: {
                vulnerabilities: 0 // Exclude vulnerabilities array from the output
            }
        }
    ];

    const theEndpoints = await ApiEndpoint.aggregate(pipeline).exec();

    res.status(200).json({ endpoints: theEndpoints });
});




module.exports.getAllPIIData = asyncHandler(async (req, res) => {

    const piiDataFields = [
        'Name',
        'Address',
        'Phone',
        'IP',
        'MAC',
        'SSN',
        'Passport Number',
        'Driving License Number',
        'Bank Account Number',
        'Credit/Debit Card Number',
        'PAN Number',
        'Aadhaar Number',
        'Voter ID Number',
        'Vehicle Registration Number',
        'DOB',
        'Place of Birth',
        'Race',
        'Religion',
        'Weight',
        'Height',
        'Latitude',
        'Longitude',
        'Employee ID',
        'BMI',
        'Heart Rate',
        'Blood Pressure',
        'Father Name',
        'Mother Name',
        'Brother Name',
        'Sister Name',
        'Son Name',
        'Daughter Name',
        'Order ID',
        'Transaction ID',
        'Cookie Data',
    ];

    const piiRiskMap = {
        Name: 'LOW',
        Address: 'HIGH',
        Phone: 'HIGH',
        IP: 'HIGH',
        MAC: 'HIGH',
        SSN: 'HIGH',
        'Passport Number': 'HIGH',
        'Driving License Number': 'HIGH',
        'Bank Account Number': 'HIGH',
        'Credit/Debit Card Number': 'HIGH',
        'PAN Number': 'MEDIUM',
        'Aadhaar Number': 'HIGH',
        'Voter ID Number': 'MEDIUM',
        'Vehicle Registration Number': 'MEDIUM',
        DOB: 'MEDIUM',
        'Place of Birth': 'LOW',
        Race: 'LOW',
        Religion: 'LOW',
        Weight: 'LOW',
        Height: 'LOW',
        Latitude: 'HIGH',
        Longitude: 'HIGH',
        'Employee ID': 'MEDIUM',
        BMI: 'LOW',
        'Heart Rate': 'LOW',
        'Blood Pressure': 'LOW',
        'Father Name': 'MEDIUM',
        'Mother Name': 'MEDIUM',
        'Brother Name': 'LOW',
        'Sister Name': 'LOW',
        'Son Name': 'LOW',
        'Daughter Name': 'LOW',
        'Order ID': 'LOW',
        'Transaction ID': 'MEDIUM',
        'Cookie Data': 'LOW',
    };

    //var piiData = [];

    const piiData = await ApiEndpoint.aggregate([
        {
          $match: {
            piiFields: { $in: piiDataFields },
            user: req.user._id,
          },
        },
        {
          $group: {
            _id: "$piiFields",
            count: { $sum: 1 },
          },
        },
        {
          $project: {
            _id: 0,
            dataClass: "$_id",
            risk: {
              $ifNull: [
                { $arrayElemAt: [Object.values(piiRiskMap), 0] },
                "UNKNOWN",
              ],
            },
            endpoints: "$count",
          },
        },
      ]);
      

      
      
      // Filter out entries with zero endpoints
      const filteredPiiData = piiData.filter((entry) => entry.endpoints > 0);



    res.status(200);
    res.json({ piiData:filteredPiiData });

});


// Get all endpoints with PII data on it
module.exports.getEndpointsWithPIIData = asyncHandler(async (req, res) => {

    var collections = await APICollection.find({ user: req.user._id }).lean();

    const collectionIds = collections.map(collection => collection._id);

    const apiCollectionVersions = await APICollectionVersion.find({
        apiCollection: { $in: collectionIds }
    }).lean();

    var endpoints = [];

    for (var i = 0; i < apiCollectionVersions.length; i++) {        

        var theEndpoints = await ApiEndpoint.find({
            theCollectionVersion: apiCollectionVersions[i]._id,
            piiFields: { $ne: [] },
            
          }).lean();          

        endpoints = endpoints.concat(theEndpoints);
    }

    console.log('endpoints:',endpoints)

    for (var i = 0; i < endpoints.length; i++) {

        endpoints[i].vulnsCount = 2;
    }

    res.status(200);
    res.json({ endpoints })
});






module.exports.getPIIDataDetails = asyncHandler(async (req, res) => {

    const { piiData } = req.body;

    // Get all endpoints on which this PII Data is present
    var collections = await APICollection.find({ user: req.user._id });
    var theCollectionIds = [];

    for (var j = 0; j < collections.length; j++) {
        theCollectionIds.push(collections[j]._id);
    }

    const apiEndpoints = await ApiEndpoint.find({
        piiFields: { $in: [piiData] },
        theCollection: { $in: theCollectionIds }
    }).populate('theCollection');

    const endpointStrings = apiEndpoints.map(endpoint => {
        //const { protocol, host, endpoint: apiEndpoint } = endpoint;
        //return `${protocol}://${host}/${apiEndpoint}`;
        return endpoint; 
    });


    res.status(200);
    res.json({ endpointStrings })
});



module.exports.getAllVulnerabilitiesFound = asyncHandler(async (req, res) => {

    const page = parseInt(req.query.pageNumber) || 1; // Get the page number from the request query parameters and convert it to an integer
    const perPage = 10; // Number of vulnerabilities per page

    const activeScans = await ActiveScan.find({ user: req.user._id }).lean();

    const activeScanIds = activeScans.map((scan) => scan._id);

    const totalVulnerabilities = await ActiveScanVulnerability.countDocuments({
        activeScan: { $in: activeScanIds },
    });

    const totalPages = Math.ceil(totalVulnerabilities / perPage); // Calculate the total number of pages

    const skip = (page - 1) * perPage; // Calculate the number of vulnerabilities to skip

    const activeScansVulnsArray = await ActiveScanVulnerability.find({
        activeScan: { $in: activeScanIds },
    })
        .sort({ createdAt: -1 }) // Sort by createdAt field in descending order for the latest vulnerabilities
        .skip(skip)
        .limit(perPage)
        .populate('endpoint vulnerability')
        .lean();

    // Calculate the index for each vulnerability in the context of all vulnerabilities
    const startIndex = skip;
    activeScansVulnsArray.forEach((vulnerability, index) => {
        const globalIndex = startIndex + index + 1;
        vulnerability.index = globalIndex; // Numeric index starting from 1 for all records
    });

    // Return the vulnerabilities, totalRecords, and pagination details
    res.status(200).json({
        activeScansVulnsArray,
        totalRecords: totalVulnerabilities,
        totalPages,
        currentPage: page, // Assign the actual page value
        perPage,
    });
});


// Send password recovery OTP
module.exports.sendPasswordRecoveryOTP = asyncHandler(async (req, res) => {



});


// Validate password recovery OTP
module.exports.validatePasswordRecoveryOTP = asyncHandler(async (req, res) => {


});


// Reset password from recovery option
module.exports.resetPasswordFromRecoveryOption = asyncHandler(async (req, res) => {


});


// Get my account info
module.exports.getMyAccountInfo = asyncHandler(async (req, res) => {


});


// Update my account
module.exports.updateMyAccount = asyncHandler(async (req, res) => {


});



// Get settings
module.exports.getSettings = asyncHandler(async (req, res) => {


});


// Update settings
module.exports.updateSettings = asyncHandler(async (req, res) => {


});


module.exports.getScanDetailsForReport = asyncHandler(async (req, res) => {
    
    const scanId = req.params.scanId;
    const userId = req.params.userId;
  
    try {
      // First, find the user by userId
      const user = await User.findById(userId);
  
      if (!user) {
        return res.status(404).json({ success: false, error: 'User not found' });
      }
  
      const activeScan = await ActiveScan.findOne({
        _id: scanId,
        user: userId,
      })
        .populate({
          path: 'theCollectionVersion', // Populate 'theCollectionVersion' field
          populate: {
            path: 'apiCollection', // Further populate 'apiCollection' within 'theCollectionVersion'
            populate: {
              path: 'orgProject', // Further populate 'orgProject' within 'apiCollection'
              populate: {
                path: 'organization', // Further populate 'organization' within 'orgProject'
              },
            },
          },
        })
        .populate({
          path: 'vulnerabilities',
          model: 'ActiveScanVulnerability',
          populate: [
            {
              path: 'vulnerability',
              model: 'Vulnerability',
              select: 'vulnerabilityName riskScore vulnerabilityCode', // Include only the desired fields
            },
            {
              path: 'endpoint',
              model: 'ApiEndpoint',
              // You can select specific fields from 'ApiEndpoint' if needed
            },
          ],
        })
        .lean();
      
        const endpointsCount = await ApiEndpoint.count({ theCollection: activeScan.theCollection })
        activeScan.endpointsCount = endpointsCount;
        
  
      if (!activeScan) {
        return res.status(404).json({ success: false, error: 'Scan not found' });
      }
  
      // Send the activeScan object as a response
      res.status(200).json({ success: true, data: activeScan });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
  });
  


// Controller function to add a new user
module.exports.addProject = asyncHandler(async (req, res) => {

    const { projectName, projectId, projectPhase } = req.body;

    function generateRandomID() {
        const length = 20;
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let id = '';

        for (let i = 0; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * characters.length);
            id += characters.charAt(randomIndex);
        }

        return id;
    }

    const randomID = generateRandomID();


    const project = new Project({
        projectName,
        projectIntegrationID: randomID,
        user:req.user._id,
        orgProject:projectId,
        projectPhase
    });
    await project.save();
    res.status(201).json(project);


});


// Controller function to update a project
module.exports.updateProject = asyncHandler(async (req, res) => {

    const { id, projectName, projectPhase } = req.body;

    let project;

    project = await Project.findByIdAndUpdate(id, {
        projectName,
        projectPhase
    }, { new: true });


    if (!project) {
        return res.status(404).json({ error: 'User not found.' });
    }
    res.json(project);


});

// Controller function to load a project
module.exports.loadProject = asyncHandler(async (req, res) => {

    const { id } = req.body;

    const project = await Project.findById(id);

    res.json(project);

});



// Controller function to delete a project
module.exports.deleteProject = asyncHandler(async (req, res) => {

    try {
        const { id } = req.body;
        const project = await Project.findByIdAndDelete(id);
        if (!project) {
            return res.status(404).json({ error: 'Project not found.' });
        }
        res.json({ message: 'Project deleted successfully.' });
    } catch (error) {
        res.status(400).json({ error: 'Failed to delete the project.' });
    }
});


// Controller function to list all projects
module.exports.listAllProjects = asyncHandler(async (req, res) => {
    

    const projects = await Project.find({user:req.user._id}).sort({ createdAt: -1 }).populate('orgProject');
    res.json(projects);
});


// Controller function to list all protection host
module.exports.listAllProtectionHosts = asyncHandler(async (req, res) => {

    const protectionHosts = await ProtectionHost.find().sort({ createdAt: -1 });
    res.json(protectionHosts);
});


// Controller function to delete a protection hosts
module.exports.deleteProtectionHost = asyncHandler(async (req, res) => {

    try {
        const { id } = req.body;
        const protectionHost = await ProtectionHost.findByIdAndDelete(id);
        if (!protectionHost) {
            return res.status(404).json({ error: 'Host not found.' });
        }
        res.json({ message: 'Host deleted successfully.' });

    } catch (error) {
        res.status(400).json({ error: 'Failed to delete the project.' });
    }
});



// Controller function to add a new protection host
module.exports.addProtectionHost = asyncHandler(async (req, res) => {

    const { hostName, hostIP, hostPort, hostDomain, proxyDomain } = req.body;

    const protectionHost = new ProtectionHost({
        user: req.user._id,
        hostName,
        hostIP,
        hostPort,
        hostDomain,
        proxyDomain,
    });
    await protectionHost.save();
    res.status(201).json(protectionHost);

});


// Controller function to update a protection host
module.exports.updateProtectionHost = asyncHandler(async (req, res) => {

    const { id, hostName, hostIP, hostPort, hostDomain, proxyDomain } = req.body;

    let protectionHost;

    protectionHost = await ProtectionHost.findByIdAndUpdate(id, {
        hostName,
        hostIP,
        hostPort,
        hostDomain,
        proxyDomain,
    }, { new: true });


    if (!protectionHost) {
        return res.status(404).json({ error: 'User not found.' });
    }
    res.json(protectionHost);

});


module.exports.loadProtectionHost = asyncHandler(async (req, res) => {

    const { id } = req.body;

    const protectionHost = await ProtectionHost.findById(id);

    res.json(protectionHost);
});



module.exports.updateOWASPAndCWEForVulnerabilities = asyncHandler(async (req, res) => {

    const { theArray } = req.body;

    if (!Array.isArray(theArray)) {
        return res.status(400).json({ status: 'error', message: 'Invalid request body, expected an array in "theArray"' });
    }

    const updatePromises = theArray.map(async (vuln) => {
        const { vulnerabilityCode, name, owasp, cwe } = vuln;

        if (!vulnerabilityCode || !Array.isArray(owasp) || !Array.isArray(cwe)) {
            throw new Error(`Invalid data for vulnerabilityCode ${vulnerabilityCode}`);
        }

        const updatedVulnerability = await Vulnerability.findOneAndUpdate(
            { vulnerabilityCode },
            { name, owasp, cwe },
            { new: true, runValidators: true }
        );

        if (!updatedVulnerability) {
            throw new Error(`Vulnerability not found for code ${vulnerabilityCode}`);
        }

        return updatedVulnerability;
    });

    try {
        const results = await Promise.all(updatePromises);
        res.json({ status: 'updated', data: results });
    } catch (error) {
        res.status(400).json({ status: 'error', message: error.message });
    }
});




// Update Risk Acceptance For An ActiveScan Vulnerability
module.exports.updateRiskAcceptanceForAnActiveScanVulnerability = asyncHandler(async (req, res) => {


    const { activeScanVulnId, riskAcceptance, riskAcceptanceReason } = req.body;

    const activeScanVulnerability =  await ActiveScanVulnerability.findById(activeScanVulnId);
    activeScanVulnerability.riskAcceptance = riskAcceptance;
    activeScanVulnerability.riskAcceptanceReason = riskAcceptanceReason;
    await activeScanVulnerability.save();


    res.json({ status: 'updated', data: activeScanVulnerability });

});

// Update Risk Acceptance For A SOAP/GraphQL Vulnerability

module.exports.updateRiskAcceptanceForASOAPGraphQLVulnerability = asyncHandler(async (req, res) => {


    const { vulnId, riskAcceptance, riskAcceptanceReason } = req.body;

    const soapOrGraphQLScanVulnerability =  await SOAPOrGraphQLScanVulnerability.findById(vulnId);
    soapOrGraphQLScanVulnerability.riskAcceptance = riskAcceptance;
    soapOrGraphQLScanVulnerability.riskAcceptanceReason = riskAcceptanceReason;
    await soapOrGraphQLScanVulnerability.save();


    res.json({ status: 'updated', data: soapOrGraphQLScanVulnerability });

});

// Update Risk Acceptance For an attack surface Vulnerability

module.exports.updateRiskAcceptanceForAnAttackSurfaceVulnerability = asyncHandler(async (req, res) => {


    const { vulnId, riskAcceptance, riskAcceptanceReason } = req.body;

    const attackSurfaceScanVulnerability =  await AttackSurfaceScanVulnerability.findById(vulnId);
    attackSurfaceScanVulnerability.riskAcceptance = riskAcceptance;
    attackSurfaceScanVulnerability.riskAcceptanceReason = riskAcceptanceReason;
    await attackSurfaceScanVulnerability.save();


    res.json({ status: 'updated', data: attackSurfaceScanVulnerability });

});


// Update Risk Acceptance For a mirroring agent project Vulnerability

module.exports.updateRiskAcceptanceForAMirroringAgent = asyncHandler(async (req, res) => {


    const { vulnId, riskAcceptance, riskAcceptanceReason } = req.body;

    const projectVulnerability =  await ProjectVulnerability.findById(vulnId);
    projectVulnerability.riskAcceptance = riskAcceptance;
    projectVulnerability.riskAcceptanceReason = riskAcceptanceReason;
    await projectVulnerability.save();


    res.json({ status: 'updated', data: projectVulnerability });

});



// Get organization details
module.exports.getOrganizationDetails = asyncHandler(async (req, res) => {


    const user = await User.findById(req.user._id);

    const organization = await Organization.findOne({primaryUser:user._id});  


    res.json({ organization });

});



// Get average time to resolve vulnerabilities
module.exports.getTimeToResolveVulnerabilities = asyncHandler(async (req, res) => {

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
    
    res.status(200).json({
        averageResolutionTime: averageResolutionTimeMinutes,
    });
});



// Get number of open vulns - by title
module.exports.getNumberOfOpenVulnerabilities = asyncHandler(async (req, res) => {

    const user = req.user;
    
    if (!user || !user.organization) {
        return res.status(400).json({
            success: false,
            message: 'User or user organization not found'
        });
    }

    //console.log('User organization:', user.organization);

    // REST
    const openTicketsCountRest = await Ticket.countDocuments({
        organization: user.organization,
        status: 'OPEN',
        'source':"REST API Scan"
    });

    console.log('REST tickets:', openTicketsCountRest);


    // Attack Surface
    const openTicketsCountAttackSurface = await Ticket.countDocuments({
        organization: user.organization,
        status: 'OPEN',
        'source':"Attack Surface Scan"
    });

    console.log('openTicketsCountAttackSurface:', openTicketsCountAttackSurface);

    // Agent Traffic
    const openTicketsCountAPITrafficScan = await Ticket.countDocuments({
        organization: user.organization,
        status: 'OPEN',
        'source':"API Traffic Scan"
    });

    console.log('openTicketsCountAPITrafficScan:', openTicketsCountAPITrafficScan);


    // SOAP
    const openTicketsCountSOAPScan = await Ticket.countDocuments({
        organization: user.organization,
        status: 'OPEN',
        'source':"SOAP Scan"
    });

    console.log('openTicketsCountSOAPScan:', openTicketsCountSOAPScan);


    // GraphQL
    const openTicketsCountGraphQLScan = await Ticket.countDocuments({
        organization: user.organization,
        status: 'OPEN',
        'source':"GraphQL Scan"
    });

    console.log('openTicketsCountGraphQLScan:', openTicketsCountGraphQLScan);


    // SBOM
    const openTicketsCountSBOMScan = await Ticket.countDocuments({
        organization: user.organization,
        status: 'OPEN',
        'source':"SBOM Scan"
    });

    console.log('openTicketsCountSBOMScan:', openTicketsCountSBOMScan);


    // LLM
    const openTicketsCountLLMScan = await Ticket.countDocuments({
        organization: user.organization,
        status: 'OPEN',
        'source':"LLM Scan"
    });

    console.log('openTicketsCountLLMScan:', openTicketsCountLLMScan);    

    //console.log('Vulnerability counts:', vulnerabilityCounts);

    var vulnerabilities ={};
    vulnerabilities.openTicketsCountRest = openTicketsCountRest;
    vulnerabilities.openTicketsCountAttackSurface = openTicketsCountAttackSurface;
    vulnerabilities.openTicketsCountAPITrafficScan = openTicketsCountAPITrafficScan;
    vulnerabilities.openTicketsCountSOAPScan = openTicketsCountSOAPScan;
    vulnerabilities.openTicketsCountGraphQLScan = openTicketsCountGraphQLScan;
    vulnerabilities.openTicketsCountSBOMScan = openTicketsCountSBOMScan;
    vulnerabilities.openTicketsCountLLMScan = openTicketsCountLLMScan;


    res.status(200).json({
        success: true,
        vulnerabilities   
    });
});



// Get audit findings
module.exports.getAuditFindings = asyncHandler(async (req, res) => {
    
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

    res.status(200).json({
        success: true,
        auditFindings
    });
});


// Get SSDLC Score
module.exports.getSSDLCScore = asyncHandler(async (req, res) => {

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
    console.log('phase:',phase)
    }else{
        console.log('no phase')
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


    console.log('counts:',counts)
  
   // return counts;
   



    res.status(200).json({
        success: true,
        ssdlcScore:counts
    });
});


// Get threat alerts
module.exports.getThreatAlerts = asyncHandler(async (req, res) => {


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

        //console.log('haahha:',vuln.vulnerability)

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

// Log results to debug
console.log("Populated Vulnerabilities:", activeScanVulnerabilities.length);

// Filter out documents where orgProject is null or undefined
const filteredVulnerabilities = activeScanVulnerabilities.filter(vuln => 
    vuln.activeScan?.theCollectionVersion?.apiCollection?.orgProject
);

// Log filtered results
console.log("Filtered Vulnerabilities:", filteredVulnerabilities.length);

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

   // const uniqueProbes = [...new Set(uniqueAffectedProbes)];


   // console.log('uniqueProbes:',uniqueProbes)

    

console.log('#########activeScanVulnerabilities:',activeScanVulnerabilities.length)
console.log('#########soapOrGraphQLScanVulnerabilities:',soapOrGraphQLScanVulnerabilities.length)


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

console.log(response);



    res.json(response);
});


// Get threat trends
module.exports.getThreatTrends = asyncHandler(async (req, res) => {

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
  
    res.json(data);
  });



// Get risk score
module.exports.getRiskScore = asyncHandler(async (req, res) => {
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
  
    res.json({
      riskScore: riskScorePercentage,
      description: "Risk score calculated as a weighted average of vulnerability severities, normalized to a percentage."
    });
  });
  


  
// Get top risks
module.exports.getTopRisks = asyncHandler(async (req, res) => {
    try {
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

        // Log for debugging
       // console.log('Filtered Valid Results:', validResults);

        // Sort combined results by count in descending order
        validResults.sort((a, b) => b.count - a.count);

        // Log sorted results
       // console.log('Sorted Valid Results:', validResults);

        // Get top 10 results
        const topRisks = validResults.slice(0, 10);

        // Log top risks
        //console.log('Top Risks:', topRisks);

        // Send the response
        res.json(topRisks);
    } catch (error) {
        // Log the error for debugging
        console.error('Error in getTopRisks:', error);
        res.status(500).json({ message: error.message });
    }
});