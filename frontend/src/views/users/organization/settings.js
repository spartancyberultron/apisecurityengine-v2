import React, { useState, useEffect, useRef } from "react";
import { CButton, CToast, CToastBody, CToaster } from '@coreui/react'
import axios from 'axios';
import { CSSProperties } from "react";

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const defaultSettings = {
  "Broken Object Level Authorization": { vulnId:1, severity: "HIGH", priority: "HIGH" },
  "Sensitive Data in Path Params": { vulnId:2, severity: "HIGH", priority: "HIGH" },
  "Basic Authentication Detected": { vulnId:3, severity: "MEDIUM", priority: "MEDIUM" },
  "Endpoint Not Secured by SSL": { vulnId:4, severity: "HIGH", priority: "HIGH" },
  "Unauthenticated Endpoint Returning Sensitive Data": { vulnId:5, severity: "HIGH", priority: "HIGH" },
  "Sensitive Data in Query Params": { vulnId:6, severity: "HIGH", priority: "HIGH" },
  "PII Data Detected in Response": { vulnId:7, severity: "HIGH", priority: "HIGH" },
  "HTTP Verb Tampering Possible": { vulnId:8, severity: "MEDIUM", priority: "MEDIUM" },
  "Content Type Injection Possible": { vulnId:9, severity: "HIGH", priority: "HIGH" },
  "Security Headers not Enabled on Host": { vulnId:10, severity: "MEDIUM", priority: "MEDIUM" },
  "Resource Deletion Possible": { vulnId:11, severity: "HIGH", priority: "HIGH" },
  "Broken Authentication": { vulnId:12, severity: "HIGH", priority: "HIGH" },
  "Excessive Data Exposure": { vulnId:13, severity: "MEDIUM", priority: "MEDIUM" },
  "Injection": { vulnId:14, severity: "HIGH", priority: "HIGH" },
  "Wallet Hijacking Possible": { vulnId:16, severity: "HIGH", priority: "HIGH" },
  "Pre Image Attack Possible": { vulnId:17, severity: "HIGH", priority: "HIGH" },
  "Lack of Resource & Rate Limiting": { vulnId:18, severity: "HIGH", priority: "HIGH" },
};


