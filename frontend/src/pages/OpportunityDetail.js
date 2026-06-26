import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import { getApiUrl } from '@/config/env';
import { useAuth } from '../context/AuthContext';
import { MapPin, Clock, Users, Briefcase, ArrowLeft, Loader2, ExternalLink } from 'lucide-react';

const API = getApiUrl();

const Field = ({ label, required, children, error }) => (
  <div>
    <label className="block text-sm font-medium text-slate-700 mb-1">
      {label}{required && <span className="text-red-500 ml-1">*</span>}
    </label>
    {children}
    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
  </div>
);

const OpportunityDetail = () => {
  const { id }      = useParams();
  const { user }    = useAuth();
  const navigate    = useNavigate();
  const [opp, setOpp]         = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying]   = useState(false);
  const [showForm, setShowForm]   = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [alreadyApplied, setAlreadyApplied] = useState(false);

  const [form, setForm] = useState({ coverLetter: '', phone: '', linkedIn: '', portfolio: '' });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    axios.get(`${API}/opportunities/${id}`)
      .then(r => setOpp(r.data))
      .catch(() => navigate('/opportunities', { replace: true }))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  // Check if user already applied
  useEffect(() => {
    if (!user) return;
    axios.get(`${API}/my/applications`)
      .then(r => {
        const found = r.data.some(a => a.opportunity?._id === id || a.opportunity === id);
        setAlreadyApplied(found);
      })
      .catch(() => {});
  }, [user, id]);

  const validate = () => {
    const e = {};
    if (!form.coverLetter.trim()) e.coverLetter = 'Please tell us why you are interested';
    return e;
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!user) { navigate('/login'); return; }
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setApplying(true);
    try {
      await axios.post(`${API}/opportunities/${id}/apply`, form);
      setSubmitted(true);
      setAlreadyApplied(true);
      setShowForm(false);
    } catch (err) {
      if (err.response?.status === 409) {
        toast.error('You have already applied for this opportunity.');
        setAlreadyApplied(true);
      } else {
        toast.error(err.response?.data?.error || 'Failed to submit application');
      }
    } finally {
      setApplying(false);
    }
  };

  if (loading) return (
    <div className="flex justify-center py-24 text-slate-400">
      <Loader2 className="h-6 w-6 animate-spin" />
    </div>
  );

  if (!opp) return null;

  const isExpired = opp.lastDate && new Date(opp.lastDate) < new Date();

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">

      <Link to="/opportunities" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-6">
        <ArrowLeft className="h-4 w-4" /> Back to Opportunities
      </Link>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">

        {/* Header */}
        <div className="p-6 border-b border-slate-100">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">{opp.category}</span>
            {opp.featured && <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Featured</span>}
            {isExpired && <span className="text-xs bg-red-100 text-red-500 px-2 py-0.5 rounded-full">Deadline passed</span>}
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-1">{opp.title}</h1>
          {opp.department && <p className="text-slate-500 text-sm">{opp.department}</p>}

          <div className="flex flex-wrap gap-4 mt-4 text-sm text-slate-500">
            {opp.location && <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" />{opp.location}</span>}
            {opp.remote && opp.remote !== 'on-site' && <span className="capitalize">{opp.remote}</span>}
            {opp.employmentType && <span className="flex items-center gap-1.5"><Briefcase className="h-4 w-4" />{opp.employmentType}</span>}
            {opp.vacancies > 0 && <span className="flex items-center gap-1.5"><Users className="h-4 w-4" />{opp.vacancies} position{opp.vacancies !== 1 ? 's' : ''}</span>}
            {opp.lastDate && (
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                Apply by {new Date(opp.lastDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
            )}
            {opp.duration && <span>Duration: {opp.duration}</span>}
            {opp.salary && <span>Salary: {opp.salary}</span>}
            {opp.stipend && <span>Stipend: {opp.stipend}</span>}
          </div>
        </div>

        <div className="p-6 space-y-6">

          {/* Description */}
          <section>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-amber-600 mb-2">About This Opportunity</h2>
            <div className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">{opp.description}</div>
          </section>

          {opp.responsibilities && (
            <section>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-amber-600 mb-2">Responsibilities</h2>
              <div className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">{opp.responsibilities}</div>
            </section>
          )}

          {opp.eligibility && (
            <section>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-amber-600 mb-2">Eligibility</h2>
              <div className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">{opp.eligibility}</div>
            </section>
          )}

          {opp.experience && (
            <section>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-amber-600 mb-2">Experience Required</h2>
              <p className="text-slate-700 text-sm">{opp.experience}</p>
            </section>
          )}

          {opp.skills?.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-amber-600 mb-2">Skills</h2>
              <div className="flex flex-wrap gap-2">
                {opp.skills.map(s => (
                  <span key={s} className="text-xs bg-slate-100 text-slate-600 px-3 py-1 rounded-full">{s}</span>
                ))}
              </div>
            </section>
          )}

          {opp.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {opp.tags.map(t => (
                <span key={t} className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded">{t}</span>
              ))}
            </div>
          )}

          {opp.attachmentUrl && (
            <a href={opp.attachmentUrl} target="_blank" rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:underline">
              <ExternalLink className="h-4 w-4" /> View Attachment
            </a>
          )}
        </div>

        {/* Apply section */}
        <div className="p-6 border-t border-slate-100 bg-slate-50">
          {submitted ? (
            <div className="text-center">
              <p className="text-green-700 font-medium mb-1">Application submitted successfully!</p>
              <p className="text-sm text-slate-500">You can track your application status in your <Link to="/dashboard" className="text-amber-700 hover:underline">dashboard</Link>.</p>
            </div>
          ) : alreadyApplied ? (
            <p className="text-center text-slate-500 text-sm">You have already applied for this opportunity. Check status in your <Link to="/dashboard" className="text-amber-700 hover:underline">dashboard</Link>.</p>
          ) : isExpired ? (
            <p className="text-center text-slate-400 text-sm">The application deadline for this opportunity has passed.</p>
          ) : opp.status !== 'published' ? (
            <p className="text-center text-slate-400 text-sm">This opportunity is currently closed.</p>
          ) : !showForm ? (
            <div className="text-center">
              {user ? (
                <button
                  onClick={() => setShowForm(true)}
                  className="bg-slate-900 text-white px-8 py-3 rounded-md font-medium hover:bg-slate-700 transition-colors"
                >
                  Apply Now
                </button>
              ) : (
                <div>
                  <p className="text-sm text-slate-500 mb-3">Please log in to apply.</p>
                  <Link to="/login" className="bg-slate-900 text-white px-6 py-2.5 rounded-md font-medium hover:bg-slate-700 text-sm">
                    Log in to Apply
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-4 max-w-xl mx-auto">
              <h3 className="font-semibold text-slate-800 text-lg">Your Application</h3>

              <Field label="Why are you interested in this opportunity?" required error={errors.coverLetter}>
                <textarea
                  rows={5}
                  className={`w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 ${errors.coverLetter ? 'border-red-400' : 'border-slate-300'}`}
                  placeholder="Tell us about your background and why you want to contribute to VOICE…"
                  value={form.coverLetter}
                  onChange={e => { setForm(p => ({ ...p, coverLetter: e.target.value })); setErrors(p => ({ ...p, coverLetter: null })); }}
                />
              </Field>

              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Phone">
                  <input type="tel" className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                    placeholder="+91 98765 43210"
                    value={form.phone}
                    onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
                </Field>
                <Field label="LinkedIn Profile">
                  <input type="url" className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                    placeholder="https://linkedin.com/in/…"
                    value={form.linkedIn}
                    onChange={e => setForm(p => ({ ...p, linkedIn: e.target.value }))} />
                </Field>
              </div>

              <Field label="Portfolio / Website">
                <input type="url" className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                  placeholder="https://…"
                  value={form.portfolio}
                  onChange={e => setForm(p => ({ ...p, portfolio: e.target.value }))} />
              </Field>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={applying}
                  className="flex items-center gap-2 bg-slate-900 text-white px-6 py-2.5 rounded-md font-medium hover:bg-slate-700 disabled:opacity-60 text-sm"
                >
                  {applying && <Loader2 className="h-4 w-4 animate-spin" />}
                  Submit Application
                </button>
                <button type="button" onClick={() => setShowForm(false)}
                  className="px-6 py-2.5 border border-slate-300 rounded-md text-sm text-slate-600 hover:bg-slate-50">
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default OpportunityDetail;
