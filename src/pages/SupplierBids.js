import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '@/App';
import { useLanguage } from '@/context/LanguageContext';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Clock, Eye, Search, Filter, FileText } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const SupplierBids = () => {
  const navigate = useNavigate();
  const { API } = React.useContext(AppContext);
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
      toast.error(error.response?.data?.detail || 'Ошибка при принятии заявки');
    }
  };

  const handleRejectBid = async (bidId) => {
    try {
      await axios.post(`${API}/bids/${bidId}/reject`);
      toast.success('Заявка отклонена');
      fetchBids();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Ошибка при отклонении заявки');
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
        toast.error(error.response?.data?.detail || 'Ошибка при создании договора');
      }
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { text: 'На рассмотрении', color: '#f59e0b', icon: <Clock size={14} /> },
      stage1_approved: { text: 'Этап 1 одобрен', color: '#3b82f6', icon: <CheckCircle size={14} /> },
      accepted: { text: 'Принята', color: '#10b981', icon: <CheckCircle size={14} /> },
      winner: { text: 'Победитель - Завершен', color: '#16a34a', icon: <CheckCircle size={14} /> },
      rejected: { text: 'Отклонена', color: '#ef4444', icon: <XCircle size={14} /> }
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
      <Layout>
        <div className="loading-container">
          <div className="loading-spinner"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
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
                        style={{ background: `${statusBadge.color}20`, color: statusBadge.color }}
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
          padding: 24px;
        }

        .page-header {
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

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-bottom: 24px;
        }

        .stat-card {
          padding: 20px;
          background: white;
          border: 1px solid var(--border-light);
          border-radius: 8px;
        }

        .stat-card.total {
          border-left: 4px solid #3b82f6;
        }

        .stat-card.pending {
          border-left: 4px solid #f59e0b;
        }

        .stat-card.accepted {
          border-left: 4px solid #10b981;
        }

        .stat-card.rejected {
          border-left: 4px solid #ef4444;
        }

        .stat-content {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .stat-label {
          font-size: 0.875rem;
          color: var(--text-secondary);
        }

        .stat-value {
          font-size: 2rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .filters-card {
          padding: 20px;
          background: white;
          border: 1px solid var(--border-light);
          border-radius: 8px;
          margin-bottom: 24px;
        }

        .filters-content {
          display: flex;
          gap: 16px;
          align-items: center;
          flex-wrap: wrap;
        }

        .search-box {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 8px;
          min-width: 300px;
        }

        .filter-buttons {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .bids-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .bid-card {
          padding: 24px;
          background: white;
          border: 1px solid var(--border-light);
          border-radius: 8px;
          transition: all 0.2s ease;
        }

        .bid-card:hover {
          box-shadow: var(--shadow-md);
          border-color: var(--border-medium);
        }

        .bid-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 20px;
          padding-bottom: 16px;
          border-bottom: 1px solid var(--border-light);
        }

        .bid-info {
          flex: 1;
        }

        .bid-tender-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 8px;
        }

        .bid-contractor {
          font-size: 1rem;
          color: var(--text-secondary);
          margin-bottom: 4px;
        }

        .bid-date {
          font-size: 0.875rem;
          color: var(--text-muted);
          margin: 0;
        }

        .bid-status .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border-radius: 12px;
          font-size: 0.875rem;
          font-weight: 600;
        }

        .bid-details {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
          margin-bottom: 20px;
        }

        .detail-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .detail-label {
          font-size: 0.875rem;
          color: var(--text-secondary);
        }

        .detail-value {
          font-size: 1rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        .detail-value.price {
          color: var(--primary);
          font-size: 1.125rem;
        }

        .detail-value.savings {
          color: var(--accent);
        }

        .bid-proposal {
          margin-top: 16px;
          padding: 16px;
          background: #f9fafb;
          border-radius: 8px;
          border-left: 3px solid #3b82f6;
        }

        .proposal-title {
          font-size: 0.875rem;
          font-weight: 600;
          color: #374151;
          margin-bottom: 8px;
        }

        .proposal-text {
          font-size: 0.9rem;
          line-height: 1.6;
          color: #4b5563;
          margin: 0;
          max-height: 100px;
          overflow-y: auto;
        }

        .bid-actions {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .bid-actions button {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .accept-btn {
          background: #10b981;
          color: white;
        }

        .accept-btn:hover {
          background: #059669;
        }

        .reject-btn {
          color: #ef4444;
          border-color: #ef4444;
        }

        .reject-btn:hover {
          background: rgba(239, 68, 68, 0.1);
        }

        .empty-state {
          text-align: center;
          padding: 60px 40px;
          background: white;
        }

        .empty-icon {
          color: var(--text-muted);
          margin-bottom: 16px;
        }

        .empty-state h3 {
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 8px;
        }

        .empty-state p {
          color: var(--text-secondary);
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
            gap: 12px;
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
    </Layout>
  );
};

export default SupplierBids;