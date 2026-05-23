import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import useAuthStore from '@/store/authStore';
import { BASE_URL as API } from '@/services/api';
import { Search, FileText, CheckCircle, Clock, FileSignature, Ban } from 'lucide-react';
import { toast } from 'sonner';

const Contracts = () => {
  const navigate = useNavigate();
  const user = useAuthStore(s => s.user);
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchContracts();
  }, []);

  const fetchContracts = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('=== FETCHING CONTRACTS ===');
      console.log('Token:', token ? 'Present' : 'Missing');
      console.log('API URL:', `${API}/contracts`);
      
      const response = await axios.get(`${API}/contracts`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      console.log('Response status:', response.status);
      console.log('Fetched contracts:', response.data);
      console.log('Number of contracts:', response.data.length);
      console.log('Current user:', user);
      
      if (response.data.length > 0) {
        response.data.forEach((contract, idx) => {
          console.log(`Contract ${idx + 1}:`, {
            id: contract.id,
            number: contract.contract_number,
            status: contract.status,
            customer_id: contract.customer_id,
            contractor_id: contract.contractor_id,
            customer_name: contract.customer_name,
            contractor_name: contract.contractor_name
          });
        });
      }
      
      setContracts(response.data);
    } catch (error) {
      console.error('Error fetching contracts:', error);
      console.error('Error details:', error.response?.data);
      toast.error('Ошибка при загрузке договоров');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      draft: { text: 'Черновик', bg: 'var(--color-bg-muted)', color: 'var(--color-text-placeholder)', icon: <FileText size={14} /> },
      pending_approval: { text: 'На согласовании', bg: 'var(--color-bg-muted)', color: 'var(--color-warning)', icon: <Clock size={14} /> },
      approved: { text: 'Согласован', bg: 'var(--color-primary-bg)', color: 'var(--color-primary-light)', icon: <CheckCircle size={14} /> },
      pending_signature: { text: 'На подписании', bg: 'var(--color-primary-bg)', color: 'var(--color-primary)', icon: <FileSignature size={14} /> },
      signed: { text: 'Подписан', bg: 'var(--color-success-tint-10)', color: 'var(--color-success-alt)', icon: <CheckCircle size={14} /> },
      active: { text: 'Действующий', bg: 'var(--color-success-tint-10)', color: 'var(--color-success-mid)', icon: <CheckCircle size={14} /> },
      terminated: { text: 'Расторгнут', bg: 'var(--color-danger-tint-10)', color: 'var(--color-danger)', icon: <Ban size={14} /> }
    };
    return badges[status] || badges.draft;
  };

  const filteredContracts = contracts.filter(contract => {
    const matchesSearch = 
      contract.contract_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.tender_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.contractor_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.customer_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || contract.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: contracts.length,
    draft: contracts.filter(c => c.status === 'draft').length,
    pending: contracts.filter(c => c.status === 'pending_approval' || c.status === 'pending_signature').length,
    active: contracts.filter(c => c.status === 'active' || c.status === 'signed').length,
  };

  if (loading) {
    return (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Загрузка договоров...</p>
        </div>
    );
  }

  return (
      <div className="contracts-page">
        <div className="page-header">
          <div>
            <h1 className="page-title">Мои договора</h1>
            <p className="page-subtitle">Управление договорами о государственных закупках</p>
          </div>
        </div>

        {/* Stats */}
        <div className="stats-grid">
          <Card className="stat-card">
            <span className="stat-label">Всего</span>
            <span className="stat-value">{stats.total}</span>
          </Card>
          <Card className="stat-card">
            <span className="stat-label">Черновики</span>
            <span className="stat-value">{stats.draft}</span>
          </Card>
          <Card className="stat-card">
            <span className="stat-label">На согласовании</span>
            <span className="stat-value">{stats.pending}</span>
          </Card>
          <Card className="stat-card">
            <span className="stat-label">Действующие</span>
            <span className="stat-value">{stats.active}</span>
          </Card>
        </div>

        {/* Filters */}
        <Card className="filters-card">
          <div className="search-box">
            <Search size={20} />
            <Input
              placeholder="Поиск по номеру, тендеру..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="filter-buttons">
            {['all', 'draft', 'pending_approval', 'active'].map(status => (
              <Button
                key={status}
                variant={filterStatus === status ? 'default' : 'outline'}
                onClick={() => setFilterStatus(status)}
                size="sm"
              >
                {status === 'all' ? 'Все' : status === 'draft' ? 'Черновики' : status === 'pending_approval' ? 'На согласовании' : 'Действующие'}
              </Button>
            ))}
          </div>
        </Card>

        {/* Table */}
        {filteredContracts.length === 0 ? (
          <Card className="empty-state">
            <FileText size={48} />
            <p>Нет договоров</p>
          </Card>
        ) : (
          <Card className="table-card">
            <table>
              <thead>
                <tr>
                  <th>Номер</th>
                  <th>Тендер</th>
                  <th>Сумма (₸)</th>
                  <th>{user?.role === 'customer' ? 'Исполнитель' : 'Заказчик'}</th>
                  <th>Статус</th>
                  <th>Дата</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filteredContracts.map((contract) => {
                  const statusBadge = getStatusBadge(contract.status);
                  
                  return (
                    <tr key={contract.id}>
                      <td className="font-semibold">{contract.contract_number}</td>
                      <td>{contract.tender_title}</td>
                      <td>{contract.contract_amount?.toLocaleString()}</td>
                      <td>{user?.role === 'customer' ? contract.contractor_name : contract.customer_name}</td>
                      <td>
                        <span className="status-badge" style={{ background: statusBadge.bg, color: statusBadge.color }}>
                          {statusBadge.icon}
                          {statusBadge.text}
                        </span>
                      </td>
                      <td>{new Date(contract.created_at).toLocaleDateString('ru-RU')}</td>
                      <td>
                        <Button size="sm" variant="outline" onClick={() => navigate(`/contracts/${contract.id}`)}>
                          Открыть
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Card>
        )}

        <style jsx>{`
          .contracts-page { padding: var(--space-6); max-width: 1400px; margin: 0 auto; }
          .page-title { font-size: var(--font-size-6xl); font-weight: var(--font-weight-bold); margin: 0; }
          .page-subtitle { color: var(--color-text-muted); margin-top: var(--space-1); }
          .page-header { margin-bottom: var(--space-6); }
          .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: var(--space-4); margin-bottom: var(--space-6); }
          .stat-card { padding: var(--space-5); display: flex; flex-direction: column; gap: var(--space-2); }
          .stat-label { font-size: var(--font-size-base); color: var(--color-text-muted); }
          .stat-value { font-size: var(--font-size-6xl); font-weight: var(--font-weight-bold); }
          .filters-card { padding: var(--space-4); margin-bottom: var(--space-6); display: flex; gap: var(--space-4); flex-wrap: wrap; }
          .search-box { flex: 1; display: flex; align-items: center; gap: var(--space-3); min-width: 300px; }
          .filter-buttons { display: flex; gap: var(--space-2); }
          .table-card { overflow-x: auto; }
          table { width: 100%; border-collapse: collapse; }
          th { text-align: left; padding: var(--space-3) var(--space-4); font-weight: var(--font-weight-semibold); color: var(--color-text-muted); font-size: var(--font-size-base); border-bottom: 2px solid var(--color-border); }
          td { padding: var(--space-4); border-bottom: 1px solid var(--color-bg-muted); }
          tr:hover { background: var(--color-bg-subtle); }
          .status-badge { display: inline-flex; align-items: center; gap: var(--space-1-5); padding: var(--space-1-5) var(--space-3); border-radius: var(--radius-md); font-size: var(--font-size-base); font-weight: var(--font-weight-medium); }
          .empty-state { padding: var(--space-15); text-align: center; color: var(--color-text-placeholder); }
          .loading-container { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 400px; gap: var(--space-4); }
          .spinner { width: 40px; height: 40px; border: 4px solid var(--color-bg-muted); border-top-color: var(--color-primary-light); border-radius: var(--radius-circle); animation: spin 1s linear infinite; }
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
      </div>
  );
};

export default Contracts;
