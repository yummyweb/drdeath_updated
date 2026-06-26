import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { BadgeCheck, MapPin, Globe, Linkedin, Twitter, Newspaper } from 'lucide-react';
import { getApiUrl } from '@/config/env';

const API = getApiUrl();

const BEATS = [
  'Health & Medicine', 'Medical Negligence', 'Patient Safety', 'Healthcare Policy',
  'Investigative Health Journalism', 'Pharmaceutical Industry', 'Hospital & Healthcare',
  'Consumer Rights', 'Legal Affairs', 'Science & Research',
  'Public Health', 'Mental Health', 'Medical Ethics', 'General Reporting',
];

const MEDIUM_COLOURS = {
  'Print':                           'bg-slate-100 text-slate-600',
  'Digital / Online':                'bg-blue-100 text-blue-700',
  'Television':                      'bg-purple-100 text-purple-700',
  'Radio':                           'bg-orange-100 text-orange-700',
  'Podcast':                         'bg-pink-100 text-pink-700',
  'Documentary':                     'bg-teal-100 text-teal-700',
  'Freelance':                       'bg-amber-100 text-amber-700',
  'Academic / Research Publication': 'bg-green-100 text-green-700',
};

function JournalistCard({ j }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-sm transition-shadow">
      <div className="flex items-start gap-4">
        {j.photo_url ? (
          <img src={j.photo_url} alt={j.full_name} className="h-14 w-14 rounded-full object-cover flex-shrink-0" />
        ) : (
          <div className="h-14 w-14 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
            <Newspaper className="h-6 w-6 text-slate-400" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-0.5">
            <span className="font-semibold text-slate-900">{j.full_name}</span>
            {j.verified && <BadgeCheck className="h-4 w-4 text-blue-500 flex-shrink-0" title="Verified" />}
          </div>

          {j.designation && <p className="text-sm text-slate-700 font-medium">{j.designation}</p>}
          {j.publication && <p className="text-xs text-slate-500">{j.publication}</p>}

          {(j.city || j.state) && (
            <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
              <MapPin className="h-3 w-3" />
              {[j.city, j.state].filter(Boolean).join(', ')}
            </p>
          )}

          {j.medium?.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {j.medium.map(m => (
                <span key={m} className={`text-xs px-2 py-0.5 rounded-full font-medium ${MEDIUM_COLOURS[m] || 'bg-slate-100 text-slate-600'}`}>
                  {m}
                </span>
              ))}
            </div>
          )}

          {j.beats?.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {j.beats.slice(0, 4).map(b => (
                <span key={b} className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded">{b}</span>
              ))}
            </div>
          )}

          {j.biography && <p className="text-sm text-slate-600 mt-2 line-clamp-2">{j.biography}</p>}

          {j.languages?.length > 0 && (
            <p className="text-xs text-slate-400 mt-1">Languages: {j.languages.join(', ')}</p>
          )}

          <div className="flex gap-3 mt-3">
            {j.linkedin && (
              <a href={j.linkedin} target="_blank" rel="noreferrer" className="text-blue-600 hover:text-blue-700">
                <Linkedin className="h-4 w-4" />
              </a>
            )}
            {j.twitter && (
              <a href={`https://twitter.com/${j.twitter.replace('@', '')}`} target="_blank" rel="noreferrer" className="text-sky-500 hover:text-sky-600">
                <Twitter className="h-4 w-4" />
              </a>
            )}
            {j.website && (
              <a href={j.website} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-slate-600">
                <Globe className="h-4 w-4" />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const Journalists = () => {
  const [journalists, setJournalists] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [beat, setBeat]               = useState('');
  const [search, setSearch]           = useState('');
  const [searchInput, setSearchInput] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = { limit: 50 };
      if (beat)   params.beat   = beat;
      if (search) params.search = search;
      const res = await axios.get(`${API}/journalists`, { params });
      setJournalists(res.data.data || []);
    } catch {
      setJournalists([]);
    } finally {
      setLoading(false);
    }
  }, [beat, search]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Journalist Network</h1>
          <p className="text-slate-500 mt-1">
            Media professionals and journalists committed to healthcare accountability reporting.
          </p>
        </div>
        <Link
          to="/journalist-register"
          className="bg-slate-900 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-slate-700 whitespace-nowrap"
        >
          Register as Journalist
        </Link>
      </div>

      {/* Search */}
      <form className="flex gap-2 mb-4" onSubmit={e => { e.preventDefault(); setSearch(searchInput); }}>
        <input
          type="text"
          placeholder="Search by name…"
          value={searchInput}
          onChange={e => setSearchInput(e.target.value)}
          className="flex-1 border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
        />
        <button type="submit" className="px-4 py-2 bg-slate-900 text-white rounded-md text-sm hover:bg-slate-700">
          Search
        </button>
      </form>

      {/* Beat filter */}
      <div className="flex gap-2 flex-wrap mb-6">
        <button
          onClick={() => setBeat('')}
          className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
            !beat ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
          }`}
        >
          All Beats
        </button>
        {BEATS.map(b => (
          <button
            key={b}
            onClick={() => setBeat(b)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
              beat === b ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {b}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-16 text-slate-400">Loading…</div>
      ) : journalists.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <Newspaper className="h-12 w-12 mx-auto mb-4 text-slate-300" />
          <p className="mb-4">No journalists found{beat ? ` for "${beat}"` : ''}.</p>
          <Link to="/journalist-register" className="text-sm text-amber-700 hover:underline">
            Be the first to register
          </Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {journalists.map(j => <JournalistCard key={j._id} j={j} />)}
        </div>
      )}
    </div>
  );
};

export default Journalists;
