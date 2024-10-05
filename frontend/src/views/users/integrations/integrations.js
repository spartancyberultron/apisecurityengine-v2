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
  

    const javaCode1 = `package com.example.demo.interceptor;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.util.ContentCachingRequestWrapper;
import org.springframework.web.util.ContentCachingResponseWrapper;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

public class ApiLoggingInterceptor implements HandlerInterceptor {

    private static final String API_KEY = "G8N974XM45STJ6AIGC0A";
    private static final String API_ENDPOINT = "https://backend-new.apisecurityengine.com/api/v1/mirroredScans/sendRequestInfo";

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    public ApiLoggingInterceptor(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
        this.objectMapper = new ObjectMapper();
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        String requestId = UUID.randomUUID().toString();
        request.setAttribute("requestId", requestId);
        response.setHeader("X-Request-ID", requestId);

        ContentCachingRequestWrapper wrappedRequest = new ContentCachingRequestWrapper(request);
        ContentCachingResponseWrapper wrappedResponse = new ContentCachingResponseWrapper(response);

        request.setAttribute("wrappedRequest", wrappedRequest);
        request.setAttribute("wrappedResponse", wrappedResponse);

        return true;
    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) throws Exception {
        ContentCachingRequestWrapper wrappedRequest = (ContentCachingRequestWrapper) request.getAttribute("wrappedRequest");
        ContentCachingResponseWrapper wrappedResponse = (ContentCachingResponseWrapper) request.getAttribute("wrappedResponse");

        if (wrappedRequest != null && wrappedResponse != null) {
            String requestBody = new String(wrappedRequest.getContentAsByteArray());
            String responseBody = new String(wrappedResponse.getContentAsByteArray());

            ApiRequestInfo requestInfo = new ApiRequestInfo();
            requestInfo.setRequestId((String) request.getAttribute("requestId"));
            requestInfo.setMethod(request.getMethod());
            requestInfo.setUrl(request.getRequestURL().toString());
            requestInfo.setQueryString(request.getQueryString());
            requestInfo.setHeaders(getHeadersInfo(request));
            requestInfo.setBody(requestBody);

            ApiResponseInfo responseInfo = new ApiResponseInfo();
            responseInfo.setRequestId((String) request.getAttribute("requestId"));
            responseInfo.setStatusCode(response.getStatus());
            responseInfo.setHeaders(getHeadersInfo(response));
            responseInfo.setBody(responseBody);

            sendApiInfo(requestInfo, responseInfo);

            wrappedResponse.copyBodyToResponse();
        }
    }

    private void sendApiInfo(ApiRequestInfo requestInfo, ApiResponseInfo responseInfo) {
        try {
            Map<String, Object> payload = new HashMap<>();
            payload.put("api_key", API_KEY);
            payload.put("the_request", requestInfo);
            payload.put("the_response", responseInfo);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(payload, headers);

            restTemplate.postForObject(API_ENDPOINT, entity, String.class);
            System.out.println("API information sent successfully.");
        } catch (Exception e) {
            System.err.println("Error sending API information: " + e.getMessage());
        }
    }

    private Map<String, String> getHeadersInfo(HttpServletRequest request) {
        Map<String, String> map = new HashMap<>();
        Collections.list(request.getHeaderNames()).forEach(headerName ->
            map.put(headerName, request.getHeader(headerName))
        );
        return map;
    }

    private Map<String, String> getHeadersInfo(HttpServletResponse response) {
        Map<String, String> map = new HashMap<>();
        response.getHeaderNames().forEach(headerName ->
            map.put(headerName, response.getHeader(headerName))
        );
        return map;
    }

    private static class ApiRequestInfo {
        private String requestId;
        private String method;
        private String url;
        private String queryString;
        private Map<String, String> headers;
        private String body;

        // Getters and setters
        public String getRequestId() { return requestId; }
        public void setRequestId(String requestId) { this.requestId = requestId; }
        public String getMethod() { return method; }
        public void setMethod(String method) { this.method = method; }
        public String getUrl() { return url; }
        public void setUrl(String url) { this.url = url; }
        public String getQueryString() { return queryString; }
        public void setQueryString(String queryString) { this.queryString = queryString; }
        public Map<String, String> getHeaders() { return headers; }
        public void setHeaders(Map<String, String> headers) { this.headers = headers; }
        public String getBody() { return body; }
        public void setBody(String body) { this.body = body; }
    }

    private static class ApiResponseInfo {
        private String requestId;
        private int statusCode;
        private Map<String, String> headers;
        private String body;

        // Getters and setters
        public String getRequestId() { return requestId; }
        public void setRequestId(String requestId) { this.requestId = requestId; }
        public int getStatusCode() { return statusCode; }
        public void setStatusCode(int statusCode) { this.statusCode = statusCode; }
        public Map<String, String> getHeaders() { return headers; }
        public void setHeaders(Map<String, String> headers) { this.headers = headers; }
        public String getBody() { return body; }
        public void setBody(String body) { this.body = body; }
    }
}`;


    const javaCode2 = `package com.example.demo.config;

import com.example.demo.interceptor.ApiLoggingInterceptor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(new ApiLoggingInterceptor(restTemplate()));
    }
}`;



    const goCode1 = `module api-logger-demo

go 1.15

require github.com/gin-gonic/gin v1.6.3
    
    `

    const goCode2 = `package main

import (
	"github.com/gin-gonic/gin"
	"log"
)

func main() {
	r := gin.Default()

	// Initialize our custom middleware - Replace YNVHS32H0997O4FSMLFC with your project integration key
	logger := NewAPILogger("YNVHS32H0997O4FSMLFC", "https://backend-new.apisecurityengine.com/api/v1/mirroredScans/sendRequestInfo")
	r.Use(logger.LogAPI())

	// Define routes
	r.POST("/api/auth/signup", signup)
	r.POST("/api/auth/login", login)

	// Run the server
	if err := r.Run(":8080"); err != nil {
		log.Fatal("Failed to run server: ", err)
	}
}

func signup(c *gin.Context) {
	c.JSON(200, gin.H{
		"message": "User registered successfully",
	})
}

func login(c *gin.Context) {
	c.JSON(200, gin.H{
		"message": "Login successful",
	})
}`

    const goCode3 = `package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"github.com/gin-gonic/gin"
	"io/ioutil"
	"log"
	"net/http"
	"time"
)

type APILogger struct {
	APIKey      string
	APIEndpoint string
}

type RequestInfo struct {
	RequestID   string            \`json:"requestId"\`
	Method      string            \`json:"method"\`
	URL         string            \`json:"url"\`
	Headers     map[string]string \`json:"headers"\`
	Body        string            \`json:"body"\`
	QueryString string            \`json:"queryString"\`
}

type ResponseInfo struct {
	RequestID  string            \`json:"requestId"\`
	StatusCode int               \`json:"statusCode"\`
	Headers    map[string]string \`json:"headers"\`
	Body       string            \`json:"body"\`
}

func NewAPILogger(apiKey, apiEndpoint string) *APILogger {
	return &APILogger{
		APIKey:      apiKey,
		APIEndpoint: apiEndpoint,
	}
}

func (l *APILogger) LogAPI() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Generate request ID
		requestID := c.GetString("X-Request-ID")
		if requestID == "" {
			requestID = c.Request.Header.Get("X-Request-ID")
		}
		if requestID == "" {
			requestID = generateRequestID()
		}
		c.Set("X-Request-ID", requestID)
		c.Header("X-Request-ID", requestID)

		// Read the request body
		var bodyBytes []byte
		if c.Request.Body != nil {
			bodyBytes, _ = ioutil.ReadAll(c.Request.Body)
		}
		// Restore the request body
		c.Request.Body = ioutil.NopCloser(bytes.NewBuffer(bodyBytes))

		// Construct full URL
		scheme := "http"
		if c.Request.TLS != nil {
			scheme = "https"
		}
		host := c.Request.Host
		if host == "" {
			host = "localhost:8080" // Default host:port if not provided
		}
		fullURL := fmt.Sprintf("%s://%s%s", scheme, host, c.Request.URL.String())

		// Capture request info
		requestInfo := RequestInfo{
			RequestID:   requestID,
			Method:      c.Request.Method,
			URL:         fullURL,
			Headers:     getHeaders(c.Request.Header),
			Body:        string(bodyBytes),
			QueryString: c.Request.URL.RawQuery,
		}

		// Create a response writer wrapper
		wrappedWriter := &responseWriterWrapper{body: bytes.NewBufferString(""), ResponseWriter: c.Writer}
		c.Writer = wrappedWriter

		// Process request
		c.Next()

		// Capture response info
		responseInfo := ResponseInfo{
			RequestID:  requestID,
			StatusCode: wrappedWriter.Status(),
			Headers:    getHeaders(wrappedWriter.Header()),
			Body:       wrappedWriter.body.String(),
		}

		// Send API info
		go l.sendAPIInfo(requestInfo, responseInfo)
	}
}

func (l *APILogger) sendAPIInfo(requestInfo RequestInfo, responseInfo ResponseInfo) {
	payload := map[string]interface{}{
		"api_key":      l.APIKey,
		"the_request":  requestInfo,
		"the_response": responseInfo,
	}

	jsonPayload, err := json.Marshal(payload)
	if err != nil {
		log.Printf("Error marshaling payload: %v", err)
		return
	}

	resp, err := http.Post(l.APIEndpoint, "application/json", bytes.NewBuffer(jsonPayload))
	if err != nil {
		log.Printf("Error sending API information: %v", err)
		return
	}
	defer resp.Body.Close()

	log.Println("API information sent successfully")
}

func getHeaders(header http.Header) map[string]string {
	headers := make(map[string]string)
	for name, values := range header {
		for _, value := range values {
			headers[name] = value
		}
	}
	return headers
}

func generateRequestID() string {
	return time.Now().Format("20060102150405.000000")
}

type responseWriterWrapper struct {
	gin.ResponseWriter
	body *bytes.Buffer
}

func (w *responseWriterWrapper) Write(b []byte) (int, error) {
	w.body.Write(b)
	return w.ResponseWriter.Write(b)
}

func (w *responseWriterWrapper) WriteString(s string) (int, error) {
	w.body.WriteString(s)
	return w.ResponseWriter.WriteString(s)
}`



    const dotNetCode1 = `{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "AllowedHosts": "*",
  "ApiLogger": {
    "ApiKey": "B0J3TATSK5MS7NJET03L",
    "ApiEndpoint": "https://backend-new.apisecurityengine.com/api/v1/mirroredScans/sendRequestInfo"
  }
}
`


     const dotNetCode2 = `using System.Text;
using Newtonsoft.Json;

namespace ApiLoggerDemo.Middleware
{
    public class ApiLoggingMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly IHttpClientFactory _clientFactory;
        private readonly string _apiKey;
        private readonly string _apiEndpoint;

        public ApiLoggingMiddleware(RequestDelegate next, IHttpClientFactory clientFactory, IConfiguration configuration)
        {
            _next = next;
            _clientFactory = clientFactory;
            _apiKey = configuration["ApiLogger:ApiKey"];
            _apiEndpoint = configuration["ApiLogger:ApiEndpoint"];
        }

        public async Task InvokeAsync(HttpContext context)
        {
            var requestId = Guid.NewGuid().ToString();
            context.Response.Headers["X-Request-ID"] = requestId;

            var requestInfo = await GetRequestInfo(context.Request, requestId);
            var originalBodyStream = context.Response.Body;

            using (var responseBody = new MemoryStream())
            {
                context.Response.Body = responseBody;

                await _next(context);

                var responseInfo = await GetResponseInfo(context.Response, requestId);
                await SendApiInfo(requestInfo, responseInfo);

                await responseBody.CopyToAsync(originalBodyStream);
            }
        }

        private async Task<RequestInfo> GetRequestInfo(HttpRequest request, string requestId)
        {
            request.EnableBuffering();

            var requestBody = await new StreamReader(request.Body).ReadToEndAsync();
            request.Body.Position = 0;

            return new RequestInfo
            {
                requestId = requestId,
                method = request.Method,
                url = $"{request.Scheme}://{request.Host}{request.Path}{request.QueryString}",
                headers = request.Headers.ToDictionary(h => h.Key, h => h.Value.ToString()),
                body = requestBody,
                QueryString = request.QueryString.ToString()
            };
        }

        private async Task<ResponseInfo> GetResponseInfo(HttpResponse response, string requestId)
        {
            response.Body.Seek(0, SeekOrigin.Begin);
            var responseBody = await new StreamReader(response.Body).ReadToEndAsync();
            response.Body.Seek(0, SeekOrigin.Begin);

            return new ResponseInfo
            {
                RequestId = requestId,
                StatusCode = response.StatusCode,
                Headers = response.Headers.ToDictionary(h => h.Key, h => h.Value.ToString()),
                Body = responseBody
            };
        }

        private async Task SendApiInfo(RequestInfo requestInfo, ResponseInfo responseInfo)
        {
            var payload = new
            {
                api_key = _apiKey,
                the_request = requestInfo,
                the_response = responseInfo
            };

            var json = JsonConvert.SerializeObject(payload);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            var client = _clientFactory.CreateClient();
            await client.PostAsync(_apiEndpoint, content);
        }
    }

    public class RequestInfo
    {
        public string requestId { get; set; }
        public string method { get; set; }
        public string url { get; set; }
        public Dictionary<string, string> headers { get; set; }
        public string body { get; set; }
        public string QueryString { get; set; }
    }

    public class ResponseInfo
    {
        public string RequestId { get; set; }
        public int StatusCode { get; set; }
        public Dictionary<string, string> Headers { get; set; }
        public string Body { get; set; }
    }
}`


     const dotNetCode3 = `using ApiLoggerDemo.Middleware;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddHttpClient();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
}

app.UseHttpsRedirection();
app.UseAuthorization();

// Use our custom API logging middleware
app.UseMiddleware<ApiLoggingMiddleware>();

app.MapControllers();

app.Run();
`


