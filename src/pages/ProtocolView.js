import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import { AppContext } from '@/App';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FileText, Award, DollarSign, Users, Calendar } from 'lucide-react';

const ProtocolView = () => {
  const { tenderId } = useParams();
  const navigate = useNavigate();
  const { API } = React.useContext(AppContext);
  const [protocol, setProtocol] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProtocol();
  }, [tenderId]);

  const fetchProtocol = async () => {
    try {
      // Use public endpoint for protocol access
      const response = await axios.get(`${API}/public/protocols/tender/${tenderId}`);
      setProtocol(response.data);
    } catch (error) {
      console.error('Error fetching protocol:', error);
      toast.error(error.response?.data?.detail || 'Ошибка при загрузке протокола');
      navigate('/tenders');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}>
          <div className="loading-spinner"></div>
        </div>
      </Layout>
    );
  }

  if (!protocol) {
    return (
      <Layout>
        <div className="container" style={{ padding: '40px', textAlign: 'center' }}>
          <h2>Протокол не найден</h2>
          <Button onClick={() => navigate('/tenders')} style={{ marginTop: '20px' }}>
            Вернуться к тендерам
          </Button>
        </div>
      </Layout>
    );
  }

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'completed':
        return 'status-badge status-closed';
      case 'failed':
        return 'status-badge status-cancelled';
      case 'single_source':
        return 'status-badge status-active';
      default:
        return 'status-badge';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed':
        return 'Закупка состоялась';
      case 'failed':
        return 'Закупка не состоялась';
      case 'single_source':
        return 'Закупка из одного источника';
      default:
        return status;
    }
  };

  return (
    <Layout>
      <div className="container" style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
        <Button 
          variant="outline" 
          onClick={() => navigate(`/tenders/${protocol.tender_id}`)}
          style={{ marginBottom: '20px' }}
        >
          ← Вернуться к тендеру
        </Button>

        <Card style={{ padding: '30px', marginBottom: '30px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
            <FileText size={32} color="#1e40af" />
            <div>
              <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '5px' }}>
                Протокол итогов закупки
              </h1>
              <p style={{ color: '#666', fontSize: '14px' }}>
                Тендер №{protocol.tender_number}
              </p>
            </div>
          </div>

          <div className={getStatusBadgeClass(protocol.status)} style={{ display: 'inline-block', marginBottom: '20px' }}>
            {getStatusText(protocol.status)}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginTop: '20px' }}>
            <div style={{ padding: '15px', background: '#f8f9fa', borderRadius: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <Calendar size={20} color="#1e40af" />
                <span style={{ fontWeight: '600' }}>Дата закрытия</span>
              </div>
              <p style={{ fontSize: '14px', color: '#666' }}>
                {new Date(protocol.created_at).toLocaleString('ru-RU')}
              </p>
            </div>

            <div style={{ padding: '15px', background: '#f8f9fa', borderRadius: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <Users size={20} color="#1e40af" />
                <span style={{ fontWeight: '600' }}>Всего заявок</span>
              </div>
              <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#1e40af' }}>
                {protocol.total_bids}
              </p>
            </div>

            <div style={{ padding: '15px', background: '#f8f9fa', borderRadius: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <Award size={20} color="#16a34a" />
                <span style={{ fontWeight: '600' }}>Квалифицировано</span>
              </div>
              <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#16a34a' }}>
                {protocol.stage1_passed}
              </p>
            </div>
          </div>
        </Card>

        <Card style={{ padding: '30px', marginBottom: '30px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '15px' }}>
            Название тендера
          </h2>
          <p style={{ color: '#333', fontSize: '16px' }}>{protocol.tender_title}</p>

          {protocol.reason && (
            <div style={{ marginTop: '20px', padding: '15px', background: '#f0f9ff', borderLeft: '4px solid #1e40af', borderRadius: '4px' }}>
              <strong>Причина:</strong> {protocol.reason}
            </div>
          )}
        </Card>

        {protocol.winner_id && (
          <Card style={{ padding: '30px', marginBottom: '30px', background: '#f0fdf4', border: '2px solid #16a34a' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
              <Award size={28} color="#16a34a" />
              <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#16a34a' }}>
                Победитель закупки
              </h2>
            </div>
            {protocol.bids_details && protocol.bids_details.find(b => b.status === 'winner') && (
              <div>
                <p style={{ fontSize: '16px', marginBottom: '10px' }}>
                  <strong>Компания:</strong>{' '}
                  {protocol.bids_details.find(b => b.status === 'winner').contractor_name}
                </p>
                <p style={{ fontSize: '16px', marginBottom: '10px' }}>
                  <strong>Email:</strong>{' '}
                  {protocol.bids_details.find(b => b.status === 'winner').contractor_email}
                </p>
                <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#16a34a' }}>
                  <DollarSign size={20} style={{ display: 'inline', marginRight: '5px' }} />
                  {protocol.winner_price?.toLocaleString()} ₸
                </p>
              </div>
            )}
          </Card>
        )}

        <Card style={{ padding: '30px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px' }}>
            Список всех участников ({protocol.bids_details?.length || 0})
          </h2>

          {protocol.bids_details && protocol.bids_details.length > 0 ? (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #e5e7eb' }}>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>№</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Компания</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Email</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Цена предложения</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>AI-оценка</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Статус</th>
                  </tr>
                </thead>
                <tbody>
                  {protocol.bids_details.map((bid, index) => (
                    <tr 
                      key={index} 
                      style={{ 
                        borderBottom: '1px solid #e5e7eb',
                        background: bid.status === 'winner' ? '#f0fdf4' : 'white'
                      }}
                    >
                      <td style={{ padding: '12px' }}>{index + 1}</td>
                      <td style={{ padding: '12px', fontWeight: bid.status === 'winner' ? '600' : 'normal' }}>
                        {bid.contractor_name}
                        {bid.status === 'winner' && (
                          <Award size={16} color="#16a34a" style={{ display: 'inline', marginLeft: '8px' }} />
                        )}
                      </td>
                      <td style={{ padding: '12px', color: '#666' }}>{bid.contractor_email}</td>
                      <td style={{ padding: '12px', fontWeight: '600', color: bid.status === 'winner' ? '#16a34a' : '#333' }}>
                        {bid.price?.toLocaleString()} ₸
                      </td>
                      <td style={{ padding: '12px' }}>
                        {bid.ai_score ? `${bid.ai_score} баллов` : '-'}
                      </td>
                      <td style={{ padding: '12px' }}>
                        <span 
                          className={`status-badge ${
                            bid.status === 'winner' ? 'status-closed' : 
                            bid.status === 'rejected' ? 'status-cancelled' : 
                            'status-draft'
                          }`}
                          style={{ fontSize: '12px', padding: '4px 8px' }}
                        >
                          {bid.status === 'winner' ? 'Победитель' :
                           bid.status === 'rejected' ? 'Отклонено' :
                           bid.status === 'not_qualified' ? 'Не квалифицирован' :
                           bid.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p style={{ color: '#666', textAlign: 'center', padding: '40px' }}>
              Заявки отсутствуют
            </p>
          )}
        </Card>
      </div>
    </Layout>
  );
};

export default ProtocolView;
