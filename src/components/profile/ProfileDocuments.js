import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import useAuthStore from '@/store/authStore';
import apiClient from '@/services/api';
import { parseApiError } from '@/utils/apiError';
import { Button } from '@/components/ui/button';
import { FileText, ExternalLink, Download, Upload, Loader2 } from 'lucide-react';

// ── Constants ─────────────────────────────────────────────────────────────────

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
  director_id_doc:            'Документы директора (удостоверение личности)',
  director_appointment_order: 'Приказ о назначении директора',
  company_charter:            'Устав компании',
};

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * Props:
 *   targetUserId     — string | null. When set, loads documents for that user.
 *   canEdit          — boolean. Controls replace controls.
 *   initialDocuments — Array | null. When provided (admin view), skips HTTP fetch
 *                      and maps the array directly. null means "not yet loaded".
 */
const ProfileDocuments = ({ targetUserId, canEdit, initialDocuments }) => {
  const user = useAuthStore(s => s.user);

  const [documents,    setDocuments]    = useState({});
  const [loadingDocs,  setLoadingDocs]  = useState(false);
  const [uploading,    setUploading]    = useState({});
  const [downloading,  setDownloading]  = useState({});

  // One ref slot per document key — avoids document.getElementById
  const fileInputRefs = useRef({});

  const isExternalProfile = Boolean(targetUserId && targetUserId !== String(user?.id));

  useEffect(() => {
    fetchDocuments();
  }, [targetUserId, initialDocuments]);

  // ── Fetchers ────────────────────────────────────────────────────────────────

  const docsArrayToMap = (arr) => {
    const map = {};
    arr.forEach(doc => { map[doc.document_type] = doc; });
    return map;
  };

  const fetchDocuments = async () => {
    // Admin view: documents already fetched by Profile via /admin/users/:id
    if (initialDocuments !== null && initialDocuments !== undefined) {
      setDocuments(docsArrayToMap(initialDocuments));
      return;
    }

    // Own profile: fetch from /documents/list
    setLoadingDocs(true);
    try {
      const response = await apiClient.get('/documents/list');
      const raw      = response.data;
      // Normalise: array or { documents: [] }
      const list     = Array.isArray(raw) ? raw : (Array.isArray(raw?.documents) ? raw.documents : []);
      setDocuments(docsArrayToMap(list));
    } catch (e) {
      console.error('[docs] list error:', e);
      setDocuments({});
    } finally {
      setLoadingDocs(false);
    }
  };

  // Force HTTP re-fetch after upload (bypasses initialDocuments to pick up new file)
  const refetchDocuments = async () => {
    try {
      if (targetUserId) {
        // Admin viewing another user — use the same endpoint Profile uses
        const res  = await apiClient.get(`/admin/users/${targetUserId}`);
        const docs = Array.isArray(res.data.documents) ? res.data.documents : [];
        setDocuments(docsArrayToMap(docs));
      } else {
        const res  = await apiClient.get('/documents/list');
        const raw  = res.data;
        const list = Array.isArray(raw) ? raw : (Array.isArray(raw?.documents) ? raw.documents : []);
        setDocuments(docsArrayToMap(list));
      }
    } catch (e) {
      console.error('[docs] refetch error:', e);
    }
  };

  // ── Download handler ─────────────────────────────────────────────────────────

  const handleDownload = async (docKey, url, filename) => {
    if (!url) return;
    setDownloading(prev => ({ ...prev, [docKey]: true }));
    try {
      // download_url already starts with /api — strip it so apiClient doesn't double it
      const path    = url.startsWith('/api') ? url.slice(4) : url;
      const res     = await apiClient.get(path, { responseType: 'blob' });
      const blobUrl = window.URL.createObjectURL(res.data);
      const a       = document.createElement('a');
      a.href        = blobUrl;
      a.download    = filename || 'document';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error('[download] error:', err);
      toast.error('Не удалось скачать файл');
    } finally {
      setDownloading(prev => ({ ...prev, [docKey]: false }));
    }
  };

  // ── Upload handler ───────────────────────────────────────────────────────────

  const handleFileUpload = async (docType, file) => {
    if (!file) return;
    setUploading(prev => ({ ...prev, [docType]: true }));
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      try {
        const url = targetUserId
          ? `/documents/upload?user_id=${targetUserId}`
          : `/documents/upload`;
        await apiClient.post(url, {
          document_type: docType,
          file_data:     reader.result.split(',')[1],
          filename:      file.name,
          user_id:       targetUserId || user?.id,
        });
        toast.success('Документ загружен');
        await refetchDocuments();
      } catch (err) {
        toast.error(parseApiError(err, 'Ошибка загрузки документа'));
      } finally {
        setUploading(prev => ({ ...prev, [docType]: false }));
      }
    };
    reader.onerror = () => {
      toast.error('Не удалось прочитать файл');
      setUploading(prev => ({ ...prev, [docType]: false }));
    };
  };

  // ── Render ───────────────────────────────────────────────────────────────────

  if (loadingDocs) {
    return (
      <div className="flex justify-center items-center py-16">
        <Loader2 className="animate-spin text-gray-400" size={28} />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-5">
        <h2 className="text-lg font-bold text-gray-900">Документы верификации</h2>
        <p className="text-sm text-gray-500 mt-0.5">
          {canEdit
            ? 'Загрузите все необходимые документы для верификации'
            : 'Документы, загруженные пользователем для верификации'}
        </p>
      </div>

      {/* Document rows */}
      <div>
        {DOCUMENT_KEYS.map(docKey => {
          const doc           = documents[docKey] || (!isExternalProfile ? user?.documents?.[docKey] : undefined);
          const label         = DOCUMENT_LABELS[docKey];
          const viewUrl       = doc?.download_url || doc?.url || doc?.file_url;
          const isUploading   = uploading[docKey];
          const isDownloading = downloading[docKey];

          return (
            <div
              key={docKey}
              className="flex items-center justify-between p-4 bg-gray-50/50 border border-gray-200 rounded-xl mb-3"
            >
              {/* Left: icon + name */}
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className={`p-2 rounded-lg flex-shrink-0 ${doc ? 'bg-green-50' : 'bg-gray-100'}`}>
                  <FileText size={18} className={doc ? 'text-green-600' : 'text-gray-400'} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-gray-900 leading-tight">{label}</p>
                  {doc ? (
                    <p className="text-xs text-green-600 mt-0.5 truncate" title={doc.filename || undefined}>
                      {doc.filename
                        ? doc.filename
                        : doc.uploaded_at
                          ? `Загружен: ${new Date(doc.uploaded_at).toLocaleDateString('ru-RU')}`
                          : 'Загружен'}
                    </p>
                  ) : (
                    <p className="text-xs text-gray-400 mt-0.5">Документ не загружен</p>
                  )}
                </div>
              </div>

              {/* Right: action buttons */}
              <div className="flex items-center gap-2 flex-shrink-0 ml-3">

                {/* Open — view in browser */}
                {doc && viewUrl && (
                  <a href={viewUrl} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="sm" className="gap-1.5">
                      <ExternalLink size={13} />
                      Открыть
                    </Button>
                  </a>
                )}

                {/* Download — blob fetch so cross-origin files actually download */}
                {doc && viewUrl && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5"
                    disabled={isDownloading}
                    onClick={() => handleDownload(docKey, viewUrl, doc.filename)}
                  >
                    {isDownloading
                      ? <Loader2 size={13} className="animate-spin" />
                      : <Download size={13} />}
                    Скачать
                  </Button>
                )}

                {/* Replace / Upload — only for users with edit rights */}
                {canEdit && (
                  <>
                    <input
                      ref={el => { fileInputRefs.current[docKey] = el; }}
                      type="file"
                      className="hidden"
                      accept="image/*,.pdf"
                      onChange={e => {
                        handleFileUpload(docKey, e.target.files[0]);
                        e.target.value = '';
                      }}
                    />
                    <button
                      type="button"
                      disabled={isUploading}
                      onClick={() => fileInputRefs.current[docKey]?.click()}
                      className="flex items-center gap-1.5 px-4 py-1.5 bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white text-sm font-medium rounded-full transition-colors cursor-pointer"
                    >
                      {isUploading
                        ? <Loader2 size={13} className="animate-spin" />
                        : <Upload size={13} />}
                      {doc ? 'Заменить' : 'Загрузить'}
                    </button>
                  </>
                )}

                {/* Placeholder when no doc and read-only */}
                {!canEdit && !doc && (
                  <span className="text-xs text-gray-400 italic">Не предоставлен</span>
                )}

              </div>
            </div>
          );
        })}
      </div>

      {/* Rejection notice — own profile only */}
      {!isExternalProfile && user?.verification_status === 'rejected' && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
          ✗ Документы отклонены. Пожалуйста, загрузите исправленные документы и дождитесь повторной проверки.
        </div>
      )}
    </div>
  );
};

export default ProfileDocuments;
