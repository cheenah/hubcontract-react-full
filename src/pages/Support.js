import React, { useState } from 'react';
import { AppContext } from '@/App';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Send, Phone, Mail, MessageSquare, HelpCircle } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const Support = () => {
  const { user, API } = React.useContext(AppContext);
  const [formData, setFormData] = useState({
    subject: '',
    category: 'general',
    message: '',
    email: user?.email || '',
    phone: user?.phone || ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`${API}/support/ticket`, formData);
      toast.success('Обращение отправлено. Мы свяжемся с вами в ближайшее время.');
      setFormData({
        subject: '',
        category: 'general',
        message: '',
        email: user?.email || '',
        phone: user?.phone || ''
      });
    } catch (error) {
      toast.error('Ошибка при отправке обращения');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="support-container">
        <div className="page-header">
          <div>
            <h1 className="page-title">Поддержка</h1>
            <p className="page-subtitle">Мы всегда готовы помочь вам</p>
          </div>
        </div>

        <div className="support-content">
          {/* Contact Info */}
          <div className="contact-cards">
            <Card className="contact-card">
              <div className="contact-icon phone">
                <Phone size={24} />
              </div>
              <h3 className="contact-title">Телефон</h3>
              <p className="contact-value">+7 (727) 250-0000</p>
              <p className="contact-time">Пн-Пт: 9:00 - 18:00</p>
            </Card>

            <Card className="contact-card">
              <div className="contact-icon email">
                <Mail size={24} />
              </div>
              <h3 className="contact-title">Email</h3>
              <p className="contact-value">support@hubcontract.kz</p>
              <p className="contact-time">Ответ в течение 24 часов</p>
            </Card>

            <Card className="contact-card">
              <div className="contact-icon chat">
                <MessageSquare size={24} />
              </div>
              <h3 className="contact-title">Онлайн чат</h3>
              <p className="contact-value">Мгновенная помощь</p>
              <Button variant="outline" className="chat-btn">
                Начать чат
              </Button>
            </Card>
          </div>

          {/* Support Form */}
          <Card className="form-card">
            <div className="form-header">
              <HelpCircle size={32} className="form-icon" />
              <div>
                <h3 className="form-title">Отправить обращение</h3>
                <p className="form-subtitle">Опишите вашу проблему или вопрос</p>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-field">
                  <Label>Тема обращения</Label>
                  <Input
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="Краткое описание проблемы"
                    required
                  />
                </div>

                <div className="form-field">
                  <Label>Категория</Label>
                  <select
                    className="select-input"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    <option value="general">Общие вопросы</option>
                    <option value="technical">Технические проблемы</option>
                    <option value="billing">Финансовые вопросы</option>
                    <option value="tenders">Вопросы по тендерам</option>
                    <option value="other">Другое</option>
                  </select>
                </div>

                <div className="form-field">
                  <Label>Email для связи</Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>

                <div className="form-field">
                  <Label>Телефон</Label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+7 701 234 5678"
                  />
                </div>

                <div className="form-field full-width">
                  <Label>Подробное описание</Label>
                  <Textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    rows={6}
                    placeholder="Опишите вашу проблему или вопрос подробно..."
                    required
                  />
                </div>
              </div>

              <Button type="submit" disabled={loading} className="submit-btn">
                <Send size={18} />
                {loading ? 'Отправка...' : 'Отправить обращение'}
              </Button>
            </form>
          </Card>

          {/* FAQ */}
          <Card className="faq-card">
            <h3 className="faq-title">Часто задаваемые вопросы</h3>
            <div className="faq-list">
              <div className="faq-item">
                <h4>Как создать тендер?</h4>
                <p>Перейдите в раздел "Мои тендеры" и нажмите кнопку "Создать тендер". Заполните все необходимые поля и опубликуйте тендер.</p>
              </div>
              <div className="faq-item">
                <h4>Как посмотреть заявки на мой тендер?</h4>
                <p>В разделе "Рабочий кабинет" -> "Заявки" вы можете просмотреть все полученные предложения от подрядчиков.</p>
              </div>
              <div className="faq-item">
                <h4>Как связаться с поставщиком?</h4>
                <p>В разделе "Сообщения" вы можете отправить сообщение любому подрядчику, который подал заявку на ваш тендер.</p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <style jsx>{`
        .support-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 24px;
        }

        .page-header {
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

        .support-content {
          display: flex;
          flex-direction: column;
          gap: 32px;
        }

        .contact-cards {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }

        .contact-card {
          padding: 24px;
          text-align: center;
          background: white;
          border: 1px solid var(--border-light);
          border-radius: 8px;
        }

        .contact-icon {
          width: 64px;
          height: 64px;
          margin: 0 auto 16px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .contact-icon.phone {
          background: rgba(59, 130, 246, 0.1);
          color: #3b82f6;
        }

        .contact-icon.email {
          background: rgba(16, 185, 129, 0.1);
          color: #10b981;
        }

        .contact-icon.chat {
          background: rgba(245, 158, 11, 0.1);
          color: #f59e0b;
        }

        .contact-title {
          font-size: 1.125rem;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 8px;
        }

        .contact-value {
          font-size: 1rem;
          font-weight: 600;
          color: var(--primary);
          margin-bottom: 4px;
        }

        .contact-time {
          font-size: 0.875rem;
          color: var(--text-secondary);
        }

        .chat-btn {
          margin-top: 12px;
        }

        .form-card {
          padding: 32px;
          background: white;
          border: 1px solid var(--border-light);
          border-radius: 8px;
        }

        .form-header {
          display: flex;
          gap: 16px;
          align-items: center;
          margin-bottom: 32px;
          padding-bottom: 24px;
          border-bottom: 1px solid var(--border-light);
        }

        .form-icon {
          color: var(--primary);
        }

        .form-title {
          font-size: 1.5rem;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 4px;
        }

        .form-subtitle {
          font-size: 0.875rem;
          color: var(--text-secondary);
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

        .submit-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          background: var(--primary);
          color: white;
        }

        .faq-card {
          padding: 32px;
          background: white;
          border: 1px solid var(--border-light);
          border-radius: 8px;
        }

        .faq-title {
          font-size: 1.5rem;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 24px;
        }

        .faq-list {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .faq-item {
          padding: 20px;
          background: var(--bg-tertiary);
          border-radius: 8px;
          border-left: 3px solid var(--primary);
        }

        .faq-item h4 {
          font-size: 1rem;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 8px;
        }

        .faq-item p {
          font-size: 0.875rem;
          color: var(--text-secondary);
          line-height: 1.6;
          margin: 0;
        }

        @media (max-width: 768px) {
          .contact-cards {
            grid-template-columns: 1fr;
          }

          .form-grid {
            grid-template-columns: 1fr;
          }

          .submit-btn {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </Layout>
  );
};

export default Support;