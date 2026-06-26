const mongoose = require('mongoose');

const ResourceVersionSchema = new mongoose.Schema(
  {
    resourceId: { type: mongoose.Schema.Types.ObjectId, ref: 'LegalResource', required: true, index: true },
    version:    { type: Number, required: true },
    snapshot:   { type: mongoose.Schema.Types.Mixed, required: true },
    editedBy:   { type: String },
    changeNote: { type: String }
  },
  { timestamps: { createdAt: 'savedAt', updatedAt: false } }
);

ResourceVersionSchema.index({ resourceId: 1, version: -1 });

module.exports = mongoose.model('ResourceVersion', ResourceVersionSchema);
