const mongoose = require('mongoose');

const orgProjectSchema = mongoose.Schema({

  name: {
    type: String,
  },  
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization', 
  },
  workspace: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workspace', 
  },  
}, {
  timestamps: true,
});

const OrgProject = mongoose.model('OrgProject', orgProjectSchema);

module.exports = OrgProject;