import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { AppContext } from '@/App';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Eye, Edit2, Trash2, Search } from 'lucide-react';
import { getContractStatusText } from '@/utils/statusHelpers';

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
        <div style={{ marginBottom: '30px' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '8px' }}>Управление договорами</h1>
          <p style={{ color: '#666' }}>Все договоры на платформе</p>
        </div>

        {/* Поиск */}
        <Card style={{ padding: '20px', marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Поиск</label>
          <div style={{ position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
            <Input
              placeholder="Поиск по номеру договора, тендеру или email"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '40px' }}
            />
          </div>
        </Card>

        {/* Список договоров */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filteredContracts.length === 0 ? (
            <Card style={{ padding: '40px', textAlign: 'center' }}>
              <p style={{ color: '#666' }}>Договоры не найдены</p>
            </Card>
          ) : (
            filteredContracts.map(contract => (
              <Card key={contract.id} style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '8px' }}>
                      {contract.contract_number}
                    </h3>
                    <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '4px' }}>
                      Тендер: {contract.tender_title}
                    </p>
                    <p style={{ color: '#666', fontSize: '0.9rem' }}>
                      Сумма: {contract.total_amount?.toLocaleString()} ₸
                    </p>
                  </div>
                  <span className={`status-badge status-${contract.status}`}>
                    {getContractStatusText(contract.status)}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                  <Button variant="outline" size="sm" onClick={() => navigate(`/contracts/${contract.id}`)}>
                    <Eye size={16} />
                    Просмотр
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => navigate(`/contracts/${contract.id}?mode=edit`)}>
                    <Edit2 size={16} />
                    Редактировать
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDelete(contract.id)} style={{ color: '#dc2626', borderColor: '#dc2626' }}>
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

export default AdminContracts;