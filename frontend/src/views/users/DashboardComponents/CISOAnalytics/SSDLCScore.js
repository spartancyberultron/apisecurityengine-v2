import React, { useState, useEffect } from "react";
import Chart from 'react-apexcharts';
import { Shimmer, Breathing } from 'react-shimmer'
import axios from 'axios';


const SSDLCScore = () => {

    const [loading, setLoading] = useState(false);


    const [ssdlcScore, setSsdlcScore] = useState(null)

    useEffect(() => {
      getResponse();
    }, []);

   
    const getResponse = () => {
      // Set from localStorage cache
      if (localStorage.getItem('ssdlcScore')) {
        setSsdlcScore(JSON.parse(localStorage.getItem('ssdlcScore')));
      } else {
        setSsdlcScore(true);
      }

      const endpoint = 'api/v1/users/getSSDLCScore';
      const token = localStorage.getItem('ASIToken');

      axios.get(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
        .then(response => {

          setSsdlcScore(response.data.ssdlcScore);

          // Save into local storage to show from cache while it loads next time
          localStorage.setItem('ssdlcScore', JSON.stringify(response.data.ssdlcScore));

          setLoading(false)
        })
        .catch(error => {
          setLoading(false)
        });
    };

    console.log('ssdlcScore:',ssdlcScore)


    let data;
    let chartOptions;
let chartSeries;

    if(ssdlcScore){
  // Adapt the data for the chart
data = {
    categories: ['Development', 'Design', 'Testing', 'Maintenance'],
    series: [
        {
            name: 'REST',
            data: [
                ssdlcScore.ActiveScanVulnerability.Development,
                ssdlcScore.ActiveScanVulnerability.Design,
                ssdlcScore.ActiveScanVulnerability.Testing,
                ssdlcScore.ActiveScanVulnerability.Maintenance
            ],
        },
        {
            name: 'SOAP/GraphQL',
            data: [
                ssdlcScore.SOAPOrGraphQLScanVulnerability.Development,
                ssdlcScore.SOAPOrGraphQLScanVulnerability.Design,
                ssdlcScore.SOAPOrGraphQLScanVulnerability.Testing,
                ssdlcScore.SOAPOrGraphQLScanVulnerability.Maintenance
            ],
        },
        {
            name: 'SBOM',
            data: [
                ssdlcScore.SBOMScanVulnerability.Development,
                ssdlcScore.SBOMScanVulnerability.Design,
                ssdlcScore.SBOMScanVulnerability.Testing,
                ssdlcScore.SBOMScanVulnerability.Maintenance
            ],
        },
        {
            name: 'LLM',
            data: [
                ssdlcScore.LLMScan.Development,
                ssdlcScore.LLMScan.Development?ssdlcScore.LLMScan.Design:0, // No data for Design
                ssdlcScore.LLMScan.Development?ssdlcScore.LLMScan.Testing:0, // No data for Testing
                ssdlcScore.LLMScan.Development?ssdlcScore.LLMScan.Maintenance:0  // No data for Maintenance
            ],
        },
    ],
};

// Chart options
chartOptions = {
    chart: {
        type: 'bar',
        height: 350,
        stacked: true, // Stack bars
    },
    plotOptions: {
        bar: {
            horizontal: true, // Horizontal bars
            barHeight: '80%',
            endingShape: 'rounded',
        },
    },
    dataLabels: {
        enabled: false,
    },
    stroke: {
        show: true,
        width: 1,
        colors: ['#fff'],
    },
    xaxis: {
        categories: data.categories,
        title: {
            text: 'Number of Vulnerabilities',
            style: {
                color: '#000', // Black color for x-axis title
            },
        },
        labels: {
            style: {
                colors: '#000', // Black color for x-axis labels
            },
        },
    },
    yaxis: {
        title: {
            text: '',
            style: {
                color: '#000', // Black color for y-axis title
            },
        },
        labels: {
            style: {
                colors: '#000', // Black color for y-axis labels
            },
        },
    },
    fill: {
        opacity: 1,
    },
    tooltip: {
        y: {
            formatter: function (val) {
                return val;
            },
        },
    },
};

chartSeries = data.series;


    }
// Use `data.series` and `chartOptions` in your chart rendering logic

  

    return (
        <div className="theCards" style={{
            display: 'flex', flexDirection: 'column', borderRadius: 10, padding: 20, marginTop: 20,
            width: '49%',
        }}>
            <div style={{width:'100%'}}>
                <span style={{ color: '#5D596C', textAlign: 'left', marginTop: 10, fontSize: 18, display: 'block' }}>
                    SSDLC Score
                </span>
                <span style={{ fontSize: 13, textAlign: 'left', alignSelf: 'left', color: 'rgb(165, 163, 174', display: 'block' }}>
                    SSDLC Score according to the number of vulnerabilities found in different phases and APIs
                </span>
                <hr style={{ borderColor: 'white' }} />

                {loading ? (
                    <div style={{ display: 'flex', flexDirection: 'column', height: 300, justifyContent: 'space-between' }}>
                        {/* Loading shimmer effect */}
                        <Breathing width={'100%'} height={10} style={{ borderRadius: 150, alignSelf: 'center', }} />
                        {/* Add more Breathing components if needed */}
                    </div>
                ) : (
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            width:'100%',
                            height:'100%',
                        }}
                    >
                        {ssdlcScore &&
                        <Chart
                            options={chartOptions}
                            series={chartSeries}
                            type="bar"
                            width={450}
                            height={350}
                        />
                        }
                    </div>
                )}
            </div>
        </div>
    );
};

export default SSDLCScore;
