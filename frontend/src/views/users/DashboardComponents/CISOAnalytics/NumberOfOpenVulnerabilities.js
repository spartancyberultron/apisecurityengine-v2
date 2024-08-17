
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


const NumberOfOpenVulnerabilities = () => {


    const [loading, setLoading] = useState(false)

    const [vulnerabilities, setVulnerabilities] = useState([]);



    useEffect(() => {

      getResponse();
  
    }, []);    
  
  
    const getResponse = () => {

      setLoading(true);
  
      // Set from localStorage cache
    /*  console.log('localStorage.getItem(vulnerabilities):', localStorage.getItem('vulnerabilities'))
      if (localStorage.getItem('vulnerabilities') && localStorage.getItem('vulnerabilities') !== 'undefined') {
        setVulnerabilities(JSON.parse(localStorage.getItem('vulnerabilities')));
      } else {
        setVulnerabilities({});
      }
      */
  
  
      const endpoint = 'api/v1/users/getNumberOfOpenVulnerabilities';
      const token = localStorage.getItem('ASIToken');
  
      axios.get(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
        .then(response => {
  
  
          setVulnerabilities(response.data.vulnerabilities);
         


          // Save into local storage to show from cache while it loads next time
          localStorage.setItem('vulnerabilities', JSON.stringify(response.data.vulnerabilities));
  
          setLoading(false)
        })
        .catch(error => {
          //console.error('Error fetching dashboard data:', error);
          setLoading(false)
        });
    };



    // Define the labels for the x-axis
const labelsArray = [
  'REST Scans',
  'Attack Surface Scans',
  'API Traffic Scans',
  'SOAP Scans',
  'GraphQL Scans',
  'SBOM Scans',
  'LLM Scans'
];

// Define the corresponding counts for each label
const countsArray = [
  vulnerabilities.openTicketsCountRest,
  vulnerabilities.openTicketsCountAttackSurface,
  vulnerabilities.openTicketsCountAPITrafficScan,
  vulnerabilities.openTicketsCountSOAPScan,
  vulnerabilities.openTicketsCountGraphQLScan,
  vulnerabilities.openTicketsCountSBOMScan,
  vulnerabilities.openTicketsCountLLMScan
];

const chartOptions = {
  chart: {
      type: 'bar'
  },
  plotOptions: {
      bar: {
          horizontal: false,
          distributed: true,
          barHeight: 15,
      }
  },
  xaxis: {
      categories: labelsArray,
      title: {
          text: 'Vulnerability Types',
          style: {
              color: '#000',
              fontSize: '12px',
              fontWeight: 'bold'
          }
      },
      labels: {
          show: false,
          style: {
              colors: '#000'
          }
      }
  },
  legend: {
      labels: {
          colors: '#5D596C'
      },
      containerMargin: {
          top: 100
      }
  },
  tooltip: {
      theme: 'light',
      style: {
          color: '#000000'
      }
  }
};

const chartSeries = [
  {
      name: 'Number of Vulnerabilities',
      data: countsArray
  }
];



    return (



        <div className="theCards" style={{
            display: 'flex', flexDirection: 'column', borderRadius: 10, padding: 20, marginTop: 20,
            width: '49%', height:700
        }}>



            <div >

                <span style={{ color: '#5D596C', textAlign: 'left', marginTop: 10, fontSize: 18, display: 'block' }}>
                    Number of Open Vulnerabilities</span>
                <span style={{ fontSize: 13, textAlign: 'left', alignSelf: 'left', color: 'rgb(165, 163, 174', display: 'block' }}>
                Track the current count of unresolved vulnerabilities</span>
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


                                 { vulnerabilities.openTicketsCountRest ?
                           

 <Chart
        options={chartOptions}
        series={chartSeries}
        type="bar"
        height={500}
        width={'100%'}
      />
      :

<div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 30, }}>
                <CgNotes size={40} style={{ color: '#f73164', textAlign: 'center' }} />
                <text style={{ textAlign: 'center', color: '#f73164', marginTop: 20, fontSize: 13 }}>No Data Yet</text>
              </div>
}
                              

                            </div>


                        </div>



                    </>
                }

            </div>

        </div>


    )

}

export default NumberOfOpenVulnerabilities