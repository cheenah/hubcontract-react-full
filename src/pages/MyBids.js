import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AppContext } from '@/App';
import { useLanguage } from '@/context/LanguageContext';
import Layout from '@/components/Layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Edit, ArrowLeft, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const MyBids = () => {
  const navigate = useNavigate();
  const { API } = React.useContext(AppContext);
  const { t } = useLanguage();
  const [bids, setBids] = useState([]);
  const [tenders, setTenders] = useState({});
  const [loading, setLoading] = useState(true);
  const [editingBid, setEditingBid] = useState(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [editFormData, setEditFormData] = useState({
    price: '',
    proposal: '',
    delivery_time: '',
    technical_spec: ''
  });

  useEffect(() => {
    fetchMyBids();
  }, []);

  const fetchMyBids = async () => {
    try {
      const bidsResponse = await axios.get(`${API}/bids/my`);
      setBids(bidsResponse.data);

      const tenderIds = [...new Set(bidsResponse.data.map(b => b.tender_id))];
      const tenderPromises = tenderIds.map(id => axios.get(`${API}/tenders/${id}`));
      const tenderResponses = await Promise.all(tenderPromises);
      
      const tendersMap = {};
      tenderResponses.forEach(res => {
        tendersMap[res.data.id] = res.data;
      });
      setTenders(tendersMap);
    } catch (error) {
      console.error('Error fetching bids:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditBid = (bid) => {
    setEditingBid(bid);
    setEditFormData({
      price: bid.price,
      proposal: bid.proposal || '',
      delivery_time: bid.delivery_time || '',
      technical_spec: bid.technical_spec || ''
    });
    setShowEditDialog(true);
  };

  const handleUpdateBid = async () => {
    if (!editFormData.price || !editFormData.proposal) {
      toast.error('Заполните все обязательные поля');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      // Prepare update data - only send fields that are provided
      const updateData = {
        price: parseFloat(editFormData.price),
        proposal: editFormData.proposal
      };
      
      // Add optional fields if provided
      if (editFormData.delivery_time) {
        updateData.delivery_time = editFormData.delivery_time;
      }
      if (editFormData.technical_spec) {
        updateData.technical_spec = editFormData.technical_spec;
      }
      
      await axios.put(`${API}/bids/${editingBid.id}`, updateData, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      toast.success('Заявка успешно обновлена');
      setShowEditDialog(false);
      fetchMyBids();
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Ошибка при обновлении заявки';
      toast.error(typeof errorMessage === 'string' ? errorMessage : JSON.stringify(errorMessage));
    }
  };

  const handleWithdrawBid = async (bidId) => {
    if (!window.confirm('Вы уверены, что хотите отозвать заявку?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API}/bids/${bidId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      toast.success('Заявка успешно отозвана');
      fetchMyBids();
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Ошибка при отзыве заявки';
      toast.error(typeof errorMessage === 'string' ? errorMessage : JSON.stringify(errorMessage));
    }
  };

  const handleDeleteBid = async (bidId) => {
    if (!window.confirm('Вы уверены, что хотите полностью удалить эту заявку? После удаления вы сможете подать новую заявку на этот тендер.')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API}/bids/${bidId}/permanent`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      toast.success('Заявка полностью удалена. Вы можете подать новую заявку на этот тендер.');
      fetchMyBids();
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Ошибка при удалении заявки';
      toast.error(typeof errorMessage === 'string' ? errorMessage : JSON.stringify(errorMessage));
    }
  };

  const canEditBid = (bid, tender) => {
    if (!tender) return false;
    // Allow editing for pending, stage1_approved, and withdrawn bids
    if (bid.status === 'winner') return false;
    
    const validStatuses = ['published', 'active', 'published_receiving_proposals', 'published_receiving_applications'];
    if (!validStatuses.includes(tender.status)) return false;
    
    if (tender.submission_end) {
      const deadline = new Date(tender.submission_end);
      const now = new Date();
      if (now > deadline) return false;
    }
    
    return true;
  };

  // Filter bids by tab
  const getFilteredBids = () => {
    switch (activeTab) {
      case 'active':
        // Активные заявки: pending, stage1_approved, submitted
        return bids.filter(bid => ['pending', 'stage1_approved', 'submitted'].includes(bid.status));
      case 'withdrawn':
        // Отозванные заявки
        return bids.filter(bid => bid.status === 'withdrawn');
      case 'completed':
        // Завершенные: winner, rejected
        return bids.filter(bid => ['winner', 'rejected'].includes(bid.status));
      case 'all':
      default:
        // Все заявки
        return bids;
    }
  };

  const getTabCounts = () => {
    return {
      all: bids.length,
      active: bids.filter(bid => ['pending', 'stage1_approved', 'submitted'].includes(bid.status)).length,
      withdrawn: bids.filter(bid => bid.status === 'withdrawn').length,
      completed: bids.filter(bid => ['winner', 'rejected'].includes(bid.status)).length
    };
  };

  const getStatusLabel = (status) => t(`status.${status}`);
  const getTypeLabel = (type) => {
    const map = {
      price_proposals: t('tenderList.priceProposals'),
      open_competition: t('tenderList.openCompetition'),
      auction: t('tenderList.auction'),
      single_source: t('tenderList.singleSource'),
    };
    return map[type] || type.replace('_', ' ');
  };
  const getCategoryLabel = (category) => {
    const map = {
      construction: t('tenderList.construction'),
      it: t('tenderList.itServices'),
      consulting: t('tenderList.consulting'),
      logistics: t('tenderList.logistics'),
    };
    return map[category] || category;
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
      <div className="my-bids-container" data-testid="my-bids-page">
        <div className="page-header">
          <h1 className="page-title">{t('myBids.title')}</h1>
          <p className="page-subtitle">{t('myBids.subtitle')}</p>
        </div>

        {bids.length === 0 ? (
          <Card className="empty-state neon-card">
            <FileText size={48} className="empty-icon" />
            <p>{t('myBids.noSubmitted')}</p>
            <Button
              onClick={() => navigate('/tenders')}
              className="neon-button-filled"
              style={{ marginTop: '16px' }}
            >
              {t('myBids.browseTenders')}
            </Button>
          </Card>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-6">
              <TabsTrigger value="all">
                Все заявки ({getTabCounts().all})
              </TabsTrigger>
              <TabsTrigger value="active">
                Активные ({getTabCounts().active})
              </TabsTrigger>
              <TabsTrigger value="withdrawn">
                Отозванные ({getTabCounts().withdrawn})
              </TabsTrigger>
              <TabsTrigger value="completed">
                Завершенные ({getTabCounts().completed})
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-0">
              <div className="bids-list">
                {getFilteredBids().length === 0 ? (
                  <Card className="empty-state neon-card">
                    <FileText size={48} className="empty-icon" />
                    <p>
                      {activeTab === 'active' && 'Нет активных заявок'}
                      {activeTab === 'withdrawn' && 'Нет отозванных заявок'}
                      {activeTab === 'completed' && 'Нет завершенных заявок'}
                      {activeTab === 'all' && 'Нет заявок'}
                    </p>
                  </Card>
                ) : (
                  getFilteredBids().map((bid) => {
                    const tender = tenders[bid.tender_id];
                    if (!tender) return null;

              return (
                <Card
                  key={bid.id}
                  className="bid-card neon-card"
                  onClick={() => navigate(`/tenders/${bid.tender_id}`)}
                  data-testid={`bid-card-${bid.id}`}
                >
                  <div className="bid-header">
                    <div>
                      <h3 className="tender-title">{tender.title}</h3>
                      <p className="tender-meta">
                        {getTypeLabel(tender.tender_type)} • {getCategoryLabel(tender.category)}
                      </p>
                    </div>
                    <span className={`status-badge status-${bid.status}`}>
                      {getStatusLabel(bid.status)}
                    </span>
                  </div>

                  <div className="bid-details">
                    <div className="bid-info-grid">
                      <div className="info-item">
                        <span className="info-label">{t('myBids.yourBid')}</span>
                        <span className="info-value bid-price">{bid.price.toLocaleString()} ₸</span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">{t('myBids.tenderBudget')}</span>
                        <span className="info-value">{tender.budget.toLocaleString()} ₸</span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">{t('myBids.aiScore')}</span>
                        <span className="info-value score">{bid.ai_score.toFixed(1)}/100</span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">{t('myBids.delivery')}</span>
                        <span className="info-value">{bid.delivery_time}</span>
                      </div>
                    </div>

                    <div className="proposal-section">
                      <p className="proposal-label">{t('myBids.yourProposal')}</p>
                      <p className="proposal-text">{bid.proposal}</p>
                    </div>
                  </div>

                  <div className="bid-actions" style={{ marginTop: '16px', display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      {canEditBid(bid, tender) && (
                        <>
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleEditBid(bid); }} 
                            title="Редактировать"
                            style={{
                              padding: '6px',
                              background: 'transparent',
                              border: 'none',
                              cursor: 'pointer',
                              color: '#6b7280',
                              borderRadius: '4px',
                              transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = '#f3f4f6';
                              e.currentTarget.style.color = '#1f2937';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'transparent';
                              e.currentTarget.style.color = '#6b7280';
                            }}
                          >
                            <Edit size={18} />
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleWithdrawBid(bid.id); }} 
                            title="Отозвать заявку"
                            style={{
                              padding: '6px',
                              background: 'transparent',
                              border: 'none',
                              cursor: 'pointer',
                              color: '#6b7280',
                              borderRadius: '4px',
                              transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = '#fee2e2';
                              e.currentTarget.style.color = '#ef4444';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'transparent';
                              e.currentTarget.style.color = '#6b7280';
                            }}
                          >
                            <ArrowLeft size={18} />
                          </button>
                        </>
                      )}
                      
                      {bid.status === 'withdrawn' && (
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleDeleteBid(bid.id); }} 
                          title="Удалить заявку полностью"
                          style={{
                            padding: '6px',
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            color: '#6b7280',
                            borderRadius: '4px',
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#fef2f2';
                            e.currentTarget.style.color = '#dc2626';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.color = '#6b7280';
                          }}
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                    
                    {bid.status === 'withdrawn' && (
                      <span style={{ padding: '4px 12px', background: '#fef2f2', border: '1px solid #ef4444', borderRadius: '12px', color: '#ef4444', fontSize: '0.75rem', fontWeight: '500' }}>
                        Заявка отозвана
                      </span>
                    )}
                    
                    <Button 
                      className="neon-button-filled" 
                      size="sm"
                      style={{ marginLeft: 'auto' }}
                    >
                      {t('myBids.viewTender')}
                    </Button>
                  </div>
                </Card>
              );
            })
                )}
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>

      {/* Edit Bid Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent style={{ maxWidth: '600px' }}>
          <DialogHeader>
            <DialogTitle>Редактировать заявку</DialogTitle>
          </DialogHeader>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px', maxHeight: '500px', overflowY: 'auto', paddingRight: '8px' }}>
            <div>
              <Label>Цена предложения (₸) *</Label>
              <Input
                type="number"
                value={editFormData.price}
                onChange={(e) => setEditFormData({...editFormData, price: e.target.value})}
                placeholder="Введите цену"
              />
            </div>
            
            <div>
              <Label>Срок поставки</Label>
              <Input
                type="text"
                value={editFormData.delivery_time}
                onChange={(e) => setEditFormData({...editFormData, delivery_time: e.target.value})}
                placeholder="Например: 30 дней, 2 месяца"
              />
            </div>
            
            <div>
              <Label>Предложение *</Label>
              <Textarea
                value={editFormData.proposal}
                onChange={(e) => setEditFormData({...editFormData, proposal: e.target.value})}
                placeholder="Опишите ваше предложение"
                rows={4}
              />
            </div>
            
            <div>
              <Label>Техническое предложение</Label>
              <Textarea
                value={editFormData.technical_spec}
                onChange={(e) => setEditFormData({...editFormData, technical_spec: e.target.value})}
                placeholder="Техническая спецификация и детали предложения"
                rows={4}
              />
            </div>
            
            {editingBid && editingBid.status === 'withdrawn' && (
              <div style={{ 
                padding: '12px', 
                background: '#fef3c7', 
                border: '1px solid #fbbf24', 
                borderRadius: '6px',
                fontSize: '0.875rem',
                color: '#92400e'
              }}>
                <strong>Внимание:</strong> Эта заявка была отозвана. После сохранения изменений она будет повторно подана на рассмотрение.
              </div>
            )}
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' }}>
              <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                Отмена
              </Button>
              <Button onClick={handleUpdateBid}>
                {editingBid && editingBid.status === 'withdrawn' ? 'Сохранить и подать заново' : 'Сохранить изменения'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <style jsx>{`
        .my-bids-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 40px 24px;
        }

        .loading-container {
          display: flex;
          justify-content: center;
          padding: 100px 0;
        }

        .page-header {
          margin-bottom: 40px;
        }

        .page-title {
          font-size: 2.5rem;
          font-weight: 700;
          color: #1a1a1a;
          margin-bottom: 8px;
        }

        .page-subtitle {
          font-size: 1.1rem;
          color: #666;
        }

        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px 24px;
          text-align: center;
          color: #1a1a1a;
          border: 1px solid #e0e0e0;
        }

        .empty-icon {
          color: #666;
          margin-bottom: 16px;
        }

        .bids-list {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .bid-card {
          cursor: pointer;
          padding: 24px;
          transition: all 0.3s ease;
          border: 1px solid #e0e0e0;
        }

        .bid-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
        }

        .bid-header {
          display: flex;
          justify-content: space-between;
          align-items: start;
          margin-bottom: 20px;
          gap: 16px;
        }

        .tender-title {
          font-size: 1.5rem;
          font-weight: 600;
          color: #1a1a1a;
          margin-bottom: 6px;
        }

        .tender-meta {
          font-size: 0.9rem;
          color: #666;
          text-transform: capitalize;
        }

        .bid-details {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .bid-info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
          padding: 16px;
          background: #f8f9fa;
          border-radius: 8px;
        }

        .info-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .info-label {
          font-size: 0.85rem;
          color: #666;
        }

        .info-value {
          font-size: 1.1rem;
          font-weight: 600;
          color: #1a1a1a;
        }

        .info-value.bid-price {
          font-size: 1.3rem;
          color: #2563eb;
        }

        .info-value.score {
          color: #16a34a;
        }

        .proposal-section {
          padding: 16px;
          background: #f0f9ff;
          border-radius: 8px;
        }

        .proposal-label {
          font-size: 0.9rem;
          color: #666;
          margin-bottom: 8px;
        }

        .proposal-text {
          color: #1a1a1a;
          line-height: 1.6;
          word-wrap: break-word;
          white-space: pre-wrap;
          overflow-wrap: break-word;
          margin: 0;
        }

        /* Tabs styling */
        :global(.my-bids-container [role="tablist"]) {
          background: white;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          padding: 4px;
        }

        :global(.my-bids-container [role="tab"]) {
          font-weight: 500;
          color: #666;
          padding: 12px 20px;
          border-radius: 6px;
          transition: all 0.2s;
        }

        :global(.my-bids-container [role="tab"]:hover) {
          background: #f5f5f5;
          color: #1a1a1a;
        }

        :global(.my-bids-container [role="tab"][data-state="active"]) {
          background: #1e40af;
          color: white;
          font-weight: 600;
        }

        @media (max-width: 768px) {
          .page-title {
            font-size: 2rem;
          }

          .bid-info-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          :global(.my-bids-container [role="tablist"]) {
            display: flex;
            flex-wrap: wrap;
          }

          :global(.my-bids-container [role="tab"]) {
            font-size: 0.875rem;
            padding: 10px 12px;
          }
        }
      `}</style>
    </Layout>
  );
};

export default MyBids;