import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Layout from '../components/Layout';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { AppContext } from '../App';
import { Search, FileText, CheckCircle, Clock, FileSignature, Ban } from 'lucide-react';
import { toast } from 'sonner';

const Contracts = () => {
  const navigate = useNavigate();
  const { user, API } = useContext(AppContext);
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
      draft: { text: 'Черновик', color: '#9ca3af', icon: <FileText size={14} /> },
      pending_approval: { text: 'На согласовании', color: '#f59e0b', icon: <Clock size={14} /> },
      approved: { text: 'Согласован', color: '#3b82f6', icon: <CheckCircle size={14} /> },
      pending_signature: { text: 'На подписании', color: '#8b5cf6', icon: <FileSignature size={14} /> },
      signed: { text: 'Подписан', color: '#10b981', icon: <CheckCircle size={14} /> },
      active: { text: 'Действующий', color: '#16a34a', icon: <CheckCircle size={14} /> },
      terminated: { text: 'Расторгнут', color: '#ef4444', icon: <Ban size={14} /> }
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
      <Layout>
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Загрузка договоров...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
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
                        <span className="status-badge" style={{ background: `${statusBadge.color}20`, color: statusBadge.color }}>
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
          .contracts-page { padding: 24px; max-width: 1400px; margin: 0 auto; }
          .page-title { font-size: 2rem; font-weight: 700; margin: 0; }
          .page-subtitle { color: #666; margin-top: 4px; }
          .page-header { margin-bottom: 24px; }
          .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
          .stat-card { padding: 20px; display: flex; flex-direction: column; gap: 8px; }
          .stat-label { font-size: 0.875rem; color: #666; }
          .stat-value { font-size: 2rem; font-weight: 700; }
          .filters-card { padding: 16px; margin-bottom: 24px; display: flex; gap: 16px; flex-wrap: wrap; }
          .search-box { flex: 1; display: flex; align-items: center; gap: 12px; min-width: 300px; }
          .filter-buttons { display: flex; gap: 8px; }
          .table-card { overflow-x: auto; }
          table { width: 100%; border-collapse: collapse; }
          th { text-align: left; padding: 12px 16px; font-weight: 600; color: #666; font-size: 0.875rem; border-bottom: 2px solid #e5e7eb; }
          td { padding: 16px; border-bottom: 1px solid #f3f4f6; }
          tr:hover { background: #f9fafb; }
          .status-badge { display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; border-radius: 6px; font-size: 0.875rem; font-weight: 500; }
          .empty-state { padding: 60px; text-align: center; color: #9ca3af; }
          .loading-container { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 400px; gap: 16px; }
          .spinner { width: 40px; height: 40px; border: 4px solid #f3f4f6; border-top-color: #3b82f6; border-radius: 50%; animation: spin 1s linear infinite; }
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
      </div>
    </Layout>
  );
};

export default Contracts;
