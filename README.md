# Installation  
  
git clone <git_url>  
  
  
*Ensure Node JS Version on your machine is higher than 16.*  
  
cd backend  
npm install  
  
**Create the Required Helper Directories**  
  
```bash
mkdir security-header-scan-results security-headers-tool soap-graphql-scan-results sslyze-scan-results uploads  
cd uploads  
mkdir postman-collections sbom-files soap-and-graphql-files ticket-attachments ticket-update-attachments  
cd sbom-file  
mkdir sbom-scan-result-files  
pm2 start server.js
```

  
This will start the backend service on port 5001. You can configure the port in .env file.  

```bash  
cd ../frontend  
npm install  
npm run build
```
  
  
This will generate a build folder. Set the docroot of your frontend domain to the build folder.  
  
Install the required helper tools. You can find instructions on the below links:-  
  
  
[https://github.com/projectdiscovery/katana](https://github.com/projectdiscovery/katana)  
  
[https://github.com/devops-kung-fu/bomber](https://github.com/devops-kung-fu/bomber)  
  
[https://hub.docker.com/r/zaproxy/zap-stable](https://hub.docker.com/r/zaproxy/zap-stable)  
  
[https://github.com/nabla-c0d3/sslyze](https://github.com/nabla-c0d3/sslyze)  
  
[https://github.com/koenbuyens/securityheaders](https://github.com/koenbuyens/securityheaders)    
  
  
  
Note- The process of setting up the frontend doc root and the reverse proxy for the backend, will vary as per the environment/platform you are using.    
  
  
  
# How to Use the Application  
  
  
## Login  
  
Use the email and password provided by your system administrator to log into the application.  
  
![Login](docs/docs-screenshots/login.png)

  
## Dashboard  
  
  
After logging in, you'll be taken to a dashboard with navigation options on the left side and various charts and graphs on the right, along with organization-specific statistics.  


![Dashboard](docs/docs-screenshots/dashboard.png)

  
  
## Organization Management  
  
  
### Users Management  
  
If you are logged in as the primary user of the organization, you can add more users under the organization.  

![Users](docs/docs-screenshots/users.png)

  
You can add, edit or delete users.  

![Add User](docs/docs-screenshots/add-user.png)


![Edit User](docs/docs-screenshots/edit-user.png)

  
  
### Teams Management  

![Teams](docs/docs-screenshots/teams.png)

  
You can add, edit or delete teams under your organization. 

![Add Team](docs/docs-screenshots/add-team.png)

  
While editing a team, you can add on or more users into the team.  

![Edit Team](docs/docs-screenshots/edit-team.png)
  
  
### Workspaces Management  
  
You can add, edit or delete workspaces under your organization.  


![Workspaces](docs/docs-screenshots/workspaces.png)


![Add Workspace](docs/docs-screenshots/add-workspace.png)


  
While editing a workspace, you can give access to one or more teams to the workspace.  

![Edit Workspace](docs/docs-screenshots/edit-workspace.png)

  
Members of those teams will be able to access and perform actions on all projects under the workspace.  
  
  
  
### Projects Management  
  
You can add, edit or delete projects under your organization. 


![Projects](docs/docs-screenshots/projects.png)


While adding a project, a workspace has to be selected. The project becomes a member of the workspace.

![Add Project](docs/docs-screenshots/add-project.png)


![Edit Project](docs/docs-screenshots/edit-project.png)


### Tickets

This section contains tickets created as a result of vulnerabilities found in any of the scans. For each vulnerability, a ticket will be opened.


![Tickets](docs/docs-screenshots/ticketss.png)


A ticket can also be opened manually.


![Open Ticket](docs/docs-screenshots/open-ticket.png)


You can follow up to a ticket by adding an update.


![View Ticket and Follow Up](docs/docs-screenshots/view-ticket-and-followup.png)


Tickets can be closed as RESOLVED. They can bs set into IN PROGRESS and ON HOLD statuses as well.
By default, a ticket has OPEN status. 

  
### Settings  

Under settings, you can set the severity and priority of all security test cases, as per your organization policy.

You can also select the sensitive data classes (PII Data classes) recognized by your organization policy.
  
![Settings](docs/docs-screenshots/settings.png)

  
### Result Integrations  
  
Under result integrations, you can save integration keys from various platforms like Slack, Trello, JIRA, Asana, Azure Boards, Teams and Discord.
  
All the scan results will be sent to these channels on completion of a scan.

![Result Integrations](docs/docs-screenshots/result-integrations.png)

  
  
## REST API Scan Framework    
  
  
1. **Adding API Collections:**    

![API Inventory](docs/docs-screenshots/apicollections.png)

  
  
- To scan your REST APIs for security vulnerabilities, add the API collections to the API inventory.  
  
  ![Add API Collection](docs/docs-screenshots/add-api-collection.png)

  
  
- You can add API collections in Postman JSON, Postman YAML, Swagger JSON, or OpenAPI format.  
  
  
  
- You have the option to upload these as a file or provide a URL to the raw content of these collections.  
  
  
  
- When adding a collection, you can select the project to which this collection belongs.  
  
  
  
- All added collections will be displayed in a table on the API inventory page.  
  
  
  
  
  
2. **API Collection Versions:**  
  
  

  
- By default, the first collection you upload will become version 1 of that API collection.  
  
  
  
- Clicking on "View Versions" will give you a list of all versions of the API collection.  
  
      ![API Collection Versions](docs/docs-screenshots/view-collection-versions.png)

  
- You can add more versions of the same collection, which will be listed in the same table.  
  
  
  
- You can view all scans performed on a specific collection version, view all the APIs within a collection version, start a new scan on the collection version, or delete the collection version.  
  

  
  
  
  
**Starting a Scan on a Collection Version:**  
  
  
  
  
  
1. **Scan Options:**  
  
  
  
- When starting a scan, you can select all endpoints or specific ones.  

    ![Start Scan](docs/docs-screenshots/start-scan.png)


  
  
- You can choose to run the scan immediately, at a specific time, or on a recurring schedule.  
  
      ![Start Scan Options](docs/docs-screenshots/start-scan-options.png)

  
- If you select a specific time, you'll be prompted to set the date and time.  
  
  
  
- If you choose recurring, you'll be prompted to set the recurring schedule.  
  
  
  
- Optionally, you can also select the project phase of the SDLC during which the scan is being performed.  
  
  
  
  
  
2. **Viewing Scan Results:**  
  
  
  
- You can view all performed scans under the "Scans" menu.  
  
  
![All Scans](docs/docs-screenshots/all-scans.png)

  
- To see the results for a specific API collection version, use the "View Scans" option in the API collection version table.  
  

  
- By clicking on "View Report," you can see detailed information about a scan, including all vulnerabilities found and their individual explanations.  
  
  
![View Scan Report](docs/docs-screenshots/view-report.png)

  
  
3. **Vulnerability Details:**  
  
  
  
- Each vulnerability is displayed in a table with detailed information, including additional details in a dialog box if available, along with a description.  
  
  
  
- You can also see the remediations for that particular vulnerability type.    

  
- The cost impact for that particular vulnerability type is also displayed.  
  
  
  
- CWE and OWSP categories applicable to that vulnerability type are shown.  
  
  
  
- For record-keeping purposes, you can accept a particular vulnerability in the "Risk Acceptance" section if that vulnerability is recognized as acceptable by you.  This makes the row turn red, indicating that this vulnerability is recognized as valid.
  
  
  
  
  
## Mirroring Agents - API Traffic Scan Framework  
  
  

  
  
1. **API Traffic Scanning:**  
  
  
  
- You can scan for security vulnerabilities on the API traffic of your application during development and testing using one of the available agent options.  
  
  
  
- To do this, you need to add an application on the "Applications" page, which will generate an integration API key. You'll use this key when configuring and running the agents.  
  
  
![Traffic Mirroring Agents](docs/docs-screenshots/mirroring-agents.png)

  
- For each application, you can view a live report of all vulnerabilities found in the traffic. This also creates an inventory of APIs, which you can view under "View Inventory."  
  
  
![View Traffic Inventory](docs/docs-screenshots/view-inventory.png)

  
- You can set the capturing status to either "Capturing" or "Stopped," based on which the agent traffic will be captured by the scanning engine.  
  
  
## SOAP/GraphQL APIs Scan Framework  
  
  
Under SOAP/GraphQL Scans , you can view the list if all scans performed.

![SOAP/GraphQL Scans](docs/docs-screenshots/soap-graphql-scans.png)


You can also start a new scan.

![Start SOAP/GraphQL Scan](docs/docs-screenshots/start-soap-graphql-scan.png)


You can view the result of a scan in detail, by clicking the View Report button in scans list.
  
  
## SBOM Scan Framework  
  
Under SBOM Scans , you can view the list if all scans performed.


![SBOM Scans](docs/docs-screenshots/sbom-scans.png)


You can also start a new scan.


![Start SBOM Scan](docs/docs-screenshots/start-sbom-scan.png)


You can view the result of a scan in detail, by clicking the View Report button in scans list.
  
  
## LLM Scan Framework  
  
  
Under LLM Scans , you can view the list if all scans performed.


![LLM Scans](docs/docs-screenshots/llm-scans.png)


You can also start a new scan.


![Start LLM Scan](docs/docs-screenshots/start-llm-scan.png)


You can view the result of a scan in detail, by clicking the View Report button in scans list.
  
  
  
## Attack Surface Management  
  
Under Attack Surface Scans , you can view the list if all scans performed.

![Attack Surface Scans](docs/docs-screenshots/attack-surface-management.png)


You can also start a new scan on a domain.

![Start Attack Surface Scan](docs/docs-screenshots/start-attack-surface-scan.png)


You can view the result of a scan in detail, by clicking the View Report button in scans list.
  
  
## Alerts  
  
  
- You can view alerts generated during the scanning process under the "Alerts" section.  

![View Scan Report](docs/docs-screenshots/alerts.png)

  
  
  
## PII Data  
  
All PII Data (Sensitive Data Classes) found in the security scans under your account, can be seen in the PII Data section.  
  

![PII Data](docs/docs-screenshots/pii-data.png)

  
  
## Threat Modelling  

Under threat modlling, you can view threat modelling of all REST API Scans and LLM Scans, by clicking on the Threat Modelling button.


![Threat Modelling - REST](docs/docs-screenshots/threat-modelling-rest.png)

![Threat Modelling - LLM](docs/docs-screenshots/threat-modelling-llm.png)

![Threat Modelling View](docs/docs-screenshots/threat-modelling-view.png)


  
## Compliance Monitoring  

Under compliance monitoring, you can view all compliance statuses for major compliance standards and the projects that are affected.

![Compliance Monitoring- API](docs/docs-screenshots/compliance-monitoring-api.png)

![Compliance Monitoring - LLM](docs/docs-screenshots/compliance-monitoring-llm.png)

  
## Integrations

Under integartions, you can view/configure integartions for:

* Postman
* Burp Suite
* Jenkins
* CLI agent
* Node JS
* Python
* PHP
* Java
* .NET
* GoLang


![Integrations](docs/docs-screenshots/integrations.png)
