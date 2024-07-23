const https = require('https');
const path = require("path");
const fs = require("fs");
const { exec } = require('child_process');

/* Test for "Endpoint Not Secured by SSL" */
async function endpointNotSecuredBySSLCheck(hosts) {

    let issues = [];
    let issueFound = false;
    let description = '';

    var scanId = generateRandomWord();

    const theHosts = convertCommaToSpace(hosts);

    const toolCommand = 'python3 -m sslyze ' + theHosts + ' --json_out=sslyze-scan-results/' + scanId + '.json';
    console.log('toolCommand:', toolCommand);

    const resultFilePath = path.join(__dirname, "..", "..", "sslyze-scan-results", `${scanId}.json`);
    console.log('resultFilePath:', resultFilePath);

    try {
        // Execute the command and wait for it to complete
        console.log('Executing command...');
        await execCommand(toolCommand);
        console.log('Command executed successfully.');
    } catch (error) {
        console.error('Error executing command:', error);
    }

    try {
        // Check if the result file exists and is not empty
        console.log('Checking if result file exists...');
        const stats = await fs.promises.stat(resultFilePath);
        if (stats.size === 0) {
            console.error('File is empty.');
            return;
        }

        // Read and parse the result file
        console.log('Reading the result file...');
        const data = await fs.promises.readFile(resultFilePath, 'utf8');
        console.log('File read successfully.');
        const jsonObject = JSON.parse(data);
        console.log('JSON object:', jsonObject);

        return jsonObject;
    } catch (error) {
        console.error(`Error reading/parsing file: ${error}`);
    }
}

function convertCommaToSpace(str) {
    return str.split(',').join(' ');
}

// Function to execute a command and return a promise
function execCommand(command) {
    return new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error('Error executing command:', error);
                reject(error);
                return;
            }
            if (stderr) {
                console.error('Command stderr output:', stderr);
                reject(stderr);
                return;
            }
            console.log('Command stdout output:', stdout);
            resolve(stdout);
        });
    });
}

function generateRandomWord(length = 10) {
    const characters = 'abcdefghijklmnopqrstuvwxyz';
    let result = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        result += characters[randomIndex];
    }
    return result;
}

module.exports = {
    endpointNotSecuredBySSLCheck,
};
