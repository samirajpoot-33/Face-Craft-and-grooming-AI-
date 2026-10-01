import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

// components
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import AIChatButton from "./components/AIChatButton";
import AIChatWindow from "./components/AIChatWindow";
import ScrollToTop from "./components/ScrollToTop";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminProtectedRoute from "./components/AdminProtectedRoute";
import PageLoader from "./components/PageLoader";

// context
import { AuthProvider, useAuth } from "./context/AuthContext";

// pages
import Home from "./pages/Home";
import TryOn from "./pages/TryOn";
import Login from "./pages/Login";
import Register from "./pages/Register";
import FaceShapeDetector from "./pages/FaceShapeDetector";
import UserDashboard from "./pages/UserDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import AdminLogin from "./pages/AdminLogin";
import AdminProfile from "./pages/AdminProfile";
import OAuthCallback from "./pages/OAuthCallback";
import Solutions from "./components/Solutions";
import HowItWorks from "./components/HowItWorks";
import FaceShapeSteps from "./components/FaceShapeSteps";
import AboutUs from "./pages/AboutUs";
import ContactUs from "./pages/ContactUs";
import MakeupVirtualTry from "./pages/MakeupVirtualTry";
import HairstyleTryOn from "./pages/HairstyleTryOn";
import Pricing from "./pages/Pricing";
import VerifyOTP from "./pages/VerifyOTP";
import ForgotPassword from "./pages/ForgotPassword";


// Inner App Component - has access to AuthContext
function AppContent() {
  const [chatOpen, setChatOpen] = useState(false);
  const [appLoading, setAppLoading] = useState(true);
  const { loading: authLoading } = useAuth();
  const location = useLocation();

  const isAdminRoute = location.pathname.startsWith("/admin");

  // Handle initial app load
  useEffect(() => {
    // Simulate minimum loading time for smooth UX
    const timer = setTimeout(() => {
      setAppLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  // Show loader while auth is loading or app is initializing
  if (authLoading || appLoading) {
    return <PageLoader message={authLoading ? 'Verifying authentication...' : 'Loading FaceCraft...'} />;
  }

  return (
    <div className="font-sans min-h-screen">
      <ScrollToTop />
      {!isAdminRoute && <Navbar />}

        <Routes>
            <Route path="/" element={<Home />} />
            
            {/* Protected Routes - Require Authentication */}
            <Route 
              path="/face-analyzer" 
              element={
                <ProtectedRoute>
                  <FaceShapeDetector />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/face-detector" 
              element={
                <ProtectedRoute>
                  <FaceShapeDetector />
                </ProtectedRoute>
              } 
            />

            {/* Public Routes */}
            <Route path="/solutions" element={<Solutions />} />
            <Route path="/faceshapesteps" element={<FaceShapeSteps />} />
            <Route path="/how-it-works" element={<HowItWorks />} />
            <Route path="/try-on" element={<TryOn />} />
            <Route 
              path="/makeup-virtual-try" 
              element={
                <ProtectedRoute>
                  <MakeupVirtualTry />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/hair-virtual-try" 
              element={
                <ProtectedRoute>
                  <HairstyleTryOn />
                </ProtectedRoute>
              } 
            />
            <Route
              path="/beard-virtual-try"
              element={<Navigate to="/hair-virtual-try#beard" replace />}
            />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-email" element={<VerifyOTP />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/admin-login" element={<AdminLogin />} />
            <Route path="/auth/github/callback" element={<OAuthCallback />} />
            <Route path="/auth/discord/callback" element={<OAuthCallback />} />
            <Route path="/auth/google/callback" element={<OAuthCallback />} />
            <Route path="/auth/instagram/callback" element={<OAuthCallback />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/contact" element={<ContactUs />} />
            
            {/* Protected User Routes */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <UserDashboard />
                </ProtectedRoute>
              } 
            />
            
            {/* Protected Admin Routes */}
            <Route 
              path="/admin" 
              element={
                <AdminProtectedRoute>
                  <AdminDashboard />
                </AdminProtectedRoute>
              } 
            />
            <Route 
              path="/admin/profile" 
              element={
                <AdminProtectedRoute>
                  <AdminProfile />
                </AdminProtectedRoute>
              } 
            />
          </Routes>

        {/* IMPORTANT — Chatbot must be OUTSIDE routes */}
        {!isAdminRoute && (
          <>
            <AIChatWindow open={chatOpen} setOpen={setChatOpen} />
            <AIChatButton open={chatOpen} setOpen={setChatOpen} />
          </>
        )}

      {!isAdminRoute && <Footer />}
    </div>
  );
}

// Main App Component with AuthProvider
export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </AuthProvider>
  );
}
