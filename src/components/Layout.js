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
import { FileText, Home, User, LogOut, Shield, Menu, X, Globe, Building, Calendar, Users, FileBarChart, MessageSquare, Settings as SettingsIcon, ChevronDown, Bell, Award, DollarSign, File, HelpCircle, Phone, Mail } from 'lucide-react';
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
      const API = process.env.REACT_APP_BACKEND_URL;
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
                  <Globe size={20} />
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
                <Globe size={16} />
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
        .layout {
          min-height: 100vh;
          background: var(--bg-secondary);
        }

        .navbar {
          background: var(--bg-blue);
          border-bottom: 1px solid var(--border-medium);
          box-shadow: var(--shadow-sm);
          position: sticky;
          top: 0;
          z-index: 50;
        }

        .navbar-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 56px;
        }

        .navbar-brand {
          display: flex;
          align-items: center;
          gap: 12px;
          cursor: pointer;
          transition: opacity 0.2s ease;
        }

        .navbar-brand:hover {
          opacity: 0.8;
        }

        .logo-image-layout {
          height: 44px;
          width: auto;
          object-fit: contain;
          background: white;
          padding: 2px 8px;
          border-radius: 6px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .logo-text {
          font-size: 20px;
          font-weight: 700;
          color: var(--text-primary);
        }

        .navbar-spacer {
          flex: 1;
        }

        .logo-icon {
          width: 36px;
          height: 36px;
          background: rgba(255, 255, 255, 0.1);
          color: var(--text-white);
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          font-weight: bold;
        }

        .logo-icon-modern {
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.15);
          border-radius: 6px;
          position: relative;
          overflow: hidden;
        }

        .logo-network {
          position: relative;
          width: 20px;
          height: 20px;
        }

        .node {
          position: absolute;
          width: 3px;
          height: 3px;
          background: white;
          border-radius: 50%;
          animation: pulse 2s infinite;
        }

        .node-1 {
          top: 2px;
          left: 8px;
          animation-delay: 0s;
        }

        .node-2 {
          bottom: 2px;
          left: 2px;
          animation-delay: 0.7s;
        }

        .node-3 {
          bottom: 2px;
          right: 2px;
          animation-delay: 1.4s;
        }

        .connection {
          position: absolute;
          background: rgba(255, 255, 255, 0.6);
          animation: flow 3s infinite;
        }

        .con-1 {
          top: 4px;
          left: 9px;
          width: 1px;
          height: 12px;
          transform: rotate(45deg);
          transform-origin: top;
          animation-delay: 0.3s;
        }

        .con-2 {
          bottom: 4px;
          left: 3px;
          width: 12px;
          height: 1px;
          animation-delay: 1s;
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.7;
            transform: scale(1.2);
          }
        }

        @keyframes flow {
          0%, 100% {
            opacity: 0.3;
          }
          50% {
            opacity: 0.8;
          }
        }

        .logo-text {
          font-size: 18px;
          font-weight: 700;
          color: var(--text-white);
        }

        .nav-links {
          display: flex;
          align-items: center;
          gap: 8px;
          flex: 1;
        }

        .nav-link {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          color: rgba(255, 255, 255, 0.8);
          font-size: 14px;
          font-weight: 500;
          border-radius: 4px;
          transition: all 0.2s ease;
          border: none;
          background: none;
          cursor: pointer;
          text-decoration: none;
        }

        .nav-link:hover,
        .nav-link.active {
          background: rgba(255, 255, 255, 0.15);
          color: white;
          font-weight: 600;
        }

        .navbar-actions {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .icon-btn {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          background: transparent;
          border: none;
          border-radius: 6px;
          color: white;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .icon-btn:hover {
          background: rgba(255, 255, 255, 0.15);
          color: white;
        }

        .icon-btn.has-notifications {
          color: #16a34a; /* Зеленый цвет для колокольчика */
        }

        .notification-badge {
          position: absolute;
          top: 4px;
          right: 4px;
          min-width: 18px;
          height: 18px;
          padding: 0 5px;
          background: #16a34a; /* Зеленый фон */
          color: white;
          border-radius: 9px;
          font-size: 0.65rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid var(--primary);
        }

        .language-selector {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px;
          background: transparent;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s;
          color: var(--text-white);
          font-size: 0.9rem;
          font-weight: 500;
        }

        .language-selector:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .language-code {
          font-weight: 600;
          min-width: 20px;
        }

        .lang-flag {
          font-size: 1.1rem;
        }

        .active-language {
          background: rgba(37, 99, 235, 0.1);
          color: var(--primary);
        }

        .checkmark {
          margin-left: auto;
          color: var(--primary);
          font-weight: 600;
        }

        .user-menu-trigger {
          display: flex;
          align-items: center;
          gap: 8px;
          color: var(--text-white);
          font-size: 14px;
          font-weight: 500;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 4px;
          padding: 8px 12px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .user-menu-trigger:hover {
          background: rgba(255, 255, 255, 0.2);
          border-color: rgba(255, 255, 255, 0.3);
        }

        .user-avatar {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.2);
          color: var(--text-white);
          font-weight: 700;
          border-radius: 50%;
        }

        .user-email {
          font-size: 0.9rem;
          max-width: 150px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .user-info {
          padding: 12px 16px;
          border-bottom: 1px solid var(--border-light);
        }

        .user-role {
          font-weight: 600;
          color: var(--primary);
          text-transform: capitalize;
          margin-bottom: 4px;
        }

        .user-status {
          font-size: 0.85rem;
          color: var(--text-secondary);
        }

        .mobile-menu-btn {
          display: none;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: var(--text-white);
          padding: 8px;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .mobile-menu-btn:hover {
          background: rgba(255, 255, 255, 0.2);
          border-color: rgba(255, 255, 255, 0.3);
        }

        .mobile-menu {
          display: none;
          flex-direction: column;
          padding: 16px;
          background: var(--bg-primary);
          border-top: 1px solid var(--border-light);
        }

        .mobile-nav-link {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          background: transparent;
          border: none;
          color: var(--text-primary);
          font-size: 1rem;
          cursor: pointer;
          border-radius: 6px;
          transition: all 0.2s ease;
          width: 100%;
          text-align: left;
        }

        .mobile-nav-link:hover, .mobile-nav-link.active {
          background: rgba(0, 179, 0, 0.08);
          color: #00B300;
          font-weight: 600;
        }

        .mobile-menu-divider {
          height: 1px;
          background: var(--border-light);
          margin: 12px 0;
        }

        .mobile-language-section {
          margin: 12px 0;
        }

        .mobile-section-title {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .mobile-language-options {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .mobile-lang-option {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          background: transparent;
          border: none;
          color: var(--text-secondary);
          font-size: 1rem;
          cursor: pointer;
          border-radius: 6px;
          transition: all 0.2s ease;
          width: 100%;
          text-align: left;
        }

        .mobile-lang-option:hover, .mobile-lang-option.active {
          background: rgba(0, 179, 0, 0.08);
          color: #00B300;
          font-weight: 600;
        }

        .mobile-lang-option .checkmark {
          margin-left: auto;
          color: #00B300;
          font-weight: 600;
        }

        /* Secondary Navigation Bar */
        .secondary-nav {
          background: white;
          border-bottom: 1px solid var(--border-light);
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);
        }

        .secondary-nav-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 20px;
          display: flex;
          align-items: center;
          gap: 8px;
          height: 48px;
          overflow-x: auto;
        }

        .secondary-nav-link {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          background: transparent;
          border: none;
          border-radius: 6px;
          color: var(--text-primary);
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          white-space: nowrap;
        }

        .secondary-nav-link:hover {
          background: rgba(0, 179, 0, 0.08);
          color: #00B300;
          font-weight: 600;
        }

        .secondary-nav-link.active {
          background: rgba(0, 179, 0, 0.12);
          color: #00B300;
          font-weight: 700;
        }

        .secondary-nav-link.nav-dropdown {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .main-content {
          min-height: calc(100vh - 108px); /* 60px header + 48px secondary nav */
        }

        @media (max-width: 768px) {
          .nav-links,
          .navbar-actions {
            display: none;
          }

          .mobile-menu-btn {
            display: block;
          }

          .mobile-menu {
            display: ${mobileMenuOpen ? 'flex' : 'none'};
          }

          .user-email {
            display: none;
          }

          .logo-text {
            display: none;
          }

          .secondary-nav {
            overflow-x: auto;
          }

          .secondary-nav-container {
            padding: 0 12px;
          }

          .secondary-nav-link {
            font-size: 0.8125rem;
            padding: 6px 12px;
          }

          .main-content {
            min-height: calc(100vh - 108px);
          }

          .footer-content {
            padding: 12px 16px;
          }

          .footer-links {
            font-size: 0.875rem;
          }
        }

        .app-footer {
          background: #f8f9fa;
          border-top: 2px solid var(--border-light);
          margin-top: auto;
          padding: 40px 0 20px;
        }

        .footer-content {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 20px;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 40px;
        }

        .footer-section {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .footer-title {
          font-size: 1rem;
          font-weight: 700;
          color: #1a202c;
          margin-bottom: 8px;
        }

        .footer-contact {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #4a5568;
          font-size: 0.875rem;
        }

        .footer-contact a {
          color: #2d3748;
          text-decoration: none;
          transition: color 0.2s;
          font-weight: 500;
          font-size: 0.875rem;
        }

        .footer-contact a:hover {
          color: var(--primary);
          text-decoration: underline;
        }

        .footer-link {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #4a5568;
          background: none;
          border: none;
          cursor: pointer;
          font-size: 0.875rem;
          padding: 4px 0;
          text-align: left;
          transition: color 0.2s;
          font-family: inherit;
          padding: 0;
          transition: all 0.2s ease;
        }

        .footer-link:hover {
          color: var(--primary);
        }

        .footer-copyright {
          font-size: 0.875rem;
          color: #1a202c;
          font-weight: 600;
          margin-bottom: 4px;
        }

        .footer-description {
          font-size: 0.8125rem;
          color: #718096;
          line-height: 1.5;
        }

        @media (max-width: 768px) {
          .footer-content {
            grid-template-columns: 1fr;
            gap: 24px;
          }
        }
      `}</style>
    </div>
  );
};

export default Layout;