import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import { AppContext } from '@/App';
import { useLanguage } from '@/context/LanguageContext';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Calendar, MapPin, DollarSign, FileText, Banknote, Download } from 'lucide-react';

const TenderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, API } = React.useContext(AppContext);
  const { t } = useLanguage();
  const [tender, setTender] = useState(null);
  const [bids, setBids] = useState([]);
  const [showBidDialog, setShowBidDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submittingBid, setSubmittingBid] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState([]);
  
  const [bidForm, setBidForm] = useState({
    price: '',
    proposal: '',
    delivery_time: '',
    documents: []
  });

  useEffect(() => {
    fetchTenderDetails();
  }, [id]);

  const fetchTenderDetails = async () => {
    try {
      const tenderResponse = await axios.get(`${API}/tenders/${id}`);
      setTender(tenderResponse.data);

      if (user && user.role === 'customer' && tenderResponse.data.customer_id === user.id) {
        const bidsResponse = await axios.get(`${API}/bids/tender/${id}`);
        setBids(bidsResponse.data);
      }
    } catch (error) {
      toast.error(t('common.error'));
      navigate('/tenders');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files);
    const uploadedFiles = [];
    
    for (const file of files) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast.error(`Файл ${file.name} превышает 10MB`);
        continue;
      }
      
      const base64 = await convertToBase64(file);
      uploadedFiles.push({
        filename: file.name,
        content: base64,
        type: file.type,
        size: file.size.toString()
      });
    }
    
    setAttachedFiles([...attachedFiles, ...uploadedFiles]);
  };

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.readAsDataURL(file);
      fileReader.onload = () => resolve(fileReader.result);
      fileReader.onerror = (error) => reject(error);
    });
  };

  const removeFile = (index) => {
    const newFiles = attachedFiles.filter((_, i) => i !== index);
    setAttachedFiles(newFiles);
  };

  const handleSubmitBid = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!agreeToTerms) {
      toast.error('Необходимо согласиться с условиями тендера');
      return;
    }
    
    const bidPrice = parseFloat(bidForm.price);
    
    if (!bidForm.price || bidPrice <= 0) {
      toast.error('Укажите корректную цену предложения');
      return;
    }
    
    // Check if bid price exceeds tender budget
    if (bidPrice > tender.budget) {
      toast.error(`Цена заявки (${bidPrice.toLocaleString()} $) не может превышать бюджет тендера (${tender.budget.toLocaleString()} $)`);
      return;
    }
    
    if (!bidForm.delivery_time || parseInt(bidForm.delivery_time) <= 0) {
      toast.error('Укажите срок выполнения в днях');
      return;
    }
    
    if (!bidForm.proposal || bidForm.proposal.length < 50) {
      toast.error('Описание предложения должно быть не менее 50 символов');
      return;
    }
    
    // Check if tender is still accepting bids
    const now = new Date();
    if (tender.deadline) {
      const deadline = new Date(tender.deadline);
      if (now > deadline) {
        toast.error('Срок подачи заявок истек');
        return;
      }
    }
    
    setSubmittingBid(true);
    
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API}/bids`, 
        {
          tender_id: id,
          price: bidPrice,
          proposal: bidForm.proposal,
          delivery_time: bidForm.delivery_time,
          documents: attachedFiles
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      toast.success('Заявка успешно подана! Заказчик получил уведомление.');
      setShowBidDialog(false);
      setBidForm({ price: '', proposal: '', delivery_time: '' });
      setAttachedFiles([]);
      setAgreeToTerms(false);
      
      // Refresh tender details to show updated info
      fetchTenderDetails();
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'Ошибка при подаче заявки';
      toast.error(errorMsg);
    } finally {
      setSubmittingBid(false);
    }
  };

  const handleSelectWinner = async () => {
    try {
      await axios.post(`${API}/bids/${id}/select-winner`);
      toast.success(t('common.success'));
      fetchTenderDetails();
    } catch (error) {
      toast.error(error.response?.data?.detail || t('common.error'));
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

  if (!tender) return null;

  const isOwner = user && user.role === 'customer' && tender.customer_id === user.id;
  const canBid = user && user.role === 'contractor' && 
    (tender.status === 'active' || tender.status === 'published_receiving_proposals' || tender.status === 'published');

  
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

  return (
    <Layout>
      <div className="tender-detail-container" data-testid="tender-detail">
        <div className="tender-header-section">
          <div>
            <h1 className="tender-title" data-testid="tender-title">{tender.title}</h1>
            <div className="tender-meta">
              <span className={`status-badge status-${tender.status}`}>
                {getStatusLabel(tender.status)}
              </span>
              <span className="tender-type">{getTypeLabel(tender.tender_type)}</span>
            </div>
          </div>
          {canBid && (
            <Button
              onClick={() => navigate(`/tenders/${tender.id}/submit-bid`)}
              className="neon-button-filled"
              data-testid="submit-bid-btn"
            >
              {t('tenderDetail.submitBid')}
            </Button>
          )}
          {isOwner && tender.status === 'active' && bids.filter(b => b.status === 'stage1_approved').length > 0 && (
            <Button
              onClick={handleSelectWinner}
              className="neon-button-filled"
              data-testid="select-winner-btn"
            >
              {t('tenderDetail.selectWinner')}
            </Button>
          )}
          {/* Показать протокол для закрытых и завершенных тендеров */}
          {(tender.status === 'closed' || tender.status === 'failed') && (
            <Button
              onClick={() => navigate(`/protocol/${id}`)}
              className="neon-button-filled"
              data-testid="view-protocol-btn"
            >
              <FileText size={16} style={{marginRight: '8px'}} />
              Посмотреть протокол
            </Button>
          )}
        </div>

        <div className="tender-content">
          <Card className="tender-info-card neon-card">
            <h2 className="section-title">{t('tenderDetail.tenderInfo')}</h2>
            
            <div className="info-grid">
              <div className="info-item">
                <Banknote className="info-icon" />
                <div>
                  <p className="info-label">{t('tenderList.budget')}</p>
                  <p className="info-value">{tender.budget.toLocaleString()} $</p>
                </div>
              </div>

              <div className="info-item">
                <Calendar className="info-icon" />
                <div>
                  <p className="info-label">{t('tenderDetail.deadline')}</p>
                  <p className="info-value">{new Date(tender.deadline).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="info-item">
                <MapPin className="info-icon" />
                <div>
                  <p className="info-label">{t('tenderList.region')}</p>
                  <p className="info-value">{tender.region}</p>
                </div>
              </div>

              <div className="info-item">
                <FileText className="info-icon" />
                <div>
                  <p className="info-label">{t('tenderList.category')}</p>
                  <p className="info-value">{getCategoryLabel(tender.category)}</p>
                </div>
              </div>
            </div>
            <div className="description-section">
              <h3 className="subsection-title">{t('tenderDetail.description')}</h3>
              <p className="description-text">{tender.description}</p>
            </div>

            <div className="description-section">
              <h3 className="subsection-title">{t('tenderDetail.technicalSpecs')}</h3>
              <p className="description-text">{tender.technical_specs}</p>
            </div>
<div className="description-section">
  <h3 className="subsection-title">Документы тендера</h3>
  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '8px' }}>
    <a href="/documents/tz.pdf" download style={{ display:'flex', alignItems:'center', gap:'10px', padding:'10px 14px', border:'0.5px solid var(--color-border-secondary)', borderRadius:'8px', textDecoration:'none', color:'var(--color-text-primary)', background:'var(--color-background-secondary)', fontSize:'14px' }}>
      <FileText size={16} style={{ color:'var(--color-text-secondary)', flexShrink:0 }} />
      <span style={{ flex:1 }}>Техническое задание</span>
      <Download size={15} style={{ color:'var(--color-text-secondary)', flexShrink:0 }} />
    </a>
    <a href="/documents/tender_announcement.pdf" download style={{ display:'flex', alignItems:'center', gap:'10px', padding:'10px 14px', border:'0.5px solid var(--color-border-secondary)', borderRadius:'8px', textDecoration:'none', color:'var(--color-text-primary)', background:'var(--color-background-secondary)', fontSize:'14px' }}>
      <FileText size={16} style={{ color:'var(--color-text-secondary)', flexShrink:0 }} />
      <span style={{ flex:1 }}>Объявление о тендере</span>
      <Download size={15} style={{ color:'var(--color-text-secondary)', flexShrink:0 }} />
    </a>
    <a href="/documents/press.pdf" download style={{ display:'flex', alignItems:'center', gap:'10px', padding:'10px 14px', border:'0.5px solid var(--color-border-secondary)', borderRadius:'8px', textDecoration:'none', color:'var(--color-text-primary)', background:'var(--color-background-secondary)', fontSize:'14px' }}>
      <FileText size={16} style={{ color:'var(--color-text-secondary)', flexShrink:0 }} />
      <span style={{ flex:1 }}>Пресс-релиз</span>
      <Download size={15} style={{ color:'var(--color-text-secondary)', flexShrink:0 }} />
    </a>
    <a href="/documents/agreement.pdf" download style={{ display:'flex', alignItems:'center', gap:'10px', padding:'10px 14px', border:'0.5px solid var(--color-border-secondary)', borderRadius:'8px', textDecoration:'none', color:'var(--color-text-primary)', background:'var(--color-background-secondary)', fontSize:'14px' }}>
      <FileText size={16} style={{ color:'var(--color-text-secondary)', flexShrink:0 }} />
      <span style={{ flex:1 }}>Соглашение</span>
      <Download size={15} style={{ color:'var(--color-text-secondary)', flexShrink:0 }} />
    </a>
  </div>
</div>
            {tender.requirements && tender.requirements.length > 0 && (
              <div className="description-section">
                <h3 className="subsection-title">{t('tenderDetail.requirements')}</h3>
                <ul className="requirements-list">
                  {tender.requirements.map((req, idx) => (
                    <li key={idx}>{req}</li>
                  ))}
                </ul>
              </div>
            )}
          </Card>

          {isOwner && bids.length > 0 && (
            <Card className="bids-card neon-card">
              <h2 className="section-title">{t('tenderDetail.submittedBids')} ({bids.length})</h2>
              <div className="bids-list">
                {bids.map((bid) => (
                  <div key={bid.id} className="bid-item" data-testid={`bid-${bid.id}`}>
                    <div className="bid-header">
                      <div>
                        <p className="bid-contractor">{bid.contractor_email}</p>
                        <p className="bid-price">{bid.price.toLocaleString()} $</p>
                      </div>
                      <div className="bid-status-info">
                        <span className={`status-badge status-${bid.status}`}>
                          {getStatusLabel(bid.status)}
                        </span>
                        <span className="bid-score">{t('tenderDetail.aiScore')}: {bid.ai_score.toFixed(1)}/100</span>
                      </div>
                    </div>
                    <p className="bid-proposal">{bid.proposal}</p>
                    <p className="bid-delivery">{t('tenderDetail.delivery')}: {bid.delivery_time}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        <Dialog open={showBidDialog} onOpenChange={setShowBidDialog}>
          <DialogContent className="bid-dialog" data-testid="bid-dialog">
            <DialogHeader>
              <DialogTitle>Подача заявки на тендер</DialogTitle>
              <p className="dialog-subtitle">Заполните все поля для подачи заявки</p>
            </DialogHeader>
            <form onSubmit={handleSubmitBid} className="bid-form">
              
              {/* Согласие с условиями */}
              <div className="form-field checkbox-field">
                <input
                  type="checkbox"
                  id="agree-terms"
                  checked={agreeToTerms}
                  onChange={(e) => setAgreeToTerms(e.target.checked)}
                  className="terms-checkbox"
                />
                <label htmlFor="agree-terms" className="terms-label">
                  Я согласен с условиями тендера и подтверждаю достоверность предоставленной информации *
                </label>
              </div>

              {/* Цена предложения */}
              <div className="form-field">
                <Label htmlFor="price">Цена предложения ($) *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  placeholder="Укажите вашу цену"
                  value={bidForm.price}
                  onChange={(e) => setBidForm({ ...bidForm, price: e.target.value })}
                  required
                  data-testid="bid-price-input"
                />
                <p className="field-hint">Максимальный бюджет тендера: {tender.budget.toLocaleString()} $</p>
              </div>

              {/* Срок выполнения */}
              <div className="form-field">
                <Label htmlFor="delivery">Срок выполнения (дней) *</Label>
                <Input
                  id="delivery"
                  type="number"
                  placeholder="Укажите срок в днях"
                  value={bidForm.delivery_time}
                  onChange={(e) => setBidForm({ ...bidForm, delivery_time: e.target.value })}
                  required
                  data-testid="bid-delivery-input"
                />
                <p className="field-hint">Укажите количество календарных дней для выполнения работ</p>
              </div>

              {/* Описание предложения */}
              <div className="form-field">
                <Label htmlFor="proposal">Описание предложения *</Label>
                <Textarea
                  id="proposal"
                  placeholder="Подробно опишите ваше предложение, опыт работы, подход к выполнению..."
                  value={bidForm.proposal}
                  onChange={(e) => setBidForm({ ...bidForm, proposal: e.target.value })}
                  required
                  rows={6}
                  data-testid="bid-proposal-input"
                />
                <p className="field-hint">Минимум 50 символов. Текущая длина: {bidForm.proposal.length}</p>
              </div>

              {/* Загрузка документов */}
              <div className="form-field">
                <Label htmlFor="documents">Документы (необязательно)</Label>
                <input
                  type="file"
                  id="documents"
                  multiple
                  onChange={handleFileUpload}
                  className="file-input"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                />
                <p className="field-hint">Технический план, сертификаты, портфолио (максимум 10MB на файл)</p>
                
                {/* Список загруженных файлов */}
                {attachedFiles.length > 0 && (
                  <div className="attached-files-list">
                    {attachedFiles.map((file, index) => (
                      <div key={index} className="file-item">
                        <span className="file-name">{file.filename}</span>
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="remove-file-btn"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Кнопки действий */}
              <div className="form-actions">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowBidDialog(false)}
                  disabled={submittingBid}
                >
                  Отмена
                </Button>
                <Button 
                  type="submit" 
                  className="neon-button-filled" 
                  disabled={!agreeToTerms || submittingBid}
                  data-testid="bid-submit-btn"
                >
                  {submittingBid ? 'Отправка...' : 'Подать заявку'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <style jsx>{`
        .tender-detail-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 40px 24px;
        }

        .loading-container {
          display: flex;
          justify-content: center;
          padding: 100px 0;
        }

        .tender-header-section {
          display: flex;
          justify-content: space-between;
          align-items: start;
          margin-bottom: 32px;
          flex-wrap: wrap;
          gap: 20px;
        }

        .tender-title {
          font-size: 2.5rem;
          font-weight: 700;
          color: #1a1a1a;
          margin-bottom: 12px;
        }

        .tender-meta {
          display: flex;
          gap: 12px;
          align-items: center;
          flex-wrap: wrap;
        }

        .tender-type {
          padding: 6px 12px;
          background: #f0f9ff;
          color: #2563eb;
          border: 1px solid #2563eb;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          text-transform: capitalize;
        }

        .tender-content {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .tender-info-card, .bids-card {
          padding: 32px;
          border: 1px solid #e0e0e0;
        }

        .section-title {
          font-size: 1.8rem;
          font-weight: 700;
          color: #1a1a1a;
          margin-bottom: 24px;
        }

        .info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 24px;
          margin-bottom: 32px;
        }

        .info-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px;
          background: #f8f9fa;
          border-radius: 8px;
        }

        .info-icon {
          color: #2563eb;
          flex-shrink: 0;
        }

        .info-label {
          font-size: 0.85rem;
          color: #666;
          margin-bottom: 4px;
        }

        .info-value {
          font-size: 1.1rem;
          font-weight: 600;
          color: #1a1a1a;
        }

        .description-section {
          margin-top: 24px;
        }

        .subsection-title {
          font-size: 1.2rem;
          font-weight: 600;
          color: #2563eb;
          margin-bottom: 12px;
        }

        .description-text {
          color: #444;
          line-height: 1.7;
        }

        .requirements-list {
          list-style: none;
          padding: 0;
        }

        .requirements-list li {
          padding: 10px 0;
          padding-left: 28px;
          position: relative;
          color: #444;
          line-height: 1.6;
        }

        .requirements-list li::before {
          content: '✓';
          position: absolute;
          left: 0;
          color: #16a34a;
          font-weight: 700;
        }

        .bids-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .bid-item {
          padding: 20px;
          background: #f8f9fa;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
        }

        .bid-header {
          display: flex;
          justify-content: space-between;
          align-items: start;
          margin-bottom: 12px;
          gap: 12px;
        }

        .bid-contractor {
          font-size: 1.1rem;
          font-weight: 600;
          color: #1a1a1a;
          margin-bottom: 4px;
        }

        .bid-price {
          font-size: 1.3rem;
          font-weight: 700;
          color: #2563eb;
        }

        .bid-status-info {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 8px;
        }

        .bid-score {
          font-size: 0.9rem;
          color: #666;
        }

        .bid-proposal {
          color: #444;
          line-height: 1.6;
          margin-bottom: 8px;
        }

        .bid-delivery {
          font-size: 0.9rem;
          color: #2563eb;
        }

        .bid-dialog {
          max-width: 650px;
        }

        .dialog-subtitle {
          color: #666;
          font-size: 0.9rem;
          margin-top: 4px;
        }

        .bid-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
          margin-top: 20px;
        }

        .form-field {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .checkbox-field {
          flex-direction: row;
          align-items: flex-start;
          gap: 12px;
        }

        .terms-checkbox {
          width: 20px;
          height: 20px;
          margin-top: 2px;
          cursor: pointer;
          accent-color: #1e40af;
        }

        .terms-label {
          font-size: 0.9rem;
          color: #333;
          line-height: 1.5;
          cursor: pointer;
        }

        .field-hint {
          font-size: 0.85rem;
          color: #666;
          margin-top: 4px;
        }

        .file-input {
          padding: 8px;
          border: 2px dashed #d1d5db;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s;
        }

        .file-input:hover {
          border-color: #1e40af;
          background: #f9fafb;
        }

        .attached-files-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-top: 12px;
        }

        .file-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 12px;
          background: #f3f4f6;
          border-radius: 6px;
          font-size: 0.9rem;
        }

        .file-name {
          color: #374151;
          font-weight: 500;
        }

        .remove-file-btn {
          background: transparent;
          border: none;
          color: #ef4444;
          font-size: 1.2rem;
          cursor: pointer;
          padding: 0 8px;
          transition: color 0.2s;
        }

        .remove-file-btn:hover {
          color: #dc2626;
        }

        .form-actions {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
          margin-top: 8px;
        }

        .form-actions button {
          min-width: 120px;
        }

        @media (max-width: 768px) {
          .tender-title {
            font-size: 1.8rem;
          }

          .info-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </Layout>
  );
};

export default TenderDetail;