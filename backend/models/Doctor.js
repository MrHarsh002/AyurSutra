const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  doctorId: {
    type: String,
    unique: true,
    uppercase: true
  },
  department: {
    type: String,
    required: true,
    enum: ['general', 'panchakarma', 'kayachikitsa', 'shalya', 'shalakya', 'prasuti', 'kaumarabhritya', 'swasthavritta']
  },
  specialization: [String],
  experience: Number,
  consultationFee: {
    type: Number,
    required: true
  },
  availableDays: [{
    type: String,
    enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
  }],
  workingHours: {
    start: String,
    end: String
  },
  maxPatientsPerDay: Number,
  leaveDates: [Date],
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  totalRatings: {
    type: Number,
    default: 0
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  signature: String
});

// Generate doctor ID
doctorSchema.pre('save', async function() {
  if (!this.doctorId) {
    const year = new Date().getFullYear();
    const count = await mongoose.model('Doctor').countDocuments();
    this.doctorId = `DOC${year}${String(count + 1).padStart(4, '0')}`;
  }
});

module.exports = mongoose.model('Doctor', doctorSchema);