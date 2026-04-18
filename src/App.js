import React, { useState, useEffect } from 'react';
import '@/App.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import { LanguageProvider } from '@/context/LanguageContext';
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';
import apiClient, { BASE_URL } from '@/services/api';

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

// Admin pages
import AdminPanel from '@/pages/admin/AdminPanel';
import AdminTenders from '@/pages/admin/AdminTenders';
import AdminContracts from '@/pages/admin/AdminContracts';
import AdminUsers from '@/pages/admin/AdminUsers';
import CreateTender from '@/pages/admin/CreateTenderNew';

// Customer pages
import Dashboard from '@/pages/customer/Dashboard';
import MyTenders from '@/pages/customer/MyTenders';
import OrganizationProfile from '@/pages/customer/OrganizationProfile';
import ProcurementPlans from '@/pages/customer/ProcurementPlans';
import SupplierBids from '@/pages/customer/SupplierBids';
import SupplierSearch from '@/pages/customer/SupplierSearch';
import Contracts from '@/pages/customer/Contracts';
import ContractDetail from '@/pages/customer/ContractDetail';
import Analytics from '@/pages/customer/Analytics';
import BankAccounts from '@/pages/customer/BankAccounts';
import OrganizationEmployees from '@/pages/customer/OrganizationEmployees';
import Reports from '@/pages/customer/Reports';

// Contractor pages
import ContractorDashboard from '@/pages/contractor/ContractorDashboard';
import MyBids from '@/pages/contractor/MyBids';
import ContractorContracts from '@/pages/contractor/ContractorContracts';
import ContractorGuarantees from '@/pages/contractor/ContractorGuarantees';
import ContractorQualifications from '@/pages/contractor/ContractorQualifications';
import ContractorFinances from '@/pages/contractor/ContractorFinances';
import ContractorAnalytics from '@/pages/contractor/ContractorAnalytics';
import ContractorArchive from '@/pages/contractor/ContractorArchive';
import ContractorProfile from '@/pages/contractor/ContractorProfile';
import SubmitBid from '@/pages/contractor/SubmitBid';

// Shared authenticated pages
import Profile from '@/pages/shared/Profile';
import Communications from '@/pages/shared/Communications';
import Settings from '@/pages/shared/Settings';
import Support from '@/pages/shared/Support';
import PrivacyPolicy from '@/pages/static/PrivacyPolicy';
import TermsOfUse from '@/pages/static/TermsOfUse';
import Disclaimer from '@/pages/static/Disclaimer';

const API = BASE_URL;

