import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { getApiUrl } from '@/config/env';
import {
  Plus, Pencil, Trash2, Copy, Eye, EyeOff, ChevronDown, ChevronUp,
  Download, Loader2, X, Users
} from 'lucide-react';

const API = getApiUrl();

const CATEGORIES = [
  'Job', 'Internship', 'Fellowship', 'Volunteer Position',
  'Research Project', 'Expert Invitation', 'Collaborate With VOICE',
];

const EMPLOYMENT_TYPES = ['Full-time', 'Part-time', 'Contract', 'Freelance', 'Unpaid'];
const APP_STATUSES = ['applied', 'under_review', 'shortlisted', 'interview', 'selected', 'rejected', 'withdrawn'];

const STATUS_COLOUR = {
  applied:      'bg-slate-100 text-slate-600',
  under_review: 'bg-blue-100 text-blue-700',
  shortlisted:  'bg-purple-100 text-purple-700',
  interview:    'bg-amber-100 text-amber-700',
  selected:     'bg-green-100 text-green-700',
  rejected:     'bg-red-100 text-red-600',
  withdrawn:    'bg-slate-100 text-slate-400',
};

const EMPTY_FORM = {
  title: '', category: 'Job', department: '', description: '',
  responsibilities: '', eligibility: '', experience: '',
  skills: '', employmentType: '', location: '', remote: 'on-site',
  salary: '', stipend: '', duration: '', lastDate: '',
  vacancies: '', tags: '', status: 'draft', published: false, featured: false,
};

