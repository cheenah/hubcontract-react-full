import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AppContext } from '@/App';
import { useLanguage } from '@/context/LanguageContext';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Plus, Edit2, Copy, Trash2, Eye, Send, XCircle } from 'lucide-react';
import { toast } from 'sonner';

const MyTenders = () => {
  const navigate = useNavigate();
  const { API } = React.useContext(AppContext);
  const { t } = useLanguage();
  const [tenders, setTenders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTender, setSelectedTender] = useState(null);

  useEffect(() => {
    fetchMyTenders();
  }, []);

  const fetchMyTenders = async () => {
    try {
      const response = await axios.get(`${API}/tenders/my`);
      console.log('Loaded tenders:', response.data);
      console.log('Tenders count:', response.data.length);
      console.log('Tender statuses:', response.data.map(t => t.status));
      setTenders(response.data);
    } catch (error) {
      console.error('Error fetching tenders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyTender = async (tender) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API}/tenders/${tender.id}/copy`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      toast.success('Тендер скопирован успешно!');
      // Открыть для редактирования скопированный тендер
      navigate(`/create-tender?id=${response.data.id}&mode=edit`);
    } catch (error) {
      console.error('Ошибка при копировании:', error);
      toast.error(error.response?.data?.detail || 'Ошибка при копировании тендера');
    }
  };

  const handleDeleteTender = async (tenderId) => {
    if (!window.confirm('Удалить тендер?')) return;
    try {
      await axios.delete(`${API}/tenders/${tenderId}`);
      toast.success('Тендер удален');
      fetchMyTenders();
    } catch (error) {
      toast.error('Ошибка при удалении');
    }
  };

  const handlePublishTender = async (tenderId) => {
    if (!window.confirm('Опубликовать тендер?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${API}/tenders/${tenderId}/publish`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      toast.success('Тендер опубликован!');
      fetchMyTenders();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Ошибка при публикации');
    }
  };

  const handleCancelTender = async (tenderId) => {
    if (!window.confirm('Отменить тендер?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${API}/tenders/${tenderId}/cancel`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      toast.success('Тендер отменен');
      fetchMyTenders();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Ошибка при отмене');
    }
  };

  const handleCreateContract = async (tenderId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API}/contracts/create-from-tender/${tenderId}`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      toast.success('Договор создан успешно!');
      navigate(`/contracts/${response.data.id}`);
    } catch (error) {
      console.error('Ошибка при создании договора:', error);
      toast.error(error.response?.data?.detail || 'Ошибка при создании договора');
    }
  };

  const draftTenders = tenders.filter(t => t.status === 'draft');
  const publishedTenders = tenders.filter(t => 
    ['published', 'active', 'published_receiving_proposals'].includes(t.status)
  );
  const receivingBidsTenders = tenders.filter(t => 
    ['published_receiving_proposals', 'published_receiving_applications', 'under_review'].includes(t.status)
  );
  const closedTenders = tenders.filter(t => 
    ['closed', 'completed'].includes(t.status)
  );
  const cancelledTenders = tenders.filter(t => 
    t.status === 'cancelled'
  );

  console.log('Filtered counts:', {
    drafts: draftTenders.length,
    published: publishedTenders.length,
    receiving: receivingBidsTenders.length,
    closed: closedTenders.length,
    cancelled: cancelledTenders.length
  });

  const TenderCard = ({ tender }) => (
    <Card className="tender-card">
      <div className="tender-header">
        <div className="tender-info">
          <h3 className="tender-title">{tender.title}</h3>
          <p className="tender-id">№ {tender.tender_number || `T-${new Date(tender.created_at).getFullYear()}-${tender.id.slice(0, 4)}`}</p>
        </div>
        <span className={`status-badge status-${tender.status}`}>
          {tender.status}
        </span>
      </div>
      <p className="tender-description">{tender.description?.substring(0, 100)}...</p>
      <div className="tender-details">
        <div className="detail-item">
          <span className="detail-label">Категория:</span>
          <span className="detail-value">{tender.category}</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">Бюджет:</span>
          <span className="detail-value budget">{tender.budget.toLocaleString()} ₸</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">Срок:</span>
          <span className="detail-value">{tender.deadline ? new Date(tender.deadline).toLocaleDateString('ru-RU') : 'Не указан'}</span>
        </div>
      </div>
      <div className="tender-actions">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(`/tenders/${tender.id}`)}
        >
          <Eye size={16} />
          Просмотр
        </Button>
        
        {/* Кнопка "Редактировать" только для черновиков и отмененных */}
        {(tender.status === 'draft' || tender.status === 'cancelled') && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/create-tender?id=${tender.id}&mode=edit`)}
          >
            <Edit2 size={16} />
            Редактировать
          </Button>
        )}
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleCopyTender(tender)}
        >
          <Copy size={16} />
          Копировать
        </Button>
        
        {/* Кнопка "Опубликовать" для черновиков и отмененных */}
        {(tender.status === 'draft' || tender.status === 'cancelled') && (
          <Button
            variant="outline"
            size="sm"
            className="publish-btn"
            onClick={() => handlePublishTender(tender.id)}
          >
            <Send size={16} />
            Опубликовать
          </Button>
        )}
        
        {/* Кнопка "Отменить" для опубликованных */}
        {(tender.status === 'published' || tender.status === 'active' || tender.status === 'published_receiving_proposals') && (
          <Button
            variant="outline"
            size="sm"
            className="cancel-btn"
            onClick={() => handleCancelTender(tender.id)}
          >
            <XCircle size={16} />
            Отменить
          </Button>
        )}
        
        {/* Кнопка "Создать договор" для закрытых/завершенных тендеров с победителем */}
        {(tender.status === 'closed' || tender.status === 'completed') && tender.winner_id && (
          <Button
            variant="outline"
            size="sm"
            className="create-contract-btn"
            onClick={() => handleCreateContract(tender.id)}
          >
            <FileText size={16} />
            Создать договор
          </Button>
        )}
        
        {/* Кнопка "Удалить" только для черновиков и отмененных */}
        {(tender.status === 'draft' || tender.status === 'cancelled') && (
          <Button
            variant="outline"
            size="sm"
            className="delete-btn"
            onClick={() => handleDeleteTender(tender.id)}
          >
            <Trash2 size={16} />
          </Button>
        )}
      </div>
    </Card>
  );

  const TenderGrid = ({ tenders, emptyMessage }) => {
    if (tenders.length === 0) {
      return (
        <Card className="empty-state">
          <FileText size={48} className="empty-icon" />
          <p>{emptyMessage}</p>
        </Card>
      );
    }
    return (
      <div className="tenders-grid">
        {tenders.map((tender) => <TenderCard key={tender.id} tender={tender} />)}
      </div>
    );
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
      <div className="my-tenders-container">
        <div className="page-header">
          <div>
            <h1 className="page-title">Мои тендеры</h1>
            <p className="page-subtitle">Управление всеми вашими тендерами</p>
          </div>
          <div className="header-actions">
            <Button onClick={() => navigate('/create-tender')} className="create-btn">
              <Plus size={18} />
              Создать тендер
            </Button>
          </div>
        </div>

        <Tabs defaultValue="drafts" className="tenders-tabs">
          <TabsList>
            <TabsTrigger value="drafts">
              Черновики
              {draftTenders.length > 0 && <span className="tab-count">{draftTenders.length}</span>}
            </TabsTrigger>
            <TabsTrigger value="published">
              Опубликованные
              {publishedTenders.length > 0 && <span className="tab-count">{publishedTenders.length}</span>}
            </TabsTrigger>
            <TabsTrigger value="receiving">
              Прием заявок
              {receivingBidsTenders.length > 0 && <span className="tab-count">{receivingBidsTenders.length}</span>}
            </TabsTrigger>
            <TabsTrigger value="closed">
              Закрытые
              {closedTenders.length > 0 && <span className="tab-count">{closedTenders.length}</span>}
            </TabsTrigger>
            <TabsTrigger value="cancelled">
              Отмененные
              {cancelledTenders.length > 0 && <span className="tab-count">{cancelledTenders.length}</span>}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="drafts">
            <TenderGrid
              tenders={draftTenders}
              emptyMessage="Нет черновиков"
            />
          </TabsContent>

          <TabsContent value="published">
            <TenderGrid
              tenders={publishedTenders}
              emptyMessage="Нет опубликованных тендеров"
            />
          </TabsContent>

          <TabsContent value="receiving">
            <TenderGrid
              tenders={receivingBidsTenders}
              emptyMessage="Нет тендеров с приемом заявок"
            />
          </TabsContent>

          <TabsContent value="closed">
            <TenderGrid
              tenders={closedTenders}
              emptyMessage="Нет закрытых тендеров"
            />
          </TabsContent>

          <TabsContent value="cancelled">
            <TenderGrid
              tenders={cancelledTenders}
              emptyMessage="Нет отмененных тендеров"
            />
          </TabsContent>
        </Tabs>
      </div>

      <style jsx>{`
        .my-tenders-container {
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

        .header-actions {
          display: flex;
          gap: 12px;
        }

        .create-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          background: var(--primary);
          color: white;
        }

        .tenders-tabs {
          width: 100%;
        }

        .tab-count {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 20px;
          height: 20px;
          padding: 0 6px;
          margin-left: 8px;
          background: var(--primary);
          color: white;
          border-radius: 10px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .tenders-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
          gap: 20px;
          margin-top: 24px;
        }

        .tender-card {
          padding: 20px;
          background: white;
          border: 1px solid var(--border-light);
          border-radius: 8px;
          transition: all 0.2s ease;
          display: flex;
          flex-direction: column;
        }

        .tender-card:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
          border-color: var(--primary);
          transform: translateY(-2px);
        }

        .tender-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 16px;
          padding-bottom: 12px;
          border-bottom: 1px solid var(--border-light);
        }

        .tender-info {
          flex: 1;
        }

        .tender-title {
          font-size: 1.125rem;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 4px;
        }

        .tender-id {
          font-size: 0.75rem;
          color: var(--text-muted);
          margin: 0;
        }

        .status-badge {
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: capitalize;
        }

        .status-badge.status-published,
        .status-badge.status-active {
          background: rgba(16, 185, 129, 0.1);
          color: #10b981;
        }

        .status-badge.status-published_receiving_applications {
          background: rgba(59, 130, 246, 0.1);
          color: #3b82f6;
        }

        .status-badge.status-closed,
        .status-badge.status-completed {
          background: rgba(107, 114, 128, 0.1);
          color: #6b7280;
        }

        .status-badge.status-cancelled {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
        }

        .tender-description {
          font-size: 0.875rem;
          color: var(--text-secondary);
          margin-bottom: 16px;
          line-height: 1.5;
        }

        .tender-details {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          margin-bottom: 16px;
          padding: 12px;
          background: var(--bg-tertiary);
          border-radius: 6px;
        }

        .detail-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .detail-label {
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .detail-value {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        .detail-value.budget {
          color: var(--accent);
        }

        .tender-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 16px;
        }

        .tender-actions button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 8px 16px;
          font-size: 0.875rem;
          white-space: nowrap;
          flex: 0 1 auto;
          min-width: auto;
        }

        .delete-btn {
          color: #ef4444;
          border-color: #ef4444;
        }

        .delete-btn:hover {
          background: rgba(239, 68, 68, 0.1);
        }

        .publish-btn {
          color: #16a34a;
          border-color: #16a34a;
        }

        .publish-btn:hover {
          background: rgba(22, 163, 74, 0.1);
        }

        .cancel-btn {
          color: #f59e0b;
          border-color: #f59e0b;
        }

        .cancel-btn:hover {
          background: rgba(245, 158, 11, 0.1);
        }

        .create-contract-btn {
          color: #8b5cf6;
          border-color: #8b5cf6;
        }

        .create-contract-btn:hover {
          background: rgba(139, 92, 246, 0.1);
        }

        .empty-state {
          padding: 60px 40px;
          text-align: center;
          background: white;
          border: 1px solid var(--border-light);
          border-radius: 8px;
        }

        .empty-icon {
          color: var(--text-muted);
          margin-bottom: 16px;
        }

        .empty-state p {
          font-size: 1rem;
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
          .my-tenders-container {
            padding: 16px;
          }

          .page-header {
            flex-direction: column;
            gap: 16px;
            align-items: flex-start;
            padding: 16px;
          }

          .page-title {
            font-size: 1.5rem;
          }

          .tenders-grid {
            grid-template-columns: 1fr;
          }

          .tender-card {
            padding: 16px;
          }

          .tender-details {
            grid-template-columns: 1fr;
          }

          .tender-actions {
            flex-direction: column;
          }

          .tender-actions button {
            width: 100%;
          }
        }
      `}</style>
    </Layout>
  );
};

export default MyTenders;
