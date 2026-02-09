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
  Scale
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
  const { user, getAuthHeader, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [stories, setStories] = useState([]);
  const [grants, setGrants] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [storiesRes, grantsRes] = await Promise.all([
        axios.get(`${API}/stories/my`, getAuthHeader()),
        axios.get(`${API}/grants/my`, getAuthHeader())
      ]);
      setStories(storiesRes.data);
      setGrants(grantsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load your data');
    } finally {
      setLoading(false);
    }
  }, [getAuthHeader]);

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
      await axios.delete(`${API}/stories/${storyId}`, getAuthHeader());
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

  return (
    <div className="min-h-screen bg-slate-50" data-testid="dashboard-page">
      {/* Header */}
      <div className="bg-primary text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
            <div className="flex gap-3">
              <Link to="/apply-grant" data-testid="apply-grant-btn">
                <Button variant="outline" className="border-white text-white hover:bg-white/10">
                  <IndianRupee className="h-4 w-4 mr-2" />
                  Apply for Grant
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
            { label: 'Grants Pending', value: stats.grantsPending, icon: <IndianRupee className="h-5 w-5" />, color: 'text-amber-600' },
            { label: 'Grants Approved', value: stats.grantsApproved, icon: <IndianRupee className="h-5 w-5" />, color: 'text-green-600' }
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
        <h2 className="font-serif text-xl font-bold text-primary mb-6 mt-12">Your Grant Applications</h2>
        
        {grants.length === 0 ? (
          <Card className="border-slate-200" data-testid="no-grants-card">
            <CardContent className="p-8 text-center">
              <IndianRupee className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <h3 className="font-serif text-lg font-bold text-primary mb-2">
                No Grant Applications
              </h3>
              <p className="text-slate-500 mb-4 text-sm">
                If you need financial support for your legal case, apply for a grant.
              </p>
              <Link to="/apply-grant">
                <Button variant="outline" className="border-primary text-primary">
                  Apply for Grant
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
                        <p className="text-sm text-green-600 mt-2 bg-green-50 p-2 border-l-2 border-green-600">
                          Approved Amount: ₹{grant.amount_approved.toLocaleString('en-IN')}
                        </p>
                      )}
                      {grant.admin_notes && grant.status === 'rejected' && (
                        <p className="text-sm text-red-600 mt-2 bg-red-50 p-2 border-l-2 border-red-600">
                          Note: {grant.admin_notes}
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
