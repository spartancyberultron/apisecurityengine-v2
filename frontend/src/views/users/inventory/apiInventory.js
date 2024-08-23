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

const APIInventory = () => {

  //const [toast, addToast] = useState(0)
  const navigate = useNavigate()

  const [apiCollections, setAPICollections] = useState([])
  const [onLoading, setOnLoading] = useState(false);

  const [pageCount, setPageCount] = useState(100);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(100);
  const [onDeleting, setOnDeleting] = useState(false);

  const [collectionToDelete, setCollectionToDelete] = useState(null);
  const [modalIsOpen, setModalIsOpen] = React.useState(false);

  const [itemOffset, setItemOffset] = useState(0);

  const [page, setPage] = useState(0);
  const [count, setCount] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);

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

  

  // Function to handle the button click and show the confirm dialog
  const handleClick = (user) => {
    setCollectionToDelete(user);
    setModalIsOpen(true);
  };

  // Function to handle the confirmation action
  const handleConfirmation = (confirmed) => {

    if (confirmed) {
      // Call the function with the value passed to this component
      deleteFunction(collectionToDelete);
    }
    setModalIsOpen(false);
  };

  // Function to delete the scan
  const deleteFunction = (scan) => {
    deleteAPICollection(scan)
  };

  const closeModal = async () => {

    setModalIsOpen(false);
  };


  const deleteAPICollection = async (id) => {

    // Construct the request body
    const requestBody = {
      id: id
    };

    // Retrieve the bearer token from localStorage
    const bearerToken = localStorage.getItem('ASIToken');

    try {

      // Make the API request
      const response = await axios.post('api/v1/inventory/deleteAPICollection', requestBody, {
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

        toast('Collection deleted', {
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


  const fetchAPICollections = async (isFirstTime, page, rowsPerPage) => {

    if (isFirstTime) {
      setOnLoading(true);
    }

    console.log('page:',page)
  
    const token = localStorage.getItem('ASIToken');
    const response = await axios.get(`/api/v1/inventory/fetchAPICollections/${page}/${rowsPerPage}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  
    setAPICollections(response.data.apiCollections);
    setCount(response.data.totalCount);   

   // setCurrentPage(response.data.currentPage);
   // setTotalRecords(response.data.totalRecords);
  
    setOnLoading(false);
  };



  useEffect(() => {

    const interval = setInterval(() => {

      fetchAPICollections(false, 1, 20);

    }, 30000);
    

    // Make the initial call immediately
    fetchAPICollections(true, 1, 20);
    isFirstTime.current = false;

    // Clean up the interval on component unmount
    return () => clearInterval(interval);

  }, []);



  const goToView = async (collectionId) => {

    navigate('/api-collection-versions?collectionId=' + collectionId);
  };


  const columns = [
    {
      label: "#",
      options: {
          filter: false,           
      }
    },
    {
      label: "Project Name",
      options: {
          filter: true,           
      }
    },
    {
      label: "Collection Name",
      options: {
          filter: true,           
      }
    },    
    {
      label: "Version",
      options: {
          filter: false,           
      }
    },
    {
      label: "Number of Versions",
      options: {
          filter: false,           
      }
    },
    {
      label: "Created At",
      options: {
          filter: false,           
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

                <CButton color="primary" variant="outline"
                  onClick={() => goToView(value._id)}
                  className="primaryButton" style={{ width: '100%',  
                   }}>
                    <FaEye style={{ color: '#fff' }} size={20}/>
                    <span className="primaryButtonText" style={{marginLeft:5, fontSize:12}}>View Versions</span>
                    </CButton>                
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
    pagination: true,
    textLabels: {
      body: {
        noMatch: 'No collections created yet',
      }
    },
    serverSide: true,
    count: count,
    page: page,
    rowsPerPageOptions: [20,40,60,100],
    rowsPerPage: rowsPerPage,
    onTableChange: (action, tableState) => {
      if (action === 'changePage' || action === 'changeRowsPerPage' || action === 'search' || action === 'filterChange') {

        console.log('tableState:',tableState)
        const { page, rowsPerPage, searchText, filterList  } = tableState;
        
        fetchAPICollections(true, page+1, rowsPerPage);
        setPage(page+1);
        setRowsPerPage(rowsPerPage);
      }
    }
  };


  var tableData = [];


  for (var i = 0; i < apiCollections.length; i++) {

    var dataItem = [];

    dataItem.push(i+1);
    dataItem.push(apiCollections[i].orgProject?apiCollections[i].orgProject.name:'---');
    dataItem.push(apiCollections[i].collectionName);

    dataItem.push(apiCollections[i].latestVersion.version);

    dataItem.push(apiCollections[i].versionCount);

    dataItem.push((new Date(apiCollections[i].createdAt)).toLocaleDateString('en-US') + ' - ' + (new Date(apiCollections[i].createdAt)).toLocaleTimeString('en-US'));
  
    
    dataItem.push(apiCollections[i]); // for view report link
    dataItem.push(apiCollections[i]._id); // for delete

    tableData.push(dataItem);
  }

  const goToAddAPICollection = (e) => {

    e.preventDefault();
    navigate('/add-api-collection')
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
          <text style={{ color: '#000', fontSize: 18 }}>Are you sure you want to permanently delete this collection?</text>
          <br/><br/>
          <button onClick={() => handleConfirmation(true)} style={{ width: 100, borderWidth: 0, backgroundColor: '#28C76F', color:'white', padding: 10 }}>Yes</button>
          <button onClick={() => handleConfirmation(false)} style={{ marginLeft: 30, borderWidth: 0, width: 100, backgroundColor: 'red', color:'white', padding: 10 }}>No</button>
        </Modal>
      )}


      <div style={{ width: '100%' }}>
        <div>
          <div style={{ marginBottom: '2rem', display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>

            <span className="pageHeader">API Collections</span>

            <CButton
              className="primaryButton"
              
              onClick={goToAddAPICollection}
              color="primary"
            >
              <AiOutlineSecurityScan size={20} color='white'/>

              <span className="primaryButtonText" style={{marginLeft:10}}>Add New API Collection</span>
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

export default APIInventory