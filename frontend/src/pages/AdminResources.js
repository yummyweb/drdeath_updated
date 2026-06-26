import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { getApiUrl } from '@/config/env';
import { useAuth } from '../context/AuthContext';
import { BookOpen, Plus } from 'lucide-react';
import { CATEGORIES, CATEGORY_META, EMPTY_FORM } from '../components/resources/resourceConstants';
import ResourceForm from '../components/resources/ResourceForm';
import ResourceList from '../components/resources/ResourceList';

const API = getApiUrl();

const AdminResources = () => {
  useAuth(); // establishes context; cookies sent automatically via axios.defaults.withCredentials

  const [resources, setResources]       = useState([]);
  const [loading, setLoading]           = useState(true);
  const [saving, setSaving]             = useState(false);
  const [pdfUploading, setPdfUploading] = useState(false);
  const [showForm, setShowForm]         = useState(false);
  const [editingResource, setEditingResource] = useState(null);
  const [expandedId, setExpandedId]     = useState(null);
  const [filterCategory, setFilterCategory] = useState('All');
  const [formData, setFormData]         = useState(EMPTY_FORM);
  const [errors, setErrors]             = useState({});
  const [confirmDelete, setConfirmDelete] = useState(null);

  // ── Data loading ────────────────────────────────────────────────────────────

  const loadResources = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/resources`, { params: { all: 'true' } });
      const raw = res.data;
      setResources(Array.isArray(raw) ? raw : raw.resources || []);
    } catch {
      toast.error('Failed to load resources');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadResources(); }, [loadResources]);

  // ── Filtered list ───────────────────────────────────────────────────────────

  const filtered = filterCategory === 'All'
    ? resources
    : resources.filter(r => r.category === filterCategory);

  // ── Form helpers ────────────────────────────────────────────────────────────

  const set = (field) => (e) => {
    const val = e && e.target
      ? (e.target.type === 'checkbox' ? e.target.checked : e.target.value)
      : e;
    setFormData(prev => ({ ...prev, [field]: val }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }));
  };

  const validate = () => {
    const errs = {};
    if (!formData.title?.trim()) errs.title = 'Title is required';
    if (formData.category === 'Judgment' && !formData.citation?.trim()) {
      errs.citation = 'Citation is required for Judgments';
    }
    if (formData.externalLink && !/^https?:\/\/.+/.test(formData.externalLink)) {
      errs.externalLink = 'External link must be a valid URL';
    }
    return errs;
  };

  const openCreate = (defaultCategory = 'Judgment') => {
    setEditingResource(null);
    setFormData({ ...EMPTY_FORM, category: defaultCategory });
    setErrors({});
    setShowForm(true);
    setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 50);
  };

  const openEdit = (resource) => {
    setEditingResource(resource);
    setFormData({
      title:        resource.title || '',
      category:     resource.category || 'Judgment',
      citation:     resource.citation || '',
      court:        resource.court || '',
      judgmentDate: resource.judgmentDate
        ? new Date(resource.judgmentDate).toISOString().split('T')[0]
        : '',
      summary:      resource.summary || '',
      facts:        resource.facts || '',
      issues:       resource.issues || '',
      ratio:        resource.ratio || '',
      held:         resource.held || '',
      relevance:    resource.relevance || '',
      content:      resource.content || '',
      author:       resource.author || '',
      instructions: resource.instructions || '',
      pdfUrl:       resource.pdfUrl || '',
      extractedText:'',
      externalLink: resource.externalLink || '',
      tags:         Array.isArray(resource.tags) ? resource.tags.join(', ') : resource.tags || '',
      featured:     resource.featured || false,
      published:    resource.published !== undefined ? resource.published : true
    });
    setErrors({});
    setShowForm(true);
    setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 50);
  };

  const cancelForm = () => {
    setShowForm(false);
    setEditingResource(null);
    setErrors({});
  };

  // ── Save ────────────────────────────────────────────────────────────────────

  const saveResource = async () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setSaving(true);
    try {
      const payload = {
        ...formData,
        tags: formData.tags
          ? formData.tags.split(',').map(t => t.trim()).filter(Boolean)
          : []
      };

      if (editingResource) {
        await axios.put(`${API}/resources/${editingResource._id}`, payload);
        toast.success('Resource updated');
      } else {
        await axios.post(`${API}/resources`, payload);
        toast.success('Resource created');
      }

      await loadResources();
      cancelForm();
    } catch (err) {
      if (err.response?.status === 409) {
        const existing = err.response.data.existing;
        toast.error(
          `⚠ Possible Duplicate\n\nTitle: ${existing.title}\n` +
          `${existing.citation ? `Citation: ${existing.citation}\n` : ''}` +
          `${existing.matchScore ? `Similarity: ${existing.matchScore}%` : ''}`
        );
        return;
      }
      toast.error(err.response?.data?.error || err.message || 'Failed to save resource');
    } finally {
      setSaving(false);
    }
  };

  // ── Delete ──────────────────────────────────────────────────────────────────

  const confirmDeleteResource = async () => {
    if (!confirmDelete) return;
    const resource = confirmDelete;
    setConfirmDelete(null);
    try {
      await axios.delete(`${API}/resources/${resource._id}`);
      toast.success('Resource deleted');
      await loadResources();
      if (editingResource?._id === resource._id) cancelForm();
    } catch {
      toast.error('Failed to delete resource');
    }
  };

  // ── Publish toggle (PATCH — skips duplicate check) ──────────────────────────

  const togglePublish = async (resource) => {
    try {
      await axios.patch(`${API}/resources/${resource._id}`, { published: !resource.published });
      toast.success(resource.published ? 'Unpublished' : 'Published');
      await loadResources();
    } catch {
      toast.error('Failed to update');
    }
  };

  // ── PDF upload ──────────────────────────────────────────────────────────────

  const handlePdfUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPdfUploading(true);
    try {
      const fd = new FormData();
      fd.append('pdf', file);
      const res = await axios.post(`${API}/resources/upload-pdf`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setFormData(prev => ({ ...prev, pdfUrl: res.data.url, extractedText: res.data.extractedText || '' }));
      toast.success('PDF uploaded');
    } catch (err) {
      toast.error(err.response?.data?.error || 'PDF upload failed');
    } finally {
      setPdfUploading(false);
      e.target.value = '';
    }
  };

  // ── Category tab counts ─────────────────────────────────────────────────────

  const countFor = (cat) =>
    cat === 'All' ? resources.length : resources.filter(r => r.category === cat).length;

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">

      {/* Delete confirmation dialog */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full mx-4">
            <h3 className="font-semibold text-slate-900 mb-2">Delete Resource?</h3>
            <p className="text-sm text-slate-600 mb-5">
              <span className="font-medium">"{confirmDelete.title}"</span> will be permanently deleted. This cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setConfirmDelete(null)}
                className="px-4 py-2 text-sm border border-slate-300 rounded-md text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteResource}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-amber-600" />
            Knowledge Centre
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage judgments, articles, templates and all legal resources
          </p>
        </div>
        <button
          onClick={() => openCreate(filterCategory === 'All' ? 'Judgment' : filterCategory)}
          className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-slate-700 transition-colors whitespace-nowrap"
        >
          <Plus className="h-4 w-4" />
          Add {filterCategory === 'All' ? 'Resource' : filterCategory}
        </button>
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 flex-wrap mb-6">
        {['All', ...CATEGORIES].map(cat => {
          const meta   = cat !== 'All' ? CATEGORY_META[cat] : null;
          const Icon   = meta?.icon;
          const active = filterCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                active
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {Icon && <Icon className="h-3 w-3" />}
              {cat}
              <span className={`text-xs rounded-full px-1.5 py-0 ${
                active ? 'bg-white text-slate-900' : 'bg-slate-100 text-slate-500'
              }`}>
                {countFor(cat)}
              </span>
            </button>
          );
        })}
      </div>

      {/* Form */}
      {showForm && (
        <ResourceForm
          formData={formData}
          set={set}
          errors={errors}
          editingResource={editingResource}
          saving={saving}
          pdfUploading={pdfUploading}
          onSave={saveResource}
          onCancel={cancelForm}
          handlePdfUpload={handlePdfUpload}
          setFormData={setFormData}
        />
      )}

      {/* Resource list */}
      <ResourceList
        resources={resources}
        filtered={filtered}
        loading={loading}
        filterCategory={filterCategory}
        expandedId={expandedId}
        setExpandedId={setExpandedId}
        onEdit={openEdit}
        onDelete={setConfirmDelete}
        onTogglePublish={togglePublish}
        onAddFirst={() => openCreate(filterCategory === 'All' ? 'Judgment' : filterCategory)}
      />

    </div>
  );
};

export default AdminResources;
