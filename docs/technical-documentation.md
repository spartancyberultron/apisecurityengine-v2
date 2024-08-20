# APISecurityEngine Technical Documentation

## Introduction

The application is built on the MERN stack, combining MongoDB, Express.js, React, and Node.js. Its primary function is to analyze API collections, accepting input from popular formats like Postman, OpenAPI, and Swagger. The Node.js backend handles the scanning process, utilizing MongoDB for efficient data storage and Express.js for a robust API. On the frontend, React provides a user-friendly interface for inputting API collections, initiating scans, and viewing results and reports.

The application is capable of producing comprehensive reports in both web-based and PDF formats. Users can easily understand and share the security scan results, which include details such as CVEs, severity levels, vulnerability descriptions, and recommended fixes. The application is designed to be accessible, providing a practical solution for users looking to assess and document security vulnerabilities in their API collections. The simplicity of the MERN stack ensures reliability, scalability, and a smooth user experience throughout the scanning and reporting process.

## Technical Details

### Backend

#### Platform

APISecurityEngine uses Express JS as its backend framework.

Express.js is a minimalist and flexible web application framework for Node.js, designed to simplify the development of robust and scalable web applications and APIs. Serving as a foundation for building server-side applications, Express.js provides a straightforward and unopinionated structure, allowing developers the freedom to choose their preferred libraries and tools. Known for its simplicity and ease of use, Express.js excels in handling routing, middleware, and HTTP requests, making it an ideal choice for developers aiming to quickly build and deploy web applications. With a vast ecosystem of plugins and middleware, Express.js enables developers to extend its functionality as needed, while its lightweight nature ensures efficient performance, making it a popular choice for both beginners and experienced developers alike.

#### Routes

The backend application provides REST API endpoints that are consumed by the frontend.
All the endpoints are defined in route files, which can be found under routes/v1 folder.

#### Models

All the models are created with mongoose and are present in models folder, in form of model files. 
They correspond to their respective collections in the associated MongoDB database.

#### Controllers

Controllers handle the incoming requests on routes. 
All controller files are present in controllers folder. They subsequently invoke services to perform scan and other operations

#### Services

Services are present in services folder. Each service earries out its own task, which may range from performing scan for a certain vulnerability check, to general operations like generating reports and data for visualizations. They also perform required CRUD operations on various collections.

### Frontend

#### Platform

APISecurityEngine uses React JS as its frontend framework.

React.js is a declarative and efficient JavaScript library for building user interfaces. Renowned for its component-based architecture, React simplifies the process of creating interactive and dynamic UIs by breaking down the application into reusable and independent components. React utilizes a virtual DOM, optimizing the rendering process by updating only the necessary components when data changes, resulting in improved performance. With a strong focus on a unidirectional data flow, React ensures predictable state management, making it easier to understand and debug complex applications. Additionally, React embraces a "learn once, write anywhere" philosophy, allowing developers to apply their knowledge to build applications for various platforms, including web, mobile, and virtual reality. Its thriving community, extensive documentation, and compatibility with state management libraries like Redux contribute to React's popularity among developers for building scalable and maintainable user interfaces.

#### Routes

All the frontend routes are defined in App.js and src/routes.js.
They correspond to all pre-auth and post-auth routes on the frontend applications.

#### Methodology

Each route renders a page. The pages are React components, that call the REST APIs exposed by the backend and populate the results in the views. Axios has been used to perform REST API calls. Localstorage has been used for persistance. React ApexChart library has been used for visualizations.


### Database

APISecurityEngine uses MongoDB as the database.

MongoDB is a popular NoSQL database known for its flexibility and scalability. Utilizing a document-oriented approach, MongoDB stores data in BSON documents, providing a dynamic schema that accommodates evolving data structures. It excels in handling diverse datasets, offering horizontal scalability through features like sharding. MongoDB supports powerful querying, indexing, and aggregation, making it suitable for a wide range of applications. With high availability features like replica sets, schema flexibility, and a robust community, MongoDB is widely adopted for building modern, scalable, and responsive database solutions.

## Installation


### Install with Docker

##### Clone the Repository:

```
git clone <repository-url>
```

```
cd <repository-directory>
```

##### Configure Environment Variables:

