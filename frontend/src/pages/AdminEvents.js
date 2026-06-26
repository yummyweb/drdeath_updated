import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Eye, Calendar, ChevronLeft, X } from 'lucide-react';
import { getApiUrl } from '@/config/env';

const API = getApiUrl();

const EVENT_TYPES = [
  'Conference', 'Webinar', 'Workshop', 'Seminar',
  'Public Hearing', 'Awareness Campaign', 'Press Conference',
  'Legal Aid Camp', 'Support Group Meeting', 'Training', 'Other',
];

const EVENT_FORMATS = ['In-person', 'Online', 'Hybrid'];

const STATUSES = ['draft', 'published', 'cancelled', 'completed'];

const STATUS_COLOUR = {
  draft:     'bg-slate-100 text-slate-600',
  published: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-600',
  completed: 'bg-blue-100 text-blue-700',
};

const EMPTY_FORM = {
  title: '', description: '', event_type: '', format: '',
  date: '', end_date: '', time: '',
  venue: '', address: '', city: '', state: '', online_link: '',
  organizer: '', organizer_email: '', organizer_phone: '',
  agenda: '',
  registration_required: false, registration_link: '', registration_deadline: '',
  max_attendees: '', is_free: true, fee: '',
  tags: '', image_url: '',
  featured: false, status: 'draft', published: false,
  speakers: [],
};

