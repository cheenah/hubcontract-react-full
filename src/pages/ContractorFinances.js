import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '@/components/Layout';
import { Card } from '@/components/ui/card';
import { DollarSign, TrendingUp, Clock, CheckCircle } from 'lucide-react';

const API = process.env.REACT_APP_BACKEND_URL;

const ContractorFinances = () => {
  const [loading, setLoading] = useState(true);
  const [finances, setFinances] = useState({
    total_earnings: 0,
    pending_payments: 0,
    payments_history: [],
    total_contracts: 0
  });

  useEffect(() => {
    fetchFinances();
  }, []);

  const fetchFinances = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get(`${API}/contractor/finances`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFinances(response.data);
    } catch (error) {
      console.error('Error fetching finances:', error);
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
      <div className="finances-page">
        <div className="page-header">
          <h1 className="page-title">Финансы</h1>
          <p className="page-subtitle">История платежей и доходов</p>
        </div>

        {/* Statistics Cards */}
        <div className="stats-grid">
          <Card className="stat-card earnings">
            <div className="stat-content">
              <div className="stat-icon-wrapper">
                <CheckCircle className="stat-icon" />
              </div>
              <div className="stat-details">
                <h3 className="stat-value">{finances.total_earnings.toLocaleString()} ₸</h3>
                <p className="stat-label">Всего получено</p>
              </div>
            </div>
          </Card>

          <Card className="stat-card pending">
            <div className="stat-content">
              <div className="stat-icon-wrapper">
                <Clock className="stat-icon" />
              </div>
              <div className="stat-details">
                <h3 className="stat-value">{finances.pending_payments.toLocaleString()} ₸</h3>
                <p className="stat-label">Ожидает оплаты</p>
              </div>
            </div>
          </Card>

          <Card className="stat-card contracts">
            <div className="stat-content">
              <div className="stat-icon-wrapper">
                <TrendingUp className="stat-icon" />
              </div>
              <div className="stat-details">
                <h3 className="stat-value">{finances.total_contracts}</h3>
                <p className="stat-label">Всего контрактов</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Payments History */}
        <Card className="payments-section">
          <div className="section-header">
            <h2 className="section-title">
              <DollarSign size={20} />
              История платежей
            </h2>
          </div>

          <div className="payments-table">
            {finances.payments_history.length === 0 ? (
              <div className="empty-state">
                <DollarSign size={48} />
                <p>Нет истории платежей</p>
              </div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Дата</th>
                    <th>Описание</th>
                    <th>Сумма</th>
                    <th>Статус</th>
                  </tr>
                </thead>
                <tbody>
                  {finances.payments_history.map((payment) => (
                    <tr key={payment.id}>
                      <td>{new Date(payment.date).toLocaleDateString('ru-RU')}</td>
                      <td>{payment.description}</td>
                      <td className="amount">{payment.amount.toLocaleString()} ₸</td>
                      <td>
                        <span className={`status status-${payment.status}`}>
                          {payment.status === 'paid' ? 'Оплачено' : payment.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </Card>
      </div>

      <style jsx>{`
        .finances-page {
          max-width: 1200px;
          margin: 0 auto;
          padding: 24px;
        }

        .page-header {
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

        .earnings .stat-icon-wrapper {
          background: rgba(16, 185, 129, 0.1);
          color: #10b981;
        }

        .pending .stat-icon-wrapper {
          background: rgba(251, 191, 36, 0.1);
          color: #f59e0b;
        }

        .contracts .stat-icon-wrapper {
          background: rgba(59, 130, 246, 0.1);
          color: #3b82f6;
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

        .payments-section {
          padding: 24px;
        }

        .section-header {
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

        .payments-table {
          overflow-x: auto;
        }

        table {
          width: 100%;
          border-collapse: collapse;
        }

        thead {
          background: #f9fafb;
        }

        th {
          text-align: left;
          padding: 12px 16px;
          font-size: 0.875rem;
          font-weight: 600;
          color: #374151;
          border-bottom: 2px solid #e5e7eb;
        }

        td {
          padding: 12px 16px;
          font-size: 0.875rem;
          color: #6b7280;
          border-bottom: 1px solid #e5e7eb;
        }

        tbody tr:hover {
          background: #f9fafb;
        }

        .amount {
          font-weight: 600;
          color: #10b981;
        }

        .status {
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 500;
          text-transform: uppercase;
        }

        .status-paid {
          background: rgba(16, 185, 129, 0.1);
          color: #10b981;
        }

        .status-pending {
          background: rgba(251, 191, 36, 0.1);
          color: #f59e0b;
        }

        .empty-state {
          text-align: center;
          padding: 48px;
          color: #6b7280;
        }

        .empty-state svg {
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
          .finances-page {
            padding: 16px;
          }

          .stats-grid {
            grid-template-columns: 1fr;
          }

          table {
            font-size: 0.75rem;
          }

          th,
          td {
            padding: 8px 12px;
          }
        }
      `}</style>
    </Layout>
  );
};

export default ContractorFinances;
