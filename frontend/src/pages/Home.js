import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useSettings } from '../context/SettingsContext';
import {
  ArrowRight, Search, Gavel, BookOpen, Shield, Users,
  FileText, Scale, Calendar, ChevronRight, ChevronLeft, Star, Phone, ShoppingCart
} from 'lucide-react';
import { getApiUrl } from '@/config/env';

const API = getApiUrl();

// ── Small reusable components ──────────────────────────────────────────────────

const SectionLabel = ({ children }) => (
  <p className="font-mono text-xs uppercase tracking-[0.25em] text-accent mb-3">
    {children}
  </p>
);

const SectionTitle = ({ children, light = false }) => (
  <h2 className={`font-serif text-3xl md:text-4xl font-bold leading-tight ${light ? 'text-white' : 'text-primary'}`}>
    {children}
  </h2>
);

// ── Section: Hero Carousel ────────────────────────────────────────────────────

const HERO_SLIDES = [
  {
    tagline: 'Fighting for Justice for Victims of Medical Negligence',
    title: 'Patient Rights · Medical Accountability · Access to Justice',
    subtitle: 'A patient advocacy initiative dedicated to supporting victims of medical negligence in India through legal resources, community support, public awareness and access to justice.',
  },
  {
    tagline: null,
    title: 'India\'s Knowledge Centre on Medical Negligence',
    subtitle: 'Landmark judgments, patient rights, expert advocates, and community support — all in one place.',
  },
];

const Hero = ({ settings, onSearch }) => {
  const [q, setQ] = useState('');
  const [slide, setSlide] = useState(0);
  const slideRef = useRef(0); // always current — avoids stale closure in interval

  const goTo = useCallback((idx) => {
    if (idx === slideRef.current) return;
    slideRef.current = idx;
    setSlide(idx);
  }, []);

  useEffect(() => {
    const t = setInterval(() => {
      goTo((slideRef.current + 1) % HERO_SLIDES.length);
    }, 5000);
    return () => clearInterval(t);
  }, [goTo]); // single stable interval — no stale closures

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(q);
  };

  return (
    <section className="relative overflow-hidden" style={{ background: 'linear-gradient(160deg, hsl(220 55% 13%) 0%, hsl(220 55% 18%) 50%, hsl(220 45% 22%) 100%)' }}>
      {/* Radial glow top-centre */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 70% 50% at 50% -10%, hsl(172 65% 30% / 0.22) 0%, transparent 70%)' }} />
      {/* Grid overlay */}
      <div className="absolute inset-0 hero-grid-overlay pointer-events-none" />
      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, transparent, hsl(220 55% 13% / 0.4))' }} />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12 text-center">

        {/* ── Slides — fixed height, cross-fade ── */}
        <div className="relative mb-8" style={{ height: '22rem' }}>
          {HERO_SLIDES.map((s, i) => (
            <div
              key={i}
              className="absolute inset-0 flex flex-col items-center justify-center transition-opacity duration-700 ease-in-out"
              style={{ opacity: i === slide ? 1 : 0, pointerEvents: i === slide ? 'auto' : 'none' }}
              aria-hidden={i !== slide}
            >
              {s.tagline && (
                <span className="label-eyebrow inline-flex items-center gap-2 text-accent border border-accent/40 bg-accent/10 px-4 py-1.5 rounded-full mb-6 backdrop-blur-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent inline-block" />
                  {s.tagline}
                </span>
              )}
              <h1 className="heading-display text-white text-4xl sm:text-5xl lg:text-[3.5rem] mb-6 px-4 max-w-4xl text-balance">
                {s.title}
              </h1>
              <p className="text-base sm:text-lg text-slate-300/90 leading-relaxed max-w-2xl mx-auto px-4 font-light">
                {s.subtitle}
              </p>
            </div>
          ))}
        </div>

        {/* Dot indicators */}
        <div className="flex justify-center gap-2 mb-10">
          {HERO_SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`h-1.5 rounded-full transition-all duration-500 ${i === slide ? 'bg-white w-8' : 'bg-white/30 hover:bg-white/60 w-1.5'}`}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>

        {/* ── Search bar ── */}
        <form onSubmit={handleSubmit} className="flex max-w-2xl mx-auto mb-7 rounded-xl overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.35)] ring-1 ring-white/10">
          <input
            type="text"
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Search judgments, articles, templates…"
            className="flex-1 px-6 py-4 text-slate-800 text-sm bg-white focus:outline-none placeholder:text-slate-400"
          />
          <button
            type="submit"
            className="bg-accent hover:bg-teal-600 text-white px-7 py-4 font-bold text-sm flex items-center gap-2 transition-all whitespace-nowrap"
          >
            <Search className="h-4 w-4" />
            <span className="hidden sm:inline tracking-wide">Search</span>
          </button>
        </form>

        {/* ── Action buttons ── */}
        <div className="flex flex-wrap justify-center gap-3 pb-12">
          <Link to="/stories/new"
            className="btn-secondary text-sm shadow-lg">
            Share Your Story <ArrowRight className="h-4 w-4" />
          </Link>
          <Link to="/apply-grant" className="btn-ghost text-sm">
            Apply for Legal Aid
          </Link>
          <Link to="/donate" className="btn-ghost text-sm">
            Support VOICE
          </Link>
        </div>
      </div>

      {/* Prev / Next arrows */}
      <button
        onClick={() => goTo((slide - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)}
        className="absolute left-4 sm:left-6 top-[38%] -translate-y-1/2 z-20 bg-white/8 hover:bg-white/20 border border-white/15 text-white rounded-full p-2.5 backdrop-blur-sm transition-all"
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        onClick={() => goTo((slide + 1) % HERO_SLIDES.length)}
        className="absolute right-4 sm:right-6 top-[38%] -translate-y-1/2 z-20 bg-white/8 hover:bg-white/20 border border-white/15 text-white rounded-full p-2.5 backdrop-blur-sm transition-all"
        aria-label="Next slide"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </section>
  );
};

