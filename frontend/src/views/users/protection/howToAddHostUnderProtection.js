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


import nodeJSLogo from '../../../assets/images/node-js-logo.png'
import pythonLogo from '../../../assets/images/python-logo.png'
import phpLogo from '../../../assets/images/php-logo.png'
import dotnetLogo from '../../../assets/images/dotnet-logo.png'
import javaLogo from '../../../assets/images/java-logo.png'
import golangLogo from '../../../assets/images/golang-logo.png'

import ddosDiagram from '../../../assets/images/ddos_diagram.png'

const HowToAddHostUnderProtection = () => {

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

    return (

        <div style={{ overflow: "scroll", position: 'relative', overflowY: 'hidden', backgroundColor:'white', padding:20, borderRadius:10 }}>
            <div style={{ width: '100%' }}>
                <div>
                    <div style={{ marginBottom: '2rem', display: 'flex', flexDirection: 'row', justifyContent: 'flex-start', marginTop: 20 }}>

                        <h2 style={{alignSelf:'flex-start'}}>Add a Host under DDoS Protection and Bot Management</h2>

                    </div>

                    <p>Point an A record of your domain to our IP address 143.110.190.114.</p>



                    <p>Remove any virtual host configured on your server for your actual domain. 
                       </p>

                    
                    <p>Configure virtual host with a proxy domain which will be used by our reverse proxy server to route the traffic to. 
                       </p>    



                    <p>Your users will use the actual domain. That will send the traffic to our server. Our server will process the traffic and send 
                        the traffic to the proxy domain</p>    

                        <br/>
                    <img src={ddosDiagram} style={{width:500}}/>      

                    <br/> <br/><br/>             


                </div>

            </div>
        </div>
    )
}

export default HowToAddHostUnderProtection



