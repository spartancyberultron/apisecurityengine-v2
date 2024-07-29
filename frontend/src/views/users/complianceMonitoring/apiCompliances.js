import React, { useState, useEffect, useRef } from "react";
import { CFormInput, CButton, CFormSelect, CTable, CToast, CToastBody, CToaster } from '@coreui/react'
import MUIDataTable from "mui-datatables";
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios';
import { CSSProperties } from "react";
import GridLoader from "react-spinners/GridLoader";
import { ShimmerTable } from "react-shimmer-effects";
import Modal from 'react-modal';
import ReactPaginate from 'react-paginate';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { MdStart } from "react-icons/md";
import { AiOutlineSecurityScan } from "react-icons/ai";
import { MdOutlineDelete } from "react-icons/md";

import { FaEye } from "react-icons/fa";

const APICompliances = () => {

  //const [toast, addToast] = useState(0)
  const navigate = useNavigate()

  const [owaspCategories, setOwaspCategories] = useState([])

  const [onLoading, setOnLoading] = useState(false);

  const [pageCount, setPageCount] = useState(100);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(100);

  const [modalIsOpen, setModalIsOpen] = React.useState(false);

  const [itemOffset, setItemOffset] = useState(0);

  const [showAll, setShowAll] = React.useState(false);

  const customStyles = {
    content: {
      top: '30%',
      left: '25%',
      width: '50%',
      right: 'auto',
      bottom: 'auto',
      height: '15%',
      backgroundColor: '#ffffff',
      borderRadius: 15,
      borderColor: 'ffffff'
    },
  };

  const itemsPerPage = 10;



  function getComplianceMappings(owaspCategory) {

    console.log('owaspCategory', owaspCategory)

    switch (owaspCategory) {

      case 'API1:2023 Broken Object Level Authorization':
        return {
          cwe: ['CWE-285: Improper Access Control', 'CWE-690: Improper Authorization'],
          iso27001: ["A.6.1.1 Identification and authentication for access control", "A.6.2.1 User access management"],
          nistCSF: ["AC-1: Access Enforcement", "AC-6: Least Privilege", "CM-2: Security Assessment of External Services"],
          gdpr: ["Article 5(1)(c): Integrity and confidentiality - Ensure data access is limited to authorised users and specific data objects."],
          pciDSS: ["Requirement 5: Secure applications and systems - Control 5.5: Validate all access requests."],
          hipaa: ["HIPAA Security Rule's Access Control (4.16) and Audit (4.26) controls"],
          mitreATTACK: ["Resource Hijacking (TA0005)", "User Impersonation (TA0008)", "Lateral Movement (TA0003)"],
          nist80053: ["AC-17: Access Enforcement", "AC-19: Security Labels"],
          asvs: ["ASVS V4.0 - Mitigations - M4 (Authorization) - M4.2 (Object-Level Authorization)"],
          cmmc: ["Access Control (AC) - Segregated Duties (AC.1) and Least Privilege (AC.3)"],
          ccpa: ["CCPA mandates businesses to implement and maintain reasonable security procedures to protect consumer data from unauthorized access."],
          fips: ["AC - Séparation (Access Control - Separation of Duties) (SC-AC- séparation-1)"],
          fisma: ['A.5 - Access Management (requires strong authentication)',
            'AC-17 - Security Awareness and Training (educates on secure authentication practices)',
            'IA-2 - Identification and Authentication (promotes strong authentication methods)'
          ],
          rbiCSF: ['Control 5: Access Control'],
          description: 'APIs tend to expose endpoints that handle object identifiers, creating a wide attack surface of Object Level Access Control issues. Object level authorization checks should be considered in every function that accesses a data source using an ID from the user.'
        };


      case 'API2:2023 Broken Authentication':
        return {
          cwe: ['CWE-1390: Weak Authentication', 'CWE-306: Missing Authentication for Critical Function'],
          iso27001: ["A.6.1.1 Identification and authentication for access control", "A.6.1.2 User password controls", "A.12.6 Management of security incidents"],
          nistCSF: ["ID (Identify)", "PR (Protect)", "DE (Detect)", "RS (Respond)", "RC (Recover)", "IA-1: Authentication and Identity Management", "IA-2: Multi Factor Authentication", "IA-5: Identity proofing"],
          gdpr: ["Article 5(2): Integrity and confidentiality - Strong authentication helps ensure only authorised users access personal data."],
          pciDSS: ["Requirement 8: Implement strong access control measures - Control 8.1.3: Implement a multi-factor authentication process."],
          hipaa: ["HIPAA Security Rule's Identification and Authentication (4.14) controls by failing to properly verify user identities."],
          mitreATTACK: ["Credential Access (TA1001)", "Brute Force (TA1001.001)", "Password Spraying (TA1001.002)", "Token Replay (TA1005)"],
          nist80053: ["IA-1: Identification", "IA-2: Authentication", "IA-5: Multi Factor Authentication"],
          asvs: ["ASVS V4.0 - Mitigations - M2 (Session Management) - M2.1 (Authentication)"],
          cmmc: ["Authentication (IA) - IA.2: Multifactor Authentication and IA.5: Management of Authentication Systems"],
          ccpa: ["CCPA requires businesses to verify consumer requests and implement security measures to prevent unauthorized access to personal data."],
          fips: ["AU_ none (Authentication - None) (AC-AU- none) discourage weak authentication methods."],
          fisma: ['AC-16 - Access Control (enforces access permissions based on user roles)', 'IA-5 - Role-Based Access Control (RBAC) (implements RBAC for data access control)'],
          rbiCSF: ['Control 5: Access Control'],
          description: 'Authentication mechanisms are often implemented incorrectly, allowing attackers to compromise authentication tokens or to exploit implementation flaws to assume other user\'s identities temporarily or permanently. Compromising a system\'s ability to identify the client/user, compromises API security overall.'
        };


      case 'API3:2023 Broken Object Property Level Authorization':
        return {
          cwe: ['CWE-285: Improper Authorization', 'CWE-639: Authorization Bypass Through User-Controlled Key'],
          iso27001: ["A.6.1.1 Identification and authentication for access control", "A.6.2.1 User access management", "A.9.2.1 Security awareness training"],
          nistCSF: ["AC-1 (Access Enforcement)", "AC-6 (Least Privilege)", "Article 5(2): Integrity and confidentiality - Strong authentication helps ensure only authorised users access personal data."],
          gdpr: ["Requirement 6: Implement a process to manage system vulnerabilities, specifically Control 6.6: Perform periodic reviews of system."],
          pciDSS: ["PCI DSS Requirement 6: Develop and maintain secure systems and applications, specifically Control 6.6: Implement a process to manage system vulnerabilities and Control 7.1: Limit access to cardholder data by business need to know."],
          hipaa: ["HIPAA Security Rule's Access Control (4.16) and Audit (4.26) controls by failing to properly verify user identities."],
          mitreATTACK: ["Resource Hijacking (TA0005)", "User Impersonation (TA0008)", "Lateral Movement (TA0003)"],
          nist80053: ["AC-17: Access Enforcement", "AC-19: Security Labels"],
          asvs: ["ASVS V4.0 - Mitigations - M4 (Authorization) - M4.2 (Object-Level Authorization) and M4.3 (Fine-Grained Access Control)"],
          cmmc: ["Access Control (AC) like AC.1 - Segregated Duties and AC.3 - Least Privilege"],
          ccpa: ["CCPA mandates businesses to implement and maintain reasonable security procedures to protect consumer data from unauthorized access."],
          fips: ["BOLA - AC_ séparation (SC-AC- séparation-1) for access control."],
          fisma: ["AC-16 - Access Control (enforces access permissions based on user roles)", "IA-5 - Role-Based Access Control (RBAC) (implements RBAC for function access control)"],
          rbiCSF: ["Control 6: Data Security"],
          description: 'This category combines API3:2019 Excessive Data Exposure and API6:2019 - Mass Assignment, focusing on the root cause: the lack of or improper authorization validation at the object property level. This leads to information exposure or manipulation by unauthorized parties.'
        };


      case 'API4:2023 Unrestricted Resource Consumption':
        return {
          cwe: ['CWE-400: Uncontrolled Resource Consumption'],
          iso27001: ["A.8.2 Security awareness training", "A.9.4.2 Configuration management", "A.11.3.2 Communication security management"],
          nistCSF: ["DE (Detect), RS (Respond)", "CM-2 (Security Assessment of External Services)", "CM-3 (Security Assessment of Physical Environments)", "CM-4 (Security Assessment of Information Systems and Organizations)"],
          gdpr: ["Article 15: Right of access by the data subject - DoS attacks can disrupt access to personal data, potentially hindering individuals' rights to access their data."],
          pciDSS: ["Requirement 2: Implement strong access controls to limit access to APIs that handle cardholder data.", "Security Misconfiguration and Weakness Management (Requirement 6)", "Monitoring and Detection (Requirement 10)"],
          hipaa: ["HIPAA Security Rule's Availability (4.30) control by impacting system availability."],
          mitreATTACK: ["Resource Exhaustion (TA1012.005)"],
          nist80053: ["CM-2: Configuration Management", "CM-4: Continuous Monitoring"],
          asvs: ["ASVS M1 (Resource Management) - M1.1 (Resource Limits) and M1.2 (Resource Monitoring)"],
          cmmc: ["Security Assessment (SA) controls like SA.2 - System Security Architecture Analysis and SA.6 - Security System Monitoring and Logging"],
          ccpa: ["Implement rate limiting and throttling mechanisms."],
          fips: ["AU_ audit (Audit - None) (AU-AU-12)"],
          fisma: ["SC-4 - System Monitoring (monitors resource usage for anomalies)", "CM-2 - Security Configuration Management (enforces resource limits on APIs)", "CM-3 - Incident Response (establishes procedures to address DoS attacks)"],
          rbiCSF: ["Control 6: Data Security"],
          description: 'Satisfying API requests requires resources such as network bandwidth, CPU, memory, and storage. Other resources such as emails/SMS/phone calls or biometrics validation are made available by service providers via API integrations, and paid for per request. Successful attacks can lead to Denial of Service or an increase of operational costs.'
        };


      case 'API5:2023 Broken Function Level Authorization':
        return {
          cwe: ['CWE-285: Improper Authorization'],
          iso27001: ["A.6.1.1 Identification and authentication for access control", "A.6.2.1 User access management"],
          nistCSF: ["AC-1 (Access Enforcement)", "AC-6 (Least Privilege)"],
          gdpr: ["Article 32: Security of processing - Limiting unauthorized use of functions that could manipulate personal data."],
          pciDSS: ["Requirement 5: Secure applications and systems, specifically Control 5.1 - Develop and maintain secure applications."],
          hipaa: ["HIPAA Security Rule's Access Control (4.16) control by failing to properly restrict access based on user roles."],
          mitreATTACK: ["Defence Evasion (T1027)", "Resource Hijacking (T1195)", "Exploiting API functionality (TA1006)"],
          nist80053: ["CM-2: Configuration Management", "CM-3: System Configuration"],
          asvs: ["WAF configuration - V7 - Web Application Firewalls", "V7.2 - Configuration Management"],
          cmmc: ["System and Communications Protection (SC) controls like SC.7 - Continuous Monitoring and SC.8 - Incident Response. Proper configuration management"],
          ccpa: ["CCPA necessitates appropriate security measures to safeguard consumer data."],
          fips: ["BOLA/BOPLA - AC_ séparation (SC-AC- séparation-1) for access control."],
          fisma: ["AU-7 - Clinger-Cohen Act (requires secure coding practices to prevent vulnerabilities)", "CM-2 - Security Configuration Management (enforces file upload size and type restrictions)"],
          rbiCSF: ["Control 7: System and Network Security"],
          description: 'Complex access control policies with different hierarchies, groups, and roles, and an unclear separation between administrative and regular functions, tend to lead to authorization flaws. By exploiting these issues, attackers can gain access to other users’ resources and/or administrative functions.'
        };



      case 'API6:2023 - Unrestricted Access to Sensitive Business Flows':
        return {
          cwe: ['CWE-352: Improper Access Control', 'CWE-209: Improper Authorization', 'CWE-642: Authentication Bypass'],
          iso27001: ["A.6.1.1 Identification and authentication for access control", "A.8.3 Information classification and labelling", "A.9.3.1 Asset management"],
          nistCSF: ["AC-1 (Access Enforcement)", "AC-6 (Least Privilege)"],
          gdpr: ["Article 32: Security of processing - Safeguards sensitive data flows containing personal information."],
          pciDSS: ["Requirement 7: Identify and authenticate all system components (assets), specifically Control 7.1.1 - Develop and maintain an inventory of all system components."],
          hipaa: ["HIPAA Security Rule's Integrity (4.34) control by enabling unauthorized data modification or disclosure."],
          mitreATTACK: ["Lateral Movement (TA1008)", "Resource Hijacking (T1195)"],
          nist80053: ["SI-7: Implement Secure Coding Practices"],
          asvs: ["V4.0 - Validations - V1 (Data Validation)", "V1.1 (Data Validation at Source)"],
          cmmc: ["Security Assessment (SA) controls like SA.11 - Security Testing and SA.12 - Vulnerability Remediation"],
          ccpa: ["CCPA mandates businesses to detect security incidents involving consumer data."],
          fips: ["AC_ object-reuse (Access Control - Object Reuse) (AC-AC- object-reuse-1)"],
          fisma: ["CM-2 - Security Configuration Management (enforces secure configurations for APIs)", "CM-3 - Incident Response (establishes procedures to address security misconfiguration vulnerabilities)", "CM-4 - Continuous Monitoring (continuously monitors API configurations for vulnerabilities)"],
          rbiCSF: ["Control 6: Data Security"],
          description: 'APIs vulnerable to this risk expose a business flow - such as buying a ticket, or posting a comment - without compensating for how the functionality could harm the business if used excessively in an automated manner. This doesn\'t necessarily come from implementation bugs.'
        };


      case 'API7:2023 - Server Side Request Forgery':
        return {
          cwe: ['CWE-918: Server-Side Request Forgery (SSRF)'],
          iso27001: ["A.6.1.3 Secure coding", "A.11.2.1 Secure configuration for information processing facilities", "A.12.5 Vulnerability and risk management"],
          nistCSF: ["ID (Identify)", "PR (Protect)", "DE (Detect)", "RS (Respond)", "RC (Recover)", "CM-2 (Security Assessment of External Services)"],
          gdpr: ["Article 32: Security of processing - Prevents unauthorized access to internal systems that may store personal data."],
          pciDSS: ["Requirement 6: Implement a process to manage system vulnerabilities, specifically Control 6.1 - Develop and maintain a process to identify, assess, and prioritize vulnerabilities."],
          hipaa: ["HIPAA Security Rule's Physical Safeguards (4.7) and Security Analysis (4.12(c)) controls by failing to implement appropriate security measures."],
          mitreATTACK: ["OS Command Injection (TA1002.001)", "Data Exfiltration (TA1001.004)"],
          nist80053: ["CA-7: Detection Processes", "CA-8: Identification and Assessment"],
          asvs: ["V4.0 - Detection - D1 (Logging & Monitoring) - D1.1 (Security Logging) and D1.2 (Log Monitoring)"],
          cmmc: ["Asset Security (AS) controls like AS.1 - Asset Inventory and AS.2 - Asset Control"],
          ccpa: ["CCPA compels businesses to minimize data collection and limit its use to authorized purposes."],
          fips: ["SC_ security-awareness (Security Awareness and Training) (SC-SC- security-awareness-1)"],
          fisma: ["CM-2 - Security Configuration Management (requires an inventory of all APIs)", "CM-5 - Media Protection (protects API documentation and access credentials)"],
          rbiCSF: ["Control 9: Logical Security"],
          description: 'Server-Side Request Forgery (SSRF) flaws can occur when an API is fetching a remote resource without validating the user-supplied URI. This enables an attacker to coerce the application to send a crafted request to an unexpected destination, even when protected by a firewall or a VPN.'
        };


      case 'API8:2023 Security Misconfiguration':
        return {
          cwe: [
            'CWE-2: Environmental Security Flaws',
            'CWE-16: Configuration Errors',
            'CWE-209: Generation of Error Message Containing Sensitive Information',
            'CWE-319: Cleartext Transmission of Sensitive Information',
            'CWE-388: Error Handling',
            'CWE-444: Inconsistent Interpretation of HTTP Requests',
            'CWE-942: Permissive Cross-domain Policy with Untrusted Domains'
          ],
          iso27001: ["A.9.1.1 Physical and environmental security", "A.9.4.2 Configuration management", "A.12.5 Vulnerability and risk management"],
          nistCSF: ["ID (Identify)", "PR (Protect)", "CM-2 (Security Assessment of External Services)", "CM-3 (Security Assessment of Physical Environments)", "CM-4 (Security Assessment of Information Systems and Organizations)"],
          gdpr: ["Article 32: Security of processing - Misconfigurations can expose personal data."],
          pciDSS: ["Requirement 5: Secure applications and systems", "Requirement 6: Manage system vulnerabilities"],
          hipaa: ["HIPAA Security Rule controls, including Access Control (4.16), Audit (4.26), and Media Disposal (4.5)"],
          mitreATTACK: ["Defence Evasion (T1027)"],
          nist80053: ["AU-7: Audit Logging", "AU-12: Nonrepudiation"],
          asvs: ["V4.0 - Inventory & Control - I1 (Inventory) - I1.1 (Software Inventory)", "V4.0 - Inventory & Control - I2 (Control) - I2.2 (Vulnerability Management)"],
          cmmc: ["Security Assessment (SA) controls like SA.2 - System Security Architecture Analysis", "Security Assessment (SA) controls like SA.6 - Security System Monitoring and Logging"],
          ccpa: ["CCPA emphasizes the importance of reasonable security procedures"],
          fips: ["CM_ configuration-management (Configuration Management) (CM-CM-1)"],
          fisma: ["SE-02 - Security Education and Training (educates developers on secure coding practices to prevent injection attacks)"],
          rbiCSF: ["Control 9: Logical Security"],
          description: 'APIs and the systems supporting them typically contain complex configurations, meant to make the APIs more customizable. Software and DevOps engineers can miss these configurations, or don\'t follow security best practices when it comes to configuration, opening the door for different types of attacks.'
        };



      case 'API9:2023 Improper Inventory Management':
        return {
          cwe: [
            'CWE-611: Improper Resource Management',
            'CWE-643: Failure to Properly Update Software',
            'CWE-828: Missing or Incorrect Security Features'
          ],
          iso27001: ["A.7.1 Inventory of assets", "A.7.4 Transfer of information", "A.8.1 Awareness training"],
          nistCSF: ["ID (Identify)", "PR (Protect)", "CM-2 (Security Assessment of External Services)", "CM-4 (Security Assessment of Information Systems and Organizations)"],
          gdpr: ["Article 24: Weak security practices may fail to meet GDPR's Controller obligations."],
          pciDSS: ["Requirement 6.1: Implement a procedure for identifying all system components", "Control Requirement A6.1: Maintain an inventory of all system components involved in cardholder data processing."],
          hipaa: ["HIPAA Security Rule's Management Awareness (4.1.2(a)) control by lacking comprehensive understanding of all assets handling ePHI."],
          mitreATTACK: ["Brute Force (TA1001.001)", "Exploiting Outdated Software (TA1002.001)"],
          nist80053: ["CM-3: System Configuration"],
          asvs: ["V4.0 - Cryptography - C1 (Secure Communication) - C1.1 (Secure Channels)", "V4.0 - Cryptography - C2 (Data Protection at Rest & In Transit) - C2.1 (Data Encryption at Rest) & C2.2 (Data Encryption in Transit)"],
          cmmc: ["Access Controls AC.1 and AC.3"],
          ccpa: ["CCPA doesn't directly map to asset management, but robust API governance practices indirectly protect data by ensuring up-to-date security."],
          fips: ["CM_ inventory (Configuration Management - Inventory) (CM-CM-2)"],
          fisma: ["AU-12 - Nonrepudiation (ensures logging provides evidence of user actions)", "CM-4 - Continuous Monitoring (monitors API activity for suspicious behaviour)"],
          rbiCSF: ["Control 7: System and Network Security", "Control 9: Logical Security", "Control 10: Incident Management"],
          description: 'APIs tend to expose more endpoints than traditional web applications, making proper and updated documentation highly important. A proper inventory of hosts and deployed API versions also are important to mitigate issues such as deprecated API versions and exposed debug endpoints.'
        };


      case 'API10:2023 Unsafe Consumption of APIs':
        return {
          cwe: ['CWE-20: Improper Input Validation'],
          iso27001: ["A.6.1.3 Secure coding", "A.11.2.1 Secure configuration for information processing facilities", "A.12.5 Vulnerability and risk management"],
          nistCSF: ["DE (Detect)", "SC-7 (Data Loss Prevention)", "SC-8 (Continuous Monitoring)"],
          gdpr: ["Article 24: Weak security practices may struggle to meet GDPR's Controller obligations."],
          pciDSS: ["Requirement 6.6: Implement strong access controls", "Requirement 6.5: Mandate secure configuration of all system components, including APIs."],
          hipaa: ["HIPAA Security Rule's Implementation Specifications (4.12(d)) control by failing to implement appropriate security measures for external components."],
          mitreATTACK: ["Defence Evasion (T1027)", "Exploitation of External Resource (T1133)"],
          nist80053: ["SI-7: Implement Secure Coding Practices"],
          asvs: ["V4.0 - Cryptography - C1 (Secure Communication) - C1.1 (Secure Channels)", "V4.0 - Cryptography - C2 (Data Protection at Rest & In Transit) - C2.1 (Data Encryption at Rest) & C2.2 (Data Encryption in Transit)"],
          cmmc: ["Access Controls AC.1 and AC.3"],
          ccpa: ["CCPA highlights the need for reasonable security procedures."],
          fips: ["CM_ inventory (Configuration Management - Inventory) (CM-CM-2)"],
          fisma: ["SE-02 - Security Education and Training (educates developers on secure coding practices to prevent injection attacks)"],
          rbiCSF: ["Control 5: Access Control"],
          description: 'Developers tend to trust data received from third-party APIs more than user input, and so tend to adopt weaker security standards. In order to compromise APIs, attackers go after integrated third-party services instead of trying to compromise the target API directly.'
        };



      default:
        return {
          cwe: [],
          iso27001: [],
          nistCSF: [],
          gdpr: [],
          pciDSS: [],
          hipaa: [],
          mitreATTACK: [],
          nist80053: [],
          asvs: [],
          cmmc: [],
          ccpa: [],
          fips: [],
          fisma: [],
          rbiCSF: [],
          description: ''
        };
    }
  }


  const override: CSSProperties = {
    display: "block",
    margin: "0 auto",
    borderColor: "red",
  };

  const isFirstTime = useRef(true);


  const fetchAPICompliances = async () => {

    if (isFirstTime) {
      setOnLoading(true);
    }

    const token = localStorage.getItem('ASIToken');
    const response = await axios.get(`/api/v1/complianceMonitoring/getAPICompliances`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    console.log('response.data:', response.data)

    setOwaspCategories(response.data.owaspCategories);

    setOnLoading(false);
  };



  useEffect(() => {

    fetchAPICompliances();

  }, []);


  const columns = [
    {
      label: "",
      options: {
        filter: false,
      }
    },
    {
      label: "OWASP Category",
      options: {
        filter: true,
      }
    },
    {
      label: "Affected Endpoints",
      options: {
        filter: true,
        download: true,
        customBodyRender: (value, tableMeta, updateValue) => {
          
          const displayCount = showAll ? value.length : 2;

    
          return (
            <div style={{
              display: "flex",
              flexDirection: 'column',
              alignItems: "center"
            }}>
              {value.slice(0, displayCount).map((item, index) => (
                <span key={index} style={{
                  padding: 5,
                  width: 600,
                  textAlign: 'left',
                  borderRadius: 10,
                  fontSize: 12,
                  fontWeight: 'normal',
                  marginRight: 5,
                  color: '#000',
                  backgroundColor: '#f7e7ce',
                  margin: 5
                }}>
                  {item}
                </span>
              ))}
              {value.length > 2 && (
                <button 
                  onClick={() => setShowAll(!showAll)}
                  style={{
                    margin: '5px',
                    padding: '5px 10px',
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}
                >
                  {showAll ? 'View Less' : `View ${value.length - 2} More`}
                </button>
              )}
            </div>
          )
        }
      }
    },
    {
      label: "CWE",
      options: {
        filter: true,
        download: true,
        customBodyRender: (value, tableMeta, updateValue) => {
          return (
            <div style={{
              display: "flex",
              flexDirection: 'column',
              alignItems: "center"
            }} >
              {value.map((item, index) => (
                <>
                  <span key={index} style={{
                    padding: 5,
                    width: 120,
                    textAlign: 'center',
                    borderRadius: 10,
                    fontSize: 12,
                    fontWeight: 'normal',
                    marginRight: 5,
                    color: '#000',
                    backgroundColor: '#b6b0ff',
                    margin: 5
                  }}>
                    {item}
                  </span>

                </>
              ))}
            </div>
          )
        }
      }
    },
    {
      label: "Vulnerability Description",
      options: {
        filter: true,
      }
    },
    {
      label: "ISO 27001",
      options: {
        filter: true,
        download: true,
        customBodyRender: (value, tableMeta, updateValue) => {
          return (
            <div style={{
              display: "flex",
              flexDirection: 'column',
              alignItems: "center"
            }} >
              {value.map((item, index) => (
                <>
                  <span key={index} style={{
                    padding: 5,
                    width: 120,
                    textAlign: 'center',
                    borderRadius: 10,
                    fontSize: 12,
                    fontWeight: 'normal',
                    marginRight: 5,
                    color: '#000',
                    backgroundColor: '#abcdef',
                    margin: 5
                  }}>
                    {item}
                  </span>

                </>
              ))}
            </div>
          )
        }
      }
    },
    {
      label: "NIST CSF",
      options: {
        filter: true,
        download: true,
        customBodyRender: (value, tableMeta, updateValue) => {
          return (
            <div style={{
              display: "flex",
              flexDirection: 'column',
              alignItems: "center"
            }} >
              {value.map((item, index) => (
                <>
                  <span key={index} style={{
                    padding: 5,
                    width: 120,
                    textAlign: 'center',
                    borderRadius: 10,
                    fontSize: 12,
                    fontWeight: 'normal',
                    marginRight: 5,
                    color: '#000',
                    backgroundColor: '#ffc0cb',
                    margin: 5
                  }}>
                    {item}
                  </span>

                </>
              ))}
            </div>
          )
        }
      }
    },
    {
      label: "GDPR",
      options: {
        filter: true,
        download: true,
        customBodyRender: (value, tableMeta, updateValue) => {
          return (
            <div style={{
              display: "flex",
              flexDirection: 'column',
              alignItems: "center"
            }} >
              {value.map((item, index) => (
                <>
                  <span key={index} style={{
                    padding: 5,
                    width: 120,
                    textAlign: 'center',
                    borderRadius: 10,
                    fontSize: 12,
                    fontWeight: 'normal',
                    marginRight: 5,
                    color: '#000',
                    backgroundColor: '#f0fff0',
                    margin: 5
                  }}>
                    {item}
                  </span>

                </>
              ))}
            </div>
          )
        }
      }
    },
    {
      label: "PCI DSS",
      options: {
        filter: true,
        download: true,
        customBodyRender: (value, tableMeta, updateValue) => {
          return (
            <div style={{
              display: "flex",
              flexDirection: 'column',
              alignItems: "center"
            }} >
              {value.map((item, index) => (
                <>
                  <span key={index} style={{
                    padding: 5,
                    width: 120,
                    textAlign: 'center',
                    borderRadius: 10,
                    fontSize: 12,
                    fontWeight: 'normal',
                    marginRight: 5,
                    color: '#000',
                    backgroundColor: '#ffb6c1',
                    margin: 5
                  }}>
                    {item}
                  </span>

                </>
              ))}
            </div>
          )
        }
      }
    },
    {
      label: "HIPAA",
      options: {
        filter: true,
        download: true,
        customBodyRender: (value, tableMeta, updateValue) => {
          return (
            <div style={{
              display: "flex",
              flexDirection: 'column',
              alignItems: "center"
            }} >
              {value.map((item, index) => (
                <>
                  <span key={index} style={{
                    padding: 5,
                    width: 120,
                    textAlign: 'center',
                    borderRadius: 10,
                    fontSize: 12,
                    fontWeight: 'normal',
                    marginRight: 5,
                    color: '#000',
                    backgroundColor: '#ffdab9',
                    margin: 5
                  }}>
                    {item}
                  </span>

                </>
              ))}
            </div>
          )
        }
      }
    },
    {
      label: "MITRE ATT&CK",
      options: {
        filter: true,
        download: true,
        customBodyRender: (value, tableMeta, updateValue) => {
          return (
            <div style={{
              display: "flex",
              flexDirection: 'column',
              alignItems: "center"
            }} >
              {value.map((item, index) => (
                <>
                  <span key={index} style={{
                    padding: 5,
                    width: 120,
                    textAlign: 'center',
                    borderRadius: 10,
                    fontSize: 12,
                    fontWeight: 'normal',
                    marginRight: 5,
                    color: '#000',
                    backgroundColor: '#e6e6fa',
                    margin: 5
                  }}>
                    {item}
                  </span>

                </>
              ))}
            </div>
          )
        }
      }
    },
    {
      label: "NIST 800-53",
      options: {
        filter: true,
        download: true,
        customBodyRender: (value, tableMeta, updateValue) => {
          return (
            <div style={{
              display: "flex",
              flexDirection: 'column',
              alignItems: "center"
            }} >
              {value.map((item, index) => (
                <>
                  <span key={index} style={{
                    padding: 5,
                    width: 120,
                    textAlign: 'center',
                    borderRadius: 10,
                    fontSize: 12,
                    fontWeight: 'normal',
                    marginRight: 5,
                    color: '#000',
                    backgroundColor: '#fffdd0',
                    margin: 5
                  }}>
                    {item}
                  </span>

                </>
              ))}
            </div>
          )
        }
      }
    },
    {
      label: "ASVS",
      options: {
        filter: true,
        download: true,
        customBodyRender: (value, tableMeta, updateValue) => {
          return (
            <div style={{
              display: "flex",
              flexDirection: 'column',
              alignItems: "center"
            }} >
              {value.map((item, index) => (
                <>
                  <span key={index} style={{
                    padding: 5,
                    width: 120,
                    textAlign: 'center',
                    borderRadius: 10,
                    fontSize: 12,
                    fontWeight: 'normal',
                    marginRight: 5,
                    color: '#000',
                    backgroundColor: '#f08080',
                    margin: 5
                  }}>
                    {item}
                  </span>

                </>
              ))}
            </div>
          )
        }
      }
    },
    {
      label: "CMMC",
      options: {
        filter: true,
        download: true,
        customBodyRender: (value, tableMeta, updateValue) => {
          return (
            <div style={{
              display: "flex",
              flexDirection: 'column',
              alignItems: "center"
            }} >
              {value.map((item, index) => (
                <>
                  <span key={index} style={{
                    padding: 5,
                    width: 120,
                    textAlign: 'center',
                    borderRadius: 10,
                    fontSize: 12,
                    fontWeight: 'normal',
                    marginRight: 5,
                    color: '#000',
                    backgroundColor: '#87ceeb',
                    margin: 5
                  }}>
                    {item}
                  </span>

                </>
              ))}
            </div>
          )
        }
      }
    },
    {
      label: "CCPA",
      options: {
        filter: true,
        download: true,
        customBodyRender: (value, tableMeta, updateValue) => {
          return (
            <div style={{
              display: "flex",
              flexDirection: 'column',
              alignItems: "center"
            }} >
              {value.map((item, index) => (
                <>
                  <span key={index} style={{
                    padding: 5,
                    width: 120,
                    textAlign: 'center',
                    borderRadius: 10,
                    fontSize: 12,
                    fontWeight: 'normal',
                    marginRight: 5,
                    color: '#000',
                    backgroundColor: '#fffff0',
                    margin: 5
                  }}>
                    {item}
                  </span>

                </>
              ))}
            </div>
          )
        }
      }
    },
    {
      label: "FIPS",
      options: {
        filter: true,
        download: true,
        customBodyRender: (value, tableMeta, updateValue) => {
          return (
            <div style={{
              display: "flex",
              flexDirection: 'column',
              alignItems: "center"
            }} >
              {value.map((item, index) => (
                <>
                  <span key={index} style={{
                    padding: 5,
                    width: 120,
                    textAlign: 'center',
                    borderRadius: 10,
                    fontSize: 12,
                    fontWeight: 'normal',
                    marginRight: 5,
                    color: '#000',
                    backgroundColor: '#f5deb3',
                    margin: 5
                  }}>
                    {item}
                  </span>

                </>
              ))}
            </div>
          )
        }
      }
    },
    {
      label: "FISMA",
      options: {
        filter: true,
        download: true,
        customBodyRender: (value, tableMeta, updateValue) => {
          return (
            <div style={{
              display: "flex",
              flexDirection: 'column',
              alignItems: "center"
            }} >
              {value.map((item, index) => (
                <>
                  <span key={index} style={{
                    padding: 5,
                    width: 120,
                    textAlign: 'center',
                    borderRadius: 10,
                    fontSize: 12,
                    fontWeight: 'normal',
                    marginRight: 5,
                    color: '#000',
                    backgroundColor: '#f7e7ce',
                    margin: 5
                  }}>
                    {item}
                  </span>

                </>
              ))}
            </div>
          )
        }
      }
    },
    {
      label: "RBI CSF",
      options: {
        filter: true,
        download: true,
        customBodyRender: (value, tableMeta, updateValue) => {
          return (
            <div style={{
              display: "flex",
              flexDirection: 'column',
              alignItems: "center"
            }} >
              {value.map((item, index) => (
                <>
                  <span key={index} style={{
                    padding: 5,
                    width: 120,
                    textAlign: 'center',
                    borderRadius: 10,
                    fontSize: 12,
                    fontWeight: 'normal',
                    marginRight: 5,
                    color: '#000',
                    backgroundColor: '#98fb98',
                    margin: 5
                  }}>
                    {item}
                  </span>

                </>
              ))}
            </div>
          )
        }
      }
    },


  ];

  const getMuiTheme = () => createTheme({
    components: {
      MUIDataTableBodyCell: {
        styleOverrides: {
          root: {
            textAlign: "left",
            '&:nth-child(1)': {
              width: 30,
            },
          }
        }
      },
      MUIDataTableHeadCell: {
        styleOverrides: {
          root: {
            textAlign: "left",
            '&:nth-child(1)': {
              width: 30,
            },
          }
        }
      },

    }
  })


  const options = {
    filterType: "dropdown",
    responsive: "stacked",
    elevation: 0, //for table shadow box
    filter: true,
    download: true,
    print: true,
    search: true,
    searchOpen: true,
    viewColumns: true,
    selectableRows: false, // <===== will turn off checkboxes in rows
    rowsPerPage: 20,
    rowsPerPageOptions: [],
    pagination: false,
    textLabels: {
      body: {
        noMatch: 'No data found',
      }
    }
  };


  var uniqueOWASPCats = [];

  for (var i = 0; i < owaspCategories.length; i++) {

    var cat = owaspCategories[i];

    console.log('cat:', cat)

    if (!(uniqueOWASPCats.includes(cat.category))) {
      uniqueOWASPCats.push({category:cat.category, endpoints:cat.endpoints});
      
    }
  }

  console.log('uniqueOWASPCats:', uniqueOWASPCats)



  var tableData = [];


  for (var i = 0; i < uniqueOWASPCats.length; i++) {

    var dataItem = [];

    dataItem.push(i + 1);

    dataItem.push(uniqueOWASPCats[i].category);

    var compliances = getComplianceMappings(uniqueOWASPCats[i].category)

    console.log('uniqueOWASPCats[i]:', uniqueOWASPCats[i])

    dataItem.push(uniqueOWASPCats[i].endpoints);


    dataItem.push(compliances.cwe); // Description

    dataItem.push(compliances.description); // Description

    dataItem.push(compliances.iso27001); // ISO 27001

    dataItem.push(compliances.nistCSF);  // NIST CSF
    dataItem.push(compliances.gdpr);  // GDPR
    dataItem.push(compliances.pciDSS);  // PCI DSS
    dataItem.push(compliances.hipaa);  // HIPAA
    dataItem.push(compliances.mitreATTACK) // MITRE ATT&CK
    dataItem.push(compliances.nist80053); // NIST 800-53
    dataItem.push(compliances.asvs); // ASVS
    dataItem.push(compliances.cmmc); // CMMC
    dataItem.push(compliances.ccpa) // CCPA
    dataItem.push(compliances.fips); // FIPS
    dataItem.push(compliances.fisma); // FISMA
    dataItem.push(compliances.rbiCSF) // RBI CSF

    tableData.push(dataItem);
  }


  return (
    <div className="activeScans">


      <div style={{ width: '100%' }}>
        <div>
          <div style={{ marginBottom: '2rem', display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>

            <span className="pageHeader">API Compliances</span>

          </div>


          {onLoading &&
            <ShimmerTable row={8} col={10} />
          }


          {!onLoading &&
            <>

              <ThemeProvider theme={getMuiTheme()}>
                <MUIDataTable
                  style={{ height: "57vh" }}
                  data={tableData}
                  columns={columns}
                  options={options}
                />
              </ThemeProvider>

            </>
          }

        </div>
      </div>
    </div>
  )
}

export default APICompliances



