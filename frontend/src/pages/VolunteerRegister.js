import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { getApiUrl } from '@/config/env';

const API = getApiUrl();

const CATEGORIES = [
  'Legal Volunteer', 'Medical Volunteer', 'Research Volunteer', 'Student Volunteer',
  'Translator', 'Graphic Designer', 'Social Media', 'Fundraising',
  'Community Moderator', 'Technology Volunteer',
];

const AVAILABILITY = [
  { value: 'full_time',  label: 'Full-time' },
  { value: 'part_time',  label: 'Part-time' },
  { value: 'weekends',   label: 'Weekends only' },
  { value: 'occasional', label: 'Occasional / As needed' },
];

const COMMON_LANGUAGES = [
  'English', 'Hindi', 'Bengali', 'Telugu', 'Marathi', 'Tamil', 'Urdu',
  'Kannada', 'Odia', 'Malayalam', 'Punjabi', 'Assamese', 'Gujarati',
];

const AREAS = [
  'Legal Awareness', 'RTI Filing', 'Consumer Forum', 'Medical Expert Opinion',
  'Research & Documentation', 'Media & Outreach', 'Case Support', 'Translation',
  'Fundraising', 'Tech / Web', 'Events & Workshops', 'Social Media Management',
  'Graphic Design', 'Community Moderation',
];

const EMPTY = {
  full_name: '', email: '', phone: '', city: '', state: '',
  category: '', profession: '', institution: '', experience_years: '',
  skills: '', languages: [], availability: 'occasional',
  biography: '', linkedin: '', website: '',
  areas_of_interest: [], how_can_help: '',
};

const Field = ({ label, required, error, children }) => (
  <div>
    <label className="block text-sm font-medium text-slate-700 mb-1">
      {label}{required && <span className="text-red-500 ml-1">*</span>}
    </label>
    {children}
    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
  </div>
);

const Input = ({ error, ...props }) => (
  <input
    className={`w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 ${
      error ? 'border-red-400' : 'border-slate-300'
    }`}
    {...props}
  />
);

