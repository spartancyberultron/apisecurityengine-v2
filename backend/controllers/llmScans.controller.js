const asyncHandler = require('express-async-handler');
const path = require("path")
const fs = require("fs")
const { generateToken } = require('../utils/generateToken');
const LLMScan = require("../models/llmScan.model")
const LLMScanVulnerability = require("../models/llmScanVulnerability.model")
const { User } = require('../models/user.model');
const bcrypt = require('bcryptjs');
const axios = require('axios');
const https = require('https');

const remediations = require('./remediations/soap-graphql-remediations.json');


function getObjectByVulnerability(vulnerability) {
  // Find the object with the given index
  const result = remediations.find(item => item.vulnerability === vulnerability);
  return result || null; // Return null if no object is found
}


module.exports.getAllLLMScans = asyncHandler(async (req, res) => {


    // The user is attempting to fetch the scans list, so we will see all scans that have a task id, but the status as "in progress".
    // And check whether their scans are complete, by running get_llm_security_scan_results API.
    // If they are completed, save the status and then fetch the results and save the results, then proceed to the rest of the logic for this
    // function

    const inProgressScans = await LLMScan.find({status:'in progress'})

    const apiKey = '84252fb2-dd25-4805-b220-11730472a84b';
    const apiUrl = 'https://3.7.7.55:54983/get_llm_security_scan_results';

    for (const scan of inProgressScans) {        

        if (scan.taskId && scan.taskId.trim() !== '') {


          const requestBody = {
            "api_key": apiKey,
            "task_id": scan.taskId,
            "result_types": ["result_files_list"],
            "requested_files_data": ["overview.log"]
          };
  
          try {

            const response = await axios.post(apiUrl, requestBody, {
              headers: {
                'Content-Type': 'application/json'
              },
              httpsAgent: new (require('https').Agent)({ rejectUnauthorized: false })
            });
  
            const responseData = response.data;

            console.log('responseData:',responseData)
  
            // Check if response contains "Completed run_llm_security_scan"
            if (JSON.stringify(responseData).includes("Completed run_llm_security_scan")) {

            
  
              // Filter and assign result files
              const resultFilesList = responseData.result_files_list.files_list || [];

              console.log('resultFilesList:',resultFilesList)

              const probes = scan.probes || [];
              scan.resultFiles = resultFilesList.filter(file =>
                probes.some(probe => file.endsWith(`${probe}.log`))
              );
  
              await scan.save();

              // Now get the result files list and get their contents. Combine them and save in a long string.

              const requestBody1 = {
                "api_key": apiKey,
                "task_id": scan.taskId,
                "result_types": ["result_files_list"],
                "requested_files_data": scan.resultFiles
              };

              const response = await axios.post(apiUrl, requestBody1, {
                headers: {
                  'Content-Type': 'application/json'
                },
                httpsAgent: new (require('https').Agent)({ rejectUnauthorized: false })
              });
    
              const responseData1 = response.data;

              scan.resultFileContents = responseData1.requested_files_data_list;
              scan.save();    

              // Update scan status to 'completed' and set scanCompletedAt
              scan.status = 'completed';
              scan.scanCompletedAt = new Date();

            }
  
          } catch (error) {
            console.error(`Error fetching results for taskId ${scan.taskId}:`, error.message);
          }
        }
    }

    // Logic to fetch the scans
    const pageNumber = parseInt(req.query.pageNumber) || 1; // Get the pageNumber from the query parameters (default to 1 if not provided)
    const pageSize = 10; // Number of active scans per page

    const totalRecords = await LLMScan.countDocuments({ user: req.user._id });
    const totalPages = Math.ceil(totalRecords / pageSize);

    // Calculate the skip value based on the pageNumber and pageSize
    const skip = (pageNumber - 1) * pageSize;

    const llmScans = await LLMScan.find({ user: req.user._id }).populate('orgProject')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageSize)
        .lean();


    for(var i=0;i<llmScans.length;i++){
        
        var vulnerabilities = await LLMScanVulnerability.find({llmScan:llmScans[i]._id})
        llmScans[i].vulnerabilities = vulnerabilities;
    }  


    // Return the sbom scans, currentPage, totalRecords, and totalPages in the response
    res.status(200).json({
        llmScans,
        currentPage: pageNumber,
        totalRecords,
        totalPages,
    });    

});


module.exports.getLLMScanDetails = asyncHandler(async (req, res) => {
    
    const { scanId } = req.body;   

    const llmScan = await LLMScan.findById(scanId).populate('user').lean();

    const vulnerabilities = await LLMScanVulnerability.find({llmScan:scanId}).lean();

    llmScan.vulnerabilities = vulnerabilities;   

    // Return the scans
    res.status(200);
    res.json({ llmScan })

});


module.exports.startLLMScan = asyncHandler(async (req, res) => {

    const user = await User.findById(req.user._id);

    const { scanName, selectedProbes, modelHubKey, modelName, projectId } = req.body;   

    const newScan = new LLMScan({
        scanName: scanName,
        user: user._id,
        probes:selectedProbes,
        modelHubKey:modelHubKey,
        modelName:modelName,
        orgProject:projectId,
        status:'in progress'        
    });

    await newScan.save();        
    
    try {

        const apiUrl = 'https://3.7.7.55:54983/run_llm_security_scan';

        const requestBody = {
                "api_key": "84252fb2-dd25-4805-b220-11730472a84b",
                "model_hub_key": modelHubKey,
                "model_type": "huggingface",
                "model_name": modelName,
                "probes_required": selectedProbes,
                "results_notification_url": "http://abcd.com/no2"
        };

        const agent = new https.Agent({  
            rejectUnauthorized: false
        });


        const response = await axios.post(apiUrl, requestBody, {
          headers: {
            'Content-Type': 'application/json'
          },
          httpsAgent: agent
        });
    
        const { task_id: taskId, task_start_time: taskStartTime, reports_dir: reportsDir } = response.data;
    
        console.log('Task ID:', taskId);
        console.log('Task Start Time:', taskStartTime);
        console.log('Reports Directory:', reportsDir);

        newScan.taskId = taskId;
        newScan.taskStartTime = taskStartTime;
        newScan.reportsDir = reportsDir;
        newScan.status = 'in progress';
        newScan.save();
    
        // Save these values to wherever you need them (e.g., a database, a file, etc.)
    
    } catch (error) {
        console.error('Error:', error);
    }

});



module.exports.deleteLLMScan = asyncHandler(async (req, res) => {

    try {
        const { id } = req.body;

        // Find the llm scan
        const llmScan = await LLMScan.findById(id);
        if (!llmScan) {
            return res.status(404).json({ error: 'LLM scan not found.' });
        }


        // Delete the LLMScan
        const deletedLLMScan = await LLMScan.findByIdAndDelete(id);
        if (!deletedLLMScan) {
            return res.status(404).json({ error: 'Failed to delete the LLM scan.' });
        }      

        // Delete related LLMScanVulnerabilities
        await LLMScanVulnerability.deleteMany({ llmScan: id });

        res.json({ message: 'Scan and related vulnerabilities deleted successfully.' });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }

});



function parseGarakLogs(logData) {
    const logLines = logData.split('\n');
    const results = [];

    logLines.forEach(line => {
        const match = line.match(/(\w+\.\w+)\s+(\w+\.\w+):\s+(\w+)\s+\w+\s+on\s+(\d+)\/\s*(\d+)/);
        if (match) {
            const [_, probeType, matchType, status, count, total] = match;
            results.push({
                probeType,
                matchType,
                status,
                count: parseInt(count, 10),
                total: parseInt(total, 10)
            });
        }
    });

    return results;
}













