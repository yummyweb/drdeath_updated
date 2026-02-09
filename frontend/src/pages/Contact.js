import React, { useState } from 'react';
import axios from 'axios';
import { useSettings } from '../context/SettingsContext';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Mail, Phone, MapPin, Send, CheckCircle, ShoppingBag } from 'lucide-react';
import { toast } from 'sonner';
import Store from './Store';
import { getApiUrl } from '@/config/env';

const API = getApiUrl();

const Contact = () => {
  const { settings } = useSettings();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post(`${API}/contact`, formData);
      setSubmitted(true);
      toast.success('Your message has been sent successfully!');
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div data-testid="contact-page">
        <section className="relative py-20 bg-primary">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <p className="font-mono text-xs uppercase tracking-[0.3em] text-secondary mb-4">
                Contact Us
              </p>
              <h1 className="font-serif text-4xl md:text-5xl font-bold text-white mb-6">
                Get In Touch
              </h1>
            </div>
          </div>
        </section>

        <section className="py-20 bg-slate-50">
          <div className="max-w-xl mx-auto px-4 text-center" data-testid="success-message">
            <div className="w-20 h-20 bg-accent/10 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-10 w-10 text-accent" />
            </div>
            <h2 className="font-serif text-2xl font-bold text-primary mb-4">
              Message Sent Successfully!
            </h2>
            <p className="text-slate-600 mb-8">
              Thank you for reaching out. Our team will review your message and 
              get back to you at <strong>{formData.email}</strong> within 2-3 business days.
            </p>
            <Button
              onClick={() => {
                setSubmitted(false);
                setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
              }}
              className="bg-primary hover:bg-slate-800"
              data-testid="send-another-btn"
            >
              Send Another Message
            </Button>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div data-testid="contact-page">
      {/* Hero Section */}
      <section className="relative py-20 bg-primary" data-testid="contact-hero">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-secondary mb-4">
              Contact & Store
            </p>
            <h1 className="font-serif text-4xl md:text-5xl font-bold text-white mb-6">
              Get In Touch
            </h1>
            <p className="text-lg text-slate-300 leading-relaxed">
              Have questions about medical negligence? Need guidance? 
              We're here to help. Reach out to us and our team will respond promptly.
            </p>
          </div>
        </div>
      </section>

      {/* Tabs Section */}
      <section className="py-16 bg-slate-50" data-testid="contact-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Tabs defaultValue="contact" className="w-full">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
              <TabsTrigger value="contact" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Contact Us
              </TabsTrigger>
              <TabsTrigger value="store" className="flex items-center gap-2">
                <ShoppingBag className="h-4 w-4" />
                Store
              </TabsTrigger>
            </TabsList>

            <TabsContent value="store" className="mt-0">
              <Store />
            </TabsContent>

            <TabsContent value="contact" className="mt-0">
              <ContactContent
                settings={settings}
                formData={formData}
                setFormData={setFormData}
                handleChange={handleChange}
                handleSubmit={handleSubmit}
                loading={loading}
                submitted={submitted}
                setSubmitted={setSubmitted}
              />
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </div>
  );
};

