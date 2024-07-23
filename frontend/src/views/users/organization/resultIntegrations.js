import React, { useState, useEffect, useRef } from "react";
import { CFormInput, CButton, CFormSelect, CTable, CToast, CToastBody, CToaster } from '@coreui/react'
import MUIDataTable from "mui-datatables";
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useParams, useNavigate } from 'react-router-dom'
import { CSSProperties } from "react";
import ClipLoader from "react-spinners/ClipLoader";
import ddos from '../../../assets/images/ddos-protection.png'

const ResultIntegrations = () => {
  const [toast, addToast] = useState(0)
  const navigate = useNavigate()

  const [candidates, setCandidates] = useState([])
  const [onLoading, setOnLoading] = useState(false);
  const [currentlySelectedJob, setCurrentlySelectedJob] = useState(null)

  const [formData, setFormData] = useState({
    slack: { webhookUrl: '', channelId: '' },
    trello: { apiKey: '', apiToken: '', boardId: '', listId: '' },
    jira: { url: '', username: '', apiToken: '', projectKey: '' },
    asana: { accessToken: '', workspaceId: '', projectId: '' },
    azureBoards: { orgUrl: '', pat: '', projectName: '', workItemType: '' },
    teams: { webhookUrl: '' },
    discord: { webhookUrl: '', channelId: '' },
  });

  const handleChange = (platform, field, value) => {
    setFormData(prevData => ({
      ...prevData,
      [platform]: { ...prevData[platform], [field]: value }
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(formData);
    // Here you would handle the form submission
  };

  const toaster = useRef()
  const exampleToast = (
    <CToast>
      <CToastBody>Success</CToastBody>
    </CToast>
  )         
    
  const override: CSSProperties = {
    display: "block",
    margin: "0 auto",
    borderColor: "red",
  };
  
  const goToAddHost = (e) => {
    e.preventDefault();
    navigate('/add-host-under-protection')
  }

  const renderHelpText = (platform) => {
    const helpTexts = {
      slack: [
        "Go to api.slack.com and create a new app.",
        "Enable Incoming Webhooks for your app.",
        "Create a new webhook URL for a specific channel.",
        "Copy the webhook URL and paste it here.",
        "Find the channel ID in Slack by right-clicking the channel and selecting \"Copy link\".",
      ],
      trello: [
        "Log in to Trello and go to https://trello.com/app-key to get your API Key.",
        "Generate a Token from the same page.",
        "To get Board ID and List ID, add \".json\" to the end of a board's URL and search for \"id\" fields.",
      ],
      jira: [
        "Enter your Jira instance URL (e.g., https://your-domain.atlassian.net).",
        "Use your Jira email as the username.",
        "Generate an API token from your Atlassian account settings.",
        "Find the Project Key in your Jira project's settings.",
      ],
      asana: [
        "Go to Asana Developer Console (https://app.asana.com/0/developer-console) to create a personal access token.",
        "Find your Workspace ID by going to My Profile Settings > Apps > Manage Developer Apps.",
        "Get the Project ID from the project URL in Asana.",
      ],
      azureBoards: [
        "Your Organization URL is https://dev.azure.com/your-organization.",
        "Generate a Personal Access Token (PAT) from your Azure DevOps profile settings.",
        "Enter the name of your Azure DevOps project.",
        "Specify the work item type (e.g., \"Bug\", \"Task\", \"User Story\").",
      ],
      teams: [
        "In Microsoft Teams, go to the channel where you want to add a webhook.",
        "Click on \"...\" next to the channel name, then \"Connectors\".",
        "Find \"Incoming Webhook\" and click \"Configure\".",
        "Give it a name, optionally upload an image, and click \"Create\".",
        "Copy the webhook URL provided.",
      ],
      discord: [
        "In Discord, go to Server Settings > Integrations > Webhooks.",
        "Click \"New Webhook\", choose a channel, and copy the Webhook URL.",
        "To get the Channel ID, enable Developer Mode in Discord settings.",
        "Right-click on the channel and select \"Copy ID\".",
      ],
    };

    return (
      <div>
        {helpTexts[platform].map((text, index) => (
          <p key={index} style={{margin: '5px 0'}}>- {text}</p>
        ))}
      </div>
    );
  };

  const getPlaceholder = (platform, field) => {
    const placeholders = {
      slack: {
        webhookUrl: 'Slack Webhook URL',
        channelId: 'Slack Channel ID'
      },
      trello: {
        apiKey: 'Trello API Key',
        apiToken: 'Trello API Token',
        boardId: 'Trello Board ID',
        listId: 'Trello List ID'
      },
      jira: {
        url: 'Jira Instance URL',
        username: 'Jira Username',
        apiToken: 'Jira API Token',
        projectKey: 'Jira Project Key'
      },
      asana: {
        accessToken: 'Asana Access Token',
        workspaceId: 'Asana Workspace ID',
        projectId: 'Asana Project ID'
      },
      azureBoards: {
        orgUrl: 'Azure DevOps Organization URL',
        pat: 'Azure DevOps Personal Access Token',
        projectName: 'Azure DevOps Project Name',
        workItemType: 'Azure DevOps Work Item Type'
      },
      teams: {
        webhookUrl: 'Microsoft Teams Webhook URL'
      },
      discord: {
        webhookUrl: 'Discord Webhook URL',
        channelId: 'Discord Channel ID'
      }
    };

    return placeholders[platform]?.[field] || field.split(/(?=[A-Z])/).join(' ');
  };

  return (
    <div style={{ overflow: "scroll", position:'relative', overflowY: 'hidden' }}>
      <div style={{ width:'100%'}}>
        <div>
          <div style={{ marginBottom: '2rem', display:'flex', flexDirection:'column', justifyContent:'space-between' }}>
            <h2 className="pageHeader">Result Integrations</h2>
            <hr/>
            <div style={{display:'flex', flexDirection:'row'}}>
              <div style={{width:'60%'}}>  
                <form onSubmit={handleSubmit}>
                  {Object.entries(formData).map(([platform, fields]) => (
                    <fieldset key={platform} style={{marginTop: 40}}>
                      <label style={{display:'block', fontWeight:'bold'}}>{platform.charAt(0).toUpperCase() + platform.slice(1)}</label>
                      {Object.entries(fields).map(([field, value]) => (
                        <input
                          key={field}
                          type={field.toLowerCase().includes('token') || field.toLowerCase().includes('key') ? 'password' : 'text'}
                          placeholder={getPlaceholder(platform, field)}
                          value={value}
                          style={{marginTop: 20}}
                          onChange={(e) => handleChange(platform, field, e.target.value)}
                        />
                      ))}
                      <div style={{marginTop: 20, fontSize: '0.9em', color: '#666'}}>
                        <p style={{fontWeight:'bold'}}>How to get these parameters:</p>
                        {renderHelpText(platform)}
                      </div>
                    </fieldset>
                  ))}
                  <button className="primaryButton" style={{marginTop:30, borderRadius:10}}>Save Integration Settings</button>
                </form>
              </div>
            </div>    
          </div>
        </div> 
      </div>     
    </div>
  )
}

export default ResultIntegrations