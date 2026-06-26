const slugify = require('../utils/slugify');
const mongoose = require('mongoose');

const LegalResourceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 500
    },

    slug: {
      type: String,
      unique: true,
      sparse: true,
      trim: true
    },

    resourceType: {
      type: String,
      enum: [
        'Judgment', 'Article', 'Case Analysis', 'Statute', 'Circular',
        'Medical Guideline', 'Research Paper', 'RTI Template',
        'Legal Notice', 'Consumer Complaint', 'FAQ', 'Other'
      ],
      default: 'Judgment'
    },

    category: { type: String, trim: true },

    citation:          { type: String, trim: true },
    equivalentCitation:{ type: String, trim: true },
    multipleCitations: [String],

    court:   { type: String, trim: true },
    bench:   { type: String, trim: true },
    judges:  [String],

    judgmentDate: Date,
    publishedAt:  Date,

    petitioner:  String,
    respondent:  String,
    state:       String,

    acts:     [String],
    sections: [String],

    practiceAreas:     [String],
    medicalSpecialties:[String],
    doctorSpecialties: [String],
    keywords:          [String],
    legalPrinciples:   [String],

    summary:              String,
    facts:                String,
    issues:               String,
    ratio:                String,
    held:                 String,
    relevance:            String,
    arguments:            String,
    findings:             String,
    obiter:               String,
    significance:         String,
    practicalImplications:String,
    content:              String,
    headnotes:            String,
    procedureHistory:     String,
    standardOfCare:       String,
    legalPrinciple:       String,

    overruled:   { type: Boolean, default: false },
    overruledBy: String,
    followedBy:      [String],
    distinguishedBy: [String],
    referredTo:      [String],

    outcome: String,

    author:       String,
    editedBy:     String,
    instructions: String,
    pdfUrl:       String,
    externalLink: String,

    pdfPages:     Number,
    pdfSize:      Number,
    extractedText: String,

    source: {
      name: String,
      type: String,
      url:  String
    },

    tags: [String],

    status: {
      type: String,
      enum: ['Draft', 'Review', 'Published', 'Archived'],
      default: 'Published'
    },

    featured:  { type: Boolean, default: false },
    published: { type: Boolean, default: true },

  },
  {
    timestamps: true
  }
);

// ── Indexes ───────────────────────────────────────────────────────────────────
// Text index for candidate-based duplicate detection and full-text search
LegalResourceSchema.index(
  { title: 'text', citation: 'text', summary: 'text', keywords: 'text', extractedText: 'text' },
  { weights: { title: 10, citation: 8, summary: 3, keywords: 2, extractedText: 1 }, name: 'legal_text_idx' }
);

// Query indexes
LegalResourceSchema.index({ published: 1, createdAt: -1 });
LegalResourceSchema.index({ citation: 1 }, { sparse: true });
LegalResourceSchema.index({ externalLink: 1 }, { sparse: true });
LegalResourceSchema.index({ category: 1, published: 1 });
LegalResourceSchema.index({ featured: 1, published: 1 });
LegalResourceSchema.index({ status: 1 });

module.exports = mongoose.model('LegalResource', LegalResourceSchema);
