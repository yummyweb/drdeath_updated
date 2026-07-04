import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Scale, MapPin, Search, Clock, Languages, ArrowRight, UserPlus, Globe, Linkedin, BadgeCheck } from 'lucide-react';
import { getApiUrl } from '@/config/env';

const API = getApiUrl();

const STATES_CITIES = {
  'Andhra Pradesh': ['Visakhapatnam','Vijayawada','Guntur','Nellore','Kurnool','Tirupati','Rajahmundry','Kakinada','Kadapa','Anantapur','Vizianagaram','Eluru','Ongole','Nandyal','Machilipatnam','Adoni','Tenali','Proddatur','Chittoor','Hindupur','Bhimavaram','Madanapalle','Guntakal','Dharmavaram','Gudivada','Narasaraopet','Tadipatri','Tadepalligudem','Chilakaluripet','Yemmiganur'],
  'Arunachal Pradesh': ['Itanagar','Naharlagun','Pasighat','Tezpur','Bomdila','Ziro','Along','Tezu','Khonsa','Roing'],
  'Assam': ['Guwahati','Dibrugarh','Silchar','Jorhat','Nagaon','Tinsukia','Tezpur','Bongaigaon','Dhubri','Diphu','North Lakhimpur','Sivasagar','Goalpara','Barpeta','Karimganj','Hailakandi','Golaghat','Morigaon','Nalbari','Mangaldoi'],
  'Bihar': ['Patna','Gaya','Bhagalpur','Muzaffarpur','Purnia','Darbhanga','Arrah','Bihar Sharif','Begusarai','Katihar','Munger','Chhapra','Danapur','Bettiah','Saharsa','Sasaram','Hajipur','Dehri','Siwan','Motihari','Nawada','Bagaha','Buxar','Kishanganj','Sitamarhi','Jamalpur','Jehanabad','Aurangabad'],
  'Chhattisgarh': ['Raipur','Bhilai','Bilaspur','Durg','Korba','Rajnandgaon','Jagdalpur','Raigarh','Ambikapur','Mahasamund','Dhamtari','Chirmiri','Bhatapara','Naila Janjgir','Tilda Newra','Mungeli','Manendragarh','Sakti'],
  'Goa': ['Panaji','Margao','Vasco da Gama','Mapusa','Ponda','Bicholim','Curchorem','Sanquelim','Cuncolim','Quepem'],
  'Gujarat': ['Ahmedabad','Surat','Vadodara','Rajkot','Bhavnagar','Jamnagar','Gandhinagar','Junagadh','Anand','Navsari','Morbi','Nadiad','Surendranagar','Bharuch','Mehsana','Bhuj','Porbandar','Palanpur','Valsad','Vapi','Gondal','Veraval','Godhra','Patan','Kalol','Dahod','Botad','Amreli','Deesa','Jetpur'],
  'Haryana': ['Gurugram','Faridabad','Panipat','Ambala','Hisar','Rohtak','Karnal','Sonipat','Yamunanagar','Panchkula','Bhiwani','Bahadurgarh','Jind','Sirsa','Thanesar','Kaithal','Rewari','Palwal','Fatehabad','Gohana','Tohana','Narnaul','Mewat','Charkhi Dadri','Shahabad'],
  'Himachal Pradesh': ['Shimla','Dharamshala','Solan','Mandi','Kangra','Kullu','Hamirpur','Una','Nahan','Palampur','Baddi','Nalagarh','Sundarnagar','Paonta Sahib','Bilaspur','Chamba','Keylong'],
  'Jharkhand': ['Ranchi','Jamshedpur','Dhanbad','Bokaro','Hazaribagh','Deoghar','Phusro','Adityapur','Medininagar','Chaibasa','Chirkunda','Ramgarh','Giridih','Sindri','Baharagora','Simdega','Dumka','Pakur','Garhwa','Lohardaga'],
  'Karnataka': ['Bengaluru','Mysuru','Mangaluru','Hubballi','Belagavi','Kalaburagi','Ballari','Vijayapura','Shivamogga','Tumakuru','Davanagere','Bidar','Udupi','Hosapete','Hassan','Gadag-Betageri','Mandya','Chitradurga','Bagalkote','Robertsonpet','Bhadravati','Mudhol','Raichur','Ranebennuru','Ranibennuru','Dharwad','Hospet','Gangavati','Sirsi','Robertson Pet'],
  'Kerala': ['Thiruvananthapuram','Kochi','Kozhikode','Thrissur','Kollam','Kannur','Alappuzha','Palakkad','Malappuram','Thalassery','Kottayam','Irinjalakuda','Chalakudy','Kayamkulam','Punalur','Tirur','Kanhangad','Taliparamba','Kasaragod','Manjeri','Perinthalmanna','Nilambur','Varkala','Attingal','Neyyattinkara'],
  'Madhya Pradesh': ['Bhopal','Indore','Jabalpur','Gwalior','Ujjain','Sagar','Dewas','Satna','Ratlam','Rewa','Murwara','Singrauli','Burhanpur','Khandwa','Bhind','Chhindwara','Guna','Shivpuri','Vidisha','Chhatarpur','Damoh','Mandsaur','Khargone','Neemuch','Pithampur','Hoshangabad','Itarsi','Sehore','Mhow','Seoni'],
  'Maharashtra': ['Mumbai','Pune','Nagpur','Thane','Nashik','Aurangabad','Solapur','Amravati','Navi Mumbai','Kolhapur','Sangli','Malegaon','Jalgaon','Akola','Latur','Dhule','Ahmednagar','Chandrapur','Parbhani','Ichalkaranji','Jalna','Ambarnath','Bhiwandi','Shirdi','Nanded','Satara','Panvel','Mira-Bhayandar','Vasai-Virar','Bhusawal','Osmanabad','Ratnagiri','Wardha','Yavatmal','Beed'],
  'Manipur': ['Imphal','Thoubal','Bishnupur','Churachandpur','Senapati','Ukhrul','Chandel','Tamenglong'],
  'Meghalaya': ['Shillong','Tura','Nongstoin','Jowai','Baghmara','Williamnagar','Nongpoh'],
  'Mizoram': ['Aizawl','Lunglei','Champhai','Kolasib','Serchhip','Lawngtlai','Mamit','Saiha'],
  'Nagaland': ['Kohima','Dimapur','Mokokchung','Tuensang','Wokha','Zunheboto','Phek','Mon','Longleng'],
  'Odisha': ['Bhubaneswar','Cuttack','Rourkela','Berhampur','Sambalpur','Puri','Balasore','Bhadrak','Baripada','Jharsuguda','Bargarh','Paradip','Jeypore','Kendujhar','Sundargarh','Phulbani','Koraput','Nabarangpur','Rayagada','Balangir'],
  'Punjab': ['Ludhiana','Amritsar','Jalandhar','Patiala','Bathinda','Mohali','Pathankot','Hoshiarpur','Batala','Moga','Abohar','Malerkotla','Khanna','Phagwara','Muktsar','Barnala','Rajpura','Firozpur','Kapurthala','Nawanshahr','Tarn Taran','Gurdaspur','Ropar','Sangrur','Faridkot','Mansa','Fatehgarh Sahib'],
  'Rajasthan': ['Jaipur','Jodhpur','Udaipur','Kota','Ajmer','Bikaner','Alwar','Bhilwara','Bharatpur','Sikar','Pali','Sri Ganganagar','Sriganganagar','Jhunjhunu','Tonk','Beawar','Hanumangarh','Kishangarh','Baran','Dhaulpur','Gangapur City','Sawai Madhopur','Nagaur','Dungarpur','Pratapgarh','Barmer','Jaisalmer','Banswara','Dausa','Churu','Jhalawar'],
  'Sikkim': ['Gangtok','Namchi','Gyalshing','Mangan','Ravangla','Singtam'],
  'Tamil Nadu': ['Chennai','Coimbatore','Madurai','Tiruchirappalli','Salem','Tirunelveli','Erode','Vellore','Thoothukudi','Tiruppur','Ranipet','Dindigul','Thanjavur','Karur','Nagercoil','Kanchipuram','Kumbakonam','Cuddalore','Ambattur','Avadi','Hosur','Udhagamandalam','Pudukkottai','Rajapalayam','Sivakasi','Viluppuram','Namakkal','Perambalur','Ariyalur','Krishnagiri'],
  'Telangana': ['Hyderabad','Warangal','Nizamabad','Karimnagar','Khammam','Ramagundam','Mahbubnagar','Nalgonda','Mancherial','Adilabad','Suryapet','Miryalaguda','Siddipet','Jagtial','Vikarabad','Bhongir','Bodhan','Kamareddy','Sangareddy','Zahirabad','Gadwal','Tandur'],
  'Tripura': ['Agartala','Dharmanagar','Udaipur','Kailashahar','Belonia','Khowai','Ambassa','Sabroom','Sonamura'],
  'Uttar Pradesh': ['Lucknow','Kanpur','Agra','Varanasi','Meerut','Allahabad','Ghaziabad','Noida','Gorakhpur','Bareilly','Aligarh','Moradabad','Saharanpur','Firozabad','Jhansi','Muzaffarnagar','Mathura','Shahjahanpur','Rampur','Budaun','Hapur','Etawah','Mirzapur','Bulandshahr','Sambhal','Amroha','Hardoi','Fatehpur','Raebareli','Orai','Sitapur','Bahraich','Modinagar','Unnao','Jaunpur','Lakhimpur','Hathras','Banda','Pilibhit','Barabanki','Khurja','Gonda','Sultanpur','Faizabad','Ballia','Bijnor','Shikohabad','Lalitpur','Deoria','Azamgarh'],
  'Uttarakhand': ['Dehradun','Haridwar','Roorkee','Haldwani','Nainital','Rudrapur','Kashipur','Rishikesh','Kotdwar','Ramnagar','Pithoragarh','Almora','Bageshwar','Champawat','Uttarkashi','Tehri','Mussoorie','Srinagar'],
  'West Bengal': ['Kolkata','Howrah','Asansol','Siliguri','Durgapur','Bardhaman','Malda','Baharampur','Habra','Kharagpur','Shantipur','Dankuni','Dhulian','Ranaghat','Haldia','Raiganj','Krishnanagar','Nabadwip','Medinipur','Jalpaiguri','Balurghat','Basirhat','Bankura','Chakdaha','Darjeeling','Alipurduar','Purulia','Bally','Panihati'],
  'Delhi': ['New Delhi','Central Delhi','North Delhi','South Delhi','East Delhi','West Delhi','North East Delhi','North West Delhi','South East Delhi','South West Delhi','Dwarka','Rohini','Pitampura','Janakpuri','Laxmi Nagar','Preet Vihar','Shahdara','Saket','Vasant Kunj','Hauz Khas'],
  'Chandigarh': ['Chandigarh','Manimajra','Bapu Dham','Dhanas'],
};

