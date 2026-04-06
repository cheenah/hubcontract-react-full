
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import { AppContext } from '@/App';
import { useLanguage } from '@/context/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Shield, Award, FileText, TrendingUp, CheckCircle, Users, Globe, Search, Calendar, MapPin, Banknote, Mail, Phone, MapPin as Location } from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();
  const { setUser, API } = React.useContext(AppContext);
  const { t, language, changeLanguage, languages } = useLanguage();
  const [showAuth, setShowAuth] = useState(false);
  const [loading, setLoading] = useState(false);

  // Search and Tenders state
  const [tenders, setTenders] = useState([]);
  const [filteredTenders, setFilteredTenders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [regionFilter, setRegionFilter] = useState('');
  const [budgetMin, setBudgetMin] = useState('');
  const [budgetMax, setBudgetMax] = useState('');
  const [loadingTenders, setLoadingTenders] = useState(true);

  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({
    email: '',
    password: '',
    company_bin: '',
    phone: '',
    role: 'contractor',
    company_name: ''
  });
console.log(API)
console.log("Весь process.env:", process.env);
  // Load tenders on component mount
  useEffect(() => {
    fetchTenders();
  }, []);

  // Filter tenders when search term or filters change
  useEffect(() => {
    applyFilters();
  }, [searchTerm, categoryFilter, regionFilter, budgetMin, budgetMax, tenders]);

  const fetchTenders = async () => {
    try {
      const response = await axios.get(`${API}/tenders`); // Remove status filter to show all active tenders
      setTenders(response.data.slice(0, 10)); // Show latest 10 tenders
    } catch (error) {
      console.error('Error fetching tenders:', error);
    } finally {
      setLoadingTenders(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...tenders];

    if (searchTerm) {
      filtered = filtered.filter(
        (t) =>
          t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          t.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (categoryFilter && categoryFilter !== 'all') {
      filtered = filtered.filter((t) => t.category === categoryFilter);
    }

    if (regionFilter && regionFilter !== 'all') {
      filtered = filtered.filter((t) => t.region.toLowerCase().includes(regionFilter.toLowerCase()));
    }

    // Budget filters
    if (budgetMin && !isNaN(budgetMin)) {
      filtered = filtered.filter((t) => t.budget >= parseFloat(budgetMin));
    }

    if (budgetMax && !isNaN(budgetMax)) {
      filtered = filtered.filter((t) => t.budget <= parseFloat(budgetMax));
    }

    setFilteredTenders(filtered);
  };

  const getCategoryLabel = (category) => {
    const map = {
      construction: t('tenderList.construction'),
      it: t('tenderList.itServices'),
      consulting: t('tenderList.consulting'),
      logistics: t('tenderList.logistics'),
    };
    return map[category] || category;
  };

  const handleTenderClick = (tenderId) => {
    navigate(`/tenders/${tenderId}`);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(`${API}/auth/login`, loginForm);
      console.log(response)
      localStorage.setItem('token', response.data.token);
      setUser(response.data.user);
      setShowAuth(false); // Close modal dialog
      toast.success('Login successful!');
      
      // Navigate based on user role
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

  const handleRegister = async (e) => {
  e.preventDefault();
  setLoading(true);
  setTimeout(() => {
    toast.error('Ведутся технические работы на сервере');
    setLoading(false);
  }, 500);
};

  return (
    <div className="landing-page">
      {/* Header */}
      <header className="landing-header">
        <div className="header-container">
          <div className="logo-section">
            <img src="/logo.png" alt="HubContract" className="logo-image" />
            <span className="logo-text">HubContract</span>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            {/* Navigation Menu with all options */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="menu-button">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="3" y1="12" x2="21" y2="12"></line>
                    <line x1="3" y1="6" x2="21" y2="6"></line>
                    <line x1="3" y1="18" x2="21" y2="18"></line>
                  </svg>
                  <span style={{ fontSize: '14px', fontWeight: 500 }}>Меню</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="menu-dropdown">
                {/* Language Selection Submenu */}
                <div className="menu-section-title">Выбор языка</div>
                {languages.map((lang) => (
                  <DropdownMenuItem
                    key={lang.code}
                    onClick={() => changeLanguage(lang.code)}
                    className={`language-menu-item ${language === lang.code ? 'active-language' : ''}`}
                  >
                    <Globe size={14} />
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

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-container">
          <div className="hero-content">
            <div className="hero-badge" data-testid="platform-badge">
              <Shield size={16} />
              <span>{t('landing.platformBadge')}</span>
            </div>
            <h1 className="hero-title" data-testid="hero-title">
              {t('landing.heroTitle')}
              <span className="hero-highlight">{t('landing.heroHighlight')}</span>
            </h1>
            <p className="hero-description" data-testid="hero-subtitle">
              {t('landing.heroDescription')}
            </p>

            {/* Stats */}
            <div className="hero-stats">
              <div className="stat-item">
                <div className="stat-number">500+</div>
                <div className="stat-label">{t('landing.stats.activeTenders')}</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">1,200+</div>
                <div className="stat-label">{t('landing.stats.verifiedContractors')}</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">98%</div>
                <div className="stat-label">{t('landing.stats.successRate')}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Search and Tenders Section - Two Column Layout */}
      <section className="public-tenders-section">
        <div className="tenders-container">
          <h2 className="section-main-title">{t('tenderList.searchTitle')}</h2>
          
          <div className="search-content-grid">
            {/* Left Column - Advanced Search */}
            <div className="search-panel">
              <div className="search-form-advanced">
                <h3 className="search-form-title">{t('tenderList.advancedSearch')}</h3>
                
                {/* Primary Search */}
                <div className="search-group">
                  <label className="search-label">{t('tenderList.searchByKeywords')}</label>
                  <div className="search-input-container">
                    <Search className="search-icon" size={20} />
                    <Input
                      placeholder={t('tenderList.searchPlaceholder')}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="search-input-main"
                    />
                  </div>
                </div>

                {/* Filters Grid */}
                <div className="filters-grid">
                  <div className="filter-group">
                    <label className="search-label">{t('tenderList.categoryLabel')}</label>
                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                      <SelectTrigger className="filter-select-advanced">
                        <SelectValue placeholder={t('tenderList.allCategories')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{t('tenderList.allCategories')}</SelectItem>
                        <SelectItem value="construction">{t('tenderList.construction')}</SelectItem>
                        <SelectItem value="it">{t('tenderList.itServices')}</SelectItem>
                        <SelectItem value="consulting">{t('tenderList.consulting')}</SelectItem>
                        <SelectItem value="logistics">{t('tenderList.logistics')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

<div className="filter-group">
  <label className="search-label">{t('tenderList.regionLabel')}</label>
  <Select value={regionFilter} onValueChange={setRegionFilter}>
    <SelectTrigger className="filter-select-advanced">
      <SelectValue placeholder={t('tenderList.regions.all')} />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="all">{t('tenderList.regions.all')}</SelectItem>
      <SelectItem value="almaty">{t('tenderList.regions.almaty')}</SelectItem>
      <SelectItem value="astana">{t('tenderList.regions.astana')}</SelectItem>
      <SelectItem value="shymkent">{t('tenderList.regions.shymkent')}</SelectItem>
      <SelectItem value="aktobe">{t('tenderList.regions.aktobe')}</SelectItem>
      <SelectItem value="karaganda">{t('tenderList.regions.karaganda')}</SelectItem>
    </SelectContent>
  </Select>
</div>

                  <div className="filter-group">
                    <label className="search-label">{t('tenderList.typeLabel')}</label>
                    <Select value="" onValueChange={() => {}}>
                      <SelectTrigger className="filter-select-advanced">
                        <SelectValue placeholder={t('tenderList.allTypes')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{t('tenderList.allTypes')}</SelectItem>
                        <SelectItem value="services">{t('tenderList.priceProposals')}</SelectItem>
                        <SelectItem value="supplies">{t('tenderList.openCompetition')}</SelectItem>
                        <SelectItem value="works">{t('tenderList.auction')}</SelectItem>
                        <SelectItem value="mixed">{t('tenderList.singleSource')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="filter-group">
                    <label className="search-label">{t('tenderList.statusLabel')}</label>
                    <Select value="" onValueChange={() => {}}>
                      <SelectTrigger className="filter-select-advanced">
                        <SelectValue placeholder={t('tenderList.allStatuses')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">{t('landing.stats.activeTenders')}</SelectItem>
                        <SelectItem value="new">{t('dashboard.recentTenders')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Budget Range */}
                <div className="search-group">
                  <label className="search-label">{t('tenderList.budgetLabel')}</label>
                  <div className="budget-range">
                    <Input
                      placeholder={t('tenderList.budgetFrom')}
                      type="number"
                      value={budgetMin}
                      onChange={(e) => setBudgetMin(e.target.value)}
                      className="budget-input"
                    />
                    <span className="budget-separator">—</span>
                    <Input
                      placeholder={t('tenderList.budgetTo')}
                      type="number" 
                      value={budgetMax}
                      onChange={(e) => setBudgetMax(e.target.value)}
                      className="budget-input"
                    />
                  </div>
                </div>

                {/* Date Range */}
                <div className="search-group">
                  <label className="search-label">Дата размещения</label>
                  <div className="date-range">
                    <Input
                      type="date"
                      className="date-input"
                    />
                    <span className="date-separator">—</span>
                    <Input
                      type="date"
                      className="date-input"
                    />
                  </div>
                </div>

                {/* Search Buttons */}
                <div className="search-buttons">
                  <Button 
                    onClick={() => navigate('tenders')}
                    className="search-btn-primary"
                    size="lg"
                  >
                    <Search size={18} />
                    {t('tenderList.showResults')}
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => {
                      setSearchTerm('');
                      setCategoryFilter('');
                      setRegionFilter('');
                      setBudgetMin('');
                      setBudgetMax('');
                    }}
                    className="search-btn-reset"
                  >
                    {t('tenderList.clearFilters')}
                  </Button>
                </div>
              </div>
            </div>

            {/* Right Column - Active Tenders */}
            <div className="tenders-panel">
              <div className="tenders-header-advanced">
                <h3 className="tenders-title-advanced">Активные заказы</h3>
                <div className="tenders-stats">
                  <span className="tenders-count">Найдено: {filteredTenders.length}</span>
                  <Button 
                    variant="link" 
                    onClick={() => navigate('/tenders')}
                    className="view-all-link"
                  >
                    Смотреть все →
                  </Button>
                </div>
              </div>

              {loadingTenders ? (
                <div className="loading-state">
                  <div className="loading-spinner"></div>
                  <p>Загрузка заказов...</p>
                </div>
              ) : filteredTenders.length === 0 ? (
                <div className="empty-state-advanced">
                  <FileText size={48} className="empty-icon" />
                  <h4>Заказы не найдены</h4>
                  <p>Попробуйте изменить критерии поиска</p>
                </div>
              ) : (
                <div className="public-tenders-list-advanced">
                  {filteredTenders.slice(0, 8).map((tender) => (
                    <div
                      key={tender.id}
                      className="public-tender-card-compact"
                      onClick={() => handleTenderClick(tender.id)}
                    >
                      <div className="tender-card-header">
                        <div className="tender-id-category">
                          <span className="tender-number">№ {1161000 + tender.id}</span>
                          <span className="tender-category-badge">{getCategoryLabel(tender.category)}</span>
                        </div>
                        <span className="tender-status-active">Активный</span>
                      </div>
                      
                      <h4 className="tender-title-compact">{tender.title}</h4>
                      
                      <div className="tender-info-row">
                        <div className="tender-budget-highlight">
                          <Banknote size={16} />
                          <span>{tender.budget?.toLocaleString() ?? ''} ₸</span>
                        </div>
                        <div className="tender-location">
                          <MapPin size={14} />
                          <span>{tender.region}</span>
                        </div>
                      </div>
                      
                      <div className="tender-footer-compact">
                        <div className="tender-deadline">
                          <Calendar size={14} />
                          <span>до {new Date(tender.deadline).toLocaleDateString()}</span>
                        </div>
                        <div className="tender-action">
                          Подать предложение →
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="features-container">
          <div className="section-header">
            <h2 className="section-title" data-testid="features-title">{t('landing.features.title')}</h2>
            <p className="section-description">{t('landing.features.subtitle')}</p>
          </div>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon primary">
                <FileText size={28} />
              </div>
              <h3 className="feature-title">{t('landing.features.tenderCreation')}</h3>
              <p className="feature-description">
                {t('landing.features.tenderCreationDesc')}
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon success">
                <Shield size={28} />
              </div>
              <h3 className="feature-title">{t('landing.features.autoVerification')}</h3>
              <p className="feature-description">
                {t('landing.features.autoVerificationDesc')}
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon secondary">
                <Award size={28} />
              </div>
              <h3 className="feature-title">{t('landing.features.transparentSelection')}</h3>
              <p className="feature-description">
                {t('landing.features.transparentSelectionDesc')}
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon warning">
                <TrendingUp size={28} />
              </div>
              <h3 className="feature-title">{t('landing.features.analytics')}</h3>
              <p className="feature-description">
                {t('landing.features.analyticsDesc')}
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon accent">
                <CheckCircle size={28} />
              </div>
              <h3 className="feature-title">{t('landing.features.compliance')}</h3>
              <p className="feature-description">
                {t('landing.features.complianceDesc')}
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon info">
                <Users size={28} />
              </div>
              <h3 className="feature-title">{t('landing.features.userManagement')}</h3>
              <p className="feature-description">
                {t('landing.features.userManagementDesc')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="footer-section">
        <div className="footer-container">
          <div className="footer-content">
            {/* Logo and Company Info */}
            <div className="footer-brand">
              <div className="footer-logo">
                <img src="/logo.png" alt="HubContract" className="footer-logo-image" />
                <span className="footer-logo-text">HubContract</span>
              </div>
              <p className="footer-description">
                Профессиональная платформа для поиска надежных поставщиков и подрядчиков. 
                Безопасная, прозрачная и эффективная система подбора исполнителей.
              </p>
            </div>

            {/* Contact Information */}
            <div className="footer-contacts">
              <h3 className="footer-section-title">Контакты</h3>
              <div className="contact-list">
                <div className="contact-item">
                  <Mail size={18} style={{ color: '#2563eb', flexShrink: 0, marginTop: '2px' }} />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ fontSize: '11px', color: '#718096', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Email
                    </div>
                    <div style={{ color: '#1a202c', fontSize: '15px', fontWeight: 500, lineHeight: '1.4' }}>
                      <a href="mailto:info@hubcontract.kz" style={{ color: 'inherit', textDecoration: 'none' }}>
                        info@hubcontract.kz
                      </a>
                    </div>
                  </div>
                </div>
                <div className="contact-item">
                  <Phone size={18} style={{ color: '#2563eb', flexShrink: 0, marginTop: '2px' }} />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ fontSize: '11px', color: '#718096', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Телефон
                    </div>
                    <div style={{ color: '#1a202c', fontSize: '15px', fontWeight: 500, lineHeight: '1.4' }}>
                      <a href="tel:+77028700022" style={{ color: 'inherit', textDecoration: 'none' }}>
                        +7 (702) 870-00-22
                      </a>
                    </div>
                  </div>
                </div>
                <div className="contact-item">
                  <Location size={18} style={{ color: '#2563eb', flexShrink: 0, marginTop: '2px' }} />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ fontSize: '11px', color: '#718096', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Адрес
                    </div>
                    <div style={{ color: '#1a202c', fontSize: '15px', fontWeight: 500, lineHeight: '1.4' }}>
                      Казахстан, г. Астана<br />
                      Проспект Мангилик Ел, 55/7
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="footer-links">
              <h3 className="footer-section-title">Быстрые ссылки</h3>
              <div className="footer-link-list">
                <Button 
                  variant="ghost" 
                  onClick={() => navigate('/tenders')}
                  className="footer-link"
                >
                  Поиск заказов
                </Button>
                <Button 
                  variant="ghost"
                  onClick={() => setShowAuth(true)}
                  className="footer-link"
                >
                  Регистрация
                </Button>
                <Button 
                  variant="ghost"
                  onClick={() => setShowAuth(true)}
                  className="footer-link"
                >
                  Войти в систему
                </Button>
              </div>
            </div>
          </div>

          {/* Footer Bottom */}
          {/*<div className="footer-bottom">*/}
          {/*  <div className="footer-copyright">*/}
          {/*    <p>&copy; 2025 HubContract. Все права защищены.</p>*/}
          {/*  </div>*/}
          {/*  <div className="footer-legal">*/}
          {/*    <button onClick={() => navigate('/privacy-policy')} className="legal-link">*/}
          {/*      Политика конфиденциальности*/}
          {/*    </button>*/}
          {/*    <span className="legal-divider">|</span>*/}
          {/*    <button onClick={() => navigate('/terms-of-use')} className="legal-link">*/}
          {/*      Условия использования*/}
          {/*    </button>*/}
          {/*    <span className="legal-divider">|</span>*/}
          {/*    <button onClick={() => navigate('/disclaimer')} className="legal-link">*/}
          {/*      Отказ от ответственности*/}
          {/*    </button>*/}
          {/*  </div>*/}
          {/*</div>*/}
        </div>
      </footer>

      {/* Auth Dialog */}
      <Dialog open={showAuth} onOpenChange={setShowAuth}>
        <DialogContent className="auth-dialog" data-testid="auth-dialog">
          <DialogHeader>
            <DialogTitle className="auth-title">{t('auth.welcomeTitle')}</DialogTitle>
          </DialogHeader>
          
          <Tabs defaultValue="login" className="auth-tabs">
            <TabsList className="auth-tabs-list">
              <TabsTrigger value="login" data-testid="login-tab">{t('auth.signIn')}</TabsTrigger>
              <TabsTrigger value="register" data-testid="register-tab">{t('auth.register')}</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
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
                    data-testid="login-email-input"
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
                    data-testid="login-password-input"
                  />
                </div>
                
                <div style={{ textAlign: 'right', marginBottom: '12px' }}>
                  <a 
                    href="/forgot-password" 
                    style={{ 
                      color: '#1e40af', 
                      fontSize: '0.875rem', 
                      textDecoration: 'none',
                      fontWeight: '500',
                      transition: 'color 0.2s'
                    }}
                    onMouseEnter={(e) => e.target.style.color = '#1e3a8a'}
                    onMouseLeave={(e) => e.target.style.color = '#1e40af'}
                  >
                    {t('auth.forgotPassword')}
                  </a>
                </div>
                
                <Button
                  type="submit"
                  className="btn-primary w-full"
                  disabled={loading}
                  data-testid="login-submit-btn"
                >
                  {loading ? t('auth.signingIn') : t('auth.signIn')}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="register">
              <form onSubmit={handleRegister} className="auth-form">
                <div className="form-field">
                  <Label htmlFor="register-email">{t('auth.email')}</Label>
                  <Input
                    id="register-email"
                    type="email"
                    placeholder={t('auth.emailPlaceholder')}
                    value={registerForm.email}
                    onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                    required
                    data-testid="register-email-input"
                  />
                </div>
                <div className="form-field">
                  <Label htmlFor="register-password">{t('auth.password')}</Label>
                  <Input
                    id="register-password"
                    type="password"
                    placeholder={t('auth.createPassword')}
                    value={registerForm.password}
                    onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                    required
                    data-testid="register-password-input"
                  />
                </div>
                <div className="form-field">
                  <Label htmlFor="company-bin">{t('auth.companyBin')}</Label>
                  <Input
                    id="company-bin"
                    type="text"
                    placeholder={t('auth.binPlaceholder')}
                    value={registerForm.company_bin}
                    onChange={(e) => setRegisterForm({ ...registerForm, company_bin: e.target.value })}
                    required
                    maxLength={12}
                    data-testid="register-bin-input"
                  />
                </div>
                <div className="form-field">
                  <Label htmlFor="phone">{t('auth.phone')}</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder={t('auth.phonePlaceholder')}
                    value={registerForm.phone}
                    onChange={(e) => setRegisterForm({ ...registerForm, phone: e.target.value })}
                    required
                    data-testid="register-phone-input"
                  />
                </div>
                <div className="form-field">
                  <Label htmlFor="company-name">{t('auth.companyName')}</Label>
                  <Input
                    id="company-name"
                    type="text"
                    placeholder={t('auth.companyPlaceholder')}
                    value={registerForm.company_name}
                    onChange={(e) => setRegisterForm({ ...registerForm, company_name: e.target.value })}
                    data-testid="register-company-input"
                  />
                </div>
                <div className="form-field">
                  <Label htmlFor="role">{t('auth.accountType')}</Label>
                  <Select
                    value={registerForm.role}
                    onValueChange={(value) => setRegisterForm({ ...registerForm, role: value })}
                  >
                    <SelectTrigger data-testid="register-role-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="customer" data-testid="role-customer">{t('auth.customer')}</SelectItem>
                      <SelectItem value="contractor" data-testid="role-contractor">{t('auth.contractor')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  type="submit"
                  className="btn-primary w-full"
                  disabled={loading}
                  data-testid="register-submit-btn"
                >
                  {loading ? t('auth.creatingAccount') : t('auth.createAccount')}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      <style jsx>{`
        .landing-page {
          min-height: 100vh;
          background: linear-gradient(180deg, #ffffff 0%, #f9fafb 100%);
        }

        /* Header */
        .landing-header {
          background: white;
          border-bottom: 1px solid var(--border-light);
          padding: 12px 0;
          position: sticky;
          top: 0;
          z-index: 100;
          box-shadow: var(--shadow-sm);
        }

        .header-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 32px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .logo-section {
          display: flex;
          align-items: center;
          gap: 12px;
          cursor: pointer;
        }

        .logo-image {
          height: 38px;
          width: auto;
          object-fit: contain;
          background: white;
          padding: 2px 8px;
          border-radius: 6px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .logo-text {
          font-size: 24px;
          font-weight: 700;
          color: #1a202c;
        }

        .logo-icon {
          width: 42px;
          height: 42px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--primary);
          color: white;
          font-weight: 700;
          font-size: 20px;
          border-radius: 8px;
        }

        .logo-icon-modern {
          width: 42px;
          height: 42px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, var(--primary) 0%, #1e40af 100%);
          border-radius: 8px;
          position: relative;
          overflow: hidden;
        }

        .logo-network {
          position: relative;
          width: 24px;
          height: 24px;
        }

        .node {
          position: absolute;
          width: 4px;
          height: 4px;
          background: white;
          border-radius: 50%;
          animation: pulse 2s infinite;
        }

        .node-1 {
          top: 2px;
          left: 10px;
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
          left: 12px;
          width: 1px;
          height: 16px;
          transform: rotate(45deg);
          transform-origin: top;
          animation-delay: 0.3s;
        }

        .con-2 {
          bottom: 4px;
          left: 4px;
          width: 16px;
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
          font-size: 20px;
          font-weight: 700;
          color: var(--text-primary);
        }

        .header-btn {
          background: var(--primary);
          color: white;
          padding: 10px 24px;
          border-radius: 6px;
          font-weight: 600;
          border: none;
          cursor: pointer;
          transition: all 0.2s;
        }

        .header-btn:hover {
          background: var(--primary-dark);
        }

        /* Hero Section */
        .hero-section {
          padding: 100px 0 120px;
        }

        .hero-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 32px;
        }

        .hero-content {
          text-align: center;
          max-width: 900px;
          margin: 0 auto;
        }

        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 20px;
          background: rgba(37, 99, 235, 0.05);
          border: 1px solid rgba(37, 99, 235, 0.2);
          border-radius: 50px;
          color: var(--primary);
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 28px;
        }

        .hero-title {
          font-size: clamp(2.5rem, 5vw, 3.75rem);
          font-weight: 700;
          line-height: 1.2;
          margin-bottom: 24px;
          color: var(--text-primary);
        }

        .hero-highlight {
          color: var(--primary);
        }

        .hero-description {
          font-size: clamp(1.05rem, 2vw, 1.2rem);
          color: var(--text-secondary);
          line-height: 1.7;
          margin-bottom: 40px;
          max-width: 700px;
          margin-left: auto;
          margin-right: auto;
        }

        .hero-actions {
          display: flex;
          gap: 16px;
          justify-content: center;
          margin-bottom: 60px;
        }

        .btn-hero-primary {
          background: var(--primary);
          color: white;
          padding: 14px 32px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 16px;
          border: none;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: var(--shadow-md);
        }

        .btn-hero-primary:hover {
          background: var(--primary-dark);
          box-shadow: var(--shadow-lg);
          transform: translateY(-2px);
        }

        .btn-hero-secondary {
          background: white;
          color: var(--primary);
          padding: 14px 32px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 16px;
          border: 1px solid var(--border-medium);
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-hero-secondary:hover {
          background: var(--bg-secondary);
          border-color: var(--primary);
        }

        .hero-stats {
          display: flex;
          justify-content: center;
          gap: 60px;
          padding: 32px;
          background: white;
          border-radius: 16px;
          box-shadow: var(--shadow-lg);
          border: 1px solid var(--border-light);
        }

        .stat-item {
          text-align: center;
        }

        .stat-number {
          font-size: 2.5rem;
          font-weight: 700;
          color: var(--primary);
          margin-bottom: 4px;
        }

        .stat-label {
          font-size: 14px;
          color: var(--text-secondary);
          font-weight: 500;
        }

        /* Features Section */
        .features-section {
          padding: 80px 0;
          background: white;
        }

        .features-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 32px;
        }

        .section-header {
          text-align: center;
          margin-bottom: 60px;
        }

        .section-title {
          font-size: clamp(2rem, 4vw, 2.5rem);
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 12px;
        }

        .section-description {
          font-size: 1.1rem;
          color: var(--text-secondary);
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 32px;
        }

        .feature-card {
          padding: 40px 32px;
          background: white;
          border: 1px solid var(--border-light);
          border-radius: 16px;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: var(--shadow-card);
        }

        .feature-card:hover {
          box-shadow: var(--shadow-hover);
          transform: translateY(-8px);
          border-color: rgba(0, 179, 0, 0.3);
        }

        .feature-icon {
          width: 80px;
          height: 80px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 20px;
          margin-bottom: 24px;
          position: relative;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 
            0 10px 25px -5px rgba(0, 0, 0, 0.1),
            0 8px 10px -6px rgba(0, 0, 0, 0.1),
            inset 0 1px 0 rgba(255, 255, 255, 0.6);
        }
        
        .feature-icon::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 20px;
          background: linear-gradient(
            135deg,
            rgba(255, 255, 255, 0.4) 0%,
            rgba(255, 255, 255, 0) 50%,
            rgba(0, 0, 0, 0.05) 100%
          );
          pointer-events: none;
        }
        
        .feature-icon svg, .feature-icon i {
          position: relative;
          z-index: 1;
          filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
        }

        .feature-icon.primary {
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          color: white;
        }

        .feature-icon.success {
          background: linear-gradient(135deg, #00CC00 0%, #00B300 100%);
          color: white;
          box-shadow: 
            0 10px 25px -5px rgba(0, 179, 0, 0.3),
            0 8px 10px -6px rgba(0, 179, 0, 0.2),
            inset 0 1px 0 rgba(255, 255, 255, 0.6);
        }

        .feature-icon.secondary {
          background: linear-gradient(135deg, #0ea5e9 0%, #0891b2 100%);
          color: white;
        }

        .feature-icon.warning {
          background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
          color: white;
        }

        .feature-icon.accent {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
        }

        .feature-icon.info {
          background: linear-gradient(135deg, #818cf8 0%, #6366f1 100%);
          color: white;
        }
        
        .feature-card:hover .feature-icon {
          transform: translateY(-8px) scale(1.05);
          box-shadow: 
            0 20px 35px -5px rgba(0, 0, 0, 0.15),
            0 12px 15px -8px rgba(0, 0, 0, 0.12),
            inset 0 1px 0 rgba(255, 255, 255, 0.6);
        }
        
        .feature-card:hover .feature-icon.success {
          box-shadow: 
            0 20px 35px -5px rgba(0, 179, 0, 0.4),
            0 12px 15px -8px rgba(0, 179, 0, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.6);
        }

        .feature-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 12px;
        }

        .feature-description {
          color: var(--text-secondary);
          line-height: 1.6;
        }

        /* Auth Dialog */
        .auth-dialog {
          max-width: 500px;
        }

        .auth-title {
          text-align: center;
          font-size: 1.75rem;
          color: var(--text-primary);
          font-weight: 700;
        }

        .auth-tabs-list {
          width: 100%;
          background: var(--bg-secondary);
        }

        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
          margin-top: 24px;
        }

        .form-field {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .language-selector-landing {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 6px 10px;
          background: transparent;
          border: 1px solid var(--border-medium);
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s;
          color: var(--text-primary);
          font-weight: 500;
          font-size: 13px;
        }
        
        .language-code {
          display: inline;
          min-width: 18px;
          text-align: center;
          font-size: 12px;
        }

        .language-selector-landing:hover {
          background: var(--bg-secondary);
          border-color: var(--primary);
        }

        .menu-button {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 10px 16px;
          font-size: 14px;
          height: 42px;
          color: white;
          background: #2563eb;
          border: 1px solid #2563eb;
          border-radius: 6px;
          font-weight: 500;
        }

        .menu-button:hover {
          background: #1d4ed8;
          border-color: #1d4ed8;
        }

        .menu-dropdown {
          min-width: 240px;
          padding: 8px 0;
        }

        .menu-section-title {
          padding: 8px 12px 4px;
          font-size: 11px;
          font-weight: 700;
          color: #2d3748;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          background: #f7fafc;
          margin: 0 -8px;
          padding-left: 20px;
          padding-right: 20px;
        }

        .menu-divider {
          height: 1px;
          background: #e2e8f0;
          margin: 8px 0;
        }

        .menu-item-primary {
          color: var(--btn-green) !important;
          font-weight: 600 !important;
          background: #f0fdf4 !important;
        }

        .menu-item-primary:hover {
          background: #dcfce7 !important;
        }
        
        /* Language Menu Compact Styles */
        .language-menu-compact {
          min-width: 160px;
          max-height: 320px;
          overflow-y: auto;
        }
        
        .language-menu-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 14px;
          cursor: pointer;
          transition: background 0.2s;
        }
        
        .language-menu-item:hover {
          background: var(--bg-secondary);
        }
        
        .language-name {
          flex: 1;
          font-size: 14px;
        }
        
        .language-check {
          margin-left: auto;
          color: var(--btn-green);
          font-weight: bold;
          font-size: 16px;
        }

        .active-language {
          background: #f0fdf4;
          color: #166534;
          font-weight: 600;
        }
        
        /* Mobile optimization */
        @media (max-width: 640px) {
          .language-selector-landing {
            padding: 8px 12px;
          }
          
          .language-menu-compact {
            min-width: 140px;
          }
          
          .language-menu-item {
            padding: 8px 12px;
          }
          
          .language-name {
            font-size: 13px;
          }
        }

        /* Public Tenders Section - Two Column Layout */
        .public-tenders-section {
          padding: 60px 0 80px;
          background: var(--bg-secondary);
          min-height: 80vh;
        }

        .tenders-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 24px;
        }

        .section-main-title {
          font-size: 2.5rem;
          font-weight: 700;
          color: var(--text-primary);
          text-align: center;
          margin-bottom: 40px;
        }

        .search-content-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 40px;
          min-height: 70vh;
        }

        /* Left Panel - Advanced Search */
        .search-panel {
          background: white;
          border: 1px solid var(--border-light);
          border-radius: 8px;
          padding: 32px;
          box-shadow: var(--shadow-card);
          height: fit-content;
          position: sticky;
          top: 100px;
        }

        .search-form-advanced {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .search-form-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 8px;
          padding-bottom: 16px;
          border-bottom: 2px solid var(--primary);
        }

        .search-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .search-label {
          font-size: 14px;
          font-weight: 600;
          color: var(--text-primary);
        }

        .search-input-container {
          position: relative;
        }

        .search-input-main {
          width: 100%;
          padding: 14px 20px 14px 50px;
          border: 1px solid var(--border-medium);
          border-radius: 4px;
          font-size: 14px;
        }

        .search-input-main:focus {
          outline: none;
          border-color: var(--primary);
          box-shadow: 0 0 0 2px rgba(30, 64, 175, 0.1);
        }

        .filters-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .filter-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .filter-select-advanced {
          width: 100%;
          padding: 12px 16px;
        }

        .budget-range, .date-range {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .budget-input, .date-input {
          flex: 1;
          padding: 12px 16px;
          border: 1px solid var(--border-medium);
          border-radius: 4px;
        }

        .budget-separator, .date-separator {
          color: var(--text-muted);
          font-weight: 600;
        }

        .search-buttons {
          display: flex;
          gap: 12px;
          margin-top: 16px;
        }

        .search-btn-primary {
          flex: 1;
          background: var(--primary);
          color: white;
          border: none;
          padding: 14px 24px;
          border-radius: 4px;
          font-weight: 600;
          font-size: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .search-btn-primary:hover {
          background: var(--primary-dark);
        }

        .search-btn-reset {
          flex: 1;
          border: 1px solid var(--border-medium);
          color: var(--text-secondary);
        }

        /* Right Panel - Tenders List */
        .tenders-panel {
          background: white;
          border: 1px solid var(--border-light);
          border-radius: 8px;
          overflow: hidden;
          box-shadow: var(--shadow-card);
          height: fit-content;
        }

        .tenders-header-advanced {
          background: var(--bg-tertiary);
          padding: 20px 24px;
          border-bottom: 1px solid var(--border-light);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .tenders-title-advanced {
          font-size: 1.3rem;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0;
        }

        .tenders-stats {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .tenders-count {
          font-size: 14px;
          color: var(--text-secondary);
          font-weight: 500;
        }

        .view-all-link {
          color: var(--primary);
          font-weight: 600;
          font-size: 14px;
          padding: 0;
          height: auto;
        }

        .loading-state {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          padding: 80px 20px;
          color: var(--text-muted);
        }

        .loading-state p {
          margin-top: 12px;
          font-size: 14px;
        }

        .empty-state-advanced {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 80px 20px;
          text-align: center;
        }

        .empty-icon {
          color: var(--text-muted);
          margin-bottom: 16px;
        }

        .empty-state-advanced h4 {
          font-size: 1.2rem;
          color: var(--text-primary);
          margin-bottom: 8px;
        }

        .empty-state-advanced p {
          color: var(--text-muted);
          font-size: 14px;
        }

        .public-tenders-list-advanced {
          display: flex;
          flex-direction: column;
          gap: 0;
          padding: 0;
          max-height: 70vh;
          overflow-y: auto;
        }

        .public-tender-card-compact {
          padding: 20px 24px;
          border-bottom: 1px solid var(--border-light);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .public-tender-card-compact:hover {
          background: var(--bg-hover);
        }

        .public-tender-card-compact:last-child {
          border-bottom: none;
        }

        .tender-card-header {
          display: flex;
          justify-content: space-between;
          align-items: start;
          margin-bottom: 12px;
        }

        .tender-id-category {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .tender-number {
          font-size: 12px;
          color: var(--text-muted);
          font-weight: 600;
        }

        .tender-category-badge {
          font-size: 11px;
          color: var(--primary);
          font-weight: 600;
          text-transform: uppercase;
          background: rgba(30, 64, 175, 0.1);
          padding: 2px 8px;
          border-radius: 10px;
          width: fit-content;
        }

        .tender-status-active {
          padding: 4px 10px;
          border-radius: 10px;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          background: rgba(22, 163, 74, 0.1);
          color: var(--accent);
        }

        .tender-title-compact {
          font-size: 1.1rem;
          font-weight: 600;
          color: var(--text-primary);
          margin: 0 0 12px 0;
          line-height: 1.4;
        }

        .tender-info-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .tender-budget-highlight {
          display: flex;
          align-items: center;
          gap: 6px;
          font-weight: 700;
          color: var(--accent);
          font-size: 1.1rem;
        }

        .tender-location {
          display: flex;
          align-items: center;
          gap: 6px;
          color: var(--text-secondary);
          font-size: 14px;
        }

        .tender-footer-compact {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 12px;
          border-top: 1px solid var(--border-light);
        }

        .tender-deadline {
          display: flex;
          align-items: center;
          gap: 6px;
          color: var(--text-muted);
          font-size: 13px;
        }

        .tender-action {
          color: var(--primary);
          font-size: 13px;
          font-weight: 600;
        }

        /* Mobile Responsiveness */
        @media (max-width: 1024px) {
          .search-content-grid {
            grid-template-columns: 1fr;
            gap: 24px;
          }

          .search-panel {
            position: static;
          }

          .filters-grid {
            grid-template-columns: 1fr;
          }

          .search-buttons {
            flex-direction: column;
          }
        }

        @media (max-width: 768px) {
          .section-main-title {
            font-size: 2rem;
          }

          .search-panel, .tenders-panel {
            margin: 0 -8px;
            border-left: none;
            border-right: none;
            border-radius: 0;
          }

          .tender-info-row {
            flex-direction: column;
            align-items: flex-start;
            gap: 8px;
          }

          .tender-footer-compact {
            flex-direction: column;
            align-items: flex-start;
            gap: 8px;
          }
        }

        /* Footer Section */
        .footer-section {
          background: var(--bg-primary);
          border-top: 1px solid var(--border-light);
          padding: 60px 0 20px;
          margin-top: 80px;
        }

        .footer-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 32px;
        }

        .footer-content {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr;
          gap: 60px;
          margin-bottom: 40px;
        }

        .footer-brand {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .footer-logo {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .footer-logo-image {
          height: 64px;
          width: auto;
          object-fit: contain;
          background: white;
          padding: 3px 10px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .footer-logo-text {
          font-size: 24px;
          font-weight: 700;
          color: var(--text-primary);
        }

        .footer-description {
          color: var(--text-secondary);
          line-height: 1.6;
          font-size: 14px;
        }

        .footer-contacts {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .footer-links {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .footer-section-title {
          font-size: 18px;
          font-weight: 600;
          color: var(--text-primary);
          margin: 0;
        }

        .contact-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .contact-item {
          display: flex;
          align-items: start;
          gap: 12px;
        }

        .contact-item svg {
          color: var(--primary);
          margin-top: 2px;
          flex-shrink: 0;
        }

        .contact-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .contact-label {
          font-size: 11px;
          color: #718096;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .contact-value {
          color: #1a202c !important;
          font-size: 15px !important;
          font-weight: 500 !important;
          text-decoration: none !important;
          line-height: 1.4 !important;
          display: inline !important;
          visibility: visible !important;
        }

        .contact-value:hover {
          color: #2563eb;
          text-decoration: underline;
        }

        .contact-link-visible {
          display: inline !important;
          visibility: visible !important;
          opacity: 1 !important;
          color: #1a202c !important;
          font-size: 15px !important;
          font-weight: 500 !important;
        }

        .contact-link-visible:hover {
          color: #2563eb !important;
          text-decoration: underline !important;
        }

        .footer-link-list {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .footer-link {
          justify-content: flex-start;
          padding: 8px 0;
          color: var(--text-secondary);
          font-size: 14px;
          height: auto;
        }

        .footer-link:hover {
          color: var(--primary);
          background: transparent;
        }

        .footer-bottom {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 30px;
          border-top: 1px solid var(--border-light);
          flex-wrap: wrap;
          gap: 20px;
        }

        .footer-copyright p {
          margin: 0;
          color: var(--text-muted);
          font-size: 14px;
        }

        .footer-legal {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .legal-link {
          color: var(--text-muted);
          font-size: 14px;
          cursor: pointer;
          transition: color 0.2s ease;
          background: none;
          border: none;
          padding: 0;
          text-decoration: underline;
        }

        .legal-link:hover {
          color: var(--primary);
        }

        .legal-divider {
          color: var(--border-medium);
        }

        /* Footer Responsive */
        @media (max-width: 1024px) {
          .footer-content {
            grid-template-columns: 1fr 1fr;
            gap: 40px;
          }

          .footer-brand {
            grid-column: 1 / -1;
          }
        }

        @media (max-width: 768px) {
          .footer-content {
            grid-template-columns: 1fr;
            gap: 30px;
          }

          .footer-bottom {
            flex-direction: column;
            align-items: center;
            text-align: center;
            gap: 16px;
          }

          .footer-section {
            margin-top: 60px;
            padding: 40px 0 20px;
          }
        }

        @media (max-width: 768px) {
          .search-title {
            font-size: 2rem;
          }

          .search-form {
            padding: 0 16px;
          }

          .search-filters {
            flex-direction: column;
            align-items: stretch;
          }

          .filter-select, .filter-input {
            min-width: auto;
            width: 100%;
          }

          .public-tenders-list {
            grid-template-columns: 1fr;
          }

          .tenders-header {
            flex-direction: column;
            gap: 16px;
            align-items: flex-start;
          }
        }

        @media (max-width: 768px) {
          .hero-stats {
            flex-direction: column;
            gap: 24px;
          }

          .features-grid {
            grid-template-columns: 1fr;
          }

          .hero-actions {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
};

export default LandingPage;