const nodeCode1 = `const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

const apiLoggingMiddleware = (config) => {
  const { apiKey, apiEndpoint } = config;

  return async (req, res, next) => {
    const requestId = uuidv4();
    res.setHeader('X-Request-ID', requestId);

    const requestInfo = getRequestInfo(req, requestId);

    // Capture the original response methods
    const originalJson = res.json;
    const originalEnd = res.end;
    const originalWrite = res.write;

    let responseBody = '';

    // Override response methods to capture the response body
    res.json = function (body) {
      responseBody = JSON.stringify(body);
      originalJson.apply(this, arguments);
    };

    res.write = function (chunk) {
      responseBody += chunk;
      originalWrite.apply(this, arguments);
    };

    res.end = function (chunk) {
      if (chunk) responseBody += chunk;
      
      const responseInfo = getResponseInfo(res, requestId, responseBody);
      
      sendApiInfo(requestInfo, responseInfo, apiKey, apiEndpoint)
        .catch(error => console.error('Error sending API info:', error));

      originalEnd.apply(this, arguments);
    };

    next();
  };
};

const getRequestInfo = (req, requestId) => ({
  request_id: requestId,
  method: req.method,
  url: \`\${req.protocol}://\${req.get('host')}\${req.originalUrl}\`,
  headers: req.headers,
  body: req.body,
  query_string: req.url.split('?')[1] || ''
});

const getResponseInfo = (res, requestId, body) => ({
  request_id: requestId,
  status_code: res.statusCode,
  headers: res.getHeaders(),
  body: body
});

const sendApiInfo = async (requestInfo, responseInfo, apiKey, apiEndpoint) => {
  const payload = {
    api_key: apiKey,
    the_request: requestInfo,
    the_response: responseInfo
  };

  try {
    await axios.post(apiEndpoint, payload, {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error sending API info:', error.message);
  }
};

module.exports = apiLoggingMiddleware;
`;




