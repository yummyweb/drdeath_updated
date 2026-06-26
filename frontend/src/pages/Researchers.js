import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { BadgeCheck, MapPin, Globe, Linkedin, FlaskConical, BookOpen } from 'lucide-react';
import { getApiUrl } from '@/config/env';

const API = getApiUrl();

const RESEARCH_DOMAINS = [
  'Medical Negligence & Liability', 'Patient Safety', 'Healthcare Quality',
  'Medical Ethics & Bioethics', 'Health Law & Policy', 'Clinical Governance',
  'Epidemiology', 'Public Health', 'Healthcare Systems & Management',
  'Pharmacovigilance', 'Medical Education', 'Mental Health',
  'Forensic Medicine & Medico-Legal', 'Consumer Health Rights',
  'Hospital Infection Control', 'Maternal & Child Health',
  'Oncology & Cancer Care', 'Rural & Primary Healthcare', 'Other',
];

function ResearcherCard({ r }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-sm transition-shadow">
      <div className="flex items-start gap-4">
        {r.photo_url ? (
          <img src={r.photo_url} alt={r.full_name} className="h-14 w-14 rounded-full object-cover flex-shrink-0" />
        ) : (
          <div className="h-14 w-14 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
            <FlaskConical className="h-6 w-6 text-slate-400" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-0.5">
            <span className="font-semibold text-slate-900">{r.full_name}</span>
            {r.verified && <BadgeCheck className="h-4 w-4 text-blue-500 flex-shrink-0" title="Verified" />}
            {r.open_to_collaborate && (
              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Open to collaborate</span>
            )}
          </div>

          {r.designation && <p className="text-sm text-slate-700 font-medium">{r.designation}</p>}
          {r.institution && <p className="text-xs text-slate-500">{r.institution}{r.department ? ` · ${r.department}` : ''}</p>}
          {r.qualification && <p className="text-xs text-slate-400">{r.qualification}{r.experience_years ? ` · ${r.experience_years} yrs experience` : ''}</p>}

          {(r.city || r.state) && (
            <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
              <MapPin className="h-3 w-3" />
              {[r.city, r.state].filter(Boolean).join(', ')}
            </p>
          )}

          {r.research_domains?.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {r.research_domains.slice(0, 4).map(d => (
                <span key={d} className="text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded">{d}</span>
              ))}
              {r.research_domains.length > 4 && (
                <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded">+{r.research_domains.length - 4}</span>
              )}
            </div>
          )}

          {r.biography && <p className="text-sm text-slate-600 mt-2 line-clamp-2">{r.biography}</p>}

          {r.current_research && (
            <p className="text-xs text-slate-500 mt-1 line-clamp-2 italic">{r.current_research}</p>
          )}

          {r.languages?.length > 0 && (
            <p className="text-xs text-slate-400 mt-1">Languages: {r.languages.join(', ')}</p>
          )}

          <div className="flex gap-3 mt-3">
            {r.linkedin && (
              <a href={r.linkedin} target="_blank" rel="noreferrer" className="text-blue-600 hover:text-blue-700">
                <Linkedin className="h-4 w-4" />
              </a>
            )}
            {r.google_scholar && (
              <a href={r.google_scholar} target="_blank" rel="noreferrer" title="Google Scholar" className="text-slate-500 hover:text-slate-700">
                <BookOpen className="h-4 w-4" />
              </a>
            )}
            {r.website && (
              <a href={r.website} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-slate-600">
                <Globe className="h-4 w-4" />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const Researchers = () => {
  const [researchers, setResearchers] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [domain, setDomain]           = useState('');
  const [search, setSearch]           = useState('');
  const [searchInput, setSearchInput] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = { limit: 50 };
      if (domain) params.domain = domain;
      if (search) params.search = search;
      const res = await axios.get(`${API}/researchers`, { params });
      setResearchers(res.data.data || []);
    } catch {
      setResearchers([]);
    } finally {
      setLoading(false);
    }
  }, [domain, search]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Research Network</h1>
          <p className="text-slate-500 mt-1">
            Academics and researchers advancing evidence-based healthcare accountability in India.
          </p>
        </div>
        <Link
          to="/researcher-register"
          className="bg-slate-900 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-slate-700 whitespace-nowrap"
        >
          Register as Researcher
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

      {/* Domain filter */}
      <div className="flex gap-2 flex-wrap mb-6">
        <button
          onClick={() => setDomain('')}
          className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
            !domain ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
          }`}
        >
          All Domains
        </button>
        {RESEARCH_DOMAINS.map(d => (
          <button
            key={d}
            onClick={() => setDomain(d)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
              domain === d ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {d}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-16 text-slate-400">Loading…</div>
      ) : researchers.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <FlaskConical className="h-12 w-12 mx-auto mb-4 text-slate-300" />
          <p className="mb-4">No researchers found{domain ? ` for "${domain}"` : ''}.</p>
          <Link to="/researcher-register" className="text-sm text-amber-700 hover:underline">
            Be the first to register
          </Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {researchers.map(r => <ResearcherCard key={r._id} r={r} />)}
        </div>
      )}
    </div>
  );
};

export default Researchers;
