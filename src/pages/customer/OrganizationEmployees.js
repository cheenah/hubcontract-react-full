import React, { useState, useEffect } from 'react';
import { AppContext } from '@/App';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Edit2, Trash2, User, Mail, Phone, Shield } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const OrganizationEmployees = () => {
  const { API } = React.useContext(AppContext);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    position: '',
    email: '',
    phone: '',
    role: 'viewer',
    is_active: true
  });

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API}/organization/employees`);
      setEmployees(response.data);
    } catch (error) {
      console.error('Error fetching employees:', error);
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/organization/employees`, formData);
      toast.success('Сотрудник добавлен');
      setShowForm(false);
      fetchEmployees();
      setFormData({
        full_name: '',
        position: '',
        email: '',
        phone: '',
        role: 'viewer',
        is_active: true
      });
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Ошибка при добавлении сотрудника');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Удалить сотрудника из списка?')) return;
    try {
      await axios.delete(`${API}/organization/employees/${id}`);
      toast.success('Сотрудник удален');
      fetchEmployees();
    } catch (error) {
      toast.error('Ошибка при удалении');
    }
  };

  const getRoleBadge = (role) => {
    const badges = {
      admin: { text: 'Администратор', bg: 'var(--color-primary-bg)', color: 'var(--color-primary)' },
      editor: { text: 'Редактор', bg: 'var(--color-primary-bg)', color: 'var(--color-primary-light)' },
      viewer: { text: 'Наблюдатель', bg: 'var(--color-bg-muted)', color: 'var(--color-text-muted)' }
    };
    return badges[role] || badges.viewer;
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
      <div className="employees-container">
        <div className="page-header">
          <div>
            <h1 className="page-title">Сотрудники организации</h1>
            <p className="page-subtitle">Управление доступами и ролями сотрудников</p>
          </div>
          <Button onClick={() => setShowForm(!showForm)} className="add-btn">
            <Plus size={18} />
            Добавить сотрудника
          </Button>
        </div>

        {showForm && (
          <Card className="form-card">
            <h3 className="form-title">Новый сотрудник</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-field full-width">
                  <Label>ФИО сотрудника</Label>
                  <Input
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    placeholder="Иванов Иван Иванович"
                    required
                  />
                </div>
                <div className="form-field">
                  <Label>Должность</Label>
                  <Input
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    placeholder="Специалист по закупкам"
                    required
                  />
                </div>
                <div className="form-field">
                  <Label>Роль в системе</Label>
                  <select
                    className="select-input"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  >
                    <option value="admin">Администратор</option>
                    <option value="editor">Редактор</option>
                    <option value="viewer">Наблюдатель</option>
                  </select>
                </div>
                <div className="form-field">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="ivanov@company.kz"
                    required
                  />
                </div>
                <div className="form-field">
                  <Label>Телефон</Label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+7 701 234 5678"
                    required
                  />
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

        <div className="employees-list">
          {employees.map((employee) => {
            const roleBadge = getRoleBadge(employee.role);
            return (
              <Card key={employee.id} className="employee-card">
                <div className="employee-header">
                  <div className="employee-icon">
                    <User size={24} />
                  </div>
                  <div className="employee-info">
                    <h3 className="employee-name">{employee.full_name}</h3>
                    <p className="employee-position">{employee.position}</p>
                  </div>
                  <span
                    className="role-badge"
                    style={{ background: roleBadge.bg, color: roleBadge.color }}
                  >
                    <Shield size={14} />
                    {roleBadge.text}
                  </span>
                </div>

                <div className="employee-contacts">
                  <div className="contact-item">
                    <Mail size={16} />
                    <span>{employee.email}</span>
                  </div>
                  <div className="contact-item">
                    <Phone size={16} />
                    <span>{employee.phone}</span>
                  </div>
                </div>

                <div className="employee-footer">
                  <span className="status-badge active">
                    {employee.is_active ? '✓ Активен' : '✗ Неактивен'}
                  </span>
                  <div className="employee-actions">
                    <Button variant="outline" size="sm">
                      <Edit2 size={16} />
                      Редактировать
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="delete-btn"
                      onClick={() => handleDelete(employee.id)}
                    >
                      <Trash2 size={16} />
                      Удалить
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      <style jsx>{`
        .employees-container {
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

        .form-actions {
          display: flex;
          gap: var(--space-3);
          justify-content: flex-end;
        }

        .submit-btn {
          background: var(--color-primary);
          color: var(--color-text-inverse);
        }

        .employees-list {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
          gap: var(--space-6);
        }

        .employee-card {
          padding: var(--space-6);
          background: var(--color-bg-surface);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
        }

        .employee-header {
          display: flex;
          gap: var(--space-4);
          align-items: flex-start;
          margin-bottom: var(--space-5);
          padding-bottom: var(--space-4);
          border-bottom: 1px solid var(--color-border);
        }

        .employee-icon {
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

        .employee-info {
          flex: 1;
        }

        .employee-name {
          font-size: var(--font-size-xl3);
          font-weight: var(--font-weight-semibold);
          color: var(--color-text-dark);
          margin-bottom: var(--space-1);
        }

        .employee-position {
          font-size: var(--font-size-base);
          color: var(--color-text-secondary);
          margin: 0;
        }

        .role-badge {
          display: inline-flex;
          align-items: center;
          gap: var(--space-1-5);
          padding: var(--space-1-5) var(--space-3);
          border-radius: var(--radius-4xl);
          font-size: var(--font-size-xs);
          font-weight: var(--font-weight-semibold);
          flex-shrink: 0;
        }

        .employee-contacts {
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
          margin-bottom: var(--space-5);
        }

        .contact-item {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          font-size: var(--font-size-base);
          color: var(--color-text-secondary);
        }

        .employee-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: var(--space-4);
          padding-top: var(--space-4);
          border-top: 1px solid var(--color-border);
        }

        .status-badge {
          padding: var(--space-1) var(--space-3);
          background: var(--color-success-tint-10);
          color: var(--color-success-alt);
          border-radius: var(--radius-4xl);
          font-size: var(--font-size-xs);
          font-weight: var(--font-weight-semibold);
        }

        .employee-actions {
          display: flex;
          gap: var(--space-2);
        }

        .employee-actions button {
          display: flex;
          align-items: center;
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

          .employees-list {
            grid-template-columns: 1fr;
          }

          .employee-footer {
            flex-direction: column;
            align-items: stretch;
          }

          .employee-actions {
            width: 100%;
          }

          .employee-actions button {
            flex: 1;
          }
        }
      `}</style>
  </>
  );
};

export default OrganizationEmployees;
