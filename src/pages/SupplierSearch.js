import React, { useState, useEffect } from 'react';
import { AppContext } from '@/App';
import { useLanguage } from '@/context/LanguageContext';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, Filter, Star, MapPin, Building, Phone, Mail } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const SupplierSearch = () => {
  const { API } = React.useContext(AppContext);
  const { t } = useLanguage();
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    category: 'all',
    region: 'all',
    rating: 0
  });

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API}/suppliers/search`, {
        params: {
          category: filters.category !== 'all' ? filters.category : undefined,
          region: filters.region !== 'all' ? filters.region : undefined,
          min_rating: filters.rating || undefined,
          verified_only: true
        }
      });
      setSuppliers(response.data);
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      setSuppliers([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredSuppliers = suppliers.filter(supplier => {
    const companyName = supplier.company_name || '';
    const category = supplier.category || '';
    const region = supplier.region || '';
    const rating = supplier.rating || 0;
    
    const matchesSearch = companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filters.category === 'all' || category === filters.category;
    const matchesRegion = filters.region === 'all' || region === filters.region;
    const matchesRating = rating >= filters.rating;
    return matchesSearch && matchesCategory && matchesRegion && matchesRating;
  });

  if (loading) {
    return (
      <Layout>
        <div className="loading-container">
          <div className="loading-spinner"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="supplier-search-container">
        <div className="page-header">
          <div>
            <h1 className="page-title">Поиск поставщиков</h1>
            <p className="page-subtitle">Найдите надежных подрядчиков для ваших проектов</p>
          </div>
        </div>

        {/* Search and Filters */}
        <Card className="search-card">
          <div className="search-bar">
            <Search size={20} />
            <Input
              placeholder="Поиск по названию компании или категории..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          <div className="filters">
            <select
              className="filter-select"
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            >
              <option value="all">Все категории</option>
              <option value="Строительство">Строительство</option>
              <option value="ИТ услуги">ИТ услуги</option>
              <option value="Логистика">Логистика</option>
              <option value="Консалтинг">Консалтинг</option>
            </select>
            <select
              className="filter-select"
              value={filters.region}
              onChange={(e) => setFilters({ ...filters, region: e.target.value })}
            >
              <option value="all">Все регионы</option>
              <option value="Алматы">Алматы</option>
              <option value="Нур-Султан">Нур-Султан</option>
              <option value="Шымкент">Шымкент</option>
            </select>
            <select
              className="filter-select"
              value={filters.rating}
              onChange={(e) => setFilters({ ...filters, rating: parseFloat(e.target.value) })}
            >
              <option value="0">Любой рейтинг</option>
              <option value="4.5">4.5+ звезд</option>
              <option value="4.0">4.0+ звезд</option>
              <option value="3.5">3.5+ звезд</option>
            </select>
          </div>
        </Card>

        {/* Results */}
        <div className="results-header">
          <p className="results-count">Найдено поставщиков: {filteredSuppliers.length}</p>
        </div>

        <div className="suppliers-grid">
          {filteredSuppliers.map((supplier) => (
            <Card key={supplier.id} className="supplier-card">
              <div className="supplier-header">
                <div className="supplier-icon">
                  <Building size={24} />
                </div>
                <div className="supplier-main">
                  <h3 className="supplier-name">{supplier.company_name || 'Без названия'}</h3>
                  <div className="supplier-meta">
                    <span className="category-badge">{supplier.category || 'Общие услуги'}</span>
                    <span className="region-badge">
                      <MapPin size={14} />
                      {supplier.region || 'Не указан'}
                    </span>
                  </div>
                </div>
                <div className="supplier-rating">
                  <Star size={18} fill="#f59e0b" color="#f59e0b" />
                  <span>{supplier.rating || 0}</span>
                </div>
              </div>

              {supplier.description && <p className="supplier-description">{supplier.description}</p>}

              <div className="supplier-stats">
                <div className="stat">
                  <span className="stat-label">Завершено договоров:</span>
                  <span className="stat-value">{supplier.completed_contracts || 0}</span>
                </div>
                {supplier.total_amount && (
                  <div className="stat">
                    <span className="stat-label">Общая сумма:</span>
                    <span className="stat-value">{supplier.total_amount.toLocaleString()} ₸</span>
                  </div>
                )}
              </div>

              <div className="supplier-contacts">
                {supplier.phone && (
                  <div className="contact">
                    <Phone size={16} />
                    <span>{supplier.phone}</span>
                  </div>
                )}
                {supplier.email && (
                  <div className="contact">
                    <Mail size={16} />
                    <span>{supplier.email}</span>
                  </div>
                )}
              </div>

              <div className="supplier-actions">
                <Button variant="outline" className="action-btn">
                  Профиль
                </Button>
                <Button className="action-btn primary">
                  Пригласить в тендер
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <style jsx>{`
        .supplier-search-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 24px;
        }

        .page-header {
          margin-bottom: 32px;
          background: white;
          padding: 24px 32px;
          border-radius: 8px;
          border: 1px solid var(--border-light);
          box-shadow: var(--shadow-card);
        }

        .page-title {
          font-size: 2rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 4px;
        }

        .page-subtitle {
          font-size: 1rem;
          color: var(--text-secondary);
        }

        .search-card {
          padding: 24px;
          margin-bottom: 24px;
          background: white;
          border: 1px solid var(--border-light);
          border-radius: 8px;
        }

        .search-bar {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 20px;
        }

        .search-input {
          flex: 1;
        }

        .filters {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .filter-select {
          padding: 8px 16px;
          border: 1px solid var(--border-medium);
          border-radius: 6px;
          background: white;
          font-size: 0.875rem;
          color: var(--text-primary);
          cursor: pointer;
        }

        .results-header {
          margin-bottom: 20px;
        }

        .results-count {
          font-size: 1rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        .suppliers-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(450px, 1fr));
          gap: 24px;
        }

        .supplier-card {
          padding: 24px;
          background: white;
          border: 1px solid var(--border-light);
          border-radius: 8px;
          transition: all 0.2s ease;
        }

        .supplier-card:hover {
          box-shadow: var(--shadow-md);
          border-color: var(--border-medium);
        }

        .supplier-header {
          display: flex;
          gap: 16px;
          align-items: flex-start;
          margin-bottom: 16px;
        }

        .supplier-icon {
          width: 48px;
          height: 48px;
          background: rgba(30, 64, 175, 0.1);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--primary);
          flex-shrink: 0;
        }

        .supplier-main {
          flex: 1;
        }

        .supplier-name {
          font-size: 1.125rem;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 8px;
        }

        .supplier-meta {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .category-badge {
          padding: 4px 12px;
          background: rgba(30, 64, 175, 0.1);
          color: var(--primary);
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .region-badge {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 0.875rem;
          color: var(--text-secondary);
        }

        .supplier-rating {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 1rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .supplier-description {
          font-size: 0.875rem;
          color: var(--text-secondary);
          line-height: 1.5;
          margin-bottom: 16px;
        }

        .supplier-stats {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
          margin-bottom: 16px;
          padding: 16px;
          background: var(--bg-tertiary);
          border-radius: 6px;
        }

        .stat {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .stat-label {
          font-size: 0.75rem;
          color: var(--text-secondary);
        }

        .stat-value {
          font-size: 1rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        .supplier-contacts {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 16px;
          padding: 12px;
          background: var(--bg-tertiary);
          border-radius: 6px;
        }

        .contact {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.875rem;
          color: var(--text-secondary);
        }

        .supplier-actions {
          display: flex;
          gap: 12px;
        }

        .action-btn {
          flex: 1;
        }

        .action-btn.primary {
          background: var(--primary);
          color: white;
        }

        .loading-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 400px;
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid var(--border-light);
          border-top: 3px solid var(--primary);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .suppliers-grid {
            grid-template-columns: 1fr;
          }

          .filters {
            flex-direction: column;
          }

          .filter-select {
            width: 100%;
          }

          .supplier-actions {
            flex-direction: column;
          }
        }
      `}</style>
    </Layout>
  );
};

export default SupplierSearch;