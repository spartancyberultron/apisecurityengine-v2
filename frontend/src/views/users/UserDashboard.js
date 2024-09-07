import React, { useState, useEffect, useRef } from "react";

import axios from 'axios';

import {
  CCol,
  CRow,  
  CContainer,  
} from '@coreui/react'

import { Link } from "react-router-dom";

import successIcon from '../../assets/images/success-green-check-mark-icon.png'
import cancelIcon from '../../assets/images/cancel-icon.png'
import chromeLogo from '../../assets/images/google_chrome.png'

import usaFlag from '../../assets/images/us_flag.png'
import indiaFlag from '../../assets/images/india_flag.png'
import japanFlag from '../../assets/images/japan_flag.png'
import germanyFlag from '../../assets/images/germany_flag.png'
import canadaFlag from '../../assets/images/canada_flag.png'


import './style.css'; // Import your CSS file

import { HiOutlineDesktopComputer } from "react-icons/hi";
import { TbApi } from "react-icons/tb";
import { AiOutlineIssuesClose } from "react-icons/ai";
import { FiAlertCircle } from "react-icons/fi";
import { MdOutlinePersonalInjury } from "react-icons/md";
import { AiOutlineCloudServer } from "react-icons/ai";

import { AiFillFlag } from "react-icons/ai";
import { BsCollection } from "react-icons/bs";
import { CgNotes } from "react-icons/cg";

import { Shimmer, Breathing } from 'react-shimmer'

import Chart from 'react-apexcharts'
import CanvasJSReact from './canvasjs.react';
import ApexCharts from 'react-apexcharts';
import { extractHostAndEndpoint } from './utils';

import VulnerabilityDistribution from './DashboardComponents/VulnerabilityDistribution'
import TopEndpoints from './DashboardComponents/TopEndpoints'
import VulnerabilityTrends from './DashboardComponents/VulnerabilityTrends'
import SeverityDistribution from './DashboardComponents/SeverityDistribution'

import AuditFindings from './DashboardComponents/CISOAnalytics/AuditFindings'
import ComplianceStatus from './DashboardComponents/CISOAnalytics/ComplianceStatus'
import NumberOfOpenVulnerabilities from './DashboardComponents/CISOAnalytics/NumberOfOpenVulnerabilities'
import SSDLCScore from './DashboardComponents/CISOAnalytics/SSDLCScore'

import RiskScore from './DashboardComponents/CISOAnalytics/RiskScore'
import ThreatAlerts from './DashboardComponents/CISOAnalytics/ThreatAlerts'
import ThreatTrends from './DashboardComponents/CISOAnalytics/ThreatTrends'
import TimeToResolveVulnerabilities from './DashboardComponents/CISOAnalytics/TimeToResolveVulnerabilities'
import Top10Vulnerabilities from './DashboardComponents/CISOAnalytics/Top10Vulnerabilities'
import TopRisks from './DashboardComponents/CISOAnalytics/TopRisks'
import VulnerabilitySeverityDistribution from './DashboardComponents/CISOAnalytics/VulnerabilitySeverityDistribution'


