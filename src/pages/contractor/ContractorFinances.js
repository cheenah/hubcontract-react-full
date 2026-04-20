import React, { useState, useEffect } from 'react';
import axios from 'axios';
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
        <div className="loading-container">
          <div className="loading-spinner"></div>
        </div>
    );
  }

  return (
    <>
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
          padding: var(--space-6);
        }

        .page-header {
          background: var(--color-bg-surface);
          padding: var(--space-6) var(--space-8);
          border-radius: var(--radius-lg);
          margin-bottom: var(--space-6);
          border: 1px solid var(--color-border);
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

        .earnings .stat-icon-wrapper {
          background: var(--color-success-tint-10);
          color: var(--color-success-alt);
        }

        .pending .stat-icon-wrapper {
          background: var(--color-bg-muted);
          color: var(--color-warning);
        }

        .contracts .stat-icon-wrapper {
          background: var(--color-primary-bg);
          color: var(--color-primary-light);
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

        .payments-section {
          padding: var(--space-6);
        }

        .section-header {
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

        .payments-table {
          overflow-x: auto;
        }

        table {
          width: 100%;
          border-collapse: collapse;
        }

        thead {
          background: var(--color-bg-subtle);
        }

        th {
          text-align: left;
          padding: var(--space-3) var(--space-4);
          font-size: var(--font-size-base);
          font-weight: var(--font-weight-semibold);
          color: var(--color-text-secondary);
          border-bottom: 2px solid var(--color-border);
        }

        td {
          padding: var(--space-3) var(--space-4);
          font-size: var(--font-size-base);
          color: var(--color-text-muted);
          border-bottom: 1px solid var(--color-border);
        }

        tbody tr:hover {
          background: var(--color-bg-subtle);
        }

        .amount {
          font-weight: var(--font-weight-semibold);
          color: var(--color-success-alt);
        }

        .status {
          padding: var(--space-1) var(--space-3);
          border-radius: var(--radius-4xl);
          font-size: var(--font-size-xs);
          font-weight: var(--font-weight-medium);
          text-transform: uppercase;
        }

        .status-paid {
          background: var(--color-success-tint-10);
          color: var(--color-success-alt);
        }

        .status-pending {
          background: var(--color-bg-muted);
          color: var(--color-warning);
        }

        .empty-state {
          text-align: center;
          padding: var(--space-12);
          color: var(--color-text-muted);
        }

        .empty-state svg {
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
          .finances-page {
            padding: var(--space-4);
          }

          .stats-grid {
            grid-template-columns: 1fr;
          }

          table {
            font-size: var(--font-size-xs);
          }

          th,
          td {
            padding: var(--space-2) var(--space-3);
          }
        }
      `}</style>
    </>
  );
};

export default ContractorFinances;
