'use strict';

const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const ADVOCATE_SPECIALIZATIONS = [
  'Medical Negligence', 'Consumer Protection', 'Healthcare Law',
  'Civil Litigation', 'Criminal Law', 'Insurance Claims',
  'Human Rights', 'Constitutional Law', 'Family Law', 'Labour Law',
  'Arbitration & Mediation', 'Supreme Court Practice', 'High Court Practice',
  'Patient Rights', 'Pharmaceutical Liability',
];

const COURT_TYPES = [
  'Supreme Court', 'High Court', 'District Court', 'Consumer Forum',
  'National Consumer Disputes Redressal Commission (NCDRC)',
  'State Consumer Disputes Redressal Commission (SCDRC)',
  'District Consumer Disputes Redressal Commission (DCDRC)',
  'Medical Council Proceedings', 'Medico-Legal Arbitration',
];

const advocateSchema = new mongoose.Schema({
  // Legacy uuid — kept for backward compat with existing admin route lookups
  id: { type: String, default: uuidv4, unique: true, required: true },

  // Personal
  full_name:  { type: String, required: true, trim: true },
  email:      { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone:      { type: String, required: true, trim: true },
  photo_url:  { type: String },

  // Password kept optional — existing data preserved, new registrations don't require it
  password:   { type: String },

  // Bar credentials
  bar_council_number: { type: String, required: true, unique: true, trim: true },
  bar_council_state:  { type: String, trim: true },

  // Practice
  specializations:    { type: [String], required: true },
  court_types:        { type: [String], default: [] },
  experience_years:   { type: Number, required: true, min: 0 },
  areas_of_operation: { type: [String], required: true },
  city:               { type: String, trim: true },
  state:              { type: String, trim: true },

  // Profile
  about:     { type: String, required: true },
  biography: { type: String },
  linkedin:  { type: String, trim: true },
  website:   { type: String, trim: true },
  languages: { type: [String], default: ['English', 'Hindi'] },

  // Moderation
  status:      { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  verified:    { type: Boolean, default: false },
  featured:    { type: Boolean, default: false },
  admin_notes: { type: String },

  // Legacy timestamp field (kept for backward compat)
  created_at: { type: String, default: () => new Date().toISOString() },
}, {
  collection: 'advocates',
  versionKey: false,
  timestamps: true,
});

advocateSchema.index({ status: 1, createdAt: -1 });
advocateSchema.index({ specializations: 1, status: 1 });
advocateSchema.index({ verified: 1, status: 1 });
advocateSchema.index({ city: 1, state: 1 });

advocateSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('Advocate', advocateSchema);
module.exports.ADVOCATE_SPECIALIZATIONS = ADVOCATE_SPECIALIZATIONS;
module.exports.COURT_TYPES = COURT_TYPES;
