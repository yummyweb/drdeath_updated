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

const Register = () => {
  const { settings } = useSettings();
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      await register(
        formData.email,
        formData.password,
        formData.full_name,
        formData.phone || null
      );
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Registration error:', error);
      toast.error(error.response?.data?.detail || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center py-12 px-4" data-testid="register-page">
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
              Join Our Community
            </p>
            <CardTitle className="font-serif text-2xl">Create an Account</CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-5" data-testid="register-form">
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name *</Label>
                <Input
                  id="full_name"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  required
                  placeholder="Your full name"
                  className="bg-slate-50"
                  data-testid="register-name-input"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="your@email.com"
                  className="bg-slate-50"
                  data-testid="register-email-input"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number (Optional)</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+91 XXXXX XXXXX"
                  className="bg-slate-50"
                  data-testid="register-phone-input"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleChange}
                    required
                    placeholder="At least 6 characters"
                    className="bg-slate-50 pr-10"
                    data-testid="register-password-input"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password *</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  placeholder="Confirm your password"
                  className="bg-slate-50"
                  data-testid="register-confirm-password-input"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-slate-800 uppercase tracking-widest font-bold"
                data-testid="register-submit-btn"
              >
                {loading ? (
                  <>
                    <span className="spinner mr-2"></span>
                    Creating Account...
                  </>
                ) : (
                  'Create Account'
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-slate-600">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="text-secondary hover:text-amber-700 font-medium"
                  data-testid="login-link"
                >
                  Login here
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-slate-400 mt-6">
          By creating an account, you agree to our terms of service and privacy policy.
        </p>
      </div>
    </div>
  );
};

export default Register;
