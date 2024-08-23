const mongoose = require('mongoose');

const organizationSchema = mongoose.Schema({
  name: {
    type: String,
  }, 
  primaryUser: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }, 
  clientId: {
    type: String,
  },  
  clientSecret: {
    type: String,
  },  
  logoURL:{
    type: String,
  },
  companyURL:{
    type: String,
  },
  postmanAPIKey:{
    type: String,
  },
  vulnSeverityAndPriority: [{
    vulnId: {
      type: Number,
      required: true,
    },
    severity: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
      required: true,
    },
    priority: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
      required: true,
    },
  }],
  piiField: [{
    piiField: {
      type: String,
      required: true,
    },
    enabled: {
      type: Boolean,
      required: true,
    },
  }],
  vulnerabilityDistribution: {
    type: mongoose.Schema.Types.Mixed, 
    default: {} 
  },
  topEndpoints: {
    type: mongoose.Schema.Types.Mixed, 
    default: {} 
  },
  vulnerabilityTrends: {
    type: mongoose.Schema.Types.Mixed, 
    default: {} 
  },
  
  severityDistribution: {
    type: mongoose.Schema.Types.Mixed, 
    default: {} 
  },
  numberOfOpenVulnerabilities: {
    type: mongoose.Schema.Types.Mixed, 
    default: {} 
  },
  timeToResolveVulnerabilities: {
    type: Number, 
    default: 99999
  },
  top10Vulnerabilities: {
    type: mongoose.Schema.Types.Mixed, 
    default: {} 
  },
  complianceStatus: {
    type: mongoose.Schema.Types.Mixed, 
    default: {} 
  },
  ssdlcScore: {
    type: mongoose.Schema.Types.Mixed, 
    default: {} 
  },
  auditFindings: {
    type: [mongoose.Schema.Types.Mixed], // This defines auditFindings as an array of mixed-type objects or values
    default: [], // Default to an empty array
  },
  threatAlerts: {
    type: mongoose.Schema.Types.Mixed, 
    default: {} 
  },
  threatTrends: {
    type: mongoose.Schema.Types.Mixed, 
    default: {} 
  },
  riskScore: {
    type: Number, 
    default: 99999
  },
  topRisks: {
    type: [mongoose.Schema.Types.Mixed], // This defines auditFindings as an array of mixed-type objects or values
    default: [], // Default to an empty array
  },
  dashboardCardData:{
    type: mongoose.Schema.Types.Mixed, 
    default: {} 
  },
}, {
  timestamps: true,
});

const Organization = mongoose.model('Organization', organizationSchema);

module.exports = Organization;
