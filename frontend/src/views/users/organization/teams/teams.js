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
import { AiOutlineAppstoreAdd } from "react-icons/ai";
import { FaEye } from "react-icons/fa";
import { MdDeleteOutline } from "react-icons/md";
import { CiEdit } from "react-icons/ci";

const Teams = () => {

  //const [toast, addToast] = useState(0)
  const navigate = useNavigate()

  const [teams, setTeams] = useState([])
  const [onLoading, setOnLoading] = useState(false);

  const [pageCount, setPageCount] = useState(100);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(100);
  const [onDeleting, setOnDeleting] = useState(false);

  const [teamToDelete, setTeamToDelete] = useState(null);
  const [modalIsOpen, setModalIsOpen] = React.useState(false);

  const [itemOffset, setItemOffset] = useState(0);

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

    fetchTeams(true, requestedPage);

    const newOffset = (event.selected * itemsPerPage) % totalRecords;
    
    setItemOffset(newOffset);

  };


  // Function to handle the button click and show the confirm dialog
  const handleClick = (user) => {
    setTeamToDelete(user);
    setModalIsOpen(true);
  };

  

  const goToEditTeam = (id) => {
    navigate('/edit-team?teamId=' + id);
  };

  // Function to handle the confirmation action
  const handleConfirmation = (confirmed) => {

    if (confirmed) {
      // Call the function with the value passed to this component
      deleteFunction(teamToDelete);
    }
    setModalIsOpen(false);
  };

  // Function to delete the team
  const deleteFunction = (app) => {
    deleteTeam(app)
  };

  const closeModal = async () => {

    setModalIsOpen(false);
  };


  const deleteTeam = async (id) => {

    // Construct the request body
    const requestBody = {
      id: id
    };

    // Retrieve the bearer token from localStorage
    const bearerToken = localStorage.getItem('ASIToken');

    try {

      // Make the API request
      const response = await axios.post('api/v1/organizations/deleteTeam', requestBody, {
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

        toast('Team deleted', {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        });

        //window.location.reload();
        setOnDeleting(false);

        // Update the teams array by removing the deleted team
        setTeams((prevTeams) => {
          return prevTeams.filter((app) => app._id !== id);
        });

        fetchTeams();
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


  const fetchTeams = async (isFirstTime, pageNumber) => {

    if (isFirstTime) {
      setOnLoading(true);
    }
  
    const token = localStorage.getItem('ASIToken');
    const response = await axios.get(`/api/v1/organizations/getTeams`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  
    setTeams(response.data.teams);    
  
    setOnLoading(false);
  };


  

  const goToAddTeam = async () => {

    navigate('/add-team');        

  }
  useEffect(() => {      

    // Make the initial call immediately
    fetchTeams(true, currentPage);

  }, []);
  

  const columns = [
    '',
    "Team Name",  
    {
      label: "Members",
      options: {
        filter: false,
        download: false,
        customBodyRender: (value, tableMeta, updateValue) => {
          // Check if value is an array and not empty
          if (Array.isArray(value) && value.length > 0) {
            return (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                {value.map(user => (
                  <div 
                    key={user._id} 
                    style={{ 
                      backgroundColor: "#c1c1fc", // Light color background
                      color: "#000", // Black text
                      padding: "5px 10px", 
                      borderRadius: "5px", 
                      boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                      fontSize: "14px"
                    }}
                  >
                    {user.firstName} {user.lastName}
                  </div>
                ))}
              </div>
            );
          } else {
            // Handle the case where there are no members
            return (
              <div style={{ display: "flex", alignItems: "center" }}>
                ---
              </div>
            );
          }
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
            <CButton color="info"
            onClick={() => goToEditTeam(value)}
              variant="outline"
              className="m-1"
              style={{ width: 100, fontSize: 12, fontWeight: 'bold', color:'blue', borderColor:'blue' }}>
                  <CiEdit size={15} style={{ color: 'blue' }} />
                   <span style={{marginLeft:5}}></span>
              </CButton>

            <CButton color="danger"
              onClick={() => handleClick(value)}
              variant="outline"
              className="m-1"
              style={{ width: 100, fontSize: 12, fontWeight: 'bold', color:'red', borderColor:'red' }}>
                  <MdDeleteOutline size={15} style={{ color: 'red' }} />
                   <span style={{marginLeft:5}}></span>
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
        noMatch: 'No teams created yet',
      }
    }
  };


  var tableData = [];


  for (var i = 0; i < teams.length; i++) {

    var dataItem = [];

    dataItem.push(i+1);
    dataItem.push(teams[i].name);
    dataItem.push(teams[i].users);
   
    dataItem.push(teams[i]._id); // for delete

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
          <text style={{ color: '#000', fontSize: 18 }}>Are you sure you want to permanently delete this team? 
            This will not delete the member users.</text>
          <br/><br/>
          <button onClick={() => handleConfirmation(true)} style={{ width: 100, borderWidth: 0, borderRadius:5, backgroundColor: 'green', color:'white', padding: 10 }}>Yes</button>
          <button onClick={() => handleConfirmation(false)} style={{ marginLeft: 30, borderWidth: 0, borderRadius:5, width: 100, backgroundColor: 'red', color:'white', padding: 10 }}>No</button>
        </Modal>
      )}


      <div style={{ width: '100%' }}>
        <div>
          <div style={{ marginBottom: '2rem', display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>

            <span className="pageHeader">Teams</span>

            <CButton
              className="primaryButton"
              onClick={goToAddTeam}
              color="primary"
            >
              <AiOutlineAppstoreAdd size={24} style={{ color: 'white' }} />
              <span style={{marginLeft:15,color:'#fff'}}>Add a Team</span>
            </CButton>
          </div>


          {onLoading &&
            <ShimmerTable row={8} col={10} />          }


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

export default Teams