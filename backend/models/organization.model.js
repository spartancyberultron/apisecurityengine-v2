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
      enum: ['LOW', 'MEDIUM', 'HIGH'],
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
}, {
  timestamps: true,
});

const Organization = mongoose.model('Organization', organizationSchema);

module.exports = Organization;
