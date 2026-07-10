import React, { lazy, Suspense } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "./components/ui/sonner";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { SettingsProvider } from "./context/SettingsContext";
import Layout from "./components/Layout";
import Favicon from "./components/Favicon";
import ErrorBoundary from "./components/ErrorBoundary";

// ── Lazy-loaded pages ─────────────────────────────────────────────────────────
// Public (likely on first load — small perf gain keeping these lazy still)
const Home             = lazy(() => import("./pages/Home"));
const About            = lazy(() => import("./pages/About"));
const Stories          = lazy(() => import("./pages/Stories"));
const StoryDetail      = lazy(() => import("./pages/StoryDetail"));
const Resources        = lazy(() => import("./pages/Resources"));
const ResourceDetail   = lazy(() => import("./pages/ResourceDetail"));
const Advocates        = lazy(() => import("./pages/Advocates"));
const Donate           = lazy(() => import("./pages/Donate"));
const Store            = lazy(() => import("./pages/Store"));
const Contact          = lazy(() => import("./pages/Contact"));

// Auth
const Login           = lazy(() => import("./pages/Login"));
const Register        = lazy(() => import("./pages/Register"));
const VerifyOTP       = lazy(() => import("./pages/VerifyOTP"));
const ForgotPassword  = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword   = lazy(() => import("./pages/ResetPassword"));

// Authenticated
const Dashboard       = lazy(() => import("./pages/Dashboard"));
const SubmitStory     = lazy(() => import("./pages/SubmitStory"));
const AdminCreateStory = lazy(() => import("./pages/AdminCreateStory"));
const EditStory       = lazy(() => import("./pages/EditStory"));
const ApplyGrant      = lazy(() => import("./pages/ApplyGrant"));
const AdvocateRegister  = lazy(() => import("./pages/AdvocateRegister"));
const VolunteerRegister = lazy(() => import("./pages/VolunteerRegister"));
const Volunteers        = lazy(() => import("./pages/Volunteers"));
const DoctorRegister      = lazy(() => import("./pages/DoctorRegister"));
const Doctors             = lazy(() => import("./pages/Doctors"));
const JournalistRegister  = lazy(() => import("./pages/JournalistRegister"));
const Journalists         = lazy(() => import("./pages/Journalists"));
const ResearcherRegister  = lazy(() => import("./pages/ResearcherRegister"));
const Researchers         = lazy(() => import("./pages/Researchers"));
const Events              = lazy(() => import("./pages/Events"));
const EventDetail         = lazy(() => import("./pages/EventDetail"));
const AdminEvents         = lazy(() => import("./pages/AdminEvents"));
const AdminFAQs           = lazy(() => import("./pages/AdminFAQs"));

// Admin-only — heaviest bundle; only loaded for admins
const Admin               = lazy(() => import("./pages/Admin"));
const AdminSettings       = lazy(() => import("./pages/AdminSettings"));
const AdminOpportunities  = lazy(() => import("./pages/AdminOpportunities"));

// Opportunities
const Opportunities       = lazy(() => import("./pages/Opportunities"));
const OpportunityDetail   = lazy(() => import("./pages/OpportunityDetail"));

// ── Fallback ──────────────────────────────────────────────────────────────────
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="h-8 w-8 rounded-full border-2 border-slate-300 border-t-slate-800 animate-spin" />
  </div>
);

// ── Route guards ──────────────────────────────────────────────────────────────
const RequireAuth = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <PageLoader />;
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const RequireAdmin = ({ children }) => {
  const { isAdmin, isAuthenticated, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;
  return children;
};

// ── App ───────────────────────────────────────────────────────────────────────
function App() {
  return (
    <ErrorBoundary>
      <SettingsProvider>
        <AuthProvider>
          <Favicon />
          <BrowserRouter>
            <Toaster position="top-right" richColors />
            <Suspense fallback={<PageLoader />}>
              <Routes>
                {/* Auth */}
                <Route path="/login"                    element={<Login />} />
                <Route path="/register"                 element={<Register />} />
                <Route path="/verify-otp"               element={<RequireAuth><VerifyOTP /></RequireAuth>} />
                <Route path="/forgot-password"          element={<ForgotPassword />} />
                <Route path="/reset-password/:token"    element={<ResetPassword />} />

                {/* Authenticated */}
                <Route path="/dashboard"      element={<RequireAuth><Dashboard /></RequireAuth>} />
                <Route path="/submit-story"   element={<RequireAuth><SubmitStory /></RequireAuth>} />
                <Route path="/admin/create-story"   element={<RequireAdmin><AdminCreateStory /></RequireAdmin>} />
                <Route path="/edit-story/:id" element={<RequireAuth><EditStory /></RequireAuth>} />
                <Route path="/apply-grant"    element={<RequireAuth><ApplyGrant /></RequireAuth>} />
                <Route path="/advocate-register"  element={<AdvocateRegister />} />
                <Route path="/volunteer-register" element={<VolunteerRegister />} />
                <Route path="/volunteers"        element={<Layout><Volunteers /></Layout>} />
                <Route path="/doctor-register"      element={<DoctorRegister />} />
                <Route path="/doctors"             element={<Layout><Doctors /></Layout>} />
                <Route path="/journalist-register"  element={<JournalistRegister />} />
                <Route path="/journalists"         element={<Layout><Journalists /></Layout>} />
                <Route path="/researcher-register" element={<ResearcherRegister />} />
                <Route path="/researchers"         element={<Layout><Researchers /></Layout>} />
                <Route path="/admin/events"        element={<RequireAdmin><AdminEvents /></RequireAdmin>} />
                <Route path="/events"              element={<Layout><Events /></Layout>} />
                <Route path="/events/:slug"        element={<Layout><EventDetail /></Layout>} />

                {/* Admin-only */}
                <Route path="/admin"          element={<RequireAdmin><Admin /></RequireAdmin>} />
                <Route path="/admin/settings"      element={<RequireAdmin><AdminSettings /></RequireAdmin>} />
                <Route path="/admin/opportunities" element={<RequireAdmin><AdminOpportunities /></RequireAdmin>} />
                <Route path="/admin/faqs"          element={<RequireAdmin><AdminFAQs /></RequireAdmin>} />

                {/* Public with layout */}
                <Route path="/"              element={<Layout><Home /></Layout>} />
                <Route path="/about"         element={<Layout><About /></Layout>} />
                <Route path="/stories"       element={<Layout><Stories /></Layout>} />
                <Route path="/stories/:id"   element={<Layout><StoryDetail /></Layout>} />
                <Route path="/resources"     element={<Layout><Resources /></Layout>} />
                <Route path="/resources/:id" element={<Layout><ResourceDetail /></Layout>} />
                <Route path="/advocates"     element={<Layout><Advocates /></Layout>} />
                <Route path="/donate"        element={<Layout><Donate /></Layout>} />
                <Route path="/shop"          element={<Layout><Store /></Layout>} />
                <Route path="/contact"              element={<Layout><Contact /></Layout>} />
                <Route path="/opportunities"       element={<Layout><Opportunities /></Layout>} />
                <Route path="/opportunities/:id"   element={<Layout><OpportunityDetail /></Layout>} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </AuthProvider>
      </SettingsProvider>
    </ErrorBoundary>
  );
}

export default App;
