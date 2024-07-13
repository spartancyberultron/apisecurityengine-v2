const express = require('express');

const { 
    getAllAttackSurfaceScans, 
      startAttackSurfaceScan,   
      getAttackSurfaceScanDetails,            
      deleteAttackSurfaceScan
    } = require('../../controllers/attackSurfaceScans.controller');

const { protectUser } = require('../../middlewares/authMiddleware');

const router = express.Router();

//base route /api/v1/activeScans/

router.get('/getAllAttackSurfaceScans', protectUser, getAllAttackSurfaceScans);
router.post('/getAttackSurfaceScanDetails', protectUser, getAttackSurfaceScanDetails);
router.post('/startAttackSurfaceScan', protectUser, startAttackSurfaceScan);
router.post('/deleteAttackSurfaceScan', protectUser, deleteAttackSurfaceScan);

module.exports = router;