export const AppContext = React.createContext();

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();

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
    user?.role === 'admin' ? '/admin' :
    user?.role === 'contractor' ? '/contractor/dashboard' :
    user?.role === 'customer' ? '/customer/dashboard' : '/';

  return (
    <GoogleReCaptchaProvider reCaptchaKey={process.env.REACT_APP_RECAPTCHA_SITE_KEY}>
    <LanguageProvider>
      <AppContext.Provider value={{ user, setUser, logout, API }}>
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
              <Route path="/organization" element={<Navigate to="/customer/organization" replace />} />
              <Route path="/procurement-plans" element={<Navigate to="/customer/procurement-plans" replace />} />
              <Route path="/supplier-bids" element={<Navigate to="/customer/supplier-bids" replace />} />
              <Route path="/supplier-search" element={<Navigate to="/customer/supplier-search" replace />} />
              <Route path="/analytics" element={<Navigate to="/customer/analytics" replace />} />
              <Route path="/bank-accounts" element={<Navigate to="/customer/bank-accounts" replace />} />
              <Route path="/employees" element={<Navigate to="/customer/employees" replace />} />
              <Route path="/reports" element={<Navigate to="/customer/reports" replace />} />
              <Route path="/my-tenders" element={<Navigate to="/customer/tenders" replace />} />
              <Route path="/create-tender" element={<Navigate to="/admin/create-tender" replace />} />

              {/* Public routes — StaticLayout */}
              <Route element={<PublicLayout />}>
                <Route path="/tenders" element={<TenderList />} />
                <Route path="/registration" element={<Registration />} />
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
                  <Route path="/admin/tenders" element={<AdminTenders />} />
                  <Route path="/admin/contracts" element={<AdminContracts />} />
                  <Route path="/admin/users" element={<AdminUsers />} />
                  <Route path="/admin/create-tender" element={<CreateTender />} />
                </Route>
              </Route>

              {/* Customer routes */}
              <Route element={<ProtectedRoute allowedRole="customer" />}>
                <Route element={<CustomerLayout />}>
                  <Route path="/customer/dashboard" element={<Dashboard />} />
                  <Route path="/customer/tenders" element={<MyTenders />} />
                  <Route path="/customer/organization" element={<OrganizationProfile />} />
                  <Route path="/customer/procurement-plans" element={<ProcurementPlans />} />
                  <Route path="/customer/supplier-bids" element={<SupplierBids />} />
                  <Route path="/customer/supplier-search" element={<SupplierSearch />} />
                  <Route path="/customer/contracts" element={<Contracts />} />
                  <Route path="/customer/contracts/:id" element={<ContractDetail />} />
                  <Route path="/customer/analytics" element={<Analytics />} />
                  <Route path="/customer/bank-accounts" element={<BankAccounts />} />
                  <Route path="/customer/employees" element={<OrganizationEmployees />} />
                  <Route path="/customer/reports" element={<Reports />} />
                  <Route path="/customer/profile" element={<Profile />} />
                  <Route path="/customer/communications" element={<Communications />} />
                  <Route path="/customer/settings" element={<Settings />} />
                  <Route path="/customer/support" element={<Support />} />
                  <Route path="/customer/privacy-policy" element={<PrivacyPolicy />} />
                  <Route path="/customer/terms-of-use" element={<TermsOfUse />} />
                  <Route path="/customer/disclaimer" element={<Disclaimer />} />
                </Route>
              </Route>

              {/* Contractor routes */}
              <Route element={<ProtectedRoute allowedRole="contractor" />}>
                <Route element={<ContractorLayout />}>
                  <Route path="/contractor/dashboard" element={<ContractorDashboard />} />
                  <Route path="/contractor/bids" element={<MyBids />} />
                  <Route path="/contractor/contracts" element={<ContractorContracts />} />
                  <Route path="/contractor/guarantees" element={<ContractorGuarantees />} />
                  <Route path="/contractor/qualifications" element={<ContractorQualifications />} />
                  <Route path="/contractor/finances" element={<ContractorFinances />} />
                  <Route path="/contractor/analytics" element={<ContractorAnalytics />} />
                  <Route path="/contractor/archive" element={<ContractorArchive />} />
                  <Route path="/contractor/profile" element={<ContractorProfile />} />
                  <Route path="/contractor/communications" element={<Communications />} />
                  <Route path="/contractor/settings" element={<Settings />} />
                  <Route path="/contractor/support" element={<Support />} />
                  <Route path="/tenders/:tenderId/submit-bid" element={<SubmitBid />} />
                </Route>
              </Route>

              {/* Shared authenticated routes — CustomerLayout for visual consistency */}
              <Route element={<ProtectedRoute />}>
                <Route element={<CustomerLayout />}>
                  <Route path="/protocol/:tenderId" element={<ProtocolView />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/communications" element={<Communications />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/support" element={<Support />} />
                  <Route path="/contracts" element={<Contracts />} />
                  <Route path="/contracts/:id" element={<ContractDetail />} />
                  <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                  <Route path="/terms-of-use" element={<TermsOfUse />} />
                  <Route path="/disclaimer" element={<Disclaimer />} />
                </Route>
              </Route>

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
    </GoogleReCaptchaProvider>
  );
}

export default App;
