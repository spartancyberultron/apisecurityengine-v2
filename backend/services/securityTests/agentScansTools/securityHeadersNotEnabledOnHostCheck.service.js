const path = require("path");
const fs = require("fs");
const { exec } = require('child_process');

// Test for "Security Headers Not Enabled on Host"
async function securityHeadersNotEnabledOnHostCheck(hosts) {

    let issueFound = false;
    let description = '';
    let findings = [];

    var scanId = generateRandomWord();

    const toolCommand = 'python3 security-headers-tool/securityheaders/securityheaders.py ' + hosts + ' --formatter json > security-header-scan-results/' + scanId + '.json';
    console.log('toolCommand:', toolCommand);

    const resultFilePath = path.join(__dirname, "..", "..", "security-header-scan-results", `${scanId}.json`);
    console.log('resultFilePath:', resultFilePath);

    try {
        // Execute the command and wait for it to complete
        await execCommand(toolCommand);

        // Check if the result file exists and is not empty
        const stats = await fs.promises.stat(resultFilePath);
        if (stats.size === 0) {
            console.error('File is empty.');
            return;
        }

        // Read and parse the result file
        const data = await fs.promises.readFile(resultFilePath, 'utf8');
        const jsonObject = parseMultipleJsonArrays(data);
        console.log('JSON object:', jsonObject);

        return jsonObject;

    } catch (error) {
        console.error(`Error: ${error}`);
    }
}

// Function to execute a command and return a promise
function execCommand(command) {
    return new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
            if (error) {
                reject(`Error executing command: ${error}`);
                return;
            }
            if (stderr) {
                reject(`Error in command output: ${stderr}`);
                return;
            }
            console.log(`Command executed successfully: ${stdout}`);
            resolve(stdout);
        });
    });
}

function parseMultipleJsonArrays(fileContent) {
    // Split the file content by lines and filter out empty lines
    const lines = fileContent.split('\n').filter(line => line.trim() !== '');

    // Join the lines back into a single string but separate arrays with a special marker
    const jsonString = lines.join('\n').replace(/\]\s*\[/g, '],[');

    // Wrap the string into a single JSON array
    const wrappedJsonString = `[${jsonString}]`;

    // Parse the wrapped JSON string into an array of arrays
    const arrays = JSON.parse(wrappedJsonString);

    // Flatten the array of arrays into a single array
    const combinedArray = arrays.flat();

    return combinedArray;
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
    securityHeadersNotEnabledOnHostCheck,
};
