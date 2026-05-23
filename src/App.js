import React, { useEffect, Suspense, lazy } from 'react';
import '@/App.css';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import { LanguageProvider } from '@/context/LanguageContext';
import useDictionaryStore from '@/store/dictionaryStore';
import useAuthStore from '@/store/authStore';

// Layouts & guards — sync, чтобы не мигал UI при проверке доступов
import AdminLayout from '@/layouts/AdminLayout';
import CustomerLayout from '@/layouts/CustomerLayout';
import ContractorLayout from '@/layouts/ContractorLayout';
import PublicLayout from '@/layouts/PublicLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import VerificationGuard from '@/components/VerificationGuard';

// Pages — lazy (code splitting по чанкам)
const LandingPage          = lazy(() => import('@/pages/static/LandingPage'));
const TenderDetail         = lazy(() => import('@/pages/static/TenderDetail'));
const ContractorTenderView = lazy(() => import('@/pages/contractor/ContractorTenderView'));
const ProtocolView         = lazy(() => import('@/pages/shared/ProtocolView'));
const TenderList           = lazy(() => import('@/pages/static/TenderList'));
const Registration         = lazy(() => import('@/pages/static/Registration'));
const Privacy              = lazy(() => import('@/pages/static/Privacy'));
const Offer                = lazy(() => import('@/pages/static/Offer'));
const HelpCenter           = lazy(() => import('@/pages/static/HelpCenter'));
const AboutPlatform        = lazy(() => import('@/pages/static/AboutPlatform'));
const ForgotPassword       = lazy(() => import('@/pages/static/ForgotPassword'));
const ResetPassword        = lazy(() => import('@/pages/static/ResetPassword'));
const VerifyEmailPage      = lazy(() => import('@/pages/static/VerifyEmailPage'));
const CompleteRegistration = lazy(() => import('@/pages/CompleteRegistration'));
const NotFound             = lazy(() => import('@/pages/static/404'));
const Forbidden            = lazy(() => import('@/pages/static/Foribden'));

const AdminPanel           = lazy(() => import('@/pages/admin/AdminPanel'));
const CreateTender         = lazy(() => import('@/pages/admin/CreateTenderNew'));
const VerificationDetail   = lazy(() => import('@/pages/admin/VerificationDetail'));
const AdminEmailSender     = lazy(() => import('@/pages/admin/AdminEmailSender'));

const Dashboard            = lazy(() => import('@/pages/customer/Dashboard'));
const MyTenders            = lazy(() => import('@/pages/customer/MyTenders'));
const SupplierBids         = lazy(() => import('@/pages/customer/SupplierBids'));
const Contracts            = lazy(() => import('@/pages/customer/Contracts'));
const ContractDetail       = lazy(() => import('@/pages/customer/ContractDetail'));

const ContractorDashboard  = lazy(() => import('@/pages/contractor/ContractorDashboard'));
const MyBids               = lazy(() => import('@/pages/contractor/MyBids'));
const ContractorContracts  = lazy(() => import('@/pages/contractor/ContractorContracts'));
const ContractorAnalytics  = lazy(() => import('@/pages/contractor/ContractorAnalytics'));
const ContractorArchive    = lazy(() => import('@/pages/contractor/ContractorArchive'));
const ContractorProfile    = lazy(() => import('@/pages/contractor/ContractorProfile'));
const SubmitBid            = lazy(() => import('@/pages/contractor/SubmitBid'));

const Profile              = lazy(() => import('@/pages/shared/Profile'));
const Support              = lazy(() => import('@/pages/shared/Support'));
const PrivacyPolicy        = lazy(() => import('@/pages/static/PrivacyPolicy'));
const TermsOfUse           = lazy(() => import('@/pages/static/TermsOfUse'));
const Disclaimer           = lazy(() => import('@/pages/static/Disclaimer'));

// ── Fallback ───────────────────────────────────────────────────────────────────

const Fallback = () => (
  <div className="loading-screen"><div className="loading-spinner" /></div>
);

// ── Хелперы для элементов маршрутов ───────────────────────────────────────────

const page = (C) => (
  <Suspense fallback={<Fallback />}><C /></Suspense>
);

const guarded = (C) => (
  <VerificationGuard>
    <Suspense fallback={<Fallback />}><C /></Suspense>
  </VerificationGuard>
);

// ── Вспомогательные функции ────────────────────────────────────────────────────

const roleHome = (user) =>
  user?.role === 'admin'      ? '/admin' :
  user?.role === 'contractor' ? '/contractor/dashboard' :
  user?.role === 'customer'   ? '/customer/dashboard' : '/';

// ── Route-компоненты, требующие доступа к стору ────────────────────────────────

const RootRoute = () => {
  const user = useAuthStore(s => s.user);
  return user ? <Navigate to={roleHome(user)} replace /> : page(LandingPage);
};

const DashboardRedirect = () => {
  const user = useAuthStore(s => s.user);
  return <Navigate to={user ? roleHome(user) : '/'} replace />;
};

const TenderDetailRoute = () => {
  const user = useAuthStore(s => s.user);
  const C = user?.role === 'contractor' ? ContractorTenderView : TenderDetail;
  return <Suspense fallback={<Fallback />}><C /></Suspense>;
};

const CompleteRegistrationRoute = () => {
  const user = useAuthStore(s => s.user);
  if (!user) return <Navigate to="/" replace />;
  if (user.onboarding_completed !== false) return <Navigate to={roleHome(user)} replace />;
  return page(CompleteRegistration);
};