const ContactContent = ({ settings, formData, setFormData, handleChange, handleSubmit, loading, submitted, setSubmitted }) => {
  if (submitted) {
    return (
      <div className="max-w-xl mx-auto px-4 text-center" data-testid="success-message">
        <div className="w-20 h-20 bg-accent/10 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="h-10 w-10 text-accent" />
        </div>
        <h2 className="font-serif text-2xl font-bold text-primary mb-4">
          Message Sent Successfully!
        </h2>
        <p className="text-slate-600 mb-8">
          Thank you for reaching out. Our team will review your message and 
          get back to you at <strong>{formData.email}</strong> within 2-3 business days.
        </p>
        <Button
          onClick={() => {
            setSubmitted(false);
            setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
          }}
          className="bg-primary hover:bg-slate-800"
          data-testid="send-another-btn"
        >
          Send Another Message
        </Button>
      </div>
    );
  }

  return (
    <>
      {/* Contact Section */}
      <section className="bg-white" data-testid="contact-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Contact Info */}
            <div className="space-y-6">
              <Card className="border-slate-200">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-secondary/10 flex items-center justify-center flex-shrink-0">
                      <Mail className="h-6 w-6 text-secondary" />
                    </div>
                    <div>
                      <h3 className="font-serif font-bold text-primary mb-1">Email Us</h3>
                      <a
                        href={`mailto:${settings.contact_email}`}
                        className="text-slate-600 hover:text-secondary transition-colors text-sm"
                        data-testid="contact-email"
                      >
                        {settings.contact_email}
                      </a>
                      <p className="text-xs text-slate-400 mt-1">
                        We respond within 2-3 business days
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {settings.contact_phone && (
                <Card className="border-slate-200">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-secondary/10 flex items-center justify-center flex-shrink-0">
                        <Phone className="h-6 w-6 text-secondary" />
                      </div>
                      <div>
                        <h3 className="font-serif font-bold text-primary mb-1">Call Us</h3>
                        <p className="text-slate-600 text-sm">{settings.contact_phone}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card className="border-slate-200">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-secondary/10 flex items-center justify-center flex-shrink-0">
                      <MapPin className="h-6 w-6 text-secondary" />
                    </div>
                    <div>
                      <h3 className="font-serif font-bold text-primary mb-1">Location</h3>
                      <p className="text-slate-600 text-sm">
                        {settings.address || 'India'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-200 bg-primary text-white">
                <CardContent className="p-6">
                  <h3 className="font-serif font-bold mb-3">Before You Contact Us</h3>
                  <ul className="space-y-2 text-sm text-slate-300">
                    <li>• Check our Legal Resources section for common questions</li>
                    <li>• Have relevant documents ready if asking about a specific case</li>
                    <li>• Be as specific as possible in your message</li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <Card className="border-slate-200">
                <CardContent className="p-8">
                  <h2 className="font-serif text-2xl font-bold text-primary mb-6">
                    Send Us a Message
                  </h2>

                  <form onSubmit={handleSubmit} className="space-y-6" data-testid="contact-form">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name *</Label>
                        <Input
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          placeholder="Your full name"
                          className="bg-slate-50"
                          data-testid="contact-name-input"
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
                          data-testid="contact-email-input"
                        />
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          name="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="+91 XXXXX XXXXX"
                          className="bg-slate-50"
                          data-testid="contact-phone-input"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="subject">Subject *</Label>
                        <Input
                          id="subject"
                          name="subject"
                          value={formData.subject}
                          onChange={handleChange}
                          required
                          placeholder="What is this about?"
                          className="bg-slate-50"
                          data-testid="contact-subject-input"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">Your Message *</Label>
                      <Textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        required
                        rows={6}
                        placeholder="Please describe your query in detail..."
                        className="bg-slate-50 resize-none"
                        data-testid="contact-message-input"
                      />
                    </div>

                    <div className="flex items-center justify-between pt-4">
                      <p className="text-xs text-slate-400">
                        * Required fields
                      </p>
                      <Button
                        type="submit"
                        disabled={loading}
                        className="bg-primary hover:bg-slate-800 uppercase tracking-widest font-bold"
                        data-testid="contact-submit-btn"
                      >
                        {loading ? (
                          <>
                            <span className="spinner mr-2"></span>
                            Sending...
                          </>
                        ) : (
                          <>
                            <Send className="h-4 w-4 mr-2" />
                            Send Message
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-white" data-testid="faq-section">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-secondary mb-4">
              Quick Answers
            </p>
            <h2 className="font-serif text-2xl font-bold text-primary">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-4">
            {[
              {
                q: 'What type of cases do you handle?',
                a: 'We provide information and support for all types of medical negligence cases including misdiagnosis, surgical errors, medication errors, birth injuries, and more.'
              },
              {
                q: 'Do you provide legal representation?',
                a: 'We provide legal information and resources. For legal representation, we recommend consulting with qualified lawyers specializing in medical negligence cases.'
              },
              {
                q: 'How long does it take to get a response?',
                a: 'We aim to respond to all queries within 2-3 business days. For urgent matters, please mention it in the subject line.'
              },
              {
                q: 'Is my information kept confidential?',
                a: 'Yes, all information shared with us is kept strictly confidential and is only used to assist with your query.'
              }
            ].map((faq, index) => (
              <Card key={index} className="border-slate-200" data-testid={`faq-${index}`}>
                <CardContent className="p-6">
                  <h3 className="font-serif font-bold text-primary mb-2">{faq.q}</h3>
                  <p className="text-sm text-slate-600">{faq.a}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default Contact;
