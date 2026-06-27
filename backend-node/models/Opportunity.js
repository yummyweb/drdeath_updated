'use strict';

const mongoose = require('mongoose');

const CATEGORIES = [
  'Job', 'Internship', 'Fellowship', 'Volunteer Position',
  'Research Project', 'Expert Invitation', 'Collaborate With VOICE',
];

const EMPLOYMENT_TYPES = ['Full-time', 'Part-time', 'Contract', 'Freelance', 'Unpaid'];
const STATUSES        = ['draft', 'published', 'closed', 'archived'];

const OpportunitySchema = new mongoose.Schema({
  title:           { type: String, required: true, trim: true },
  category:        { type: String, required: true, enum: CATEGORIES },
  department:      { type: String, trim: true },
  description:     { type: String, required: true },
  responsibilities:{ type: String },
  eligibility:     { type: String },
  experience:      { type: String },
  skills:          { type: [String], default: [] },
  employmentType:  { type: String, enum: EMPLOYMENT_TYPES },
  location:        { type: String },
  remote:          { type: String, enum: ['on-site', 'remote', 'hybrid'], default: 'on-site' },
  salary:          { type: String },
  stipend:         { type: String },
  duration:        { type: String },
  lastDate:        { type: Date },
  vacancies:       { type: Number, min: 0 },
  tags:            { type: [String], default: [] },
  attachmentUrl:   { type: String },

  status:    { type: String, enum: STATUSES, default: 'draft' },
  published: { type: Boolean, default: false },
  featured:  { type: Boolean, default: false },

  createdBy: { type: String },
}, { timestamps: true });

OpportunitySchema.index({ status: 1, published: 1, createdAt: -1 });
OpportunitySchema.index({ category: 1, published: 1 });
OpportunitySchema.index({ featured: 1, published: 1 });
OpportunitySchema.index({ tags: 1 });
OpportunitySchema.index({ lastDate: 1 });

module.exports = mongoose.model('Opportunity', OpportunitySchema);
module.exports.CATEGORIES     = CATEGORIES;
module.exports.EMPLOYMENT_TYPES = EMPLOYMENT_TYPES;
