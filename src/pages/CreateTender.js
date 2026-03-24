import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import { AppContext } from '@/App';
import { useLanguage } from '@/context/LanguageContext';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText } from 'lucide-react';

const CreateTender = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tenderId = searchParams.get('id');
  const mode = searchParams.get('mode'); // 'edit' or null (create)
  const { API } = React.useContext(AppContext);
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(!!tenderId);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    tender_type: 'price_proposals',
    category: 'construction',
    region: '',
    budget: '',
    quantity: 1,
    unit_price: '',
    deadline: '',
    technical_specs: '',
    requirements: [''],
    status: 'draft',
    publication_date: '',
    submission_start: '',
    submission_end: '',
    documents: []
  });
  
  const [attachedFiles, setAttachedFiles] = useState([]);

  // Load tender data if editing
  useEffect(() => {
    if (tenderId && mode === 'edit') {
      loadTender();
    }
  }, [tenderId, mode]);

  const loadTender = async () => {
    try {
      const response = await axios.get(`${API}/tenders/${tenderId}`);
      const tender = response.data;
      
      // Format dates for datetime-local inputs
      const formatForInput = (isoDate) => {
        if (!isoDate) return '';
        const date = new Date(isoDate);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
      };
      
      setFormData({
        title: tender.title || '',
        description: tender.description || '',
        tender_type: tender.tender_type || 'price_proposals',
        category: tender.category || 'construction',
        region: tender.region || '',
        budget: tender.budget || '',
        quantity: tender.quantity || 1,
        unit_price: tender.unit_price || '',
        deadline: tender.deadline || '',
        technical_specs: tender.technical_specs || '',
        requirements: tender.requirements || [''],
        status: tender.status || 'draft',
        publication_date: formatForInput(tender.publication_date),
        submission_start: formatForInput(tender.submission_start),
        submission_end: formatForInput(tender.submission_end),
        documents: tender.documents || []
      });
      setAttachedFiles(tender.documents || []);
    } catch (error) {
      console.error('Error loading tender:', error);
      alert('Ошибка при загрузке тендера');
      navigate('/my-tenders');
    } finally {
      setInitialLoading(false);
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
        size: file.size.toString()  // Convert to string for backend validation
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

  // Calculate total amount when quantity or unit price changes
  const calculateTotal = () => {
    const qty = parseInt(formData.quantity) || 0;
    const price = parseFloat(formData.unit_price) || 0;
    return qty * price;
  };

  const handleAddRequirement = () => {
    setFormData({ ...formData, requirements: [...formData.requirements, ''] });
  };

  const handleRemoveRequirement = (index) => {
    const newRequirements = formData.requirements.filter((_, i) => i !== index);
    setFormData({ ...formData, requirements: newRequirements });
  };

  const handleRequirementChange = (index, value) => {
    const newRequirements = [...formData.requirements];
    newRequirements[index] = value;
    setFormData({ ...formData, requirements: newRequirements });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const tenderData = {
        ...formData,
        budget: parseFloat(formData.budget),
        quantity: parseInt(formData.quantity) || 1,
        unit_price: parseFloat(formData.unit_price) || 0,
        requirements: formData.requirements.filter(r => r.trim() !== ''),
        documents: attachedFiles
      };
      
      let response;
      if (tenderId && mode === 'edit') {
        // Update existing tender
        response = await axios.put(`${API}/tenders/${tenderId}`, tenderData);
        toast.success('Тендер обновлен!');
      } else {
        // Create new tender
        response = await axios.post(`${API}/tenders`, tenderData);
        toast.success('Тендер создан!');
      }
      
      navigate(`/tenders/${response.data.id}`);
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.response?.data?.detail || 'Ошибка при сохранении тендера');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDraft = async () => {
    setLoading(true);
    
    try {
      const tenderData = {
        ...formData,
        status: 'draft',
        budget: parseFloat(formData.budget) || 0,
        quantity: parseInt(formData.quantity) || 1,
        unit_price: parseFloat(formData.unit_price) || 0,
        requirements: formData.requirements.filter(r => r.trim() !== ''),
        documents: attachedFiles
      };
      
      let response;
      if (tenderId && mode === 'edit') {
        // Update existing tender as draft
        response = await axios.put(`${API}/tenders/${tenderId}`, tenderData);
        toast.success('Черновик сохранен!');
      } else {
        // Create new tender as draft
        response = await axios.post(`${API}/tenders`, tenderData);
        toast.success('Черновик сохранен!');
      }
      
      navigate('/my-tenders');
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.response?.data?.detail || 'Ошибка при сохранении черновика');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="create-tender-wrapper">
        {initialLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}>
            <div className="loading-spinner"></div>
          </div>
        ) : (
          <div className="create-tender-container" data-testid="create-tender-page">
            <div className="page-header">
              <h1 className="page-title">{mode === 'edit' ? 'Редактирование тендера' : 'Создание тендера'}</h1>
              <p className="page-subtitle">{mode === 'edit' ? 'Внесите изменения и сохраните' : 'Заполните информацию о тендере'}</p>
            </div>

        <Card className="form-card neon-card">
          <form onSubmit={handleSubmit} className="tender-form">
            <div className="form-section">
              <h3 className="section-heading">{t('createTender.basicInfo')}</h3>
              
              <div className="form-field">
                <Label htmlFor="title">{t('createTender.tenderTitle')} *</Label>
                <Input
                  id="title"
                  type="text"
                  placeholder={t('createTender.titlePlaceholder')}
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  data-testid="tender-title-input"
                />
              </div>

              <div className="form-field">
                <Label htmlFor="description">{t('createTender.description')} *</Label>
                <Textarea
                  id="description"
                  placeholder={t('createTender.descriptionPlaceholder')}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  rows={4}
                  data-testid="tender-description-input"
                />
              </div>

              <div className="form-row">
                <div className="form-field">
                  <Label htmlFor="tender-type">{t('createTender.tenderType')} *</Label>
                  <Select
                    value={formData.tender_type}
                    onValueChange={(value) => setFormData({ ...formData, tender_type: value })}
                  >
                    <SelectTrigger id="tender-type" data-testid="tender-type-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="price_proposals">{t('tenderList.priceProposals')}</SelectItem>
                      <SelectItem value="open_competition">{t('tenderList.openCompetition')}</SelectItem>
                      <SelectItem value="auction">{t('tenderList.auction')}</SelectItem>
                      <SelectItem value="single_source">{t('tenderList.singleSource')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="form-field">
                  <Label htmlFor="category">{t('createTender.category')} *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger id="category" data-testid="tender-category-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="construction">{t('tenderList.construction')}</SelectItem>
                      <SelectItem value="it">{t('tenderList.itServices')}</SelectItem>
                      <SelectItem value="consulting">{t('tenderList.consulting')}</SelectItem>
                      <SelectItem value="logistics">{t('tenderList.logistics')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-field">
                  <Label htmlFor="region">{t('createTender.region')} *</Label>
                  <Input
                    id="region"
                    type="text"
                    placeholder={t('createTender.regionPlaceholder')}
                    value={formData.region}
                    onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                    required
                    data-testid="tender-region-input"
                  />
                </div>

                <div className="form-field">
                  <Label htmlFor="quantity">{t('createTender.quantity')} *</Label>
                  <Input
                    id="quantity"
                    type="number"
                    placeholder={t('createTender.quantityPlaceholder')}
                    value={formData.quantity}
                    onChange={(e) => {
                      const newQuantity = e.target.value;
                      const newBudget = (parseFloat(newQuantity) || 0) * (parseFloat(formData.unit_price) || 0);
                      setFormData({ 
                        ...formData, 
                        quantity: newQuantity,
                        budget: newBudget || ''
                      });
                    }}
                    required
                    min="1"
                  />
                </div>

                <div className="form-field">
                  <Label htmlFor="unit_price">{t('createTender.unitPrice')} *</Label>
                  <Input
                    id="unit_price"
                    type="number"
                    placeholder={t('createTender.unitPricePlaceholder')}
                    value={formData.unit_price}
                    onChange={(e) => {
                      const newUnitPrice = e.target.value;
                      const newBudget = (parseFloat(formData.quantity) || 0) * (parseFloat(newUnitPrice) || 0);
                      setFormData({ 
                        ...formData, 
                        unit_price: newUnitPrice,
                        budget: newBudget || ''
                      });
                    }}
                    required
                  />
                </div>

                <div className="form-field">
                  <Label htmlFor="budget">Общий бюджет (автоматически) *</Label>
                  <Input
                    id="budget"
                    type="number"
                    placeholder="Рассчитывается автоматически"
                    value={formData.budget}
                    readOnly
                    disabled
                    style={{ 
                      backgroundColor: '#f3f4f6', 
                      cursor: 'not-allowed',
                      fontWeight: 'bold',
                      fontSize: '16px'
                    }}
                    data-testid="tender-budget-input"
                  />
                  {formData.budget && (
                    <p className="total-amount-display" style={{ color: '#16a34a', fontWeight: 'bold', marginTop: '8px' }}>
                      💰 Бюджет: {parseFloat(formData.budget).toLocaleString()} ₸
                    </p>
                  )}
                </div>
              </div>

              <div className="form-row">
                <div className="form-field">
                  <Label htmlFor="status">{t('createTender.tenderStatus')} *</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger id="status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Черновик</SelectItem>
                      <SelectItem value="published_receiving_proposals">{t('status.published_receiving_proposals')}</SelectItem>
                      <SelectItem value="published_receiving_applications">{t('status.published_receiving_applications')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="form-field">
                  <Label htmlFor="publication_date">Дата публикации *</Label>
                  <Input
                    id="publication_date"
                    type="datetime-local"
                    value={formData.publication_date}
                    onChange={(e) => {
                      const pubDate = e.target.value;
                      setFormData({ ...formData, publication_date: pubDate });
                      // Auto-calculate submission_start (+5 days) and submission_end (+7 days from start)
                      if (pubDate) {
                        const pub = new Date(pubDate);
                        const start = new Date(pub);
                        start.setDate(start.getDate() + 5);
                        const end = new Date(start);
                        end.setDate(end.getDate() + 7);
                        
                        // Format to datetime-local format
                        const formatDateTime = (date) => {
                          const year = date.getFullYear();
                          const month = String(date.getMonth() + 1).padStart(2, '0');
                          const day = String(date.getDate()).padStart(2, '0');
                          const hours = String(date.getHours()).padStart(2, '0');
                          const minutes = String(date.getMinutes()).padStart(2, '0');
                          return `${year}-${month}-${day}T${hours}:${minutes}`;
                        };
                        
                        setFormData(prev => ({
                          ...prev,
                          publication_date: pubDate,
                          submission_start: formatDateTime(start),
                          submission_end: formatDateTime(end)
                        }));
                      }
                    }}
                    required
                  />
                  <p className="text-sm text-gray-500 mt-1">Дата когда тендер будет опубликован</p>
                </div>

                <div className="form-field">
                  <Label htmlFor="submission_start">Дата начала приема заявок *</Label>
                  <Input
                    id="submission_start"
                    type="datetime-local"
                    value={formData.submission_start}
                    onChange={(e) => {
                      const startDate = e.target.value;
                      setFormData({ ...formData, submission_start: startDate });
                      // Auto-calculate submission_end (+7 days)
                      if (startDate) {
                        const start = new Date(startDate);
                        const end = new Date(start);
                        end.setDate(end.getDate() + 7);
                        
                        const formatDateTime = (date) => {
                          const year = date.getFullYear();
                          const month = String(date.getMonth() + 1).padStart(2, '0');
                          const day = String(date.getDate()).padStart(2, '0');
                          const hours = String(date.getHours()).padStart(2, '0');
                          const minutes = String(date.getMinutes()).padStart(2, '0');
                          return `${year}-${month}-${day}T${hours}:${minutes}`;
                        };
                        
                        setFormData(prev => ({
                          ...prev,
                          submission_start: startDate,
                          submission_end: formatDateTime(end)
                        }));
                      }
                    }}
                    required
                  />
                  <p className="text-sm text-gray-500 mt-1">По умолчанию +5 дней от даты публикации</p>
                </div>

                <div className="form-field">
                  <Label htmlFor="submission_end">Дата окончания приема заявок *</Label>
                  <Input
                    id="submission_end"
                    type="datetime-local"
                    value={formData.submission_end}
                    onChange={(e) => setFormData({ ...formData, submission_end: e.target.value })}
                    required
                  />
                  <p className="text-sm text-gray-500 mt-1">По умолчанию +7 дней от даты начала приема</p>
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3 className="section-heading">{t('createTender.technicalDetails')}</h3>
              
              <div className="form-field">
                <Label htmlFor="specs">{t('createTender.technicalSpecs')} *</Label>
                <Textarea
                  id="specs"
                  placeholder={t('createTender.specsPlaceholder')}
                  value={formData.technical_specs}
                  onChange={(e) => setFormData({ ...formData, technical_specs: e.target.value })}
                  required
                  rows={6}
                  data-testid="tender-specs-input"
                />
              </div>

              <div className="form-field">
                <Label>{t('createTender.requirements')}</Label>
                {formData.requirements.map((req, index) => (
                  <div key={index} className="requirement-row">
                    <Input
                      type="text"
                      placeholder={`${t('createTender.requirementPlaceholder')} ${index + 1}`}
                      value={req}
                      onChange={(e) => handleRequirementChange(index, e.target.value)}
                      data-testid={`requirement-input-${index}`}
                    />
                    {formData.requirements.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => handleRemoveRequirement(index)}
                        className="remove-btn"
                        data-testid={`remove-requirement-${index}`}
                      >
                        {t('createTender.remove')}
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddRequirement}
                  className="neon-button"
                  data-testid="add-requirement-btn"
                >
                  {t('createTender.addRequirement')}
                </Button>
              </div>

              {/* File Upload Section */}
              <div className="form-field">
                <Label>{t('createTender.attachFiles')}</Label>
                <div className="file-upload-section">
                  <input
                    type="file"
                    id="file-upload"
                    multiple
                    onChange={handleFileUpload}
                    className="file-input"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.txt"
                  />
                  <label htmlFor="file-upload" className="file-upload-label">
                    <FileText size={20} />
                    Выберите файлы для загрузки
                  </label>
                  <p className="file-upload-note">{t('createTender.filesNote')}</p>
                </div>
                
                {/* Display attached files */}
                {attachedFiles.length > 0 && (
                  <div className="attached-files">
                    <h4>Прикрепленные файлы:</h4>
                    {attachedFiles.map((file, index) => (
                      <div key={index} className="file-item">
                        <FileText size={16} />
                        <span className="file-name">{file.filename}</span>
                        <span className="file-size">({(file.size / 1024).toFixed(1)} KB)</span>
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
            </div>

            <div className="form-actions">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/my-tenders')}
                className="neon-button"
                data-testid="cancel-btn"
              >
                {t('createTender.cancel')}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleSaveDraft}
                disabled={loading}
                className="neon-button"
                data-testid="save-draft-btn"
              >
                {loading ? 'Сохранение...' : 'Сохранить черновик'}
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="neon-button-filled"
                data-testid="create-tender-submit-btn"
              >
                {loading ? 'Создание...' : mode === 'edit' ? 'Сохранить изменения' : 'Создать тендер'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
      )}

      <style jsx>{`
        .create-tender-wrapper {
          width: 100%;
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

        .create-tender-container {
          max-width: 900px;
          margin: 0 auto;
          padding: 40px 24px;
        }

        .page-header {
          margin-bottom: 32px;
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

        .form-card {
          padding: 40px;
          border: 1px solid #e0e0e0;
        }

        .tender-form {
          display: flex;
          flex-direction: column;
          gap: 32px;
        }

        .form-section {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .section-heading {
          font-size: 1.5rem;
          font-weight: 600;
          color: #2563eb;
          margin-bottom: 8px;
        }

        .form-field {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .form-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
        }

        .requirement-row {
          display: flex;
          gap: 12px;
          align-items: center;
        }

        .requirement-row input {
          flex: 1;
        }

        .remove-btn {
          flex-shrink: 0;
        }

        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 16px;
          padding-top: 24px;
          border-top: 1px solid #e0e0e0;
        }

        .total-amount-display {
          font-size: 14px;
          color: var(--accent);
          font-weight: 600;
          margin-top: 8px;
        }

        .file-upload-section {
          border: 2px dashed var(--border-medium);
          border-radius: 8px;
          padding: 32px;
          text-align: center;
          transition: all 0.2s ease;
        }

        .file-upload-section:hover {
          border-color: var(--primary);
          background: var(--bg-tertiary);
        }

        .file-input {
          display: none;
        }

        .file-upload-label {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          cursor: pointer;
          color: var(--primary);
          font-weight: 600;
          transition: all 0.2s ease;
        }

        .file-upload-label:hover {
          color: var(--primary-dark);
        }

        .file-upload-note {
          font-size: 12px;
          color: var(--text-muted);
          margin-top: 8px;
        }

        .attached-files {
          margin-top: 16px;
          padding: 16px;
          background: var(--bg-tertiary);
          border-radius: 8px;
        }

        .attached-files h4 {
          font-size: 14px;
          color: var(--text-primary);
          margin-bottom: 12px;
        }

        .file-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 0;
          border-bottom: 1px solid var(--border-light);
        }

        .file-item:last-child {
          border-bottom: none;
        }

        .file-name {
          flex: 1;
          font-size: 14px;
          color: var(--text-primary);
        }

        .file-size {
          font-size: 12px;
          color: var(--text-muted);
        }

        .remove-file-btn {
          background: none;
          border: none;
          color: var(--danger);
          cursor: pointer;
          padding: 4px;
          border-radius: 4px;
        }

        .remove-file-btn:hover {
          background: rgba(220, 38, 38, 0.1);
        }

        @media (max-width: 768px) {
          .page-title {
            font-size: 2rem;
          }

          .form-card {
            padding: 24px;
          }

          .form-row {
            grid-template-columns: 1fr;
          }

          .form-actions {
            flex-direction: column;
          }
        }
      `}</style>
      </div>
    </Layout>
  );
};

export default CreateTender;