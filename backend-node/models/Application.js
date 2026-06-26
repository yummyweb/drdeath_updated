'use strict';

const mongoose = require('mongoose');

const APPLICATION_STATUSES = [
  'applied', 'under_review', 'shortlisted', 'interview', 'selected', 'rejected', 'withdrawn',
];

const ApplicationSchema = new mongoose.Schema({
  opportunity: { type: mongoose.Schema.Types.ObjectId, ref: 'Opportunity', required: true },
  applicant:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  // Snapshot of applicant-provided data at time of application
  coverLetter:  { type: String },
  resumeUrl:    { type: String },
  phone:        { type: String },
  linkedIn:     { type: String },
  portfolio:    { type: String },

  status: {
    type: String,
    enum: APPLICATION_STATUSES,
    default: 'applied',
  },

  // Admin-only fields
  adminNotes:  { type: String },
  statusHistory: [{
    status:    String,
    changedAt: { type: Date, default: Date.now },
    note:      String,
  }],
}, { timestamps: true });

// One application per user per opportunity
ApplicationSchema.index({ opportunity: 1, applicant: 1 }, { unique: true });
ApplicationSchema.index({ applicant: 1, createdAt: -1 });
ApplicationSchema.index({ opportunity: 1, status: 1 });

module.exports = mongoose.model('Application', ApplicationSchema);
module.exports.APPLICATION_STATUSES = APPLICATION_STATUSES;
