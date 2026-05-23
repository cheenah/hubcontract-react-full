import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import apiClient from '@/services/api';
import { parseApiError } from '@/utils/apiError';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, FileText, CheckCircle, XCircle, Trash2, Eye, Plus } from 'lucide-react';
import CreateTenderDialog from './CreateTenderDialog';
import { getStatusConfig } from '@/utils/adminHelpers';
import UserCard from '@/components/admin/UserCard';
import VerificationCard from '@/components/admin/VerificationCard';
import ConfirmDialog from '@/components/admin/dialogs/ConfirmDialog';
import RejectDialog from '@/components/admin/dialogs/RejectDialog';

// ── Constants ────────────────────────────────────────────────────────────────

const ROLE_FILTER_OPTIONS = [
  { value: '',           label: 'Все' },
  { value: 'customer',   label: 'Заказчик' },
  { value: 'contractor', label: 'Исполнитель' },
  { value: 'admin',      label: 'Администратор' },
];

// ── Component ─────────────────────────────────────────────────────────────────

const AdminPanel = () => {
  const navigate = useNavigate();

  const [stats, setStats]               = useState(null);
  const [users, setUsers]               = useState([]);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [tenders, setTenders]           = useState([]);
  const [contracts, setContracts]       = useState([]);
  const [loading, setLoading]           = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const [userSearch, setUserSearch] = useState('');
  const [verSearch,  setVerSearch]  = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  const [confirmDialog, setConfirmDialog] = useState(null);
  const [rejectDialog,  setRejectDialog]  = useState(null);
  const [rejectReason,  setRejectReason]  = useState('');
  const [rejectLoading, setRejectLoading] = useState(false);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      const [statsRes, usersRes, pendingRes, tendersRes, contractsRes] = await Promise.all([
        apiClient.get('/admin/stats'),
        apiClient.get('/admin/users'),
        apiClient.get('/documents/verification-pending'),
        apiClient.get('/tenders'),
        apiClient.get('/contracts'),
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data);
      setPendingUsers(pendingRes.data);
      setTenders(tendersRes.data);
      setContracts(contractsRes.data);
    } catch {
      toast.error('Ошибка загрузки данных админ-панели');
    } finally {
      setLoading(false);
    }
  };

  // ── Helpers ───────────────────────────────────────────────────────────────

  const openConfirm = (title, desc, onConfirm) => setConfirmDialog({ title, desc, onConfirm });

  // ── Verification ──────────────────────────────────────────────────────────

  const handleApprove = async (userId) => {
    setPendingUsers(prev => prev.filter(u => u.id !== userId));
    try {
      await apiClient.post(`/documents/verify/${userId}`, null, { params: { approved: true } });
      toast.success('Компания одобрена');
    } catch (err) {
      toast.error(parseApiError(err, 'Ошибка верификации'));
      apiClient.get('/documents/verification-pending').then(r => setPendingUsers(r.data)).catch(() => {});
    }
  };

  const openRejectDialog = (userId) => {
    setRejectReason('');
    setRejectDialog({ userId });
  };

  const handleReject = async () => {
    if (!rejectDialog) return;
    setRejectLoading(true);
    const { userId } = rejectDialog;
    try {
      await apiClient.post(`/documents/verify/${userId}`, null, {
        params: { approved: false, ...(rejectReason ? { reason: rejectReason } : {}) },
      });
      toast.success('Компания отклонена');
      setPendingUsers(prev => prev.filter(u => u.id !== userId));
      setRejectDialog(null);
    } catch (err) {
      toast.error(parseApiError(err, 'Ошибка верификации'));
    } finally {
      setRejectLoading(false);
    }
  };

  // ── Optimistic deletes ────────────────────────────────────────────────────

  const handleDeleteUser = (userId) => {
    openConfirm(
      'Удалить пользователя?',
      'Это действие нельзя отменить. Все данные пользователя будут удалены безвозвратно.',
      async () => {
        setUsers(prev => prev.filter(u => u.id !== userId));
        try {
          await apiClient.delete(`/users/${userId}`);
          toast.success('Пользователь удалён');
        } catch (err) {
          toast.error(parseApiError(err, 'Ошибка удаления пользователя'));
          apiClient.get('/admin/users').then(r => setUsers(r.data)).catch(() => {});
        }
      },
    );
  };

  const handleDeleteTender = (tenderId) => {
    openConfirm(
      'Удалить тендер?',
      'Это действие нельзя отменить.',
      async () => {
        setTenders(prev => prev.filter(t => t.id !== tenderId));
        try {
          await apiClient.delete(`/tenders/${tenderId}`);
          toast.success('Тендер удалён');
        } catch (err) {
          toast.error(parseApiError(err, 'Ошибка удаления тендера'));
          apiClient.get('/tenders').then(r => setTenders(r.data)).catch(() => {});
        }
      },
    );
  };

  const handleDeleteContract = (contractId) => {
    openConfirm(
      'Удалить договор?',
      'Это действие нельзя отменить.',
      async () => {
        setContracts(prev => prev.filter(c => c.id !== contractId));
        try {
          await apiClient.delete(`/contracts/${contractId}`);
          toast.success('Договор удалён');
        } catch (err) {
          toast.error(parseApiError(err, 'Ошибка удаления договора'));
          apiClient.get('/contracts').then(r => setContracts(r.data)).catch(() => {});
        }
      },
    );
  };

  // ── Derived state ─────────────────────────────────────────────────────────

  const filteredUsers = users.filter(u => {
    const q            = userSearch.toLowerCase();
    const matchSearch  = !q
      || u.email?.toLowerCase().includes(q)
      || String(u.company_bin ?? '').includes(q)
      || u.company_name?.toLowerCase().includes(q);
    const matchRole    = !roleFilter || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const filteredPending = pendingUsers.filter(u => {
    const q = verSearch.toLowerCase();
    return !q || u.email?.toLowerCase().includes(q) || String(u.company_bin ?? '').includes(q);
  });

  // ── Loading ───────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner" />
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      <div className="admin-panel-container" data-testid="admin-panel">

        {/* Header */}
        <div className="page-header">
          <h1 className="page-title">Панель администратора</h1>
          <p className="page-subtitle">Полное управление платформой</p>
        </div>

        {/* Stats */}
        {stats && (
          <div className="stats-grid">
            <Card className="stat-card neon-card">
              <div className="stat-icon"><Users size={24} /></div>
              <div>
                <p className="stat-label">Всего пользователей</p>
                <p className="stat-value" data-testid="admin-total-users">{stats.total_users}</p>
              </div>
            </Card>
            <Card className="stat-card neon-card">
              <div className="stat-icon"><FileText size={24} /></div>
              <div>
                <p className="stat-label">Всего тендеров</p>
                <p className="stat-value" data-testid="admin-total-tenders">{stats.total_tenders}</p>
              </div>
            </Card>
            <Card className="stat-card neon-card">
              <div className="stat-icon"><CheckCircle size={24} /></div>
              <div>
                <p className="stat-label">Активных тендеров</p>
                <p className="stat-value" data-testid="admin-active-tenders">{stats.active_tenders}</p>
              </div>
            </Card>
            <Card className="stat-card neon-card">
              <div className="stat-icon alert"><XCircle size={24} /></div>
              <div>
                <p className="stat-label">Ожидают верификации</p>
                <p className="stat-value" data-testid="admin-pending-verifications">
                  {typeof stats.pending_verifications === 'number'
                    ? stats.pending_verifications
                    : pendingUsers.length}
                </p>
              </div>
            </Card>
          </div>
        )}

        <Tabs defaultValue="verifications" className="admin-tabs">
          <TabsList className="tabs-list">
            <TabsTrigger value="verifications" data-testid="verifications-tab">
              Верификация ({pendingUsers.length})
            </TabsTrigger>
            <TabsTrigger value="users" data-testid="users-tab">
              Пользователи ({users.length})
            </TabsTrigger>
            <TabsTrigger value="tenders" data-testid="tenders-tab">
              Тендеры ({tenders.length})
            </TabsTrigger>
            <TabsTrigger value="contracts" data-testid="contracts-tab">
              Договоры ({contracts.length})
            </TabsTrigger>
          </TabsList>

          {/* ── VERIFICATION TAB ── */}
          <TabsContent value="verifications" className="tab-content">
            <div className="search-bar">
              <Input
                placeholder="Поиск по email или БИН…"
                value={verSearch}
                onChange={e => setVerSearch(e.target.value)}
              />
            </div>
            {filteredPending.length === 0 ? (
              <Card className="empty-state neon-card">
                <CheckCircle size={48} className="empty-icon" />
                <p>{verSearch ? 'Ничего не найдено' : 'Нет ожидающих верификации'}</p>
              </Card>
            ) : (
              <div className="verifications-list">
                {filteredPending.map(user => (
                  <VerificationCard
                    key={user.id}
                    user={user}
                    onApprove={handleApprove}
                    onReject={openRejectDialog}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* ── USERS TAB ── */}
          <TabsContent value="users" className="tab-content">
            <div className="users-toolbar">
              <Input
                className="users-search"
                placeholder="Поиск по названию, email или БИН…"
                value={userSearch}
                onChange={e => setUserSearch(e.target.value)}
              />
              <select
                className="role-filter-select"
                value={roleFilter}
                onChange={e => setRoleFilter(e.target.value)}
              >
                {ROLE_FILTER_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div className="users-list">
              {filteredUsers.map(user => (
                <UserCard key={user.id} user={user} onDelete={handleDeleteUser} />
              ))}
              {filteredUsers.length === 0 && (
                <Card className="empty-state neon-card">
                  <p>{userSearch || roleFilter ? 'Ничего не найдено' : 'Нет пользователей'}</p>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* ── TENDERS TAB ── */}
          <TabsContent value="tenders" className="tab-content">
            <div className="flex justify-end mb-4">
              <Button onClick={() => setCreateDialogOpen(true)} className="neon-button-filled">
                <Plus className="w-4 h-4 mr-2" />
                Создать тендер
              </Button>
            </div>
            <div className="tenders-list">
              {tenders.map((tender) => {
                const { label: statusLabel } = getStatusConfig(tender.status);
                return (
                  <Card key={tender.id} className="tender-card neon-card">
                    <div className="tender-header">
                      <div>
                        <h3 className="tender-title">{tender.title}</h3>
                        <p className="tender-meta">
                          {tender.tender_number} • Бюджет: {tender.budget?.toLocaleString()} ₸
                        </p>
                        <p className="tender-meta">Заказчик: {tender.customer_email}</p>
                      </div>
                      <span className={`status-badge status-${tender.status}`}>{statusLabel}</span>
                    </div>
                    <div className="card-actions">
                      <Button variant="outline" size="sm" onClick={() => navigate(`/tenders/${tender.id}`)}>
                        <Eye size={16} />
                        Просмотр
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDeleteTender(tender.id)}>
                        <Trash2 size={16} />
                        Удалить
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* ── CONTRACTS TAB ── */}
          <TabsContent value="contracts" className="tab-content">
            <div className="contracts-list">
              {contracts.map((contract) => {
                const { label: statusLabel } = getStatusConfig(contract.status);
                return (
                  <Card key={contract.id} className="contract-card neon-card">
                    <div className="contract-header">
                      <div>
                        <h3 className="contract-title">{contract.contract_number}</h3>
                        <p className="contract-meta">Тендер: {contract.tender_title}</p>
                        <p className="contract-meta">Сумма: {contract.total_amount?.toLocaleString()} ₸</p>
                      </div>
                      <span className={`status-badge status-${contract.status}`}>{statusLabel}</span>
                    </div>
                    <div className="card-actions">
                      <Button variant="outline" size="sm" onClick={() => navigate(`/contracts/${contract.id}`)}>
                        <Eye size={16} />
                        Просмотр
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDeleteContract(contract.id)}>
                        <Trash2 size={16} />
                        Удалить
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <CreateTenderDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={fetchAdminData}
      />

      <ConfirmDialog
        dialog={confirmDialog}
        onClose={() => setConfirmDialog(null)}
      />

      <RejectDialog
        dialog={rejectDialog}
        onClose={() => setRejectDialog(null)}
        reason={rejectReason}
        onReasonChange={setRejectReason}
        loading={rejectLoading}
        onConfirm={handleReject}
      />

      <style>{`
        .admin-panel-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 40px 24px;
        }

        .loading-container {
          display: flex;
          justify-content: center;
          padding: 100px 0;
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid var(--color-primary-bg);
          border-top-color: var(--color-primary);
          border-radius: 50%;
          animation: ap-spin 0.8s linear infinite;
        }

        @keyframes ap-spin { to { transform: rotate(360deg); } }

        .page-header { margin-bottom: 40px; }

        .page-title {
          font-size: var(--font-size-7xl);
          font-weight: var(--font-weight-bold);
          color: var(--color-text-dark) !important;
          margin-bottom: var(--space-2);
        }

        .page-subtitle {
          font-size: var(--font-size-lg);
          color: var(--color-text-dark3);
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 24px;
          margin-bottom: 40px;
        }

        .stat-card {
          display: flex;
          align-items: center;
          gap: 20px;
          padding: 24px;
        }

        .stat-icon {
          width: 60px;
          height: 60px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--color-success-tint-10);
          border: 2px solid var(--color-primary);
          border-radius: var(--radius-2xl);
          color: var(--color-primary);
          flex-shrink: 0;
        }

        .stat-icon.alert {
          background: rgba(255, 170, 0, 0.1);
          border-color: var(--color-warning);
          color: var(--color-warning);
        }

        .stat-label {
          font-size: var(--font-size-base);
          color: var(--color-text-dark3);
          margin-bottom: var(--space-1);
        }

        .stat-value {
          font-size: var(--font-size-6xl);
          font-weight: var(--font-weight-bold);
          color: var(--color-text-dark) !important;
        }

        .admin-tabs { width: 100%; }

        .tabs-list {
          background: var(--color-bg-warm);
          border: 1px solid var(--color-border);
          margin-bottom: var(--space-8);
        }

        .tab-content { min-height: 400px; }

        /* Search */
        .search-bar {
          margin-bottom: 20px;
          max-width: 360px;
        }

        /* Users toolbar: search + role filter */
        .users-toolbar {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 20px;
        }

        .users-search { max-width: 360px; }

        .role-filter-select {
          height: 36px;
          padding: 0 10px;
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          background: var(--color-bg-surface, #fff);
          color: var(--color-text-dark);
          font-size: var(--font-size-base);
          cursor: pointer;
          outline: none;
        }

        .role-filter-select:focus {
          border-color: var(--color-primary);
        }

        /* Empty state */
        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px 24px;
          text-align: center;
        }

        .empty-icon {
          color: var(--color-primary);
          margin-bottom: var(--space-4);
        }

        /* Verification */
        .verifications-list {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .verification-card { padding: 24px; }

        .verification-header { margin-bottom: 20px; }

        .user-email {
          font-size: var(--font-size-xl3);
          font-weight: var(--font-weight-semibold);
          color: var(--color-text-dark) !important;
          margin-bottom: var(--space-1-5);
        }

        .user-meta {
          font-size: var(--font-size-base);
          color: var(--color-text-dark3);
          text-transform: capitalize;
          margin-top: var(--space-1);
        }

        .documents-section {
          margin-bottom: var(--space-5);
          padding: var(--space-4);
          background: var(--color-success-tint-10);
          border-radius: var(--radius-lg);
        }

        .section-title {
          font-size: var(--font-size-lg);
          font-weight: var(--font-weight-semibold);
          color: var(--color-primary);
          margin-bottom: var(--space-3);
        }

        .no-documents {
          color: var(--color-text-dark3);
          font-size: var(--font-size-base);
        }

        .verification-actions {
          display: flex;
          justify-content: flex-end;
          gap: var(--space-3);
        }

        /* Users */
        .users-list {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .user-card { padding: 20px; }

        .user-info {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: var(--space-4);
          margin-bottom: var(--space-3);
        }

        .user-company {
          font-size: var(--font-size-xl3);
          font-weight: var(--font-weight-semibold);
          color: var(--color-text-dark) !important;
          margin-bottom: var(--space-1);
        }

        .user-email-secondary {
          font-size: var(--font-size-base);
          color: var(--color-text-muted);
          margin-bottom: var(--space-1);
        }

        .user-badges {
          display: flex;
          gap: var(--space-2);
          flex-wrap: wrap;
          flex-shrink: 0;
        }

        .role-badge {
          padding: var(--space-1-5) var(--space-3);
          background: var(--color-primary-bg);
          color: var(--color-secondary);
          border: 1px solid var(--color-secondary);
          border-radius: var(--radius-pill);
          font-size: var(--font-size-base);
          font-weight: var(--font-weight-semibold);
          white-space: nowrap;
        }

        .status-badge {
          padding: var(--space-1-5) var(--space-3);
          border-radius: var(--radius-pill);
          font-size: var(--font-size-base);
          font-weight: var(--font-weight-semibold);
          white-space: nowrap;
          border: 1px solid transparent;
        }

        /* Status color variants */
        .status-verified {
          background: var(--color-success-tint-10);
          color: var(--color-success-alt);
          border-color: var(--color-success-alt);
        }
        .status-pending {
          background: rgba(255, 170, 0, 0.1);
          color: var(--color-warning);
          border-color: var(--color-warning);
        }
        .status-rejected {
          background: var(--color-danger-tint-05);
          color: var(--color-danger-alt);
          border-color: var(--color-danger-tint-20);
        }
        .status-not_verified {
          background: var(--color-bg-muted);
          color: var(--color-text-placeholder);
          border-color: var(--color-border);
        }
        .status-draft {
          background: var(--color-bg-muted);
          color: var(--color-text-muted);
          border-color: var(--color-border);
        }
        .status-published,
        .status-published_receiving_proposals,
        .status-published_receiving_applications {
          background: rgba(59, 130, 246, 0.08);
          color: #2563eb;
          border-color: rgba(59, 130, 246, 0.3);
        }
        .status-active,
        .status-signed,
        .status-awarded {
          background: var(--color-success-tint-10);
          color: var(--color-success-alt);
          border-color: var(--color-success-alt);
        }
        .status-cancelled {
          background: var(--color-danger-tint-05);
          color: var(--color-danger-alt);
          border-color: var(--color-danger-tint-20);
        }
        .status-completed {
          background: var(--color-bg-muted);
          color: var(--color-text-muted);
          border-color: var(--color-border);
        }
        .status-under_review {
          background: rgba(255, 170, 0, 0.1);
          color: var(--color-warning);
          border-color: var(--color-warning);
        }

        /* Tenders & Contracts */
        .tenders-list,
        .contracts-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .tender-card,
        .contract-card { padding: 20px; }

        .tender-header,
        .contract-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 16px;
        }

        .tender-title,
        .contract-title {
          font-size: var(--font-size-lg);
          font-weight: var(--font-weight-semibold);
          color: var(--color-text-dark);
          margin-bottom: var(--space-2);
        }

        .tender-meta,
        .contract-meta {
          font-size: var(--font-size-base);
          color: var(--color-text-muted);
          margin: var(--space-1) 0;
        }

        .card-actions { display: flex; gap: var(--space-2); }

        @media (max-width: 768px) {
          .page-title           { font-size: var(--font-size-6xl); }
          .stats-grid           { grid-template-columns: repeat(2, 1fr); }
          .verification-actions { flex-direction: column; }
          .user-info            { flex-direction: column; }
          .users-toolbar        { flex-wrap: wrap; }
        }
      `}</style>
    </>
  );
};

export default AdminPanel;
