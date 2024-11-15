const asyncHandler = require('express-async-handler');
const path = require("path")
const fs = require("fs")
const SBOMScan = require("../models/sbomScan.model")
const SBOMScanVulnerability = require("../models/sbomScanVulnerability.model")
const { User } = require('../models/user.model');

const { exec } = require('child_process');
const { calculateDashboard } = require("../services/dashboard/dashboardCalculation.service");
const Organization = require('../models/organization.model');

module.exports.getAllSBOMScans = asyncHandler(async (req, res) => {

    const page = req.params.page ? parseInt(req.params.page, 10) : 1;
const rowsPerPage = req.params.rowsPerPage ? parseInt(req.params.rowsPerPage, 10) : 10;

// console.log('page:', page)
//  console.log('rowsPerPage:', rowsPerPage)

// Validate and parse page and rowsPerPage
const pageNumber = parseInt(page, 10) + 1;
const rowsPerPageNumber = parseInt(rowsPerPage, 10);
//  console.log('pageNumber:', pageNumber)


if (isNaN(pageNumber) || isNaN(rowsPerPageNumber) || pageNumber < 1 || rowsPerPageNumber < 1) {
    return res.status(400).json({ success: false, message: "Invalid pagination parameters" });
}

const skip = (pageNumber - 1) * rowsPerPageNumber;
const limit = rowsPerPageNumber;

        const sbomScans = await SBOMScan.aggregate([
            { $match: { user: req.user._id } },
            { $sort: { createdAt: -1 } },
            { $skip: skip },
            { $limit: limit },
            {
                $lookup: {
                    from: 'orgprojects',
                    localField: 'orgProject',
                    foreignField: '_id',
                    as: 'orgProject'
                }
            },
            { $unwind: '$orgProject' },
            {
                $lookup: {
                    from: 'sbomscanvulnerabilities',
                    let: { scanId: '$_id' },
                    pipeline: [
                        { $match: { $expr: { $eq: ['$sbomScan', '$$scanId'] } } },
                        { $count: 'count' }
                    ],
                    as: 'vulnerabilitiesCount'
                }
            },
            {
                $addFields: {
                    vulnerabilities: { $ifNull: [{ $arrayElemAt: ['$vulnerabilitiesCount.count', 0] }, 0] }
                }
            },
            {
                $project: {
                    vulnerabilitiesCount: 0
                }
            }
        ]);

        const countQuery = await SBOMScan.aggregate([
            { $match: { user: req.user._id } },
            { $count: 'total' }
        ]);
        
        const totalCount = countQuery.length > 0 ? countQuery[0].total : 0;



    // Return the sbom scans, currentPage, totalRecords, and totalPages in the response
    res.status(200).json({
        sbomScans,
        totalCount
    });

});


module.exports.getSBOMScanDetails = asyncHandler(async (req, res) => {

    const { scanId } = req.body;

    const sbomScan = await SBOMScan.findById(scanId).populate('user').lean();

    const vulnerabilities = await SBOMScanVulnerability.find({ sbomScan: scanId }).lean();

    sbomScan.vulnerabilities = vulnerabilities;

    // Return the scans
    res.status(200);
    res.json({ sbomScan })

});


