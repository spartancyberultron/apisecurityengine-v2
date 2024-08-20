import React from 'react'

import UserDashboard from './views/users/UserDashboard';
import AdminDashboard from './views/admin/AdminDashboard';
import AdminAllUsers from './views/admin/AdminAllUsers';
import AdminAddUser from './views/admin/AdminAddUser';
import AdminEditUser from './views/admin/AdminEditUser';
import ActiveScans from './views/users/activeScans/activeScans';
import StartQuickScan from './views/users/activeScans/startQuickScan';
import ViewQuickScanReport from './views/users/activeScans/viewQuickScanReport';
import Agents from './views/users/agentBasedScans/agents';
import ProjectVulnerabilities from './views/users/agentBasedScans/projectVulnerabilities';
import ProjectInventory from './views/users/agentBasedScans/projectInventory';

import AddMirroringProject from './views/users/agentBasedScans/addProject';
import EditMirroringProject from './views/users/agentBasedScans/editProject';
import HostsUnderProtection from './views/users/protection/hostsUnderProtection';
import AddHostUnderProtection from './views/users/protection/addHostUnderProtection';
import EditHostUnderProtection from './views/users/protection/editHostUnderProtection';
import HowToAddHostUnderProtection from './views/users/protection/howToAddHostUnderProtection';
import AddAgent from './views/users/agentBasedScans/addAgent';
import Hosts from './views/users/protection/hosts';
import EndPoints from './views/users/activeScans/endPoints';
import Alerts from './views/users/activeScans/alerts';
import PIIData from './views/users/piiData/piiData';
import PIIDataDetails from './views/users/piiData/piiDataDetails';
import Organization from './views/users/organization/organization';
import OrganizationSettings from './views/users/organization/settings';

import Protection from './views/users/protection/protection';
import Settings from './views/users/organization/settings';

import Tickets from './views/users/organization/tickets/tickets';
import OpenTicket from './views/users/organization/tickets/openTicket';
import Ticket from './views/users/organization/tickets/ticket';
import EditTicket from './views/users/organization/tickets/editTicket';

import Users from './views/users/organization/users/users';
import AddUser from './views/users/organization/users/addUser';
import EditUser from './views/users/organization/users/editUser';

import Teams from './views/users/organization/teams/teams';
import AddTeam from './views/users/organization/teams/addTeam';
import EditTeam from './views/users/organization/teams/editTeam';

import Workspaces from './views/users/organization/workspaces/workspaces';
import AddWorkspace from './views/users/organization/workspaces/addWorkspace';
import EditWorkspace from './views/users/organization/workspaces/editWorkspace';

import Projects from './views/users/organization/projects/projects';
import AddProject from './views/users/organization/projects/addProject';
import EditProject from './views/users/organization/projects/editProject';

import LLMScans from './views/users/llmScans/llmScans';
import StartLLMScan from './views/users/llmScans/startLLMScan';
import ViewLLMScanReport from './views/users/llmScans/viewLLMScanReport';

import SBOMScans from './views/users/sbomScans/sbomScans';
import ViewSBOMScanReport from './views/users/sbomScans/viewSBOMScanReport';
import StartSBOMScan from './views/users/sbomScans/startSBOMScan';

import SOAPGraphQLScans from './views/users/soapOrGraphQLScans/soapGraphQLScans';
import StartSOAPGraphQLScan from './views/users/soapOrGraphQLScans/startSOAPGraphQLScan';
import ViewSOAPGraphQLScanReport from './views/users/soapOrGraphQLScans/viewSOAPGraphQLScanReport';


import ThreatModellingMain from './views/users/threatModelling/threatModellingMain';
import ThreatModellingScanDetail from './views/users/threatModelling/threatModellingScanDetail';
import ThreatModellingLLMScanDetail from './views/users/threatModelling/llmScanDetailThreatModelling';

import APIInventory from './views/users/inventory/apiInventory';
import AddAPICollection from './views/users/inventory/addAPICollection';
import AddAPICollectionVersion from './views/users/inventory/addAPICollectionVersion';
import APICollectionVersionScans from './views/users/inventory/apiCollectionVersionScans';
import APICollectionVersions from './views/users/inventory/apiCollectionVersions';

import ComplianceMonitoring from './views/users/complianceMonitoring/complianceMonitoring';

import AttackSurfaceManagement from './views/users/attackSurface/attackSurfaceManagement';
import StartAttackSurfaceScan from './views/users/attackSurface/startAttackSurfaceScan';
import AttackSurfaceScanResult from './views/users/attackSurface/attackSurfaceScanResult';

import ResultIntegrations from './views/users/organization/resultIntegrations';

import Integrations from './views/users/integrations/integrations';


