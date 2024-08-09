import React, { useState, useEffect, useRef } from "react";
import { CFormInput, CButton, CFormSelect, CTable, CToast, CToastBody, CToaster } from '@coreui/react'
import MUIDataTable from "mui-datatables";
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios';
import { CSSProperties } from "react";
import GridLoader from "react-spinners/GridLoader";
import { ShimmerTable } from "react-shimmer-effects";
import Modal from 'react-modal';
import ReactPaginate from 'react-paginate';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { MdStart } from "react-icons/md";
import { AiOutlineSecurityScan } from "react-icons/ai";
import { MdOutlineDelete } from "react-icons/md";

import { FaEye } from "react-icons/fa";

const ThreatModelling = () => {

  //const [toast, addToast] = useState(0)
  const navigate = useNavigate()

  const [activeScans, setActiveScans] = useState([])
  const [onLoading, setOnLoading] = useState(false);

  const [pageCount, setPageCount] = useState(100);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(100);
  const [onDeleting, setOnDeleting] = useState(false);

  const [scanToDelete, setScanToDelete] = useState(null);
  const [modalIsOpen, setModalIsOpen] = React.useState(false);

  const [itemOffset, setItemOffset] = useState(0);

  const customStyles = {
    content: {
      top: '30%',
      left: '25%',
      width: '50%',
      right: 'auto',
      bottom: 'auto',
      backgroundColor: '#ffffff',
      borderRadius: 15,
      borderColor: 'ffffff'
    },
  };

  const itemsPerPage = 10;

  // Invoke when user click to request another page.
  const handlePageClick = (event) => {

    var requestedPage = event.selected + 1;

    //console.log('requestedPage', requestedPage)

    fetchActiveScans(true, requestedPage);

    const newOffset = (event.selected * itemsPerPage) % totalRecords;
    //console.log(
    //  `User requested page number ${event.selected}, which is offset ${newOffset}`
    //);
    setItemOffset(newOffset);

  };


  // Function to handle the button click and show the confirm dialog
  const handleClick = (user) => {
    setScanToDelete(user);
    setModalIsOpen(true);
  };

  // Function to handle the confirmation action
  const handleConfirmation = (confirmed) => {

    if (confirmed) {
      // Call the function with the value passed to this component
      deleteFunction(scanToDelete);
    }
    setModalIsOpen(false);
  };

  // Function to delete the scan
  const deleteFunction = (scan) => {
    deleteScan(scan)
  };

  const closeModal = async () => {

    setModalIsOpen(false);
  };


  const deleteScan = async (id) => {

    // Construct the request body
    const requestBody = {
      id: id
    };

    // Retrieve the bearer token from localStorage
    const bearerToken = localStorage.getItem('ASIToken');

    try {

      // Make the API request
      const response = await axios.post('api/v1/activeScans/deleteActiveScan', requestBody, {
        headers: {
          Authorization: `Bearer ${bearerToken}`,
        },
      });

      // Handle the API response
      setOnDeleting(false);


      if (response.data.hasOwnProperty('error')) {

        toast.error(response.data.error, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        });

        setOnDeleting(false);

      } else {

        toast('Scan deleted', {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        });

        window.location.reload();

        setOnDeleting(false);

      }


    } catch (error) {
      // Handle API error
      console.error('Error:', error);
      setOnDeleting(false)
    }

  }


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

  const isFirstTime = useRef(true);


  const fetchActiveScans = async (isFirstTime, pageNumber) => {

    if (isFirstTime) {
      setOnLoading(true);
    }
  
    const token = localStorage.getItem('ASIToken');
    const response = await axios.get(`/api/v1/activeScans/getAllActiveScans?pageNumber=${pageNumber}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  
    setActiveScans(response.data.activeScans);
    setCurrentPage(response.data.currentPage);
    setTotalRecords(response.data.totalRecords);
  
    setOnLoading(false);
  };


  useEffect(() => {

    const interval = setInterval(() => {

      fetchActiveScans(false, currentPage);

    }, 30000);
    

    // Make the initial call immediately
    fetchActiveScans(true, currentPage);
    isFirstTime.current = false;

    // Clean up the interval on component unmount
    return () => clearInterval(interval);

  }, []);

  const goToViewReport = async (scanId) => {

    navigate('/threat-modelling-scan-detail?scanId=' + scanId);
  };


  const columns = [
    {
      label: "#",
      options: {
          filter: false,           
      }
    },
    {
      label: "Project",
      options: {
          filter: true,           
      }
    },
    {
      label: "Collection",
      options: {
          filter: false,           
      }
    },
    {
      label: "Endpoints",
      options: {
          filter: false,           
      }
    },
    {
      label: "Started At",
      options: {
          filter: false,           
      }
    },
    {
      label: "Completed At",
      options: {
          filter: false,           
      }
    },
    {
      label: "Vulnerabilities",
      options: {
          filter: false,           
      }
    },
    {
      label: "Status",
      options: {
        filter: true,
        download: true,
        customBodyRender: (value, tableMeta, updateValue) => {

          let bgColor;
          let theColor;

          if (value == 'COMPLETED') {

            bgColor = '#28C76F';
            theColor = '#fff';

          } else if (value == 'FAILED') {

            bgColor = '#A6001B';
            theColor = '#fff';


          } else if (value == 'IN PROGRESS') {

            bgColor = '#FFC300';
            theColor = 'black';

          } 


          return (
            <div style={{
              display: "flex",
              alignItems: "center"
            }} >

              <div style={{
                padding: 5, backgroundColor: bgColor, color: theColor, width: 120,
                textAlign: 'center', borderRadius: 10, fontSize: 12, fontWeight:'normal'
              }}>{value}</div>

            </div>
          )
        }
      }
    },    
    {
      label: "View",
      options: {
        filter: false,
        download: false,
        customBodyRender: (value, tableMeta, updateValue) => {
          return (
            <div style={{
              display: "flex",
              alignItems: "center"
            }} >

              {(value.status == 'in progress' || value.status == 'completed') ?
                <CButton color="primary" variant="outline"
                  onClick={() => goToViewReport(value._id)}
                  className="primaryButton" style={{ width: '100%',  
                   }}>
                    <FaEye style={{ color: '#fff' }} size={20}/>
                    <span className="primaryButtonText" style={{marginLeft:5, fontSize:12}}>View Report</span>
                    </CButton>
                :
                <span style={{ fontSize: 15, color: '#fff', fontWeight: 'bold' }}>---</span>
              }

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
    pagination: false,
    textLabels: {
      body: {
        noMatch: 'No scans created yet',
      }
    }
  };

  var tableData = [];

  for (var i = 0; i < activeScans.length; i++) {

    var dataItem = [];

    dataItem.push(i+1);
    dataItem.push(activeScans[i].theCollectionVersion.apiCollection.orgProject?activeScans[i].theCollectionVersion.apiCollection.orgProject.name:'---');

    dataItem.push(activeScans[i].theCollectionVersion.apiCollection.collectionName?activeScans[i].theCollectionVersion.apiCollection.collectionName:'<Name not found>');

    dataItem.push(activeScans[i].endpointsScanned);

    dataItem.push((new Date(activeScans[i].createdAt)).toLocaleDateString('en-US') + ' - ' + (new Date(activeScans[i].createdAt)).toLocaleTimeString('en-US'));

    if (activeScans[i].scanCompletedAt) {
      dataItem.push((new Date(activeScans[i].scanCompletedAt)).toLocaleDateString('en-US')
        + ' - ' + (new Date(activeScans[i].scanCompletedAt)).toLocaleTimeString('en-US'));
    } else {
      dataItem.push('---');
    }

    dataItem.push((activeScans[i].vulnerabilities).length); 

    if(activeScans[i].status){
      dataItem.push(activeScans[i].status.toUpperCase());
    }else{
      dataItem.push('');
    }

    
    dataItem.push(activeScans[i]); // for view report link

    tableData.push(dataItem);
  }


  


  return (
    <div className="activeScans">

    

      <div style={{ width: '100%' }}>
        <div>
          <div style={{ marginBottom: '2rem', display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>

            <span className="pageHeader">Scans - Threat Modelling</span>

            
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

export default ThreatModelling