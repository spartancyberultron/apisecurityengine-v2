const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({

  user: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },  
  orgProject: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'OrgProject',
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
  capturingStatus:{
    type: String,
    default: 'Capturing',
    enum: ['Capturing', 'Stopped']
  },
  piiFields: [{ 
    type: String 
  }],


}, {
  timestamps: true,
});

const Project = mongoose.model('Project', projectSchema);

module.exports = Project;