const VolunteerRegister = () => {
  const [form, setForm]       = useState(EMPTY);
  const [errors, setErrors]   = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted]   = useState(false);

  const set = field => e => {
    const val = e.target.value;
    setForm(prev => ({ ...prev, [field]: val }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }));
  };

  const toggleChip = (field, value) => {
    setForm(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(v => v !== value)
        : [...prev[field], value],
    }));
  };

  const validate = () => {
    const e = {};
    if (!form.full_name.trim())    e.full_name    = 'Name is required';
    if (!form.email.trim())        e.email        = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Invalid email';
    if (!form.category)            e.category     = 'Please select a category';
    if (!form.how_can_help.trim()) e.how_can_help = 'Please describe how you can help';
    return e;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setSubmitting(true);
    try {
      const skills = form.skills
        ? form.skills.split(',').map(s => s.trim()).filter(Boolean)
        : [];

      await axios.post(`${API}/volunteers`, { ...form, skills, experience_years: form.experience_years || undefined });
      setSubmitted(true);
    } catch (err) {
      if (err.response?.status === 409) {
        toast.error('An application with this email already exists.');
      } else {
        toast.error(err.response?.data?.error || 'Submission failed. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center">
          <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <svg className="h-7 w-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Registration Received</h2>
          <p className="text-slate-600 text-sm leading-relaxed">
            Thank you for volunteering with VOICE. Our team will review your profile
            and reach out to you soon.
          </p>
          <button
            onClick={() => { setForm(EMPTY); setSubmitted(false); }}
            className="mt-6 text-sm text-amber-700 hover:underline"
          >
            Submit another registration
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Volunteer With VOICE</h1>
          <p className="text-slate-500 mt-2 text-sm">
            Join our volunteer network. We welcome legal professionals, doctors, researchers,
            students, translators, designers, and more.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 space-y-6">

          {/* Personal */}
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-amber-600 mb-3 pb-1 border-b border-amber-100">Personal Details</p>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Full Name" required error={errors.full_name}>
                <Input placeholder="Your full name" value={form.full_name} onChange={set('full_name')} error={errors.full_name} />
              </Field>
              <Field label="Email" required error={errors.email}>
                <Input type="email" placeholder="you@example.com" value={form.email} onChange={set('email')} error={errors.email} />
              </Field>
              <Field label="Phone">
                <Input type="tel" placeholder="+91 98765 43210" value={form.phone} onChange={set('phone')} />
              </Field>
              <Field label="City">
                <Input placeholder="Your city" value={form.city} onChange={set('city')} />
              </Field>
              <Field label="State">
                <Input placeholder="Your state" value={form.state} onChange={set('state')} />
              </Field>
            </div>
          </div>

          {/* Volunteer Category */}
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-amber-600 mb-3 pb-1 border-b border-amber-100">Volunteer Role</p>
            <Field label="Volunteer Category" required error={errors.category}>
              <select
                className={`w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 ${errors.category ? 'border-red-400' : 'border-slate-300'}`}
                value={form.category}
                onChange={set('category')}
              >
                <option value="">Select a category</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
          </div>

          {/* Professional */}
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-amber-600 mb-3 pb-1 border-b border-amber-100">Professional Background</p>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Current Profession / Designation">
                <Input placeholder="e.g. Advocate, Doctor, Student" value={form.profession} onChange={set('profession')} />
              </Field>
              <Field label="Institution / Organisation">
                <Input placeholder="Current employer or university" value={form.institution} onChange={set('institution')} />
              </Field>
              <Field label="Years of Experience">
                <Input type="number" min="0" placeholder="Years" value={form.experience_years} onChange={set('experience_years')} />
              </Field>
              <Field label="LinkedIn Profile">
                <Input type="url" placeholder="https://linkedin.com/in/…" value={form.linkedin} onChange={set('linkedin')} />
              </Field>
              <div className="sm:col-span-2">
                <Field label="Website / Portfolio">
                  <Input type="url" placeholder="https://…" value={form.website} onChange={set('website')} />
                </Field>
              </div>
            </div>
          </div>

          {/* Skills */}
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-amber-600 mb-3 pb-1 border-b border-amber-100">Skills & Availability</p>
            <div className="space-y-4">
              <Field label="Skills (comma-separated)">
                <Input placeholder="e.g. Legal Research, Hindi Writing, Python, Video Editing" value={form.skills} onChange={set('skills')} />
              </Field>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Languages</label>
                <div className="flex flex-wrap gap-2">
                  {COMMON_LANGUAGES.map(lang => (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => toggleChip('languages', lang)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                        form.languages.includes(lang)
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Availability</label>
                <div className="flex flex-wrap gap-4">
                  {AVAILABILITY.map(a => (
                    <label key={a.value} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="availability"
                        value={a.value}
                        checked={form.availability === a.value}
                        onChange={set('availability')}
                        className="accent-slate-800"
                      />
                      <span className="text-sm text-slate-700">{a.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Areas */}
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-amber-600 mb-3 pb-1 border-b border-amber-100">Areas of Contribution</p>
            <div className="flex flex-wrap gap-2">
              {AREAS.map(area => (
                <button
                  key={area}
                  type="button"
                  onClick={() => toggleChip('areas_of_interest', area)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                    form.areas_of_interest.includes(area)
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {area}
                </button>
              ))}
            </div>
          </div>

          {/* Biography & How to help */}
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-amber-600 mb-3 pb-1 border-b border-amber-100">About You</p>
            <div className="space-y-4">
              <Field label="Brief Biography">
                <textarea
                  rows={3}
                  placeholder="A short introduction about yourself…"
                  className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 leading-relaxed"
                  value={form.biography}
                  onChange={set('biography')}
                />
              </Field>
              <Field label="How would you like to help VOICE?" required error={errors.how_can_help}>
                <textarea
                  rows={4}
                  placeholder="Tell us specifically what you can contribute and why you want to support victims of medical negligence…"
                  className={`w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 leading-relaxed ${errors.how_can_help ? 'border-red-400' : 'border-slate-300'}`}
                  value={form.how_can_help}
                  onChange={set('how_can_help')}
                />
              </Field>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-slate-900 text-white py-3 rounded-md font-medium hover:bg-slate-700 disabled:opacity-60 transition-colors"
          >
            {submitting ? 'Submitting…' : 'Submit Registration'}
          </button>

        </form>
      </div>
    </div>
  );
};

export default VolunteerRegister;
