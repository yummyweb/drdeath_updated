import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
  Calendar, MapPin, Globe, Clock, Tag, Users, ChevronRight,
  Wifi, Building2, LayoutGrid,
} from 'lucide-react';
import { getApiUrl } from '@/config/env';

const API = getApiUrl();

const EVENT_TYPES = [
  'Conference', 'Webinar', 'Workshop', 'Seminar',
  'Public Hearing', 'Awareness Campaign', 'Press Conference',
  'Legal Aid Camp', 'Support Group Meeting', 'Training', 'Other',
];

const TYPE_COLOUR = {
  'Conference':           'bg-blue-100 text-blue-700',
  'Webinar':              'bg-sky-100 text-sky-700',
  'Workshop':             'bg-purple-100 text-purple-700',
  'Seminar':              'bg-indigo-100 text-indigo-700',
  'Public Hearing':       'bg-red-100 text-red-700',
  'Awareness Campaign':   'bg-amber-100 text-amber-700',
  'Press Conference':     'bg-slate-100 text-slate-700',
  'Legal Aid Camp':       'bg-green-100 text-green-700',
  'Support Group Meeting':'bg-teal-100 text-teal-700',
  'Training':             'bg-orange-100 text-orange-700',
  'Other':                'bg-slate-100 text-slate-600',
};

const FORMAT_ICON = {
  'In-person': <Building2 className="h-3 w-3" />,
  'Online':    <Wifi className="h-3 w-3" />,
  'Hybrid':    <LayoutGrid className="h-3 w-3" />,
};

function formatDate(d) {
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
}

function isPast(d) {
  return new Date(d) < new Date();
}

function EventCard({ ev }) {
  const past = isPast(ev.date);
  return (
    <Link
      to={`/events/${ev.slug}`}
      className={`block bg-white border rounded-xl overflow-hidden hover:shadow-md transition-shadow ${past ? 'opacity-75' : ''} ${ev.featured ? 'border-amber-300' : 'border-slate-200'}`}
    >
      {ev.image_url && (
        <img src={ev.image_url} alt={ev.title} className="w-full h-40 object-cover" />
      )}
      <div className="p-5">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${TYPE_COLOUR[ev.event_type] || 'bg-slate-100 text-slate-600'}`}>
            {ev.event_type}
          </span>
          <span className="text-xs text-slate-500 flex items-center gap-1">
            {FORMAT_ICON[ev.format]}
            {ev.format}
          </span>
          {ev.featured && <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">Featured</span>}
          {past && <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">Past</span>}
          {ev.status === 'cancelled' && <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-medium">Cancelled</span>}
        </div>

        <h3 className="font-bold text-slate-900 text-lg leading-snug mb-2 line-clamp-2">{ev.title}</h3>

        <p className="text-sm text-slate-500 flex items-center gap-1.5 mb-1">
          <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
          {formatDate(ev.date)}{ev.end_date && ev.end_date !== ev.date ? ` – ${formatDate(ev.end_date)}` : ''}
          {ev.time && <span className="ml-1">· {ev.time}</span>}
        </p>

        {(ev.city || ev.venue || ev.online_link) && (
          <p className="text-sm text-slate-500 flex items-center gap-1.5 mb-2">
            {ev.format === 'Online' ? <Globe className="h-3.5 w-3.5 flex-shrink-0" /> : <MapPin className="h-3.5 w-3.5 flex-shrink-0" />}
            {ev.format === 'Online' ? 'Online Event' : [ev.venue, ev.city, ev.state].filter(Boolean).join(', ')}
          </p>
        )}

        <p className="text-sm text-slate-600 line-clamp-2 mb-3">{ev.description}</p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {ev.is_free ? (
              <span className="text-xs text-green-700 font-medium">Free</span>
            ) : (
              <span className="text-xs text-slate-700 font-medium">₹{ev.fee}</span>
            )}
            {ev.registration_required && (
              <span className="text-xs text-blue-600">Registration required</span>
            )}
          </div>
          <span className="text-xs text-slate-400 flex items-center gap-1">
            View details <ChevronRight className="h-3 w-3" />
          </span>
        </div>
      </div>
    </Link>
  );
}

const Events = () => {
  const [events, setEvents]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [type, setType]           = useState('');
  const [when, setWhen]           = useState('upcoming');
  const [search, setSearch]       = useState('');
  const [searchInput, setSearchInput] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = { limit: 50, when };
      if (type)   params.type   = type;
      if (search) params.search = search;
      const res = await axios.get(`${API}/events`, { params });
      setEvents(res.data.data || []);
    } catch {
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [type, when, search]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Events</h1>
        <p className="text-slate-500 mt-1">
          Conferences, webinars, workshops and campaigns on medical negligence, patient safety and healthcare accountability.
        </p>
      </div>

      {/* Upcoming / Past toggle */}
      <div className="flex gap-2 mb-4">
        {['upcoming', 'past'].map(w => (
          <button
            key={w}
            onClick={() => setWhen(w)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              when === w ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {w === 'upcoming' ? 'Upcoming' : 'Past Events'}
          </button>
        ))}
      </div>

      {/* Search */}
      <form className="flex gap-2 mb-4" onSubmit={e => { e.preventDefault(); setSearch(searchInput); }}>
        <input
          type="text"
          placeholder="Search events…"
          value={searchInput}
          onChange={e => setSearchInput(e.target.value)}
          className="flex-1 border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
        />
        <button type="submit" className="px-4 py-2 bg-slate-900 text-white rounded-md text-sm hover:bg-slate-700">
          Search
        </button>
      </form>

      {/* Type filter */}
      <div className="flex gap-2 flex-wrap mb-6">
        <button
          onClick={() => setType('')}
          className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
            !type ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
          }`}
        >
          All Types
        </button>
        {EVENT_TYPES.map(t => (
          <button
            key={t}
            onClick={() => setType(t)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
              type === t ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-16 text-slate-400">Loading…</div>
      ) : events.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <Calendar className="h-12 w-12 mx-auto mb-4 text-slate-300" />
          <p>{when === 'upcoming' ? 'No upcoming events at the moment.' : 'No past events found.'}</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-5">
          {events.map(ev => <EventCard key={ev._id} ev={ev} />)}
        </div>
      )}
    </div>
  );
};

export default Events;
