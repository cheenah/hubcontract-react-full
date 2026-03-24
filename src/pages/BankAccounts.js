import React, { useState, useEffect } from 'react';
import { AppContext } from '@/App';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Edit2, Trash2, CreditCard } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const BankAccounts = () => {
  const { API } = React.useContext(AppContext);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    bank_name: '',
    bik: '',
    iik: '',
    account_type: 'текущий',
    is_primary: false
  });

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API}/bank-accounts`);
      setAccounts(response.data);
    } catch (error) {
      console.error('Error fetching bank accounts:', error);
      setAccounts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/bank-accounts`, formData);
      toast.success('Банковский счет добавлен');
      setShowForm(false);
      fetchAccounts();
      setFormData({
        bank_name: '',
        bik: '',
        iik: '',
        account_type: 'текущий',
        is_primary: false
      });
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Ошибка при добавлении счета');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Удалить банковский счет?')) return;
    try {
      await axios.delete(`${API}/bank-accounts/${id}`);
      toast.success('Счет удален');
      fetchAccounts();
    } catch (error) {
      toast.error('Ошибка при удалении');
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="loading-container">
          <div className="loading-spinner"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="bank-accounts-container">
        <div className="page-header">
          <div>
            <h1 className="page-title">Банковские счета</h1>
            <p className="page-subtitle">Управление расчетными счетами организации</p>
          </div>
          <Button onClick={() => setShowForm(!showForm)} className="add-btn">
            <Plus size={18} />
            Добавить счет
          </Button>
        </div>

        {showForm && (
          <Card className="form-card">
            <h3 className="form-title">Новый банковский счет</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-field">
                  <Label>Название банка</Label>
                  <Input
                    value={formData.bank_name}
                    onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                    placeholder='АО "Kaspi Bank"'
                    required
                  />
                </div>
                <div className="form-field">
                  <Label>БИК</Label>
                  <Input
                    value={formData.bik}
                    onChange={(e) => setFormData({ ...formData, bik: e.target.value })}
                    placeholder="CASPKZKA"
                    required
                  />
                </div>
                <div className="form-field full-width">
                  <Label>ИИК (Индивидуальный идентификационный код)</Label>
                  <Input
                    value={formData.iik}
                    onChange={(e) => setFormData({ ...formData, iik: e.target.value })}
                    placeholder="KZ123456789012345678"
                    required
                  />
                </div>
                <div className="form-field">
                  <Label>Тип счета</Label>
                  <select
                    className="select-input"
                    value={formData.account_type}
                    onChange={(e) => setFormData({ ...formData, account_type: e.target.value })}
                  >
                    <option value="текущий">Текущий</option>
                    <option value="специальный">Специальный</option>
                  </select>
                </div>
                <div className="form-field checkbox-field">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.is_primary}
                      onChange={(e) => setFormData({ ...formData, is_primary: e.target.checked })}
                    />
                    <span>Основной счет</span>
                  </label>
                </div>
              </div>
              <div className="form-actions">
                <Button type="submit" className="submit-btn">
                  Сохранить
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Отмена
                </Button>
              </div>
            </form>
          </Card>
        )}

        <div className="accounts-list">
          {accounts.map((account) => (
            <Card key={account.id} className="account-card">
              <div className="account-header">
                <div className="account-icon">
                  <CreditCard size={24} />
                </div>
                <div className="account-info">
                  <h3 className="account-name">{account.bank_name}</h3>
                  {account.is_primary && <span className="primary-badge">Основной</span>}
                </div>
              </div>
              <div className="account-details">
                <div className="detail-row">
                  <span className="detail-label">БИК:</span>
                  <span className="detail-value">{account.bik}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">ИИК:</span>
                  <span className="detail-value monospace">{account.iik}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Тип счета:</span>
                  <span className="detail-value">{account.account_type}</span>
                </div>
              </div>
              <div className="account-actions">
                <Button variant="outline" size="sm">
                  <Edit2 size={16} />
                  Редактировать
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="delete-btn"
                  onClick={() => handleDelete(account.id)}
                >
                  <Trash2 size={16} />
                  Удалить
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <style jsx>{`
        .bank-accounts-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 24px;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 32px;
          background: white;
          padding: 24px 32px;
          border-radius: 8px;
          border: 1px solid var(--border-light);
          box-shadow: var(--shadow-card);
        }

        .page-title {
          font-size: 2rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 4px;
        }

        .page-subtitle {
          font-size: 1rem;
          color: var(--text-secondary);
        }

        .add-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          background: var(--primary);
          color: white;
        }

        .form-card {
          padding: 32px;
          margin-bottom: 32px;
          background: white;
          border: 1px solid var(--border-light);
          border-radius: 8px;
        }

        .form-title {
          font-size: 1.5rem;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 24px;
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
          margin-bottom: 24px;
        }

        .form-field {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .form-field.full-width {
          grid-column: 1 / -1;
        }

        .select-input {
          padding: 8px 12px;
          border: 1px solid var(--border-medium);
          border-radius: 6px;
          background: white;
          font-size: 0.875rem;
          color: var(--text-primary);
        }

        .checkbox-field {
          display: flex;
          align-items: center;
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
        }

        .checkbox-label input[type="checkbox"] {
          width: 18px;
          height: 18px;
          cursor: pointer;
        }

        .form-actions {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
        }

        .submit-btn {
          background: var(--primary);
          color: white;
        }

        .accounts-list {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 24px;
        }

        .account-card {
          padding: 24px;
          background: white;
          border: 1px solid var(--border-light);
          border-radius: 8px;
        }

        .account-header {
          display: flex;
          gap: 16px;
          align-items: center;
          margin-bottom: 20px;
          padding-bottom: 16px;
          border-bottom: 1px solid var(--border-light);
        }

        .account-icon {
          width: 48px;
          height: 48px;
          background: rgba(30, 64, 175, 0.1);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--primary);
        }

        .account-info {
          flex: 1;
        }

        .account-name {
          font-size: 1.125rem;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 4px;
        }

        .primary-badge {
          display: inline-block;
          padding: 2px 8px;
          background: rgba(16, 185, 129, 0.1);
          color: #10b981;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .account-details {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 20px;
        }

        .detail-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .detail-label {
          font-size: 0.875rem;
          color: var(--text-secondary);
        }

        .detail-value {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        .detail-value.monospace {
          font-family: 'Courier New', monospace;
        }

        .account-actions {
          display: flex;
          gap: 12px;
        }

        .account-actions button {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }

        .delete-btn {
          color: #ef4444;
          border-color: #ef4444;
        }

        .delete-btn:hover {
          background: rgba(239, 68, 68, 0.1);
        }

        .loading-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 400px;
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid var(--border-light);
          border-top: 3px solid var(--primary);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .page-header {
            flex-direction: column;
            gap: 16px;
            align-items: flex-start;
          }

          .form-grid {
            grid-template-columns: 1fr;
          }

          .accounts-list {
            grid-template-columns: 1fr;
          }

          .account-actions {
            flex-direction: column;
          }
        }
      `}</style>
    </Layout>
  );
};

export default BankAccounts;