const routes = [
  { path: '/user-dashboard', name: 'User Dashboard', element: UserDashboard},
  { path: '/api-inventory', name: 'API Inventory', element: APIInventory}, 
  { path: '/add-api-collection', name: 'Add API Collection', element: AddAPICollection}, 
  { path: '/add-api-collection-version', name: 'Add API Collection Version', element: AddAPICollectionVersion}, 
  { path: '/api-collection-versions', name: 'API Collection Versions', element: APICollectionVersions},
  { path: '/api-collection-version-scans', name: 'API Collection Version Scans', element: APICollectionVersionScans}, 
  { path: '/active-scans', name: 'Active Scans', element: ActiveScans}, 
  { path: '/start-active-scan', name: 'Start a Active Scan', element: StartQuickScan}, 
  { path: '/view-active-scan-report', name: 'View Active Scan Report', element: ViewQuickScanReport},
  { path: '/agents', name: 'Agents', element: Agents},
  { path: '/project-inventory', name: 'ProjectInventory', element: ProjectInventory},
  { path: '/add-mirroring-project', name: 'AddMirroringProject', element: AddMirroringProject},
  { path: '/edit-mirroring-project', name: 'EditMirroringProject', element: EditMirroringProject},
  { path: '/agents', name: 'Agents', element: Agents},
  { path: '/add-agent', name: 'Add Agent', element: AddAgent},
  { path: '/project-vulnerabilities', name: 'Project vulnerabilities', element: ProjectVulnerabilities},
  { path: '/hosts', name: 'Hosts', element: Hosts},
  { path: '/endpoints', name: 'Endpoints', element: EndPoints},
  { path: '/alerts', name: 'Alerts', element: Alerts},
  { path: '/pii-data', name: 'PII Data', element: PIIData},
  { path: '/pii-data-details', name: 'PII Data Details', element: PIIDataDetails},
  { path: '/llm-scans', name: 'LLM Scans', element: LLMScans},
  { path: '/start-llm-scan', name: 'Start LLM Scan', element: StartLLMScan},
  { path: '/view-llm-scan-report', name: 'View LLM Scan Report', element: ViewLLMScanReport},
  { path: '/sbom-scans', name: 'SBOM Scans', element: SBOMScans},
  { path: '/view-sbom-scan-report', name: 'View SBOM Scan Report', element: ViewSBOMScanReport},
  { path: '/start-sbom-scan', name: 'Start SBOM Scan', element: StartSBOMScan},
  { path: '/soap-graphql-scans', name: 'SOAP/GraphQL Scans', element: SOAPGraphQLScans},
  { path: '/start-soap-graphql-scan', name: 'Start SOAP/GraphQL Scan', element: StartSOAPGraphQLScan},
  { path: '/view-soap-graphql-scan-report', name: 'View SOAP/GraphQL Scan Report', element: ViewSOAPGraphQLScanReport},
  { path: '/threat-modelling', name: 'Threat Modelling', element: ThreatModellingMain},
  { path: '/threat-modelling-scan-detail', name: 'Threat Modelling Scan Detail', element: ThreatModellingScanDetail},
  { path: '/threat-modelling-scan-detail-llm', name: 'Threat Modelling Scan Detail - LLM', element: ThreatModellingLLMScanDetail},
  { path: '/organization', name: 'Organization', element: Organization},
  { path: '/protection', name: 'Protection', element: Protection},
  { path: '/hosts-under-protection', name: 'Hosts Under Protection', element: HostsUnderProtection},
  { path: '/add-host-under-protection', name: 'Add Host Under Protection', element: AddHostUnderProtection},
  { path: '/edit-host-under-protection', name: 'Edit Host Under Protection', element: EditHostUnderProtection},
  { path: '/how-to-add-host-under-protection', name: 'How to Add Host Under Protection', element: HowToAddHostUnderProtection},
  { path: '/settings', name: 'Settings', element: Settings},   
  { path: '/admin-dashboard', name: 'Admin Dashboard', element: AdminDashboard}, 
  { path: '/admin-all-users', name: 'Admin All Users', element: AdminAllUsers}, 
  { path: '/admin-add-user', name: 'Admin Add User', element: AdminAddUser}, 
  { path: '/admin-edit-user', name: 'Admin Edit User', element: AdminEditUser}, 


  { path: '/organization-settings', name: 'Organization Settings', element: OrganizationSettings},

  { path: '/teams', name: 'Teams', element: Teams},
  { path: '/add-team', name: 'Add Team', element: AddTeam},
  { path: '/edit-team', name: 'Edit Team', element: EditTeam},

  { path: '/workspaces', name: 'Workspaces', element: Workspaces},
  { path: '/add-workspace', name: 'Add Workspace', element: AddWorkspace},
  { path: '/edit-workspace', name: 'Edit Workspace', element: EditWorkspace},

  { path: '/projects', name: 'Projects', element: Projects},
  { path: '/add-project', name: 'Add Project', element: AddProject},
  { path: '/edit-project', name: 'Edit Project', element: EditProject},
  
  { path: '/tickets', name: 'Tickets', element: Tickets}, 
  { path: '/open-ticket', name: 'Open Ticket', element: OpenTicket},  
  { path: '/edit-ticket', name: 'Edit Ticket', element: EditTicket},  
  { path: '/ticket', name: 'Ticket', element: Ticket}, 

  { path: '/users', name: 'Users', element: Users},  
  { path: '/add-user', name: 'Add User', element: AddUser},  
  { path: '/edit-user', name: 'Edit User', element: EditUser},  

  { path: '/compliance-monitoring', name: 'Compliance Monitoring', element: ComplianceMonitoring}, 

  { path: '/attack-surface-management', name: 'Attack Surface Management', element: AttackSurfaceManagement}, 
  { path: '/start-attack-surface-scan', name: 'Start Attack Surface Scan', element: StartAttackSurfaceScan}, 
  { path: '/attack-surface-scan-result', name: 'Attack Surface Scan Result', element: AttackSurfaceScanResult}, 

  { path: '/result-integrations', name: 'Result Integrations', element: ResultIntegrations},   

  { path: '/integrations', name: 'Integrations', element: Integrations},   
  
]

export default routes 