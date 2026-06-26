'use strict';

const mongoose = require('mongoose');

const RESEARCH_DOMAINS = [
  'Medical Negligence & Liability', 'Patient Safety', 'Healthcare Quality',
  'Medical Ethics & Bioethics', 'Health Law & Policy', 'Clinical Governance',
  'Epidemiology', 'Public Health', 'Healthcare Systems & Management',
  'Pharmacovigilance', 'Medical Education', 'Mental Health',
  'Forensic Medicine & Medico-Legal', 'Consumer Health Rights',
  'Hospital Infection Control', 'Maternal & Child Health',
  'Oncology & Cancer Care', 'Rural & Primary Healthcare', 'Other',
];

const RESEARCHER_TYPES = [
  'Academic Researcher', 'Independent Researcher', 'PhD Scholar',
  'Post-Doctoral Researcher', 'Medical Professional Researcher',
  'Legal Researcher', 'Policy Researcher', 'NGO / Think Tank Researcher',
];

const researcherSchema = new mongoose.Schema({
  // Personal
  full_name:  { type: String, required: true, trim: true },
  email:      { type: String, required: true, lowercase: true, trim: true },
  phone:      { type: String, trim: true },
  photo_url:  { type: String },

  // Professional
  researcher_type:   { type: String, enum: RESEARCHER_TYPES },
  institution:       { type: String, trim: true },   // university / hospital / org
  department:        { type: String, trim: true },
  designation:       { type: String, trim: true },   // e.g. Assistant Professor
  qualification:     { type: String, trim: true },   // MBBS, LLB, MPH, PhD etc.
  orcid:             { type: String, trim: true },
  research_domains:  { type: [String], default: [] }, // from RESEARCH_DOMAINS
  experience_years:  { type: Number, min: 0 },

  // Location
  city:  { type: String, trim: true },
  state: { type: String, trim: true },

  // Profile
  biography:          { type: String },
  current_research:   { type: String },  // what they are currently working on
  publications:       { type: String },  // notable publications / list
  website:            { type: String, trim: true },
  linkedin:           { type: String, trim: true },
  google_scholar:     { type: String, trim: true },
  researchgate:       { type: String, trim: true },
  languages:          { type: [String], default: ['English'] },

  // Intent
  areas_of_interest:  { type: [String], default: [] },
  how_can_help:       { type: String, required: true },
  open_to_collaborate:{ type: Boolean, default: true },

  // Moderation
  status:      { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  verified:    { type: Boolean, default: false },
  featured:    { type: Boolean, default: false },
  admin_notes: { type: String },
}, { timestamps: true, collection: 'researchers' });

researcherSchema.index({ email: 1 }, { unique: true });
researcherSchema.index({ status: 1, createdAt: -1 });
researcherSchema.index({ research_domains: 1, status: 1 });
researcherSchema.index({ verified: 1, status: 1 });
researcherSchema.index({ institution: 1 });

module.exports = mongoose.model('Researcher', researcherSchema);
module.exports.RESEARCH_DOMAINS = RESEARCH_DOMAINS;
module.exports.RESEARCHER_TYPES = RESEARCHER_TYPES;
