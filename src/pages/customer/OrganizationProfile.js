import React, { useState, useEffect } from 'react';
import { AppContext } from '@/App';
import { useLanguage } from '@/context/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building, FileText, Users, MapPin, Phone, Mail, Edit2, Save, X } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const OrganizationProfile = () => {
  const { user, API } = React.useContext(AppContext);
  const { t } = useLanguage();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [orgData, setOrgData] = useState({
    company_name: '',
    company_bin: '',
    legal_address: '',
    actual_address: '',
    director_name: '',
    contact_person: '',
    contact_phone: '',
    contact_email: '',
    description: '',
    industry: '',
    employees_count: '',
    foundation_year: '',
    website: ''
  });

  useEffect(() => {
    fetchOrgData();
  }, []);

  const fetchOrgData = async () => {
    try {
      const response = await axios.get(`${API}/organization/profile`);
      setOrgData(response.data);
    } catch (error) {
      console.error('Error fetching organization data:', error);
      // Use user data as fallback
      setOrgData({
        ...orgData,
        company_name: user.company_name || '',
        company_bin: user.company_bin || '',
        contact_email: user.email || '',
        contact_phone: user.phone || ''
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      await axios.put(`${API}/organization/profile`, orgData);
      toast.success('Профиль организации успешно обновлен');
      setIsEditing(false);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Ошибка при сохранении');
    }
  };

  const handleChange = (field, value) => {
    setOrgData({ ...orgData, [field]: value });
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
      <div className="org-profile-container">
        <div className="page-header">
          <div>
            <h1 className="page-title">Профиль организации</h1>
            <p className="page-subtitle">Управление данными вашей компании</p>
          </div>
          <div className="header-actions">
            {!isEditing ? (
              <Button onClick={() => setIsEditing(true)} className="edit-btn">
                <Edit2 size={18} />
                Редактировать
              </Button>
            ) : (
              <div className="edit-actions">
                <Button onClick={handleSave} className="save-btn">
                  <Save size={18} />
                  Сохранить
                </Button>
                <Button onClick={() => setIsEditing(false)} variant="outline" className="cancel-btn">
                  <X size={18} />
                  Отмена
                </Button>
              </div>
            )}
          </div>
        </div>

        <Tabs defaultValue="general" className="org-tabs">
          <TabsList>
            <TabsTrigger value="general">
              <Building size={18} />
              Основная информация
            </TabsTrigger>
            <TabsTrigger value="contacts">
              <Phone size={18} />
              Контакты
            </TabsTrigger>
            <TabsTrigger value="details">
              <FileText size={18} />
              Дополнительно
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <Card className="section-card">
              <h3 className="section-title">Юридическая информация</h3>
              <div className="form-grid">
                <div className="form-field full-width">
                  <Label>Название организации</Label>
                  <Input
                    value={orgData.company_name}
                    onChange={(e) => handleChange('company_name', e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
                <div className="form-field">
                  <Label>БИН</Label>
                  <Input
                    value={orgData.company_bin}
                    disabled
                  />
                </div>
                <div className="form-field">
                  <Label>Отрасль</Label>
                  <Input
                    value={orgData.industry}
                    onChange={(e) => handleChange('industry', e.target.value)}
                    disabled={!isEditing}
                    placeholder="Строительство, ИТ, Логистика..."
                  />
                </div>
                <div className="form-field">
                  <Label>Количество сотрудников</Label>
                  <Input
                    type="number"
                    value={orgData.employees_count}
                    onChange={(e) => handleChange('employees_count', e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
                <div className="form-field">
                  <Label>Год основания</Label>
                  <Input
                    type="number"
                    value={orgData.foundation_year}
                    onChange={(e) => handleChange('foundation_year', e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
                <div className="form-field full-width">
                  <Label>Юридический адрес</Label>
                  <Input
                    value={orgData.legal_address}
                    onChange={(e) => handleChange('legal_address', e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
                <div className="form-field full-width">
                  <Label>Фактический адрес</Label>
                  <Input
                    value={orgData.actual_address}
                    onChange={(e) => handleChange('actual_address', e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
                <div className="form-field full-width">
                  <Label>Описание деятельности</Label>
                  <Textarea
                    value={orgData.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    disabled={!isEditing}
                    rows={4}
                    placeholder="Краткое описание деятельности организации"
                  />
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="contacts">
            <Card className="section-card">
              <h3 className="section-title">Контактная информация</h3>
              <div className="form-grid">
                <div className="form-field">
                  <Label>ФИО директора</Label>
                  <Input
                    value={orgData.director_name}
                    onChange={(e) => handleChange('director_name', e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
                <div className="form-field">
                  <Label>Контактное лицо</Label>
                  <Input
                    value={orgData.contact_person}
                    onChange={(e) => handleChange('contact_person', e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
                <div className="form-field">
                  <Label>Телефон</Label>
                  <Input
                    value={orgData.contact_phone}
                    onChange={(e) => handleChange('contact_phone', e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
                <div className="form-field">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={orgData.contact_email}
                    onChange={(e) => handleChange('contact_email', e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
                <div className="form-field full-width">
                  <Label>Веб-сайт</Label>
                  <Input
                    value={orgData.website}
                    onChange={(e) => handleChange('website', e.target.value)}
                    disabled={!isEditing}
                    placeholder="https://example.com"
                  />
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="details">
            <Card className="section-card">
              <h3 className="section-title">Дополнительная информация</h3>
              <div className="info-section">
                <div className="info-item">
                  <div className="info-icon">
                    <FileText size={20} />
                  </div>
                  <div>
                    <h4>Статус верификации</h4>
                    <p className={`status-badge ${user.documents_verified ? 'verified' : 'pending'}`}>
                      {user.documents_verified ? '✓ Верифицирована' : '⏳ На проверке'}
                    </p>
                  </div>
                </div>
                <div className="info-item">
                  <div className="info-icon">
                    <Users size={20} />
                  </div>
                  <div>
                    <h4>Тип аккаунта</h4>
                    <p className="account-type">
                      {user.role === 'customer' ? 'Заказчик' : 'Подрядчик'}
                    </p>
                  </div>
                </div>
                <div className="info-item">
                  <div className="info-icon">
                    <Mail size={20} />
                  </div>
                  <div>
                    <h4>Дата регистрации</h4>
                    <p>{new Date(user.created_at || Date.now()).toLocaleDateString('ru-RU')}</p>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <style jsx>{`
        .org-profile-container {
          max-width: 1200px;
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

        .header-actions {
          display: flex;
          gap: var(--space-3);
        }

        .edit-actions {
          display: flex;
          gap: var(--space-3);
        }

        .edit-btn, .save-btn {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          background: var(--color-primary);
          color: var(--color-text-inverse);
        }

        .cancel-btn {
          display: flex;
          align-items: center;
          gap: var(--space-2);
        }

        .org-tabs {
          width: 100%;
        }

        .section-card {
          background: var(--color-bg-surface);
          padding: var(--space-8);
          border-radius: var(--radius-lg);
          border: 1px solid var(--color-border);
          box-shadow: var(--shadow-card);
        }

        .section-title {
          font-size: var(--font-size-3xl);
          font-weight: var(--font-weight-semibold);
          color: var(--color-text-dark);
          margin-bottom: var(--space-6);
          padding-bottom: var(--space-4);
          border-bottom: 1px solid var(--color-border);
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: var(--space-5);
        }

        .form-field {
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
        }

        .form-field.full-width {
          grid-column: 1 / -1;
        }

        .info-section {
          display: flex;
          flex-direction: column;
          gap: var(--space-6);
        }

        .info-item {
          display: flex;
          align-items: flex-start;
          gap: var(--space-4);
          padding: var(--space-5);
          background: var(--color-bg-subtle);
          border-radius: var(--radius-lg);
          border: 1px solid var(--color-border);
        }

        .info-icon {
          width: 48px;
          height: 48px;
          background: var(--color-primary-bg);
          border-radius: var(--radius-lg);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--color-primary);
        }

        .info-item h4 {
          font-size: var(--font-size-lg);
          font-weight: var(--font-weight-semibold);
          color: var(--color-text-dark);
          margin-bottom: var(--space-1);
        }

        .info-item p {
          color: var(--color-text-secondary);
          margin: 0;
        }

        .status-badge {
          display: inline-block;
          padding: var(--space-1) var(--space-3);
          border-radius: var(--radius-4xl);
          font-size: var(--font-size-base);
          font-weight: var(--font-weight-semibold);
        }

        .status-badge.verified {
          background: var(--color-success-tint-10);
          color: var(--color-success-alt);
        }

        .status-badge.pending {
          background: var(--color-bg-muted);
          color: var(--color-warning);
        }

        .account-type {
          text-transform: capitalize;
          font-weight: var(--font-weight-semibold);
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

          .edit-actions {
            flex-direction: column;
            width: 100%;
          }
        }
      `}</style>
  </>
  );
};

export default OrganizationProfile;