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
  Settings
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

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
    { path: '/advocates', label: 'Find Advocates' },
    { path: '/resources', label: 'Legal Resources' },
    { path: '/donate', label: 'Donate' },
    { path: '/shop', label: 'Shop' },
    { path: '/contact', label: 'Contact' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Favicon />
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200" data-testid="main-navigation">
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

            {/* Desktop Navigation - Flex grow to take available space */}
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
                  data-testid={`nav-${link.label.toLowerCase().replace(' ', '-')}`}
                >
                  {link.label}
                </Link>
              ))}
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
                    location.pathname === link.path
                      ? 'text-primary'
                      : 'text-slate-600'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
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

      {/* Footer */}
      <footer className="bg-primary text-primary-foreground" data-testid="footer">
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

          <div className="border-t border-slate-700 mt-8 pt-8 text-center text-sm text-slate-400 space-y-2">
            <p>© {new Date().getFullYear()} {settings.site_name && settings.site_name !== 'Your Organization' ? settings.site_name : "VOICE-Victims' Outreach & Initiative for Crime of Medical Negligence"}. All rights reserved.</p>
            <p>Powered by Elizian Labs</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
