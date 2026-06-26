'use strict';

const mongoose = require('mongoose');

const SPECIALIZATIONS = [
  'General Medicine', 'General Surgery', 'Obstetrics & Gynaecology', 'Paediatrics',
  'Orthopaedics', 'Cardiology', 'Cardiothoracic Surgery', 'Neurology', 'Neurosurgery',
  'Oncology', 'Oncosurgery', 'Radiology', 'Anaesthesiology', 'Pathology',
  'Dermatology', 'Psychiatry', 'Ophthalmology', 'ENT', 'Urology', 'Nephrology',
  'Gastroenterology', 'Pulmonology', 'Endocrinology', 'Rheumatology',
  'Plastic Surgery', 'Vascular Surgery', 'Emergency Medicine', 'ICU & Critical Care',
  'Public Health', 'Forensic Medicine', 'Medical Ethics', 'Other',
];

const AVAILABILITY_OPTIONS = ['available', 'limited', 'unavailable'];

const doctorSchema = new mongoose.Schema({
  // Personal
  full_name:   { type: String, required: true, trim: true },
  email:       { type: String, required: true, lowercase: true, trim: true },
  phone:       { type: String, trim: true },
  photo_url:   { type: String },

  // Medical credentials
  qualification:            { type: String, required: true, trim: true }, // e.g. MBBS, MS, MD
  medical_council_reg:      { type: String, required: true, trim: true }, // MCI / State reg no
  medical_council_state:    { type: String, trim: true },                 // which council
  specialization:           { type: String, required: true, enum: SPECIALIZATIONS },
  sub_specialization:       { type: String, trim: true },
  experience_years:         { type: Number, required: true, min: 0 },

  // Practice
  hospital:   { type: String, trim: true },
  clinic:     { type: String, trim: true },
  city:       { type: String, trim: true },
  state:      { type: String, trim: true },

  // Research & academic
  research_interests: { type: [String], default: [] },
  publications:       { type: String },   // free text or list
  orcid:              { type: String, trim: true },

  // Profile
  biography:   { type: String },
  languages:   { type: [String], default: ['English'] },
  website:     { type: String, trim: true },
  linkedin:    { type: String, trim: true },
  availability:{ type: String, enum: AVAILABILITY_OPTIONS, default: 'available' },

  // Consent — doctor explicitly agrees they are not reviewing hospitals
  consent_not_reviewer: { type: Boolean, required: true, default: false },

  // Moderation
  status:     { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  verified:   { type: Boolean, default: false },
  featured:   { type: Boolean, default: false },
  admin_notes:{ type: String },
}, { timestamps: true, collection: 'doctors' });

doctorSchema.index({ email: 1 }, { unique: true });
doctorSchema.index({ status: 1, createdAt: -1 });
doctorSchema.index({ specialization: 1, status: 1 });
doctorSchema.index({ verified: 1, status: 1 });
doctorSchema.index({ city: 1, state: 1 });

module.exports = mongoose.model('Doctor', doctorSchema);
module.exports.SPECIALIZATIONS = SPECIALIZATIONS;
