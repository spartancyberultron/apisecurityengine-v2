import React, { useState, useEffect, useRef } from "react";
import { CFormInput, CButton, CFormSelect, CTable, CToast, CToastBody, CToaster } from '@coreui/react'
import MUIDataTable from "mui-datatables";
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios';
import { CSSProperties } from "react";
import GridLoader from "react-spinners/GridLoader";
import { useLocation } from 'react-router-dom'
import { ShimmerTable, ShimmerTitle, ShimmerCircularImage } from "react-shimmer-effects";


const PIIDataDetails = () => {

  const [toast, addToast] = useState(0)
  const navigate = useNavigate()

  const location = useLocation();

  const [piiData, setPiiData] = useState([])
  const [endpoints, setEndpoints] = useState([])
  const [onLoading, setOnLoading] = useState(false);

  useEffect(() => {

    var arr = location.search.split('=');

    var thePiiData = arr[1];
    setPiiData(thePiiData);

    loadPIIDataDetails(thePiiData);

  }, []);

  function extractHostAndEndpoint(url) {

    // Check if the URL contains {{baseUrl}}
    if (url.includes('{{baseUrl}}')) {

      var host = '{{baseUrl}}';
      var endpoint = url.replace(/\{\{baseUrl\}\}/, '');
      return { host, endpoint };

    } else if (url.includes('{{host}}')) {

      var host = '{{host}}';
      var endpoint = url.replace(/\{\{host\}\}/, '');
      return { host, endpoint };

    } else {

      const queryIndex = url.indexOf('?');

      if (queryIndex !== -1) {
        url = url.substring(0, queryIndex);
      }

      console.log('urltwo:', url)


      const urlRegex = /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i;

      if (urlRegex.test(url)) {
        
        const { host, pathname } = new URL(url);

        const pathSegments = pathname.split('/').filter(segment => segment.trim() !== '');

        const endpoint = pathSegments.slice(0).join('/');

        return { host, endpoint };
      } else {
        return null;
      }

    }

  }  


  const loadPIIDataDetails = async (thePiiData) => {


    setOnLoading(true);

    const data = {
      piiData: decodeURIComponent(thePiiData),
    };

    const token = localStorage.getItem('ASIToken');
    const response = await axios.post('api/v1/users/getPIIDataDetails', data, {
      headers: { Authorization: `Bearer ${token}` },
    });

    setEndpoints(response.data.endpointStrings);
    setOnLoading(false);

  };



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

  console.log('endpoints:', endpoints)

  return (
    <div style={{ overflow: "scroll", position: 'relative', overflowY: 'hidden', overflowX: 'hidden', }}>
      <div style={{ width: '100%' }}>
        <div>
          <div style={{ marginBottom: '2rem', display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>

            <h2>Endpoints containing PII Data - <span style={{ color: '#00BDC1' }}>{decodeURIComponent(piiData)}</span></h2>

          </div>

          <div style={{ display: 'flex', flexDirection: 'column', marginBottom: 20 }}>

            {onLoading ?
              <ShimmerTable row={8} col={10} />
              :

              <>

                {endpoints && endpoints.length > 0 && endpoints.map((endpoint, index) => (

                  <div style={{ display: 'flex', flexDirection: 'column', background: '#fff', borderRadius: 15, marginTop: 20, padding: 20, }}>
                    <span style={{ color: 'white' }}>{(extractHostAndEndpoint(endpoint.url)).host}</span>
                    <span style={{ color: 'white' }}>{(extractHostAndEndpoint(endpoint.url)).endpoint}</span>
                  </div>
                ))}

              </>
            }

          </div>



        </div>
      </div>
    </div>
  )
}

export default PIIDataDetails



