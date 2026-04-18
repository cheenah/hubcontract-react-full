import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card } from '@/components/ui/card';
import { Archive, FileText, CheckCircle, XCircle } from 'lucide-react';
import { getContractStatusText } from '@/utils/statusHelpers';

const API = process.env.REACT_APP_BACKEND_URL;

const statusColor = (status) => {
  if (['completed', 'signed'].includes(status)) return '#10b981';
  if (['rejected', 'cancelled'].includes(status)) return '#ef4444';
  return '#6b7280';
};

const ContractorArchive = () => {
  const [loading, setLoading] = useState(true);
  const [contracts, setContracts] = useState([]);
  const [bids, setBids] = useState([]);
  const [tab, setTab] = useState('contracts');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    Promise.all([
      axios.get(`${API}/contractor/contracts`, { headers }),
      axios.get(`${API}/contractor/bids`, { headers }).catch(() => ({ data: [] })),
    ])
      .then(([cRes, bRes]) => {
        setContracts(
          (cRes.data || []).filter((c) =>
            ['completed', 'signed', 'rejected', 'cancelled'].includes(c.status)
          )
        );
        setBids(
          (bRes.data || []).filter((b) =>
            ['rejected', 'cancelled', 'lost'].includes(b.status)
          )
        );
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const tabs = [
    { key: 'contracts', label: 'Договоры', icon: FileText },
    { key: 'bids',      label: 'Заявки',   icon: Archive },
  ];

  return (
      <div style={{ padding: '24px', maxWidth: '1100px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111827', marginBottom: '6px' }}>
          Архив
        </h1>
        <p style={{ color: '#6b7280', marginBottom: '20px', fontSize: '0.9rem' }}>
          Завершённые, подписанные и отклонённые документы
        </p>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '4px', marginBottom: '20px', background: '#f3f4f6', borderRadius: '10px', padding: '4px', width: 'fit-content' }}>
          {tabs.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '7px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                fontSize: '0.875rem', fontWeight: tab === key ? 600 : 500,
                background: tab === key ? '#fff' : 'transparent',
                color: tab === key ? '#1e40af' : '#6b7280',
                boxShadow: tab === key ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                transition: 'all 0.15s',
              }}
            >
              <Icon size={15} />
              {label}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#9ca3af' }}>Загрузка...</div>
        ) : (
          <>
            {tab === 'contracts' && (
              contracts.length === 0 ? (
                <EmptyState label="Архивных договоров нет" />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {contracts.map((c) => (
                    <Card key={c.id} style={{ padding: '16px 20px', border: '1px solid #e5e7eb' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontWeight: 600, color: '#111827', marginBottom: '4px' }}>
                            {c.title || `Договор #${c.id}`}
                          </div>
                          <div style={{ fontSize: '0.8rem', color: '#9ca3af' }}>
                            {c.created_at ? new Date(c.created_at).toLocaleDateString('ru-RU') : '—'}
                          </div>
                        </div>
                        <span style={{
                          padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600,
                          background: `${statusColor(c.status)}18`, color: statusColor(c.status),
                        }}>
                          {getContractStatusText(c.status)}
                        </span>
                      </div>
                    </Card>
                  ))}
                </div>
              )
            )}

            {tab === 'bids' && (
              bids.length === 0 ? (
                <EmptyState label="Архивных заявок нет" />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {bids.map((b) => (
                    <Card key={b.id} style={{ padding: '16px 20px', border: '1px solid #e5e7eb' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontWeight: 600, color: '#111827', marginBottom: '4px' }}>
                            {b.tender_title || `Заявка #${b.id}`}
                          </div>
                          <div style={{ fontSize: '0.8rem', color: '#9ca3af' }}>
                            {b.created_at ? new Date(b.created_at).toLocaleDateString('ru-RU') : '—'}
                          </div>
                        </div>
                        <span style={{
                          padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600,
                          background: `${statusColor(b.status)}18`, color: statusColor(b.status),
                        }}>
                          {b.status}
                        </span>
                      </div>
                    </Card>
                  ))}
                </div>
              )
            )}
          </>
        )}
      </div>
  );
};

const EmptyState = ({ label }) => (
  <div style={{ textAlign: 'center', padding: '60px 24px', color: '#9ca3af' }}>
    <Archive size={48} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
    <p>{label}</p>
  </div>
);

export default ContractorArchive;
