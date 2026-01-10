// models/Medicine.js
const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  genericName: String,
  description: String,
  dosage: String,
  activeIngredient: String,
  precautions: String,
  sideEffects: String,
  storageInstructions: String,
  image: String, // URL or emoji
  category: {
    type: String,
    enum: ['analgesic', 'antibiotic', 'antihistamine', 'antipyretic', 'other']
  },
  relatedSymptoms: [String],
  recommendedForSpecialties: [String],
  // Multilingual support
  hindi: {
    name: String,
    description: String,
    dosage: String,
    precautions: String,
    sideEffects: String,
    storage: String
  },
  punjabi: {
    name: String,
    description: String,
    dosage: String,
    precautions: String,
    sideEffects: String,
    storage: String
  },
  isPrescriptionRequired: {
    type: Boolean,
    default: false
  },
  priceRange: {
    min: Number,
    max: Number
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Medicine', medicineSchema);