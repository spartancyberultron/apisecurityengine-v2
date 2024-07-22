import React, { useState, useEffect } from "react";
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import { CircularProgress, Button } from '@mui/material';
import { ShimmerTitle } from "react-shimmer-effects";
import MUIDataTable from "mui-datatables";
import FileSaver from 'file-saver';
import { BiExport } from "react-icons/bi";
import { useNavigate } from 'react-router-dom';

const ProjectInventory = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [projectEndpoints, setProjectEndpoints] = useState([]);
  const [loadingEndpoints, setLoadingEndpoints] = useState(false);
  const [exportingPDF, setExportingPDF] = useState(false);

  useEffect(() => {
    // Load project endpoints when component mounts
    loadProjectEndpoints();
  }, []);

  const loadProjectEndpoints = async () => {
    setLoadingEndpoints(true);
    try {
      const projectId = extractProjectIdFromLocation();
      const token = localStorage.getItem('ASIToken');
      const url = `/api/v1/mirroredScans/getInventoryOfProject/${projectId}`;
      const response = await axios.get(url, { headers: { Authorization: `Bearer ${token}` } });
      setProjectEndpoints(response.data); // Assuming response.data is an array of endpoints
    } catch (error) {
      console.error('Error fetching endpoints:', error);
    } finally {
      setLoadingEndpoints(false);
    }
  };

  const extractProjectIdFromLocation = () => {
    const params = new URLSearchParams(location.search);
    return params.get('projectId');
  };

  const handleExportToOpenAPI = async () => {
    setExportingPDF(true);
    try {
      const openApiContent = generateOpenAPI(projectEndpoints);
      const blob = new Blob([openApiContent], { type: 'text/plain;charset=utf-8' });
      FileSaver.saveAs(blob, 'project_endpoints_openapi.yaml');
    } catch (error) {
      console.error('Error exporting to OpenAPI:', error);
    } finally {
      setExportingPDF(false);
    }
  };

  const generateOpenAPI = (endpoints) => {
    // Implement logic to generate OpenAPI format content
    let openApiContent = '';
    endpoints.forEach((endpoint, index) => {
      openApiContent += `# Endpoint ${index + 1}\n`;
      openApiContent += `method: ${endpoint.method}\n`;
      openApiContent += `endpoint: ${endpoint.url}\n`;
      openApiContent += `headers:\n`;
      endpoint.headers.forEach(header => {
        openApiContent += `  ${header.key}: ${header.value}\n`;
      });
      if (endpoint.body) {
        openApiContent += `body:\n`;
        openApiContent += `${JSON.stringify(endpoint.body, null, 2)}\n\n`;
      } else {
        openApiContent += '\n';
      }
    });
    return openApiContent;
  };

  const renderHeaders = (value) => {
    if (value && value.length > 0) {
      return (
        <ul>
          {value.map((header, index) => (
            <li key={index}><strong>{header.key}:</strong> {header.value}</li>
          ))}
        </ul>
      );
    } else {
      return 'No headers';
    }
  };

  const renderBody = (value) => {
    if (value) {
      return (
        <pre style={{ whiteSpace: 'pre-wrap', maxHeight: '200px', overflowY: 'auto' }}>
          {JSON.stringify(value, null, 2)}
        </pre>
      );
    } else {
      return 'No body';
    }
  };

  const handleBack = () => {
    navigate('/agents'); // Navigate back to '/agents' route
  };

  const columns = [
    { name: 'method', label: 'Method' },
    { name: 'url', label: 'Endpoint' },
    { name: 'headers', label: 'Headers', options: { customBodyRender: renderHeaders } },
    { name: 'body', label: 'Body', options: { customBodyRender: renderBody } },
  ];

  const options = {
    filter: true,
    download: false,
    print: false,
    selectableRows: 'none',
    responsive: 'standard',
    rowsPerPage: 10,
    rowsPerPageOptions: [10, 20, 50],
    onDownload: (buildHead, buildBody, columns, data) => {
      // Override onDownload to prevent default CSV download
    },
    customToolbar: () => (
      <Button
        startIcon={<BiExport style={{ color: '#fff' }} />}
        onClick={handleExportToOpenAPI}
        disabled={exportingPDF}
        variant="contained"
        color="primary"
        style={{ width: 250 }}
      >
        Export to OpenAPI
        {exportingPDF && <CircularProgress size={24} style={{ marginLeft: 10 }} />}
      </Button>
    ),
  };

  return (
    <div style={{ overflow: "scroll", position: 'relative', overflowY: 'hidden' }}>
      {loadingEndpoints ? (
        <div style={{ width: '100%', marginLeft: '0%', marginRight: '0%', marginTop: '2%' }}>
          <ShimmerTitle line={6} gap={10} variant="primary" />
        </div>
      ) : (
        <div style={{ width: '100%', marginLeft: '0%', marginRight: '0%', marginTop: '2%', background: '#fff', padding: 20, borderRadius: 15 }}>

          <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>

            <h4 style={{ marginBottom: 15 }}>API Inventory of Project <strong>{projectEndpoints.length > 0 ? projectEndpoints[0].project.projectName : '---'}</strong></h4>

            <Button
              variant="outlined"
              color="primary"
              onClick={handleBack}
              style={{ marginBottom: '20px', width: 200 }}
            >
              Back to Agents
            </Button>

          </div>

          <MUIDataTable
            title=""
            data={projectEndpoints}
            columns={columns}
            options={options}
          />
        </div>
      )}
    </div>
  );
};

export default ProjectInventory;
