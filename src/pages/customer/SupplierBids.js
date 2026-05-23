import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BASE_URL as API } from '@/services/api';
import { parseApiError } from '@/utils/apiError';
import { useLanguage } from '@/context/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Clock, Eye, Search, Filter, FileText } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const SupplierBids = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchBids();
  }, []);

  const fetchBids = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API}/bids/received`);
      setBids(response.data);
    } catch (error) {
      console.error('Error fetching bids:', error);
      setBids([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptBid = async (bidId) => {
    try {
      await axios.post(`${API}/bids/${bidId}/accept`);
      toast.success('Заявка принята');
      fetchBids();
    } catch (error) {
      toast.error(parseApiError(error, 'Ошибка при принятии заявки'));
    }
  };

  const handleRejectBid = async (bidId) => {
    try {
      await axios.post(`${API}/bids/${bidId}/reject`);
      toast.success('Заявка отклонена');
      fetchBids();
    } catch (error) {
      toast.error(parseApiError(error, 'Ошибка при отклонении заявки'));
    }
  };

  const handleCreateContract = async (tenderId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API}/contracts/create-from-tender/${tenderId}`,
        {},
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      toast.success('Договор создан успешно!');
      navigate(`/contracts/${response.data.id}`);
    } catch (error) {
      if (error.response?.status === 400 && error.response?.data?.detail?.includes('already exists')) {
        toast.error('Договор для этого тендера уже создан');
      } else {
        toast.error(parseApiError(error, 'Ошибка при создании договора'));
      }
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { text: 'На рассмотрении', bg: 'var(--color-bg-muted)', color: 'var(--color-warning)', icon: <Clock size={14} /> },
      stage1_approved: { text: 'Этап 1 одобрен', bg: 'var(--color-primary-bg)', color: 'var(--color-primary-light)', icon: <CheckCircle size={14} /> },
      accepted: { text: 'Принята', bg: 'var(--color-success-tint-10)', color: 'var(--color-success-alt)', icon: <CheckCircle size={14} /> },
      winner: { text: 'Победитель - Завершен', bg: 'var(--color-success-tint-10)', color: 'var(--color-success-mid)', icon: <CheckCircle size={14} /> },
      rejected: { text: 'Отклонена', bg: 'var(--color-danger-tint-10)', color: 'var(--color-danger)', icon: <XCircle size={14} /> }
    };
    return badges[status] || badges.pending;
  };

  const getSavingsPercentage = (bidPrice, originalBudget) => {
    const savings = ((originalBudget - bidPrice) / originalBudget) * 100;
    return savings.toFixed(1);
  };

  const filteredBids = bids.filter(bid => {
    const matchesSearch = bid.tender_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          bid.contractor_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesFilter = false;
    if (filterStatus === 'all') {
      matchesFilter = true;
    } else if (filterStatus === 'completed') {
      // Completed includes accepted and winner
      matchesFilter = bid.status === 'accepted' || bid.status === 'winner';
    } else {
      matchesFilter = bid.status === filterStatus;
    }
    
    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: bids.length,
    pending: bids.filter(b => b.status === 'pending').length,
    stage1_approved: bids.filter(b => b.status === 'stage1_approved').length,
    accepted: bids.filter(b => b.status === 'accepted' || b.status === 'winner').length,
    rejected: bids.filter(b => b.status === 'rejected').length
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
      <div className="supplier-bids-container">
        <div className="page-header">
          <div>
            <h1 className="page-title">Заявки поставщиков</h1>
            <p className="page-subtitle">Рассмотрение и управление предложениями подрядчиков</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <Card className="stat-card total">
            <div className="stat-content">
              <span className="stat-label">Всего заявок</span>
              <span className="stat-value">{stats.total}</span>
            </div>
          </Card>
          <Card className="stat-card pending">
            <div className="stat-content">
              <span className="stat-label">На рассмотрении</span>
              <span className="stat-value">{stats.pending}</span>
            </div>
          </Card>
          <Card className="stat-card accepted">
            <div className="stat-content">
              <span className="stat-label">Завершено</span>
              <span className="stat-value">{stats.accepted}</span>
            </div>
          </Card>
          <Card className="stat-card rejected">
            <div className="stat-content">
              <span className="stat-label">Отклонено</span>
              <span className="stat-value">{stats.rejected}</span>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="filters-card">
          <div className="filters-content">
            <div className="search-box">
              <Search size={18} />
              <Input
                placeholder="Поиск по названию тендера или подрядчику..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="filter-buttons">
              <Button
                variant={filterStatus === 'all' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('all')}
                size="sm"
              >
                Все
              </Button>
              <Button
                variant={filterStatus === 'pending' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('pending')}
                size="sm"
              >
                На рассмотрении
              </Button>
              <Button
                variant={filterStatus === 'completed' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('completed')}
                size="sm"
              >
                Завершенные
              </Button>
              <Button
                variant={filterStatus === 'rejected' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('rejected')}
                size="sm"
              >
                Отклоненные
              </Button>
            </div>
          </div>
        </Card>

        {/* Bids List */}
        <div className="bids-list">
          {filteredBids.length === 0 ? (
            <Card className="empty-state">
              <Eye size={48} className="empty-icon" />
              <h3>Заявки не найдены</h3>
              <p>По выбранным фильтрам заявки не найдены</p>
            </Card>
          ) : (
            filteredBids.map((bid) => {
              const statusBadge = getStatusBadge(bid.status);
              const savings = getSavingsPercentage(bid.price, bid.original_budget);
              
              return (
                <Card key={bid.id} className="bid-card">
                  <div className="bid-header">
                    <div className="bid-info">
                      <h3 className="bid-tender-title">{bid.tender_title}</h3>
                      <p className="bid-contractor">{bid.contractor_name}</p>
                      <p className="bid-date">
                        Подана: {new Date(bid.submitted_at).toLocaleDateString('ru-RU', { 
                          day: '2-digit', 
                          month: '2-digit', 
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                      {bid.ai_score && (
                        <p className="bid-ai-score">
                          AI-оценка: <strong>{bid.ai_score.toFixed(1)}/100</strong>
                        </p>
                      )}
                    </div>
                    <div className="bid-status">
                      <span
                        className="status-badge"
                        style={{ background: statusBadge.bg, color: statusBadge.color }}
                      >
                        {statusBadge.icon}
                        {statusBadge.text}
                      </span>
                    </div>
                  </div>

                  <div className="bid-details">
                    <div className="detail-item">
                      <span className="detail-label">Бюджет тендера:</span>
                      <span className="detail-value">{bid.original_budget?.toLocaleString() || 'N/A'} ₸</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Предложенная цена:</span>
                      <span className="detail-value price">{bid.price?.toLocaleString() || 'N/A'} ₸</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Экономия:</span>
                      <span className="detail-value savings">
                        {((bid.original_budget || 0) - (bid.price || 0)).toLocaleString()} ₸ ({savings}%)
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Срок выполнения:</span>
                      <span className="detail-value">{bid.delivery_time} дней</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Документов:</span>
                      <span className="detail-value">{bid.documents?.length || 0}</span>
                    </div>
                  </div>

                  {/* Proposal section */}
                  {bid.proposal && (
                    <div className="bid-proposal">
                      <h4 className="proposal-title">Описание предложения:</h4>
                      <p className="proposal-text">{bid.proposal}</p>
                    </div>
                  )}

                  <div className="bid-actions">
                    <Button
                      onClick={() => navigate(`/tenders/${bid.tender_id}`)}
                      variant="outline"
                      size="sm"
                    >
                      <Eye size={16} />
                      Просмотр
                    </Button>
                    {bid.status === 'pending' && (
                      <>
                        <Button
                          onClick={() => handleAcceptBid(bid.id)}
                          className="accept-btn"
                          size="sm"
                        >
                          <CheckCircle size={16} />
                          Принять
                        </Button>
                        <Button
                          onClick={() => handleRejectBid(bid.id)}
                          className="reject-btn"
                          variant="outline"
                          size="sm"
                        >
                          <XCircle size={16} />
                          Отклонить
                        </Button>
                      </>
                    )}
                    {bid.status === 'winner' && (
                      <Button
                        onClick={() => handleCreateContract(bid.tender_id)}
                        className="create-contract-btn"
                        size="sm"
                      >
                        <FileText size={16} />
                        Создать договор
                      </Button>
                    )}
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </div>

      <style jsx>{`
        .supplier-bids-container {
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

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: var(--space-5);
          margin-bottom: var(--space-6);
        }

        .stat-card {
          padding: var(--space-5);
          background: var(--color-bg-surface);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
        }

        .stat-card.total {
          border-left: 4px solid var(--color-primary-light);
        }

        .stat-card.pending {
          border-left: 4px solid var(--color-warning);
        }

        .stat-card.accepted {
          border-left: 4px solid var(--color-success-alt);
        }

        .stat-card.rejected {
          border-left: 4px solid var(--color-danger);
        }

        .stat-content {
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
        }

        .stat-label {
          font-size: var(--font-size-base);
          color: var(--color-text-secondary);
        }

        .stat-value {
          font-size: var(--font-size-6xl);
          font-weight: var(--font-weight-bold);
          color: var(--color-text-dark);
        }

        .filters-card {
          padding: var(--space-5);
          background: var(--color-bg-surface);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
          margin-bottom: var(--space-6);
        }

        .filters-content {
          display: flex;
          gap: var(--space-4);
          align-items: center;
          flex-wrap: wrap;
        }

        .search-box {
          flex: 1;
          display: flex;
          align-items: center;
          gap: var(--space-2);
          min-width: 300px;
        }

        .filter-buttons {
          display: flex;
          gap: var(--space-2);
          flex-wrap: wrap;
        }

        .bids-list {
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
        }

        .bid-card {
          padding: var(--space-6);
          background: var(--color-bg-surface);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
          transition: var(--transition-base);
        }

        .bid-card:hover {
          box-shadow: var(--shadow-card-hover);
          border-color: var(--color-border-dark);
        }

        .bid-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: var(--space-5);
          padding-bottom: var(--space-4);
          border-bottom: 1px solid var(--color-border);
        }

        .bid-info {
          flex: 1;
        }

        .bid-tender-title {
          font-size: var(--font-size-2xl);
          font-weight: var(--font-weight-semibold);
          color: var(--color-text-dark);
          margin-bottom: var(--space-2);
        }

        .bid-contractor {
          font-size: var(--font-size-lg);
          color: var(--color-text-secondary);
          margin-bottom: var(--space-1);
        }

        .bid-date {
          font-size: var(--font-size-base);
          color: var(--color-text-muted);
          margin: 0;
        }

        .bid-status .status-badge {
          display: inline-flex;
          align-items: center;
          gap: var(--space-1-5);
          padding: var(--space-1-5) var(--space-3);
          border-radius: var(--radius-4xl);
          font-size: var(--font-size-base);
          font-weight: var(--font-weight-semibold);
        }

        .bid-details {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: var(--space-4);
          margin-bottom: var(--space-5);
        }

        .detail-item {
          display: flex;
          flex-direction: column;
          gap: var(--space-1);
        }

        .detail-label {
          font-size: var(--font-size-base);
          color: var(--color-text-secondary);
        }

        .detail-value {
          font-size: var(--font-size-lg);
          font-weight: var(--font-weight-semibold);
          color: var(--color-text-dark);
        }

        .detail-value.price {
          color: var(--color-primary);
          font-size: var(--font-size-xl3);
        }

        .detail-value.savings {
          color: var(--color-success-alt);
        }

        .bid-proposal {
          margin-top: var(--space-4);
          padding: var(--space-4);
          background: var(--color-bg-subtle);
          border-radius: var(--radius-lg);
          border-left: 3px solid var(--color-primary-light);
        }

        .proposal-title {
          font-size: var(--font-size-base);
          font-weight: var(--font-weight-semibold);
          color: var(--color-text-dark);
          margin-bottom: var(--space-2);
        }

        .proposal-text {
          font-size: var(--font-size-base);
          line-height: 1.6;
          color: var(--color-text-secondary);
          margin: 0;
          max-height: 100px;
          overflow-y: auto;
        }

        .bid-actions {
          display: flex;
          gap: var(--space-3);
          flex-wrap: wrap;
        }

        .bid-actions button {
          display: flex;
          align-items: center;
          gap: var(--space-1-5);
        }

        .accept-btn {
          background: var(--color-success-alt);
          color: var(--color-text-inverse);
        }

        .accept-btn:hover {
          background: var(--color-success-mid);
        }

        .reject-btn {
          color: var(--color-danger);
          border-color: var(--color-danger);
        }

        .reject-btn:hover {
          background: var(--color-danger-tint-10);
        }

        .empty-state {
          text-align: center;
          padding: var(--space-15) var(--space-10);
          background: var(--color-bg-surface);
        }

        .empty-icon {
          color: var(--color-text-muted);
          margin-bottom: var(--space-4);
        }

        .empty-state h3 {
          font-size: var(--font-size-2xl);
          font-weight: var(--font-weight-semibold);
          color: var(--color-text-dark);
          margin-bottom: var(--space-2);
        }

        .empty-state p {
          color: var(--color-text-secondary);
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
          .stats-grid {
            grid-template-columns: 1fr;
          }

          .filters-content {
            flex-direction: column;
            align-items: stretch;
          }

          .search-box {
            min-width: 100%;
          }

          .bid-header {
            flex-direction: column;
            gap: var(--space-3);
          }

          .bid-details {
            grid-template-columns: 1fr;
          }

          .bid-actions {
            flex-direction: column;
          }

          .bid-actions button {
            width: 100%;
          }
        }
      `}</style>
  </>
  );
};

export default SupplierBids;