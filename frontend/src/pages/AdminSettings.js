import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { getImageUrl } from '../utils/imageUrl';
import { 
  Settings, 
  Save, 
  Upload, 
  Globe, 
  Mail, 
  CreditCard,
  FileText,
  BookOpen,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  Briefcase,
  Plus,
  Trash2,
  Edit,
  X,
  UserCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import { getApiUrl } from '@/config/env';

const API = getApiUrl();

const AdminSettings = () => {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const { settings: currentSettings, refreshSettings } = useSettings();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    site_name: '',
    tagline: '',
    contact_email: '',
    contact_phone: '',
    address: '',
    upi_id: '',
    upi_payee_name: '',
    bank_account_name: '',
    bank_account_number: '',
    bank_ifsc: '',
    bank_name: '',
    bank_branch: '',
    bank_swift: '',
    bank_beneficiary_address: '',
    hero_title: '',
    hero_subtitle: '',
    about_mission: '',
    about_vision: '',
    facebook_url: '',
    twitter_url: '',
    instagram_url: '',
    stats_years_of_service: 1,
    stats_cases_resolved: 0,
    professional_name: '',
    professional_title: '',
    professional_bio: '',
    resources_hero_title: '',
    resources_hero_description: '',
    resources_content: ''
  });
  
  const [credentials, setCredentials] = useState({
    current_password: '',
    new_email: '',
    new_password: '',
    confirm_password: ''
  });
  const [showPasswords, setShowPasswords] = useState(false);
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [professionalImageFile, setProfessionalImageFile] = useState(null);
  const [professionalImagePreview, setProfessionalImagePreview] = useState(null);
  
  // Cases management state
  const [cases, setCases] = useState([]);
  const [casesLoading, setCasesLoading] = useState(false);
  const [caseDialog, setCaseDialog] = useState({ open: false, case: null });
  const [caseForm, setCaseForm] = useState({
    title: '',
    description: '',
    youtube_url: '',
    order: 0
  });
  const [caseImageFile, setCaseImageFile] = useState(null);
  const [caseImagePreview, setCaseImagePreview] = useState(null);
  
  // Team members management state
  const [teamMembers, setTeamMembers] = useState([]);
  const [teamMembersLoading, setTeamMembersLoading] = useState(false);
  const [confirmCaseDelete, setConfirmCaseDelete] = useState(null);
  const [confirmMemberDelete, setConfirmMemberDelete] = useState(null);
  const [teamMemberDialog, setTeamMemberDialog] = useState({ open: false, member: null });
  const [teamMemberForm, setTeamMemberForm] = useState({
    name: '',
    title: '',
    bio: '',
    email: '',
    linkedin_url: '',
    order: 0
  });
  const [teamMemberImageFile, setTeamMemberImageFile] = useState(null);
  const [teamMemberImagePreview, setTeamMemberImagePreview] = useState(null);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        navigate('/login');
        return;
      }
      if (!isAdmin) {
        toast.error('Admin access required');
        navigate('/dashboard');
        return;
      }
    }
  }, [user, isAdmin, authLoading, navigate]);

  useEffect(() => {
    if (currentSettings) {
      setSettings({
        site_name: currentSettings.site_name || '',
        tagline: currentSettings.tagline || '',
        contact_email: currentSettings.contact_email || '',
        contact_phone: currentSettings.contact_phone || '',
        address: currentSettings.address || '',
        upi_id: currentSettings.upi_id || '',
        upi_payee_name: currentSettings.upi_payee_name || '',
        bank_account_name: currentSettings.bank_account_name || '',
        bank_account_number: currentSettings.bank_account_number || '',
        bank_ifsc: currentSettings.bank_ifsc || '',
        bank_name: currentSettings.bank_name || '',
        bank_branch: currentSettings.bank_branch || '',
        bank_swift: currentSettings.bank_swift || '',
        bank_beneficiary_address: currentSettings.bank_beneficiary_address || '',
        hero_title: currentSettings.hero_title || '',
        hero_subtitle: currentSettings.hero_subtitle || '',
        about_mission: currentSettings.about_mission || '',
        about_vision: currentSettings.about_vision || '',
        facebook_url: currentSettings.facebook_url || '',
        twitter_url: currentSettings.twitter_url || '',
        instagram_url: currentSettings.instagram_url || '',
        stats_years_of_service: currentSettings.stats_years_of_service || 1,
        stats_cases_resolved: currentSettings.stats_cases_resolved || 0,
        professional_name: currentSettings.professional_name || '',
        professional_title: currentSettings.professional_title || '',
        professional_bio: currentSettings.professional_bio || '',
        resources_hero_title: currentSettings.resources_hero_title || '',
        resources_hero_description: currentSettings.resources_hero_description || '',
        resources_content: currentSettings.resources_content || ''
      });
      setLogoPreview(currentSettings.logo_url);
      setProfessionalImagePreview(currentSettings.professional_image_url);
    }
  }, [currentSettings]);

  // Fetch cases
  useEffect(() => {
    if (user && isAdmin) {
      fetchCases();
      fetchTeamMembers();
    }
  }, [user, isAdmin]);

  const fetchCases = async () => {
    try {
      const response = await axios.get(`${API}/cases`);
      setCases(response.data);
    } catch (error) {
      console.error('Error fetching cases:', error);
      toast.error('Failed to fetch cases');
    }
  };

  const fetchTeamMembers = async () => {
    try {
      const response = await axios.get(`${API}/team-members`);
      setTeamMembers(response.data);
    } catch (error) {
      console.error('Error fetching team members:', error);
      toast.error('Failed to fetch team members');
    }
  };

  const handleSettingsChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleCredentialsChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({ ...prev, [name]: value }));
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Logo must be less than 2MB');
        return;
      }
      setLogoFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setLogoPreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleProfessionalImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image must be less than 5MB');
        return;
      }
      setProfessionalImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setProfessionalImagePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSaveSettings = async () => {
    setLoading(true);
    try {
      // Upload logo first if changed
      if (logoFile) {
        const formData = new FormData();
        formData.append('file', logoFile);
        await axios.post(`${API}/admin/settings/logo`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      // Upload professional image if changed
      if (professionalImageFile) {
        const formData = new FormData();
        formData.append('file', professionalImageFile);
        await axios.post(`${API}/admin/settings/professional-image`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      // Save other settings
      // Exclude logo/image base64 blobs — those are uploaded via their own endpoints
      const { logo_url, professional_image_url, ...settingsToSave } = settings;

      await axios.put(
      
        `${API}/admin/settings`,
      
        {
      
          ...settingsToSave,
      
          stats_years_of_service:
      
            parseInt(settings.stats_years_of_service) || 0,
      
          stats_cases_resolved:
      
            parseInt(settings.stats_cases_resolved) || 0
      
        },
      
      );

      await refreshSettings();
      toast.success('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error(error.response?.data?.detail || 'Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCredentials = async () => {
    if (!credentials.current_password) {
      toast.error('Please enter current password');
      return;
    }

    if (credentials.new_password && credentials.new_password !== credentials.confirm_password) {
      toast.error('New passwords do not match');
      return;
    }

    if (credentials.new_password && credentials.new_password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await axios.put(`${API}/admin/credentials`, {
        current_password: credentials.current_password,
        new_email: credentials.new_email || null,
        new_password: credentials.new_password || null
      });

      toast.success('Credentials updated! Please login again.');
      setCredentials({ current_password: '', new_email: '', new_password: '', confirm_password: '' });
    } catch (error) {
      console.error('Error updating credentials:', error);
      toast.error(error.response?.data?.detail || 'Failed to update credentials');
    } finally {
      setLoading(false);
    }
  };

  // Cases management functions
  const handleCaseImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image must be less than 5MB');
        return;
      }
      setCaseImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setCaseImagePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const openCaseDialog = (caseItem = null) => {
    if (caseItem) {
      setCaseForm({
        title: caseItem.title || '',
        description: caseItem.description || '',
        youtube_url: caseItem.youtube_url || '',
        order: caseItem.order || 0
      });
      setCaseImagePreview(caseItem.image_url || null);
      setCaseImageFile(null);
    } else {
      setCaseForm({ title: '', description: '', youtube_url: '', order: 0 });
      setCaseImagePreview(null);
      setCaseImageFile(null);
    }
    setCaseDialog({ open: true, case: caseItem });
  };

  const handleSaveCase = async () => {
    if (!caseForm.title || !caseForm.description) {
      toast.error('Please fill in title and description');
      return;
    }

    setCasesLoading(true);
    try {
      let caseId;
      if (caseDialog.case) {
        // Update existing case
        await axios.put(`${API}/cases/${caseDialog.case.id}`, {
          title: caseForm.title,
          description: caseForm.description,
          youtube_url: caseForm.youtube_url,
          order: parseInt(caseForm.order) || 0
        });
        caseId = caseDialog.case.id;
        toast.success('Case updated successfully');
      } else {
        // Create new case
        const response = await axios.post(`${API}/cases`, {
          title: caseForm.title,
          description: caseForm.description,
          youtube_url: caseForm.youtube_url,
          order: parseInt(caseForm.order) || 0
        });
        caseId = response.data.id;
        toast.success('Case created successfully');
      }

      // Upload image if provided
      if (caseImageFile) {
        const formData = new FormData();
        formData.append('file', caseImageFile);
        await axios.post(`${API}/cases/${caseId}/image`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      setCaseDialog({ open: false, case: null });
      fetchCases();
    } catch (error) {
      console.error('Error saving case:', error);
      toast.error(error.response?.data?.detail || 'Failed to save case');
    } finally {
      setCasesLoading(false);
    }
  };

  const handleDeleteCase = (caseId) => setConfirmCaseDelete(caseId);

  const confirmDeleteCase = async () => {
    const caseId = confirmCaseDelete;
    setConfirmCaseDelete(null);
    try {
      await axios.delete(`${API}/cases/${caseId}`);
      toast.success('Case deleted successfully');
      fetchCases();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to delete case');
    }
  };

  // Team members management functions
  const handleTeamMemberImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image must be less than 5MB');
        return;
      }
      setTeamMemberImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setTeamMemberImagePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const openTeamMemberDialog = (member = null) => {
    if (member) {
      setTeamMemberForm({
        name: member.name || '',
        title: member.title || '',
        bio: member.bio || '',
        email: member.email || '',
        linkedin_url: member.linkedin_url || '',
        order: member.order || 0
      });
      setTeamMemberImagePreview(member.image_url || null);
      setTeamMemberImageFile(null);
    } else {
      setTeamMemberForm({ name: '', title: '', bio: '', email: '', linkedin_url: '', order: 0 });
      setTeamMemberImagePreview(null);
      setTeamMemberImageFile(null);
    }
    setTeamMemberDialog({ open: true, member });
  };

  const handleSaveTeamMember = async () => {
    if (!teamMemberForm.name || !teamMemberForm.title) {
      toast.error('Please fill in name and title');
      return;
    }

    setTeamMembersLoading(true);
    try {
      let memberId;
      if (teamMemberDialog.member) {
        // Update existing member
        await axios.put(`${API}/team-members/${teamMemberDialog.member.id}`, {
          name: teamMemberForm.name,
          title: teamMemberForm.title,
          bio: teamMemberForm.bio,
          email: teamMemberForm.email,
          linkedin_url: teamMemberForm.linkedin_url,
          order: parseInt(teamMemberForm.order) || 0
        });
        memberId = teamMemberDialog.member.id;
        toast.success('Team member updated successfully');
      } else {
        // Create new member
        const response = await axios.post(`${API}/team-members`, {
          name: teamMemberForm.name,
          title: teamMemberForm.title,
          bio: teamMemberForm.bio,
          email: teamMemberForm.email,
          linkedin_url: teamMemberForm.linkedin_url,
          order: parseInt(teamMemberForm.order) || 0
        });
        memberId = response.data.id;
        toast.success('Team member created successfully');
      }

      // Upload image if provided
      if (teamMemberImageFile) {
        const formData = new FormData();
        formData.append('file', teamMemberImageFile);
        await axios.post(`${API}/team-members/${memberId}/image`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      setTeamMemberDialog({ open: false, member: null });
      fetchTeamMembers();
    } catch (error) {
      console.error('Error saving team member:', error);
      toast.error(error.response?.data?.detail || 'Failed to save team member');
    } finally {
      setTeamMembersLoading(false);
    }
  };

  const handleDeleteTeamMember = (memberId) => setConfirmMemberDelete(memberId);

  const confirmDeleteMember = async () => {
    const memberId = confirmMemberDelete;
    setConfirmMemberDelete(null);
    try {
      await axios.delete(`${API}/team-members/${memberId}`);
      toast.success('Team member deleted successfully');
      fetchTeamMembers();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to delete team member');
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-slate-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null; // Will redirect via useEffect
  }

  const ConfirmDialog = ({ message, onConfirm, onCancel }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full mx-4">
        <p className="text-sm text-slate-700 mb-5">{message}</p>
        <div className="flex gap-3 justify-end">
          <button onClick={onCancel} className="px-4 py-2 text-sm border border-slate-300 rounded-md text-slate-600 hover:bg-slate-50">Cancel</button>
          <button onClick={onConfirm} className="px-4 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700">Delete</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 py-8" data-testid="admin-settings-page">

      {confirmCaseDelete && (
        <ConfirmDialog
          message="Delete this case? This cannot be undone."
          onConfirm={confirmDeleteCase}
          onCancel={() => setConfirmCaseDelete(null)}
        />
      )}
      {confirmMemberDelete && (
        <ConfirmDialog
          message="Delete this team member? This cannot be undone."
          onConfirm={confirmDeleteMember}
          onCancel={() => setConfirmMemberDelete(null)}
        />
      )}

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          to="/admin"
          className="inline-flex items-center text-slate-600 hover:text-primary mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Admin Panel
        </Link>

        <div className="flex items-center gap-3 mb-8">
          <Settings className="h-8 w-8 text-primary" />
          <div>
            <h1 className="font-serif text-2xl font-bold text-primary">Site Settings</h1>
            <p className="text-sm text-slate-500">Configure your website content and credentials</p>
          </div>
        </div>

        <Tabs defaultValue="general">
          <TabsList className="mb-6 w-full flex-wrap">
            <TabsTrigger value="general" data-testid="tab-general" className="text-white data-[state=active]:text-slate-700">
              <Globe className="h-4 w-4 mr-2" />
              General
            </TabsTrigger>
            <TabsTrigger value="content" data-testid="tab-content" className="text-white data-[state=active]:text-slate-700">
              <FileText className="h-4 w-4 mr-2" />
              Content
            </TabsTrigger>
            <TabsTrigger value="resources" data-testid="tab-resources" className="text-white data-[state=active]:text-slate-700">
              <BookOpen className="h-4 w-4 mr-2" />
              Resources
            </TabsTrigger>
            <TabsTrigger value="cases" data-testid="tab-cases" className="text-white data-[state=active]:text-slate-700">
              <Briefcase className="h-4 w-4 mr-2" />
              Cases
            </TabsTrigger>
            <TabsTrigger value="team" data-testid="tab-team" className="text-white data-[state=active]:text-slate-700">
              <UserCircle className="h-4 w-4 mr-2" />
              Team Members
            </TabsTrigger>
            <TabsTrigger value="credentials" data-testid="tab-credentials" className="text-white data-[state=active]:text-slate-700">
              <Lock className="h-4 w-4 mr-2" />
              Admin Login
            </TabsTrigger>
          </TabsList>

          {/* General Settings */}
          <TabsContent value="general">
            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle className="font-serif text-lg">General Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Logo Upload */}
                <div className="space-y-2">
                  <Label>Site Logo</Label>
                  <div className="flex items-center gap-4">
                    {logoPreview ? (
                      <img src={logoPreview.startsWith('data:') ? logoPreview : getImageUrl(logoPreview)} alt="Logo" className="h-16 w-16 object-contain border border-slate-200" onError={(e) => { console.error('Logo preview failed to load'); e.target.style.display = 'none'; }} />
                    ) : (
                      <div className="h-16 w-16 bg-slate-100 flex items-center justify-center border border-slate-200">
                        <Upload className="h-6 w-6 text-slate-400" />
                      </div>
                    )}
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoChange}
                        className="hidden"
                        id="logo-upload"
                        data-testid="logo-upload-input"
                      />
                      <label htmlFor="logo-upload">
                        <Button type="button" variant="outline" size="sm" asChild>
                          <span className="cursor-pointer">
                            <Upload className="h-4 w-4 mr-2" />
                            Upload Logo
                          </span>
                        </Button>
                      </label>
                      <p className="text-xs text-slate-400 mt-1">Max 2MB, PNG or JPG</p>
                    </div>
                  </div>
                </div>

                {/* Professional Image Section */}
                <div className="space-y-4 pt-6 border-t border-slate-200">
                  <Label className="text-lg font-semibold">Professional Image</Label>
                  <p className="text-sm text-slate-500">Upload your professional photo to display on the About page</p>
                  <div className="space-y-2">
                    <Label>Professional Photo</Label>
                    <div className="flex items-start gap-4">
                      {professionalImagePreview ? (
                        <div className="relative">
                          <img src={professionalImagePreview} alt="Professional" className="h-32 w-32 object-cover border border-slate-200 rounded-lg" />
                        </div>
                      ) : (
                        <div className="h-32 w-32 bg-slate-100 flex items-center justify-center border border-slate-200 rounded-lg">
                          <Upload className="h-8 w-8 text-slate-400" />
                        </div>
                      )}
                      <div className="flex-1">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleProfessionalImageChange}
                          className="hidden"
                          id="professional-image-upload"
                        />
                        <label htmlFor="professional-image-upload">
                          <Button type="button" variant="outline" size="sm" asChild>
                            <span className="cursor-pointer">
                              <Upload className="h-4 w-4 mr-2" />
                              Upload Photo
                            </span>
                          </Button>
                        </label>
                        <p className="text-xs text-slate-400 mt-1">Max 5MB, PNG or JPG. Portrait or square images work best. This photo will appear on the About page and as the site favicon.</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="professional_name">Professional Name</Label>
                      <Input
                        id="professional_name"
                        name="professional_name"
                        value={settings.professional_name || ''}
                        onChange={handleSettingsChange}
                        placeholder="Your full name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="professional_title">Professional Title</Label>
                      <Input
                        id="professional_title"
                        name="professional_title"
                        value={settings.professional_title || ''}
                        onChange={handleSettingsChange}
                        placeholder="e.g., Senior Legal Advisor"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="professional_bio">Professional Bio</Label>
                    <Textarea
                      id="professional_bio"
                      name="professional_bio"
                      value={settings.professional_bio || ''}
                      onChange={handleSettingsChange}
                      placeholder="Brief professional biography..."
                      rows={4}
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="site_name">Site Name *</Label>
                    <Input
                      id="site_name"
                      name="site_name"
                      value={settings.site_name}
                      onChange={handleSettingsChange}
                      placeholder="Your Organization Name"
                      data-testid="site-name-input"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tagline">Tagline</Label>
                    <Input
                      id="tagline"
                      name="tagline"
                      value={settings.tagline}
                      onChange={handleSettingsChange}
                      placeholder="VOICE-Voice of the Unheard"
                      data-testid="tagline-input"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contact_email">Contact Email *</Label>
                    <Input
                      id="contact_email"
                      name="contact_email"
                      type="email"
                      value={settings.contact_email}
                      onChange={handleSettingsChange}
                      placeholder="contact@yoursite.com"
                      data-testid="contact-email-input"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contact_phone">Contact Phone</Label>
                    <Input
                      id="contact_phone"
                      name="contact_phone"
                      value={settings.contact_phone}
                      onChange={handleSettingsChange}
                      placeholder="+91 XXXXX XXXXX"
                      data-testid="contact-phone-input"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    name="address"
                    value={settings.address}
                    onChange={handleSettingsChange}
                    placeholder="Your organization address"
                    rows={2}
                    data-testid="address-input"
                  />
                </div>

                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="facebook_url">Facebook URL</Label>
                    <Input
                      id="facebook_url"
                      name="facebook_url"
                      value={settings.facebook_url}
                      onChange={handleSettingsChange}
                      placeholder="https://facebook.com/..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="twitter_url">Twitter URL</Label>
                    <Input
                      id="twitter_url"
                      name="twitter_url"
                      value={settings.twitter_url}
                      onChange={handleSettingsChange}
                      placeholder="https://twitter.com/..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="instagram_url">Instagram URL</Label>
                    <Input
                      id="instagram_url"
                      name="instagram_url"
                      value={settings.instagram_url}
                      onChange={handleSettingsChange}
                      placeholder="https://instagram.com/..."
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="stats_years_of_service">Years of Service</Label>
                    <Input
                      id="stats_years_of_service"
                      name="stats_years_of_service"
                      type="number"
                      min="0"
                      value={settings.stats_years_of_service}
                      onChange={handleSettingsChange}
                      data-testid="years-input"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="stats_cases_resolved">Cases Resolved</Label>
                    <Input
                      id="stats_cases_resolved"
                      name="stats_cases_resolved"
                      type="number"
                      min="0"
                      value={settings.stats_cases_resolved}
                      onChange={handleSettingsChange}
                      data-testid="cases-input"
                    />
                  </div>
                </div>

                {/* UPI / QR Code */}
                <div className="pt-6 border-t border-slate-200">
                  <Label className="text-lg font-semibold mb-1 block">UPI / QR Code</Label>
                  <p className="text-sm text-slate-500 mb-4">
                    Used to generate the QR code on the Donate page.
                  </p>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="upi_id">UPI ID</Label>
                      <Input
                        id="upi_id"
                        name="upi_id"
                        value={settings.upi_id}
                        onChange={handleSettingsChange}
                        placeholder="yourname@paytm"
                        data-testid="upi-id-input"
                      />
                      <p className="text-xs text-slate-400">e.g., yourname@paytm, yourname@ybl, yourname@phonepe</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="upi_payee_name">Payee Name</Label>
                      <Input
                        id="upi_payee_name"
                        name="upi_payee_name"
                        value={settings.upi_payee_name}
                        onChange={handleSettingsChange}
                        placeholder="VOICE Foundation"
                        data-testid="upi-payee-input"
                      />
                      <p className="text-xs text-slate-400">Name shown on payment screen</p>
                    </div>
                  </div>
                </div>

                {/* Domestic Bank Transfer */}
                <div className="pt-6 border-t border-slate-200">
                  <Label className="text-lg font-semibold mb-1 block">Domestic Bank Transfer (NEFT / RTGS / IMPS)</Label>
                  <p className="text-sm text-slate-500 mb-4">
                    Shown in the Bank Transfer Details section on the Donate page for Indian donors.
                  </p>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="bank_account_name">Account Name</Label>
                      <Input id="bank_account_name" name="bank_account_name"
                        value={settings.bank_account_name} onChange={handleSettingsChange}
                        placeholder="Enter account holder name" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bank_account_number">Account Number</Label>
                      <Input id="bank_account_number" name="bank_account_number"
                        value={settings.bank_account_number} onChange={handleSettingsChange}
                        placeholder="Enter account number" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bank_name">Bank Name</Label>
                      <Input id="bank_name" name="bank_name"
                        value={settings.bank_name} onChange={handleSettingsChange}
                        placeholder="Enter bank name" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bank_ifsc">IFSC Code</Label>
                      <Input id="bank_ifsc" name="bank_ifsc"
                        value={settings.bank_ifsc} onChange={handleSettingsChange}
                        placeholder="Enter IFSC code" />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="bank_branch">Branch</Label>
                      <Input id="bank_branch" name="bank_branch"
                        value={settings.bank_branch} onChange={handleSettingsChange}
                        placeholder="Enter branch name and city" />
                    </div>
                  </div>
                </div>

                {/* International Bank Transfer */}
                <div className="pt-6 border-t border-slate-200">
                  <Label className="text-lg font-semibold mb-1 block">International Wire Transfer (SWIFT / IBAN)</Label>
                  <p className="text-sm text-slate-500 mb-4">
                    Shown to international donors for inward foreign remittances. Leave blank to hide this section.
                  </p>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="bank_swift">SWIFT / BIC Code</Label>
                      <Input id="bank_swift" name="bank_swift"
                        value={settings.bank_swift} onChange={handleSettingsChange}
                        placeholder="Enter SWIFT/BIC code" />
                      <p className="text-xs text-slate-400">8 or 11-character SWIFT code</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bank_beneficiary_address">Beneficiary Address</Label>
                      <Input id="bank_beneficiary_address" name="bank_beneficiary_address"
                        value={settings.bank_beneficiary_address} onChange={handleSettingsChange}
                        placeholder="Enter full beneficiary address" />
                      <p className="text-xs text-slate-400">Full address required by international banks</p>
                    </div>
                  </div>
                </div>

                <Button onClick={handleSaveSettings} disabled={loading} className="bg-primary" data-testid="save-general-btn">
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? 'Saving...' : 'Save Settings'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Content Settings */}
          <TabsContent value="content">
            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle className="font-serif text-lg">Page Content</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="hero_title">Hero Title</Label>
                  <Input
                    id="hero_title"
                    name="hero_title"
                    value={settings.hero_title}
                    onChange={handleSettingsChange}
                    placeholder="Your main headline"
                    data-testid="hero-title-input"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hero_subtitle">Hero Subtitle</Label>
                  <Textarea
                    id="hero_subtitle"
                    name="hero_subtitle"
                    value={settings.hero_subtitle}
                    onChange={handleSettingsChange}
                    placeholder="Description text under the headline"
                    rows={2}
                    data-testid="hero-subtitle-input"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="about_mission">Mission Statement</Label>
                  <Textarea
                    id="about_mission"
                    name="about_mission"
                    value={settings.about_mission}
                    onChange={handleSettingsChange}
                    placeholder="Your organization's mission"
                    rows={3}
                    data-testid="mission-input"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="about_vision">Vision Statement</Label>
                  <Textarea
                    id="about_vision"
                    name="about_vision"
                    value={settings.about_vision}
                    onChange={handleSettingsChange}
                    placeholder="Your organization's vision"
                    rows={3}
                    data-testid="vision-input"
                  />
                </div>

                <Button onClick={handleSaveSettings} disabled={loading} className="bg-primary" data-testid="save-content-btn">
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? 'Saving...' : 'Save Content'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Resources Settings */}
          <TabsContent value="resources">
            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle className="font-serif text-lg">Resources Page Content</CardTitle>
                <p className="text-sm text-slate-500 mt-2">Customize the content displayed on the Resources page</p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="resources_hero_title">Resources Page Hero Title</Label>
                  <Input
                    id="resources_hero_title"
                    name="resources_hero_title"
                    value={settings.resources_hero_title}
                    onChange={handleSettingsChange}
                    placeholder="Know Your Rights"
                    data-testid="resources-hero-title-input"
                  />
                  <p className="text-xs text-slate-400">Leave empty to use default: "Know Your Rights"</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="resources_hero_description">Resources Page Hero Description</Label>
                  <Textarea
                    id="resources_hero_description"
                    name="resources_hero_description"
                    value={settings.resources_hero_description}
                    onChange={handleSettingsChange}
                    placeholder="Understanding the legal framework for medical negligence in India empowers you to seek justice and hold healthcare providers accountable."
                    rows={3}
                    data-testid="resources-hero-description-input"
                  />
                  <p className="text-xs text-slate-400">Leave empty to use default description</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="resources_content">Additional Resources Content (HTML)</Label>
                  <Textarea
                    id="resources_content"
                    name="resources_content"
                    value={settings.resources_content}
                    onChange={handleSettingsChange}
                    placeholder="Add custom HTML content that will appear in the Resources page. This can include additional information, links, or formatted text."
                    rows={8}
                    data-testid="resources-content-input"
                  />
                  <p className="text-xs text-slate-400">Optional: Add custom HTML content. This will appear in a dedicated section on the Resources page.</p>
                </div>

                <div className="bg-blue-50 border border-blue-200 p-4 text-sm text-blue-800">
                  <p className="font-semibold mb-1">💡 Tip:</p>
                  <p>The Resources page includes default content about legal frameworks, steps to take, and helplines. Use the fields above to customize the hero section and add additional personalized content.</p>
                </div>

                <Button onClick={handleSaveSettings} disabled={loading} className="bg-primary" data-testid="save-resources-btn">
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? 'Saving...' : 'Save Resources Content'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Cases Management */}
          <TabsContent value="cases">
            <Card className="border-slate-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="font-serif text-lg">Our Cases</CardTitle>
                    <p className="text-sm text-slate-500 mt-2">Manage cases displayed in the Resources page</p>
                  </div>
                  <Button onClick={() => openCaseDialog(null)} className="bg-primary">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Case
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {cases.length === 0 ? (
                  <div className="text-center py-12 text-slate-500">
                    <Briefcase className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                    <p>No cases yet. Add your first case to get started.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cases.map((caseItem) => (
                      <div key={caseItem.id} className="border border-slate-200 rounded-lg p-4">
                        <div className="flex items-start gap-4">
                          {(caseItem.image_url || caseItem.youtube_thumbnail) && (
                            <img
                              src={getImageUrl(caseItem.image_url || caseItem.youtube_thumbnail)}
                              alt={caseItem.title}
                              className="w-24 h-24 object-cover rounded border border-slate-200"
                            />
                          )}
                          <div className="flex-1">
                            <h3 className="font-semibold text-primary mb-1">{caseItem.title}</h3>
                            <p className="text-sm text-slate-600 line-clamp-2 mb-2">{caseItem.description}</p>
                            {caseItem.youtube_url && (
                              <p className="text-xs text-slate-400 mb-2">YouTube: {caseItem.youtube_url}</p>
                            )}
                            <p className="text-xs text-slate-400">Order: {caseItem.order}</p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openCaseDialog(caseItem)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteCase(caseItem.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Team Members Management */}
          <TabsContent value="team">
            <Card className="border-slate-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="font-serif text-lg">Core Team Members</CardTitle>
                    <p className="text-sm text-slate-500 mt-2">Manage team member profiles displayed in the About Us section</p>
                  </div>
                  <Button onClick={() => openTeamMemberDialog(null)} className="bg-primary">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Team Member
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {teamMembers.length === 0 ? (
                  <div className="text-center py-12 text-slate-500">
                    <UserCircle className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                    <p>No team members yet. Add your first team member to get started.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {teamMembers.map((member) => (
                      <div key={member.id} className="border border-slate-200 rounded-lg p-4">
                        <div className="flex items-start gap-4">
                          {member.image_url && (
                            <img
                              src={getImageUrl(member.image_url)}
                              alt={member.name}
                              className="w-24 h-24 object-cover rounded border border-slate-200"
                            />
                          )}
                          <div className="flex-1">
                            <h3 className="font-semibold text-primary mb-1">{member.name}</h3>
                            <p className="text-sm text-secondary mb-1">{member.title}</p>
                            {member.bio && (
                              <p className="text-sm text-slate-600 line-clamp-2 mb-2">{member.bio}</p>
                            )}
                            {member.email && (
                              <p className="text-xs text-slate-400 mb-1">Email: {member.email}</p>
                            )}
                            {member.linkedin_url && (
                              <p className="text-xs text-slate-400 mb-1">LinkedIn: {member.linkedin_url}</p>
                            )}
                            <p className="text-xs text-slate-400">Order: {member.order}</p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openTeamMemberDialog(member)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteTeamMember(member.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Credentials Settings */}
          <TabsContent value="credentials">
            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle className="font-serif text-lg">Admin Login Credentials</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-red-50 border border-red-200 p-4 text-sm text-red-800">
                  <p className="font-medium mb-1">Security Warning</p>
                  <p>Changing credentials will require you to login again with the new details.</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="current_password">Current Password *</Label>
                  <div className="relative">
                    <Input
                      id="current_password"
                      name="current_password"
                      type={showPasswords ? 'text' : 'password'}
                      value={credentials.current_password}
                      onChange={handleCredentialsChange}
                      placeholder="Enter current password"
                      data-testid="current-password-input"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords(!showPasswords)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                    >
                      {showPasswords ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new_email">New Admin Email (optional)</Label>
                  <Input
                    id="new_email"
                    name="new_email"
                    type="email"
                    value={credentials.new_email}
                    onChange={handleCredentialsChange}
                    placeholder="new-admin@email.com"
                    data-testid="new-email-input"
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="new_password">New Password (optional)</Label>
                    <Input
                      id="new_password"
                      name="new_password"
                      type={showPasswords ? 'text' : 'password'}
                      value={credentials.new_password}
                      onChange={handleCredentialsChange}
                      placeholder="Min 6 characters"
                      data-testid="new-password-input"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm_password">Confirm New Password</Label>
                    <Input
                      id="confirm_password"
                      name="confirm_password"
                      type={showPasswords ? 'text' : 'password'}
                      value={credentials.confirm_password}
                      onChange={handleCredentialsChange}
                      placeholder="Confirm password"
                      data-testid="confirm-password-input"
                    />
                  </div>
                </div>

                <Button onClick={handleUpdateCredentials} disabled={loading} className="bg-red-600 hover:bg-red-700" data-testid="update-credentials-btn">
                  <Lock className="h-4 w-4 mr-2" />
                  {loading ? 'Updating...' : 'Update Credentials'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Case Dialog */}
        <Dialog open={caseDialog.open} onOpenChange={(open) => !open && setCaseDialog({ open: false, case: null })}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{caseDialog.case ? 'Edit Case' : 'Add New Case'}</DialogTitle>
              <DialogDescription>
                Add a case to display in the "Our Cases" section on the Resources page
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="case_title">Title *</Label>
                <Input
                  id="case_title"
                  value={caseForm.title}
                  onChange={(e) => setCaseForm({ ...caseForm, title: e.target.value })}
                  placeholder="Case title"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="case_description">Description *</Label>
                <Textarea
                  id="case_description"
                  value={caseForm.description}
                  onChange={(e) => setCaseForm({ ...caseForm, description: e.target.value })}
                  placeholder="Case description"
                  rows={4}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="case_youtube_url">YouTube URL</Label>
                <Input
                  id="case_youtube_url"
                  value={caseForm.youtube_url}
                  onChange={(e) => setCaseForm({ ...caseForm, youtube_url: e.target.value })}
                  placeholder="https://www.youtube.com/watch?v=..."
                />
                <p className="text-xs text-slate-400">YouTube thumbnail will be automatically generated</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="case_image">Case Image</Label>
                <div className="flex items-center gap-4">
                  {caseImagePreview ? (
                    <img src={caseImagePreview} alt="Preview" className="h-32 w-32 object-cover border border-slate-200 rounded" />
                  ) : (
                    <div className="h-32 w-32 bg-slate-100 flex items-center justify-center border border-slate-200 rounded">
                      <Upload className="h-8 w-8 text-slate-400" />
                    </div>
                  )}
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleCaseImageChange}
                      className="hidden"
                      id="case-image-upload"
                    />
                    <label htmlFor="case-image-upload">
                      <Button type="button" variant="outline" size="sm" asChild>
                        <span className="cursor-pointer">
                          <Upload className="h-4 w-4 mr-2" />
                          Upload Image
                        </span>
                      </Button>
                    </label>
                    <p className="text-xs text-slate-400 mt-1">Max 5MB, PNG or JPG</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="case_order">Display Order</Label>
                <Input
                  id="case_order"
                  type="number"
                  value={caseForm.order}
                  onChange={(e) => setCaseForm({ ...caseForm, order: e.target.value })}
                  placeholder="0"
                />
                <p className="text-xs text-slate-400">Lower numbers appear first</p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCaseDialog({ open: false, case: null })}>
                Cancel
              </Button>
              <Button onClick={handleSaveCase} disabled={casesLoading} className="bg-primary">
                {casesLoading ? 'Saving...' : 'Save Case'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Team Member Dialog */}
        <Dialog open={teamMemberDialog.open} onOpenChange={(open) => !open && setTeamMemberDialog({ open: false, member: null })}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{teamMemberDialog.member ? 'Edit Team Member' : 'Add New Team Member'}</DialogTitle>
              <DialogDescription>
                Add a team member profile to display in the About Us section carousel
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="member_name">Name *</Label>
                <Input
                  id="member_name"
                  value={teamMemberForm.name}
                  onChange={(e) => setTeamMemberForm({ ...teamMemberForm, name: e.target.value })}
                  placeholder="Full name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="member_title">Title/Position *</Label>
                <Input
                  id="member_title"
                  value={teamMemberForm.title}
                  onChange={(e) => setTeamMemberForm({ ...teamMemberForm, title: e.target.value })}
                  placeholder="e.g., Senior Legal Advisor"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="member_bio">Bio</Label>
                <Textarea
                  id="member_bio"
                  value={teamMemberForm.bio}
                  onChange={(e) => setTeamMemberForm({ ...teamMemberForm, bio: e.target.value })}
                  placeholder="Brief biography"
                  rows={4}
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="member_email">Email</Label>
                  <Input
                    id="member_email"
                    type="email"
                    value={teamMemberForm.email}
                    onChange={(e) => setTeamMemberForm({ ...teamMemberForm, email: e.target.value })}
                    placeholder="email@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="member_linkedin">LinkedIn URL</Label>
                  <Input
                    id="member_linkedin"
                    value={teamMemberForm.linkedin_url}
                    onChange={(e) => setTeamMemberForm({ ...teamMemberForm, linkedin_url: e.target.value })}
                    placeholder="https://linkedin.com/in/..."
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="member_image">Profile Photo</Label>
                <div className="flex items-center gap-4">
                  {teamMemberImagePreview ? (
                    <img src={teamMemberImagePreview} alt="Preview" className="h-32 w-32 object-cover border border-slate-200 rounded" />
                  ) : (
                    <div className="h-32 w-32 bg-slate-100 flex items-center justify-center border border-slate-200 rounded">
                      <Upload className="h-8 w-8 text-slate-400" />
                    </div>
                  )}
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleTeamMemberImageChange}
                      className="hidden"
                      id="team-member-image-upload"
                    />
                    <label htmlFor="team-member-image-upload">
                      <Button type="button" variant="outline" size="sm" asChild>
                        <span className="cursor-pointer">
                          <Upload className="h-4 w-4 mr-2" />
                          Upload Photo
                        </span>
                      </Button>
                    </label>
                    <p className="text-xs text-slate-400 mt-1">Max 5MB, PNG or JPG</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="member_order">Display Order</Label>
                <Input
                  id="member_order"
                  type="number"
                  value={teamMemberForm.order}
                  onChange={(e) => setTeamMemberForm({ ...teamMemberForm, order: e.target.value })}
                  placeholder="0"
                />
                <p className="text-xs text-slate-400">Lower numbers appear first</p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setTeamMemberDialog({ open: false, member: null })}>
                Cancel
              </Button>
              <Button onClick={handleSaveTeamMember} disabled={teamMembersLoading} className="bg-primary">
                {teamMembersLoading ? 'Saving...' : 'Save Team Member'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default AdminSettings;