Open the Dockerfile inside the backend folder and replace values for the below

<pre>
NODE_ENV
PORT
MONGO_URI
REPORTING_SYSTEM_URL
</pre>


Open the Dockerfile inside the frontend folder and replace values for the below

<pre>
REACT_APP_BACKEND_URL
REACT_APP_REPORTING_SYSTEM_URL
</pre>


##### Build Docker Containers:

```
docker-compose build
```

##### Run Docker Containers:

```
docker-compose up
```



## Vulnerability Scans, Associated CWEs and Respective Test Executing Services

### 1. Broken Object Level Authorization

##### Description

  Broken Object Level Authorization is a security vulnerability that occurs when an application's API lacks proper enforcement of access controls on resources. In the context of API security, this   weakness arises when an attacker can manipulate or tamper with the API requests to gain unauthorized access to sensitive data or perform actions on resources they are not supposed to access. Typically, this occurs when the API does not effectively validate and enforce the permissions associated with the authenticated user, allowing an attacker to modify or forge requests to access or manipulate objects or data belonging to other users or entities. For example, if an API endpoint exposes user data and relies solely on client-side controls for access, an attacker may manipulate the requests to access another user's information. To mitigate this vulnerability, APIs must implement robust and secure access controls, validating the permissions of the authenticated user for each request to ensure that only authorized actions are permitted. Additionally, adopting a principle of least privilege and regularly auditing and testing the authorization mechanisms can further enhance the security posture of API implementations.

  ##### CWEs

  | CWE                                                                       | URL                                             |
|---------------------------------------------------------------------------|-------------------------------------------------|
| CWE-200 Exposure of Sensitive Information to an Unauthorized Actor.       | https://cwe.mitre.org/data/definitions/200.html |
| CWE-201 Exposure of Sensitive Information Through Sent Data.              | https://cwe.mitre.org/data/definitions/201.html |
| CWE-284 Improper Access Control                                           | https://cwe.mitre.org/data/definitions/284.html |
| CWE-359 Exposure of Private Personal Information to an Unauthorized Actor | https://cwe.mitre.org/data/definitions/359.html |
| CWE-566 Authorization Bypass Through User-Controlled SQL Primary Key      | https://cwe.mitre.org/data/definitions/639.html |
| CWE-863: Incorrect Authorization                                          | https://cwe.mitre.org/data/definitions/863.html |

  ##### Test Executing Service

<pre>
services/brokenObjectLevelAuthorizationCheckService
</pre>

### 2. Sensitive Data in Path Params

  ##### Description

  The "Sensitive Data in Path Params" vulnerability occurs when sensitive information, such as user credentials or personally identifiable information (PII), is included in the URL path parameters of an API request. This can expose confidential data to various risks, as path parameters are often logged in server logs, cached, or visible in browser history. In the context of API security, this vulnerability can lead to unauthorized disclosure of sensitive information, posing a risk of data exposure and compromise.

For instance, if an API endpoint includes user credentials or an API key directly in the URL path, an attacker might gain access to these details by exploiting log files or intercepting network traffic. 

  ##### CWEs
  
| CWE                                                             | URL                                             |
|-----------------------------------------------------------------|-------------------------------------------------|
| CWE-598: Use of GET Request Method With Sensitive Query Strings | https://cwe.mitre.org/data/definitions/598.html |

  

  ##### Test Executing Service

  <pre>
  services/sensitiveDataInPathParamsCheckService
  </pre>


### 3. Basic Authentication Detected

  ##### Description

  The "Basic Authentication Detected" vulnerability refers to the identification of an application or API that utilizes Basic Authentication for user authentication. Basic Authentication involves sending user credentials (username and password) in the HTTP headers, encoded in base64 format. While base64 encoding is not encryption and the credentials can be easily decoded, the primary security concern with Basic Authentication is that it relies on sending sensitive information in an easily interceptable and readable form.

  In the context of API security, detecting the use of Basic Authentication may indicate a potential security risk, especially if it is implemented without the use of secure communication (HTTPS). If Basic Authentication is used over an unencrypted connection, an attacker could potentially intercept and decode the credentials, leading to unauthorized access to the protected resources.

  ##### CWEs