module.exports.startSBOMScan = asyncHandler(async (req, res) => {

    const user = await User.findById(req.user._id);
    const organization = await Organization.findById(user.organization);

    const { scanName, projectId, projectPhase } = req.body;

    const originalname = req.file.originalname
    const fileformat = originalname.split('.').pop();

    if (fileformat === "json") {

        var filePath = path.join(__dirname, "..", "uploads", "sbom-files", originalname);
        //var jsonContent = fs.readFileSync(filePath, 'utf8');

        const newScan = new SBOMScan({
            scanName: scanName,
            user: user._id,
            sbomFilePath: filePath,
            status:'in progress',
            orgProject:projectId,
            projectPhase:projectPhase
        });
        newScan.save();

        console.log('filePath:', filePath);
        
        // Set the target directory
        const targetDirectory = path.join(__dirname, "..", "uploads", "sbom-files", "sbom-scan-result-files");

        // Change directory to the target directory
        process.chdir(targetDirectory);

        const toolCommand = '/usr/bin/bomber scan '+filePath+' --output=json > '+newScan._id+'_result.json';
        console.log('toolCommand:',toolCommand);

        const resultFilePath = path.join(__dirname, "..", "uploads", "sbom-files", "sbom-scan-result-files", `${newScan._id}_result.json`);       
        


        exec(toolCommand, (error, stdout, stderr) => {

            if (error) {
                console.error(`Error executing command: ${error}`);
                return;
            }
            if (stderr) {
                console.error(`Error in command output: ${stderr}`);
                return;
            }

            console.log(`Command executed successfully: ${stdout}`);
            // Next lines of code to be executed after the command completes
            //nextFunction();

            console.log('resultFilePath:',resultFilePath);           


            fs.stat(resultFilePath, (statError, stats) => {

                if (statError) {
                    console.error(`Error checking file: ${statError}`);
                    return;
                }
                if (stats.size === 0) {
                    console.error('File is empty.');
                    return;
                }
        
                fs.readFile(resultFilePath, 'utf8', (readError, data) => {

                    if (readError) {
                        console.error(`Error reading file: ${readError}`);
                        return;
                    }
                    try {
                        const jsonObject = JSON.parse(data);
                        console.log('JSON object:', jsonObject,);

                        // Next lines of code to be executed with the JSON object
                        processJsonObjectAndSaveResults(jsonObject, newScan._id, organization);
                    } catch (parseError) {
                        console.error(`Error parsing JSON: ${parseError}`);
                    }
                });
            });

        });




        res.send({ success: "Scan started" });


    } else {
        res.send({ error: "The file does not contain valid JSON content" });
    }

});


async function processJsonObjectAndSaveResults(jsonObject, scanId, organization) {

    try {       

        const { meta, files, licenses, summary, packages } = jsonObject;

        const sbomScan = await SBOMScan.findById(scanId);
        sbomScan.scanCompletedAt = new Date(),
        sbomScan.status = 'completed';
        sbomScan.unspecifiedCount = summary.Unspecified;
        sbomScan.lowCount = summary.Low;
        sbomScan.moderateCount = summary.Moderate;
        sbomScan.highCount = summary.High;
        sbomScan.criticalCount = summary.Critical;   
        sbomScan.licenses =  licenses;

        await sbomScan.save();

        console.log('SBOMScan record created');

        // Create SBOMScanVulnerability records
        for (const pkg of packages) {

            for (const vuln of pkg.vulnerabilities) {
                
                const sbomScanVulnerability = new SBOMScanVulnerability({
                    sbomScan: sbomScan._id,
                    package: pkg.coordinates,
                    description: vuln.description,
                    title: vuln.title,
                    cwe: vuln.cwe,
                    cve: vuln.cve,
                    severity: vuln.severity
                });

                await sbomScanVulnerability.save();
            }
        }

        calculateDashboard(organization)

        console.log('SBOMScanVulnerability records created');

    } catch (error) {
        console.error(`Error parsing JSON file: ${error}`);
    }
}




module.exports.deleteSBOMScan = asyncHandler(async (req, res) => {

    try {
        const { id } = req.body;

        // Find the sbom scan and its associated APICollection
        const sbomScan = await SBOMScan.findById(id);
        if (!sbomScan) {
            return res.status(404).json({ error: 'Scan not found.' });
        }


        // Delete the scan
        const deletedScan = await SBOMScan.findByIdAndDelete(id);
        if (!deletedScan) {
            return res.status(404).json({ error: 'Failed to delete the scan.' });
        }
       

        // Delete related ActiveScanVulnerabilities
        await SBOMScan.deleteMany({ sbomScan: id });

        const user = await User.findById(req.user._id)
        const organization = await Organization.findById(user.organization)
        calculateDashboard(organization);

        res.json({ message: 'Scan and related vulnerabilities deleted successfully.' });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }

});