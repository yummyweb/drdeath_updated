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
import { ArrowLeft, Send, AlertCircle, IndianRupee, Upload, X } from 'lucide-react';
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
  'Other'
];

const CASE_STAGES = [
  'Pre-Filing (Gathering Evidence)',
  'Legal Notice Sent',
  'Consumer Court Filing',
  'Civil Court Filing',
  'Criminal Complaint',
  'Hearing Stage',
  'Appeal Stage'
];

const FUNDING_PURPOSES = [
  'Court Filing Fees',
  'Lawyer Fees',
  'Medical Expert Opinion',
  'Document Procurement',
  'Travel Expenses for Court',
  'Multiple Purposes'
];

const ApplyGrant = () => {
  const { user, getAuthHeader, loading: authLoading } = useAuth();
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
    amount_required: '',
    purpose_of_funding: '',
    breakdown_of_costs: '',
    bank_account_name: '',
    bank_account_number: '',
    bank_ifsc: ''
  });

  useEffect(() => {
    if (!authLoading && !user) {
      toast.error('Please login to apply for a grant');
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
      reader.onload = (e) => {
        setDocuments(prev => [...prev, { file, preview: e.target.result, name: file.name }]);
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
      // Create grant application
      const response = await axios.post(`${API}/grants/apply`, {
        ...formData,
        annual_income: parseFloat(formData.annual_income),
        family_members: parseInt(formData.family_members),
        amount_required: parseFloat(formData.amount_required)
      }, getAuthHeader());

      const grantId = response.data.id;

      // Upload documents if any
      if (documents.length > 0) {
        for (const doc of documents) {
          const formDataUpload = new FormData();
          formDataUpload.append('file', doc.file);
          await axios.post(
            `${API}/grants/${grantId}/documents`,
            formDataUpload,
            {
              ...getAuthHeader(),
              headers: {
                ...getAuthHeader().headers,
                'Content-Type': 'multipart/form-data'
              }
            }
          );
        }
      }

      toast.success('Grant application submitted successfully! We will review and contact you.');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error submitting application:', error);
      toast.error(error.response?.data?.detail || 'Failed to submit application');
    } finally {
      setLoading(false);
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
    <div className="min-h-screen bg-slate-50 py-8" data-testid="apply-grant-page">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
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
              Financial Assistance
            </p>
            <CardTitle className="font-serif text-2xl">Apply for Grant</CardTitle>
            <p className="text-sm text-slate-500 mt-2">
              If you need financial support for your medical negligence case, 
              please fill out this application. All applications are reviewed by our team.
            </p>
          </CardHeader>
          <CardContent className="p-8">
            {/* Notice */}
            <div className="bg-amber-50 border border-amber-200 p-4 mb-8 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-amber-800">
                <p className="font-medium mb-1">Important Information</p>
                <ul className="list-disc ml-4 space-y-1">
                  <li>Grants are provided based on genuine need and merit of the case</li>
                  <li>All information will be verified before approval</li>
                  <li>False information will result in rejection and potential legal action</li>
                  <li>You may be contacted for additional documents or clarification</li>
                </ul>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8" data-testid="grant-form">
              {/* Case Details Section */}
              <div>
                <h3 className="font-serif text-lg font-bold text-primary mb-4 pb-2 border-b border-slate-200">
                  Case Details
                </h3>
                <div className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="case_type">Type of Medical Negligence *</Label>
                      <Select value={formData.case_type} onValueChange={(v) => handleSelectChange('case_type', v)}>
                        <SelectTrigger className="bg-slate-50" data-testid="case-type-select">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          {CASE_TYPES.map(type => (
                            <SelectItem key={type} value={type}>{type}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="current_stage">Current Case Stage *</Label>
                      <Select value={formData.current_stage} onValueChange={(v) => handleSelectChange('current_stage', v)}>
                        <SelectTrigger className="bg-slate-50" data-testid="case-stage-select">
                          <SelectValue placeholder="Select stage" />
                        </SelectTrigger>
                        <SelectContent>
                          {CASE_STAGES.map(stage => (
                            <SelectItem key={stage} value={stage}>{stage}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="case_summary">Case Summary *</Label>
                    <Textarea
                      id="case_summary"
                      name="case_summary"
                      value={formData.case_summary}
                      onChange={handleChange}
                      required
                      rows={4}
                      placeholder="Briefly describe your case, what happened, and the impact..."
                      className="bg-slate-50 resize-none"
                      data-testid="case-summary-input"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="opponent_details">Hospital/Doctor Details *</Label>
                    <Textarea
                      id="opponent_details"
                      name="opponent_details"
                      value={formData.opponent_details}
                      onChange={handleChange}
                      required
                      rows={2}
                      placeholder="Name and address of the hospital/doctor involved..."
                      className="bg-slate-50 resize-none"
                      data-testid="opponent-details-input"
                    />
                  </div>
                </div>
              </div>

              {/* Financial Details Section */}
              <div>
                <h3 className="font-serif text-lg font-bold text-primary mb-4 pb-2 border-b border-slate-200">
                  Financial Details
                </h3>
                <div className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="annual_income">Annual Family Income (₹) *</Label>
                      <div className="relative">
                        <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                          id="annual_income"
                          name="annual_income"
                          type="number"
                          value={formData.annual_income}
                          onChange={handleChange}
                          required
                          placeholder="e.g., 300000"
                          className="bg-slate-50 pl-10"
                          data-testid="annual-income-input"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="family_members">Number of Family Members *</Label>
                      <Input
                        id="family_members"
                        name="family_members"
                        type="number"
                        min="1"
                        value={formData.family_members}
                        onChange={handleChange}
                        required
                        placeholder="e.g., 4"
                        className="bg-slate-50"
                        data-testid="family-members-input"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="other_income_sources">Other Sources of Income (Optional)</Label>
                    <Input
                      id="other_income_sources"
                      name="other_income_sources"
                      value={formData.other_income_sources}
                      onChange={handleChange}
                      placeholder="e.g., Rental income, pension, etc."
                      className="bg-slate-50"
                      data-testid="other-income-input"
                    />
                  </div>
                </div>
              </div>

              {/* Funding Requirements Section */}
              <div>
                <h3 className="font-serif text-lg font-bold text-primary mb-4 pb-2 border-b border-slate-200">
                  Funding Requirements
                </h3>
                <div className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="amount_required">Amount Required (₹) *</Label>
                      <div className="relative">
                        <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                          id="amount_required"
                          name="amount_required"
                          type="number"
                          value={formData.amount_required}
                          onChange={handleChange}
                          required
                          placeholder="e.g., 50000"
                          className="bg-slate-50 pl-10"
                          data-testid="amount-required-input"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="purpose_of_funding">Purpose of Funding *</Label>
                      <Select value={formData.purpose_of_funding} onValueChange={(v) => handleSelectChange('purpose_of_funding', v)}>
                        <SelectTrigger className="bg-slate-50" data-testid="purpose-select">
                          <SelectValue placeholder="Select purpose" />
                        </SelectTrigger>
                        <SelectContent>
                          {FUNDING_PURPOSES.map(purpose => (
                            <SelectItem key={purpose} value={purpose}>{purpose}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="breakdown_of_costs">Breakdown of Costs *</Label>
                    <Textarea
                      id="breakdown_of_costs"
                      name="breakdown_of_costs"
                      value={formData.breakdown_of_costs}
                      onChange={handleChange}
                      required
                      rows={3}
                      placeholder="e.g., Court fees: ₹5000, Lawyer fees: ₹30000, Medical expert: ₹15000..."
                      className="bg-slate-50 resize-none"
                      data-testid="breakdown-input"
                    />
                  </div>
                </div>
              </div>

              {/* Bank Details Section */}
              <div>
                <h3 className="font-serif text-lg font-bold text-primary mb-4 pb-2 border-b border-slate-200">
                  Bank Details (for fund transfer)
                </h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="bank_account_name">Account Holder Name *</Label>
                    <Input
                      id="bank_account_name"
                      name="bank_account_name"
                      value={formData.bank_account_name}
                      onChange={handleChange}
                      required
                      placeholder="Name as per bank account"
                      className="bg-slate-50"
                      data-testid="bank-name-input"
                    />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="bank_account_number">Account Number *</Label>
                      <Input
                        id="bank_account_number"
                        name="bank_account_number"
                        value={formData.bank_account_number}
                        onChange={handleChange}
                        required
                        placeholder="Enter account number"
                        className="bg-slate-50"
                        data-testid="bank-account-input"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bank_ifsc">IFSC Code *</Label>
                      <Input
                        id="bank_ifsc"
                        name="bank_ifsc"
                        value={formData.bank_ifsc}
                        onChange={handleChange}
                        required
                        placeholder="e.g., SBIN0001234"
                        className="bg-slate-50"
                        data-testid="bank-ifsc-input"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Document Upload */}
              <div>
                <h3 className="font-serif text-lg font-bold text-primary mb-4 pb-2 border-b border-slate-200">
                  Supporting Documents (Optional)
                </h3>
                <p className="text-sm text-slate-500 mb-4">
                  Upload income proof, medical records, case documents, etc. (Max 5 files, 5MB each)
                </p>
                <div className="border-2 border-dashed border-slate-300 p-6 text-center hover:border-slate-400 transition-colors">
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    multiple
                    onChange={handleDocumentUpload}
                    className="hidden"
                    id="doc-upload"
                    data-testid="doc-upload-input"
                  />
                  <label htmlFor="doc-upload" className="cursor-pointer">
                    <Upload className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                    <p className="text-sm text-slate-600">Click to upload documents</p>
                    <p className="text-xs text-slate-400 mt-1">PDF, JPG, or PNG</p>
                  </label>
                </div>

                {documents.length > 0 && (
                  <div className="mt-4 space-y-2" data-testid="uploaded-docs">
                    {documents.map((doc, index) => (
                      <div key={index} className="flex items-center justify-between bg-slate-50 p-2 border border-slate-200">
                        <span className="text-sm text-slate-600 truncate">{doc.name}</span>
                        <button
                          type="button"
                          onClick={() => removeDocument(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
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
                  disabled={loading || !formData.case_type || !formData.current_stage || !formData.purpose_of_funding}
                  className="bg-primary hover:bg-slate-800 uppercase tracking-widest font-bold"
                  data-testid="submit-grant-btn"
                >
                  {loading ? (
                    <>
                      <span className="spinner mr-2"></span>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Submit Application
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

export default ApplyGrant;
