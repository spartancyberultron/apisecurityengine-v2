import React, { useState, useEffect, useRef } from "react";
import { CFormInput,CFormLabel,
  CInputGroup, CButton, CFormSelect, CTable, CToast, CToastBody, CToaster } from '@coreui/react'
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
import { MdClose, MdStart } from "react-icons/md";
import { AiOutlineSecurityScan } from "react-icons/ai";
import { MdOutlineDelete } from "react-icons/md";
import { useLocation } from 'react-router-dom'
import { CircularProgress } from '@mui/material';

import { FaEye } from "react-icons/fa";

const APICollectionVersions = () => {

  //const [toast, addToast] = useState(0)
  const navigate = useNavigate()

  const [projectPhase, setProjectPhase] = useState("Development")

  const [apiCollectionVersions, setApiCollectionVersions] = useState([])
  const [apiCollection, setApiCollection] = useState(null)
  const [apiCollectionId, setApiCollectionId] = useState('')
  const [onLoading, setOnLoading] = useState(false);
  const [endpoints, setEndpoints] = useState([]);

  const [collectionId, setCollectionId] = useState('')
  const [loading, setLoading] = useState(false)

  const [endpointsLoading, setEndpointsLoading] = useState(false)
  const [currentVersionIdToShowEndpoints, setCurrentVersionIdToShowEndpoints] = useState('')
  const [currentVersionIdToSelectEndpoints, setCurrentVersionIdToSelectEndpoints] = useState('')
  const [endpointsEmptyError, setEndpointsEmptyError] = useState(false) 


  const [scanScheduleType, setScanScheduleType] = useState('now');
  const [specificDateTime, setSpecificDateTime] = useState('');
  const [recurringSchedule, setRecurringSchedule] = useState('daily');

  const [scanDate, setScanDate] = useState('');
  const [scanTime, setScanTime] = useState('');

  const location = useLocation();

  const [pageCount, setPageCount] = useState(100);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(100);
  const [onDeleting, setOnDeleting] = useState(false);

  const [versionToDelete, setVersionToDelete] = useState(null);
  const [modalIsOpen, setModalIsOpen] = React.useState(false);
  const [addVersionModalIsOpen, setAddVersionModalIsOpen] = React.useState(false);
  const [endpointsModalIsOpen, setEndpointsModalIsOpen] = React.useState(false);
  const [endpointsSelectionModalIsOpen, setEndpointsSelectionModalIsOpen] = React.useState(false);
  const [file, setFile] = useState(null);
  const [collectionUrl, setCollectionUrl] = useState("")
  const [itemOffset, setItemOffset] = useState(0);

  const [validationFailed, setValidationFailed] = useState(false);
    const [errorText, setErrorText] = useState('');

    const [selectedEndpointIdsToScan, setSelectedEndpointIdsToScan] = React.useState([]);

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


  const customStylesAddVersionModal = {
    content: {
      top: '30%',
      left: '15%',
      width: '70%',
      right: 'auto',
      bottom: 'auto',
      height: '45%',
      backgroundColor: '#ffffff',
      borderRadius: 15,
      borderColor: 'ffffff'
    },
  };

  const customStylesEndpointModal = {
    content: {
      top: '15%',
      left: '15%',
      width: '70%',
      right: 'auto',
      bottom: 'auto',
      height: '80%',
      backgroundColor: '#f2f2f3',
      borderRadius: 15,
      borderColor: 'ffffff',
    },
  };

  const handleFileChange = (event) => {

    const selectedFile = event.target.files[0];
    setFile(selectedFile);
  };

  const handleSelectAllChange = (event) => {

    const { checked } = event.target;
  
    if (checked) {
      const allEndpointIds = endpoints.map(endpoint => endpoint._id);
      setSelectedEndpointIdsToScan(allEndpointIds);
    } else {
      setSelectedEndpointIdsToScan([]);
    }
  }; 


  

  const handleScanDateChange = (event) => {
    setScanDate(event.target.value);
};

const handleScanTimeChange = (event) => {
    setScanTime(event.target.value);
};



  useEffect(() => {

    window.scrollTo(0, 0);

    //setOnLoading(true);
    var arr = location.search.split('=');

    var theCollectionId = arr[1];

    setCollectionId(theCollectionId);    

    fetchAPICollectionVersions(1, theCollectionId)    

  }, []);


  function checkURLType(url) {

    try {
        new URL(url);
    } catch (error) {
        return false; // Invalid URL
    }

    const extension = url.split('.').pop().toLowerCase();

    if (extension === 'json') {
        return true; // Valid URL to a JSON file
    } else if (extension === 'yaml' || extension === 'yml') {
        return true; // Valid URL to a YAML file
    } else {
        return false; // Valid URL, but not a JSON or YAML file
    }
}

  function isExceeding8MB(file) {

    const fileSizeInBytes = file.size;
    const fileSizeInMB = fileSizeInBytes / (1024 * 1024);

    if (fileSizeInMB > 8) {
        //console.log('File size exceeds 8MB');
        return true;
    } else {
        //console.log('File size is within 8MB limit');
        return false;
    }

}


// Function to handle checkbox change
const handleCheckboxChange = (event) => {
  const { id, checked } = event.target;

  if (checked) {
    // Add the endpoint ID to the state array if the checkbox is checked
    setSelectedEndpointIdsToScan((prevSelected) => [...prevSelected, id]);
  } else {
    // Remove the endpoint ID from the state array if the checkbox is unchecked
    setSelectedEndpointIdsToScan((prevSelected) => prevSelected.filter((endpointId) => endpointId !== id));
  }
};



  const addCollectionVersion = () => {

    if (file === null && collectionUrl == '') {

        setValidationFailed(true);
        setErrorText('Please select an API collection file');

    } else if ((file !== null && (typeof file !== 'undefined')) && isExceeding8MB(file)) {

        setValidationFailed(true);
        setErrorText('The file size must not exceed 8MB. Please attach a smaller file');

    } else if (collectionUrl !== '' && !checkURLType(collectionUrl)) {

        setValidationFailed(true);
        setErrorText('Please enter a valid URL and ensure the URL is of a JSON or YAML file');

    } else {

        setLoading(true)

        const bearerToken = localStorage.getItem('ASIToken');

        // Create a FormData object
        const formData = new FormData();
        formData.append('file', file);
        formData.append('version', 'new');
        formData.append('collectionUrl', collectionUrl);
        formData.append('collectionId', collectionId);
        

        // Make the API call
        fetch(global.backendUrl + '/api/v1/inventory/addAPICollectionVersion', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${bearerToken}`
            },
            body: formData
        })
            .then(response => response.json())
            .then(data => {

                // Handle the API response

                if (data.hasOwnProperty('error')) {
                    setValidationFailed(true);
                    setErrorText(data.error);
                    setLoading(false);
                }
                else if (data.hasOwnProperty('err')) {
                    setLoading(false);
                    setValidationFailed(true);
                    setErrorText("The file does not have a valid Postman/Swagger collection content, or the file is corrupt.");

                } else {

                    //setSubmissionSuccess(true);
                    setLoading(false);

                    toast('Collection added', {
                        position: "top-right",
                        autoClose: 5000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                        theme: "light",
                    });


                    // Move to active scans window in 1 second
                    //navigate('/api-inventory')
                    setAddVersionModalIsOpen(false);
                    window.location.reload();
                }

            })
            .catch(error => {
                // Handle any errors
                console.error(error);
            });
       
    }

}


  const itemsPerPage = 10;

  // Invoke when user click to request another page.
  const handlePageClick = (event) => {

    var requestedPage = event.selected + 1;

    //console.log('requestedPage', requestedPage)

    fetchAPICollectionVersions(requestedPage, collectionId);

    const newOffset = (event.selected * itemsPerPage) % totalRecords;
    //console.log(
    //  `User requested page number ${event.selected}, which is offset ${newOffset}`
    //);
    setItemOffset(newOffset);

  };


  // Function to handle the button click and show the confirm dialog
  const handleClick = (user) => {
    setVersionToDelete(user);
    setModalIsOpen(true);
  };

  // Function to handle the confirmation action
  const handleConfirmation = (confirmed) => {

    if (confirmed) {
      // Call the function with the value passed to this component
      deleteFunction(versionToDelete);
    }
    setModalIsOpen(false);
  };

  
  const showAddVersionModal = () => {
    
    setAddVersionModalIsOpen(true);
  };

  const showEndpointModal = (id) => {

    setCurrentVersionIdToShowEndpoints(id)
    
    setEndpointsModalIsOpen(true);

    fetchEndpointsofAVersion(id);
  };


  const showEndpointSelectionModalForScan = (id) => {

    setCurrentVersionIdToSelectEndpoints(id)
    
    setEndpointsSelectionModalIsOpen(true);

    fetchEndpointsofAVersion(id);
  };




  // Function to delete the scan
  const deleteFunction = (scan) => {
    deleteScan(scan)
  };

  const closeModal = async () => {

    setModalIsOpen(false);
  };

  const closeAddVersionModal = async () => {

    setAddVersionModalIsOpen(false);
  };


  const closeEndpointModal = async () => {

    setEndpointsModalIsOpen(false);
  };  

  const closeEndpointSelectionModal = async () => {

    setEndpointsSelectionModalIsOpen(false);
    setSelectedEndpointIdsToScan([])
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
      const response = await axios.post('api/v1/inventory/deleteAPICollectionVersion', requestBody, {
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

        toast('Version deleted', {
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


  const fetchAPICollectionVersions = async ( pageNumber, collectionId) => {
  
    const token = localStorage.getItem('ASIToken');
   

    const response = await axios.get(`/api/v1/inventory/fetchAPICollectionVersions?pageNumber=${pageNumber}&collectionId=${collectionId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  
    setApiCollectionVersions(response.data.apiCollectionVersions);
    setApiCollection(response.data.apiCollection);
    setTotalRecords(response.data.totalRecords);
  
  };

  const fetchEndpointsofAVersion = async ( versionId) => {

   
    setEndpointsLoading(true);
    
      const token = localStorage.getItem('ASIToken');    
  
      const response = await axios.get(`/api/v1/inventory/fetchEndpointsofAVersion?versionId=${versionId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    
      setEndpoints(response.data.apiEndpoints);  
      
      setEndpointsLoading(false);
    
    }; 



  const goToViewScans = async (scanId) => {

    navigate('/api-collection-version-scans?versionId=' + scanId + '&collectionId='+collectionId);
  };


  

  const startScanOfSelectedEndpoints = async () => {

    if(selectedEndpointIdsToScan.length == 0){

      setEndpointsEmptyError(true);

    }else{

        const bearerToken = localStorage.getItem('ASIToken');

        console.log('selectedEndpointIdsToScan', selectedEndpointIdsToScan);
        console.log('endpoints', endpoints);


        // Start scans on the selected endpoints and move to active scans
        // Make the API call
        const theBody = {
          theCollectionVersion:currentVersionIdToSelectEndpoints,
          //endpoints:selectedEndpointIdsToScan,
          scanScheduleType:scanScheduleType,
          specificDateTime:specificDateTime,
          recurringSchedule:recurringSchedule,
          selectedEndpointIdsToScan:selectedEndpointIdsToScan,
          projectPhase:projectPhase
        }

        

        fetch(global.backendUrl+'/api/v1/activeScans/startActiveScan', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${bearerToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(theBody)
        })
          .then(response => response.json())
          .then(data => {

          // Handle the API response

          if(data.hasOwnProperty('error')){
            //setValidationFailed(true);
            //setErrorText(data.error);
            setLoading(false);
          }
            else if(data.hasOwnProperty('err')){
              setLoading(false);
              //setValidationFailed(true);
              //setErrorText("The file does not have a valid Postman/Swagger collection content, or the file is corrupt.");
          
          }else{

            //setSubmissionSuccess(true);
            setLoading(false);

            toast('Scan started', {
              position: "top-right",
              autoClose: 5000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
              theme: "light",
            });
    

            // Move to active scans window in 1 second
            window.location.href = '/active-scans'
        }

      })
      .catch(error => {
        // Handle any errors
        console.error(error);
      });

      


    }

   };

  const columns = [
    {
      label: "#",
      options: {
          filter: false,           
      }
    },
    {
      label: "Version",
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
      label: "Scans",
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
      label: "View Scans",
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
                  onClick={() => goToViewScans(value._id)}
                  className="primaryButton" style={{ width: '100%',  
                   }}>
                    <FaEye style={{ color: '#fff' }} size={20}/>
                    <span className="primaryButtonText" style={{marginLeft:5, fontSize:12}}>View Scans</span>
                    </CButton>
               

            </div>
          )
        }
      }
    },
    {
      label: "View APIs",
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
                  onClick={() => showEndpointModal(value._id)}
                  className="primaryButton" style={{ width: '100%',  
                   }}>
                    <FaEye style={{ color: '#fff' }} size={20}/>
                    <span className="primaryButtonText" style={{marginLeft:5, fontSize:12}}>View APIs</span>
                    </CButton>               

            </div>
          )
        }
      }
    },
    {
      label: "Scan",
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
                  onClick={() => showEndpointSelectionModalForScan(value._id)}
                  className="primaryButton" style={{ width: '100%', backgroundColor:'#00cfe8', borderColor:'#00cfe8',
                   }}>
                    <FaEye style={{ color: '#fff' }} size={20}/>
                    <span className="primaryButtonText" style={{marginLeft:5, fontSize:12}}>Start Scan</span>
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
    rowsPerPage: 20,
    rowsPerPageOptions: [],
    pagination: false,
    textLabels: {
      body: {
        noMatch: 'No versions created yet',
      }
    }
  };


  var tableData = [];


  for (var i = 0; i < apiCollectionVersions.length; i++) {

    var dataItem = [];

    dataItem.push(i+1);
    dataItem.push(apiCollectionVersions[i].version);

    dataItem.push(apiCollectionVersions[i].endpointsCount);
    dataItem.push(apiCollectionVersions[i].scansCount);

    dataItem.push((new Date(apiCollectionVersions[i].createdAt)).toLocaleDateString('en-US') + ' - '
     + (new Date(apiCollectionVersions[i].createdAt)).toLocaleTimeString('en-US'));

    
    dataItem.push(apiCollectionVersions[i]); // for view scans link
    dataItem.push(apiCollectionVersions[i]); // for view APIs button
    dataItem.push(apiCollectionVersions[i]); // for start scan button
    dataItem.push(apiCollectionVersions[i]._id); // for delete

    tableData.push(dataItem);
  }

  const goToStartQuickScan = (e) => {

    e.preventDefault();
    navigate('/start-active-scan')
  }


  console.log("selectedEndpointIdsToScan",selectedEndpointIdsToScan)


  return (
    <div className="activeScans">

      {modalIsOpen && (
        <Modal
          isOpen={modalIsOpen}
          onRequestClose={closeModal}
          style={customStyles}
          contentLabel="Remediations"
        >
          <text style={{ color: '#000', fontSize: 18 }}>Are you sure you want to permanently delete this version?</text>
          <br/><br/>
          <button onClick={() => handleConfirmation(true)} style={{ width: 100, borderWidth: 0, backgroundColor: '#28C76F', color:'white', padding: 10 }}>Yes</button>
          <button onClick={() => handleConfirmation(false)} style={{ marginLeft: 30, borderWidth: 0, width: 100, backgroundColor: 'red', color:'white', padding: 10 }}>No</button>
        </Modal>
      )}



      <div style={{ width: '100%' }}>
        <div>
          <div style={{ marginBottom: '2rem', display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>

            <div>

            <span className="pageHeader">API Collection Versions</span>
            <span className="pageHeader" style={{fontSize:15}}><strong>Collection Name</strong> - {apiCollection ? apiCollection.collectionName: '---'}</span>

            </div>

            <CButton
              className="primaryButton"              
              onClick={showAddVersionModal}
              color="primary"
            >
              <AiOutlineSecurityScan size={20} color='white'/>

              <span className="primaryButtonText" style={{marginLeft:10}}>Add New Version to this Collection</span>
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

  <Modal
    isOpen={addVersionModalIsOpen}
    onRequestClose={closeAddVersionModal}
    style={customStylesAddVersionModal}
    contentLabel="Add Version"
  >

    <div style={{display:'flex', flexDirection:'row', justifyContent:'space-between'}}>

      <h3>Add a New Version to the Collection</h3>

      <MdClose size={25} onClick={closeAddVersionModal}/>

    </div>



    <CFormLabel htmlFor="formFileSm" style={{ marginTop: 30, color: 'white' }}>Upload a Postman/Swagger collection file</CFormLabel><br />
                            <span style={{ color: 'blue', fontSize: 13 }}>Please upload only JSON/YAML collections</span><br />

                            <CInputGroup className="" style={{ flexDirection: 'column', }}>
                                <CFormInput
                                    placeholder="Upload Postman/Swagger Collection"
                                    autoComplete="username"
                                    type="file"
                                    className="white-input"
                                    size="sm"
                                    id="inputFile"
                                    accept="application/json, application/x-yaml, .json, .yaml, .yml"
                                    onChange={handleFileChange}
                                    style={{ width: '100%' }}
                                />


                                {validationFailed &&

                                    <span style={{ color: 'red', paddingTop: 15 }}>{errorText}</span>
                                }

                            </CInputGroup>


                            <p style={{ marginTop: 20 }}>Or</p>

<CInputGroup className="" style={{ flexDirection: 'column' }}>

    <CFormInput
        placeholder="URL to the API collection file"
        autoComplete="collectionUrl"
        className="white-input"
        onChange={(e) => setCollectionUrl(e.target.value)}
        style={{ width: '100%' }}
    />

    <span style={{ color: 'blue', fontSize: 13 }}>Must be a URL of a raw file containing a Postman/Swagger/OpenAPI collection</span><br />

</CInputGroup>



                            <CButton
                                style={{
                                    width: '100%',
                                    marginTop: '3%',
                                    marginBottom: '2%',
                                    borderWidth: 0,
                                    fontSize: 20,
                                    background: '#7367f0'
                                }}
                                color="primary"
                                className="px-3"
                                onClick={addCollectionVersion}
                            >


                                {loading ?
                                    <CircularProgress color="primary" size={24} style={{ marginTop: 10, color: '#fff' }} />
                                    :
                                    'Submit'
                                }


                            </CButton>
   
  
    
  </Modal>



<Modal
    isOpen={endpointsModalIsOpen}
    onRequestClose={closeEndpointModal}
    style={customStylesEndpointModal}
    contentLabel="View Endpoints"
  >

    <div style={{display:'flex', flexDirection:'row', justifyContent:'space-between'}}>

      <h3>Collection Endpoints</h3>

      <MdClose size={25} onClick={closeEndpointModal}/>

    </div>



   {endpointsLoading?

<CircularProgress/>

:

<div style={{marginTop:20}}>

{endpoints && endpoints.map(endpoint => (

<div style={{backgroundColor:'#fff', padding:10, marginBottom:10, borderRadius:5, display:'flex', flexDirection:'column'}}>

  <span><strong>URL</strong>:{endpoint.url}</span>
  <span><strong>Name</strong>:{endpoint.name}</span>
  <span><strong>Method</strong>:{endpoint.method}</span>
  <span><strong>Protocol</strong>:{endpoint.protocol}</span>

{endpoint.headers.length>0 &&
<>
  <span><strong>Headers</strong>:</span> <br/>
  </>
}

  <ul>
            {endpoint.headers.map((header, index) => (
                <li key={index}>{header.key}: {header.value}</li>
            ))}
        </ul>

</div>

))}


</div>

   }                          
  
    
  </Modal>


<Modal
    isOpen={endpointsSelectionModalIsOpen}
    onRequestClose={closeEndpointSelectionModal}
    style={customStylesEndpointModal}
    contentLabel="Select Endpoints to be scanned"
>
    <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3>Select Endpoints to be Scanned</h3>
        <MdClose size={25} onClick={closeEndpointSelectionModal} style={{ cursor: 'pointer' }} />
    </div>

    {endpointsLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <CircularProgress />
        </div>
    ) : (
        <div style={{ marginTop: 20 }}>
            <div style={{
                backgroundColor: '#fff',
                padding: 10,
                marginBottom: 10,
                borderRadius: 5,
                display: 'flex',
                flexDirection: 'column',
            }}>
                <label style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                    <input 
                        type="checkbox" 
                        name="allendpoints" 
                        id="allendpoints"
                        onChange={handleSelectAllChange}
                        checked={endpoints.length > 0 && selectedEndpointIdsToScan.length === endpoints.length} 
                        style={{ width: 30, height: 30, marginRight: 20 }} 
                    /> 
                    All Endpoints
                </label>
            </div>

            {endpoints && endpoints.map(endpoint => (
                <div key={endpoint._id} style={{
                    backgroundColor: '#fff',
                    padding: 10,
                    marginBottom: 10,
                    borderRadius: 5,
                    display: 'flex',
                    flexDirection: 'column',
                }}>
                    <label style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                        <input 
                            type="checkbox" 
                            name={endpoint._id} 
                            id={endpoint._id} 
                            onChange={handleCheckboxChange} 
                            checked={selectedEndpointIdsToScan.includes(endpoint._id)}
                            style={{ width: 30, height: 30, marginRight: 20 }} 
                        /> 
                        <span>{endpoint.url}</span>
                    </label>
                </div>
            ))}

            {endpointsEmptyError && (
                <span style={{ color: 'red', fontSize: 13 }}>Please select one or more endpoints to scan</span>
            )}

           

    <div style={{ marginTop: 20, marginBottom: 20 }}>
        <label htmlFor="scanScheduleType">Run this scan:</label>
        <select 
            id="scanScheduleType" 
            value={scanScheduleType} 
            onChange={(e) => setScanScheduleType(e.target.value)}
            style={{ width: '100%', padding: '5px', marginTop: '5px' }}
        >
            <option value="now">Now</option>
            <option value="specificTime">At a Specific Time</option>
            <option value="recurring">Recurringly</option>
        </select>
    </div>

    <div style={{ marginTop: 20, marginBottom: 20 }}>
        <label htmlFor="projectPhase">Project Phase</label>
        <select 
            id="projectPhase" 
            value={projectPhase} 
            onChange={(e) => setProjectPhase(e.target.value)}
            style={{ width: '100%', padding: '5px', marginTop: '5px' }}
        >
            <option value="Design">Design</option>
            <option value="Development">Development</option>
            <option value="Testing">Testing</option>
            <option value="Maintenance">Maintenance</option>
        </select>
    </div>

    {scanScheduleType === 'specificTime' && (
        <div style={{ marginBottom: 20 }}>
            <label htmlFor="specificDateTime">Select Date and Time:</label>
            <input 
                type="datetime-local" 
                id="specificDateTime" 
                value={specificDateTime} 
                onChange={(e) => setSpecificDateTime(e.target.value)}
                style={{ width: '100%', padding: '5px', marginTop: '5px' }}
            />
        </div>
    )}

    {scanScheduleType === 'recurring' && (
        <div style={{ marginBottom: 20 }}>
            <label htmlFor="recurringSchedule">Select Recurring Schedule:</label>
            <select 
                id="recurringSchedule" 
                value={recurringSchedule} 
                onChange={(e) => setRecurringSchedule(e.target.value)}
                style={{ width: '100%', padding: '5px', marginTop: '5px' }}
            >
                <option value="daily">Daily Once</option>
                <option value="weekly">Weekly Once</option>
                <option value="biweekly">Biweekly Once</option>
                <option value="monthly">Monthly Once</option>
            </select>
        </div>
    )}




            <CButton
                style={{
                    width: '100%',
                    marginTop: '3%',
                    marginBottom: '2%',
                    borderWidth: 0,
                    fontSize: 20,
                    background: '#7367f0',
                    color: '#fff'
                }}
                color="primary"
                className="px-3"
                onClick={startScanOfSelectedEndpoints}
            >
                {loading ? (
                    <CircularProgress color="inherit" size={24} style={{ marginTop: 10 }} />
                ) : (
                    'Start Scan of Selected Endpoints'
                )}
            </CButton>
        </div>
    )}
</Modal>



  
    </div>
  )
}

export default APICollectionVersions