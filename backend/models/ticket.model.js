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
    default: 'Manual'
  },
  scanId: {
    type: String,
  },
  openedAt: {
    type: Date
  },
  resolvedAt: {
    type: Date
  },
  resolutionTime: {
    type: Number  // Store resolution time in milliseconds
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

ticketSchema.pre('save', async function(next) {
  if (this.isNew) {
    try {
      const counter = await Counter.findByIdAndUpdate(
        { _id: 'ticketId' },
        { $inc: { sequence_value: 1 } },
        { new: true, upsert: true }
      );
      this.ticketId = counter.sequence_value;
      
      // Set openedAt when the ticket is first created with "OPEN" status
      if (this.status === 'OPEN') {
        this.openedAt = new Date();
      }
      
      next();
    } catch (err) {
      next(err);
    }
  } else {
    // If the status is changing to "RESOLVED", set resolvedAt and calculate resolutionTime
    if (this.isModified('status') && this.status === 'RESOLVED' && this.openedAt) {
      this.resolvedAt = new Date();
      this.resolutionTime = this.resolvedAt - this.openedAt;
    }
    next();
  }
});

const Ticket = mongoose.model('Ticket', ticketSchema);

module.exports = Ticket;
