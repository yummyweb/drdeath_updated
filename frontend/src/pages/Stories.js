import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Search, MapPin, Calendar, ArrowRight, FileText } from 'lucide-react';
import { getImageUrl } from '../utils/imageUrl';
import { getApiUrl } from '@/config/env';

const API = getApiUrl();

const Stories = () => {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredStories, setFilteredStories] = useState([]);

  useEffect(() => {
    const fetchStories = async () => {
      try {
        const response = await axios.get(`${API}/stories/approved`);
        setStories(response.data);
        setFilteredStories(response.data);
      } catch (error) {
        console.error('Error fetching stories:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStories();
  }, []);

  useEffect(() => {
    const filtered = stories.filter(story =>
      story.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      story.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      story.hospital_name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredStories(filtered);
  }, [searchTerm, stories]);

  return (
    <div data-testid="stories-page">
      {/* Hero Section */}
      <section className="relative py-20 bg-primary" data-testid="stories-hero">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-secondary mb-4">
              Voice of Unheard
            </p>
            <h1 className="font-serif text-4xl md:text-5xl font-bold text-white mb-6">
              Victim Stories
            </h1>
            <p className="text-lg text-slate-300 leading-relaxed">
              Every story shared here represents a victim's journey towards justice. 
              These accounts help raise awareness and support others facing similar situations.
            </p>
          </div>
        </div>
      </section>

      {/* Search & Filter Section */}
      <section className="py-8 bg-white border-b border-slate-200" data-testid="search-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative w-full sm:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                type="text"
                placeholder="Search by title, location, or hospital..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-slate-50"
                data-testid="search-input"
              />
            </div>
            <p className="text-sm text-slate-500">
              {filteredStories.length} {filteredStories.length === 1 ? 'story' : 'stories'} found
            </p>
          </div>
        </div>
      </section>

      {/* Stories Grid */}
      <section className="py-16 bg-slate-50" data-testid="stories-grid">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="text-center py-20">
              <div className="spinner mx-auto mb-4"></div>
              <p className="text-slate-500">Loading stories...</p>
            </div>
          ) : filteredStories.length === 0 ? (
            <div className="text-center py-20" data-testid="no-stories">
              <FileText className="h-16 w-16 text-slate-300 mx-auto mb-4" />
              <h3 className="font-serif text-2xl font-bold text-primary mb-2">No Stories Found</h3>
              <p className="text-slate-500 mb-6">
                {searchTerm 
                  ? 'Try adjusting your search terms.'
                  : 'Be the first to share your story and help others.'}
              </p>
              <Link to="/register" data-testid="share-story-empty-btn">
                <Button className="bg-secondary hover:bg-amber-700 text-white">
                  Share Your Story
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredStories.map((story) => (
                <Link to={`/stories/${story.id}`} key={story.id} data-testid={`story-item-${story.id}`}>
                  <Card className="case-file-card h-full hover:shadow-lg transition-all story-card stamp-approved">
                    {story.images && story.images.length > 0 && (
                      <div className="h-48 overflow-hidden">
                        <img
                          src={getImageUrl(story.images[0])}
                          alt={story.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            console.error('Image failed to load:', story.images[0]);
                            e.target.style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4 text-xs text-slate-500 mb-3">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {story.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(story.incident_date).toLocaleDateString('en-IN', { 
                            year: 'numeric', 
                            month: 'short' 
                          })}
                        </span>
                      </div>
                      
                      <h3 className="font-serif text-xl font-bold text-primary mb-3 line-clamp-2">
                        {story.title}
                      </h3>
                      
                      <p className="text-sm text-slate-600 line-clamp-3 mb-4">
                        {story.description}
                      </p>
                      
                      <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                        <span className="font-mono text-xs text-slate-400 uppercase">
                          {story.hospital_name}
                        </span>
                        <span className="text-xs font-medium text-secondary flex items-center gap-1">
                          Read More <ArrowRight className="h-3 w-3" />
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section - Only show when there are stories */}
      {filteredStories.length > 0 && (
      <section className="py-16 bg-white" data-testid="stories-cta">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-serif text-2xl md:text-3xl font-bold text-primary mb-4">
            Have a Story to Share?
          </h2>
          <p className="text-slate-600 mb-6">
            Your experience can help raise awareness and support other victims. 
            All stories are reviewed by our team before publication.
          </p>
          <Link to="/register" data-testid="share-story-cta-btn">
            <Button size="lg" className="bg-primary hover:bg-slate-800 text-white uppercase tracking-widest font-bold">
              Share Your Story
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>
      )}
    </div>
  );
};

export default Stories;
