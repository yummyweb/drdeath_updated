'use strict';

const mongoose = require('mongoose');

const EVENT_TYPES = [
  'Conference', 'Webinar', 'Workshop', 'Seminar',
  'Public Hearing', 'Awareness Campaign', 'Press Conference',
  'Legal Aid Camp', 'Support Group Meeting', 'Training', 'Other',
];

const EVENT_FORMATS = ['In-person', 'Online', 'Hybrid'];

const eventSchema = new mongoose.Schema({
  title:       { type: String, required: true, trim: true },
  slug:        { type: String, required: true, unique: true, lowercase: true, trim: true },
  description: { type: String, required: true },
  event_type:  { type: String, enum: EVENT_TYPES, required: true },
  format:      { type: String, enum: EVENT_FORMATS, required: true },

  // Timing
  date:      { type: Date, required: true },
  end_date:  { type: Date },
  time:      { type: String, trim: true },   // e.g. "10:00 AM – 5:00 PM IST"

  // Location
  venue:   { type: String, trim: true },
  address: { type: String, trim: true },
  city:    { type: String, trim: true },
  state:   { type: String, trim: true },

  // Online
  online_link: { type: String, trim: true },

  // Organiser
  organizer:       { type: String, trim: true },
  organizer_email: { type: String, trim: true, lowercase: true },
  organizer_phone: { type: String, trim: true },

  // Programme
  speakers: [{
    name:        { type: String, trim: true },
    designation: { type: String, trim: true },
    bio:         { type: String },
  }],
  agenda: { type: String },

  // Registration
  registration_required:  { type: Boolean, default: false },
  registration_link:      { type: String, trim: true },
  registration_deadline:  { type: Date },
  max_attendees:          { type: Number },

  // Pricing
  is_free: { type: Boolean, default: true },
  fee:     { type: Number, default: 0 },

  // Meta
  tags:      { type: [String], default: [] },
  image_url: { type: String },
  featured:  { type: Boolean, default: false },
  status:    { type: String, enum: ['draft', 'published', 'cancelled', 'completed'], default: 'draft' },
  published: { type: Boolean, default: false },

  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true, collection: 'events' });

// slug unique index already declared via `unique: true` on the field — no duplicate needed
eventSchema.index({ status: 1, date: 1 });
eventSchema.index({ published: 1, date: 1 });
eventSchema.index({ featured: 1, date: 1 });
eventSchema.index({ event_type: 1, published: 1 });
eventSchema.index({ tags: 1 });

module.exports = mongoose.model('Event', eventSchema);
module.exports.EVENT_TYPES  = EVENT_TYPES;
module.exports.EVENT_FORMATS = EVENT_FORMATS;
