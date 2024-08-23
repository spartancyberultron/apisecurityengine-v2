# Installation

  

    git clone <git_url>  

*Ensure Node JS Version on your machine is higher than 16.*  

    cd backend

    npm install 
 

**Create the Required Helper Directories**

    mkdir security-header-scan-results security-headers-tool soap-graphql-scan-results sslyze-scan-results uploads
    cd uploads
    mkdir postman-collections sbom-files soap-and-graphql-files ticket-attachments ticket-update-attachments 
    cd sbom-file
    mkdir sbom-scan-result-files

    pm2 start server.js
  

This will start the backend service on port 5001. You can configure the port in .env file. 
  

    cd ../frontend

    npm install

    npm run build

  

This will generate a build folder. Set the docroot of your frontend domain to the build folder. 
  

Install the required helper tools. You can find instructions on the below links:-  
  
`
https://github.com/projectdiscovery/katana
https://github.com/devops-kung-fu/bomber
https://hub.docker.com/r/zaproxy/zap-stable
https://github.com/nabla-c0d3/sslyze
https://github.com/koenbuyens/securityheaders  
`

Note- The process of setting up the frontend doc root and the reverse proxy for the backend, will vary as per the environment/platform you are using.

  
  

# How to Use the Application

  

## Login

  

Use the email and password provided by your system administrator to log into the application.

  

## Dashboard

  

After logging in, you'll be taken to a dashboard with navigation options on the left side and various charts and graphs on the right, along with organization-specific statistics.

  

## REST API Scan Framework

  

1. **Adding API Collections:**

- To scan your REST APIs for security vulnerabilities, add the API collections to the API inventory.

- You can add API collections in Postman JSON, Postman YAML, Swagger JSON, or OpenAPI format.

- You have the option to upload these as a file or provide a URL to the raw content of these collections.

- When adding a collection, you can select the project to which this collection belongs.

- All added collections will be displayed in a table on the API inventory page.

  

2. **API Collection Versions:**

- By default, the first collection you upload will become version 1 of that API collection.

- Clicking on "View Versions" will give you a list of all versions of the API collection.

- You can add more versions of the same collection, which will be listed in the same table.

- You can view all scans performed on a specific collection version, view all the APIs within a collection version, start a new scan on the collection version, or delete the collection version.

  

**Starting a Scan on a Collection Version:**

  

1. **Scan Options:**

- When starting a scan, you can select all endpoints or specific ones.

- You can choose to run the scan immediately, at a specific time, or on a recurring schedule.

- If you select a specific time, you'll be prompted to set the date and time.

- If you choose recurring, you'll be prompted to set the recurring schedule.

- Optionally, you can also select the project phase of the SDLC during which the scan is being performed.

  

2. **Viewing Scan Results:**

- You can view all performed scans under the "Scans" menu.

- To see the results for a specific API collection version, use the "View Scans" option in the API collection version table.

- By clicking on "View Report," you can see detailed information about a scan, including all vulnerabilities found and their individual explanations.

  

3. **Vulnerability Details:**

- Each vulnerability is displayed in a table with detailed information, including additional details in a dialog box if available, along with a description.

- You can also see the remediations for that particular vulnerability type.

- The cost impact for that particular vulnerability type is also displayed.

- CWE and WASC categories applicable to that vulnerability type are shown, along with the CVSS score.

- For record-keeping purposes, you can accept a particular vulnerability in the "Risk Acceptance" section if that vulnerability is recognized as acceptable by you.

  

## Mirroring Agents - API Traffic Scan Framework

  

1. **API Traffic Scanning:**

- You can scan for security vulnerabilities on the API traffic of your application during development and testing using one of the available agent options.

- To do this, you need to add an application on the "Applications" page, which will generate an integration API key. You'll use this key when configuring and running the agents.

- For each application, you can view a live report of all vulnerabilities found in the traffic. This also creates an inventory of APIs, which you can view under "View Inventory."

- You can set the capturing status to either "Capturing" or "Stopped," based on which the agent traffic will be captured by the scanning engine.

  
  
  

## SOAP/GraphQL APIs Scan Framework

  
  

## SBOM Scan Framework

  
  
  

## LLM Scan Framework

  
  

## Attack Surface Management

  
  
  
  
  
  

## Alerts

  

- You can manage alerts generated during the scanning process under the "Alerts" section.

  
  

## PII Data

  
  

## Threat Modelling

  
  
  

## Compliance Monitoring

  
  

## Integrations

  
  

## Organization Management

  
  

### Users Management

  
  

### Teams Management

  
  

### Workspaces Management

  
  

### Projects Management

  
  

### Settings

  
  

### Result Integrations
