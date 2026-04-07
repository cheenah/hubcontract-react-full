import React from 'react';
import {
    Globe,
    Shield,
    Search,
    FileText,
    Banknote,
    MapPin,
    Calendar,
    Mail,
    Phone,
    MapPin as Location,
    Users,
    TrendingUp,
    Award,
    CheckCircle
} from 'lucide-react';
import {Button} from "@/components/ui/button";
import {Globe as GlobeIcon} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {useNavigate} from 'react-router-dom';

const StaticLayout = ({children, t, language, languages, changeLanguage, setShowAuth}) => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex flex-col">
            {/* --- HEADER --- */}
            <header className="landing-header">
                <div className="header-container">
                    <div className="logo-section" onClick={() => navigate('/')}>
                        <img src="/logo.png" alt="HubContract" className="logo-image"/>
                        <span className="logo-text">HubContract</span>
                    </div>
                    <div style={{display: 'flex', gap: '12px', alignItems: 'center'}}>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="menu-button">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                         strokeWidth="2">
                                        <line x1="3" y1="12" x2="21" y2="12"></line>
                                        <line x1="3" y1="6" x2="21" y2="6"></line>
                                        <line x1="3" y1="18" x2="21" y2="18"></line>
                                    </svg>
                                    <span style={{fontSize: '14px', fontWeight: 500}}>Меню</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="menu-dropdown">
                                <div className="menu-section-title">Выбор языка</div>
                                {languages.map((lang) => (
                                    <DropdownMenuItem
                                        key={lang.code}
                                        onClick={() => changeLanguage(lang.code)}
                                        className={`language-menu-item ${language === lang.code ? 'active-language' : ''}`}
                                    >
                                        <Globe size={14}/>
                                        <span className="language-name">{lang.name}</span>
                                        {language === lang.code && <span className="language-check">✓</span>}
                                    </DropdownMenuItem>
                                ))}
                                <div className="menu-divider"></div>
                                <DropdownMenuItem onClick={() => setShowAuth(true)} className="menu-item-primary">
                                    Вход / Регистрация
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </header>

            {/* --- MAIN CONTENT --- */}
            <main className="flex-grow">
                {children}
            </main>

            {/* --- FOOTER --- */}
            <footer className="footer-section">
                <div className="footer-container">
                    <div className="footer-content">
                        <div className="footer-brand">
                            <div className="footer-logo">
                                <img src="/logo.png" alt="HubContract" className="footer-logo-image"/>
                                <span className="footer-logo-text">HubContract</span>
                            </div>
                            <p className="footer-description">{t('common.landingFooterDesc')}</p>
                        </div>

                        <div className="footer-contacts">
                            <h3 className="footer-section-title">{t('common.contacts')}</h3>
                            <div className="contact-list">
                                <div className="contact-item">
                                    <Mail size={18} style={{color: '#2563eb', flexShrink: 0, marginTop: '2px'}}/>
                                    <div style={{display: 'flex', flexDirection: 'column', gap: '4px'}}>
                                        <div className="contact-label">Email</div>
                                        <div style={{color: '#1a202c', fontSize: '15px', fontWeight: 500}}>
                                            <a href="mailto:info@hubcontract.kz" style={{
                                                color: 'inherit',
                                                textDecoration: 'none'
                                            }}>info@hubcontract.kz</a>
                                        </div>
                                    </div>
                                </div>
                                <div className="contact-item">
                                    <Phone size={18} style={{color: '#2563eb', flexShrink: 0, marginTop: '2px'}}/>
                                    <div style={{display: 'flex', flexDirection: 'column', gap: '4px'}}>
                                        <div className="contact-label">{t('auth.phone')}</div>
                                        <div style={{color: '#1a202c', fontSize: '15px', fontWeight: 500}}>
                                            <a href="tel:+77028700022"
                                               style={{color: 'inherit', textDecoration: 'none'}}>+7 (702) 870-00-22</a>
                                        </div>
                                    </div>
                                </div>
                                <div className="contact-item">
                                    <Location size={18} style={{color: '#2563eb', flexShrink: 0, marginTop: '2px'}}/>
                                    <div style={{display: 'flex', flexDirection: 'column', gap: '4px'}}>
                                        <div className="contact-label">{t('common.address')}</div>
                                        <div style={{color: '#1a202c', fontSize: '15px', fontWeight: 500}}>
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
                                <Button variant="ghost" onClick={() => navigate('/help')} className="footer-link">
                                    {t('common.helpCenter')}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default StaticLayout;