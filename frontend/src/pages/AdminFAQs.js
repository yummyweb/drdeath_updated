import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, GripVertical, Eye, EyeOff, Check, X } from 'lucide-react';
import { getApiUrl } from '@/config/env';

const API = getApiUrl();

const empty = { question: '', answer: '', active: true, order: 0 };

const AdminFAQs = () => {
  const [faqs, setFaqs]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);  // faq object or 'new'
  const [form, setForm]       = useState(empty);
  const [saving, setSaving]   = useState(false);

  const load = async () => {
    try {
      const { data } = await axios.get(`${API}/admin/faqs`, { withCredentials: true });
      setFaqs(data);
    } catch {
      toast.error('Failed to load FAQs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openNew = () => {
    setForm({ ...empty, order: faqs.length });
    setEditing('new');
  };

  const openEdit = (faq) => {
    setForm({ question: faq.question, answer: faq.answer, active: faq.active, order: faq.order });
    setEditing(faq);
  };

  const cancel = () => { setEditing(null); setForm(empty); };

  const save = async () => {
    if (!form.question.trim() || !form.answer.trim()) {
      toast.error('Question and answer are required');
      return;
    }
    setSaving(true);
    try {
      if (editing === 'new') {
        const { data } = await axios.post(`${API}/admin/faqs`, form, { withCredentials: true });
        setFaqs(prev => [...prev, data]);
        toast.success('FAQ added');
      } else {
        const { data } = await axios.put(`${API}/admin/faqs/${editing._id}`, form, { withCredentials: true });
        setFaqs(prev => prev.map(f => f._id === data._id ? data : f));
        toast.success('FAQ updated');
      }
      cancel();
    } catch {
      toast.error('Failed to save FAQ');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this FAQ?')) return;
    try {
      await axios.delete(`${API}/admin/faqs/${id}`, { withCredentials: true });
      setFaqs(prev => prev.filter(f => f._id !== id));
      toast.success('FAQ deleted');
    } catch {
      toast.error('Failed to delete FAQ');
    }
  };

  const toggleActive = async (faq) => {
    try {
      const { data } = await axios.put(`${API}/admin/faqs/${faq._id}`,
        { question: faq.question, answer: faq.answer, order: faq.order, active: !faq.active },
        { withCredentials: true }
      );
      setFaqs(prev => prev.map(f => f._id === data._id ? data : f));
      toast.success(data.active ? 'FAQ visible' : 'FAQ hidden');
    } catch {
      toast.error('Failed to update FAQ');
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="h-8 w-8 rounded-full border-2 border-slate-300 border-t-primary animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 py-10">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-serif text-3xl font-bold text-primary">FAQ Manager</h1>
            <p className="text-slate-500 mt-1 text-sm">{faqs.length} question{faqs.length !== 1 ? 's' : ''} · changes appear live on the Contact page</p>
          </div>
          <button onClick={openNew}
            className="inline-flex items-center gap-2 bg-primary hover:bg-slate-800 text-white font-semibold px-4 py-2.5 rounded-lg text-sm transition-colors">
            <Plus className="h-4 w-4" /> Add FAQ
          </button>
        </div>

        {/* Add / Edit form */}
        {editing && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-6 shadow-sm">
            <h2 className="font-serif font-bold text-primary text-lg mb-5">
              {editing === 'new' ? 'New FAQ' : 'Edit FAQ'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Question *</label>
                <input
                  type="text"
                  value={form.question}
                  onChange={e => setForm(f => ({ ...f, question: e.target.value }))}
                  placeholder="e.g. What type of cases do you handle?"
                  className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Answer *</label>
                <textarea
                  rows={4}
                  value={form.answer}
                  onChange={e => setForm(f => ({ ...f, answer: e.target.value }))}
                  placeholder="Write a clear, helpful answer..."
                  className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent resize-none"
                />
              </div>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input type="checkbox" checked={form.active}
                    onChange={e => setForm(f => ({ ...f, active: e.target.checked }))}
                    className="w-4 h-4 accent-teal-600" />
                  <span className="text-sm font-medium text-slate-700">Visible on site</span>
                </label>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={save} disabled={saving}
                className="inline-flex items-center gap-2 bg-accent hover:bg-teal-700 text-white font-bold px-5 py-2.5 rounded-lg text-sm transition-colors disabled:opacity-60">
                <Check className="h-4 w-4" /> {saving ? 'Saving…' : 'Save'}
              </button>
              <button onClick={cancel}
                className="inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-5 py-2.5 rounded-lg text-sm transition-colors">
                <X className="h-4 w-4" /> Cancel
              </button>
            </div>
          </div>
        )}

        {/* FAQ list */}
        {faqs.length === 0 ? (
          <div className="text-center py-20 text-slate-400">
            <p className="text-lg font-medium mb-2">No FAQs yet</p>
            <p className="text-sm">Click "Add FAQ" to create your first question.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div key={faq._id}
                className={`bg-white border rounded-2xl p-5 shadow-sm transition-all ${faq.active ? 'border-slate-200' : 'border-slate-200 opacity-50'}`}>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 text-slate-300 mt-1">
                    <GripVertical className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono text-slate-400">#{idx + 1}</span>
                      {!faq.active && (
                        <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-medium">Hidden</span>
                      )}
                    </div>
                    <h3 className="font-serif font-bold text-primary text-base mb-1">{faq.question}</h3>
                    <p className="text-sm text-slate-500 leading-relaxed line-clamp-2">{faq.answer}</p>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button onClick={() => toggleActive(faq)}
                      className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                      title={faq.active ? 'Hide' : 'Show'}>
                      {faq.active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </button>
                    <button onClick={() => openEdit(faq)}
                      className="p-2 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors"
                      title="Edit">
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button onClick={() => remove(faq._id)}
                      className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors"
                      title="Delete">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminFAQs;
