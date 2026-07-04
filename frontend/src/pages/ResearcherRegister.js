import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import { FlaskConical } from 'lucide-react';
import { getApiUrl } from '@/config/env';

const API = getApiUrl();

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

const LANGUAGES = [
  'English', 'Hindi', 'Bengali', 'Telugu', 'Marathi', 'Tamil', 'Urdu',
  'Gujarati', 'Kannada', 'Malayalam', 'Odia', 'Punjabi', 'Assamese',
];

const COLLAB_AREAS = [
  'Joint research / co-authorship',
  'Data sharing and analysis',
  'Expert review of VOICE resources',
  'Advisory on healthcare policy',
  'Case documentation methodology',
  'Training and workshops for VOICE team',
  'Survey design and implementation',
  'Legal-medical expert commentary',
];

const EMPTY = {
  full_name: '', email: '', phone: '',
  researcher_type: '', institution: '', department: '',
  designation: '', qualification: '', orcid: '',
  experience_years: '', city: '', state: '',
  biography: '', current_research: '', publications: '',
  website: '', linkedin: '', google_scholar: '', researchgate: '',
  how_can_help: '',
  open_to_collaborate: true,
};

const ChipGroup = ({ items, selected, onToggle }) => (
  <div className="flex flex-wrap gap-2">
    {items.map(item => (
      <button
        key={item}
        type="button"
        onClick={() => onToggle(item)}
        className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
          selected.includes(item)
            ? 'bg-slate-900 text-white border-slate-900'
            : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
        }`}
      >
        {item}
      </button>
    ))}
  </div>
);

const ResearcherRegister = () => {
  const navigate = useNavigate();
  const [form, setForm]                   = useState(EMPTY);
  const [research_domains, setDomains]    = useState([]);
  const [languages, setLanguages]         = useState(['English']);
  const [areas_of_interest, setAreas]     = useState([]);
  const [submitting, setSubmitting]       = useState(false);
  const [done, setDone]                   = useState(false);

  const set = (field, val) => setForm(prev => ({ ...prev, [field]: val }));
  const toggle = (arr, setArr, val) =>
    setArr(prev => prev.includes(val) ? prev.filter(x => x !== val) : [...prev, val]);

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.how_can_help.trim()) { toast.error('Please describe how you can help'); return; }
    setSubmitting(true);
    try {
      await axios.post(`${API}/researchers/register`, {
        ...form,
        experience_years: form.experience_years !== '' ? Number(form.experience_years) : undefined,
        research_domains,
        languages,
        areas_of_interest,
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
            Thank you for registering with VOICE. Our team will review your profile before it appears in the researcher directory.
          </p>
          <button onClick={() => navigate('/')} className="bg-slate-900 text-white px-6 py-2 rounded-md text-sm font-medium hover:bg-slate-700">
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const textInput = (field, label, placeholder, required = false, type = 'text') => (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        value={form[field]}
        onChange={e => set(field, e.target.value)}
        placeholder={placeholder}
        required={required}
        className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-2">
          <FlaskConical className="h-7 w-7 text-slate-700" />
          <h1 className="text-3xl font-bold text-slate-900">Researcher Registration</h1>
        </div>
        <p className="text-slate-500 mb-8">
          Register as a researcher or academic to collaborate with VOICE on evidence-based healthcare accountability work.
          Your profile will be reviewed before appearing in the directory.
        </p>

        <form onSubmit={handleSubmit} className="space-y-8">

          {/* Personal */}
          <section className="bg-white rounded-xl p-6 border border-slate-200 space-y-4">
            <h2 className="font-semibold text-slate-800 text-lg border-b border-slate-100 pb-2">Personal Information</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {textInput('full_name', 'Full Name', 'Your full name', true)}
              {textInput('email', 'Email Address', 'researcher@university.ac.in', true, 'email')}
              {textInput('phone', 'Phone Number', '+91 98765 43210', false, 'tel')}
            </div>
          </section>

          {/* Professional */}
          <section className="bg-white rounded-xl p-6 border border-slate-200 space-y-4">
            <h2 className="font-semibold text-slate-800 text-lg border-b border-slate-100 pb-2">Professional Details</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Researcher Type</label>
                <select
                  value={form.researcher_type}
                  onChange={e => set('researcher_type', e.target.value)}
                  className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                >
                  <option value="">Select type</option>
                  {RESEARCHER_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              {textInput('qualification', 'Qualification', 'e.g. MBBS, LLB, MPH, PhD')}
              {textInput('institution', 'Institution / University / Organisation', 'e.g. AIIMS, IIT Bombay, WHO India')}
              {textInput('department', 'Department', 'e.g. Community Medicine, Health Policy')}
              {textInput('designation', 'Designation / Title', 'e.g. Assistant Professor, Senior Researcher')}
              {textInput('experience_years', 'Years of Research Experience', 'e.g. 6', false, 'number')}
              {textInput('orcid', 'ORCID iD', '0000-0002-1825-0097')}
              {textInput('city', 'City', 'City')}
              {textInput('state', 'State', 'State')}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Research Domains</label>
              <ChipGroup items={RESEARCH_DOMAINS} selected={research_domains} onToggle={v => toggle(research_domains, setDomains, v)} />
            </div>
          </section>

          {/* Academic Profile */}
          <section className="bg-white rounded-xl p-6 border border-slate-200 space-y-4">
            <h2 className="font-semibold text-slate-800 text-lg border-b border-slate-100 pb-2">Academic Profile</h2>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Biography</label>
              <textarea
                value={form.biography}
                onChange={e => set('biography', e.target.value)}
                rows={3}
                placeholder="Brief professional biography for the public directory…"
                className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Current Research / Ongoing Projects</label>
              <textarea
                value={form.current_research}
                onChange={e => set('current_research', e.target.value)}
                rows={3}
                placeholder="Describe your current research focus or ongoing projects relevant to healthcare accountability…"
                className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Notable Publications</label>
              <textarea
                value={form.publications}
                onChange={e => set('publications', e.target.value)}
                rows={3}
                placeholder="List key publications, papers, reports, or books…"
                className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Languages</label>
              <ChipGroup items={LANGUAGES} selected={languages} onToggle={v => toggle(languages, setLanguages, v)} />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {textInput('website', 'Personal / Lab Website', 'https://', false, 'url')}
              {textInput('linkedin', 'LinkedIn Profile', 'https://linkedin.com/in/...', false, 'url')}
              {textInput('google_scholar', 'Google Scholar Profile', 'https://scholar.google.com/...', false, 'url')}
              {textInput('researchgate', 'ResearchGate Profile', 'https://www.researchgate.net/...', false, 'url')}
            </div>
          </section>

          {/* Collaboration intent */}
          <section className="bg-white rounded-xl p-6 border border-slate-200 space-y-4">
            <h2 className="font-semibold text-slate-800 text-lg border-b border-slate-100 pb-2">Collaboration Intent</h2>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Areas of Interest for Collaboration</label>
              <div className="space-y-2">
                {COLLAB_AREAS.map(area => (
                  <label key={area} className="flex items-start gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={areas_of_interest.includes(area)}
                      onChange={() => toggle(areas_of_interest, setAreas, area)}
                      className="mt-0.5 flex-shrink-0"
                    />
                    <span className="text-sm text-slate-700">{area}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                How can you contribute to VOICE? <span className="text-red-500">*</span>
              </label>
              <textarea
                value={form.how_can_help}
                onChange={e => set('how_can_help', e.target.value)}
                required
                rows={4}
                placeholder="Describe how your research expertise can support VOICE's mission — data analysis, expert review, policy advisory, joint research, etc."
                className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
              />
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.open_to_collaborate}
                onChange={e => set('open_to_collaborate', e.target.checked)}
                className="h-4 w-4"
              />
              <span className="text-sm text-slate-700">I am open to collaboration requests from other researchers and VOICE</span>
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

export default ResearcherRegister;
