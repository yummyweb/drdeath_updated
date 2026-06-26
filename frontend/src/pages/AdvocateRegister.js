import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Scale, Briefcase } from 'lucide-react';
import { toast } from 'sonner';
import { getApiUrl } from '@/config/env';

const API = getApiUrl();

const SPECIALIZATIONS = [
  'Medical Negligence', 'Consumer Protection', 'Healthcare Law',
  'Civil Litigation', 'Criminal Law', 'Insurance Claims',
  'Human Rights', 'Constitutional Law', 'Family Law', 'Labour Law',
  'Arbitration & Mediation', 'Supreme Court Practice', 'High Court Practice',
  'Patient Rights', 'Pharmaceutical Liability',
];

const COURT_TYPES = [
  'Supreme Court', 'High Court', 'District Court', 'Consumer Forum',
  'National Consumer Disputes Redressal Commission (NCDRC)',
  'State Consumer Disputes Redressal Commission (SCDRC)',
  'District Consumer Disputes Redressal Commission (DCDRC)',
  'Medical Council Proceedings', 'Medico-Legal Arbitration',
];

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Chandigarh',
];

const BAR_COUNCILS = [
  'Bar Council of India', 'Bar Council of Andhra Pradesh & Telangana',
  'Bar Council of Assam, Nagaland, Meghalaya, Manipur, Tripura, Mizoram & Arunachal Pradesh',
  'Bar Council of Bihar', 'Bar Council of Chhattisgarh', 'Bar Council of Delhi',
  'Bar Council of Gujarat', 'Bar Council of Himachal Pradesh', 'Bar Council of Jharkhand',
  'Bar Council of Karnataka', 'Bar Council of Kerala', 'Bar Council of Madhya Pradesh',
  'Bar Council of Maharashtra & Goa', 'Bar Council of Odisha', 'Bar Council of Punjab & Haryana',
  'Bar Council of Rajasthan', 'Bar Council of Tamil Nadu & Puducherry',
  'Bar Council of Uttar Pradesh', 'Bar Council of Uttarakhand', 'Bar Council of West Bengal',
];

const LANGUAGES = [
  'English', 'Hindi', 'Bengali', 'Telugu', 'Marathi', 'Tamil', 'Urdu',
  'Gujarati', 'Kannada', 'Malayalam', 'Odia', 'Punjabi', 'Assamese',
];

const EMPTY = {
  full_name: '', email: '', phone: '',
  bar_council_number: '', bar_council_state: '',
  experience_years: '',
  city: '', state: '',
  about: '', biography: '',
  linkedin: '', website: '',
};

