import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useSettings } from '../context/SettingsContext';
import { getImageUrl } from '../utils/imageUrl';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import {
  Scale,
  FileText,
  Building2,
  ExternalLink,
  BookOpen,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  Play,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Download,
  Calendar,
  User,
  Tag,
  Loader2,
  Database
} from 'lucide-react';
import { getApiUrl } from '@/config/env';

const API = getApiUrl();

const CATEGORIES = ['All', 'Judgment', 'Article', 'RTI Template', 'Legal Notice', 'Consumer Complaint', 'Other'];
const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'az', label: 'A → Z' }
];

// ── Legal Research Repository Section ──────────────────────────────────────

// Category-specific thumbnail backgrounds
const CATEGORY_BG = {

  Judgment:

    'bg-gradient-to-br from-[#8B5A2B] to-[#5B3715]',

  Article:

    'bg-gradient-to-br from-slate-700 to-slate-900',

  'RTI Template':

    'bg-gradient-to-br from-emerald-700 to-emerald-900',

  'Legal Notice':

    'bg-gradient-to-br from-red-700 to-red-900',

  'Consumer Complaint':

    'bg-gradient-to-br from-orange-700 to-orange-900',

  Other:

    'bg-gradient-to-br from-slate-600 to-slate-800',

};
const CATEGORY_LABEL_COLOUR = {
  Judgment:           'bg-amber-100 text-amber-800',
  Article:            'bg-blue-100 text-blue-800',
  'RTI Template':     'bg-green-100 text-green-800',
  'Legal Notice':     'bg-red-100 text-red-800',
  'Consumer Complaint':'bg-orange-100 text-orange-800',
  Other:              'bg-slate-100 text-slate-600',
};

// Estimate reading time from summary word count
const readingTime = (text) => {
  if (!text) return null;
  const words = text.trim().split(/\s+/).length;
  const mins = Math.max(1, Math.round(words / 200));
 return `${mins} min read`;
};

