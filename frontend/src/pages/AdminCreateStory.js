import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { ArrowLeft, Upload, X, Send, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { getApiUrl } from '@/config/env';

const API = getApiUrl();

const SubmitStory = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [images, setImages] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    incident_date: '',
    hospital_name: '',
    location: '',
    description: '',
    outcome: ''
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (images.length + files.length > 5) {
      toast.error('Maximum 5 images allowed');
      return;
    }

    files.forEach(file => {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} is too large. Max size is 5MB`);
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setImages(prev => [...prev, { file, preview: e.target.result }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create story
      const response = await axios.post(`${API}/admin/stories`, formData);
      const storyId = response.data.id;

      // Upload images if any
      if (images.length > 0) {
        setUploadingImages(true);
        for (const img of images) {
          const formData = new FormData();
          formData.append('file', img.file);
          await axios.post(
            `${API}/stories/${storyId}/images`,
            formData,
            { headers: { 'Content-Type': 'multipart/form-data' } }
          );
        }
        setUploadingImages(false);
      }

      toast.success('Story submitted successfully! It will be reviewed by our team.');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error submitting story:', error);
      toast.error(error.response?.data?.detail || 'Failed to submit story');
    } finally {
      setLoading(false);
      setUploadingImages(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8" data-testid="submit-story-page">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Link */}
        <Link 
          to="/dashboard" 
          className="inline-flex items-center text-slate-600 hover:text-primary mb-6"
          data-testid="back-to-dashboard"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Link>

        <Card className="border-slate-200 shadow-lg">
          <CardHeader className="border-b border-slate-100">
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-secondary mb-2">
              Share Your Experience
            </p>
            <CardTitle className="font-serif text-2xl">Submit Your Story</CardTitle>
            <p className="text-sm text-slate-500 mt-2">
              Your story will be reviewed by our team before being published.
              All submissions are confidential until approved.
            </p>
          </CardHeader>
          <CardContent className="p-8">
            {/* Notice */}
            <div className="bg-amber-50 border border-amber-200 p-4 mb-8 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-amber-800">
                <p className="font-medium mb-1">Important Notice</p>
                <p>
                  Please ensure all information provided is accurate. Do not include 
                  any false or defamatory statements. All stories are moderated before publication.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6" data-testid="story-form">
              <div className="space-y-2">
                <Label htmlFor="title">Story Title *</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  placeholder="A brief title for your story"
                  className="bg-slate-50"
                  data-testid="story-title-input"
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
                    data-testid="story-date-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location (City/State) *</Label>
                  <Input
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    required
                    placeholder="e.g., Mumbai, Maharashtra"
                    className="bg-slate-50"
                    data-testid="story-location-input"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="hospital_name">Hospital/Healthcare Facility Name *</Label>
                <Input
                  id="hospital_name"
                  name="hospital_name"
                  value={formData.hospital_name}
                  onChange={handleChange}
                  required
                  placeholder="Name of the hospital or clinic"
                  className="bg-slate-50"
                  data-testid="story-hospital-input"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Detailed Description *</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows={8}
                  placeholder="Please describe your experience in detail. Include what happened, what treatment you received, and how it affected you..."
                  className="bg-slate-50 resize-none"
                  data-testid="story-description-input"
                />
                <p className="text-xs text-slate-400">
                  Minimum 100 characters recommended for a complete story.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="outcome">Outcome (Optional)</Label>
                <Textarea
                  id="outcome"
                  name="outcome"
                  value={formData.outcome}
                  onChange={handleChange}
                  rows={3}
                  placeholder="What was the outcome? Did you seek legal action? What resolution was reached?"
                  className="bg-slate-50 resize-none"
                  data-testid="story-outcome-input"
                />
              </div>

              {/* Image Upload */}
              <div className="space-y-2">
                <Label>Supporting Images (Optional)</Label>
                <div className="border-2 border-dashed border-slate-300 p-6 text-center hover:border-slate-400 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                    data-testid="image-upload-input"
                  />
                  <label htmlFor="image-upload" className="cursor-pointer">
                    <Upload className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                    <p className="text-sm text-slate-600">
                      Click to upload images (Max 5 images, 5MB each)
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      JPG, PNG, or GIF
                    </p>
                  </label>
                </div>

                {/* Image Previews */}
                {images.length > 0 && (
                  <div className="grid grid-cols-5 gap-2 mt-4" data-testid="image-previews">
                    {images.map((img, index) => (
                      <div key={index} className="relative aspect-square">
                        <img
                          src={img.preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-full object-cover border border-slate-200"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                          data-testid={`remove-image-${index}`}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-4 pt-6 border-t border-slate-200">
                <Link to="/dashboard">
                  <Button type="button" variant="outline" className="border-slate-300">
                    Cancel
                  </Button>
                </Link>
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-primary hover:bg-slate-800 uppercase tracking-widest font-bold"
                  data-testid="submit-story-btn"
                >
                  {loading ? (
                    <>
                      <span className="spinner mr-2"></span>
                      {uploadingImages ? 'Uploading Images...' : 'Submitting...'}
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Submit Story
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

export default SubmitStory;
