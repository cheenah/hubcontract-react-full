import React, { useState, useEffect } from 'react';
import '@/App.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import { LanguageProvider } from '@/context/LanguageContext';

// Pages
import LandingPage from '@/pages/LandingPage';
import Dashboard from '@/pages/Dashboard';
import TenderList from '@/pages/TenderList';
import TenderDetail from '@/pages/TenderDetail';
import CreateTender from '@/pages/CreateTenderNew';
import MyTenders from '@/pages/MyTenders';
import MyBids from '@/pages/MyBids';
import Profile from '@/pages/Profile';
import AdminPanel from '@/pages/AdminPanel';
import AdminTenders from '@/pages/AdminTenders';
import AdminContracts from '@/pages/AdminContracts';
import AdminUsers from '@/pages/AdminUsers';
import OrganizationProfile from '@/pages/OrganizationProfile';
import ProcurementPlans from '@/pages/ProcurementPlans';
import SupplierBids from '@/pages/SupplierBids';
import Contracts from '@/pages/Contracts';
import ContractDetail from '@/pages/ContractDetail';
import Analytics from '@/pages/Analytics';
import Communications from '@/pages/Communications';
import Settings from '@/pages/Settings';
import SupplierSearch from '@/pages/SupplierSearch';
import BankAccounts from '@/pages/BankAccounts';
import OrganizationEmployees from '@/pages/OrganizationEmployees';
import Reports from '@/pages/Reports';
import ProtocolView from '@/pages/ProtocolView';
import Support from '@/pages/Support';
import HelpCenter from '@/pages/HelpCenter';
import AboutPlatform from '@/pages/AboutPlatform';
import ContractorDashboard from '@/pages/ContractorDashboard';
import ContractorContracts from '@/pages/ContractorContracts';
import ContractorGuarantees from '@/pages/ContractorGuarantees';
import ContractorQualifications from '@/pages/ContractorQualifications';
import ContractorFinances from '@/pages/ContractorFinances';
import SubmitBid from '@/pages/SubmitBid';
import ContractorTenderView from '@/pages/ContractorTenderView';
import PrivacyPolicy from '@/pages/PrivacyPolicy';
import TermsOfUse from '@/pages/TermsOfUse';
import Disclaimer from '@/pages/Disclaimer';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
// const BACKEND_URL = 'http://localhost:8000'
const BACKEND_URL = 'https://test-api.hubcontract.kz/';
// const API = `http://localhost:8000/api`;
const API = 'https://test-api.hubcontract.kz/api';
// Axios interceptor
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const AppContext = React.createContext();

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const response = await axios.get(`${API}/auth/me`);
        setUser(response.data);
      } catch (error) {
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    toast.success('Logged out successfully');
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <LanguageProvider>
      <AppContext.Provider value={{ user, setUser, logout, API }}>
        <div className="App">
          <BrowserRouter>
            <Routes>
              <Route path="/" element={user ? <Navigate to={user.role === 'admin' ? '/admin' : user.role === 'contractor' ? '/contractor/dashboard' : '/dashboard'} /> : <LandingPage />} />
              <Route path="/dashboard" element={user && user.role === 'customer' ? <Dashboard /> : user && user.role === 'contractor' ? <Navigate to="/contractor/dashboard" /> : user && user.role === 'admin' ? <Navigate to="/admin" /> : <Navigate to="/" />} />
              <Route path="/tenders" element={<TenderList />} />
              <Route path="/tenders/:id" element={user && user.role === 'contractor' ? <ContractorTenderView /> : <TenderDetail />} />
              <Route path="/tenders/:tenderId/submit-bid" element={user && user.role === 'contractor' ? <SubmitBid /> : <Navigate to="/" />} />
              <Route path="/protocol/:tenderId" element={<ProtocolView />} />
              <Route path="/create-tender" element={user && user.role === 'customer' ? <CreateTender /> : <Navigate to="/" />} />
              <Route path="/my-tenders" element={user && user.role === 'customer' ? <MyTenders /> : <Navigate to="/" />} />
              <Route path="/my-bids" element={user && user.role === 'contractor' ? <MyBids /> : <Navigate to="/" />} />
              <Route path="/profile" element={user ? <Profile /> : <Navigate to="/" />} />
              <Route path="/admin" element={user && user.role === 'admin' ? <AdminPanel /> : <Navigate to="/" />} />
              <Route path="/admin/tenders" element={user && user.role === 'admin' ? <AdminTenders /> : <Navigate to="/" />} />
              <Route path="/admin/contracts" element={user && user.role === 'admin' ? <AdminContracts /> : <Navigate to="/" />} />
              <Route path="/admin/users" element={user && user.role === 'admin' ? <AdminUsers /> : <Navigate to="/" />} />
              
              {/* Customer Personal Account Routes */}
              <Route path="/organization" element={user && user.role === 'customer' ? <OrganizationProfile /> : <Navigate to="/" />} />
              <Route path="/procurement-plans" element={user && user.role === 'customer' ? <ProcurementPlans /> : <Navigate to="/" />} />
              <Route path="/supplier-bids" element={user && user.role === 'customer' ? <SupplierBids /> : <Navigate to="/" />} />
              <Route path="/supplier-search" element={user && user.role === 'customer' ? <SupplierSearch /> : <Navigate to="/" />} />
              <Route path="/contracts" element={user ? <Contracts /> : <Navigate to="/" />} />
              <Route path="/contracts/:id" element={user ? <ContractDetail /> : <Navigate to="/" />} />
              <Route path="/analytics" element={user && user.role === 'customer' ? <Analytics /> : <Navigate to="/" />} />
              <Route path="/bank-accounts" element={user && user.role === 'customer' ? <BankAccounts /> : <Navigate to="/" />} />
              <Route path="/employees" element={user && user.role === 'customer' ? <OrganizationEmployees /> : <Navigate to="/" />} />
              <Route path="/reports" element={user && user.role === 'customer' ? <Reports /> : <Navigate to="/" />} />
              <Route path="/communications" element={user ? <Communications /> : <Navigate to="/" />} />
              <Route path="/settings" element={user ? <Settings /> : <Navigate to="/" />} />
              <Route path="/support" element={user ? <Support /> : <Navigate to="/" />} />
              <Route path="/help" element={<HelpCenter />} />
              <Route path="/about" element={<AboutPlatform />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/terms-of-use" element={<TermsOfUse />} />
              <Route path="/disclaimer" element={<Disclaimer />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              
              {/* Contractor Personal Account Routes */}
              <Route path="/contractor/dashboard" element={user && user.role === 'contractor' ? <ContractorDashboard /> : <Navigate to="/" />} />
              <Route path="/contractor/contracts" element={user && user.role === 'contractor' ? <ContractorContracts /> : <Navigate to="/" />} />
              <Route path="/contractor/guarantees" element={user && user.role === 'contractor' ? <ContractorGuarantees /> : <Navigate to="/" />} />
              <Route path="/contractor/qualifications" element={user && user.role === 'contractor' ? <ContractorQualifications /> : <Navigate to="/" />} />
              <Route path="/contractor/finances" element={user && user.role === 'contractor' ? <ContractorFinances /> : <Navigate to="/" />} />
            </Routes>
          </BrowserRouter>
          <Toaster position="top-right" richColors />
        </div>
      </AppContext.Provider>
    </LanguageProvider>
  );
}

export default App;