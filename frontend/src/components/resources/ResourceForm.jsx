import React from 'react';
import { X, Upload, CheckCircle2, Loader2 } from 'lucide-react';
import { CATEGORIES, JUDGMENT_CATEGORIES, CITATION_CATEGORIES, CATEGORY_META } from './resourceConstants';
import { SectionLabel, FieldInput, FieldTextarea, RichField, SectionHeading, CategoryBadge } from './ResourceFormFields';

const ResourceForm = ({
  formData,
  set,
  errors,
  editingResource,
  saving,
  pdfUploading,
  onSave,
  onCancel,
  handlePdfUpload,
  setFormData,
}) => {
  const isJudgmentType  = JUDGMENT_CATEGORIES.has(formData.category);
  const hasCitationType = CITATION_CATEGORIES.has(formData.category);
  const currentMeta     = CATEGORY_META[formData.category] || CATEGORY_META['Other'];

  return (
    <div className="border border-slate-200 rounded-xl bg-white shadow-sm mb-8 overflow-hidden">

      {/* Form header */}
      <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <h2 className="font-semibold text-slate-800">
            {editingResource ? 'Edit' : 'New'} Resource
          </h2>
          <CategoryBadge category={formData.category} />
        </div>
        <button onClick={onCancel} className="text-slate-400 hover:text-slate-600">
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="p-6 space-y-6">

        {/* § 1 Identity */}
        <div>
          <SectionHeading mark="§ 1">Identity</SectionHeading>
          <div className="grid md:grid-cols-2 gap-4">

            <div className="md:col-span-2">
              <SectionLabel required>Title</SectionLabel>
              <input
                type="text"
                placeholder={
                  formData.category === 'Judgment'           ? '' :
                  formData.category === 'Article'            ? 'e.g. Understanding Medical Negligence Law' :
                  formData.category === 'RTI Template'       ? 'e.g. RTI Application for Hospital Records' :
                  formData.category === 'Legal Notice'       ? 'e.g. Legal Notice to Hospital for Negligence' :
                  formData.category === 'Consumer Complaint' ? 'e.g. Consumer Complaint against Nursing Home' :
                  'Title of this resource'
                }
                className={`w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 ${
                  errors.title ? 'border-red-400' : 'border-slate-300'
                }`}
                value={formData.title}
                onChange={set('title')}
              />
              {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
            </div>

            <div>
              <SectionLabel>Category</SectionLabel>
              <select
                className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                value={formData.category}
                onChange={set('category')}
              >
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <p className="text-xs text-slate-400 mt-1">{currentMeta.hint}</p>
            </div>

            <FieldInput
              label="Author / Editor"
              placeholder=""
              value={formData.author}
              onChange={set('author')}
            />

            {hasCitationType && (
              <>
                <FieldInput
                  label="Citation"
                  placeholder=""
                  value={formData.citation}
                  onChange={set('citation')}
                />
                <FieldInput
                  label="Court"
                  placeholder=""
                  value={formData.court}
                  onChange={set('court')}
                />
                <div>
                  <SectionLabel>Judgment Date</SectionLabel>
                  <input
                    type="date"
                    className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                    value={formData.judgmentDate}
                    onChange={set('judgmentDate')}
                  />
                </div>
              </>
            )}

            <FieldInput
              label="Tags (comma-separated)"
              placeholder="medical negligence, criminal, IPC 304A"
              value={formData.tags}
              onChange={set('tags')}
            />
          </div>
        </div>

        {/* § 2 Summary */}
        <div>
          <SectionHeading mark="§ 2">Summary</SectionHeading>
          <FieldTextarea
            label={
              formData.category === 'Judgment'           ? 'Brief summary shown on listing cards' :
              formData.category === 'RTI Template'       ? 'What this template is used for' :
              formData.category === 'Legal Notice'       ? 'What this notice template covers' :
              formData.category === 'Consumer Complaint' ? 'What this complaint template covers' :
              'Brief description shown on listing cards'
            }
            rows={3}
            placeholder="Write a short 2–3 sentence description..."
            value={formData.summary}
            onChange={set('summary')}
          />
        </div>

        {/* § 2b Instructions — Templates only */}
        {['RTI Template', 'Legal Notice', 'Consumer Complaint'].includes(formData.category) && (
          <div>
            <SectionHeading mark="§ 2b">How to Use This Template</SectionHeading>
            <FieldTextarea
              label="Step-by-step instructions for the victim"
              rows={5}
              placeholder={
                formData.category === 'Legal Notice'
                  ? "e.g.\n1. Fill in your name, address and contact details in the [BRACKETS].\n2. Fill in the hospital/doctor details.\n3. Describe the incident briefly in the space provided.\n4. Print on plain paper and sign.\n5. Send via Registered Post (RPAD) to the hospital address.\n6. Keep the postal receipt as proof of delivery.\n7. Hospital has 15-30 days to respond before you can approach Consumer Court."
                  : formData.category === 'Consumer Complaint'
                  ? "e.g.\n1. Fill in all [BRACKETED] fields with your details.\n2. Attach copies of: medical records, hospital bills, discharge summary, legal notice copy, postal receipts.\n3. File in the District Consumer Commission for claims up to ₹50 Lakhs.\n4. Pay the prescribed court fee (nominal, based on claim amount).\n5. Keep three copies — one for yourself, two for the court."
                  : "e.g.\n1. Download this template.\n2. Fill in the required details.\n3. Submit to the relevant authority."
              }
              value={formData.instructions}
              onChange={set('instructions')}
            />
          </div>
        )}

        {/* § 3 Legal Sections — Judgments only */}
        {isJudgmentType && (
          <div>
            <SectionHeading mark="§ 3">Legal Sections</SectionHeading>
            <div className="space-y-4">
              <RichField label="Facts" value={formData.facts} onChange={set('facts')} placeholder="Background facts of the case..." />
              <RichField label="Issues" value={formData.issues} onChange={set('issues')} placeholder="Legal issues framed by the court..." />
              <RichField label="Ratio Decidendi" value={formData.ratio} onChange={set('ratio')} placeholder="The legal reasoning / ratio of the decision..." />
              <RichField label="Held" value={formData.held} onChange={set('held')} placeholder="What the court held..." />
              <RichField label="Relevance to Medical Negligence" value={formData.relevance} onChange={set('relevance')} placeholder="Why this judgment matters for medical negligence cases..." />
            </div>
          </div>
        )}

        {/* § 4 Full Content */}
        <div>
          <SectionHeading mark={isJudgmentType ? '§ 4' : '§ 3'}>
            {
              formData.category === 'Judgment'           ? 'Full Analysis' :
              formData.category === 'Case Analysis'      ? 'Detailed Analysis' :
              formData.category === 'Article'            ? 'Article Body' :
              formData.category === 'RTI Template'       ? 'Template Text' :
              formData.category === 'Legal Notice'       ? 'Notice Template Text' :
              formData.category === 'Consumer Complaint' ? 'Complaint Template Text' :
              'Content'
            }
          </SectionHeading>
          <RichField
            label={
              formData.category === 'RTI Template'       ? 'Full RTI application template (use headings, bullet lists)' :
              formData.category === 'Legal Notice'       ? 'Full notice template text' :
              formData.category === 'Consumer Complaint' ? 'Full complaint template text' :
              'Full content'
            }
            value={formData.content}
            onChange={set('content')}
            placeholder="Enter the full content here..."
          />
        </div>

        {/* § 5 Documents & Links */}
        <div>
          <SectionHeading mark={isJudgmentType ? '§ 5' : '§ 4'}>Documents & Links</SectionHeading>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <SectionLabel>PDF</SectionLabel>
              <div className="space-y-2">
                <label className={`flex items-center gap-2 w-full border border-dashed rounded-md px-3 py-2 text-sm cursor-pointer transition-colors ${
                  pdfUploading ? 'opacity-60 pointer-events-none' : 'border-slate-300 hover:border-amber-400 hover:bg-amber-50'
                }`}>
                  {pdfUploading
                    ? <><Loader2 className="h-4 w-4 animate-spin text-slate-400" /> Uploading…</>
                    : formData.pdfUrl
                      ? <><CheckCircle2 className="h-4 w-4 text-green-500" /> PDF attached — replace</>
                      : <><Upload className="h-4 w-4 text-slate-400" /> Upload PDF file</>
                  }
                  <input type="file" accept="application/pdf,.pdf" className="hidden" onChange={handlePdfUpload} />
                </label>
                <input
                  type="text"
                  placeholder="or paste external URL…"
                  className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                  value={formData.pdfUrl}
                  onChange={set('pdfUrl')}
                />
                {formData.pdfUrl && (
                  <button type="button" onClick={() => setFormData(p => ({ ...p, pdfUrl: '' }))}
                    className="text-xs text-red-500 hover:underline">
                    Remove PDF
                  </button>
                )}
              </div>
            </div>
            <FieldInput
              label={formData.category === 'Judgment' ? 'External Link (e.g. Indian Kanoon)' : 'External Link'}
              placeholder="https://indiankanoon.org/..."
              value={formData.externalLink}
              onChange={set('externalLink')}
            />
          </div>
        </div>

        {/* Visibility */}
        <div>
          <SectionHeading>Visibility</SectionHeading>
          <div className="flex flex-wrap gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 accent-slate-800" checked={formData.published} onChange={set('published')} />
              <span className="text-sm text-slate-700">Published (visible to public)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 accent-amber-600" checked={formData.featured} onChange={set('featured')} />
              <span className="text-sm text-slate-700">Featured</span>
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3 pt-2 border-t border-slate-100">
          <button
            onClick={onSave}
            disabled={saving}
            className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2 rounded-md text-sm font-medium hover:bg-slate-700 disabled:opacity-60 transition-colors"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            {editingResource ? 'Update Resource' : 'Save Resource'}
          </button>
          <button
            onClick={onCancel}
            className="px-5 py-2 rounded-md text-sm font-medium border border-slate-300 text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
        </div>

      </div>
    </div>
  );
};

export default ResourceForm;
