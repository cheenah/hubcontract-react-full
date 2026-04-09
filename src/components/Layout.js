import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AppContext } from '@/App';
import { useLanguage } from '@/context/LanguageContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { FileText, Home, User, LogOut, Shield, Menu, X, Building, Calendar, Users, FileBarChart, MessageSquare, Settings as SettingsIcon, ChevronDown, Bell, Award, DollarSign, File, HelpCircle, Phone, Mail } from 'lucide-react';
import { useState } from 'react';

const Layout = ({ children }) => {
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
      const API = 'https://test-api.hubcontract.kz';
      const token = localStorage.getItem('token');
      
      fetch(`${API}/api/notifications/unread-count`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      .then(res => res.json())
      .then(data => setUnreadNotifications(data.count || 0))
      .catch(err => console.error('Failed to fetch unread count:', err));
    }
  }, [user]);

  const baseNavItems = [
    { label: t('nav.dashboard'), path: '/dashboard', icon: Home },
    { label: t('nav.browseTenders'), path: '/tenders', icon: FileText },
  ];

  // Работочий кабинет (Customer workspace)
  const workspaceItems = [
    { label: 'Поиск поставщиков', path: '/supplier-search', icon: Users },
    { label: 'Заявки', path: '/supplier-bids', icon: MessageSquare },
    { label: 'Аналитика', path: '/analytics', icon: FileBarChart },
  ];

  // Профиль заказчика
  const profileItems = [
    { label: 'Регистрационные данные', path: '/organization', icon: Building },
    { label: 'Банковские счета', path: '/bank-accounts', icon: Building },
    { label: 'Сотрудники организации', path: '/employees', icon: Users },
    { label: 'Документы', path: '/profile', icon: FileText },
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
    navItems.push({ label: 'Мои тендеры', path: '/my-tenders', icon: FileText });
    navItems.push({ label: 'Договоры', path: '/contracts', icon: FileText });
  }

  // Меню для исполнителя
  if (user?.role === 'contractor') {
    navItems.push({ label: t('nav.myBids'), path: '/my-bids', icon: FileText });
    navItems.push({ label: 'Договоры', path: '/contracts', icon: FileText });
  }

  // Contractor workspace dropdown (без договоров)
  const contractorWorkspaceItems = user?.role === 'contractor' ? [
    { label: 'Банковские гарантии', path: '/contractor/guarantees', icon: Shield },
    { label: 'Квалификация и опыт', path: '/contractor/qualifications', icon: Award },
    { label: 'Финансы', path: '/contractor/finances', icon: DollarSign },
  ] : [];


  // Additional navigation items - только 2 кнопки
  const additionalNavItems = [
    { label: 'Уведомления', path: '/communications', icon: Bell, hasNotifications: unreadNotifications > 0 },
    { label: 'Отчеты', path: '/reports', icon: FileText },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="layout">
      {/* Top Header Bar */}
      <nav className="navbar">
        <div className="navbar-container">
          <div className="navbar-brand" onClick={() => navigate('/dashboard')} data-testid="navbar-brand">
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
                {languages.map((lang) => (
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

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="user-menu-trigger" data-testid="user-menu">
                  <div className="user-avatar">
                    {user?.email?.charAt(0).toUpperCase()}
                  </div>
                  <span className="user-email">{user?.email}</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="user-menu-content">
                <div className="user-info">
                  <p className="user-role">{user?.role}</p>
                  <p className="user-status">
                    {user?.documents_verified ? `✓ ${t('profile.verified')}` : `⚠️ ${t('profile.pendingReview')}`}
                  </p>
                </div>
                <DropdownMenuItem onClick={() => navigate('/profile')} data-testid="profile-menu-item">
                  <User size={16} />
                  <span>{t('nav.profile')}</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout} data-testid="logout-menu-item">
                  <LogOut size={16} />
                  <span>{t('nav.logout')}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
                <span>Language</span>
              </div>
              <div className="mobile-language-options">
                {languages.map((lang) => (
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
            <button onClick={() => { navigate('/profile'); setMobileMenuOpen(false); }} className="mobile-nav-link">
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

      <main className="main-content">{children}</main>

      {/* Footer */}
      <footer className="app-footer">
        <div className="footer-content">
          <div className="footer-section">
            <h4 className="footer-title">Контакты</h4>
            <div className="footer-contact">
              <Phone size={14} />
              <a href="tel:+77028700022">+7 (702) 870-00-22</a>
            </div>
            <div className="footer-contact">
              <Mail size={14} />
              <a href="mailto:info@hubcontract.kz">info@hubcontract.kz</a>
            </div>
          </div>

          <div className="footer-section">
            <h4 className="footer-title">Информация</h4>
            <button onClick={() => navigate('/help')} className="footer-link">
              <HelpCircle size={14} />
              <span>Центр помощи</span>
            </button>
            <button onClick={() => navigate('/privacy-policy')} className="footer-link">
              <FileText size={14} />
              <span>Политика конфиденциальности</span>
            </button>
            <button onClick={() => navigate('/terms-of-use')} className="footer-link">
              <FileText size={14} />
              <span>Условия использования</span>
            </button>
            <button onClick={() => navigate('/disclaimer')} className="footer-link">
              <FileText size={14} />
              <span>Отказ от ответственности</span>
            </button>
          </div>

          <div className="footer-section">
            <p className="footer-copyright">© 2025 HubContract. Все права защищены.</p>
            <p className="footer-description">
              Электронная платформа для проведения государственных и коммерческих закупок
            </p>
          </div>
        </div>
      </footer>

      <style jsx>{`

      `}</style>
    </div>
  );
};

export default Layout;
