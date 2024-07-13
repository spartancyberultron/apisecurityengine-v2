const express = require('express');
const router = express.Router();
const {
    addUser,
    updateUser,
    deleteUser,
    listAllUsers,
    loadUser,
    clearAllAPICollections,
    clearAllAPIEndpoints,
    clearAllActiveScans,
    clearAllActiveScanVulnerabilities
} = require('../../controllers/admin.controller');

const { protectAdmin } = require('../../middlewares/authMiddleware');

router.get('/listAllUsers', protectAdmin, listAllUsers);
router.post('/addUser', protectAdmin, addUser);
router.post('/loadUser', protectAdmin, loadUser);
router.post('/updateUser', protectAdmin, updateUser);
router.post('/deleteUser', protectAdmin, deleteUser);

router.post('/clearAllAPICollections', protectAdmin, clearAllAPICollections);
router.post('/clearAllAPIEndpoints', protectAdmin, clearAllAPIEndpoints);
router.post('/clearAllActiveScans', protectAdmin, clearAllActiveScans);
router.post('/clearAllActiveScanVulnerabilities', protectAdmin, clearAllActiveScanVulnerabilities);


module.exports = router;