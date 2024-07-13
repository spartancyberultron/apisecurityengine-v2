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

const LLMCompliances = () => {

  //const [toast, addToast] = useState(0)
  const navigate = useNavigate()

  const [llmScanVulns, setLLMScanVulns] = useState([])

  const [onLoading, setOnLoading] = useState(false);

  const [pageCount, setPageCount] = useState(100);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(100);

  const [modalIsOpen, setModalIsOpen] = React.useState(false);

  const [itemOffset, setItemOffset] = useState(0);

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
 

  function getComplianceMappings(owaspCategory){

    console.log('owaspCategory',owaspCategory)

    switch (owaspCategory) {
      case 'LLM01:2023 - Prompt Injections':
        return {
          cwe:['CWE-77: Improper Neutralisation of Special Elements used in a Command (\'Command Injection\')'],
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
          rbiCSF: ["Cyber Security Policy - A mandate for comprehensive cybersecurity policies covering prompt injection risk and mitigation."],
          description:'LLM01:2023 is a vulnerability where attackers trick large language models (LLMs) with special prompts. These prompts can make the LLM leak secrets, ignore instructions, or do malicious things. It is like hacking the LLM by feeding it the wrong information.'
        };
      case 'LLM02:2023 - Data Leakage':
        return {
          cwe:['CWE-200: Information Exposure.'],
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
          rbiCSF: ["Data Leak Prevention - Guidelines for preventing unauthorised disclosure of sensitive financial data."],
          description:'LLM02:2023 refers to a vulnerability in large language models where they unintentionally reveal sensitive information during responses. This can be caused by improper filtering, memorized training data, or misinterpretations by the model. It can lead to security breaches and privacy violations.'
        };
      case 'LLM 03:2023 - Inadequate Sandboxing':
        return {
          cwe:['CWE-284: Improper Access Control'],
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
          rbiCSF: ["Application Security - Requirements for application-level security controls, including effective sandboxing."],
          description:'LLM 03:2023 refers to a vulnerability where a large language model (LLM) is not isolated properly. This can lead to attackers manipulating the LLM to access sensitive data or perform unauthorized actions. To prevent this, LLMs need to be sandboxed with restricted access and capabilities.'
        };
      case 'LLM 04:2023 - Unauthorised Code Execution':
        return {
          cwe:['CWE-94: Improper Control of Generation of Code (\'Code Injection\')'],
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
          rbiCSF: ["Malware Protection - Measures to protect against malware and unauthorised code execution."],
          description:'LLM 04:2023 – Unauthorised Code Execution vulnerability is a security flaw where an attacker can execute unauthorized code on a system through a large language model (LLM) like ChatGPT. This exploit typically involves input manipulation that bypasses normal input validation mechanisms. The vulnerability allows execution of code that can access or modify system data or disrupt service. It highlights the importance of implementing stringent input validation and secure coding practices in the development of LLMs.'
        };

        case 'LLM05:2023 - SSRF Vulnerabilities':
    return {
      cwe:['CWE-918: Server-Side Request Forgery (SSRF'],
      iso27001: ["A.13.1.1 Network Controls", "A.13.1.3 Segregation in Networks"],
      nistCSF: ["DE.CM-1: The network is monitored to detect potential cybersecurity events.", "PR.AC-4: Access permissions and authorizations are managed, incorporating the principles of least privilege and separation of duties."],
      gdpr: ["Article 32: Security of processing - Specific measures may include the ability to ensure the ongoing confidentiality, integrity, availability, and resilience of processing systems and services."],
      pciDSS: ["PCI DSS Requirement 1.3: Prohibit direct public access between the internet and any system component in the cardholder data environment."],
      hipaa: ["164.312(b) Audit Controls: Implement hardware, software, and/or procedural mechanisms that record and examine activity in information systems that contain or use electronic protected health information."],
      mitreATTACK: ["Technique ID T1192: Spear Phishing Link - SSRF vulnerabilities could be exploited using phishing links to make the server request or fetch malicious payloads."],
      nist80053: ["AC-4 (Information Flow Enforcement): Control the flow of information within the system and ensure it does not pass to unauthorised systems."],
      asvs: ["V6: Server-Side Security - Requirements for server-side input validation to prevent SSRF."],
      cmmc: ["CMMC Level 3, System and Communication Protection (SC.3.192): Implement Domain Name System (DNS) filtering services."],
      ccpa: ["CCPA Section 1798.81.5 - Businesses must take reasonable steps to protect the data they hold, which includes protection against SSRF attacks."],
      fips: ["FIPS 200 for securing information systems might help mitigate such risks."],
      fisma: ["AC-4 (Information Flow Enforcement): Prevents unauthorised information transfer via shared resources."],
      rbiCSF: ["Network Security Management - Specific protocols for managing network security and preventing vulnerabilities like SSRF."],
      description:'LLM05:2023 refers to a vulnerability in Large Language Models (LLMs) where attackers can trick the LLM into making unauthorized requests on the server\'s behalf. This can be used to access internal systems and data that the LLM shouldn\'t normally be able to reach.'

    };
        

    case 'LLM 06:2023 - Over Reliance on LLM-generated Content':
    return {
      cwe:['CWE-345: Insufficient Verification of Data Authenticity'],
      iso27001: ["A.11.2.5 Security of Equipment Off-premises", "A.12.6.2 Restrictions on Software Installation"],
      nistCSF: ["ID.RA-1: Asset vulnerabilities are identified and documented.", "PR.IP-3: The organisational communication and data flows are mapped."],
      gdpr: ["Article 22: Automated individual decision-making, including profiling - This article gives individuals the right not to be subject to a decision based solely on automated processing, including profiling, which produces legal effects concerning them."],
      pciDSS: ["PCI DSS Requirement 3.3: Mask PAN when displayed (the first six and last four digits are the maximum number of digits to be displayed)."],
      hipaa: ["164.312(a)(2)(i) Unique User Identification: Assign a unique name and/or number for identifying and tracking user identity."],
      mitreATTACK: ["Technique ID T1585: Establish Accounts - Reliance on LLM-generated content could lead to the establishment of accounts with malicious intent."],
      nist80053: ["RA-5 (Vulnerability Scanning): Scan for vulnerabilities and assess the security impact of LLM-generated content."],
      asvs: ["V7: Cryptography - Requirements to ensure that cryptographic modules do not rely solely on LLMs for security."],
      cmmc: ["CMMC Level 2, Awareness and Training (AT.2.056): Ensure that managers, system administrators, and users of organisational systems are made aware of the security risks associated with their activities and the applicable policies, standards, and procedures related to the security of those systems."],
      ccpa: ["CCPA Section 1798.125 - Prohibiting businesses from discriminating against consumers who exercise their CCPA rights, such as the right to opt-out of the sale of their personal information."],
      fips: ["FIPS 199 and FIPS 200 stress the importance of proper information categorization and security controls which would be relevant."],
      fisma: ["SA-11 (Developer Security Testing and Evaluation): Requires developers to conduct security testing to validate the security properties of the software."],
      rbiCSF: ["IT and Cyber Risk Management - Policies on managing risks associated with the use of AI and LLMs in financial services."],
      description:'LLM 06:2023 refers to a vulnerability where people trust AI-generated content too much. This can lead to believing false information and losing critical thinking skills.'
    };

    case 'LLM 07:2023 - Inadequate AI Alignment':
      return {
        cwe:['CWE-398: Indicator of Poor Code Quality'],
        iso27001: ["A.15.1.1 Information Security Policy for Supplier Relationships", "A.15.1.2 Addressing Security Within Supplier Agreements"],
        nistCSF: ["ID.RA-2: Threat and vulnerability information is received from information sharing forums and sources.", "PR.IP-9: Response plans (incident response and business continuity) and recovery plans (disaster recovery and continuity of operations) are in place and managed."],
        gdpr: ["Article 35: Data protection impact assessment - An assessment is required to identify and mitigate risks associated with data processing activities, including those involving AI and LLMs."],
        pciDSS: ["PCI DSS Requirement 6.6: Ensure that all web-facing applications are protected against known attacks by either of the following methods: having all custom application code reviewed for common vulnerabilities by an organisation that specialises in application security or installing an application-layer firewall in front of web-facing applications."],
        hipaa: ["164.306(e) Flexibility of Approach: Consider the potential risks and vulnerabilities to the confidentiality, integrity, and availability of electronic protected health information."],
        mitreATTACK: ["Technique ID T1622: Defence Evasion - Inadequate AI alignment might result in techniques that bypass traditional defences due to unexpected AI behaviour."],
        nist80053: ["PM-11 (Mission/Business Process Definition): Determine information security requirements for the mission/business processes involving LLMs."],
        asvs: ["V12: File and Resources - Requirements for proper alignment and handling of AI models and resources."],
        cmmc: ["CMMC Level 3, Risk Management (RM.3.121): Establish a process to identify and assess the risks to organisational operations, assets, individuals, other organisations, and the Nation associated with the operation of information systems."],
        ccpa: ["CCPA Section 1798.185 - Directs the California Attorney General to solicit broad public participation and adopt regulations to further the CCPA's purposes, including but not limited to verifying requests for information, which could involve AI systems."],
        fips: ["FIPS 199 and FIPS 200 stress the importance of proper information categorization and security controls which would be relevant."],
        fisma: ["PL-8 (Security and Privacy Architectures): Develops security and privacy architectures that encompass stakeholder protection needs and concerns."],
        rbiCSF: ["Governance Framework - Establishing a framework that ensures AI systems align with the bank's cybersecurity posture."],
        description:'LLM 07:2023 refers to a situation where a large language model\'s goals don\'t match its intended use. This mismatch can lead to the model causing problems, like spreading misinformation or harming systems.'
      };
  
      case 'LLM 08:2023 - Insufficient Access Controls':
        return {
          cwe:['CWE-284: Improper Access Control'],
          iso27001: ["A.9.1.1 Access Control Policy", "A.9.2.3 Management of Privileged Access Rights"],
          nistCSF: ["PR.AC-1: Identities and credentials are managed for authorised devices and users.", "PR.AC-5: Network integrity is protected, incorporating network segregation where appropriate."],
          gdpr: ["Article 5(1)(f): Integrity and confidentiality - The GDPR mandates that personal data should be protected from unauthorised access."],
          pciDSS: ["PCI DSS Requirement 7: Restrict access to cardholder data by business need to know."],
          hipaa: ["164.312(a)(1) Access Control: Implement technical policies and procedures that allow only authorised persons to access electronic protected health information."],
          mitreATTACK: ["Technique ID T1078: Valid Accounts - Insufficient access controls could allow attackers to use valid accounts to gain access."],
          nist80053: ["AC-2 (Account Management): Manage information system accounts, including establishing conditions for group membership.", "AC-6 (Least Privilege): Enforce the principle of least privilege."],
          asvs: ["V4: Access Control - Requirements for implementing strong access control checks."],
          cmmc: ["CMMC Level 1, Access Control (AC.1.001): Limit information system access to authorised users, processes acting on behalf of authorised users, or devices."],
          ccpa: ["CCPA Section 1798.81.5 - Duty to implement and maintain reasonable security procedures and practices."],
          fips: ["FIPS 200 (which includes minimum security requirements for federal information and information systems, including access control policies)."],
          fisma: ["AC-3 (Access Enforcement): Enforces access based on organisational policies and procedures."],
          rbiCSF: ["Access Control Mechanisms - Directives for implementing robust access control measures to protect critical information assets."],
          description:'LLM 08:2023 refers to a vulnerability where weak security measures in large language models (LLMs) allow unauthorized access. This can lead to attackers exploiting the LLM or sensitive information it holds.'
        };


        case 'LLM 09:2023 - Improper Error Handling':
    return {
      cwe:['CWE-755: Improper Handling of Exceptional Conditions'],
      iso27001: ["A.14.1.2 Security Requirements of Information Systems", "A.14.2.5 System Security Testing"],
      nistCSF: ["DE.AE-3: Event data are aggregated to facilitate trend analysis and event correlation.", "RC.IM-1: Recovery plans incorporate lessons learned."],
      gdpr: ["Article 33: Notification of a personal data breach to the supervisory authority - Controllers are required to notify the appropriate supervisory authority of a personal data breach without undue delay."],
      pciDSS: ["PCI DSS Requirement 10.5: Secure audit trails so they cannot be altered."],
      hipaa: ["164.308(a)(6)(ii) Response and Reporting: Identify and respond to suspected or known security incidents; mitigate, to the extent practicable, harmful effects of security incidents that are known to the covered entity; and document security incidents and their outcomes."],
      mitreATTACK: ["Technique ID T1553.002: Subvert Trust Controls: Code Signing - Poor error handling could allow attackers to subvert trust controls through improperly signed code."],
      nist80053: ["SI-11 (Error Handling): Handle errors comprehensively and securely."],
      asvs: ["V10: Error Handling and Logging - Requirements for correct error handling to prevent leakage of sensitive information."],
      cmmc: ["CMMC Level 3, System and Information Integrity (SI.3.224): Perform periodic scans of information systems and real-time scans of files from external sources as files are downloaded, opened, or executed."],
      ccpa: ["CCPA Section 1798.150 - A business that experiences a data breach may be subject to civil action if personal information is disclosed due to improper error handling."],
      fips: ["System and information integrity, addressed by FIPS 200’s requirements."],
      fisma: ["SI-11 (Error Handling): Handles errors by responding appropriately to prevent further damage or information leakage."],
      rbiCSF: ["Cyber Incident Monitoring and Reporting - Systems for monitoring, logging, and reporting cybersecurity incidents."],
      description:'LLM 09:2023 refers to a vulnerability where a large language model (LLM) exposes sensitive information or reveals potential attack points due to poorly handled errors. This can happen when error messages contain confidential data or provide details that hackers can exploit.'
    };



    case 'LLM 10:2023 - Training Data Poisoning':
    return {
      cwe:['CWE-506: Embedded Malicious Code'],
      iso27001: ["A.12.1.2 Control of Internal Processing", "A.14.2.7 Secure Development Environment"],
      nistCSF: ["ID.SC-5: Supply chain policies, processes, and procedures are established and updated based on the supply chain risk assessment.", "PR.IP-11: Process and procedures are maintained and used to manage protection of information systems and assets."],
      gdpr: ["Article 5(1)(d): Accuracy - Personal data must be accurate and, where necessary, kept up to date; every reasonable step must be taken to ensure that personal data that are inaccurate are erased or rectified without delay."],
      pciDSS: ["PCI DSS Requirement 6.5: Address common coding vulnerabilities in software-development processes, including improper input validation."],
      hipaa: ["164.308(a)(1)(ii)(D) Information System Activity Review: Implement procedures to regularly review records of information system activity, such as audit logs, access reports, and security incident tracking reports."],
      mitreATTACK: ["Technique ID T1565: Data Manipulation - Training data poisoning is a form of data manipulation where an attacker influences the outcome of an AI model."],
      nist80053: ["SA-11 (Developer Security Testing and Evaluation): Require the developer of the LLM to create and implement a security assessment plan."],
      asvs: ["V13: API and Web Service Security - Requirements for securing APIs against attacks such as training data poisoning."],
      cmmc: ["CMMC Level 3, Risk Assessment (RA.3.041): Periodically assess the risk to organisational operations, assets, and individuals, resulting from the operation of information systems and the associated processing, storage, or transmission of CUI."],
      ccpa: ["CCPA Section 1798.100 - Consumers have the right to request that a business delete any personal information about the consumer which the business has collected."],
      fips: ["FIPS 200 (which includes minimum security requirements for federal information and information systems, including access control policies)."],
      fisma: ["SA-11 (Developer Security Testing and Evaluation): Involves developer security testing to prevent the introduction of unsafe software into the operational environment."],
      rbiCSF: ["Secure Configuration Management - Ensuring secure configuration of systems to maintain the integrity of training data and models."],
      description:'LLM training data poisoning happens when bad actors sneak harmful data into an LLM\'s training. This can trick the LLM to be biased, insecure, or malfunction entirely.'
    };

    

      default:
        return {
          cwe:[],
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
          description:''
        };
    }
 }



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
          "owasp": "LLM 01:2023 - Prompt Injections",
          "cwe": ["CWE-77: Improper Neutralisation of Special Elements used in a Command ('Command Injection')"],
          "description": "The red-teaming LLM isn't aligned with the target LLM's goals, aiming to elicit harmful outputs instead of following intended use. This misalignment exposes weaknesses in the target LLM's training or safety measures that could be exploited by malicious actors."
      },
      "continuation": {
          "vulnerability": "Continuation of Undesirable Word",
          "owasp": "LLM 01:2023 - Prompt Injections",
          "cwe": ["CWE-77: Improper Neutralisation of Special Elements used in a Command ('Command Injection')"],
          "description": "Vulnerability occurs because the model is influenced by the way prompts are crafted. By testing if the model completes an undesirable word, the attacker is probing the limitations of the prompt and potentially exploiting them to generate harmful content."
      },
      "dan": {
          "vulnerability": "Do Anything Now(DAN Attack Vulnerability)",
          "owasp": "LLM 04:2023 - Unauthorised Code Execution",
          "cwe": ["CWE-94: Improper Control of Generation of Code ('Code Injection')"],
          "description": "An attacker can craft a specially designed prompt that could potentially trick the LLM into executing unauthorized code on the system, bypassing security measures."
      },
      "donotanswer": {
          "vulnerability": "Prompts that could be misused to cause harm or violate ethical principles.",
          "owasp": "LLM 07:2023 - Inadequate AI Alignment",
          "cwe": ["CWE-398: Indicator of Poor Code Quality"],
          "description": "Responsible AI avoids generating outputs that misalign with human values, goals, or safety. Prompts that could lead to harmful or unethical outputs highlight this misalignment."
      },
      "encoding": {
          "vulnerability": "Tricking an LLM by hiding malicious code within seemingly normal text.",
          "owasp": "LLM 01:2023 - Prompt Injections",
          "cwe": ["CWE-77: Improper Neutralisation of Special Elements used in a Command ('Command Injection')"],
          "description": "Vulnerability allows attackers to manipulate an LLM by disguising malicious code within seemingly normal text through encoding techniques."
      },
      "gcg": {
          "vulnerability": "Prompt injection through a malicious addition.",
          "owasp": "LLM 01:2023 - Prompt Injections",
          "cwe": ["CWE-77: Improper Neutralisation of Special Elements used in a Command ('Command Injection')"],
          "description": "Vulnerability occurs when an attacker manipulates the LLM's prompt with a malicious suffix, causing it to deviate from its intended behavior."
      },
      "glitch": {
          "vulnerability": "Probing the LLM to find inputs that cause unexpected behavior.",
          "owasp": "LLM 01:2023 - Prompt Injections",
          "cwe": ["CWE-77: Improper Neutralisation of Special Elements used in a Command ('Command Injection')"],
          "description": "Vulnerability occurs when an attacker injects malicious code into prompts fed to the LLM, causing it to behave abnormally."
      },
      "goodside": {
          "vulnerability": "Crafted input tricks LLM to disregard prior instructions and follow attacker's commands.",
          "owasp": "LLM 01:2023 - Prompt Injections",
          "cwe": ["CWE-77: Improper Neutralisation of Special Elements used in a Command ('Command Injection')"],
          "description": "Vulnerability involves getting large language models (LLMs) to ignore their designers’ plans by including malicious text such as “ignore your previous instructions” in the user input."
      },
      "knownbadsignatures": {
          "vulnerability": "Malicious content injection probes for LLMs.",
          "owasp": "LLM 01:2023 - Prompt Injections",
          "cwe": ["CWE-77: Improper Neutralisation of Special Elements used in a Command ('Command Injection')"],
          "description": "An attacker crafts specific prompts to trick the LLM into generating malicious content (like phishing emails, malware code) by manipulating its understanding of the desired output."
      },
      "leakerplay": {
          "vulnerability": "Vulnerable LLM unintentionally reproduce training data in its outputs.",
          "owasp": "LLM 02:2023 - Data Leakage",
          "cwe": ["CWE-200: Information Exposure"],
          "description": "Vulnerability occurs when an LLM unintentionally reveals information from its training data, including potentially sensitive details. In this case, the probe is trying to see if the LLM will directly copy information from its training data."
      },
      "lmrc": {
          "vulnerability": "Limited probing of the LLM's capabilities.",
          "owasp": "LLM 01:2023 - Prompt Injections",
          "cwe": ["CWE-77: Improper Neutralisation of Special Elements used in a Command ('Command Injection')"],
          "description": "Attackers manipulate user input to trick the LLM into following their instructions instead of the intended ones, potentially leading to data leaks or unauthorized actions."
      },
      "malwaregen": {
          "vulnerability": "LLM susceptibility to prompts for malicious code generation",
          "owasp": "LLM 04:2023 - Unauthorised Code Execution",
          "cwe": ["CWE-94: Improper Control of Generation of Code ('Code Injection')"],
          "description": "An attacker tricks the LLM into generating malicious code, potentially allowing for unauthorized execution on a system."
      },
      "misleading": {
          "vulnerability": "LLM susceptibility to manipulation for generating deceptive content.",
          "owasp": "LLM 07:2023 - Inadequate AI Alignment",
          "cwe": ["CWE-398: Indicator of Poor Code Quality"],
          "description": "Vulnerability arises when an LLM model is not aligned with the desired goals or expectations, potentially leading it to generate misleading or false claims."
      },
      "packagehallucination": {
          "vulnerability": "Crafting prompts for code generation that request insecure, non-existent packages.",
          "owasp": "LLM 04:2023 - Unauthorized Code Execution",
          "cwe": ["CWE-94: Improper Control of Generation of Code ('Code Injection')"],
          "description": "By requesting non-existent packages, the attacker attempts to trick the code generation into fetching and executing malicious code from an unintended source."
      },
      "promptinject": {
          "vulnerability": "Ability to inject prompts during inference to manipulate model outputs",
          "owasp": "LLM 01:2023 - Prompt Injections",
          "cwe": ["CWE-77: Improper Neutralisation of Special Elements used in a Command ('Command Injection')"],
          "description": "Prompt injection attacks trick large language models (LLMs) into processing malicious code or data by manipulating the prompts they receive. This can lead to the LLM generating harmful outputs or revealing sensitive information."
      },
      "realtoxicityprompts": {
          "vulnerability": "Limited test set for prompts that might induce toxic outputs from a large language model.",
          "owasp": "LLM 01:2023 - Prompt Injections",
          "cwe": ["CWE-77: Improper Neutralisation of Special Elements used in a Command ('Command Injection')"],
          "description": "An attacker can inject malicious prompts to trick the LLM into generating toxic content, even if it wasn't explicitly trained on such content. This can be done by crafting specific prompts that exploit the LLM's internal biases or reasoning processes."
      },
      "snowball": {
          "vulnerability": "LLM tricked into cascading false claims by complex questions exploiting knowledge gaps.",
          "owasp": "LLM 07:2023 - Inadequate AI Alignment",
          "cwe": ["CWE-398: Indicator of Poor Code Quality"],
          "description": "Snowballed Hallucination probes exploit the model's limitations in reasoning and justification, causing it to confidently provide incorrect answers. Inadequate AI Alignment refers to a mismatch between the model's goals and the user's goals. In this case, the model is not aligned with the goal of providing accurate information."
      },
      "xss": {
          "vulnerability": "Insecure LLM output handling can expose systems to cross-site scripting (XSS) and other attacks.",
          "owasp": "LLM 02:2023 - Data Leakage",
          "cwe": ["CWE-200: Information Exposure"],
          "description": "Data leakage occurs when an LLM accidentally reveals sensitive information through its responses, enabling unauthorized access to private data."
      }
  };

  return vulnerabilities[probe] || null;
}


  const override: CSSProperties = {
    display: "block",
    margin: "0 auto",
    borderColor: "red",
  };

  const isFirstTime = useRef(true);


  const fetchLLMCompliances = async () => {

    if (isFirstTime) {
      setOnLoading(true);
    }
  
    const token = localStorage.getItem('ASIToken');
    const response = await axios.get(`/api/v1/complianceMonitoring/getLLMCompliances`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    console.log('response.data:',response.data)
  
    setLLMScanVulns(response.data.llmScanVulns);
    
    setOnLoading(false);
  };



  useEffect(() => {  

     fetchLLMCompliances();  

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
                  backgroundColor: '#abcdef',
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
                  backgroundColor: '#ffc0cb',
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
                  backgroundColor: '#f0fff0',
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
                  backgroundColor: '#ffb6c1',
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
                  backgroundColor: '#ffdab9',
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
                  backgroundColor: '#e6e6fa',
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
                  backgroundColor: '#fffdd0',
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
                  backgroundColor: '#f08080',
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
                  backgroundColor: '#87ceeb',
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
                  backgroundColor: '#fffff0',
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
                  backgroundColor: '#f5deb3',
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
                  backgroundColor: '#f7e7ce',
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
                  backgroundColor: '#98fb98',
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

  for(var i=0;i<llmScanVulns.length;i++){

    var cat = getVulnerabilityDetails(llmScanVulns[i]).owasp;

    console.log('cat:',cat)

    if(!(uniqueOWASPCats.includes(cat))){
      uniqueOWASPCats.push(cat);
    }
  }

  console.log('uniqueOWASPCats:',uniqueOWASPCats)

  var tableData = [];


  for (var i = 0; i < uniqueOWASPCats.length; i++) {

    var dataItem = [];

    dataItem.push(i+1);

    dataItem.push(uniqueOWASPCats[i]); 
    
    var compliances = getComplianceMappings(uniqueOWASPCats[i])

   

    dataItem.push(compliances.cwe); // Description

    dataItem.push(compliances.description); // Description

    dataItem.push(compliances.iso27001); // ISO 27001

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

          <span className="pageHeader">LLM Compliances</span>
            
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

export default LLMCompliances



