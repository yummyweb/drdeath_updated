import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { getApiUrl } from '@/config/env';
import { BadgeCheck, MapPin, Globe, Linkedin } from 'lucide-react';

const API = getApiUrl();

const CATEGORIES = [
  'Legal Volunteer', 'Medical Volunteer', 'Research Volunteer', 'Student Volunteer',
  'Translator', 'Graphic Designer', 'Social Media', 'Fundraising',
  'Community Moderator', 'Technology Volunteer',
];

const CATEGORY_COLOUR = {
  'Legal Volunteer':     'bg-blue-100 text-blue-700',
  'Medical Volunteer':   'bg-red-100 text-red-700',
  'Research Volunteer':  'bg-purple-100 text-purple-700',
  'Student Volunteer':   'bg-green-100 text-green-700',
  'Translator':          'bg-teal-100 text-teal-700',
  'Graphic Designer':    'bg-pink-100 text-pink-700',
  'Social Media':        'bg-orange-100 text-orange-700',
  'Fundraising':         'bg-amber-100 text-amber-700',
  'Community Moderator': 'bg-indigo-100 text-indigo-700',
  'Technology Volunteer':'bg-slate-100 text-slate-700',
};

function VolunteerCard({ v }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-sm transition-shadow">
      <div className="flex items-start gap-4">
        {v.photo_url ? (
          <img src={v.photo_url} alt={v.full_name} className="h-12 w-12 rounded-full object-cover flex-shrink-0" />
        ) : (
          <div className="h-12 w-12 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0 text-slate-500 font-semibold text-lg">
            {v.full_name.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="font-semibold text-slate-900">{v.full_name}</span>
            {v.verified && (
              <BadgeCheck className="h-4 w-4 text-blue-500 flex-shrink-0" title="Verified" />
            )}
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${CATEGORY_COLOUR[v.category] || 'bg-slate-100 text-slate-600'}`}>
              {v.category}
            </span>
          </div>

          {v.profession && <p className="text-sm text-slate-600">{v.profession}{v.institution ? ` · ${v.institution}` : ''}</p>}

          {(v.city || v.state) && (
            <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
              <MapPin className="h-3 w-3" />
              {[v.city, v.state].filter(Boolean).join(', ')}
            </p>
          )}

          {v.biography && (
            <p className="text-sm text-slate-600 mt-2 line-clamp-2">{v.biography}</p>
          )}

          {v.skills?.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {v.skills.slice(0, 5).map(s => (
                <span key={s} className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded">{s}</span>
              ))}
            </div>
          )}

          {v.languages?.length > 0 && (
            <p className="text-xs text-slate-400 mt-1">Languages: {v.languages.join(', ')}</p>
          )}

          <div className="flex gap-3 mt-3">
            {v.linkedin && (
              <a href={v.linkedin} target="_blank" rel="noreferrer" className="text-blue-600 hover:text-blue-700">
                <Linkedin className="h-4 w-4" />
              </a>
            )}
            {v.website && (
              <a href={v.website} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-slate-600">
                <Globe className="h-4 w-4" />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const Volunteers = () => {
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [category, setCategory]     = useState('');
  const [search, setSearch]         = useState('');
  const [searchInput, setSearchInput] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = { limit: 50 };
      if (category) params.category = category;
      if (search)   params.search   = search;
      const res = await axios.get(`${API}/volunteers`, { params });
      setVolunteers(res.data.data || []);
    } catch {
      setVolunteers([]);
    } finally {
      setLoading(false);
    }
  }, [category, search]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Volunteer Network</h1>
          <p className="text-slate-500 mt-1">Meet the people powering VOICE across India.</p>
        </div>
        <Link
          to="/volunteer-register"
          className="bg-slate-900 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-slate-700 whitespace-nowrap"
        >
          Join as Volunteer
        </Link>
      </div>

      {/* Search */}
      <form className="flex gap-2 mb-4" onSubmit={e => { e.preventDefault(); setSearch(searchInput); }}>
        <input
          type="text"
          placeholder="Search by name…"
          className="flex-1 border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
          value={searchInput}
          onChange={e => setSearchInput(e.target.value)}
        />
        <button type="submit" className="px-4 py-2 bg-slate-900 text-white rounded-md text-sm hover:bg-slate-700">
          Search
        </button>
      </form>

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
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
              category === cat ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-16 text-slate-400">Loading…</div>
      ) : volunteers.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <p className="mb-4">No volunteers found.</p>
          <Link to="/volunteer-register" className="text-sm text-amber-700 hover:underline">
            Be the first to register
          </Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {volunteers.map(v => <VolunteerCard key={v._id} v={v} />)}
        </div>
      )}
    </div>
  );
};

export default Volunteers;
