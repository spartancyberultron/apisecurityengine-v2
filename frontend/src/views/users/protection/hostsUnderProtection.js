import React, { useState, useEffect, useRef } from "react";
import { CFormInput, CButton, CFormSelect, CTable, CToast, CToastBody, CToaster } from '@coreui/react'
import MUIDataTable from "mui-datatables";
import { createTheme, ThemeProvider } from '@mui/material/styles';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Modal from 'react-modal';
import { CSSProperties } from "react";
import { ShimmerTable } from "react-shimmer-effects";


import { BsPlusCircleFill } from "react-icons/bs";

const HostsUnderProtection = () => {

  const navigate = useNavigate()

  const [protectionHosts, setProtectionHosts] = useState([])
  const [onLoading, setOnLoading] = useState(false);
  const [onDeleting, setOnDeleting] = useState(false);

  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [protectionHostToDelete, setProtectionHostToDelete] = useState(null);
  const [modalIsOpen, setModalIsOpen] = React.useState(false);
 

   // Function to handle the button click and show the confirm dialog
   const handleClick = (protectionHost) => {
    setProtectionHostToDelete(protectionHost);
    setModalIsOpen(true);
  };

  // Function to handle the confirmation action
  const handleConfirmation = (confirmed) => {

    if (confirmed) {
      // Call the function with the value passed to this component
      deleteFunction(protectionHostToDelete);
    }
    setModalIsOpen(false);
  };

  // Function to delete the host
  const deleteFunction = (protectionHost) => {
   
    deleteProtectionHost(protectionHost)
  };

  const closeModal = async () => {

    setModalIsOpen(false);
  };

  const customStyles = {
    content: {
      top: '30%',
      left: '25%',
      width: '50%',
      right: 'auto',
      bottom: 'auto',
      height: '15%',
      backgroundColor: '#6366ff',
      borderRadius: 15,
      borderColor: 'yellow'
    },
  };

  const override: CSSProperties = {
    display: "block",
    margin: "0 auto",
    borderColor: "red",
  };


   useEffect(() => {

    const fetchData = async () => {

      setOnLoading(true);

      try {

        const token = localStorage.getItem('ASIToken');

        const response = await axios.get('/api/v1/users/listAllProtectionHosts', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setProtectionHosts(response.data);
        setOnLoading(false);


      } catch (error) {
        setOnLoading(false);
        console.error(error);
      }
    };

    fetchData();

  }, []);

  const goToEditProtectionHost = async (value) => {

    navigate('/edit-host-under-protection?hostId='+value)
  }

  const goToAddProtectionHost = async () => {

     navigate('/add-host-under-protection')
  }

  const deleteProtectionHost = async (id) => {

     // Construct the request body
     const requestBody = {
       id:id
     };

    // Retrieve the bearer token from localStorage
    const bearerToken = localStorage.getItem('ASIToken');

    try {
      
      // Make the API request
      const response = await axios.post('api/v1/users/deleteProtectionHost', requestBody, {
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

      toast('Host deleted', {
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


  const columns = [
    '',
    "HOST NAME",
    "IP",
    "PORT",   
    "ACTUAL DOMAIN",
    "PROXY DOMAIN",
    "SOURCES BLOCKED",
    {
      label: "ACTIONS",
      options: {
        filter: false,
        download: false,
        customBodyRender: (value, tableMeta, updateValue) => {
          return (
            <div className="action-div" style={{
              display: "flex",
              flexDirection:'row',
              alignItems: "left",
              width:250
            }} >            

              <CButton color="primary" variant="outline"
                onClick={() => goToEditProtectionHost(value)}
                className="m-2" style={{width:'20%', fontSize:12, fontWeight:'bold', borderColor:'white', color:'#fff'}}><i class="fa fa-edit"></i></CButton>

             <CButton color="primary" variant="outline"
                onClick={() => handleClick(value)}
                className="m-2" style={{width:'20%', fontSize:12, fontWeight:'bold', borderColor:'red', color:'red'}}><i class="fa fa-trash"></i></CButton>

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
                width: '5%',                               
             },  
             '&:nth-child(2)': {
               paddingLeft:0,
               width: '15%',                                 
             },   
             '&:nth-child(3)': {
               paddingLeft:0,
               width: '15%',                                   
             },  
             '&:nth-child(4)': {
               paddingLeft:0,
               width: '15%',                                   
             }, 
             '&:nth-child(5)': {
                paddingLeft:0,
                width: '15%',                                   
              }, 
            '&:nth-child(6)': {
                paddingLeft:0,
                width: '15%',                                   
              }, 
             '&:nth-child(7)': {
              paddingLeft:0,
              width: '15%',                                                 
            },     
          }
        }
      },
      MUIDataTableHeadCell: {
        styleOverrides: {
          root: {
            textAlign: "left",
            '&:nth-child(1)': {
              width: '5%',                               
           },  
           '&:nth-child(2)': {
             paddingLeft:0,
             width: '15%',                                 
           },   
           '&:nth-child(3)': {
             paddingLeft:0,
             width: '15%',                                   
           },  
           '&:nth-child(4)': {
             paddingLeft:0,
             width: '15%',                                   
           },  
           '&:nth-child(5)': {
            paddingLeft:0,
            width: '15%',                                   
           },  
           '&:nth-child(6)': {
            paddingLeft:0,
            width: '15%',                                   
           },  
           '&:nth-child(7)': {
            paddingLeft:0,
            width: '15%',    
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
  };


  var tableData = [];

  for (var i = 0; i < protectionHosts.length; i++) {

    var dataItem = [];  

    dataItem.push(i+1);
    dataItem.push(protectionHosts[i].hostName);
    dataItem.push(protectionHosts[i].hostIP);
    dataItem.push(protectionHosts[i].hostPort);
    dataItem.push(protectionHosts[i].hostDomain);
    dataItem.push(protectionHosts[i].proxyDomain);
    dataItem.push(protectionHosts[i].sourcesBlocked?protectionHosts[i].sourcesBlocked:0);    

    dataItem.push(protectionHosts[i]._id); // for edit and delete

    tableData.push(dataItem);
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
          <p style={{color:'white', fontSize:18}}>Are you sure you want to permanently delete this host?</p>
          <button onClick={() => handleConfirmation(true)} style={{width:100, borderWidth:0, color:'green', padding:10}}>Yes</button>
          <button onClick={() => handleConfirmation(false)} style={{marginLeft:30, borderWidth:0, width:100, color:'red', padding:10}}>No</button>
        </Modal>
      )}


    <div>

      <div style={{ marginBottom: '0.5rem', display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>

            <h2>Hosts Added Under DDoS Protection</h2>            

            <CButton
              style={{
                width: 300,
                marginBottom: '2%',
                borderWidth: 0,
                fontSize: 17,
                background: '#7367f0',
                paddingTop:15,
                paddingBottom:10,
                display:'flex',
                flexDirection:'row',
                justifyContent:'center'
              }}
              onClick={goToAddProtectionHost}
              color="primary"
              className="px-3"
            >
              
              <BsPlusCircleFill size={25} style={{ color: '#ffffff', marginRight: 10 }} />

              <span style={{marginLeft:10, fontSize:17}}>ADD HOST</span>
            </CButton>    

          </div>
          <hr/>     


          <span style={{paddingBottom:20}}>After adding a host here, please setup the connection. <a target="_blank" href="/how-to-add-host-under-protection" 
                style={{textDecoration:'none'}}> Click here</a> to see how to setup DDoS protection for a host by using our reverse proxy based solution.</span>   
 <h5>&nbsp;</h5>

{onLoading &&
       <ShimmerTable row={8} col={10} />

}


          {!onLoading &&
      <ThemeProvider theme={getMuiTheme()}>
      <MUIDataTable
            style={{ height: "570vh", width:'100vw',  }}
            data={tableData}
            columns={columns}
            options={options}         
      />    

</ThemeProvider>
}

</div> 
    </div>     
   )
}

export default HostsUnderProtection
            


