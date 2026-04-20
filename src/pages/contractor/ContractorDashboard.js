import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  FileText,
  TrendingUp,
  CheckCircle,
  Clock,
  DollarSign,
  Award,
  AlertCircle,
  Users
} from 'lucide-react';

const API = process.env.REACT_APP_BACKEND_URL;

const ContractorDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    stats: {
      total_bids: 0,
      active_bids: 0,
      won_bids: 0,
      rejected_bids: 0,
      active_contracts: 0,
      completed_contracts: 0,
      total_earnings: 0,
      success_rate: 0
    },
    recent_tenders: []
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get(`${API}/contractor/dashboard`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDashboardData(response.data);
    } catch (error) {
      console.error('Error fetching contractor dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
        <div className="loading-container">
          <div className="loading-spinner"></div>
        </div>
    );
  }

  return (
    <>
      <div className="contractor-dashboard">
        <div className="dashboard-header">
          <div>
            <h1 className="page-title">Панель управления</h1>
            <p className="page-subtitle">Управление заявками и контрактами</p>
          </div>
        </div>

        {/* Statistics Grid */}
        <div className="stats-grid">
          <Card className="stat-card total-bids">
            <div className="stat-content">
              <div className="stat-icon-wrapper">
                <FileText className="stat-icon" />
              </div>
              <div className="stat-details">
                <h3 className="stat-value">{dashboardData.stats.total_bids}</h3>
                <p className="stat-label">Всего заявок</p>
              </div>
            </div>
          </Card>

          <Card className="stat-card active-bids">
            <div className="stat-content">
              <div className="stat-icon-wrapper">
                <Clock className="stat-icon" />
              </div>
              <div className="stat-details">
                <h3 className="stat-value">{dashboardData.stats.active_bids}</h3>
                <p className="stat-label">Активные заявки</p>
              </div>
            </div>
          </Card>

          <Card className="stat-card won-bids">
            <div className="stat-content">
              <div className="stat-icon-wrapper">
                <CheckCircle className="stat-icon" />
              </div>
              <div className="stat-details">
                <h3 className="stat-value">{dashboardData.stats.won_bids}</h3>
                <p className="stat-label">Выиграно</p>
              </div>
            </div>
          </Card>

          <Card className="stat-card success-rate">
            <div className="stat-content">
              <div className="stat-icon-wrapper">
                <Award className="stat-icon" />
              </div>
              <div className="stat-details">
                <h3 className="stat-value">{dashboardData.stats.success_rate}%</h3>
                <p className="stat-label">Успешность</p>
              </div>
            </div>
          </Card>

          <Card className="stat-card active-contracts">
            <div className="stat-content">
              <div className="stat-icon-wrapper">
                <Users className="stat-icon" />
              </div>
              <div className="stat-details">
                <h3 className="stat-value">{dashboardData.stats.active_contracts}</h3>
                <p className="stat-label">Активные контракты</p>
              </div>
            </div>
          </Card>

          <Card className="stat-card earnings">
            <div className="stat-content">
              <div className="stat-icon-wrapper">
                <DollarSign className="stat-icon" />
              </div>
              <div className="stat-details">
                <h3 className="stat-value">{dashboardData.stats.total_earnings.toLocaleString()} ₸</h3>
                <p className="stat-label">Общий доход</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Recent Available Tenders */}
        <Card className="recent-tenders-section">
          <div className="section-header">
            <h2 className="section-title">
              <FileText size={20} />
              Доступные тендеры
            </h2>
            <Button
              variant="ghost"
              onClick={() => navigate('/tenders')}
              className="view-all-btn"
            >
              Смотреть все →
            </Button>
          </div>
          
          <div className="tenders-list">
            {dashboardData.recent_tenders.length === 0 ? (
              <div className="empty-state">
                <AlertCircle size={48} className="empty-icon" />
                <p>Нет доступных тендеров</p>
              </div>
            ) : (
              dashboardData.recent_tenders.map((tender) => (
                <div
                  key={tender.id}
                  className="tender-card"
                  onClick={() => navigate(`/tenders/${tender.id}`)}
                >
                  <div className="tender-header">
                    <h3 className="tender-title">{tender.title}</h3>
                    <span className="tender-budget">{tender.budget.toLocaleString()} ₸</span>
                  </div>
                  <p className="tender-category">{tender.category}</p>
                  <p className="tender-region">Регион: {tender.region}</p>
                  <div className="tender-footer">
                    <span className="tender-date">
                      {new Date(tender.created_at).toLocaleDateString('ru-RU')}
                    </span>
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/tenders/${tender.id}`);
                      }}
                    >
                      Подать заявку
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      <style jsx>{`
        .contractor-dashboard {
          max-width: 1400px;
          margin: 0 auto;
          padding: var(--space-6);
        }

        .page-title {
          font-size: var(--font-size-4xl);
          font-weight: var(--font-weight-bold);
          color: var(--color-text-dark);
          margin: 0 0 var(--space-2) 0;
        }

        .page-subtitle {
          font-size: var(--font-size-base);
          color: var(--color-text-muted);
          margin: 0;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: var(--space-4);
          margin-bottom: var(--space-6);
        }

        .stat-card {
          padding: var(--space-5);
          border: 1px solid var(--color-border);
          transition: var(--transition-normal) ease;
        }

        .stat-card:hover {
          border-color: var(--color-primary-dark);
          box-shadow: var(--shadow-card-hover);
        }

        .stat-content {
          display: flex;
          align-items: center;
          gap: var(--space-4);
        }

        .stat-icon-wrapper {
          width: 48px;
          height: 48px;
          border-radius: var(--radius-2xl);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .total-bids .stat-icon-wrapper {
          background: var(--color-primary-bg);
          color: var(--color-primary-light);
        }

        .active-bids .stat-icon-wrapper {
          background: var(--color-bg-muted);
          color: var(--color-warning);
        }

        .won-bids .stat-icon-wrapper {
          background: var(--color-success-tint-10);
          color: var(--color-success-alt);
        }

        .success-rate .stat-icon-wrapper {
          background: var(--color-primary-bg);
          color: var(--color-primary);
        }

        .active-contracts .stat-icon-wrapper {
          background: var(--color-success-tint-10);
          color: var(--color-success-alt);
        }

        .earnings .stat-icon-wrapper {
          background: var(--color-success-tint-10);
          color: var(--color-success-alt);
        }

        .stat-value {
          font-size: var(--font-size-4xl);
          font-weight: var(--font-weight-bold);
          color: var(--color-text-dark);
          margin: 0;
        }

        .stat-label {
          font-size: var(--font-size-base);
          color: var(--color-text-muted);
          margin: var(--space-1) 0 0 0;
        }

        .recent-tenders-section {
          padding: var(--space-6);
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--space-5);
        }

        .section-title {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          font-size: var(--font-size-xl3);
          font-weight: var(--font-weight-semibold);
          color: var(--color-text-dark);
          margin: 0;
        }

        .view-all-btn {
          color: var(--color-primary-dark);
          font-size: var(--font-size-base);
        }

        .tenders-list {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: var(--space-4);
        }

        .tender-card {
          padding: var(--space-4);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
          cursor: pointer;
          transition: var(--transition-normal) ease;
        }

        .tender-card:hover {
          border-color: var(--color-primary-dark);
          box-shadow: var(--shadow-card-hover);
        }

        .tender-header {
          display: flex;
          justify-content: space-between;
          align-items: start;
          gap: var(--space-3);
          margin-bottom: var(--space-2);
        }

        .tender-title {
          font-size: var(--font-size-lg);
          font-weight: var(--font-weight-semibold);
          color: var(--color-text-dark);
          margin: 0;
          flex: 1;
        }

        .tender-budget {
          font-size: var(--font-size-lg);
          font-weight: var(--font-weight-bold);
          color: var(--color-success-alt);
          white-space: nowrap;
        }

        .tender-category,
        .tender-region {
          font-size: var(--font-size-base);
          color: var(--color-text-muted);
          margin: var(--space-1) 0;
        }

        .tender-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: var(--space-3);
          padding-top: var(--space-3);
          border-top: 1px solid var(--color-border);
        }

        .tender-date {
          font-size: var(--font-size-xs);
          color: var(--color-text-placeholder);
        }

        .empty-state {
          text-align: center;
          padding: var(--space-12) var(--space-6);
          color: var(--color-text-muted);
        }

        .empty-icon {
          color: var(--color-text-placeholder);
          margin-bottom: var(--space-4);
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
          border-top: 3px solid var(--color-primary-dark);
          border-radius: var(--radius-circle);
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .contractor-dashboard {
            padding: var(--space-4);
          }

          .stats-grid {
            grid-template-columns: 1fr;
          }

          .tenders-list {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </>
  );
};

export default ContractorDashboard;
