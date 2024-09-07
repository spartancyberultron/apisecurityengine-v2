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
const SOAPOrGraphQLScan = require('../models/soapOrGraphQLScan.model');

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

  /*  Vulnerability.deleteMany({})
        .then(() => {
            res.status(200);
            res.json({ status: 'Deleted' })
        })
        .catch((err) => {
            console.error(err);
        }); */
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
  
      const activeScan = await ActiveScan.findById(
        scanId
      )
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
        //.populate({
        //  path: 'vulnerabilities',
         // model: 'ActiveScanVulnerability',
         // populate: [
         //   {
          //    path: 'vulnerability',
          //    model: 'Vulnerability',
           //   select: 'vulnerabilityName riskScore vulnerabilityCode', // Include only the desired fields
           // },
           // {
            //  path: 'endpoint',
            //  model: 'ApiEndpoint',
              // You can select specific fields from 'ApiEndpoint' if needed
          //  },
          //],
       // })
       .lean();

console.log('activeScan._id:',activeScan._id)

	     const vulnerabilities = await ActiveScanVulnerability.find({ activeScan: activeScan._id }).populate('vulnerability endpoint')
  //  .skip(skip)
   // .limit(limit).lean();
activeScan.vulnerabilities = vulnerabilities;

      
      //  const endpointsCount = await ApiEndpoint.count({ theCollection: activeScan.theCollection })
        activeScan.endpointsCount = activeScan.endpointsScanned;
        
  
      if (!activeScan) {
        return res.status(404).json({ success: false, error: 'Scan not found' });
      }

	    console.log('activeScan:', activeScan);
  
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


// DASHBOARD

module.exports.getMonthlyVulnerabilityTrends = asyncHandler(async (req, res) => {

    const user = await User.findById(req.user._id);
    const organization = await Organization.findById(user.organization);

    console.log('organization:',organization)
    
    
    res.status(200).json({ activeScansByMonth:organization.vulnerabilityTrends});
});


module.exports.getUserDashboardCardsData = asyncHandler(async (req, res) => {

    const user = await User.findById(req.user._id);
    const organization = await Organization.findById(user.organization);

    
    res.status(200).json({ dashboardData:organization.dashboardCardData });

});

module.exports.getVulnerabilityDistribution = asyncHandler(async (req, res) => {

    const user = await User.findById(req.user._id);
    const organization = await Organization.findById(user.organization);

   

    res.status(200);
    res.json({ vulnerabilityCounts:organization.vulnerabilityDistribution })
});

module.exports.getSeverityDistribution = asyncHandler(async (req, res) => {

    const user = await User.findById(req.user._id);
    const organization = await Organization.findById(user.organization);

   

    res.status(200);
    res.json({ severityDistribution:organization.severityDistribution })
});





module.exports.getTopEndPoints = asyncHandler(async (req, res) => {

    try {

        const user = await User.findById(req.user._id);
        const organization = await Organization.findById(user.organization);
       
        res.status(200).json({ topEndpoints:organization.topEndpoints });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});



module.exports.getTop10Vulnerabilities = asyncHandler(async (req, res) => {

    try {

        const user = await User.findById(req.user._id);
        const organization = await Organization.findById(user.organization);
       
        res.status(200).json({ topEndpoints:organization.top10Vulnerabilities });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
// Get average time to resolve vulnerabilities
module.exports.getTimeToResolveVulnerabilities = asyncHandler(async (req, res) => {

    
    const user = await User.findById(req.user._id);
    const organization = await Organization.findById(user.organization);

    
    res.status(200).json({
        averageResolutionTime: organization.timeToResolveVulnerabilities
    });
});



// Get number of open vulns - by title
module.exports.getNumberOfOpenVulnerabilities = asyncHandler(async (req, res) => {

    
    const user = await User.findById(req.user._id);
    const organization = await Organization.findById(user.organization);


    res.status(200).json({
        success: true,
        vulnerabilities:organization.numberOfOpenVulnerabilities 
    });
});



// Get audit findings
module.exports.getAuditFindings = asyncHandler(async (req, res) => {
    
    
    const user = await User.findById(req.user._id);
    const organization = await Organization.findById(user.organization);

    res.status(200).json({
        success: true,
        auditFindings:organization.auditFindings
    });
});


// Get SSDLC Score
module.exports.getSSDLCScore = asyncHandler(async (req, res) => {

    
    const user = await User.findById(req.user._id);
    const organization = await Organization.findById(user.organization);



    res.status(200).json({
        success: true,
        ssdlcScore:organization.ssdlcScore
    });
});


// Get threat alerts
module.exports.getThreatAlerts = asyncHandler(async (req, res) => {

    const user = await User.findById(req.user._id);
    const organization = await Organization.findById(user.organization);


    const activeScanCount = await ActiveScan.aggregate([
        {
            $lookup: {
                from: 'apicollectionversions',
                localField: 'theCollectionVersion',
                foreignField: '_id',
                as: 'theCollectionVersion'
            }
        },
        { $unwind: '$theCollectionVersion' },
        
        {
            $lookup: {
                from: 'apicollections',
                localField: 'theCollectionVersion.apiCollection',
                foreignField: '_id',
                as: 'theCollectionVersion.apiCollection'
            }
        },
        { $unwind: '$theCollectionVersion.apiCollection' },
        
        {
            $lookup: {
                from: 'orgprojects',
                localField: 'theCollectionVersion.apiCollection.orgProject',
                foreignField: '_id',
                as: 'theCollectionVersion.apiCollection.orgProject'
            }
        },
        { $unwind: '$theCollectionVersion.apiCollection.orgProject' },
        
        {
            $match: {
                'theCollectionVersion.apiCollection.orgProject.organization': organization._id
            }
        },
        
        {
            $count: 'total'
        }
    ]).exec();
    
    const count = activeScanCount[0] ? activeScanCount[0].total : 0;
    

        // Check SOAPOrGraphQLScan count
        const soapOrGraphQLScanCount = await SOAPOrGraphQLScan.countDocuments({
            orgProject: organization._id
        });

        // Check LLMScan count
        const llmScanCount = await LLMScan.countDocuments({
            orgProject: organization._id
        });

        // Total count
        const totalCount = count + soapOrGraphQLScanCount + llmScanCount;

        console.log('totalCount:',totalCount)



    res.json({response:organization.threatAlerts, totalCount});
});


// Get threat trends
module.exports.getThreatTrends = asyncHandler(async (req, res) => {

  
    const user = await User.findById(req.user._id);
    const organization = await Organization.findById(user.organization);

    res.json({data:organization.threatTrends});
  });



// Get risk score
module.exports.getRiskScore = asyncHandler(async (req, res) => {

   
    const user = await User.findById(req.user._id);
    const organization = await Organization.findById(user.organization);

  
    res.json({
      riskScore: organization.riskScore,
      description: "Risk score calculated as a weighted average of vulnerability severities, normalized to a percentage."
    });
  });
  


  
// Get top risks
module.exports.getTopRisks = asyncHandler(async (req, res) => {
    try {
        
        const user = await User.findById(req.user._id);
        const organization = await Organization.findById(user.organization);


        // Send the response
        res.json(organization.topRisks);
    } catch (error) {
        // Log the error for debugging
        console.error('Error in getTopRisks:', error);
        res.status(500).json({ message: error.message });
    }
});
