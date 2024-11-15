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
import { Link } from "react-router-dom";

const Tickets = () => {

  const navigate = useNavigate()

  const [tickets, setTickets] = useState([])
  const [onLoading, setOnLoading] = useState(false);

  const [pageCount, setPageCount] = useState(100);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(100);
  const [onDeleting, setOnDeleting] = useState(false);

  const [ticketToDelete, setTicketToDelete] = useState(null);
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


  // Function to handle the button click and show the confirm dialog
  const handleClick = (user) => {
    setTicketToDelete(user);
    setModalIsOpen(true);
  };

  const goToTicket = (id) => {
    navigate('/ticket?ticketId=' + id);
  };

  const goToEditTicket = (id) => {
    navigate('/edit-ticket?ticketId=' + id);
  };

  // Function to handle the confirmation action
  const handleConfirmation = (confirmed) => {

    if (confirmed) {
      // Call the function with the value passed to this component
      deleteFunction(ticketToDelete);
    }
    setModalIsOpen(false);
  };

  // Function to delete the scan
  const deleteFunction = (app) => {
    deleteTicket(app)
  };

  const closeModal = async () => {

    setModalIsOpen(false);
  };


  const deleteTicket = async (id) => {

    // Construct the request body
    const requestBody = {
      id: id
    };

    // Retrieve the bearer token from localStorage
    const bearerToken = localStorage.getItem('ASIToken');

    try {

      // Make the API request
      const response = await axios.post('api/v1/organizations/deleteTicket', requestBody, {
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

        toast('Ticket deleted', {
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

        // Update the tickets array by removing the deleted ticket
        setTickets((prevTickets) => {
          return prevTickets.filter((app) => app._id !== id);
        });

       // fetchTickets();
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


  const fetchTickets = async (page, rowsPerPage) => {

    setOnLoading(true);    
  
    const token = localStorage.getItem('ASIToken');
    const response = await axios.get(`/api/v1/organizations/getTickets/${page}/${rowsPerPage}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  
    setTickets(response.data.tickets); 
    setCount(response.data.totalCount);   
  
    setOnLoading(false);
  };


  

  const goToAddTicket = async () => {

    navigate('/open-ticket');        

  }

  useEffect(() => {    

      fetchTickets(0, rowsPerPage);  

  }, []);

  

  const columns = [
    "#",
    "ID",
    "Category",
    "Source",
    {
      label: "Related Scan ID",
      options: {
        filter: false,
        download: false,
        customBodyRender: (value, tableMeta, updateValue) => {

          var source = value.source;
          var scanId = value.scanId;

          return (
            <div style={{
              display: "flex",
              alignItems: "center"
            }} >

              {source == 'REST API Scan' &&

                <Link to={'/view-active-scan-report?scanId='+scanId}>{scanId}</Link>

              }

{source == 'Attack Surface Scan' &&

<Link to={'/attack-surface-scan-result?scanId='+scanId}>{scanId}</Link>

}


{source == 'API Traffic Scan' &&

<Link to={'/project-vulnerabilities?projectId='+scanId}>{scanId}</Link>

}

{source == 'SOAP Scan' &&

<Link to={'/view-soap-graphql-scan-report?scanId='+scanId}>{scanId}</Link>

}

{source == 'GraphQL Scan' &&

<Link to={'/view-soap-graphql-scan-report?scanId='+scanId}>{scanId}</Link>

}

{source == 'SBOM Scan' &&

<Link to={'/view-sbom-scan-report?scanId='+scanId}>{scanId}</Link>

}


{source == 'LLM Scan' &&

<Link to={'/view-llm-scan-report?scanId='+scanId}>{scanId}</Link>

}
                              

            </div>
          )
        }
      }
    },
    "Project Name",
    "Title",
    {
      label: "Priority",
      options: {
        filter: true,
        download: true,
        customBodyRender: (value, tableMeta, updateValue) => {

          let bgColor;
          let theColor;

          if (value == 'CRITICAL') {

            bgColor = '#FF0000';
            theColor = '#fff';

          } else if (value == 'HIGH') {

            bgColor = '#A6001B';
            theColor = '#fff';

          } else if (value == 'MEDIUM' || value == 'MODERATE') {

            bgColor = '#FFC300';
            theColor = 'black';

          } else if (value == 'LOW') {

            bgColor = '#B3FFB3';
            theColor = '#000';
          }else if (value == 'UNSPECIFIED') {

            bgColor = '#666666';
            theColor = '#fff';
          }


          return (
            <div style={{
              display: "flex",
              alignItems: "center"
            }} >

              <div style={{
                padding: 5, backgroundColor: bgColor, color: theColor, width: 120,
                textAlign: 'center', borderRadius: 10, fontSize: 12, fontWeight: 'normal'
              }}>{value}</div>

            </div>
          )
        }
      }
    },
    "Opened By",
    "Assigned To",
    {
      label: "Status",
      options: {
        filter: true,
        download: true,
        customBodyRender: (value, tableMeta, updateValue) => {

          let bgColor;
          let theColor;

          if (value == 'OPEN') {

            bgColor = '#FF0000';
            theColor = '#fff';

          } else if (value == 'RESOLVED') {

            bgColor = '#B3FFB3';
            theColor = '#000';

          }  else if (value == 'IN PROGRESS') {

            bgColor = '#FFC300';
            theColor = '#000';
          }else if (value == 'ON HOLD') {

            bgColor = '#666666';
            theColor = '#fff';
          }


          return (
            <div style={{
              display: "flex",
              alignItems: "center"
            }} >

              <div style={{
                padding: 5, backgroundColor: bgColor, color: theColor, width: 120,
                textAlign: 'center', borderRadius: 10, fontSize: 12, fontWeight: 'normal'
              }}>{value}</div>

            </div>
          )
        }
      }
    },
    "Created At",      
    "Updated At",
    "Note",        
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
                  onClick={() => goToTicket(value._id)}
                  className="m-2" 
                  style={{ width: '100%', fontSize: 12, 
                  fontWeight: 'bold', color: '#000', display:'flex',
                  flexDirection:'column', alignItems:'center',
                   borderColor:'#000' }}>
<FaEye size={15} style={{ color: '#000' }} />
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
            variant="outline"
            className="m-1"
            onClick={() => goToEditTicket(value)}
            style={{ width: '100%', fontSize: 12, fontWeight: 'bold', color:'red', borderColor:'#2185d0' }}>
                <CiEdit size={15} style={{ color: '#2185d0' }} />
            </CButton>


            <CButton color="danger"
              variant="outline"
              className="m-1"
              onClick={() => handleClick(value)}
              style={{ width: '100%', fontSize: 12, fontWeight: 'bold', color:'red', borderColor:'red' }}>
                  <MdDeleteOutline size={15} style={{ color: 'red' }} />
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
            color:'#000',
            '&:nth-child(1)': {
              width: 150,
            },
          }
        }
      },
      MUIDataTableHeadCell: {
        styleOverrides: {
          root: {
            textAlign: "left",
            color:'#000',
            '&:nth-child(1)': {
              width: 150,
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
    rowsPerPageOptions: [10, 20, 60, 100, 150],
    pagination: true,
    textLabels: {
      body: {
        noMatch: 'No tickets found',
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
        fetchTickets(page, rowsPerPage);
      }
    }
  };


  var tableData = [];



  for (var i = 0; i < tickets.length; i++) {

    if(tickets[i].orgProject){

    var dataItem = [];

    dataItem.push(((page) * 10) + (i+1));

    dataItem.push(tickets[i].ticketId);
    dataItem.push(tickets[i].category);

    dataItem.push(tickets[i].source);
    dataItem.push({scanId:tickets[i].scanId, source:tickets[i].source});
    dataItem.push(tickets[i].orgProject?tickets[i].orgProject.name:'---');


    dataItem.push(tickets[i].title);
    //dataItem.push(tickets[i].description);
    dataItem.push(tickets[i].priority);

    if(tickets[i].openedBy){
      dataItem.push(tickets[i].openedBy.firstName + ' ' + tickets[i].openedBy.lastName);
    }else{
      dataItem.push('');
    }

    if(tickets[i].assignedTo){
      dataItem.push(tickets[i].assignedTo.firstName + ' ' + tickets[i].assignedTo.lastName);
    }else{
      dataItem.push('');
    }


    dataItem.push(tickets[i].status);

    dataItem.push((new Date(tickets[i].createdAt)).toLocaleDateString());
    dataItem.push((new Date(tickets[i].updatedAt)).toLocaleDateString());

    dataItem.push(tickets[i].note);

    dataItem.push(tickets[i]); // for view link
    dataItem.push(tickets[i]._id); // for delete

    tableData.push(dataItem);
  }
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
          <text style={{ color: '#000', fontSize: 18 }}>Are you sure you want to permanently delete this ticket?</text>
          <br/><br/>
          <button onClick={() => handleConfirmation(true)} style={{ width: 100, borderWidth: 0, borderRadius:5, backgroundColor: '#5dbc53', color:'white', padding: 10 }}>Yes</button>
          <button onClick={() => handleConfirmation(false)} style={{ marginLeft: 30, borderWidth: 0, borderRadius:5, width: 100, backgroundColor: 'red', color:'white', padding: 10 }}>No</button>
        </Modal>
      )}


      <div style={{ width: '100%' }}>
        <div>
          <div style={{ marginBottom: '2rem', display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>

            <h2 className="pageHeader">Tickets</h2>

            <CButton
              className="primaryButton"
              onClick={goToAddTicket}
              color="primary"             
            >
              <AiOutlineAppstoreAdd size={24} style={{ color: 'white' }} />
              <span style={{marginLeft:15, color:'#fff'}}>Open a New Ticket</span>
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

export default Tickets



