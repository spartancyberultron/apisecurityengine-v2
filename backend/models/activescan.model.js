const mongoose = require('mongoose');
const { calculateDashboard } = require("../services/dashboard/dashboardCalculation.service");

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
  endpointsScanned: {
    type: Number,
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
  },
  projectPhase: {
    type: String,
    enum: ['Design', 'Development', 'Testing', 'Maintenance']
  }
}, {
  timestamps: true,
});

/*
// Post-save hook to call the service function after a new ActiveScan document is created
activeScanSchema.post('save', async function(doc) {
  try {
    // Populate the necessary fields to get the organization
    await doc.populate({
      path: 'theCollectionVersion',
      populate: {
        path: 'apiCollection',
        populate: {
          path: 'orgProject',
          populate: {
            path: 'organization'
          }
        }
      }
    }).execPopulate();

    // Now, doc.theCollectionVersion.apiCollection.orgProject.organization should be populated
    const organization = doc.theCollectionVersion?.apiCollection?.orgProject?.organization;

    // If organization exists, call calculateDashboard with the organization
    if (organization) {
      await calculateDashboard(organization);
    } else {
      console.error('Organization not found for the created ActiveScan');
    }
  } catch (error) {
    console.error('Error populating document or calling calculateDashboard:', error);
  }
});
*/

const ActiveScan = mongoose.model('ActiveScan', activeScanSchema);

module.exports = ActiveScan;




