import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useSettings } from '../context/SettingsContext';
import { getImageUrl } from '../utils/imageUrl';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import { 
  Scale, 
  FileText, 
  Building2, 
  Phone, 
  ExternalLink,
  BookOpen,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  Play,
  X
} from 'lucide-react';
import { getApiUrl } from '@/config/env';

const API = getApiUrl();

const Resources = () => {
  const { settings } = useSettings();
  const [cases, setCases] = useState([]);
  const [selectedCase, setSelectedCase] = useState(null);
  const [isCaseDialogOpen, setIsCaseDialogOpen] = useState(false);

  useEffect(() => {
    const fetchCases = async () => {
      try {
        const response = await axios.get(`${API}/cases`);
        setCases(response.data);
      } catch (error) {
        console.error('Error fetching cases:', error);
      }
    };
    fetchCases();
  }, [API]);

  const handleCaseClick = (caseItem) => {
    setSelectedCase(caseItem);
    setIsCaseDialogOpen(true);
  };
  
  const legalResources = [
    {
      title: 'Consumer Protection Act, 2019',
      description: 'Medical services fall under this act. Victims can file complaints in Consumer Courts for compensation.',
      link: 'https://consumeraffairs.nic.in/acts-and-rules/consumer-protection-act-2019'
    },
    {
      title: 'Indian Medical Council Act, 1956',
      description: 'Governs medical professionals and allows complaints to State Medical Councils for disciplinary action.',
      link: 'https://www.nmc.org.in/'
    },
    {
      title: 'Clinical Establishments Act, 2010',
      description: 'Mandates minimum standards for healthcare facilities. Non-compliance can be reported.',
      link: 'https://clinicalestablishments.gov.in/'
    },
    {
      title: 'Jacob Mathews Vs State of Punjab',
      description: 'The main problem - A landmark Supreme Court case that is the biggest hurdle in your path to justice. It is misinterpreted by courts and investigating agencies.',
      link: 'https://indiankanoon.org/doc/871062/'
    }
  ];

  const steps = [
    {
      number: '01',
      title: 'Document Everything',
      description: 'Collect all medical records, prescriptions, bills, and correspondence with the healthcare provider.'
    },
    {
      number: '02',
      title: 'Get Medical Opinion',
      description: 'Consult another qualified doctor to understand if negligence occurred and get a written opinion.'
    },
    {
      number: '03',
      title: 'File a Complaint',
      description: 'Choose the appropriate forum: Consumer Court, State Medical Council, or file a civil/criminal case.'
    },
    {
      number: '04',
      title: 'Seek Legal Help',
      description: 'Consult a lawyer specializing in medical negligence cases for proper legal representation.'
    }
  ];


  return (
    <div data-testid="resources-page">
      {/* Hero Section */}
      <section className="relative py-20 bg-primary" data-testid="resources-hero">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-secondary mb-4">
              Legal Resources
            </p>
            <h1 className="font-serif text-4xl md:text-5xl font-bold text-white mb-6">
              {settings.resources_hero_title || 'Know Your Rights'}
            </h1>
            <p className="text-lg text-slate-300 leading-relaxed">
              {settings.resources_hero_description || 
                "Understanding the legal framework for medical negligence in India empowers you to seek justice and hold healthcare providers accountable."}
            </p>
          </div>
        </div>
      </section>

      {/* What is Medical Negligence */}
      <section className="py-16 bg-white" data-testid="definition-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.3em] text-secondary mb-4">
                Understanding
              </p>
              <h2 className="font-serif text-3xl font-bold text-primary mb-6">
                What Constitutes Medical Negligence?
              </h2>
              <p className="text-slate-600 leading-relaxed mb-6">
                Medical negligence in India is established when a healthcare provider 
                fails to meet the standard of care expected from a reasonably competent 
                professional, resulting in harm to the patient.
              </p>
              
              <div className="space-y-4">
                <div className="flex gap-4">
                  <AlertTriangle className="h-6 w-6 text-secondary flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold text-primary mb-1">Duty of Care</h4>
                    <p className="text-sm text-slate-600">A doctor-patient relationship must exist</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <AlertTriangle className="h-6 w-6 text-secondary flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold text-primary mb-1">Breach of Duty</h4>
                    <p className="text-sm text-slate-600">The standard of care was not met</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <AlertTriangle className="h-6 w-6 text-secondary flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold text-primary mb-1">Causation</h4>
                    <p className="text-sm text-slate-600">The breach directly caused harm</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <AlertTriangle className="h-6 w-6 text-secondary flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold text-primary mb-1">Damages</h4>
                    <p className="text-sm text-slate-600">Actual harm or loss occurred</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <img
                src="https://images.pexels.com/photos/5669602/pexels-photo-5669602.jpeg"
                alt="Legal gavel"
                className="w-full h-80 object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Steps to Take */}
      <section className="py-16 bg-slate-50" data-testid="steps-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-secondary mb-4">
              Take Action
            </p>
            <h2 className="font-serif text-3xl font-bold text-primary mb-4">
              Steps to Pursue a Medical Negligence Case
            </h2>
            <div className="max-w-3xl mx-auto mt-4 mb-6">
              <p className="text-sm text-slate-600 italic border-l-4 border-secondary pl-4 py-2 bg-slate-50">
                <strong>Disclaimer:</strong> These steps are not chronological. In most cases, you may have to seek legal opinion first or may be file a police complaint.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, index) => (
              <Card key={index} className="border-slate-200 relative" data-testid={`step-${index + 1}`}>
                <CardContent className="p-6 pt-12">
                  <span className="absolute top-4 left-6 font-mono text-4xl font-bold text-black">
                    {step.number}
                  </span>
                  <h3 className="font-serif text-lg font-bold text-primary mb-2 relative z-10">
                    {step.title}
                  </h3>
                  <p className="text-sm text-slate-600">{step.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Legal Framework */}
      <section className="py-16 bg-white" data-testid="legal-framework-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-secondary mb-4">
              Legal Framework
            </p>
            <h2 className="font-serif text-3xl font-bold text-primary">
              Key Laws & Regulations
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {legalResources.map((resource, index) => (
              <Card key={index} className="border-slate-200 hover:shadow-lg transition-shadow" data-testid={`legal-resource-${index}`}>
                <CardHeader>
                  <Scale className="h-8 w-8 text-secondary mb-2" />
                  <CardTitle className="font-serif text-lg">{resource.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-600 mb-4">{resource.description}</p>
                  <a
                    href={resource.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-sm text-secondary hover:text-amber-700 font-medium"
                  >
                    Learn More <ExternalLink className="ml-1 h-3 w-3" />
                  </a>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Our Cases */}
      {cases.length > 0 && (
        <section className="py-16 bg-slate-50" data-testid="our-cases-section">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <p className="font-mono text-xs uppercase tracking-[0.3em] text-secondary mb-4">
                Our Cases
              </p>
              <h2 className="font-serif text-3xl font-bold text-primary">
                Cases We're Working On
              </h2>
            </div>

            <div className="overflow-x-auto pb-4 scroll-smooth">
              <div className="flex gap-6 min-w-max px-2">
                {cases.map((caseItem) => (
                  <Card 
                    key={caseItem.id} 
                    className="w-80 flex-shrink-0 border-slate-200 hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => handleCaseClick(caseItem)}
                  >
                    <div className="relative">
                      {caseItem.image_url || caseItem.youtube_thumbnail ? (
                        <div className="relative h-48 w-full overflow-hidden rounded-t-lg bg-slate-100">
                          <img
                            src={getImageUrl(caseItem.image_url || caseItem.youtube_thumbnail)}
                            alt={caseItem.title}
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              console.error('Image failed to load:', caseItem.image_url || caseItem.youtube_thumbnail);
                              e.target.style.display = 'none';
                            }}
                          />
                          {caseItem.youtube_url && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
                              <a
                                href={caseItem.youtube_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center w-16 h-16 bg-red-600 rounded-full hover:bg-red-700 transition-colors"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Play className="h-8 w-8 text-white ml-1" />
                              </a>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="h-48 w-full bg-slate-100 flex items-center justify-center rounded-t-lg">
                          <FileText className="h-12 w-12 text-slate-400" />
                        </div>
                      )}
                    </div>
                    <CardContent className="p-6">
                      <h3 className="font-serif text-lg font-bold text-primary mb-2">
                        {caseItem.title}
                      </h3>
                      <p className="text-sm text-slate-600 line-clamp-3 mb-4">
                        {caseItem.description}
                      </p>
                      {caseItem.youtube_url && (
                        <a
                          href={caseItem.youtube_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-sm text-secondary hover:text-amber-700 font-medium"
                          onClick={(e) => e.stopPropagation()}
                        >
                          Watch Video <ExternalLink className="ml-1 h-3 w-3" />
                        </a>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Where to File Complaint */}
      <section className="py-16 bg-slate-50" data-testid="complaint-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-secondary mb-4 text-center">
              Forums for Redressal
            </p>
            <h2 className="font-serif text-3xl font-bold text-primary mb-8 text-center">
              Where Can You File a Complaint?
            </h2>

            <div className="space-y-6">
              <Card className="border-slate-200">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <Building2 className="h-8 w-8 text-secondary flex-shrink-0" />
                    <div>
                      <h3 className="font-serif text-lg font-bold text-primary mb-2">Consumer Courts</h3>
                      <p className="text-slate-600 text-sm mb-3">
                        Most accessible forum for medical negligence cases. File based on expenses incurred NOT THE COMPENSATION demanded:
                      </p>
                      <ul className="text-sm text-slate-600 space-y-1">
                        <li>• <strong>District Commissions</strong> handle up to ₹50 Lakhs</li>
                        <li>• <strong>State Commissions</strong> handle over ₹50 Lakhs to ₹2 Crores</li>
                        <li>• <strong>National Commission</strong> handles cases exceeding ₹2 Crores</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-200">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <FileText className="h-8 w-8 text-secondary flex-shrink-0" />
                    <div>
                      <h3 className="font-serif text-lg font-bold text-primary mb-2">State Medical Council</h3>
                      <p className="text-slate-600 text-sm">
                        File complaints against registered medical practitioners for professional misconduct. 
                        Can result in suspension or cancellation of medical license.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-200">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <Scale className="h-8 w-8 text-secondary flex-shrink-0" />
                    <div>
                      <h3 className="font-serif text-lg font-bold text-primary mb-2">Civil & Criminal Courts</h3>
                      <p className="text-slate-600 text-sm">
                        For cases involving serious negligence or death. Civil suits for compensation, 
                        criminal cases under IPC Section 304A (death by negligence) or Section 338 (grievous hurt).
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Patient Rights */}
      <section className="py-16 bg-slate-50" data-testid="rights-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-secondary mb-4 text-center">
              Know Your Rights
            </p>
            <h2 className="font-serif text-3xl font-bold text-primary mb-8 text-center">
              Patient Rights in India
            </h2>

            <div className="grid sm:grid-cols-2 gap-4">
              {[
                'Right to informed consent',
                'Right to access medical records',
                'Right to confidentiality',
                'Right to second opinion',
                'Right to emergency treatment',
                'Right to refuse treatment',
                'Right to transparent billing',
                'Right to quality care'
              ].map((right, index) => (
                <div key={index} className="flex items-center gap-3 bg-white p-4 border border-slate-200">
                  <CheckCircle className="h-5 w-5 text-accent flex-shrink-0" />
                  <span className="text-slate-700">{right}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Custom Content Section */}
      {settings.resources_content && (
        <section className="py-16 bg-white" data-testid="custom-resources-content">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div 
              className="prose prose-slate max-w-none"
              dangerouslySetInnerHTML={{ __html: settings.resources_content }}
            />
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-16 bg-primary" data-testid="resources-cta">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <BookOpen className="h-12 w-12 text-secondary mx-auto mb-6" />
          <h2 className="font-serif text-3xl font-bold text-white mb-4">
            Need More Information?
          </h2>
          <p className="text-slate-300 mb-8">
            Contact us for personalized guidance on your medical negligence case.
          </p>
          <Link to="/contact" data-testid="contact-resources-btn">
            <Button size="lg" className="bg-secondary hover:bg-amber-700 text-white uppercase tracking-widest font-bold">
              Contact Us
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Case Detail Dialog */}
      <Dialog open={isCaseDialogOpen} onOpenChange={setIsCaseDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl font-bold text-primary">
              {selectedCase?.title}
            </DialogTitle>
            <DialogDescription>
              Full case details
            </DialogDescription>
          </DialogHeader>
          
          {selectedCase && (
            <div className="space-y-6">
              {/* Case Image/Thumbnail */}
              {(selectedCase.image_url || selectedCase.youtube_thumbnail) && (
                <div className="relative w-full h-64 md:h-96 rounded-lg overflow-hidden bg-slate-100">
                  <img
                    src={getImageUrl(selectedCase.image_url || selectedCase.youtube_thumbnail)}
                    alt={selectedCase.title}
                    className="w-full h-full object-contain"
                  />
                  {selectedCase.youtube_url && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
                      <a
                        href={selectedCase.youtube_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center w-20 h-20 bg-red-600 rounded-full hover:bg-red-700 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Play className="h-10 w-10 text-white ml-1" />
                      </a>
                    </div>
                  )}
                </div>
              )}

              {/* Full Description */}
              <div className="prose prose-slate max-w-none">
                <h3 className="font-serif text-lg font-bold text-primary mb-3">Case Details</h3>
                <div className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {selectedCase.description.split('\n').map((paragraph, index) => (
                    <p key={index} className="mb-4">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>

              {/* YouTube Link */}
              {selectedCase.youtube_url && (
                <div className="pt-4 border-t border-slate-200">
                  <a
                    href={selectedCase.youtube_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-secondary hover:text-amber-700 font-medium"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Watch Video on YouTube <ExternalLink className="ml-2 h-4 w-4" />
                  </a>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Resources;
