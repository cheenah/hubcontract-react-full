import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { AppContext } from '@/App';
import { useLanguage } from '@/context/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, FileText, CheckCircle, XCircle, FileContract, Edit, Trash2, Eye, Play, Ban, ExternalLink } from 'lucide-react';

// Русские названия документов, загружаемых в CompleteRegistration
const DOCUMENT_LABELS = {
  registration_certificate:   'Свидетельство о регистрации',
  tax_clearance:              'Справка об отсутствии задолженностей',
  director_id_doc:            'Документы директора',
  director_appointment_order: 'Приказ о назначении директора',
  company_charter:            'Устав компании',
};

const AdminPanel = () => {
  const { API } = React.useContext(AppContext);
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [tenders, setTenders] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      const [statsRes, usersRes, pendingRes, tendersRes, contractsRes] = await Promise.all([
        axios.get(`${API}/admin/stats`),
        axios.get(`${API}/admin/users`),
        axios.get(`${API}/documents/verification-pending`),
        axios.get(`${API}/tenders`),
        axios.get(`${API}/contracts`)
      ]);
      
      setStats(statsRes.data);
      setUsers(usersRes.data);
      setPendingUsers(pendingRes.data);
      setTenders(tendersRes.data);
      setContracts(contractsRes.data);
    } catch (error) {
      toast.error('Ошибка загрузки данных админ-панели');
    } finally {
      setLoading(false);
    }
  };

  const handleVerification = async (userId, approved) => {
    try {
      await axios.post(`${API}/documents/verify/${userId}`, null, {
        params: { approved }
      });
      toast.success(`Пользователь ${approved ? 'одобрен' : 'отклонен'}`);
      fetchAdminData();
    } catch (error) {
      toast.error('Ошибка верификации');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Вы уверены что хотите удалить этого пользователя?')) return;
    
    try {
      await axios.delete(`${API}/users/${userId}`);
      toast.success('Пользователь удален');
      fetchAdminData();
    } catch (error) {
      toast.error('Ошибка удаления пользователя');
    }
  };

  const handleDeleteTender = async (tenderId) => {
    if (!window.confirm('Вы уверены что хотите удалить этот тендер?')) return;
    
    try {
      await axios.delete(`${API}/tenders/${tenderId}`);
      toast.success('Тендер удален');
      fetchAdminData();
    } catch (error) {
      toast.error('Ошибка удаления тендера');
    }
  };

  const handleDeleteContract = async (contractId) => {
    if (!window.confirm('Вы уверены что хотите удалить этот договор?')) return;
    
    try {
      await axios.delete(`${API}/contracts/${contractId}`);
      toast.success('Договор удален');
      fetchAdminData();
    } catch (error) {
      toast.error('Ошибка удаления договора');
    }
  };

  if (loading) {
    return (
        <div className="loading-container">
          <div className="loading-spinner"></div>
        </div>
    );
  }

  return (
    <>
      <div className="admin-panel-container" data-testid="admin-panel">
        <div className="page-header">
          <h1 className="page-title">Панель администратора</h1>
          <p className="page-subtitle">Полное управление платформой</p>
        </div>

        {/* Stats Overview */}
        {stats && (
          <div className="stats-grid">
            <Card className="stat-card neon-card">
              <div className="stat-icon">
                <Users size={24} />
              </div>
              <div>
                <p className="stat-label">Всего пользователей</p>
                <p className="stat-value" data-testid="admin-total-users">{stats.total_users}</p>
              </div>
            </Card>
            <Card className="stat-card neon-card">
              <div className="stat-icon">
                <FileText size={24} />
              </div>
              <div>
                <p className="stat-label">Всего тендеров</p>
                <p className="stat-value" data-testid="admin-total-tenders">{stats.total_tenders}</p>
              </div>
            </Card>
            <Card className="stat-card neon-card">
              <div className="stat-icon">
                <CheckCircle size={24} />
              </div>
              <div>
                <p className="stat-label">Активных тендеров</p>
                <p className="stat-value" data-testid="admin-active-tenders">{stats.active_tenders}</p>
              </div>
            </Card>
            <Card className="stat-card neon-card">
              <div className="stat-icon alert">
                <XCircle size={24} />
              </div>
              <div>
                <p className="stat-label">Ожидают верификации</p>
                <p className="stat-value" data-testid="admin-pending-verifications">{stats.pending_verifications}</p>
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

          {/* Verification Tab */}
          <TabsContent value="verifications" className="tab-content">{pendingUsers.length === 0 ? (
              <Card className="empty-state neon-card">
                <CheckCircle size={48} className="empty-icon" />
                <p>Нет ожидающих верификации</p>
              </Card>
            ) : (
              <div className="verifications-list">
                {pendingUsers.map((user) => (
                  <Card key={user.id} className="verification-card neon-card" data-testid={`verification-${user.id}`}>
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
                      {/* Список документов: каждый показывает иконку, название, имя файла, дату и кнопку просмотра */}
                      <div className="flex flex-col gap-2">
                        {user.documents && Object.keys(user.documents).length > 0 ? (
                          Object.entries(user.documents).map(([key, doc]) => {
                            // label — читаемое название документа из константы или fallback
                            const label = DOCUMENT_LABELS[key] || key.replace(/_/g, ' ');
                            // viewUrl — URL для открытия документа в новой вкладке
                            const viewUrl = doc?.url || doc?.file_url;
                            return (
                              <div
                                key={key}
                                className="flex items-center justify-between gap-3 p-3 rounded-lg bg-[var(--color-bg-surface)] border border-[var(--color-border)]"
                              >
                                {/* Иконка + название + метаданные файла */}
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

                                {/* Статус загружен + кнопка просмотра */}
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
                      {/* Кнопка открывает страницу детального просмотра компании с документами */}
                      <Button
                        variant="outline"
                        onClick={() => navigate(`/admin/verification/${user.id}`)}
                      >
                        <Eye size={18} />
                        Подробнее
                      </Button>
                      <Button
                        onClick={() => handleVerification(user.id, false)}
                        variant="outline"
                        className="reject-btn"
                        data-testid={`reject-btn-${user.id}`}
                      >
                        <XCircle size={18} />
                        Отклонить
                      </Button>
                      <Button
                        onClick={() => handleVerification(user.id, true)}
                        className="neon-button-filled"
                        data-testid={`approve-btn-${user.id}`}
                      >
                        <CheckCircle size={18} />
                        Одобрить
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="tab-content">
            <div className="users-list">
              {users.map((user) => (
                <Card key={user.id} className="user-card neon-card" data-testid={`user-${user.id}`}>
                  <div className="user-info">
                    <div>
                      <h3 className="user-email">{user.email}</h3>
                      <p className="user-meta">
                        {user.company_name || 'Без названия'} • БИН: {user.company_bin}
                      </p>
                    </div>
                    <div className="user-badges">
                      <span className="role-badge">{user.role}</span>
                      <span className={`status-badge status-${user.verification_status}`}>
                        {user.verification_status}
                      </span>
                    </div>
                  </div>
                  <div className="card-actions">
                    <Button variant="outline" size="sm" onClick={() => navigate(`/profile?userId=${user.id}`)}>
                      <Eye size={16} />
                      Просмотр
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDeleteUser(user.id)} className="delete-btn">
                      <Trash2 size={16} />
                      Удалить
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Tenders Tab */}
          <TabsContent value="tenders" className="tab-content">
            <div className="tenders-list">
              {tenders.map((tender) => (
                <Card key={tender.id} className="tender-card neon-card">
                  <div className="tender-header">
                    <div>
                      <h3 className="tender-title">{tender.title}</h3>
                      <p className="tender-meta">
                        {tender.tender_number} • Бюджет: {tender.budget?.toLocaleString()} ₸
                      </p>
                      <p className="tender-meta">
                        Заказчик: {tender.customer_email}
                      </p>
                    </div>
                    <span className={`status-badge status-${tender.status}`}>
                      {tender.status}
                    </span>
                  </div>
                  <div className="card-actions">
                    <Button variant="outline" size="sm" onClick={() => navigate(`/tenders/${tender.id}`)}>
                      <Eye size={16} />
                      Просмотр
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDeleteTender(tender.id)} className="delete-btn">
                      <Trash2 size={16} />
                      Удалить
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Contracts Tab */}
          <TabsContent value="contracts" className="tab-content">
            <div className="contracts-list">
              {contracts.map((contract) => (
                <Card key={contract.id} className="contract-card neon-card">
                  <div className="contract-header">
                    <div>
                      <h3 className="contract-title">{contract.contract_number}</h3>
                      <p className="contract-meta">
                        Тендер: {contract.tender_title}
                      </p>
                      <p className="contract-meta">
                        Сумма: {contract.total_amount?.toLocaleString()} ₸
                      </p>
                    </div>
                    <span className={`status-badge status-${contract.status}`}>
                      {contract.status}
                    </span>
                  </div>
                  <div className="card-actions">
                    <Button variant="outline" size="sm" onClick={() => navigate(`/contracts/${contract.id}`)}>
                      <Eye size={16} />
                      Просмотр
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDeleteContract(contract.id)} className="delete-btn">
                      <Trash2 size={16} />
                      Удалить
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <style jsx>{`
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

        .page-header {
          margin-bottom: 40px;
        }

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

        .admin-tabs {
          width: 100%;
        }

        .tabs-list {
          background: var(--color-bg-warm);
          border: 1px solid var(--color-border);
          margin-bottom: var(--space-8);
        }

        .tab-content {
          min-height: 400px;
        }

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

        .verifications-list, .users-list {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .verification-card, .user-card {
          padding: 24px;
        }

        .verification-header {
          margin-bottom: 20px;
        }

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

        .documents-grid {
          display: flex;
          flex-wrap: wrap;
          gap: var(--space-3);
        }

        .document-badge {
          display: flex;
          align-items: center;
          gap: var(--space-1-5);
          padding: var(--space-1-5) var(--space-3);
          background: var(--color-primary-bg);
          border: 1px solid var(--color-primary);
          border-radius: var(--radius-pill);
          font-size: var(--font-size-base);
          color: var(--color-primary);
          text-transform: capitalize;
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

        .reject-btn {
          color: var(--color-danger);
          border-color: var(--color-danger);
        }

        .reject-btn:hover {
          background: var(--color-danger-tint-10);
        }

        .user-info {
          display: flex;
          justify-content: space-between;
          align-items: start;
          gap: var(--space-4);
        }

        .user-badges {
          display: flex;
          gap: var(--space-2);
          flex-wrap: wrap;
        }

        .role-badge {
          padding: var(--space-1-5) var(--space-3);
          background: var(--color-primary-bg);
          color: var(--color-secondary);
          border: 1px solid var(--color-secondary);
          border-radius: var(--radius-pill);
          font-size: var(--font-size-base);
          font-weight: var(--font-weight-semibold);
          text-transform: capitalize;
        }

        @media (max-width: 768px) {
          .page-title {
            font-size: var(--font-size-6xl);
          }

          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .verification-actions {
            flex-direction: column;
          }

          .user-info {
            flex-direction: column;
          }
        }

        /* New styles for tenders and contracts tabs */
        .tenders-list,
        .contracts-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .tender-card,
        .contract-card {
          padding: 20px;
        }

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

        .card-actions {
          display: flex;
          gap: var(--space-2);
          margin-top: var(--space-3);
        }

        .delete-btn {
          color: var(--color-danger-alt);
          border-color: var(--color-danger-alt);
        }

        .delete-btn:hover {
          background: var(--color-danger-tint-10);
          border-color: var(--color-danger-alt);
        }
      `}</style>
    </>
  );
};

export default AdminPanel;