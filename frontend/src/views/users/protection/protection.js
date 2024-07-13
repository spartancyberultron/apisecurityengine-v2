import React, { useState, useEffect, useRef } from "react";
import { CFormInput, CButton, CFormSelect, CTable, CToast, CToastBody, CToaster } from '@coreui/react'
import MUIDataTable from "mui-datatables";
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useParams, useNavigate } from 'react-router-dom'
import { CSSProperties } from "react";
import ClipLoader from "react-spinners/ClipLoader";
import ddos from '../../../assets/images/ddos-protection.png'


const Protection = () => {

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
    
  const override: CSSProperties = {
    display: "block",
    margin: "0 auto",
    borderColor: "red",
  };
  
  const goToHosts = (e) => {

    e.preventDefault();
    navigate('/hosts-under-protection')
  }

   return (

    
    <div style={{ overflow: "scroll", position:'relative', overflowY: 'hidden',  }}>
    <div style={{ width:'100%'}}>
    <div>
      <div style={{ marginBottom: '2rem', display:'flex', flexDirection:'column', justifyContent:'space-between' }}>

        <h2 style={{color:'#7366ff', fontWeight:'bold'}}>DDoS Protection and Bot Management</h2>
        <hr/>

<div style={{display:'flex', flexDirection:'row'}}>

        <div style={{width:'60%'}}>


         <h3>DDoS Protection</h3>

         <p>DDoS attacks have become a serious threat to businesses and organizations,
           causing significant disruptions and financial losses. At APISecurityEngine, 
           we offer robust DDoS protection services to safeguard your online infrastructure against 
           these malicious attacks. Our cutting-edge technologies and expert team work together to detect and mitigate DDoS attacks, 
           ensuring uninterrupted availability of your website and applications. With our comprehensive monitoring and analysis, 
           we proactively identify potential threats and implement effective countermeasures to maintain your online presence and protect 
           your valuable assets. Rest assured that our DDoS protection services will keep your organization safe from the devastating impact of DDoS attacks, 
           providing you with peace of mind and allowing you to focus on your core business operations.</p> 

           <hr/>

           <h3>Bot Management</h3>

           <p>As bots continue to proliferate across the internet, businesses face numerous challenges, including content scraping, account takeovers, 
              and fraudulent activities. To address these concerns, our cyber security agency offers a comprehensive bot management service. 
              Our advanced bot detection and mitigation techniques enable us to differentiate between legitimate users and malicious bots, 
              allowing us to enforce granular access controls and prevent unauthorized activities. By deploying intelligent bot management solutions,
              we ensure the integrity of your website, protect your sensitive data, and maintain a seamless user experience for your genuine visitors. 
              With our expertise in bot management, you can effectively safeguard your digital assets, enhance security, and maintain trust among your customers, 
              ultimately strengthening your overall cyber security posture.</p> 


           <CButton
                style={{
                    width: '40%', marginTop: 70, borderWidth: 0, fontSize: 20,
                            background: '#7367f0'
                    }}
                    color="primary"
                    className="px-3 "
                    onClick={(e) => {
                            goToHosts(e)
                    }}
                    >
                    MANAGE HOSTS
            </CButton>

            
        </div>

        <div style={{width:'30%'}}>


           <img src={ddos}/>

        </div>

  </div>      
        
      </div>

</div> 
    </div> 
    </div>     
   )
}

export default Protection
            


