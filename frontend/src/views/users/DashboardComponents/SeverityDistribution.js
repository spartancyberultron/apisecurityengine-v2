
import React, { useState, useEffect, useRef } from "react";

import { Shimmer, Breathing } from 'react-shimmer'
import axios from 'axios';
import Chart from 'react-apexcharts'
import { CgNotes } from "react-icons/cg";


import {
    CCol,
    CRow,  
    CContainer,  
  } from '@coreui/react'


const SeverityDistribution = () => {

    const [vulnerabilityDistribution, setVulnerabilityDistribution] = useState({})
    const [loadingVulnerabilityDistribution, setLoadingVulnerabilityDistribution] = useState(false)



  useEffect(() => {

    fetchVulnerabilityDistribution();
   

  }, []);     


  const fetchVulnerabilityDistribution = () => {

    // Set from localStorage cache
    if (localStorage.getItem('vulnerabilityCounts')) {
      setVulnerabilityDistribution(JSON.parse(localStorage.getItem('vulnerabilityCounts')));
    }else{
      setLoadingVulnerabilityDistribution(true);
    }


    const endpoint = 'api/v1/users/getVulnerabilityDistribution';
    const token = localStorage.getItem('ASIToken');

    axios.get(endpoint, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(response => {


        setVulnerabilityDistribution(response.data.vulnerabilityCounts);

        // Save into local storage to show from cache while it loads next time
        localStorage.setItem('vulnerabilityCounts', JSON.stringify(response.data.vulnerabilityCounts));

        setLoadingVulnerabilityDistribution(false)
      })
      .catch(error => {
        //console.error('Error fetching dashboard data:', error);
        setLoadingVulnerabilityDistribution(false)
      });
  };

  console.log('vulnerabilityDistribution:',vulnerabilityDistribution)



  var totalVulnCount = vulnerabilityDistribution.vuln1Count +
                       vulnerabilityDistribution.vuln2Count + 
                       vulnerabilityDistribution.vuln3Count + 
                       vulnerabilityDistribution.vuln4Count + 
                       vulnerabilityDistribution.vuln5Count + 
                       vulnerabilityDistribution.vuln6Count + 
                       vulnerabilityDistribution.vuln7Count + 
                       vulnerabilityDistribution.vuln8Count + 
                       vulnerabilityDistribution.vuln9Count + 
                       vulnerabilityDistribution.vuln10Count + 
                       vulnerabilityDistribution.vuln11Count + 
                       vulnerabilityDistribution.vuln12Count + 
                       vulnerabilityDistribution.vuln13Count + 
                       vulnerabilityDistribution.vuln14Count + 
                       vulnerabilityDistribution.vuln15Count + 
                       vulnerabilityDistribution.vuln16Count + 
                       vulnerabilityDistribution.vuln17Count + 
                       vulnerabilityDistribution.vuln18Count;

  var vuln1Percent = ((vulnerabilityDistribution.vuln1Count / totalVulnCount)*100).toFixed(1);
  var vuln2Percent = ((vulnerabilityDistribution.vuln2Count / totalVulnCount)*100).toFixed(1);
  var vuln3Percent = ((vulnerabilityDistribution.vuln3Count / totalVulnCount)*100).toFixed(1);
  var vuln4Percent = ((vulnerabilityDistribution.vuln4Count / totalVulnCount)*100).toFixed(1);
  var vuln5Percent = ((vulnerabilityDistribution.vuln5Count / totalVulnCount)*100).toFixed(1);
  var vuln6Percent = ((vulnerabilityDistribution.vuln6Count / totalVulnCount)*100).toFixed(1);
  var vuln7Percent = ((vulnerabilityDistribution.vuln7Count / totalVulnCount)*100).toFixed(1);
  var vuln8Percent = ((vulnerabilityDistribution.vuln8Count / totalVulnCount)*100).toFixed(1);
  var vuln9Percent = ((vulnerabilityDistribution.vuln9Count / totalVulnCount)*100).toFixed(1);
  var vuln10Percent = ((vulnerabilityDistribution.vuln10Count / totalVulnCount)*100).toFixed(1);
  var vuln11Percent = ((vulnerabilityDistribution.vuln11Count / totalVulnCount)*100).toFixed(1);
  var vuln12Percent = ((vulnerabilityDistribution.vuln12Count / totalVulnCount)*100).toFixed(1);
  var vuln13Percent = ((vulnerabilityDistribution.vuln13Count / totalVulnCount)*100).toFixed(1);
  var vuln14Percent = ((vulnerabilityDistribution.vuln14Count / totalVulnCount)*100).toFixed(1);
  var vuln15Percent = ((vulnerabilityDistribution.vuln15Count / totalVulnCount)*100).toFixed(1);
  var vuln16Percent = ((vulnerabilityDistribution.vuln16Count / totalVulnCount)*100).toFixed(1);
  var vuln17Percent = ((vulnerabilityDistribution.vuln17Count / totalVulnCount)*100).toFixed(1);
  var vuln18Percent = ((vulnerabilityDistribution.vuln18Count / totalVulnCount)*100).toFixed(1);


  var lowCount = 0;
  var mediumCount = 0;
  var highCount = 0;
  var criticalCount = 0;


  var labelsArray = [];

  if (vulnerabilityDistribution.vuln1Count > 0) {
    labelsArray.push('Broken Object Level Authorization ('+vuln1Percent+'%)');
    highCount = highCount + vulnerabilityDistribution.vuln1Count;
  }
  if (vulnerabilityDistribution.vuln2Count > 0) {
    labelsArray.push('Sensitive Data in Path Params ('+vuln2Percent+'%)');
    highCount = highCount + vulnerabilityDistribution.vuln2Count;
  }
  if (vulnerabilityDistribution.vuln3Count > 0) {
    labelsArray.push('Basic Authentication Detected ('+vuln3Percent+'%)');
    mediumCount = mediumCount + vulnerabilityDistribution.vuln3Count;
  }
  if (vulnerabilityDistribution.vuln4Count > 0) {
    labelsArray.push('Endpoint Not Secured by SSL ('+vuln4Percent+'%)');
    highCount = highCount + vulnerabilityDistribution.vuln4Count;
  }
  if (vulnerabilityDistribution.vuln5Count > 0) {
    labelsArray.push('Unauthenticated Endpoint Returning Sensitive Data ('+vuln5Percent+'%)');
    highCount = highCount + vulnerabilityDistribution.vuln5Count;
  }
  if (vulnerabilityDistribution.vuln6Count > 0) {
    labelsArray.push('Sensitive Data in Query Params ('+vuln6Percent+'%)');
    highCount = highCount + vulnerabilityDistribution.vuln6Count;
  }
  if (vulnerabilityDistribution.vuln7Count > 0) {
    labelsArray.push('PII Data Detected in Response ('+vuln7Percent+'%)');
    highCount = highCount + vulnerabilityDistribution.vuln7Count;
  }
  if (vulnerabilityDistribution.vuln8Count > 0) {
    labelsArray.push('HTTP Verb Tampering Possible ('+vuln8Percent+'%)');
    mediumCount = mediumCount + vulnerabilityDistribution.vuln8Count;
  }
  if (vulnerabilityDistribution.vuln9Count > 0) {
    labelsArray.push('Content Type Injection Possible ('+vuln9Percent+'%)');
    highCount = highCount + vulnerabilityDistribution.vuln9Count;
  }
  if (vulnerabilityDistribution.vuln10Count > 0) {
    labelsArray.push('Security Headers not Enabled on Host ('+vuln10Percent+'%)');
    mediumCount = mediumCount + vulnerabilityDistribution.vuln10Count;
  }
  if (vulnerabilityDistribution.vuln11Count > 0) {
    labelsArray.push('Resource Deletion Possible ('+vuln11Percent+'%)');
    highCount = highCount + vulnerabilityDistribution.vuln11Count;
  }
  if (vulnerabilityDistribution.vuln12Count > 0) {
    labelsArray.push('Broken Authentication ('+vuln12Percent+'%)');
    highCount = highCount + vulnerabilityDistribution.vuln12Count;
  }
  if (vulnerabilityDistribution.vuln13Count > 0) {
    labelsArray.push('Excessive Data Exposure ('+vuln13Percent+'%)');
    mediumCount = mediumCount + vulnerabilityDistribution.vuln13Count;
  }
  if (vulnerabilityDistribution.vuln14Count > 0) {
    labelsArray.push('Injection('+vuln14Percent+'%)');
    highCount = highCount + vulnerabilityDistribution.vuln14Count;
  }
  if (vulnerabilityDistribution.vuln15Count > 0) {
    labelsArray.push('XSS Vulnerability Found('+vuln15Percent+'%)');
    highCount = highCount + vulnerabilityDistribution.vuln15Count;
  }
  if (vulnerabilityDistribution.vuln16Count > 0) {
    labelsArray.push('Wallet Hijacking Possible ('+vuln16Percent+'%)');
    highCount = highCount + vulnerabilityDistribution.vuln16Count;
  }
  if (vulnerabilityDistribution.vuln17Count > 0) {
    labelsArray.push('Pre Image Attack Possible ('+vuln17Percent+'%)');
    highCount = highCount + vulnerabilityDistribution.vuln17Count;
  }
  if (vulnerabilityDistribution.vuln18Count > 0) {
    labelsArray.push('Lack of Resource & Rate Limiting ('+vuln18Percent+'%)');
    highCount = highCount + vulnerabilityDistribution.vuln18Count;
  }  
 

  var severityLevelsArray = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']

  var severityDataArray = [lowCount, mediumCount, highCount, criticalCount];


  var severityColorsArray = ['#00FF00', '#FFD700', '#FF0000', '#800080'];
  const severityChartSeries = severityDataArray;     

  const severitychartOptions = {
    labels: severityLevelsArray,
    colors: severityColorsArray,
    legend: {
      position: 'bottom',
      verticalAlign: 'middle',
    },    
  };


    return (


<div className="theCards"  style={{
  display: 'flex', flexDirection: 'column', borderRadius: 10, padding: 20, marginTop: 20,
  width: '49%', 
}}>  


  <div>

              <span style={{ color: '#5D596C', textAlign: 'left', marginTop: 10, fontSize:18, display:'block' }}>Severity Distribution</span>
              <span style={{fontSize:13, textAlign:'left', alignSelf:'left', color:'rgb(165, 163, 174',display:'block' }}>Distribution of severity of all found vulnerabilities</span>
              <hr style={{borderColor:'white'}}/>


              {loadingVulnerabilityDistribution ?


                
                <div style={{display:'flex', flexDirection:'column', height:300, justifyContent:'space-between'}}>
                  <Breathing width={'100%'} height={10} style={{ borderRadius: 150, alignSelf: 'center',  }} />
                  <Breathing width={'80%'} height={10} style={{ borderRadius: 150, alignSelf: 'center', marginTop:5 }} />
                  <Breathing width={'80%'} height={10} style={{ borderRadius: 150, alignSelf: 'center', marginTop:5 }} />
                  <Breathing width={'70%'} height={10} style={{ borderRadius: 150, alignSelf: 'center', marginTop:5 }} />
                  <Breathing width={'60%'} height={10} style={{ borderRadius: 150, alignSelf: 'center',marginTop:5 }} />
                  <Breathing width={'50%'} height={10} style={{ borderRadius: 150, alignSelf: 'center', marginTop:5 }} />
                  <Breathing width={'70%'} height={10} style={{ borderRadius: 150, alignSelf: 'center', marginTop:5 }} />
                  <Breathing width={'60%'} height={10} style={{ borderRadius: 150, alignSelf: 'center',marginTop:5 }} />
                  <Breathing width={'50%'} height={10} style={{ borderRadius: 150, alignSelf: 'center', marginTop:5 }} />
                  <Breathing width={'70%'} height={10} style={{ borderRadius: 150, alignSelf: 'center', marginTop:5 }} />
                  <Breathing width={'60%'} height={10} style={{ borderRadius: 150, alignSelf: 'center',marginTop:5 }} />
                  <Breathing width={'50%'} height={10} style={{ borderRadius: 150, alignSelf: 'center', marginTop:5 }} />
                 </div>

                :

                <>

                  {severityChartSeries && severityChartSeries.length > 0 && !(severityChartSeries[0] == 0  && severityChartSeries[1] == 0  && severityChartSeries[2] == 0 && severityChartSeries[3] == 0 )  
                    ?

                   
                    <div 
                    style={{ display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '50vh', // Use viewport height for the container
                     }}>
                      
                      <div style={{ flex: 1, minWidth: 0, marginTop:100 }}>

                      
                        <Chart options={severitychartOptions} series={severityChartSeries} type="donut" width="100%" height="100%" 
                         />

                         </div>

                   </div>
                   
                    :

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 30, }}>
                    <CgNotes size={40} style={{ color: '#f73164', textAlign: 'center' }} />
                    <text style={{ textAlign: 'center', color: '#f73164', marginTop: 20, fontSize:13 }}>No Data Yet</text>
                  </div>

                  }

                </>
              }

            </div>

</div>


    )

}

export default SeverityDistribution