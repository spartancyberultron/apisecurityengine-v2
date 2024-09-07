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

const Agents = () => {

  const navigate = useNavigate()

  const [mirroringProjects, setMirroringProjects] = useState([])
  const [onLoading, setOnLoading] = useState(false);
  const [onDeleting, setOnDeleting] = useState(false);
  const [currentlySelectedJob, setCurrentlySelectedJob] = useState(null)

  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [mirroringProjectToDelete, setMirroringProjectToDelete] = useState(null);
  const [modalIsOpen, setModalIsOpen] = React.useState(false);


  // Function to handle the button click and show the confirm dialog
  const handleClick = (mirroringProject) => {
    setMirroringProjectToDelete(mirroringProject);
    setModalIsOpen(true);
  };

  // Function to handle the confirmation action
  const handleConfirmation = (confirmed) => {
    if (confirmed) {
      // Call the function with the value passed to this component
      deleteFunction(mirroringProjectToDelete);
    }
    setModalIsOpen(false);
  };

  // Function to delete the mirroringProject
  const deleteFunction = (mirroringProject) => {

    deleteMirroringProject(mirroringProject)
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
      backgroundColor: '#fff',
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

        const response = await axios.get('/api/v1/users/listAllProjects', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setMirroringProjects(response.data);
        setOnLoading(false);


      } catch (error) {
        setOnLoading(false);
        console.error(error);
      }
    };

    fetchData();

  }, []);

  const goToEditMirroringProject = async (value) => {

    navigate('/edit-mirroring-project?mirroringProjectId=' + value)
  }

  const goToAddMirroringProject = async () => {

    navigate('/add-mirroring-project')
  }

  const handleCapturingStatusChange = async (projectId, newStatus) => {

    try {
      const token = localStorage.getItem('ASIToken');
      await axios.post('/api/v1/mirroredScans/setCapturingStatus',
        { projectId, status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success('Capturing status updated successfully');

      // Update the mirroring projects state
      setMirroringProjects(prevProjects =>
        prevProjects.map(project =>
          project._id === projectId ? { ...project, capturingStatus: newStatus } : project
        )
      );
    } catch (error) {
      console.error('Error updating capturing status:', error);
      toast.error('Failed to update capturing status');
    }
  };


  const deleteMirroringProject = async (id) => {

    // Construct the request body
    const requestBody = {
      id: id
    };

    // Retrieve the bearer token from localStorage
    const bearerToken = localStorage.getItem('ASIToken');

    try {

      // Make the API request
      const response = await axios.post('api/v1/users/deleteProject', requestBody, {
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

        toast('Project deleted', {
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
    "APPLICATION NAME",
    "PROJECT NAME",
    "INTEGRATION API KEY",
    //"PROJECT TYPE",   
    {
      label: "ACTIONS",
      options: {
        filter: false,
        download: false,
        customBodyRender: (value, tableMeta, updateValue) => {
          return (
            <div className="action-div" style={{
              display: "flex",
              flexDirection: 'row',
              alignItems: "left",
              width: 450
            }} >

              <CButton color="primary" variant="outline"
                onClick={() => goToDetails(value)}
                className="m-2" style={{
                  width: '60%', fontSize: 12, fontWeight: 'bold', color: 'white',
                  background: '#7367f0', borderWidth: 0
                }}>View Report</CButton>

              <CButton color="primary" variant="outline"
                onClick={() => goToInventory(value)}
                className="m-2" style={{
                  width: '60%', fontSize: 12, fontWeight: 'bold', color: 'white',
                  background: '#088F8F', borderWidth: 0
                }}>View Inventory</CButton>

              <CButton color="primary" variant="outline"
                onClick={() => goToEditMirroringProject(value)}
                className="m-2" style={{ width: '20%', fontSize: 12, fontWeight: 'bold', color: 'blue', borderColor: 'blue' }}><i class="fa fa-edit"></i></CButton>

              <CButton color="primary" variant="outline"
                onClick={() => handleClick(value)}
                className="m-2" style={{ width: '20%', fontSize: 12, fontWeight: 'bold', color: 'red', borderColor: 'red' }}><i class="fa fa-trash"></i></CButton>

            </div>
          )
        }
      }
    },
    {
      label: "CAPTURING STATUS",
      options: {
        filter: false,
        sort: false,
        customBodyRender: (value, tableMeta, updateValue) => {
          console.log('value:', value)
          const projectId = value.projectId; // Assuming the last column is the project ID
          const status = value.status || "Capturing"; // Default to "Capturing" if no value
          return (
            <CFormSelect
              value={status}
              style={{
                width: 200,
                backgroundColor: status === "Stopped" ? "#ffcccc" : "#e6ffff",
                color: status === "Stopped" ? "#cc0000" : "#006666",
                border: status === "Stopped" ? "1px solid #cc0000" : "1px solid #00cccc",
              }}
              onChange={(e) => {
                const newStatus = e.target.value;
                handleCapturingStatusChange(projectId, newStatus);
                updateValue(newStatus); // This updates the dropdown value immediately
              }}
            >
              <option value="Capturing">Capturing</option>
              <option value="Stopped">Stopped</option>
            </CFormSelect>
          );
        }
      }
    },

  ];

  const goToDetails = async (projectId) => {

    navigate('/project-vulnerabilities?projectId=' + projectId);
  }


  const goToInventory = async (projectId) => {

    navigate('/project-inventory?projectId=' + projectId);
  }

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
              paddingLeft: 0,
              width: '25%',
            },
            '&:nth-child(3)': {
              paddingLeft: 0,
              width: '25%',
            },
            '&:nth-child(4)': {
              paddingLeft: 0,
              width: '25%',
            },
            '&:nth-child(5)': {
              paddingLeft: 0,
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
              paddingLeft: 0,
              width: '25%',
            },
            '&:nth-child(3)': {
              paddingLeft: 0,
              width: '25%',
            },
            '&:nth-child(4)': {
              paddingLeft: 0,
              width: '25%',
            },
            '&:nth-child(5)': {
              paddingLeft: 0,
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

  for (var i = 0; i < mirroringProjects.length; i++) {

    var dataItem = [];

    dataItem.push(i + 1);
    dataItem.push(mirroringProjects[i].projectName);
    dataItem.push(mirroringProjects[i].orgProject?mirroringProjects[i].orgProject.name:'---');
    dataItem.push(mirroringProjects[i].projectIntegrationID);

    //dataItem.push(mirroringProjects[i].projectType?mirroringProjects[i].projectType:'---');   

    // console.log('mirroringProjects[i].capturingStatus:',mirroringProjects[i].capturingStatus)


    dataItem.push(mirroringProjects[i]._id); // for edit and delete
    dataItem.push({projectId:mirroringProjects[i]._id, status:mirroringProjects[i].capturingStatus || "Capturing"}); // Add capturing status


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
          <p style={{ color: '#000', fontSize: 18 }}>Are you sure you want to permanently delete this project?</p>
          <button onClick={() => handleConfirmation(true)} style={{ width: 100, borderWidth: 0, backgroundColor: '#28C76F', color:'white', padding: 10 }}>Yes</button>
          <button onClick={() => handleConfirmation(false)} style={{ marginLeft: 30, borderWidth: 0, width: 100, backgroundColor: 'red', color:'white', padding: 10 }}>No</button>
        </Modal>
      )}


      <div>

        <div style={{ marginBottom: '0.5rem', display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>

          <span className="pageHeader">All Applications</span>


          <CButton
            onClick={goToAddMirroringProject}
            color="primary"
            className="primaryButton"
          >

            <BsPlusCircleFill size={25} style={{ color: '#ffffff', marginRight: 10 }} />

            <span className="primaryButtonText" style={{ marginLeft: 10, }}>Add Application to Capture Traffic From</span>
          </CButton>

        </div>
        <hr />

        <span style={{ paddingBottom: 20 }}>After adding a project, please setup the traffic mirroring agent in your project.&nbsp;
          <a target="_blank" href="/integrations" style={{ textDecoration: 'underline', background: 'transparent', color: 'blue', fontWeight: 'bold' }}>
            Click here</a> to see how to add the agents.</span>

        <h5>&nbsp;</h5>


        {onLoading &&
          <ShimmerTable row={8} col={10} />

        }



        {!onLoading &&
          <ThemeProvider theme={getMuiTheme()}>
            <MUIDataTable
              style={{ height: "570vh", width: '100vw', }}
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

export default Agents



