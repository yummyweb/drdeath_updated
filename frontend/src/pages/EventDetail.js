import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Calendar, MapPin, Globe, Clock, Users, Tag,
  Wifi, Building2, LayoutGrid, ChevronLeft, ExternalLink, UserCircle,
} from 'lucide-react';
import { getApiUrl } from '@/config/env';

const API = getApiUrl();

const FORMAT_ICON = {
  'In-person': <Building2 className="h-4 w-4" />,
  'Online':    <Wifi className="h-4 w-4" />,
  'Hybrid':    <LayoutGrid className="h-4 w-4" />,
};

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

function formatDate(d) {
  return new Date(d).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

const EventDetail = () => {
  const { slug }  = useParams();
  const navigate  = useNavigate();
  const [event, setEvent]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    axios.get(`${API}/events/${slug}`)
      .then(res => setEvent(res.data))
      .catch(() => setError('Event not found'))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-slate-400">Loading…</div>;
  if (error)   return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-slate-400">
      <p>{error}</p>
      <Link to="/events" className="text-sm text-amber-700 hover:underline">Back to Events</Link>
    </div>
  );

  const past      = new Date(event.date) < new Date();
  const deadlinePassed = event.registration_deadline && new Date(event.registration_deadline) < new Date();

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">

      {/* Back */}
      <Link to="/events" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800 mb-6">
        <ChevronLeft className="h-4 w-4" /> All Events
      </Link>

      {/* Hero image */}
      {event.image_url && (
        <img src={event.image_url} alt={event.title} className="w-full h-56 sm:h-72 object-cover rounded-xl mb-6" />
      )}

      <div className="grid lg:grid-cols-3 gap-8">

        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">

          {/* Type + format badges */}
          <div className="flex flex-wrap gap-2">
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${TYPE_COLOUR[event.event_type] || 'bg-slate-100 text-slate-600'}`}>
              {event.event_type}
            </span>
            <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full flex items-center gap-1">
              {FORMAT_ICON[event.format]}
              {event.format}
            </span>
            {event.featured && <span className="text-xs bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full font-medium">Featured</span>}
            {event.status === 'cancelled' && <span className="text-xs bg-red-100 text-red-700 px-2.5 py-1 rounded-full font-medium">Cancelled</span>}
            {past && event.status !== 'cancelled' && <span className="text-xs bg-slate-100 text-slate-500 px-2.5 py-1 rounded-full">Past Event</span>}
          </div>

          <h1 className="text-3xl font-bold text-slate-900 leading-tight">{event.title}</h1>

          {/* Description */}
          <div>
            <h2 className="font-semibold text-slate-800 text-lg mb-2">About This Event</h2>
            <p className="text-slate-600 whitespace-pre-line leading-relaxed">{event.description}</p>
          </div>

          {/* Agenda */}
          {event.agenda && (
            <div>
              <h2 className="font-semibold text-slate-800 text-lg mb-2">Agenda / Programme</h2>
              <div className="bg-slate-50 rounded-lg p-4 text-sm text-slate-700 whitespace-pre-line leading-relaxed border border-slate-200">
                {event.agenda}
              </div>
            </div>
          )}

          {/* Speakers */}
          {event.speakers?.length > 0 && (
            <div>
              <h2 className="font-semibold text-slate-800 text-lg mb-3">Speakers</h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {event.speakers.map((s, i) => (
                  <div key={i} className="flex items-start gap-3 bg-slate-50 rounded-lg p-3 border border-slate-200">
                    <UserCircle className="h-8 w-8 text-slate-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-slate-900 text-sm">{s.name}</p>
                      {s.designation && <p className="text-xs text-slate-500">{s.designation}</p>}
                      {s.bio && <p className="text-xs text-slate-400 mt-1 line-clamp-2">{s.bio}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {event.tags?.length > 0 && (
            <div>
              <h2 className="font-semibold text-slate-800 text-sm mb-2 flex items-center gap-1.5">
                <Tag className="h-4 w-4" /> Tags
              </h2>
              <div className="flex flex-wrap gap-1.5">
                {event.tags.map(t => (
                  <span key={t} className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded">{t}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">

          {/* Date & time */}
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <h3 className="font-semibold text-slate-700 text-sm mb-3">Date & Time</h3>
            <p className="text-sm text-slate-700 flex items-start gap-2">
              <Calendar className="h-4 w-4 mt-0.5 flex-shrink-0 text-slate-400" />
              <span>
                {formatDate(event.date)}
                {event.end_date && event.end_date !== event.date && <><br />to {formatDate(event.end_date)}</>}
              </span>
            </p>
            {event.time && (
              <p className="text-sm text-slate-600 flex items-center gap-2 mt-1.5">
                <Clock className="h-4 w-4 flex-shrink-0 text-slate-400" />
                {event.time}
              </p>
            )}
          </div>

          {/* Location */}
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <h3 className="font-semibold text-slate-700 text-sm mb-3">Location</h3>
            {event.format === 'Online' || event.format === 'Hybrid' ? (
              <p className="text-sm text-slate-600 flex items-center gap-2">
                <Wifi className="h-4 w-4 flex-shrink-0 text-slate-400" />
                Online
              </p>
            ) : null}
            {(event.format === 'In-person' || event.format === 'Hybrid') && (event.venue || event.city) ? (
              <p className="text-sm text-slate-600 flex items-start gap-2 mt-1">
                <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0 text-slate-400" />
                <span>
                  {[event.venue, event.address, event.city, event.state].filter(Boolean).join(', ')}
                </span>
              </p>
            ) : null}
          </div>

          {/* Organiser */}
          {event.organizer && (
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <h3 className="font-semibold text-slate-700 text-sm mb-2">Organiser</h3>
              <p className="text-sm text-slate-700 font-medium">{event.organizer}</p>
            </div>
          )}

          {/* Registration */}
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <h3 className="font-semibold text-slate-700 text-sm mb-3">Admission</h3>
            <p className={`text-sm font-semibold mb-2 ${event.is_free ? 'text-green-700' : 'text-slate-800'}`}>
              {event.is_free ? 'Free Entry' : `₹${event.fee}`}
            </p>

            {event.max_attendees && (
              <p className="text-xs text-slate-500 flex items-center gap-1 mb-3">
                <Users className="h-3 w-3" /> Max {event.max_attendees} attendees
              </p>
            )}

            {event.registration_required && (
              <>
                {event.registration_deadline && (
                  <p className={`text-xs mb-2 ${deadlinePassed ? 'text-red-500' : 'text-slate-500'}`}>
                    Registration deadline: {formatDate(event.registration_deadline)}
                    {deadlinePassed ? ' (Closed)' : ''}
                  </p>
                )}
                {event.registration_link && !past && !deadlinePassed && event.status !== 'cancelled' ? (
                  <a
                    href={event.registration_link}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white py-2.5 rounded-md text-sm font-medium hover:bg-slate-700 transition-colors"
                  >
                    Register Now <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                ) : (
                  <div className="w-full text-center text-sm text-slate-400 py-2 border border-slate-200 rounded-md">
                    {event.status === 'cancelled' ? 'Event Cancelled' : past ? 'Event has ended' : 'Registration closed'}
                  </div>
                )}
              </>
            )}

            {event.format !== 'In-person' && event.online_link && !past && event.status === 'published' && (
              <a
                href={event.online_link}
                target="_blank"
                rel="noreferrer"
                className="mt-2 w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-2.5 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                Join Online <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetail;
