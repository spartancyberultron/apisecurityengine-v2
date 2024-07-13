const asyncHandler = require('express-async-handler');
const path = require("path")
const fs = require("fs")
const SBOMScan = require("../models/sbomScan.model")
const SBOMScanVulnerability = require("../models/sbomScanVulnerability.model")
const { User } = require('../models/user.model');

const { exec } = require('child_process');
const LLMScan = require('../models/llmScan.model');
const ActiveScanVulnerability = require('../models/activescanvulnerability.model');

const Vulnerability = require('../models/vulnerability.model');


module.exports.getLLMCompliances = asyncHandler(async (req, res) => {

    const llmScans = await LLMScan.find({user:req.user._id });

    let llmScanVulns = [];

    for(var i=0;i<llmScans.length;i++){

        for(var j=0;j<llmScans[i].resultFileContents.length;j++){
            llmScanVulns.push(extractProbeName(llmScans[i].resultFileContents[j].file_name))
        }       
    }
    
    // Return the sbom scans, currentPage, totalRecords, and totalPages in the response
    res.status(200).json({
        llmScanVulns        
    });

});

function extractProbeName(filename) {

    const parts = filename.split("___");
    if (parts.length === 2) {
      return parts[1].split(".")[0]; // Extract probe name before extension
    } else {
      return null; // Return null if filename is not in the expected format
    }
  }  



module.exports.getAPICompliances = asyncHandler(async (req, res) => {

   const uniqueVulnerabilityIds = await ActiveScanVulnerability.aggregate([
    {
      $group: {
        _id: '$vulnerability'
      }
    }
  ]).exec();

  const uniqueVulnerabilities = await Vulnerability.find({
    _id: { $in: uniqueVulnerabilityIds.map(item => item._id) }
  }).exec();



  var owaspCategories = [];

  for(var i=0;i<uniqueVulnerabilities.length;i++){

    for(var j=0;j<uniqueVulnerabilities[i].owasp.length;j++){
        owaspCategories.push(uniqueVulnerabilities[i].owasp[j])
    }
  }

    // Return the sbom scans, currentPage, totalRecords, and totalPages in the response
    res.status(200).json({
        owaspCategories,        
    });

});


