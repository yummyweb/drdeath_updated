import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { getApiUrl } from '@/config/env';
import { Briefcase, BookOpen, GraduationCap, Award, FlaskConical, Star, Handshake, MapPin, Clock, Users, ChevronRight } from 'lucide-react';

const API = getApiUrl();

const CATEGORIES = [
  'Job', 'Internship', 'Fellowship', 'Volunteer Position',
  'Research Project', 'Expert Invitation', 'Collaborate With VOICE',
];

const CATEGORY_META = {
  'Job':                   { icon: Briefcase,   colour: 'blue' },
  'Internship':            { icon: GraduationCap, colour: 'green' },
  'Fellowship':            { icon: Award,        colour: 'purple' },
  'Volunteer Position':    { icon: Handshake,    colour: 'amber' },
  'Research Project':      { icon: FlaskConical, colour: 'teal' },
  'Expert Invitation':     { icon: Star,         colour: 'orange' },
  'Collaborate With VOICE':{ icon: BookOpen,     colour: 'slate' },
};

const COLOUR_CLASSES = {
  blue:   'bg-blue-100 text-blue-700',
  green:  'bg-green-100 text-green-700',
  purple: 'bg-purple-100 text-purple-700',
  amber:  'bg-amber-100 text-amber-700',
  teal:   'bg-teal-100 text-teal-700',
  orange: 'bg-orange-100 text-orange-700',
  slate:  'bg-slate-100 text-slate-600',
};

function CategoryBadge({ category }) {
  const meta = CATEGORY_META[category] || CATEGORY_META['Job'];
  const Icon = meta.icon;
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${COLOUR_CLASSES[meta.colour]}`}>
      <Icon className="h-3 w-3" />
      {category}
    </span>
  );
}

function OpportunityCard({ opp }) {
  const isExpired = opp.lastDate && new Date(opp.lastDate) < new Date();
  return (
    <Link
      to={`/opportunities/${opp._id}`}
      className={`block bg-white border rounded-xl p-5 hover:shadow-md transition-shadow ${
        opp.featured ? 'border-amber-300' : 'border-slate-200'
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <CategoryBadge category={opp.category} />
            {opp.featured && (
              <span className="text-xs bg-amber-50 text-amber-600 border border-amber-200 px-2 py-0.5 rounded-full">Featured</span>
            )}
            {isExpired && (
              <span className="text-xs bg-red-50 text-red-500 px-2 py-0.5 rounded-full">Deadline passed</span>
            )}
          </div>
          <h3 className="font-semibold text-slate-900 text-base leading-snug mb-1">{opp.title}</h3>
          {opp.department && <p className="text-xs text-slate-500 mb-2">{opp.department}</p>}
          <p className="text-sm text-slate-600 line-clamp-2">{opp.description?.replace(/<[^>]+>/g, '')}</p>
          <div className="flex flex-wrap gap-3 mt-3 text-xs text-slate-500">
            {opp.location && (
              <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{opp.location}</span>
            )}
            {opp.remote && opp.remote !== 'on-site' && (
              <span className="capitalize">{opp.remote}</span>
            )}
            {opp.employmentType && <span>{opp.employmentType}</span>}
            {opp.lastDate && (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Apply by {new Date(opp.lastDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            )}
            {opp.vacancies > 0 && (
              <span className="flex items-center gap-1"><Users className="h-3 w-3" />{opp.vacancies} position{opp.vacancies !== 1 ? 's' : ''}</span>
            )}
          </div>
          {opp.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {opp.tags.slice(0, 5).map(t => (
                <span key={t} className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded">{t}</span>
              ))}
            </div>
          )}
        </div>
        <ChevronRight className="h-5 w-5 text-slate-300 flex-shrink-0 mt-1" />
      </div>
    </Link>
  );
}

const Opportunities = () => {
  const [opps, setOpps]           = useState([]);
  const [loading, setLoading]     = useState(true);
  const [category, setCategory]   = useState('');
  const [search, setSearch]       = useState('');
  const [searchInput, setSearchInput] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = { limit: 50 };
      if (category) params.category = category;
      if (search)   params.search   = search;
      const res = await axios.get(`${API}/opportunities`, { params });
      setOpps(res.data.data || []);
    } catch {
      setOpps([]);
    } finally {
      setLoading(false);
    }
  }, [category, search]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Opportunities</h1>
        <p className="text-slate-500">
          Join VOICE as a professional, researcher, volunteer or collaborator. Find roles that match your expertise.
        </p>
      </div>

      {/* Search + filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <form
          className="flex flex-1 gap-2"
          onSubmit={e => { e.preventDefault(); setSearch(searchInput); }}
        >
          <input
            type="text"
            placeholder="Search opportunities…"
            className="flex-1 border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
          />
          <button type="submit" className="px-4 py-2 bg-slate-900 text-white rounded-md text-sm hover:bg-slate-700">
            Search
          </button>
        </form>
        <select
          className="border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
          value={category}
          onChange={e => setCategory(e.target.value)}
        >
          <option value="">All categories</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 flex-wrap mb-6">
        <button
          onClick={() => setCategory('')}
          className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
            !category ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
          }`}
        >
          All
        </button>
        {CATEGORIES.map(cat => {
          const meta = CATEGORY_META[cat];
          const Icon = meta.icon;
          return (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                category === cat ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Icon className="h-3 w-3" />
              {cat}
            </button>
          );
        })}
      </div>

      {/* Results */}
      {loading ? (
        <div className="text-center py-16 text-slate-400">Loading…</div>
      ) : opps.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <Briefcase className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p>No opportunities found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">{opps.length} opportunity{opps.length !== 1 ? 's' : ''}</p>
          {opps.map(opp => <OpportunityCard key={opp._id} opp={opp} />)}
        </div>
      )}
    </div>
  );
};

export default Opportunities;
