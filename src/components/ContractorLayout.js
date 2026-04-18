import React, { useState, useContext } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { AppContext } from '@/App';
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
  const { user, logout } = useContext(AppContext);
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
          background: #f5f6fa;
          font-family: inherit;
        }

        /* ── HEADER ── */
        .cl-header {
          height: 60px;
          background: #fff;
          border-bottom: 1px solid #e5e7eb;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 20px;
          position: sticky;
          top: 0;
          z-index: 100;
          box-shadow: 0 1px 4px rgba(0,0,0,0.06);
        }

        .cl-header-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .cl-hamburger {
          display: none;
          background: none;
          border: none;
          cursor: pointer;
          color: #374151;
          padding: 4px;
          border-radius: 6px;
        }
        .cl-hamburger:hover { background: #f3f4f6; }

        .cl-logo {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
        }
        .cl-logo-img { width: 28px; height: 28px; object-fit: contain; }
        .cl-logo-text {
          font-size: 1.1rem;
          font-weight: 700;
          color: #1e40af;
          letter-spacing: -0.3px;
        }

        .cl-header-right {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        /* Language button */
        .cl-lang-btn {
          display: flex;
          align-items: center;
          gap: 5px;
          background: #f3f4f6;
          border: none;
          border-radius: 8px;
          padding: 6px 10px;
          font-size: 0.8rem;
          font-weight: 600;
          color: #374151;
          cursor: pointer;
          transition: background 0.15s;
        }
        .cl-lang-btn:hover { background: #e5e7eb; }

        /* Notifications */
        .cl-notif-btn {
          background: none;
          border: none;
          cursor: pointer;
          color: #6b7280;
          padding: 8px;
          border-radius: 8px;
          transition: background 0.15s, color 0.15s;
        }
        .cl-notif-btn:hover { background: #f3f4f6; color: #1e40af; }

        /* ── PROFILE BUTTON (prominent) ── */
        .cl-profile-btn {
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
        .cl-profile-btn:hover {
          box-shadow: 0 4px 16px rgba(37, 99, 235, 0.45);
          transform: translateY(-1px);
        }
        .cl-profile-btn--active {
          box-shadow: 0 0 0 3px rgba(255,255,255,0.4), 0 4px 16px rgba(37,99,235,0.5);
        }

        .cl-profile-avatar {
          width: 30px;
          height: 30px;
          background: rgba(255,255,255,0.25);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 0.95rem;
          flex-shrink: 0;
        }

        .cl-profile-info {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          line-height: 1.2;
        }
        .cl-profile-name {
          font-size: 0.82rem;
          font-weight: 600;
          white-space: nowrap;
          max-width: 130px;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .cl-profile-role {
          font-size: 0.7rem;
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
          background: #fff;
          border-right: 1px solid #e5e7eb;
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
          padding: 12px 8px;
          gap: 2px;
        }

        .cl-nav-item {
          display: flex;
          align-items: center;
          gap: 10px;
          background: none;
          border: none;
          width: 100%;
          padding: 10px 12px;
          border-radius: 10px;
          cursor: pointer;
          color: #4b5563;
          font-size: 0.875rem;
          font-weight: 500;
          transition: background 0.15s, color 0.15s;
          position: relative;
          text-align: left;
        }
        .cl-nav-item:hover {
          background: #eff6ff;
          color: #1e40af;
        }
        .cl-nav-item--active {
          background: #eff6ff;
          color: #1e40af;
          font-weight: 600;
        }
        .cl-nav-icon { flex-shrink: 0; }
        .cl-nav-label { flex: 1; }
        .cl-nav-indicator {
          width: 4px;
          height: 20px;
          background: #2563eb;
          border-radius: 2px;
          position: absolute;
          right: -8px;
          top: 50%;
          transform: translateY(-50%);
        }

        .cl-sidebar-footer {
          padding: 12px 8px 16px;
          border-top: 1px solid #f3f4f6;
        }

        .cl-logout-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          background: none;
          border: none;
          width: 100%;
          padding: 10px 12px;
          border-radius: 10px;
          cursor: pointer;
          color: #ef4444;
          font-size: 0.875rem;
          font-weight: 500;
          transition: background 0.15s;
        }
        .cl-logout-btn:hover { background: #fef2f2; }

        .cl-logout-header-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          background: none;
          border: 1px solid rgba(255,255,255,0.25);
          border-radius: 9px;
          padding: 7px 9px;
          cursor: pointer;
          color: #ef4444;
          transition: background 0.15s, border-color 0.15s;
        }
        .cl-logout-header-btn:hover {
          background: #fef2f2;
          border-color: #fca5a5;
        }

        /* ── OVERLAY ── */
        .cl-overlay {
          display: none;
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.35);
          z-index: 90;
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
            z-index: 95;
            transform: translateX(-100%);
            transition: transform 0.25s ease;
          }
          .cl-sidebar--open {
            transform: translateX(0);
          }
          .cl-overlay { display: block; }

          .cl-nav-indicator { display: none; }
        }
      `}</style>
    </div>
  );
};

export default ContractorLayout;