const ResourceRow = ({ resource }) => {
  const dateStr = resource.judgmentDate
    ? new Date(resource.judgmentDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : resource.createdAt
      ? new Date(resource.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
      : null;

  const bgClass = CATEGORY_BG[resource.category] || 'bg-slate-600';
  const labelClass = CATEGORY_LABEL_COLOUR[resource.category] || CATEGORY_LABEL_COLOUR.Other;
  const rt = readingTime(resource.summary);

  return (
    <div className="flex gap-5 bg-white border-b border-slate-100 py-6 hover:bg-slate-50 transition-colors">
      {/* Resource Cover */}

<div

  className={`

    hidden sm:flex

    flex-shrink-0

    w-40

    h-28

    rounded-xl

    ${bgClass}

    shadow-md

    flex-col

    justify-center

    items-center

    text-center

    px-4

  `}

>

    <div className="text-white text-lg font-bold tracking-[0.25em] uppercase">

        {resource.category || "Resource"}

    </div>

    <div className="w-12 border-b border-white/40 my-3"></div>

    <div className="text-white/80 text-xs uppercase tracking-[0.15em]">

        {resource.court

            ? resource.court

            : resource.category === "Article"

                ? "Medical Law"

                : resource.category === "Legal Notice"

                    ? "Pre-Litigation"

                    : resource.category === "RTI Template"

                        ? "Template"

                        : "DrDeath.in"}

    </div>

</div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Meta row */}
        <div className="flex flex-wrap items-center gap-2 mb-1.5 text-xs text-slate-500">
          <span className={`px-2 py-0.5 rounded-full font-medium ${labelClass}`}>
            {resource.category}
          </span>
          {dateStr && <><Calendar className="h-3 w-3" />{dateStr}</>}
          {resource.author && <><User className="h-3 w-3" />{resource.author}</>}
        </div>

        {/* Title */}
        <Link to={`/resources/${resource._id}`}
          className="

font-serif

text-xl

font-bold

leading-snug

text-primary

hover:text-secondary

transition-colors

line-clamp-2

block

mb-2

">
          {resource.title}
        </Link>

        {/* Citation */}
        {resource.citation && (
          <p className="text-xs font-mono text-amber-700 mb-1">{resource.citation}</p>
        )}

        {/* Summary excerpt */}
        {resource.summary && (
          <p className="text-sm text-slate-600 line-clamp-2 mb-2">{resource.summary}</p>
        )}

        {/* Footer: reading time + actions */}
        <div className="flex flex-wrap items-center gap-3">
          {rt && (
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <BookOpen className="h-3 w-3" /> {rt}
            </span>
          )}
          <Link to={`/resources/${resource._id}`}>
            <button className="text-xs px-3 py-1.5 bg-primary text-white hover:bg-slate-700 transition-colors font-semibold rounded">
              {resource.category === 'Judgment' ? 'Read Judgement' : 'Read Article'}
            </button>
          </Link>
          {resource.pdfUrl && (
            <a href={resource.pdfUrl} target="_blank" rel="noreferrer"
              className="text-xs px-3 py-1.5 border border-slate-300 text-slate-600 hover:bg-slate-100 transition-colors rounded flex items-center gap-1">
              <Download className="h-3 w-3" /> Download PDF
            </a>
          )}
          {resource.externalLink && (
            <a href={resource.externalLink} target="_blank" rel="noreferrer"
              className="text-xs px-3 py-1.5 border border-slate-300 text-slate-600 hover:bg-slate-100 transition-colors rounded flex items-center gap-1">
              <ExternalLink className="h-3 w-3" /> Source
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

const LIMIT = 10;
const SEARCH_FIELDS = [
  { value: 'all',      label: 'Full Text' },
  { value: 'title',    label: 'Title' },
  { value: 'author',   label: 'Author' },
  { value: 'citation', label: 'Citation' },
  { value: 'tags',     label: 'Tags' },
];

const LegalResearchRepository = () => {
  const [allResources, setAllResources] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [searchInput, setSearchInput]   = useState('');
  const [searchField, setSearchField]   = useState('all');
  const [search, setSearch]             = useState('');
  const [activeField, setActiveField]   = useState('all');
  const [category, setCategory]         = useState('All');
  const [court, setCourt]               = useState('All');
  const [sort, setSort]                 = useState('newest');
  const [page, setPage]                 = useState(1);

  useEffect(() => {
    let cancelled = false;
    axios.get(`${API}/resources`, { params: { limit: 500, sort: 'newest' } })
      .then(res => {
        if (cancelled) return;
        const data = res.data;
        const list = Array.isArray(data) ? data : (data.resources || []);
        setAllResources(list.filter(r => r.published !== false));
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const courtOptions = React.useMemo(() => {
    const courts = allResources.filter(r => r.category === 'Judgment').map(r => r.court).filter(Boolean).map(c => c.trim());
    return ['All', ...Array.from(new Set(courts)).sort()];
  }, [allResources]);

  const filtered = React.useMemo(() => {
    let list = allResources;
    if (category !== 'All') list = list.filter(r => r.category === category);
    if (court !== 'All')    list = list.filter(r => (r.court || '').trim() === court);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(r => {
        if (activeField === 'title')    return (r.title    || '').toLowerCase().includes(q);
        if (activeField === 'author')   return (r.author   || '').toLowerCase().includes(q);
        if (activeField === 'citation') return (r.citation || '').toLowerCase().includes(q);
        if (activeField === 'tags')     return (r.tags     || []).some(t => t.toLowerCase().includes(q));
        return (
          (r.title    || '').toLowerCase().includes(q) ||
          (r.citation || '').toLowerCase().includes(q) ||
          (r.summary  || '').toLowerCase().includes(q) ||
          (r.author   || '').toLowerCase().includes(q)
        );
      });
    }
    if (sort === 'oldest') list = [...list].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    else if (sort === 'az') list = [...list].sort((a, b) => a.title.localeCompare(b.title));
    else list = [...list].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return list;
  }, [allResources, category, court, search, activeField, sort]);

  const total     = filtered.length;
  const pages     = Math.max(1, Math.ceil(total / LIMIT));
  const safePage  = Math.min(page, pages);
  const pageItems = filtered.slice((safePage - 1) * LIMIT, safePage * LIMIT);

  const handleSearch    = (e) => { e.preventDefault(); setSearch(searchInput.trim()); setActiveField(searchField); setPage(1); };
  const clearSearch     = ()  => { setSearchInput(''); setSearch(''); setPage(1); };
  const handleCategory  = (cat) => { setCategory(cat); setPage(1); if (cat !== 'Judgment') setCourt('All'); };

  return (
    <section className="py-16 bg-slate-50" id="legal-repository">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-10">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-secondary mb-4">Knowledge Base</p>
          <h2 className="font-serif text-3xl font-bold text-primary mb-3">Legal Research Repository</h2>
          <p className="text-slate-500 text-sm max-w-xl mx-auto">
            Curated judgments, articles and legal resources on medical negligence in India.
          </p>
        </div>

        {/* Category tab bar */}
        <div className="flex flex-wrap border-b border-slate-300 mb-6 gap-1">
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => handleCategory(cat)}
              className={`px-4 py-2.5 text-sm font-semibold uppercase tracking-wide transition-colors border-b-2 -mb-px ${
                category === cat
                  ? 'border-primary text-primary bg-white'
                  : 'border-transparent text-slate-500 hover:text-primary hover:bg-white'
              }`}>
              {cat}
            </button>
          ))}
        </div>

        {/* Search bar with field selector */}
        <div className="bg-white border border-slate-200 rounded-lg p-3 mb-4 flex flex-wrap gap-2 items-center">
          <form onSubmit={handleSearch} className="flex flex-1 gap-2 min-w-0">
            <select value={searchField} onChange={e => setSearchField(e.target.value)}
              className="text-sm border border-slate-200 rounded px-2 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400 flex-shrink-0">
              {SEARCH_FIELDS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
            </select>
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input type="text" placeholder="Search..."
                className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                value={searchInput} onChange={e => setSearchInput(e.target.value)} />
            </div>
            <button type="submit" className="px-5 py-2 bg-primary text-white rounded text-sm font-semibold hover:bg-slate-700 transition-colors flex-shrink-0">
              Search
            </button>
            {search && (
              <button type="button" onClick={clearSearch}
                className="px-3 py-2 border border-slate-200 rounded text-sm text-slate-500 hover:bg-slate-50 transition-colors">
                Clear
              </button>
            )}
          </form>

          {/* Court filter — only for Judgments */}
          {category === 'Judgment' && courtOptions.length > 1 && (
            <select value={court} onChange={e => { setCourt(e.target.value); setPage(1); }}
              className="text-sm border border-slate-200 rounded px-2 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400 max-w-[180px]">
              {courtOptions.map(c => <option key={c} value={c}>{c === 'All' ? 'All Courts' : c}</option>)}
            </select>
          )}

          {/* Sort */}
          <select value={sort} onChange={e => { setSort(e.target.value); setPage(1); }}
            className="text-sm border border-slate-200 rounded px-2 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400">
            {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>

        {/* Result count */}
        <p className="text-xs text-slate-400 mb-2">
          {loading ? 'Loading...' : `${total} result${total !== 1 ? 's' : ''}${search ? ` for "${search}"` : ''}${category !== 'All' ? ` · ${category}` : ''}${court !== 'All' ? ` · ${court}` : ''}`}
        </p>

        {/* List */}
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
          {loading ? (
            <div className="flex justify-center py-16 text-slate-400">
              <Loader2 className="h-6 w-6 animate-spin mr-2" /> Loading...
            </div>
          ) : pageItems.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <Database className="h-10 w-10 mx-auto mb-3 opacity-40" />
              <p>No resources found{search ? ` for "${search}"` : ''}.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 px-5">
              {pageItems.map(r => <ResourceRow key={r._id} resource={r} />)}
            </div>
          )}
        </div>

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-6">
            <button disabled={safePage <= 1} onClick={() => setPage(p => p - 1)}
              className="p-2 rounded border border-slate-200 disabled:opacity-40 hover:bg-slate-50 transition-colors">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-sm text-slate-600">Page {safePage} of {pages}</span>
            <button disabled={safePage >= pages} onClick={() => setPage(p => p + 1)}
              className="p-2 rounded border border-slate-200 disabled:opacity-40 hover:bg-slate-50 transition-colors">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

// ── Main Resources Page ─────────────────────────────────────────────────────

const Resources = () => {
  const { settings } = useSettings();
  const [cases, setCases] = useState([]);
  const [selectedCase, setSelectedCase] = useState(null);
  const [isCaseDialogOpen, setIsCaseDialogOpen] = useState(false);

  useEffect(() => {
    const fetchCases = async () => {
      try {
        const response = await axios.get(`${API}/cases`);
        setCases(response.data);
      } catch (error) {
        console.error('Error fetching cases:', error);
      }
    };
    fetchCases();
  }, []);

  const handleCaseClick = (caseItem) => {
    setSelectedCase(caseItem);
    setIsCaseDialogOpen(true);
  };

  const legalResources = [
    {
      title: 'Consumer Protection Act, 2019',
      description: 'Medical services fall under this act. Victims can file complaints in Consumer Courts for compensation.',
      link: 'https://consumeraffairs.nic.in/acts-and-rules/consumer-protection-act-2019'
    },
    {
      title: 'Indian Medical Council Act, 1956',
      description: 'Governs medical professionals and allows complaints to State Medical Councils for disciplinary action.',
      link: 'https://www.nmc.org.in/'
    },
    {
      title: 'Clinical Establishments Act, 2010',
      description: 'Mandates minimum standards for healthcare facilities. Non-compliance can be reported.',
      link: 'https://clinicalestablishments.gov.in/'
    },
    {
      title: 'Jacob Mathews Vs State of Punjab',
      description: 'The main problem - A landmark Supreme Court case that is the biggest hurdle in your path to justice. It is misinterpreted by courts and investigating agencies.',
      link: 'https://indiankanoon.org/doc/871062/'
    }
  ];

  const steps = [
    {
      number: '01',
      title: 'Document Everything',
      description: 'Collect all medical records, prescriptions, bills, and correspondence with the healthcare provider.'
    },
    {
      number: '02',
      title: 'Get Medical Opinion',
      description: 'Consult another qualified doctor to understand if negligence occurred and get a written opinion.'
    },
    {
      number: '03',
      title: 'File a Complaint',
      description: 'Choose the appropriate forum: Consumer Court, State Medical Council, or file a civil/criminal case.'
    },
    {
      number: '04',
      title: 'Seek Legal Help',
      description: 'Consult a lawyer specializing in medical negligence cases for proper legal representation.'
    }
  ];

  return (
    <div data-testid="resources-page">
      {/* Hero Section */}
      <section className="relative py-20 bg-primary" data-testid="resources-hero">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-secondary mb-4">
              Legal Resources
            </p>
            <h1 className="font-serif text-4xl md:text-5xl font-bold text-white mb-6">
              {settings.resources_hero_title || 'Know Your Rights'}
            </h1>
            <p className="text-lg text-slate-300 leading-relaxed">
              {settings.resources_hero_description ||
                'Understanding the legal framework for medical negligence in India empowers you to seek justice and hold healthcare providers accountable.'}
            </p>
          </div>
        </div>
      </section>

      {/* What is Medical Negligence */}
      <section className="py-16 bg-white" data-testid="definition-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.3em] text-secondary mb-4">
                Understanding
              </p>
              <h2 className="font-serif text-3xl font-bold text-primary mb-6">
                What Constitutes Medical Negligence?
              </h2>
              <p className="text-slate-600 leading-relaxed mb-6">
                Medical negligence in India is established when a healthcare provider fails to meet
                the standard of care expected from a reasonably competent professional, resulting in
                harm to the patient.
              </p>
              <div className="space-y-4">
                {[
                  ['Duty of Care', 'A doctor-patient relationship must exist'],
                  ['Breach of Duty', 'The standard of care was not met'],
                  ['Causation', 'The breach directly caused harm'],
                  ['Damages', 'Actual harm or loss occurred']
                ].map(([title, desc]) => (
                  <div key={title} className="flex gap-4">
                    <AlertTriangle className="h-6 w-6 text-secondary flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="font-semibold text-primary mb-1">{title}</h4>
                      <p className="text-sm text-slate-600">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <img
                src="https://images.pexels.com/photos/5669602/pexels-photo-5669602.jpeg"
                alt="Legal gavel"
                className="w-full h-80 object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Steps to Take */}
      <section className="py-16 bg-slate-50" data-testid="steps-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-secondary mb-4">
              Take Action
            </p>
            <h2 className="font-serif text-3xl font-bold text-primary mb-4">
              Steps to Pursue a Medical Negligence Case
            </h2>
            <div className="max-w-3xl mx-auto mt-4 mb-6">
              <p className="text-sm text-slate-600 italic border-l-4 border-secondary pl-4 py-2 bg-slate-50">
                <strong>Disclaimer:</strong> These steps are not chronological. In most cases, you
                may have to seek legal opinion first or file a police complaint.
              </p>
            </div>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, index) => (
              <Card key={index} className="border-slate-200 relative" data-testid={`step-${index + 1}`}>
                <CardContent className="p-6 pt-12">
                  <span className="absolute top-4 left-6 font-mono text-4xl font-bold text-black">
                    {step.number}
                  </span>
                  <h3 className="font-serif text-lg font-bold text-primary mb-2 relative z-10">
                    {step.title}
                  </h3>
                  <p className="text-sm text-slate-600">{step.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Legal Framework */}
      <section className="py-16 bg-white" data-testid="legal-framework-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-secondary mb-4">
              Legal Framework
            </p>
            <h2 className="font-serif text-3xl font-bold text-primary">
              Key Laws & Regulations
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {legalResources.map((resource, index) => (
              <Card
                key={index}
                className="border-slate-200 hover:shadow-lg transition-shadow"
                data-testid={`legal-resource-${index}`}
              >
                <CardHeader>
                  <Scale className="h-8 w-8 text-secondary mb-2" />
                  <CardTitle className="font-serif text-lg">{resource.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-600 mb-4">{resource.description}</p>
                  <a
                    href={resource.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-sm text-secondary hover:text-amber-700 font-medium"
                  >
                    Learn More <ExternalLink className="ml-1 h-3 w-3" />
                  </a>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── Legal Research Repository (dynamic, from DB) ── */}
      <LegalResearchRepository />

      {/* Our Cases */}
      {cases.length > 0 && (
        <section className="py-16 bg-white" data-testid="our-cases-section">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <p className="font-mono text-xs uppercase tracking-[0.3em] text-secondary mb-4">
                Our Cases
              </p>
              <h2 className="font-serif text-3xl font-bold text-primary">
                Cases We're Working On
              </h2>
            </div>
            <div className="overflow-x-auto pb-4 scroll-smooth">
              <div className="flex gap-6 min-w-max px-2">
                {cases.map((caseItem) => (
                  <Card
                    key={caseItem.id}
                    className="w-80 flex-shrink-0 border-slate-200 hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => handleCaseClick(caseItem)}
                  >
                    <div className="relative">
                      {caseItem.image_url || caseItem.youtube_thumbnail ? (
                        <div className="relative h-48 w-full overflow-hidden rounded-t-lg bg-slate-100">
                          <img
                            src={getImageUrl(caseItem.image_url || caseItem.youtube_thumbnail)}
                            alt={caseItem.title}
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                          {caseItem.youtube_url && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
                              <a
                                href={caseItem.youtube_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center w-16 h-16 bg-red-600 rounded-full hover:bg-red-700 transition-colors"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Play className="h-8 w-8 text-white ml-1" />
                              </a>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="h-48 w-full bg-slate-100 flex items-center justify-center rounded-t-lg">
                          <FileText className="h-12 w-12 text-slate-400" />
                        </div>
                      )}
                    </div>
                    <CardContent className="p-6">
                      <h3 className="font-serif text-lg font-bold text-primary mb-2">
                        {caseItem.title}
                      </h3>
                      <p className="text-sm text-slate-600 line-clamp-3 mb-4">
                        {caseItem.description}
                      </p>
                      {caseItem.youtube_url && (
                        <a
                          href={caseItem.youtube_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-sm text-secondary hover:text-amber-700 font-medium"
                          onClick={(e) => e.stopPropagation()}
                        >
                          Watch Video <ExternalLink className="ml-1 h-3 w-3" />
                        </a>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Where to File Complaint */}
      <section className="py-16 bg-slate-50" data-testid="complaint-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-secondary mb-4 text-center">
              Forums for Redressal
            </p>
            <h2 className="font-serif text-3xl font-bold text-primary mb-8 text-center">
              Where Can You File a Complaint?
            </h2>
            <div className="space-y-6">
              <Card className="border-slate-200">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <Building2 className="h-8 w-8 text-secondary flex-shrink-0" />
                    <div>
                      <h3 className="font-serif text-lg font-bold text-primary mb-2">Consumer Courts</h3>
                      <p className="text-slate-600 text-sm mb-3">
                        Most accessible forum for medical negligence cases. File based on expenses
                        incurred NOT THE COMPENSATION demanded:
                      </p>
                      <ul className="text-sm text-slate-600 space-y-1">
                        <li>• <strong>District Commissions</strong> handle up to ₹50 Lakhs</li>
                        <li>• <strong>State Commissions</strong> handle over ₹50 Lakhs to ₹2 Crores</li>
                        <li>• <strong>National Commission</strong> handles cases exceeding ₹2 Crores</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-200">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <FileText className="h-8 w-8 text-secondary flex-shrink-0" />
                    <div>
                      <h3 className="font-serif text-lg font-bold text-primary mb-2">
                        State Medical Council
                      </h3>
                      <p className="text-slate-600 text-sm">
                        File complaints against registered medical practitioners for professional
                        misconduct. Can result in suspension or cancellation of medical license.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-200">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <Scale className="h-8 w-8 text-secondary flex-shrink-0" />
                    <div>
                      <h3 className="font-serif text-lg font-bold text-primary mb-2">
                        Civil & Criminal Courts
                      </h3>
                      <p className="text-slate-600 text-sm">
                        For cases involving serious negligence or death. Civil suits for
                        compensation, criminal cases under IPC Section 304A (death by negligence)
                        or Section 338 (grievous hurt).
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Patient Rights */}
      <section className="py-16 bg-slate-50" data-testid="rights-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-secondary mb-4 text-center">
              Know Your Rights
            </p>
            <h2 className="font-serif text-3xl font-bold text-primary mb-8 text-center">
              Patient Rights in India
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                'Right to informed consent',
                'Right to access medical records',
                'Right to confidentiality',
                'Right to second opinion',
                'Right to emergency treatment',
                'Right to refuse treatment',
                'Right to transparent billing',
                'Right to quality care'
              ].map((right, index) => (
                <div key={index} className="flex items-center gap-3 bg-white p-4 border border-slate-200">
                  <CheckCircle className="h-5 w-5 text-accent flex-shrink-0" />
                  <span className="text-slate-700">{right}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Custom Content Section */}
      {settings.resources_content && (
        <section className="py-16 bg-white" data-testid="custom-resources-content">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div
              className="prose prose-slate max-w-none"
              dangerouslySetInnerHTML={{ __html: settings.resources_content }}
            />
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-16 bg-primary" data-testid="resources-cta">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <BookOpen className="h-12 w-12 text-secondary mx-auto mb-6" />
          <h2 className="font-serif text-3xl font-bold text-white mb-4">
            Need More Information?
          </h2>
          <p className="text-slate-300 mb-8">
            Contact us for personalized guidance on your medical negligence case.
          </p>
          <Link to="/contact" data-testid="contact-resources-btn">
            <Button
              size="lg"
              className="bg-secondary hover:bg-amber-700 text-white uppercase tracking-widest font-bold"
            >
              Contact Us
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Case Detail Dialog */}
      <Dialog open={isCaseDialogOpen} onOpenChange={setIsCaseDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl font-bold text-primary">
              {selectedCase?.title}
            </DialogTitle>
            <DialogDescription>Full case details</DialogDescription>
          </DialogHeader>

          {selectedCase && (
            <div className="space-y-6">
              {(selectedCase.image_url || selectedCase.youtube_thumbnail) && (
                <div className="relative w-full h-64 md:h-96 rounded-lg overflow-hidden bg-slate-100">
                  <img
                    src={getImageUrl(selectedCase.image_url || selectedCase.youtube_thumbnail)}
                    alt={selectedCase.title}
                    className="w-full h-full object-contain"
                  />
                  {selectedCase.youtube_url && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
                      <a
                        href={selectedCase.youtube_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center w-20 h-20 bg-red-600 rounded-full hover:bg-red-700 transition-colors"
                      >
                        <Play className="h-10 w-10 text-white ml-1" />
                      </a>
                    </div>
                  )}
                </div>
              )}

              <div className="prose prose-slate max-w-none">
                <h3 className="font-serif text-lg font-bold text-primary mb-3">Case Details</h3>
                <div className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {selectedCase.description?.split('\n').map((paragraph, index) => (
                    <p key={index} className="mb-4">{paragraph}</p>
                  ))}
                </div>
              </div>

              {selectedCase.youtube_url && (
                <div className="pt-4 border-t border-slate-200">
                  <a
                    href={selectedCase.youtube_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-secondary hover:text-amber-700 font-medium"
                  >
                    Watch Video on YouTube <ExternalLink className="ml-2 h-4 w-4" />
                  </a>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Resources;