| CWE                                                   | URL                                             |
|-------------------------------------------------------|-------------------------------------------------|
| CWE-306: Missing Authentication for Critical Function | https://cwe.mitre.org/data/definitions/306.html |

  ##### Test Executing Service

  <pre>
  services/basicAuthenticationDetectedCheckService
  </pre>


### 4. Endpoint Not Secured by SSL

  ##### Description

  The "Endpoint Not Secured by SSL" vulnerability occurs when an API endpoint or a web service is accessible over an unencrypted HTTP connection instead of a secure HTTPS connection. This vulnerability poses a significant security risk because data transmitted over HTTP is sent in plaintext, making it susceptible to interception and eavesdropping by malicious actors. In the context of API security, this vulnerability can lead to the exposure of sensitive information, including user credentials, authentication tokens, and data exchanged between the client and server.



  ##### CWEs


| CWE                                                   | URL                                             |
|-------------------------------------------------------|-------------------------------------------------|
| CWE-319: Cleartext Transmission of Sensitive Information | https://cwe.mitre.org/data/definitions/319.html |


  ##### Test Executing Service
  
  <pre>
  services/endpointNotSecuredBySSLCheckService
  </pre>
  

### 5. Unauthenticated Endpoint Returning Sensitive Data

  ##### Description
  
The "Unauthenticated Endpoint Returning Sensitive Data" vulnerability occurs when an API endpoint, which should require authentication for access, is accessible without proper authentication and returns sensitive information in its responses. This poses a serious security risk as it allows unauthorized users to retrieve confidential data, potentially leading to data exposure, privacy violations, and unauthorized access to sensitive resources.
  

  ##### CWEs

| CWE                                                   | URL                                             |
|-------------------------------------------------------|-------------------------------------------------|
| CWE-200: Exposure of Sensitive Information to an Unauthorized Actor | https://cwe.mitre.org/data/definitions/200.html |

  ##### Test Executing Service

  <pre>
    services/unauthenticatedEndpointReturningSensitiveDataCheckService
  </pre>


### 6. Sensitive Data in Query Params

  ##### Description
The "Sensitive Data in Query Params" vulnerability occurs when sensitive information is included in the URL query parameters of an API request. Query parameters are the key-value pairs appended to the end of a URL, and when sensitive data is passed this way, it can pose security risks. This vulnerability is concerning because query parameters are often logged in server logs, may be visible in browser history, and can be easily leaked through various channels, exposing the sensitive information.
  

  ##### CWEs



| CWE                                                   | URL                                             |
|-------------------------------------------------------|-------------------------------------------------|
| CWE-598: Use of GET Request Method With Sensitive Query Strings | https://cwe.mitre.org/data/definitions/598.html |

  ##### Test Executing Service

  <pre>
  services/sensitiveDataInQueryParamsCheckService
  </pre>


### 7. PII Data Detected in Response

  ##### Description

  The "PII Data Detected in Response" vulnerability refers to the situation where Personally Identifiable Information (PII) is inadvertently exposed or included in the response of an API, web application, or any software system. PII includes any information that can be used to identify or contact an individual, such as names, addresses, phone numbers, social security numbers, and more. Exposing PII in responses poses a significant privacy and security risk, as it can lead to unauthorized access to sensitive information, identity theft, or other malicious activities.
  

  ##### CWEs
  

| CWE                                                   | URL                                             |
|-------------------------------------------------------|-------------------------------------------------|
| CWE-200: Exposure of Sensitive Information to an Unauthorized Actor | https://cwe.mitre.org/data/definitions/200.html |

  ##### Test Executing Service

  <pre>
  services/piiDataDetectedInResponseCheckService
  </pre>

### 8. HTTP Verb Tampering Possible

  ##### Description

  The "HTTP Verb Tampering Possible" vulnerability refers to a situation where an attacker can manipulate or tamper with the HTTP verb (method) used in a request to an API or web application. HTTP verbs include commonly used methods such as GET, POST, PUT, DELETE, etc. The improper manipulation of these verbs can lead to security issues, including unauthorized actions, data manipulation, or other malicious activities.

  
  ##### CWEs


