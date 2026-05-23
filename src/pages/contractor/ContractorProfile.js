import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import useAuthStore from '@/store/authStore';
import apiClient from '@/services/api';
import { parseApiError } from '@/utils/apiError';
import { useLanguage } from '@/context/LanguageContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  User, Upload, Shield, Bell, Lock,
  CheckCircle, AlertCircle, Clock, Loader2, KeyRound,
  ExternalLink, Download,
} from 'lucide-react';

// ── Sub-components ─────────────────────────────────────────────────────────

const InfoField = ({ label, value }) => (
  <div>
    <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)] mb-0.5">
      {label}
    </dt>
    <dd className="text-sm font-medium text-[var(--color-text-primary)] break-all">
      {value || '—'}
    </dd>
  </div>
);

const DocRow = ({ docType, label, description, docData, onUpload, isUploading }) => {
  const { t } = useLanguage();
  const inputRef = useRef(null);
  const viewUrl = docData?.file_url || docData?.download_url || docData?.url;

  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)]">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-[var(--color-text-primary)] mb-0.5">{label}</p>
        <p className="text-xs text-[var(--color-text-placeholder)]">{description}</p>
        {docData && (
          <p className="text-xs text-[var(--color-success-alt)] mt-1">
            ✓ {docData.filename
              ? docData.filename
              : new Date(docData.uploaded_at).toLocaleDateString('ru-RU')}
          </p>
        )}
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        {docData && viewUrl && (
          <>
            <a href={viewUrl} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm" className="gap-1.5">
                <ExternalLink size={13} />
                Открыть
              </Button>
            </a>
            <a href={viewUrl} download={docData.filename || true}>
              <Button variant="outline" size="sm" className="gap-1.5">
                <Download size={13} />
                Скачать
              </Button>
            </a>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept="image/*,.pdf"
          onChange={(e) => { onUpload(docType, e.target.files[0]); e.target.value = ''; }}
        />
        <Button
          variant={docData ? 'outline' : 'default'}
          size="sm"
          disabled={isUploading}
          onClick={() => inputRef.current?.click()}
        >
          {isUploading
            ? <Loader2 size={14} className="animate-spin" />
            : <Upload size={14} />
          }
          {docData ? t('profile.reupload') : t('profile.upload')}
        </Button>
      </div>
    </div>
  );
};

// ── Main component ─────────────────────────────────────────────────────────

