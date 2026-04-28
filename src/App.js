import React, { useState, useEffect } from 'react';
import '@/App.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import { LanguageProvider } from '@/context/LanguageContext';
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';
import apiClient, { BASE_URL } from '@/services/api';
import useDictionaryStore from '@/store/dictionaryStore';
import NotFound from '@/pages/static/404';
import Forbidden from '@/pages/static/Foribden';
// Layouts
import AdminLayout from '@/layouts/AdminLayout';
import CustomerLayout from '@/layouts/CustomerLayout';
import ContractorLayout from '@/layouts/ContractorLayout';
import PublicLayout from '@/layouts/PublicLayout';

// Route guards
import ProtectedRoute from '@/components/ProtectedRoute';

// Public pages
import LandingPage from '@/pages/static/LandingPage';
import TenderDetail from '@/pages/static/TenderDetail';
import ContractorTenderView from '@/pages/contractor/ContractorTenderView';
import ProtocolView from '@/pages/shared/ProtocolView';
import TenderList from '@/pages/static/TenderList';
import Registration from '@/pages/static/Registration';
import Privacy from '@/pages/static/Privacy';
import Offer from '@/pages/static/Offer';
import HelpCenter from '@/pages/static/HelpCenter';
import AboutPlatform from '@/pages/static/AboutPlatform';
import ForgotPassword from '@/pages/static/ForgotPassword';
import ResetPassword from '@/pages/static/ResetPassword';
import VerifyEmailPage from '@/pages/static/VerifyEmailPage';
import CompleteRegistration from '@/pages/CompleteRegistration';

// Admin pages
import AdminPanel from '@/pages/admin/AdminPanel';
import CreateTender from '@/pages/admin/CreateTenderNew';
import VerificationDetail from '@/pages/admin/VerificationDetail';
import AdminEmailSender from '@/pages/admin/AdminEmailSender';

// Customer pages
import Dashboard from '@/pages/customer/Dashboard';
import MyTenders from '@/pages/customer/MyTenders';
import SupplierBids from '@/pages/customer/SupplierBids';
import Contracts from '@/pages/customer/Contracts';
import ContractDetail from '@/pages/customer/ContractDetail';

// Contractor pages
import ContractorDashboard from '@/pages/contractor/ContractorDashboard';
import MyBids from '@/pages/contractor/MyBids';
import ContractorContracts from '@/pages/contractor/ContractorContracts';
import ContractorAnalytics from '@/pages/contractor/ContractorAnalytics';
import ContractorArchive from '@/pages/contractor/ContractorArchive';
import ContractorProfile from '@/pages/contractor/ContractorProfile';
import SubmitBid from '@/pages/contractor/SubmitBid';

// Shared authenticated pages
import Profile from '@/pages/shared/Profile';
import VerificationGuard from '@/components/VerificationGuard';
import Support from '@/pages/shared/Support';
import PrivacyPolicy from '@/pages/static/PrivacyPolicy';
import TermsOfUse from '@/pages/static/TermsOfUse';
import Disclaimer from '@/pages/static/Disclaimer';

const API = BASE_URL;

