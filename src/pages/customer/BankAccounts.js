import React, { useState, useEffect } from 'react';
import { AppContext } from '@/App';
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
        <div className="loading-container">
          <div className="loading-spinner"></div>
        </div>
    );
  }

  return (
    <>
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
          margin: 0 auto;
          padding: var(--space-6);
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--space-8);
          background: var(--color-bg-surface);
          padding: var(--space-6) var(--space-8);
          border-radius: var(--radius-lg);
          border: 1px solid var(--color-border);
          box-shadow: var(--shadow-card);
        }

        .page-title {
          font-size: var(--font-size-6xl);
          font-weight: var(--font-weight-bold);
          color: var(--color-text-dark);
          margin-bottom: var(--space-1);
        }

        .page-subtitle {
          font-size: var(--font-size-lg);
          color: var(--color-text-secondary);
        }

        .add-btn {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          background: var(--color-primary);
          color: var(--color-text-inverse);
        }

        .form-card {
          padding: var(--space-8);
          margin-bottom: var(--space-8);
          background: var(--color-bg-surface);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
        }

        .form-title {
          font-size: var(--font-size-3xl);
          font-weight: var(--font-weight-semibold);
          color: var(--color-text-dark);
          margin-bottom: var(--space-6);
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: var(--space-5);
          margin-bottom: var(--space-6);
        }

        .form-field {
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
        }

        .form-field.full-width {
          grid-column: 1 / -1;
        }

        .select-input {
          padding: var(--space-2) var(--space-3);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          background: var(--color-bg-surface);
          font-size: var(--font-size-base);
          color: var(--color-text-dark);
        }

        .checkbox-field {
          display: flex;
          align-items: center;
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          cursor: pointer;
        }

        .checkbox-label input[type="checkbox"] {
          width: 18px;
          height: 18px;
          cursor: pointer;
        }

        .form-actions {
          display: flex;
          gap: var(--space-3);
          justify-content: flex-end;
        }

        .submit-btn {
          background: var(--color-primary);
          color: var(--color-text-inverse);
        }

        .accounts-list {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: var(--space-6);
        }

        .account-card {
          padding: var(--space-6);
          background: var(--color-bg-surface);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
        }

        .account-header {
          display: flex;
          gap: var(--space-4);
          align-items: center;
          margin-bottom: var(--space-5);
          padding-bottom: var(--space-4);
          border-bottom: 1px solid var(--color-border);
        }

        .account-icon {
          width: 48px;
          height: 48px;
          background: var(--color-primary-bg);
          border-radius: var(--radius-lg);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--color-primary);
        }

        .account-info {
          flex: 1;
        }

        .account-name {
          font-size: var(--font-size-xl3);
          font-weight: var(--font-weight-semibold);
          color: var(--color-text-dark);
          margin-bottom: var(--space-1);
        }

        .primary-badge {
          display: inline-block;
          padding: var(--space-05) var(--space-2);
          background: var(--color-success-tint-10);
          color: var(--color-success-alt);
          border-radius: var(--radius-4xl);
          font-size: var(--font-size-xs);
          font-weight: var(--font-weight-semibold);
        }

        .account-details {
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
          margin-bottom: var(--space-5);
        }

        .detail-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .detail-label {
          font-size: var(--font-size-base);
          color: var(--color-text-secondary);
        }

        .detail-value {
          font-size: var(--font-size-base);
          font-weight: var(--font-weight-semibold);
          color: var(--color-text-dark);
        }

        .detail-value.monospace {
          font-family: 'Courier New', monospace;
        }

        .account-actions {
          display: flex;
          gap: var(--space-3);
        }

        .account-actions button {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--space-1-5);
        }

        .delete-btn {
          color: var(--color-danger);
          border-color: var(--color-danger);
        }

        .delete-btn:hover {
          background: var(--color-danger-tint-10);
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
          border: 3px solid var(--color-border);
          border-top: 3px solid var(--color-primary);
          border-radius: var(--radius-circle);
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .page-header {
            flex-direction: column;
            gap: var(--space-4);
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
    </>
  );
};

export default BankAccounts;