const ContractorProfile = () => {
  const { user } = useAuthStore();
  const { t } = useLanguage();

  const [section, setSection] = useState('info');
  const [uploadingDoc, setUploadingDoc] = useState(null);
  const [localDocs, setLocalDocs] = useState({});
  const [notices, setNotices] = useState({
    newTenders: true, bidStatus: true, contracts: true, messages: true, deadlines: true,
  });

  useEffect(() => { fetchDocs(); }, []);

  const SECTIONS = [
    { key: 'info',      label: t('profile.accountInfo'), icon: User },
    { key: 'documents', label: t('profile.documents'),   icon: Upload },
    { key: 'security',  label: 'Безопасность',           icon: Lock },
    { key: 'notices',   label: 'Уведомления',            icon: Bell },
  ];

  const documentTypes = [
    { key: 'registration_certificate',   label: 'Свидетельство о регистрации',          description: 'Свидетельство / лист записи о регистрации юрлица' },
    { key: 'tax_clearance',              label: 'Справка об отсутствии задолженностей', description: 'Справка из налогового органа' },
    { key: 'director_id_doc',            label: 'Документы директора',                   description: 'Удостоверение личности директора' },
    { key: 'director_appointment_order', label: 'Приказ о назначении директора',         description: 'Приказ или решение о назначении' },
    { key: 'company_charter',            label: 'Устав компании',                        description: 'Действующая редакция устава' },
  ];

  const NOTICE_ITEMS = [
    { key: 'newTenders', label: 'Новые тендеры по моим категориям' },
    { key: 'bidStatus',  label: 'Изменения статуса заявки' },
    { key: 'contracts',  label: 'Подписание договора' },
    { key: 'messages',   label: 'Новые сообщения' },
    { key: 'deadlines',  label: 'Напоминания о дедлайнах' },
  ];

  const STATUS_MAP = {
    verified:     { text: t('profile.verified'),     color: 'var(--color-success-alt)',       Icon: CheckCircle },
    pending:      { text: t('profile.pendingReview'), color: 'var(--color-warning)',           Icon: Clock },
    rejected:     { text: t('profile.rejected'),      color: 'var(--color-danger)',            Icon: AlertCircle },
    not_verified: { text: t('profile.notVerified'),   color: 'var(--color-text-placeholder)', Icon: Shield },
  };

  const statusKey = user?.documents_verified          ? 'verified'
    : user?.verification_status === 'pending'         ? 'pending'
    : user?.verification_status === 'rejected'        ? 'rejected'
    : 'not_verified';
  const { text: statusText, color: statusColor, Icon: StatusIcon } = STATUS_MAP[statusKey];

  const displayName = user?.first_name
    ? `${user.first_name} ${user.last_name || ''}`.trim()
    : user?.email?.split('@')[0];

  const roleLabel = user?.role === 'contractor' ? 'Исполнитель'
    : user?.role === 'customer'                 ? 'Заказчик'
    : user?.role ?? '—';

  const fetchDocs = async () => {
    try {
      const res  = await apiClient.get('/documents/list');
      const raw  = res.data;
      const list = Array.isArray(raw) ? raw : (Array.isArray(raw?.documents) ? raw.documents : []);
      const map  = {};
      list.forEach(doc => { map[doc.document_type] = doc; });
      setLocalDocs(map);
    } catch (e) {
      console.error('[docs] fetch error:', e);
    }
  };

  const handleFileUpload = async (docType, file) => {
    if (!file) return;
    setUploadingDoc(docType);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      try {
        await apiClient.post('/documents/upload', {
          document_type: docType,
          file_data:     reader.result.split(',')[1],
          filename:      file.name,
        });
        toast.success(t('profile.uploaded'));
        await fetchDocs();
      } catch (err) {
        toast.error(parseApiError(err, 'Ошибка загрузки документа'));
      } finally {
        setUploadingDoc(null);
      }
    };
    reader.onerror = () => {
      toast.error('Не удалось прочитать файл');
      setUploadingDoc(null);
    };
  };

  const handleNoticeToggle = async (key) => {
    const next = { ...notices, [key]: !notices[key] };
    setNotices(next);
    try {
      await apiClient.put('/users/settings', { notifications: next });
    } catch {
      toast.error('Не удалось сохранить настройки уведомлений');
    }
  };

  const navBtnCls = (key) =>
    `flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium w-full text-left transition-colors ${
      section === key
        ? 'bg-[var(--color-primary-bg)] text-[var(--color-primary-dark)] font-semibold'
        : 'text-[var(--color-text-tertiary)] hover:bg-[var(--color-primary-bg)] hover:text-[var(--color-primary-dark)]'
    }`;

  // ── Render ─────────────────────────────────────────────────────────────

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 md:py-10">

      {/* Title row */}
      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
          {t('profile.title')}
        </h1>
        <div
          className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full border-2 text-sm font-semibold"
          style={{ borderColor: statusColor, color: statusColor }}
        >
          <StatusIcon size={14} />
          <span>{statusText}</span>
        </div>
      </div>

      {/* Mobile nav — horizontal scroll */}
      <div className="md:hidden mb-4 overflow-x-auto pb-1">
        <div className="flex gap-2 min-w-max">
          {SECTIONS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setSection(key)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
                section === key
                  ? 'bg-[var(--color-primary)] text-white'
                  : 'border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-muted)]'
              }`}
            >
              <Icon size={15} />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Main layout */}
      <div className="flex items-start gap-5">

        {/* Desktop sidebar */}
        <aside className="hidden md:flex flex-col w-56 flex-shrink-0 sticky top-20 bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-2xl overflow-hidden">
          <div className="px-5 py-6 text-center border-b border-[var(--color-border-muted)]">
            <div className="w-16 h-16 rounded-full bg-[var(--color-primary)] text-white text-2xl font-bold flex items-center justify-center mx-auto mb-3 shadow-md">
              {user?.email?.charAt(0).toUpperCase() || 'U'}
            </div>
            <p className="text-sm font-semibold text-[var(--color-text-primary)] truncate">{displayName}</p>
            <p className="text-xs text-[var(--color-text-placeholder)] truncate mt-0.5">{user?.email}</p>
          </div>
          <nav className="flex flex-col gap-0.5 p-2.5">
            {SECTIONS.map(({ key, label, icon: Icon }) => (
              <button key={key} className={navBtnCls(key)} onClick={() => setSection(key)}>
                <Icon size={17} />
                {label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Content */}
        <div className="flex-1 min-w-0">

          {/* INFO */}
          {section === 'info' && (
            <Card className="p-6 md:p-8">
              <h2 className="text-lg font-bold text-[var(--color-text-primary)] mb-6">
                {t('profile.accountInfo')}
              </h2>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
                <InfoField label={t('profile.email')}       value={user?.email} />
                <InfoField label={t('profile.role')}        value={roleLabel} />
                <InfoField label={t('profile.bin')}         value={user?.company_bin} />
                <InfoField label={t('profile.phone')}       value={user?.phone} />
                {user?.company_name && (
                  <InfoField label={t('profile.companyName')} value={user.company_name} />
                )}
              </dl>
              {!user?.documents_verified && (
                <div className="mt-6 px-4 py-3 rounded-xl border border-[var(--color-warning)] bg-[var(--color-bg-muted)] text-sm text-[var(--color-text-secondary)]">
                  ⚠️ {t('profile.verificationNotice')}
                </div>
              )}
            </Card>
          )}

          {/* DOCUMENTS */}
          {section === 'documents' && (
            <Card className="p-6 md:p-8">
              <h2 className="text-lg font-bold text-[var(--color-text-primary)] mb-1">
                {t('profile.verificationDocs')}
              </h2>
              <p className="text-sm text-[var(--color-text-muted)] mb-5">{t('profile.uploadAllDocs')}</p>
              <div className="flex flex-col gap-3">
                {documentTypes.map((doc) => (
                  <DocRow
                    key={doc.key}
                    docType={doc.key}
                    label={doc.label}
                    description={doc.description}
                    docData={localDocs[doc.key]}
                    onUpload={handleFileUpload}
                    isUploading={uploadingDoc === doc.key}
                  />
                ))}
              </div>
              {user?.verification_status === 'rejected' && (
                <div className="mt-5 px-4 py-3 rounded-xl border border-[var(--color-danger-tint-20)] bg-[var(--color-danger-tint-05)] text-sm text-[var(--color-danger-alt)]">
                  ✗ {t('profile.rejectionNotice')}
                </div>
              )}
            </Card>
          )}

          {/* SECURITY */}
          {section === 'security' && (
            <Card className="p-6 md:p-8">
              <h2 className="text-lg font-bold text-[var(--color-text-primary)] mb-6">Безопасность</h2>
              <div className="flex items-center gap-4 p-5 rounded-xl bg-[var(--color-primary-bg)] border border-[var(--color-primary-border)]">
                <div className="w-12 h-12 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center flex-shrink-0">
                  <KeyRound size={22} className="text-[var(--color-primary-dark)]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[var(--color-text-primary)]">Смена пароля</p>
                  <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                    Запросите ссылку на сброс пароля — она придёт на ваш email
                  </p>
                </div>
                <Link
                  to="/forgot-password"
                  className="text-sm font-semibold text-[var(--color-primary-dark)] hover:underline whitespace-nowrap flex-shrink-0"
                >
                  Изменить →
                </Link>
              </div>
            </Card>
          )}

          {/* NOTICES */}
          {section === 'notices' && (
            <Card className="p-6 md:p-8">
              <h2 className="text-lg font-bold text-[var(--color-text-primary)] mb-1">Уведомления</h2>
              <p className="text-sm text-[var(--color-text-muted)] mb-5">
                Настройте, какие уведомления вы хотите получать
              </p>
              <div className="flex flex-col divide-y divide-[var(--color-border-muted)]">
                {NOTICE_ITEMS.map(({ key, label }) => (
                  <div key={key} className="flex items-center justify-between py-3.5">
                    <Label
                      htmlFor={`notice-${key}`}
                      className="text-sm font-medium text-[var(--color-text-secondary)] cursor-pointer"
                    >
                      {label}
                    </Label>
                    <Switch
                      id={`notice-${key}`}
                      checked={notices[key]}
                      onCheckedChange={() => handleNoticeToggle(key)}
                    />
                  </div>
                ))}
              </div>
            </Card>
          )}

        </div>
      </div>
    </div>
  );
};

export default ContractorProfile;
