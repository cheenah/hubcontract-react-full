import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FileText, CheckCircle, ExternalLink, XCircle, UserCircle } from 'lucide-react';
import { DOCUMENT_LABELS } from '@/utils/adminHelpers';

const VerificationCard = ({ user, onApprove, onReject }) => {
  const navigate = useNavigate();

  return (
    <Card className="verification-card neon-card" data-testid={`verification-${user.id}`}>
      <div className="verification-header">
        <div>
          <h3 className="user-email">{user.email}</h3>
          <p className="user-meta">
            {user.role} • {user.company_name || 'Без названия компании'}
          </p>
          <p className="user-meta">БИН: {user.company_bin} • Телефон: {user.phone}</p>
        </div>
      </div>

      <div className="documents-section">
        <h4 className="section-title">
          Загруженные документы
          {user.documents && (
            <span className="ml-2 text-sm font-normal text-[var(--color-text-muted)]">
              ({Object.keys(user.documents).length} / {Object.keys(DOCUMENT_LABELS).length})
            </span>
          )}
        </h4>
        <div className="flex flex-col gap-2">
          {user.documents && Object.keys(user.documents).length > 0 ? (
            Object.entries(user.documents).map(([key, doc]) => {
              const label   = DOCUMENT_LABELS[key] || key.replace(/_/g, ' ');
              const viewUrl = doc?.url || doc?.file_url;
              return (
                <div
                  key={key}
                  className="flex items-center justify-between gap-3 p-3 rounded-lg bg-[var(--color-bg-surface)] border border-[var(--color-border)]"
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <FileText size={15} className="text-[var(--color-primary)] flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-[var(--color-text-dark)] truncate">
                        {label}
                      </div>
                      {doc?.filename && (
                        <div className="text-xs text-[var(--color-text-muted)] truncate" title={doc.filename}>
                          {doc.filename}
                        </div>
                      )}
                      {doc?.uploaded_at && (
                        <div className="text-xs text-[var(--color-text-placeholder)]">
                          {new Date(doc.uploaded_at).toLocaleDateString('ru-RU')}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="flex items-center gap-1 text-xs font-medium text-[var(--color-success-alt)]">
                      <CheckCircle size={13} />
                      Загружен
                    </span>
                    {viewUrl && (
                      <a href={viewUrl} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" size="sm" className="h-7 px-2 text-xs gap-1">
                          <ExternalLink size={12} />
                          Открыть
                        </Button>
                      </a>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <p className="no-documents">Нет документов</p>
          )}
        </div>
      </div>

      <div className="verification-actions">
        <Button variant="outline" onClick={() => navigate(`/profile?userId=${user.id}`)}>
          <UserCircle size={18} />
          Профиль
        </Button>
        <Button
          variant="destructive"
          onClick={() => onReject(user.id)}
          data-testid={`reject-btn-${user.id}`}
        >
          <XCircle size={18} />
          Отклонить
        </Button>
        <Button
          onClick={() => onApprove(user.id)}
          className="neon-button-filled"
          data-testid={`approve-btn-${user.id}`}
        >
          <CheckCircle size={18} />
          Одобрить
        </Button>
      </div>
    </Card>
  );
};

export default VerificationCard;
