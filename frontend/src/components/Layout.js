import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { Button } from './ui/button';
import Favicon from './Favicon';
import { getImageUrl } from '../utils/imageUrl';
import {
  Menu,
  X,
  Scale,
  User,
  LogOut,
  LayoutDashboard,
  Settings,
  ChevronDown,
  Users,
  Stethoscope,
  Newspaper,
  FlaskConical,
  HandHeart,
  Briefcase,
  Scale as ScaleIcon,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

const BOOK_URL = 'https://www.amazon.in/Dr-Death-Chhabra-Case-investigation-ebook/dp/B0DWKLG954/ref=sr_1_1?crid=13MQWS7NFL9DX&dib=eyJ2IjoiMSJ9.2vJmBzdZUezLnw7UmemFJA.U8Ym6bVGb_Fp6BpDCdaovUvFfDkC7BNtZLT_mB07m8o&dib_tag=se&keywords=dr+death+simran+chhabra&qid=1782444085&sprefix=%2Caps%2C203&sr=8-1';

const AnnouncementBar = () => (
  <div style={{ background: 'linear-gradient(90deg, hsl(36 88% 40%) 0%, hsl(36 88% 46%) 100%)' }}
    className="text-white text-xs py-2.5 px-4 flex items-center justify-center gap-3 shadow-sm">
    <span className="hidden sm:flex items-center gap-1.5 text-amber-100/70 label-eyebrow" style={{ fontSize: '0.6rem' }}>
      <span className="w-1 h-1 rounded-full bg-amber-200 inline-block animate-pulse" />
      New Release
    </span>
    <span className="text-center leading-snug font-medium">
      <span className="font-bold">Dr. Death – Simran Chhabra Murder Case</span>
      <span className="hidden sm:inline text-amber-100/80"> · Nishant Bharihoke</span>
    </span>
    <a
      href={BOOK_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="flex-shrink-0 bg-slate-900 hover:bg-slate-700 text-white font-bold px-4 py-1.5 rounded-lg text-xs transition-all whitespace-nowrap shadow-md"
    >
      Order Now →
    </a>
  </div>
);

const YT_CHANNEL = 'https://www.youtube.com/@nishantbharihoke/';
const YT_VIDEO   = 'https://www.youtube.com/watch?v=5Z1wpCOoVg0';
const YT_THUMB   = 'https://img.youtube.com/vi/5Z1wpCOoVg0/mqdefault.jpg';

// YouTube promo — mirrors BookPromo on the left side, homepage only
const YouTubePromo = () => {
  const [state, setState] = useState('pill'); // 'expanded' | 'pill'

  if (state === 'pill') {
    return (
      <button
        onClick={() => setState('expanded')}
        className="fixed bottom-6 left-6 z-50 flex items-center gap-2 bg-red-700 text-white pl-2 pr-4 py-2 rounded-full shadow-2xl hover:bg-red-600 transition-all"
        title="Watch on YouTube"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5 fill-white flex-shrink-0" aria-hidden="true">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
        </svg>
        <span className="text-xs font-bold">Watch Now</span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 left-6 z-50 w-64 bg-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-white/10 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between bg-red-600 px-3 py-2">
        <span className="text-xs font-bold text-white uppercase tracking-wide">▶ Watch on YouTube</span>
        <button
          onClick={() => setState('pill')}
          className="text-white/80 hover:text-white transition-colors"
          title="Minimise"
          aria-label="Minimise"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Thumbnail */}
      <a href={YT_VIDEO} target="_blank" rel="noopener noreferrer" className="block relative group">
        <img src={YT_THUMB} alt="Watch: Dr. Death case" className="w-full object-cover" />
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/10 transition-colors">
          <div className="bg-red-600 rounded-full p-2.5 shadow-lg">
            <svg viewBox="0 0 24 24" className="h-5 w-5 fill-white"><path d="M8 5v14l11-7z"/></svg>
          </div>
        </div>
      </a>

      {/* Text */}
      <div className="px-3 pt-2 pb-1">
        <p className="font-serif text-white font-bold text-sm leading-tight">The Doctor Who Got Away With Murder?</p>
        <p className="text-slate-400 text-xs mt-1 leading-snug">Inside the Simran Chhabra case — the investigation they tried to bury.</p>
      </div>

      {/* CTAs */}
      <div className="px-3 pb-3 pt-2 flex flex-col gap-2">
        <a
          href={YT_VIDEO}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full text-center bg-red-600 hover:bg-red-500 text-white font-bold py-2 rounded-lg text-sm transition-colors"
        >
          Watch the Video →
        </a>
        <a
          href={YT_CHANNEL}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full text-center bg-white/10 hover:bg-white/20 text-slate-300 font-semibold py-1.5 rounded-lg text-xs transition-colors"
        >
          Subscribe to Channel
        </a>
      </div>
    </div>
  );
};

// Floating book promo — expands on load, collapses to pill when minimised
const BookPromo = () => {
  const [state, setState] = useState('pill'); // 'expanded' | 'pill'

  if (state === 'pill') {
    return (
      <button
        onClick={() => setState('expanded')}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-slate-900 text-white pl-2 pr-4 py-2 rounded-full shadow-2xl hover:bg-slate-700 transition-all"
        title="View book"
      >
        <img src="/book-cover.jpg" alt="Dr. Death" className="h-8 w-6 rounded object-cover" />
        <span className="text-xs font-bold">Order Book</span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-64 bg-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-white/10 animate-fade-in-up">
      {/* Header bar */}
      <div className="flex items-center justify-between bg-amber-400 px-3 py-2">
        <span className="text-xs font-bold text-slate-900 uppercase tracking-wide">📖 New Book</span>
        <button
          onClick={() => setState('pill')}
          className="text-slate-700 hover:text-slate-900 transition-colors"
          title="Minimise"
          aria-label="Minimise"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Body */}
      <div className="flex gap-3 p-3">
        {/* Cover */}
        <img
          src="/book-cover.jpg"
          alt="Dr. Death – Simran Chhabra Murder Case"
          className="w-20 rounded-lg shadow-lg flex-shrink-0 object-cover"
        />
        {/* Text */}
        <div className="flex flex-col justify-between min-w-0">
          <div>
            <p className="font-serif text-white font-bold text-sm leading-tight">Dr. Death</p>
            <p className="text-amber-300 text-xs mt-0.5 leading-tight">Simran Chhabra Murder Case</p>
            <p className="text-slate-400 text-xs mt-1">by Nishant Bharihoke</p>
          </div>
          <p className="text-slate-400 text-xs mt-2 leading-snug">
            Day-to-day account from investigation to trial.
          </p>
        </div>
      </div>

      {/* CTA */}
      <div className="px-3 pb-3">
        <a
          href={BOOK_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full text-center bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold py-2 rounded-lg text-sm transition-colors"
        >
          Order on Amazon →
        </a>
      </div>
    </div>
  );
};

const Layout = ({ children }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout, isAdmin, isAuthenticated } = useAuth();
  const { settings } = useSettings();
  const location = useLocation();
  const navigate = useNavigate();

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/about', label: 'About Us' },
    { path: '/stories', label: 'Stories' },
    { path: '/resources', label: 'Legal Resources' },
    { path: '/events', label: 'Events' },
    { path: '/opportunities', label: 'Careers' },
    { path: '/donate', label: 'Donate' },
    { path: '/contact', label: 'Contact' },
  ];

  const communityLinks = [
    { path: '/advocates',   label: 'Advocates',   icon: ScaleIcon },
    { path: '/doctors',     label: 'Doctors',      icon: Stethoscope },
    { path: '/journalists', label: 'Journalists',  icon: Newspaper },
    { path: '/researchers', label: 'Researchers',  icon: FlaskConical },
    { path: '/volunteers',  label: 'Volunteers',   icon: HandHeart },
  ];

  const joinLinks = [
    { path: '/advocate-register',   label: 'As an Advocate',   icon: ScaleIcon },
    { path: '/doctor-register',     label: 'As a Doctor',      icon: Stethoscope },
    { path: '/journalist-register', label: 'As a Journalist',  icon: Newspaper },
    { path: '/researcher-register', label: 'As a Researcher',  icon: FlaskConical },
    { path: '/volunteer-register',  label: 'As a Volunteer',   icon: HandHeart },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Favicon />
      <AnnouncementBar />
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-[0_1px_4px_rgba(0,0,0,0.07)]" data-testid="main-navigation">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-auto min-h-[64px] gap-4">
            {/* Logo - Left aligned, full text visible, wraps to multiple lines */}
            <Link to="/" className="flex items-start gap-2 sm:gap-3 flex-shrink-0 min-w-0 max-w-[280px] lg:max-w-[320px]" data-testid="logo-link">
              {settings.logo_url ? (
                <img 
                  src={getImageUrl(settings.logo_url)} 
                  alt={settings.site_name || 'Logo'} 
                  className="h-10 sm:h-12 w-auto flex-shrink-0"
                  onError={(e) => {
                    console.error('Logo failed to load:', settings.logo_url);
                    e.target.style.display = 'none';
                  }}
                />
              ) : (
                <>
                  <Scale className="h-7 w-7 sm:h-8 sm:w-8 text-primary flex-shrink-0 mt-0.5" />
                  <span className="font-serif text-[10px] sm:text-xs lg:text-sm font-bold text-primary leading-[1.3] block">
                    {settings.site_name && settings.site_name !== 'Your Organization' 
                  ? settings.site_name 
                  : "VOICE-Victims' Outreach & Initiative for Crime of Medical Negligence"}
                  </span>
                </>
              )}
              {settings.logo_url && settings.site_name && settings.site_name !== 'Your Organization' && (
                <span className="font-serif text-[10px] sm:text-xs lg:text-sm font-bold text-primary hidden sm:block leading-[1.3]">
                  {settings.site_name}
                </span>
              )}
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-3 xl:gap-4 flex-1 justify-center ml-6">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`nav-link font-sans text-sm font-medium transition-colors whitespace-nowrap ${
                    location.pathname === link.path
                      ? 'text-primary'
                      : 'text-slate-600 hover:text-primary'
                  }`}
                >
                  {link.label}
                </Link>
              ))}

              {/* Community directory dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger className={`flex items-center gap-1 font-sans text-sm font-medium transition-colors whitespace-nowrap outline-none ${
                  communityLinks.some(l => location.pathname === l.path) ? 'text-primary' : 'text-slate-600 hover:text-primary'
                }`}>
                  Community <ChevronDown className="h-3.5 w-3.5" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center" className="w-48">
                  {communityLinks.map(({ path, label, icon: Icon }) => (
                    <DropdownMenuItem key={path} asChild>
                      <Link to={path} className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-slate-400" />
                        {label}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Join Us / Register dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger className={`flex items-center gap-1 font-sans text-sm font-medium transition-colors whitespace-nowrap outline-none ${
                  joinLinks.some(l => location.pathname === l.path) ? 'text-primary' : 'text-slate-600 hover:text-primary'
                }`}>
                  Join Us <ChevronDown className="h-3.5 w-3.5" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center" className="w-52">
                  {joinLinks.map(({ path, label, icon: Icon }) => (
                    <DropdownMenuItem key={path} asChild>
                      <Link to={path} className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-slate-400" />
                        {label}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Auth Section - Right aligned */}
            <div className="hidden lg:flex items-center gap-3 flex-shrink-0">
              {isAuthenticated ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center gap-2" data-testid="user-menu-trigger">
                      <User className="h-4 w-4" />
                      <span className="font-medium">{user.full_name}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem asChild>
                      <Link to="/dashboard" className="flex items-center gap-2" data-testid="dashboard-link">
                        <LayoutDashboard className="h-4 w-4" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                    {isAdmin && (
                      <>
                        <DropdownMenuItem asChild>
                          <Link to="/admin" className="flex items-center gap-2" data-testid="admin-link">
                            <Scale className="h-4 w-4" />
                            Admin Panel
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link to="/admin/settings" className="flex items-center gap-2" data-testid="settings-link">
                            <Settings className="h-4 w-4" />
                            Site Settings
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-destructive" data-testid="logout-btn">
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <>
                  <Link to="/login" data-testid="login-link">
                    <Button variant="ghost" className="font-medium">Login</Button>
                  </Link>
                  <Link to="/register" data-testid="register-link">
                    <Button className="bg-primary text-primary-foreground hover:bg-slate-800 font-medium">
                      Register
                    </Button>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              data-testid="mobile-menu-toggle"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden mobile-menu border-t border-slate-200 bg-white" data-testid="mobile-menu">
            <div className="px-4 py-4 space-y-3">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`block py-2 font-medium ${
                    location.pathname === link.path ? 'text-primary' : 'text-slate-600'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-1 border-t border-slate-100">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider py-2">Community</p>
                {communityLinks.map(({ path, label, icon: Icon }) => (
                  <Link key={path} to={path}
                    className={`flex items-center gap-2 py-2 font-medium ${location.pathname === path ? 'text-primary' : 'text-slate-600'}`}
                    onClick={() => setMobileMenuOpen(false)}>
                    <Icon className="h-4 w-4 text-slate-400" />{label}
                  </Link>
                ))}
              </div>
              <div className="pt-1 border-t border-slate-100">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider py-2">Join Us</p>
                {joinLinks.map(({ path, label, icon: Icon }) => (
                  <Link key={path} to={path}
                    className={`flex items-center gap-2 py-2 font-medium ${location.pathname === path ? 'text-primary' : 'text-slate-600'}`}
                    onClick={() => setMobileMenuOpen(false)}>
                    <Icon className="h-4 w-4 text-slate-400" />{label}
                  </Link>
                ))}
              </div>
              <div className="pt-4 border-t border-slate-200">
                {isAuthenticated ? (
                  <>
                    <Link
                      to="/dashboard"
                      className="block py-2 font-medium text-slate-600"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                    {isAdmin && (
                      <Link
                        to="/admin"
                        className="block py-2 font-medium text-slate-600"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Admin Panel
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        handleLogout();
                        setMobileMenuOpen(false);
                      }}
                      className="block w-full text-left py-2 font-medium text-destructive"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <div className="flex gap-3">
                    <Link to="/login" className="flex-1" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="outline" className="w-full">Login</Button>
                    </Link>
                    <Link to="/register" className="flex-1" onClick={() => setMobileMenuOpen(false)}>
                      <Button className="w-full bg-primary">Register</Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      <BookPromo />
      {location.pathname === '/' && <YouTubePromo />}

      {/* Footer */}
      <footer className="text-primary-foreground" style={{ background: 'linear-gradient(160deg, hsl(220 55% 12%) 0%, hsl(220 55% 16%) 100%)' }} data-testid="footer">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* About */}
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                {settings.logo_url ? (
                  <img 
                    src={getImageUrl(settings.logo_url)} 
                    alt={settings.site_name || 'Logo'} 
                    className="h-10 w-auto max-w-[180px] object-contain"
                    onError={(e) => {
                      console.error('Logo failed to load:', settings.logo_url);
                      e.target.style.display = 'none';
                    }}
                  />
                ) : (
                  <>
                    <Scale className="h-6 w-6" />
                    <span className="font-serif text-lg font-bold">
                      {settings.site_name && settings.site_name !== 'Your Organization' 
                  ? settings.site_name 
                  : "VOICE-Victims' Outreach & Initiative for Crime of Medical Negligence"}
                    </span>
                  </>
                )}
                {settings.logo_url && settings.site_name && settings.site_name !== 'Your Organization' && (
                  <span className="font-serif text-lg font-bold">
                    {settings.site_name}
                  </span>
                )}
              </div>
              {settings.tagline && (
                <p className="text-slate-200 text-base md:text-lg font-serif font-medium leading-relaxed">
                  {settings.tagline}
                </p>
              )}
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-serif font-bold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm text-slate-300">
                <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
                <li><Link to="/stories" className="hover:text-white transition-colors">Victim Stories</Link></li>
                <li><Link to="/resources" className="hover:text-white transition-colors">Legal Resources</Link></li>
                <li><Link to="/donate" className="hover:text-white transition-colors">Donate</Link></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-serif font-bold mb-4">Contact Us</h4>
              <ul className="space-y-2 text-sm text-slate-300">
                <li>
                  <a href={`mailto:${settings.contact_email}`} className="hover:text-white transition-colors">
                    {settings.contact_email}
                  </a>
                </li>
                {settings.contact_phone && <li>{settings.contact_phone}</li>}
                {settings.address && <li>{settings.address}</li>}
              </ul>
            </div>
          </div>

          <div className="border-t border-white/8 mt-10 pt-8 text-center text-sm text-slate-500 space-y-3">
            {/* Social links */}
            <div className="flex justify-center gap-4">
              <a
                href="https://www.youtube.com/@nishantbharihoke/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-slate-400 hover:text-red-400 transition-colors font-medium"
                aria-label="YouTube Channel"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
                YouTube
              </a>
            </div>
            <p>© {new Date().getFullYear()} {settings.site_name && settings.site_name !== 'Your Organization' ? settings.site_name : "VOICE-Victims' Outreach & Initiative for Crime of Medical Negligence"}. All rights reserved.</p>
            <p>Powered by Elizian Labs</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
