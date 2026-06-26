'use strict';

const mongoose = require('mongoose');

const VOLUNTEER_CATEGORIES = [
  'Legal Volunteer',
  'Medical Volunteer',
  'Research Volunteer',
  'Student Volunteer',
  'Translator',
  'Graphic Designer',
  'Social Media',
  'Fundraising',
  'Community Moderator',
  'Technology Volunteer',
];

const volunteerSchema = new mongoose.Schema({
  // Personal
  full_name:   { type: String, required: true, trim: true },
  email:       { type: String, required: true, lowercase: true, trim: true },
  phone:       { type: String, trim: true },
  city:        { type: String, trim: true },
  state:       { type: String, trim: true },
  photo_url:   { type: String },

  // Professional identity
  category:    { type: String, required: true, enum: VOLUNTEER_CATEGORIES },
  profession:  { type: String, trim: true },   // current job title / designation
  institution: { type: String, trim: true },   // employer / university
  experience_years: { type: Number, min: 0 },

  // Skills & capacity
  skills:      { type: [String], default: [] },
  languages:   { type: [String], default: [] },
  availability: {
    type: String,
    enum: ['full_time', 'part_time', 'weekends', 'occasional'],
    default: 'occasional',
  },

  // Profile
  biography:   { type: String },
  linkedin:    { type: String },
  website:     { type: String },

  // What they want to contribute
  areas_of_interest: { type: [String], default: [] },
  how_can_help:      { type: String, required: true },

  // Moderation
  status:       { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  verified:     { type: Boolean, default: false },
  featured:     { type: Boolean, default: false },
  admin_notes:  { type: String },
}, { timestamps: true, collection: 'volunteers' });

volunteerSchema.index({ email: 1 }, { unique: true });
volunteerSchema.index({ status: 1, createdAt: -1 });
volunteerSchema.index({ category: 1, status: 1 });
volunteerSchema.index({ verified: 1, status: 1 });
volunteerSchema.index({ skills: 1 });
volunteerSchema.index({ languages: 1 });

module.exports = mongoose.model('Volunteer', volunteerSchema);
module.exports.VOLUNTEER_CATEGORIES = VOLUNTEER_CATEGORIES;
