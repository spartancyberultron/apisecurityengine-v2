import React, { useState, useEffect, useRef } from "react";
import MUIDataTable from "mui-datatables";
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useParams, useNavigate } from 'react-router-dom'
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';

import awsLogo from '../../../assets/images/aws-logo.png'
import gcpLogo from '../../../assets/images/gcp-logo.png'
import kubernetesLogo from '../../../assets/images/kubernetes-logo.png'
import dockerLogo from '../../../assets/images/docker.png'
import { CodeBlock, dracula } from "react-code-blocks";

import nodeJSLogo from '../../../assets/images/node-white-logo.png'
import pythonLogo from '../../../assets/images/python-white-logo.png'
import phpLogo from '../../../assets/images/php-logo.png'
import dotnetLogo from '../../../assets/images/dotnet-white-logo.png'
import javaLogo from '../../../assets/images/java-logo.png'
import golangLogo from '../../../assets/images/golang-logo.png'
import SyntaxHighlighter from 'react-syntax-highlighter';
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { dark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { CircularProgress } from '@mui/material';

import {
  CButton,
  CCard,
  CCardBody,
  CCardGroup,
  CCol,
  CContainer,
  CForm,
  CFormInput,
  CInputGroup,
  CRow,
  CFormLabel,
  CToast,
  CToastBody,
} from '@coreui/react'

import axios from 'axios';

const Integrations = () => {

    const navigate = useNavigate()

    const [candidates, setCandidates] = useState([])
    const [onLoading, setOnLoading] = useState(false);
    const [currentlySelectedJob, setCurrentlySelectedJob] = useState(null)
    const [postmanAPIKey, setPostmanAPIKey] = useState('')
    const [clientId, setClientId] = useState('')
    const [clientSecret, setClientSecret] = useState('')

    const [loading, setLoading] = useState(false)


    const toaster = useRef()
    const exampleToast = (
        <CToast>
            <CToastBody>Success</CToastBody>
        </CToast>
    )


    const fetchPostmanKey = async () => {

      setOnLoading(true);
      try {
          const token = localStorage.getItem('ASIToken');
          const response = await axios.get('api/v1/users/getOrganizationDetails/', {
              headers: { Authorization: `Bearer ${token}` },
          });
  
          setPostmanAPIKey(response.data.organization.postmanAPIKey);
          setClientId(response.data.organization.clientId);
          setClientSecret(response.data.organization.clientSecret);
  
  
      } catch (error) {
          console.error("Failed to fetch key", error);
      }
      setOnLoading(false);
  };
  
  const savePostmanAPIKey = async () => {

    setOnLoading(true);

    try {
        const token = localStorage.getItem('ASIToken'); 
        
        // Send transformed settings to the server
        await axios.post('api/v1/organizations/savePostmanAPIKey/', {
            postmanAPIKey: postmanAPIKey,
        }, {
            headers: { Authorization: `Bearer ${token}` },
        });  
  
        toast('Postman API key saved', {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        });

    } catch (error) {
        console.error("Failed to save key", error);
  
        toast.error('Failed to save key', {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        });
    }
    setOnLoading(false);
  };
    
  
    useEffect(() => {
      fetchPostmanKey();
    }, []);
  

    const javaCode = `    import java.util.UUID;
    import java.util.Date;
    import java.util.Enumeration;
    import java.io.IOException;
    import javax.servlet.*;
    import javax.servlet.http.HttpServletRequest;
    import javax.servlet.http.HttpServletResponse;
    import org.apache.commons.io.IOUtils;
    import org.apache.http.HttpEntity;
    import org.apache.http.HttpHeaders;
    import org.apache.http.HttpResponse;
    import org.apache.http.client.HttpClient;
    import org.apache.http.client.methods.HttpPost;
    import org.apache.http.entity.ContentType;
    import org.apache.http.entity.StringEntity;
    import org.apache.http.impl.client.HttpClientBuilder;
    
    public class APITrafficFilter implements Filter {
    
        private final String apiEndpointUrl = "https://backend.apisecurityengine.com/api/v1/mirroredScans/sendRequestInfo";
        private final String apiKey = System.getenv("APISEC_API_KEY");
    
        @Override
        public void init(FilterConfig filterConfig) throws ServletException {
            // Initialization code, if needed
        }
    
        @Override
        public void doFilter(ServletRequest servletRequest, ServletResponse servletResponse, FilterChain filterChain) throws IOException, ServletException {
            HttpServletRequest request = (HttpServletRequest) servletRequest;
            HttpServletResponse response = (HttpServletResponse) servletResponse;
    
            // Generate a unique ID for the request
            String requestId = UUID.randomUUID().toString();
    
            // Capture request information
            RequestInfo requestInfo = new RequestInfo();
            requestInfo.setRequestId(requestId);
            requestInfo.setProtocol(request.getProtocol());
            requestInfo.setHost(request.getHeader(HttpHeaders.HOST));
            requestInfo.setMethod(request.getMethod());
            requestInfo.setUrl(request.getRequestURI());
            requestInfo.setHeaders(getRequestHeaders(request));
            requestInfo.setBody(getRequestBody(request));
            requestInfo.setQuery(request.getQueryString());
            requestInfo.setTimestamp(new Date());
            requestInfo.setProjectType("Java");
    
            // Log the incoming request
            System.out.println("API Request: " + requestInfo);
    
            // Attach the requestId to the response headers
            response.setHeader("X-Request-ID", requestId);
    
            // Capture response information
            ResponseInfo responseInfo = new ResponseInfo();
            responseInfo.setRequestId(requestId);
            responseInfo.setStatusCode(response.getStatus());
            responseInfo.setHeaders(getResponseHeaders(response));
            responseInfo.setBody(""); // Response body not available in HttpServletResponse
            responseInfo.setTimestamp(new Date());
    
            // Pass control to the next filter or servlet
            filterChain.doFilter(request, response);
    
            // Log the outgoing response
            System.out.println("API Response: " + responseInfo);
    
            if (!request.getRequestURI().equals("/")) {
                // Send request information to the API endpoint
                try {
                    RequestPayload requestPayload = new RequestPayload();
                    requestPayload.setApiKey(apiKey);
                    requestPayload.setTheRequest(requestInfo);
    
                    String jsonPayload = requestPayload.toJsonString();
    
                    HttpClient httpClient = HttpClientBuilder.create().build();
                    HttpPost httpPost = new HttpPost(apiEndpointUrl);
                    httpPost.setEntity(new StringEntity(jsonPayload, ContentType.APPLICATION_JSON));
    
                    HttpResponse apiResponse = httpClient.execute(httpPost);
    
                    if (apiResponse.getStatusLine().getStatusCode() == HttpServletResponse.SC_OK) {
                        System.out.println("Request information sent successfully.");
                    } else {
                        System.err.println("Error sending request information. Status code: " + apiResponse.getStatusLine().getStatusCode());
                    }
                } catch (Exception e) {
                    System.err.println("Error sending request information: " + e.getMessage());
                }
            }
        }
    
        @Override
        public void destroy() {
            // Cleanup code, if needed
        }
    
        private String getRequestHeaders(HttpServletRequest request) {
            StringBuilder headers = new StringBuilder();
            Enumeration<String> headerNames = request.getHeaderNames();
            while (headerNames.hasMoreElements()) {
                String headerName = headerNames.nextElement();
                headers.append(headerName).append(": ").append(request.getHeader(headerName)).append("\n");
            }
            return headers.toString();
        }
    
        private String getRequestBody(HttpServletRequest request) throws IOException {
            return IOUtils.toString(request.getInputStream(), "UTF-8");
        }
    
        private String getResponseHeaders(HttpServletResponse response) {
            StringBuilder headers = new StringBuilder();
            for (String headerName : response.getHeaderNames()) {
                headers.append(headerName).append(": ").append(response.getHeader(headerName)).append("\n");
            }
            return headers.toString();
        }    
    }`;



    const goCode = `   package main

    import (
        "github.com/yourusername/mymiddleware/middleware"
        "github.com/gin-gonic/gin"
    )
    
    func main() {
        r := gin.Default()
        r.Use(middleware.CaptureAPIInfo())
        // Define your routes and handlers
        // ...
        r.Run(":8080")
    }    
    `

    const goCode1 = `   package main

    import (
        "github.com/yourusername/mymiddleware/middleware"
        "github.com/gin-gonic/gin"
        "github.com/joho/godotenv"
        "os"
    )

    func main() {
        // Load environment variables from the .env file
        err := godotenv.Load()
        if err != nil {
            // Handle error
            panic("Error loading .env file")
        }

        apiKey := os.Getenv("APISEC_API_KEY")

        r := gin.Default()
        r.Use(middleware.CaptureAPIInfo(apiKey))
        // Define your routes and handlers
        // ...
        r.Run(":8080")
    }`



    const dotNetCode1 = ` using APISecAgent; // Namespace of your middleware

// ...

// Use the middleware in the application's pipeline
app.UseMiddleware<CaptureAPIInfoMiddleware>();



using YourNamespace; // Namespace of your middleware

// ...

public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
{
    // ...

    // Use the middleware in the application's pipeline
    app.UseMiddleware<CaptureAPIInfoMiddleware>();

    // ...
}`


const dotNetCode2 = ` using APISecAgent;

// ...

public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
{
    // ...

    // Use the middleware in the application's pipeline
    app.UseMiddleware<CaptureAPIInfoMiddleware>();

    // ...
}`




    const goToAddAgent = (e) => {

        e.preventDefault();
        navigate('/add-agent')
    }

    return (
        <div  style={{ overflow: "scroll", position: 'relative', overflowY: 'hidden', overflowX: 'hidden', }}>
            <div style={{ width: '100%' }}>
                <div>
                    <div style={{ marginBottom: '2rem', display: 'flex', flexDirection: 'row', justifyContent: 'flex-start', marginTop:20 }}>

                        <h2 style={{textAlign:'left'}}>Integrations</h2>

                    </div>

                    <Tabs className="addAgentPage" style={{marginTop:50}}>

                        <TabList style={{ borderWidth: 0, display: 'flex', justifyContent: 'center' }}>
                            <Tab style={{ width: 150, borderWidth: 0, textAlign:'center' }}>

                               CLI Agent
                            </Tab>

                            <Tab style={{ width: 200, borderWidth: 0, textAlign:'center' }}>

                              Postman Integration
                            </Tab>

                            <Tab style={{ width: 200, borderWidth: 0, textAlign:'center' }}>

                               Burpsuite Extension
                            </Tab>

                            <Tab style={{ width: 150, borderWidth: 0, textAlign:'center' }}>

                               Jenkins Job
                            </Tab>

                            <Tab style={{ width: 150, borderWidth: 0, textAlign:'center' }}>

                                <img src={nodeJSLogo} style={{ height: 80, width: 80, objectFit: 'contain', display:'none' }} alt="Node.js" />
                                Node JS
                            </Tab>

                            <Tab style={{ width: 120, borderWidth: 0, textAlign:'center' }}>
                                <img src={pythonLogo} style={{ height: 80, width: 80, objectFit: 'contain',display:'none' }} alt="Python" />
                                Python
                            </Tab>

                            <Tab style={{ width: 120, borderWidth: 0 ,textAlign:'center'}}>
                                <img src={phpLogo} style={{ height: 80, width: 80, objectFit: 'contain',display:'none' }} alt="PHP" />
                                PHP
                            </Tab>

                            <Tab style={{ width: 120, borderWidth: 0 ,textAlign:'center'}}>
                                <img src={javaLogo} style={{ height: 80, width: 80, objectFit: 'contain',display:'none' }} alt="Java" />
                                Java
                            </Tab>

                            <Tab style={{ width: 120, borderWidth: 0, textAlign:'center' }}>
                                <img src={dotnetLogo} style={{ height: 80, width: 80, objectFit: 'contain',display:'none' }} alt=".NET" />
                                .NET
                            </Tab>

                            <Tab style={{ width: 120, borderWidth: 0,textAlign:'center' }}>
                                <img src={golangLogo} style={{ height: 80, width: 80, objectFit: 'contain',display:'none' }} alt="Go" />
                                Go
                            </Tab>
                        </TabList>


{/* CLI Agent  */}
<TabPanel style={{ padding: 30, backgroundColor: 'white', borderRadius: 5 }}>  

<h4 style={{ color: '#333' }}>CLI Agent</h4>


     <p>The APISecurityEngine CLI Agent is a python script that can capture API traffic from an application running on a Linux/Mac/Windows machine and 
      send to APISecurityEngine for security analysis. The results can be viewed under Mirroring Agents section of the APISecurityEngine portal. </p>


<div style={{background:'#d9d5fa', padding:10}}>
      <h5 style={{ color: '#333' }}>For Linux/Mac</h5>

      <p style={{ fontSize: '16px', color: '#555' }}>
        Follow these steps to clone the project from GitHub and set up the API Security Engine:
      </p>
      <ol style={{ fontSize: '16px', color: '#555' }}>
        <li>
          <strong>Clone the GitHub Repository:</strong> 
          <pre style={{ backgroundColor: '#eaeaea', padding: '10px', borderRadius: '5px', overflowX: 'auto' }}>
            git clone https://github.com/spartancyberultron/apisecurityengine-cli-agent.git
          </pre>
        </li>
        <li>
          <strong>Navigate to the Project Directory:</strong>
          <pre style={{ backgroundColor: '#eaeaea', padding: '10px', borderRadius: '5px', overflowX: 'auto' }}>
            cd apisecurityengine-cli-agent
          </pre>
        </li>
        <li>
          <strong>Install the Required Python Packages:</strong>
          <pre style={{ backgroundColor: '#eaeaea', padding: '10px', borderRadius: '5px', overflowX: 'auto' }}>
            pip install requests
          </pre>
        </li>
        <li>
          <strong>Run the Script:</strong>
          <pre style={{ backgroundColor: '#eaeaea', padding: '10px', borderRadius: '5px', overflowX: 'auto' }}>
            python3 apisecengine-cli-agent.py --api_key=8FRAOGSIPHS6KYWFKTY7 --host=localhost --port=5002
          </pre>
        </li>
      </ol>
      <p style={{ fontSize: '16px', color: '#555' }}>
        The <code>--api_key</code> parameter is your unique integration key for APISecurityEngine. Replace it with your actual key to authenticate and authorize traffic capture.
      </p>
      <p style={{ fontSize: '16px', color: '#555' }}>
        The <code>--host</code> parameter specifies the hostname or IP address where the traffic is captured from. Use <code>localhost</code> for traffic from the local machine.
      </p>
      <p style={{ fontSize: '16px', color: '#555' }}>
        The <code>--port</code> parameter defines the port number on the host for traffic capture. Set this to the port your application uses, in this case, <code>5002</code>.
      </p>

      </div>

      <hr/>


      <div style={{background:'#FFE5B4', padding:10}}>


      <h5 style={{ color: '#7367f0' }}>For Windows</h5>




      <p style={{ fontSize: '16px', color: '#555' }}>
        Follow these steps to clone the project from GitHub and set up the API Security Engine:
      </p>
      <ol style={{ fontSize: '16px', color: '#555' }}>
        <li>
          <strong>Clone the GitHub Repository:</strong> 
          <pre style={{ backgroundColor: '#eaeaea', padding: '10px', borderRadius: '5px', overflowX: 'auto' }}>
            git clone https://github.com/spartancyberultron/apisecurityengine-cli-agent-windows
          </pre>
        </li>
        <li>
          <strong>Navigate to the Project Directory:</strong>
          <pre style={{ backgroundColor: '#eaeaea', padding: '10px', borderRadius: '5px', overflowX: 'auto' }}>
            cd apisecurityengine-cli-agent
          </pre>
        </li>
        <li>
          <strong>Install the Required Python Packages:</strong>
          <pre style={{ backgroundColor: '#eaeaea', padding: '10px', borderRadius: '5px', overflowX: 'auto' }}>
            pip install pydivert requests
          </pre>
        </li>
        <li>
          <strong>Run the Script in Powershell (as administrator):</strong>
          <pre style={{ backgroundColor: '#eaeaea', padding: '10px', borderRadius: '5px', overflowX: 'auto' }}>
            python3 apisecengine-cli-agent.py --api_key=8FRAOGSIPHS6KYWFKTY7 --host=localhost --port=5002
          </pre>
        </li>
      </ol>
      <p style={{ fontSize: '16px', color: '#555' }}>
        The <code>--api_key</code> parameter is your unique integration key for APISecurityEngine. Replace it with your actual key to authenticate and authorize traffic capture.
      </p>
      <p style={{ fontSize: '16px', color: '#555' }}>
        The <code>--host</code> parameter specifies the hostname or IP address where the traffic is captured from. Use <code>localhost</code> for traffic from the local machine.
      </p>
      <p style={{ fontSize: '16px', color: '#555' }}>
        The <code>--port</code> parameter defines the port number on the host for traffic capture. Set this to the port your application uses, in this case, <code>5002</code>.
      </p>

      </div>



</TabPanel>


{/* CLI Agent  */}
<TabPanel style={{ padding: 30, backgroundColor: 'white', borderRadius: 5 }}>  

<h4 style={{ color: '#333' }}>Postman Integration</h4>
<hr/>
<span style={{ color: '#333' }}>Client ID : {clientId}</span><br/>
<span style={{ color: '#333' }}>Client Secret : {clientSecret}</span><br/>

    
<CFormLabel htmlFor="formFileSm" style={{ marginTop: 30, color:'#000', fontWeight:'bold'  }}>Postman API Key</CFormLabel>
<p>Enter your Postman API key here. You can find it in your Postman account</p>
            <CInputGroup className="" style={{ flexDirection: 'column' }}>
              <CFormInput
                placeholder="Postman API Key"
                autoComplete="projectName"
                className="white-input"
                value={postmanAPIKey}
                onChange={(e) => setPostmanAPIKey(e.target.value)}
                style={{ width: '50%' }}
              />
              </CInputGroup>


            <CButton
              style={{
                width: '50%',
                marginTop: '3%',
                marginBottom: '2%',
                borderWidth: 0,
                fontSize: 20,
                background: '#7367f0'
              }}
              color="primary"
              className="px-3"
              onClick={savePostmanAPIKey}
            >              


              {loading ?
                            <CircularProgress color="primary" size={24} style={{ marginTop: 10, color: '#fff' }} />
                            :
                            'Save Postman API Key'
                          }


            </CButton>


<ul>
            <li>Download APISecurityEngine Postman Tool Collection from 
              <a target="_blank" style={{color:'blue'}} href="https://github.com/spartancyberultron/apisecurityengine-postman-tool/blob/main/APISecurityEngine%20-%20Postman%20Integration.postman_collection.json"
              > this link </a>
              , which contains an API.</li>    

              <li>Load the collection into your Postman app.</li>


            <li>Get the collection ID of the collection you want to scan. You can get this by exporting your
               collection and looking for it in the
              exported JSON file. </li>  


            <li>Call the runScanFromPostman available in the APISecurityEngine collection you downloaded in the previous step, and pass your collection ID 
              in the body (raw JSON), along with APISecurityEngine client ID and client secret which you can get from Organization - Settings in the APISecurityEngine Portal. 
            </li>

            <li>This will return a response. Click on Visualize in the Postman response tab, to see the results</li>

            </ul>

</TabPanel>

{/* BurpSuite Extension  */}
<TabPanel style={{ padding: 30, backgroundColor: 'white', borderRadius: 5 }}>  

<h4 style={{ color: '#333' }}>How to Install and Configure our Burp Suite Extension</h4>

      <p style={{ fontSize: '16px', color: '#555' }}>
        Follow these steps to install a Burp Suite extension from a JAR file and configure it to start analyzing traffic:
      </p>
      <ol style={{ fontSize: '16px', color: '#555' }}>
        <li>
          <strong>Download the Extension JAR File:</strong>
          <p>
            Obtain the JAR file for the Burp Suite Extension from the provided Git URL. You can download it from the below URL:
          </p>
          <pre style={{ backgroundColor: '#eaeaea', padding: '10px', borderRadius: '5px', overflowX: 'auto' }}>
                https://github.com/spartancyberultron/apisecurityengine-burpsuite-plugin
          </pre>
        </li>
        <li>
          <strong>Open Burp Suite:</strong>
          <p>
            Launch Burp Suite on your machine. If you don't have Burp Suite installed, download and install it from the official website.
          </p>
        </li>
        <li>
          <strong>Install the Extension:</strong>
          <p>
            In Burp Suite, go to the <strong>“User Options”</strong> or <strong>“Extensions”</strong> tab, depending on your version.
          </p>
          <p>
            Look for a section related to extensions. Click on the <strong>“Add”</strong> or <strong>“Load”</strong> button.
          </p>
          <p>
            Choose the <strong>“Java”</strong> extension type and browse to the location where you downloaded the extension jar file. Select the file and confirm the installation.
          </p>
        </li>
        <li>
          <strong>Configure the Extension:</strong>
          <p>
            After installing the Extension, your Burp Suite main menu will get a new menu item with name "APISecurityEngine Settings".
            Click on that to open settings.
          </p>

          <img width="800"
          src="https://raw.githubusercontent.com/spartancyberultron/apisecurityengine-burpsuite-plugin/refs/heads/main/apisec-burpsuite.png"/>
          <br/>
          <p>
            Set the following variables in the Extension settings:
          </p>
          <ul>
            <li><strong>API KEY</strong>: Your unique API key for APISecurityEngine. Replace with your actual key.</li>
            <li><strong>HOST</strong>: The hostname or IP address of the server where traffic is being captured from. Use <code>localhost</code> if the traffic is local.</li>
            <li><strong>PORT</strong>: The port number on the host where traffic is being captured. Enter the specific port number (e.g., <code>5002</code>).</li>
          </ul>

          You can get the API Key from the below shown location:- <br/>

          <img width="800"
          src="https://raw.githubusercontent.com/spartancyberultron/apisecurityengine-burpsuite-plugin/refs/heads/main/apisec-integration-key.png"/>
         <br/>
        </li>
        <li>
          <strong>Start Traffic Analysis:</strong>
          <p>
            With the extension installed and configured, start capturing traffic in Burp Suite. 
            The extension will send captured traffic to the analysis service using the provided API key and settings.
          </p>
        </li>
      </ol>
      <p style={{ fontSize: '16px', color: '#555' }}>
        Ensure that the extension is correctly configured with the appropriate API key, host, and port to ensure accurate traffic analysis.
      </p>


</TabPanel>


{/* Jenkins Job  */}
<TabPanel style={{ padding: 30, backgroundColor: 'white', borderRadius: 5 }}>
  <h4 style={{ color: '#333' }}>Creating a Jenkins Job to Send Postman Collection File to API for Scan</h4>

  <p style={{ fontSize: 16, color: '#555' }}>
    Follow these steps to create a Jenkins job that sends a Postman collection file to an API for scanning and displays the response:
  </p>

  <ol style={{ fontSize: 16, color: '#555' }}>
    <li>
      <strong>Create a New Jenkins Job:</strong>
      <p>
        In Jenkins, click on "New Item", choose "Freestyle project", and give it a name.
      </p>
    </li>

    <li>
      <strong>Configure Source Code Management:</strong>
      <p>
        Set up your source code repository in the "Source Code Management" section if needed.
      </p>
    </li>

    <li>
      <strong>Add Build Step:</strong>
      <p>
        In the "Build" section, add an "Execute shell" build step with the following script:
      </p>
      <pre style={{ backgroundColor: '#eaeaea', padding: 10, borderRadius: 5, overflowX: 'auto' }}>
{`#!/bin/bash
set -e

# API endpoint and credentials
api_url="https://backend-new.apisecurityengine.com/api/v1/activeScans/sendCollectionURLToScan"
client_id="c88ebeea40c501a5b2b91601fb763d5f"
client_secret="7a2855f626129183570d0f904136a86822a3d5d57857139150408b3443f8702b"
json_url="https://raw.githubusercontent.com/SabreDevStudio/postman-collections/master/Automation%20Solutions/Sabre-Automation-Solutions.postman_collection.json"

echo "Initiating scan and waiting for response..."

# Make API request and capture the response
RESPONSE=$(curl -s -X POST "$api_url" \\
  -H 'Content-Type: application/json' \\
  -d "{
  \\"apisecurityengineClientId\\": \\"$client_id\\",
  \\"apisecurityengineClientSecret\\": \\"$client_secret\\",
  \\"collectionUrl\\": \\"$json_url\\"
}")

echo "API request completed. Displaying formatted results:"
echo "===================================================="

# Function to print a separator line
print_separator() {
    echo "################################################################"
}

# Display scan information
echo "Scan Information:"
print_separator
jq -r '.scanResult | {
    ID: ._id,
    Status: .status,
    "Started At": .createdAt,
    "Completed At": .scanCompletedAt,
    "Vulnerability Count": .vulnCount
}' <<< "$RESPONSE" | jq -r 'to_entries | .[] | "\\(.key): \\(.value)"'
print_separator

# Display vulnerabilities with dark background and white text
echo "Vulnerabilities:"
print_separator
echo -e "\\033[0;37m\\033[40m"  # Set white text on dark background
jq -r '.scanResult.vulns[] | "ID: \\(.activeScan)\\nDescription: \\(.description)\\nSeverity: \\(.severity)\\nPriority: \\(.priority)\\nFindings: \\(.findings | join(", "))\\nCreated At: \\(.createdAt)\\n"' <<< "$RESPONSE"
echo -e "\\033[0m"  # Reset text color and background
print_separator

# Extract vulnerability count and determine build status
VULN_COUNT=$(jq -r '.scanResult.vulnCount' <<< "$RESPONSE")
if [ -n "$VULN_COUNT" ] && [ "$VULN_COUNT" -gt 0 ]; then
    echo "Vulnerabilities found: $VULN_COUNT. Build will fail."
    exit 1
else
    echo "No vulnerabilities detected."
    exit 0
fi`}
      </pre>
    </li>

    <li>
      <strong>Configure Build Environment:</strong>
      <p>
        Ensure that the necessary tools (curl, jq) are available in your Jenkins environment. You may need to install them or configure the job to use a Docker container with these tools.
      </p>
    </li>

    <li>
      <strong>Save and Run:</strong>
      <p>
        Save the job configuration and run it to test. The job will send the Postman collection to the API for scanning and display the results in the console output.
      </p>
    </li>
  </ol>

  <p style={{ fontSize: 16, color: '#555' }}>
    After configuring the job, run it to send the Postman collection file to the API, perform the scan, and view the response in the Jenkins console output. The vulnerabilities will be displayed with a dark background and white text for better visibility.
  </p>
</TabPanel>


                        {/* Node JS Instructions  */}
                        <TabPanel style={{ padding: 30, backgroundColor: 'white', borderRadius: 5 }}>  



                        <p style={{color:'black'}}>Install the APISec agent into your Node JS based project:-</p>


    <pre style={{color:'black'}}>npm i apisecurityengine-agent</pre>

<p style={{color:'black'}}>Add an environmental variable called APISEC_API_KEY with the value as the Integration API Key
   of your project created in the APISec Dashboard.</p>

   <p style={{color:'black'}}>You can use dotenv package, with a .env file in your Node project.</p>

<hr/>
<p style={{fontWeight:'bold', color:'black'}}>Build and run your project.</p>


<p style={{fontWeight:'bold', color:'black'}}>All the API traffic to your application will be sent to APISec for security analysis. 
  The results can be seen in the APISec dashboard.</p>
                            

                        </TabPanel>   
                        {/* END - Node JS Instructions  */}        


                        {/* Python Instructions  */}
                        <TabPanel style={{ padding: 30, backgroundColor: 'white', borderRadius: 5 }}>  


                       <p style={{color:'black'}}> Install the APISec agent into your Python based project:-</p>


<pre style={{color:'black'}}>pip install apisecurityengine-agent==1.0.0</pre>


<p style={{color:'black'}}>Add an environmental variable called APISec with the value as the Integration API 
  Key of your project created in the APISec Dashboard.</p>

<hr/>

<h6 style={{color:'black'}}>Accessing Environment Variables in Django:</h6>


<p style={{color:'black'}}>Install python-dotenv by running: </p>

<pre style={{color:'black'}}>pip install python-dotenv.</pre>

<p style={{color:'black'}}>Create a file named .env in your project directory and add your environment variables in the format: APISEC_API_KEY=value.</p>


<p style={{color:'black'}}>In your Django settings file (e.g., settings.py), add the following code at the top to load environment variables from the .env file:</p>

<pre>
from dotenv import load_dotenv<br/>
load_dotenv()
</pre>

<p style={{color:'black'}}>You can then access the environment variables in your Django settings file or other Python files using os.environ.get('APISEC_API_KEY').</p>


<hr/>

<h6 style={{color:'black'}}>Accessing Environment Variables in Flask:</h6>

<p style={{color:'black'}}>Flask has built-in support for environment variables using the os module.</p>

<p style={{color:'black'}}>In your Flask application, you can access environment variables using os.environ.get('APISEC_API_KEY').</p>

<p style={{color:'black'}}>You can also use the python-dotenv package in Flask to load environment variables from a .env file similar to Django.</p>

<hr/>


<p style={{fontWeight:'bold', color:'black'}}>Build and run your project.</p>


<p style={{fontWeight:'bold', color:'black'}}>All the API traffic to your application will be sent to APISec for security analysis. 
  The results can be seen in the APISec dashboard.</p>
                            

                        </TabPanel>   
                        {/* END - Python Instructions  */}     



                        {/* PHP Instructions  */}
                        <TabPanel style={{ padding: 30, backgroundColor: 'white', borderRadius: 5 }}>      



                      <p style={{color:'black'}}> Install the composer package apisec-agent</p> 

<pre style={{color:'black'}}>composer require cyberultron/apisecurityengine-agent:dev-main</pre>



<p style={{color:'black'}}>Add an environmental variable called APISEC_API_KEY with the value as 
  the Integration API Key of your project created in the APISec Dashboard.</p>



<h6 style={{color:'black'}}>Accessing Environment Variables in Laravel:</h6>

<p style={{color:'black'}}>Laravel uses the Dotenv library to load environment variables from a .env file in the project root directory.
By default, Laravel comes with a .env.example file that you can rename to .env and populate with your environment variables.
You can access environment variables in Laravel using the env() helper function or the $_ENV superglobal variable. For example:
</p>

<pre style={{color:'black'}}>
$apiKey = env('API_KEY');<br/>
// or<br/>
$apiKey = $_ENV['API_KEY'];
</pre>


<h6 style={{color:'black'}}>Accessing Environment Variables in Symfony:</h6>

<p style={{color:'black'}}>In Symfony, you can use the Dotenv component to load environment variables from a .env file in the project root directory.
Symfony also provides the getenv() function and the $_ENV and $_SERVER superglobal variables to access environment variables. For example:</p>

<pre style={{color:'black'}}>
$apiKey = getenv('API_KEY');<br/>
// or<br/>
$apiKey = $_ENV['API_KEY'];
</pre>



<h6 style={{color:'black'}}>Accessing Environment Variables in CodeIgniter:</h6>

<p style={{color:'black'}}>CodeIgniter provides a global $_SERVER array that contains environment variables.</p>

<p style={{color:'black'}}>You can access environment variables in CodeIgniter using $_SERVER['VARIABLE_NAME'].
It's recommended to define a constant or configuration variable in CodeIgniter's configuration file 
(config.php) that corresponds to your environment variable. For example:</p>


<pre style={{color:'black'}}>
// In config.php<br/>
$config['api_key'] = $_SERVER['API_KEY'];
</pre>


<p style={{color:'black'}}>You can then use the $config['api_key'] variable throughout your CodeIgniter application.</p>

<hr/>


<p style={{fontWeight:'bold', color:'black'}}>Build and run your project.</p>


<p style={{fontWeight:'bold', color:'black'}}>All the API traffic to your application will be sent to APISec for security analysis. 
  The results can be seen in the APISec dashboard.</p>
                            

                        </TabPanel>   
                        {/* END -PHP Instructions  */}    


                        {/* Java Instructions  */}
                        <TabPanel style={{ padding: 30, backgroundColor: 'white', borderRadius: 5 }}>


<p style={{color:'black'}}>Create a Java file with the below code:-</p>

<CodeBlock
      text={javaCode}
      language="java"
      showLineNumbers={true}
      theme="dracula"
      wrapLines={true}
    />


<p style={{marginTop:20, color:'black'}}>The placement of the code will depend on the specific Java framework you are using for your web project. Here are some common locations where you can put the code: </p>

<h5 style={{color:'black'}}>Servlet-based frameworks (e.g., Java Servlet, Apache Tomcat):</h5>

<ul>
<li style={{color:'black'}}>Create a new Java class with the provided code (e.g., APITrafficFilter.java).</li>

<li style={{color:'black'}}>Place the Java class in the appropriate package within your project's source folder (e.g., src/main/java/com/example/filters).</li>

<li style={{color:'black'}}>Register the filter in the web project's deployment descriptor (web.xml) by adding the filter definition and filter-mapping sections.</li>

</ul>

<p style={{color:'black'}}>Alternatively, you can use annotations to register the filter directly on the servlet or controller class that handles API requests.
Spring Framework (e.g., Spring MVC):</p>


<ul>
<li style={{color:'black'}}>Create a new Java class with the provided code (e.g., APITrafficFilter.java).</li>

<li style={{color:'black'}}>Place the Java class in the appropriate package within your project's source folder (e.g., src/main/java/com/example/filters).</li>

<li style={{color:'black'}}>Annotate the filter class with @Component to make it a Spring bean.</li>

<li style={{color:'black'}}>Use the @WebFilter annotation (provided by Servlet API) or @Order annotation (provided by Spring) 
to register the filter with the desired URL patterns or specific endpoints.</li>

<li style={{color:'black'}}>Make sure you have the necessary dependencies and configuration for Spring MVC in your project.</li>
</ul>

<hr/>

<h5 style={{color:'black'}}>JAX-RS (Java API for RESTful Web Services):</h5>


<ul>

<li style={{color:'black'}}>Create a new Java class with the provided code (e.g., APITrafficFilter.java).</li>

<li style={{color:'black'}}>Place the Java class in the appropriate package within your project's source folder (e.g., src/main/java/com/example/filters).</li>

<li style={{color:'black'}}>Annotate the filter class with @Provider to make it a provider class for JAX-RS.</li>

<li style={{color:'black'}}>Register the filter class in your JAX-RS application or configuration class using register(APITrafficFilter.class).</li>


</ul>

<hr/>

<p style={{fontWeight:'bold', color:'black'}}>Build and run your project.</p>

<p style={{fontWeight:'bold', color:'black'}}>All the API traffic to your application will be sent to APISec for security analysis.
   The results can be seen in the APISec dashboard.</p>

                            

                        </TabPanel>   
                        {/* END - Java Instructions  */}       



                        {/* .NET Instructions  */}
                        <TabPanel style={{ padding: 30, backgroundColor: 'white', borderRadius: 5 }}>  

                        <p style={{fontWeight:'bold', color:'black'}}>Our agents are available as a NuGet package for C# and ASP based .NET projects</p>


                        <p style={{fontWeight:'bold', color:'black'}}>How to use the NuGet Package in a C# Project:</p>

                        <p style={{fontWeight:'bold', color:'black'}}></p>Install the NuGet Package:

                        <p style={{fontWeight:'normal', color:'black'}}></p>In the project directory, you can use the dotnet add package command to install your NuGet package:


                        <pre style={{color:'black'}}>
                             dotnet add package APISecAgent
                        </pre>


                        <p style={{fontWeight:'bold', color:'black'}}>Use the Middleware:</p>

                        <p style={{fontWeight:'normal', color:'black'}}>In your code, you can import and use your middleware as needed:</p>

                       

                        <SyntaxHighlighter language="csharp" style={dark}>
                                {dotNetCode1}
                        </SyntaxHighlighter>

                        <p style={{fontWeight:'bold', color:'black'}}>Install the NuGet Package:</p>
                        <p style={{fontWeight:'normal', color:'black'}}>In the project directory, you can use the dotnet add package 
                        command to install your NuGet package:</p>

                        <pre style={{color:'black'}}>
                                dotnet add package APISecAgent
                        </pre>


                        <p style={{fontWeight:'bold', color:'black'}}>Configure and Use the Middleware:</p>
                        <p style={{fontWeight:'normal', color:'black'}}>In the Startup.cs file of their project,
                         you can configure and use your middleware:</p>                       
                            

                        <SyntaxHighlighter language="csharp" style={dark}>
                            {dotNetCode2}
                        </SyntaxHighlighter>

                        </TabPanel>   
                        {/* END - .NET Instructions  */}  


                        {/* GoLang Instructions  */}
                        <TabPanel style={{ padding: 30, backgroundColor: 'white', borderRadius: 5 }}>  

                        <p style={{fontWeight:'bold', color:'black'}}>Install the middleware on your project</p>
            
                        <pre style={{color:'black'}}>
                                 go get github.com/yourusername/mymiddleware/middleware
                        </pre>    

                        <p style={{fontWeight:'bold', color:'black'}}>Import and use your middleware by specifying its module path in your code</p>


                        <CodeBlock
                            text={goCode}
                            language="go"
                            showLineNumbers={true}
                            theme="dracula"
                            wrapLines={true}
                        />



                        <p style={{fontWeight:'bold', color:'black'}}>Setup the environmental variable</p>
                        <p style={{fontWeight:'normal', color:'black'}}>Install the godotenv Library</p>


                        <pre style={{color:'black'}}>
                                go get github.com/joho/godotenv
                        </pre>  
                            

                        <p style={{fontWeight:'bold', color:'black'}}>Create a .env File:</p>

                        <p style={{fontWeight:'normal', color:'black'}}>Create a file named .env in the root of your project.
                         This is where you'll store your environment variables. For example:</p>


                         <pre style={{color:'black'}}>
                            APISEC_API_KEY=your_actual_api_key_here
                         </pre>   


                        <p style={{fontWeight:'bold', color:'black'}}>Load the .env File:</p>

                        <p style={{fontWeight:'normal', color:'black'}}>In your application code, use the godotenv library to load the environment variables from the .env file. 
                         You typically do this early in your application, before accessing any environment variables.</p>

                         <CodeBlock
                            text={goCode1}
                            language="go"
                            showLineNumbers={true}
                            theme="dracula"
                            wrapLines={true}
                        />


                        </TabPanel>   
                        {/* END - GoLang Instructions  */}              

                      

                    </Tabs>

                </div>

            </div>
        </div>
    )
}

export default Integrations



