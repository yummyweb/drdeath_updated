const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const advocateSchema = new mongoose.Schema({
  id: {
    type: String,
    default: uuidv4,
    unique: true,
    required: true
  },
  full_name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  phone: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  bar_council_number: {
    type: String,
    required: true,
    unique: true
  },
  specializations: {
    type: [String],
    required: true
  },
  experience_years: {
    type: Number,
    required: true
  },
  areas_of_operation: {
    type: [String],
    required: true
  },
  about: {
    type: String,
    required: true
  },
  languages: {
    type: [String],
    default: ['English', 'Hindi']
  },
  profile_image: String,
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  admin_notes: String,
  created_at: {
    type: String,
    default: () => new Date().toISOString()
  }
}, {
  collection: 'advocates',
  versionKey: false
});

// Don't include password in JSON output
advocateSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('Advocate', advocateSchema);

