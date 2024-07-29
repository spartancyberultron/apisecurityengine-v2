import React, { useState, useEffect, useRef } from "react";
import { CFormInput, CButton, CFormSelect, CTable, CToast, CToastBody, CToaster } from '@coreui/react'
import MUIDataTable from "mui-datatables";
import { createTheme, ThemeProvider } from '@mui/material/styles';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Modal from 'react-modal';


import { BsPlusCircleFill } from "react-icons/bs";


const AdminAllUsers = () => {


  const navigate = useNavigate()

  const [users, setUsers] = useState([])
  const [onLoading, setOnLoading] = useState(false);
  const [onDeleting, setOnDeleting] = useState(false);
  const [currentlySelectedJob, setCurrentlySelectedJob] = useState(null)

  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [modalIsOpen, setModalIsOpen] = React.useState(false);
 

   // Function to handle the button click and show the confirm dialog
   const handleClick = (user) => {
    setUserToDelete(user);
    setModalIsOpen(true);
  };

  // Function to handle the confirmation action
  const handleConfirmation = (confirmed) => {
    if (confirmed) {
      // Call the function with the value passed to this component
      deleteFunction(userToDelete);
    }
    setModalIsOpen(false);
  };

  // Function to delete the user
  const deleteFunction = (user) => {
    // Perform the delete operation
    // ...
    deleteUser(user)
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
      try {

        const token = localStorage.getItem('ASIToken');

        const response = await axios.get('/api/v1/admin/listAllUsers', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setUsers(response.data);


      } catch (error) {
        console.error(error);
      }
    };

    fetchData();

  }, []);

  const goToEditUser = async (value) => {

    navigate('/admin-edit-user?userId='+value)
  }

  const goToAddUser = async () => {

     navigate('/admin-add-user')
  }

  const deleteUser = async (id) => {


     // Construct the request body
     const requestBody = {
       id:id
     };

    // Retrieve the bearer token from localStorage
    const bearerToken = localStorage.getItem('ASIToken');

    try {
      // Make the API request
      const response = await axios.post('api/v1/admin/deleteUser', requestBody, {
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

      toast('User deleted', {
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
    "Organization",
    "First Name",
    "Last Name",
    "Email",    
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
                onClick={() => goToEditUser(value)}
                className="m-2" style={{width:'25%', fontSize:12, fontWeight:'bold', borderColor:'blue', color:'blue'}}>Edit</CButton>

             <CButton color="primary" variant="outline"
                onClick={() => handleClick(value)}
                className="m-2" style={{width:'25%', fontSize:12, fontWeight:'bold', borderColor:'red', color:'red'}}>Delete</CButton>

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
               width: '25%',                                 
             },   
             '&:nth-child(3)': {
               paddingLeft:0,
               width: '25%',                                   
             },  
             '&:nth-child(4)': {
               paddingLeft:0,
               width: '25%',                                   
             },  
             '&:nth-child(5)': {
              paddingLeft:0,
              width: '20%',                                                 
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
             width: '25%',                                 
           },   
           '&:nth-child(3)': {
             paddingLeft:0,
             width: '25%',                                   
           },  
           '&:nth-child(4)': {
             paddingLeft:0,
             width: '25%',                                   
           },  
           '&:nth-child(5)': {
            paddingLeft:0,
            width: '20%',    
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



  for (var i = 0; i < users.length; i++) {

    var dataItem = [];

    dataItem.push(i+1);
    dataItem.push(users[i].organization?users[i].organization.name:'---');
    dataItem.push(users[i].firstName);
    dataItem.push(users[i].lastName);
    dataItem.push(users[i].email);   

    dataItem.push(users[i]._id); // for edit
    dataItem.push(users[i]._id); // for delete

    tableData.push(dataItem);
  }
  

   return (
    <div style={{ overflow: "scroll", position:'relative', overflowY: 'hidden',  }}>

    {setModalIsOpen && (
       <Modal
       isOpen={modalIsOpen}
       onRequestClose={closeModal}
       style={customStyles}
       contentLabel="Remediations"
     >
          <p style={{color:'white', fontSize:18}}>Are you sure you want to permanently delete this user?</p>
          <button onClick={() => handleConfirmation(true)} style={{width:100, borderWidth:0, color:'green', padding:10}}>Yes</button>
          <button onClick={() => handleConfirmation(false)} style={{marginLeft:30, borderWidth:0, width:100, color:'red', padding:10}}>No</button>
        </Modal>
      )}


    <div>

      <div style={{ marginBottom: '2rem', display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>

            <h2>All Users</h2>

            <CButton
              style={{
                width: 300,
                marginBottom: '2%',
                borderWidth: 0,
                fontSize: 20,
                background: '#5141e0',
                paddingTop:15,
                paddingBottom:10,
                display:'flex',
                flexDirection:'row',
                justifyContent:'center'
              }}
              onClick={goToAddUser}
              color="primary"
              className="px-3"
            >
              
              <BsPlusCircleFill size={25} style={{ color: '#ffffff', marginRight: 10 }} />

              <span style={{marginLeft:10, fontSize:20, color:'#fff'}}>ADD USER</span>
            </CButton>    

          </div>

      <ThemeProvider theme={getMuiTheme()}>
      <MUIDataTable
            style={{ height: "570vh", width:'100vw' }}
            data={tableData}
            columns={columns}
            options={options}         
      />    

</ThemeProvider>

</div> 
    </div>     
   )
}

export default AdminAllUsers
            


