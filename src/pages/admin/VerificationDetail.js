import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { BASE_URL as API } from '@/services/api';
import { parseApiError } from '@/utils/apiError';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  ArrowLeft, Building2, Mail, Phone, MapPin, Hash,
  FileText, ExternalLink, Download, CheckCircle, XCircle,
  Clock, Shield, User, Loader2, AlertCircle, Send,
} from 'lucide-react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';

// ── Константы ────────────────────────────────────────────────────────────────

// Порядок и названия документов, загружаемых в CompleteRegistration
const DOCUMENT_KEYS = [
  'registration_certificate',
  'tax_clearance',
  'director_id_doc',
  'director_appointment_order',
  'company_charter',
];

const DOCUMENT_LABELS = {
  registration_certificate:   'Свидетельство о регистрации',
  tax_clearance:              'Справка об отсутствии задолженностей',
  director_id_doc:            'Документы директора (удостоверение)',
  director_appointment_order: 'Приказ о назначении директора',
  company_charter:            'Устав компании',
};

// ── Вспомогательные компоненты ────────────────────────────────────────────────

// InfoRow — одна строка с иконкой, меткой и значением
const InfoRow = ({ icon: Icon, label, value }) => {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-[var(--color-border-muted)] last:border-0">
      <Icon size={16} className="text-[var(--color-text-placeholder)] mt-0.5 flex-shrink-0" />
      <span className="text-sm text-[var(--color-text-muted)] w-40 flex-shrink-0">{label}</span>
      <span className="text-sm font-medium text-[var(--color-text-primary)] flex-1">{value}</span>
    </div>
  );
};

// StatusBadge — бейдж статуса верификации
const StatusBadge = ({ status }) => {
  const map = {
    pending:  { label: 'На проверке',     color: 'var(--color-warning)',          Icon: Clock },
    approved: { label: 'Одобрен',         color: 'var(--color-success-alt)',      Icon: CheckCircle },
    rejected: { label: 'Отклонён',        color: 'var(--color-danger)',           Icon: XCircle },
    not_verified: { label: 'Не верифицирован', color: 'var(--color-text-placeholder)', Icon: Shield },
  };
  const { label, color, Icon } = map[status] || map.not_verified;
  return (
    <span
      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-sm font-semibold"
      style={{ color, borderColor: color }}
    >
      <Icon size={14} />
      {label}
    </span>
  );
};

// ── Основной компонент ────────────────────────────────────────────────────────

