import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Layout from '@/components/Layout';
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
      <Layout>
        <div className="loading-container">
          <div className="loading-spinner"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
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
          padding: 24px;
        }

        .dashboard-header {
          background: white;
          padding: 24px 32px;
          border-radius: 8px;
          margin-bottom: 24px;
          border: 1px solid #e5e7eb;
        }

        .page-title {
          font-size: 1.875rem;
          font-weight: 700;
          color: #1a1a1a;
          margin: 0 0 8px 0;
        }

        .page-subtitle {
          font-size: 0.875rem;
          color: #6b7280;
          margin: 0;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 16px;
          margin-bottom: 24px;
        }

        .stat-card {
          padding: 20px;
          border: 1px solid #e5e7eb;
          transition: all 0.2s ease;
        }

        .stat-card:hover {
          border-color: #1e40af;
          box-shadow: 0 4px 12px rgba(30, 64, 175, 0.1);
        }

        .stat-content {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .stat-icon-wrapper {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .total-bids .stat-icon-wrapper {
          background: rgba(59, 130, 246, 0.1);
          color: #3b82f6;
        }

        .active-bids .stat-icon-wrapper {
          background: rgba(251, 191, 36, 0.1);
          color: #f59e0b;
        }

        .won-bids .stat-icon-wrapper {
          background: rgba(16, 185, 129, 0.1);
          color: #10b981;
        }

        .success-rate .stat-icon-wrapper {
          background: rgba(168, 85, 247, 0.1);
          color: #a855f7;
        }

        .active-contracts .stat-icon-wrapper {
          background: rgba(34, 197, 94, 0.1);
          color: #22c55e;
        }

        .earnings .stat-icon-wrapper {
          background: rgba(16, 185, 129, 0.1);
          color: #10b981;
        }

        .stat-value {
          font-size: 1.875rem;
          font-weight: 700;
          color: #1a1a1a;
          margin: 0;
        }

        .stat-label {
          font-size: 0.875rem;
          color: #6b7280;
          margin: 4px 0 0 0;
        }

        .recent-tenders-section {
          padding: 24px;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .section-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 1.25rem;
          font-weight: 600;
          color: #1a1a1a;
          margin: 0;
        }

        .view-all-btn {
          color: #1e40af;
          font-size: 0.875rem;
        }

        .tenders-list {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 16px;
        }

        .tender-card {
          padding: 16px;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .tender-card:hover {
          border-color: #1e40af;
          box-shadow: 0 4px 12px rgba(30, 64, 175, 0.1);
        }

        .tender-header {
          display: flex;
          justify-content: space-between;
          align-items: start;
          gap: 12px;
          margin-bottom: 8px;
        }

        .tender-title {
          font-size: 1rem;
          font-weight: 600;
          color: #1a1a1a;
          margin: 0;
          flex: 1;
        }

        .tender-budget {
          font-size: 1rem;
          font-weight: 700;
          color: #10b981;
          white-space: nowrap;
        }

        .tender-category,
        .tender-region {
          font-size: 0.875rem;
          color: #6b7280;
          margin: 4px 0;
        }

        .tender-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 12px;
          padding-top: 12px;
          border-top: 1px solid #e5e7eb;
        }

        .tender-date {
          font-size: 0.75rem;
          color: #9ca3af;
        }

        .empty-state {
          text-align: center;
          padding: 48px 24px;
          color: #6b7280;
        }

        .empty-icon {
          color: #9ca3af;
          margin-bottom: 16px;
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
          border: 3px solid #e5e7eb;
          border-top: 3px solid #1e40af;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .contractor-dashboard {
            padding: 16px;
          }

          .stats-grid {
            grid-template-columns: 1fr;
          }

          .tenders-list {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </Layout>
  );
};

export default ContractorDashboard;
