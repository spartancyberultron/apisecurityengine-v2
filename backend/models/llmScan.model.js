const mongoose = require('mongoose');

const llmScanSchema = new mongoose.Schema({

  user: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true,
  }, 
  probes: {
    type: [String],
  },
  scanName: {
    type: String,
  },  
  modelHubKey: {
    type: String,
  },
  modelName: {
    type: String,
  },
  taskId: {
    type: String,
  },
  scanCompletedAt: {
    type: Date,
  },
  status:{
    type: String, // In Progress, Completed
  },
  taskStartTime: {
    type: String,
  },
  reportsDir: {
    type: String,
  },
  resultFiles: {
    type: [String],
  },
  resultFileContents: [{
    complete_path: String,
    file_name: String,
    data: String
  }] 

  
}, {
  timestamps: true,
});

const LLMScan = mongoose.model('LLMScan', llmScanSchema);

module.exports = LLMScan;