const nodeCode2 = `const express = require('express');
const dotenv = require('dotenv');
const colors = require('colors');
const cors = require('cors');
const { connectDB } = require('./config/db');
const adminRoutesV1 = require("./routes/v1/admin.route")
const userRoutesV1 = require("./routes/v1/user.route")
const rateLimit = require('express-rate-limit');
const fs = require("fs")
const path = require("path")
const { exec } = require("child_process")
const limiter = rateLimit({
	windowMs: 30 * 1000, // 30 seconds
	max: 10000, // Limit each IP to 100 requests per \`window\` (here, per 30 seconds)
	standardHeaders: true, // Return rate limit info in the \`RateLimit-*\` headers
	legacyHeaders: false, // Disable the \`X-RateLimit-*\` headers
})
const folderPath = path.join(__dirname, "uploads")
fs.chmod(folderPath, 0o700, (err) => {
	if (err) {
		console.error(err);
		return;
	}
})

const { notFoundError, errorHandler } = require('./middlewares/errorHandlerMiddleware');
const app = express();


const apiSecMiddleware = require('./apiSecMiddleware');



// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

dotenv.config();

connectDB();

app.use(express.json());

app.use(apiSecMiddleware({
	apiKey: 'QCPUTU4AKBLJC2GVPU2C',
	apiEndpoint: 'https://backend-new.apisecurityengine.com/api/v1/mirroredScans/sendRequestInfo'
  }));

app.use(limiter)

app.use(cors());
app.options('*', cors());

app.get('/', (req, res) => {
	res.send('CareerLink API server is running....');
});

app.use('/api/v1/admin/', adminRoutesV1);
app.use('/api/v1/users/', userRoutesV1);


app.use(notFoundError);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, console.log(\`Server running in \${process.env.NODE_ENV} mode on Port \${PORT}\`.green.bold));
`;


