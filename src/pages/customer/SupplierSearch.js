import React, { useState, useEffect } from 'react';
import { AppContext } from '@/App';
import { useLanguage } from '@/context/LanguageContext';
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
        <div className="loading-container">
          <div className="loading-spinner"></div>
        </div>
    );
  }

  return (
    <>
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
                  <Star size={18} fill="var(--color-warning)" color="var(--color-warning)" />
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
          padding: var(--space-6);
        }

        .page-header {
          margin-bottom: var(--space-8);
          background: var(--color-bg-surface);
          padding: var(--space-6) var(--space-8);
          border-radius: var(--radius-lg);
          border: 1px solid var(--color-border);
          box-shadow: var(--shadow-card);
        }

        .page-title {
          font-size: var(--font-size-6xl);
          font-weight: var(--font-weight-bold);
          color: var(--color-text-dark);
          margin-bottom: var(--space-1);
        }

        .page-subtitle {
          font-size: var(--font-size-lg);
          color: var(--color-text-secondary);
        }

        .search-card {
          padding: var(--space-6);
          margin-bottom: var(--space-6);
          background: var(--color-bg-surface);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
        }

        .search-bar {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          margin-bottom: var(--space-5);
        }

        .search-input {
          flex: 1;
        }

        .filters {
          display: flex;
          gap: var(--space-3);
          flex-wrap: wrap;
        }

        .filter-select {
          padding: var(--space-2) var(--space-4);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          background: var(--color-bg-surface);
          font-size: var(--font-size-base);
          color: var(--color-text-dark);
          cursor: pointer;
        }

        .results-header {
          margin-bottom: var(--space-5);
        }

        .results-count {
          font-size: var(--font-size-lg);
          font-weight: var(--font-weight-semibold);
          color: var(--color-text-dark);
        }

        .suppliers-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(450px, 1fr));
          gap: var(--space-6);
        }

        .supplier-card {
          padding: var(--space-6);
          background: var(--color-bg-surface);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
          transition: var(--transition-base);
        }

        .supplier-card:hover {
          box-shadow: var(--shadow-card-hover);
          border-color: var(--color-border-dark);
        }

        .supplier-header {
          display: flex;
          gap: var(--space-4);
          align-items: flex-start;
          margin-bottom: var(--space-4);
        }

        .supplier-icon {
          width: 48px;
          height: 48px;
          background: var(--color-primary-bg);
          border-radius: var(--radius-lg);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--color-primary);
          flex-shrink: 0;
        }

        .supplier-main {
          flex: 1;
        }

        .supplier-name {
          font-size: var(--font-size-xl3);
          font-weight: var(--font-weight-semibold);
          color: var(--color-text-dark);
          margin-bottom: var(--space-2);
        }

        .supplier-meta {
          display: flex;
          gap: var(--space-3);
          flex-wrap: wrap;
        }

        .category-badge {
          padding: var(--space-1) var(--space-3);
          background: var(--color-primary-bg);
          color: var(--color-primary);
          border-radius: var(--radius-4xl);
          font-size: var(--font-size-xs);
          font-weight: var(--font-weight-semibold);
        }

        .region-badge {
          display: flex;
          align-items: center;
          gap: var(--space-1);
          font-size: var(--font-size-base);
          color: var(--color-text-secondary);
        }

        .supplier-rating {
          display: flex;
          align-items: center;
          gap: var(--space-1);
          font-size: var(--font-size-lg);
          font-weight: var(--font-weight-bold);
          color: var(--color-text-dark);
        }

        .supplier-description {
          font-size: var(--font-size-base);
          color: var(--color-text-secondary);
          line-height: 1.5;
          margin-bottom: var(--space-4);
        }

        .supplier-stats {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: var(--space-3);
          margin-bottom: var(--space-4);
          padding: var(--space-4);
          background: var(--color-bg-subtle);
          border-radius: var(--radius-md);
        }

        .stat {
          display: flex;
          flex-direction: column;
          gap: var(--space-1);
        }

        .stat-label {
          font-size: var(--font-size-xs);
          color: var(--color-text-secondary);
        }

        .stat-value {
          font-size: var(--font-size-lg);
          font-weight: var(--font-weight-semibold);
          color: var(--color-text-dark);
        }

        .supplier-contacts {
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
          margin-bottom: var(--space-4);
          padding: var(--space-3);
          background: var(--color-bg-subtle);
          border-radius: var(--radius-md);
        }

        .contact {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          font-size: var(--font-size-base);
          color: var(--color-text-secondary);
        }

        .supplier-actions {
          display: flex;
          gap: var(--space-3);
        }

        .action-btn {
          flex: 1;
        }

        .action-btn.primary {
          background: var(--color-primary);
          color: var(--color-text-inverse);
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
          border: 3px solid var(--color-border);
          border-top: 3px solid var(--color-primary);
          border-radius: var(--radius-circle);
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
  </>
  );
};

export default SupplierSearch;