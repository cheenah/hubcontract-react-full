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
    { label: 'Всего заявок',           value: stats.total_bids,                          icon: BarChart2,    color: 'var(--color-primary-light)' },
    { label: 'Выиграно',               value: stats.won_bids,                            icon: Award,        color: 'var(--color-success-alt)' },
    { label: 'Успешность',             value: `${stats.success_rate}%`,                  icon: TrendingUp,   color: 'var(--color-primary)' },
    { label: 'Активных контрактов',    value: stats.active_contracts,                    icon: Clock,        color: 'var(--color-warning)' },
    { label: 'Выполнено контрактов',   value: stats.completed_contracts,                 icon: CheckCircle,  color: 'var(--color-success-mid)' },
    { label: 'Общий доход',            value: `${(stats.total_earnings || 0).toLocaleString()} ₸`, icon: DollarSign, color: 'var(--color-secondary)' },
  ];

  return (
      <div style={{ padding: 'var(--space-6)', maxWidth: '1100px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-text-primary)', marginBottom: 'var(--space-1-5)' }}>
          Аналитика
        </h1>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--space-6)', fontSize: 'var(--font-size-base)' }}>
          Статистика вашей деятельности на платформе
        </p>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: 'var(--color-text-placeholder)' }}>Загрузка...</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 'var(--space-4)' }}>
            {cards.map(({ label, value, icon: Icon, color }) => (
              <Card key={label} style={{ padding: 'var(--space-5)', border: '1px solid var(--color-border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3-5)' }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: 'var(--radius-2xl)',
                    background: `${color}18`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Icon size={22} style={{ color }} />
                  </div>
                  <div>
                    <div style={{ fontSize: '1.6rem', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-text-primary)' }}>{value}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>{label}</div>
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
