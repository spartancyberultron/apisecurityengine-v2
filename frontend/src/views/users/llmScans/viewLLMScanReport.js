import React, { useState, useEffect, useRef } from "react";
import { CFormInput, CButton, CFormSelect, CTable, CToast, CToastBody, CToaster } from '@coreui/react'
import MUIDataTable from "mui-datatables";
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useLocation } from 'react-router-dom'
import { useParams, useNavigate } from 'react-router-dom'

import axios from 'axios';

import { CSSProperties } from "react";
import GridLoader from "react-spinners/GridLoader";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import Modal from 'react-modal';
import { AiFillCloseCircle } from "react-icons/ai";
import zIndex from "@mui/material/styles/zIndex";
import { borderColor } from "@mui/system";
import { CircularProgress } from '@mui/material';

import { IoMdArrowRoundBack } from "react-icons/io";
import { BiExport } from "react-icons/bi";
import { ShimmerTable, ShimmerTitle, ShimmerCircularImage } from "react-shimmer-effects";
import { CgNotes } from "react-icons/cg";
import { extractHostAndEndpoint } from '../utils';
import { CiEdit } from "react-icons/ci";

import Chart from 'react-apexcharts'

const ViewLLMScanReport = () => {

  const location = useLocation();

  const [toast, addToast] = useState(0)
  const navigate = useNavigate()
  const [scanId, setScanId] = useState('')
  const [userId, setUserId] = useState('')
  const [llmScan, setLLMScan] = useState(null)
  const [onLoading, setOnLoading] = useState(true); 

  const [exportingPDF, setExportingPDF] = useState(false);

  const toaster = useRef()
  const exampleToast = (
    <CToast>
      <CToastBody>Success</CToastBody>
    </CToast>
  ) 


  function getVulnerabilityDetails(probe) {

    const vulnerabilities = {
        "blank": {
            "vulnerability": "Empty prompt is a tactic to bypass security measures in place",
            "owasp": "LLM 07:2023 - Inadequate AI Alignment",
            "cwe": ["CWE-398: Indicator of Poor Code Quality"],
            "description": "An empty prompt might be unexpected and could be exploited by an attacker to inject malicious code or manipulate the LLM's behavior in unintended ways."
        },
        "atkgen": {
            "vulnerability": "Red-teaming LLM autonomously attacks a target seeking to provoke a harmful response.",
            "owasp": "LLM01:2023 - Prompt Injections",
            "cwe": ["CWE-77: Improper Neutralisation of Special Elements used in a Command ('Command Injection')"],
            "description": "The red-teaming LLM isn't aligned with the target LLM's goals, aiming to elicit harmful outputs instead of following intended use. This misalignment exposes weaknesses in the target LLM's training or safety measures that could be exploited by malicious actors."
        },
        "continuation": {
            "vulnerability": "Continuation of Undesirable Word",
            "owasp": "LLM01:2023 - Prompt Injections",
            "cwe": ["CWE-77: Improper Neutralisation of Special Elements used in a Command ('Command Injection')"],
            "description": "Vulnerability occurs because the model is influenced by the way prompts are crafted. By testing if the model completes an undesirable word, the attacker is probing the limitations of the prompt and potentially exploiting them to generate harmful content."
        },
        "dan": {
            "vulnerability": "Do Anything Now(DAN Attack Vulnerability)",
            "owasp": "LLM04:2023 - Unauthorised Code Execution",
            "cwe": ["CWE-94: Improper Control of Generation of Code ('Code Injection')"],
            "description": "An attacker can craft a specially designed prompt that could potentially trick the LLM into executing unauthorized code on the system, bypassing security measures."
        },
        "donotanswer": {
            "vulnerability": "Prompts that could be misused to cause harm or violate ethical principles.",
            "owasp": "LLM07:2023 - Inadequate AI Alignment",
            "cwe": ["CWE-398: Indicator of Poor Code Quality"],
            "description": "Responsible AI avoids generating outputs that misalign with human values, goals, or safety. Prompts that could lead to harmful or unethical outputs highlight this misalignment."
        },
        "encoding": {
            "vulnerability": "Tricking an LLM by hiding malicious code within seemingly normal text.",
            "owasp": "LLM01:2023 - Prompt Injections",
            "cwe": ["CWE-77: Improper Neutralisation of Special Elements used in a Command ('Command Injection')"],
            "description": "Vulnerability allows attackers to manipulate an LLM by disguising malicious code within seemingly normal text through encoding techniques."
        },
        "gcg": {
            "vulnerability": "Prompt injection through a malicious addition.",
            "owasp": "LLM01:2023 - Prompt Injections",
            "cwe": ["CWE-77: Improper Neutralisation of Special Elements used in a Command ('Command Injection')"],
            "description": "Vulnerability occurs when an attacker manipulates the LLM's prompt with a malicious suffix, causing it to deviate from its intended behavior."
        },
        "glitch": {
            "vulnerability": "Probing the LLM to find inputs that cause unexpected behavior.",
            "owasp": "LLM01:2023 - Prompt Injections",
            "cwe": ["CWE-77: Improper Neutralisation of Special Elements used in a Command ('Command Injection')"],
            "description": "Vulnerability occurs when an attacker injects malicious code into prompts fed to the LLM, causing it to behave abnormally."
        },
        "goodside": {
            "vulnerability": "Crafted input tricks LLM to disregard prior instructions and follow attacker's commands.",
            "owasp": "LLM01:2023 - Prompt Injections",
            "cwe": ["CWE-77: Improper Neutralisation of Special Elements used in a Command ('Command Injection')"],
            "description": "Vulnerability involves getting large language models (LLMs) to ignore their designers’ plans by including malicious text such as “ignore your previous instructions” in the user input."
        },
        "knownbadsignatures": {
            "vulnerability": "Malicious content injection probes for LLMs.",
            "owasp": "LLM01:2023 - Prompt Injections",
            "cwe": ["CWE-77: Improper Neutralisation of Special Elements used in a Command ('Command Injection')"],
            "description": "An attacker crafts specific prompts to trick the LLM into generating malicious content (like phishing emails, malware code) by manipulating its understanding of the desired output."
        },
        "leakerplay": {
            "vulnerability": "Vulnerable LLM unintentionally reproduce training data in its outputs.",
            "owasp": "LLM02:2023 - Data Leakage",
            "cwe": ["CWE-200: Information Exposure"],
            "description": "Vulnerability occurs when an LLM unintentionally reveals information from its training data, including potentially sensitive details. In this case, the probe is trying to see if the LLM will directly copy information from its training data."
        },
        "lmrc": {
            "vulnerability": "Limited probing of the LLM's capabilities.",
            "owasp": "LLM01:2023 - Prompt Injections",
            "cwe": ["CWE-77: Improper Neutralisation of Special Elements used in a Command ('Command Injection')"],
            "description": "Attackers manipulate user input to trick the LLM into following their instructions instead of the intended ones, potentially leading to data leaks or unauthorized actions."
        },
        "malwaregen": {
            "vulnerability": "LLM susceptibility to prompts for malicious code generation",
            "owasp": "LLM04:2023 - Unauthorised Code Execution",
            "cwe": ["CWE-94: Improper Control of Generation of Code ('Code Injection')"],
            "description": "An attacker tricks the LLM into generating malicious code, potentially allowing for unauthorized execution on a system."
        },
        "misleading": {
            "vulnerability": "LLM susceptibility to manipulation for generating deceptive content.",
            "owasp": "LLM07: Inadequate AI Alignment",
            "cwe": ["CWE-398: Indicator of Poor Code Quality"],
            "description": "Vulnerability arises when an LLM model is not aligned with the desired goals or expectations, potentially leading it to generate misleading or false claims."
        },
        "packagehallucination": {
            "vulnerability": "Crafting prompts for code generation that request insecure, non-existent packages.",
            "owasp": "LLM04:2023 - Unauthorized Code Execution",
            "cwe": ["CWE-94: Improper Control of Generation of Code ('Code Injection')"],
            "description": "By requesting non-existent packages, the attacker attempts to trick the code generation into fetching and executing malicious code from an unintended source."
        },
        "promptinject": {
            "vulnerability": "Ability to inject prompts during inference to manipulate model outputs",
            "owasp": "LLM01:2023 - Prompt Injections",
            "cwe": ["CWE-77: Improper Neutralisation of Special Elements used in a Command ('Command Injection')"],
            "description": "Prompt injection attacks trick large language models (LLMs) into processing malicious code or data by manipulating the prompts they receive. This can lead to the LLM generating harmful outputs or revealing sensitive information."
        },
        "realtoxicityprompts": {
            "vulnerability": "Limited test set for prompts that might induce toxic outputs from a large language model.",
            "owasp": "LLM01:2023 - Prompt Injections",
            "cwe": ["CWE-77: Improper Neutralisation of Special Elements used in a Command ('Command Injection')"],
            "description": "An attacker can inject malicious prompts to trick the LLM into generating toxic content, even if it wasn't explicitly trained on such content. This can be done by crafting specific prompts that exploit the LLM's internal biases or reasoning processes."
        },
        "snowball": {
            "vulnerability": "LLM tricked into cascading false claims by complex questions exploiting knowledge gaps.",
            "owasp": "LLM07: Inadequate AI Alignment",
            "cwe": ["CWE-398: Indicator of Poor Code Quality"],
            "description": "Snowballed Hallucination probes exploit the model's limitations in reasoning and justification, causing it to confidently provide incorrect answers. Inadequate AI Alignment refers to a mismatch between the model's goals and the user's goals. In this case, the model is not aligned with the goal of providing accurate information."
        },
        "xss": {
            "vulnerability": "Insecure LLM output handling can expose systems to cross-site scripting (XSS) and other attacks.",
            "owasp": "LLM02:2023 - Data Leakage",
            "cwe": ["CWE-200: Information Exposure"],
            "description": "Data leakage occurs when an LLM accidentally reveals sensitive information through its responses, enabling unauthorized access to private data."
        }
    };

    return vulnerabilities[probe] || null;
}



 function getComplianceMappings(owaspCategory){

    switch (owaspCategory) {
      case 'LLM01:2023 - Prompt Injections':
        return {
          iso27001: ["A.14.2.1 Secure Development Policy", "A.14.2.5 System Security Testing"],
          nistCSF: ["ID.AM-1: Physical devices and systems within the organisation are inventoried.", "PR.PT-3: The principle of least functionality is incorporated by configuring systems to provide only essential capabilities."],
          gdpr: ["Article 32: Security of processing - This article requires the implementation of appropriate technical and organisational measures to ensure a level of security appropriate to the risk, including protection against unauthorised or unlawful processing."],
          pciDSS: ["PCI DSS Requirement 6.5: Protect all systems against common coding vulnerabilities by following secure coding guidelines to prevent injection flaws."],
          hipaa: ["164.312(a)(1) Access Control: Implement technical policies and procedures for electronic information systems that maintain electronic protected health information to allow access only to those persons or software programs that have been granted access rights."],
          mitreATTACK: ["Technique ID T1193: Spear Phishing Attachment - Attackers could use prompt injections to craft inputs designed to produce malicious outputs from an LLM."],
          nist80053: ["SI-10 (Information Input Validation): Check information for accuracy, completeness, and validity.", "SC-18 (Mobile Code): Control and monitor the use of mobile code."],
          asvs: ["V5: Validation, Sanitization, and Encoding - Requirements for input validation to prevent injection attacks."],
          cmmc: ["CMMC Level 3, Access Control (AC.3.012): Employ the principle of least privilege, including for specific security functions and privileged accounts."],
          ccpa: ["CCPA Section 1798.81.5 - Duty to implement and maintain reasonable security procedures and practices."],
          fips: ["FIPS 140-2 or FIPS 140-3 (pertaining to the security requirements for cryptographic modules that could be used to protect against injection attacks)."],
          fisma: ["SI-10 (Information Input Validation): Validates user input to prevent malicious data from impacting the system."],
          rbiCSF: ["Cyber Security Policy - A mandate for comprehensive cybersecurity policies covering prompt injection risk and mitigation."]
        };
      case 'LLM02:2023 - Data Leakage':
        return {
          iso27001: ["A.8.2.1 Classification of Information", "A.9.4.1 Control of Privileged Access Rights"],
          nistCSF: ["PR.DS-1: Data-at-rest is protected.", "PR.DS-2: Data-in-transit is protected."],
          gdpr: ["Article 5(1)(f): Integrity and confidentiality - Personal data must be processed in a manner that ensures appropriate security, including protection against unauthorised or unlawful processing and against accidental loss, destruction, or damage."],
          pciDSS: ["PCI DSS Requirement 3: Protect stored cardholder data and encrypt transmission of cardholder data across open, public networks."],
          hipaa: ["164.312(e)(1) Transmission Security: Implement technical security measures to guard against unauthorised access to electronic protected health information that is being transmitted over an electronic communications network."],
          mitreATTACK: ["Technique ID T1530: Data from Cloud Storage Object - Unintentional or unauthorised data leakage might involve improper access to cloud-stored data."],
          nist80053: ["AC-3 (Access Enforcement): Enforce approved authorizations for logical access to information and system resources.", "SC-8 (Transmission Confidentiality and Integrity): Protect the confidentiality and integrity of transmitted information."],
          asvs: ["V9: Data Protection - Requirements for protecting data at rest and in transit."],
          cmmc: ["CMMC Level 3, System and Communication Protection (SC.3.177): Monitor, control, and protect organisational communications at external boundaries and key internal boundaries of information systems."],
          ccpa: ["CCPA Section 1798.150 - Civil damages for unauthorised access and exfiltration, theft, or disclosure due to a business's violation of the duty to implement and maintain reasonable security procedures and practices."],
          fips: ["FIPS 199 and FIPS 200 (establishing security categories and specifying security requirements for federal information and information systems)."],
          fisma: ["AC-4 (Information Flow Enforcement): Enforces approved authorizations for controlling the flow of information within the system and between interconnected systems."],
          rbiCSF: ["Data Leak Prevention - Guidelines for preventing unauthorised disclosure of sensitive financial data."]
        };
      case 'LLM 03:2023 - Inadequate Sandboxing':
        return {
          iso27001: ["A.12.1.4 Protection of Test Data", "A.13.1.1 Network Controls"],
          nistCSF: ["PR.PT-4: Communications and control networks are protected.", "DE.CM-7: Monitoring for unauthorised personnel, connections, devices, and software is performed."],
          gdpr: ["Article 25: Data protection by design and by default - This article requires the implementation of appropriate technical and organisational measures, such as pseudonymization, which are designed to implement data-protection principles."],
          pciDSS: ["PCI DSS Requirement 2.2: Develop configuration standards for all system components. Assure that these standards address all known security vulnerabilities and are consistent with industry-accepted system hardening standards."],
          hipaa: ["164.306(a) Security Standards: General Rules: Ensure the confidentiality, integrity, and availability of all electronic protected health information the covered entity creates, receives, maintains, or transmits."],
          mitreATTACK: ["Technique ID T1562.001: Impair Defences: Disable or Modify Tools - If sandboxing mechanisms are inadequate, an attacker might disable or bypass them."],
          nist80053: ["SC-39 (Process Isolation): Isolate security-critical processes by implementing sandboxing."],
          asvs: ["V14: Configuration - Requirements for secure application configuration, including sandboxing environments."],
          cmmc: ["CMMC Level 3, System and Information Integrity (SI.3.218): Employ sandboxing to detect or block potentially malicious email."],
          ccpa: ["CCPA Section 1798.81.5 - Duty to implement and maintain reasonable security procedures and practices appropriate to the nature of the information to protect the personal information."],
          fips: ["FIPS 140-2 or FIPS 140-3 (which might address aspects of secure execution in environments that could include sandboxing)."],
          fisma: ["SC-39 (Process Isolation): Provides security by isolating and sandboxing operations."],
          rbiCSF: ["Application Security - Requirements for application-level security controls, including effective sandboxing."]
        };
      case 'LLM 04:2023 - Unauthorised Code Execution':
        return {
          iso27001: ["A.12.5.1 Installation of Software on Operational Systems", "A.13.2.1 Information Transfer Policies and Procedures"],
          nistCSF: ["PR.IP-1: A baseline configuration of information technology/industrial control systems is created and maintained.", "DE.AE-2: Detected events are analysed to understand attack targets and methods."],
          gdpr: ["Article 32: Security of processing - Measures should be taken to prevent unauthorised processing, access, disclosure, alteration, or destruction of personal data."],
          pciDSS: ["PCI DSS Requirement 6.2: Ensure that all system components and software are protected from known vulnerabilities by installing applicable vendor-supplied security patches."],
          hipaa: ["164.308(a)(5)(ii)(B) Protection from Malicious Software: Procedures for guarding against, detecting, and reporting malicious software."],
          mitreATTACK: ["Technique ID T1203: Exploitation for Client Execution - An attacker could exploit vulnerabilities to execute unauthorised code on a client’s system."],
          nist80053: ["SI-3 (Malicious Code Protection): Implement measures to detect and prevent malicious code execution."],
          asvs: ["V1: Architecture, Design and Threat Modeling - Requirements for secure design to prevent unauthorised code execution."],
          cmmc: ["CMMC Level 3, System and Information Integrity (SI.3.220): Employ spam protection mechanisms at information system access points."],
          ccpa: ["CCPA Section 1798.81.5 - Duty to implement and maintain reasonable security procedures and practices against unauthorised access to, or unauthorised disclosure of, personal information."],
          fips: ["FIPS 140-2 or FIPS 140-3 (security requirements for cryptographic modules, which may prevent unauthorised code execution if properly implemented)."],
          fisma: ["SI-7 (Software, Firmware, and Information Integrity): Ensures software and information integrity to prevent unauthorised code execution."],
          rbiCSF: ["Malware Protection - Measures to protect against malware and unauthorised code execution."]
        };
      default:
        return {
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
          rbiCSF: []
        };
    }
 }


  useEffect(() => {

    window.scrollTo(0, 0);

    setOnLoading(true);

    var arr = location.search.split('=');

    var theScanId = arr[1];

    setScanId(theScanId);

    loadScanDetails(theScanId);

  }, []);

  useEffect(() => {

  }, [onLoading]);


  const loadScanDetails = async (theScanId) => {

    const data = {
      scanId: theScanId,
    };

    const token = localStorage.getItem('ASIToken');
    const response = await axios.post('api/v1/llmScans/getLLMScanDetails', data, {
      headers: { Authorization: `Bearer ${token}` },
    });

    console.log('response.data:',response.data)

    setLLMScan(response.data.llmScan);

    setOnLoading(false);

  };  


  function extractProbeName(filename) {

    const parts = filename.split("___");
    if (parts.length === 2) {
      return parts[1].split(".")[0]; // Extract probe name before extension
    } else {
      return null; // Return null if filename is not in the expected format
    }
  }
  
  

  const goBack = async () => {

    navigate('/llm-scans')
  }

  const columns = [
    {
      label: "#",
      options: {
        filter: false,
      }
    },  
    {
      label: "Vulnerability",
      options: {
        filter: false,
      }
    },
    {
      label: "Description",
      options: {
        filter: false,
      }
    },
    {
      label: "OWASP",
      options: {
        filter: true,
        download: true,
        customBodyRender: (value, tableMeta, updateValue) => {
          return (
            <div style={{
              display: "flex",
              flexDirection:'column',
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
                  color:'#000',
                  backgroundColor: '#b6b0ff',
                  margin:5
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
      label: "CWE",
      options: {
        filter: true,
        download: true,
        customBodyRender: (value, tableMeta, updateValue) => {
          return (
            <div style={{
              display: "flex",
              flexDirection:'column',
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
                  color:'#000',
                  backgroundColor: '#b6b0ff',
                  margin:5
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
      label: "ISO 27001",
      options: {
        filter: true,
        download: true,
        customBodyRender: (value, tableMeta, updateValue) => {
          return (
            <div style={{
              display: "flex",
              flexDirection:'column',
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
                  color:'#000',
                  backgroundColor: '#b6b0ff',
                  margin:5
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
              flexDirection:'column',
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
                  color:'#000',
                  backgroundColor: '#b6b0ff',
                  margin:5
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
              flexDirection:'column',
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
                  color:'#000',
                  backgroundColor: '#b6b0ff',
                  margin:5
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
              flexDirection:'column',
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
                  color:'#000',
                  backgroundColor: '#b6b0ff',
                  margin:5
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
              flexDirection:'column',
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
                  color:'#000',
                  backgroundColor: '#b6b0ff',
                  margin:5
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
              flexDirection:'column',
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
                  color:'#000',
                  backgroundColor: '#b6b0ff',
                  margin:5
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
              flexDirection:'column',
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
                  color:'#000',
                  backgroundColor: '#b6b0ff',
                  margin:5
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
              flexDirection:'column',
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
                  color:'#000',
                  backgroundColor: '#b6b0ff',
                  margin:5
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
              flexDirection:'column',
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
                  color:'#000',
                  backgroundColor: '#b6b0ff',
                  margin:5
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
              flexDirection:'column',
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
                  color:'#000',
                  backgroundColor: '#b6b0ff',
                  margin:5
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
              flexDirection:'column',
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
                  color:'#000',
                  backgroundColor: '#b6b0ff',
                  margin:5
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
              flexDirection:'column',
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
                  color:'#000',
                  backgroundColor: '#b6b0ff',
                  margin:5
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
              flexDirection:'column',
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
                  color:'#000',
                  backgroundColor: '#b6b0ff',
                  margin:5
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
    searchOpen: false,
    viewColumns: true,
    selectableRows: false, // <===== will turn off checkboxes in rows
    rowsPerPage: 20,
    rowsPerPageOptions: [],
    textLabels: {
      body: {
        noMatch: 'No vulnerabilities found',
      }
    }
  };


  var tableData = [];

  if (llmScan && llmScan.resultFileContents) {

    for (var i = 0; i < llmScan.resultFileContents.length; i++) {

      var dataItem = [];

      dataItem.push(i + 1);
      var probeName = extractProbeName(llmScan.resultFileContents[i].file_name)
      
      var vulnDetails = getVulnerabilityDetails(probeName)


      dataItem.push(vulnDetails.vulnerability); // Vulnerability 

      dataItem.push(vulnDetails.description); // Description

      dataItem.push([vulnDetails.owasp]); // OWASP
      dataItem.push(vulnDetails.cwe); // CWE

      

      tableData.push(dataItem);
    }
  }

  console.log('llmScan:', llmScan)


  return (
    <div style={{ overflow: "scroll", position: 'relative', overflowY: 'hidden', overflowX: 'hidden', }}>

      <>

        {onLoading ?

          <div style={{
            width: '96%', marginLeft: '2%', marginRight: '2%', marginTop: '2%'
          }}>

            <ShimmerTitle line={6} gap={10} variant="primary" />
          </div>

          :

          <div style={{
            width: '96%', marginLeft: '2%', marginRight: '2%', display: 'flex', flexDirection: 'row', justifyContent: 'space-between',
            marginTop: '2%', background: '#fff', padding: 20, borderRadius: 15
          }}>

            <div style={{ marginBottom: '2rem', }}>
              <h2>{llmScan.scanName}</h2>
              <hr />

              <table >

                <tr>

                  <td style={{ padding: 10, borderWidth: 0, borderColor: '#000', background: '#fff' }}>
                    <span style={{ fontWeight: 'bold', }}>Scan ID </span>
                  </td>
                  <td style={{ padding: 10, borderWidth: 1, borderColor: '#fff' }}>

                    {scanId}
                  </td>
                </tr>

                <tr>

                  <td style={{ padding: 10, borderWidth: 0, borderColor: '#000', background: '#fff' }}>
                    <span style={{ fontWeight: 'bold', }}>Scan Name </span>
                  </td>
                  <td style={{ padding: 10, borderWidth: 1, borderColor: '#fff' }}>

                    {llmScan.scanName}

                  </td>
                </tr>


                <tr>

                  <td style={{ padding: 10, borderWidth: 0, borderColor: '#000', background: '#fff' }}>
                    <span style={{ fontWeight: 'bold', }}>Model Name </span>
                  </td>
                  <td style={{ padding: 10, borderWidth: 1, borderColor: '#fff' }}>

                    {llmScan.modelName}

                  </td>
                </tr>
               


                <tr style={{display:'none'}}>

                  <td style={{ padding: 10, borderWidth: 0, borderColor: '#000', background: '#fff' }}>

                    <span style={{ fontWeight: 'bold', }}>Vulnerabilities</span>

                  </td>
                  <td style={{ padding: 10, borderWidth: 1, borderColor: '#fff' }}>

                    {llmScan.vulnerabilities ? (llmScan.vulnerabilities).length : '---'}

                  </td>
                </tr>



                <tr>

                  <td style={{ padding: 10, borderWidth: 0, borderColor: '#000', background: '#fff' }}>

                    <span style={{ fontWeight: 'bold', }}>Scan Started At</span>

                  </td>
                  <td style={{ padding: 10, borderWidth: 1, borderColor: '#fff' }}>

                    {(new Date(llmScan.createdAt)).toLocaleDateString('en-US')} - {(new Date(llmScan.createdAt)).toLocaleTimeString('en-US')}

                  </td>
                </tr>



                <tr>

                  <td style={{ padding: 10, borderWidth: 0, borderColor: '#000', width: 400, background: '#fff' }}>

                    <span style={{ fontWeight: 'bold', }}>Scan Completed At</span>
                  </td>
                  <td style={{ padding: 10, borderWidth: 1, borderColor: '#fff', width: 400 }}>

                    {(new Date(llmScan.scanCompletedAt)).toLocaleDateString('en-US')} - {(new Date(llmScan.scanCompletedAt)).toLocaleTimeString('en-US')}

                  </td>
                </tr>

              </table>



            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>

              <CButton
                onClick={goBack}
                style={{
                  width: 300,
                  marginBottom: '2%',
                  borderWidth: 0,
                  fontSize: 20,
                  borderColor: '#ffffff',
                  borderWidth: 1,
                  color: '#ffffff',
                  background: 'transparent'
                }}
                color="primary"
                className="px-3"
              >
                <IoMdArrowRoundBack size={25} style={{ color: '#fff', marginRight: 10 }} /> Back to Scans List
              </CButton>

              
            </div>
          </div>

        }



        {onLoading ?


          <div style={{
            width: '96%', marginLeft: '2%', marginRight: '2%',
            marginTop: '2%',
          }}>

            <ShimmerTable row={5} col={7} />

          </div>


          :
          <div style={{
            width: '96%', marginLeft: '2%', marginRight: '2%', display: 'flex', flexDirection: 'row', justifyContent: 'space-between',
            marginTop: '2%', background: '#fff', padding: 20, borderRadius: 15, display:'none'
          }}>

            <h4 style={{ marginTop: 30 }}>Vulnerabilities by Severity</h4>
            <hr />

            <table style={{ width: '100%' }}>

              <thead>
                <th style={{ padding: 20, borderWidth: 2, color: '#000', borderColor: '#fff' }}>Severity</th>
                <th style={{ padding: 20, borderWidth: 2, color: '#FF0000', borderColor: '#fff' }}>CRITICAL</th>
                <th style={{ padding: 20, borderWidth: 2, color: '#A6001B', borderColor: '#fff' }}>HIGH</th>
                <th style={{ padding: 20, borderWidth: 2, color: '#F6BE00', borderColor: '#fff' }}>MEDIUM</th>
                <th style={{ padding: 20, borderWidth: 2, color: '#green', borderColor: '#fff' }}>LOW</th>
              </thead>

              <tbody>

                <th style={{ padding: 20, borderWidth: 2, borderColor: '#fff' }}># of Issues</th>
                <th style={{ padding: 20, borderWidth: 2, borderColor: '#fff' }}>0</th>
                <th style={{ padding: 20, borderWidth: 2, borderColor: '#fff' }}>0</th>
                <th style={{ padding: 20, borderWidth: 2, borderColor: '#fff' }}>0</th>
                <th style={{ padding: 20, borderWidth: 2, borderColor: '#fff' }}>0</th>

              </tbody>
            </table>


          </div>
        }


        <div style={{
          width: '96%', marginLeft: '2%', marginRight: '2%', display: 'flex', flexDirection: 'column',
          marginTop: '2%', background: '#fff', padding: 20, borderRadius: 15, display:'none'
        }}>

          <h4 style={{ marginTop: 30 }}>Severity Scoring</h4>
          <hr />

          <span><span style={{ fontWeight: 'bold', color: '#FF0000' }}>CRITICAL</span>: Vulnerabilities that can be exploited remotely, leading to immediate and widespread impact on the confidentiality,
            integrity, and availability of systems or data.</span>

          <span style={{ marginTop: 15 }}><span style={{ fontWeight: 'bold', color: '#A6001B' }}>HIGH:</span> Vulnerabilities that can be exploited but require some form of user interaction or other
            preconditions to be met, potentially resulting in significant impact on system or data.</span>

          <span style={{ marginTop: 15 }}><span style={{ fontWeight: 'bold', color: '#F6BE00' }}>MEDIUM:</span> Vulnerabilities that could result in a compromise of system or data security,
            but require more complex exploitation techniques or have limited impact.</span>

          <span style={{ marginTop: 15 }}><span style={{ fontWeight: 'bold', color: 'green' }}>LOW:</span> Vulnerabilities that have a low likelihood of being exploited or have minimal impact on system or data security.</span>


        </div>    

        <div style={{
          width: '96%', marginLeft: '2%', marginRight: '2%', display: 'flex', flexDirection: 'column',
          marginTop: '2%'
        }}>

          {onLoading &&
            <ShimmerTable row={8} col={10} />

          }

          {!onLoading &&

            <>

              {tableData.length > 0 &&

                <ThemeProvider theme={getMuiTheme()}>
                  <MUIDataTable
                    style={{ height: "57vh" }}
                    data={tableData}
                    columns={columns}
                    options={options}
                  />
                </ThemeProvider>
              }

            </>
          }

        </div>


       

      </>

    </div>
  )
}

export default ViewLLMScanReport



