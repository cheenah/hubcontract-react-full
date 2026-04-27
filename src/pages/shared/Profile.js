import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { AppContext } from '@/App';
import { useLanguage } from '@/context/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Upload, Shield, CheckCircle, AlertCircle, Clock,
  Edit2, Save, X, FileText, ExternalLink,
} from 'lucide-react';

// Ключи документов загружаемых в CompleteRegistration
const DOCUMENT_KEYS = [
  'registration_certificate',
  'tax_clearance',
  'director_id_doc',
  'director_appointment_order',
  'company_charter',
];

// Русские названия для каждого типа документа
const DOCUMENT_LABELS = {
  registration_certificate:    'Свидетельство о регистрации',
  tax_clearance:               'Справка об отсутствии задолженностей',
  director_id_doc:             'Документы директора (удостоверение)',
  director_appointment_order:  'Приказ о назначении директора',
  company_charter:             'Устав компании',
};

const Profile = () => {
  const { user, API } = useContext(AppContext);
  const { t } = useLanguage();
  const [uploading, setUploading] = useState(false);

  // Documents state
  // documents: { [document_type]: { id, filename, uploaded_at, url, file_url } }
  const [documents, setDocuments] = useState({});
  const [loadingDocs, setLoadingDocs] = useState(false);

  // Org data state
  const [isEditing, setIsEditing] = useState(false);
  const [loadingOrg, setLoadingOrg] = useState(true);
  const [orgData, setOrgData] = useState({
    company_name: '', company_bin: '', legal_address: '', actual_address: '',
    director_name: '', contact_person: '', contact_phone: '', contact_email: '',
    description: '', industry: '', employees_count: '', foundation_year: '', website: '',
  });

  useEffect(() => {
    fetchOrgData();
    fetchDocuments();
  }, []);

  // fetchDocuments — получает список документов пользователя с бэкенда.
  // GET /documents/list возвращает массив: [{ id, document_type, filename, uploaded_at, url }]
  // Конвертируем в объект { [document_type]: doc } для быстрого доступа по ключу.
  const fetchDocuments = async () => {
    setLoadingDocs(true);
    try {
      const response = await axios.get(`${API}/documents/list`);
      const list = Array.isArray(response.data) ? response.data : [];
      const map = {};
      list.forEach(doc => { map[doc.document_type] = doc; });
      setDocuments(map);
    } catch {
      // Если эндпоинт недоступен — fallback на user?.documents из контекста
      setDocuments(user?.documents || {});
    } finally {
      setLoadingDocs(false);
    }
  };

  const fetchOrgData = async () => {
    try {
      const response = await axios.get(`${API}/organization/profile`);
      setOrgData(response.data);
    } catch {
      setOrgData(prev => ({
        ...prev,
        company_name: user?.company_name || '',
        company_bin: user?.company_bin || '',
        contact_email: user?.email || '',
        contact_phone: user?.phone || '',
      }));
    } finally {
      setLoadingOrg(false);
    }
  };

  const handleSave = async () => {
    try {
      await axios.put(`${API}/organization/profile`, orgData);
      toast.success('Профиль организации успешно обновлён');
      setIsEditing(false);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Ошибка при сохранении');
    }
  };

  const handleChange = (field, value) => {
    setOrgData(prev => ({ ...prev, [field]: value }));
  };

  const getStatus = () => {
    if (user?.documents_verified)
      return { text: t('profile.verified'),      color: 'var(--color-success-alt)', Icon: CheckCircle };
    if (user?.verification_status === 'pending')
      return { text: t('profile.pendingReview'), color: 'var(--color-warning)',     Icon: Clock };
    if (user?.verification_status === 'rejected')
      return { text: t('profile.rejected'),      color: 'var(--color-danger)',      Icon: AlertCircle };
    return   { text: t('profile.notVerified'),   color: 'var(--color-text-placeholder)', Icon: Shield };
  };

  const { text: statusText, color: statusColor, Icon: StatusIcon } = getStatus();

  const handleFileUpload = async (docType, file) => {
    if (!file) return;
    setUploading(true);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        await axios.post(`${API}/documents/upload`, {
          document_type: docType,
          file_data: reader.result.split(',')[1],
          filename: file.name,
        });
        toast.success('Документ загружен');
        // Обновляем список документов без перезагрузки страницы
        await fetchDocuments();
      };
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Ошибка загрузки');
    } finally {
      setUploading(false);
    }
  };


  return (
    <>
      <div className="pf-page" data-testid="profile-page">
        <div className="pf-title-row">
          <h1 className="pf-title">{t('profile.title')}</h1>
          <div
            className="pf-status-badge"
            style={{ '--badge-color': statusColor, borderColor: 'var(--badge-color)', color: 'var(--badge-color)' }}
          >
            <StatusIcon size={15} />
            <span>{statusText}</span>
          </div>
        </div>

        <Tabs defaultValue="registration" className="pf-tabs">
          <TabsList className="pf-tabs-list">
            <TabsTrigger value="registration">Регистрационные данные</TabsTrigger>
            <TabsTrigger value="documents">Документы</TabsTrigger>
          </TabsList>

          {/* ── Tab 1: Org registration data ── */}
          <TabsContent value="registration">
            <Card className="pf-card">
              <div className="pf-card-header">
                <h2 className="pf-section-title">Профиль организации</h2>
                {!isEditing ? (
                  <Button onClick={() => setIsEditing(true)} size="sm">
                    <Edit2 size={16} />
                    Редактировать
                  </Button>
                ) : (
                  <div className="pf-edit-actions">
                    <Button onClick={handleSave} size="sm">
                      <Save size={16} />
                      Сохранить
                    </Button>
                    <Button onClick={() => setIsEditing(false)} variant="outline" size="sm">
                      <X size={16} />
                      Отмена
                    </Button>
                  </div>
                )}
              </div>

              {loadingOrg ? (
                <div className="pf-loading"><div className="loading-spinner" /></div>
              ) : (
                <div className="pf-org-sections">
                  <div>
                    <h3 className="pf-subsection-title">Юридическая информация</h3>
                    <div className="pf-grid">
                      <OrgField label="Название организации" wide>
                        <Input value={orgData.company_name} onChange={e => handleChange('company_name', e.target.value)} disabled={!isEditing} />
                      </OrgField>
                      <OrgField label="БИН">
                        <Input value={orgData.company_bin} disabled />
                      </OrgField>
                      <OrgField label="Отрасль">
                        <Input value={orgData.industry} onChange={e => handleChange('industry', e.target.value)} disabled={!isEditing} placeholder="Строительство, ИТ, Логистика..." />
                      </OrgField>
                      <OrgField label="Количество сотрудников">
                        <Input type="number" value={orgData.employees_count} onChange={e => handleChange('employees_count', e.target.value)} disabled={!isEditing} />
                      </OrgField>
                      <OrgField label="Год основания">
                        <Input type="number" value={orgData.foundation_year} onChange={e => handleChange('foundation_year', e.target.value)} disabled={!isEditing} />
                      </OrgField>
                      <OrgField label="Юридический адрес" wide>
                        <Input value={orgData.legal_address} onChange={e => handleChange('legal_address', e.target.value)} disabled={!isEditing} />
                      </OrgField>
                      <OrgField label="Фактический адрес" wide>
                        <Input value={orgData.actual_address} onChange={e => handleChange('actual_address', e.target.value)} disabled={!isEditing} />
                      </OrgField>
                      <OrgField label="Описание деятельности" wide>
                        <Textarea
                          value={orgData.description}
                          onChange={e => handleChange('description', e.target.value)}
                          disabled={!isEditing}
                          rows={4}
                          placeholder="Краткое описание деятельности организации"
                        />
                      </OrgField>
                    </div>
                  </div>

                  <div>
                    <h3 className="pf-subsection-title">Контактная информация</h3>
                    <div className="pf-grid">
                      <OrgField label="ФИО директора">
                        <Input value={orgData.director_name} onChange={e => handleChange('director_name', e.target.value)} disabled={!isEditing} />
                      </OrgField>
                      <OrgField label="Контактное лицо">
                        <Input value={orgData.contact_person} onChange={e => handleChange('contact_person', e.target.value)} disabled={!isEditing} />
                      </OrgField>
                      <OrgField label="Телефон">
                        <Input value={orgData.contact_phone} onChange={e => handleChange('contact_phone', e.target.value)} disabled={!isEditing} />
                      </OrgField>
                      <OrgField label="Email">
                        <Input type="email" value={orgData.contact_email} onChange={e => handleChange('contact_email', e.target.value)} disabled={!isEditing} />
                      </OrgField>
                      <OrgField label="Веб-сайт" wide>
                        <Input value={orgData.website} onChange={e => handleChange('website', e.target.value)} disabled={!isEditing} placeholder="https://example.com" />
                      </OrgField>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          </TabsContent>

          {/* ── Tab 2: Documents & verification ── */}
          <TabsContent value="documents">
            <Card className="pf-card">
              <h2 className="pf-section-title">{t('profile.verificationDocs')}</h2>
              <p className="pf-section-sub">{t('profile.uploadAllDocs')}</p>

              {loadingDocs ? (
                <div className="pf-loading"><div className="loading-spinner" /></div>
              ) : (
                <div className="pf-doc-list">
                  {DOCUMENT_KEYS.map((docKey) => {
                    // doc — объект из fetchDocuments или из user.documents (fallback)
                    const doc = documents[docKey] || user?.documents?.[docKey];
                    const label = DOCUMENT_LABELS[docKey];
                    // viewUrl — прямая ссылка для просмотра документа в новой вкладке
                    const viewUrl = doc?.url || doc?.file_url;
                    return (
                      <div key={docKey} className="pf-doc-item" data-testid={`doc-${docKey}`}>
                        {/* Иконка + название + метаинформация о файле */}
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className={`p-2 rounded-lg flex-shrink-0 ${doc ? 'bg-[var(--color-success-tint-10)]' : 'bg-[var(--color-bg-muted)]'}`}>
                            <FileText
                              size={18}
                              className={doc ? 'text-[var(--color-success-alt)]' : 'text-[var(--color-text-placeholder)]'}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="pf-doc-label">{label}</div>
                            {doc ? (
                              <>
                                {doc.filename && (
                                  <div className="pf-doc-desc truncate" title={doc.filename}>{doc.filename}</div>
                                )}
                                {doc.uploaded_at && (
                                  <div className="pf-doc-ok">
                                    ✓ {t('profile.uploaded')} {new Date(doc.uploaded_at).toLocaleDateString('ru-RU')}
                                  </div>
                                )}
                              </>
                            ) : (
                              <div className="pf-doc-desc">Документ не загружен</div>
                            )}
                          </div>
                        </div>

                        {/* Кнопки: Открыть (если есть URL) + загрузить/перезагрузить */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {doc && viewUrl && (
                            <a href={viewUrl} target="_blank" rel="noopener noreferrer">
                              <Button variant="outline" size="sm">
                                <ExternalLink size={14} />
                                Открыть
                              </Button>
                            </a>
                          )}
                          <input
                            type="file"
                            id={`file-${docKey}`}
                            style={{ display: 'none' }}
                            onChange={e => handleFileUpload(docKey, e.target.files[0])}
                            accept="image/*,.pdf"
                            data-testid={`file-input-${docKey}`}
                          />
                          <Button
                            variant={doc ? 'outline' : 'default'}
                            disabled={uploading}
                            size="sm"
                            onClick={() => document.getElementById(`file-${docKey}`).click()}
                            data-testid={`upload-btn-${docKey}`}
                          >
                            <Upload size={14} />
                            {doc ? t('profile.reupload') : t('profile.upload')}
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {user?.verification_status === 'rejected' && (
                <div className="pf-notice pf-notice--error">✗ {t('profile.rejectionNotice')}</div>
              )}
              {user?.verification_status === 'pending' && (
                <div className="pf-notice pf-notice--info">⏳ {t('profile.pendingNotice')}</div>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <style>{`
        .pf-page {
          max-width: 1100px;
          margin: 0 auto;
          padding: var(--space-7) var(--space-6);
        }

        .pf-title-row {
          display: flex;
          align-items: center;
          gap: var(--space-4);
          margin-bottom: var(--space-6);
        }

        .pf-title {
          font-size: 1.6rem;
          font-weight: var(--font-weight-bold);
          color: var(--color-text-primary);
          margin: 0;
        }

        .pf-status-badge {
          display: flex;
          align-items: center;
          gap: var(--space-1-5);
          padding: 5px 14px;
          border: 2px solid;
          border-radius: var(--radius-4xl);
          font-size: var(--font-size-sm);
          font-weight: var(--font-weight-semibold);
        }

        .pf-tabs { width: 100%; }

        .pf-tabs-list {
          margin-bottom: var(--space-5);
        }

        /* card */
        .pf-card {
          padding: var(--space-7) var(--space-7) var(--space-6);
          border: 1px solid var(--color-border);
          border-radius: 14px;
        }

        .pf-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 18px;
        }

        .pf-edit-actions {
          display: flex;
          gap: var(--space-2);
        }

        .pf-section-title {
          font-size: 1.15rem;
          font-weight: var(--font-weight-bold);
          color: var(--color-text-primary);
          margin: 0;
        }

        .pf-section-sub {
          font-size: var(--font-size-base);
          color: var(--color-text-muted);
          margin: -4px 0 var(--space-4);
        }

        /* org sections */
        .pf-org-sections {
          display: flex;
          flex-direction: column;
          gap: var(--space-7);
        }

        .pf-subsection-title {
          font-size: 0.95rem;
          font-weight: var(--font-weight-semibold);
          color: var(--color-text-secondary);
          margin: 0 0 var(--space-4);
          padding-bottom: var(--space-2);
          border-bottom: 1px solid var(--color-border-muted);
        }

        .pf-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--space-4);
        }

        .pf-field { display: flex; flex-direction: column; gap: var(--space-1-5); }
        .pf-field--wide { grid-column: 1 / -1; }
        .pf-field label { font-size: var(--font-size-sm); font-weight: var(--font-weight-semibold); color: var(--color-text-secondary); }

        /* loading */
        .pf-loading {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 200px;
        }

        /* documents */
        .pf-doc-list { display: flex; flex-direction: column; gap: var(--space-3); }

        .pf-doc-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: var(--space-4);
          padding: 14px var(--space-4);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-xl);
          background: var(--color-bg-subtle);
        }

        .pf-doc-label { font-size: var(--font-size-base); font-weight: var(--font-weight-semibold); color: var(--color-text-primary); margin-bottom: 2px; }
        .pf-doc-desc  { font-size: 0.78rem; color: var(--color-text-placeholder); }
        .pf-doc-ok    { font-size: 0.78rem; color: var(--color-success-alt); margin-top: var(--space-1); }

        /* notices */
        .pf-notice {
          padding: var(--space-3) var(--space-4);
          border-radius: var(--radius-lg);
          font-size: var(--font-size-base);
          margin-top: var(--space-4);
          line-height: var(--line-height-normal);
        }
        .pf-notice--error { background: var(--color-danger-tint-05); border: 1px solid var(--color-danger-tint-20); color: var(--color-danger-alt); }
        .pf-notice--info  { background: var(--color-primary-bg); border: 1px solid var(--color-primary-border); color: var(--color-primary-dark); }

        @media (max-width: 768px) {
          .pf-grid { grid-template-columns: 1fr; }
          .pf-card { padding: var(--space-5); }
        }
      `}</style>
    </>
  );
};

const OrgField = ({ label, children, wide }) => (
  <div className={`pf-field ${wide ? 'pf-field--wide' : ''}`}>
    <label>{label}</label>
    {children}
  </div>
);

export default Profile;
