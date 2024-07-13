const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({

  user: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },  
  projectName: {
    type: String,
  },
  projectIntegrationID: {
    type: String,
  },
  projectType:{
    type: String,
  },  
  piiFields: [{ 
    type: String 
  }],

}, {
  timestamps: true,
});

const Project = mongoose.model('Project', projectSchema);

module.exports = Project;