function Field({ label, required, error, children }) {
  return (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
        {label}{required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}

function Input({ error, ...props }) {
  return (
    <input
      className={`w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 ${error ? 'border-red-400' : 'border-slate-300'}`}
      {...props}
    />
  );
}

// ── Applications drawer ───────────────────────────────────────────────────────
function ApplicationsDrawer({ opportunity, onClose }) {
  const [apps, setApps]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [filterStatus, setFilter] = useState('');

  useEffect(() => {
    axios.get(`${API}/admin/opportunities/${opportunity._id}/applications`)
      .then(r => setApps(r.data.data || []))
      .catch(() => toast.error('Failed to load applications'))
      .finally(() => setLoading(false));
  }, [opportunity._id]);

  const changeStatus = async (appId, status) => {
    try {
      await axios.put(`${API}/admin/applications/${appId}/status`, { status });
      setApps(prev => prev.map(a => a._id === appId ? { ...a, status } : a));
      toast.success('Status updated');
    } catch {
      toast.error('Failed to update status');
    }
  };

  const exportCSV = () => {
    window.open(`${API}/admin/opportunities/${opportunity._id}/applications/export`, '_blank');
  };

  const filtered = filterStatus ? apps.filter(a => a.status === filterStatus) : apps;

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black bg-opacity-30" onClick={onClose} />
      <div className="w-full max-w-2xl bg-white shadow-xl overflow-y-auto flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div>
            <h2 className="font-semibold text-slate-900">{opportunity.title}</h2>
            <p className="text-xs text-slate-500">{apps.length} application{apps.length !== 1 ? 's' : ''}</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={exportCSV} className="flex items-center gap-1.5 text-xs border border-slate-300 px-3 py-1.5 rounded-md hover:bg-slate-50">
              <Download className="h-3.5 w-3.5" /> Export CSV
            </button>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X className="h-5 w-5" /></button>
          </div>
        </div>

        <div className="px-6 py-3 border-b border-slate-100">
          <select
            className="text-sm border border-slate-200 rounded px-2 py-1"
            value={filterStatus}
            onChange={e => setFilter(e.target.value)}
          >
            <option value="">All statuses</option>
            {APP_STATUSES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
          </select>
        </div>

        <div className="flex-1 p-6 space-y-3">
          {loading ? (
            <div className="text-center py-8 text-slate-400"><Loader2 className="h-5 w-5 animate-spin mx-auto" /></div>
          ) : filtered.length === 0 ? (
            <p className="text-center text-slate-400 py-8">No applications yet.</p>
          ) : (
            filtered.map(app => (
              <div key={app._id} className="border border-slate-200 rounded-xl p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900">{app.applicant?.full_name}</p>
                    <p className="text-xs text-slate-500">{app.applicant?.email}{app.phone ? ` · ${app.phone}` : ''}</p>
                    {app.linkedIn && (
                      <a href={app.linkedIn} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline">{app.linkedIn}</a>
                    )}
                    {app.coverLetter && (
                      <p className="text-sm text-slate-600 mt-2 line-clamp-3">{app.coverLetter}</p>
                    )}
                    <p className="text-xs text-slate-400 mt-1">Applied {new Date(app.createdAt).toLocaleDateString('en-IN')}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLOUR[app.status]}`}>
                      {app.status.replace('_', ' ')}
                    </span>
                    <select
                      className="text-xs border border-slate-200 rounded px-2 py-1"
                      value={app.status}
                      onChange={e => changeStatus(app._id, e.target.value)}
                    >
                      {APP_STATUSES.map(s => (
                        <option key={s} value={s}>{s.replace('_', ' ')}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
const AdminOpportunities = () => {
  const [opps, setOpps]           = useState([]);
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const [showForm, setShowForm]   = useState(false);
  const [editing, setEditing]     = useState(null);
  const [formData, setFormData]   = useState(EMPTY_FORM);
  const [errors, setErrors]       = useState({});
  const [expandedId, setExpandedId] = useState(null);
  const [filterStatus, setFilterStatus] = useState('');
  const [appsDrawer, setAppsDrawer]     = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/admin/opportunities`, {
        params: { limit: 100, ...(filterStatus && { status: filterStatus }) }
      });
      setOpps(res.data.data || []);
    } catch {
      toast.error('Failed to load opportunities');
    } finally {
      setLoading(false);
    }
  }, [filterStatus]);

  useEffect(() => { load(); }, [load]);

  const set = field => e => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData(prev => ({ ...prev, [field]: val }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }));
  };

  const validate = () => {
    const e = {};
    if (!formData.title.trim())       e.title       = 'Title is required';
    if (!formData.category)           e.category    = 'Category is required';
    if (!formData.description.trim()) e.description = 'Description is required';
    return e;
  };

  const openCreate = () => {
    setEditing(null);
    setFormData(EMPTY_FORM);
    setErrors({});
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openEdit = (opp) => {
    setEditing(opp);
    setFormData({
      title:            opp.title || '',
      category:         opp.category || 'Job',
      department:       opp.department || '',
      description:      opp.description || '',
      responsibilities: opp.responsibilities || '',
      eligibility:      opp.eligibility || '',
      experience:       opp.experience || '',
      skills:           Array.isArray(opp.skills) ? opp.skills.join(', ') : '',
      employmentType:   opp.employmentType || '',
      location:         opp.location || '',
      remote:           opp.remote || 'on-site',
      salary:           opp.salary || '',
      stipend:          opp.stipend || '',
      duration:         opp.duration || '',
      lastDate:         opp.lastDate ? new Date(opp.lastDate).toISOString().split('T')[0] : '',
      vacancies:        opp.vacancies ?? '',
      tags:             Array.isArray(opp.tags) ? opp.tags.join(', ') : '',
      status:           opp.status || 'draft',
      published:        opp.published || false,
      featured:         opp.featured || false,
    });
    setErrors({});
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const save = async () => {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setSaving(true);
    try {
      const payload = {
        ...formData,
        skills:   formData.skills ? formData.skills.split(',').map(s => s.trim()).filter(Boolean) : [],
        tags:     formData.tags   ? formData.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        vacancies: formData.vacancies ? Number(formData.vacancies) : undefined,
        lastDate:  formData.lastDate || undefined,
        // keep status in sync with published checkbox
        status: formData.published ? 'published' : (formData.status === 'published' ? 'draft' : formData.status),
      };

      if (editing) {
        const res = await axios.put(`${API}/admin/opportunities/${editing._id}`, payload);
        setOpps(prev => prev.map(o => o._id === editing._id ? res.data : o));
        toast.success('Opportunity updated');
      } else {
        const res = await axios.post(`${API}/admin/opportunities`, payload);
        setOpps(prev => [res.data, ...prev]);
        toast.success('Opportunity created');
      }
      setShowForm(false);
      setEditing(null);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const duplicate = async (opp) => {
    try {
      const res = await axios.post(`${API}/admin/opportunities/${opp._id}/duplicate`);
      setOpps(prev => [res.data, ...prev]);
      toast.success('Duplicated as draft');
    } catch {
      toast.error('Failed to duplicate');
    }
  };

  const togglePublish = async (opp) => {
    try {
      const published = !opp.published;
      const status = published ? 'published' : 'draft';
      const res = await axios.put(`${API}/admin/opportunities/${opp._id}`, { published, status });
      setOpps(prev => prev.map(o => o._id === opp._id ? res.data : o));
      toast.success(published ? 'Published' : 'Unpublished');
    } catch {
      toast.error('Failed to update');
    }
  };

  const doDelete = async () => {
    if (!confirmDelete) return;
    try {
      await axios.delete(`${API}/admin/opportunities/${confirmDelete._id}`);
      setOpps(prev => prev.filter(o => o._id !== confirmDelete._id));
      toast.success('Deleted');
    } catch {
      toast.error('Failed to delete');
    } finally {
      setConfirmDelete(null);
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">

      {/* Delete confirm dialog */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full mx-4">
            <h3 className="font-semibold text-slate-900 mb-2">Delete Opportunity?</h3>
            <p className="text-sm text-slate-600 mb-5">
              "<span className="font-medium">{confirmDelete.title}</span>" and all its applications will be permanently deleted.
            </p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setConfirmDelete(null)} className="px-4 py-2 text-sm border border-slate-300 rounded-md text-slate-600 hover:bg-slate-50">Cancel</button>
              <button onClick={doDelete} className="px-4 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Applications drawer */}
      {appsDrawer && <ApplicationsDrawer opportunity={appsDrawer} onClose={() => setAppsDrawer(null)} />}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Opportunities</h1>
        <button onClick={openCreate} className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-slate-700">
          <Plus className="h-4 w-4" /> Add Opportunity
        </button>
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {['', 'draft', 'published', 'closed', 'archived'].map(s => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
              filterStatus === s ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {s || 'All'}
          </button>
        ))}
      </div>

      {/* Form */}
      {showForm && (
        <div className="border border-slate-200 rounded-xl bg-white shadow-sm mb-8 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-200">
            <h2 className="font-semibold text-slate-800">{editing ? 'Edit' : 'New'} Opportunity</h2>
            <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600"><X className="h-5 w-5" /></button>
          </div>

          <div className="p-6 space-y-5">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Field label="Title" required error={errors.title}>
                  <Input placeholder="e.g. Legal Research Intern" value={formData.title} onChange={set('title')} error={errors.title} />
                </Field>
              </div>
              <Field label="Category" required error={errors.category}>
                <select className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                  value={formData.category} onChange={set('category')}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </Field>
              <Field label="Department">
                <Input placeholder="e.g. Legal, Research, Outreach" value={formData.department} onChange={set('department')} />
              </Field>
            </div>

            <Field label="Description" required error={errors.description}>
              <textarea rows={4} className={`w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 ${errors.description ? 'border-red-400' : 'border-slate-300'}`}
                placeholder="Overview of the opportunity…"
                value={formData.description} onChange={set('description')} />
            </Field>

            <Field label="Responsibilities">
              <textarea rows={3} className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                placeholder="Key responsibilities…" value={formData.responsibilities} onChange={set('responsibilities')} />
            </Field>

            <div className="grid md:grid-cols-2 gap-4">
              <Field label="Eligibility">
                <Input placeholder="e.g. LLB final year, 2+ years experience" value={formData.eligibility} onChange={set('eligibility')} />
              </Field>
              <Field label="Experience Required">
                <Input placeholder="e.g. 0-1 years, Freshers welcome" value={formData.experience} onChange={set('experience')} />
              </Field>
              <Field label="Skills (comma-separated)">
                <Input placeholder="Research, Legal Writing, Hindi" value={formData.skills} onChange={set('skills')} />
              </Field>
              <Field label="Employment Type">
                <select className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                  value={formData.employmentType} onChange={set('employmentType')}>
                  <option value="">Select type</option>
                  {EMPLOYMENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </Field>
              <Field label="Location">
                <Input placeholder="Delhi, Mumbai, Pan India" value={formData.location} onChange={set('location')} />
              </Field>
              <Field label="Remote / On-site">
                <select className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                  value={formData.remote} onChange={set('remote')}>
                  <option value="on-site">On-site</option>
                  <option value="remote">Remote</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </Field>
              <Field label="Salary">
                <Input placeholder="e.g. ₹30,000/month" value={formData.salary} onChange={set('salary')} />
              </Field>
              <Field label="Stipend">
                <Input placeholder="e.g. ₹5,000/month" value={formData.stipend} onChange={set('stipend')} />
              </Field>
              <Field label="Duration">
                <Input placeholder="e.g. 3 months, 1 year" value={formData.duration} onChange={set('duration')} />
              </Field>
              <Field label="Application Deadline">
                <input type="date" className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                  value={formData.lastDate} onChange={set('lastDate')} />
              </Field>
              <Field label="Vacancies">
                <Input type="number" min="0" placeholder="Number of positions" value={formData.vacancies} onChange={set('vacancies')} />
              </Field>
              <Field label="Tags (comma-separated)">
                <Input placeholder="legal, internship, delhi" value={formData.tags} onChange={set('tags')} />
              </Field>
            </div>

            <div className="flex flex-wrap gap-6 pt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 accent-slate-800" checked={formData.published} onChange={set('published')} />
                <span className="text-sm text-slate-700">Published</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 accent-amber-600" checked={formData.featured} onChange={set('featured')} />
                <span className="text-sm text-slate-700">Featured</span>
              </label>
            </div>

            <div className="flex gap-3 pt-2 border-t border-slate-100">
              <button onClick={save} disabled={saving}
                className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2 rounded-md text-sm font-medium hover:bg-slate-700 disabled:opacity-60">
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                {editing ? 'Update' : 'Save'}
              </button>
              <button onClick={() => setShowForm(false)}
                className="px-5 py-2 border border-slate-300 rounded-md text-sm text-slate-600 hover:bg-slate-50">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-16 text-slate-400">
          <Loader2 className="h-6 w-6 animate-spin mr-2" /> Loading…
        </div>
      ) : opps.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <p className="mb-4">No opportunities yet.</p>
          <button onClick={openCreate} className="text-sm text-amber-700 hover:underline">+ Add the first one</button>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">{opps.length} opportunit{opps.length !== 1 ? 'ies' : 'y'}</p>
          {opps.map(opp => (
            <div key={opp._id} className={`border rounded-xl bg-white ${opp.published ? 'border-slate-200' : 'border-dashed border-slate-300 opacity-80'}`}>
              <div className="flex items-start gap-4 p-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="font-semibold text-slate-900">{opp.title}</span>
                    <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{opp.category}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      opp.status === 'published' ? 'bg-green-100 text-green-700' :
                      opp.status === 'closed'    ? 'bg-red-100 text-red-600' :
                      opp.status === 'archived'  ? 'bg-slate-200 text-slate-500' :
                      'bg-amber-100 text-amber-700'
                    }`}>{opp.status}</span>
                    {opp.featured && <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Featured</span>}
                  </div>
                  {opp.department && <p className="text-xs text-slate-500">{opp.department}</p>}
                  {opp.location && <p className="text-xs text-slate-400">{opp.location}</p>}
                  {opp.lastDate && (
                    <p className="text-xs text-slate-400">
                      Deadline: {new Date(opp.lastDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  )}

                  {expandedId === opp._id && (
                    <p className="text-sm text-slate-600 mt-2 line-clamp-3">{opp.description}</p>
                  )}
                </div>

                <div className="flex items-center gap-1 flex-shrink-0">
                  <button onClick={() => setAppsDrawer(opp)}
                    className="flex items-center gap-1 p-2 text-slate-500 hover:text-slate-700 rounded-md hover:bg-slate-50 text-xs">
                    <Users className="h-4 w-4" />
                    {opp.applicationCount > 0 && <span>{opp.applicationCount}</span>}
                  </button>
                  <button onClick={() => setExpandedId(expandedId === opp._id ? null : opp._id)}
                    className="p-2 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-50">
                    {expandedId === opp._id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </button>
                  <button onClick={() => togglePublish(opp)}
                    className="p-2 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-50"
                    title={opp.published ? 'Unpublish' : 'Publish'}>
                    {opp.published ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </button>
                  <button onClick={() => duplicate(opp)}
                    className="p-2 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-50" title="Duplicate">
                    <Copy className="h-4 w-4" />
                  </button>
                  <button onClick={() => openEdit(opp)}
                    className="p-2 text-blue-500 hover:text-blue-700 rounded-md hover:bg-blue-50">
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button onClick={() => setConfirmDelete(opp)}
                    className="p-2 text-red-400 hover:text-red-600 rounded-md hover:bg-red-50">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminOpportunities;
