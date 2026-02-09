import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useSettings } from '../context/SettingsContext';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { ArrowRight, Users, FileText, Award, Heart, Scale, Shield, BookOpen, Briefcase } from 'lucide-react';
import { getApiUrl } from '@/config/env';

const API = getApiUrl();

const Home = () => {
  const { settings } = useSettings();
  const [recentStories, setRecentStories] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const storiesRes = await axios.get(`${API}/stories/approved`);
        setRecentStories(storiesRes.data.slice(0, 3));
      } catch (error) {
        console.error('Error fetching stories:', error);
      }
    };
    fetchData();
  }, []);

  const features = [
    {
      icon: <Shield className="h-8 w-8" />,
      title: 'Legal Guidance',
      description: 'Expert information on medical negligence laws in India and your rights as a patient.'
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: 'Community Support',
      description: 'Connect with other victims and share experiences in a safe, moderated environment.'
    },
    {
      icon: <BookOpen className="h-8 w-8" />,
      title: 'Educational Resources',
      description: 'Comprehensive guides on understanding medical negligence and seeking compensation.'
    },
    {
      icon: <Heart className="h-8 w-8" />,
      title: 'Victim Advocacy',
      description: 'Dedicated support for victims navigating the complex legal landscape.'
    }
  ];

  return (
    <div data-testid="home-page">
      {/* Hero Section */}
      <section className="relative min-h-[80vh] flex items-center" data-testid="hero-section">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: 'url(https://images.pexels.com/photos/3845456/pexels-photo-3845456.jpeg)' }}
        />
        <div className="absolute inset-0 hero-overlay" />
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-2xl">
            {settings.tagline && settings.tagline !== 'YOUR TAGLINE' && (
              <p className="font-serif text-lg md:text-xl lg:text-2xl font-semibold text-white mb-4 animate-fade-in-up tracking-wide">
                {settings.tagline}
              </p>
            )}
            {settings.hero_title && settings.hero_title !== 'Your Hero Title' && (
              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6 animate-fade-in-up animation-delay-100">
                {settings.hero_title}
              </h1>
            )}
            {settings.hero_subtitle && settings.hero_subtitle !== 'Your hero subtitle description goes here.' && settings.hero_subtitle !== 'Your hero subtitle goes here.' && (
              <p className="text-lg text-slate-300 leading-relaxed mb-8 animate-fade-in-up animation-delay-200">
                {settings.hero_subtitle}
              </p>
            )}
            {/* Show buttons even if title/subtitle are empty */}
            {(!settings.hero_title || settings.hero_title === 'Your Hero Title') && (!settings.hero_subtitle || settings.hero_subtitle === 'Your hero subtitle description goes here.' || settings.hero_subtitle === 'Your hero subtitle goes here.') && (
              <div className="mb-8"></div>
            )}
            <div className="flex flex-wrap gap-4 animate-fade-in-up animation-delay-300">
              <Link to="/register" data-testid="hero-register-btn">
                <Button size="lg" className="bg-secondary hover:bg-amber-700 text-white px-8 py-3 uppercase tracking-widest font-bold">
                  Share Your Story
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/resources" data-testid="hero-resources-btn">
                <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/10 px-8 py-3 uppercase tracking-widest font-bold">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* What We Do Section */}
      <section className="py-20 bg-slate-50" data-testid="features-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-secondary mb-4">Our Mission</p>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-primary mb-4">
              How We Support Victims
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              We provide comprehensive support for victims of medical negligence, 
              helping them navigate the legal system and find justice.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="border-slate-200 hover:shadow-lg transition-shadow" data-testid={`feature-card-${index}`}>
                <CardContent className="p-6">
                  <div className="text-secondary mb-4">{feature.icon}</div>
                  <h3 className="font-serif text-lg font-bold text-primary mb-2">{feature.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Stories Section */}
      {recentStories.length > 0 && (
        <section className="py-20 bg-white" data-testid="recent-stories-section">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-end mb-12">
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.3em] text-secondary mb-4">Voice of Unheard</p>
                <h2 className="font-serif text-3xl md:text-4xl font-bold text-primary">
                  Recent Stories
                </h2>
              </div>
              <Link to="/stories" className="hidden md:block" data-testid="view-all-stories-link">
                <Button variant="ghost" className="text-primary hover:text-secondary">
                  View All Stories
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {recentStories.map((story) => (
                <Link to={`/stories/${story.id}`} key={story.id} data-testid={`story-card-${story.id}`}>
                  <Card className="case-file-card h-full hover:shadow-lg transition-all story-card">
                    <CardContent className="p-6">
                      <p className="font-mono text-xs uppercase tracking-widest text-slate-500 mb-3">
                        {story.location}
                      </p>
                      <h3 className="font-serif text-xl font-bold text-primary mb-3 line-clamp-2">
                        {story.title}
                      </h3>
                      <p className="text-slate-600 text-sm line-clamp-3 mb-4">
                        {story.description}
                      </p>
                      <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                        <span className="text-xs text-slate-500">
                          {new Date(story.created_at).toLocaleDateString('en-IN')}
                        </span>
                        <span className="text-xs font-medium text-secondary">Read More →</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>

            <div className="md:hidden text-center mt-8">
              <Link to="/stories">
                <Button variant="outline" className="border-primary text-primary">
                  View All Stories
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 bg-primary" data-testid="cta-section">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-white mb-6">
            Your Voice Matters
          </h2>
          <p className="text-slate-300 text-lg mb-8 max-w-2xl mx-auto">
            Every story shared helps raise awareness and supports other victims. 
            Join our community and help us fight for accountability in healthcare.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/register" data-testid="cta-share-story-btn">
              <Button size="lg" className="bg-secondary hover:bg-amber-700 text-white px-8 uppercase tracking-widest font-bold">
                Share Your Story
              </Button>
            </Link>
            <Link to="/donate" data-testid="cta-donate-btn">
              <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/10 px-8 uppercase tracking-widest font-bold">
                Support Our Cause
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
