import React, { useState, useEffect } from 'react';
import { AppContext } from '@/App';
import { useLanguage } from '@/context/LanguageContext';
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
        <div className="loading-container">
          <div className="loading-spinner"></div>
        </div>
    );
  }

  return (
    <>
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
          padding: var(--space-6);
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
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

        .export-btn {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          background: var(--color-primary);
          color: var(--color-text-inverse);
        }

        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: var(--space-5);
          margin-bottom: var(--space-8);
        }

        .metric-card {
          padding: var(--space-6);
          background: var(--color-bg-surface);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
          display: flex;
          gap: var(--space-4);
          align-items: flex-start;
        }

        .metric-icon {
          width: 56px;
          height: 56px;
          border-radius: var(--radius-2xl);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .metric-icon.total-tenders {
          background: var(--color-primary-bg);
          color: var(--color-primary-light);
        }

        .metric-icon.total-budget {
          background: var(--color-primary-bg);
          color: var(--color-primary);
        }

        .metric-icon.savings {
          background: var(--color-success-tint-10);
          color: var(--color-success-alt);
        }

        .metric-icon.avg-bids {
          background: var(--color-bg-muted);
          color: var(--color-warning);
        }

        .metric-info {
          display: flex;
          flex-direction: column;
          gap: var(--space-1);
        }

        .metric-label {
          font-size: var(--font-size-base);
          color: var(--color-text-secondary);
        }

        .metric-value {
          font-size: var(--font-size-4xl);
          font-weight: var(--font-weight-bold);
          color: var(--color-text-dark);
        }

        .metric-change {
          font-size: var(--font-size-base);
          display: flex;
          align-items: center;
          gap: var(--space-1);
          font-weight: var(--font-weight-semibold);
        }

        .metric-change.positive {
          color: var(--color-success-alt);
        }

        .charts-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(450px, 1fr));
          gap: var(--space-6);
          margin-bottom: var(--space-8);
        }

        .chart-card {
          padding: var(--space-6);
          background: var(--color-bg-surface);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
        }

        .card-header {
          margin-bottom: var(--space-6);
          padding-bottom: var(--space-4);
          border-bottom: 1px solid var(--color-border);
        }

        .card-title {
          font-size: var(--font-size-xl3);
          font-weight: var(--font-weight-semibold);
          color: var(--color-text-dark);
          display: flex;
          align-items: center;
          gap: var(--space-2);
          margin: 0;
        }

        .category-list {
          display: flex;
          flex-direction: column;
          gap: var(--space-5);
        }

        .category-item {
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
        }

        .category-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .category-name {
          font-weight: var(--font-weight-semibold);
          color: var(--color-text-dark);
        }

        .category-stats {
          font-size: var(--font-size-base);
          color: var(--color-text-secondary);
        }

        .progress-bar-container {
          height: 8px;
          background: var(--color-bg-subtle);
          border-radius: var(--radius-sm);
          overflow: hidden;
        }

        .progress-bar-fill {
          height: 100%;
          border-radius: var(--radius-sm);
          transition: var(--transition-slow) ease;
        }

        .percentage-label {
          font-size: var(--font-size-xs);
          color: var(--color-text-muted);
          align-self: flex-end;
        }

        .trends-chart {
          display: flex;
          align-items: flex-end;
          justify-content: space-around;
          height: 200px;
          gap: var(--space-2);
          padding: var(--space-5) 0;
        }

        .trend-bar-wrapper {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--space-2);
          flex: 1;
          height: 100%;
        }

        .trend-bar {
          width: 100%;
          background: linear-gradient(to top, var(--color-primary), var(--color-primary-light));
          border-radius: var(--radius-sm) var(--radius-sm) 0 0;
          position: relative;
          cursor: pointer;
          transition: var(--transition-slow) ease;
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
          color: var(--color-text-inverse);
          padding: var(--space-2) var(--space-3);
          border-radius: var(--radius-md);
          font-size: var(--font-size-xs);
          white-space: nowrap;
          margin-bottom: var(--space-2);
        }

        .trend-label {
          font-size: var(--font-size-xs);
          color: var(--color-text-secondary);
        }

        .performance-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(450px, 1fr));
          gap: var(--space-6);
        }

        .performance-card {
          padding: var(--space-6);
          background: var(--color-bg-surface);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
        }

        .performance-header {
          margin-bottom: var(--space-5);
          padding-bottom: var(--space-4);
          border-bottom: 1px solid var(--color-border);
        }

        .performance-title {
          font-size: var(--font-size-xl3);
          font-weight: var(--font-weight-semibold);
          color: var(--color-text-dark);
          display: flex;
          align-items: center;
          gap: var(--space-2);
          margin: 0;
        }

        .performance-stats {
          display: flex;
          flex-direction: column;
          gap: var(--space-6);
        }

        .performance-item {
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
        }

        .performance-label {
          font-size: var(--font-size-base);
          color: var(--color-text-secondary);
          font-weight: var(--font-weight-medium);
        }

        .performance-bar-container {
          height: 12px;
          background: var(--color-bg-subtle);
          border-radius: var(--radius-md);
          overflow: hidden;
        }

        .performance-bar {
          height: 100%;
          border-radius: var(--radius-md);
          transition: var(--transition-slow) ease;
        }

        .performance-bar.success {
          background: linear-gradient(90deg, var(--color-success-alt), var(--color-success-mid));
        }

        .performance-value {
          font-size: var(--font-size-lg);
          font-weight: var(--font-weight-bold);
          color: var(--color-primary);
          align-self: flex-end;
        }

        .performance-value-large {
          font-size: var(--font-size-3xl);
          font-weight: var(--font-weight-bold);
          color: var(--color-text-dark);
        }

        .performance-value-large.savings-highlight {
          color: var(--color-primary);
          font-size: var(--font-size-6xl);
        }

        .contractors-list {
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
        }

        .contractor-item {
          display: flex;
          align-items: center;
          gap: var(--space-4);
          padding: var(--space-4);
          background: var(--color-bg-subtle);
          border-radius: var(--radius-lg);
          border: 1px solid var(--color-border);
        }

        .contractor-rank {
          width: 40px;
          height: 40px;
          background: var(--color-primary);
          color: var(--color-text-inverse);
          border-radius: var(--radius-circle);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: var(--font-weight-bold);
          font-size: var(--font-size-xl3);
          flex-shrink: 0;
        }

        .contractor-info {
          flex: 1;
        }

        .contractor-name {
          font-size: var(--font-size-lg);
          font-weight: var(--font-weight-semibold);
          color: var(--color-text-dark);
          margin-bottom: var(--space-1);
        }

        .contractor-stats {
          font-size: var(--font-size-base);
          color: var(--color-text-secondary);
          margin: 0;
        }

        .contractor-rating {
          font-size: var(--font-size-lg);
          font-weight: var(--font-weight-semibold);
          color: var(--color-text-dark);
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
          .metrics-grid,
          .charts-grid,
          .performance-grid {
            grid-template-columns: 1fr;
          }

          .page-header {
            flex-direction: column;
            gap: var(--space-4);
            align-items: flex-start;
          }

          .trend-bar-wrapper {
            min-width: 40px;
          }
        }
      `}</style>
    </>
  );
};

export default Analytics;