const pythonCode1 = `import uuid
import requests
from werkzeug.wrappers import Request, Response

class ApiLoggingMiddleware:
    def __init__(self, app, api_key, api_endpoint):
        self.app = app
        self.api_key = api_key
        self.api_endpoint = api_endpoint

    def __call__(self, environ, start_response):
        request_id = str(uuid.uuid4())
        request = Request(environ)
        request_info = self.get_request_info(request, request_id)

        response_info = {}

        def new_start_response(status, headers, exc_info=None):
            response_info['status'] = status
            response_info['headers'] = headers
            return start_response(status, headers, exc_info)

        response = self.app(environ, new_start_response)

        if isinstance(response, Response):
            response_body = response.get_data()
            response_info['body'] = response_body.decode('utf-8')
        else:
            response_body = b''.join(response)
            response_info['body'] = response_body.decode('utf-8')

        self.send_api_info(request_info, response_info)

        if isinstance(response, Response):
            return response(environ, start_response)
        else:
            return [response_body]

    def get_request_info(self, request, request_id):
        return {
            'request_id': request_id,
            'method': request.method,
            'url': request.url,
            'headers': dict(request.headers),
            'body': request.get_data(as_text=True),
            'query_string': request.query_string.decode('utf-8')
        }

    def send_api_info(self, request_info, response_info):
        payload = {
            'api_key': self.api_key,
            'the_request': request_info,
            'the_response': response_info
        }
        try:
            requests.post(self.api_endpoint, json=payload)
        except requests.RequestException as e:
            print(f"Error sending API info: {e}")`;

