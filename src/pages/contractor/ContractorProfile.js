import React, { useState, useContext } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { AppContext } from '@/App';
import { useLanguage } from '@/context/LanguageContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
  { key: 'info',      label: 'Личные данные',     icon: User },
  { key: 'documents', label: 'Документы',          icon: Upload },
  { key: 'security',  label: 'Безопасность',       icon: Lock },
  { key: 'notices',   label: 'Уведомления',        icon: Bell },
];

const ContractorProfile = () => {
  const { user, API } = useContext(AppContext);
  const { t } = useLanguage();
  const [section, setSection] = useState('info');
  const [uploading, setUploading] = useState(false);

  /* ── verification status ── */
  const getStatus = () => {
    if (user?.documents_verified)
      return { text: 'Верифицирован', color: 'var(--color-success-alt)', icon: CheckCircle };
    if (user?.verification_status === 'pending')
      return { text: 'На проверке', color: 'var(--color-warning)', icon: Clock };
    if (user?.verification_status === 'rejected')
      return { text: 'Отклонено', color: 'var(--color-danger)', icon: AlertCircle };
    return { text: 'Не верифицирован', color: 'var(--color-text-placeholder)', icon: Shield };
  };
  const status = getStatus();
  const StatusIcon = status.icon;

  /* ── document upload ── */
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
    { key: 'id_card',       label: t('profile.idCard'),       description: t('profile.idCardDesc') },
    { key: 'company_cert',  label: t('profile.companyCert'),  description: t('profile.companyCertDesc') },
    { key: 'director_order',label: t('profile.directorOrder'),description: t('profile.directorOrderDesc') },
    { key: 'selfie',        label: t('profile.selfie'),       description: t('profile.selfieDesc') },
    { key: 'bank_statement',label: t('profile.bankStatement'),description: t('profile.bankStatementDesc') },
  ];

  return (
    <>
      <div className="cp-page">
        {/* ── Page title ── */}
        <div className="cp-title-row">
          <h1 className="cp-title">Профиль</h1>
          <div className="cp-status-badge" style={{ '--badge-color': status.color, borderColor: 'var(--badge-color)', color: 'var(--badge-color)' }}>
            <StatusIcon size={15} />
            <span>{status.text}</span>
          </div>
        </div>

        <div className="cp-layout">
          {/* ── Left menu ── */}
          <aside className="cp-sidebar">
            {/* Avatar block */}
            <div className="cp-avatar-block">
              <div className="cp-avatar-circle">
                {user?.email?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="cp-avatar-name">
                {user?.first_name
                  ? `${user.first_name} ${user.last_name || ''}`.trim()
                  : user?.email?.split('@')[0]}
              </div>
              <div className="cp-avatar-email">{user?.email}</div>
            </div>

            {/* Nav items */}
            <nav className="cp-nav">
              {SECTIONS.map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  className={`cp-nav-item ${section === key ? 'cp-nav-item--active' : ''}`}
                  onClick={() => setSection(key)}
                >
                  <Icon size={17} />
                  <span>{label}</span>
                </button>
              ))}
            </nav>
          </aside>

          {/* ── Content ── */}
          <div className="cp-content">
            {/* INFO */}
            {section === 'info' && (
              <Card className="cp-card">
                <h2 className="cp-section-title">Личные данные</h2>
                <div className="cp-grid">
                  <Field label="Email">
                    <Input value={user?.email || ''} disabled />
                  </Field>
                  <Field label="Роль">
                    <Input value="Исполнитель" disabled />
                  </Field>
                  <Field label="БИН / ИИН">
                    <Input value={user?.company_bin || ''} disabled />
                  </Field>
                  <Field label="Телефон">
                    <Input value={user?.phone || ''} disabled />
                  </Field>
                  {user?.company_name && (
                    <Field label="Компания" wide>
                      <Input value={user.company_name} disabled />
                    </Field>
                  )}
                </div>
                {!user?.documents_verified && (
                  <div className="cp-notice cp-notice--warn">
                    ⚠️ {t('profile.verificationNotice')}
                  </div>
                )}
              </Card>
            )}

            {/* DOCUMENTS */}
            {section === 'documents' && (
              <Card className="cp-card">
                <h2 className="cp-section-title">Документы для верификации</h2>
                <p className="cp-section-sub">{t('profile.uploadAllDocs')}</p>
                <div className="cp-doc-list">
                  {documentTypes.map((doc) => {
                    const uploaded = user?.documents?.[doc.key];
                    return (
                      <div key={doc.key} className="cp-doc-item">
                        <div>
                          <div className="cp-doc-label">{doc.label}</div>
                          <div className="cp-doc-desc">{doc.description}</div>
                          {uploaded && (
                            <div className="cp-doc-ok">
                              ✓ Загружен: {new Date(uploaded.uploaded_at).toLocaleDateString('ru-RU')}
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
                          />
                          <Button
                            variant={uploaded ? 'outline' : 'default'}
                            disabled={uploading}
                            onClick={() => document.getElementById(`file-${doc.key}`).click()}
                            size="sm"
                          >
                            <Upload size={14} />
                            {uploaded ? 'Заменить' : 'Загрузить'}
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
                {user?.verification_status === 'rejected' && (
                  <div className="cp-notice cp-notice--error">
                    ✗ {t('profile.rejectionNotice')}
                  </div>
                )}
                {user?.verification_status === 'pending' && (
                  <div className="cp-notice cp-notice--info">
                    ⏳ {t('profile.pendingNotice')}
                  </div>
                )}
              </Card>
            )}

            {/* SECURITY */}
            {section === 'security' && (
              <Card className="cp-card">
                <h2 className="cp-section-title">Безопасность</h2>
                <div className="cp-grid">
                  <Field label="Текущий пароль" wide>
                    <Input type="password" placeholder="••••••••" disabled />
                  </Field>
                  <Field label="Новый пароль" wide>
                    <Input type="password" placeholder="••••••••" disabled />
                  </Field>
                </div>
                <div className="cp-notice cp-notice--info cp-notice--mt">
                  Смена пароля доступна через страницу восстановления.
                </div>
              </Card>
            )}

            {/* NOTICES */}
            {section === 'notices' && (
              <Card className="cp-card">
                <h2 className="cp-section-title">Уведомления</h2>
                <p className="cp-section-sub cp-section-sub--mb">
                  Настройте какие уведомления вы хотите получать.
                </p>
                {[
                  'Новые тендеры по моим категориям',
                  'Изменения статуса заявки',
                  'Подписание договора',
                  'Новые сообщения',
                  'Напоминания о дедлайнах',
                ].map((label) => (
                  <label key={label} className="cp-toggle-row">
                    <span>{label}</span>
                    <input type="checkbox" defaultChecked className="cp-checkbox" />
                  </label>
                ))}
              </Card>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .cp-page {
          max-width: 1100px;
          margin: 0 auto;
          padding: var(--space-7) var(--space-6);
        }

        .cp-title-row {
          display: flex;
          align-items: center;
          gap: var(--space-4);
          margin-bottom: var(--space-6);
        }

        .cp-title {
          font-size: 1.6rem;
          font-weight: var(--font-weight-bold);
          color: var(--color-text-primary);
          margin: 0;
        }

        .cp-status-badge {
          display: flex;
          align-items: center;
          gap: var(--space-1-5);
          padding: 5px 14px;
          border: 2px solid;
          border-radius: var(--radius-4xl);
          font-size: var(--font-size-sm);
          font-weight: var(--font-weight-semibold);
        }

        /* layout */
        .cp-layout {
          display: flex;
          gap: var(--space-5);
          align-items: flex-start;
        }

        /* sidebar */
        .cp-sidebar {
          width: 230px;
          flex-shrink: 0;
          background: var(--color-bg-surface);
          border: 1px solid var(--color-border);
          border-radius: 14px;
          overflow: hidden;
          position: sticky;
          top: 80px;
        }

        .cp-avatar-block {
          padding: var(--space-6) var(--space-5) var(--space-5);
          text-align: center;
          border-bottom: 1px solid var(--color-border-muted);
        }

        .cp-avatar-circle {
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

        .cp-avatar-name {
          font-size: 0.92rem;
          font-weight: var(--font-weight-semibold);
          color: var(--color-text-primary);
          margin-bottom: 2px;
        }

        .cp-avatar-email {
          font-size: var(--font-size-xs);
          color: var(--color-text-placeholder);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .cp-nav {
          padding: var(--space-2-5) var(--space-2) var(--space-3);
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .cp-nav-item {
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
        .cp-nav-item:hover { background: var(--color-primary-bg); color: var(--color-primary-dark); }
        .cp-nav-item--active { background: var(--color-primary-bg); color: var(--color-primary-dark); font-weight: var(--font-weight-semibold); }

        /* content */
        .cp-content { flex: 1; min-width: 0; }

        .cp-card {
          padding: var(--space-7) var(--space-7) var(--space-6);
          border: 1px solid var(--color-border);
          border-radius: 14px;
        }

        .cp-section-title {
          font-size: 1.15rem;
          font-weight: var(--font-weight-bold);
          color: var(--color-text-primary);
          margin: 0 0 18px;
        }

        .cp-section-sub {
          font-size: var(--font-size-base);
          color: var(--color-text-muted);
          margin: -10px 0 var(--space-4);
        }
        .cp-section-sub--mb { margin-bottom: var(--space-5); }

        .cp-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--space-4);
        }

        .cp-field { display: flex; flex-direction: column; gap: var(--space-1-5); }
        .cp-field--wide { grid-column: 1 / -1; }
        .cp-field label { font-size: var(--font-size-sm); font-weight: var(--font-weight-semibold); color: var(--color-text-secondary); }

        /* documents */
        .cp-doc-list { display: flex; flex-direction: column; gap: var(--space-3); }

        .cp-doc-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: var(--space-4);
          padding: 14px var(--space-4);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-xl);
          background: var(--color-bg-subtle);
        }

        .cp-doc-label { font-size: var(--font-size-base); font-weight: var(--font-weight-semibold); color: var(--color-text-primary); margin-bottom: 2px; }
        .cp-doc-desc  { font-size: 0.78rem; color: var(--color-text-placeholder); }
        .cp-doc-ok    { font-size: 0.78rem; color: var(--color-success-alt); margin-top: var(--space-1); }

        /* notices */
        .cp-notice {
          padding: var(--space-3) var(--space-4);
          border-radius: var(--radius-lg);
          font-size: var(--font-size-base);
          margin-top: var(--space-4);
          line-height: var(--line-height-normal);
        }
        .cp-notice--mt    { margin-top: var(--space-4); }
        .cp-notice--warn  { background: var(--color-bg-muted); border: 1px solid var(--color-warning); color: var(--color-text-secondary); }
        .cp-notice--error { background: var(--color-danger-tint-05); border: 1px solid var(--color-danger-tint-20); color: var(--color-danger-alt); }
        .cp-notice--info  { background: var(--color-primary-bg); border: 1px solid var(--color-primary-border); color: var(--color-primary-dark); }

        /* toggle rows */
        .cp-toggle-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: var(--space-3) 0;
          border-bottom: 1px solid var(--color-border-muted);
          font-size: var(--font-size-base);
          color: var(--color-text-secondary);
          cursor: pointer;
        }
        .cp-toggle-row:last-child { border-bottom: none; }

        .cp-checkbox {
          accent-color: var(--color-primary);
          width: 18px;
          height: 18px;
          cursor: pointer;
        }

        @media (max-width: 768px) {
          .cp-layout { flex-direction: column; }
          .cp-sidebar { width: 100%; position: static; }
          .cp-grid { grid-template-columns: 1fr; }
        }
      `}</style>
  </>
  );
};

const Field = ({ label, children, wide }) => (
  <div className={`cp-field ${wide ? 'cp-field--wide' : ''}`}>
    <label>{label}</label>
    {children}
  </div>
);

export default ContractorProfile;
