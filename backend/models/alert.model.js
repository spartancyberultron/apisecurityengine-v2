const mongoose = require('mongoose');

const apiSchema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
  },
  vulnerability: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vulnerability',
  },
  endpointName: {
    type: String,
  },
  method: {
    type: String,
  },
  description: {
    type: String,
  },
  headers: {
    type: [String], // Array of strings
  },
}, {
  timestamps: true,
});

const Alert = mongoose.model('Alert', apiSchema);

module.exports = Alert;
