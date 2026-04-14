import React, {useState, useEffect} from 'react';
import {useNavigate} from 'react-router-dom';
import axios from 'axios';
import {toast} from 'sonner';
import {AppContext} from '@/App';
import {useLanguage} from '@/context/LanguageContext';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Card} from '@/components/ui/card';
import {Tabs, TabsContent, TabsList, TabsTrigger} from '@/components/ui/tabs';
import {Dialog, DialogContent, DialogHeader, DialogTitle} from '@/components/ui/dialog';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {
    Shield,
    Award,
    FileText,
    TrendingUp,
    CheckCircle,
    Users,
    Search,
    Calendar,
    MapPin,
    Banknote,
    Mail,
    Phone,
    MapPin as Location
} from 'lucide-react';
import StaticLayout from '@/components/StaticLayout';

const LandingPage = () => {
    const navigate = useNavigate();
    const {setUser, API} = React.useContext(AppContext);
    const {t, language, changeLanguage, languages} = useLanguage();
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

    const [loginForm, setLoginForm] = useState({email: '', password: ''});
    const [registerForm, setRegisterForm] = useState({
        email: '',
        password: '',
        company_bin: '',
        phone: '',
        role: 'contractor',
        company_name: ''
    });
// console.log(API)
// console.log("Весь process.env:", process.env);
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
            const response = await axios.get(`${API}/tenders`);
            setTenders(response.data.filter(t => t.status !== 'archive').slice(0, 10));
        } catch (error) {
            console.error('Error fetching tenders:', error);
        } finally {
            setLoadingTenders(false);
        }
    };

    const applyFilters = () => {
        if (!tenders || tenders.length === 0) {
            setFilteredTenders([]);
            return;
        }

        let filtered = tenders.filter((t) => t.status !== 'archive');

        if (searchTerm && searchTerm.trim() !== "") {
            const lowSearch = searchTerm.toLowerCase().trim();
            filtered = filtered.filter((tender) => {
                const fieldsToSearch = [
                    tender.title, tender.title_en, tender.title_kk, tender.title_zh,
                    tender.description, tender.description_en, tender.description_kk, tender.description_zh,
                    tender.tender_number
                ];
                return fieldsToSearch.some(field => field?.toLowerCase().includes(lowSearch));
            });
        }

        if (categoryFilter && categoryFilter !== 'all') {
            const selectedCat = String(categoryFilter).toLowerCase().trim();
            filtered = filtered.filter((t) =>
                t.category?.toLowerCase().includes(selectedCat)
            );
        }

        if (regionFilter && regionFilter !== 'all') {
            const lowRegion = String(regionFilter).toLowerCase().trim();
            filtered = filtered.filter((t) =>
                t.region?.toLowerCase().includes(lowRegion)
            );
        }

        if (budgetMin !== "" && budgetMin !== null && !isNaN(budgetMin)) {
            const min = parseFloat(budgetMin);
            filtered = filtered.filter((t) => (t.budget || 0) >= min);
        }

        if (budgetMax !== "" && budgetMax !== null && !isNaN(budgetMax)) {
            const max = parseFloat(budgetMax);
            filtered = filtered.filter((t) => (t.budget || 0) <= max);
        }

        setFilteredTenders(filtered);
    };

    const getLocalizedField = (item, field) => {
        if (!item) return '';
        if (language === 'ru') return item[field] || '';
        return item[`${field}_${language}`] || item[field] || '';
    };

    const getCategoryLabel = (category) => {
        const map = {
            construction: t('tenderList.construction'),
            it: t('tenderList.itServices'),
            consulting: t('tenderList.consulting'),
            logistics: t('tenderList.logistics'),
            oil_gas_chemistry: t('tenderList.oil_gas_chemistry'),
        };
        return map[category] || category;
    };

    const handleTenderClick = (tenderId) => {
        navigate(`/tenders/${tenderId}`);
    };


    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await axios.post(`${API}/auth/register`, registerForm);
            localStorage.setItem('token', response.data.token);
            setUser(response.data.user);
            toast.success('Registration successful!');
            navigate('/dashboard');
        } catch (error) {
            toast.error(error.response?.data?.detail || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (

        <StaticLayout
            t={t}
            language={language}
            languages={languages}
            changeLanguage={changeLanguage}
            setShowAuth={setShowAuth}
        >

            {/* Hero Section */}
            <section className="hero-section">
                <div className="hero-container">
                    <div className="hero-content">
                        <div className="hero-badge" data-testid="platform-badge">
                            <Shield size={16}/>
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
                                        <Search className="search-icon" size={20}/>
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
                                                <SelectValue placeholder={t('tenderList.allCategories')}/>
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">{t('tenderList.allCategories')}</SelectItem>
                                                <SelectItem
                                                    value="construction">{t('tenderList.construction')}</SelectItem>
                                                <SelectItem value="it">{t('tenderList.itServices')}</SelectItem>
                                                <SelectItem value="consulting">{t('tenderList.consulting')}</SelectItem>
                                                <SelectItem value="logistics">{t('tenderList.logistics')}</SelectItem>
                                                <SelectItem
                                                    value="oil_gas_chemistry">{t('tenderList.oil_gas_chemistry')}</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="filter-group">
                                        <label className="search-label">{t('tenderList.regionLabel')}</label>
                                        <Select value={regionFilter} onValueChange={setRegionFilter}>
                                            <SelectTrigger className="filter-select-advanced">
                                                <SelectValue placeholder={t('tenderList.regions.all')}/>
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">{t('tenderList.regions.all')}</SelectItem>
                                                <SelectItem value="almaty">{t('tenderList.regions.almaty')}</SelectItem>
                                                <SelectItem value="astana">{t('tenderList.regions.astana')}</SelectItem>
                                                <SelectItem
                                                    value="shymkent">{t('tenderList.regions.shymkent')}</SelectItem>
                                                <SelectItem value="aktobe">{t('tenderList.regions.aktobe')}</SelectItem>
                                                <SelectItem
                                                    value="karaganda">{t('tenderList.regions.karaganda')}</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="filter-group">
                                        <label className="search-label">{t('tenderList.typeLabel')}</label>
                                        <Select value="" onValueChange={() => {
                                        }}>
                                            <SelectTrigger className="filter-select-advanced">
                                                <SelectValue placeholder={t('tenderList.allTypes')}/>
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">{t('tenderList.allTypes')}</SelectItem>
                                                <SelectItem
                                                    value="services">{t('tenderList.priceProposals')}</SelectItem>
                                                <SelectItem
                                                    value="supplies">{t('tenderList.openCompetition')}</SelectItem>
                                                <SelectItem value="works">{t('tenderList.auction')}</SelectItem>
                                                <SelectItem value="mixed">{t('tenderList.singleSource')}</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="filter-group">
                                        <label className="search-label">{t('tenderList.statusLabel')}</label>
                                        <Select value="" onValueChange={() => {
                                        }}>
                                            <SelectTrigger className="filter-select-advanced">
                                                <SelectValue placeholder={t('tenderList.allStatuses')}/>
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem
                                                    value="active">{t('landing.stats.activeTenders')}</SelectItem>
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
                                    <label className="search-label">{t('common.postDate')}</label>
                                    <div className="date-range">
                                        <Input type="date" className="date-input"/>
                                        <span className="date-separator">—</span>
                                        <Input type="date" className="date-input"/>
                                    </div>
                                </div>

                                {/* Search Buttons */}
                                <div className="search-buttons">
                                    <Button
                                        onClick={() => navigate('tenders')}
                                        className="search-btn-primary"
                                        size="lg"
                                    >
                                        <Search size={18}/>
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
                                <h3 className="tenders-title-advanced">{t('landing.stats.activeTenders')}</h3>
                                <div className="tenders-stats">
                                    <span
                                        className="tenders-count">{t('tenderList.found')} {filteredTenders.length}</span>
                                    <Button
                                        variant="link"
                                        onClick={() => navigate('/tenders')}
                                        className="view-all-link"
                                    >
                                        {t('common.viewAll')}
                                    </Button>
                                </div>
                            </div>

                            {loadingTenders ? (
                                <div className="loading-state">
                                    <div className="loading-spinner"></div>
                                    <p>{t('common.loadingOrders')}</p>
                                </div>
                            ) : filteredTenders.length === 0 ? (
                                <div className="empty-state-advanced">
                                    <FileText size={48} className="empty-icon"/>
                                    <h4>{t('tenderList.noTendersFound')}</h4>
                                    <p>{t('common.tryChangingFilters')}</p>
                                </div>
                            ) : (
                                <div className="public-tenders-list-advanced">
                                    {filteredTenders.slice(0, 3).map((tender) => (
                                        <div
                                            key={tender.id}
                                            className="public-tender-card-compact"
                                            onClick={() => handleTenderClick(tender.id)}
                                        >
                                            <div className="tender-card-header">
                                                <div className="tender-id-category">
                                                    <span className="tender-number">№ {tender.tender_number}</span>
                                                    <span
                                                        className="tender-category-badge">{getCategoryLabel(tender.category)}</span>
                                                </div>
                                                <span className="tender-status-active">{t('status.active')}</span>
                                            </div>

                                            <h4 className="tender-title-compact">{getLocalizedField(tender, 'title')}</h4>

                                            <p className="tender-description-compact">
                                                {getLocalizedField(tender, 'description')?.length > 150
                                                    ? getLocalizedField(tender, 'description').substring(0, 150) + '...'
                                                    : getLocalizedField(tender, 'description')}
                                            </p>

                                            <div className="tender-info-row">
                                                <div className="tender-budget-highlight">
                                                    <Banknote size={16}/>
                                                    <span>{tender.budget?.toLocaleString() ?? ''} {tender.id === '508e1745-94d6-40ca-9bd5-1e09327ad4f8' ? `$` : '₸'}</span>
                                                </div>
                                                <div className="tender-location">
                                                    <MapPin size={14}/>
                                                    <span>{tender.region}</span>
                                                </div>

                                            </div>

                                            <div className="tender-footer-compact">
                                                <div className="tender-deadline">
                                                    <Calendar size={14}/>
                                                    <span>{t('tenderList.until')} {new Date(tender.deadline).toLocaleDateString()}</span>
                                                </div>
                                                <div className="tender-action">
                                                    {t('tenderDetail.submitProposal')} →
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
                        <h2 className="section-title">{t('landing.features.title')}</h2>
                        <p className="section-description">{t('landing.features.subtitle')}</p>
                    </div>

                    <div className="features-grid">
                        <div className="feature-card">
                            <div className="feature-icon primary"><FileText size={28}/></div>
                            <h3 className="feature-title">{t('landing.features.tenderCreation')}</h3>
                            <p className="feature-description">{t('landing.features.tenderCreationDesc')}</p>
                        </div>

                        <div className="feature-card">
                            <div className="feature-icon success"><Shield size={28}/></div>
                            <h3 className="feature-title">{t('landing.features.autoVerification')}</h3>
                            <p className="feature-description">{t('landing.features.autoVerificationDesc')}</p>
                        </div>

                        <div className="feature-card">
                            <div className="feature-icon secondary"><Award size={28}/></div>
                            <h3 className="feature-title">{t('landing.features.transparentSelection')}</h3>
                            <p className="feature-description">{t('landing.features.transparentSelectionDesc')}</p>
                        </div>

                        <div className="feature-card">
                            <div className="feature-icon warning"><TrendingUp size={28}/></div>
                            <h3 className="feature-title">{t('landing.features.analytics')}</h3>
                            <p className="feature-description">{t('landing.features.analyticsDesc')}</p>
                        </div>

                        <div className="feature-card">
                            <div className="feature-icon accent"><CheckCircle size={28}/></div>
                            <h3 className="feature-title">{t('landing.features.compliance')}</h3>
                            <p className="feature-description">{t('landing.features.complianceDesc')}</p>
                        </div>

                        <div className="feature-card">
                            <div className="feature-icon info"><Users size={28}/></div>
                            <h3 className="feature-title">{t('landing.features.userManagement')}</h3>
                            <p className="feature-description">{t('landing.features.userManagementDesc')}</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer Section */}


            {/* Auth Dialog */}



        </StaticLayout>
    );
};

export default LandingPage;

