import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { Checkbox } from '../components/ui/checkbox';
import { Scale, Eye, EyeOff, AlertCircle, Briefcase } from 'lucide-react';
import { toast } from 'sonner';
import { getApiUrl } from '@/config/env';

const API = getApiUrl();

const SPECIALIZATIONS = [
  'Medical Negligence',
  'Consumer Protection',
  'Healthcare Law',
  'Civil Litigation',
  'Criminal Law',
  'Insurance Claims',
  'Human Rights'
];

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Chandigarh'
];

const LANGUAGES = ['English', 'Hindi', 'Tamil', 'Telugu', 'Kannada', 'Malayalam', 'Marathi', 'Bengali', 'Gujarati', 'Punjabi'];

const AdvocateRegister = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
    bar_council_number: '',
    experience_years: '',
    about: '',
    specializations: [],
    areas_of_operation: [],
    languages: ['English', 'Hindi']
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (field, value, checked) => {
    setFormData(prev => ({
      ...prev,
      [field]: checked
        ? [...prev[field], value]
        : prev[field].filter(item => item !== value)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.specializations.length === 0) {
      toast.error('Please select at least one specialization');
      return;
    }
    
    if (formData.areas_of_operation.length === 0) {
      toast.error('Please select at least one area of operation');
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${API}/advocates/register`, {
        ...formData,
        experience_years: parseInt(formData.experience_years)
      });
      toast.success('Registration submitted! Your profile will be reviewed by our team.');
      navigate('/advocates');
    } catch (error) {
      console.error('Registration error:', error);
      toast.error(error.response?.data?.detail || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4" data-testid="advocate-register-page">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <Scale className="h-10 w-10 text-primary" />
            <span className="font-serif text-2xl font-bold text-primary">VOICE-Victims' Outreach & Initiative for Crime of Medical Negligence</span>
          </Link>
          <h1 className="font-serif text-3xl font-bold text-primary mb-2">Register as Pro Bono Advocate</h1>
          <p className="text-slate-600">Join our network of advocates supporting victims of medical negligence</p>
        </div>

        {/* Notice */}
        <div className="bg-accent/10 border border-accent p-4 mb-6 flex items-start gap-3">
          <Briefcase className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
          <div className="text-sm text-slate-700">
            <p className="font-medium mb-1">Pro Bono Commitment</p>
            <p>
              By registering, you agree to provide initial consultations and basic guidance 
              on a pro bono basis. Victims who need financial support can apply for grants 
              from the foundation.
            </p>
          </div>
        </div>

        <Card className="border-slate-200 shadow-lg">
          <CardHeader className="border-b border-slate-100">
            <CardTitle className="font-serif text-xl">Professional Details</CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6" data-testid="advocate-register-form">
              {/* Personal Info */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Full Name *</Label>
                  <Input
                    id="full_name"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleChange}
                    required
                    placeholder="Adv. Full Name"
                    className="bg-slate-50"
                    data-testid="advocate-name-input"
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
                    placeholder="advocate@email.com"
                    className="bg-slate-50"
                    data-testid="advocate-email-input"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    placeholder="+91 XXXXX XXXXX"
                    className="bg-slate-50"
                    data-testid="advocate-phone-input"
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
                      placeholder="Min 6 characters"
                      className="bg-slate-50 pr-10"
                      data-testid="advocate-password-input"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Professional Info */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bar_council_number">Bar Council Number *</Label>
                  <Input
                    id="bar_council_number"
                    name="bar_council_number"
                    value={formData.bar_council_number}
                    onChange={handleChange}
                    required
                    placeholder="e.g., MH/1234/2020"
                    className="bg-slate-50"
                    data-testid="advocate-bar-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="experience_years">Years of Experience *</Label>
                  <Input
                    id="experience_years"
                    name="experience_years"
                    type="number"
                    min="0"
                    value={formData.experience_years}
                    onChange={handleChange}
                    required
                    placeholder="e.g., 5"
                    className="bg-slate-50"
                    data-testid="advocate-experience-input"
                  />
                </div>
              </div>

              {/* Specializations */}
              <div className="space-y-3">
                <Label>Specializations * (Select all that apply)</Label>
                <div className="grid grid-cols-2 gap-2">
                  {SPECIALIZATIONS.map(spec => (
                    <div key={spec} className="flex items-center space-x-2">
                      <Checkbox
                        id={`spec-${spec}`}
                        checked={formData.specializations.includes(spec)}
                        onCheckedChange={(checked) => handleCheckboxChange('specializations', spec, checked)}
                        data-testid={`spec-${spec.toLowerCase().replace(' ', '-')}`}
                      />
                      <label htmlFor={`spec-${spec}`} className="text-sm text-slate-700 cursor-pointer">
                        {spec}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Areas of Operation */}
              <div className="space-y-3">
                <Label>Areas of Operation * (Select all that apply)</Label>
                <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto p-2 border border-slate-200 bg-slate-50">
                  {INDIAN_STATES.map(state => (
                    <div key={state} className="flex items-center space-x-2">
                      <Checkbox
                        id={`area-${state}`}
                        checked={formData.areas_of_operation.includes(state)}
                        onCheckedChange={(checked) => handleCheckboxChange('areas_of_operation', state, checked)}
                      />
                      <label htmlFor={`area-${state}`} className="text-sm text-slate-700 cursor-pointer">
                        {state}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Languages */}
              <div className="space-y-3">
                <Label>Languages Known</Label>
                <div className="grid grid-cols-5 gap-2">
                  {LANGUAGES.map(lang => (
                    <div key={lang} className="flex items-center space-x-2">
                      <Checkbox
                        id={`lang-${lang}`}
                        checked={formData.languages.includes(lang)}
                        onCheckedChange={(checked) => handleCheckboxChange('languages', lang, checked)}
                      />
                      <label htmlFor={`lang-${lang}`} className="text-sm text-slate-700 cursor-pointer">
                        {lang}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* About */}
              <div className="space-y-2">
                <Label htmlFor="about">About You *</Label>
                <Textarea
                  id="about"
                  name="about"
                  value={formData.about}
                  onChange={handleChange}
                  required
                  rows={4}
                  placeholder="Describe your experience in handling medical negligence cases, notable achievements, and why you want to help victims..."
                  className="bg-slate-50 resize-none"
                  data-testid="advocate-about-input"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-slate-800 uppercase tracking-widest font-bold"
                data-testid="advocate-submit-btn"
              >
                {loading ? 'Submitting...' : 'Submit Registration'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-slate-600">
                Already registered?{' '}
                <Link to="/advocates" className="text-secondary hover:text-amber-700 font-medium">
                  View Advocate Directory
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdvocateRegister;
