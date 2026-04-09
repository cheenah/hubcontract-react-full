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
  const { t } = useLanguage();
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
  }, [searchTerm, categoryFilter, typeFilter, regionFilter, statusFilter, minBudget, maxBudget, tenders]);

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

  const applyFilters = () => {
    let filtered = [...tenders];

    if (searchTerm) {
      filtered = filtered.filter(
        (t) =>
          t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (t.tender_number && t.tender_number.toLowerCase().includes(searchTerm.toLowerCase()))
      );
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
      consulting: t('tenderList.consulting'),
      logistics: t('tenderList.logistics'),
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

  const getStatusLabel = (status) => {
    return t(`status.${status}`);
  };

  return (

    <StaticLayout>
      <div className="tender-list-container" data-testid="tender-list">
        <div className="tender-list-header">
          <h1 className="page-title">{t('tenderList.title')}</h1>
          <p className="page-subtitle">{t('tenderList.subtitle')}</p>
        </div>

        {/* Filters Section - Similar to Landing Page */}
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
              Очистить все
            </Button>
          </div>

          {/* Main Search */}
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

          {/* Primary Filters Row */}
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
                  <SelectValue placeholder={t('tenderList.categoryLabel')} />
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
                  <SelectItem value="open_competition">{t('tenderList.allType.openCompetition')}</SelectItem>
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
                  <SelectItem value="published_receiving_proposals">{t('tenderList.publishedReceivingProposals')}</SelectItem>
                  <SelectItem value="under_review">На рассмотрении</SelectItem>
                  <SelectItem value="active">Активный</SelectItem>
                  <SelectItem value="closed">Закрыт</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Advanced Filters - Always Visible */}
          <div className="advanced-filters-panel">
            <div className="advanced-filters-grid">
              <div className="filter-group">
                <Label>Бюджет от ($)</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={minBudget}
                  onChange={(e) => setMinBudget(e.target.value)}
                />
              </div>

              <div className="filter-group">
                <Label>Бюджет до ($)</Label>
                <Input
                  type="number"
                  placeholder="1000000000"
                  value={maxBudget}
                  onChange={(e) => setMaxBudget(e.target.value)}
                />
              </div>

              <div className="filter-group">
                <Label>Дата публикации от</Label>
                <Input type="date" />
              </div>

              <div className="filter-group">
                <Label>Дата публикации до</Label>
                <Input type="date" />
              </div>
            </div>

            <div className="filter-actions">
              <Button onClick={applyFilters} className="apply-filter-btn">
                <Search size={16} />
                Найти
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
                Сбросить
              </Button>
            </div>
          </div>

          {/* Results Count */}
          <div className="results-info">
            <p>Найдено тендеров: <strong>{filteredTenders.length}</strong></p>
          </div>
        </Card>

        {/* Tenders Grid */}
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
                  <h3 className="tender-card-title">{tender.title}</h3>
                </div>

                <div className="tender-card-content">
                  <p className="tender-description">{tender.description}</p>

                  <div className="tender-details-grid">
                    <div className="detail-item">
                      <span className="detail-label">{t('tenderList.budget')}</span>
                      <span className="price-highlight">{tender.budget.toLocaleString()}$</span>
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

      <style jsx>{`
        .tender-list-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 20px;
          background: var(--bg-secondary);
        }

        .tender-list-header {
          margin-bottom: 30px;
          background: var(--bg-primary);
          padding: 30px;
          border-radius: 4px;
          border: 1px solid var(--border-light);
          box-shadow: var(--shadow-card);
        }

        .page-title {
          font-size: 28px;
          font-weight: 700;
          color: #1a1a1a !important;
          margin-bottom: 8px;
        }

        .page-subtitle {
          font-size: 16px;
          color: #4a4a4a !important;
        }

        .filters-card {
          padding: 24px;
          margin-bottom: 24px;
          background: white;
          border: 1px solid var(--border-light);
        }

        .filters-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .filters-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--text-primary);
          margin: 0;
        }

        .clear-all-btn {
          color: var(--primary);
        }

        .search-box-main {
          position: relative;
          margin-bottom: 20px;
        }

        .search-icon {
          position: absolute;
          left: 16px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-muted);
        }

        .search-input-main {
          width: 100%;
          padding: 12px 12px 12px 48px;
          font-size: 1rem;
          border: 2px solid var(--border-medium);
          border-radius: 8px;
        }

        .search-input-main:focus {
          border-color: var(--primary);
          outline: none;
        }

        .primary-filters {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
          margin-bottom: 16px;
        }

        .filter-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .filter-group label {
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--text-secondary);
        }

        .advanced-toggle {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .advanced-filters-panel {
          padding-top: 20px;
          border-top: 1px solid var(--border-light);
          margin-top: 16px;
        }

        .advanced-filters-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 16px;
          margin-bottom: 20px;
        }

        .filter-actions {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
        }

        .apply-filter-btn {
          background: #1e40af;
          color: white;
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 24px;
          font-weight: 500;
        }

        .apply-filter-btn:hover {
          background: #1e3a8a;
        }

        .results-info {
          padding-top: 16px;
          border-top: 1px solid var(--border-light);
          margin-top: 16px;
        }

        .results-info p {
          color: var(--text-secondary);
          font-size: 0.875rem;
          margin: 0;
        }

        .results-info strong {
          color: var(--primary);
          font-weight: 600;
        }

        .loading-state {
          display: flex;
          justify-content: center;
          padding: 100px 0;
        }

        .empty-state {
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 60px;
          text-align: center;
          color: var(--text-primary);
        }

        .tenders-list {
          display: flex;
          flex-direction: column;
          gap: 0;
        }

        .tender-card {
          cursor: pointer;
        }

        .tender-card-header {
          margin-bottom: 16px;
        }

        .tender-meta-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .tender-id {
          font-size: 14px;
          color: var(--text-secondary);
          font-weight: 600;
        }

        .tender-card-title {
          font-size: 18px;
          font-weight: 600;
          color: #1a1a1a !important;
          line-height: 1.4;
          margin: 0;
        }

        .tender-card-content {
          margin-bottom: 20px;
        }

        .tender-description {
          color: #4a4a4a !important;
          margin-bottom: 16px;
          line-height: 1.5;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .tender-details-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 12px;
          margin-bottom: 16px;
        }

        .detail-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .detail-label {
          font-size: 14px;
          color: #666666 !important;
          font-weight: 500;
        }

        .detail-value {
          font-size: 14px;
          font-weight: 600;
          color: #1a1a1a !important;
        }

        .tender-card-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 16px;
          border-top: 1px solid var(--border-light);
        }

        .tender-dates {
          font-size: 14px;
          color: #666666 !important;
        }

        .date-label {
          font-weight: 500;
          color: #666666 !important;
        }

        @media (max-width: 768px) {
          .page-title {
            font-size: 24px;
          }

          .tender-details-grid {
            grid-template-columns: 1fr;
            gap: 8px;
          }

          .filter-controls {
            width: 100%;
          }

          .filter-select {
            flex: 1;
          }

          .tender-card-footer {
            flex-direction: column;
            gap: 12px;
            align-items: flex-start;
          }
        }
      `}</style>
    </StaticLayout>
  );
};

export default TenderList;
