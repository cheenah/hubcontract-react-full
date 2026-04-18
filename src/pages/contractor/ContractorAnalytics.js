import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card } from '@/components/ui/card';
import { BarChart2, TrendingUp, Award, DollarSign, CheckCircle, Clock } from 'lucide-react';

const API = process.env.REACT_APP_BACKEND_URL;

const ContractorAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    stats: {
      total_bids: 0,
      won_bids: 0,
      active_contracts: 0,
      completed_contracts: 0,
      total_earnings: 0,
      success_rate: 0,
    },
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    axios
      .get(`${API}/contractor/dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const stats = data.stats;

  const cards = [
    { label: 'Всего заявок',           value: stats.total_bids,                          icon: BarChart2,    color: '#3b82f6' },
    { label: 'Выиграно',               value: stats.won_bids,                            icon: Award,        color: '#10b981' },
    { label: 'Успешность',             value: `${stats.success_rate}%`,                  icon: TrendingUp,   color: '#a855f7' },
    { label: 'Активных контрактов',    value: stats.active_contracts,                    icon: Clock,        color: '#f59e0b' },
    { label: 'Выполнено контрактов',   value: stats.completed_contracts,                 icon: CheckCircle,  color: '#22c55e' },
    { label: 'Общий доход',            value: `${(stats.total_earnings || 0).toLocaleString()} ₸`, icon: DollarSign, color: '#0ea5e9' },
  ];

  return (
      <div style={{ padding: '24px', maxWidth: '1100px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111827', marginBottom: '6px' }}>
          Аналитика
        </h1>
        <p style={{ color: '#6b7280', marginBottom: '24px', fontSize: '0.9rem' }}>
          Статистика вашей деятельности на платформе
        </p>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#9ca3af' }}>Загрузка...</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
            {cards.map(({ label, value, icon: Icon, color }) => (
              <Card key={label} style={{ padding: '20px', border: '1px solid #e5e7eb' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: 12,
                    background: `${color}18`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Icon size={22} style={{ color }} />
                  </div>
                  <div>
                    <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#111827' }}>{value}</div>
                    <div style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '2px' }}>{label}</div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
  );
};

export default ContractorAnalytics;
