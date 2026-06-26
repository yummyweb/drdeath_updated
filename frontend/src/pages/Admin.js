import AdminResources from './AdminResources';
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
  const { user, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [stories, setStories] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [advocates, setAdvocates]   = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [doctors, setDoctors]           = useState([]);
  const [journalists, setJournalists]   = useState([]);
  const [researchers, setResearchers]   = useState([]);
  const [grants, setGrants] = useState([]);
  const [merchandise, setMerchandise] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  
  const handleTabChange = useCallback((value) => {
    setActiveTab(value);
  }, []);
  const [expandedStory, setExpandedStory] = useState(null);
  const [expandedGrant, setExpandedGrant] = useState(null);
  const [moderationDialog, setModerationDialog] = useState({ open: false, item: null, action: null, type: null });
  const [merchandiseDialog, setMerchandiseDialog] = useState({ open: false, item: null });
  const [advocateDialog, setAdvocateDialog] = useState({ open: false, advocate: null });
  const [confirmMerchDelete, setConfirmMerchDelete] = useState(null);
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
      const [statsRes, storiesRes, contactsRes, advocatesRes, grantsRes, merchRes, ordersRes, volunteersRes, doctorsRes, journalistsRes, researchersRes] = await Promise.all([
        axios.get(`${API}/admin/stats`),
        axios.get(`${API}/admin/stories`),
        axios.get(`${API}/admin/contacts`),
        axios.get(`${API}/admin/advocates`),
        axios.get(`${API}/admin/grants`),
        axios.get(`${API}/admin/merchandise`),
        axios.get(`${API}/admin/orders`),
        axios.get(`${API}/admin/volunteers`),
        axios.get(`${API}/admin/doctors`),
        axios.get(`${API}/admin/journalists`),
        axios.get(`${API}/admin/researchers`),
      ]);
      setStats(statsRes.data);
      setStories(storiesRes.data.data ?? storiesRes.data);
      setContacts(contactsRes.data.data ?? contactsRes.data);
      setAdvocates(advocatesRes.data.data ?? advocatesRes.data);
      setGrants(grantsRes.data.data ?? grantsRes.data);
      setMerchandise(merchRes.data);
      setOrders(ordersRes.data);
      setVolunteers(volunteersRes.data.data ?? volunteersRes.data);
      setDoctors(doctorsRes.data.data ?? doctorsRes.data);
      setJournalists(journalistsRes.data.data ?? journalistsRes.data);
      setResearchers(researchersRes.data.data ?? researchersRes.data);
    } catch (error) {
      console.error('Error fetching admin data:', error);
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  }, []);

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

      await axios.put(endpoint, body);

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
      const statsRes = await axios.get(`${API}/admin/stats`);
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

      {/* Merchandise delete confirmation */}
      {confirmMerchDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full mx-4">
            <h3 className="font-semibold text-slate-900 mb-2">Delete Item?</h3>
            <p className="text-sm text-slate-600 mb-5">
              <span className="font-medium">"{confirmMerchDelete.name}"</span> will be permanently deleted.
            </p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setConfirmMerchDelete(null)}
                className="px-4 py-2 text-sm border border-slate-300 rounded-md text-slate-600 hover:bg-slate-50">
                Cancel
              </button>
              <button onClick={async () => {
                const item = confirmMerchDelete;
                setConfirmMerchDelete(null);
                try {
                  await axios.delete(`${API}/merchandise/${item.id}`);
                  toast.success('Item deleted');
                  fetchData();
                } catch { toast.error('Failed to delete item'); }
              }} className="px-4 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

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

      {/* Top stats strip */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
            {stats && [
              { label: 'Registered Users',    value: stats.total_users,           color: 'text-slate-800' },
              { label: 'Pending Stories',      value: stats.pending_stories,       color: 'text-amber-600' },
              { label: 'Pending Registrations',value: (stats.pending_volunteers||0)+(stats.pending_doctors||0)+(stats.pending_journalists||0)+(stats.pending_researchers||0)+(stats.pending_advocates||0), color: 'text-amber-600' },
              { label: 'Pending Legal Aid',       value: stats.pending_grants,        color: 'text-amber-600' },
              { label: 'Upcoming Events',      value: stats.upcoming_events,       color: 'text-blue-600' },
              { label: 'Live Opportunities',   value: stats.published_opportunities,color: 'text-green-600' },
              { label: 'Actions Needed',       value: stats.total_pending_actions, color: stats.total_pending_actions > 0 ? 'text-red-600' : 'text-green-600' },
            ].map((s, i) => (
              <div key={i} className="text-center" data-testid={`admin-stat-${i}`}>
                <p className={`text-2xl font-bold ${s.color}`}>{s.value ?? '–'}</p>
                <p className="text-xs text-slate-500 mt-0.5 leading-tight">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="mb-6 w-full overflow-x-auto whitespace-nowrap bg-slate-200 p-1">
            <TabsTrigger value="overview" data-testid="tab-overview" className="cursor-pointer">
              Overview
            </TabsTrigger>
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

<TabsTrigger value="resources" data-testid="tab-resources" className="cursor-pointer">
  Resources
</TabsTrigger>
            <TabsTrigger value="volunteers" data-testid="tab-volunteers" className="cursor-pointer">
              Volunteers ({volunteers.filter(v => v.status === 'pending').length || 0})
            </TabsTrigger>
            <TabsTrigger value="doctors" data-testid="tab-doctors" className="cursor-pointer">
              Doctors ({doctors.filter(d => d.status === 'pending').length || 0})
            </TabsTrigger>
            <TabsTrigger value="journalists" data-testid="tab-journalists" className="cursor-pointer">
              Journalists ({journalists.filter(j => j.status === 'pending').length || 0})
            </TabsTrigger>
            <TabsTrigger value="researchers" data-testid="tab-researchers" className="cursor-pointer">
              Researchers ({researchers.filter(r => r.status === 'pending').length || 0})
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="space-y-6">
              {/* Pending actions summary */}
              {stats && stats.total_pending_actions > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <p className="font-semibold text-amber-800 mb-3 text-sm">
                    {stats.total_pending_actions} item{stats.total_pending_actions !== 1 ? 's' : ''} need your attention
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { label: 'Stories',     count: stats.pending_stories,     tab: 'pending' },
                      { label: 'Advocates',   count: stats.pending_advocates,   tab: 'advocates' },
                      { label: 'Volunteers',  count: stats.pending_volunteers,  tab: 'volunteers' },
                      { label: 'Doctors',     count: stats.pending_doctors,     tab: 'doctors' },
                      { label: 'Journalists', count: stats.pending_journalists, tab: 'journalists' },
                      { label: 'Researchers', count: stats.pending_researchers, tab: 'researchers' },
                      { label: 'Legal Aid',      count: stats.pending_grants,      tab: 'grants' },
                    ].filter(x => x.count > 0).map(x => (
                      <button key={x.tab} onClick={() => handleTabChange(x.tab)}
                        className="text-xs bg-amber-100 text-amber-800 border border-amber-300 px-3 py-1.5 rounded-full hover:bg-amber-200 font-medium">
                        {x.label}: {x.count} pending
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Module cards */}
              <div>
                <h2 className="font-semibold text-slate-700 text-sm uppercase tracking-wide mb-3">Platform Modules</h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {[
                    { title: 'Opportunities', desc: 'Jobs, internships, fellowships', href: '/admin/opportunities', stats: `${stats?.published_opportunities ?? 0} live` },
                    { title: 'Events', desc: 'Conferences, webinars, workshops', href: '/admin/events', stats: `${stats?.upcoming_events ?? 0} upcoming` },
                    { title: 'Resources', desc: 'Legal resource library', href: null, tab: 'resources', stats: 'Manage' },
                    { title: 'Stories', desc: 'Patient stories moderation', href: null, tab: 'pending', stats: `${stats?.pending_stories ?? 0} pending` },
                    { title: 'Legal Aid', desc: 'Legal aid applications', href: null, tab: 'grants', stats: `${stats?.pending_grants ?? 0} pending` },
                    { title: 'Site Settings', desc: 'Platform configuration', href: '/admin/settings', stats: 'Configure' },
                  ].map(m => (
                    m.href ? (
                      <a key={m.title} href={m.href}
                        className="block bg-white border border-slate-200 rounded-xl p-4 hover:shadow-sm hover:border-slate-300 transition-all">
                        <p className="font-semibold text-slate-900 text-sm">{m.title}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{m.desc}</p>
                        <p className="text-xs text-slate-400 mt-2 font-medium">{m.stats}</p>
                      </a>
                    ) : (
                      <button key={m.title} onClick={() => handleTabChange(m.tab)}
                        className="block text-left w-full bg-white border border-slate-200 rounded-xl p-4 hover:shadow-sm hover:border-slate-300 transition-all">
                        <p className="font-semibold text-slate-900 text-sm">{m.title}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{m.desc}</p>
                        <p className="text-xs text-slate-400 mt-2 font-medium">{m.stats}</p>
                      </button>
                    )
                  ))}
                </div>
              </div>

              {/* Community registrations summary */}
              <div>
                <h2 className="font-semibold text-slate-700 text-sm uppercase tracking-wide mb-3">Community Registrations</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                  {[
                    { label: 'Advocates',   total: stats?.total_advocates,   pending: stats?.pending_advocates,   tab: 'advocates' },
                    { label: 'Volunteers',  total: stats?.total_volunteers,  pending: stats?.pending_volunteers,  tab: 'volunteers' },
                    { label: 'Doctors',     total: stats?.total_doctors,     pending: stats?.pending_doctors,     tab: 'doctors' },
                    { label: 'Journalists', total: stats?.total_journalists, pending: stats?.pending_journalists, tab: 'journalists' },
                    { label: 'Researchers', total: stats?.total_researchers, pending: stats?.pending_researchers, tab: 'researchers' },
                  ].map(m => (
                    <button key={m.label} onClick={() => handleTabChange(m.tab)}
                      className="bg-white border border-slate-200 rounded-xl p-4 text-left hover:shadow-sm hover:border-slate-300 transition-all">
                      <p className="text-2xl font-bold text-slate-900">{m.total ?? 0}</p>
                      <p className="text-xs text-slate-600 font-medium">{m.label}</p>
                      {m.pending > 0 && (
                        <p className="text-xs text-amber-600 mt-1">{m.pending} pending</p>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

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
            <div className="space-y-4">
              {!advocates || advocates.length === 0 ? (
                <Card className="border-slate-200">
                  <CardContent className="p-12 text-center text-slate-400">
                    No advocate registrations yet.
                  </CardContent>
                </Card>
              ) : (
                advocates.map(advocate => (
                  <Card key={advocate._id || advocate.id} className="border-slate-200" data-testid={`advocate-${advocate.id}`}>
                    <CardContent className="p-5">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <span className="font-semibold text-slate-900">{advocate.full_name}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                              advocate.status === 'approved' ? 'bg-green-100 text-green-700' :
                              advocate.status === 'rejected' ? 'bg-red-100 text-red-600' :
                              'bg-amber-100 text-amber-700'
                            }`}>{advocate.status}</span>
                            {advocate.verified && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Verified</span>}
                            {advocate.featured && <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Featured</span>}
                          </div>
                          <p className="text-sm text-slate-500">{advocate.email} · {advocate.phone}{advocate.city ? ` · ${advocate.city}` : ''}{advocate.state ? `, ${advocate.state}` : ''}</p>
                          <p className="text-xs text-slate-500 mt-0.5">Bar Council: {advocate.bar_council_number} · {advocate.experience_years} yrs exp</p>
                          {advocate.specializations?.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {advocate.specializations.map((s, i) => <Badge key={i} variant="secondary" className="text-xs">{s}</Badge>)}
                            </div>
                          )}
                          {advocate.areas_of_operation?.length > 0 && (
                            <p className="text-xs text-slate-400 mt-0.5">Areas: {advocate.areas_of_operation.slice(0, 5).join(', ')}</p>
                          )}
                          {advocate.languages?.length > 0 && <p className="text-xs text-slate-400 mt-0.5">Languages: {advocate.languages.join(', ')}</p>}
                          {advocate.about && <p className="text-sm text-slate-700 mt-2 line-clamp-2">{advocate.about}</p>}
                          {advocate.admin_notes && <p className="text-xs text-slate-400 mt-1 italic">Note: {advocate.admin_notes}</p>}
                        </div>
                        <div className="flex flex-col gap-2 flex-shrink-0">
                          <div className="flex gap-2">
                            {advocate.status !== 'approved' && (
                              <button
                                onClick={() => setModerationDialog({ open: true, item: advocate, action: 'approved', type: 'advocate' })}
                                className="px-3 py-1.5 text-xs bg-green-600 text-white rounded-md hover:bg-green-700"
                                data-testid={`approve-advocate-${advocate.id}`}
                              >Approve</button>
                            )}
                            {advocate.status !== 'rejected' && (
                              <button
                                onClick={() => setModerationDialog({ open: true, item: advocate, action: 'rejected', type: 'advocate' })}
                                className="px-3 py-1.5 text-xs border border-red-300 text-red-600 rounded-md hover:bg-red-50"
                                data-testid={`reject-advocate-${advocate.id}`}
                              >Reject</button>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={async () => {
                                try {
                                  const res = await axios.put(`${API}/admin/advocates/${advocate._id}/verify`);
                                  setAdvocates(prev => prev.map(x => x._id === advocate._id ? { ...x, verified: res.data.verified } : x));
                                } catch { toast.error('Failed to update'); }
                              }}
                              className="px-3 py-1.5 text-xs border border-blue-300 text-blue-600 rounded-md hover:bg-blue-50"
                            >{advocate.verified ? 'Unverify' : 'Verify'}</button>
                            <button
                              onClick={async () => {
                                try {
                                  await axios.delete(`${API}/admin/advocates/${advocate._id}`);
                                  setAdvocates(prev => prev.filter(x => x._id !== advocate._id));
                                } catch { toast.error('Failed to delete'); }
                              }}
                              className="px-3 py-1.5 text-xs border border-slate-200 text-slate-500 rounded-md hover:bg-slate-50"
                            >Delete</button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Legal Aid Tab */}
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
                          onClick={() => setConfirmMerchDelete(item)}
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
                                  await axios.put(`${API}/admin/orders/${order.id}/status`, { status: 'confirmed' });
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
                                  await axios.put(`${API}/admin/orders/${order.id}/status`, { status: 'cancelled' });
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
                                await axios.put(`${API}/admin/orders/${order.id}/status`, { status: 'shipped' });
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
                                await axios.put(`${API}/admin/orders/${order.id}/status`, { status: 'delivered' });
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
<TabsContent value="resources">
  <AdminResources />
</TabsContent>

          {/* Volunteers Tab */}
          <TabsContent value="volunteers">
            <div className="space-y-4">
              {volunteers.length === 0 ? (
                <Card className="border-slate-200">
                  <CardContent className="p-12 text-center text-slate-400">
                    No volunteer registrations yet.
                  </CardContent>
                </Card>
              ) : (
                volunteers.map(v => (
                  <Card key={v._id} className="border-slate-200">
                    <CardContent className="p-5">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <span className="font-semibold text-slate-900">{v.full_name}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                              v.status === 'approved' ? 'bg-green-100 text-green-700' :
                              v.status === 'rejected' ? 'bg-red-100 text-red-600' :
                              'bg-amber-100 text-amber-700'
                            }`}>{v.status}</span>
                            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{v.category}</span>
                            {v.verified && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Verified</span>}
                            {v.featured && <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Featured</span>}
                          </div>
                          <p className="text-sm text-slate-500">{v.email}{v.phone ? ` · ${v.phone}` : ''}{v.city ? ` · ${v.city}` : ''}</p>
                          {v.profession  && <p className="text-xs text-slate-500 mt-0.5">{v.profession}{v.institution ? ` · ${v.institution}` : ''}</p>}
                          {v.skills?.length > 0 && <p className="text-xs text-slate-400 mt-0.5">Skills: {v.skills.join(', ')}</p>}
                          {v.languages?.length > 0 && <p className="text-xs text-slate-400 mt-0.5">Languages: {v.languages.join(', ')}</p>}
                          {v.availability && <p className="text-xs text-slate-400 mt-0.5">Availability: {v.availability.replace('_', ' ')}</p>}
                          <p className="text-sm text-slate-700 mt-2 line-clamp-2">{v.how_can_help}</p>
                          {v.admin_notes && <p className="text-xs text-slate-400 mt-1 italic">Note: {v.admin_notes}</p>}
                        </div>
                        <div className="flex flex-col gap-2 flex-shrink-0">
                          <div className="flex gap-2">
                            {v.status !== 'approved' && (
                              <button
                                onClick={async () => {
                                  try {
                                    await axios.put(`${API}/admin/volunteers/${v._id}/moderate`, { status: 'approved' });
                                    setVolunteers(prev => prev.map(x => x._id === v._id ? { ...x, status: 'approved' } : x));
                                  } catch { toast.error('Failed to approve'); }
                                }}
                                className="px-3 py-1.5 text-xs bg-green-600 text-white rounded-md hover:bg-green-700"
                              >Approve</button>
                            )}
                            {v.status !== 'rejected' && (
                              <button
                                onClick={async () => {
                                  try {
                                    await axios.put(`${API}/admin/volunteers/${v._id}/moderate`, { status: 'rejected' });
                                    setVolunteers(prev => prev.map(x => x._id === v._id ? { ...x, status: 'rejected' } : x));
                                  } catch { toast.error('Failed to reject'); }
                                }}
                                className="px-3 py-1.5 text-xs border border-red-300 text-red-600 rounded-md hover:bg-red-50"
                              >Reject</button>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={async () => {
                                try {
                                  const res = await axios.put(`${API}/admin/volunteers/${v._id}/verify`);
                                  setVolunteers(prev => prev.map(x => x._id === v._id ? { ...x, verified: res.data.verified } : x));
                                } catch { toast.error('Failed to update'); }
                              }}
                              className="px-3 py-1.5 text-xs border border-blue-300 text-blue-600 rounded-md hover:bg-blue-50"
                            >{v.verified ? 'Unverify' : 'Verify'}</button>
                            <button
                              onClick={async () => {
                                try {
                                  await axios.delete(`${API}/admin/volunteers/${v._id}`);
                                  setVolunteers(prev => prev.filter(x => x._id !== v._id));
                                } catch { toast.error('Failed to delete'); }
                              }}
                              className="px-3 py-1.5 text-xs border border-slate-200 text-slate-500 rounded-md hover:bg-slate-50"
                            >Delete</button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Researchers Tab */}
          <TabsContent value="researchers">
            <div className="space-y-4">
              {researchers.length === 0 ? (
                <Card className="border-slate-200">
                  <CardContent className="p-12 text-center text-slate-400">
                    No researcher registrations yet.
                  </CardContent>
                </Card>
              ) : (
                researchers.map(r => (
                  <Card key={r._id} className="border-slate-200">
                    <CardContent className="p-5">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <span className="font-semibold text-slate-900">{r.full_name}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                              r.status === 'approved' ? 'bg-green-100 text-green-700' :
                              r.status === 'rejected' ? 'bg-red-100 text-red-600' :
                              'bg-amber-100 text-amber-700'
                            }`}>{r.status}</span>
                            {r.verified && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Verified</span>}
                            {r.featured && <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Featured</span>}
                            {r.open_to_collaborate && <span className="text-xs bg-green-50 text-green-600 px-2 py-0.5 rounded-full">Open to collaborate</span>}
                          </div>
                          <p className="text-sm text-slate-500">{r.email}{r.phone ? ` · ${r.phone}` : ''}</p>
                          {(r.designation || r.institution) && (
                            <p className="text-xs text-slate-500 mt-0.5">{[r.designation, r.institution, r.department].filter(Boolean).join(' · ')}</p>
                          )}
                          {r.qualification && <p className="text-xs text-slate-400 mt-0.5">{r.qualification}{r.experience_years ? ` · ${r.experience_years} yrs` : ''}</p>}
                          {r.research_domains?.length > 0 && <p className="text-xs text-slate-400 mt-0.5">Domains: {r.research_domains.join(', ')}</p>}
                          {r.languages?.length > 0 && <p className="text-xs text-slate-400 mt-0.5">Languages: {r.languages.join(', ')}</p>}
                          {r.how_can_help && <p className="text-sm text-slate-700 mt-2 line-clamp-2">{r.how_can_help}</p>}
                          {r.admin_notes && <p className="text-xs text-slate-400 mt-1 italic">Note: {r.admin_notes}</p>}
                        </div>
                        <div className="flex flex-col gap-2 flex-shrink-0">
                          <div className="flex gap-2">
                            {r.status !== 'approved' && (
                              <button
                                onClick={async () => {
                                  try {
                                    await axios.put(`${API}/admin/researchers/${r._id}/moderate`, { status: 'approved' });
                                    setResearchers(prev => prev.map(x => x._id === r._id ? { ...x, status: 'approved' } : x));
                                  } catch { toast.error('Failed to approve'); }
                                }}
                                className="px-3 py-1.5 text-xs bg-green-600 text-white rounded-md hover:bg-green-700"
                              >Approve</button>
                            )}
                            {r.status !== 'rejected' && (
                              <button
                                onClick={async () => {
                                  try {
                                    await axios.put(`${API}/admin/researchers/${r._id}/moderate`, { status: 'rejected' });
                                    setResearchers(prev => prev.map(x => x._id === r._id ? { ...x, status: 'rejected' } : x));
                                  } catch { toast.error('Failed to reject'); }
                                }}
                                className="px-3 py-1.5 text-xs border border-red-300 text-red-600 rounded-md hover:bg-red-50"
                              >Reject</button>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={async () => {
                                try {
                                  const res = await axios.put(`${API}/admin/researchers/${r._id}/verify`);
                                  setResearchers(prev => prev.map(x => x._id === r._id ? { ...x, verified: res.data.verified } : x));
                                } catch { toast.error('Failed to update'); }
                              }}
                              className="px-3 py-1.5 text-xs border border-blue-300 text-blue-600 rounded-md hover:bg-blue-50"
                            >{r.verified ? 'Unverify' : 'Verify'}</button>
                            <button
                              onClick={async () => {
                                try {
                                  await axios.delete(`${API}/admin/researchers/${r._id}`);
                                  setResearchers(prev => prev.filter(x => x._id !== r._id));
                                } catch { toast.error('Failed to delete'); }
                              }}
                              className="px-3 py-1.5 text-xs border border-slate-200 text-slate-500 rounded-md hover:bg-slate-50"
                            >Delete</button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Journalists Tab */}
          <TabsContent value="journalists">
            <div className="space-y-4">
              {journalists.length === 0 ? (
                <Card className="border-slate-200">
                  <CardContent className="p-12 text-center text-slate-400">
                    No journalist registrations yet.
                  </CardContent>
                </Card>
              ) : (
                journalists.map(j => (
                  <Card key={j._id} className="border-slate-200">
                    <CardContent className="p-5">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <span className="font-semibold text-slate-900">{j.full_name}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                              j.status === 'approved' ? 'bg-green-100 text-green-700' :
                              j.status === 'rejected' ? 'bg-red-100 text-red-600' :
                              'bg-amber-100 text-amber-700'
                            }`}>{j.status}</span>
                            {j.verified && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Verified</span>}
                            {j.featured && <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Featured</span>}
                          </div>
                          <p className="text-sm text-slate-500">{j.email}{j.phone ? ` · ${j.phone}` : ''}</p>
                          {(j.designation || j.publication) && (
                            <p className="text-xs text-slate-500 mt-0.5">{[j.designation, j.publication].filter(Boolean).join(' · ')}</p>
                          )}
                          {j.beats?.length > 0 && <p className="text-xs text-slate-400 mt-0.5">Beats: {j.beats.join(', ')}</p>}
                          {j.medium?.length > 0 && <p className="text-xs text-slate-400 mt-0.5">Medium: {j.medium.join(', ')}</p>}
                          {j.languages?.length > 0 && <p className="text-xs text-slate-400 mt-0.5">Languages: {j.languages.join(', ')}</p>}
                          {j.how_can_help && <p className="text-sm text-slate-700 mt-2 line-clamp-2">{j.how_can_help}</p>}
                          {j.admin_notes && <p className="text-xs text-slate-400 mt-1 italic">Note: {j.admin_notes}</p>}
                        </div>
                        <div className="flex flex-col gap-2 flex-shrink-0">
                          <div className="flex gap-2">
                            {j.status !== 'approved' && (
                              <button
                                onClick={async () => {
                                  try {
                                    await axios.put(`${API}/admin/journalists/${j._id}/moderate`, { status: 'approved' });
                                    setJournalists(prev => prev.map(x => x._id === j._id ? { ...x, status: 'approved' } : x));
                                  } catch { toast.error('Failed to approve'); }
                                }}
                                className="px-3 py-1.5 text-xs bg-green-600 text-white rounded-md hover:bg-green-700"
                              >Approve</button>
                            )}
                            {j.status !== 'rejected' && (
                              <button
                                onClick={async () => {
                                  try {
                                    await axios.put(`${API}/admin/journalists/${j._id}/moderate`, { status: 'rejected' });
                                    setJournalists(prev => prev.map(x => x._id === j._id ? { ...x, status: 'rejected' } : x));
                                  } catch { toast.error('Failed to reject'); }
                                }}
                                className="px-3 py-1.5 text-xs border border-red-300 text-red-600 rounded-md hover:bg-red-50"
                              >Reject</button>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={async () => {
                                try {
                                  const res = await axios.put(`${API}/admin/journalists/${j._id}/verify`);
                                  setJournalists(prev => prev.map(x => x._id === j._id ? { ...x, verified: res.data.verified } : x));
                                } catch { toast.error('Failed to update'); }
                              }}
                              className="px-3 py-1.5 text-xs border border-blue-300 text-blue-600 rounded-md hover:bg-blue-50"
                            >{j.verified ? 'Unverify' : 'Verify'}</button>
                            <button
                              onClick={async () => {
                                try {
                                  await axios.delete(`${API}/admin/journalists/${j._id}`);
                                  setJournalists(prev => prev.filter(x => x._id !== j._id));
                                } catch { toast.error('Failed to delete'); }
                              }}
                              className="px-3 py-1.5 text-xs border border-slate-200 text-slate-500 rounded-md hover:bg-slate-50"
                            >Delete</button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Doctors Tab */}
          <TabsContent value="doctors">
            <div className="space-y-4">
              {doctors.length === 0 ? (
                <Card className="border-slate-200">
                  <CardContent className="p-12 text-center text-slate-400">
                    No doctor registrations yet.
                  </CardContent>
                </Card>
              ) : (
                doctors.map(d => (
                  <Card key={d._id} className="border-slate-200">
                    <CardContent className="p-5">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <span className="font-semibold text-slate-900">{d.full_name}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                              d.status === 'approved' ? 'bg-green-100 text-green-700' :
                              d.status === 'rejected' ? 'bg-red-100 text-red-600' :
                              'bg-amber-100 text-amber-700'
                            }`}>{d.status}</span>
                            <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">{d.specialization}</span>
                            {d.verified && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Verified</span>}
                            {d.featured && <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Featured</span>}
                          </div>
                          <p className="text-sm text-slate-500">{d.email}{d.phone ? ` · ${d.phone}` : ''}{d.city ? ` · ${d.city}` : ''}{d.state ? `, ${d.state}` : ''}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{d.qualification} · {d.experience_years} yrs exp{d.hospital ? ` · ${d.hospital}` : ''}</p>
                          {d.medical_council_reg && <p className="text-xs text-slate-400 mt-0.5">Reg: {d.medical_council_reg}{d.medical_council_state ? ` (${d.medical_council_state})` : ''}</p>}
                          {d.research_interests?.length > 0 && <p className="text-xs text-slate-400 mt-0.5">Research: {d.research_interests.join(', ')}</p>}
                          {d.languages?.length > 0 && <p className="text-xs text-slate-400 mt-0.5">Languages: {d.languages.join(', ')}</p>}
                          {d.admin_notes && <p className="text-xs text-slate-400 mt-1 italic">Note: {d.admin_notes}</p>}
                        </div>
                        <div className="flex flex-col gap-2 flex-shrink-0">
                          <div className="flex gap-2">
                            {d.status !== 'approved' && (
                              <button
                                onClick={async () => {
                                  try {
                                    await axios.put(`${API}/admin/doctors/${d._id}/moderate`, { status: 'approved' });
                                    setDoctors(prev => prev.map(x => x._id === d._id ? { ...x, status: 'approved' } : x));
                                  } catch { toast.error('Failed to approve'); }
                                }}
                                className="px-3 py-1.5 text-xs bg-green-600 text-white rounded-md hover:bg-green-700"
                              >Approve</button>
                            )}
                            {d.status !== 'rejected' && (
                              <button
                                onClick={async () => {
                                  try {
                                    await axios.put(`${API}/admin/doctors/${d._id}/moderate`, { status: 'rejected' });
                                    setDoctors(prev => prev.map(x => x._id === d._id ? { ...x, status: 'rejected' } : x));
                                  } catch { toast.error('Failed to reject'); }
                                }}
                                className="px-3 py-1.5 text-xs border border-red-300 text-red-600 rounded-md hover:bg-red-50"
                              >Reject</button>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={async () => {
                                try {
                                  const res = await axios.put(`${API}/admin/doctors/${d._id}/verify`);
                                  setDoctors(prev => prev.map(x => x._id === d._id ? { ...x, verified: res.data.verified } : x));
                                } catch { toast.error('Failed to update'); }
                              }}
                              className="px-3 py-1.5 text-xs border border-blue-300 text-blue-600 rounded-md hover:bg-blue-50"
                            >{d.verified ? 'Unverify' : 'Verify'}</button>
                            <button
                              onClick={async () => {
                                try {
                                  await axios.delete(`${API}/admin/doctors/${d._id}`);
                                  setDoctors(prev => prev.filter(x => x._id !== d._id));
                                } catch { toast.error('Failed to delete'); }
                              }}
                              className="px-3 py-1.5 text-xs border border-slate-200 text-slate-500 rounded-md hover:bg-slate-50"
                            >Delete</button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
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
                await axios.put(`${API}/merchandise/${merchandiseDialog.item.id}`, data);
                toast.success('Item updated');
              } else {
                await axios.post(`${API}/merchandise`, data);
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
                }
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
