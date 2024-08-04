const mongoose = require('mongoose');

const attackSurfaceScanSchema = new mongoose.Schema({

  user: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true,
  },  
  vulnerabilities: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AttackSurfaceScanVulnerability',
    },
  ],  
  orgProject: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'OrgProject',
  },
  projectName: {
    type: String,
  },
  domain: {
    type: String,
  },
  scanCompletedAt: {
    type: Date,
  },
  emailToSendReportTo:{
    type: String,
  },
  status:{
    type: String,
  },
  sslCheckDone:{
    type: Boolean,
  },
  securityHeadersCheckDone:{
    type: Boolean,
  }
}, {
  timestamps: true,
});

const AttackSurfaceScan = mongoose.model('AttackSurfaceScan', attackSurfaceScanSchema);

module.exports = AttackSurfaceScan;


