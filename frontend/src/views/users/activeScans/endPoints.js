import React, { useState, useEffect, useRef } from "react";
import { CFormInput, CButton, CFormSelect, CTable, CToast, CToastBody, CToaster } from '@coreui/react'
import MUIDataTable from "mui-datatables";
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios';
import { CSSProperties } from "react";
import GridLoader from "react-spinners/GridLoader";
import { extractHostAndEndpoint } from '../utils';


const Endpoints = () => {

  const [toast, addToast] = useState(0)
  const navigate = useNavigate()

  const [endpoints, setEndpoints] = useState([])
  const [onLoading, setOnLoading] = useState(false);

  const colors = [
    '#FF5733',
    '#FFC300',
    '#C70039',
    '#900C3F',
    '#581845',
    '#FF4081',
    '#3F51B5',
    '#009688',
    '#FF5722',
    '#607D8B',
    '#4CAF50',
    '#8BC34A',
    '#FF9800',
    '#E91E63',
    '#9C27B0',
    '#03A9F4',
    '#FFEB3B',
    '#F44336',
    '#673AB7',
    '#00BCD4',
    '#FFC107',
    '#FF9800',
    '#795548',
    '#009688',
    '#FF5722',
    '#E91E63',
    '#3F51B5',
    '#FF4081',
    '#FFC300',
    '#4CAF50',
    '#FF9800',
    '#607D8B',
    '#FF5733',
    '#C70039',
    '#900C3F',
    '#581845'
  ];


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


  useEffect(() => {

    const fetchEndpoints = async () => {

      setOnLoading(true);

      const token = localStorage.getItem('ASIToken');
      const response = await axios.get('api/v1/users/getAllEndpoints', {
        headers: { Authorization: `Bearer ${token}` },
      });

      setEndpoints(response.data.endpoints);
      setOnLoading(false);

    };

    fetchEndpoints();

  }, []);



  const columns = [
    "#",
    "HOST",
    "ENDPOINT",
    "METHOD",
    "VULNERABILITIES",
    {
      label: "SENSITIVE DATA",
      options: {
        filter: false,
        download: false,
        customBodyRender: (value, tableMeta, updateValue) => {

          return (
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              flexWrap: 'wrap',
            }} >

              {value.map((val, index) => (

                <CButton color="primary" variant="outline" style={{ height: 30, fontSize: 12, color: colors[index], borderColor: colors[index] }}
                  className="m-1">{val}</CButton>
              ))}


            </div>
          )
        }
      }
    },
  ];

  const getMuiTheme = () => createTheme({
    components: {
      MUIDataTableBodyCell: {
        styleOverrides: {
          root: {
            textAlign: "left",
            '&:nth-child(1)': {
              width: 30,
            },
          }
        }
      },
      MUIDataTableHeadCell: {
        styleOverrides: {
          root: {
            textAlign: "left",
            '&:nth-child(1)': {
              width: 30,
            },
          }
        }
      },

    }
  })


  function isValidUrl(url) {
    const urlRegex = /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i;
    return urlRegex.test(url);
  }





  const options = {
    filterType: "dropdown",
    responsive: "stacked",
    elevation: 0, //for table shadow box
    filter: true,
    download: true,
    print: true,
    search: true,
    searchOpen: true,
    viewColumns: true,
    selectableRows: false, // <===== will turn off checkboxes in rows
    rowsPerPage: 20,
    rowsPerPageOptions: [],
  };

  var tableData = [];


  for (var i = 0; i < endpoints.length; i++) {

    const result = extractHostAndEndpoint(endpoints[i].url);


    if (result) {

      var dataItem = [];

      dataItem.push(i + 1);


      let theEndpoint;
      let theHost;
      const result = extractHostAndEndpoint(endpoints[i].url);

      if (result) {
        const { host, endpoint } = result;
        theEndpoint = endpoint;
        theHost = host;
      } else {
        theEndpoint = '';
        theHost = '';
      }

      //
      dataItem.push(theHost);
      dataItem.push(theEndpoint);
      dataItem.push(endpoints[i].method);
      dataItem.push(endpoints[i].vulnsCount);

      dataItem.push(endpoints[i].piiFields);


      tableData.push(dataItem);
    }else{
      console.log('bad:',endpoints[i]._id);
    }
  }

  const goToStartQuickScan = (e) => {

    e.preventDefault();
    navigate('/start-active-scan')
  }

  return (
    <div style={{ overflow: "scroll", position: 'relative', overflowY: 'hidden', overflowX: 'hidden', }}>
      <div style={{ width: '100%' }}>
        <div>
          <div style={{ marginBottom: '2rem', display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>

            <h2>API Endpoints</h2>

          </div>

          <GridLoader
            color="#7366ff"
            loading={onLoading}
            cssOverride={override}
            size={25}
            aria-label="Loading Spinner"
            data-testid="loader"
          />

          {!onLoading &&
            <ThemeProvider theme={getMuiTheme()}>
              <MUIDataTable
                style={{ height: "57vh" }}
                data={tableData}
                columns={columns}
                options={options}
              />
            </ThemeProvider>
          }

        </div>
      </div>
    </div>
  )
}

export default Endpoints