const pythonCode2 = `from flask import Flask
from path.to.middleware.api_logging_middleware import ApiLoggingMiddleware

app = Flask(__name__)

# Apply middleware
app.wsgi_app = ApiLoggingMiddleware(app.wsgi_app, 
                                    api_key='your-api-key', 
                                    api_endpoint='https://backend-new.apisecurityengine.com/api/v1/mirroredScans/sendRequestInfo')

# Your existing routes and other configurations...

if __name__ == '__main__':
    app.run(debug=True)`;


const pythonCode3 = `import os

app.wsgi_app = ApiLoggingMiddleware(app.wsgi_app, 
                                    api_key=os.environ.get('APISEC_API_KEY'),
                                    api_endpoint=os.environ.get('APISEC_ENDPOINT'))`;



const pythonCode4 = `export APISEC_API_KEY='your-api-key'
export APISEC_ENDPOINT='https://backend-new.apisecurityengine.com/api/v1/mirroredScans/sendRequestInfo'`;


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

                        <p style={{color:'black'}}>Make sure the packages axios and uuid are installed in your project.
                        </p>


                        <p style={{color:'black'}}>Add a middleware to capture API traffic and send to APISecurityEngine service. Create a file 
                          named apiSecMiddleware.js in your project root folder where your app.js or server.js file exists.
                        </p>


                        <CodeBlock
      text={nodeCode1}
      language="javascript"
      showLineNumbers={true}
      theme="dracula"
      wrapLines={true}
    />


                        
                        <p style={{color:'black'}}>Register this middleware in your app.js or server.js, as shown below. Notice lines 30 and 43-46.
                          Make sure your are using your own API key.
                        </p>
                      

                        <CodeBlock
      text={nodeCode2}
      language="javascript"
      showLineNumbers={true}
      theme="dracula"
      wrapLines={true}
    />
                        

                        <p style={{color:'black'}}>Build and run your project. </p>

                        <p style={{color:'black'}}>When you call APIs, they will be sent to APISecurityEngine for scans 
                          and the results can be seen in the APISecurityEngine web portal. </p>




   


                            

                        </TabPanel>   
                        {/* END - Node JS Instructions  */}        


                        {/* Python Instructions  */}
                        <TabPanel style={{ padding: 30, backgroundColor: 'white', borderRadius: 5 }}>  


                       <p style={{color:'black'}}> Ensure you have the necessary projects installed</p>


