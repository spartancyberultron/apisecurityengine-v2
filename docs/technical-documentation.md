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



## REST API Scans - Test Cases, Associated CWEs and Respective Test Executing Services

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




## SOAP/GraphQL API Scans - Test Cases, Associated CWEs and Respective Test Executing Services


| S. No. | Test Cases Category                             | Test Cases Name                                                        | Severity | OWASP TOP 10 API                     | CWE References                                                                                                                                             |
|--------|-------------------------------------------------|------------------------------------------------------------------------|----------|--------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------|
| 1      | Directory Browsing Vulnerability                | Unauthorized Directory Listing Vulnerability                           | Medium   | A8:2023 - Security Misconfiguration  | CWE-548: Information Exposure Through Directory Listing                                                                                                     |
| 2      | Cookie No HttpOnly Flag                         | Cookie lacks the 'Secure' attribute, exposing it to network attacks.    | Low      | A8:2023 - Security Misconfiguration  | CWE-614: Sensitive Cookie in HTTPS Session Without 'Secure' Attribute                                                                                       |
| 3      | Cookie Without Secure Flag                      | Cookie set without the secure flag, risking transmission over insecure connections. | Low      | A8:2023 - Security Misconfiguration  | CWE-311: Missing Encryption of Sensitive Data<br>CWE-614: Sensitive Cookie in HTTPS Session Without 'Secure' Attribute                                        |
| 4      | Password Autocomplete in Browser                | Browser saves passwords automatically, exposing them to unauthorized access. | Low      | A8:2023 - Security Misconfiguration  | CWE-256: Plaintext Storage of a Password<br>CWE-522: Insufficiently Protected Credentials                                                                    |
| 5      | Incomplete or No Cache-control and Pragma HTTP Header Set | Absence of HTTP headers preventing sensitive data caching in browsers.  | Low      | A8:2023 Security Misconfiguration    | CWE-525: Use of Web Browser Cache Containing Sensitive Information<br>CWE-384: Session Fixation                                                              |
| 6      | Web Browser XSS Protection Not Enabled          | Browser's XSS protection is disabled, leaving users vulnerable to attacks. | Low      | A8:2023 Security Misconfiguration    | CWE-933: OWASP Top Ten 2019 Category A7-Cross-Site Scripting<br>CWE-79: Improper Neutralization of Input During Web Page Generation ('Cross-site Scripting')  |
| 7      | Cross-Domain JavaScript Source File Inclusion   | Inclusion of external JavaScript files from untrusted domains causes security risks. | Low      | A8:2023 Security Misconfiguration    | CWE-829: Inclusion of Functionality from Untrusted Control Sphere<br>CWE-94: Improper Control of Generation of Code ('Code Injection')                       |
| 8      | Content-Type Header Missing                     | The Content-Type header is not included in HTTP requests.               | High     | A8:2023 Security Misconfiguration    | CWE-79: Improper Neutralization of Input During Web Page Generation ('Cross-site Scripting')<br>CWE-116: Improper Encoding or Escaping of Output<br>CWE-113: Improper Neutralization of CRLF Sequences in HTTP Headers ('HTTP Response Splitting') |
| 9      | X-Frame-Options Header Scanner                  | Missing X-Frame-Options header allows clickjacking attacks on web applications. | High     | A8:2023 Security Misconfiguration    | CWE-1021: Improper Restriction of Rendered UI Layers or Frames<br>CWE-693: Protection Mechanism Failure                                                      |
| 10     | X-Content-Type-Options Header Missing          | Lack of X-Content-Type-Options header allows MIME-type mismatch attacks. | High     | A8:2023 Security Misconfiguration    | CWE-16: Configuration<br>CWE-933: OWASP Top Ten 2013 Category A5 – Security Misconfiguration<br>CWE-20: Improper Input Validation                           |
| 11     | Information Disclosure - Debug Error Messages   | Exposure of sensitive information through debug error messages.        | High     | A8:2023 Security Misconfiguration    | CWE-209: Information Exposure Through an Error Message<br>CWE-532: Information Exposure Through Log Files                                                    |
| 12     | Information Disclosure - Sensitive Informations in URL | Sensitive data exposed in URLs, risking interception and unauthorized access. | High     | A8:2023 Security Misconfiguration    | CWE-598: Information Exposure Through Query Strings in GET Request<br>CWE-200: Exposure of Sensitive Information to an Unauthorized Actor                    |
| 13     | Information Disclosure - Sensitive Information in HTTP Referrer Header | Exposure of sensitive data through HTTP referrer headers in requests. | High     | A8:2023 Security Misconfiguration    | CWE-598: Information Exposure Through Query Strings in GET Request<br>CWE-200: Exposure of Sensitive Information to an Unauthorized Actor                    |
| 14     | HTTP Parameter Override                         | Malicious user manipulates web app parameters                           | High     | A1:2023 - Broken Authentication      | CWE-937: Remote Parameter Tampering<br>CWE-802: Dynamically Modifiable Code Execution                                                                       |
| 15     | Information Disclosure - Suspicious Comments    | Unintended secrets revealed in code comments                            | High     | A8:2023 Security Misconfiguration    | CWE-201: Exposure of Sensitive Data Through Untrusted Data Channels<br>CWE-611: Exposure of Private Implementation Details                                   |
| 16     | Viewstate Scanner                               | Insecure Deserialization of ViewState                                   | Medium   | A8:2023 Security Misconfiguration    | CWE-642: External Control of Critical State Data<br>CWE-502: Deserialization of Untrusted Data                                                              |
| 17     | Secure Pages Include Mixed Content              | Mixed content on HTTPS pages                                            | Medium   | A8:2023 Security Misconfiguration    | CWE-894: Improper Control of Resource Identifiers in a Web Application                                                                                      |
| 18     | Source Code Disclosure - /WEB-INF folder        | Unprotected sensitive files exposed.                                    | Medium   | A8:2023 Security Misconfiguration    | CWE-200: Exposure of Sensitive Data or Information<br>CWE-601: Unintended Information Disclosure                                                            |
| 19     | Remote Code Execution - Shell Shock             | Bash bug allows env var code execution.                                 | Critical | A8:2023 Security Misconfiguration    | CWE-400: Uncontrolled Resource Consumption<br>CWE-77: Command Injection                                                                                     |
| 20     | Backup File Disclosure                          | Unintended access to backup files.                                      | High     | A8:2023 Security Misconfiguration    | CWE-200: Exposure of Sensitive Data<br>CWE-532: Insecure Direct Object References                                                                           |
| 21     | Weak Authentication Method                      | Insecure login methods                                                  | High     | API2:2023 - Broken Authentication    | CWE-287: Improper Authentication<br>CWE-1390: Weak Authentication                                                                                           |
| 22     | Absence of Anti-CSRF Tokens                     | Missing protection against forged requests.                             | High     | API2:2023 - Broken Authentication    | CWE-352: Cross-Site Request Forgery (CSRF)                                                                                                                 |
| 23     | Private IP Disclosure                           | Unintended reveal of internal network IPs.                              | High     | API6:2023 - Unrestricted Access to Sensitive Business Flows | CWE-200: Improper Resource Handling<br>CWE-613: Sensitive Data Exposure                                                 |
| 24     | Anti CSRF Tokens Scanner                        | Missing CSRF protection                                                 | High     | API2:2023 - Broken Authentication    | CWE-352: Cross-Site Request Forgery (CSRF)                                                                                                                 |
| 25     | HTTP Parameter Pollution scanner                | Duplicate params confuse application logic                              | Medium   | API3:2023 - Broken Object Property Level Authorization | CWE-20: Improper Input Validation<br>CWE-233: Improper Handling of Parameters                                         |
| 26     | Cross-Domain Misconfiguration                   | CORS settings allowing unauthorized access                              | High     | API2:2023 - Broken Authentication    | CWE-894: Improper Access Control<br>CWE-614: Broken Access Control                                                                                          |
| 27     | Source Code Disclosure                          | Unintended revealing of server-side code                                | Critical | A8:2023 Security Misconfiguration    | CWE-200: Exposure of Sensitive Information<br>CWE-601: Unintended Information Disclosure                                                                    |
| 28     | Remote Code Execution                           | Run attacker code on remote system                                      | Critical | API1:2023 - Broken Object Level Authorization | CWE-79: Improper Neutralization of Special Elements used in an SQL Command ('SQL Injection')<br>CWE-20: Improper Input Validation   |
| 29     | External Redirect                               | Unintended redirection to external website.                             | High     | API1:2023 - Broken Object Level Authorization | CWE-601: URL Redirection<br>CWE-794: Insecure Direct Object Reference (IDOR)                                    |
| 30     | Session ID in URL Rewrite                       | Exposing session ID in URL parameters                                   | Medium   | API2:2023 - Broken Authentication    | CWE-311: Improper Restriction of URL Access Within Web Page<br>CWE-613: Sensitive Data Leakage                                                              |
| 31     | Buffer Overflow                                 | Memory overrun when data exceeds buffer capacity                        | Medium   | API1:2023 - Broken Object Level Authorization | CWE-120: Stack-based buffer overflow<br>CWE-121: Heap-based buffer overflow                                    |
| 32     | Format String Error                             | Misinterpreting a string meant for formatting as code                   | Medium   | API1:2023 - Broken Object Level Authorization | CWE-78: OS Command Injection<br>CWE-400: Uncontrolled Resource Consumption                                        |
| 33     | Integer Overflow Error                          | Arithmetic on integers exceeding data type limits.                      | High     | API2:2023 - Broken Authentication    | CWE-190: Integer Overflow or Underflow                                                                                                                     |
| 34     | CRLF Injection                                  | Carriage return & line feed injection                                   | Critical | API2:2023 - Broken Authentication    | CWE-800: Integer Overflow<br>CWE-934: Stack Buffer Overflow                                                                                                |
| 35     | Parameter Tampering                             | Malicious modification of data sent to applications.                    | Critical | API2:2023 - Broken Authentication    | CWE-937: Broken Component Validation<br>CWE-802: Dynamic Linking Errors                                                                                    |
| 36     | XML Injection                                   | Injection of malicious XML into processing systems.                     | High     | API4:2023 - Insecure Design          | CWE-611: Improper Restriction of XML External Entity Reference ('XXE')                                                                                     |
| 37     | HTTP Response Splitting                         | Splitting HTTP responses to inject malicious content.                    | High     | API4:2023 - Insecure Design          | CWE-113: Improper Neutralization of CRLF Sequences in HTTP Headers ('HTTP Response Splitting')                                                               |
| 38     | Path Traversal                                  | Access to directories and files outside the web root.                    | High     | API4:2023 - Insecure Design          | CWE-22: Path Traversal (Directory Traversal)                                                                                                                 |
| 39     | Insecure Deserialization                        | Flaws in deserialization process allowing arbitrary code execution.     | Critical | API4:2023 - Insecure Design          | CWE-502: Deserialization of Untrusted Data                                                                                                                  |
| 40     | Missing Authorization Header                    | Missing headers exposing endpoints to unauthorized access.              | Critical | API2:2023 - Broken Authentication    | CWE-284: Improper Access Control<br>CWE-256: Plaintext Storage of a Password                                                                                 |
| 41     | Insecure Direct Object Reference (IDOR)         | Exposing internal objects directly through URLs or form data.            | Critical | API1:2023 - Broken Object Level Authorization | CWE-639: Authorization Bypass Through User-Controlled Key<br>CWE-470: User Interface (UI) Exposure of Sensitive Information                              |
| 42     | Unrestricted File Upload                        | Allowing file uploads without proper validation.                         | Critical | API5:2023 - Broken Function Level Authorization | CWE-434: Unrestricted File Upload                                                                                                                            |
| 43     | Server-Side Request Forgery (SSRF)              | Attacker makes requests from the server to internal resources.            | Critical | API5:2023 - Broken Function Level Authorization | CWE-918: Server-Side Request Forgery (SSRF)                                                                                                                  |
| 44     | Unvalidated Redirects and Forwards              | Unvalidated redirects and forwards that can lead to phishing.            | High     | API6:2023 - Unrestricted Access to Sensitive Business Flows | CWE-601: URL Redirection to Untrusted Site ('Open Redirect')                                                                                               |
| 45     | Insufficient Logging and Monitoring             | Lack of proper logging and monitoring for security incidents.            | Medium   | API6:2023 - Unrestricted Access to Sensitive Business Flows | CWE-778: Insufficient Logging<br>CWE-725: Insufficient Logging of Security-relevant Events                                                                   |
| 46     | API Rate Limiting                                | Absence of controls for limiting the number of API requests.              | High     | API6:2023 - Unrestricted Access to Sensitive Business Flows | CWE-770: Allocation of Resources Without Limits or Throttling                                                                                              |
| 47     | Improper Error Handling                         | Leaking sensitive information through error messages.                     | High     | API6:2023 - Unrestricted Access to Sensitive Business Flows | CWE-209: Information Exposure Through an Error Message                                                                                                      |
| 48     | Overly Verbose Error Messages                   | Providing too much information in error responses.                      | High     | API6:2023 - Unrestricted Access to Sensitive Business Flows | CWE-209: Information Exposure Through an Error Message                                                                                                      |
| 49     | Outdated Libraries and Frameworks               | Using libraries or frameworks with known vulnerabilities.                | High     | API6:2023 - Unrestricted Access to Sensitive Business Flows | CWE-113: Improper Neutralization of CRLF Sequences in HTTP Headers ('HTTP Response Splitting')                                                               |
| 50     | Insecure Default Configurations                 | Using default configurations that are insecure.                         | High     | API6:2023 - Unrestricted Access to Sensitive Business Flows | CWE-16: Configuration                                                                                                                                        |
| 51     | Weak Cryptographic Algorithms                    | Use of outdated or weak cryptographic algorithms.                         | Critical | API6:2023 - Unrestricted Access to Sensitive Business Flows | CWE-326: Inadequate Encryption Strength<br>CWE-311: Missing Encryption of Sensitive Data                                                                       |
| 52     | Misconfigured Security Headers                  | Missing or incorrect security-related HTTP headers.                      | High     | API6:2023 - Unrestricted Access to Sensitive Business Flows | CWE-16: Configuration<br>CWE-521: Weak Password Recovery Mechanism                                                                                          |
| 53     | Cross-Site Scripting (XSS)                       | Injecting malicious scripts into web pages viewed by others.              | Critical | API7:2023 - Cross-Site Scripting (XSS) | CWE-79: Improper Neutralization of Input During Web Page Generation ('Cross-site Scripting')                                                                |
| 54     | SQL Injection                                   | Injecting malicious SQL queries through input fields.                    | Critical | API7:2023 - Cross-Site Scripting (XSS) | CWE-89: SQL Injection                                                                                                                                         |
| 55     | Clickjacking                                    | Using iframes or other techniques to trick users into clicking unintended links. | High     | API7:2023 - Cross-Site Scripting (XSS) | CWE-1021: Improper Restriction of Rendered UI Layers or Frames                                                                                              |
| 56     | Command Injection                               | Executing arbitrary commands on the server.                             | Critical | API7:2023 - Cross-Site Scripting (XSS) | CWE-78: OS Command Injection                                                                                                                                |
| 57     | Insecure Object References                      | Improperly controlled references to objects.                            | Critical | API7:2023 - Cross-Site Scripting (XSS) | CWE-639: Authorization Bypass Through User-Controlled Key                                                                                                   |
| 58     | Insufficient Input Validation                   | Failure to validate input data thoroughly.                               | High     | API7:2023 - Cross-Site Scripting (XSS) | CWE-20: Improper Input Validation<br>CWE-101: Improper Control of a Resource Through its Lifetime                                                           |
| 59     | Insecure API Endpoints                          | Exposing endpoints without proper security controls.                      | Critical | API7:2023 - Cross-Site Scripting (XSS) | CWE-927: Improper Handling of Sensitive Data                                                                                                                 |
| 60     | Unsecured Data Storage                          | Storing sensitive data without proper security measures.                 | Critical | API7:2023 - Cross-Site Scripting (XSS) | CWE-922: Insecure Data Storage                                                                                                                                |



## LLM Scans - Test Cases, Associated CWEs and Respective Test Executing Services

