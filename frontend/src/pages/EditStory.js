import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { ArrowLeft, Save, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { getApiUrl } from '@/config/env';

const API = getApiUrl();

const EditStory = () => {
  const { id } = useParams();
  const { user, isAdmin, getAuthHeader, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    incident_date: '',
    hospital_name: '',
    location: '',
    description: '',
    outcome: ''
  });

  const fetchStory = useCallback(async () => {
    try {
      const response = await axios.get(`${API}/stories/${id}`, getAuthHeader());
      const story = response.data;
      
      // Allow edit if user owns the story OR if user is admin
      if (!isAdmin && story.user_id !== user.id) {
        toast.error('You can only edit your own stories');
        navigate('/dashboard');
        return;
      }

      setFormData({
        title: story.title,
        incident_date: story.incident_date,
        hospital_name: story.hospital_name,
        location: story.location,
        description: story.description,
        outcome: story.outcome || ''
      });
    } catch (error) {
      console.error('Error fetching story:', error);
      toast.error('Story not found');
      navigate(isAdmin ? '/admin' : '/dashboard');
    } finally {
      setLoading(false);
    }
  }, [id, getAuthHeader, user, isAdmin, navigate]);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
      return;
    }

    if (user) {
      fetchStory();
    }
  }, [user, authLoading, fetchStory]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Use admin route if admin, otherwise use regular route
      const endpoint = isAdmin ? `${API}/admin/stories/${id}` : `${API}/stories/${id}`;
      await axios.put(endpoint, formData, getAuthHeader());
      
      if (isAdmin) {
        toast.success('Story updated successfully!');
        navigate('/admin');
      } else {
        toast.success('Story updated successfully! It will be reviewed again.');
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Error updating story:', error);
      toast.error(error.response?.data?.detail || 'Failed to update story');
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8" data-testid="edit-story-page">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link 
          to={isAdmin ? "/admin" : "/dashboard"} 
          className="inline-flex items-center text-slate-600 hover:text-primary mb-6"
          data-testid="back-to-dashboard"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to {isAdmin ? "Admin Panel" : "Dashboard"}
        </Link>

        <Card className="border-slate-200 shadow-lg">
          <CardHeader className="border-b border-slate-100">
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-secondary mb-2">
              Update Your Story
            </p>
            <CardTitle className="font-serif text-2xl">Edit Story</CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            {!isAdmin && (
              <div className="bg-amber-50 border border-amber-200 p-4 mb-8 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-amber-800">
                  <p className="font-medium mb-1">Note</p>
                  <p>
                    After editing, your story will be sent for review again. 
                    The previous approved status will be reset.
                  </p>
                </div>
              </div>
            )}
            {isAdmin && (
              <div className="bg-blue-50 border border-blue-200 p-4 mb-8 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">Admin Edit Mode</p>
                  <p>
                    As an admin, you can edit this story without changing its approval status.
                  </p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6" data-testid="edit-story-form">
              <div className="space-y-2">
                <Label htmlFor="title">Story Title *</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="bg-slate-50"
                  data-testid="edit-title-input"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="incident_date">Incident Date *</Label>
                  <Input
                    id="incident_date"
                    name="incident_date"
                    type="date"
                    value={formData.incident_date}
                    onChange={handleChange}
                    required
                    className="bg-slate-50"
                    data-testid="edit-date-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location *</Label>
                  <Input
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    required
                    className="bg-slate-50"
                    data-testid="edit-location-input"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="hospital_name">Hospital Name *</Label>
                <Input
                  id="hospital_name"
                  name="hospital_name"
                  value={formData.hospital_name}
                  onChange={handleChange}
                  required
                  className="bg-slate-50"
                  data-testid="edit-hospital-input"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows={8}
                  className="bg-slate-50 resize-none"
                  data-testid="edit-description-input"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="outcome">Outcome (Optional)</Label>
                <Textarea
                  id="outcome"
                  name="outcome"
                  value={formData.outcome}
                  onChange={handleChange}
                  rows={3}
                  className="bg-slate-50 resize-none"
                  data-testid="edit-outcome-input"
                />
              </div>

              <div className="flex justify-end gap-4 pt-6 border-t border-slate-200">
                <Link to={isAdmin ? "/admin" : "/dashboard"}>
                  <Button type="button" variant="outline" className="border-slate-300">
                    Cancel
                  </Button>
                </Link>
                <Button
                  type="submit"
                  disabled={saving}
                  className="bg-primary hover:bg-slate-800 uppercase tracking-widest font-bold"
                  data-testid="save-story-btn"
                >
                  {saving ? (
                    <>
                      <span className="spinner mr-2"></span>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EditStory;
