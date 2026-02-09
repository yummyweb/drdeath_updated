import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useSettings } from '../context/SettingsContext';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Target, Eye, Heart, Users, Scale, Shield, ChevronLeft, ChevronRight, Linkedin, Mail } from 'lucide-react';
import { getImageUrl } from '../utils/imageUrl';
import { getApiUrl } from '@/config/env';

const API = getApiUrl();

const About = () => {
  const { settings } = useSettings();
  const [teamMembers, setTeamMembers] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [expandedBios, setExpandedBios] = useState({});

  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        const response = await axios.get(`${API}/team-members`);
        setTeamMembers(response.data);
      } catch (error) {
        console.error('Error fetching team members:', error);
      }
    };
    fetchTeamMembers();
  }, [API]);

  const nextMember = () => {
    setCurrentIndex((prev) => (prev + 1) % teamMembers.length);
  };

  const prevMember = () => {
    setCurrentIndex((prev) => (prev - 1 + teamMembers.length) % teamMembers.length);
  };

  const toggleBio = (memberId) => {
    setExpandedBios((prev) => ({
      ...prev,
      [memberId]: !prev[memberId]
    }));
  };

  const isBioLong = (bio) => {
    if (!bio) return false;
    // Approximate: if bio has more than ~150 characters, consider it long
    return bio.length > 150;
  };
  const values = [
    {
      icon: <Scale className="h-8 w-8" />,
      title: 'Justice',
      description: 'We believe every victim deserves fair treatment and legal recourse.'
    },
    {
      icon: <Heart className="h-8 w-8" />,
      title: 'Compassion',
      description: 'We approach every case with empathy and understanding.'
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: 'Integrity',
      description: 'We maintain the highest ethical standards in all our work.'
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: 'Community',
      description: 'We foster a supportive network for victims and their families.'
    }
  ];

  return (
    <div data-testid="about-page">
      {/* Hero Section */}
      <section className="relative py-20 bg-primary" data-testid="about-hero">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="font-serif text-4xl md:text-5xl font-bold text-white mb-6">
              Advocating for Victims of Medical Negligence
            </h1>
            <p className="text-lg text-slate-300 leading-relaxed">
              VOICE-Victims' Outreach & Initiative for Crime of Medical Negligence is dedicated to supporting victims of medical negligence 
              in India by providing awareness, resources, and a platform to share their stories and seek justice.
            </p>
          </div>
        </div>
      </section>

      {/* About Us Photo Section - Pro Bono Style */}
      <section className="py-20 bg-white" data-testid="about-photo-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left Section - Text Content */}
            <div>
              <h2 className="font-serif text-4xl md:text-5xl font-bold mb-6">
                <span className="text-primary">About</span>{' '}
                <span className="text-secondary">Us</span>
              </h2>
              <div className="text-slate-600 leading-relaxed text-lg space-y-4">
                <p>
                  VOICE unites legal expertise, victim narratives, and social action litigation to advance justice, accountability, and dignity for victims of medical negligence in India.
                </p>
                <p>
                  The Foundation endeavours to provide pro bono legal assistance to affected individuals and families, promote patient rights, pursue accountability under civil and criminal law, and strengthen systems to prevent medical negligence. VOICE gives voice to those whose plight goes unheard.
                </p>
              </div>
            </div>

            {/* Right Section - Team Members Carousel */}
            <div className="relative w-full">
              {teamMembers.length > 0 ? (
                <div className="aspect-[3/4] md:aspect-[4/5] bg-slate-200 rounded-lg overflow-hidden relative">
                  {/* Carousel Container */}
                  <div className="relative w-full h-full">
                    {teamMembers.map((member, index) => (
                      <div
                        key={member.id}
                        className={`absolute inset-0 transition-opacity duration-500 ${
                          index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
                        }`}
                      >
                        <div className="w-full h-full flex flex-col">
                          {/* Image */}
                          <div className="flex-1 relative overflow-hidden bg-slate-100">
                            {member.image_url ? (
                              <img
                                src={getImageUrl(member.image_url)}
                                alt={member.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Users className="h-16 w-16 text-slate-400" />
                              </div>
                            )}
                          </div>
                          
                          {/* Member Info Overlay */}
                          <div className="bg-white p-6">
                            <h3 className="font-serif text-xl font-bold text-primary mb-1">
                              {member.name}
                            </h3>
                            <p className="text-sm text-secondary mb-3">{member.title}</p>
                            {member.bio && (
                              <div className="mb-3">
                                <p 
                                  className={`text-sm text-slate-600 ${
                                    expandedBios[member.id] ? '' : 'line-clamp-2'
                                  }`}
                                >
                                  {member.bio}
                                </p>
                                {isBioLong(member.bio) && (
                                  <button
                                    onClick={() => toggleBio(member.id)}
                                    className="text-xs text-secondary hover:text-amber-700 font-medium mt-1 transition-colors"
                                  >
                                    {expandedBios[member.id] ? 'Read less' : 'Read more'}
                                  </button>
                                )}
                              </div>
                            )}
                            <div className="flex gap-3">
                              {member.email && (
                                <a
                                  href={`mailto:${member.email}`}
                                  className="text-slate-400 hover:text-primary transition-colors"
                                  aria-label="Email"
                                >
                                  <Mail className="h-5 w-5" />
                                </a>
                              )}
                              {member.linkedin_url && (
                                <a
                                  href={member.linkedin_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-slate-400 hover:text-primary transition-colors"
                                  aria-label="LinkedIn"
                                >
                                  <Linkedin className="h-5 w-5" />
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Navigation Buttons */}
                  {teamMembers.length > 1 && (
                    <>
                      <button
                        onClick={prevMember}
                        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg transition-all"
                        aria-label="Previous member"
                      >
                        <ChevronLeft className="h-6 w-6 text-primary" />
                      </button>
                      <button
                        onClick={nextMember}
                        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg transition-all"
                        aria-label="Next member"
                      >
                        <ChevronRight className="h-6 w-6 text-primary" />
                      </button>
                      
                      {/* Dots Indicator */}
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                        {teamMembers.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentIndex(index)}
                            className={`w-2 h-2 rounded-full transition-all ${
                              index === currentIndex ? 'bg-primary w-6' : 'bg-white/50'
                            }`}
                            aria-label={`Go to member ${index + 1}`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="aspect-[3/4] md:aspect-[4/5] bg-slate-200 rounded-lg overflow-hidden flex items-center justify-center">
                  <div className="w-full h-full flex items-center justify-center bg-slate-100">
                    <p className="text-slate-400 text-sm">Add team members in Admin Settings</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 bg-slate-50" data-testid="mission-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12">
              <div className="flex flex-col justify-center">
                <div className="mb-10">
                  <div className="flex items-center gap-3 mb-4">
                    <Target className="h-6 w-6 text-secondary" />
                    <p className="font-mono text-xs uppercase tracking-[0.3em] text-secondary">Our Mission</p>
                  </div>
                  <h2 className="font-serif text-2xl md:text-3xl font-bold text-primary mb-4">
                    Empowering Victims Through Awareness
                  </h2>
                  <p className="text-slate-600 leading-relaxed">
                    Our mission is to empower victims of medical negligence by providing 
                    them with the knowledge, resources, and community support they need 
                    to seek justice. We believe that every patient has the right to safe 
                    and competent medical care.
                  </p>
                </div>

                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <Eye className="h-6 w-6 text-secondary" />
                    <p className="font-mono text-xs uppercase tracking-[0.3em] text-secondary">Our Vision</p>
                  </div>
                  <h2 className="font-serif text-2xl md:text-3xl font-bold text-primary mb-4">
                    A Future of Healthcare Accountability
                  </h2>
                  <p className="text-slate-600 leading-relaxed">
                    We envision a healthcare system in India where medical professionals 
                    are held accountable for negligence, victims receive fair compensation, 
                    and the quality of patient care continuously improves.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-20 bg-slate-50" data-testid="values-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-secondary mb-4">
              Our Foundation
            </p>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-primary">
              Core Values
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <Card key={index} className="border-slate-200 text-center" data-testid={`value-card-${index}`}>
                <CardContent className="p-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 mb-4 text-secondary bg-secondary/10">
                    {value.icon}
                  </div>
                  <h3 className="font-serif text-lg font-bold text-primary mb-2">{value.title}</h3>
                  <p className="text-sm text-slate-600">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Professional Image Section - JustAnswer Style */}
      {settings.professional_image_url && (
        <section className="py-20 bg-slate-50" data-testid="professional-section">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
              <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="grid md:grid-cols-3 gap-0">
                  {/* Professional Image */}
                  <div className="bg-slate-100 flex items-center justify-center p-8 md:p-12">
                    <div className="relative w-full max-w-sm">
                      <div className="aspect-square rounded-lg overflow-hidden shadow-xl bg-white">
                        <img
                          src={getImageUrl(settings.professional_image_url)}
                          alt={settings.professional_name || 'Professional'}
                          className="w-full h-full object-contain"
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Professional Info */}
                  <div className="md:col-span-2 p-8 md:p-12 flex flex-col justify-center">
                    {settings.professional_name && (
                      <h2 className="font-serif text-3xl md:text-4xl font-bold text-primary mb-4">
                        {settings.professional_name}
                      </h2>
                    )}
                    {settings.professional_title && (
                      <p className="font-mono text-sm uppercase tracking-wider text-secondary mb-6">
                        {settings.professional_title}
                      </p>
                    )}
                    {settings.professional_bio && (
                      <div className="prose prose-slate max-w-none">
                        <p className="text-slate-600 leading-relaxed text-lg">
                          {settings.professional_bio}
                        </p>
                      </div>
                    )}
                    {(!settings.professional_name && !settings.professional_title && !settings.professional_bio) && (
                      <p className="text-slate-600 text-lg">
                        Meet our dedicated professional committed to supporting victims of medical negligence.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* What is Medical Negligence */}
      <section className="py-20 bg-white" data-testid="negligence-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-secondary mb-4 text-center">
              Understanding the Issue
            </p>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-primary mb-8 text-center">
              What is Medical Negligence?
            </h2>
            
            <div className="prose prose-slate max-w-none">
              <p className="text-slate-600 leading-relaxed mb-6">
                Medical negligence occurs when a healthcare professional fails to provide 
                the standard of care that a reasonably competent professional would have 
                provided in similar circumstances, resulting in harm to the patient.
              </p>

              <div className="bg-slate-50 border-l-4 border-secondary p-6 mb-6">
                <h3 className="font-serif text-xl font-bold text-primary mb-3">
                  Common Forms of Medical Negligence
                </h3>
                <ul className="space-y-2 text-slate-600">
                  <li>• Misdiagnosis or delayed diagnosis</li>
                  <li>• Surgical errors and wrong-site surgery</li>
                  <li>• Medication errors and wrong prescriptions</li>
                  <li>• Birth injuries due to negligent care</li>
                  <li>• Failure to obtain informed consent</li>
                  <li>• Inadequate follow-up or aftercare</li>
                  <li>• Hospital-acquired infections due to poor hygiene</li>
                </ul>
              </div>

              <p className="text-slate-600 leading-relaxed">
                In India, victims of medical negligence can seek compensation through 
                Consumer Courts, Civil Courts, or Criminal Courts depending on the 
                nature and severity of the case. VOICE-Victims' Outreach & Initiative for Crime of Medical Negligence provides information 
                and support to help victims understand their options.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary" data-testid="about-cta">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-white mb-6">
            Join Our Cause
          </h2>
          <p className="text-slate-300 text-lg mb-8">
            Whether you're a victim seeking support or someone who wants to contribute 
            to our mission, there are many ways to get involved.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/register" data-testid="about-register-btn">
              <Button size="lg" className="bg-secondary hover:bg-amber-700 text-white px-8 uppercase tracking-widest font-bold">
                Share Your Story
              </Button>
            </Link>
            <Link to="/donate" data-testid="about-donate-btn">
              <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/10 px-8 uppercase tracking-widest font-bold">
                Make a Donation
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
