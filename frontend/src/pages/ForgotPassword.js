import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { getApiUrl } from '@/config/env';

const API = getApiUrl();

const ForgotPassword = () => {
  const [email, setEmail]   = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent]     = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`${API}/auth/forgot-password`, { email });
      setSent(true);
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white border border-slate-200 rounded-2xl shadow-lg p-8 text-center">

          {sent ? (
            <>
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-50 mb-6">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h1 className="font-serif text-2xl font-bold text-primary mb-3">Check Your Email</h1>
              <p className="text-slate-600 text-sm leading-relaxed mb-6">
                If <strong>{email}</strong> is registered with VOICE, you'll receive a password reset link shortly.
                Check your inbox and spam folder.
              </p>
              <p className="text-xs text-slate-400 mb-6">
                The link expires in 1 hour. If you don't receive it, contact us at{' '}
                <a href="mailto:legal.eagle.gurgaon@gmail.com" className="text-accent">
                  legal.eagle.gurgaon@gmail.com
                </a>
              </p>
              <Link to="/login" className="inline-flex items-center gap-2 text-sm font-semibold text-accent hover:underline">
                <ArrowLeft className="h-4 w-4" /> Back to Login
              </Link>
            </>
          ) : (
            <>
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-50 mb-6">
                <Mail className="h-8 w-8 text-secondary" />
              </div>
              <h1 className="font-serif text-2xl font-bold text-primary mb-2">Forgot Password?</h1>
              <p className="text-slate-500 text-sm mb-8">
                Enter your registered email and we'll send you a link to reset your password.
              </p>

              <form onSubmit={handleSubmit} className="text-left space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full border border-slate-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                    autoFocus
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary hover:bg-slate-800 text-white font-bold py-3 rounded-lg transition-colors disabled:opacity-60"
                >
                  {loading ? 'Sending…' : 'Send Reset Link'}
                </button>
              </form>

              <Link to="/login" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mt-6 transition-colors">
                <ArrowLeft className="h-4 w-4" /> Back to Login
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