<pre>
pip install requests
</pre>


<p style={{color:'black'}}>Create a new file named api_logging_middleware.py in your project's middleware directory (create one if it doesn't exist). Add the following code:
</p>



<CodeBlock
      text={pythonCode1}
      language="python"
      showLineNumbers={true}
      theme="dracula"
      wrapLines={true}
    />

    <br/>

<p style={{color:'black'}}>Modify your main Flask application file (often app.py or similar) to include the middleware:
</p>

<CodeBlock
      text={pythonCode2}
      language="python"
      showLineNumbers={true}
      theme="dracula"
      wrapLines={true}
    />
<br/>


<p style={{color:'black'}}>For better security, it's recommended to use environment variables for the API key and endpoint. Update your application to use environment variables:
</p>


<CodeBlock
      text={pythonCode3}
      language="python"
      showLineNumbers={true}
      theme="dracula"
      wrapLines={true}
    />

<br/>

<p style={{color:'black'}}>Then, set these environment variables before running your application:</p>

<CodeBlock
      text={pythonCode4}
      language="python"
      showLineNumbers={true}
      theme="dracula"
      wrapLines={true}
    />

<p style={{color:'black'}}>Build and run your project. </p>

<p style={{color:'black'}}>When you call APIs, they will be sent to APISecurityEngine for scans and the results can be seen in the APISecurityEngine web portal. </p>


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


<p style={{color:'black'}}>This example uses Java SpringBoot</p>

<p style={{color:'black'}}>Parellel to your controllers folder, create a folder named interceptors and add a file ApiLoggingInterceptor.java, with below content.
  Ensure you are using your own API Key.
