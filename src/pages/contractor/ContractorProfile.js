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
      return { text: 'Верифицирован', color: '#10b981', icon: CheckCircle };
    if (user?.verification_status === 'pending')
      return { text: 'На проверке', color: '#f59e0b', icon: Clock };
    if (user?.verification_status === 'rejected')
      return { text: 'Отклонено', color: '#ef4444', icon: AlertCircle };
    return { text: 'Не верифицирован', color: '#9ca3af', icon: Shield };
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
          <div className="cp-status-badge" style={{ borderColor: status.color, color: status.color }}>
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
                <div className="cp-notice cp-notice--info" style={{ marginTop: 16 }}>
                  Смена пароля доступна через страницу восстановления.
                </div>
              </Card>
            )}

            {/* NOTICES */}
            {section === 'notices' && (
              <Card className="cp-card">
                <h2 className="cp-section-title">Уведомления</h2>
                <p className="cp-section-sub" style={{ marginBottom: 20 }}>
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
                    <input type="checkbox" defaultChecked style={{ accentColor: '#2563eb', width: 18, height: 18, cursor: 'pointer' }} />
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
          padding: 28px 24px;
        }

        .cp-title-row {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 24px;
        }

        .cp-title {
          font-size: 1.6rem;
          font-weight: 700;
          color: #111827;
          margin: 0;
        }

        .cp-status-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 5px 14px;
          border: 2px solid;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 600;
        }

        /* layout */
        .cp-layout {
          display: flex;
          gap: 20px;
          align-items: flex-start;
        }

        /* sidebar */
        .cp-sidebar {
          width: 230px;
          flex-shrink: 0;
          background: #fff;
          border: 1px solid #e5e7eb;
          border-radius: 14px;
          overflow: hidden;
          position: sticky;
          top: 80px;
        }

        .cp-avatar-block {
          padding: 24px 20px 20px;
          text-align: center;
          border-bottom: 1px solid #f3f4f6;
        }

        .cp-avatar-circle {
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

        .cp-avatar-name {
          font-size: 0.92rem;
          font-weight: 600;
          color: #111827;
          margin-bottom: 2px;
        }

        .cp-avatar-email {
          font-size: 0.75rem;
          color: #9ca3af;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .cp-nav {
          padding: 10px 8px 12px;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .cp-nav-item {
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
        .cp-nav-item:hover { background: #eff6ff; color: #1e40af; }
        .cp-nav-item--active { background: #eff6ff; color: #1e40af; font-weight: 600; }

        /* content */
        .cp-content { flex: 1; min-width: 0; }

        .cp-card {
          padding: 28px 28px 24px;
          border: 1px solid #e5e7eb;
          border-radius: 14px;
        }

        .cp-section-title {
          font-size: 1.15rem;
          font-weight: 700;
          color: #111827;
          margin: 0 0 18px;
        }

        .cp-section-sub {
          font-size: 0.875rem;
          color: #6b7280;
          margin: -10px 0 16px;
        }

        .cp-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .cp-field { display: flex; flex-direction: column; gap: 6px; }
        .cp-field--wide { grid-column: 1 / -1; }
        .cp-field label { font-size: 0.8rem; font-weight: 600; color: #374151; }

        /* documents */
        .cp-doc-list { display: flex; flex-direction: column; gap: 12px; }

        .cp-doc-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          padding: 14px 16px;
          border: 1px solid #e5e7eb;
          border-radius: 10px;
          background: #fafafa;
        }

        .cp-doc-label { font-size: 0.9rem; font-weight: 600; color: #111827; margin-bottom: 2px; }
        .cp-doc-desc  { font-size: 0.78rem; color: #9ca3af; }
        .cp-doc-ok    { font-size: 0.78rem; color: #10b981; margin-top: 4px; }

        /* notices */
        .cp-notice {
          padding: 12px 16px;
          border-radius: 8px;
          font-size: 0.875rem;
          margin-top: 16px;
          line-height: 1.5;
        }
        .cp-notice--warn  { background: #fffbeb; border: 1px solid #fcd34d; color: #92400e; }
        .cp-notice--error { background: #fef2f2; border: 1px solid #fca5a5; color: #991b1b; }
        .cp-notice--info  { background: #eff6ff; border: 1px solid #93c5fd; color: #1e40af; }

        /* toggle rows */
        .cp-toggle-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 0;
          border-bottom: 1px solid #f3f4f6;
          font-size: 0.875rem;
          color: #374151;
          cursor: pointer;
        }
        .cp-toggle-row:last-child { border-bottom: none; }

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