| CWE                                                   | URL                                             |
|-------------------------------------------------------|-------------------------------------------------|
| CWE-650: Trusting HTTP Permission Methods on the Server Side | https://cwe.mitre.org/data/definitions/650.html |


  ##### Test Executing Service

  <pre>
  services/httpVerbTamperingPossibleCheckService
  </pre>


### 9. Content Type Injection Possible

  ##### Description

  "Content Type Injection Possible" refers to a security vulnerability where an attacker is able to manipulate or inject inappropriate content types in a request or response. This type of vulnerability is commonly associated with web applications or APIs that process content based on specified content types, such as JSON, XML, HTML, etc.

  ##### CWEs


| CWE                                                                                                        | URL                                             |
|------------------------------------------------------------------------------------------------------------|-------------------------------------------------|
| CWE-116: Improper Encoding or Escaping of Output                                                           | https://cwe.mitre.org/data/definitions/116.html |
| CWE-94: Improper Control of Generation of Code ('Code Injection')                                          | https://cwe.mitre.org/data/definitions/94.html  |
| CWE-74: Improper Neutralization of Special Elements in Output Used by a Downstream Component ('Injection') | https://cwe.mitre.org/data/definitions/74.html  |


  ##### Test Executing Service

  <pre>
  services/contentTypeInjectionPossibleCheckService
  </pre>


### 10. Security Headers not Enabled on Host

  ##### Description

  The "Security Headers Not Enabled on Host" vulnerability refers to a situation where critical security headers are missing or improperly configured on a web host or application server. Security headers play a crucial role in enhancing the security posture of web applications by providing additional layers of protection against various types of attacks. The absence of these headers or their misconfiguration can leave the application more vulnerable to potential security threats.

  ##### CWEs

| CWE                                                   | URL                                             |
|-------------------------------------------------------|-------------------------------------------------|
| CWE-693: Protection Mechanism Failure | https://cwe.mitre.org/data/definitions/693.html |

  ##### Test Executing Service

  <pre>
  services/securityHeadersNotEnabledOnHostCheckService
  </pre>


### 11. Resource Deletion Possible

  ##### Description
  
The "Resource Deletion Possible" vulnerability refers to a security risk where an attacker can potentially delete or modify critical resources within an application or system without proper authorization. This type of vulnerability can have severe consequences, as it may lead to data loss, service disruption, or unauthorized changes to important elements of the system.
  

  ##### CWEs

| CWE                                                   | URL                                             |
|-------------------------------------------------------|-------------------------------------------------|
| CWE-22: Improper Limitation of a Pathname to a Restricted Directory ('Path Traversal') | https://cwe.mitre.org/data/definitions/22.html |



  ##### Test Executing Service
  
  <pre>
  services/resourceDeletionPossibleCheckService
  </pre>
  

### 12. Broken Authentication

  ##### Description

  The "Broken Authentication" vulnerability refers to a security weakness in the authentication mechanism of a web application or system. Authentication is the process of verifying the identity of users attempting to access a system, and when it is improperly implemented or flawed, it can lead to various security risks. The "Broken Authentication" vulnerability typically involves weaknesses that allow attackers to compromise user credentials, gain unauthorized access, or bypass authentication controls.

  ##### CWEs

| CWE                                           | URL                                             |
|-----------------------------------------------|-------------------------------------------------|
| CWE-287: Improper Authentication              | https://cwe.mitre.org/data/definitions/287.html |
| CWE-522: Insufficiently Protected Credentials | https://cwe.mitre.org/data/definitions/522.html |
| CWE-523: Unprotected Transport of Credentials | https://cwe.mitre.org/data/definitions/523.html |
| CWE-620: Unverified Password Change           | https://cwe.mitre.org/data/definitions/620.html |

  ##### Test Executing Service

  <pre>
  services/brokenAuthenticationCheckService
  </pre>


### 13. Excessive Data Exposure

  ##### Description

  "Excessive Data Exposure" refers to a security vulnerability where an application, system, or service unintentionally exposes more data than necessary, leading to potential privacy and security risks. This vulnerability can occur when an application provides unauthorized access to sensitive information, exposes unnecessary details in error messages, or leaks data through insecure channels.

In the context of API security, "Excessive Data Exposure" refers to situations where an API inadvertently exposes more data than necessary, posing risks to the confidentiality and privacy of the information being transmitted. This vulnerability can have specific implications in the API environment, and addressing it is crucial to protect sensitive data.



  ##### CWEs

