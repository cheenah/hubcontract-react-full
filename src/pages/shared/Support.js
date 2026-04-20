import React, { useState } from 'react';
import { AppContext } from '@/App';
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
    <>
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
          padding: var(--space-6);
        }

        .page-header {
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

        .support-content {
          display: flex;
          flex-direction: column;
          gap: var(--space-8);
        }

        .contact-cards {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: var(--space-6);
        }

        .contact-card {
          padding: var(--space-6);
          text-align: center;
          background: var(--color-bg-surface);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
        }

        .contact-icon {
          width: 64px;
          height: 64px;
          margin: 0 auto var(--space-4);
          border-radius: var(--radius-4xl);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .contact-icon.phone {
          background: var(--color-primary-bg);
          color: var(--color-primary-light);
        }

        .contact-icon.email {
          background: var(--color-success-tint-10);
          color: var(--color-success-alt);
        }

        .contact-icon.chat {
          background: var(--color-bg-muted);
          color: var(--color-warning);
        }

        .contact-title {
          font-size: var(--font-size-xl3);
          font-weight: var(--font-weight-semibold);
          color: var(--color-text-dark);
          margin-bottom: var(--space-2);
        }

        .contact-value {
          font-size: var(--font-size-lg);
          font-weight: var(--font-weight-semibold);
          color: var(--color-primary);
          margin-bottom: var(--space-1);
        }

        .contact-time {
          font-size: var(--font-size-base);
          color: var(--color-text-secondary);
        }

        .chat-btn {
          margin-top: var(--space-3);
        }

        .form-card {
          padding: var(--space-8);
          background: var(--color-bg-surface);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
        }

        .form-header {
          display: flex;
          gap: var(--space-4);
          align-items: center;
          margin-bottom: var(--space-8);
          padding-bottom: var(--space-6);
          border-bottom: 1px solid var(--color-border);
        }

        .form-icon {
          color: var(--color-primary);
        }

        .form-title {
          font-size: var(--font-size-3xl);
          font-weight: var(--font-weight-semibold);
          color: var(--color-text-dark);
          margin-bottom: var(--space-1);
        }

        .form-subtitle {
          font-size: var(--font-size-base);
          color: var(--color-text-secondary);
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

        .submit-btn {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          background: var(--color-primary);
          color: var(--color-text-inverse);
        }

        .faq-card {
          padding: var(--space-8);
          background: var(--color-bg-surface);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
        }

        .faq-title {
          font-size: var(--font-size-3xl);
          font-weight: var(--font-weight-semibold);
          color: var(--color-text-dark);
          margin-bottom: var(--space-6);
        }

        .faq-list {
          display: flex;
          flex-direction: column;
          gap: var(--space-6);
        }

        .faq-item {
          padding: var(--space-5);
          background: var(--color-bg-subtle);
          border-radius: var(--radius-lg);
          border-left: 3px solid var(--color-primary);
        }

        .faq-item h4 {
          font-size: var(--font-size-lg);
          font-weight: var(--font-weight-semibold);
          color: var(--color-text-dark);
          margin-bottom: var(--space-2);
        }

        .faq-item p {
          font-size: var(--font-size-base);
          color: var(--color-text-secondary);
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
  </>
  );
};

export default Support;