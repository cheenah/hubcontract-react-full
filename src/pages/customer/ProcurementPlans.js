import React, { useState, useEffect } from 'react';
import { AppContext } from '@/App';
import { useLanguage } from '@/context/LanguageContext';
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
      active: { text: 'Активный', bg: 'var(--color-success-tint-10)', color: 'var(--color-success-alt)' },
      draft: { text: 'Черновик', bg: 'var(--color-bg-muted)', color: 'var(--color-warning)' },
      completed: { text: 'Завершён', bg: 'var(--color-bg-muted)', color: 'var(--color-text-muted)' }
    };
    return badges[status] || badges.draft;
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
                    <span className="status-badge" style={{ background: statusBadge.bg, color: statusBadge.color }}>
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

        .create-btn {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          background: var(--color-primary);
          color: var(--color-text-inverse);
        }

        .create-form {
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

        .form-actions {
          display: flex;
          gap: var(--space-3);
          justify-content: flex-end;
        }

        .submit-btn {
          background: var(--color-primary);
          color: var(--color-text-inverse);
        }

        .plans-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: var(--space-6);
        }

        .plan-card {
          padding: var(--space-6);
          background: var(--color-bg-surface);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
          transition: var(--transition-base);
        }

        .plan-card:hover {
          box-shadow: var(--shadow-card-hover);
          border-color: var(--color-border-dark);
        }

        .plan-header {
          display: flex;
          align-items: flex-start;
          gap: var(--space-3);
          margin-bottom: var(--space-4);
        }

        .plan-icon {
          width: 48px;
          height: 48px;
          background: var(--color-primary-bg);
          border-radius: var(--radius-lg);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--color-primary);
          flex-shrink: 0;
        }

        .plan-info {
          flex: 1;
        }

        .plan-title {
          font-size: var(--font-size-xl3);
          font-weight: var(--font-weight-semibold);
          color: var(--color-text-dark);
          margin-bottom: var(--space-1);
        }

        .plan-meta {
          font-size: var(--font-size-base);
          color: var(--color-text-secondary);
          margin: 0;
        }

        .status-badge {
          padding: var(--space-1) var(--space-3);
          border-radius: var(--radius-4xl);
          font-size: var(--font-size-xs);
          font-weight: var(--font-weight-semibold);
          flex-shrink: 0;
        }

        .plan-description {
          color: var(--color-text-secondary);
          line-height: 1.6;
          margin-bottom: var(--space-4);
        }

        .plan-budget {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: var(--space-3) var(--space-4);
          background: var(--color-bg-subtle);
          border-radius: var(--radius-md);
          margin-bottom: var(--space-4);
        }

        .budget-label {
          font-size: var(--font-size-base);
          color: var(--color-text-secondary);
        }

        .budget-value {
          font-size: var(--font-size-xl3);
          font-weight: var(--font-weight-bold);
          color: var(--color-primary);
        }

        .plan-actions {
          display: flex;
          gap: var(--space-2);
        }

        .plan-actions button {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--space-1);
        }

        .delete-btn {
          color: var(--color-danger);
          border-color: var(--color-danger);
        }

        .delete-btn:hover {
          background: var(--color-danger-tint-10);
        }

        .empty-state {
          text-align: center;
          padding: var(--space-15) var(--space-10);
          background: var(--color-bg-surface);
        }

        .empty-icon {
          color: var(--color-text-muted);
          margin-bottom: var(--space-4);
        }

        .empty-state h3 {
          font-size: var(--font-size-2xl);
          font-weight: var(--font-weight-semibold);
          color: var(--color-text-dark);
          margin-bottom: var(--space-2);
        }

        .empty-state p {
          color: var(--color-text-secondary);
          margin-bottom: var(--space-6);
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

          .plans-grid {
            grid-template-columns: 1fr;
          }

          .plan-actions {
            flex-direction: column;
          }
        }
      `}</style>
  </>
  );
};

export default ProcurementPlans;