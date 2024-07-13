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

   return (

    
    <div style={{ overflow: "scroll", position:'relative', overflowY: 'hidden',  }}>
    <div style={{ width:'100%'}}>
    <div>
      <div style={{ marginBottom: '2rem', display:'flex', flexDirection:'column', justifyContent:'space-between' }}>

        <h2 className="pageHeader">Result Integrations</h2>
        <hr/>

<div style={{display:'flex', flexDirection:'row'}}>

        <div style={{width:'60%'}}>  

        <form onSubmit={handleSubmit}>

      <fieldset>
        <label style={{display:'block', fontWeight:'bold'}}>Slack</label>
        <input
          type="text"
          placeholder="Webhook URL"
          value={formData.slack.webhookUrl}
          onChange={(e) => handleChange('slack', 'webhookUrl', e.target.value)}
        /> 
        <input
          type="text"
          placeholder="Channel ID"
          value={formData.slack.channelId}
          style={{marginTop:20}}
          onChange={(e) => handleChange('slack', 'channelId', e.target.value)}
        />
      </fieldset>

      <fieldset style={{marginTop:40}}>
        <label style={{display:'block', fontWeight:'bold'}}>Trello</label>
        <input
          type="text"
          placeholder="API Key"
          value={formData.trello.apiKey}
          onChange={(e) => handleChange('trello', 'apiKey', e.target.value)}
        />
        <input
          type="text"
          placeholder="API Token"
          value={formData.trello.apiToken}
          style={{marginTop:20}}
          onChange={(e) => handleChange('trello', 'apiToken', e.target.value)}
        />
        <input
          type="text"
          placeholder="Board ID"
          value={formData.trello.boardId}
          style={{marginTop:20}}
          onChange={(e) => handleChange('trello', 'boardId', e.target.value)}
        />
        <input
          type="text"
          placeholder="List ID"
          value={formData.trello.listId}
          style={{marginTop:20}}
          onChange={(e) => handleChange('trello', 'listId', e.target.value)}
        />
      </fieldset>

      <fieldset style={{marginTop:40}}>
      <label style={{display:'block', fontWeight:'bold'}}>JIRA</label>
        <input
          type="text"
          placeholder="JIRA URL"
          value={formData.jira.url}
          onChange={(e) => handleChange('jira', 'url', e.target.value)}
        />
        <input
          type="text"
          placeholder="Username"
          value={formData.jira.username}
          style={{marginTop:20}}
          onChange={(e) => handleChange('jira', 'username', e.target.value)}
        />
        <input
          type="password"
          placeholder="API Token"
          value={formData.jira.apiToken}
          style={{marginTop:20}}
          onChange={(e) => handleChange('jira', 'apiToken', e.target.value)}
        />
        <input
          type="text"
          placeholder="Project Key"
          value={formData.jira.projectKey}
          style={{marginTop:20}}
          onChange={(e) => handleChange('jira', 'projectKey', e.target.value)}
        />
      </fieldset>

      <fieldset style={{marginTop:40}}>
      <label style={{display:'block', fontWeight:'bold'}}>Asana</label>
        <input
          type="text"
          placeholder="Access Token"
          value={formData.asana.accessToken}
          onChange={(e) => handleChange('asana', 'accessToken', e.target.value)}
        />
        <input
          type="text"
          placeholder="Workspace ID"
          value={formData.asana.workspaceId}
          style={{marginTop:20}}
          onChange={(e) => handleChange('asana', 'workspaceId', e.target.value)}
        />
        <input
          type="text"
          placeholder="Project ID"
          value={formData.asana.projectId}
          style={{marginTop:20}}
          onChange={(e) => handleChange('asana', 'projectId', e.target.value)}
        />
      </fieldset>

      <fieldset style={{marginTop:40}}>
        <label style={{display:'block', fontWeight:'bold'}}>Azure Boards</label>
        <input
          type="text"
          placeholder="Organization URL"
          value={formData.azureBoards.orgUrl}
          onChange={(e) => handleChange('azureBoards', 'orgUrl', e.target.value)}
        />
        <input
          type="password"
          placeholder="Personal Access Token"
          value={formData.azureBoards.pat}
          style={{marginTop:20}}
          onChange={(e) => handleChange('azureBoards', 'pat', e.target.value)}
        />
        <input
          type="text"
          placeholder="Project Name"
          value={formData.azureBoards.projectName}
          style={{marginTop:20}}
          onChange={(e) => handleChange('azureBoards', 'projectName', e.target.value)}
        />
        <input
          type="text"
          placeholder="Work Item Type"
          value={formData.azureBoards.workItemType}
          style={{marginTop:20}}
          onChange={(e) => handleChange('azureBoards', 'workItemType', e.target.value)}
        />
      </fieldset>

      <fieldset style={{marginTop:40}}>
        <label style={{display:'block', fontWeight:'bold'}}>Microsoft Teams</label>
        <input
          type="text"
          placeholder="Webhook URL"
          value={formData.teams.webhookUrl}
          onChange={(e) => handleChange('teams', 'webhookUrl', e.target.value)}
        />
      </fieldset>

      <fieldset style={{marginTop:40}}>
        <label style={{display:'block',fontWeight:'bold'}}>Discord</label>
        <input
          type="text"
          placeholder="Webhook URL"
          value={formData.discord.webhookUrl}
          style={{marginTop:20}}
          onChange={(e) => handleChange('discord', 'webhookUrl', e.target.value)}
        />
        <input
          type="text"
          placeholder="Channel ID"
          value={formData.discord.channelId}
          style={{marginTop:20}}
          onChange={(e) => handleChange('discord', 'channelId', e.target.value)}
        />
      </fieldset>

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
            


