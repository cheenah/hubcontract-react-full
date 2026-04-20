import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { AppContext } from '@/App';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Eye, Edit2, Trash2, Search } from 'lucide-react';
import { getContractStatusText } from '@/utils/statusHelpers';

const styles = `
  .admin-contracts-page {
    max-width: 1400px;
    margin: 0 auto;
    padding: var(--space-10) var(--space-6);
  }
  .admin-contracts-heading {
    margin-bottom: var(--space-7-5);
  }
  .admin-contracts-heading h1 {
    font-size: var(--font-size-6xl);
    font-weight: var(--font-weight-bold);
    margin-bottom: var(--space-2);
  }
  .admin-contracts-heading p {
    color: var(--color-text-muted);
  }
  .admin-contracts-search-card {
    padding: var(--space-5);
    margin-bottom: var(--space-5);
  }
  .admin-contracts-search-label {
    display: block;
    margin-bottom: var(--space-2);
    font-weight: var(--font-weight-semibold);
  }
  .admin-contracts-search-wrap {
    position: relative;
  }
  .admin-contracts-search-icon {
    position: absolute;
    left: var(--space-3);
    top: 50%;
    transform: translateY(-50%);
    color: var(--color-text-placeholder);
  }
  .admin-contracts-search-input {
    padding-left: 40px;
  }
  .admin-contracts-list {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
  }
  .admin-contracts-empty {
    padding: var(--space-10);
    text-align: center;
  }
  .admin-contracts-empty p {
    color: var(--color-text-muted);
  }
  .admin-contracts-item {
    padding: var(--space-5);
  }
  .admin-contracts-item-top {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
  }
  .admin-contracts-item-info {
    flex: 1;
  }
  .admin-contracts-item-info h3 {
    font-size: var(--font-size-xl3);
    font-weight: var(--font-weight-semibold);
    margin-bottom: var(--space-2);
  }
  .admin-contracts-item-info .meta {
    color: var(--color-text-muted);
    font-size: var(--font-size-base);
    margin-bottom: var(--space-1);
  }
  .admin-contracts-item-info .meta:last-child {
    margin-bottom: 0;
  }
  .admin-contracts-actions {
    display: flex;
    gap: var(--space-2);
    margin-top: var(--space-4);
  }
  .admin-contracts-btn-delete {
    color: var(--color-danger-alt);
    border-color: var(--color-danger-alt);
  }
  .admin-contracts-loading {
    display: flex;
    justify-content: center;
    padding: 100px;
  }
`;

const AdminContracts = () => {
  const { API } = React.useContext(AppContext);
  const navigate = useNavigate();
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchContracts();
  }, []);

  const fetchContracts = async () => {
    try {
      const res = await axios.get(`${API}/admin/contracts`);
      setContracts(res.data);
    } catch (error) {
      toast.error('Ошибка загрузки договоров');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (contractId) => {
    if (!window.confirm('Вы уверены что хотите удалить этот договор?')) return;
    
    try {
      await axios.delete(`${API}/admin/contracts/${contractId}`);
      toast.success('Договор удален');
      fetchContracts();
    } catch (error) {
      toast.error('Ошибка удаления');
    }
  };

  const filteredContracts = contracts.filter(contract => 
    contract.contract_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contract.tender_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contract.customer_email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
        <div className="admin-contracts-loading">
          <div className="loading-spinner"></div>
        </div>
    );
  }

  return (
      <>
        <style>{styles}</style>
        <div className="admin-contracts-page">
          <div className="admin-contracts-heading">
            <h1>Управление договорами</h1>
            <p>Все договоры на платформе</p>
          </div>

          {/* Поиск */}
          <Card className="admin-contracts-search-card">
            <label className="admin-contracts-search-label">Поиск</label>
            <div className="admin-contracts-search-wrap">
              <Search size={18} className="admin-contracts-search-icon" />
              <Input
                placeholder="Поиск по номеру договора, тендеру или email"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="admin-contracts-search-input"
              />
            </div>
          </Card>

          {/* Список договоров */}
          <div className="admin-contracts-list">
            {filteredContracts.length === 0 ? (
              <Card className="admin-contracts-empty">
                <p>Договоры не найдены</p>
              </Card>
            ) : (
              filteredContracts.map(contract => (
                <Card key={contract.id} className="admin-contracts-item">
                  <div className="admin-contracts-item-top">
                    <div className="admin-contracts-item-info">
                      <h3>{contract.contract_number}</h3>
                      <p className="meta">Тендер: {contract.tender_title}</p>
                      <p className="meta">Сумма: {contract.total_amount?.toLocaleString()} ₸</p>
                    </div>
                    <span className={`status-badge status-${contract.status}`}>
                      {getContractStatusText(contract.status)}
                    </span>
                  </div>
                  <div className="admin-contracts-actions">
                    <Button variant="outline" size="sm" onClick={() => navigate(`/contracts/${contract.id}`)}>
                      <Eye size={16} />
                      Просмотр
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => navigate(`/contracts/${contract.id}?mode=edit`)}>
                      <Edit2 size={16} />
                      Редактировать
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDelete(contract.id)} className="admin-contracts-btn-delete">
                      <Trash2 size={16} />
                      Удалить
                    </Button>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      </>
  );
};

export default AdminContracts;