const asyncHandler = require('express-async-handler');
const path = require("path")
const fs = require("fs")
const SBOMScan = require("../models/sbomScan.model")
const SBOMScanVulnerability = require("../models/sbomScanVulnerability.model")
const { User } = require('../models/user.model');

const { exec } = require('child_process');

module.exports.getAllSBOMScans = asyncHandler(async (req, res) => {

    const pageNumber = parseInt(req.query.pageNumber) || 1; // Get the pageNumber from the query parameters (default to 1 if not provided)
    const pageSize = 10; // Number of active scans per page

    const totalRecords = await SBOMScan.countDocuments({ user: req.user._id });
    const totalPages = Math.ceil(totalRecords / pageSize);

    // Calculate the skip value based on the pageNumber and pageSize
    const skip = (pageNumber - 1) * pageSize;

    const sbomScans = await SBOMScan.find({ user: req.user._id }).populate('orgProject')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageSize)
        .lean();


    for (var i = 0; i < sbomScans.length; i++) {

        var vulnerabilities = await SBOMScanVulnerability.find({ sbomScan: sbomScans[i]._id })
        sbomScans[i].vulnerabilities = vulnerabilities;
    }


    // Return the sbom scans, currentPage, totalRecords, and totalPages in the response
    res.status(200).json({
        sbomScans,
        currentPage: pageNumber,
        totalRecords,
        totalPages,
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

    const { scanName, projectId } = req.body;

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
            orgProject:projectId
        });
        newScan.save();

        console.log('filePath:', filePath);
        
        // Set the target directory
        const targetDirectory = path.join(__dirname, "..", "uploads", "sbom-files", "sbom-scan-result-files");

        // Change directory to the target directory
        process.chdir(targetDirectory);

        const toolCommand = '/usr/bin/bomber scan '+filePath+' --output=json > '+newScan._id+'_result.json';
        //exec(toolCommand);

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
                        processJsonObjectAndSaveResults(jsonObject, newScan._id);
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


async function processJsonObjectAndSaveResults(jsonObject, scanId) {

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

        console.log('SBOMScanVulnerability records created');

    } catch (error) {
        console.error(`Error parsing JSON file: ${error}`);
    }
}




module.exports.deleteSBOMScan = asyncHandler(async (req, res) => {



});