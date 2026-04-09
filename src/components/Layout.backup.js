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
import { FileText, Home, User, LogOut, Shield, Menu, X, Building, Calendar, Users, FileBarChart, MessageSquare, Settings as SettingsIcon, ChevronDown } from 'lucide-react';
import { useState } from 'react';

const Layout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = React.useContext(AppContext);
  const { t, language, changeLanguage, languages } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { label: t('nav.dashboard'), path: '/dashboard', icon: Home },
    { label: t('nav.browseTenders'), path: '/tenders', icon: FileText },
  ];

  const customerAccountItems = [
    { label: 'Профиль организации', path: '/organization', icon: Building },
    { label: 'Планы закупок', path: '/procurement-plans', icon: Calendar },
    { label: 'Заявки поставщиков', path: '/supplier-bids', icon: Users },
    { label: 'Договоры', path: '/contracts', icon: FileText },
    { label: 'Аналитика', path: '/analytics', icon: FileBarChart },
    { label: 'Коммуникации', path: '/communications', icon: MessageSquare },
    { label: 'Настройки', path: '/settings', icon: SettingsIcon },
  ];

  if (user?.role === 'customer') {
    navItems.push({ label: t('nav.myTenders'), path: '/my-tenders', icon: FileText });
  }

  if (user?.role === 'contractor') {
    navItems.push({ label: t('nav.myBids'), path: '/my-bids', icon: FileText });
  }

  if (user?.role === 'admin') {
    navItems.push({ label: t('nav.adminPanel'), path: '/admin', icon: Shield });
  }

  const isActive = (path) => location.pathname === path;

  return (
    <div className="layout">
      <nav className="navbar">
        <div className="navbar-container">
          <div className="navbar-brand" onClick={() => navigate('/dashboard')} data-testid="navbar-brand">
            <div className="logo-icon-modern">
              <div className="logo-network">
                <div className="node node-1"></div>
                <div className="node node-2"></div>
                <div className="node node-3"></div>
                <div className="connection con-1"></div>
                <div className="connection con-2"></div>
              </div>
            </div>
            <span className="logo-text">HubContract</span>
          </div>

          {/* Desktop Navigation */}
          <div className="nav-links">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`nav-link ${isActive(item.path) ? 'active' : ''}`}
                  data-testid={`nav-${item.path.replace('/', '')}`}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </button>
              );
            })}
            
            {/* Customer Personal Account Dropdown */}
            {user?.role === 'customer' && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="nav-link nav-dropdown">
                    <User size={18} />
                    <span>Личный кабинет</span>
                    <ChevronDown size={16} />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="nav-dropdown-menu">
                  {customerAccountItems.map((item) => {
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

          {/* Desktop User Menu */}
          <div className="navbar-actions">
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
                <DropdownMenuItem onClick={logout} data-testid="logout-menu-item">
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
            <button onClick={() => { logout(); setMobileMenuOpen(false); }} className="mobile-nav-link">
              <LogOut size={18} />
              <span>{t('nav.logout')}</span>
            </button>
          </div>
        )}
      </nav>

      <main className="main-content">{children}</main>

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
          height: 60px;
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
          background: rgba(255, 255, 255, 0.1);
          color: var(--text-white);
        }

        .navbar-actions {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .language-selector {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s ease;
          color: var(--text-white);
          font-size: 0.9rem;
          font-weight: 500;
        }

        .language-selector:hover {
          background: rgba(255, 255, 255, 0.15);
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
          background: rgba(255, 255, 255, 0.15);
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
          background: rgba(255, 255, 255, 0.15);
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
          background: var(--bg-secondary);
          color: var(--primary);
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
          background: var(--bg-secondary);
          color: var(--primary);
        }

        .mobile-lang-option .checkmark {
          margin-left: auto;
          color: var(--primary);
          font-weight: 600;
        }

        .main-content {
          min-height: calc(100vh - 60px);
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
        }
      `}</style>
    </div>
  );
};

export default Layout;