| CWE                                                   | URL                                             |
|-------------------------------------------------------|-------------------------------------------------|
| CWE-200: Exposure of Sensitive Information to an Unauthorized Actor | https://cwe.mitre.org/data/definitions/200.html |

  ##### Test Executing Service

  <pre>
  services/excessiveDataExposureCheckService
  </pre>
  


### 14. Injection

  ##### Description

  "Injection" in the context of API security typically refers to a class of vulnerabilities where an attacker can manipulate input data in such a way that it leads to unintended or unauthorized operations within an API or a backend system. Injection attacks can have serious consequences, including data breaches, unauthorized access, or disruption of services. Examples are SQL Injection (SQLi), Command Injection, XPath Injection, LDAP Injection, XML External Entity (XXE) Injection, Template Injection etc. 


  ##### CWEs

| CWE                                                                                                                             | URL                                             |
|---------------------------------------------------------------------------------------------------------------------------------|-------------------------------------------------|
| CWE-20: Improper Input Validation                                                                                               | https://cwe.mitre.org/data/definitions/20.html  |
| CWE-74: Improper Neutralization of Special Elements in Output Used by a Downstream Component ('Injection')                      | https://cwe.mitre.org/data/definitions/74.html  |
| CWE-75: Failure to Sanitize Special Elements into a Different Plane (Special Element Injection)                                 | https://cwe.mitre.org/data/definitions/75.html  |
| CWE-77: Improper Neutralization of Special Elements used in a Command ('Command Injection')                                     | https://cwe.mitre.org/data/definitions/77.html  |
| CWE-78: Improper Neutralization of Special Elements used in an OS Command ('OS Command Injection')                              | https://cwe.mitre.org/data/definitions/78.html  |
| CWE-87: Improper Neutralization of Alternate XSS Syntax                                                                         | https://cwe.mitre.org/data/definitions/87.html  |
| CWE-88: Improper Neutralization of Argument Delimiters in a Command ('Argument Injection')                                      | https://cwe.mitre.org/data/definitions/88.html  |
| CWE-89: Improper Neutralization of Special Elements used in an SQL Command ('SQL Injection')                                    | https://cwe.mitre.org/data/definitions/89.html  |
| CWE-90: Improper Neutralization of Special Elements used in an LDAP Query ('LDAP Injection')                                    | https://cwe.mitre.org/data/definitions/90.html  |
| CWE-91: XML Injection (aka Blind XPath Injection)                                                                               | https://cwe.mitre.org/data/definitions/91.html  |
| CWE-93: Improper Neutralization of CRLF Sequences ('CRLF Injection')                                                            | https://cwe.mitre.org/data/definitions/93.html  |
| CWE-94: Improper Control of Generation of Code ('Code Injection')                                                               | https://cwe.mitre.org/data/definitions/94.html  |
| CWE-95: Improper Neutralization of Directives in Dynamically Evaluated Code ('Eval Injection')                                  | https://cwe.mitre.org/data/definitions/95.html  |
| CWE-96: Improper Neutralization of Directives in Statically Saved Code ('Static Code Injection')                                | https://cwe.mitre.org/data/definitions/96.html  |
| CWE-98: Improper Control of Filename for Include/Require Statement in PHP Program ('PHP Remote File Inclusion')                 | https://cwe.mitre.org/data/definitions/98.html  |
| CWE-99: Improper Control of Resource Identifiers ('Resource Injection')                                                         | https://cwe.mitre.org/data/definitions/99.html  |
| CWE-113: Improper Neutralization of CRLF Sequences in HTTP Headers ('HTTP Request/Response Splitting')                          | https://cwe.mitre.org/data/definitions/113.html |
| CWE-116: Improper Encoding or Escaping of Output                                                                                | https://cwe.mitre.org/data/definitions/116.html |
| CWE-138: Improper Neutralization of Special Elements                                                                            | https://cwe.mitre.org/data/definitions/138.html |
| CWE-564: SQL Injection: Hibernate                                                                                               | https://cwe.mitre.org/data/definitions/564.html |
| CWE-643: Improper Neutralization of Data within XPath Expressions ('XPath Injection')                                           | https://cwe.mitre.org/data/definitions/643.html |
| CWE-652: Improper Neutralization of Data within XQuery Expressions ('XQuery Injection')                                         | https://cwe.mitre.org/data/definitions/652.html |
| CWE-917: Improper Neutralization of Special Elements used in an Expression Language Statement ('Expression Language Injection') | https://cwe.mitre.org/data/definitions/917.html |
 
  
  ##### Test Executing Service

  <pre>
  services/injectionCheckService
  </pre>


