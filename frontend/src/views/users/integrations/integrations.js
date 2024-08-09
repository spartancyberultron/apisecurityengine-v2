import React, { useState, useEffect, useRef } from "react";
import { CFormInput, CButton, CFormSelect, CTable, CToast, CToastBody, CToaster } from '@coreui/react'
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


const Integrations = () => {

    const [toast, addToast] = useState(0)
    const navigate = useNavigate()

    const [candidates, setCandidates] = useState([])
    const [onLoading, setOnLoading] = useState(false);
    const [currentlySelectedJob, setCurrentlySelectedJob] = useState(null)

    const toaster = useRef()
    const exampleToast = (
        <CToast>
            <CToastBody>Success</CToastBody>
        </CToast>
    )


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

                               Burpsuite Extension
                            </Tab>

                            <Tab style={{ width: 150, borderWidth: 0, textAlign:'center' }}>

                               Jenkins Job
                            </Tab>

                            <Tab style={{ width: 150, borderWidth: 0, textAlign:'center' }}>

                                <img src={nodeJSLogo} style={{ height: 80, width: 80, objectFit: 'contain', display:'none' }} alt="Node.js" />
                                Node JS
                            </Tab>

                            <Tab style={{ width: 150, borderWidth: 0, textAlign:'center' }}>
                                <img src={pythonLogo} style={{ height: 80, width: 80, objectFit: 'contain',display:'none' }} alt="Python" />
                                Python
                            </Tab>

                            <Tab style={{ width: 150, borderWidth: 0 ,textAlign:'center'}}>
                                <img src={phpLogo} style={{ height: 80, width: 80, objectFit: 'contain',display:'none' }} alt="PHP" />
                                PHP
                            </Tab>

                            <Tab style={{ width: 150, borderWidth: 0 ,textAlign:'center'}}>
                                <img src={javaLogo} style={{ height: 80, width: 80, objectFit: 'contain',display:'none' }} alt="Java" />
                                Java
                            </Tab>

                            <Tab style={{ width: 150, borderWidth: 0, textAlign:'center' }}>
                                <img src={dotnetLogo} style={{ height: 80, width: 80, objectFit: 'contain',display:'none' }} alt=".NET" />
                                .NET
                            </Tab>

                            <Tab style={{ width: 150, borderWidth: 0,textAlign:'center' }}>
                                <img src={golangLogo} style={{ height: 80, width: 80, objectFit: 'contain',display:'none' }} alt="Go" />
                                Go
                            </Tab>
                        </TabList>


{/* CLI Agent  */}
<TabPanel style={{ padding: 30, backgroundColor: 'white', borderRadius: 5 }}>  


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
            After installing the Extension, locate it in the list of installed extensions. Click on the Extension to open its configuration settings.
          </p>
          <p>
            Set the following variables in the Extension settings:
          </p>
          <ul>
            <li><strong>API_KEY</strong>: Your unique API key for the analysis service. Replace with your actual key.</li>
            <li><strong>HOST</strong>: The hostname or IP address of the server where traffic is being captured from. Use <code>localhost</code> if the traffic is local.</li>
            <li><strong>PORT</strong>: The port number on the host where traffic is being captured. Enter the specific port number (e.g., <code>5002</code>).</li>
          </ul>
        </li>
        <li>
          <strong>Start Traffic Analysis:</strong>
          <p>
            With the extension installed and configured, start capturing traffic in Burp Suite. The extension will send captured traffic to the analysis service using the provided API key and settings.
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
        Follow these steps to create a Jenkins job that sends a link to a raw JSON file (such as a Postman collection file) to an API and displays the response:
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
            Set up your source code repository in the "Source Code Management" section.
          </p>
        </li>

        <li>
          <strong>Add Build Step:</strong>
          <p>
            In the "Build" section, add an "Execute shell" build step with the following script:
          </p>
          <pre style={{ backgroundColor: '#eaeaea', padding: 10, borderRadius: 5, overflowX: 'auto' }}>
{`#!/bin/bash

# Define the URL to the raw JSON file (Postman collection file)
json_url="https://example.com/path/to/your/postman-collection.json"

# Download the JSON file
curl -o postman_collection.json $json_url

# Send the JSON file to the API and capture the response
response=$(curl -X POST \\
  https://appnew-backend.apisecurityengine.com/api/v1/mirroredScans/sendCollectionURLToScan \\
  -H 'Content-Type: application/json' \\
  -d "{
  \\"api_key\\": \\"YOUR_API_KEY\\",
  \\"the_request\\": \\"$(base64 -w 0 postman_collection.json)\\"
}")

# Save response to file
echo "$response" > api_response.json

# Clean up JSON file
rm postman_collection.json

# Create HTML file
cat << EOT > api_response.html
<!DOCTYPE html>
<html>
<head>
    <title>API Response</title>
    <style>
        body { font-family: Arial, sans-serif; }
        pre { background-color: #f4f4f4; padding: 10px; border-radius: 5px; }
    </style>
</head>
<body>
    <h1>API Response</h1>
    <pre id="json"></pre>
    <script>
        var json = \$(cat api_response.json);
        document.getElementById('json').textContent = JSON.stringify(JSON.parse(json), null, 2);
    </script>
</body>
</html>
EOT`}
          </pre>
        </li>

        <li>
          <strong>Install HTML Publisher Plugin:</strong>
          <p>
            If not already installed, go to "Manage Jenkins" &gt; "Manage Plugins" and install the HTML Publisher plugin.
          </p>
        </li>

        <li>
          <strong>Add Post-build Action:</strong>
          <p>
            In the "Post-build Actions" section, add "Publish HTML reports" and configure it:
          </p>
          <ul>
            <li>HTML directory to archive: <code>.</code></li>
            <li>Index page[s]: <code>api_response.html</code></li>
            <li>Report title: "API Response"</li>
          </ul>
        </li>
      </ol>

      <p style={{ fontSize: 16, color: '#555' }}>
        After configuring the job, run it to download the JSON file, send it to the API, and view the response in the published HTML report.
      </p>
    </TabPanel>



                        {/* Node JS Instructions  */}
                        <TabPanel style={{ padding: 30, backgroundColor: 'white', borderRadius: 5 }}>  



                        <p style={{color:'black'}}>Install the APISec agent into your Node JS based project:-</p>


    <pre style={{color:'black'}}>npm i apisec-agent</pre>

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


<pre style={{color:'black'}}>pip install apisec-agent</pre>


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

<pre style={{color:'black'}}>composer install apisec-agent</pre>



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



