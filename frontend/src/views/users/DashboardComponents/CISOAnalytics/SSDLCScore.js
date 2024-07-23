import React, { useState, useEffect } from "react";
import Chart from 'react-apexcharts';
import { Shimmer, Breathing } from 'react-shimmer'


const SSDLCScore = () => {
    const [loading, setLoading] = useState(false);

    // Example data
    const data = {
        categories: ['Design', 'Development', 'Testing', 'Maintenance'],
        series: [
            {
                name: 'REST API',
                data: [10, 20, 15, 5], // Example values for REST API
            },
            {
                name: 'SOAP/GraphQL API',
                data: [15, 10, 20, 10], // Example values for SOAP/GraphQL API
            },
            {
                name: 'LLM API',
                data: [5, 25, 10, 15], // Example values for LLM API
            },
        ],
    };

    const chartOptions = {
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

    const chartSeries = data.series;

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
                        <Chart
                            options={chartOptions}
                            series={chartSeries}
                            type="bar"
                            width={450}
                            height={350}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default SSDLCScore;