const INDIAN_STATES = Object.keys(STATES_CITIES).sort();

function AdvocateCard({ a }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-sm transition-shadow" data-testid={`advocate-card-${a.id}`}>
      <div className="flex items-start gap-4">
        {a.photo_url ? (
          <img src={a.photo_url} alt={a.full_name} className="h-14 w-14 rounded-full object-cover flex-shrink-0" />
        ) : (
          <div className="h-14 w-14 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
            <Scale className="h-6 w-6 text-slate-400" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-0.5">
            <span className="font-semibold text-slate-900">{a.full_name}</span>
            {a.verified && <BadgeCheck className="h-4 w-4 text-blue-500 flex-shrink-0" title="Verified" />}
          </div>

          <p className="text-xs text-slate-500 flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {a.experience_years} yr{a.experience_years !== 1 ? 's' : ''} experience
          </p>

          {(a.city || a.state) && (
            <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
              <MapPin className="h-3 w-3" />
              {[a.city, a.state].filter(Boolean).join(', ')}
            </p>
          )}

          {a.specializations?.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {a.specializations.slice(0, 4).map(s => (
                <span key={s} className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded">{s}</span>
              ))}
              {a.specializations.length > 4 && (
                <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded">+{a.specializations.length - 4}</span>
              )}
            </div>
          )}

          {a.about && <p className="text-sm text-slate-600 mt-2 line-clamp-2">{a.about}</p>}

          {a.areas_of_operation?.length > 0 && (
            <p className="text-xs text-slate-400 mt-1 flex items-start gap-1">
              <MapPin className="h-3 w-3 mt-0.5 flex-shrink-0" />
              {a.areas_of_operation.slice(0, 3).join(', ')}{a.areas_of_operation.length > 3 ? ` +${a.areas_of_operation.length - 3}` : ''}
            </p>
          )}

          {a.languages?.length > 0 && (
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
              <Languages className="h-3 w-3" />
              {a.languages.join(', ')}
            </p>
          )}

          <div className="flex gap-3 mt-3">
            {a.linkedin && (
              <a href={a.linkedin} target="_blank" rel="noreferrer" className="text-blue-600 hover:text-blue-700">
                <Linkedin className="h-4 w-4" />
              </a>
            )}
            {a.website && (
              <a href={a.website} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-slate-600">
                <Globe className="h-4 w-4" />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const Advocates = () => {
  const [advocates, setAdvocates]     = useState([]);
  const [loading, setLoading]         = useState(true);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch]           = useState('');
  const [location, setLocation]       = useState('');
  const [city, setCity]               = useState('');

  const availableCities = location ? (STATES_CITIES[location] || []) : [];

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = { limit: 50 };
      if (search)   params.search   = search;
      if (location) params.location = location;
      if (city)     params.city     = city;
      const res = await axios.get(`${API}/advocates`, { params });
      setAdvocates(res.data.data ?? res.data);
    } catch {
      setAdvocates([]);
    } finally {
      setLoading(false);
    }
  }, [search, location, city]);

  useEffect(() => { load(); }, [load]);

  return (
    <div data-testid="advocates-page">

      {/* Hero */}
      <section className="bg-slate-900 text-white py-16 px-4" data-testid="advocates-hero">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div>
            <p className="text-xs font-mono uppercase tracking-widest text-amber-400 mb-2">Pro Bono Legal Support</p>
            <h1 className="text-4xl font-bold mb-2">Advocate Directory</h1>
            <p className="text-slate-300 max-w-xl">
              Connect with experienced advocates who provide pro bono consultations for medical negligence cases.
            </p>
          </div>
          <Link
            to="/advocate-register"
            className="bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold px-5 py-2.5 rounded-md text-sm flex items-center gap-2 whitespace-nowrap"
            data-testid="register-advocate-btn"
          >
            <UserPlus className="h-4 w-4" />
            Register as Advocate
          </Link>
        </div>
      </section>

      {/* Search */}
      <section className="bg-white border-b border-slate-200 py-4 px-4" data-testid="search-section">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row gap-3">
          <form
            className="flex gap-2 flex-1"
            onSubmit={e => { e.preventDefault(); setSearch(searchInput); }}
          >
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name or keyword…"
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                className="w-full pl-9 border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                data-testid="advocate-search-input"
              />
            </div>
            <button type="submit" className="px-4 py-2 bg-slate-900 text-white rounded-md text-sm hover:bg-slate-700">
              Search
            </button>
          </form>

          <select
            value={location}
            onChange={e => { setLocation(e.target.value); setCity(''); }}
            className="border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
            data-testid="location-filter"
          >
            <option value="">All States</option>
            {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>

          {availableCities.length > 0 && (
            <select
              value={city}
              onChange={e => setCity(e.target.value)}
              className="border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
              data-testid="city-filter"
            >
              <option value="">All Cities</option>
              {availableCities.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          )}
        </div>
      </section>

      {/* Results */}
      <section className="py-10 px-4 bg-slate-50 min-h-64" data-testid="advocates-grid">
        <div className="max-w-5xl mx-auto">
          <p className="text-sm text-slate-500 mb-6">
            {loading ? 'Loading…' : `${advocates.length} advocate${advocates.length !== 1 ? 's' : ''} found`}
          </p>

          {loading ? (
            <div className="text-center py-16 text-slate-400">Loading…</div>
          ) : advocates.length === 0 ? (
            <div className="text-center py-16 text-slate-400" data-testid="no-advocates">
              <Scale className="h-12 w-12 mx-auto mb-4 text-slate-300" />
              <p className="mb-4">No advocates found.</p>
              <Link to="/advocate-register" className="text-sm text-amber-700 hover:underline">
                Be the first to register
              </Link>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {advocates.map(a => <AdvocateCard key={a._id || a.id} a={a} />)}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-14 bg-white px-4" data-testid="advocates-cta">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-3">Need Financial Support for Your Case?</h2>
          <p className="text-slate-500 mb-6">
            If you cannot afford legal expenses, apply for legal aid from the VOICE foundation.
          </p>
          <Link
            to="/apply-grant"
            className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold px-6 py-3 rounded-md"
            data-testid="apply-grant-cta"
          >
            Apply for Legal Aid
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Advocates;
