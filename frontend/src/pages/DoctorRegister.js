import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import { getApiUrl } from '@/config/env';

const API = getApiUrl();

const SPECIALIZATIONS = [
  'General Medicine', 'General Surgery', 'Obstetrics & Gynaecology', 'Paediatrics',
  'Orthopaedics', 'Cardiology', 'Cardiothoracic Surgery', 'Neurology', 'Neurosurgery',
  'Oncology', 'Oncosurgery', 'Radiology', 'Anaesthesiology', 'Pathology',
  'Dermatology', 'Psychiatry', 'Ophthalmology', 'ENT', 'Urology', 'Nephrology',
  'Gastroenterology', 'Pulmonology', 'Endocrinology', 'Rheumatology',
  'Plastic Surgery', 'Vascular Surgery', 'Emergency Medicine', 'ICU & Critical Care',
  'Public Health', 'Forensic Medicine', 'Medical Ethics', 'Other',
];

const LANGUAGES = [
  'English', 'Hindi', 'Bengali', 'Telugu', 'Marathi', 'Tamil', 'Urdu',
  'Gujarati', 'Kannada', 'Malayalam', 'Odia', 'Punjabi', 'Assamese',
];

const INDIAN_COUNCILS = [
  'Medical Council of India (MCI/NMC)', 'Andhra Pradesh Medical Council',
  'Assam Medical Council', 'Bihar Medical Council', 'Delhi Medical Council',
  'Goa Medical Council', 'Gujarat Medical Council', 'Haryana Medical Council',
  'Himachal Pradesh Medical Council', 'Jharkhand Medical Council',
  'Karnataka Medical Council', 'Kerala Medical Council',
  'Madhya Pradesh Medical Council', 'Maharashtra Medical Council',
  'Manipur Medical Council', 'Orissa Council of Medical Registration',
  'Punjab Medical Council', 'Rajasthan Medical Council',
  'Tamil Nadu Medical Council', 'Telangana State Medical Council',
  'Uttar Pradesh Medical Council', 'West Bengal Medical Council', 'Other',
];

const AVAILABILITY = [
  { value: 'available', label: 'Available for consultation / collaboration' },
  { value: 'limited',   label: 'Limited availability' },
  { value: 'unavailable', label: 'Not currently available' },
];

const EMPTY = {
  full_name: '', email: '', phone: '',
  qualification: '', medical_council_reg: '', medical_council_state: '',
  specialization: '', sub_specialization: '', experience_years: '',
  hospital: '', clinic: '', city: '', state: '',
  research_interests: '',
  publications: '', orcid: '',
  biography: '', website: '', linkedin: '',
  availability: 'available',
  consent_not_reviewer: false,
};