</p>


<CodeBlock
      text={javaCode1}
      language="java"
      showLineNumbers={true}
      theme="dracula"
      wrapLines={true}
    />

<br/>
<p style={{color:'black'}}>Parellel to your controllers folder, create a config folder. </p>

<p style={{color:'black'}}>Create a WebMvcConfig.java file inside the config folder and add the interceptor there. See below example.. </p>


<CodeBlock
      text={javaCode2}
      language="java"
      showLineNumbers={true}
      theme="dracula"
      wrapLines={true}
    />

    <br/>

    <p style={{color:'black'}}>Build and run your project. </p>

    <p style={{color:'black'}}>When you call APIs, they will be sent to APISecurityEngine for scans and the results can be seen in the APISecurityEngine web portal. </p>








                            

                        </TabPanel>   
                        {/* END - Java Instructions  */}       



                        {/* .NET Instructions  */}
                        <TabPanel style={{ padding: 30, backgroundColor: 'white', borderRadius: 5 }}>  

                        <p style={{fontWeight:'normal', color:'black'}}>This example uses a C# based .NET project</p>

                        <p style={{fontWeight:'normal', color:'black'}}>In your appsettings.json, add the APISecurityEngine API Key and API URL, as shown in 
                          the example below.
                        </p>


                     


<SyntaxHighlighter language="json" style={dracula}>
                                {dotNetCode1}
                        </SyntaxHighlighter>


                        

                        <p style={{fontWeight:'normal', color:'black'}}></p>Add a middleware file in your Middlewares folder. Name it ApiLoggingMiddleware.cs.
                        
                        <SyntaxHighlighter language="csharp" style={dracula}>
                                {dotNetCode2}
                        </SyntaxHighlighter>





                        <p style={{fontWeight:'normal', color:'black'}}></p>
                        In your Program.cs, register the middleware as shown in the below example.
                      

                       
                        
                       

                        <SyntaxHighlighter language="csharp" style={dracula}>
                                {dotNetCode3}
                        </SyntaxHighlighter>

                        

                        <br/>

                        <p style={{color:'black'}}>Build and run your project. </p>

                        <p style={{color:'black'}}>When you call APIs, they will be sent to APISecurityEngine for scans and the results can be seen in the APISecurityEngine web portal. </p>



                        </TabPanel>   
                        {/* END - .NET Instructions  */}  


                        {/* GoLang Instructions  */}
                        <TabPanel style={{ padding: 30, backgroundColor: 'white', borderRadius: 5 }}>  

                        <p style={{fontWeight:'bold', color:'black'}}>In your go.mod, ensure you have included Gin, like in the example below.</p>
            

                         <CodeBlock
                            text={goCode1}
                            language="go"
                            showLineNumbers={true}
                            theme="dracula"
                            wrapLines={true}
                        /> 

                        <p style={{fontWeight:'bold', color:'black'}}>Initialize the middleware in your main.go, as shown in the below example. Notice the lines
                          12 and 13. Ensure you use your own project integration key.
                        </p>


                        <CodeBlock
                            text={goCode2}
                            language="go"
                            showLineNumbers={true}
                            theme="dracula"
                            wrapLines={true}
                        />



                        <p style={{fontWeight:'bold', color:'black'}}>In your project root, create a file api_logger.go with the below content</p>

                        <CodeBlock
                            text={goCode3}
                            language="go"
                            showLineNumbers={true}
                            theme="dracula"
                            wrapLines={true}
                        />

               <br/>         
<p style={{color:'black'}}>Build and run your project. </p>

<p style={{color:'black'}}>When you call APIs, they will be sent to APISecurityEngine for scans and the results can be seen in the APISecurityEngine web portal. </p>


                         



                        </TabPanel>   
                        {/* END - GoLang Instructions  */}              

                      

                    </Tabs>

                </div>

            </div>
        </div>
    )
}

export default Integrations



