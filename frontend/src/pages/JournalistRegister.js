import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import { Newspaper } from 'lucide-react';
import { getApiUrl } from '@/config/env';

const API = getApiUrl();

const BEATS = [
  'Health & Medicine', 'Medical Negligence', 'Patient Safety', 'Healthcare Policy',
  'Investigative Health Journalism', 'Pharmaceutical Industry', 'Hospital & Healthcare',
  'Consumer Rights', 'Legal Affairs', 'Science & Research',
  'Public Health', 'Mental Health', 'Medical Ethics', 'General Reporting',
];

const MEDIUM_TYPES = [
  'Print', 'Digital / Online', 'Television', 'Radio',
  'Podcast', 'Documentary', 'Freelance', 'Academic / Research Publication',
];

const LANGUAGES = [
  'English', 'Hindi', 'Bengali', 'Telugu', 'Marathi', 'Tamil', 'Urdu',
  'Gujarati', 'Kannada', 'Malayalam', 'Odia', 'Punjabi', 'Assamese',
];

const AREAS = [
  'Investigative reporting on medical negligence cases',
  'Interviewing victims and families',
  'Covering VOICE events and campaigns',
  'Writing awareness articles / op-eds',
  'Documenting hospital safety standards',
  'Reporting on medical council disciplinary actions',
  'Covering court proceedings in healthcare cases',
  'Research collaboration on healthcare data',
];

const EMPTY = {
  full_name: '', email: '', phone: '',
  publication: '', designation: '', press_card_number: '',
  experience_years: '', city: '', state: '',
  biography: '', notable_work: '',
  website: '', linkedin: '', twitter: '',
  how_can_help: '',
};

const JournalistRegister = () => {
  const navigate = useNavigate();
  const [form, setForm]           = useState(EMPTY);
  const [beats, setBeats]         = useState([]);
  const [medium, setMedium]       = useState([]);
  const [languages, setLanguages] = useState(['English']);
  const [areas, setAreas]         = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone]           = useState(false);

  const set = (field, val) => setForm(prev => ({ ...prev, [field]: val }));
  const toggle = (arr, setArr, val) =>
    setArr(prev => prev.includes(val) ? prev.filter(x => x !== val) : [...prev, val]);

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.how_can_help.trim()) { toast.error('Please describe how you can help'); return; }
    setSubmitting(true);
    try {
      await axios.post(`${API}/journalists/register`, {
        ...form,
        experience_years: form.experience_years !== '' ? Number(form.experience_years) : undefined,
        beats,
        medium,
        languages,
        areas_of_interest: areas,
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
            Thank you for registering with VOICE. Our team will review your profile before it appears in the journalist directory.
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

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-2">
          <Newspaper className="h-7 w-7 text-slate-700" />
          <h1 className="text-3xl font-bold text-slate-900">Journalist Registration</h1>
        </div>
        <p className="text-slate-500 mb-8">
          Register as a journalist or media professional to collaborate with VOICE on healthcare accountability reporting.
          Your profile will be reviewed before appearing in the directory.
        </p>

        <form onSubmit={handleSubmit} className="space-y-8">

          {/* Personal */}
          <section className="bg-white rounded-xl p-6 border border-slate-200 space-y-4">
            <h2 className="font-semibold text-slate-800 text-lg border-b border-slate-100 pb-2">Personal Information</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {textInput('full_name', 'Full Name', 'Your full name', true)}
              {textInput('email', 'Email Address', 'journalist@email.com', true, 'email')}
              {textInput('phone', 'Phone Number', '+91 98765 43210', false, 'tel')}
            </div>
          </section>

          {/* Professional */}
          <section className="bg-white rounded-xl p-6 border border-slate-200 space-y-4">
            <h2 className="font-semibold text-slate-800 text-lg border-b border-slate-100 pb-2">Professional Details</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {textInput('publication', 'Publication / Outlet / Employer', 'e.g. The Hindu, NDTV, Freelance')}
              {textInput('designation', 'Designation / Role', 'e.g. Senior Health Correspondent')}
              {textInput('press_card_number', 'Press Card / Accreditation Number', 'If applicable')}
              {textInput('experience_years', 'Years of Experience', 'e.g. 7', false, 'number')}
              {textInput('city', 'City', 'City')}
              {textInput('state', 'State', 'State')}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Beat / Areas of Reporting</label>
              <ChipGroup items={BEATS} selected={beats} onToggle={v => toggle(beats, setBeats, v)} />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Medium / Format</label>
              <ChipGroup items={MEDIUM_TYPES} selected={medium} onToggle={v => toggle(medium, setMedium, v)} />
            </div>
          </section>

          {/* Profile */}
          <section className="bg-white rounded-xl p-6 border border-slate-200 space-y-4">
            <h2 className="font-semibold text-slate-800 text-lg border-b border-slate-100 pb-2">Public Profile</h2>

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
              <label className="block text-sm font-medium text-slate-700 mb-1">Notable Work / Investigations</label>
              <textarea
                value={form.notable_work}
                onChange={e => set('notable_work', e.target.value)}
                rows={3}
                placeholder="Notable articles, investigations, or healthcare reporting you've done…"
                className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Languages</label>
              <ChipGroup items={LANGUAGES} selected={languages} onToggle={v => toggle(languages, setLanguages, v)} />
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              {textInput('website', 'Website / Portfolio', 'https://', false, 'url')}
              {textInput('linkedin', 'LinkedIn', 'https://linkedin.com/in/...', false, 'url')}
              {textInput('twitter', 'Twitter / X Handle', '@handle')}
            </div>
          </section>

          {/* Intent */}
          <section className="bg-white rounded-xl p-6 border border-slate-200 space-y-4">
            <h2 className="font-semibold text-slate-800 text-lg border-b border-slate-100 pb-2">How You Can Help</h2>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Areas of Interest for Collaboration</label>
              <div className="space-y-2">
                {AREAS.map(area => (
                  <label key={area} className="flex items-start gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={areas.includes(area)}
                      onChange={() => toggle(areas, setAreas, area)}
                      className="mt-0.5 flex-shrink-0"
                    />
                    <span className="text-sm text-slate-700">{area}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Tell us how you can contribute <span className="text-red-500">*</span>
              </label>
              <textarea
                value={form.how_can_help}
                onChange={e => set('how_can_help', e.target.value)}
                required
                rows={4}
                placeholder="Describe your interest in covering medical negligence issues, past experience with health journalism, and how you'd like to collaborate with VOICE…"
                className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
              />
            </div>
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

export default JournalistRegister;
