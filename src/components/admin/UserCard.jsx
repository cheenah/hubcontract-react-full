import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Eye, Trash2 } from 'lucide-react';
import { getStatusConfig, resolveVerificationStatus } from '@/utils/adminHelpers';

const UserCard = ({ user, onDelete }) => {
  const navigate = useNavigate();

  const resolvedStatus       = resolveVerificationStatus(user.verification_status);
  const { label: statusLabel } = getStatusConfig(resolvedStatus);
  const roleStr              = typeof user.role === 'string' ? user.role : '—';
  const { label: roleLabel } = getStatusConfig(roleStr);
  const docCount             = Object.keys(user.documents || {}).length;

  return (
    <Card className="user-card neon-card" data-testid={`user-${user.id}`}>
      <div className="user-info">
        <div>
          <h3 className="user-company">{user.company_name || 'Без названия'}</h3>
          <p className="user-email-secondary">{user.email}</p>
          <p className="user-meta">БИН: {user.company_bin ?? '—'}</p>
          {docCount > 0 && (
            <p className="user-meta">Документов загружено: {docCount}</p>
          )}
        </div>
        <div className="user-badges">
          <span className="role-badge">{roleLabel}</span>
          <span className={`status-badge status-${resolvedStatus}`}>{statusLabel}</span>
        </div>
      </div>
      <div className="card-actions">
        <Button variant="outline" size="sm" onClick={() => navigate(`/profile?userId=${user.id}`)}>
          <Eye size={16} />
          Просмотр
        </Button>
        <Button variant="destructive" size="sm" onClick={() => onDelete(user.id)}>
          <Trash2 size={16} />
          Удалить
        </Button>
      </div>
    </Card>
  );
};

export default UserCard;
