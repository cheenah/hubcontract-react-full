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
      return { text: t('profile.verified'),      color: 'var(--color-success-alt)', Icon: CheckCircle };
    if (user?.verification_status === 'pending')
      return { text: t('profile.pendingReview'), color: 'var(--color-warning)', Icon: Clock };
    if (user?.verification_status === 'rejected')
      return { text: t('profile.rejected'),      color: 'var(--color-danger)', Icon: AlertCircle };
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
          <div className="pf-status-badge" style={{ '--badge-color': statusColor, borderColor: 'var(--badge-color)', color: 'var(--badge-color)' }}>
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
                <div className="pf-notice pf-notice--info pf-notice--mt">
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
                    <input type="checkbox" defaultChecked className="pf-checkbox" />
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

        .pf-layout {
          display: flex;
          gap: var(--space-5);
          align-items: flex-start;
        }

        /* sidebar */
        .pf-sidebar {
          width: 230px;
          flex-shrink: 0;
          background: var(--color-bg-surface);
          border: 1px solid var(--color-border);
          border-radius: 14px;
          overflow: hidden;
          position: sticky;
          top: 80px;
        }

        .pf-avatar-block {
          padding: var(--space-6) var(--space-5) 18px;
          text-align: center;
          border-bottom: 1px solid var(--color-border-muted);
        }

        .pf-avatar-circle {
          width: 64px;
          height: 64px;
          border-radius: var(--radius-circle);
          background: var(--color-primary-gradient);
          color: var(--color-text-inverse);
          font-size: 1.6rem;
          font-weight: var(--font-weight-bold);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto var(--space-3);
          box-shadow: 0 4px 14px var(--color-primary-tint-35);
        }

        .pf-avatar-name {
          font-size: 0.92rem;
          font-weight: var(--font-weight-semibold);
          color: var(--color-text-primary);
          margin-bottom: 2px;
        }

        .pf-avatar-email {
          font-size: var(--font-size-xxs);
          color: var(--color-text-placeholder);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          margin-bottom: var(--space-1-5);
        }

        .pf-avatar-role {
          display: inline-block;
          padding: 2px 10px;
          background: var(--color-primary-bg);
          color: var(--color-primary-dark);
          border-radius: var(--radius-4xl);
          font-size: var(--font-size-xxs);
          font-weight: var(--font-weight-semibold);
        }

        .pf-nav {
          padding: var(--space-2-5) var(--space-2) var(--space-3);
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .pf-nav-item {
          display: flex;
          align-items: center;
          gap: var(--space-2-5);
          padding: var(--space-2-5) var(--space-3);
          border: none;
          background: none;
          border-radius: var(--radius-xl);
          cursor: pointer;
          font-size: var(--font-size-base);
          font-weight: var(--font-weight-medium);
          color: var(--color-text-tertiary);
          width: 100%;
          text-align: left;
          transition: background var(--transition-fast), color var(--transition-fast);
        }
        .pf-nav-item:hover { background: var(--color-primary-bg); color: var(--color-primary-dark); }
        .pf-nav-item--active { background: var(--color-primary-bg); color: var(--color-primary-dark); font-weight: var(--font-weight-semibold); }

        /* content */
        .pf-content { flex: 1; min-width: 0; }

        .pf-card {
          padding: var(--space-7) var(--space-7) var(--space-6);
          border: 1px solid var(--color-border);
          border-radius: 14px;
        }

        .pf-section-title {
          font-size: 1.15rem;
          font-weight: var(--font-weight-bold);
          color: var(--color-text-primary);
          margin: 0 0 18px;
        }

        .pf-section-sub {
          font-size: var(--font-size-base);
          color: var(--color-text-muted);
          margin: -10px 0 var(--space-4);
        }

        .pf-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--space-4);
        }

        .pf-field { display: flex; flex-direction: column; gap: var(--space-1-5); }
        .pf-field--wide { grid-column: 1 / -1; }
        .pf-field label { font-size: var(--font-size-sm); font-weight: var(--font-weight-semibold); color: var(--color-text-secondary); }

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
        .pf-notice--mt  { margin-top: var(--space-4); }
        .pf-notice--warn  { background: var(--color-bg-muted); border: 1px solid var(--color-warning); color: var(--color-text-secondary); }
        .pf-notice--error { background: var(--color-danger-tint-05); border: 1px solid var(--color-danger-tint-20); color: var(--color-danger-alt); }
        .pf-notice--info  { background: var(--color-primary-bg); border: 1px solid var(--color-primary-border); color: var(--color-primary-dark); }

        /* toggle rows */
        .pf-toggle-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: var(--space-3) 0;
          border-bottom: 1px solid var(--color-border-muted);
          font-size: var(--font-size-base);
          color: var(--color-text-secondary);
          cursor: pointer;
        }
        .pf-toggle-row:last-child { border-bottom: none; }

        .pf-checkbox {
          accent-color: var(--color-primary);
          width: 18px;
          height: 18px;
          cursor: pointer;
        }

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
