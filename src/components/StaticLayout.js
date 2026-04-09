import React, { useState } from 'react';
import {
    Mail,
    Phone,
    MapPin as Location,
    ChevronRight,
    Home
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLanguage } from '@/context/LanguageContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import axios from "axios";
import { toast } from "sonner";

// Константа API (замените на ваш реальный URL, если он берется из env)
const API = process.env.REACT_APP_API_URL || '';

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

const StaticLayout = ({ children }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { t, language, changeLanguage, languages } = useLanguage();

    // Состояния для авторизации
    const [showAuth, setShowAuth] = useState(false);
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState(null); // Если нужно хранить пользователя локально
    const [loginForm, setLoginForm] = useState({ email: '', password: '' });

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await axios.post(`${API}/auth/login`, loginForm);
            localStorage.setItem('token', response.data.token);
            setUser(response.data.user);
            setShowAuth(false);
            toast.success('Login successful!');

            const userRole = response.data.user.role;
            if (userRole === 'admin') {
                navigate('/admin');
            } else if (userRole === 'contractor') {
                navigate('/contractor/dashboard');
            } else {
                navigate('/dashboard');
            }
        } catch (error) {
            toast.error(error.response?.data?.detail || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    const pathnames = location.pathname.split('/').filter((x) => x);
    const isHomePage = location.pathname === '/';
    const breadcrumbNameMap = {
        'tenders': t('common.searchOrders'),
        'privacy': t('common.privacy'),
        'auth': t('auth.loginTitle'),
        '508e1745-94d6-40ca-9bd5-1e09327ad4f8': t('page.mega'),
        'registration': t('auth.register'),
    };

    return (
        <div className="flex flex-col">
            <header className="landing-header">
                <div className="header-container">
                    <div className="logo-section" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
                        <img src="/logo.png" alt="HubContract" className="logo-image" />
                        <span className="logo-text">HubContract</span>
                    </div>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <div
                                    role="button"
                                    tabIndex={0}
                                    style={{
                                        background: 'transparent',
                                        color: '#2563eb',
                                        padding: '8px 12px',
                                        height: '36px',
                                        border: '1px solid #f5f1ed',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <span style={{ fontSize: '14px', fontWeight: 500 }}>{language.toUpperCase()}</span>
                                </div>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="menu-dropdown">
                                {languages.map((lang) => (
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
                        <HeaderButton
                            onClick={() => setShowAuth(true)}
                            style={{
                                background: 'transparent',
                                color: '#2563eb',
                                padding: '8px 12px',
                                height: '36px',
                                fontSize: '14px',
                                fontWeight: 500,
                                border: '1px solid #f5f1ed',
                                cursor: 'pointer'
                            }}
                        >
                            {t('auth.signIn') || 'Вход'}
                        </HeaderButton>
                    </div>
                </div>
            </header>

            {!isHomePage && (
                <header className="header-secondary bg-[#fdfcfb] border-b border-gray-100">
                    <div className="header-container-secondary mx-auto px-6 py-3 flex items-center justify-between">
                        <div className="breadcrumbs flex items-center gap-2 text-sm">
                            <div
                                onClick={() => navigate('/')}
                                className="flex items-center cursor-pointer hover:text-blue-600 transition-colors text-gray-500"
                            >
                                <Home size={16} className="mr-1" />
                                <span>{t('common.home') || 'Главная'}</span>
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
                {children}
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
                                    <Mail size={18} style={{ color: '#2563eb', flexShrink: 0, marginTop: '2px' }} />
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                        <div className="contact-label">Email</div>
                                        <div style={{ color: '#1a202c', fontSize: '15px', fontWeight: 500 }}>
                                            <a href="mailto:info@hubcontract.kz" style={{ color: 'inherit', textDecoration: 'none' }}>info@hubcontract.kz</a>
                                        </div>
                                    </div>
                                </div>
                                <div className="contact-item">
                                    <Phone size={18} style={{ color: '#2563eb', flexShrink: 0, marginTop: '2px' }} />
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                        <div className="contact-label">{t('auth.phone')}</div>
                                        <div style={{ color: '#1a202c', fontSize: '15px', fontWeight: 500 }}>
                                            <a href="tel:+77028700022" style={{ color: 'inherit', textDecoration: 'none' }}>+7 (702) 870-00-22</a>
                                        </div>
                                    </div>
                                </div>
                                <div className="contact-item">
                                    <Location size={18} style={{ color: '#2563eb', flexShrink: 0, marginTop: '2px' }} />
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                        <div className="contact-label">{t('common.address')}</div>
                                        <div style={{ color: '#1a202c', fontSize: '15px', fontWeight: 500 }}>
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
                                <Button variant="ghost" onClick={() => setShowAuth(true)} className="footer-link">
                                    {t('auth.register')}
                                </Button>
                                <Button variant="ghost" onClick={() => setShowAuth(true)} className="footer-link">
                                    {t('common.loginSystem')}
                                </Button>
                                <Button variant="ghost" onClick={() => navigate('/privacy')} className="footer-link">
                                    {t('common.privacy')}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>

            <Dialog open={showAuth} onOpenChange={setShowAuth}>
                <DialogContent className="auth-dialog">
                    <DialogHeader>
                        <DialogTitle className="auth-title">{t('auth.welcomeTitle')}</DialogTitle>
                    </DialogHeader>

                    <div className="auth-form-container">
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

                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: '20px',
                                fontSize: '0.875rem'
                            }}>
                                <span
                                    onClick={() => {
                                        setShowAuth(false);
                                        navigate('/registration');
                                    }}
                                    style={{ color: '#1e40af', cursor: 'pointer', fontWeight: '500' }}
                                >
                                    {t('auth.register')}
                                </span>

                                <a
                                    href="/forgot-password"
                                    style={{ color: '#1e40af', textDecoration: 'none', fontWeight: '500' }}
                                >
                                    {t('auth.forgotPassword')}
                                </a>
                            </div>

                            <Button
                                type="submit"
                                className="btn-primary w-full"
                                disabled={loading}
                            >
                                {loading ? t('auth.signingIn') : t('auth.signIn')}
                            </Button>
                        </form>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default StaticLayout;