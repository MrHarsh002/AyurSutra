const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  appointmentId: {
    type: String,
    unique: true,
    sparse: true
  },

  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true,
    index: true
  },

  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },

  date: {
    type: Date,
    required: true,
    index: true
  },

  time: {
    type: String,
    required: true
  },

  duration: {
    type: Number,
    default: 30 // minutes
  },

  type: {
    type: String,
    enum: ['consultation', 'follow-up', 'therapy', 'emergency', 'check-up'],
    default: 'consultation',
    index: true
  },

  purpose: {
    type: String,
    trim: true
  },

  status: {
    type: String,
    enum: [
      'scheduled',
      'confirmed',
      'checked-in',
      'in-progress',
      'completed',
      'cancelled',
      'no-show',
      'rescheduled'
    ],
    default: 'scheduled',
    index: true
  },

  // Therapy support
  therapy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Therapy'
  },

  therapyRoom: String,

  // Follow-up specific
  followUpOf: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment' // original appointment reference
  },

  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'emergency'],
    default: 'medium'
  },

  location: {
    type: String,
    default: 'Clinic'
  },

  notes: {
    type: String,
    trim: true
  },

  symptoms: [String],

  // Reminder system
  reminderEnabled: {
    type: Boolean,
    default: true
  },

  reminderSent: {
    type: Boolean,
    default: false
  },

  reminderTime: {
    type: String,
    default: '1 day before'
  },

  cancellationReason: String,

  rescheduleReason: String,

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }

}, {
  timestamps: true
});


// ============================
// Generate Appointment ID
// ============================
appointmentSchema.pre('save', async function () {
  if (!this.appointmentId) {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    const startOfDay = new Date(year, date.getMonth(), date.getDate());
    const endOfDay = new Date(year, date.getMonth(), date.getDate() + 1);

    const count = await mongoose.model('Appointment').countDocuments({
      createdAt: { $gte: startOfDay, $lt: endOfDay }
    });

    this.appointmentId = `APT${year}${month}${day}${String(count + 1).padStart(3, '0')}`;
  }
});

// Compound index (fast follow-up queries)
appointmentSchema.index({ patient: 1, date: -1 });
appointmentSchema.index({ doctor: 1, date: -1 });

module.exports = mongoose.model('Appointment', appointmentSchema);