const DoctorRegister = () => {
  const navigate = useNavigate();
  const [form, setForm]       = useState(EMPTY);
  const [languages, setLanguages] = useState(['English']);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone]       = useState(false);

  const set = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const toggleLang = lang =>
    setLanguages(prev => prev.includes(lang) ? prev.filter(l => l !== lang) : [...prev, lang]);

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.consent_not_reviewer) {
      toast.error('You must confirm the consent declaration before submitting.');
      return;
    }
    if (languages.length === 0) {
      toast.error('Please select at least one language.');
      return;
    }
    setSubmitting(true);
    try {
      await axios.post(`${API}/doctors/register`, {
        ...form,
        experience_years: Number(form.experience_years),
        languages,
        research_interests: form.research_interests
          ? form.research_interests.split(',').map(s => s.trim()).filter(Boolean)
          : [],
      });
      setDone(true);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to submit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-xl p-10 max-w-md w-full text-center shadow-sm border border-slate-200">
          <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Registration Submitted</h2>
          <p className="text-slate-600 mb-6">
            Thank you for registering with VOICE. Our team will review your profile and credentials.
            You will be notified once approved and your profile goes live in the doctor directory.
          </p>
          <button onClick={() => navigate('/')} className="bg-slate-900 text-white px-6 py-2 rounded-md text-sm font-medium hover:bg-slate-700">
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const Field = ({ label, required, children }) => (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  );

  const Input = ({ field, type = 'text', placeholder, ...rest }) => (
    <input
      type={type}
      value={form[field]}
      onChange={e => set(field, e.target.value)}
      placeholder={placeholder}
      className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
      {...rest}
    />
  );

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Doctor Registration</h1>
          <p className="text-slate-500 mt-1">
            Register as a medical professional to support VOICE's mission of healthcare accountability.
            Your profile will be reviewed before appearing in the directory.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">

          {/* Personal information */}
          <section className="bg-white rounded-xl p-6 border border-slate-200 space-y-4">
            <h2 className="font-semibold text-slate-800 text-lg border-b border-slate-100 pb-2">Personal Information</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Full Name" required>
                <Input field="full_name" placeholder="Dr. Firstname Lastname" required />
              </Field>
              <Field label="Email Address" required>
                <Input field="email" type="email" placeholder="doctor@example.com" required />
              </Field>
              <Field label="Phone Number">
                <Input field="phone" type="tel" placeholder="+91 98765 43210" />
              </Field>
            </div>
          </section>

          {/* Medical credentials */}
          <section className="bg-white rounded-xl p-6 border border-slate-200 space-y-4">
            <h2 className="font-semibold text-slate-800 text-lg border-b border-slate-100 pb-2">Medical Credentials</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Qualification" required>
                <Input field="qualification" placeholder="e.g. MBBS, MS, MD, DNB" required />
              </Field>
              <Field label="Medical Council Registration No." required>
                <Input field="medical_council_reg" placeholder="Reg. number" required />
              </Field>
              <Field label="Medical Council / State Council">
                <select
                  value={form.medical_council_state}
                  onChange={e => set('medical_council_state', e.target.value)}
                  className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                >
                  <option value="">Select Council</option>
                  {INDIAN_COUNCILS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </Field>
              <Field label="Years of Experience" required>
                <Input field="experience_years" type="number" min="0" max="70" placeholder="e.g. 12" required />
              </Field>
              <Field label="Specialization" required>
                <select
                  value={form.specialization}
                  onChange={e => set('specialization', e.target.value)}
                  required
                  className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                >
                  <option value="">Select specialization</option>
                  {SPECIALIZATIONS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </Field>
              <Field label="Sub-specialization / Area of focus">
                <Input field="sub_specialization" placeholder="e.g. Interventional Cardiology" />
              </Field>
            </div>
          </section>

          {/* Practice */}
          <section className="bg-white rounded-xl p-6 border border-slate-200 space-y-4">
            <h2 className="font-semibold text-slate-800 text-lg border-b border-slate-100 pb-2">Practice Details</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Hospital / Institution">
                <Input field="hospital" placeholder="e.g. AIIMS New Delhi" />
              </Field>
              <Field label="Clinic Name">
                <Input field="clinic" placeholder="Private clinic name (if any)" />
              </Field>
              <Field label="City">
                <Input field="city" placeholder="City" />
              </Field>
              <Field label="State">
                <Input field="state" placeholder="State" />
              </Field>
            </div>
          </section>

          {/* Research & Academic */}
          <section className="bg-white rounded-xl p-6 border border-slate-200 space-y-4">
            <h2 className="font-semibold text-slate-800 text-lg border-b border-slate-100 pb-2">Research & Academic</h2>
            <Field label="Research Interests (comma-separated)">
              <Input field="research_interests" placeholder="e.g. Patient Safety, Medical Ethics, Cardiothoracic outcomes" />
            </Field>
            <Field label="Publications / Notable Work">
              <textarea
                value={form.publications}
                onChange={e => set('publications', e.target.value)}
                rows={3}
                placeholder="List key publications, research papers, or achievements…"
                className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
              />
            </Field>
            <Field label="ORCID iD">
              <Input field="orcid" placeholder="e.g. 0000-0002-1825-0097" />
            </Field>
          </section>

          {/* Profile */}
          <section className="bg-white rounded-xl p-6 border border-slate-200 space-y-4">
            <h2 className="font-semibold text-slate-800 text-lg border-b border-slate-100 pb-2">Public Profile</h2>
            <Field label="Biography">
              <textarea
                value={form.biography}
                onChange={e => set('biography', e.target.value)}
                rows={4}
                placeholder="A brief professional biography for the public directory…"
                className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
              />
            </Field>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Languages</label>
              <div className="flex flex-wrap gap-2">
                {LANGUAGES.map(lang => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => toggleLang(lang)}
                    className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                      languages.includes(lang)
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Website">
                <Input field="website" type="url" placeholder="https://" />
              </Field>
              <Field label="LinkedIn Profile URL">
                <Input field="linkedin" type="url" placeholder="https://linkedin.com/in/..." />
              </Field>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Availability for collaboration</label>
              <div className="space-y-2">
                {AVAILABILITY.map(opt => (
                  <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="availability"
                      value={opt.value}
                      checked={form.availability === opt.value}
                      onChange={() => set('availability', opt.value)}
                      className="text-slate-800"
                    />
                    <span className="text-sm text-slate-700">{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </section>

          {/* Consent */}
          <section className="bg-amber-50 rounded-xl p-6 border border-amber-200">
            <h2 className="font-semibold text-amber-900 text-lg mb-3">Important Declaration</h2>
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.consent_not_reviewer}
                onChange={e => set('consent_not_reviewer', e.target.checked)}
                className="mt-0.5 h-4 w-4 flex-shrink-0"
              />
              <span className="text-sm text-amber-900">
                <strong>I confirm that I am registering as a medical professional to support VOICE's mission of medical negligence awareness and patient safety — and NOT as a reviewer, assessor, or evaluator of any specific hospital, clinic, or healthcare institution.</strong>{' '}
                VOICE does not endorse individual hospitals, and I understand that my profile will appear in a public directory for awareness and outreach purposes only.
              </span>
            </label>
          </section>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-slate-900 text-white py-3 rounded-md font-medium hover:bg-slate-700 disabled:opacity-50 transition-colors"
          >
            {submitting ? 'Submitting…' : 'Submit Registration'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default DoctorRegister;
