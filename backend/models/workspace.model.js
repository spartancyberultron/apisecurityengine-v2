const mongoose = require('mongoose');

const workspaceSchema = mongoose.Schema({
  name: {
    type: String,
    required: true, // Optional: Add any required fields or constraints here
  },  
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization', 
  }, 
  teams: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team', 
  }],  
}, {
  timestamps: true,
});

const Workspace = mongoose.model('Workspace', workspaceSchema);

module.exports = Workspace;
