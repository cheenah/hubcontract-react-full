import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import { BASE_URL as API } from '@/services/api';
import { parseApiError } from '@/utils/apiError';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FileText, Award, DollarSign, Users, Calendar } from 'lucide-react';

const styles = `
  .protocol-loading {
    display: flex;
    justify-content: center;
    padding: 100px;
  }
  .protocol-not-found {
    padding: var(--space-10);
    text-align: center;
  }
  .protocol-not-found-back {
    margin-top: var(--space-5);
  }
  .protocol-page {
    padding: var(--space-5);
    max-width: 1200px;
    margin: 0 auto;
  }
  .protocol-back-btn {
    margin-bottom: var(--space-5);
  }
  .protocol-header-card {
    padding: 30px;
    margin-bottom: 30px;
  }
  .protocol-header-title-row {
    display: flex;
    align-items: center;
    gap: 15px;
    margin-bottom: var(--space-5);
  }
  .protocol-header-icon {
    color: var(--color-primary-dark);
  }
  .protocol-header-title {
    font-size: 24px;
    font-weight: var(--font-weight-bold);
    margin-bottom: 5px;
  }
  .protocol-header-subtitle {
    color: var(--color-text-muted);
    font-size: 14px;
  }
  .protocol-status-badge {
    display: inline-block;
    margin-bottom: var(--space-5);
  }
  .protocol-stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: var(--space-5);
    margin-top: var(--space-5);
  }
  .protocol-stat-item {
    padding: 15px;
    background: var(--color-bg-subtle);
    border-radius: var(--radius-lg);
  }
  .protocol-stat-item-header {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 10px;
  }
  .protocol-stat-icon-primary {
    color: var(--color-primary-dark);
  }
  .protocol-stat-icon-success {
    color: var(--color-success-mid);
  }
  .protocol-stat-label {
    font-weight: var(--font-weight-semibold);
  }
  .protocol-stat-date {
    font-size: 14px;
    color: var(--color-text-muted);
  }
  .protocol-stat-count {
    font-size: 24px;
    font-weight: var(--font-weight-bold);
    color: var(--color-primary-dark);
  }
  .protocol-stat-count-success {
    font-size: 24px;
    font-weight: var(--font-weight-bold);
    color: var(--color-success-mid);
  }
  .protocol-info-card {
    padding: 30px;
    margin-bottom: 30px;
  }
  .protocol-info-title {
    font-size: 20px;
    font-weight: var(--font-weight-bold);
    margin-bottom: 15px;
  }
  .protocol-info-text {
    color: var(--color-text-secondary);
    font-size: 16px;
  }
  .protocol-reason-box {
    margin-top: var(--space-5);
    padding: 15px;
    background: var(--color-primary-bg);
    border-left: 4px solid var(--color-primary-dark);
    border-radius: var(--radius-sm);
  }
  .protocol-winner-card {
    padding: 30px;
    margin-bottom: 30px;
    background: var(--color-success-bg-alt);
    border: 2px solid var(--color-success-mid);
  }
  .protocol-winner-header {
    display: flex;
    align-items: center;
    gap: 15px;
    margin-bottom: 15px;
  }
  .protocol-winner-title {
    font-size: 20px;
    font-weight: var(--font-weight-bold);
    color: var(--color-success-mid);
  }
  .protocol-winner-field {
    font-size: 16px;
    margin-bottom: 10px;
  }
  .protocol-winner-price {
    font-size: 20px;
    font-weight: var(--font-weight-bold);
    color: var(--color-success-mid);
  }
  .protocol-winner-price-icon {
    display: inline;
    margin-right: 5px;
  }
  .protocol-bids-card {
    padding: 30px;
  }
  .protocol-bids-title {
    font-size: 20px;
    font-weight: var(--font-weight-bold);
    margin-bottom: var(--space-5);
  }
  .protocol-table-wrap {
    overflow-x: auto;
  }
  .protocol-table {
    width: 100%;
    border-collapse: collapse;
  }
  .protocol-table thead tr {
    background: var(--color-bg-subtle);
    border-bottom: 2px solid var(--color-border);
  }
  .protocol-table th {
    padding: 12px;
    text-align: left;
    font-weight: var(--font-weight-semibold);
  }
  .protocol-table td {
    padding: 12px;
  }
  .protocol-table .td-muted {
    color: var(--color-text-muted);
  }
  .protocol-badge-sm {
    font-size: 12px;
    padding: 4px 8px;
  }
  .protocol-empty-bids {
    color: var(--color-text-muted);
    text-align: center;
    padding: var(--space-10);
  }
`;

