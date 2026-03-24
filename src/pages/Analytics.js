import React, { useState, useEffect } from 'react';
import { AppContext } from '@/App';
import { useLanguage } from '@/context/LanguageContext';
import Layout from '@/components/Layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  FileText,
  Calendar,
  Download,
  Users,
  Target
} from 'lucide-react';
import axios from 'axios';

const Analytics = () => {
  const { API } = React.useContext(AppContext);
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState({
    totalTenders: 0,
    totalBudget: 0,
    savings: 0,
    avgBidCount: 0,
    categoryBreakdown: [],
    monthlyTrends: [],
    topContractors: []
  });

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await axios.get(`${API}/analytics/customer`);
      setAnalyticsData(response.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      // Set empty data on error
      setAnalyticsData({
        totalTenders: 0,
        totalBudget: 0,
        savings: 0,
        avgBidCount: 0,
        avgCompletionTime: 0,
        successRate: 0,
        categoryBreakdown: [],
        monthlyTrends: [],
        topContractors: []
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExportReport = async () => {
    try {
      const response = await axios.get(`${API}/reports/analytics-${Date.now()}`);
      
      // Create download link for Excel file
      const linkSource = `data:${response.data.content_type};base64,${response.data.data}`;
      const downloadLink = document.createElement('a');
      downloadLink.href = linkSource;
      downloadLink.download = response.data.filename;
      downloadLink.click();
    } catch (error) {
      console.error('Error exporting report:', error);
      alert('Ошибка при экспорте отчета');
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
      <div className="analytics-container">
        <div className="page-header">
          <div>
            <h1 className="page-title">Отчетность и аналитика</h1>
            <p className="page-subtitle">Анализ закупочной деятельности и статистика</p>
          </div>
          <Button onClick={handleExportReport} className="export-btn">
            <Download size={18} />
            Экспорт отчета
          </Button>
        </div>

        {/* Key Metrics */}
        <div className="metrics-grid">
          <Card className="metric-card">
            <div className="metric-icon total-tenders">
              <FileText size={24} />
            </div>
            <div className="metric-info">
              <span className="metric-label">Всего тендеров</span>
              <span className="metric-value">{analyticsData.totalTenders}</span>
              <span className="metric-change positive">
                <TrendingUp size={14} />
                +12% за месяц
              </span>
            </div>
          </Card>

          <Card className="metric-card">
            <div className="metric-icon total-budget">
              <DollarSign size={24} />
            </div>
            <div className="metric-info">
              <span className="metric-label">Общий бюджет</span>
              <span className="metric-value">{analyticsData.totalBudget.toLocaleString()} ₸</span>
              <span className="metric-change positive">
                <TrendingUp size={14} />
                +8% за месяц
              </span>
            </div>
          </Card>

          <Card className="metric-card">
            <div className="metric-icon savings">
              <Target size={24} />
            </div>
            <div className="metric-info">
              <span className="metric-label">Экономия</span>
              <span className="metric-value">{analyticsData.savings.toLocaleString()} ₸</span>
              <span className="metric-change positive">
                <TrendingUp size={14} />
                15% от бюджета
              </span>
            </div>
          </Card>

          <Card className="metric-card">
            <div className="metric-icon avg-bids">
              <Users size={24} />
            </div>
            <div className="metric-info">
              <span className="metric-label">Средне заявок</span>
              <span className="metric-value">{analyticsData.avgBidCount}</span>
              <span className="metric-change positive">
                <TrendingUp size={14} />
                на тендер
              </span>
            </div>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="charts-grid">
          {/* Category Breakdown */}
          <Card className="chart-card">
            <div className="card-header">
              <h3 className="card-title">
                <BarChart3 size={20} />
                Распределение по категориям
              </h3>
            </div>
            <div className="category-list">
              {analyticsData.categoryBreakdown.map((category, index) => (
                <div key={index} className="category-item">
                  <div className="category-header">
                    <span className="category-name">{category.category}</span>
                    <span className="category-stats">
                      {category.count} тендеров • {category.budget.toLocaleString()} ₸
                    </span>
                  </div>
                  <div className="progress-bar-container">
                    <div
                      className="progress-bar-fill"
                      style={{
                        width: `${category.percentage}%`,
                        background: `hsl(${220 - index * 30}, 70%, 55%)`
                      }}
                    ></div>
                  </div>
                  <span className="percentage-label">{category.percentage}%</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Monthly Trends */}
          <Card className="chart-card">
            <div className="card-header">
              <h3 className="card-title">
                <Calendar size={20} />
                Динамика по месяцам
              </h3>
            </div>
            <div className="trends-chart">
              {analyticsData.monthlyTrends.map((trend, index) => {
                const maxBudget = Math.max(...analyticsData.monthlyTrends.map(t => t.budget));
                const height = (trend.budget / maxBudget) * 100;
                
                return (
                  <div key={index} className="trend-bar-wrapper">
                    <div className="trend-bar" style={{ height: `${height}%` }}>
                      <div className="trend-tooltip">
                        <div>{trend.tenders} тендеров</div>
                        <div>{trend.budget.toLocaleString()} ₸</div>
                      </div>
                    </div>
                    <span className="trend-label">{trend.month.slice(0, 3)}</span>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Performance Metrics */}
        <div className="performance-grid">
          <Card className="performance-card">
            <div className="performance-header">
              <h3 className="performance-title">Эффективность закупок</h3>
            </div>
            <div className="performance-stats">
              <div className="performance-item">
                <span className="performance-label">Успешность тендеров</span>
                <div className="performance-bar-container">
                  <div
                    className="performance-bar success"
                    style={{ width: `${analyticsData.successRate}%` }}
                  ></div>
                </div>
                <span className="performance-value">{analyticsData.successRate}%</span>
              </div>
              <div className="performance-item">
                <span className="performance-label">Средний срок исполнения</span>
                <div className="performance-value-large">
                  {analyticsData.avgCompletionTime} дней
                </div>
              </div>
              <div className="performance-item">
                <span className="performance-label">Экономия от начальной цены</span>
                <div className="performance-value-large savings-highlight">
                  {((analyticsData.savings / analyticsData.totalBudget) * 100).toFixed(1)}%
                </div>
              </div>
            </div>
          </Card>

          {/* Top Contractors */}
          <Card className="performance-card">
            <div className="performance-header">
              <h3 className="performance-title">
                <Users size={20} />
                Топ подрядчиков
              </h3>
            </div>
            <div className="contractors-list">
              {analyticsData.topContractors.map((contractor, index) => (
                <div key={index} className="contractor-item">
                  <div className="contractor-rank">#{index + 1}</div>
                  <div className="contractor-info">
                    <h4 className="contractor-name">{contractor.name}</h4>
                    <p className="contractor-stats">
                      {contractor.contracts} контрактов • {contractor.total_amount.toLocaleString()} ₸
                    </p>
                  </div>
                  <div className="contractor-rating">
                    ⭐ {contractor.rating}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <style jsx>{`
        .analytics-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 24px;
        }

        .page-header {
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

        .export-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          background: var(--primary);
          color: white;
        }

        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
          margin-bottom: 32px;
        }

        .metric-card {
          padding: 24px;
          background: white;
          border: 1px solid var(--border-light);
          border-radius: 8px;
          display: flex;
          gap: 16px;
          align-items: flex-start;
        }

        .metric-icon {
          width: 56px;
          height: 56px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .metric-icon.total-tenders {
          background: rgba(59, 130, 246, 0.1);
          color: #3b82f6;
        }

        .metric-icon.total-budget {
          background: rgba(139, 92, 246, 0.1);
          color: #8b5cf6;
        }

        .metric-icon.savings {
          background: rgba(16, 185, 129, 0.1);
          color: #10b981;
        }

        .metric-icon.avg-bids {
          background: rgba(245, 158, 11, 0.1);
          color: #f59e0b;
        }

        .metric-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .metric-label {
          font-size: 0.875rem;
          color: var(--text-secondary);
        }

        .metric-value {
          font-size: 1.75rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .metric-change {
          font-size: 0.875rem;
          display: flex;
          align-items: center;
          gap: 4px;
          font-weight: 600;
        }

        .metric-change.positive {
          color: #10b981;
        }

        .charts-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(450px, 1fr));
          gap: 24px;
          margin-bottom: 32px;
        }

        .chart-card {
          padding: 24px;
          background: white;
          border: 1px solid var(--border-light);
          border-radius: 8px;
        }

        .card-header {
          margin-bottom: 24px;
          padding-bottom: 16px;
          border-bottom: 1px solid var(--border-light);
        }

        .card-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--text-primary);
          display: flex;
          align-items: center;
          gap: 8px;
          margin: 0;
        }

        .category-list {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .category-item {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .category-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .category-name {
          font-weight: 600;
          color: var(--text-primary);
        }

        .category-stats {
          font-size: 0.875rem;
          color: var(--text-secondary);
        }

        .progress-bar-container {
          height: 8px;
          background: var(--bg-tertiary);
          border-radius: 4px;
          overflow: hidden;
        }

        .progress-bar-fill {
          height: 100%;
          border-radius: 4px;
          transition: width 0.3s ease;
        }

        .percentage-label {
          font-size: 0.75rem;
          color: var(--text-muted);
          align-self: flex-end;
        }

        .trends-chart {
          display: flex;
          align-items: flex-end;
          justify-content: space-around;
          height: 200px;
          gap: 8px;
          padding: 20px 0;
        }

        .trend-bar-wrapper {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          flex: 1;
          height: 100%;
        }

        .trend-bar {
          width: 100%;
          background: linear-gradient(to top, var(--primary), var(--accent));
          border-radius: 4px 4px 0 0;
          position: relative;
          cursor: pointer;
          transition: all 0.3s ease;
          align-self: flex-end;
        }

        .trend-bar:hover {
          opacity: 0.8;
        }

        .trend-bar:hover .trend-tooltip {
          display: block;
        }

        .trend-tooltip {
          display: none;
          position: absolute;
          bottom: 100%;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(0, 0, 0, 0.8);
          color: white;
          padding: 8px 12px;
          border-radius: 6px;
          font-size: 0.75rem;
          white-space: nowrap;
          margin-bottom: 8px;
        }

        .trend-label {
          font-size: 0.75rem;
          color: var(--text-secondary);
        }

        .performance-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(450px, 1fr));
          gap: 24px;
        }

        .performance-card {
          padding: 24px;
          background: white;
          border: 1px solid var(--border-light);
          border-radius: 8px;
        }

        .performance-header {
          margin-bottom: 20px;
          padding-bottom: 16px;
          border-bottom: 1px solid var(--border-light);
        }

        .performance-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--text-primary);
          display: flex;
          align-items: center;
          gap: 8px;
          margin: 0;
        }

        .performance-stats {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .performance-item {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .performance-label {
          font-size: 0.875rem;
          color: var(--text-secondary);
          font-weight: 500;
        }

        .performance-bar-container {
          height: 12px;
          background: var(--bg-tertiary);
          border-radius: 6px;
          overflow: hidden;
        }

        .performance-bar {
          height: 100%;
          border-radius: 6px;
          transition: width 0.3s ease;
        }

        .performance-bar.success {
          background: linear-gradient(90deg, #10b981, #16a34a);
        }

        .performance-value {
          font-size: 1rem;
          font-weight: 700;
          color: var(--primary);
          align-self: flex-end;
        }

        .performance-value-large {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .performance-value-large.savings-highlight {
          color: var(--accent);
          font-size: 2rem;
        }

        .contractors-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .contractor-item {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px;
          background: var(--bg-tertiary);
          border-radius: 8px;
          border: 1px solid var(--border-light);
        }

        .contractor-rank {
          width: 40px;
          height: 40px;
          background: var(--primary);
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 1.125rem;
          flex-shrink: 0;
        }

        .contractor-info {
          flex: 1;
        }

        .contractor-name {
          font-size: 1rem;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 4px;
        }

        .contractor-stats {
          font-size: 0.875rem;
          color: var(--text-secondary);
          margin: 0;
        }

        .contractor-rating {
          font-size: 1rem;
          font-weight: 600;
          color: var(--text-primary);
          flex-shrink: 0;
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
          .metrics-grid,
          .charts-grid,
          .performance-grid {
            grid-template-columns: 1fr;
          }

          .page-header {
            flex-direction: column;
            gap: 16px;
            align-items: flex-start;
          }

          .trend-bar-wrapper {
            min-width: 40px;
          }
        }
      `}</style>
    </Layout>
  );
};

export default Analytics;
