import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { 
  Search, 
  MapPin, 
  Clock, 
  Phone, 
  Mail,
  UserPlus,
  Scale,
  Languages,
  ArrowRight
} from 'lucide-react';
import { getApiUrl } from '@/config/env';

const API = getApiUrl();

const INDIAN_STATES = [
  'All Locations',
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Chandigarh'
];

const Advocates = () => {
  const [advocates, setAdvocates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('All Locations');

  useEffect(() => {
    fetchAdvocates();
  }, []);

  const fetchAdvocates = async (location = null, search = null) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (location && location !== 'All Locations') params.append('location', location);
      if (search) params.append('search', search);
      
      const response = await axios.get(`${API}/advocates?${params.toString()}`);
      setAdvocates(response.data);
    } catch (error) {
      console.error('Error fetching advocates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchAdvocates(
      selectedLocation !== 'All Locations' ? selectedLocation : null,
      searchTerm || null
    );
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div data-testid="advocates-page">
      {/* Hero Section */}
      <section className="relative py-20 bg-primary" data-testid="advocates-hero">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="max-w-2xl">
              <p className="font-mono text-xs uppercase tracking-[0.3em] text-secondary mb-4">
                Pro Bono Legal Support
              </p>
              <h1 className="font-serif text-4xl md:text-5xl font-bold text-white mb-6">
                Advocate Directory
              </h1>
              <p className="text-lg text-slate-300 leading-relaxed">
                Connect with experienced advocates who provide pro bono consultations 
                for medical negligence cases. All initial consultations are free.
              </p>
            </div>
            <Link to="/advocate-register" data-testid="register-advocate-btn">
              <Button className="bg-secondary hover:bg-amber-700 text-white">
                <UserPlus className="h-4 w-4 mr-2" />
                Register as Advocate
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Search & Filter Section */}
      <section className="py-8 bg-white border-b border-slate-200" data-testid="search-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                type="text"
                placeholder="Search by name or keyword..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={handleKeyPress}
                className="pl-10 bg-slate-50"
                data-testid="advocate-search-input"
              />
            </div>
            <Select value={selectedLocation} onValueChange={setSelectedLocation}>
              <SelectTrigger className="w-full md:w-48 bg-slate-50" data-testid="location-filter">
                <MapPin className="h-4 w-4 mr-2 text-slate-400" />
                <SelectValue placeholder="Location" />
              </SelectTrigger>
              <SelectContent>
                {INDIAN_STATES.map(state => (
                  <SelectItem key={state} value={state}>{state}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={handleSearch} className="bg-primary hover:bg-slate-800" data-testid="search-btn">
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </div>
        </div>
      </section>

      {/* Results Section */}
      <section className="py-12 bg-slate-50" data-testid="advocates-grid">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <p className="text-slate-600">
              {loading ? 'Loading...' : `${advocates.length} advocate${advocates.length !== 1 ? 's' : ''} found`}
            </p>
          </div>

          {loading ? (
            <div className="text-center py-20">
              <div className="spinner mx-auto mb-4"></div>
              <p className="text-slate-500">Loading advocates...</p>
            </div>
          ) : advocates.length === 0 ? (
            <div className="text-center py-20" data-testid="no-advocates">
              <Scale className="h-16 w-16 text-slate-300 mx-auto mb-4" />
              <h3 className="font-serif text-2xl font-bold text-primary mb-2">No Advocates Found</h3>
              <p className="text-slate-500 mb-6">
                Try adjusting your search filters or check back later.
              </p>
              <Link to="/advocate-register">
                <Button className="bg-secondary hover:bg-amber-700">
                  Register as Pro Bono Advocate
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {advocates.map((advocate) => (
                <Card key={advocate.id} className="border-slate-200 hover:shadow-lg transition-shadow" data-testid={`advocate-card-${advocate.id}`}>
                  <CardContent className="p-6">
                    {/* Header */}
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-16 h-16 bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Scale className="h-8 w-8 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-serif text-lg font-bold text-primary truncate">
                          {advocate.full_name}
                        </h3>
                        <p className="text-sm text-slate-500 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {advocate.experience_years} years experience
                        </p>
                      </div>
                    </div>

                    {/* Specializations */}
                    <div className="flex flex-wrap gap-1 mb-4">
                      {advocate.specializations.slice(0, 3).map((spec, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs bg-secondary/10 text-secondary border-0">
                          {spec}
                        </Badge>
                      ))}
                      {advocate.specializations.length > 3 && (
                        <Badge variant="secondary" className="text-xs bg-slate-100 text-slate-600 border-0">
                          +{advocate.specializations.length - 3}
                        </Badge>
                      )}
                    </div>

                    {/* About */}
                    <p className="text-sm text-slate-600 line-clamp-2 mb-4">
                      {advocate.about}
                    </p>

                    {/* Details */}
                    <div className="space-y-2 text-sm text-slate-500 mb-4">
                      <p className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-secondary" />
                        <span className="truncate">{advocate.areas_of_operation.slice(0, 3).join(', ')}</span>
                      </p>
                      <p className="flex items-center gap-2">
                        <Languages className="h-4 w-4 text-secondary" />
                        {advocate.languages.join(', ')}
                      </p>
                    </div>

                    {/* Contact */}
                    <div className="flex gap-2 pt-4 border-t border-slate-100">
                      <a href={`tel:${advocate.phone}`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full border-slate-300">
                          <Phone className="h-4 w-4 mr-1" />
                          Call
                        </Button>
                      </a>
                      <a href={`mailto:${advocate.email}`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full border-slate-300">
                          <Mail className="h-4 w-4 mr-1" />
                          Email
                        </Button>
                      </a>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-white" data-testid="advocates-cta">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-serif text-2xl md:text-3xl font-bold text-primary mb-4">
            Need Financial Support for Your Case?
          </h2>
          <p className="text-slate-600 mb-6">
            If you cannot afford legal expenses, apply for a grant from our foundation. 
            We support genuine victims of medical negligence.
          </p>
          <Link to="/apply-grant" data-testid="apply-grant-cta">
            <Button size="lg" className="bg-secondary hover:bg-amber-700 text-white uppercase tracking-widest font-bold">
              Apply for Grant
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Advocates;
