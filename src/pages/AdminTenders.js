import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { AppContext } from '@/App';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Eye, Edit2, Trash2, Ban, Search, Plus } from 'lucide-react';
import { getTenderStatusText } from '@/utils/statusHelpers';

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
      <Layout>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}>
          <div className="loading-spinner"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '40px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '8px' }}>Управление тендерами</h1>
            <p style={{ color: '#666' }}>Все тендеры на платформе</p>
          </div>
          <Button onClick={() => navigate('/create-tender')} className="neon-button-filled">
            <Plus size={18} />
            Создать тендер
          </Button>
        </div>

        {/* Фильтры и поиск */}
        <Card style={{ padding: '20px', marginBottom: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Поиск</label>
              <div style={{ position: 'relative' }}>
                <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
                <Input
                  placeholder="Поиск по названию, номеру или email заказчика"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ paddingLeft: '40px' }}
                />
              </div>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Фильтр по заказчику</label>
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filteredTenders.length === 0 ? (
            <Card style={{ padding: '40px', textAlign: 'center' }}>
              <p style={{ color: '#666' }}>Тендеры не найдены</p>
            </Card>
          ) : (
            filteredTenders.map(tender => (
              <Card key={tender.id} style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '8px' }}>
                      {tender.title}
                    </h3>
                    <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '4px' }}>
                      {tender.tender_number} • Бюджет: {tender.budget?.toLocaleString()} ₸
                    </p>
                    <p style={{ color: '#666', fontSize: '0.9rem' }}>
                      Заказчик: {tender.customer_email}
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className={`status-badge status-${tender.status}`}>
                      {getTenderStatusText(tender.status)}
                    </span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                  <Button variant="outline" size="sm" onClick={() => navigate(`/tenders/${tender.id}`)}>
                    <Eye size={16} />
                    Просмотр
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => navigate(`/create-tender?id=${tender.id}&mode=edit`)}>
                    <Edit2 size={16} />
                    Редактировать
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDelete(tender.id)} style={{ color: '#dc2626', borderColor: '#dc2626' }}>
                    <Trash2 size={16} />
                    Удалить
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
};

export default AdminTenders;