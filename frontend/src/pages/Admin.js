import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Textarea } from '../components/ui/textarea';
import { 
  Shield,
  Users,
  FileText,
  Mail,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  ChevronDown,
  ChevronUp,
  Scale,
  IndianRupee,
  Briefcase,
  MapPin,
  Phone,
  Settings,
  Package,
  Plus,
  Edit
} from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { getImageUrl } from '../utils/imageUrl';
import { getApiUrl } from '@/config/env';

const API = getApiUrl();

const Admin = () => {
  const { user, isAdmin, getAuthHeader, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [stories, setStories] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [advocates, setAdvocates] = useState([]);
  const [grants, setGrants] = useState([]);
  const [merchandise, setMerchandise] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');
  
  // ✅ FIX 1: Removed activeTab from dependencies (not needed, setActiveTab is stable)
  const handleTabChange = useCallback((value) => {
    console.log('Tab change requested:', value);
    setActiveTab(value);
  }, []);
  const [expandedStory, setExpandedStory] = useState(null);
  const [expandedGrant, setExpandedGrant] = useState(null);
  const [moderationDialog, setModerationDialog] = useState({ open: false, item: null, action: null, type: null });
  const [merchandiseDialog, setMerchandiseDialog] = useState({ open: false, item: null });
  const [advocateDialog, setAdvocateDialog] = useState({ open: false, advocate: null });
  const [adminNotes, setAdminNotes] = useState('');
  const [approvedAmount, setApprovedAmount] = useState('');
  const [moderating, setModerating] = useState(false);
  const [advocateForm, setAdvocateForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    bar_council_number: '',
    experience_years: '',
    about: '',
    specializations: [],
    areas_of_operation: [],
    languages: []
  });
  const [merchForm, setMerchForm] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    category: 'General',
    is_active: true
  });

  const fetchData = useCallback(async () => {
    try {
      const [statsRes, storiesRes, contactsRes, advocatesRes, grantsRes, merchRes, ordersRes] = await Promise.all([
        axios.get(`${API}/admin/stats`, getAuthHeader()),
        axios.get(`${API}/admin/stories`, getAuthHeader()),
        axios.get(`${API}/admin/contacts`, getAuthHeader()),
        axios.get(`${API}/admin/advocates`, getAuthHeader()),
        axios.get(`${API}/admin/grants`, getAuthHeader()),
        axios.get(`${API}/admin/merchandise`, getAuthHeader()),
        axios.get(`${API}/admin/orders`, getAuthHeader())
      ]);
      setStats(statsRes.data);
      setStories(storiesRes.data);
      // Debug: Log stories to help diagnose missing stories
      console.log('Stories loaded:', storiesRes.data.length, storiesRes.data);
      if (storiesRes.data.length > 0) {
        console.log('First story details:', {
          id: storiesRes.data[0].id,
          title: storiesRes.data[0].title,
          user_name: storiesRes.data[0].user_name,
          status: storiesRes.data[0].status,
          created_at: storiesRes.data[0].created_at
        });
        const maheshStory = storiesRes.data.find(s => 
          s.user_name?.toLowerCase().includes('mahesh') || 
          s.title?.toLowerCase().includes('mahesh')
        );
        if (maheshStory) {
          console.log('Found Mahesh story:', maheshStory);
        } else {
          console.log('Mahesh story not found in loaded stories. All story titles:', storiesRes.data.map(s => s.title));
          console.log('All user names:', storiesRes.data.map(s => s.user_name));
        }
      }
      setContacts(contactsRes.data);
      setAdvocates(advocatesRes.data);
      setGrants(grantsRes.data);
      setMerchandise(merchRes.data);
      setOrders(ordersRes.data);
      
      // Debug: Log advocates count
      console.log('Advocates loaded:', advocatesRes.data.length, advocatesRes.data);
    } catch (error) {
      console.error('Error fetching admin data:', error);
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  }, [getAuthHeader]);

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
      fetchData();
    }
  }, [user, isAdmin, authLoading, navigate, fetchData]);


  const handleModerate = async () => {
    if (!moderationDialog.item || !moderationDialog.action || !moderationDialog.type) return;
    
    setModerating(true);
    try {
      let endpoint = '';
      let body = { status: moderationDialog.action, admin_notes: adminNotes || null };
      
      if (moderationDialog.type === 'story') {
        endpoint = `${API}/admin/stories/${moderationDialog.item.id}/moderate`;
      } else if (moderationDialog.type === 'advocate') {
        endpoint = `${API}/admin/advocates/${moderationDialog.item.id}/moderate`;
      } else if (moderationDialog.type === 'grant') {
        endpoint = `${API}/admin/grants/${moderationDialog.item.id}/moderate`;
        if (moderationDialog.action === 'approved' && approvedAmount) {
          body.amount_approved = parseFloat(approvedAmount);
        }
      }

      await axios.put(endpoint, body, getAuthHeader());

      if (moderationDialog.type === 'story') {
        setStories(prev => prev.map(s => 
          s.id === moderationDialog.item.id 
            ? { ...s, status: moderationDialog.action, admin_notes: adminNotes }
            : s
        ));
      } else if (moderationDialog.type === 'advocate') {
        setAdvocates(prev => prev.map(a => 
          a.id === moderationDialog.item.id 
            ? { ...a, status: moderationDialog.action }
            : a
        ));
      } else if (moderationDialog.type === 'grant') {
        setGrants(prev => prev.map(g => 
          g.id === moderationDialog.item.id 
            ? { ...g, status: moderationDialog.action, admin_notes: adminNotes, amount_approved: approvedAmount ? parseFloat(approvedAmount) : null }
            : g
        ));
      }

      toast.success(`${moderationDialog.type} ${moderationDialog.action} successfully`);
      setModerationDialog({ open: false, item: null, action: null, type: null });
      setAdminNotes('');
      setApprovedAmount('');
      
      // Refresh stats
      const statsRes = await axios.get(`${API}/admin/stats`, getAuthHeader());
      setStats(statsRes.data);
    } catch (error) {
      console.error('Error moderating:', error);
      toast.error('Failed to moderate');
    } finally {
      setModerating(false);
    }
  };

  const filteredStories = stories.filter(s => {
    if (activeTab === 'all') return true;
    return s.status === activeTab;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return <Badge className="status-approved"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge className="status-rejected"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge className="status-pending"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-slate-500">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50" data-testid="admin-page">
      {/* Header */}
      <div className="bg-primary text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Shield className="h-6 w-6 text-secondary" />
                <p className="font-mono text-xs uppercase tracking-widest text-secondary">
                  Admin Panel
                </p>
              </div>
              <h1 className="font-serif text-2xl md:text-3xl font-bold">
                Content Moderation
              </h1>
            </div>
            <Link to="/admin/settings" data-testid="admin-settings-link">
              <Button variant="outline" className="border-white text-white hover:bg-white/10">
                <Settings className="h-4 w-4 mr-2" />
                Site Settings
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
          {stats && [
            { label: 'Users', value: stats.total_users, icon: <Users className="h-4 w-4" /> },
            { label: 'Stories', value: stats.pending_stories, icon: <FileText className="h-4 w-4" />, color: 'text-amber-600' },
            { label: 'Approved', value: stats.approved_stories, icon: <CheckCircle className="h-4 w-4" />, color: 'text-green-600' },
            { label: 'Advocates', value: stats.pending_advocates, icon: <Scale className="h-4 w-4" />, color: 'text-amber-600' },
            { label: 'Adv. Active', value: stats.approved_advocates, icon: <Scale className="h-4 w-4" />, color: 'text-green-600' },
            { label: 'Grants', value: stats.pending_grants, icon: <IndianRupee className="h-4 w-4" />, color: 'text-amber-600' },
            { label: 'Grants OK', value: stats.approved_grants, icon: <IndianRupee className="h-4 w-4" />, color: 'text-green-600' },
            { label: 'Pending Adv.', value: stats.pending_advocates, icon: <Scale className="h-4 w-4" />, color: 'text-amber-600' }
          ].map((stat, index) => (
            <Card key={index} className="border-slate-200" data-testid={`admin-stat-${index}`}>
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wide">{stat.label}</p>
                    <p className={`text-xl font-bold ${stat.color || 'text-primary'}`}>{stat.value}</p>
                  </div>
                  <div className={stat.color || 'text-slate-400'}>{stat.icon}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="mb-6 w-full flex-wrap bg-slate-200 p-1">
            <TabsTrigger value="pending" data-testid="tab-pending" className="cursor-pointer">
              Pending Stories ({stats?.pending_stories || 0})
            </TabsTrigger>
            <TabsTrigger value="approved" data-testid="tab-approved" className="cursor-pointer">
              Approved Stories ({stats?.approved_stories || 0})
            </TabsTrigger>
            <TabsTrigger value="rejected" data-testid="tab-rejected" className="cursor-pointer">
              Rejected Stories ({stats?.rejected_stories || 0})
            </TabsTrigger>
            <TabsTrigger value="all" data-testid="tab-all" className="cursor-pointer">
              All Stories ({stories.length || 0})
            </TabsTrigger>
            <TabsTrigger value="contacts" data-testid="tab-contacts" className="cursor-pointer">
              Pending Advocates ({stats?.pending_advocates || 0})
            </TabsTrigger>
            <TabsTrigger 
              value="advocates" 
              data-testid="tab-advocates" 
              className="cursor-pointer hover:bg-white data-[state=active]:bg-white data-[state=active]:text-primary"
            >
              Advocates ({advocates.length || 0})
            </TabsTrigger>
            <TabsTrigger value="grants" data-testid="tab-grants" className="cursor-pointer">
              Grants ({stats?.pending_grants || 0})
            </TabsTrigger>
            <TabsTrigger value="merchandise" data-testid="tab-merchandise" className="cursor-pointer">
              Merchandise ({merchandise.length || 0})
            </TabsTrigger>
            <TabsTrigger value="orders" data-testid="tab-orders" className="cursor-pointer">
              Orders ({orders.length})
            </TabsTrigger>
          </TabsList>

          {/* Stories Tabs */}
          {['pending', 'approved', 'rejected', 'all'].map(tab => (
            <TabsContent key={tab} value={tab}>
              {filteredStories.length === 0 ? (
                <Card className="border-slate-200">
                  <CardContent className="p-12 text-center">
                    <FileText className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                    <h3 className="font-serif text-xl font-bold text-primary mb-2">
                      No {tab === 'all' ? '' : tab} stories
                    </h3>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {filteredStories.map(story => (
                    <Card key={story.id} className="border-slate-200" data-testid={`admin-story-${story.id}`}>
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              {getStatusBadge(story.status)}
                              <span className="text-xs text-slate-400">
                                {new Date(story.created_at).toLocaleString('en-IN')}
                              </span>
                            </div>
                            <h3 className="font-serif text-lg font-bold text-primary mb-1">
                              {story.title}
                            </h3>
                            <p className="text-sm text-slate-500 mb-2">
                              By: {story.user_name} • {story.hospital_name} • {story.location}
                            </p>
                            
                            {/* Expandable Content */}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setExpandedStory(expandedStory === story.id ? null : story.id)}
                              className="text-secondary"
                              data-testid={`expand-story-${story.id}`}
                            >
                              {expandedStory === story.id ? (
                                <>Hide Details <ChevronUp className="h-4 w-4 ml-1" /></>
                              ) : (
                                <>View Details <ChevronDown className="h-4 w-4 ml-1" /></>
                              )}
                            </Button>

                            {expandedStory === story.id && (
                              <div className="mt-4 p-4 bg-slate-50 border border-slate-200">
                                <h4 className="font-semibold text-primary mb-2">Description:</h4>
                                <p className="text-sm text-slate-600 whitespace-pre-wrap mb-4">
                                  {story.description}
                                </p>
                                {story.outcome && (
                                  <>
                                    <h4 className="font-semibold text-primary mb-2">Outcome:</h4>
                                    <p className="text-sm text-slate-600">{story.outcome}</p>
                                  </>
                                )}
                                {story.images && story.images.length > 0 && (
                                  <div className="mt-4">
                                    <h4 className="font-semibold text-primary mb-2">Images ({story.images.length}):</h4>
                                    <div className="flex gap-2 flex-wrap">
                                      {story.images.map((img, idx) => (
                                        <img
                                          key={idx}
                                          src={getImageUrl(img)}
                                          alt={`Story image ${idx + 1}`}
                                          className="w-24 h-24 object-cover border border-slate-200"
                                          onError={(e) => {
                                            console.error('Image failed to load:', img);
                                            e.target.style.display = 'none';
                                          }}
                                        />
                                      ))}
                                    </div>
                                  </div>
                                )}
                                {story.admin_notes && (
                                  <div className="mt-4 p-3 bg-amber-50 border-l-2 border-amber-500">
                                    <p className="text-sm font-medium text-amber-800">Admin Notes:</p>
                                    <p className="text-sm text-amber-700">{story.admin_notes}</p>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Action Buttons */}
                          <div className="flex gap-2 ml-4">
                            {story.status === 'pending' && (
                              <>
                                <Button
                                  size="sm"
                                  className="bg-green-600 hover:bg-green-700"
                                  onClick={() => setModerationDialog({ open: true, item: story, action: 'approved', type: 'story' })}
                                  data-testid={`approve-story-${story.id}`}
                                >
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => setModerationDialog({ open: true, item: story, action: 'rejected', type: 'story' })}
                                  data-testid={`reject-story-${story.id}`}
                                >
                                  <XCircle className="h-4 w-4 mr-1" />
                                  Reject
                                </Button>
                              </>
                            )}
                            <Link to={`/edit-story/${story.id}`}>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="border-slate-300"
                                data-testid={`admin-edit-story-${story.id}`}
                              >
                                <Edit className="h-4 w-4 mr-1" />
                                Edit
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          ))}

          {/* Pending Advocates Tab */}
          <TabsContent value="contacts">
            {!advocates || advocates.filter(a => a.status === 'pending').length === 0 ? (
              <Card className="border-slate-200">
                <CardContent className="p-12 text-center">
                  <Scale className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                  <h3 className="font-serif text-xl font-bold text-primary mb-2">
                    No pending advocates
                  </h3>
                  <p className="text-sm text-slate-500">Pending advocate registrations will appear here.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {advocates.filter(a => a.status === 'pending').map(advocate => (
                  <Card key={advocate.id} className="border-slate-200" data-testid={`advocate-${advocate.id}`}>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            {getStatusBadge(advocate.status)}
                            <span className="text-xs text-slate-400">
                              {new Date(advocate.created_at).toLocaleString('en-IN')}
                            </span>
                          </div>
                          <h3 className="font-serif text-lg font-bold text-primary mb-1">
                            {advocate.full_name}
                          </h3>
                          <p className="text-sm text-slate-500 mb-2">
                            Bar Council: {advocate.bar_council_number} • {advocate.experience_years} years exp.
                          </p>
                          <div className="flex flex-wrap gap-1 mb-2">
                            {advocate.specializations && advocate.specializations.map((spec, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs">{spec}</Badge>
                            ))}
                          </div>
                          <p className="text-sm text-slate-500 flex items-center gap-2 mb-1">
                            <MapPin className="h-4 w-4" />
                            {advocate.areas_of_operation && advocate.areas_of_operation.join(', ')}
                          </p>
                          <p className="text-sm text-slate-500 flex items-center gap-2">
                            <Phone className="h-4 w-4" />
                            {advocate.phone} • {advocate.email}
                          </p>
                          {advocate.about && (
                            <p className="text-sm text-slate-600 mt-2 bg-slate-50 p-3 border">
                              {advocate.about}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2 ml-4">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setAdvocateForm({
                                full_name: advocate.full_name || '',
                                email: advocate.email || '',
                                phone: advocate.phone || '',
                                bar_council_number: advocate.bar_council_number || '',
                                experience_years: advocate.experience_years || '',
                                about: advocate.about || '',
                                specializations: advocate.specializations || [],
                                areas_of_operation: advocate.areas_of_operation || [],
                                languages: advocate.languages || []
                              });
                              setAdvocateDialog({ open: true, advocate });
                            }}
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => setModerationDialog({ open: true, item: advocate, action: 'approved', type: 'advocate' })}
                            data-testid={`approve-advocate-${advocate.id}`}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => setModerationDialog({ open: true, item: advocate, action: 'rejected', type: 'advocate' })}
                            data-testid={`reject-advocate-${advocate.id}`}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Advocates Tab */}
          <TabsContent value="advocates">
            {!advocates || advocates.length === 0 ? (
              <Card className="border-slate-200">
                <CardContent className="p-12 text-center">
                  <Scale className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                  <h3 className="font-serif text-xl font-bold text-primary mb-2">
                    No advocate registrations
                  </h3>
                  <p className="text-sm text-slate-500">Advocates will appear here once they register.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                <div className="mb-4">
                  <p className="text-sm text-slate-600">
                    Showing {advocates.length} advocate(s) ({advocates.filter(a => a.status === 'pending').length} pending, {advocates.filter(a => a.status === 'approved').length} approved)
                  </p>
                </div>
                {/* Show pending advocates first */}
                {advocates.filter(a => a.status === 'pending').length > 0 && (
                  <>
                    {advocates.filter(a => a.status === 'pending').map(advocate => (
                      <Card key={advocate.id} className="border-slate-200" data-testid={`advocate-${advocate.id}`}>
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                {getStatusBadge(advocate.status)}
                                <span className="text-xs text-slate-400">
                                  {new Date(advocate.created_at).toLocaleString('en-IN')}
                                </span>
                              </div>
                              <h3 className="font-serif text-lg font-bold text-primary mb-1">
                                {advocate.full_name}
                              </h3>
                              <p className="text-sm text-slate-500 mb-2">
                                Bar Council: {advocate.bar_council_number} • {advocate.experience_years} years exp.
                              </p>
                              <div className="flex flex-wrap gap-1 mb-2">
                                {advocate.specializations && advocate.specializations.map((spec, idx) => (
                                  <Badge key={idx} variant="secondary" className="text-xs">{spec}</Badge>
                                ))}
                              </div>
                              <p className="text-sm text-slate-500 flex items-center gap-2 mb-1">
                                <MapPin className="h-4 w-4" />
                                {advocate.areas_of_operation && advocate.areas_of_operation.join(', ')}
                              </p>
                              <p className="text-sm text-slate-500 flex items-center gap-2">
                                <Phone className="h-4 w-4" />
                                {advocate.phone} • {advocate.email}
                              </p>
                              {advocate.about && (
                                <p className="text-sm text-slate-600 mt-2 bg-slate-50 p-3 border">
                                  {advocate.about}
                                </p>
                              )}
                            </div>
                            <div className="flex gap-2 ml-4">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setAdvocateForm({
                                    full_name: advocate.full_name || '',
                                    email: advocate.email || '',
                                    phone: advocate.phone || '',
                                    bar_council_number: advocate.bar_council_number || '',
                                    experience_years: advocate.experience_years || '',
                                    about: advocate.about || '',
                                    specializations: advocate.specializations || [],
                                    areas_of_operation: advocate.areas_of_operation || [],
                                    languages: advocate.languages || []
                                  });
                                  setAdvocateDialog({ open: true, advocate });
                                }}
                              >
                                <Edit className="h-4 w-4 mr-1" />
                                Edit
                              </Button>
                              {advocate.status === 'pending' && (
                                <>
                                  <Button
                                    size="sm"
                                    className="bg-green-600 hover:bg-green-700"
                                    onClick={() => setModerationDialog({ open: true, item: advocate, action: 'approved', type: 'advocate' })}
                                    data-testid={`approve-advocate-${advocate.id}`}
                                  >
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                    Approve
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => setModerationDialog({ open: true, item: advocate, action: 'rejected', type: 'advocate' })}
                                    data-testid={`reject-advocate-${advocate.id}`}
                                  >
                                    <XCircle className="h-4 w-4 mr-1" />
                                    Reject
                                  </Button>
                                </>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </>
                )}
                {/* Show approved advocates */}
                {advocates.filter(a => a.status === 'approved').length > 0 && (
                  <>
                    {advocates.filter(a => a.status === 'pending').length > 0 && (
                      <div className="mt-8 mb-4">
                        <h3 className="font-serif text-lg font-bold text-primary mb-2">Approved Advocates</h3>
                      </div>
                    )}
                    {advocates.filter(a => a.status === 'approved').map(advocate => (
                      <Card key={advocate.id} className="border-slate-200" data-testid={`advocate-${advocate.id}`}>
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                {getStatusBadge(advocate.status)}
                                <span className="text-xs text-slate-400">
                                  {new Date(advocate.created_at).toLocaleString('en-IN')}
                                </span>
                              </div>
                              <h3 className="font-serif text-lg font-bold text-primary mb-1">
                                {advocate.full_name}
                              </h3>
                              <p className="text-sm text-slate-500 mb-2">
                                Bar Council: {advocate.bar_council_number} • {advocate.experience_years} years exp.
                              </p>
                              <div className="flex flex-wrap gap-1 mb-2">
                                {advocate.specializations && advocate.specializations.map((spec, idx) => (
                                  <Badge key={idx} variant="secondary" className="text-xs">{spec}</Badge>
                                ))}
                              </div>
                              <p className="text-sm text-slate-500 flex items-center gap-2 mb-1">
                                <MapPin className="h-4 w-4" />
                                {advocate.areas_of_operation && advocate.areas_of_operation.join(', ')}
                              </p>
                              <p className="text-sm text-slate-500 flex items-center gap-2">
                                <Phone className="h-4 w-4" />
                                {advocate.phone} • {advocate.email}
                              </p>
                              {advocate.about && (
                                <p className="text-sm text-slate-600 mt-2 bg-slate-50 p-3 border">
                                  {advocate.about}
                                </p>
                              )}
                            </div>
                            <div className="flex gap-2 ml-4">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setAdvocateForm({
                                    full_name: advocate.full_name || '',
                                    email: advocate.email || '',
                                    phone: advocate.phone || '',
                                    bar_council_number: advocate.bar_council_number || '',
                                    experience_years: advocate.experience_years || '',
                                    about: advocate.about || '',
                                    specializations: advocate.specializations || [],
                                    areas_of_operation: advocate.areas_of_operation || [],
                                    languages: advocate.languages || []
                                  });
                                  setAdvocateDialog({ open: true, advocate });
                                }}
                              >
                                <Edit className="h-4 w-4 mr-1" />
                                Edit
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </>
                )}
              </div>
            )}
          </TabsContent>

          {/* Grants Tab */}
          <TabsContent value="grants">
            {grants.filter(g => g.status === 'pending').length === 0 ? (
              <Card className="border-slate-200">
                <CardContent className="p-12 text-center">
                  <IndianRupee className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                  <h3 className="font-serif text-xl font-bold text-primary mb-2">
                    No pending grant applications
                  </h3>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {grants.filter(g => g.status === 'pending').map(grant => (
                  <Card key={grant.id} className="border-slate-200" data-testid={`grant-${grant.id}`}>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            {getStatusBadge(grant.status)}
                            <span className="text-xs text-slate-400">
                              {new Date(grant.created_at).toLocaleString('en-IN')}
                            </span>
                          </div>
                          <h3 className="font-serif text-lg font-bold text-primary mb-1">
                            {grant.case_type} - ₹{grant.amount_required.toLocaleString('en-IN')}
                          </h3>
                          <p className="text-sm text-slate-500 mb-2">
                            Applicant: {grant.user_name} ({grant.user_email})
                          </p>
                          <p className="text-sm text-slate-500">
                            Purpose: {grant.purpose_of_funding} • Stage: {grant.current_stage}
                          </p>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setExpandedGrant(expandedGrant === grant.id ? null : grant.id)}
                            className="text-secondary mt-2"
                          >
                            {expandedGrant === grant.id ? (
                              <>Hide Details <ChevronUp className="h-4 w-4 ml-1" /></>
                            ) : (
                              <>View Details <ChevronDown className="h-4 w-4 ml-1" /></>
                            )}
                          </Button>

                          {expandedGrant === grant.id && (
                            <div className="mt-4 p-4 bg-slate-50 border border-slate-200 space-y-3 text-sm">
                              <div>
                                <strong>Case Summary:</strong>
                                <p className="text-slate-600">{grant.case_summary}</p>
                              </div>
                              <div>
                                <strong>Opponent Details:</strong>
                                <p className="text-slate-600">{grant.opponent_details}</p>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <strong>Annual Income:</strong>
                                  <p className="text-slate-600">₹{grant.annual_income.toLocaleString('en-IN')}</p>
                                </div>
                                <div>
                                  <strong>Family Members:</strong>
                                  <p className="text-slate-600">{grant.family_members}</p>
                                </div>
                              </div>
                              <div>
                                <strong>Cost Breakdown:</strong>
                                <p className="text-slate-600">{grant.breakdown_of_costs}</p>
                              </div>
                              <div>
                                <strong>Bank Details:</strong>
                                <p className="text-slate-600">
                                  {grant.bank_account_name} | A/C: {grant.bank_account_number} | IFSC: {grant.bank_ifsc}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2 ml-4">
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => setModerationDialog({ open: true, item: grant, action: 'approved', type: 'grant' })}
                            data-testid={`approve-grant-${grant.id}`}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => setModerationDialog({ open: true, item: grant, action: 'rejected', type: 'grant' })}
                            data-testid={`reject-grant-${grant.id}`}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Merchandise Tab */}
          <TabsContent value="merchandise">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-serif text-2xl font-bold text-primary">Merchandise Management</h2>
              <Button
                onClick={() => {
                  setMerchForm({ name: '', description: '', price: '', stock: '', category: 'General', is_active: true });
                  setMerchandiseDialog({ open: true, item: null });
                }}
                className="bg-primary hover:bg-slate-800"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </div>
            {merchandise.length === 0 ? (
              <Card className="border-slate-200">
                <CardContent className="p-12 text-center">
                  <Package className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                  <h3 className="font-serif text-xl font-bold text-primary mb-2">No merchandise items</h3>
                  <p className="text-slate-500">Add your first merchandise item to get started.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {merchandise.map((item) => (
                  <Card key={item.id} className="border-slate-200">
                    {item.image_url && (
                      <div className="aspect-square bg-slate-100 overflow-hidden">
                        <img src={getImageUrl(item.image_url)} alt={item.name} className="w-full h-full object-cover" onError={(e) => { console.error('Image failed to load:', item.image_url); e.target.style.display = 'none'; }} />
                      </div>
                    )}
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-serif font-bold text-primary">{item.name}</h3>
                        <Badge variant={item.is_active ? 'default' : 'secondary'}>
                          {item.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-600 mb-2 line-clamp-2">{item.description}</p>
                      <div className="flex justify-between items-center mb-4">
                        <span className="font-bold text-secondary">₹{item.price.toFixed(2)}</span>
                        <span className="text-sm text-slate-500">Stock: {item.stock}</span>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setMerchForm({
                              name: item.name,
                              description: item.description,
                              price: item.price.toString(),
                              stock: item.stock.toString(),
                              category: item.category,
                              is_active: item.is_active
                            });
                            setMerchandiseDialog({ open: true, item });
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={async () => {
                            if (window.confirm('Are you sure you want to delete this item?')) {
                              try {
                                await axios.delete(`${API}/merchandise/${item.id}`, getAuthHeader());
                                toast.success('Item deleted');
                                fetchData();
                              } catch (error) {
                                toast.error('Failed to delete item');
                              }
                            }
                          }}
                        >
                          Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders">
            <h2 className="font-serif text-2xl font-bold text-primary mb-6">Orders Management</h2>
            {orders.length === 0 ? (
              <Card className="border-slate-200">
                <CardContent className="p-12 text-center">
                  <Package className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                  <h3 className="font-serif text-xl font-bold text-primary mb-2">No orders yet</h3>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <Card key={order.id} className="border-slate-200">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-serif font-bold text-primary mb-1">Order #{order.id.slice(0, 8)}</h3>
                          <p className="text-sm text-slate-500">
                            {new Date(order.created_at).toLocaleString('en-IN')}
                          </p>
                        </div>
                        <Badge variant={order.status === 'delivered' ? 'default' : order.status === 'cancelled' ? 'destructive' : 'secondary'}>
                          {order.status}
                        </Badge>
                      </div>
                      <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <h4 className="font-semibold text-primary mb-2">Items:</h4>
                          {order.items.map((item, idx) => (
                            <p key={idx} className="text-sm text-slate-600">
                              {item.merchandise_name} × {item.quantity} = ₹{item.total.toFixed(2)}
                            </p>
                          ))}
                          <p className="font-bold text-primary mt-2">Total: ₹{order.total_amount.toFixed(2)}</p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-primary mb-2">Shipping:</h4>
                          <p className="text-sm text-slate-600">{order.shipping_name}</p>
                          <p className="text-sm text-slate-600">{order.shipping_email}</p>
                          <p className="text-sm text-slate-600">{order.shipping_phone}</p>
                          <p className="text-sm text-slate-600">{order.shipping_address}, {order.shipping_city}, {order.shipping_state} - {order.shipping_pincode}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {order.status === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              onClick={async () => {
                                try {
                                  await axios.put(`${API}/admin/orders/${order.id}/status`, { status: 'confirmed' }, getAuthHeader());
                                  toast.success('Order confirmed');
                                  fetchData();
                                } catch (error) {
                                  toast.error('Failed to update order');
                                }
                              }}
                            >
                              Confirm
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={async () => {
                                try {
                                  await axios.put(`${API}/admin/orders/${order.id}/status`, { status: 'cancelled' }, getAuthHeader());
                                  toast.success('Order cancelled');
                                  fetchData();
                                } catch (error) {
                                  toast.error('Failed to cancel order');
                                }
                              }}
                            >
                              Cancel
                            </Button>
                          </>
                        )}
                        {order.status === 'confirmed' && (
                          <Button
                            size="sm"
                            onClick={async () => {
                              try {
                                await axios.put(`${API}/admin/orders/${order.id}/status`, { status: 'shipped' }, getAuthHeader());
                                toast.success('Order marked as shipped');
                                fetchData();
                              } catch (error) {
                                toast.error('Failed to update order');
                              }
                            }}
                          >
                            Mark as Shipped
                          </Button>
                        )}
                        {order.status === 'shipped' && (
                          <Button
                            size="sm"
                            onClick={async () => {
                              try {
                                await axios.put(`${API}/admin/orders/${order.id}/status`, { status: 'delivered' }, getAuthHeader());
                                toast.success('Order marked as delivered');
                                fetchData();
                              } catch (error) {
                                toast.error('Failed to update order');
                              }
                            }}
                          >
                            Mark as Delivered
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Merchandise Dialog */}
      <Dialog open={merchandiseDialog.open} onOpenChange={(open) => !open && setMerchandiseDialog({ open: false, item: null })}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{merchandiseDialog.item ? 'Edit Item' : 'Add New Item'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={async (e) => {
            e.preventDefault();
            try {
              const data = {
                name: merchForm.name,
                description: merchForm.description,
                price: parseFloat(merchForm.price),
                stock: parseInt(merchForm.stock),
                category: merchForm.category,
                is_active: merchForm.is_active
              };
              if (merchandiseDialog.item) {
                await axios.put(`${API}/merchandise/${merchandiseDialog.item.id}`, data, getAuthHeader());
                toast.success('Item updated');
              } else {
                await axios.post(`${API}/merchandise`, data, getAuthHeader());
                toast.success('Item created');
              }
              setMerchandiseDialog({ open: false, item: null });
              fetchData();
            } catch (error) {
              toast.error('Failed to save item');
            }
          }} className="space-y-4">
            <div className="space-y-2">
              <Label>Name *</Label>
              <Input
                value={merchForm.name}
                onChange={(e) => setMerchForm({ ...merchForm, name: e.target.value })}
                required
                placeholder="Item name"
              />
            </div>
            <div className="space-y-2">
              <Label>Description *</Label>
              <Textarea
                value={merchForm.description}
                onChange={(e) => setMerchForm({ ...merchForm, description: e.target.value })}
                required
                placeholder="Item description"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Price (₹) *</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={merchForm.price}
                  onChange={(e) => setMerchForm({ ...merchForm, price: e.target.value })}
                  required
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label>Stock *</Label>
                <Input
                  type="number"
                  value={merchForm.stock}
                  onChange={(e) => setMerchForm({ ...merchForm, stock: e.target.value })}
                  required
                  placeholder="0"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Input
                value={merchForm.category}
                onChange={(e) => setMerchForm({ ...merchForm, category: e.target.value })}
                placeholder="General"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_active"
                checked={merchForm.is_active}
                onChange={(e) => setMerchForm({ ...merchForm, is_active: e.target.checked })}
                className="rounded"
              />
              <Label htmlFor="is_active">Active (visible to customers)</Label>
            </div>
            {merchandiseDialog.item && (
              <div className="space-y-2">
                <Label>Image</Label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files[0];
                    if (file) {
                      const formData = new FormData();
                      formData.append('file', file);
                      try {
                        await axios.post(`${API}/merchandise/${merchandiseDialog.item.id}/image`, formData, {
                          ...getAuthHeader(),
                          headers: { 'Content-Type': 'multipart/form-data' }
                        });
                        toast.success('Image uploaded');
                        fetchData();
                      } catch (error) {
                        toast.error('Failed to upload image');
                      }
                    }
                  }}
                />
              </div>
            )}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setMerchandiseDialog({ open: false, item: null })}>
                Cancel
              </Button>
              <Button type="submit" className="bg-primary">Save</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Moderation Dialog */}
      <Dialog 
        open={moderationDialog.open} 
        onOpenChange={(open) => {
          if (!open) {
            setModerationDialog({ open: false, item: null, action: null, type: null });
            setAdminNotes('');
            setApprovedAmount('');
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {moderationDialog.action === 'approved' ? 'Approve' : 'Reject'} {moderationDialog.type}
            </DialogTitle>
            <DialogDescription>
              {moderationDialog.action === 'approved'
                ? `This ${moderationDialog.type} will be ${moderationDialog.type === 'story' ? 'published publicly' : 'activated'}.`
                : `This ${moderationDialog.type} will be rejected. Please provide a reason.`}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-4">
            <p className="font-medium text-primary">
              {moderationDialog.type === 'story' && `"${moderationDialog.item?.title}"`}
              {moderationDialog.type === 'advocate' && `${moderationDialog.item?.full_name}`}
              {moderationDialog.type === 'grant' && `${moderationDialog.item?.case_type} - ₹${moderationDialog.item?.amount_required?.toLocaleString('en-IN')}`}
            </p>
            
            {moderationDialog.type === 'grant' && moderationDialog.action === 'approved' && (
              <div className="space-y-2">
                <Label>Approved Amount (₹)</Label>
                <Input
                  type="number"
                  placeholder={`Requested: ₹${moderationDialog.item?.amount_required?.toLocaleString('en-IN')}`}
                  value={approvedAmount}
                  onChange={(e) => setApprovedAmount(e.target.value)}
                  data-testid="approved-amount-input"
                />
              </div>
            )}
            
            <Textarea
              placeholder={moderationDialog.action === 'rejected' ? 'Reason for rejection (required)' : 'Admin notes (optional)'}
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              rows={3}
              data-testid="admin-notes-input"
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setModerationDialog({ open: false, item: null, action: null, type: null });
                setAdminNotes('');
                setApprovedAmount('');
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleModerate}
              disabled={moderating || (moderationDialog.action === 'rejected' && !adminNotes.trim())}
              className={moderationDialog.action === 'approved' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
              data-testid="confirm-moderation-btn"
            >
              {moderating ? 'Processing...' : (moderationDialog.action === 'approved' ? 'Approve' : 'Reject')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Advocate Dialog */}
      <Dialog open={advocateDialog.open} onOpenChange={(open) => !open && setAdvocateDialog({ open: false, advocate: null })}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Advocate Profile</DialogTitle>
            <DialogDescription>
              Update advocate information. Changes will be reflected immediately.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={async (e) => {
            e.preventDefault();
            try {
              await axios.put(
                `${API}/admin/advocates/${advocateDialog.advocate.id}`,
                {
                  ...advocateForm,
                  experience_years: parseInt(advocateForm.experience_years)
                },
                getAuthHeader()
              );
              toast.success('Advocate profile updated successfully');
              setAdvocateDialog({ open: false, advocate: null });
              fetchData();
            } catch (error) {
              console.error('Update advocate error:', error);
              toast.error(error.response?.data?.detail || 'Failed to update advocate');
            }
          }}>
            <div className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="adv_full_name">Full Name *</Label>
                  <Input
                    id="adv_full_name"
                    value={advocateForm.full_name}
                    onChange={(e) => setAdvocateForm({ ...advocateForm, full_name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="adv_email">Email *</Label>
                  <Input
                    id="adv_email"
                    type="email"
                    value={advocateForm.email}
                    onChange={(e) => setAdvocateForm({ ...advocateForm, email: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="adv_phone">Phone *</Label>
                  <Input
                    id="adv_phone"
                    value={advocateForm.phone}
                    onChange={(e) => setAdvocateForm({ ...advocateForm, phone: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="adv_bar_council">Bar Council Number *</Label>
                  <Input
                    id="adv_bar_council"
                    value={advocateForm.bar_council_number}
                    onChange={(e) => setAdvocateForm({ ...advocateForm, bar_council_number: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="adv_experience">Years of Experience *</Label>
                <Input
                  id="adv_experience"
                  type="number"
                  min="0"
                  value={advocateForm.experience_years}
                  onChange={(e) => setAdvocateForm({ ...advocateForm, experience_years: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="adv_about">About *</Label>
                <Textarea
                  id="adv_about"
                  value={advocateForm.about}
                  onChange={(e) => setAdvocateForm({ ...advocateForm, about: e.target.value })}
                  rows={4}
                  required
                  placeholder="Professional bio and background"
                />
              </div>
              <div className="space-y-2">
                <Label>Specializations (comma-separated)</Label>
                <Input
                  value={Array.isArray(advocateForm.specializations) ? advocateForm.specializations.join(', ') : advocateForm.specializations}
                  onChange={(e) => setAdvocateForm({ 
                    ...advocateForm, 
                    specializations: e.target.value.split(',').map(s => s.trim()).filter(s => s) 
                  })}
                  placeholder="Medical Negligence, Healthcare Law, Criminal Law"
                />
              </div>
              <div className="space-y-2">
                <Label>Areas of Operation (comma-separated)</Label>
                <Input
                  value={Array.isArray(advocateForm.areas_of_operation) ? advocateForm.areas_of_operation.join(', ') : advocateForm.areas_of_operation}
                  onChange={(e) => setAdvocateForm({ 
                    ...advocateForm, 
                    areas_of_operation: e.target.value.split(',').map(s => s.trim()).filter(s => s) 
                  })}
                  placeholder="Haryana, Delhi, Punjab"
                />
              </div>
              <div className="space-y-2">
                <Label>Languages (comma-separated)</Label>
                <Input
                  value={Array.isArray(advocateForm.languages) ? advocateForm.languages.join(', ') : advocateForm.languages}
                  onChange={(e) => setAdvocateForm({ 
                    ...advocateForm, 
                    languages: e.target.value.split(',').map(s => s.trim()).filter(s => s) 
                  })}
                  placeholder="English, Hindi, Punjabi"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setAdvocateDialog({ open: false, advocate: null })}>
                Cancel
              </Button>
              <Button type="submit" className="bg-primary">Save Changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Admin;
