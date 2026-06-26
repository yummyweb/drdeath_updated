import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import { KeyRound, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { getApiUrl } from '@/config/env';

const API = getApiUrl();

const ResetPassword = () => {
  const { token } = useParams();
  const navigate  = useNavigate();
  const [password, setPassword]       = useState('');
  const [confirm, setConfirm]         = useState('');
  const [showPw, setShowPw]           = useState(false);
  const [loading, setLoading]         = useState(false);
  const [done, setDone]               = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 8) { toast.error('Password must be at least 8 characters'); return; }
    if (password !== confirm) { toast.error('Passwords do not match'); return; }

    setLoading(true);
    try {
      await axios.post(`${API}/auth/reset-password/${token}`, { password });
      setDone(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Reset link is invalid or has expired');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white border border-slate-200 rounded-2xl shadow-lg p-8 text-center">

          {done ? (
            <>
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-50 mb-6">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h1 className="font-serif text-2xl font-bold text-primary mb-3">Password Reset!</h1>
              <p className="text-slate-500 text-sm mb-4">
                Your password has been updated. Redirecting to login…
              </p>
              <Link to="/login" className="text-sm font-semibold text-accent hover:underline">
                Go to Login →
              </Link>
            </>
          ) : (
            <>
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
                <KeyRound className="h-8 w-8 text-primary" />
              </div>
              <h1 className="font-serif text-2xl font-bold text-primary mb-2">Set New Password</h1>
              <p className="text-slate-500 text-sm mb-8">
                Choose a strong password with at least 8 characters.
              </p>

              <form onSubmit={handleSubmit} className="text-left space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">New Password</label>
                  <div className="relative">
                    <input
                      type={showPw ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Min. 8 characters"
                      className="w-full border border-slate-300 rounded-lg px-4 py-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                      autoFocus
                    />
                    <button type="button" onClick={() => setShowPw(s => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                      {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Confirm Password</label>
                  <input
                    type={showPw ? 'text' : 'password'}
                    required
                    value={confirm}
                    onChange={e => setConfirm(e.target.value)}
                    placeholder="Repeat password"
                    className="w-full border border-slate-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary hover:bg-slate-800 text-white font-bold py-3 rounded-lg transition-colors disabled:opacity-60"
                >
                  {loading ? 'Saving…' : 'Reset Password'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
