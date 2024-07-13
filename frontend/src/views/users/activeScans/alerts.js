import React, { useState, useEffect, useRef } from "react";
import { CFormInput, CButton, CFormSelect, CTable, CToast, CToastBody, CToaster } from '@coreui/react'
import MUIDataTable from "mui-datatables";
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios';
import { CSSProperties } from "react";
import { ShimmerTable } from "react-shimmer-effects";
import ReactPaginate from 'react-paginate';
import { extractHostAndEndpoint } from '../utils';

const Alerts = () => {

  const [toast, addToast] = useState(0)
  const navigate = useNavigate()

  const [vulnerabilities, setVulnerabilities] = useState([])
  const [onLoading, setOnLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(100);
  const [itemOffset, setItemOffset] = useState(0);

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


  const itemsPerPage = 10;

  // Invoke when user click to request another page.
  const handlePageClick = (event) => {

    var requestedPage = event.selected + 1;

    fetchVulnerabilitiesFound(requestedPage);

    const newOffset = (event.selected * itemsPerPage) % totalRecords;    

    setItemOffset(newOffset);

  };


  useEffect(() => {    

    fetchVulnerabilitiesFound(1);

  }, []); 


  const fetchVulnerabilitiesFound = async (pageNumber) => {

    setOnLoading(true);

    const token = localStorage.getItem('ASIToken');   

    const response = await axios.get(`/api/v1/users/getAllVulnerabilitiesFound?pageNumber=${pageNumber}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    setVulnerabilities(response.data.activeScansVulnsArray);
    setCurrentPage(response.data.currentPage);
    setTotalRecords(response.data.totalRecords);

    setOnLoading(false);

  };

  const columns = [
    "#",
    "VULNERABILITY",
    {
      label: "SEVERITY",
      options: {
        filter: false,
        download: false,
        customBodyRender: (value, tableMeta, updateValue) => {

          let bgColor;
          let theColor;

          if (value == 'CRITICAL') {

            bgColor = '#FF0000';
            theColor = '#FF0000';

          } else if (value == 'HIGH') {

            bgColor = '#A6001B';
            theColor = '#A6001B';


          } else if (value == 'MEDIUM') {

            bgColor = '#FFC300';
            theColor = 'black';

          } else if (value == 'LOW') {

            bgColor = '#B3FFB3';
            theColor = 'green';
          }          


          return (
            <div style={{
              display: "flex",
              alignItems: "center"
            }} >

             <span className="blackText" style={{padding:5, backgroundColor:bgColor, color:theColor, width:120, textAlign:'center', borderRadius:10, fontSize:13}}>{value}</span>

            </div>
          )
        }
      }
    },
    "HOST",
    "ENDPOINT",
    "FOUND AT",
  ];

  const getMuiTheme = () => createTheme({
    components: {
      MUIDataTableBodyCell: {
        styleOverrides: {
          root: {
            textAlign: "left",
            '&:nth-child(1)': {
                width: 25,
             },            
          }
        }
      },
      MUIDataTableHeadCell: {
        styleOverrides: {
          root: {
            textAlign: "left",
            '&:nth-child(1)': {
                width: 25,
             },            
          }
        }
      },
      
    }
  })

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
    pagination: false
  };

  var tableData = [];


  for (var i = 0; i < vulnerabilities.length; i++) {

    var dataItem = [];

    dataItem.push(vulnerabilities[i].index);
    dataItem.push(vulnerabilities[i].vulnerability.vulnerabilityName);
    dataItem.push(vulnerabilities[i].vulnerability.riskScore);
    //dataItem.push(vulnerabilities[i].endpoint.url);


    if(extractHostAndEndpoint(vulnerabilities[i].endpoint.url)){
        const {host, endpoint} = extractHostAndEndpoint(vulnerabilities[i].endpoint.url)
        dataItem.push(host?host:'---');
        dataItem.push(endpoint?endpoint:'---');
    }else{
        dataItem.push('---');
        dataItem.push('---');
    }

   

    if(vulnerabilities[i]){

       dataItem.push((new Date(vulnerabilities[i].createdAt)).toLocaleDateString('en-US') +
        ' - ' + (new Date(vulnerabilities[i].createdAt)).toLocaleTimeString('en-US'));    
    }

    tableData.push(dataItem);
  }

  const goToStartQuickScan = (e) => {

    e.preventDefault();
    navigate('/start-active-scan')
  }

  return (
    <div className="activeScans">

      <div style={{ width: '100%', overflowX:'hidden', overflow:'hidden'}}>
        <div>
          <div style={{ marginBottom: '2rem', display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>

            <span className="pageHeader">Alerts</span>            

          </div>

          {onLoading &&
<ShimmerTable row={8} col={10} />

}      

          {!onLoading &&

          <>

            <ThemeProvider theme={getMuiTheme()}>
              <MUIDataTable
                style={{ height: "57vh" }}
                data={tableData}
                columns={columns}
                options={options}
              />
            </ThemeProvider>

            <ReactPaginate
                breakLabel="..."
                nextLabel=">"
                onPageChange={handlePageClick}
                pageRangeDisplayed={10}
                pageCount={totalRecords / 10}
                previousLabel="<"
                forcePage={currentPage - 1}
                renderOnZeroPageCount={null}
              />

          </>  
          }

        </div>
      </div>
    </div>
  )
}

export default Alerts



