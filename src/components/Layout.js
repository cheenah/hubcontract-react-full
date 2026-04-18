import React from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { AppContext } from '@/App';
import { useLanguage } from '@/context/LanguageContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { FileText, Home, User, LogOut, Shield, Menu, X, Building, Calendar, Users, FileBarChart, MessageSquare, Settings as SettingsIcon, ChevronDown, Bell, Award, DollarSign, File, HelpCircle, Phone, Mail, MapPin as Location, BarChart2, Archive, ClipboardList } from 'lucide-react';
import { useState } from 'react';

const Layout = ({ children } = {}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = React.useContext(AppContext);
  const { t, language, changeLanguage, languages } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  // Handle logout with redirect
  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Fetch unread notifications count
  React.useEffect(() => {
    if (user) {
      const API = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
      const token = localStorage.getItem('token');

      fetch(`${API}/notifications/unread-count`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      .then(res => res.json())
      .then(data => setUnreadNotifications(data.count || 0))
      .catch(err => console.error('Failed to fetch unread count:', err));
    }
  }, [user]);

  const dashboardPath =
    user?.role === 'admin' ? '/admin' :
    user?.role === 'contractor' ? '/contractor/dashboard' :
    '/customer/dashboard';

  const baseNavItems = [
    { label: t('nav.dashboard'), path: dashboardPath, icon: Home },
    { label: t('nav.browseTenders'), path: '/tenders', icon: FileText },
  ];

  // Рабочий кабинет (Customer workspace)
  const workspaceItems = [
    { label: 'Поиск поставщиков', path: '/customer/supplier-search', icon: Users },
    { label: 'Заявки', path: '/customer/supplier-bids', icon: MessageSquare },
    { label: 'Аналитика', path: '/customer/analytics', icon: FileBarChart },
  ];

  // Личный кабинет исполнителя
  const contractorWorkspaceItems = [
    { label: 'Гарантии',      path: '/contractor/guarantees',     icon: Shield },
    { label: 'Квалификация',  path: '/contractor/qualifications', icon: Award },
    { label: 'Финансы',       path: '/contractor/finances',       icon: DollarSign },
    { label: 'Аналитика',     path: '/contractor/analytics',      icon: BarChart2 },
    { label: 'Архив',         path: '/contractor/archive',        icon: Archive },
  ];

  // Профиль заказчика
  const profileItems = [
    { label: 'Регистрационные данные', path: '/customer/organization', icon: Building },
    { label: 'Банковские счета', path: '/customer/bank-accounts', icon: Building },
    { label: 'Сотрудники организации', path: '/customer/employees', icon: Users },
    { label: 'Документы', path: '/customer/profile', icon: FileText },
  ];

  const navItems = [...baseNavItems];

  // Меню для администратора
  if (user?.role === 'admin') {
    navItems.push({ label: 'Тендеры', path: '/admin/tenders', icon: FileText });
    navItems.push({ label: 'Договоры', path: '/admin/contracts', icon: File });
    navItems.push({ label: 'Пользователи', path: '/admin/users', icon: Users });
  }

  // Меню для заказчика
  if (user?.role === 'customer') {
    navItems.push({ label: 'Мои тендеры', path: '/customer/tenders', icon: FileText });
    navItems.push({ label: 'Договоры', path: '/customer/contracts', icon: FileText });
  }

  // Меню для исполнителя
  if (user?.role === 'contractor') {
    navItems.push({ label: 'Мои заявки', path: '/contractor/bids', icon: ClipboardList });
    navItems.push({ label: 'Договоры',   path: '/contractor/contracts', icon: FileText });
  }

  // Additional navigation items
  const additionalNavItems = [
    { label: 'Уведомления', path: '/communications', icon: Bell, hasNotifications: unreadNotifications > 0 },
    { label: 'Отчеты', path: '/customer/reports', icon: FileText },
  ];

  const isActive = (path) => location.pathname === path;

  // Filter languages to only include EN, RU, KK, and ZH
  const allowedLanguages = languages.filter(lang => ['en', 'ru', 'kk', 'zh'].includes(lang.code));

  return (
    <div className="layout">
      {/* Top Header Bar */}
      <nav className="navbar">
        <div className="navbar-container">
          <div className="navbar-brand" onClick={() => navigate(dashboardPath)} data-testid="navbar-brand">
            <img src="/logo.png" alt="HubContract" className="logo-image-layout" />
            <span className="logo-text">HubContract</span>
          </div>

          <div className="navbar-spacer"></div>

          {/* Desktop User Menu - Right Side Only */}
          <div className="navbar-actions">
            {/* Additional Nav Items as Separate Buttons - только 2 кнопки */}
            {user && additionalNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`icon-btn ${item.hasNotifications ? 'has-notifications' : ''}`}
                  title={item.label}
                >
                  <Icon size={20} />
                  {item.hasNotifications && (
                    <span className="notification-badge">{unreadNotifications}</span>
                  )}
                </button>
              );
            })}
            {/* Language Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="language-selector" data-testid="language-selector">
                  <span className="language-code">{language.toUpperCase()}</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {allowedLanguages.map((lang) => (
                  <DropdownMenuItem
                    key={lang.code}
                    onClick={() => changeLanguage(lang.code)}
                    data-testid={`lang-${lang.code}`}
                    className={language === lang.code ? 'active-language' : ''}
                  >
                    <span className="lang-flag">{lang.flag}</span>
                    <span>{lang.name}</span>
                    {language === lang.code && <span className="checkmark">✓</span>}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Profile button – direct link, no dropdown */}
            <button
              className={`user-profile-btn ${location.pathname.includes('/profile') ? 'user-profile-btn--active' : ''}`}
              onClick={() => navigate(
                user?.role === 'customer' ? '/customer/profile' :
                user?.role === 'contractor' ? '/contractor/profile' :
                '/profile'
              )}
              data-testid="user-menu"
            >
              <div className="user-avatar">
                {user?.email?.charAt(0).toUpperCase()}
              </div>
              <span className="user-email">{user?.email}</span>
            </button>

            {/* Logout button */}
            <button
              className="logout-btn"
              onClick={handleLogout}
              title={t('nav.logout')}
            >
              <LogOut size={18} />
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            data-testid="mobile-menu-btn"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="mobile-menu">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.path}
                  onClick={() => {
                    navigate(item.path);
                    setMobileMenuOpen(false);
                  }}
                  className={`mobile-nav-link ${isActive(item.path) ? 'active' : ''}`}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </button>
              );
            })}
            <div className="mobile-menu-divider"></div>
            
            {/* Mobile Language Selector */}
            <div className="mobile-language-section">
              <div className="mobile-section-title">
                <span>{t('common.chooseLanguage')}</span>
              </div>
              <div className="mobile-language-options">
                {allowedLanguages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      changeLanguage(lang.code);
                      setMobileMenuOpen(false);
                    }}
                    className={`mobile-lang-option ${language === lang.code ? 'active' : ''}`}
                    data-testid={`mobile-lang-${lang.code}`}
                  >
                    <span className="lang-flag">{lang.flag}</span>
                    <span>{lang.name}</span>
                    {language === lang.code && <span className="checkmark">✓</span>}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="mobile-menu-divider"></div>
            <button onClick={() => { navigate(user?.role === 'customer' ? '/customer/profile' : user?.role === 'contractor' ? '/contractor/profile' : '/profile'); setMobileMenuOpen(false); }} className="mobile-nav-link">
              <User size={18} />
              <span>{t('nav.profile')}</span>
            </button>
            <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }} className="mobile-nav-link">
              <LogOut size={18} />
              <span>{t('nav.logout')}</span>
            </button>
          </div>
        )}
      </nav>

      {/* Secondary Navigation Bar - под header */}
      {user && (
        <div className="secondary-nav">
          <div className="secondary-nav-container">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`secondary-nav-link ${isActive(item.path) ? 'active' : ''}`}
                  data-testid={`nav-${item.path.replace('/', '')}`}
                >
                  <span>{item.label}</span>
                </button>
              );
            })}
            
            {/* Customer Workspace Dropdown - Рабочий кабинет */}
            {user?.role === 'customer' && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="secondary-nav-link nav-dropdown">
                    <span>Рабочий кабинет</span>
                    <ChevronDown size={16} />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="nav-dropdown-menu">
                  {workspaceItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <DropdownMenuItem
                        key={item.path}
                        onClick={() => navigate(item.path)}
                        className={isActive(item.path) ? 'active-menu-item' : ''}
                      >
                        <Icon size={16} />
                        <span>{item.label}</span>
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Customer Profile Dropdown - Профиль заказчика */}
            {user?.role === 'customer' && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="secondary-nav-link nav-dropdown">
                    <span>Профиль заказчика</span>
                    <ChevronDown size={16} />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="nav-dropdown-menu">
                  {profileItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <DropdownMenuItem
                        key={item.path + item.label}
                        onClick={() => navigate(item.path)}
                        className={isActive(item.path) ? 'active-menu-item' : ''}
                      >
                        <Icon size={16} />
                        <span>{item.label}</span>
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Contractor Workspace Dropdown - Личный кабинет исполнителя */}
            {user?.role === 'contractor' && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="secondary-nav-link nav-dropdown">
                    <span>Личный кабинет</span>
                    <ChevronDown size={16} />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="nav-dropdown-menu">
                  {contractorWorkspaceItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <DropdownMenuItem
                        key={item.path}
                        onClick={() => navigate(item.path)}
                        className={isActive(item.path) ? 'active-menu-item' : ''}
                      >
                        <Icon size={16} />
                        <span>{item.label}</span>
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      )}

      <main className="main-content">{children ?? <Outlet />}</main>

      {/* Footer */}
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
                <Button variant="ghost" onClick={() => navigate('/help')} className="footer-link">
                  {t('common.helpCenter')}
                </Button>
                <Button variant="ghost" onClick={() => navigate('/privacy-policy')} className="footer-link">
                  {t('common.privacyPolicy')}
                </Button>
                <Button variant="ghost" onClick={() => navigate('/terms-of-use')} className="footer-link">
                  {t('common.termsOfUse')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </footer>

      <style>{`
        .user-profile-btn {
          display: flex;
          align-items: center;
          gap: 10px;
          background: linear-gradient(135deg, #1e40af 0%, #2563eb 100%);
          border: none;
          border-radius: 12px;
          padding: 6px 14px 6px 6px;
          cursor: pointer;
          color: #fff;
          transition: box-shadow 0.2s, transform 0.15s;
          box-shadow: 0 2px 8px rgba(37, 99, 235, 0.35);
        }
        .user-profile-btn:hover {
          box-shadow: 0 4px 16px rgba(37, 99, 235, 0.45);
          transform: translateY(-1px);
        }
        .user-profile-btn--active {
          box-shadow: 0 0 0 3px rgba(255,255,255,0.4), 0 4px 16px rgba(37,99,235,0.5);
        }
        .user-profile-btn .user-avatar {
          width: 30px;
          height: 30px;
          background: rgba(255,255,255,0.25);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 0.95rem;
          color: #fff;
        }
        .user-profile-btn .user-email {
          font-size: 0.82rem;
          font-weight: 600;
          color: #fff;
          max-width: 150px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .logout-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          background: none;
          border: 1px solid #e5e7eb;
          border-radius: 10px;
          padding: 7px 10px;
          cursor: pointer;
          color: #ef4444;
          transition: background 0.15s, border-color 0.15s;
        }
        .logout-btn:hover {
          background: #fef2f2;
          border-color: #fca5a5;
        }
      `}</style>
    </div>
  );
};

export default Layout;