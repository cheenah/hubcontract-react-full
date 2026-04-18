import React, { useState, useContext } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { AppContext } from '@/App';
import { useLanguage } from '@/context/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  User,
  Upload,
  Shield,
  Bell,
  Lock,
  CheckCircle,
  AlertCircle,
  Clock,
} from 'lucide-react';

const SECTIONS = [
  { key: 'info',      label: 'Личные данные',  icon: User },
  { key: 'documents', label: 'Документы',       icon: Upload },
  { key: 'security',  label: 'Безопасность',    icon: Lock },
  { key: 'notices',   label: 'Уведомления',     icon: Bell },
];

const Profile = () => {
  const { user, API } = useContext(AppContext);
  const { t } = useLanguage();
  const [section, setSection] = useState('info');
  const [uploading, setUploading] = useState(false);

  const getStatus = () => {
    if (user?.documents_verified)
      return { text: t('profile.verified'),      color: '#10b981', Icon: CheckCircle };
    if (user?.verification_status === 'pending')
      return { text: t('profile.pendingReview'), color: '#f59e0b', Icon: Clock };
    if (user?.verification_status === 'rejected')
      return { text: t('profile.rejected'),      color: '#ef4444', Icon: AlertCircle };
    return   { text: t('profile.notVerified'),   color: '#9ca3af', Icon: Shield };
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
        window.location.reload();
      };
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Ошибка загрузки');
    } finally {
      setUploading(false);
    }
  };

  const documentTypes = [
    { key: 'id_card',        label: t('profile.idCard'),        description: t('profile.idCardDesc') },
    { key: 'company_cert',   label: t('profile.companyCert'),   description: t('profile.companyCertDesc') },
    { key: 'director_order', label: t('profile.directorOrder'), description: t('profile.directorOrderDesc') },
    { key: 'selfie',         label: t('profile.selfie'),        description: t('profile.selfieDesc') },
    { key: 'bank_statement', label: t('profile.bankStatement'), description: t('profile.bankStatementDesc') },
  ];

  return (
    <>
      <div className="pf-page" data-testid="profile-page">
        {/* Title row */}
        <div className="pf-title-row">
          <h1 className="pf-title">{t('profile.title')}</h1>
          <div className="pf-status-badge" style={{ borderColor: statusColor, color: statusColor }}>
            <StatusIcon size={15} />
            <span>{statusText}</span>
          </div>
        </div>

        <div className="pf-layout">
          {/* ── Left sidebar ── */}
          <aside className="pf-sidebar">
            <div className="pf-avatar-block">
              <div className="pf-avatar-circle">
                {user?.email?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="pf-avatar-name">
                {user?.first_name
                  ? `${user.first_name} ${user.last_name || ''}`.trim()
                  : user?.email?.split('@')[0]}
              </div>
              <div className="pf-avatar-email">{user?.email}</div>
              <div className="pf-avatar-role">{user?.role === 'customer' ? 'Заказчик' : user?.role}</div>
            </div>

            <nav className="pf-nav">
              {SECTIONS.map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  className={`pf-nav-item ${section === key ? 'pf-nav-item--active' : ''}`}
                  onClick={() => setSection(key)}
                >
                  <Icon size={17} />
                  <span>{label}</span>
                </button>
              ))}
            </nav>
          </aside>

          {/* ── Content ── */}
          <div className="pf-content">

            {/* INFO */}
            {section === 'info' && (
              <Card className="pf-card">
                <h2 className="pf-section-title">{t('profile.accountInfo')}</h2>
                <div className="pf-grid">
                  <Field label={t('profile.email')} testId="profile-email">
                    <Input value={user?.email || ''} disabled data-testid="profile-email" />
                  </Field>
                  <Field label={t('profile.role')} testId="profile-role">
                    <Input value={user?.role || ''} disabled className="capitalize" data-testid="profile-role" />
                  </Field>
                  <Field label={t('profile.bin')} testId="profile-bin">
                    <Input value={user?.company_bin || ''} disabled data-testid="profile-bin" />
                  </Field>
                  <Field label={t('profile.phone')} testId="profile-phone">
                    <Input value={user?.phone || ''} disabled data-testid="profile-phone" />
                  </Field>
                  {user?.company_name && (
                    <Field label={t('profile.companyName')} wide testId="profile-company">
                      <Input value={user.company_name} disabled data-testid="profile-company" />
                    </Field>
                  )}
                </div>
                {!user?.documents_verified && (
                  <div className="pf-notice pf-notice--warn">
                    ⚠️ {t('profile.verificationNotice')}
                  </div>
                )}
              </Card>
            )}

            {/* DOCUMENTS */}
            {section === 'documents' && (
              <Card className="pf-card">
                <h2 className="pf-section-title">{t('profile.verificationDocs')}</h2>
                <p className="pf-section-sub">{t('profile.uploadAllDocs')}</p>
                <div className="pf-doc-list">
                  {documentTypes.map((doc) => {
                    const uploaded = user?.documents?.[doc.key];
                    return (
                      <div key={doc.key} className="pf-doc-item" data-testid={`doc-${doc.key}`}>
                        <div>
                          <div className="pf-doc-label">{doc.label}</div>
                          <div className="pf-doc-desc">{doc.description}</div>
                          {uploaded && (
                            <div className="pf-doc-ok">
                              ✓ {t('profile.uploaded')} {new Date(uploaded.uploaded_at).toLocaleDateString('ru-RU')}
                            </div>
                          )}
                        </div>
                        <div>
                          <input
                            type="file"
                            id={`file-${doc.key}`}
                            style={{ display: 'none' }}
                            onChange={(e) => handleFileUpload(doc.key, e.target.files[0])}
                            accept="image/*,.pdf"
                            data-testid={`file-input-${doc.key}`}
                          />
                          <Button
                            variant={uploaded ? 'outline' : 'default'}
                            disabled={uploading}
                            size="sm"
                            onClick={() => document.getElementById(`file-${doc.key}`).click()}
                            data-testid={`upload-btn-${doc.key}`}
                          >
                            <Upload size={14} />
                            {uploaded ? t('profile.reupload') : t('profile.upload')}
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
                {user?.verification_status === 'rejected' && (
                  <div className="pf-notice pf-notice--error">✗ {t('profile.rejectionNotice')}</div>
                )}
                {user?.verification_status === 'pending' && (
                  <div className="pf-notice pf-notice--info">⏳ {t('profile.pendingNotice')}</div>
                )}
              </Card>
            )}

            {/* SECURITY */}
            {section === 'security' && (
              <Card className="pf-card">
                <h2 className="pf-section-title">Безопасность</h2>
                <div className="pf-grid">
                  <Field label="Текущий пароль" wide>
                    <Input type="password" placeholder="••••••••" disabled />
                  </Field>
                  <Field label="Новый пароль" wide>
                    <Input type="password" placeholder="••••••••" disabled />
                  </Field>
                </div>
                <div className="pf-notice pf-notice--info" style={{ marginTop: 16 }}>
                  Смена пароля доступна через страницу восстановления.
                </div>
              </Card>
            )}

            {/* NOTICES */}
            {section === 'notices' && (
              <Card className="pf-card">
                <h2 className="pf-section-title">Уведомления</h2>
                <p className="pf-section-sub">Настройте какие уведомления вы хотите получать.</p>
                {[
                  'Новые тендеры по моим категориям',
                  'Изменения статуса заявки',
                  'Подписание договора',
                  'Новые сообщения',
                  'Напоминания о дедлайнах',
                ].map((label) => (
                  <label key={label} className="pf-toggle-row">
                    <span>{label}</span>
                    <input type="checkbox" defaultChecked style={{ accentColor: '#2563eb', width: 18, height: 18, cursor: 'pointer' }} />
                  </label>
                ))}
              </Card>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .pf-page {
          max-width: 1100px;
          margin: 0 auto;
          padding: 28px 24px;
        }

        .pf-title-row {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 24px;
        }

        .pf-title {
          font-size: 1.6rem;
          font-weight: 700;
          color: #111827;
          margin: 0;
        }

        .pf-status-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 5px 14px;
          border: 2px solid;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 600;
        }

        .pf-layout {
          display: flex;
          gap: 20px;
          align-items: flex-start;
        }

        /* sidebar */
        .pf-sidebar {
          width: 230px;
          flex-shrink: 0;
          background: #fff;
          border: 1px solid #e5e7eb;
          border-radius: 14px;
          overflow: hidden;
          position: sticky;
          top: 80px;
        }

        .pf-avatar-block {
          padding: 24px 20px 18px;
          text-align: center;
          border-bottom: 1px solid #f3f4f6;
        }

        .pf-avatar-circle {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          background: linear-gradient(135deg, #1e40af, #2563eb);
          color: #fff;
          font-size: 1.6rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 12px;
          box-shadow: 0 4px 14px rgba(37, 99, 235, 0.35);
        }

        .pf-avatar-name {
          font-size: 0.92rem;
          font-weight: 600;
          color: #111827;
          margin-bottom: 2px;
        }

        .pf-avatar-email {
          font-size: 0.72rem;
          color: #9ca3af;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          margin-bottom: 6px;
        }

        .pf-avatar-role {
          display: inline-block;
          padding: 2px 10px;
          background: #eff6ff;
          color: #1e40af;
          border-radius: 20px;
          font-size: 0.72rem;
          font-weight: 600;
        }

        .pf-nav {
          padding: 10px 8px 12px;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .pf-nav-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 12px;
          border: none;
          background: none;
          border-radius: 10px;
          cursor: pointer;
          font-size: 0.875rem;
          font-weight: 500;
          color: #4b5563;
          width: 100%;
          text-align: left;
          transition: background 0.15s, color 0.15s;
        }
        .pf-nav-item:hover { background: #eff6ff; color: #1e40af; }
        .pf-nav-item--active { background: #eff6ff; color: #1e40af; font-weight: 600; }

        /* content */
        .pf-content { flex: 1; min-width: 0; }

        .pf-card {
          padding: 28px 28px 24px;
          border: 1px solid #e5e7eb;
          border-radius: 14px;
        }

        .pf-section-title {
          font-size: 1.15rem;
          font-weight: 700;
          color: #111827;
          margin: 0 0 18px;
        }

        .pf-section-sub {
          font-size: 0.875rem;
          color: #6b7280;
          margin: -10px 0 16px;
        }

        .pf-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .pf-field { display: flex; flex-direction: column; gap: 6px; }
        .pf-field--wide { grid-column: 1 / -1; }
        .pf-field label { font-size: 0.8rem; font-weight: 600; color: #374151; }

        /* documents */
        .pf-doc-list { display: flex; flex-direction: column; gap: 12px; }

        .pf-doc-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          padding: 14px 16px;
          border: 1px solid #e5e7eb;
          border-radius: 10px;
          background: #fafafa;
        }

        .pf-doc-label { font-size: 0.9rem; font-weight: 600; color: #111827; margin-bottom: 2px; }
        .pf-doc-desc  { font-size: 0.78rem; color: #9ca3af; }
        .pf-doc-ok    { font-size: 0.78rem; color: #10b981; margin-top: 4px; }

        /* notices */
        .pf-notice {
          padding: 12px 16px;
          border-radius: 8px;
          font-size: 0.875rem;
          margin-top: 16px;
          line-height: 1.5;
        }
        .pf-notice--warn  { background: #fffbeb; border: 1px solid #fcd34d; color: #92400e; }
        .pf-notice--error { background: #fef2f2; border: 1px solid #fca5a5; color: #991b1b; }
        .pf-notice--info  { background: #eff6ff; border: 1px solid #93c5fd; color: #1e40af; }

        /* toggle rows */
        .pf-toggle-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 0;
          border-bottom: 1px solid #f3f4f6;
          font-size: 0.875rem;
          color: #374151;
          cursor: pointer;
        }
        .pf-toggle-row:last-child { border-bottom: none; }

        .capitalize { text-transform: capitalize; }

        @media (max-width: 768px) {
          .pf-layout { flex-direction: column; }
          .pf-sidebar { width: 100%; position: static; }
          .pf-grid { grid-template-columns: 1fr; }
        }
      `}</style>
  </>
  );
};

const Field = ({ label, children, wide }) => (
  <div className={`pf-field ${wide ? 'pf-field--wide' : ''}`}>
    <label>{label}</label>
    {children}
  </div>
);

export default Profile;
