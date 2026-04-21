import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AppContext } from '@/App';
import { useLanguage } from '@/context/LanguageContext';
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
        <div className="loading-container">
          <div className="loading-spinner"></div>
        </div>
    );
  }

  return (
    <>
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
              className="neon-button-filled mb-bid-actions"
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

                  <div className="bid-actions mb-bid-row">
                    <div className="mb-bid-row-left">
                      {canEditBid(bid, tender) && (
                        <>
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleEditBid(bid); }} 
                            title="Редактировать"
                            style={{
                              padding: 'var(--space-1-5)',
                              background: 'transparent',
                              border: 'none',
                              cursor: 'pointer',
                              color: 'var(--color-text-muted)',
                              borderRadius: 'var(--radius-sm)',
                              transition: 'all var(--transition-normal)'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = 'var(--color-bg-muted)';
                              e.currentTarget.style.color = 'var(--color-text-dark2)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'transparent';
                              e.currentTarget.style.color = 'var(--color-text-muted)';
                            }}
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleWithdrawBid(bid.id); }}
                            title="Отозвать заявку"
                            style={{
                              padding: 'var(--space-1-5)',
                              background: 'transparent',
                              border: 'none',
                              cursor: 'pointer',
                              color: 'var(--color-text-muted)',
                              borderRadius: 'var(--radius-sm)',
                              transition: 'all var(--transition-normal)'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = 'var(--color-danger-tint-10)';
                              e.currentTarget.style.color = 'var(--color-danger)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'transparent';
                              e.currentTarget.style.color = 'var(--color-text-muted)';
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
                            padding: 'var(--space-1-5)',
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            color: 'var(--color-text-muted)',
                            borderRadius: 'var(--radius-sm)',
                            transition: 'all var(--transition-normal)'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'var(--color-danger-tint-05)';
                            e.currentTarget.style.color = 'var(--color-danger-alt)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.color = 'var(--color-text-muted)';
                          }}
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                    
                    {bid.status === 'withdrawn' && (
                      <span className="mb-cancel-tag">
                        Заявка отозвана
                      </span>
                    )}
                    
                    <Button 
                      className="neon-button-filled mb-ml-auto"
                      size="sm"
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
        <DialogContent className="mb-dialog">
          <DialogHeader>
            <DialogTitle>{t('myBids.editTitle')}</DialogTitle>
          </DialogHeader>

          <div className="mb-dialog-body">
            <div>
              <Label>{t('tenderDetail.bidPrice')} *</Label>
              <Input
                type="number"
                value={editFormData.price}
                onChange={(e) => setEditFormData({...editFormData, price: e.target.value})}
                placeholder={t('tenderDetail.pricePlaceholder')}
              />
            </div>

            <div>
              <Label>{t('tenderDetail.deliveryTime')}</Label>
              <Input
                type="text"
                value={editFormData.delivery_time}
                onChange={(e) => setEditFormData({...editFormData, delivery_time: e.target.value})}
                placeholder={t('tenderDetail.deliveryPlaceholder')}
              />
            </div>

            <div>
              <Label>{t('tenderDetail.yourProposal')} *</Label>
              <Textarea
                value={editFormData.proposal}
                onChange={(e) => setEditFormData({...editFormData, proposal: e.target.value})}
                placeholder={t('tenderDetail.proposalPlaceholder')}
                rows={4}
              />
            </div>

            <div>
              <Label>{t('myBids.techSpec')}</Label>
              <Textarea
                value={editFormData.technical_spec}
                onChange={(e) => setEditFormData({...editFormData, technical_spec: e.target.value})}
                placeholder={t('myBids.techSpecPlaceholder')}
                rows={4}
              />
            </div>

            {editingBid && editingBid.status === 'withdrawn' && (
              <div className="mb-withdrawn-notice">
                <strong>{t('myBids.notice')}:</strong> {t('auth.withdrawnBidWarning')}
              </div>
            )}

            <div className="mb-dialog-footer">
              <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                {t('common.cancel')}
              </Button>
              <Button onClick={handleUpdateBid}>
                {editingBid && editingBid.status === 'withdrawn' ? t('auth.saveAndResubmit') : t('myBids.saveChanges')}
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
          font-size: var(--font-size-7xl);
          font-weight: var(--font-weight-bold);
          color: var(--color-text-dark);
          margin-bottom: var(--space-2);
        }

        .page-subtitle {
          font-size: var(--font-size-lg);
          color: var(--color-text-muted);
        }

        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px 24px;
          text-align: center;
          color: var(--color-text-dark);
          border: 1px solid var(--color-border);
        }

        .empty-icon {
          color: var(--color-text-muted);
          margin-bottom: var(--space-4);
        }

        .bids-list {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .bid-card {
          cursor: pointer;
          padding: var(--space-6);
          transition: all var(--transition-slow) ease;
          border: 1px solid var(--color-border);
        }

        .bid-card:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-card-hover);
        }

        .bid-header {
          display: flex;
          justify-content: space-between;
          align-items: start;
          margin-bottom: 20px;
          gap: 16px;
        }

        .tender-title {
          font-size: var(--font-size-3xl);
          font-weight: var(--font-weight-semibold);
          color: var(--color-text-dark);
          margin-bottom: var(--space-1-5);
        }

        .tender-meta {
          font-size: var(--font-size-base);
          color: var(--color-text-muted);
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
          gap: var(--space-4);
          padding: var(--space-4);
          background: var(--color-bg-subtle);
          border-radius: var(--radius-lg);
        }

        .info-item {
          display: flex;
          flex-direction: column;
          gap: var(--space-1);
        }

        .info-label {
          font-size: var(--font-size-base);
          color: var(--color-text-muted);
        }

        .info-value {
          font-size: var(--font-size-lg);
          font-weight: var(--font-weight-semibold);
          color: var(--color-text-dark);
        }

        .info-value.bid-price {
          font-size: var(--font-size-xl3);
          color: var(--color-primary);
        }

        .info-value.score {
          color: var(--color-success-mid);
        }

        .proposal-section {
          padding: var(--space-4);
          background: var(--color-primary-bg);
          border-radius: var(--radius-lg);
        }

        .proposal-label {
          font-size: var(--font-size-base);
          color: var(--color-text-muted);
          margin-bottom: var(--space-2);
        }

        .proposal-text {
          color: var(--color-text-dark);
          line-height: var(--line-height-relaxed);
          word-wrap: break-word;
          white-space: pre-wrap;
          overflow-wrap: break-word;
          margin: 0;
        }

        /* Tabs styling */
        :global(.my-bids-container [role="tablist"]) {
          background: var(--color-bg-surface);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
          padding: var(--space-1);
        }

        :global(.my-bids-container [role="tab"]) {
          font-weight: var(--font-weight-medium);
          color: var(--color-text-muted);
          padding: var(--space-3) var(--space-5);
          border-radius: var(--radius-md);
          transition: all var(--transition-normal);
        }

        :global(.my-bids-container [role="tab"]:hover) {
          background: var(--color-bg-muted);
          color: var(--color-text-dark);
        }

        :global(.my-bids-container [role="tab"][data-state="active"]) {
          background: var(--color-primary-dark);
          color: var(--color-text-inverse);
          font-weight: var(--font-weight-semibold);
        }

        /* Utility classes extracted from inline styles */
        .mb-bid-actions {
          margin-top: var(--space-4);
        }

        .mb-bid-row {
          margin-top: var(--space-4);
          display: flex;
          gap: var(--space-2);
          align-items: center;
          justify-content: space-between;
        }

        .mb-bid-row-left {
          display: flex;
          gap: var(--space-2);
          align-items: center;
        }

        .mb-cancel-tag {
          padding: var(--space-1) var(--space-3);
          background: var(--color-danger-tint-05);
          border: 1px solid var(--color-danger);
          border-radius: var(--radius-4xl);
          color: var(--color-danger);
          font-size: var(--font-size-xs);
          font-weight: var(--font-weight-medium);
        }

        .mb-ml-auto {
          margin-left: auto;
        }

        :global(.mb-dialog) {
          max-width: 600px;
        }

        .mb-dialog-body {
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
          margin-top: var(--space-4);
          max-height: 500px;
          overflow-y: auto;
          padding-right: var(--space-2);
        }

        .mb-withdrawn-notice {
          padding: var(--space-3);
          background: var(--color-bg-muted);
          border: 1px solid var(--color-warning);
          border-radius: var(--radius-md);
          font-size: var(--font-size-base);
          color: var(--color-text-secondary);
        }

        .mb-dialog-footer {
          display: flex;
          justify-content: flex-end;
          gap: var(--space-2);
          margin-top: var(--space-2);
        }

        @media (max-width: 768px) {
          .page-title {
            font-size: var(--font-size-6xl);
          }

          .bid-info-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          :global(.my-bids-container [role="tablist"]) {
            display: flex;
            flex-wrap: wrap;
          }

          :global(.my-bids-container [role="tab"]) {
            font-size: var(--font-size-base);
            padding: var(--space-2-5) var(--space-3);
          }
        }
      `}</style>
  </>
  );
};

export default MyBids;