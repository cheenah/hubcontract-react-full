import React, { useState, useEffect } from 'react';
import { AppContext } from '@/App';
import Layout from '@/components/Layout';
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
      admin: { text: 'Администратор', color: '#8b5cf6' },
      editor: { text: 'Редактор', color: '#3b82f6' },
      viewer: { text: 'Наблюдатель', color: '#6b7280' }
    };
    return badges[role] || badges.viewer;
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
                    style={{ background: `${roleBadge.color}20`, color: roleBadge.color }}
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

        .form-actions {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
        }

        .submit-btn {
          background: var(--primary);
          color: white;
        }

        .employees-list {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
          gap: 24px;
        }

        .employee-card {
          padding: 24px;
          background: white;
          border: 1px solid var(--border-light);
          border-radius: 8px;
        }

        .employee-header {
          display: flex;
          gap: 16px;
          align-items: flex-start;
          margin-bottom: 20px;
          padding-bottom: 16px;
          border-bottom: 1px solid var(--border-light);
        }

        .employee-icon {
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

        .employee-info {
          flex: 1;
        }

        .employee-name {
          font-size: 1.125rem;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 4px;
        }

        .employee-position {
          font-size: 0.875rem;
          color: var(--text-secondary);
          margin: 0;
        }

        .role-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 600;
          flex-shrink: 0;
        }

        .employee-contacts {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 20px;
        }

        .contact-item {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 0.875rem;
          color: var(--text-secondary);
        }

        .employee-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          padding-top: 16px;
          border-top: 1px solid var(--border-light);
        }

        .status-badge {
          padding: 4px 12px;
          background: rgba(16, 185, 129, 0.1);
          color: #10b981;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .employee-actions {
          display: flex;
          gap: 8px;
        }

        .employee-actions button {
          display: flex;
          align-items: center;
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
    </Layout>
  );
};

export default OrganizationEmployees;
