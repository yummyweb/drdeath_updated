import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { getApiUrl } from '@/config/env';
import { BadgeCheck, MapPin, Globe, Linkedin, Stethoscope } from 'lucide-react';

const API = getApiUrl();

const SPECIALIZATIONS = [
  'General Medicine', 'General Surgery', 'Obstetrics & Gynaecology', 'Paediatrics',
  'Orthopaedics', 'Cardiology', 'Cardiothoracic Surgery', 'Neurology', 'Neurosurgery',
  'Oncology', 'Oncosurgery', 'Radiology', 'Anaesthesiology', 'Pathology',
  'Dermatology', 'Psychiatry', 'Ophthalmology', 'ENT', 'Urology', 'Nephrology',
  'Gastroenterology', 'Pulmonology', 'Endocrinology', 'Rheumatology',
  'Plastic Surgery', 'Vascular Surgery', 'Emergency Medicine', 'ICU & Critical Care',
  'Public Health', 'Forensic Medicine', 'Medical Ethics', 'Other',
];

const AVAIL_LABEL = {
  available:   { text: 'Available', cls: 'bg-green-100 text-green-700' },
  limited:     { text: 'Limited',   cls: 'bg-amber-100 text-amber-700' },
  unavailable: { text: 'Unavailable', cls: 'bg-slate-100 text-slate-500' },
};

function DoctorCard({ d }) {
  const avail = AVAIL_LABEL[d.availability] || AVAIL_LABEL.unavailable;
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-sm transition-shadow">
      <div className="flex items-start gap-4">
        {d.photo_url ? (
          <img src={d.photo_url} alt={d.full_name} className="h-14 w-14 rounded-full object-cover flex-shrink-0" />
        ) : (
          <div className="h-14 w-14 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 text-slate-400">
            <Stethoscope className="h-6 w-6" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-0.5">
            <span className="font-semibold text-slate-900">{d.full_name}</span>
            {d.verified && <BadgeCheck className="h-4 w-4 text-blue-500 flex-shrink-0" title="Verified" />}
          </div>

          <p className="text-sm text-slate-700 font-medium">{d.specialization}</p>
          {d.sub_specialization && <p className="text-xs text-slate-500">{d.sub_specialization}</p>}
          <p className="text-xs text-slate-500 mt-0.5">{d.qualification} · {d.experience_years} yr{d.experience_years !== 1 ? 's' : ''} experience</p>

          {(d.hospital || d.clinic) && (
            <p className="text-sm text-slate-600 mt-1">{d.hospital || d.clinic}</p>
          )}

          {(d.city || d.state) && (
            <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
              <MapPin className="h-3 w-3" />
              {[d.city, d.state].filter(Boolean).join(', ')}
            </p>
          )}

          {d.biography && (
            <p className="text-sm text-slate-600 mt-2 line-clamp-2">{d.biography}</p>
          )}

          {d.research_interests?.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {d.research_interests.slice(0, 4).map(r => (
                <span key={r} className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded">{r}</span>
              ))}
            </div>
          )}

          {d.languages?.length > 0 && (
            <p className="text-xs text-slate-400 mt-1">Languages: {d.languages.join(', ')}</p>
          )}

          <div className="flex items-center gap-3 mt-3">
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${avail.cls}`}>{avail.text}</span>
            {d.linkedin && (
              <a href={d.linkedin} target="_blank" rel="noreferrer" className="text-blue-600 hover:text-blue-700">
                <Linkedin className="h-4 w-4" />
              </a>
            )}
            {d.website && (
              <a href={d.website} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-slate-600">
                <Globe className="h-4 w-4" />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const Doctors = () => {
  const [doctors, setDoctors]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [specialization, setSpec]   = useState('');
  const [search, setSearch]         = useState('');
  const [searchInput, setSearchInput] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = { limit: 50 };
      if (specialization) params.specialization = specialization;
      if (search)         params.search         = search;
      const res = await axios.get(`${API}/doctors`, { params });
      setDoctors(res.data.data || []);
    } catch {
      setDoctors([]);
    } finally {
      setLoading(false);
    }
  }, [specialization, search]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Medical Professionals</h1>
          <p className="text-slate-500 mt-1">
            Doctors and medical experts supporting VOICE's mission of patient safety and healthcare accountability.
          </p>
        </div>
        <Link
          to="/doctor-register"
          className="bg-slate-900 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-slate-700 whitespace-nowrap"
        >
          Register as Doctor
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

      {/* Specialization filter */}
      <div className="flex gap-2 flex-wrap mb-6">
        <button
          onClick={() => setSpec('')}
          className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
            !specialization ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
          }`}
        >
          All
        </button>
        {SPECIALIZATIONS.map(s => (
          <button
            key={s}
            onClick={() => setSpec(s)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
              specialization === s ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-16 text-slate-400">Loading…</div>
      ) : doctors.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <Stethoscope className="h-12 w-12 mx-auto mb-4 text-slate-300" />
          <p className="mb-4">No doctors found{specialization ? ` for ${specialization}` : ''}.</p>
          <Link to="/doctor-register" className="text-sm text-amber-700 hover:underline">
            Be the first to register
          </Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {doctors.map(d => <DoctorCard key={d._id} d={d} />)}
        </div>
      )}
    </div>
  );
};

export default Doctors;
