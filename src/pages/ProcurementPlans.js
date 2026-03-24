import React, { useState, useEffect } from 'react';
import { AppContext } from '@/App';
import { useLanguage } from '@/context/LanguageContext';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Calendar, FileText, Edit2, Trash2, Eye } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const ProcurementPlans = () => {
  const { API } = React.useContext(AppContext);
  const { t } = useLanguage();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    year: new Date().getFullYear(),
    total_budget: '',
    items: []
  });

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API}/procurement-plans`);
      setPlans(response.data);
    } catch (error) {
      console.error('Error fetching procurement plans:', error);
      setPlans([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      await axios.post(`${API}/procurement-plans`, formData);
      toast.success('План закупок успешно создан');
      setShowCreateForm(false);
      fetchPlans();
      setFormData({
        title: '',
        description: '',
        year: new Date().getFullYear(),
        total_budget: '',
        items: []
      });
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Ошибка при создании плана');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      active: { text: 'Активный', color: '#10b981' },
      draft: { text: 'Черновик', color: '#f59e0b' },
      completed: { text: 'Завершён', color: '#6b7280' }
    };
    return badges[status] || badges.draft;
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
      <div className="procurement-plans-container">
        <div className="page-header">
          <div>
            <h1 className="page-title">Планы закупок</h1>
            <p className="page-subtitle">Управление планами закупок организации</p>
          </div>
          <Button onClick={() => setShowCreateForm(true)} className="create-btn">
            <Plus size={18} />
            Создать план
          </Button>
        </div>

        {showCreateForm && (
          <Card className="create-form">
            <h3 className="form-title">Новый план закупок</h3>
            <div className="form-grid">
              <div className="form-field full-width">
                <Label>Название плана</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="План закупок на 2025 год"
                />
              </div>
              <div className="form-field">
                <Label>Год</Label>
                <Input
                  type="number"
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                />
              </div>
              <div className="form-field">
                <Label>Общий бюджет (₸)</Label>
                <Input
                  type="number"
                  value={formData.total_budget}
                  onChange={(e) => setFormData({ ...formData, total_budget: e.target.value })}
                  placeholder="0"
                />
              </div>
              <div className="form-field full-width">
                <Label>Описание</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  placeholder="Краткое описание плана закупок"
                />
              </div>
            </div>
            <div className="form-actions">
              <Button onClick={handleCreate} className="submit-btn">
                Создать план
              </Button>
              <Button onClick={() => setShowCreateForm(false)} variant="outline">
                Отмена
              </Button>
            </div>
          </Card>
        )}

        <div className="plans-grid">
          {plans.length === 0 ? (
            <Card className="empty-state">
              <FileText size={48} className="empty-icon" />
              <h3>Нет планов закупок</h3>
              <p>Создайте первый план закупок для организации</p>
              <Button onClick={() => setShowCreateForm(true)} className="create-btn">
                <Plus size={18} />
                Создать план
              </Button>
            </Card>
          ) : (
            plans.map((plan) => {
              const statusBadge = getStatusBadge(plan.status);
              return (
                <Card key={plan.id} className="plan-card">
                  <div className="plan-header">
                    <div className="plan-icon">
                      <Calendar size={24} />
                    </div>
                    <div className="plan-info">
                      <h3 className="plan-title">{plan.title}</h3>
                      <p className="plan-meta">
                        {plan.year} • {plan.items_count || 0} позиций
                      </p>
                    </div>
                    <span className="status-badge" style={{ background: `${statusBadge.color}20`, color: statusBadge.color }}>
                      {statusBadge.text}
                    </span>
                  </div>
                  <p className="plan-description">{plan.description}</p>
                  <div className="plan-budget">
                    <span className="budget-label">Общий бюджет:</span>
                    <span className="budget-value">{plan.total_budget.toLocaleString()} ₸</span>
                  </div>
                  <div className="plan-actions">
                    <Button variant="outline" size="sm">
                      <Eye size={16} />
                      Просмотр
                    </Button>
                    <Button variant="outline" size="sm">
                      <Edit2 size={16} />
                      Редактировать
                    </Button>
                    <Button variant="outline" size="sm" className="delete-btn">
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </div>

      <style jsx>{`
        .procurement-plans-container {
          max-width: 1400px;
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

        .create-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          background: var(--primary);
          color: white;
        }

        .create-form {
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

        .form-actions {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
        }

        .submit-btn {
          background: var(--primary);
          color: white;
        }

        .plans-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 24px;
        }

        .plan-card {
          padding: 24px;
          background: white;
          border: 1px solid var(--border-light);
          border-radius: 8px;
          transition: all 0.2s ease;
        }

        .plan-card:hover {
          box-shadow: var(--shadow-md);
          border-color: var(--border-medium);
        }

        .plan-header {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          margin-bottom: 16px;
        }

        .plan-icon {
          width: 48px;
          height: 48px;
          background: rgba(30, 64, 175, 0.1);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--primary);
          flex-shrink: 0;
        }

        .plan-info {
          flex: 1;
        }

        .plan-title {
          font-size: 1.125rem;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 4px;
        }

        .plan-meta {
          font-size: 0.875rem;
          color: var(--text-secondary);
          margin: 0;
        }

        .status-badge {
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 600;
          flex-shrink: 0;
        }

        .plan-description {
          color: var(--text-secondary);
          line-height: 1.6;
          margin-bottom: 16px;
        }

        .plan-budget {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          background: var(--bg-tertiary);
          border-radius: 6px;
          margin-bottom: 16px;
        }

        .budget-label {
          font-size: 0.875rem;
          color: var(--text-secondary);
        }

        .budget-value {
          font-size: 1.125rem;
          font-weight: 700;
          color: var(--accent);
        }

        .plan-actions {
          display: flex;
          gap: 8px;
        }

        .plan-actions button {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
        }

        .delete-btn {
          color: #ef4444;
          border-color: #ef4444;
        }

        .delete-btn:hover {
          background: rgba(239, 68, 68, 0.1);
        }

        .empty-state {
          text-align: center;
          padding: 60px 40px;
          background: white;
        }

        .empty-icon {
          color: var(--text-muted);
          margin-bottom: 16px;
        }

        .empty-state h3 {
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 8px;
        }

        .empty-state p {
          color: var(--text-secondary);
          margin-bottom: 24px;
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

          .plans-grid {
            grid-template-columns: 1fr;
          }

          .plan-actions {
            flex-direction: column;
          }
        }
      `}</style>
    </Layout>
  );
};

export default ProcurementPlans;