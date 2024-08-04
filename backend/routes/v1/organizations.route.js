const express = require('express');
const {uploadTicketAttachments, uploadTicketUpdateAttachments} = require('../../config/multerUpload');

const { 
      editOrganization,   
      getOrganizationDetails,       
      getTeams,
      addTeam,
      editTeam,
      deleteTeam,
      getWorkspaces,
      addWorkspace,
      editWorkspace,
      deleteWorkspace,
      getProjects,
      addProject,
      editProject,
      deleteProject,
      getOrganizationUsers,
      getTickets,
      addTicket,
      editTicket,
      deleteTicket,
      deleteUser,
      addUser,
      editUser,
      getUserDetails,      
      getTicketDetails,
      getTeamDetails,    
      getWorkspaceDetails,    
      getProjectDetails,
      addTicketUpdate,
      saveOrganizationSettings
    } = require('../../controllers/organizations.controller');

const { protectUser } = require('../../middlewares/authMiddleware');

const router = express.Router();

//base route /api/v1/sastScans/

router.get('/getOrganizationDetails', protectUser, getOrganizationDetails);

router.post('/editOrganization', protectUser, editOrganization);

router.get('/getTeams', protectUser, getTeams);
router.post('/addTeam', protectUser, addTeam);
router.post('/editTeam', protectUser, editTeam);
router.post('/deleteTeam', protectUser, deleteTeam);

router.get('/getWorkspaces', protectUser, getWorkspaces);
router.post('/addWorkspace', protectUser, addWorkspace);
router.post('/editWorkspace', protectUser, editWorkspace);
router.post('/deleteWorkspace', protectUser, deleteWorkspace);

router.get('/getProjects', protectUser, getProjects);
router.post('/addProject', protectUser, addProject);
router.post('/editProject', protectUser, editProject);
router.post('/deleteProject', protectUser, deleteProject);


router.get('/getOrganizationUsers', protectUser, getOrganizationUsers);
router.post('/deleteUser', protectUser, deleteUser);
router.post('/addUser', protectUser, addUser);
router.post('/editUser', protectUser, editUser);

router.get('/getUserDetails/:id', protectUser, getUserDetails);
router.get('/getTeamDetails/:id', protectUser, getTeamDetails);
router.get('/getWorkspaceDetails/:id', protectUser, getWorkspaceDetails);
router.get('/getProjectDetails/:id', protectUser, getProjectDetails);


router.post('/saveOrganizationSettings', protectUser, saveOrganizationSettings);


router.get('/getTickets', protectUser, getTickets);
router.post('/addTicket', protectUser, uploadTicketAttachments.array('ticketAttachments', 10), addTicket);
router.post('/editTicket', protectUser, editTicket);
router.post('/deleteTicket', protectUser, deleteTicket);
router.get('/getTicketDetails/:id', protectUser, getTicketDetails);

router.post('/addTicketUpdate', protectUser, uploadTicketUpdateAttachments.array('ticketUpdateAttachments', 10), addTicketUpdate);



module.exports = router;