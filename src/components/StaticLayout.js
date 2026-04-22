import React, { useState, useContext } from 'react';
import {
    Mail,
    Phone,
    MapPin as Location,
    ChevronRight,
    ChevronDown,
    Home,
    Globe,
    ShieldCheck,
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLanguage } from '@/context/LanguageContext';
import { useLocation, useNavigate, Outlet } from 'react-router-dom';
import { Dialog, DialogContent, DialogPortal, DialogOverlay, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import axios from "axios";
import { toast } from "sonner";
import useRecaptcha from '@/hooks/useRecaptcha';
import ResendOtpButton from '@/components/ResendOtpButton';
import { AppContext } from '@/App';

const API = process.env.REACT_APP_API_URL || 'https://test-api.hubcontract.kz/api';

const HeaderButton = ({ children, onClick, onMouseEnter, onMouseLeave, style }) => (
    <div
        onClick={onClick}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick();
            }
        }}
        role="button"
        tabIndex={0}
        className="header-btn-custom"
        style={style}
    >
        {children}
    </div>
);

const StaticLayout = ({ children } = {}) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { t, language, changeLanguage, languages } = useLanguage();
    const { getToken } = useRecaptcha();
    const { setUser } = useContext(AppContext);

    // Auth dialog state
    const [showAuth, setShowAuth] = useState(false);
    const [loading, setLoading] = useState(false);

    // Step 1 — credentials
    const [loginForm, setLoginForm] = useState({ email: '', password: '' });

    // Step 2 — OTP
    const [otpStep, setOtpStep] = useState(false);   // true = показываем поле OTP
    const [otpEmail, setOtpEmail] = useState('');     // email, на который отправлен код
    const [otpCode, setOtpCode] = useState('');

    const resetAuthDialog = () => {
        setOtpStep(false);
        setOtpEmail('');
        setOtpCode('');
        setLoginForm({ email: '', password: '' });
    };

    const handleCloseAuth = (open) => {
        if (!open) resetAuthDialog();
        setShowAuth(open);
    };

    // ── Шаг 1: email + пароль → получаем "otp_sent" ──────────────────────────
    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const captcha_token = await getToken('login');
            const response = await axios.post(`${API}/auth/login`, {
                ...loginForm,
                captcha_token,
            });

            // Бэкенд вернул { status: "otp_sent", email: "..." }
            if (response.data.status === 'otp_sent') {
                setOtpEmail(response.data.email);
                setOtpStep(true);
                toast.info(`${t('auth.otpSentToast')} ${response.data.email}`);
                return;
            }

            // Фолбек: если бэкенд ещё не обновлён и сразу вернул токен
            if (response.data.token) {
                finishLogin(response.data);
            }
        } catch (error) {
            const status = error.response?.status;
            const detail = error.response?.data?.detail;
            if (status === 403 && detail?.toLowerCase().includes('скоринг')) {
                toast.error(t('auth.recaptchaError'), { duration: 6000 });
            } else {
                toast.error(detail || t('auth.loginError'));
            }
        } finally {
            setLoading(false);
        }
    };

    // ── Шаг 2: OTP-код → финальный токен ─────────────────────────────────────
    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await axios.post(`${API}/auth/verify-login`, {
                email: otpEmail,
                code: otpCode,
            });
            finishLogin(response.data);
        } catch (error) {
            toast.error(error.response?.data?.detail || t('auth.invalidOtp'));
        } finally {
            setLoading(false);
        }
    };

    const finishLogin = (data) => {
        localStorage.setItem('token', data.token);
        // Sync AppContext immediately so ProtectedRoute doesn't redirect back to "/"
        if (data.user) setUser(data.user);
        setShowAuth(false);
        resetAuthDialog();
        toast.success(t('auth.loginSuccess'));

        if (data.user?.onboarding_completed === false) {
            navigate('/complete-registration');
            return;
        }
        const role = data.user?.role;
        if (role === 'admin') navigate('/admin');
        else if (role === 'contractor') navigate('/contractor/dashboard');
        else navigate('/customer/dashboard');
    };

    const pathnames = location.pathname.split('/').filter((x) => x);
    const isHomePage = location.pathname === '/';
    const breadcrumbNameMap = {
        'tenders': t('common.searchOrders'),
        'privacy': t('common.privacyPolicy'),
        'auth': t('auth.signIn'),
        '508e1745-94d6-40ca-9bd5-1e09327ad4f8': t('page.mega'),
        'registration': t('auth.register'),
    };

    // Filter languages to only include EN, RU, KK, and ZH
    const allowedLanguages = languages.filter(lang => ['en', 'ru', 'kk', 'zh'].includes(lang.code));

    return (
        <div className="flex flex-col">
            <header className="landing-header">
                <div className="header-container">
                    <div className="logo-section"  onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
                        <img src="/logo.png" alt="HubContract" className="logo-image" />
                        <span className="logo-text">HubContract</span>
                    </div>
                    <div className="sl-header-actions">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <div
                                    role="button"
                                    tabIndex={0}
                                    className="lang-trigger"
                                >
                                    <Globe size={14} />
                                    <span>{language.toUpperCase()}</span>
                                    <ChevronDown size={13} />
                                </div>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="menu-dropdown">
                                {allowedLanguages.map((lang) => (
                                    <DropdownMenuItem
                                        key={lang.code}
                                        onClick={() => changeLanguage(lang.code)}
                                        className={`language-menu-item ${language === lang.code ? 'active-language' : ''}`}
                                    >
                                        <span className="language-name">{lang.name}</span>
                                        {language === lang.code && <span className="language-check">✓</span>}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <div
                            role="button"
                            tabIndex={0}
                            className="header-signin-btn"
                            onClick={() => setShowAuth(true)}
                            onKeyDown={(e) => { if (e.key === 'Enter') setShowAuth(true); }}
                        >
                            {t('auth.signIn')}
                        </div>
                        <div
                            role="button"
                            tabIndex={0}
                            className="header-register-btn"
                            onClick={() => navigate('/registration')}
                            onKeyDown={(e) => { if (e.key === 'Enter') navigate('/registration'); }}
                        >
                            {t('auth.register')}
                        </div>
                    </div>
                </div>
            </header>

            {!isHomePage && (
                <header className="header-secondary bg-[var(--color-bg-warm)] border-b border-gray-100">
                    <div className="header-container-secondary mx-auto px-6 py-3 flex items-center justify-between">
                        <div className="breadcrumbs flex items-center gap-2 text-sm">
                            <div
                                onClick={() => navigate('/')}
                                className="flex items-center cursor-pointer hover:text-blue-600 transition-colors text-gray-500"
                            >
                                <Home size={16} className="mr-1" />
                                <span>{t('common.home')}</span>
                            </div>
                            {pathnames.map((value, index) => {
                                const last = index === pathnames.length - 1;
                                const to = `/${pathnames.slice(0, index + 1).join('/')}`;
                                const name = breadcrumbNameMap[value] || value;

                                return (
                                    <React.Fragment key={to}>
                                        <ChevronRight size={14} className="text-gray-400" />
                                        {last ? (
                                            <span className="font-medium text-blue-600 truncate max-w-[200px]">{name}</span>
                                        ) : (
                                            <span
                                                onClick={() => navigate(to)}
                                                className="cursor-pointer hover:text-blue-600 text-gray-500 transition-colors"
                                            >
                                                {name}
                                            </span>
                                        )}
                                    </React.Fragment>
                                );
                            })}
                        </div>
                    </div>
                </header>
            )}

            <main className="flex-grow overflow-y-auto min-h-0">
                {children ?? <Outlet />}
            </main>

            <footer className="footer-section">
                <div className="footer-container">
                    <div className="footer-content">
                        <div className="footer-brand">
                            <div className="footer-logo">
                                <img src="/logo.png" alt="HubContract" className="footer-logo-image" />
                                <span className="footer-logo-text">HubContract</span>
                            </div>
                            <p className="footer-description">{t('common.landingFooterDesc')}</p>
                        </div>

                        <div className="footer-contacts">
                            <h3 className="footer-section-title">{t('common.contacts')}</h3>
                            <div className="contact-list">
                                <div className="contact-item">
                                    <Mail size={18} className="contact-icon" />
                                    <div className="contact-info">
                                        <div className="contact-label">Email</div>
                                        <div className="contact-value">
                                            <a href="mailto:info@hubcontract.kz" className="contact-link">info@hubcontract.kz</a>
                                        </div>
                                    </div>
                                </div>
                                <div className="contact-item">
                                    <Location size={18} className="contact-icon" />
                                    <div className="contact-info">
                                        <div className="contact-label">{t('common.address')}</div>
                                        <div className="contact-value">
                                            {t('common.astanaAddress')}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="footer-links">
                            <h3 className="footer-section-title">{t('common.quickLinks')}</h3>
                            <div className="footer-link-list">
                                <Button variant="ghost" onClick={() => navigate('/tenders')} className="footer-link">
                                    {t('common.searchOrders')}
                                </Button>
                                <Button variant="ghost" onClick={() => navigate('/registration')} className="footer-link">
                                    {t('auth.register')}
                                </Button>
                                <Button variant="ghost" onClick={() => setShowAuth(true)} className="footer-link">
                                    {t('common.loginSystem')}
                                </Button>
                                <Button variant="ghost" onClick={() => navigate('/privacy')} className="footer-link">
                                    {t('common.privacyPolicy')}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>

            <Dialog open={showAuth} onOpenChange={handleCloseAuth}>
                <DialogOverlay className="fixed inset-c-0 z-50 bg-white/40 backdrop-blur-sm transition-all" />
                <DialogContent className="auth-dialog z-50">
                    <DialogHeader>
                        <DialogTitle className="auth-title">
                            {otpStep ? (
                                <span className="sl-otp-title">
                                    <ShieldCheck size={20} className="sl-otp-icon" />
                                    {t('auth.otpTitle')}
                                </span>
                            ) : t('auth.welcomeTitle')}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="auth-form-container">

                        {/* ── ШАГ 1: email + пароль ── */}
                        {!otpStep && (
                            <form onSubmit={handleLogin} className="auth-form">
                                <div className="form-field">
                                    <Label htmlFor="login-email">{t('auth.email')}</Label>
                                    <Input
                                        id="login-email"
                                        type="email"
                                        placeholder={t('auth.emailPlaceholder')}
                                        value={loginForm.email}
                                        onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-field">
                                    <Label htmlFor="login-password">{t('auth.password')}</Label>
                                    <Input
                                        id="login-password"
                                        type="password"
                                        placeholder={t('auth.passwordPlaceholder')}
                                        value={loginForm.password}
                                        onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="sl-auth-links">
                                    <span
                                        onClick={() => {
                                            setShowAuth(false);
                                            navigate('/registration');
                                        }}
                                        className="sl-auth-link"
                                    >
                                        {t('auth.register')}
                                    </span>
                                    <a href="/forgot-password" className="sl-auth-link">
                                        {t('auth.forgotPassword')}
                                    </a>
                                </div>

                                <Button type="submit" className="btn-primary w-full" disabled={loading}>
                                    {loading ? t('auth.signingIn') : t('auth.signIn')}
                                </Button>
                                <p className="sl-recaptcha-note">
                                    {t('auth.recaptchaNote')}{' '}
                                    <a
                                        href="https://policies.google.com/privacy"
                                        target="_blank"
                                        rel="noreferrer"
                                        className="sl-recaptcha-link"
                                    >
                                        reCAPTCHA v3
                                    </a>
                                </p>
                            </form>
                        )}

                        {/* ── ШАГ 2: OTP-код ── */}
                        {otpStep && (
                            <form onSubmit={handleVerifyOtp} className="auth-form">
                                <p className="sl-otp-hint">
                                    {t('auth.otpSentPrefix')} <strong>{otpEmail}</strong>{t('auth.otpSentSuffix')}
                                </p>
                                <div className="form-field">
                                    <Label htmlFor="otp-code">{t('auth.otpCodeLabel')}</Label>
                                    <Input
                                        id="otp-code"
                                        type="text"
                                        inputMode="numeric"
                                        pattern="[0-9]{6}"
                                        maxLength={6}
                                        placeholder="123456"
                                        value={otpCode}
                                        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                                        autoFocus
                                        required
                                    />
                                </div>

                                <Button type="submit" className="btn-primary w-full" disabled={loading || otpCode.length < 6}>
                                    {loading ? t('auth.otpVerifying') : t('auth.otpConfirm')}
                                </Button>
                                <ResendOtpButton
                                    email={otpEmail}
                                    autoStart={true}
                                    onResent={() => setOtpCode('')}
                                />
                                <button
                                    type="button"
                                    onClick={resetAuthDialog}
                                    className="sl-back-btn"
                                >
                                    {t('auth.backBtn')}
                                </button>
                            </form>
                        )}

                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default StaticLayout;