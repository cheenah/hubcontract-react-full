import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card } from '@/components/ui/card';
import { Archive, FileText, CheckCircle, XCircle } from 'lucide-react';
import { getContractStatusText } from '@/utils/statusHelpers';
import { useLanguage } from '@/context/LanguageContext';

const API = process.env.REACT_APP_BACKEND_URL;

const statusColor = (status) => {
  if (['completed', 'signed'].includes(status)) return 'var(--color-success-alt)';
  if (['rejected', 'cancelled'].includes(status)) return 'var(--color-danger)';
  return 'var(--color-text-muted)';
};

const ContractorArchive = () => {
  const { t } = useLanguage();
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
    { key: 'contracts', label: t('contractorArchive.contracts'), icon: FileText },
    { key: 'bids',      label: t('contractorArchive.bids'),      icon: Archive },
  ];

  return (
      <div style={{ padding: 'var(--space-6)', maxWidth: '1100px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-text-dark)', marginBottom: 'var(--space-1-5)' }}>
          {t('contractorArchive.title')}
        </h1>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--space-5)', fontSize: 'var(--font-size-base)' }}>
          {t('contractorArchive.subtitle')}
        </p>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 'var(--space-1)', marginBottom: 'var(--space-5)', background: 'var(--color-bg-muted)', borderRadius: 'var(--radius-xl)', padding: 'var(--space-1)', width: 'fit-content' }}>
          {tabs.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              style={{
                display: 'flex', alignItems: 'center', gap: 'var(--space-1-5)',
                padding: '7px var(--space-4)', borderRadius: 'var(--radius-lg)', border: 'none', cursor: 'pointer',
                fontSize: 'var(--font-size-base)', fontWeight: tab === key ? 'var(--font-weight-semibold)' : 'var(--font-weight-medium)',
                background: tab === key ? 'var(--color-bg-surface)' : 'transparent',
                color: tab === key ? 'var(--color-primary-dark)' : 'var(--color-text-muted)',
                boxShadow: tab === key ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                transition: 'all var(--transition-fast)',
              }}
            >
              <Icon size={15} />
              {label}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: 'var(--color-text-placeholder)' }}>{t('common.loading')}</div>
        ) : (
          <>
            {tab === 'contracts' && (
              contracts.length === 0 ? (
                <EmptyState label={`${t('common.noResults')}`} />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2-5)' }}>
                  {contracts.map((c) => (
                    <Card key={c.id} style={{ padding: 'var(--space-4) var(--space-5)', border: '1px solid var(--color-border)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text-dark)', marginBottom: 'var(--space-1)' }}>
                            {c.title || `Договор #${c.id}`}
                          </div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-placeholder)' }}>
                            {c.created_at ? new Date(c.created_at).toLocaleDateString('ru-RU') : '—'}
                          </div>
                        </div>
                        <span style={{
                          padding: 'var(--space-1) var(--space-3)', borderRadius: 'var(--radius-4xl)', fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-semibold)',
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
                <EmptyState label={`${t('common.noResults')}`} />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2-5)' }}>
                  {bids.map((b) => (
                    <Card key={b.id} style={{ padding: 'var(--space-4) var(--space-5)', border: '1px solid var(--color-border)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text-dark)', marginBottom: 'var(--space-1)' }}>
                            {b.tender_title || `Заявка #${b.id}`}
                          </div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-placeholder)' }}>
                            {b.created_at ? new Date(b.created_at).toLocaleDateString('ru-RU') : '—'}
                          </div>
                        </div>
                        <span style={{
                          padding: 'var(--space-1) var(--space-3)', borderRadius: 'var(--radius-4xl)', fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-semibold)',
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
  <div style={{ textAlign: 'center', padding: '60px var(--space-6)', color: 'var(--color-text-placeholder)' }}>
    <Archive size={48} style={{ margin: '0 auto var(--space-3)', opacity: 0.4 }} />
    <p>{label}</p>
  </div>
);

export default ContractorArchive;