function formatDate(d) {
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

// ── Speaker row editor ─────────────────────────────────────────────────────────
function SpeakerEditor({ speakers, onChange }) {
  const add    = () => onChange([...speakers, { name: '', designation: '', bio: '' }]);
  const remove = i => onChange(speakers.filter((_, idx) => idx !== i));
  const update = (i, field, val) =>
    onChange(speakers.map((s, idx) => idx === i ? { ...s, [field]: val } : s));

  return (
    <div className="space-y-3">
      {speakers.map((s, i) => (
        <div key={i} className="border border-slate-200 rounded-lg p-3 space-y-2 relative">
          <button type="button" onClick={() => remove(i)}
            className="absolute top-2 right-2 text-slate-400 hover:text-red-500">
            <X className="h-4 w-4" />
          </button>
          <input value={s.name} onChange={e => update(i, 'name', e.target.value)}
            placeholder="Speaker name"
            className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-slate-400" />
          <input value={s.designation} onChange={e => update(i, 'designation', e.target.value)}
            placeholder="Designation / Title"
            className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-slate-400" />
          <textarea value={s.bio} onChange={e => update(i, 'bio', e.target.value)}
            placeholder="Short bio (optional)" rows={2}
            className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-slate-400" />
        </div>
      ))}
      <button type="button" onClick={add}
        className="text-xs text-slate-500 hover:text-slate-800 border border-dashed border-slate-300 rounded px-3 py-1.5 w-full hover:bg-slate-50">
        + Add Speaker
      </button>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
const AdminEvents = () => {
  const [events, setEvents]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [statusFilter, setStatus] = useState('');
  const [showForm, setShowForm]   = useState(false);
  const [editing, setEditing]     = useState(null);
  const [form, setForm]           = useState(EMPTY_FORM);
  const [saving, setSaving]       = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = { limit: 100 };
      if (statusFilter) params.status = statusFilter;
      const res = await axios.get(`${API}/admin/events`, { params });
      setEvents(res.data.data || []);
    } catch {
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => { load(); }, [load]);

  const set = (field, val) => setForm(prev => ({ ...prev, [field]: val }));

  const openNew = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  };

  const openEdit = ev => {
    setEditing(ev);
    setForm({
      title:                  ev.title || '',
      description:            ev.description || '',
      event_type:             ev.event_type || '',
      format:                 ev.format || '',
      date:                   ev.date ? ev.date.slice(0, 10) : '',
      end_date:               ev.end_date ? ev.end_date.slice(0, 10) : '',
      time:                   ev.time || '',
      venue:                  ev.venue || '',
      address:                ev.address || '',
      city:                   ev.city || '',
      state:                  ev.state || '',
      online_link:            ev.online_link || '',
      organizer:              ev.organizer || '',
      organizer_email:        ev.organizer_email || '',
      organizer_phone:        ev.organizer_phone || '',
      agenda:                 ev.agenda || '',
      registration_required:  ev.registration_required || false,
      registration_link:      ev.registration_link || '',
      registration_deadline:  ev.registration_deadline ? ev.registration_deadline.slice(0, 10) : '',
      max_attendees:          ev.max_attendees || '',
      is_free:                ev.is_free !== false,
      fee:                    ev.fee || '',
      tags:                   ev.tags?.join(', ') || '',
      image_url:              ev.image_url || '',
      featured:               ev.featured || false,
      status:                 ev.status || 'draft',
      published:              ev.published || false,
      speakers:               ev.speakers || [],
    });
    setShowForm(true);
  };

  const handleSave = async e => {
    e.preventDefault();
    if (!form.title.trim()) { toast.error('Title is required'); return; }
    if (!form.description.trim()) { toast.error('Description is required'); return; }
    if (!form.event_type) { toast.error('Event type is required'); return; }
    if (!form.format)     { toast.error('Format is required'); return; }
    if (!form.date)       { toast.error('Date is required'); return; }

    setSaving(true);
    try {
      const payload = {
        ...form,
        tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        fee:  form.fee !== '' ? Number(form.fee) : 0,
        max_attendees: form.max_attendees !== '' ? Number(form.max_attendees) : undefined,
      };

      if (editing) {
        const res = await axios.put(`${API}/admin/events/${editing._id}`, payload);
        setEvents(prev => prev.map(ev => ev._id === editing._id ? res.data : ev));
        toast.success('Event updated');
      } else {
        const res = await axios.post(`${API}/admin/events`, payload);
        setEvents(prev => [res.data, ...prev]);
        toast.success('Event created');
      }
      setShowForm(false);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save event');
    } finally {
      setSaving(false);
    }
  };

  const handleTogglePublish = async ev => {
    const nowPublished = !ev.published;
    try {
      const res = await axios.patch(`${API}/admin/events/${ev._id}`, {
        published: nowPublished,
        status: nowPublished ? 'published' : 'draft',
      });
      setEvents(prev => prev.map(e => e._id === ev._id ? res.data : e));
      toast.success(nowPublished ? 'Event published' : 'Event unpublished');
    } catch {
      toast.error('Failed to update event');
    }
  };

  const handleDelete = async id => {
    try {
      await axios.delete(`${API}/admin/events/${id}`);
      setEvents(prev => prev.filter(ev => ev._id !== id));
      setConfirmDelete(null);
      toast.success('Event deleted');
    } catch {
      toast.error('Failed to delete');
    }
  };

  const fieldCls = 'w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400';

  if (showForm) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10">
        <button onClick={() => setShowForm(false)} className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800 mb-6">
          <ChevronLeft className="h-4 w-4" /> Back to Events
        </button>
        <h1 className="text-2xl font-bold text-slate-900 mb-6">{editing ? 'Edit Event' : 'New Event'}</h1>

        <form onSubmit={handleSave} className="space-y-6">

          {/* Core details */}
          <section className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
            <h2 className="font-semibold text-slate-800 border-b border-slate-100 pb-2">Core Details</h2>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Title <span className="text-red-500">*</span></label>
              <input value={form.title} onChange={e => set('title', e.target.value)} required placeholder="Event title" className={fieldCls} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Description <span className="text-red-500">*</span></label>
              <textarea value={form.description} onChange={e => set('description', e.target.value)} required rows={4} placeholder="Full event description…" className={fieldCls} />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Event Type <span className="text-red-500">*</span></label>
                <select value={form.event_type} onChange={e => set('event_type', e.target.value)} required className={fieldCls}>
                  <option value="">Select type</option>
                  {EVENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Format <span className="text-red-500">*</span></label>
                <select value={form.format} onChange={e => set('format', e.target.value)} required className={fieldCls}>
                  <option value="">Select format</option>
                  {EVENT_FORMATS.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Image URL</label>
              <input value={form.image_url} onChange={e => set('image_url', e.target.value)} placeholder="https://…" className={fieldCls} />
            </div>
          </section>

          {/* Date & Time */}
          <section className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
            <h2 className="font-semibold text-slate-800 border-b border-slate-100 pb-2">Date & Time</h2>
            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Start Date <span className="text-red-500">*</span></label>
                <input type="date" value={form.date} onChange={e => set('date', e.target.value)} required className={fieldCls} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">End Date</label>
                <input type="date" value={form.end_date} onChange={e => set('end_date', e.target.value)} className={fieldCls} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Time</label>
                <input value={form.time} onChange={e => set('time', e.target.value)} placeholder="e.g. 10:00 AM – 5:00 PM IST" className={fieldCls} />
              </div>
            </div>
          </section>

          {/* Location */}
          <section className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
            <h2 className="font-semibold text-slate-800 border-b border-slate-100 pb-2">Location</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Venue Name</label>
                <input value={form.venue} onChange={e => set('venue', e.target.value)} placeholder="e.g. India Habitat Centre" className={fieldCls} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Online Link</label>
                <input value={form.online_link} onChange={e => set('online_link', e.target.value)} placeholder="Zoom / Meet / YouTube link" className={fieldCls} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
                <input value={form.address} onChange={e => set('address', e.target.value)} placeholder="Street address" className={fieldCls} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">City</label>
                <input value={form.city} onChange={e => set('city', e.target.value)} placeholder="City" className={fieldCls} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">State</label>
                <input value={form.state} onChange={e => set('state', e.target.value)} placeholder="State" className={fieldCls} />
              </div>
            </div>
          </section>

          {/* Organiser */}
          <section className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
            <h2 className="font-semibold text-slate-800 border-b border-slate-100 pb-2">Organiser</h2>
            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                <input value={form.organizer} onChange={e => set('organizer', e.target.value)} placeholder="Organiser name" className={fieldCls} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input type="email" value={form.organizer_email} onChange={e => set('organizer_email', e.target.value)} placeholder="organiser@example.com" className={fieldCls} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                <input value={form.organizer_phone} onChange={e => set('organizer_phone', e.target.value)} placeholder="+91 98765 43210" className={fieldCls} />
              </div>
            </div>
          </section>

          {/* Speakers */}
          <section className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
            <h2 className="font-semibold text-slate-800 border-b border-slate-100 pb-2">Speakers</h2>
            <SpeakerEditor speakers={form.speakers} onChange={s => set('speakers', s)} />
          </section>

          {/* Agenda */}
          <section className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
            <h2 className="font-semibold text-slate-800 border-b border-slate-100 pb-2">Agenda / Programme</h2>
            <textarea value={form.agenda} onChange={e => set('agenda', e.target.value)} rows={6}
              placeholder="9:00 AM – Welcome address&#10;9:30 AM – Keynote&#10;…" className={fieldCls} />
          </section>

          {/* Registration & Admission */}
          <section className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
            <h2 className="font-semibold text-slate-800 border-b border-slate-100 pb-2">Registration & Admission</h2>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.registration_required}
                  onChange={e => set('registration_required', e.target.checked)} className="h-4 w-4" />
                <span className="text-sm">Registration required</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.is_free}
                  onChange={e => set('is_free', e.target.checked)} className="h-4 w-4" />
                <span className="text-sm">Free event</span>
              </label>
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Registration Link</label>
                <input value={form.registration_link} onChange={e => set('registration_link', e.target.value)} placeholder="https://…" className={fieldCls} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Registration Deadline</label>
                <input type="date" value={form.registration_deadline} onChange={e => set('registration_deadline', e.target.value)} className={fieldCls} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Max Attendees</label>
                <input type="number" value={form.max_attendees} onChange={e => set('max_attendees', e.target.value)} placeholder="e.g. 200" className={fieldCls} />
              </div>
              {!form.is_free && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Fee (₹)</label>
                  <input type="number" value={form.fee} onChange={e => set('fee', e.target.value)} placeholder="0" className={fieldCls} />
                </div>
              )}
            </div>
          </section>

          {/* Meta */}
          <section className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
            <h2 className="font-semibold text-slate-800 border-b border-slate-100 pb-2">Status & Meta</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                <select value={form.status} onChange={e => set('status', e.target.value)} className={fieldCls}>
                  {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tags (comma-separated)</label>
                <input value={form.tags} onChange={e => set('tags', e.target.value)} placeholder="patient safety, negligence, webinar" className={fieldCls} />
              </div>
            </div>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.published}
                  onChange={e => set('published', e.target.checked)} className="h-4 w-4" />
                <span className="text-sm font-medium">Published (visible publicly)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.featured}
                  onChange={e => set('featured', e.target.checked)} className="h-4 w-4" />
                <span className="text-sm font-medium">Featured</span>
              </label>
            </div>
          </section>

          <div className="flex gap-3">
            <button type="submit" disabled={saving}
              className="flex-1 bg-slate-900 text-white py-3 rounded-md font-medium hover:bg-slate-700 disabled:opacity-50">
              {saving ? 'Saving…' : editing ? 'Update Event' : 'Create Event'}
            </button>
            <button type="button" onClick={() => setShowForm(false)}
              className="px-6 py-3 border border-slate-300 rounded-md text-sm hover:bg-slate-50">
              Cancel
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Manage Events</h1>
          <Link to="/admin" className="text-sm text-slate-500 hover:text-slate-700">← Admin Dashboard</Link>
        </div>
        <button onClick={openNew}
          className="inline-flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-slate-700">
          <Plus className="h-4 w-4" /> New Event
        </button>
      </div>

      {/* Status filter */}
      <div className="flex gap-2 flex-wrap mb-6">
        {['', ...STATUSES].map(s => (
          <button key={s} onClick={() => setStatus(s)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
              statusFilter === s ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}>
            {s === '' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-16 text-slate-400">Loading…</div>
      ) : events.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <Calendar className="h-12 w-12 mx-auto mb-4 text-slate-300" />
          <p className="mb-4">No events yet.</p>
          <button onClick={openNew} className="text-sm text-amber-700 hover:underline">Create your first event</button>
        </div>
      ) : (
        <div className="space-y-3">
          {events.map(ev => (
            <div key={ev._id} className="bg-white border border-slate-200 rounded-xl p-4 flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLOUR[ev.status]}`}>{ev.status}</span>
                  <span className="text-xs text-slate-500">{ev.event_type}</span>
                  <span className="text-xs text-slate-400">{ev.format}</span>
                  {ev.featured && <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Featured</span>}
                  {!ev.published && <span className="text-xs bg-slate-100 text-slate-400 px-2 py-0.5 rounded-full">Unpublished</span>}
                </div>
                <p className="font-semibold text-slate-900">{ev.title}</p>
                <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {formatDate(ev.date)}{ev.city ? ` · ${ev.city}` : ''}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {/* Publish / Unpublish toggle */}
                <button
                  onClick={() => handleTogglePublish(ev)}
                  title={ev.published ? 'Unpublish' : 'Publish'}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold border transition-colors ${
                    ev.published
                      ? 'border-green-300 bg-green-50 text-green-700 hover:bg-red-50 hover:text-red-600 hover:border-red-300'
                      : 'border-slate-300 bg-white text-slate-600 hover:bg-green-50 hover:text-green-700 hover:border-green-300'
                  }`}
                >
                  {ev.published ? 'Published' : 'Publish'}
                </button>

                {/* Preview — always visible; opens public page or admin edit for drafts */}
                <a
                  href={`/events/${ev.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  title={ev.published ? 'View public page' : 'Preview (draft — not visible to public)'}
                  className="p-1.5 text-slate-400 hover:text-slate-700 border border-slate-200 rounded-md"
                >
                  <Eye className="h-4 w-4" />
                </a>

                <button onClick={() => openEdit(ev)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 border border-slate-200 rounded-md">
                  <Pencil className="h-4 w-4" />
                </button>
                <button onClick={() => setConfirmDelete(ev)}
                  className="p-1.5 text-slate-400 hover:text-red-600 border border-slate-200 rounded-md">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete confirmation */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="font-bold text-slate-900 mb-2">Delete Event?</h3>
            <p className="text-sm text-slate-600 mb-4">
              "<strong>{confirmDelete.title}</strong>" will be permanently deleted.
            </p>
            <div className="flex gap-3">
              <button onClick={() => handleDelete(confirmDelete._id)}
                className="flex-1 bg-red-600 text-white py-2 rounded-md text-sm font-medium hover:bg-red-700">
                Delete
              </button>
              <button onClick={() => setConfirmDelete(null)}
                className="flex-1 border border-slate-300 py-2 rounded-md text-sm hover:bg-slate-50">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminEvents;
