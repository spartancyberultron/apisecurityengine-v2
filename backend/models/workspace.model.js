const mongoose = require('mongoose');

const workspaceSchema = mongoose.Schema({

  name: {
    type: String,
  },  
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization', 
  },  
}, {
  timestamps: true,
});

const Workspace = mongoose.model('Workspace', workspaceSchema);

module.exports = Workspace;
