import React from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "./components/ui/sonner";
import { AuthProvider } from "./context/AuthContext";
import { SettingsProvider } from "./context/SettingsContext";
import Layout from "./components/Layout";
import Favicon from "./components/Favicon";

// Pages
import Home from "./pages/Home";
import About from "./pages/About";
import Stories from "./pages/Stories";
import StoryDetail from "./pages/StoryDetail";
import Resources from "./pages/Resources";
import Donate from "./pages/Donate";
import Contact from "./pages/Contact";
import Store from "./pages/Store";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import SubmitStory from "./pages/SubmitStory";
import EditStory from "./pages/EditStory";
import Admin from "./pages/Admin";
import Advocates from "./pages/Advocates";
import AdvocateRegister from "./pages/AdvocateRegister";
import ApplyGrant from "./pages/ApplyGrant";
import AdminSettings from "./pages/AdminSettings";

function App() {
  return (
    <SettingsProvider>
      <AuthProvider>
        <Favicon />
        <BrowserRouter>
          <Toaster position="top-right" richColors />
          <Routes>
          {/* Auth pages without layout */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Dashboard pages without main layout */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/submit-story" element={<SubmitStory />} />
          <Route path="/edit-story/:id" element={<EditStory />} />
          <Route path="/apply-grant" element={<ApplyGrant />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/admin/settings" element={<AdminSettings />} />
          <Route path="/advocate-register" element={<AdvocateRegister />} />
          
          {/* Public pages with layout */}
          <Route path="/" element={<Layout><Home /></Layout>} />
          <Route path="/about" element={<Layout><About /></Layout>} />
          <Route path="/stories" element={<Layout><Stories /></Layout>} />
          <Route path="/stories/:id" element={<Layout><StoryDetail /></Layout>} />
          <Route path="/resources" element={<Layout><Resources /></Layout>} />
          <Route path="/advocates" element={<Layout><Advocates /></Layout>} />
          <Route path="/donate" element={<Layout><Donate /></Layout>} />
          <Route path="/shop" element={<Layout><Store /></Layout>} />
          <Route path="/contact" element={<Layout><Contact /></Layout>} />
        </Routes>
        </BrowserRouter>
      </AuthProvider>
    </SettingsProvider>
  );
}

export default App;