const RegistrationRoute = () => {
  const user = useAuthStore(s => s.user);
  if (user?.onboarding_completed === false) return <Navigate to="/complete-registration" replace />;
  return page(Registration);
};

// Общие защищённые маршруты (/profile, /support и т.д.) рендерятся в лейауте,
// соответствующем роли пользователя, а не принудительно в CustomerLayout.
const RoleBasedLayout = () => {
  const user = useAuthStore(s => s.user);
  if (user?.role === 'admin')      return <AdminLayout />;
  if (user?.role === 'contractor') return <ContractorLayout />;
  return <CustomerLayout />;
};

// ── Router ─────────────────────────────────────────────────────────────────────

const router = createBrowserRouter([
  { path: '/', element: <RootRoute /> },

  // Legacy URL redirects
  { path: '/dashboard',     element: <DashboardRedirect /> },
  { path: '/my-bids',       element: <Navigate to="/contractor/bids" replace /> },
  { path: '/organization',  element: <Navigate to="/customer/profile" replace /> },
  { path: '/my-tenders',    element: <Navigate to="/customer/tenders" replace /> },
  { path: '/create-tender', element: <Navigate to="/admin/create-tender" replace /> },

  // Self-contained маршруты
  { path: '/tenders',    element: page(TenderList) },
  { path: '/tenders/:id', element: <TenderDetailRoute /> },

  // PublicLayout — онбординг + публичные страницы
  {
    element: <PublicLayout />,
    children: [
      { path: '/complete-registration', element: <CompleteRegistrationRoute /> },
      { path: '/registration',          element: <RegistrationRoute /> },
      { path: '/privacy',               element: page(Privacy) },
      { path: '/offer',                 element: page(Offer) },
      { path: '/help',                  element: page(HelpCenter) },
      { path: '/about',                 element: page(AboutPlatform) },
      { path: '/forgot-password',       element: page(ForgotPassword) },
      { path: '/reset-password',        element: page(ResetPassword) },
      { path: '/verify-email',          element: page(VerifyEmailPage) },
    ],
  },

  // Admin
  {
    element: <ProtectedRoute allowedRole="admin" />,
    children: [{
      element: <AdminLayout />,
      children: [
        { path: '/admin',                      element: page(AdminPanel) },
        { path: '/admin/create-tender',        element: guarded(CreateTender) },
        { path: '/admin/verification/:userId', element: page(VerificationDetail) },
        { path: '/admin/email-sender',         element: page(AdminEmailSender) },
      ],
    }],
  },

  // Customer
  {
    element: <ProtectedRoute allowedRole="customer" />,
    children: [{
      element: <CustomerLayout />,
      children: [
        { path: '/customer/dashboard',      element: page(Dashboard) },
        { path: '/customer/profile',        element: page(Profile) },
        { path: '/customer/support',        element: page(Support) },
        { path: '/customer/privacy-policy', element: page(PrivacyPolicy) },
        { path: '/customer/terms-of-use',   element: page(TermsOfUse) },
        { path: '/customer/disclaimer',     element: page(Disclaimer) },
        { path: '/customer/tenders',        element: guarded(MyTenders) },
        { path: '/customer/supplier-bids',  element: guarded(SupplierBids) },
        { path: '/customer/contracts',      element: guarded(Contracts) },
        { path: '/customer/contracts/:id',  element: guarded(ContractDetail) },
      ],
    }],
  },

  // Contractor
  {
    element: <ProtectedRoute allowedRole="contractor" />,
    children: [{
      element: <ContractorLayout />,
      children: [
        { path: '/contractor/dashboard',         element: page(ContractorDashboard) },
        { path: '/contractor/profile',           element: page(ContractorProfile) },
        { path: '/contractor/support',           element: page(Support) },
        { path: '/contractor/bids',              element: guarded(MyBids) },
        { path: '/contractor/contracts',         element: guarded(ContractorContracts) },
        { path: '/contractor/analytics',         element: guarded(ContractorAnalytics) },
        { path: '/contractor/archive',           element: guarded(ContractorArchive) },
        { path: '/tenders/:tenderId/submit-bid', element: guarded(SubmitBid) },
      ],
    }],
  },

  // Общие защищённые маршруты — лейаут по роли пользователя
  {
    element: <ProtectedRoute />,
    children: [{
      element: <RoleBasedLayout />,
      children: [
        { path: '/profile',               element: page(Profile) },
        { path: '/support',               element: page(Support) },
        { path: '/privacy-policy',        element: page(PrivacyPolicy) },
        { path: '/terms-of-use',          element: page(TermsOfUse) },
        { path: '/disclaimer',            element: page(Disclaimer) },
        { path: '/protocol/:tenderId',    element: guarded(ProtocolView) },
        { path: '/contracts',             element: guarded(Contracts) },
        { path: '/contracts/:id',         element: guarded(ContractDetail) },
      ],
    }],
  },

  // Страницы ошибок
  { path: '/403', element: page(Forbidden) },
  { path: '*',    element: page(NotFound) },
]);

// ── App ────────────────────────────────────────────────────────────────────────

function App() {
  const { loading, checkAuth } = useAuthStore();
  const fetchInitial = useDictionaryStore(s => s.fetchInitial);

  useEffect(() => {
    checkAuth();
    fetchInitial();
  }, [checkAuth, fetchInitial]);

  if (loading) return <Fallback />;

  return (
    <LanguageProvider>
      <RouterProvider router={router} />
      <Toaster position="top-right" richColors closeButton duration={4000} gap={8} />
    </LanguageProvider>
  );
}

export default App;
