
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

    const [severityDistribution, setSeverityDistribution] = useState({})
    const [loadingVulnerabilityDistribution, setLoadingVulnerabilityDistribution] = useState(false)



  useEffect(() => {

    fetchVulnerabilityDistribution();
   

  }, []);     


  const fetchVulnerabilityDistribution = () => {

    // Set from localStorage cache
    /*if (localStorage.getItem('vulnerabilityCounts')) {
      setVulnerabilityDistribution(JSON.parse(localStorage.getItem('vulnerabilityCounts')));
    }else{
      setLoadingVulnerabilityDistribution(true);
    }*/


    const endpoint = 'api/v1/users/getSeverityDistribution';
    const token = localStorage.getItem('ASIToken');

    axios.get(endpoint, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(response => {

        setSeverityDistribution(response.data.severityDistribution);

        // Save into local storage to show from cache while it loads next time
        //localStorage.setItem('vulnerabilityCounts', JSON.stringify(response.data.vulnerabilityCounts));

        setLoadingVulnerabilityDistribution(false)
      })
      .catch(error => {
        //console.error('Error fetching dashboard data:', error);
        setLoadingVulnerabilityDistribution(false)
      });
  };

  console.log('severityDistribution:',severityDistribution)



  // Total vulnerability count
var totalVulnCount = severityDistribution.CRITICAL +
severityDistribution.HIGH + 
severityDistribution.MEDIUM + 
severityDistribution.LOW;

// Calculate percentages for each severity level
var criticalPercent = ((severityDistribution.CRITICAL / totalVulnCount) * 100).toFixed(1);
var highPercent = ((severityDistribution.HIGH / totalVulnCount) * 100).toFixed(1);
var mediumPercent = ((severityDistribution.MEDIUM / totalVulnCount) * 100).toFixed(1);
var lowPercent = ((severityDistribution.LOW / totalVulnCount) * 100).toFixed(1);

// Initialize counts
var criticalCount = severityDistribution.CRITICAL;
var highCount = severityDistribution.HIGH;
var mediumCount = severityDistribution.MEDIUM;
var lowCount = severityDistribution.LOW;

// Create labels array based on the severity distribution
var labelsArray = [];

if (severityDistribution.CRITICAL > 0) {
labelsArray.push(`Critical (${criticalPercent}%)`);
}
if (severityDistribution.HIGH > 0) {
labelsArray.push(`High (${highPercent}%)`);
}
if (severityDistribution.MEDIUM > 0) {
labelsArray.push(`Medium (${mediumPercent}%)`);
}
if (severityDistribution.LOW > 0) {
labelsArray.push(`Low (${lowPercent}%)`);
}

// Severity levels, data, and colors for the chart
var severityLevelsArray = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];
var severityDataArray = [criticalCount, highCount, mediumCount, lowCount];
var severityColorsArray = ['#FF0000', '#A6001B', '#FFC300', '#B3FFB3'];

const severityChartSeries = severityDataArray;

const severitychartOptions = {
labels: severityLevelsArray,
colors: severityColorsArray,
legend: {
position: 'bottom',
verticalAlign: 'middle',
},
};

console.log('severityChartSeries:',severityChartSeries)
console.log('severitychartOptions:',severitychartOptions)
console.log('severityDistribution:',severityDistribution)

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

                  {severityDistribution.hasOwnProperty('CRITICAL') && severityChartSeries && severityChartSeries.length>0
                  && !(severityDistribution.CRITICAL==0 && severityDistribution.HIGH==0 && severityDistribution.MEDIUM==0
                     && severityDistribution.LOW==0  )
                  
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