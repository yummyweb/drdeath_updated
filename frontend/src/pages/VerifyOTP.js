import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import { ShieldCheck, RefreshCw } from 'lucide-react';
import { getApiUrl } from '@/config/env';
import { useAuth } from '@/context/AuthContext';

const TOKEN_KEY = 'voice_token';

const API = getApiUrl();

const VerifyOTP = () => {
  const [digits, setDigits]     = useState(['', '', '', '', '', '']);
  const [loading, setLoading]   = useState(false);
  const [resending, setResend]  = useState(false);
  const [countdown, setCountdown] = useState(60);
  const inputRefs = useRef([]);
  const navigate  = useNavigate();
  const { updateUser } = useAuth();

  // Countdown timer for resend button
  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const handleChange = (i, val) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...digits];
    next[i] = val;
    setDigits(next);
    if (val && i < 5) inputRefs.current[i + 1]?.focus();
  };

  const handleKeyDown = (i, e) => {
    if (e.key === 'Backspace' && !digits[i] && i > 0) {
      inputRefs.current[i - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setDigits(pasted.split(''));
      inputRefs.current[5]?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otp = digits.join('');
    if (otp.length < 6) { toast.error('Enter all 6 digits'); return; }

    setLoading(true);
    try {
      const res = await axios.post(`${API}/auth/verify-otp`, { otp });
      if (res.data.access_token) {
        sessionStorage.setItem(TOKEN_KEY, res.data.access_token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.access_token}`;
      }
      if (res.data.user) {
        updateUser(res.data.user);
      }
      toast.success('Email verified! Welcome to VOICE.');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResend(true);
    try {
      await axios.post(`${API}/auth/resend-otp`);
      toast.success('New OTP sent to your email');
      setCountdown(60);
      setDigits(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to resend OTP');
    } finally {
      setResend(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white border border-slate-200 rounded-2xl shadow-lg p-8 text-center">

          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-teal-50 mb-6">
            <ShieldCheck className="h-8 w-8 text-accent" />
          </div>

          <h1 className="font-serif text-2xl font-bold text-primary mb-2">Verify Your Email</h1>
          <p className="text-slate-500 text-sm mb-8">
            We've sent a 6-digit code to your email address. Enter it below to activate your account.
          </p>

          <form onSubmit={handleSubmit}>
            <div className="flex justify-center gap-2 mb-8" onPaste={handlePaste}>
              {digits.map((d, i) => (
                <input
                  key={i}
                  ref={el => inputRefs.current[i] = el}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={d}
                  onChange={e => handleChange(i, e.target.value)}
                  onKeyDown={e => handleKeyDown(i, e)}
                  className="w-11 h-14 text-center text-xl font-bold border-2 rounded-lg focus:outline-none focus:border-accent transition-colors"
                  style={{ borderColor: d ? '#0d9488' : '#cbd5e1' }}
                  autoFocus={i === 0}
                />
              ))}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-slate-800 text-white font-bold py-3 rounded-lg transition-colors disabled:opacity-60"
            >
              {loading ? 'Verifying…' : 'Verify Email'}
            </button>
          </form>

          <div className="mt-6">
            {countdown > 0 ? (
              <p className="text-sm text-slate-400">
                Resend code in <span className="font-semibold text-slate-600">{countdown}s</span>
              </p>
            ) : (
              <button
                onClick={handleResend}
                disabled={resending}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent hover:text-teal-700 transition-colors"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${resending ? 'animate-spin' : ''}`} />
                {resending ? 'Sending…' : 'Resend Code'}
              </button>
            )}
          </div>

          <p className="text-xs text-slate-400 mt-4">
            You can use VOICE while unverified, but stories and applications require verification.
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerifyOTP;
