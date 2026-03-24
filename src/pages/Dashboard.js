import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AppContext } from '@/App';
import { useLanguage } from '@/context/LanguageContext';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Plus,
  TrendingUp,
  TrendingDown,
  Bell,
  Users,
  DollarSign,
  Calendar,
  Download,
  Eye
} from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, API } = React.useContext(AppContext);
  const { t } = useLanguage();
  const [dashboardData, setDashboardData] = useState({
    stats: {
      activeTenders: 0,
      underReview: 0,
      completed: 0,
      totalContracts: 0,
      totalBudget: 0,
      savings: 0
    },
    recentTenders: [],
    notifications: [],
    budgetDistribution: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch user's tenders
      const tendersResponse = await axios.get(`${API}/tenders/my`);
      const tenders = tendersResponse.data;
      
      // Fetch analytics data for real savings
      let analyticsData = null;
      try {
        const analyticsResponse = await axios.get(`${API}/analytics/customer`);
        analyticsData = analyticsResponse.data;
      } catch (err) {
        console.error('Failed to fetch analytics:', err);
      }
      
      // Calculate statistics
      const stats = {
        activeTenders: tenders.filter(t => 
          ['published_receiving_proposals', 'published_receiving_applications', 'active'].includes(t.status)
        ).length,
        underReview: tenders.filter(t => t.status === 'under_review').length,
        completed: tenders.filter(t => t.status === 'completed').length,
        totalContracts: tenders.filter(t => t.winner_id).length,
        totalBudget: tenders.reduce((sum, t) => sum + (t.budget || 0), 0),
        savings: analyticsData ? analyticsData.savings : 0
      };

      // Get recent tenders (last 5)
      const recentTenders = tenders.slice(-5).reverse();

      // Fetch real notifications
      let notifications = [];
      try {
        const notificationsResponse = await axios.get(`${API}/notifications`);
        notifications = notificationsResponse.data.slice(0, 5).map(n => ({
          id: n.id,
          type: n.type || 'info',
          title: n.title || 'Уведомление',
          message: n.message,
          time: n.created_at,
          unread: !n.read
        }));
      } catch (err) {
        console.error('Failed to fetch notifications:', err);
      }

      // Get budget distribution from analytics
      const budgetDistribution = analyticsData?.categoryBreakdown?.map(cat => ({
        category: cat.category,
        amount: cat.budget,
        percentage: cat.percentage
      })) || [];

      setDashboardData({
        stats,
        recentTenders,
        notifications,
        budgetDistribution
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'published_receiving_proposals':
      case 'published_receiving_applications':
      case 'active':
        return <Clock className="status-icon active" />;
      case 'under_review':
        return <Eye className="status-icon review" />;
      case 'completed':
        return <CheckCircle className="status-icon completed" />;
      case 'cancelled':
        return <XCircle className="status-icon cancelled" />;
      default:
        return <FileText className="status-icon" />;
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'new_bid':
        return <Users className="notification-icon new-bid" />;
      case 'deadline_soon':
        return <Clock className="notification-icon deadline" />;
      case 'contract_signed':
        return <CheckCircle className="notification-icon success" />;
      default:
        return <Bell className="notification-icon" />;
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
      <div className="dashboard-container" data-testid="dashboard">
        {/* Header */}
        <div className="dashboard-header">
          <div>
            <h1 className="dashboard-title">Личный кабинет заказчика</h1>
            <p className="dashboard-subtitle">Обзор закупочной деятельности</p>
          </div>
          <div className="header-actions">
            <Button 
              onClick={() => navigate('/create-tender')}
              className="neon-button-filled action-btn"
            >
              <Plus size={18} />
              Создать тендер
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <Card className="stat-card active-tenders">
            <div className="stat-content">
              <div className="stat-icon-wrapper">
                <FileText className="stat-icon" />
              </div>
              <div className="stat-details">
                <h3 className="stat-value">{dashboardData.stats.activeTenders}</h3>
                <p className="stat-label">Активные тендеры</p>
              </div>
            </div>
          </Card>

          <Card className="stat-card under-review">
            <div className="stat-content">
              <div className="stat-icon-wrapper">
                <Clock className="stat-icon" />
              </div>
              <div className="stat-details">
                <h3 className="stat-value">{dashboardData.stats.underReview}</h3>
                <p className="stat-label">На рассмотрении</p>
              </div>
            </div>
          </Card>

          <Card className="stat-card completed">
            <div className="stat-content">
              <div className="stat-icon-wrapper">
                <CheckCircle className="stat-icon" />
              </div>
              <div className="stat-details">
                <h3 className="stat-value">{dashboardData.stats.completed}</h3>
                <p className="stat-label">Завершённые</p>
              </div>
            </div>
          </Card>

          <Card className="stat-card contracts">
            <div className="stat-content">
              <div className="stat-icon-wrapper">
                <Users className="stat-icon" />
              </div>
              <div className="stat-details">
                <h3 className="stat-value">{dashboardData.stats.totalContracts}</h3>
                <p className="stat-label">Договоры</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="dashboard-content-grid">
          {/* Recent Tenders */}
          <Card className="dashboard-section recent-tenders">
            <div className="section-header">
              <h2 className="section-title">
                <FileText size={20} />
                Последние тендеры
              </h2>
              <Button 
                variant="ghost" 
                onClick={() => navigate('/my-tenders')}
                className="view-all-btn"
              >
                Смотреть все →
              </Button>
            </div>
            <div className="tender-list">
              {dashboardData.recentTenders.length === 0 ? (
                <div className="empty-state">
                  <FileText size={48} className="empty-icon" />
                  <p>Пока нет созданных тендеров</p>
                  <Button 
                    onClick={() => navigate('/create-tender')}
                    className="neon-button-filled"
                  >
                    Создать первый тендер
                  </Button>
                </div>
              ) : (
                dashboardData.recentTenders.map((tender) => (
                  <div key={tender.id} className="tender-item" onClick={() => navigate(`/tenders/${tender.id}`)}>
                    <div className="tender-item-header">
                      {getStatusIcon(tender.status)}
                      <div className="tender-info">
                        <h4 className="tender-title">{tender.title}</h4>
                        <p className="tender-budget">{tender.budget.toLocaleString()} ₸</p>
                      </div>
                      <span className={`tender-status ${tender.status}`}>
                        {t(`status.${tender.status}`)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Budget Overview */}
          <Card className="dashboard-section budget-overview">
            <div className="section-header">
              <h2 className="section-title">
                <DollarSign size={20} />
                Бюджет и экономия
              </h2>
            </div>
            <div className="budget-stats">
              <div className="budget-item total-budget">
                <div className="budget-icon">
                  <TrendingUp size={24} />
                </div>
                <div>
                  <p className="budget-label">Общий бюджет</p>
                  <p className="budget-value">{dashboardData.stats.totalBudget.toLocaleString()} ₸</p>
                </div>
              </div>
              <div className="budget-item savings">
                <div className="budget-icon">
                  <TrendingDown size={24} />
                </div>
                <div>
                  <p className="budget-label">Экономия</p>
                  <p className="budget-value savings-value">{dashboardData.stats.savings.toLocaleString()} ₸</p>
                </div>
              </div>
            </div>
            
            <div className="budget-distribution">
              <h3 className="distribution-title">Распределение по категориям</h3>
              {dashboardData.budgetDistribution.map((item) => (
                <div key={item.category} className="distribution-item">
                  <div className="distribution-header">
                    <span className="category-name">{item.category}</span>
                    <span className="category-amount">{item.amount.toLocaleString()} ₸</span>
                  </div>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ width: `${item.percentage}%` }}
                    ></div>
                  </div>
                  <span className="percentage-label">{item.percentage}%</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Notifications */}
          <Card className="dashboard-section notifications">
            <div className="section-header">
              <h2 className="section-title">
                <Bell size={20} />
                Уведомления
              </h2>
              <span className="notification-badge">
                {dashboardData.notifications.filter(n => n.unread).length}
              </span>
            </div>
            <div className="notifications-list">
              {dashboardData.notifications.map((notification) => (
                <div key={notification.id} className={`notification-item ${notification.unread ? 'unread' : ''}`}>
                  {getNotificationIcon(notification.type)}
                  <div className="notification-content">
                    <h4 className="notification-title">{notification.title}</h4>
                    <p className="notification-message">{notification.message}</p>
                    <span className="notification-time">{notification.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <style jsx>{`
        /* Professional Dashboard Styles */
        .dashboard-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 24px;
          background: var(--bg-secondary);
        }

        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 32px;
          background: white;
          padding: 24px 32px;
          border-radius: 8px;
          border: 1px solid var(--border-light);
          box-shadow: var(--shadow-card);
        }

        .dashboard-title {
          font-size: 2rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 4px;
        }

        .dashboard-subtitle {
          font-size: 1rem;
          color: var(--text-secondary);
        }

        .header-actions {
          display: flex;
          gap: 12px;
        }

        .action-btn {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        /* Stats Grid */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
          margin-bottom: 32px;
        }

        .stat-card {
          padding: 24px;
          border: 1px solid var(--border-light);
          border-radius: 8px;
          background: white;
          transition: all 0.2s ease;
        }

        .stat-card:hover {
          box-shadow: var(--shadow-md);
          border-color: var(--border-medium);
        }

        .stat-card.active-tenders {
          border-left: 4px solid #3b82f6;
        }

        .stat-card.under-review {
          border-left: 4px solid #f59e0b;
        }

        .stat-card.completed {
          border-left: 4px solid #10b981;
        }

        .stat-card.contracts {
          border-left: 4px solid #8b5cf6;
        }

        .stat-content {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .stat-icon-wrapper {
          width: 48px;
          height: 48px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(59, 130, 246, 0.1);
        }

        .stat-icon {
          color: #3b82f6;
        }

        .under-review .stat-icon-wrapper {
          background: rgba(245, 158, 11, 0.1);
        }

        .under-review .stat-icon {
          color: #f59e0b;
        }

        .completed .stat-icon-wrapper {
          background: rgba(16, 185, 129, 0.1);
        }

        .completed .stat-icon {
          color: #10b981;
        }

        .contracts .stat-icon-wrapper {
          background: rgba(139, 92, 246, 0.1);
        }

        .contracts .stat-icon {
          color: #8b5cf6;
        }

        .stat-value {
          font-size: 2rem;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0;
        }

        .stat-label {
          font-size: 0.875rem;
          color: var(--text-secondary);
          margin: 4px 0 0 0;
        }

        /* Main Content Grid */
        .dashboard-content-grid {
          display: grid;
          grid-template-columns: 2fr 1fr;
          grid-template-rows: auto auto;
          gap: 24px;
        }

        .dashboard-section {
          background: white;
          border: 1px solid var(--border-light);
          border-radius: 8px;
          padding: 24px;
          box-shadow: var(--shadow-card);
        }

        .recent-tenders {
          grid-row: 1 / 3;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          padding-bottom: 16px;
          border-bottom: 1px solid var(--border-light);
        }

        .section-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--text-primary);
          display: flex;
          align-items: center;
          gap: 8px;
          margin: 0;
        }

        .view-all-btn {
          color: var(--primary);
          font-weight: 500;
          padding: 0;
          height: auto;
        }

        .view-all-btn:hover {
          color: var(--primary-dark);
          background: transparent;
        }

        .notification-badge {
          background: var(--danger);
          color: white;
          border-radius: 12px;
          padding: 2px 8px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        /* Tender List */
        .tender-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .tender-item {
          padding: 16px;
          border: 1px solid var(--border-light);
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .tender-item:hover {
          background: var(--bg-hover);
          border-color: var(--border-medium);
        }

        .tender-item-header {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .status-icon {
          flex-shrink: 0;
        }

        .status-icon.active {
          color: #3b82f6;
        }

        .status-icon.review {
          color: #f59e0b;
        }

        .status-icon.completed {
          color: #10b981;
        }

        .status-icon.cancelled {
          color: #ef4444;
        }

        .tender-info {
          flex: 1;
        }

        .tender-title {
          font-size: 1rem;
          font-weight: 600;
          color: var(--text-primary);
          margin: 0 0 4px 0;
        }

        .tender-budget {
          font-size: 0.875rem;
          color: var(--accent);
          font-weight: 600;
          margin: 0;
        }

        .tender-status {
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
        }

        .tender-status.published_receiving_proposals,
        .tender-status.published_receiving_applications,
        .tender-status.active {
          background: rgba(59, 130, 246, 0.1);
          color: #3b82f6;
        }

        .tender-status.under_review {
          background: rgba(245, 158, 11, 0.1);
          color: #f59e0b;
        }

        .tender-status.completed {
          background: rgba(16, 185, 129, 0.1);
          color: #10b981;
        }

        /* Empty State */
        .empty-state {
          text-align: center;
          padding: 40px 20px;
          color: var(--text-secondary);
        }

        .empty-icon {
          color: var(--text-muted);
          margin-bottom: 16px;
        }

        /* Budget Overview */
        .budget-stats {
          display: flex;
          gap: 20px;
          margin-bottom: 24px;
        }

        .budget-item {
          display: flex;
          align-items: center;
          gap: 12px;
          flex: 1;
          padding: 16px;
          background: var(--bg-tertiary);
          border-radius: 8px;
        }

        .budget-icon {
          color: var(--primary);
        }

        .budget-label {
          font-size: 0.875rem;
          color: var(--text-secondary);
          margin: 0 0 4px 0;
        }

        .budget-value {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0;
        }

        .savings-value {
          color: var(--accent);
        }

        .distribution-title {
          font-size: 1rem;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 16px;
        }

        .distribution-item {
          margin-bottom: 16px;
        }

        .distribution-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
        }

        .category-name {
          font-size: 0.875rem;
          color: var(--text-primary);
          font-weight: 500;
        }

        .category-amount {
          font-size: 0.875rem;
          color: var(--accent);
          font-weight: 600;
        }

        .progress-bar {
          width: 100%;
          height: 6px;
          background: var(--bg-tertiary);
          border-radius: 3px;
          overflow: hidden;
          margin-bottom: 4px;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--primary), var(--accent));
          border-radius: 3px;
        }

        .percentage-label {
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        /* Notifications */
        .notifications-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .notification-item {
          display: flex;
          gap: 12px;
          padding: 12px;
          border-radius: 6px;
          transition: background 0.2s ease;
        }

        .notification-item.unread {
          background: rgba(59, 130, 246, 0.05);
          border-left: 3px solid var(--primary);
        }

        .notification-icon {
          flex-shrink: 0;
          margin-top: 2px;
        }

        .notification-icon.new-bid {
          color: #3b82f6;
        }

        .notification-icon.deadline {
          color: #f59e0b;
        }

        .notification-icon.success {
          color: #10b981;
        }

        .notification-content {
          flex: 1;
        }

        .notification-title {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--text-primary);
          margin: 0 0 4px 0;
        }

        .notification-message {
          font-size: 0.75rem;
          color: var(--text-secondary);
          line-height: 1.4;
          margin: 0 0 4px 0;
        }

        .notification-time {
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        /* Loading */
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

        /* Responsive Design */
        @media (max-width: 1024px) {
          .dashboard-content-grid {
            grid-template-columns: 1fr;
          }
          
          .recent-tenders {
            grid-row: auto;
          }

          .budget-stats {
            flex-direction: column;
            gap: 12px;
          }
        }

        @media (max-width: 768px) {
          .dashboard-header {
            flex-direction: column;
            gap: 16px;
            align-items: flex-start;
          }

          .stats-grid {
            grid-template-columns: 1fr;
          }

          .dashboard-container {
            padding: 16px;
          }

          .tender-item-header {
            flex-wrap: wrap;
            gap: 8px;
          }

          .stat-content {
            flex-direction: column;
            text-align: center;
            gap: 12px;
          }
        }
      `}</style>
    </Layout>
  );
};

export default Dashboard;