### 15. Wallet Hijacking Possible


  ##### Description

  Wallet hijacking in the Web3 context refers to a potential security vulnerability where an attacker could compromise the integrity of a user's cryptocurrency wallet within the decentralized web 
  environment. This vulnerability may arise from several factors, including phishing attacks, malware, insecure interactions with Web3 APIs, or weaknesses in the wallet software itself.

  ##### CWEs

| CWE                                                                | URL                                             |
|--------------------------------------------------------------------|-------------------------------------------------|
| CWE-307: Improper Restriction of Excessive Authentication Attempts | https://cwe.mitre.org/data/definitions/307.html |
| CWE-285: Improper Authorization                                    | https://cwe.mitre.org/data/definitions/285.html |
| CWE-829: Inclusion of Functionality from Untrusted Control Sphere  | https://cwe.mitre.org/data/definitions/829.html |
| CWE-732: Incorrect Permission Assignment for Critical Resource     | https://cwe.mitre.org/data/definitions/732.html |
| CWE-522: Insufficiently Protected Credentials                      | https://cwe.mitre.org/data/definitions/522.html |
| CWE-602: Client-Side Enforcement of Server-Side Security           | https://cwe.mitre.org/data/definitions/602.html |
| CWE-269: Improper Privilege Management                             | https://cwe.mitre.org/data/definitions/269.html |
| CWE-311: Missing Encryption of Sensitive Data                      | https://cwe.mitre.org/data/definitions/311.html |
| CWE-863: Incorrect Authorization                                   | https://cwe.mitre.org/data/definitions/863.html |
| CWE-334: Small Space of Random Values                              | https://cwe.mitre.org/data/definitions/334.html |


  ##### Test Executing Service
  
  <pre>
  services/walletHijackingPossibleCheckService
  </pre>


### 16. Pre Image Attack Possible

  ##### Description

  A "Pre-image Attack Possible" vulnerability refers to the risk that an attacker could potentially determine the original input or message that corresponds to a given hash value. This vulnerability is particularly relevant in the security analysis of cryptographic hash functions, where the goal is to make it computationally infeasible to find a pre-image (original input) for a given hash output.

  ##### CWEs

| CWE                                                       | URL                                             |
|-----------------------------------------------------------|-------------------------------------------------|
| CWE-327: Use of a Broken or Risky Cryptographic Algorithm | https://cwe.mitre.org/data/definitions/327.html |
| CWE-328: Use of Weak Hash                                 | https://cwe.mitre.org/data/definitions/328.html |
| CWE-326: Inadequate Encryption Strength                   | https://cwe.mitre.org/data/definitions/326.html |
| CWE-334: Small Space of Random Values                     | https://cwe.mitre.org/data/definitions/334.html |

  ##### Test Executing Service

  <pre>
  services/preImageAttackPossibleCheckService
  </pre>


### 17. Lack of resource and rate limiting


  ##### Description

The "Lack of Resource and Rate Limiting" vulnerability refers to a situation where an application or API does not implement adequate controls to limit the rate at which requests are made or allocate resources to users. Without proper resource and rate limiting mechanisms, an application becomes more susceptible to various types of abuse, including brute-force attacks, denial-of-service (DoS) attacks, and other forms of exploitation.

  

  ##### CWEs


| CWE                                                       | URL                                             |
|-----------------------------------------------------------|-------------------------------------------------|
| CWE-770: Allocation of Resources Without Limits or Throttling | https://cwe.mitre.org/data/definitions/770.html |
| CWE-799: Improper Control of Interaction Frequency            | https://cwe.mitre.org/data/definitions/799.html |




  ##### Test Executing Service


  <pre>
  services/lackOfResourceAndRateLimitingCheckService
  </pre>
