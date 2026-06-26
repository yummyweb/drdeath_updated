import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { ArrowLeft, Send, AlertCircle, Upload, X, Scale } from 'lucide-react';
import { toast } from 'sonner';
import { getApiUrl } from '@/config/env';

const API = getApiUrl();

const CASE_TYPES = [
  'Misdiagnosis',
  'Surgical Error',
  'Medication Error',
  'Birth Injury',
  'Delayed Treatment',
  'Hospital Negligence',
  'Anesthesia Error',
  'Other',
];

const CASE_STAGES = [
  'Pre-Filing (Gathering Evidence)',
  'Legal Notice Sent',
  'Consumer Court Filing',
  'Civil Court Filing',
  'Criminal Complaint',
  'Hearing Stage',
  'Appeal Stage',
];

const AID_TYPES = [
  'Legal Consultation',
  'Drafting Legal Notice',
  'Consumer Court Representation',
  'Civil Court Representation',
  'Criminal Complaint Filing',
  'Guidance on Evidence Collection',
  'Referral to Empanelled Advocate',
  'Multiple / General Assistance',
];

const ApplyGrant = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [formData, setFormData] = useState({
    case_summary: '',
    case_type: '',
    opponent_details: '',
    current_stage: '',
    annual_income: '',
    family_members: '',
    other_income_sources: '',
    amount_required: '0',
    purpose_of_funding: '',
    breakdown_of_costs: '',
  });

  useEffect(() => {
    if (!authLoading && !user) {
      toast.error('Please login to apply for legal aid');
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDocumentUpload = (e) => {
    const files = Array.from(e.target.files);
    if (documents.length + files.length > 5) {
      toast.error('Maximum 5 documents allowed');
      return;
    }
    files.forEach(file => {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} is too large. Max size is 5MB`);
        return;
      }
      const reader = new FileReader();
      reader.onload = (ev) => {
        setDocuments(prev => [...prev, { file, preview: ev.target.result, name: file.name }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeDocument = (index) => {
    setDocuments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(`${API}/grants/apply`, {
        ...formData,
        annual_income: parseFloat(formData.annual_income) || 0,
        family_members: parseInt(formData.family_members) || 1,
        amount_required: 0,
      });

      const grantId = response.data.id;

      for (const doc of documents) {
        const fd = new FormData();
        fd.append('file', doc.file);
        await axios.post(`${API}/grants/${grantId}/documents`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      toast.success('Legal aid application submitted. Our team will review and contact you.');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to submit application');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8" data-testid="apply-grant-page">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to="/dashboard" className="inline-flex items-center text-slate-600 hover:text-primary mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Link>

        <Card className="border-slate-200 shadow-lg">
          <CardHeader className="border-b border-slate-100">
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-secondary mb-2">
              Free / Low-Cost Legal Assistance
            </p>
            <div className="flex items-center gap-3">
              <Scale className="h-6 w-6 text-primary" />
              <CardTitle className="font-serif text-2xl">Apply for Legal Aid</CardTitle>
            </div>
            <p className="text-sm text-slate-500 mt-2">
              VOICE connects victims of medical negligence with free or subsidised legal support.
              Fill out this form and our team will review your case and reach out.
            </p>
          </CardHeader>

          <CardContent className="p-8">
            {/* Notice */}
            <div className="bg-amber-50 border border-amber-200 p-4 mb-8 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-amber-800">
                <p className="font-medium mb-1">Important Information</p>
                <ul className="list-disc ml-4 space-y-1">
                  <li>Legal aid is provided free of charge or at heavily subsidised rates based on merit and need</li>
                  <li>VOICE does not provide legal advice — we connect you with empanelled advocates</li>
                  <li>All information will be kept strictly confidential</li>
                  <li>You may be contacted for additional documents or a brief consultation call</li>
                </ul>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8" data-testid="grant-form">

              {/* Case Details */}
              <div>
                <h3 className="font-serif text-lg font-bold text-primary mb-4 pb-2 border-b border-slate-200">
                  Case Details
                </h3>
                <div className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Type of Medical Negligence *</Label>
                      <Select value={formData.case_type} onValueChange={(v) => handleSelectChange('case_type', v)}>
                        <SelectTrigger className="bg-slate-50">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          {CASE_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Current Case Stage *</Label>
                      <Select value={formData.current_stage} onValueChange={(v) => handleSelectChange('current_stage', v)}>
                        <SelectTrigger className="bg-slate-50">
                          <SelectValue placeholder="Select stage" />
                        </SelectTrigger>
                        <SelectContent>
                          {CASE_STAGES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="case_summary">Case Summary *</Label>
                    <Textarea
                      id="case_summary" name="case_summary"
                      value={formData.case_summary} onChange={handleChange}
                      required rows={4}
                      placeholder="Briefly describe what happened, when, and the impact on you or your family..."
                      className="bg-slate-50 resize-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="opponent_details">Hospital / Doctor Involved *</Label>
                    <Textarea
                      id="opponent_details" name="opponent_details"
                      value={formData.opponent_details} onChange={handleChange}
                      required rows={2}
                      placeholder="Name and address of the hospital or doctor..."
                      className="bg-slate-50 resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Type of Legal Aid Needed */}
              <div>
                <h3 className="font-serif text-lg font-bold text-primary mb-4 pb-2 border-b border-slate-200">
                  Legal Aid Required
                </h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Type of Assistance Needed *</Label>
                    <Select value={formData.purpose_of_funding} onValueChange={(v) => handleSelectChange('purpose_of_funding', v)}>
                      <SelectTrigger className="bg-slate-50">
                        <SelectValue placeholder="Select type of legal aid" />
                      </SelectTrigger>
                      <SelectContent>
                        {AID_TYPES.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="breakdown_of_costs">Describe Your Legal Need *</Label>
                    <Textarea
                      id="breakdown_of_costs" name="breakdown_of_costs"
                      value={formData.breakdown_of_costs} onChange={handleChange}
                      required rows={3}
                      placeholder="Explain what specific legal help you are looking for and what you have tried so far..."
                      className="bg-slate-50 resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Financial Background (for prioritisation only) */}
              <div>
                <h3 className="font-serif text-lg font-bold text-primary mb-4 pb-2 border-b border-slate-200">
                  Financial Background <span className="text-slate-400 font-normal text-sm">(for prioritisation only)</span>
                </h3>
                <div className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="annual_income">Annual Family Income (₹)</Label>
                      <Input
                        id="annual_income" name="annual_income" type="number"
                        value={formData.annual_income} onChange={handleChange}
                        placeholder="e.g., 300000" className="bg-slate-50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="family_members">Number of Dependants</Label>
                      <Input
                        id="family_members" name="family_members" type="number" min="0"
                        value={formData.family_members} onChange={handleChange}
                        placeholder="e.g., 4" className="bg-slate-50"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="other_income_sources">Other Remarks (Optional)</Label>
                    <Input
                      id="other_income_sources" name="other_income_sources"
                      value={formData.other_income_sources} onChange={handleChange}
                      placeholder="Anything else relevant to your financial situation..."
                      className="bg-slate-50"
                    />
                  </div>
                </div>
              </div>

              {/* Supporting Documents */}
              <div>
                <h3 className="font-serif text-lg font-bold text-primary mb-4 pb-2 border-b border-slate-200">
                  Supporting Documents <span className="text-slate-400 font-normal text-sm">(Optional)</span>
                </h3>
                <p className="text-sm text-slate-500 mb-4">
                  Upload medical records, discharge summaries, case documents, etc. (Max 5 files, 5MB each)
                </p>
                <div className="border-2 border-dashed border-slate-300 p-6 text-center hover:border-slate-400 transition-colors">
                  <input
                    type="file" accept=".pdf,.jpg,.jpeg,.png" multiple
                    onChange={handleDocumentUpload} className="hidden" id="doc-upload"
                  />
                  <label htmlFor="doc-upload" className="cursor-pointer">
                    <Upload className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                    <p className="text-sm text-slate-600">Click to upload documents</p>
                    <p className="text-xs text-slate-400 mt-1">PDF, JPG, or PNG</p>
                  </label>
                </div>
                {documents.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {documents.map((doc, index) => (
                      <div key={index} className="flex items-center justify-between bg-slate-50 p-2 border border-slate-200">
                        <span className="text-sm text-slate-600 truncate">{doc.name}</span>
                        <button type="button" onClick={() => removeDocument(index)} className="text-red-500 hover:text-red-700">
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-4 pt-6 border-t border-slate-200">
                <Link to="/dashboard">
                  <Button type="button" variant="outline" className="border-slate-300">Cancel</Button>
                </Link>
                <Button
                  type="submit"
                  disabled={loading || !formData.case_type || !formData.current_stage || !formData.purpose_of_funding}
                  className="bg-primary hover:bg-slate-800 uppercase tracking-widest font-bold"
                >
                  {loading ? (
                    <><span className="spinner mr-2" />Submitting...</>
                  ) : (
                    <><Send className="h-4 w-4 mr-2" />Submit Application</>
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

export default ApplyGrant;