const VerificationDetail = () => {
  const { userId } = useParams();
  const navigate = useNavigate();

  // userData — данные пользователя из GET /admin/users/:userId
  const [userData, setUserData] = useState(null);
  // orgData — данные организации из GET /organization/profile?user_id=:userId
  const [orgData, setOrgData] = useState(null);
  const [loading, setLoading] = useState(true);
  // actionLoading — true во время POST /documents/verify/:userId
  const [actionLoading, setActionLoading] = useState(false);
  // downloadingKey — ключ документа, который сейчас скачивается
  const [downloadingKey, setDownloadingKey] = useState(null);
  // send completion email
  const [sendDialogOpen, setSendDialogOpen] = useState(false);
  const [sendLoading, setSendLoading] = useState(false);
  const [lastSentAt, setLastSentAt] = useState(null);

  useEffect(() => {
    fetchAll();
  }, [userId]);

  // fetchAll — параллельно загружает данные пользователя и профиль организации
  const fetchAll = async () => {
    setLoading(true);
    try {
      const userRes = await axios.get(`${API}/admin/users/${userId}`);
      setUserData(userRes.data);

      // Пробуем получить расширенный профиль организации (директор, адрес).
      // Бэкенд может не поддерживать user_id — игнорируем ошибку.
      try {
        const orgRes = await axios.get(`${API}/organization/profile`, {
          params: { user_id: userId },
        });
        setOrgData(orgRes.data);
      } catch {
        // Профиль не доступен — показываем только данные из userRes
      }
    } catch {
      toast.error('Ошибка загрузки данных пользователя');
      navigate('/admin');
    } finally {
      setLoading(false);
    }
  };

  // handleVerification — одобряет или отклоняет верификацию, затем возвращает в /admin
  const handleVerification = async (approved) => {
    setActionLoading(true);
    try {
      await axios.post(`${API}/documents/verify/${userId}`, null, {
        params: { approved },
      });
      toast.success(approved ? 'Компания одобрена' : 'Компания отклонена');
      navigate('/admin');
    } catch (err) {
      toast.error(parseApiError(err, 'Ошибка верификации'));
    } finally {
      setActionLoading(false);
    }
  };

  // handleDownload — скачивает файл через fetch+Blob (работает для cross-origin URL).
  // Если URL недоступен, пытается открыть страницу скачивания через /documents/:id/download.
  const handleDownload = async (doc, docKey) => {
    const url = doc?.url || doc?.file_url;
    const filename = doc?.filename || `${docKey}.pdf`;
    setDownloadingKey(docKey);
    try {
      if (url) {
        const resp = await fetch(url);
        const blob = await resp.blob();
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(blobUrl);
      } else if (doc?.id) {
        // Fallback: открываем эндпоинт скачивания в новой вкладке
        window.open(`${API}/documents/${doc.id}/download`, '_blank');
      } else {
        toast.error('Ссылка для скачивания недоступна');
      }
    } catch {
      toast.error('Не удалось скачать файл');
    } finally {
      setDownloadingKey(null);
    }
  };

  const handleSendCompletionEmail = async () => {
    setSendLoading(true);
    try {
      const res = await axios.post(`${API}/admin/users/${userId}/send-completion-email`);
      if (res.data.success) {
        setLastSentAt(res.data.sent_at);
        setSendDialogOpen(false);
        toast.success('Письмо отправлено');
      } else {
        toast.error(res.data.error || 'Ошибка отправки письма');
      }
    } catch (err) {
      toast.error(parseApiError(err, 'Ошибка отправки письма'));
    } finally {
      setSendLoading(false);
    }
  };

  // ── Загрузка ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 size={32} className="animate-spin text-[var(--color-primary)]" />
      </div>
    );
  }

  if (!userData) return null;

  // documents — объект из userData.documents или пустой объект
  const documents = userData.documents || {};
  const uploadedCount = Object.keys(documents).length;
  const totalCount = DOCUMENT_KEYS.length;
  const allUploaded = uploadedCount >= totalCount;

  // Компания и директор: берём из orgData если есть, иначе из userData
  const companyName  = orgData?.company_name  || userData.company_name  || '—';
  const companyBin   = orgData?.company_bin   || userData.company_bin   || '—';
  const directorName = orgData?.director_name || userData.director_name || '—';
  const legalAddress = orgData?.legal_address || userData.legal_address || '—';
  const directorPhone = orgData?.director_phone || '—';
  const directorEmail = orgData?.director_email || '—';

  return (
    <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">

      {/* ── Шапка: кнопка назад + заголовок ── */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={() => navigate('/admin')}
          className="inline-flex items-center gap-1.5 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors"
        >
          <ArrowLeft size={16} />
          Назад к панели
        </button>
        <Button variant="outline" size="sm" onClick={() => navigate(`/profile?userId=${userId}`)}>
          <User size={15} />
          Профиль пользователя
        </Button>
      </div>

      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
            {companyName}
          </h1>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">{userData.email}</p>
        </div>
        <StatusBadge status={userData.verification_status} />
      </div>

      {/* ── Карточка: информация о компании ── */}
      <Card className="p-6 border border-[var(--color-border)] rounded-2xl bg-[var(--color-bg-surface)]">
        <div className="flex items-center gap-2 mb-5">
          <Building2 size={18} className="text-[var(--color-primary)]" />
          <h2 className="text-base font-semibold text-[var(--color-text-primary)]">
            Информация о компании
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10">
          {/* Левая колонка: реквизиты */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-placeholder)] mb-3">
              Реквизиты
            </p>
            <InfoRow icon={Building2} label="Название"    value={companyName} />
            <InfoRow icon={Hash}      label="БИН"         value={companyBin} />
            <InfoRow icon={MapPin}    label="Юр. адрес"   value={legalAddress} />
            <InfoRow icon={Mail}      label="Email"        value={userData.email} />
            <InfoRow icon={Phone}     label="Телефон"      value={userData.phone} />
          </div>

          {/* Правая колонка: директор */}
          <div className="mt-6 md:mt-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-placeholder)] mb-3">
              Директор
            </p>
            <InfoRow icon={User}  label="ФИО директора"   value={directorName} />
            <InfoRow icon={Phone} label="Телефон"          value={directorPhone} />
            <InfoRow icon={Mail}  label="Email"             value={directorEmail} />
          </div>
        </div>
      </Card>

      {/* ── Карточка: документы ── */}
      <Card className="p-6 border border-[var(--color-border)] rounded-2xl bg-[var(--color-bg-surface)]">
        <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <FileText size={18} className="text-[var(--color-primary)]" />
            <h2 className="text-base font-semibold text-[var(--color-text-primary)]">
              Документы
            </h2>
          </div>
          {/* Счётчик загруженных / требуемых */}
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium border ${
              allUploaded
                ? 'text-[var(--color-success-alt)] border-[var(--color-success-alt)] bg-[var(--color-success-tint-10)]'
                : 'text-[var(--color-warning)] border-[var(--color-warning)] bg-[rgba(245,158,11,0.08)]'
            }`}
          >
            {allUploaded ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
            {uploadedCount} / {totalCount} загружено
          </span>
        </div>

        <div className="flex flex-col gap-3">
          {DOCUMENT_KEYS.map((key) => {
            const doc = documents[key];
            const label = DOCUMENT_LABELS[key];
            const viewUrl = doc?.url || doc?.file_url;
            const isDownloading = downloadingKey === key;

            return (
              <div
                key={key}
                className={`flex items-center justify-between gap-4 p-4 rounded-xl border transition-colors ${
                  doc
                    ? 'border-[var(--color-border)] bg-[var(--color-bg-subtle)]'
                    : 'border-dashed border-[var(--color-border-gray)] bg-[var(--color-bg-muted)]'
                }`}
              >
                {/* Иконка + название + метаданные */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className={`p-2 rounded-lg flex-shrink-0 ${doc ? 'bg-[var(--color-success-tint-10)]' : 'bg-[var(--color-bg-surface)]'}`}>
                    <FileText
                      size={18}
                      className={doc ? 'text-[var(--color-success-alt)]' : 'text-[var(--color-text-placeholder)]'}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[var(--color-text-primary)] truncate">
                      {label}
                    </p>
                    {doc ? (
                      <>
                        {doc.filename && (
                          <p
                            className="text-xs text-[var(--color-text-muted)] truncate mt-0.5"
                            title={doc.filename}
                          >
                            {doc.filename}
                          </p>
                        )}
                        {doc.uploaded_at && (
                          <p className="text-xs text-[var(--color-text-placeholder)] mt-0.5">
                            Загружено {new Date(doc.uploaded_at).toLocaleDateString('ru-RU', {
                              day: '2-digit', month: 'long', year: 'numeric',
                            })}
                          </p>
                        )}
                      </>
                    ) : (
                      <p className="text-xs text-[var(--color-text-placeholder)] mt-0.5">
                        Документ не загружен
                      </p>
                    )}
                  </div>
                </div>

                {/* Кнопки просмотра и скачивания */}
                {doc && (
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {viewUrl && (
                      <a href={viewUrl} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" size="sm" className="gap-1.5">
                          <ExternalLink size={14} />
                          Открыть
                        </Button>
                      </a>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5"
                      disabled={isDownloading}
                      onClick={() => handleDownload(doc, key)}
                    >
                      {isDownloading
                        ? <Loader2 size={14} className="animate-spin" />
                        : <Download size={14} />
                      }
                      Скачать
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* ── Карточка: отправка письма о завершении регистрации ── */}
      {userData.onboarding_completed === false && (
        <Card className="p-6 border border-[var(--color-border)] rounded-2xl bg-[var(--color-bg-surface)]">
          <div className="flex items-center gap-2 mb-3">
            <Send size={18} className="text-[var(--color-primary)]" />
            <h2 className="text-base font-semibold text-[var(--color-text-primary)]">
              Завершение регистрации
            </h2>
          </div>
          <p className="text-sm text-[var(--color-text-muted)] mb-4">
            Пользователь ещё не завершил регистрацию. Отправьте письмо со ссылкой для продолжения.
          </p>

          {lastSentAt && (
            <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)] mb-4 px-3 py-2.5 rounded-lg bg-[var(--color-bg-subtle)] border border-[var(--color-border)]">
              <Clock size={13} className="flex-shrink-0 text-[var(--color-text-placeholder)]" />
              <span>
                Последняя отправка:{' '}
                {new Date(lastSentAt).toLocaleString('ru-RU', {
                  day: '2-digit', month: 'long', year: 'numeric',
                  hour: '2-digit', minute: '2-digit',
                })}
              </span>
            </div>
          )}

          <Button
            onClick={() => setSendDialogOpen(true)}
            className="gap-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white"
          >
            <Send size={16} />
            Отправить письмо о завершении регистрации
          </Button>
        </Card>
      )}

      {/* ── Карточка: действия верификации ── */}
      {userData.verification_status === 'pending' && (
        <Card className="p-6 border border-[var(--color-border)] rounded-2xl bg-[var(--color-bg-surface)]">
          <h2 className="text-base font-semibold text-[var(--color-text-primary)] mb-2">
            Решение по верификации
          </h2>
          <p className="text-sm text-[var(--color-text-muted)] mb-5">
            После принятия решения компания получит уведомление на email.
          </p>

          <div className="flex items-center gap-3 flex-wrap">
            <Button
              variant="outline"
              className="gap-2 border-[var(--color-danger)] text-[var(--color-danger)] hover:bg-[var(--color-danger-tint-10)]"
              disabled={actionLoading}
              onClick={() => handleVerification(false)}
            >
              {actionLoading
                ? <Loader2 size={16} className="animate-spin" />
                : <XCircle size={16} />
              }
              Отклонить
            </Button>
            <Button
              className="gap-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white"
              disabled={actionLoading}
              onClick={() => handleVerification(true)}
            >
              {actionLoading
                ? <Loader2 size={16} className="animate-spin" />
                : <CheckCircle size={16} />
              }
              Одобрить
            </Button>
          </div>
        </Card>
      )}

      {/* ── Уведомление если верификация уже завершена ── */}
      {userData.verification_status !== 'pending' && (
        <div className={`flex items-center gap-3 p-4 rounded-xl border text-sm ${
          userData.verification_status === 'approved'
            ? 'bg-[var(--color-success-tint-10)] border-[var(--color-success-alt)] text-[var(--color-success-alt)]'
            : 'bg-[var(--color-danger-tint-05)] border-[var(--color-danger-tint-20)] text-[var(--color-danger-alt)]'
        }`}>
          {userData.verification_status === 'approved'
            ? <CheckCircle size={16} />
            : <XCircle size={16} />
          }
          {userData.verification_status === 'approved'
            ? 'Компания уже одобрена'
            : 'Компания ранее была отклонена'
          }
        </div>
      )}

      {/* ── Диалог подтверждения отправки ── */}
      <Dialog open={sendDialogOpen} onOpenChange={setSendDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Отправить письмо?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">
            Письмо со ссылкой для завершения регистрации будет отправлено на{' '}
            <strong className="text-[var(--color-text-primary)]">{userData?.email}</strong>.
          </p>
          <div className="flex justify-end gap-3 mt-5">
            <Button
              variant="outline"
              onClick={() => setSendDialogOpen(false)}
              disabled={sendLoading}
            >
              Отмена
            </Button>
            <Button
              onClick={handleSendCompletionEmail}
              disabled={sendLoading}
              className="gap-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white"
            >
              {sendLoading
                ? <Loader2 size={16} className="animate-spin" />
                : <Send size={16} />
              }
              {sendLoading ? 'Отправка...' : 'Отправить'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VerificationDetail;
