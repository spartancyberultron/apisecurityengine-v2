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

const AttackSurfaceManagement = () => {

  //const [toast, addToast] = useState(0)
  const navigate = useNavigate()

  const [attackSurfaceScans, setAttackSurfaceScans] = useState([])
  const [onLoading, setOnLoading] = useState(false);

  const [pageCount, setPageCount] = useState(100);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(100);
  const [onDeleting, setOnDeleting] = useState(false);

  const [scanToDelete, setScanToDelete] = useState(null);
  const [modalIsOpen, setModalIsOpen] = React.useState(false);

  const [itemOffset, setItemOffset] = useState(0);

  const [page, setPage] = useState(0);
  const [count, setCount] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const customStyles = {
    content: {
      top: '30%',
      left: '25%',
      width: '50%',
      right: 'auto',
      bottom: 'auto',
      height: '15%',
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

    fetchAttackSurfaceScans(true, 0, rowsPerPage);

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
      const response = await axios.post('api/v1/attackSurfaceScans/deleteAttackSurfaceScan', requestBody, {
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


  const fetchAttackSurfaceScans = async (isFirstTime, page, rowsPerPage) => {

    if (isFirstTime) {
      setOnLoading(true);
    }
  
    const token = localStorage.getItem('ASIToken');
    const response = await axios.get(`/api/v1/attackSurfaceScans/getAllAttackSurfaceScans/${page}/${rowsPerPage}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  
    setAttackSurfaceScans(response.data.attackSurfaceScans);
    setCount(response.data.totalCount);
   // setCurrentPage(response.data.currentPage);
   // setTotalRecords(response.data.totalRecords);
  
    setOnLoading(false);
  };


  useEffect(() => {

    const interval = setInterval(() => {

      fetchAttackSurfaceScans(false, 0, rowsPerPage);

    }, 30000);
    

    // Make the initial call immediately
    fetchAttackSurfaceScans(true, 0, rowsPerPage);
    isFirstTime.current = false;

    // Clean up the interval on component unmount
    return () => clearInterval(interval);

  }, []);



  const goToViewReport = async (scanId) => {

    navigate('/attack-surface-scan-result?scanId=' + scanId);
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
        label: "Domain",
        options: {
            filter: true,           
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
    {
      label: "Actions",
      options: {
        filter: false,
        download: false,
        customBodyRender: (value, tableMeta, updateValue) => {
          return (<
            div style={{
              display: "flex",
              alignItems: "center"
            }
            } >
            <CButton color="danger"
              onClick={() => handleClick(value)}
              variant="outline"
              className="m-1"
              style={{ width: '100%', fontSize: 12, fontWeight: 'bold', color:'red', borderColor:'red', display:'flex', flexDirection:'row', 
              alignItems:'center', justifyContent:'center' }}>
              <MdOutlineDelete size={20} style={{ color: 'red' }}/>
              <span style={{marginLeft:5}}>Delete</span>
              </CButton>
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
    rowsPerPageOptions: [10, 20, 60, 100, 150],    
    pagination: true,
    textLabels: {
      body: {
        noMatch: 'No attack surface scans run yet',
      }
    },
    serverSide: true,
    count: count,
    page: page,
    rowsPerPage: rowsPerPage,
    onTableChange: (action, tableState) => {
      if (action === 'changePage' || action === 'changeRowsPerPage') {
        const { page, rowsPerPage } = tableState;
        setPage(page);
        setRowsPerPage(rowsPerPage);
        fetchAttackSurfaceScans(false, page, rowsPerPage);
      }
    }
  };


  var tableData = [];

  console.log('attackSurfaceScans:',attackSurfaceScans)


  for (var i = 0; i < attackSurfaceScans.length; i++) {

    var dataItem = [];

    dataItem.push(i+1);
    //dataItem.push(attackSurfaceScans[i].projectName?attackSurfaceScans[i].projectName:'---');

    dataItem.push(attackSurfaceScans[i].orgProject?attackSurfaceScans[i].orgProject.name:'---');

    dataItem.push(attackSurfaceScans[i].domain?attackSurfaceScans[i].domain:'---');

    dataItem.push(attackSurfaceScans[i].endpointsCount);

    dataItem.push((new Date(attackSurfaceScans[i].createdAt)).toLocaleDateString('en-US') + 
    ' - ' + (new Date(attackSurfaceScans[i].createdAt)).toLocaleTimeString('en-US'));

    if (attackSurfaceScans[i].scanCompletedAt) {
      dataItem.push((new Date(attackSurfaceScans[i].scanCompletedAt)).toLocaleDateString('en-US')
        + ' - ' + (new Date(attackSurfaceScans[i].scanCompletedAt)).toLocaleTimeString('en-US'));
    } else {
      dataItem.push('---');
    }

    dataItem.push(attackSurfaceScans[i].vulnCount);   
    

    if(attackSurfaceScans[i].status){
      dataItem.push(attackSurfaceScans[i].status.toUpperCase());
    }else{
      dataItem.push('');
    }
    
    dataItem.push(attackSurfaceScans[i]); // for view report link
    dataItem.push(attackSurfaceScans[i]._id); // for delete

    tableData.push(dataItem);
  }

  const goToStartQuickScan = (e) => {

    e.preventDefault();
    navigate('/start-attack-surface-scan')
  }



  return (
    <div className="activeScans">

      {setModalIsOpen && (
        <Modal
          isOpen={modalIsOpen}
          onRequestClose={closeModal}
          style={customStyles}
          contentLabel="Remediations"
        >
          <text style={{ color: '#000', fontSize: 18 }}>Are you sure you want to permanently delete this scan?</text>
          <br/><br/>
          <button onClick={() => handleConfirmation(true)} style={{ width: 100, borderWidth: 0, backgroundColor: '#28C76F', color:'white', padding: 10 }}>Yes</button>
          <button onClick={() => handleConfirmation(false)} style={{ marginLeft: 30, borderWidth: 0, width: 100, backgroundColor: 'red', color:'white', padding: 10 }}>No</button>
        </Modal>
      )}


      <div style={{ width: '100%' }}>
        <div>
          <div style={{ marginBottom: '2rem', display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>

            <span className="pageHeader">Attack Surface Scans</span>

            <CButton
              className="primaryButton"              
              onClick={goToStartQuickScan}
              color="primary"
              style={{display:'none'}}
            >
              <AiOutlineSecurityScan size={20} color='white'/>

              <span className="primaryButtonText" style={{marginLeft:10}}>Start an Attack Surface Scan</span>
            </CButton>
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


             
            </>
          }

        </div>
      </div>
    </div>
  )
}

export default AttackSurfaceManagement