const UserDashboard = () => {

  const random = () => Math.round(Math.random() * 100)
  const [dashboardData, setDashboardData] = useState({})

 
  const [loadingStats, setLoadingStats] = useState(false) 
  

  const reloadNewPage = (location) => {
    window.location.href = location;
  }

  const ref = useRef(null); 

  useEffect(() => {

    fetchDashboardData();
    
  }, []); 



  const fetchDashboardData = () => {

    // Set from localStorage cache
    if (localStorage.getItem('dashboardData')) {
      
      setDashboardData(JSON.parse(localStorage.getItem('dashboardData')));
    }else{
      setLoadingStats(true);
    }


    const endpoint = 'api/v1/users/getUserDashboardCardsData';
    const token = localStorage.getItem('ASIToken');

    axios.get(endpoint, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(response => {
        setDashboardData(response.data.dashboardData);

        // Save into local storage to show from cache while it loads next time
        localStorage.setItem('dashboardData', JSON.stringify(response.data.dashboardData));

        setLoadingStats(false)
      })
      .catch(error => {
        console.error('Error fetching dashboard data:', error);
        setLoadingStats(false)
      });
  }; 


 
  return (
    <>

      <CContainer style={{marginBottom:30}}>

        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', width: '100%', flexWrap:'wrap' }}>

          <div className="theCards" style={{
            display: 'flex', flexDirection: 'row', 
            borderRadius: 10, padding: 20, 
          }}>

            <Link onClick={() => reloadNewPage( "/api-inventory")}
               style={{ textDecoration: 'none', background:'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>

              <BsCollection size={40} style={{ color: '#7367f0', backgroundColor:'#eae8fd', padding:'0.5rem', borderRadius:'50rem' }} />

            </Link>

            <Link style={{ textDecoration: 'none' }} onClick={() => reloadNewPage( "/api-inventory")}>

              <div className="dashboardLinkDiv">

                {loadingStats ?
                 <div style={{display:'flex', flexDirection:'column', height:35, justifyContent:'space-between'}}>
                  <Breathing width={100} height={5} />
                  <Breathing width={70} height={5} style={{marginTop:3}}/>
                  <Breathing width={50} height={5} style={{marginTop:3}}/>
                 </div>
                  :
                  <span className="cardText" style={{ fontWeight: 600, fontSize:18, color:'rgb(93, 89, 108)', display:'block'}}>{dashboardData.collectionsCount}</span>
                }

                <span className="cardText" style={{ fontSize: 13, color:'rgb(111, 107, 125)', display:'block'  }}>API Collections</span>
              </div>
            </Link>

          </div>


          <div className="theCards" style={{ display: 'flex', flexDirection: 'row', borderRadius: 10, padding: 20,  }}>

            <Link onClick={() => reloadNewPage( "/api-inventory")}
             style={{ textDecoration: 'none', background:'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TbApi size={40} style={{ color: '#00cfe8', backgroundColor:'#d9f8fc', padding:'0.5rem', borderRadius:'50rem' }} />
            </Link>

            <Link style={{ textDecoration: 'none' }} onClick={() => reloadNewPage( "/api-inventory")}>
              <div className="dashboardLinkDiv">
                {loadingStats ?
                  <div style={{display:'flex', flexDirection:'column', height:35, justifyContent:'space-between'}}>
                  <Breathing width={100} height={5} />
                  <Breathing width={70} height={5} style={{marginTop:3}}/>
                  <Breathing width={50} height={5} style={{marginTop:3}}/>
                 </div>
                  :
                  <span className="cardText" style={{ fontWeight: 600, fontSize:18, color:'rgb(93, 89, 108)', display:'block'}}>{dashboardData.endPointsCount}</span>
                }
                <span className="cardText" style={{ fontSize: 13, color:'rgb(111, 107, 125)', display:'block'  }}>API Endpoints</span>
              </div>
            </Link>

          </div>


          <div className="theCards" style={{
            display: 'flex', flexDirection: 'row', borderRadius: 10, padding: 20,           
          }}>

            <Link  onClick={() => reloadNewPage( "/agents")}
             style={{ textDecoration: 'none', background:'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <HiOutlineDesktopComputer size={40} style={{ color: '#7367f0', backgroundColor:'#eae8fd', padding:'0.5rem', borderRadius:'50rem' }} />
            </Link>

            <Link  style={{ textDecoration: 'none', width: '50%', }} onClick={() => reloadNewPage( "/agents")}>
              <div className="dashboardLinkDiv">
                {loadingStats ?
                  <div style={{display:'flex', flexDirection:'column', height:35, justifyContent:'space-between'}}>
                  <Breathing width={100} height={5} />
                  <Breathing width={70} height={5} style={{marginTop:3}}/>
                  <Breathing width={50} height={5} style={{marginTop:3}}/>
                 </div>
                  :
                  <span className="cardText" style={{ fontWeight: 600, fontSize:18, color:'rgb(93, 89, 108)', display:'block'}}>{dashboardData.agentsCount}</span>
                }
                <span className="cardText" style={{ fontSize: 13, color:'rgb(111, 107, 125)', display:'block'  }}>Agents</span>
              </div>
            </Link>

          </div>              


          <div className="theCards secondRow" style={{ display: 'flex', flexDirection: 'row', borderRadius: 10, padding: 20, }}>

            <Link 
            onClick={() => reloadNewPage( "/alerts")} 
            style={{ textDecoration: 'none', background:'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AiOutlineIssuesClose size={40} style={{ color: '#ea5455', backgroundColor:'#fce5e6', padding:'0.5rem', borderRadius:'50rem' }} />
            </Link>

            <Link  style={{ textDecoration: 'none' }} onClick={() => reloadNewPage( "/alerts")} >
              <div className="dashboardLinkDiv">
                {loadingStats ?
                  <div style={{display:'flex', flexDirection:'column', height:35, justifyContent:'space-between'}}>
                  <Breathing width={100} height={5} />
                  <Breathing width={70} height={5} style={{marginTop:3}}/>
                  <Breathing width={50} height={5} style={{marginTop:3}}/>
                 </div>
                  :
                  <span className="cardText" style={{ fontWeight: 600, fontSize:18, color:'rgb(93, 89, 108)', display:'block'}}>{dashboardData.vulnerabilitiesCount}</span>
                }
                <span className="cardText" style={{ fontSize: 13, color:'rgb(111, 107, 125)', display:'block'  }}>Vulnerabilities</span>
              </div>
            </Link>
          </div>

       

          <div className="theCards secondRow"  style={{ display: 'flex', flexDirection: 'row', borderRadius: 10, padding: 20,  }}>

            <Link  onClick={() => reloadNewPage( "/pii-data")}
            style={{ textDecoration: 'none', background:'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <MdOutlinePersonalInjury size={40} style={{ color: '#28c76f', backgroundColor:'#dff7e9', padding:'0.5rem', borderRadius:'50rem' }} />
            </Link>

            <Link  style={{ textDecoration: 'none' }} onClick={() => reloadNewPage( "/pii-data")}>
              <div className="dashboardLinkDiv">
                {loadingStats ?
                  <div style={{display:'flex', flexDirection:'column', height:35, justifyContent:'space-between'}}>
                  <Breathing width={100} height={5} />
                  <Breathing width={70} height={5} style={{marginTop:3}}/>
                  <Breathing width={50} height={5} style={{marginTop:3}}/>
                 </div>
                  :
                  <span className="cardText" style={{ fontWeight: 600, fontSize:18, color:'rgb(93, 89, 108)', display:'block'}}>{dashboardData.piiDataFieldsCount}</span>
                }
                <span className="cardText" style={{ fontSize: 13, color:'rgb(111, 107, 125)', display:'block'  }}>PII Data Fields</span>
              </div>
            </Link>
          </div>

          <div className="theCards secondRow" 
          style={{ display: 'none', flexDirection: 'row', borderRadius: 10, padding: 20, }}>

            <Link style={{ textDecoration: 'none', background:'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AiOutlineCloudServer size={40} style={{ color: '#7367f0', backgroundColor:'#eae8fd', padding:'0.5rem', borderRadius:'50rem' }} />
            </Link>

            <Link  style={{ textDecoration: 'none' }}>
              <div className="dashboardLinkDiv">
                {loadingStats ?
                  <Breathing width={100} height={40} />
                  :
                  <span className="cardText" style={{ fontWeight: 600, fontSize:18, color:'rgb(93, 89, 108)', display:'block'}}>0</span>
                }
                <span className="cardText" style={{ fontSize: 13, color:'rgb(111, 107, 125)', display:'block'  }}>Protected Hosts</span>
              </div>
            </Link>
          </div>


        </div>


        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', flexWrap:'wrap' }}>

            <VulnerabilityDistribution/>
            <TopEndpoints/>

        </div>     


        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', flexWrap:'wrap' }}>

            <VulnerabilityTrends/>
            <SeverityDistribution/>

        </div> 



        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', flexWrap:'wrap' }}>

            <NumberOfOpenVulnerabilities/>
            <TimeToResolveVulnerabilities/>
            <ComplianceStatus/>
            <SSDLCScore/>

            <AuditFindings/>
            <ThreatAlerts/>
            <ThreatTrends/>
            <RiskScore/>
            <TopRisks/>

        </div> 

      </CContainer>
    </>
  )
}

export default UserDashboard