const AdvocateRegister = () => {
  const navigate = useNavigate();
  const [form, setForm]           = useState(EMPTY);
  const [specializations, setSpecs]   = useState([]);
  const [court_types, setCourts]       = useState([]);
  const [areas_of_operation, setAreas] = useState([]);
  const [languages, setLanguages]      = useState(['English', 'Hindi']);
  const [loading, setLoading]     = useState(false);
  const [done, setDone]           = useState(false);

  const set = (field, val) => setForm(prev => ({ ...prev, [field]: val }));

  const toggle = (arr, setArr, val) =>
    setArr(prev => prev.includes(val) ? prev.filter(x => x !== val) : [...prev, val]);

  const handleSubmit = async e => {
    e.preventDefault();
    if (!specializations.length) { toast.error('Select at least one specialization'); return; }
    if (!areas_of_operation.length) { toast.error('Select at least one area of operation'); return; }
    if (!languages.length) { toast.error('Select at least one language'); return; }

    setLoading(true);
    try {
      await axios.post(`${API}/advocates/register`, {
        ...form,
        experience_years: Number(form.experience_years),
        specializations,
        court_types,
        areas_of_operation,
        languages,
      });
      setDone(true);
    } catch (err) {
      toast.error(err.response?.data?.error || err.response?.data?.detail || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
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
            Thank you for registering with VOICE. Our team will review your profile and credentials before
            publishing them in the advocate directory.
          </p>
          <button onClick={() => navigate('/advocates')} className="bg-slate-900 text-white px-6 py-2 rounded-md text-sm font-medium hover:bg-slate-700">
            View Advocate Directory
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

  const CheckGroup = ({ items, selected, onToggle, cols = 2 }) => (
    <div className={`grid grid-cols-${cols} gap-2`}>
      {items.map(item => (
        <label key={item} className="flex items-start gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={selected.includes(item)}
            onChange={() => onToggle(item)}
            className="mt-0.5 flex-shrink-0"
          />
          <span className="text-sm text-slate-700">{item}</span>
        </label>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4" data-testid="advocate-register-page">
      <div className="max-w-3xl mx-auto">

        <div className="flex items-center gap-3 mb-2">
          <Scale className="h-7 w-7 text-slate-700" />
          <h1 className="text-3xl font-bold text-slate-900">Advocate Registration</h1>
        </div>
        <p className="text-slate-500 mb-2">
          Register as a legal professional to support VOICE's mission of medical negligence awareness and victim advocacy.
        </p>
        <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 flex gap-3 mb-8">
          <Briefcase className="h-5 w-5 text-amber-700 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-amber-900">
            By registering, you agree to provide initial consultations on a <strong>pro bono basis</strong>.
            Your profile will be reviewed before appearing in the public directory.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8" data-testid="advocate-register-form">

          {/* Personal */}
          <section className="bg-white rounded-xl p-6 border border-slate-200 space-y-4">
            <h2 className="font-semibold text-slate-800 text-lg border-b border-slate-100 pb-2">Personal Information</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {textInput('full_name', 'Full Name', 'Adv. Firstname Lastname', true)}
              {textInput('email', 'Email Address', 'advocate@email.com', true, 'email')}
              {textInput('phone', 'Phone Number', '+91 98765 43210', true, 'tel')}
            </div>
          </section>

          {/* Bar credentials */}
          <section className="bg-white rounded-xl p-6 border border-slate-200 space-y-4">
            <h2 className="font-semibold text-slate-800 text-lg border-b border-slate-100 pb-2">Bar Council Credentials</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {textInput('bar_council_number', 'Bar Council Enrolment Number', 'e.g. MH/1234/2010', true)}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">State Bar Council</label>
                <select
                  value={form.bar_council_state}
                  onChange={e => set('bar_council_state', e.target.value)}
                  className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                >
                  <option value="">Select Bar Council</option>
                  {BAR_COUNCILS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              {textInput('experience_years', 'Years of Experience', 'e.g. 8', true, 'number')}
            </div>
          </section>

          {/* Specializations */}
          <section className="bg-white rounded-xl p-6 border border-slate-200 space-y-4">
            <h2 className="font-semibold text-slate-800 text-lg border-b border-slate-100 pb-2">
              Specializations <span className="text-red-500">*</span>
            </h2>
            <CheckGroup items={SPECIALIZATIONS} selected={specializations} onToggle={v => toggle(specializations, setSpecs, v)} />
          </section>

          {/* Courts */}
          <section className="bg-white rounded-xl p-6 border border-slate-200 space-y-4">
            <h2 className="font-semibold text-slate-800 text-lg border-b border-slate-100 pb-2">Courts / Forums Practised In</h2>
            <CheckGroup items={COURT_TYPES} selected={court_types} onToggle={v => toggle(court_types, setCourts, v)} cols={1} />
          </section>

          {/* Areas of operation */}
          <section className="bg-white rounded-xl p-6 border border-slate-200 space-y-4">
            <h2 className="font-semibold text-slate-800 text-lg border-b border-slate-100 pb-2">
              Areas of Operation <span className="text-red-500">*</span>
            </h2>
            <div className="grid grid-cols-3 gap-2 max-h-52 overflow-y-auto p-1">
              {INDIAN_STATES.map(s => (
                <label key={s} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={areas_of_operation.includes(s)}
                    onChange={() => toggle(areas_of_operation, setAreas, s)}
                    className="flex-shrink-0"
                  />
                  <span className="text-sm text-slate-700">{s}</span>
                </label>
              ))}
            </div>
          </section>

          {/* Location & profile */}
          <section className="bg-white rounded-xl p-6 border border-slate-200 space-y-4">
            <h2 className="font-semibold text-slate-800 text-lg border-b border-slate-100 pb-2">Practice Location & Profile</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {textInput('city', 'Primary City', 'City')}
              {textInput('state', 'State', 'State')}
              {textInput('linkedin', 'LinkedIn Profile URL', 'https://linkedin.com/in/...', false, 'url')}
              {textInput('website', 'Website / Legal Profile URL', 'https://', false, 'url')}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                About You <span className="text-red-500">*</span>
              </label>
              <textarea
                value={form.about}
                onChange={e => set('about', e.target.value)}
                required
                rows={4}
                placeholder="Describe your experience in medical negligence cases, notable achievements, and why you want to help victims…"
                className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                data-testid="advocate-about-input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Extended Biography (optional)</label>
              <textarea
                value={form.biography}
                onChange={e => set('biography', e.target.value)}
                rows={3}
                placeholder="Additional background for the public directory…"
                className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Languages</label>
              <div className="flex flex-wrap gap-2">
                {LANGUAGES.map(lang => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => toggle(languages, setLanguages, lang)}
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
          </section>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 text-white py-3 rounded-md font-medium hover:bg-slate-700 disabled:opacity-50 transition-colors"
            data-testid="advocate-submit-btn"
          >
            {loading ? 'Submitting…' : 'Submit Registration'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdvocateRegister;