const ProtocolView = () => {
  const { tenderId } = useParams();
  const navigate = useNavigate();
  const [protocol, setProtocol] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProtocol();
  }, [tenderId]);

  const fetchProtocol = async () => {
    try {
      // Use public endpoint for protocol access
      const response = await axios.get(`${API}/public/protocols/tender/${tenderId}`);
      setProtocol(response.data);
    } catch (error) {
      console.error('Error fetching protocol:', error);
      toast.error(parseApiError(error, 'Ошибка при загрузке протокола'));
      navigate('/tenders');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
        <div className="protocol-loading">
          <div className="loading-spinner"></div>
        </div>
    );
  }

  if (!protocol) {
    return (
        <>
          <style>{styles}</style>
          <div className="container protocol-not-found">
            <h2>Протокол не найден</h2>
            <Button onClick={() => navigate('/tenders')} className="protocol-not-found-back">
              Вернуться к тендерам
            </Button>
          </div>
        </>
    );
  }

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'completed':
        return 'status-badge status-closed';
      case 'failed':
        return 'status-badge status-cancelled';
      case 'single_source':
        return 'status-badge status-active';
      default:
        return 'status-badge';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed':
        return 'Закупка состоялась';
      case 'failed':
        return 'Закупка не состоялась';
      case 'single_source':
        return 'Закупка из одного источника';
      default:
        return status;
    }
  };

  return (
      <>
        <style>{styles}</style>
        <div className="container protocol-page">
          <Button
            variant="outline"
            onClick={() => navigate(`/tenders/${protocol.tender_id}`)}
            className="protocol-back-btn"
          >
            ← Вернуться к тендеру
          </Button>

          <Card className="protocol-header-card">
            <div className="protocol-header-title-row">
              <FileText size={32} className="protocol-header-icon" />
              <div>
                <h1 className="protocol-header-title">
                  Протокол итогов закупки
                </h1>
                <p className="protocol-header-subtitle">
                  Тендер №{protocol.tender_number}
                </p>
              </div>
            </div>

            <div className={`${getStatusBadgeClass(protocol.status)} protocol-status-badge`}>
              {getStatusText(protocol.status)}
            </div>

            <div className="protocol-stats-grid">
              <div className="protocol-stat-item">
                <div className="protocol-stat-item-header">
                  <Calendar size={20} className="protocol-stat-icon-primary" />
                  <span className="protocol-stat-label">Дата закрытия</span>
                </div>
                <p className="protocol-stat-date">
                  {new Date(protocol.created_at).toLocaleString('ru-RU')}
                </p>
              </div>

              <div className="protocol-stat-item">
                <div className="protocol-stat-item-header">
                  <Users size={20} className="protocol-stat-icon-primary" />
                  <span className="protocol-stat-label">Всего заявок</span>
                </div>
                <p className="protocol-stat-count">
                  {protocol.total_bids}
                </p>
              </div>

              <div className="protocol-stat-item">
                <div className="protocol-stat-item-header">
                  <Award size={20} className="protocol-stat-icon-success" />
                  <span className="protocol-stat-label">Квалифицировано</span>
                </div>
                <p className="protocol-stat-count-success">
                  {protocol.stage1_passed}
                </p>
              </div>
            </div>
          </Card>

          <Card className="protocol-info-card">
            <h2 className="protocol-info-title">
              Название тендера
            </h2>
            <p className="protocol-info-text">{protocol.tender_title}</p>

            {protocol.reason && (
              <div className="protocol-reason-box">
                <strong>Причина:</strong> {protocol.reason}
              </div>
            )}
          </Card>

          {protocol.winner_id && (
            <Card className="protocol-winner-card">
              <div className="protocol-winner-header">
                <Award size={28} color="var(--color-success-mid)" />
                <h2 className="protocol-winner-title">
                  Победитель закупки
                </h2>
              </div>
              {protocol.bids_details && protocol.bids_details.find(b => b.status === 'winner') && (
                <div>
                  <p className="protocol-winner-field">
                    <strong>Компания:</strong>{' '}
                    {protocol.bids_details.find(b => b.status === 'winner').contractor_name}
                  </p>
                  <p className="protocol-winner-field">
                    <strong>Email:</strong>{' '}
                    {protocol.bids_details.find(b => b.status === 'winner').contractor_email}
                  </p>
                  <p className="protocol-winner-price">
                    <DollarSign size={20} className="protocol-winner-price-icon" />
                    {protocol.winner_price?.toLocaleString()} ₸
                  </p>
                </div>
              )}
            </Card>
          )}

          <Card className="protocol-bids-card">
            <h2 className="protocol-bids-title">
              Список всех участников ({protocol.bids_details?.length || 0})
            </h2>

            {protocol.bids_details && protocol.bids_details.length > 0 ? (
              <div className="protocol-table-wrap">
                <table className="protocol-table">
                  <thead>
                    <tr>
                      <th>№</th>
                      <th>Компания</th>
                      <th>Email</th>
                      <th>Цена предложения</th>
                      <th>AI-оценка</th>
                      <th>Статус</th>
                    </tr>
                  </thead>
                  <tbody>
                    {protocol.bids_details.map((bid, index) => (
                      <tr
                        key={index}
                        style={{
                          borderBottom: '1px solid var(--color-border)',
                          background: bid.status === 'winner' ? 'var(--color-success-bg-alt)' : 'var(--color-bg-surface)'
                        }}
                      >
                        <td>{index + 1}</td>
                        <td style={{ fontWeight: bid.status === 'winner' ? 'var(--font-weight-semibold)' : 'normal' }}>
                          {bid.contractor_name}
                          {bid.status === 'winner' && (
                            <Award size={16} color="var(--color-success-mid)" style={{ display: 'inline', marginLeft: '8px' }} />
                          )}
                        </td>
                        <td className="td-muted">{bid.contractor_email}</td>
                        <td style={{ fontWeight: 'var(--font-weight-semibold)', color: bid.status === 'winner' ? 'var(--color-success-mid)' : 'var(--color-text-secondary)' }}>
                          {bid.price?.toLocaleString()} ₸
                        </td>
                        <td>
                          {bid.ai_score ? `${bid.ai_score} баллов` : '-'}
                        </td>
                        <td>
                          <span
                            className={`status-badge protocol-badge-sm ${
                              bid.status === 'winner' ? 'status-closed' :
                              bid.status === 'rejected' ? 'status-cancelled' :
                              'status-draft'
                            }`}
                          >
                            {bid.status === 'winner' ? 'Победитель' :
                             bid.status === 'rejected' ? 'Отклонено' :
                             bid.status === 'not_qualified' ? 'Не квалифицирован' :
                             bid.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="protocol-empty-bids">
                Заявки отсутствуют
              </p>
            )}
          </Card>
        </div>
      </>
  );
};

export default ProtocolView;
