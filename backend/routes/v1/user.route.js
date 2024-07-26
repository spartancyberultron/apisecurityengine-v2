const express = require('express');
const upload = require('../../config/multerUpload');

var multer = require("multer");
var multerGoogleStorage = require("multer-cloud-storage");

const {
  signUp,
  userLogin,
  sendPasswordRecoveryOTP,
  validatePasswordRecoveryOTP,
  resetPasswordFromRecoveryOption,
  getMyAccountInfo,
  updateMyAccount,
  getSettings,
  updateSettings,
  getUserDashboardCardsData,
  deleteAllEndpoints,
  deleteAllProjectVulnerabilities,
  deleteAllCollections,
  addAVulnerability,
  deleteAllVulnerabilities,
  getAllEndpoints,
  addPIIDataToAllEndpoints,
  getAllVulnerabilitiesFound,
  getAllPIIData,
  getEndpointsWithPIIData,
  getVulnerabilityDistribution,
  getTopEndPoints,
  getLast5DaysVulnerabilityTrends,
  getMonthlyVulnerabilityTrends,
  getLast10Alerts,
  getPIIDataDetails,
  listAllProjects,
  addProject,
  loadProject,
  updateProject,
  deleteProject,
  listAllProtectionHosts,
  addProtectionHost,
  updateProtectionHost,
  deleteProtectionHost,
  loadProtectionHost,
  getScanDetailsForReport,
  updateOWASPAndCWEForVulnerabilities,
  updateRiskAcceptanceForAnActiveScanVulnerability,
  getOrganizationDetails,
  getTimeToResolveVulnerabilities,
  getNumberOfOpenVulnerabilities,
  getAuditFindings,
  getThreatAlerts,
  getThreatTrends,
  getRiskScore,
  getTopRisks,
} = require('../../controllers/user.controller');


const { protectUser } = require('../../middlewares/authMiddleware');

const router = express.Router();

//base route /api/v1/users/
router.post('/signUp', signUp);
router.post('/userLogin', userLogin);

router.post('/sendPasswordRecoveryOTP', sendPasswordRecoveryOTP);
router.post('/validatePasswordRecoveryOTP', validatePasswordRecoveryOTP);
router.post('/resetPasswordFromRecoveryOption', resetPasswordFromRecoveryOption);
router.post('/getMyAccountInfo', protectUser, getMyAccountInfo);
router.post('/updateMyAccount', protectUser, updateMyAccount);
router.post('/getSettings', protectUser, getSettings);
router.post('/updateSettings', protectUser, updateSettings);

router.get('/getScanDetailsForReport/:scanId/:userId', getScanDetailsForReport);

router.get('/getUserDashboardCardsData', protectUser, getUserDashboardCardsData);
router.get('/getVulnerabilityDistribution', protectUser, getVulnerabilityDistribution);
router.get('/getTopEndPoints', protectUser, getTopEndPoints);
router.get('/getLast5DaysVulnerabilityTrends', protectUser, getLast5DaysVulnerabilityTrends);
router.get('/getMonthlyVulnerabilityTrends', protectUser, getMonthlyVulnerabilityTrends);
router.get('/getLast10Alerts', protectUser, getLast10Alerts);

router.get('/getTimeToResolveVulnerabilities', protectUser, getTimeToResolveVulnerabilities);
router.get('/getNumberOfOpenVulnerabilities', protectUser, getNumberOfOpenVulnerabilities);
router.get('/getAuditFindings', protectUser, getAuditFindings);
router.get('/getThreatAlerts', protectUser, getThreatAlerts);
router.get('/getThreatTrends', protectUser, getThreatTrends);
router.get('/getRiskScore', protectUser, getRiskScore);
router.get('/getTopRisks', protectUser, getTopRisks);


router.get('/getAllEndpoints', protectUser, getAllEndpoints);
router.get('/getAllVulnerabilitiesFound', protectUser, getAllVulnerabilitiesFound);
router.get('/getAllPIIData', protectUser, getAllPIIData);
router.post('/getPIIDataDetails', protectUser, getPIIDataDetails);

router.get('/getEndpointsWithPIIData', protectUser, getEndpointsWithPIIData);

// Temporary routes for testing
router.post('/deleteAllEndpoints', protectUser, deleteAllEndpoints);
router.post('/deleteAllProjectVulnerabilities', protectUser, deleteAllProjectVulnerabilities);
router.post('/deleteAllCollections', protectUser, deleteAllCollections);

router.get('/addPIIDataToAllEndpoints', protectUser, addPIIDataToAllEndpoints);

// For data entry
router.post('/addAVulnerability', protectUser, addAVulnerability);
router.post('/deleteAllVulnerabilities', protectUser, deleteAllVulnerabilities);

router.get('/listAllProjects', protectUser, listAllProjects);
router.post('/addProject', protectUser, addProject);
router.post('/loadProject', protectUser, loadProject);
router.post('/updateProject', protectUser, updateProject);
router.post('/deleteProject', protectUser, deleteProject);


// DDoS Protection Hosts Management APIs
router.get('/listAllProtectionHosts', protectUser, listAllProtectionHosts);
router.post('/addProtectionHost', protectUser, addProtectionHost);
router.post('/updateProtectionHost', protectUser, updateProtectionHost);
router.post('/loadProtectionHost', protectUser, loadProtectionHost);
router.post('/deleteProtectionHost', protectUser, deleteProtectionHost);

// Temp - data update
//router.post('/updateOWASPAndCWEForVulnerabilities', updateOWASPAndCWEForVulnerabilities);

router.post('/updateRiskAcceptanceForAnActiveScanVulnerability', protectUser, updateRiskAcceptanceForAnActiveScanVulnerability);

router.get('/getOrganizationDetails', protectUser, getOrganizationDetails);



module.exports = router;