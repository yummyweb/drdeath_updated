import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import {
  Plus,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Edit,
  Trash2,
  User,
  IndianRupee,
  Scale,
  Bell,
  AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../components/ui/alert-dialog';
import { getApiUrl } from '@/config/env';

const API = getApiUrl();

const Dashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [stories, setStories] = useState([]);
  const [grants, setGrants] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [storiesRes, grantsRes] = await Promise.all([
        axios.get(`${API}/stories/my`),
        axios.get(`${API}/grants/my`)
      ]);
      setStories(storiesRes.data);
      setGrants(grantsRes.data);
    } catch (error) {
      toast.error('Failed to load your data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
      return;
    }

    if (user) {
      fetchData();
    }
  }, [user, authLoading, navigate, fetchData]);

  const handleDelete = async (storyId) => {
    try {
      await axios.delete(`${API}/stories/${storyId}`);
      setStories(prev => prev.filter(s => s.id !== storyId));
      toast.success('Story deleted successfully');
    } catch (error) {
      console.error('Error deleting story:', error);
      toast.error('Failed to delete story');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return (
          <Badge className="status-approved">
            <CheckCircle className="h-3 w-3 mr-1" />
            Approved
          </Badge>
        );
      case 'rejected':
        return (
          <Badge className="status-rejected">
            <XCircle className="h-3 w-3 mr-1" />
            Rejected
          </Badge>
        );
      default:
        return (
          <Badge className="status-pending">
            <Clock className="h-3 w-3 mr-1" />
            Pending Review
          </Badge>
        );
    }
  };

  const stats = {
    total: stories.length,
    pending: stories.filter(s => s.status === 'pending').length,
    approved: stories.filter(s => s.status === 'approved').length,
    rejected: stories.filter(s => s.status === 'rejected').length,
    grantsPending: grants.filter(g => g.status === 'pending').length,
    grantsApproved: grants.filter(g => g.status === 'approved').length
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-slate-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const actionedGrants = grants.filter(g => g.status === 'approved' || g.status === 'rejected');

  return (
    <div className="min-h-screen bg-slate-50" data-testid="dashboard-page">

      {/* Email verification nudge */}
      {user && user.email_verified === false && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-3 flex items-center gap-3">
          <Bell className="h-4 w-4 text-amber-600 flex-shrink-0" />
          <p className="text-sm text-amber-800 flex-1">
            <strong>Verify your email</strong> to submit stories and apply for Legal Aid.
          </p>
          <Link to="/verify-otp" className="flex-shrink-0 text-xs font-bold bg-amber-400 hover:bg-amber-300 text-slate-900 px-3 py-1.5 rounded-md transition-colors">
            Verify Now →
          </Link>
        </div>
      )}

      {/* Status-change notification banners */}
      {actionedGrants.length > 0 && (
        <div className="space-y-0">
          {actionedGrants.map(grant => (
            <div
              key={grant.id}
              className={`px-4 py-4 border-b flex items-start gap-4 ${
                grant.status === 'approved'
                  ? 'bg-green-50 border-green-200'
                  : 'bg-red-50 border-red-200'
              }`}
            >
              <div className={`flex-shrink-0 mt-0.5 ${grant.status === 'approved' ? 'text-green-600' : 'text-red-500'}`}>
                {grant.status === 'approved'
                  ? <CheckCircle className="h-5 w-5" />
                  : <AlertTriangle className="h-5 w-5" />
                }
              </div>
              <div className="flex-1 min-w-0">
                <p className={`font-semibold text-sm ${grant.status === 'approved' ? 'text-green-800' : 'text-red-800'}`}>
                  {grant.status === 'approved'
                    ? '✓ Your Legal Aid application has been approved'
                    : '✗ Your Legal Aid application was not approved'
                  }
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Application: {grant.case_type} —{' '}
                  {grant.moderated_at
                    ? `Reviewed on ${new Date(grant.moderated_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}`
                    : `Submitted ${new Date(grant.created_at).toLocaleDateString('en-IN')}`
                  }
                  {grant.moderated_by ? ` by ${grant.moderated_by}` : ''}
                </p>
                {grant.status === 'approved' && grant.amount_approved && (
                  <p className="text-sm font-semibold text-green-700 mt-1">
                    Approved assistance: ₹{grant.amount_approved.toLocaleString('en-IN')}
                  </p>
                )}
                {grant.admin_notes && (
                  <p className="text-sm text-slate-700 mt-1 italic">
                    "{grant.admin_notes}"
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Header */}
      <div className="bg-primary text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Back to site */}
          <Link to="/" className="inline-flex items-center gap-1.5 text-slate-400 hover:text-white text-xs font-medium mb-4 transition-colors">
            ← Back to VOICE
          </Link>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <User className="h-6 w-6 text-secondary" />
                <p className="font-mono text-xs uppercase tracking-widest text-secondary">
                  Dashboard
                </p>
              </div>
              <h1 className="font-serif text-2xl md:text-3xl font-bold">
                Welcome, {user?.full_name}
              </h1>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link to="/">
                <Button variant="outline" className="border-white/30 text-white hover:bg-white/10 text-xs">
                  🏠 Home
                </Button>
              </Link>
              <Link to="/apply-grant" data-testid="apply-grant-btn">
                <Button variant="outline" className="border-white text-white hover:bg-white/10">
                  <IndianRupee className="h-4 w-4 mr-2" />
                  Apply for Legal Aid
                </Button>
              </Link>
              <Link to="/submit-story" data-testid="submit-story-btn">
                <Button className="bg-secondary hover:bg-amber-700 text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Submit New Story
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { label: 'Stories', value: stats.total, icon: <FileText className="h-5 w-5" /> },
            { label: 'Pending', value: stats.pending, icon: <Clock className="h-5 w-5" />, color: 'text-amber-600' },
            { label: 'Approved', value: stats.approved, icon: <CheckCircle className="h-5 w-5" />, color: 'text-green-600' },
            { label: 'Rejected', value: stats.rejected, icon: <XCircle className="h-5 w-5" />, color: 'text-red-600' },
            { label: 'Legal Aid Pending', value: stats.grantsPending, icon: <IndianRupee className="h-5 w-5" />, color: 'text-amber-600' },
            { label: 'Legal Aid Approved', value: stats.grantsApproved, icon: <IndianRupee className="h-5 w-5" />, color: 'text-green-600' }
          ].map((stat, index) => (
            <Card key={index} className="border-slate-200" data-testid={`stat-${stat.label.toLowerCase().replace(' ', '-')}`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wide">{stat.label}</p>
                    <p className={`text-2xl font-bold ${stat.color || 'text-primary'}`}>{stat.value}</p>
                  </div>
                  <div className={stat.color || 'text-slate-400'}>{stat.icon}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Stories List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="font-serif text-xl font-bold text-primary mb-6">Your Stories</h2>

        {stories.length === 0 ? (
          <Card className="border-slate-200" data-testid="no-stories-card">
            <CardContent className="p-12 text-center">
              <FileText className="h-16 w-16 text-slate-300 mx-auto mb-4" />
              <h3 className="font-serif text-xl font-bold text-primary mb-2">
                No Stories Yet
              </h3>
              <p className="text-slate-500 mb-6">
                Share your experience to help raise awareness and support others.
              </p>
              <Link to="/submit-story">
                <Button className="bg-primary hover:bg-slate-800">
                  <Plus className="h-4 w-4 mr-2" />
                  Submit Your First Story
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {stories.map((story) => (
              <Card key={story.id} className="border-slate-200 case-file-card" data-testid={`story-card-${story.id}`}>
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {getStatusBadge(story.status)}
                        <span className="text-xs text-slate-400">
                          {new Date(story.created_at).toLocaleDateString('en-IN')}
                        </span>
                      </div>
                      <h3 className="font-serif text-lg font-bold text-primary mb-1">
                        {story.title}
                      </h3>
                      <p className="text-sm text-slate-500">
                        {story.hospital_name} • {story.location}
                      </p>
                      {story.admin_notes && story.status === 'rejected' && (
                        <p className="text-sm text-red-600 mt-2 bg-red-50 p-2 border-l-2 border-red-600">
                          Admin Note: {story.admin_notes}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {story.status === 'approved' && (
                        <Link to={`/stories/${story.id}`}>
                          <Button variant="outline" size="sm" className="border-slate-300" data-testid={`view-story-${story.id}`}>
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </Link>
                      )}
                      <Link to={`/edit-story/${story.id}`}>
                        <Button variant="outline" size="sm" className="border-slate-300" data-testid={`edit-story-${story.id}`}>
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                      </Link>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm" className="border-red-300 text-red-600 hover:bg-red-50" data-testid={`delete-story-${story.id}`}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Story</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this story? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(story.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Grant Applications */}
        <h2 className="font-serif text-xl font-bold text-primary mb-6 mt-12">Your Legal Aid Applications</h2>
        
        {grants.length === 0 ? (
          <Card className="border-slate-200" data-testid="no-grants-card">
            <CardContent className="p-8 text-center">
              <IndianRupee className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <h3 className="font-serif text-lg font-bold text-primary mb-2">
                No Legal Aid Applications
              </h3>
              <p className="text-slate-500 mb-4 text-sm">
                If you need financial support for your legal case, apply for legal aid.
              </p>
              <Link to="/apply-grant">
                <Button variant="outline" className="border-primary text-primary">
                  Apply for Legal Aid
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {grants.map((grant) => (
              <Card key={grant.id} className="border-slate-200" data-testid={`grant-card-${grant.id}`}>
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {getStatusBadge(grant.status)}
                        <span className="text-xs text-slate-400">
                          {new Date(grant.created_at).toLocaleDateString('en-IN')}
                        </span>
                      </div>
                      <h3 className="font-serif text-lg font-bold text-primary mb-1">
                        {grant.case_type} - ₹{grant.amount_required.toLocaleString('en-IN')}
                      </h3>
                      <p className="text-sm text-slate-500">
                        {grant.purpose_of_funding} • {grant.current_stage}
                      </p>
                      {grant.status === 'approved' && grant.amount_approved && (
                        <p className="text-sm text-green-700 mt-2 bg-green-50 p-2 rounded border-l-2 border-green-500">
                          Approved assistance: ₹{grant.amount_approved.toLocaleString('en-IN')}
                        </p>
                      )}
                      {grant.admin_notes && (
                        <p className={`text-sm mt-2 p-2 rounded border-l-2 ${
                          grant.status === 'rejected'
                            ? 'text-red-700 bg-red-50 border-red-400'
                            : 'text-slate-700 bg-slate-50 border-slate-300'
                        }`}>
                          Admin note: {grant.admin_notes}
                        </p>
                      )}
                      {grant.moderated_at && (
                        <p className="text-xs text-slate-400 mt-1">
                          Reviewed {new Date(grant.moderated_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          {grant.moderated_by ? ` · ${grant.moderated_by}` : ''}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Find Advocates CTA */}
        <Card className="border-slate-200 bg-accent/5 mt-8" data-testid="advocates-cta">
          <CardContent className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Scale className="h-10 w-10 text-accent" />
              <div>
                <h3 className="font-serif font-bold text-primary">Need Legal Help?</h3>
                <p className="text-sm text-slate-600">Connect with pro bono advocates in your area</p>
              </div>
            </div>
            <Link to="/advocates">
              <Button className="bg-accent hover:bg-teal-700 text-white">
                Find Advocates
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
