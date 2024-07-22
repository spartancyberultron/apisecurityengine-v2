const mongoose = require('mongoose');

const activeScanSchema = new mongoose.Schema({

  user: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true,
  },
  theCollectionVersion: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'APICollectionVersion',
  },
  vulnerabilities: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ActiveScanVulnerability',
    },
  ],  
  projectName: {
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
  },
  scanScheduleType: {
    type: String,
    enum: ['now', 'specificTime', 'recurring'],
    default: 'now'
  },
  specificDateTime: {
    type: Date
  },
  recurringSchedule: {
    type: String,
    enum: ['daily', 'weekly', 'biweekly', 'monthly']
  }
}, {
  timestamps: true,
});

const ActiveScan = mongoose.model('ActiveScan', activeScanSchema);

module.exports = ActiveScan;




