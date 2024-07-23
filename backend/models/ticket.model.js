const mongoose = require('mongoose');

// Define the Ticket schema
const ticketSchema = mongoose.Schema({
  title: {
    type: String,
  },
  description: {
    type: String,
  },
  category: {
    type: String,
  },
  ticketId: {
    type: Number,
    unique: true,
  },
  priority: {
    type: String,
  },
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  status: {
    type: String,
  },
  openedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  note: {
    type: String,
  },
  attachments: {
    type: [String],
  },
  source: {
    type: String,
  },
  scanId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ActiveScan',
  }
}, {
  timestamps: true,
});

// Counter schema to keep track of ticket IDs
const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  sequence_value: { type: Number, default: 0 }
});

const Counter = mongoose.model('Counter', counterSchema);

// Pre-save hook to auto-increment ticketId
ticketSchema.pre('save', async function(next) {
  if (this.isNew) {
    try {
      const counter = await Counter.findByIdAndUpdate(
        { _id: 'ticketId' },
        { $inc: { sequence_value: 1 } },
        { new: true, upsert: true }
      );
      this.ticketId = counter.sequence_value;
      next();
    } catch (err) {
      next(err);
    }
  } else {
    next();
  }
});

const Ticket = mongoose.model('Ticket', ticketSchema);

module.exports = Ticket;
