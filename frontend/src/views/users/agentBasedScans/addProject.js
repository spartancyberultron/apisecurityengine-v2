import React, { useState, useEffect } from "react";
import {
  CFormInput,
  CButton,
  CFormSelect,
  CTable,
  CToast,
  CToastBody,
  CToaster,
  CInputGroup,
} from "@coreui/react";
import MUIDataTable from "mui-datatables";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { CircularProgress } from "@mui/material";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AddProject = () => {
  const [onSubmitting, setOnSubmitting] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [projectNameEmpty, setProjectNameEmpty] = useState(false);
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const navigate = useNavigate();
  const [projectPhase, setProjectPhase] = useState("Development")

  useEffect(() => {
    fetchProjects();
  }, []);

  // Function to fetch projects from API
  const fetchProjects = async () => {
    try {
      const token = localStorage.getItem("ASIToken");
      const response = await axios.get("/api/v1/organizations/getProjects", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setProjects(response.data.projects);
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };

  // Function to handle form submission
  const addProject = async () => {
    // Validate form inputs
    if (projectName === "") {
      setProjectNameEmpty(true);
      return;
    } else {
      setProjectNameEmpty(false);
    }

    // Prepare request body
    const requestBody = {
      projectName,
      projectId: selectedProjectId, // Include selected projectId
    };

    setOnSubmitting(true);

    try {
      // Retrieve bearer token from localStorage
      const bearerToken = localStorage.getItem("ASIToken");

      // Make API request to add project
      const response = await axios.post(
        "api/v1/users/addProject",
        requestBody,
        {
          headers: {
            Authorization: `Bearer ${bearerToken}`,
          },
        }
      );

      // Handle API response
      setOnSubmitting(false);

      if (response.data.hasOwnProperty("error")) {
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
      } else {
        toast("Application added", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        });
        navigate("/agents");
      }
    } catch (error) {
      // Handle API error
      console.error("Error:", error);
      setOnSubmitting(false);
    }
  };

  return (
    <div style={{ overflow: "scroll", position: "relative", overflowY: "hidden" }}>
      <div>
        <div style={{ marginBottom: "2rem" }}>
          <h2>Adding Application</h2>
        </div>

        <CInputGroup className="mb-3 mt-3" style={{ flexDirection: "column", marginTop: 30 }}>
        <label htmlFor="projectPhase">Application Name</label>
          <CFormInput
            placeholder="Application Name"
            onChange={(e) => setProjectName(e.target.value)}
            className="white-input"
            style={{ width: "30%" }}
          />
          {projectNameEmpty && (
            <span style={{ color: "red", fontSize: 12, marginTop: 5 }}>Please enter application name</span>
          )}
        </CInputGroup>

        <CInputGroup className="mb-3" style={{ flexDirection: "column", marginTop: 10 }}>
        <label htmlFor="projectPhase">Select Project</label>
          <CFormSelect
            aria-label="Select Project"
            onChange={(e) => setSelectedProjectId(e.target.value)}
            value={selectedProjectId}
            className="white-input"
            style={{ width: "30%" }}
          >
            <option value="">Select Project</option>
            {projects.map((project) => (
              <option key={project._id} value={project._id} style={{color:'#000'}}>
                {project.name}
              </option>
            ))}
          </CFormSelect>
        </CInputGroup>

        <div className="mb-3" style={{ marginTop: 20, marginBottom: 20,width: "30%" }}>
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

        <CButton
          style={{
            width: "30%",
            marginBottom: "2%",
            borderWidth: 0,
            fontSize: 20,
            background: "#7367f0",
          }}
          color="primary"
          className="px-3 "
          onClick={addProject}
        >
          {onSubmitting ? (
            <CircularProgress color="primary" size={24} style={{ marginTop: 10, color: "#fff" }} />
          ) : (
            "SAVE APPLICATION"
          )}
        </CButton>
      </div>
    </div>
  );
};

export default AddProject;
