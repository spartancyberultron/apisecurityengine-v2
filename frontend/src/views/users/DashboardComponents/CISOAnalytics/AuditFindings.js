
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


const AuditFindings = () => {


    const [loading, setLoading] = useState(false)
    const [auditFindings, setAuditFindings] = useState([]);



    useEffect(() => {

      getResponse();
  
    }, []);
  
    
  
  
    const getResponse = () => {

      setLoading(true);
  
      // Set from localStorage cache
     const storedAuditFindings = localStorage.getItem('auditFindings');

if (storedAuditFindings !== null) {
  try {
    setAuditFindings(JSON.parse(storedAuditFindings));
  } catch (error) {
    console.error('Error parsing auditFindings:', error);
    setAuditFindings([]); // Default value if parsing fails
  }
} else {
  setAuditFindings([]);
}
  
      const endpoint = 'api/v1/users/getAuditFindings';
      const token = localStorage.getItem('ASIToken');
  
      axios.get(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
        .then(response => {
  
  
          setAuditFindings(response.data.auditFindings);
  
          // Save into local storage to show from cache while it loads next time
          localStorage.setItem('auditFindings', JSON.stringify(response.data.auditFindings));
  
          setLoading(false)
        })
        .catch(error => {
          //console.error('Error fetching dashboard data:', error);
          setLoading(false)
        });
    };

    const data = {
      categories: auditFindings.map(finding => finding.category),
      reportedIssues: auditFindings.map(finding => finding.reportedIssues),
      remediatedIssues: auditFindings.map(finding => finding.remediatedIssues),
  };
    
      const chartOptions = {
        chart: {
          type: 'bar',
          height: 350,
        },
        plotOptions: {
          bar: {
            horizontal: false,
            columnWidth: '55%',
            endingShape: 'rounded',
          },
        },
        dataLabels: {
          enabled: false,
        },
        stroke: {
          show: true,
          width: 2,
          colors: ['transparent'],
        },
        xaxis: {
          categories: data.categories,
        },
        yaxis: {
          title: {
            text: 'Number of Issues',
          },
        },
        fill: {
          opacity: 1,
        },
        tooltip: {
          y: {
            formatter: function (val) {
              return val + ' issues';
            },
          },
        },
      };
    
      const chartSeries = [
        {
          name: 'Reported Issues',
          data: data.reportedIssues,
        },
        {
          name: 'Remediated Issues',
          data: data.remediatedIssues,
        },
      ];
    

    return (


        <div className="theCards" style={{
            display: 'flex', flexDirection: 'column', borderRadius: 10, padding: 20, marginTop: 20,
            width: '49%',
        }}>


            <div >

                <span style={{ color: '#5D596C', textAlign: 'left', marginTop: 10, fontSize: 18, display: 'block' }}>Audit Findings</span>
                <span style={{ fontSize: 13, textAlign: 'left', alignSelf: 'left', color: 'rgb(165, 163, 174', display: 'block' }}>
                     Summary of findings from recent audits and status of remediation efforts</span>
                <hr style={{ borderColor: 'white' }} />


                {loading ?



                    <div style={{ display: 'flex', flexDirection: 'column', height: 300, justifyContent: 'space-between' }}>
                        <Breathing width={'100%'} height={10} style={{ borderRadius: 150, alignSelf: 'center', }} />
                        <Breathing width={'80%'} height={10} style={{ borderRadius: 150, alignSelf: 'center', marginTop: 5 }} />
                        <Breathing width={'80%'} height={10} style={{ borderRadius: 150, alignSelf: 'center', marginTop: 5 }} />
                        <Breathing width={'70%'} height={10} style={{ borderRadius: 150, alignSelf: 'center', marginTop: 5 }} />
                        <Breathing width={'60%'} height={10} style={{ borderRadius: 150, alignSelf: 'center', marginTop: 5 }} />
                        <Breathing width={'50%'} height={10} style={{ borderRadius: 150, alignSelf: 'center', marginTop: 5 }} />
                        <Breathing width={'70%'} height={10} style={{ borderRadius: 150, alignSelf: 'center', marginTop: 5 }} />
                        <Breathing width={'60%'} height={10} style={{ borderRadius: 150, alignSelf: 'center', marginTop: 5 }} />
                        <Breathing width={'50%'} height={10} style={{ borderRadius: 150, alignSelf: 'center', marginTop: 5 }} />
                        <Breathing width={'70%'} height={10} style={{ borderRadius: 150, alignSelf: 'center', marginTop: 5 }} />
                        <Breathing width={'60%'} height={10} style={{ borderRadius: 150, alignSelf: 'center', marginTop: 5 }} />
                        <Breathing width={'50%'} height={10} style={{ borderRadius: 150, alignSelf: 'center', marginTop: 5 }} />
                    </div>

                    :

                    <>


                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                height: '50vh',
                            }}>

                            <div style={{ flex: 1, minWidth: 0, marginTop: 100 }}>

                            <Chart
        options={chartOptions}
        series={chartSeries}
        type="bar"
        height={350}
      />


                            </div>

                        </div>



                    </>
                }

            </div>

        </div>


    )

}

export default AuditFindings