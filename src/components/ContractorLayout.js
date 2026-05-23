import React, { useState } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import useAuthStore from '@/store/authStore';
import { useLanguage } from '@/context/LanguageContext';
import {
  LayoutDashboard,
  FileText,
  ClipboardList,
  Shield,
  Award,
  DollarSign,
  BarChart2,
  Archive,
  Bell,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Globe,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const menuItems = [
  { label: 'Главная',        path: '/contractor/dashboard',      icon: LayoutDashboard },
  { label: 'Тендеры',        path: '/tenders',                   icon: FileText },
  { label: 'Мои заявки',     path: '/contractor/bids',           icon: ClipboardList },
  { label: 'Договоры',       path: '/contractor/contracts',      icon: FileText },
  { label: 'Гарантии',       path: '/contractor/guarantees',     icon: Shield },
  { label: 'Квалификация',   path: '/contractor/qualifications', icon: Award },
  { label: 'Финансы',        path: '/contractor/finances',       icon: DollarSign },
  { label: 'Аналитика',      path: '/contractor/analytics',      icon: BarChart2 },
  { label: 'Архив',          path: '/contractor/archive',        icon: Archive },
];

const ContractorLayout = ({ children } = {}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const { t, language, changeLanguage, languages } = useLanguage();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const allowedLanguages = languages.filter(lang =>
    ['en', 'ru', 'kk', 'zh'].includes(lang.code)
  );

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className="cl-root">
      {/* ── TOP HEADER ── */}
      <header className="cl-header">
        {/* left: hamburger + logo */}
        <div className="cl-header-left">
          <button
            className="cl-hamburger"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="toggle menu"
          >
            {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
          <div
            className="cl-logo"
            onClick={() => navigate('/contractor/dashboard')}
          >
            <img src="/logo.png" alt="HubContract" className="cl-logo-img" />
            <span className="cl-logo-text">HubContract</span>
          </div>
        </div>

        {/* right: language + notifications + profile */}
        <div className="cl-header-right">
          {/* Language */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="cl-lang-btn">
                <Globe size={15} />
                <span>{language.toUpperCase()}</span>
                <ChevronDown size={13} />
              </button>
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

          {/* Notifications */}
          <button
            className="cl-notif-btn"
            onClick={() => navigate('/communications')}
            title="Уведомления"
          >
            <Bell size={20} />
          </button>

          {/* Profile – prominent button, direct link */}
          <button
            className={`cl-profile-btn ${isActive('/contractor/profile') ? 'cl-profile-btn--active' : ''}`}
            onClick={() => navigate('/contractor/profile')}
          >
            <div className="cl-profile-avatar">
              {user?.email?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="cl-profile-info">
              <span className="cl-profile-name">
                {user?.first_name
                  ? `${user.first_name} ${user.last_name || ''}`.trim()
                  : user?.email?.split('@')[0]}
              </span>
              <span className="cl-profile-role">Исполнитель</span>
            </div>
          </button>

          {/* Logout */}
          <button className="cl-logout-header-btn" onClick={handleLogout} title="Выйти">
            <LogOut size={18} />
          </button>
        </div>
      </header>

      <div className="cl-body">
        {/* ── LEFT SIDEBAR ── */}
        <aside className={`cl-sidebar ${sidebarOpen ? 'cl-sidebar--open' : ''}`}>
          <nav className="cl-nav">
            {menuItems.map(({ label, path, icon: Icon }) => (
              <button
                key={path}
                onClick={() => { navigate(path); setSidebarOpen(false); }}
                className={`cl-nav-item ${isActive(path) ? 'cl-nav-item--active' : ''}`}
              >
                <Icon size={18} className="cl-nav-icon" />
                <span className="cl-nav-label">{label}</span>
                {isActive(path) && <span className="cl-nav-indicator" />}
              </button>
            ))}
          </nav>

          <div className="cl-sidebar-footer">
            <button className="cl-logout-btn" onClick={handleLogout}>
              <LogOut size={16} />
              <span>Выйти</span>
            </button>
          </div>
        </aside>

        {/* overlay for mobile */}
        {sidebarOpen && (
          <div className="cl-overlay" onClick={() => setSidebarOpen(false)} />
        )}

        {/* ── MAIN CONTENT ── */}
        <main className="cl-main">{children ?? <Outlet />}</main>
      </div>

      <style>{`
        /* ── ROOT ── */
        .cl-root {
          display: flex;
          flex-direction: column;
          min-height: 100vh;
          background: var(--color-bg-warm);
          font-family: inherit;
        }

        /* ── HEADER ── */
        .cl-header {
          height: 60px;
          background: var(--color-bg-surface);
          border-bottom: 1px solid var(--color-border);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 var(--space-5);
          position: sticky;
          top: 0;
          z-index: 100;
          box-shadow: var(--shadow-xs);
        }

        .cl-header-left {
          display: flex;
          align-items: center;
          gap: var(--space-3);
        }

        .cl-hamburger {
          display: none;
          background: none;
          border: none;
          cursor: pointer;
          color: var(--color-text-secondary);
          padding: var(--space-1);
          border-radius: var(--radius-md);
        }
        .cl-hamburger:hover { background: var(--color-bg-muted); }

        .cl-logo {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          cursor: pointer;
        }
        .cl-logo-img { width: 28px; height: 28px; object-fit: contain; }
        .cl-logo-text {
          font-size: var(--font-size-xl3);
          font-weight: var(--font-weight-bold);
          color: var(--color-primary-dark);
          letter-spacing: -0.3px;
        }

        .cl-header-right {
          display: flex;
          align-items: center;
          gap: var(--space-2);
        }

        /* Language button */
        .cl-lang-btn {
          display: flex;
          align-items: center;
          gap: 5px;
          background: var(--color-bg-muted);
          border: none;
          border-radius: var(--radius-lg);
          padding: var(--space-1-5) var(--space-2-5);
          font-size: var(--font-size-sm);
          font-weight: var(--font-weight-semibold);
          color: var(--color-text-secondary);
          cursor: pointer;
          transition: background var(--transition-fast);
        }
        .cl-lang-btn:hover { background: var(--color-border); }

        /* Notifications */
        .cl-notif-btn {
          background: none;
          border: none;
          cursor: pointer;
          color: var(--color-text-muted);
          padding: var(--space-2);
          border-radius: var(--radius-lg);
          transition: background var(--transition-fast), color var(--transition-fast);
        }
        .cl-notif-btn:hover { background: var(--color-bg-muted); color: var(--color-primary-dark); }

        /* ── PROFILE BUTTON (prominent) ── */
        .cl-profile-btn {
          display: flex;
          align-items: center;
          gap: var(--space-2-5);
          background: var(--color-primary-gradient);
          border: none;
          border-radius: var(--radius-2xl);
          padding: 6px 14px 6px 6px;
          cursor: pointer;
          color: var(--color-text-inverse);
          transition: box-shadow var(--transition-normal), transform var(--transition-fast);
          box-shadow: var(--shadow-blue-md);
        }
        .cl-profile-btn:hover {
          box-shadow: 0 4px 16px rgba(37, 99, 235, 0.35);
          transform: translateY(-1px);
        }
        .cl-profile-btn--active {
          box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.4), 0 4px 16px rgba(37, 99, 235, 0.35);
        }

        .cl-profile-avatar {
          width: 30px;
          height: 30px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: var(--radius-lg);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: var(--font-weight-bold);
          font-size: var(--font-size-base);
          flex-shrink: 0;
        }

        .cl-profile-info {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          line-height: var(--line-height-tight);
        }
        .cl-profile-name {
          font-size: var(--font-size-sm);
          font-weight: var(--font-weight-semibold);
          white-space: nowrap;
          max-width: 130px;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .cl-profile-role {
          font-size: var(--font-size-xxs);
          opacity: 0.8;
        }

        /* ── BODY ── */
        .cl-body {
          display: flex;
          flex: 1;
          overflow: hidden;
          position: relative;
        }

        /* ── SIDEBAR ── */
        .cl-sidebar {
          width: 220px;
          flex-shrink: 0;
          background: var(--color-bg-surface);
          border-right: 1px solid var(--color-border);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          overflow-y: auto;
          height: calc(100vh - 60px);
          position: sticky;
          top: 60px;
        }

        .cl-nav {
          display: flex;
          flex-direction: column;
          padding: var(--space-3) var(--space-2);
          gap: 2px;
        }

        .cl-nav-item {
          display: flex;
          align-items: center;
          gap: var(--space-2-5);
          background: none;
          border: none;
          width: 100%;
          padding: var(--space-2-5) var(--space-3);
          border-radius: var(--radius-xl);
          cursor: pointer;
          color: var(--color-text-tertiary);
          font-size: var(--font-size-base);
          font-weight: var(--font-weight-medium);
          transition: background var(--transition-fast), color var(--transition-fast);
          position: relative;
          text-align: left;
        }
        .cl-nav-item:hover {
          background: var(--color-primary-bg);
          color: var(--color-primary-dark);
        }
        .cl-nav-item--active {
          background: var(--color-primary-bg);
          color: var(--color-primary-dark);
          font-weight: var(--font-weight-semibold);
        }
        .cl-nav-icon { flex-shrink: 0; }
        .cl-nav-label { flex: 1; }
        .cl-nav-indicator {
          width: 4px;
          height: 20px;
          background: var(--color-primary);
          border-radius: var(--radius-sm);
          position: absolute;
          right: -8px;
          top: 50%;
          transform: translateY(-50%);
        }

        .cl-sidebar-footer {
          padding: var(--space-3) var(--space-2) var(--space-4);
          border-top: 1px solid var(--color-border-muted);
        }

        .cl-logout-btn {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          background: none;
          border: none;
          width: 100%;
          padding: var(--space-2-5) var(--space-3);
          border-radius: var(--radius-xl);
          cursor: pointer;
          color: var(--color-danger);
          font-size: var(--font-size-base);
          font-weight: var(--font-weight-medium);
          transition: background var(--transition-fast);
        }
        .cl-logout-btn:hover { background: var(--color-danger-tint-05); }

        .cl-logout-header-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          background: none;
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: var(--radius-md);
          padding: 7px 9px;
          cursor: pointer;
          color: var(--color-danger);
          transition: background var(--transition-fast), border-color var(--transition-fast);
        }
        .cl-logout-header-btn:hover {
          background: var(--color-danger-tint-05);
          border-color: var(--color-danger-tint-20);
        }

        /* ── OVERLAY ── */
        .cl-overlay {
          display: none;
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.15);
          z-index: var(--z-overlay);
        }

        /* ── MAIN ── */
        .cl-main {
          flex: 1;
          overflow-y: auto;
          height: calc(100vh - 60px);
        }

        /* ── MOBILE ── */
        @media (max-width: 768px) {
          .cl-hamburger { display: flex; }
          .cl-profile-info { display: none; }
          .cl-profile-chevron { display: none; }

          .cl-sidebar {
            position: fixed;
            top: 60px;
            left: 0;
            height: calc(100vh - 60px);
            z-index: 200;
            transform: translateX(-100%);
            transition: transform var(--transition-slow) ease;
          }
          .cl-sidebar--open {
            transform: translateX(0);
          }
          .cl-overlay { display: block; z-index: 150; }

          .cl-nav-indicator { display: none; }
        }
      `}</style>
    </div>
  );
};

export default ContractorLayout;