const Settings = () => {

  const [settings, setSettings] = useState(defaultSettings);
  const [piiSettings, setPiiSettings] = useState([]);
  const [onLoading, setOnLoading] = useState(false);

  const fetchSettings = async () => {

    setOnLoading(true);
    try {
        const token = localStorage.getItem('ASIToken');
        const response = await axios.get('api/v1/users/getOrganizationDetails/', {
            headers: { Authorization: `Bearer ${token}` },
        });

        // Extract data from response
        const fetchedSettings = response.data.organization;

        console.log('fetchedSettings:',fetchedSettings)

        // Map fetched settings to the format used in `defaultSettings`
        const mappedSettings = defaultSettings;
        fetchedSettings.vulnSeverityAndPriority.forEach(({ vulnId, severity, priority }) => {
            // Find the corresponding key in `defaultSettings`
            const key = Object.keys(defaultSettings).find(key => defaultSettings[key].vulnId === vulnId);
            if (key) {
                mappedSettings[key] = { severity, priority };
            }
        });

        // Update settings and piiSettings in the state
        setSettings(mappedSettings);
        setPiiSettings(fetchedSettings.piiField.filter(field => field.enabled).map(field => field.piiField));

    } catch (error) {
        console.error("Failed to fetch settings", error);
    }
    setOnLoading(false);
};

const handleSaveSettings = async () => {
  setOnLoading(true);
  try {
      const token = localStorage.getItem('ASIToken');

      // Transform settings to include vulnId
      const settingsWithVulnId = {
        "Broken Object Level Authorization": {
          vulnId: 1,
          severity: settings["Broken Object Level Authorization"]?.severity || defaultSettings["Broken Object Level Authorization"].severity,
          priority: settings["Broken Object Level Authorization"]?.priority || defaultSettings["Broken Object Level Authorization"].priority
        },
        "Sensitive Data in Path Params": {
          vulnId: 2,
          severity: settings["Sensitive Data in Path Params"]?.severity || defaultSettings["Sensitive Data in Path Params"].severity,
          priority: settings["Sensitive Data in Path Params"]?.priority || defaultSettings["Sensitive Data in Path Params"].priority
        },
        "Basic Authentication Detected": {
          vulnId: 3,
          severity: settings["Basic Authentication Detected"]?.severity || defaultSettings["Basic Authentication Detected"].severity,
          priority: settings["Basic Authentication Detected"]?.priority || defaultSettings["Basic Authentication Detected"].priority
        },
        "Endpoint Not Secured by SSL": {
          vulnId: 4,
          severity: settings["Endpoint Not Secured by SSL"]?.severity || defaultSettings["Endpoint Not Secured by SSL"].severity,
          priority: settings["Endpoint Not Secured by SSL"]?.priority || defaultSettings["Endpoint Not Secured by SSL"].priority
        },
        "Unauthenticated Endpoint Returning Sensitive Data": {
          vulnId: 5,
          severity: settings["Unauthenticated Endpoint Returning Sensitive Data"]?.severity || defaultSettings["Unauthenticated Endpoint Returning Sensitive Data"].severity,
          priority: settings["Unauthenticated Endpoint Returning Sensitive Data"]?.priority || defaultSettings["Unauthenticated Endpoint Returning Sensitive Data"].priority
        },
        "Sensitive Data in Query Params": {
          vulnId: 6,
          severity: settings["Sensitive Data in Query Params"]?.severity || defaultSettings["Sensitive Data in Query Params"].severity,
          priority: settings["Sensitive Data in Query Params"]?.priority || defaultSettings["Sensitive Data in Query Params"].priority
        },
        "PII Data Detected in Response": {
          vulnId: 7,
          severity: settings["PII Data Detected in Response"]?.severity || defaultSettings["PII Data Detected in Response"].severity,
          priority: settings["PII Data Detected in Response"]?.priority || defaultSettings["PII Data Detected in Response"].priority
        },
        "HTTP Verb Tampering Possible": {
          vulnId: 8,
          severity: settings["HTTP Verb Tampering Possible"]?.severity || defaultSettings["HTTP Verb Tampering Possible"].severity,
          priority: settings["HTTP Verb Tampering Possible"]?.priority || defaultSettings["HTTP Verb Tampering Possible"].priority
        },
        "Content Type Injection Possible": {
          vulnId: 9,
          severity: settings["Content Type Injection Possible"]?.severity || defaultSettings["Content Type Injection Possible"].severity,
          priority: settings["Content Type Injection Possible"]?.priority || defaultSettings["Content Type Injection Possible"].priority
        },
        "Security Headers not Enabled on Host": {
          vulnId: 10,
          severity: settings["Security Headers not Enabled on Host"]?.severity || defaultSettings["Security Headers not Enabled on Host"].severity,
          priority: settings["Security Headers not Enabled on Host"]?.priority || defaultSettings["Security Headers not Enabled on Host"].priority
        },
        "Resource Deletion Possible": {
          vulnId: 11,
          severity: settings["Resource Deletion Possible"]?.severity || defaultSettings["Resource Deletion Possible"].severity,
          priority: settings["Resource Deletion Possible"]?.priority || defaultSettings["Resource Deletion Possible"].priority
        },
        "Broken Authentication": {
          vulnId: 12,
          severity: settings["Broken Authentication"]?.severity || defaultSettings["Broken Authentication"].severity,
          priority: settings["Broken Authentication"]?.priority || defaultSettings["Broken Authentication"].priority
        },
        "Excessive Data Exposure": {
          vulnId: 13,
          severity: settings["Excessive Data Exposure"]?.severity || defaultSettings["Excessive Data Exposure"].severity,
          priority: settings["Excessive Data Exposure"]?.priority || defaultSettings["Excessive Data Exposure"].priority
        },
        "Injection": {
          vulnId: 14,
          severity: settings["Injection"]?.severity || defaultSettings["Injection"].severity,
          priority: settings["Injection"]?.priority || defaultSettings["Injection"].priority
        },
        "Wallet Hijacking Possible": {
          vulnId: 16,
          severity: settings["Wallet Hijacking Possible"]?.severity || defaultSettings["Wallet Hijacking Possible"].severity,
          priority: settings["Wallet Hijacking Possible"]?.priority || defaultSettings["Wallet Hijacking Possible"].priority
        },
        "Pre Image Attack Possible": {
          vulnId: 17,
          severity: settings["Pre Image Attack Possible"]?.severity || defaultSettings["Pre Image Attack Possible"].severity,
          priority: settings["Pre Image Attack Possible"]?.priority || defaultSettings["Pre Image Attack Possible"].priority
        },
        "Lack of Resource & Rate Limiting": {
          vulnId: 18,
          severity: settings["Lack of Resource & Rate Limiting"]?.severity || defaultSettings["Lack of Resource & Rate Limiting"].severity,
          priority: settings["Lack of Resource & Rate Limiting"]?.priority || defaultSettings["Lack of Resource & Rate Limiting"].priority
        }
      };

      console.log('settingsWithVulnId:',settingsWithVulnId)

      // Transform piiSettings to match the format required by the API
      const transformedPiiSettings = piiSettings.map(piiField => ({
          piiField,
          enabled: true // Assuming you want to enable all PII fields when saving
      }));

      console.log('transformedPiiSettings:',transformedPiiSettings)

      // Send transformed settings to the server
      await axios.post('api/v1/organizations/saveOrganizationSettings/', {
          settings: settingsWithVulnId,
          piiSettings: transformedPiiSettings
      }, {
          headers: { Authorization: `Bearer ${token}` },
      });


      toast('Settings saved', {
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
      console.error("Failed to save settings", error);

      toast.error('Failed to save settings', {
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
    fetchSettings();
  }, []);


  

  return (
    <div style={{ overflow: "scroll", position: 'relative', overflowY: 'hidden', overflowX: 'hidden' }}>
      <div style={{ width: '100%' }}>
        <div>
          <div style={{ marginBottom: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <h2 style={{ color: '#7366ff', fontWeight: 'bold' }}>Organization Settings</h2>
            <hr />
            <div style={{ display: 'flex', flexDirection: 'row', marginBottom: 30 }}>
              <div style={{ width: '100%' }}>
                <span>Organization Name : <span style={{ fontWeight: 'bold' }}>Organization Name</span></span>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'row', marginBottom: 30, justifyContent: 'space-between', margin: 20 }}>
              <div className="theCards" style={{ width: '49%' }}>
                <h4>Severity and Priority Settings </h4>
                <span>Define the severity and priority of issues, as per your organization policy </span>
                <table style={{ marginTop: 30, width: '100%' }}>
                  <thead>
                    <tr>
                      <th style={{ padding: 10 }}>Vulnerability Type</th>
                      <th style={{ padding: 10 }}>Severity</th>
                      <th style={{ padding: 10 }}>Priority</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.keys(defaultSettings).map(key => (
                      <tr key={key}>
                        <td>{key}</td>
                        <td>
                          <select
                            value={settings[key]?.severity || defaultSettings[key].severity}
                            onChange={(e) => setSettings({
                              ...settings,
                              [key]: { ...settings[key], severity: e.target.value }
                            })}
                          >
                            <option value="CRITICAL">CRITICAL</option>
                            <option value="HIGH">HIGH</option>
                            <option value="MEDIUM">MEDIUM</option>
                            <option value="LOW">LOW</option>
                          </select>
                        </td>
                        <td>
                          <select
                            value={settings[key]?.priority || defaultSettings[key].priority}
                            onChange={(e) => setSettings({
                              ...settings,
                              [key]: { ...settings[key], priority: e.target.value }
                            })}
                          >
                            <option value="CRITICAL">CRITICAL</option>
                            <option value="HIGH">HIGH</option>
                            <option value="MEDIUM">MEDIUM</option>
                            <option value="LOW">LOW</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="theCards" style={{ width: '49%' }}>
                <h4>PII Settings </h4>
                <span>Define the fields considered as PII (Personally Identifiable Information), as per your organization policy </span>
                <div style={{ display: 'flex', flexDirection: 'column', marginTop: 30 }}>
                  {[
    'Aadhaar Number',
    'Address',
    'Age',
    'AWS Access Key',
    'AWS Secret Key',
    'Bank Account Number',
    'Bank Routing',
    'BMI',
    'Blood Pressure',
    'Brother Name',
    'CA Social Insurance Number',
    'Cookie Data',
    'Credit/Debit Card Number',
    'Credit/Debit CVV',
    'Credit/Debit Expiry',
    'Date of Birth',
    'Date Time',
    'Daughter Name',
    'Driving License Number',
    'Driver ID',
    'Email',
    'Employee ID',
    'Father Name',
    'Heart Rate',
    'Height',
    'IN Aadhaar',
    'IN NREGA',
    'IN Permanent Account Number (PAN)',
    'IN Voter Number',
    'International Bank Account Number',
    'Internet Protocol (IP)',
    'Latitude',
    'License Plate',
    'Longitude',
    'MAC Address',
    'Media Access Control (MAC)',
    'Mother Name',
    'Name',
    'Order ID',
    'Passport Number',
    'Password',
    'Phone Number',
    'PIN',
    'Place of Birth',
    'Race',
    'Religion',
    'Sister Name',
    'Social Security Number (SSN)',
    'Son Name',
    'Swift Code',
    'Transaction ID',
    'UK National Health Service Number',
    'UK National Insurance Number',
    'UK Unique Taxpayer Reference Number',
    'URL',
    'Username',
    'US Individual Tax Identification Number',
    'Vehicle Identification Number',
    'Vehicle Registration Number',
    'Voter ID Number'
]
.map(item => (
                    <label key={item} className="theCheckboxLabel">
                      <input
                        type="checkbox"
                        className="theCheckbox"
                        checked={piiSettings.includes(item)}
                        onChange={() => {
                          setPiiSettings(prev => {
                            if (prev.includes(item)) {
                              return prev.filter(i => i !== item);
                            } else {
                              return [...prev, item];
                            }
                          });
                        }}
                      /> &nbsp;&nbsp;{item}
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div style={{ marginTop: '2rem' }}>
              <CButton color="primary" onClick={handleSaveSettings}>Save Settings</CButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
