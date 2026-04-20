import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { AppContext } from '@/App';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Eye, Edit2, Trash2, Ban, Search, Plus } from 'lucide-react';
import { getTenderStatusText } from '@/utils/statusHelpers';

const styles = `
  .admin-tenders-loading {
    display: flex;
    justify-content: center;
    padding: 100px;
  }
  .admin-tenders-page {
    max-width: 1400px;
    margin: 0 auto;
    padding: var(--space-10) var(--space-6);
  }
  .admin-tenders-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--space-7-5);
  }
  .admin-tenders-header h1 {
    font-size: var(--font-size-6xl);
    font-weight: var(--font-weight-bold);
    margin-bottom: var(--space-2);
  }
  .admin-tenders-header p {
    color: var(--color-text-muted);
  }
  .admin-tenders-filters {
    padding: var(--space-5);
    margin-bottom: var(--space-5);
  }
  .admin-tenders-filters-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--space-4);
  }
  .admin-tenders-filter-label {
    display: block;
    margin-bottom: var(--space-2);
    font-weight: var(--font-weight-semibold);
  }
  .admin-tenders-search-wrap {
    position: relative;
  }
  .admin-tenders-search-icon {
    position: absolute;
    left: var(--space-3);
    top: 50%;
    transform: translateY(-50%);
    color: var(--color-text-placeholder);
  }
  .admin-tenders-search-input {
    padding-left: 40px;
  }
  .admin-tenders-list {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
  }
  .admin-tenders-empty {
    padding: var(--space-10);
    text-align: center;
  }
  .admin-tenders-empty p {
    color: var(--color-text-muted);
  }
  .admin-tenders-item {
    padding: var(--space-5);
  }
  .admin-tenders-item-top {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
  }
  .admin-tenders-item-info {
    flex: 1;
  }
  .admin-tenders-item-info h3 {
    font-size: var(--font-size-xl3);
    font-weight: var(--font-weight-semibold);
    margin-bottom: var(--space-2);
  }
  .admin-tenders-item-info .meta {
    color: var(--color-text-muted);
    font-size: var(--font-size-base);
    margin-bottom: var(--space-1);
  }
  .admin-tenders-item-info .meta:last-child {
    margin-bottom: 0;
  }
  .admin-tenders-item-status {
    display: flex;
    align-items: center;
    gap: var(--space-2);
  }
  .admin-tenders-actions {
    display: flex;
    gap: var(--space-2);
    margin-top: var(--space-4);
  }
  .admin-tenders-btn-delete {
    color: var(--color-danger-alt);
    border-color: var(--color-danger-alt);
  }
`;

const AdminTenders = () => {
  const { API } = React.useContext(AppContext);
  const navigate = useNavigate();
  const [tenders, setTenders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCustomer, setFilterCustomer] = useState('');

  useEffect(() => {
    fetchData();
  }, [filterCustomer]);

  const fetchData = async () => {
    try {
      const customerRes = await axios.get(`${API}/admin/customers`);
      setCustomers(customerRes.data);

      const params = {};
      if (filterCustomer) params.customer_id = filterCustomer;
      
      const tendersRes = await axios.get(`${API}/tenders`, { params });
      setTenders(tendersRes.data);
    } catch (error) {
      toast.error('Ошибка загрузки данных');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (tenderId) => {
    if (!window.confirm('Вы уверены что хотите удалить этот тендер?')) return;
    
    try {
      await axios.delete(`${API}/admin/tenders/${tenderId}`);
      toast.success('Тендер удален');
      fetchData();
    } catch (error) {
      toast.error('Ошибка удаления');
    }
  };

  const filteredTenders = tenders.filter(tender => 
    tender.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tender.tender_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tender.customer_email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
        <div className="admin-tenders-loading">
          <div className="loading-spinner"></div>
        </div>
    );
  }

  return (
      <>
        <style>{styles}</style>
        <div className="admin-tenders-page">
          <div className="admin-tenders-header">
            <div>
              <h1>Управление тендерами</h1>
              <p>Все тендеры на платформе</p>
            </div>
            <Button onClick={() => navigate('/create-tender')} className="neon-button-filled">
              <Plus size={18} />
              Создать тендер
            </Button>
          </div>

          {/* Фильтры и поиск */}
          <Card className="admin-tenders-filters">
            <div className="admin-tenders-filters-grid">
              <div>
                <label className="admin-tenders-filter-label">Поиск</label>
                <div className="admin-tenders-search-wrap">
                  <Search size={18} className="admin-tenders-search-icon" />
                  <Input
                    placeholder="Поиск по названию, номеру или email заказчика"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="admin-tenders-search-input"
                  />
                </div>
              </div>
              <div>
                <label className="admin-tenders-filter-label">Фильтр по заказчику</label>
                <Select value={filterCustomer || 'all'} onValueChange={(val) => setFilterCustomer(val === 'all' ? '' : val)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Все заказчики" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все заказчики</SelectItem>
                    {customers.map(customer => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.company_name || customer.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>

          {/* Список тендеров */}
          <div className="admin-tenders-list">
            {filteredTenders.length === 0 ? (
              <Card className="admin-tenders-empty">
                <p>Тендеры не найдены</p>
              </Card>
            ) : (
              filteredTenders.map(tender => (
                <Card key={tender.id} className="admin-tenders-item">
                  <div className="admin-tenders-item-top">
                    <div className="admin-tenders-item-info">
                      <h3>{tender.title}</h3>
                      <p className="meta">{tender.tender_number} • Бюджет: {tender.budget?.toLocaleString()} ₸</p>
                      <p className="meta">Заказчик: {tender.customer_email}</p>
                    </div>
                    <div className="admin-tenders-item-status">
                      <span className={`status-badge status-${tender.status}`}>
                        {getTenderStatusText(tender.status)}
                      </span>
                    </div>
                  </div>
                  <div className="admin-tenders-actions">
                    <Button variant="outline" size="sm" onClick={() => navigate(`/tenders/${tender.id}`)}>
                      <Eye size={16} />
                      Просмотр
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => navigate(`/create-tender?id=${tender.id}&mode=edit`)}>
                      <Edit2 size={16} />
                      Редактировать
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDelete(tender.id)} className="admin-tenders-btn-delete">
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

export default AdminTenders;