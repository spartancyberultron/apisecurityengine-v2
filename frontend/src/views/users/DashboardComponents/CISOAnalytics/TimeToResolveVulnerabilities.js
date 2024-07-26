
import React, { useState, useEffect, useRef } from "react";

import { Shimmer, Breathing } from 'react-shimmer'
import axios from 'axios';
import Chart from 'react-apexcharts'
import { CgNotes } from "react-icons/cg";

import GaugeChart from 'react-gauge-chart'

import {
    CCol,
    CRow,
    CContainer,
} from '@coreui/react'


const TimeToResolveVulnerabilities = () => {


    const [loading, setLoading] = useState(false)

    const [averageResolutionTime, setAverageResolutionTime] = useState(0)

  useEffect(() => {

    getTimeToResolveVulnerabilities();

  }, []);

  const formatResolutionTime = (timeString) => {

    const timeNumber = parseFloat(timeString);
    if (!isNaN(timeNumber)) {
      return timeNumber.toFixed(1);
    }
    return '0.0'; // fallback value if parsing fails
  };


  const getTimeToResolveVulnerabilities = () => {

    // Set from localStorage cache
    if (localStorage.getItem('averageResolutionTime')) {
        setAverageResolutionTime(JSON.parse(localStorage.getItem('averageResolutionTime')));
    } else {
        setAverageResolutionTime(true);
    }


    const endpoint = 'api/v1/users/getTimeToResolveVulnerabilities';
    const token = localStorage.getItem('ASIToken');

    axios.get(endpoint, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(response => {


        setAverageResolutionTime(response.data.averageResolutionTime);

        // Save into local storage to show from cache while it loads next time
        localStorage.setItem('averageTime', JSON.stringify(response.data.averageResolutionTime));

        setLoading(false)
      })
      .catch(error => {
        //console.error('Error fetching dashboard data:', error);
        setLoading(false)
      });
  };


    return (


        <div className="theCards" style={{
            display: 'flex', flexDirection: 'column', borderRadius: 10, padding: 20, marginTop: 20,
            width: '49%',
        }}>


            <div >

                <span style={{ color: '#5D596C', textAlign: 'left', marginTop: 10, fontSize: 18, display: 'block' }}>
                    Time to Resolve Vulnerabilities</span>
                <span style={{ fontSize: 13, textAlign: 'left', alignSelf: 'left', color: 'rgb(165, 163, 174', display: 'block' }}>
                Average time taken to address vulnerabilities from detection to resolution</span>
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
                                flexDirection:'column',
                                justifyContent: 'center',
                                alignItems: 'center',
                                height:'100%'
                            }}>

                            <div style={{  minWidth: 0, marginTop: 10, justifyContent:'center',  width:'100%' }}>


                            <GaugeChart id="gauge-chart3"
                        nrOfLevels={5}
                        colors={['#32CD32', '#9ACD32', '#FFD700', '#FF8C00', '#FF0000']}
                        arcWidth={0.2}
                        percent={0.33}
                        hideText={true}  
                        width='100%'
                        />       




                            </div>

                            <span style={{textAlign:'center', fontSize:20}}>{formatResolutionTime(averageResolutionTime)} mins</span>


                        </div>



                    </>
                }

            </div>

        </div>


    )

}

export default TimeToResolveVulnerabilities