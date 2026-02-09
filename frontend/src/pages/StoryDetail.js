import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { ArrowLeft, MapPin, Calendar, Building2, User, ChevronLeft, ChevronRight } from 'lucide-react';
import { getImageUrl } from '../utils/imageUrl';
import { getApiUrl } from '@/config/env';

const API = getApiUrl();

const StoryDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [story, setStory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const fetchStory = async () => {
      try {
        const response = await axios.get(`${API}/stories/${id}`);
        if (response.data.status !== 'approved') {
          navigate('/stories');
          return;
        }
        setStory(response.data);
      } catch (error) {
        console.error('Error fetching story:', error);
        navigate('/stories');
      } finally {
        setLoading(false);
      }
    };
    fetchStory();
  }, [id, navigate]);

  const nextImage = () => {
    if (story?.images?.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % story.images.length);
    }
  };

  const prevImage = () => {
    if (story?.images?.length > 1) {
      setCurrentImageIndex((prev) => (prev - 1 + story.images.length) % story.images.length);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-slate-500">Loading story...</p>
        </div>
      </div>
    );
  }

  if (!story) {
    return null;
  }

  return (
    <div data-testid="story-detail-page">
      {/* Back Navigation */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link to="/stories" className="inline-flex items-center text-slate-600 hover:text-primary transition-colors" data-testid="back-to-stories">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Stories
          </Link>
        </div>
      </div>

      {/* Story Content */}
      <article className="py-12 bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <header className="mb-8">
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-secondary mb-4">
              Case Report
            </p>
            <h1 className="font-serif text-3xl md:text-4xl font-bold text-primary mb-6" data-testid="story-title">
              {story.title}
            </h1>
            
            <div className="flex flex-wrap gap-4 text-sm text-slate-600">
              <span className="flex items-center gap-2">
                <User className="h-4 w-4 text-secondary" />
                {story.user_name}
              </span>
              <span className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-secondary" />
                {story.location}
              </span>
              <span className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-secondary" />
                {story.hospital_name}
              </span>
              <span className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-secondary" />
                {new Date(story.incident_date).toLocaleDateString('en-IN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </div>
          </header>

          {/* Images */}
          {story.images && story.images.length > 0 && (
            <div className="mb-8 relative" data-testid="story-images">
              <div className="aspect-video bg-slate-200 overflow-hidden">
                <img
                  src={getImageUrl(story.images[currentImageIndex])}
                  alt={`${story.title} - Image ${currentImageIndex + 1}`}
                  className="w-full h-full object-contain bg-slate-100"
                  onError={(e) => {
                    console.error('Image failed to load:', story.images[currentImageIndex]);
                    e.target.style.display = 'none';
                  }}
                />
              </div>
              
              {story.images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 p-2 hover:bg-white transition-colors"
                    data-testid="prev-image-btn"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 p-2 hover:bg-white transition-colors"
                    data-testid="next-image-btn"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </button>
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/90 px-3 py-1 text-sm">
                    {currentImageIndex + 1} / {story.images.length}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Main Content */}
          <Card className="case-file-card mb-8">
            <CardContent className="p-8">
              <h2 className="font-serif text-xl font-bold text-primary mb-4 pb-4 border-b border-slate-200">
                Case Description
              </h2>
              <div className="prose prose-slate max-w-none" data-testid="story-description">
                {story.description.split('\n').map((paragraph, index) => (
                  <p key={index} className="text-slate-700 leading-relaxed mb-4">
                    {paragraph}
                  </p>
                ))}
              </div>

              {story.outcome && (
                <>
                  <h2 className="font-serif text-xl font-bold text-primary mb-4 mt-8 pt-8 border-t border-slate-200">
                    Outcome
                  </h2>
                  <p className="text-slate-700 leading-relaxed" data-testid="story-outcome">
                    {story.outcome}
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          {/* Case Details */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <h3 className="font-mono text-xs uppercase tracking-widest text-slate-500 mb-4">
                Case Details
              </h3>
              <div className="grid sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-slate-500">Hospital/Facility:</span>
                  <p className="font-medium text-primary">{story.hospital_name}</p>
                </div>
                <div>
                  <span className="text-slate-500">Location:</span>
                  <p className="font-medium text-primary">{story.location}</p>
                </div>
                <div>
                  <span className="text-slate-500">Incident Date:</span>
                  <p className="font-medium text-primary">
                    {new Date(story.incident_date).toLocaleDateString('en-IN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                <div>
                  <span className="text-slate-500">Story Shared:</span>
                  <p className="font-medium text-primary">
                    {new Date(story.created_at).toLocaleDateString('en-IN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* CTA */}
          <div className="text-center py-8 bg-white border border-slate-200 p-8">
            <h3 className="font-serif text-xl font-bold text-primary mb-3">
              Has something similar happened to you?
            </h3>
            <p className="text-slate-600 mb-6">
              Share your story to raise awareness and connect with others who understand.
            </p>
            <Link to="/register" data-testid="share-story-detail-btn">
              <Button className="bg-secondary hover:bg-amber-700 text-white uppercase tracking-widest font-bold">
                Share Your Story
              </Button>
            </Link>
          </div>
        </div>
      </article>
    </div>
  );
};

export default StoryDetail;
