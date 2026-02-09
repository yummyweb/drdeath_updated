import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { getImageUrl } from '../utils/imageUrl';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Scale, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { getBackendUrl } from '@/config/env';

const Login = () => {
  const { settings } = useSettings();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const user = await login(email, password);
      toast.success(`Welcome back, ${user.full_name}!`);
      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Login error:', error);
      // Show detailed error message
      const errorMessage = error.message || error.response?.data?.detail || 'Invalid credentials';
      toast.error(errorMessage);
      
      // Log additional debugging info in development
      if (import.meta.env.DEV) {
        console.error('Full error details:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
          backendUrl: getBackendUrl()
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center py-12 px-4" data-testid="login-page">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3">
            {settings.logo_url ? (
              <img 
                src={getImageUrl(settings.logo_url)} 
                alt={settings.site_name || 'Logo'} 
                className="h-16 w-auto max-w-[250px] object-contain"
                onError={(e) => {
                  console.error('Logo failed to load:', settings.logo_url);
                  e.target.style.display = 'none';
                }}
              />
            ) : (
              <>
                <Scale className="h-10 w-10 text-primary" />
                <span className="font-serif text-2xl font-bold text-primary">
                  {settings.site_name && settings.site_name !== 'Your Organization' 
                  ? settings.site_name 
                  : "VOICE-Victims' Outreach & Initiative for Crime of Medical Negligence"}
                </span>
              </>
            )}
            {settings.logo_url && settings.site_name && settings.site_name !== 'Your Organization' && (
              <span className="font-serif text-2xl font-bold text-primary">
                {settings.site_name}
              </span>
            )}
          </Link>
        </div>

        <Card className="border-slate-200 shadow-lg">
          <CardHeader className="text-center pb-4 border-b border-slate-100">
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-secondary mb-2">
              Welcome Back
            </p>
            <CardTitle className="font-serif text-2xl">Login to Your Account</CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6" data-testid="login-form">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="your@email.com"
                  className="bg-slate-50"
                  data-testid="login-email-input"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="bg-slate-50 pr-10"
                    data-testid="login-password-input"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    data-testid="toggle-password-btn"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-slate-800 uppercase tracking-widest font-bold"
                data-testid="login-submit-btn"
              >
                {loading ? (
                  <>
                    <span className="spinner mr-2"></span>
                    Logging in...
                  </>
                ) : (
                  'Login'
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-slate-600">
                Don't have an account?{' '}
                <Link
                  to="/register"
                  className="text-secondary hover:text-amber-700 font-medium"
                  data-testid="register-link"
                >
                  Register here
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-slate-400 mt-6">
          By logging in, you agree to our terms of service and privacy policy.
        </p>
      </div>
    </div>
  );
};

export default Login;