// ── Section: Stats bar ────────────────────────────────────────────────────────

const StatsBar = ({ stats }) => {
  const items = [
    { label: 'Judgments & Articles', value: stats.resources || '—' },
    { label: 'Verified Advocates',   value: stats.advocates || '—' },
    { label: 'Victim Stories',       value: stats.stories   || '—' },
    { label: 'States Covered',       value: '28+'              },
  ];

  return (
    <div style={{ background: 'linear-gradient(90deg, hsl(36 88% 38%) 0%, hsl(36 88% 44%) 100%)' }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4">
          {items.map(({ label, value }, idx) => (
            <div key={label} className={`py-6 px-6 text-center ${idx < items.length - 1 ? 'stat-divider' : ''}`}>
              <div className="font-serif text-3xl font-black text-white tracking-tight">{value}</div>
              <div className="label-eyebrow text-amber-100/80 mt-1.5" style={{ fontSize: '0.6rem' }}>{label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ── Section: Landmark Judgments ───────────────────────────────────────────────

const JudgmentRow = ({ resource }) => {
  const year = resource.judgmentDate
    ? new Date(resource.judgmentDate).getFullYear()
    : resource.createdAt
    ? new Date(resource.createdAt).getFullYear()
    : null;

  return (
    <Link to={`/resources/${resource.slug || resource._id}`} className="group block">
      <div className="flex gap-4 py-5 border-b border-slate-100 last:border-0 hover:bg-slate-50 -mx-4 px-4 rounded-lg transition-colors">
        {/* Year badge */}
        <div className="flex-shrink-0 w-14 text-center">
          <div className="bg-primary text-white text-xs font-mono font-bold rounded px-2 py-1 inline-block">
            {year || 'N/A'}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-serif text-base font-bold text-primary group-hover:text-accent line-clamp-1 transition-colors">
            {resource.title}
          </h3>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
            {resource.court && (
              <span className="text-xs text-slate-500">{resource.court}</span>
            )}
            {resource.citation && (
              <span className="text-xs text-slate-400 font-mono">{resource.citation}</span>
            )}
          </div>
          {resource.summary && (
            <p className="text-sm text-slate-600 mt-1.5 line-clamp-2 leading-relaxed">
              {resource.summary}
            </p>
          )}
        </div>

        <div className="flex-shrink-0 self-center">
          <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-accent transition-colors" />
        </div>
      </div>
    </Link>
  );
};

const LandmarkJudgments = ({ judgments }) => {
  if (!judgments.length) return null;

  return (
    <section className="py-24 bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 mb-12">
          <div>
            <SectionLabel>Legal Precedents</SectionLabel>
            <SectionTitle>Landmark Judgments</SectionTitle>
            <p className="text-slate-500 mt-3 max-w-lg text-base">
              Supreme Court and High Court decisions that define the law on medical negligence in India.
            </p>
          </div>
          <Link
            to="/resources?category=Judgment"
            className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-accent hover:text-teal-700 transition-all group whitespace-nowrap"
          >
            View all judgments <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-[0_2px_16px_rgba(0,0,0,0.06)]">
          <div className="divide-y divide-slate-100">
            {judgments.map(r => <JudgmentRow key={r._id} resource={r} />)}
          </div>
          <div className="px-4 py-4 bg-slate-50/80 border-t border-slate-100 text-center sm:hidden">
            <Link to="/resources?category=Judgment" className="text-sm font-semibold text-accent">
              View all judgments →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

// ── Section: Know Your Rights ─────────────────────────────────────────────────

const RIGHTS_GUIDES = [
  {
    icon: FileText,
    colour: 'bg-teal-50 text-teal-700 border-teal-100',
    title: 'File an RTI',
    description: 'Use the Right to Information Act to obtain your medical records, treatment history, and hospital documentation.',
    link: '/resources?category=RTI Template',
    cta: 'Get RTI Templates',
  },
  {
    icon: Scale,
    colour: 'bg-amber-50 text-amber-700 border-amber-100',
    title: 'Consumer Court',
    description: 'Medical services fall under the Consumer Protection Act. Learn how to file a complaint in the District Commission.',
    link: '/resources?category=Consumer Complaint',
    cta: 'Get Complaint Templates',
  },
  {
    icon: Shield,
    colour: 'bg-navy-50 text-primary border-slate-200',
    title: 'Send a Legal Notice',
    description: 'A formal legal notice to the hospital or doctor is often the first step before litigation. Use our drafted templates.',
    link: '/resources?category=Legal Notice',
    cta: 'Get Notice Templates',
  },
];

const KnowYourRights = () => (
  <section className="py-24 bg-slate-50/60">
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-14">
        <SectionLabel>Patient Rights</SectionLabel>
        <SectionTitle>Know Your Rights</SectionTitle>
        <p className="text-slate-500 mt-4 max-w-lg mx-auto text-base">
          Step-by-step guides and ready-to-use templates to take meaningful action.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-7 items-stretch">
        {RIGHTS_GUIDES.map(({ icon: Icon, colour, title, description, link, cta }) => (
          <div key={title} className="group flex flex-col h-full rounded-2xl border border-slate-200/80 p-7 bg-white card-lift shadow-sm hover:border-accent/30">
            {/* Icon */}
            <div className={`inline-flex p-3 rounded-xl mb-6 self-start ${colour}`}>
              <Icon className="h-5 w-5" />
            </div>
            {/* Title */}
            <h3 className="heading-section text-primary text-lg mb-3">{title}</h3>
            {/* Description */}
            <p className="text-sm text-slate-500 leading-relaxed flex-1">{description}</p>
            {/* CTA */}
            <Link
              to={link}
              className="inline-flex items-center gap-2 text-sm font-semibold text-accent group-hover:text-teal-600 transition-all mt-7 pt-5 border-t border-slate-100"
            >
              {cta}
              <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
          </div>
        ))}
      </div>
    </div>
  </section>
);

// ── Section: Recent Stories ───────────────────────────────────────────────────

const RecentStories = ({ stories }) => {
  if (!stories.length) return null;

  return (
    <section className="py-20 bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-10">
          <div>
            <SectionLabel>Community Voices</SectionLabel>
            <SectionTitle>Victim Stories</SectionTitle>
            <p className="text-slate-600 mt-3">
              Real accounts from patients and families affected by medical negligence.
            </p>
          </div>
          <Link
            to="/stories"
            className="hidden md:inline-flex items-center gap-1.5 text-sm font-semibold text-accent hover:text-teal-700 transition-colors"
          >
            All stories <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {stories.map((story) => (
            <Link to={`/stories/${story.id}`} key={story.id} className="group block">
              <div className="flex flex-col h-full bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm card-lift hover:border-slate-300 border-l-[3px] border-l-secondary">
                {story.location && (
                  <p className="label-eyebrow text-slate-400 mb-3" style={{ fontSize: '0.6rem' }}>
                    {story.location}
                  </p>
                )}
                <h3 className="heading-section text-primary text-base mb-3 line-clamp-2 group-hover:text-accent transition-colors">
                  {story.title}
                </h3>
                <p className="text-slate-500 text-sm line-clamp-3 leading-relaxed flex-1">
                  {story.description}
                </p>
                <div className="flex justify-between items-center pt-4 mt-4 border-t border-slate-100">
                  <span className="text-xs text-slate-400">
                    {new Date(story.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                  <span className="text-xs font-bold text-accent group-hover:gap-1.5 flex items-center gap-1 transition-all">
                    Read More <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="md:hidden text-center mt-8">
          <Link to="/stories" className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent hover:underline">
            View all stories <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};

// ── Section: Book ─────────────────────────────────────────────────────────────

const BOOK_AMAZON_URL = 'https://www.amazon.in/Dr-Death-Chhabra-Case-investigation-ebook/dp/B0DWKLG954/ref=sr_1_1?crid=13MQWS7NFL9DX&dib=eyJ2IjoiMSJ9.2vJmBzdZUezLnw7UmemFJA.U8Ym6bVGb_Fp6BpDCdaovUvFfDkC7BNtZLT_mB07m8o&dib_tag=se&keywords=dr+death+simran+chhabra&qid=1782444085&sprefix=%2Caps%2C203&sr=8-1';

const BookSection = () => (
  <section className="py-20 bg-primary overflow-hidden">
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row items-center gap-10 md:gap-16">

        {/* Book cover */}
        <div className="flex-shrink-0 flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 translate-x-4 translate-y-4 bg-black/50 rounded-lg blur-md" />
            <img
              src="/book-cover.jpg"
              alt="Dr. Death – Simran Chhabra Murder Case by Nishant Bharihoke"
              className="relative w-48 sm:w-56 md:w-64 rounded-lg shadow-[0_20px_60px_rgba(0,0,0,0.6)] border-2 border-white/20"
              onError={e => { e.target.style.display = 'none'; }}
            />
          </div>
        </div>

        {/* Text */}
        <div className="flex-1 text-center md:text-left">
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-accent mb-3">Featured Book</p>
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-white leading-tight mb-4">
            Dr. Death —<br className="hidden md:block" /> Simran Chhabra Murder Case
          </h2>
          <p className="text-slate-300 leading-relaxed mb-3">
            The chilling true account of one of India's most disturbing medical murder cases —
            an investigation into how a trusted doctor became a killer, and how the system failed to stop him.
          </p>
          <p className="text-slate-400 text-sm leading-relaxed mb-8">
            This book exposes the systemic failures in India's healthcare accountability
            and is the foundation on which VOICE was built. Part evidence, part testimony,
            part call to action.
          </p>

          <div className="flex flex-wrap gap-4 justify-center md:justify-start">
            <a
              href={BOOK_AMAZON_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold px-6 py-3 rounded-md transition-colors text-sm"
            >
              <ShoppingCart className="h-4 w-4" />
              Order on Amazon
            </a>
            <a
              href={BOOK_AMAZON_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold px-6 py-3 rounded-md transition-colors text-sm"
            >
              Read Sample →
            </a>
          </div>

          {/* Star rating */}
          <div className="flex items-center gap-2 mt-6 justify-center md:justify-start">
            <div className="flex gap-0.5">
              {[1,2,3,4,5].map(i => (
                <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <span className="text-slate-400 text-xs">Available on Amazon Kindle & Paperback</span>
          </div>
        </div>

      </div>
    </div>
  </section>
);

// ── Section: Upcoming Events ──────────────────────────────────────────────────

const UpcomingEvents = ({ events }) => {
  if (!events.length) return null;

  return (
    <section className="py-20 bg-slate-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-10">
          <div>
            <SectionLabel>Community</SectionLabel>
            <SectionTitle>Upcoming Events</SectionTitle>
          </div>
          <Link
            to="/events"
            className="hidden md:inline-flex items-center gap-1.5 text-sm font-semibold text-accent hover:text-teal-700 transition-colors"
          >
            All events <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {events.map(ev => (
            <Link to={`/events/${ev.slug || ev._id}`} key={ev._id} className="group block card-lift">
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden h-full">
                <div className="bg-primary px-5 py-3 flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-accent flex-shrink-0" />
                  <span className="text-xs font-mono text-slate-300 truncate">
                    {ev.date ? new Date(ev.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Date TBD'}
                  </span>
                </div>
                <div className="p-5">
                  <h3 className="font-serif text-base font-bold text-primary mb-2 line-clamp-2 group-hover:text-accent transition-colors">
                    {ev.title}
                  </h3>
                  {ev.location && (
                    <p className="text-xs text-slate-500 mb-2">{ev.location}</p>
                  )}
                  {ev.description && (
                    <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">{ev.description}</p>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

// ── Section: How We Help ──────────────────────────────────────────────────────

const HOW_WE_HELP = [
  { icon: Gavel,    title: 'Legal Resources',   desc: 'Curated judgments, templates, and guides on medical negligence law.',  link: '/resources' },
  { icon: Users,    title: 'Expert Directory',  desc: 'Find verified advocates, doctors, and journalists who can help.',      link: '/community/advocates' },
  { icon: BookOpen, title: 'Education Centre',  desc: 'Learn about patient rights, consumer law, and legal procedures.',      link: '/resources?category=Article' },
  { icon: Phone,    title: 'Free Legal Aid',    desc: 'Apply for free or low-cost legal assistance from our network.',        link: '/apply-grant' },
];

const HowWeHelp = () => (
  <section className="py-24 relative overflow-hidden" style={{ background: 'linear-gradient(160deg, hsl(220 55% 13%) 0%, hsl(220 55% 18%) 100%)' }}>
    <div className="absolute inset-0 hero-grid-overlay pointer-events-none opacity-60" />
    <div className="absolute inset-0 pointer-events-none"
      style={{ background: 'radial-gradient(ellipse 60% 50% at 80% 50%, hsl(172 65% 30% / 0.12) 0%, transparent 70%)' }} />

    <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-14">
        <SectionLabel>Our Services</SectionLabel>
        <SectionTitle light>How We Help</SectionTitle>
        <p className="text-slate-300/80 mt-4 max-w-xl mx-auto">
          Everything a victim of medical negligence needs — from understanding the law to finding an advocate.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
        {HOW_WE_HELP.map(({ icon: Icon, title, desc, link }) => (
          <Link key={title} to={link} className="group block">
            <div className="flex flex-col h-full bg-white/5 hover:bg-white/10 border border-white/8 hover:border-accent/50 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
              <div className="inline-flex p-3 bg-accent/15 group-hover:bg-accent/25 rounded-xl mb-5 transition-colors self-start">
                <Icon className="h-5 w-5 text-accent" />
              </div>
              <h3 className="heading-section text-white text-base mb-2">{title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed flex-1">{desc}</p>
              <div className="flex items-center gap-1.5 text-accent/70 group-hover:text-accent text-xs font-semibold mt-4 transition-colors">
                Learn more <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  </section>
);

// ── Section: Final CTA ────────────────────────────────────────────────────────

const FinalCTA = () => (
  <section className="py-20 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, hsl(172 65% 26%) 0%, hsl(172 65% 32%) 60%, hsl(172 55% 38%) 100%)' }}>
    <div className="absolute inset-0 pointer-events-none"
      style={{ background: 'radial-gradient(ellipse 60% 80% at 50% 50%, rgba(255,255,255,0.07) 0%, transparent 70%)' }} />
    <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
      <span className="label-eyebrow text-teal-200/70 mb-4 block">Take Action Today</span>
      <h2 className="heading-display text-white text-3xl sm:text-4xl mb-5 text-balance">
        Have you been a victim of medical negligence?
      </h2>
      <p className="text-teal-50/80 mb-10 text-base leading-relaxed max-w-xl mx-auto">
        You are not alone. VOICE connects you with legal resources, expert advocates, and a community that understands your pain.
      </p>
      <div className="flex flex-wrap justify-center gap-4">
        <Link to="/apply-grant"
          className="inline-flex items-center gap-2 bg-white text-accent hover:bg-teal-50 px-7 py-3.5 rounded-xl font-bold text-sm shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5">
          Apply for Free Legal Aid <ArrowRight className="h-4 w-4" />
        </Link>
        <Link to="/stories/new"
          className="inline-flex items-center gap-2 bg-white/15 hover:bg-white/25 border border-white/30 text-white px-7 py-3.5 rounded-xl font-semibold text-sm backdrop-blur-sm transition-all hover:-translate-y-0.5">
          Share Your Story
        </Link>
      </div>
    </div>
  </section>
);

// ── Page ──────────────────────────────────────────────────────────────────────

const Home = () => {
  const { settings } = useSettings();
  const navigate = useNavigate();

  const [recentStories, setRecentStories] = useState([]);
  const [judgments,     setJudgments]     = useState([]);
  const [events,        setEvents]        = useState([]);
  const [stats,         setStats]         = useState({});

  useEffect(() => {
    const load = async () => {
      try {
        const [storiesRes, judgementsRes, eventsRes] = await Promise.allSettled([
          axios.get(`${API}/stories/approved`),
          axios.get(`${API}/resources`, { params: { category: 'Judgment', sort: 'newest', limit: 4 } }),
          axios.get(`${API}/events`,    { params: { limit: 3 } }),
        ]);

        if (storiesRes.status === 'fulfilled') {
          const s = storiesRes.value.data;
          const arr = Array.isArray(s) ? s : s.stories || [];
          setRecentStories(arr.slice(0, 3));
          setStats(prev => ({ ...prev, stories: arr.length }));
        }

        if (judgementsRes.status === 'fulfilled') {
          const d = judgementsRes.value.data;
          const arr = Array.isArray(d) ? d : d.resources || [];
          setJudgments(arr.slice(0, 4));
          setStats(prev => ({ ...prev, resources: d.total || arr.length }));
        }

        if (eventsRes.status === 'fulfilled') {
          const d = eventsRes.value.data;
          const arr = Array.isArray(d) ? d : d.events || [];
          setEvents(arr.slice(0, 3));
        }
      } catch {
        // Non-critical — page still renders without data
      }
    };
    load();
  }, []);

  const handleSearch = (q) => {
    navigate(`/resources?search=${encodeURIComponent(q)}`);
  };

  return (
    <div>
      <Hero settings={settings} onSearch={handleSearch} />
      <StatsBar stats={stats} />
      <LandmarkJudgments judgments={judgments} />
      <KnowYourRights />
      <RecentStories stories={recentStories} />
      <BookSection />
      {events.length > 0 && <UpcomingEvents events={events} />}
      <HowWeHelp />
      <FinalCTA />
    </div>
  );
};

export default Home;
