'use strict';

const mongoose = require('mongoose');

const JOURNALIST_BEATS = [
  'Health & Medicine', 'Medical Negligence', 'Patient Safety', 'Healthcare Policy',
  'Investigative Health Journalism', 'Pharmaceutical Industry', 'Hospital & Healthcare',
  'Consumer Rights', 'Legal Affairs', 'Science & Research',
  'Public Health', 'Mental Health', 'Medical Ethics', 'General Reporting',
];

const MEDIUM_TYPES = [
  'Print', 'Digital / Online', 'Television', 'Radio',
  'Podcast', 'Documentary', 'Freelance', 'Academic / Research Publication',
];

const journalistSchema = new mongoose.Schema({
  // Personal
  full_name:  { type: String, required: true, trim: true },
  email:      { type: String, required: true, lowercase: true, trim: true },
  phone:      { type: String, trim: true },
  photo_url:  { type: String },

  // Professional
  publication:       { type: String, trim: true },     // employer / outlet
  designation:       { type: String, trim: true },     // e.g. Senior Correspondent
  press_card_number: { type: String, trim: true },     // press accreditation if any
  beats:             { type: [String], default: [] },  // from JOURNALIST_BEATS
  medium:            { type: [String], default: [] },  // from MEDIUM_TYPES
  experience_years:  { type: Number, min: 0 },

  // Location
  city:  { type: String, trim: true },
  state: { type: String, trim: true },

  // Profile
  biography:          { type: String },
  notable_work:       { type: String },   // notable investigations / articles
  languages:          { type: [String], default: ['English'] },
  website:            { type: String, trim: true },
  linkedin:           { type: String, trim: true },
  twitter:            { type: String, trim: true },

  // Intent
  areas_of_interest:  { type: [String], default: [] }, // what they want to cover via VOICE
  how_can_help:       { type: String, required: true },

  // Moderation
  status:     { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  verified:   { type: Boolean, default: false },
  featured:   { type: Boolean, default: false },
  admin_notes:{ type: String },
}, { timestamps: true, collection: 'journalists' });

journalistSchema.index({ email: 1 }, { unique: true });
journalistSchema.index({ status: 1, createdAt: -1 });
journalistSchema.index({ beats: 1, status: 1 });
journalistSchema.index({ verified: 1, status: 1 });
journalistSchema.index({ city: 1, state: 1 });

module.exports = mongoose.model('Journalist', journalistSchema);
module.exports.JOURNALIST_BEATS = JOURNALIST_BEATS;
module.exports.MEDIUM_TYPES = MEDIUM_TYPES;
