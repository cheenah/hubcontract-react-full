import React, { useState } from 'react';
import { AppContext } from '@/App';
import { useLanguage } from '@/context/LanguageContext';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings as SettingsIcon, Bell, Lock, Globe, Mail, Save } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const Settings = () => {
  const { user, API } = React.useContext(AppContext);
  const { currentLanguage, setLanguage } = useLanguage();
  const [settings, setSettings] = useState({
    notifications: {
      email_new_bid: true,
      email_deadline: true,
      email_contract: true,
      email_message: true,
      push_new_bid: true,
      push_deadline: true,
      push_contract: false,
      push_message: true,
      sms_important: false
    },
    privacy: {
      public_profile: false,
      show_contact: true,
      show_history: false
    },
    preferences: {
      language: currentLanguage,
      timezone: 'Asia/Almaty',
      date_format: 'DD.MM.YYYY',
      currency: 'KZT'
    },
    security: {
      two_factor_enabled: false,
      session_timeout: 30
    }
  });

  const handleSaveSettings = async () => {
    try {
      await axios.put(`${API}/settings`, settings);
      toast.success('Настройки успешно сохранены');
      
      // Update language if changed
      if (settings.preferences.language !== currentLanguage) {
        setLanguage(settings.preferences.language);
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Ошибка при сохранении настроек');
    }
  };

  const handleNotificationToggle = (category, key) => {
    setSettings({
      ...settings,
      notifications: {
        ...settings.notifications,
        [`${category}_${key}`]: !settings.notifications[`${category}_${key}`]
      }
    });
  };

  const handlePrivacyToggle = (key) => {
    setSettings({
      ...settings,
      privacy: {
        ...settings.privacy,
        [key]: !settings.privacy[key]
      }
    });
  };

  const handlePreferenceChange = (key, value) => {
    setSettings({
      ...settings,
      preferences: {
        ...settings.preferences,
        [key]: value
      }
    });
  };

  const handleSecurityToggle = (key) => {
    setSettings({
      ...settings,
      security: {
        ...settings.security,
        [key]: !settings.security[key]
      }
    });
  };

  return (
    <Layout>
      <div className="settings-container">
        <div className="page-header">
          <div>
            <h1 className="page-title">Настройки</h1>
            <p className="page-subtitle">Управление настройками аккаунта и системы</p>
          </div>
          <Button onClick={handleSaveSettings} className="save-btn">
            <Save size={18} />
            Сохранить изменения
          </Button>
        </div>

        <Tabs defaultValue="notifications" className="settings-tabs">
          <TabsList>
            <TabsTrigger value="notifications">
              <Bell size={18} />
              Уведомления
            </TabsTrigger>
            <TabsTrigger value="preferences">
              <Globe size={18} />
              Предпочтения
            </TabsTrigger>
            <TabsTrigger value="privacy">
              <SettingsIcon size={18} />
              Конфиденциальность
            </TabsTrigger>
            <TabsTrigger value="security">
              <Lock size={18} />
              Безопасность
            </TabsTrigger>
          </TabsList>

          <TabsContent value="notifications">
            <Card className="settings-card">
              <h3 className="card-title">Настройки уведомлений</h3>
              <p className="card-description">
                Управляйте способами получения уведомлений о важных событиях
              </p>

              <div className="settings-section">
                <h4 className="section-title">
                  <Mail size={18} />
                  Email уведомления
                </h4>
                <div className="settings-list">
                  <div className="setting-item">
                    <div className="setting-info">
                      <Label>Новые заявки</Label>
                      <p className="setting-description">Получать email при поступлении новых заявок</p>
                    </div>
                    <Switch
                      checked={settings.notifications.email_new_bid}
                      onCheckedChange={() => handleNotificationToggle('email', 'new_bid')}
                    />
                  </div>

                  <div className="setting-item">
                    <div className="setting-info">
                      <Label>Истечение сроков</Label>
                      <p className="setting-description">Напоминания о приближении дедлайнов</p>
                    </div>
                    <Switch
                      checked={settings.notifications.email_deadline}
                      onCheckedChange={() => handleNotificationToggle('email', 'deadline')}
                    />
                  </div>

                  <div className="setting-item">
                    <div className="setting-info">
                      <Label>Договоры</Label>
                      <p className="setting-description">Уведомления о подписании и изменении договоров</p>
                    </div>
                    <Switch
                      checked={settings.notifications.email_contract}
                      onCheckedChange={() => handleNotificationToggle('email', 'contract')}
                    />
                  </div>

                  <div className="setting-item">
                    <div className="setting-info">
                      <Label>Сообщения</Label>
                      <p className="setting-description">Уведомления о новых сообщениях</p>
                    </div>
                    <Switch
                      checked={settings.notifications.email_message}
                      onCheckedChange={() => handleNotificationToggle('email', 'message')}
                    />
                  </div>
                </div>
              </div>

              <div className="settings-section">
                <h4 className="section-title">
                  <Bell size={18} />
                  Push-уведомления
                </h4>
                <div className="settings-list">
                  <div className="setting-item">
                    <div className="setting-info">
                      <Label>Новые заявки</Label>
                      <p className="setting-description">Мгновенные уведомления о новых заявках</p>
                    </div>
                    <Switch
                      checked={settings.notifications.push_new_bid}
                      onCheckedChange={() => handleNotificationToggle('push', 'new_bid')}
                    />
                  </div>

                  <div className="setting-item">
                    <div className="setting-info">
                      <Label>Истечение сроков</Label>
                      <p className="setting-description">Напоминания о дедлайнах</p>
                    </div>
                    <Switch
                      checked={settings.notifications.push_deadline}
                      onCheckedChange={() => handleNotificationToggle('push', 'deadline')}
                    />
                  </div>

                  <div className="setting-item">
                    <div className="setting-info">
                      <Label>Договоры</Label>
                      <p className="setting-description">Обновления по договорам</p>
                    </div>
                    <Switch
                      checked={settings.notifications.push_contract}
                      onCheckedChange={() => handleNotificationToggle('push', 'contract')}
                    />
                  </div>

                  <div className="setting-item">
                    <div className="setting-info">
                      <Label>Сообщения</Label>
                      <p className="setting-description">Новые сообщения в диалогах</p>
                    </div>
                    <Switch
                      checked={settings.notifications.push_message}
                      onCheckedChange={() => handleNotificationToggle('push', 'message')}
                    />
                  </div>
                </div>
              </div>

              <div className="settings-section">
                <h4 className="section-title">SMS уведомления</h4>
                <div className="settings-list">
                  <div className="setting-item">
                    <div className="setting-info">
                      <Label>Важные события</Label>
                      <p className="setting-description">SMS о критически важных событиях</p>
                    </div>
                    <Switch
                      checked={settings.notifications.sms_important}
                      onCheckedChange={() => handleNotificationToggle('sms', 'important')}
                    />
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="preferences">
            <Card className="settings-card">
              <h3 className="card-title">Предпочтения</h3>
              <p className="card-description">
                Персонализация интерфейса и форматов отображения
              </p>

              <div className="settings-section">
                <div className="form-grid">
                  <div className="form-field">
                    <Label>Язык интерфейса</Label>
                    <select
                      className="select-input"
                      value={settings.preferences.language}
                      onChange={(e) => handlePreferenceChange('language', e.target.value)}
                    >
                      <option value="ru">Русский</option>
                      <option value="kk">Қазақша</option>
                      <option value="en">English</option>
                    </select>
                  </div>

                  <div className="form-field">
                    <Label>Часовой пояс</Label>
                    <select
                      className="select-input"
                      value={settings.preferences.timezone}
                      onChange={(e) => handlePreferenceChange('timezone', e.target.value)}
                    >
                      <option value="Asia/Almaty">Алматы (UTC+6)</option>
                      <option value="Asia/Aqtobe">Актобе (UTC+5)</option>
                      <option value="Europe/Moscow">Москва (UTC+3)</option>
                    </select>
                  </div>

                  <div className="form-field">
                    <Label>Формат даты</Label>
                    <select
                      className="select-input"
                      value={settings.preferences.date_format}
                      onChange={(e) => handlePreferenceChange('date_format', e.target.value)}
                    >
                      <option value="DD.MM.YYYY">ДД.МM.ГГГГ (31.12.2025)</option>
                      <option value="MM/DD/YYYY">MM/ДД/ГГГГ (12/31/2025)</option>
                      <option value="YYYY-MM-DD">ГГГГ-MM-ДД (2025-12-31)</option>
                    </select>
                  </div>

                  <div className="form-field">
                    <Label>Валюта</Label>
                    <select
                      className="select-input"
                      value={settings.preferences.currency}
                      onChange={(e) => handlePreferenceChange('currency', e.target.value)}
                    >
                      <option value="KZT">Тенге (₸)</option>
                      <option value="USD">Доллар ($)</option>
                      <option value="EUR">Евро (€)</option>
                      <option value="RUB">Рубль (₽)</option>
                    </select>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="privacy">
            <Card className="settings-card">
              <h3 className="card-title">Конфиденциальность</h3>
              <p className="card-description">
                Управление видимостью вашей информации
              </p>

              <div className="settings-section">
                <div className="settings-list">
                  <div className="setting-item">
                    <div className="setting-info">
                      <Label>Публичный профиль</Label>
                      <p className="setting-description">
                        Разрешить другим пользователям видеть ваш профиль организации
                      </p>
                    </div>
                    <Switch
                      checked={settings.privacy.public_profile}
                      onCheckedChange={() => handlePrivacyToggle('public_profile')}
                    />
                  </div>

                  <div className="setting-item">
                    <div className="setting-info">
                      <Label>Показывать контакты</Label>
                      <p className="setting-description">
                        Отображать контактную информацию в профиле
                      </p>
                    </div>
                    <Switch
                      checked={settings.privacy.show_contact}
                      onCheckedChange={() => handlePrivacyToggle('show_contact')}
                    />
                  </div>

                  <div className="setting-item">
                    <div className="setting-info">
                      <Label>История тендеров</Label>
                      <p className="setting-description">
                        Делать историю ваших тендеров доступной для просмотра
                      </p>
                    </div>
                    <Switch
                      checked={settings.privacy.show_history}
                      onCheckedChange={() => handlePrivacyToggle('show_history')}
                    />
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <Card className="settings-card">
              <h3 className="card-title">Безопасность</h3>
              <p className="card-description">
                Управление параметрами безопасности аккаунта
              </p>

              <div className="settings-section">
                <div className="settings-list">
                  <div className="setting-item">
                    <div className="setting-info">
                      <Label>Двухфакторная аутентификация</Label>
                      <p className="setting-description">
                        Дополнительный уровень защиты вашего аккаунта
                      </p>
                    </div>
                    <Switch
                      checked={settings.security.two_factor_enabled}
                      onCheckedChange={() => handleSecurityToggle('two_factor_enabled')}
                    />
                  </div>

                  <div className="setting-item full-width">
                    <div className="setting-info">
                      <Label>Время автовыхода (минуты)</Label>
                      <p className="setting-description">
                        Автоматический выход из системы при неактивности
                      </p>
                    </div>
                    <Input
                      type="number"
                      value={settings.security.session_timeout}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          security: {
                            ...settings.security,
                            session_timeout: parseInt(e.target.value)
                          }
                        })
                      }
                      className="timeout-input"
                    />
                  </div>
                </div>

                <div className="security-actions">
                  <Button variant="outline" className="security-btn">
                    <Lock size={18} />
                    Изменить пароль
                  </Button>
                  <Button variant="outline" className="security-btn">
                    Активные сессии
                  </Button>
                  <Button variant="outline" className="security-btn danger">
                    История входов
                  </Button>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <style jsx>{`
        .settings-container {
          max-width: 1000px;
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

        .save-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          background: var(--primary);
          color: white;
        }

        .settings-tabs {
          width: 100%;
        }

        .settings-card {
          padding: 32px;
          background: white;
          border: 1px solid var(--border-light);
          border-radius: 8px;
        }

        .card-title {
          font-size: 1.5rem;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 8px;
        }

        .card-description {
          font-size: 0.875rem;
          color: var(--text-secondary);
          margin-bottom: 32px;
        }

        .settings-section {
          margin-bottom: 32px;
        }

        .settings-section:last-child {
          margin-bottom: 0;
        }

        .section-title {
          font-size: 1.125rem;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .settings-list {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .setting-item {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 20px;
          padding: 20px;
          background: var(--bg-tertiary);
          border-radius: 8px;
          border: 1px solid var(--border-light);
        }

        .setting-item.full-width {
          flex-direction: column;
          align-items: stretch;
        }

        .setting-info {
          flex: 1;
        }

        .setting-info Label {
          font-size: 1rem;
          font-weight: 600;
          color: var(--text-primary);
          display: block;
          margin-bottom: 4px;
        }

        .setting-description {
          font-size: 0.875rem;
          color: var(--text-secondary);
          line-height: 1.5;
          margin: 0;
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
        }

        .form-field {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .select-input {
          width: 100%;
          padding: 8px 12px;
          border: 1px solid var(--border-medium);
          border-radius: 6px;
          background: white;
          font-size: 0.875rem;
          color: var(--text-primary);
          cursor: pointer;
        }

        .select-input:focus {
          outline: none;
          border-color: var(--primary);
        }

        .timeout-input {
          max-width: 150px;
        }

        .security-actions {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          margin-top: 24px;
          padding-top: 24px;
          border-top: 1px solid var(--border-light);
        }

        .security-btn {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .security-btn.danger {
          color: #ef4444;
          border-color: #ef4444;
        }

        .security-btn.danger:hover {
          background: rgba(239, 68, 68, 0.1);
        }

        @media (max-width: 768px) {
          .page-header {
            flex-direction: column;
            gap: 16px;
            align-items: flex-start;
          }

          .save-btn {
            width: 100%;
            justify-content: center;
          }

          .setting-item {
            flex-direction: column;
            gap: 12px;
          }

          .form-grid {
            grid-template-columns: 1fr;
          }

          .security-actions {
            flex-direction: column;
          }

          .security-btn {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </Layout>
  );
};

export default Settings;
