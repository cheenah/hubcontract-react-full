import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AppContext } from '@/App';
import { useLanguage } from '@/context/LanguageContext';
import Layout from '@/components/Layout';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter } from 'lucide-react';
import StaticLayout from '../../components/StaticLayout';

const TenderList = () => {
  const navigate = useNavigate();
  const { API, user } = React.useContext(AppContext);
  const { t, language } = useLanguage(); // language вернет 'ru', 'en', 'kk' или 'zh'
  const [tenders, setTenders] = useState([]);
  const [filteredTenders, setFilteredTenders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [regionFilter, setRegionFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [minBudget, setMinBudget] = useState('');
  const [maxBudget, setMaxBudget] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTenders();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchTerm, categoryFilter, typeFilter, regionFilter, statusFilter, minBudget, maxBudget, tenders, language]);

  const fetchTenders = async () => {
    try {
      const response = await axios.get(`${API}/tenders`);
      setTenders(response.data);
    } catch (error) {
      console.error('Error fetching tenders:', error);
    } finally {
      setLoading(false);
    }
  };

  // Хелпер для получения переведенного поля из объекта тендера
  const getLocalizedField = (item, field) => {
    if (language === 'ru') return item[field];
    const localizedValue = item[`${field}_${language}`];
    return localizedValue || item[field]; // Фоллбэк на основной язык
  };

  const applyFilters = () => {
    let filtered = [...tenders];

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter((t) => {
        // Поиск по всем языковым версиям заголовка и описания
        const fieldsToSearch = [
          t.title, t.title_en, t.title_kk, t.title_zh,
          t.description, t.description_en, t.description_kk, t.description_zh,
          t.tender_number
        ];
        return fieldsToSearch.some(field =>
          field?.toLowerCase().includes(searchLower)
        );
      });
    }

    if (categoryFilter && categoryFilter !== 'all' && categoryFilter !== '') {
      filtered = filtered.filter((t) => t.category === categoryFilter);
    }

    if (typeFilter && typeFilter !== 'all' && typeFilter !== '') {
      filtered = filtered.filter((t) => t.tender_type === typeFilter);
    }

    if (regionFilter && regionFilter !== 'all' && regionFilter !== '') {
      filtered = filtered.filter((t) => t.region === regionFilter);
    }

    if (statusFilter && statusFilter !== 'all' && statusFilter !== '') {
      filtered = filtered.filter((t) => t.status === statusFilter);
    }

    if (minBudget) {
      filtered = filtered.filter((t) => t.budget >= Number(minBudget));
    }

    if (maxBudget) {
      filtered = filtered.filter((t) => t.budget <= Number(maxBudget));
    }

    setFilteredTenders(filtered);
  };

  const getCategoryLabel = (category) => {
    const map = {
      construction: t('tenderList.construction'),
      it: t('tenderList.itServices'),
      itServices: t('tenderList.itServices'),
      consulting: t('tenderList.consulting'),
      logistics: t('tenderList.logistics'),
      oil_gas_chemistry: t('tenderList.oil_gas_chemistry'),
    };
    return map[category] || category;
  };

  const getTypeLabel = (type) => {
    const map = {
      price_proposals: t('tenderList.priceProposals'),
      open_competition: t('tenderList.openCompetition'),
      auction: t('tenderList.auction'),
      single_source: t('tenderList.singleSource'),
    };
    return map[type] || type.replace('_', ' ');
  };

  const getStatusLabel = (status) => t(`status.${status}`);

  return (
    <StaticLayout>
      <div className="tender-list-container" data-testid="tender-list">
        <div className="tender-list-header">
          <h1 className="page-title">{t('tenderList.title')}</h1>
          <p className="page-subtitle">{t('tenderList.subtitle')}</p>
        </div>

        <Card className="filters-card">
          <div className="filters-header">
            <h3 className="filters-title">{t('tenderList.searchTitle')}</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchTerm('');
                setCategoryFilter('all');
                setTypeFilter('all');
                setRegionFilter('all');
                setStatusFilter('all');
                setMinBudget('');
                setMaxBudget('');
              }}
              className="clear-all-btn"
            >
              {t('common.clearAll')}
            </Button>
          </div>

          <div className="search-box-main">
            <Search size={20} className="search-icon" />
            <Input
              type="text"
              placeholder={t('tenderList.advancedSearch')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input-main"
            />
          </div>

          <div className="primary-filters">
            <div className="filter-group">
              <Label>{t('tenderList.categoryLabel')}</Label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder={t('tenderList.allCategories')}/>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('tenderList.allCategories')}</SelectItem>
                  <SelectItem value="construction">{t('tenderList.construction')}</SelectItem>
                  <SelectItem value="itServices">{t('tenderList.itServices')}</SelectItem>
                  <SelectItem value="consulting">{t('tenderList.consulting')}</SelectItem>
                  <SelectItem value="logistics">{t('tenderList.logistics')}</SelectItem>
                  <SelectItem value="oil_gas_chemistry">{t('tenderList.oil_gas_chemistry')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="filter-group">
              <Label>{t('tenderList.regionLabel')}</Label>
              <Select value={regionFilter} onValueChange={setRegionFilter}>
                <SelectTrigger>
                  <SelectValue placeholder={t('tenderList.regionLabel')} />
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
              <Label>{t('tenderList.typeLabel')}</Label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder={t('tenderList.allTypes')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('tenderList.allTypes')}</SelectItem>
                  <SelectItem value="price_proposals">{t('tenderList.priceProposals')}</SelectItem>
                  <SelectItem value="open_competition">{t('tenderList.openCompetition')}</SelectItem>
                  <SelectItem value="auction">{t('tenderList.auction')}</SelectItem>
                  <SelectItem value="single_source">{t('tenderList.singleSource')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="filter-group">
              <Label>{t('tenderList.statusLabel')}</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder={t('tenderList.allStatuses')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('tenderList.allStatuses')}</SelectItem>
                  <SelectItem value="published_receiving_proposals">{t('status.published_receiving_proposals')}</SelectItem>
                  <SelectItem value="under_review">{t('status.under_review') || 'На рассмотрении'}</SelectItem>
                  <SelectItem value="active">{t('status.active') || 'Активный'}</SelectItem>
                  <SelectItem value="closed">{t('status.closed') || 'Закрыт'}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="advanced-filters-panel">
            <div className="advanced-filters-grid">
              <div className="filter-group">
                <Label>{t('tenderList.budgetFrom')}</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={minBudget}
                  onChange={(e) => setMinBudget(e.target.value)}
                />
              </div>

              <div className="filter-group">
                <Label>{t('tenderList.budgetTo')}</Label>
                <Input
                  type="number"
                  placeholder="1000000000"
                  value={maxBudget}
                  onChange={(e) => setMaxBudget(e.target.value)}
                />
              </div>

              <div className="filter-group">
                <Label>{t('tenderList.dateFrom')}</Label>
                <input type="date" className="date-filter-input" />
              </div>

              <div className="filter-group">
                <Label>{t('tenderList.dateTo')}</Label>
                <input type="date" className="date-filter-input" />
              </div>
            </div>

            <div className="filter-actions">
              <Button onClick={applyFilters} className="apply-filter-btn">
                <Search size={16} />
                {t('common.find')}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm('');
                  setCategoryFilter('all');
                  setTypeFilter('all');
                  setRegionFilter('all');
                  setStatusFilter('all');
                  setMinBudget('');
                  setMaxBudget('');
                }}
              >
                {t('common.reset')}
              </Button>
            </div>
          </div>

          <div className="results-info">
            <p>{t('tenderList.foundCount')}: <strong>{filteredTenders.length}</strong></p>
          </div>
        </Card>

        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
          </div>
        ) : filteredTenders.length === 0 ? (
          <div className="empty-state govt-card">
            <p>{t('tenderList.noTendersFound')}</p>
          </div>
        ) : (
          <div className="tenders-list">
            {filteredTenders.map((tender) => (
              <div
                key={tender.id}
                className="tender-card"
                onClick={() => navigate(`/tenders/${tender.id}`)}
                data-testid={`tender-card-${tender.id}`}
              >
                <div className="tender-card-header">
                  <div className="tender-meta-top">
                    <span className="tender-id">№ {tender.tender_number || `T-${new Date(tender.created_at).getFullYear()}-${tender.id.slice(0, 4)}`}</span>
                    <span className={`status-badge status-${tender.status}`}>
                      {getStatusLabel(tender.status)}
                    </span>
                  </div>
                  {/* ИСПОЛЬЗУЕМ ЛОКАЛИЗОВАННЫЙ ЗАГОЛОВОК */}
                  <h3 className="tender-card-title">{getLocalizedField(tender, 'title')}</h3>
                </div>

                <div className="tender-card-content">
                  {/* ИСПОЛЬЗУЕМ ЛОКАЛИЗОВАННОЕ ОПИСАНИЕ */}
                  <p className="tender-description">{getLocalizedField(tender, 'description')}</p>

                  <div className="tender-details-grid">
                    <div className="detail-item">
                      <span className="detail-label">{t('tenderList.budget')}</span>
                      <span className="price-highlight">{tender.budget.toLocaleString()} {tender.id === '508e1745-94d6-40ca-9bd5-1e09327ad4f8' ? `$` : '₸'}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">{t('tenderList.typeLabel')}</span>
                      <span className="detail-value">{getTypeLabel(tender.tender_type)}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">{t('tenderList.category')}</span>
                      <span className="detail-value">{getCategoryLabel(tender.category)}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">{t('tenderList.region')}</span>
                      <span className="detail-value">{tender.region}</span>
                    </div>
                  </div>
                </div>

                <div className="tender-card-footer">
                  <div className="tender-dates">
                    <span className="date-label">{t('tenderDetail.deadline')}: {new Date(tender.deadline).toLocaleDateString()}</span>
                  </div>
                  <Button className="neon-button-filled">
                    {t('dashboard.viewDetails')}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </StaticLayout>
  );
};

export default TenderList;