export const AppContext = React.createContext();

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const fetchInitial = useDictionaryStore((s) => s.fetchInitial);

  useEffect(() => {
    checkAuth();
    fetchInitial();

    // Triggered by apiClient's 401 interceptor when the JWT expires mid-session
    const handleForcedLogout = () => {
      setUser(null);
      toast.error('Сессия истекла. Пожалуйста, войдите снова.');
    };
    window.addEventListener('auth:logout', handleForcedLogout);
    return () => window.removeEventListener('auth:logout', handleForcedLogout);
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const response = await apiClient.get('/auth/me');
        setUser(response.data);
      } catch {
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    toast.success('Вы вышли из системы');
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  const roleHome =
    user?.onboarding_completed === false ? '/complete-registration' :
    user?.role === 'admin' ? '/admin' :
    user?.role === 'contractor' ? '/contractor/dashboard' :
    user?.role === 'customer' ? '/customer/dashboard' : '/';

  return (

    <LanguageProvider>
      <AppContext.Provider value={{ user, setUser, logout, API, checkAuth }}>
        <div className="App">
          <BrowserRouter>
            <Routes>

              {/* Root — redirect authenticated users to their home */}
              <Route
                path="/"
                element={user ? <Navigate to={roleHome} replace /> : <LandingPage />}
              />

              {/* Legacy URL redirects */}
              <Route path="/dashboard" element={<Navigate to={user ? roleHome : '/'} replace />} />
              <Route path="/my-bids" element={<Navigate to="/contractor/bids" replace />} />
              <Route path="/organization" element={<Navigate to="/customer/profile" replace />} />
              <Route path="/my-tenders" element={<Navigate to="/customer/tenders" replace />} />
              <Route path="/create-tender" element={<Navigate to="/admin/create-tender" replace />} />

              {/* Onboarding — only for authenticated users with onboarding_completed === false */}
              <Route element={<PublicLayout />}>
                <Route
                  path="/complete-registration"
                  element={
                    !user ? <Navigate to="/" replace /> :
                    user.onboarding_completed !== false ? <Navigate to={roleHome} replace /> :
                    <CompleteRegistration />
                  }
                />
              </Route>

              {/* Tenders list — self-contained layout */}
              <Route path="/tenders" element={<TenderList />} />

              {/* Public routes — StaticLayout */}
              <Route element={<PublicLayout />}>
                <Route
                  path="/registration"
                  element={
                    user?.onboarding_completed === false
                      ? <Navigate to="/complete-registration" replace />
                      : <Registration />
                  }
                />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/offer" element={<Offer />} />
                <Route path="/help" element={<HelpCenter />} />
                <Route path="/about" element={<AboutPlatform />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/verify-email" element={<VerifyEmailPage />} />
              </Route>

              {/* Tender detail — self-contained layout based on auth state */}
              <Route
                path="/tenders/:id"
                element={user?.role === 'contractor' ? <ContractorTenderView /> : <TenderDetail />}
              />

              {/* Admin routes */}
              <Route element={<ProtectedRoute allowedRole="admin" />}>
                <Route element={<AdminLayout />}>
                  <Route path="/admin" element={<AdminPanel />} />
                  <Route path="/admin/create-tender" element={<VerificationGuard><CreateTender /></VerificationGuard>} />
                  <Route path="/admin/verification/:userId" element={<VerificationDetail />} />
                  <Route path="/admin/email-sender" element={<AdminEmailSender />} />
                </Route>
              </Route>

              {/* Customer routes */}
              <Route element={<ProtectedRoute allowedRole="customer" />}>
                <Route element={<CustomerLayout />}>
                  {/* Always accessible — verification status visible here */}
                  <Route path="/customer/dashboard" element={<Dashboard />} />
                  <Route path="/customer/profile" element={<Profile />} />
                  <Route path="/customer/support" element={<Support />} />
                  <Route path="/customer/privacy-policy" element={<PrivacyPolicy />} />
                  <Route path="/customer/terms-of-use" element={<TermsOfUse />} />
                  <Route path="/customer/disclaimer" element={<Disclaimer />} />
                  {/* Blocked until verified */}
                  <Route path="/customer/tenders" element={<VerificationGuard><MyTenders /></VerificationGuard>} />
                  <Route path="/customer/supplier-bids" element={<VerificationGuard><SupplierBids /></VerificationGuard>} />
                  <Route path="/customer/contracts" element={<VerificationGuard><Contracts /></VerificationGuard>} />
                  <Route path="/customer/contracts/:id" element={<VerificationGuard><ContractDetail /></VerificationGuard>} />
                </Route>
              </Route>

              {/* Contractor routes */}
              <Route element={<ProtectedRoute allowedRole="contractor" />}>
                <Route element={<ContractorLayout />}>
                  {/* Always accessible */}
                  <Route path="/contractor/dashboard" element={<ContractorDashboard />} />
                  <Route path="/contractor/profile" element={<ContractorProfile />} />
                  <Route path="/contractor/support" element={<Support />} />
                  {/* Blocked until verified */}
                  <Route path="/contractor/bids" element={<VerificationGuard><MyBids /></VerificationGuard>} />
                  <Route path="/contractor/contracts" element={<VerificationGuard><ContractorContracts /></VerificationGuard>} />
                  <Route path="/contractor/analytics" element={<VerificationGuard><ContractorAnalytics /></VerificationGuard>} />
                  <Route path="/contractor/archive" element={<VerificationGuard><ContractorArchive /></VerificationGuard>} />
                  <Route path="/tenders/:tenderId/submit-bid" element={<VerificationGuard><SubmitBid /></VerificationGuard>} />
                </Route>
              </Route>

              {/* Shared authenticated routes — CustomerLayout for visual consistency */}
              <Route element={<ProtectedRoute />}>
                <Route element={<CustomerLayout />}>
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/support" element={<Support />} />
                  <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                  <Route path="/terms-of-use" element={<TermsOfUse />} />
                  <Route path="/disclaimer" element={<Disclaimer />} />
                  {/* Blocked until verified */}
                  <Route path="/protocol/:tenderId" element={<VerificationGuard><ProtocolView /></VerificationGuard>} />
                  <Route path="/contracts" element={<VerificationGuard><Contracts /></VerificationGuard>} />
                  <Route path="/contracts/:id" element={<VerificationGuard><ContractDetail /></VerificationGuard>} />
                </Route>
              </Route>

              {/* Error pages */}
              <Route path="/403" element={<Forbidden />} />
              <Route path="*" element={<NotFound />} />

            </Routes>
          </BrowserRouter>
          <Toaster
            position="top-right"
            richColors
            closeButton
            duration={4000}
            gap={8}
          />
        </div>
      </AppContext.Provider>
    </LanguageProvider>

  );
}

export default App;
