import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle, Target, Users, TrendingUp, Shield, Award, Clock, DollarSign, FileText, Zap, Building } from 'lucide-react';
import { Button } from '../components/ui/button';

const AboutPlatform = () => {
  const navigate = useNavigate();

  return (
    <div className="about-platform">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-container">
          <div className="hero-content">
            <h1 className="hero-title">
              Платформа для поиска надежных <br/>
              поставщиков и подрядчиков
            </h1>
            <p className="hero-description">
              Централизованная платформа для проведения прозрачных тендеров, 
              объединяющая крупных заказчиков и квалифицированных исполнителей
            </p>
            <div className="hero-actions">
              <Button onClick={() => navigate('/tenders')} className="btn-primary-large">
                Начать работу
                <ArrowRight size={20} />
              </Button>
              <Button onClick={() => navigate('/help')} variant="outline" className="btn-secondary-large">
                Узнать подробнее
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="mission-section">
        <div className="content-container">
          <div className="section-header-center">
            <Target size={48} className="section-icon" />
            <h2 className="section-title">Наша миссия</h2>
            <p className="section-description">
              Создание централизованной, прозрачной и эффективной платформы для проведения 
              тендеров, объединяющей крупных заказчиков и квалифицированных исполнителей
            </p>
          </div>
        </div>
      </section>

      {/* Problems Section */}
      <section className="problems-section">
        <div className="content-container">
          <div className="section-header-left">
            <h2 className="section-title">Проблемы, которые мы решаем</h2>
            <p className="section-subtitle">
              Современный рынок подрядных работ сталкивается с серьезными вызовами
            </p>
          </div>

          <div className="problems-grid">
            <div className="problem-card">
              <div className="problem-icon">
                <Building size={32} />
              </div>
              <h3 className="problem-title">Отсутствие централизованной платформы</h3>
              <p className="problem-description">
                После выигрыша основного контракта нет единого места для размещения тендеров
              </p>
            </div>

            <div className="problem-card">
              <div className="problem-icon">
                <Shield size={32} />
              </div>
              <h3 className="problem-title">Непрозрачность процесса</h3>
              <p className="problem-description">
                Отбор исполнителей происходит непрозрачно, создавая репутационные риски для заказчика
              </p>
            </div>

            <div className="problem-card">
              <div className="problem-icon">
                <Users size={32} />
              </div>
              <h3 className="problem-title">Риски недобросовестных участников</h3>
              <p className="problem-description">
                Отсутствие системы проверки и рейтингов подрядчиков приводит к рискам
              </p>
            </div>

            <div className="problem-card">
              <div className="problem-icon">
                <Target size={32} />
              </div>
              <h3 className="problem-title">Сложность поиска</h3>
              <p className="problem-description">
                Трудно найти квалифицированных подрядчиков с необходимыми компетенциями и опытом
              </p>
            </div>

            <div className="problem-card">
              <div className="problem-icon">
                <DollarSign size={32} />
              </div>
              <h3 className="problem-title">Высокие издержки</h3>
              <p className="problem-description">
                Организация тендерных процедур и документооборот требуют значительных затрат
              </p>
            </div>

            <div className="problem-card">
              <div className="problem-icon">
                <Clock size={32} />
              </div>
              <h3 className="problem-title">Длительные сроки</h3>
              <p className="problem-description">
                Организация и проведение тендеров занимает много времени
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="benefits-section">
        <div className="content-container">
          <div className="section-header-center">
            <h2 className="section-title">Преимущества платформы</h2>
          </div>

          {/* For Contractors */}
          <div className="benefits-group">
            <h3 className="benefits-group-title">
              <Users size={28} />
              Для подрядчиков
            </h3>
            <div className="benefits-list">
              <div className="benefit-item">
                <CheckCircle size={24} className="benefit-icon" />
                <div>
                  <h4 className="benefit-title">Доступ к крупным проектам</h4>
                  <p className="benefit-description">
                    Возможность участвовать в тендерах крупных компаний и получать заказы от ведущих игроков рынка
                  </p>
                </div>
              </div>

              <div className="benefit-item">
                <CheckCircle size={24} className="benefit-icon" />
                <div>
                  <h4 className="benefit-title">Равные условия</h4>
                  <p className="benefit-description">
                    Прозрачная конкуренция без предвзятости, где побеждает лучшее предложение по качеству и цене
                  </p>
                </div>
              </div>

              <div className="benefit-item">
                <CheckCircle size={24} className="benefit-icon" />
                <div>
                  <h4 className="benefit-title">Снижение затрат на поиск заказов</h4>
                  <p className="benefit-description">
                    Централизованная площадка с актуальными тендерами избавляет от необходимости активного поиска клиентов
                  </p>
                </div>
              </div>

              <div className="benefit-item">
                <CheckCircle size={24} className="benefit-icon" />
                <div>
                  <h4 className="benefit-title">Простота участия</h4>
                  <p className="benefit-description">
                    Удобный интерфейс для подачи заявок и загрузки документов, минимум бюрократии
                  </p>
                </div>
              </div>

              <div className="benefit-item">
                <CheckCircle size={24} className="benefit-icon" />
                <div>
                  <h4 className="benefit-title">Быстрые расчеты</h4>
                  <p className="benefit-description">
                    Прозрачные условия оплаты и четкие сроки, защита интересов через платформу
                  </p>
                </div>
              </div>

              <div className="benefit-item">
                <CheckCircle size={24} className="benefit-icon" />
                <div>
                  <h4 className="benefit-title">Расширение клиентской базы</h4>
                  <p className="benefit-description">
                    Выход на новых заказчиков из разных отраслей и регионов
                  </p>
                </div>
              </div>

              <div className="benefit-item">
                <CheckCircle size={24} className="benefit-icon" />
                <div>
                  <h4 className="benefit-title">Репутация</h4>
                  <p className="benefit-description">
                    Накопление положительных отзывов и повышение рейтинга на платформе для привлечения новых клиентов
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* For Companies */}
          <div className="benefits-group">
            <h3 className="benefits-group-title">
              <Building size={28} />
              Для крупных компаний и генеральных подрядчиков
            </h3>
            <div className="benefits-list">
              <div className="benefit-item">
                <CheckCircle size={24} className="benefit-icon" />
                <div>
                  <h4 className="benefit-title">Консалтинговая поддержка</h4>
                  <p className="benefit-description">
                    Помощь в подготовке заявок и сопровождение участия в тендерах для повышения шансов на победу
                  </p>
                </div>
              </div>

              <div className="benefit-item">
                <CheckCircle size={24} className="benefit-icon" />
                <div>
                  <h4 className="benefit-title">Экономия времени</h4>
                  <p className="benefit-description">
                    Автоматизация процесса организации тендеров, сокращение административной нагрузки на персонал
                  </p>
                </div>
              </div>

              <div className="benefit-item">
                <CheckCircle size={24} className="benefit-icon" />
                <div>
                  <h4 className="benefit-title">База проверенных подрядчиков</h4>
                  <p className="benefit-description">
                    Широкий выбор специализированных компаний с подтвержденной квалификацией и опытом
                  </p>
                </div>
              </div>

              <div className="benefit-item">
                <CheckCircle size={24} className="benefit-icon" />
                <div>
                  <h4 className="benefit-title">Прозрачность</h4>
                  <p className="benefit-description">
                    Полная документация всех этапов тендера, защита от коррупционных рисков и претензий
                  </p>
                </div>
              </div>

              <div className="benefit-item">
                <CheckCircle size={24} className="benefit-icon" />
                <div>
                  <h4 className="benefit-title">Снижение издержек</h4>
                  <p className="benefit-description">
                    Минимальная комиссия 1% вместо затрат на собственную инфраструктуру и персонал
                  </p>
                </div>
              </div>

              <div className="benefit-item">
                <CheckCircle size={24} className="benefit-icon" />
                <div>
                  <h4 className="benefit-title">Конкурентные цены</h4>
                  <p className="benefit-description">
                    Открытая конкуренция среди подрядчиков снижает стоимость работ на 5-15%
                  </p>
                </div>
              </div>

              <div className="benefit-item">
                <CheckCircle size={24} className="benefit-icon" />
                <div>
                  <h4 className="benefit-title">Юридическая защита</h4>
                  <p className="benefit-description">
                    Все документы хранятся на платформе, защита интересов сторон в спорных ситуациях
                  </p>
                </div>
              </div>

              <div className="benefit-item">
                <CheckCircle size={24} className="benefit-icon" />
                <div>
                  <h4 className="benefit-title">Репутационные преимущества</h4>
                  <p className="benefit-description">
                    Демонстрация прозрачности бизнес-процессов для партнеров и регуляторов
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="content-container">
          <div className="section-header-center">
            <Zap size={48} className="section-icon" />
            <h2 className="section-title">Функционал платформы</h2>
          </div>

          <div className="features-grid">
            <div className="feature-card-about">
              <FileText size={40} className="feature-card-icon" />
              <h3 className="feature-card-title">Документооборот</h3>
              <p className="feature-card-description">
                Загрузка и хранение документации: сметы, ТЗ, чертежи, контракты
              </p>
            </div>

            <div className="feature-card-about">
              <Shield size={40} className="feature-card-icon" />
              <h3 className="feature-card-title">Электронная подпись</h3>
              <p className="feature-card-description">
                Интеграция с системами электронной подписи для юридической значимости
              </p>
            </div>

            <div className="feature-card-about">
              <Users size={40} className="feature-card-icon" />
              <h3 className="feature-card-title">Личные кабинеты</h3>
              <p className="feature-card-description">
                Удобные кабинеты для заказчиков и подрядчиков с полным функционалом
              </p>
            </div>

            <div className="feature-card-about">
              <Award size={40} className="feature-card-icon" />
              <h3 className="feature-card-title">Система рейтингов</h3>
              <p className="feature-card-description">
                Рейтинги и отзывы для оценки надежности участников
              </p>
            </div>

            <div className="feature-card-about">
              <TrendingUp size={40} className="feature-card-icon" />
              <h3 className="feature-card-title">Аналитика</h3>
              <p className="feature-card-description">
                Инструменты аналитики и отчетности по тендерам
              </p>
            </div>

            <div className="feature-card-about">
              <Zap size={40} className="feature-card-icon" />
              <h3 className="feature-card-title">Уведомления</h3>
              <p className="feature-card-description">
                Система уведомлений: email, SMS, push-уведомления
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="content-container">
          <div className="cta-content">
            <h2 className="cta-title">Готовы начать?</h2>
            <p className="cta-description">
              Присоединяйтесь к платформе и получите доступ к крупным проектам уже сегодня
            </p>
            <div className="cta-actions">
              <Button onClick={() => window.location.href = 'tel:+77028700022'} className="btn-cta-primary">
                Связаться с нами
              </Button>
              <Button onClick={() => navigate('/tenders')} variant="outline" className="btn-cta-secondary">
                Перейти к тендерам
              </Button>
            </div>
          </div>
        </div>
      </section>

      <style jsx>{`
        .about-platform {
          min-height: 100vh;
          background: linear-gradient(180deg, #ffffff 0%, #f9fafb 100%);
        }

        /* Hero Section */
        .hero-section {
          background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
          color: white;
          padding: 80px 0;
        }

        .hero-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 32px;
        }

        .hero-content {
          max-width: 900px;
          margin: 0 auto;
          text-align: center;
        }

        .hero-title {
          font-size: clamp(2.5rem, 5vw, 3.5rem);
          font-weight: 700;
          line-height: 1.2;
          margin-bottom: 24px;
          color: white;
        }

        .hero-description {
          font-size: 1.25rem;
          line-height: 1.7;
          margin-bottom: 40px;
          opacity: 0.95;
        }

        .hero-actions {
          display: flex;
          gap: 16px;
          justify-content: center;
          flex-wrap: wrap;
        }

        .btn-primary-large {
          background: #00B300;
          color: white;
          padding: 14px 32px;
          font-size: 16px;
          font-weight: 600;
          border-radius: 8px;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.3s;
        }

        .btn-primary-large:hover {
          background: #009900;
          transform: translateY(-2px);
          box-shadow: 0 8px 16px rgba(0, 179, 0, 0.3);
        }

        .btn-secondary-large {
          background: white;
          color: #2563eb;
          padding: 14px 32px;
          font-size: 16px;
          font-weight: 600;
          border-radius: 8px;
        }

        .btn-secondary-large:hover {
          background: #f3f4f6;
        }

        /* Common Sections */
        .content-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 80px 32px;
        }

        .section-header-center {
          text-align: center;
          margin-bottom: 60px;
        }

        .section-header-left {
          margin-bottom: 60px;
        }

        .section-icon {
          color: #2563eb;
          margin-bottom: 16px;
        }

        .section-title {
          font-size: clamp(2rem, 4vw, 2.5rem);
          font-weight: 700;
          color: #1a202c;
          margin-bottom: 16px;
        }

        .section-subtitle {
          font-size: 1.125rem;
          color: #4a5568;
          margin-top: 12px;
        }

        .section-description {
          font-size: 1.125rem;
          color: #4a5568;
          max-width: 800px;
          margin: 0 auto;
          line-height: 1.7;
        }

        /* Mission Section */
        .mission-section {
          background: white;
        }

        /* Problems Section */
        .problems-section {
          background: #f9fafb;
        }

        .problems-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 24px;
        }

        .problem-card {
          background: white;
          padding: 32px;
          border-radius: 12px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
          transition: all 0.3s;
        }

        .problem-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
        }

        .problem-icon {
          width: 64px;
          height: 64px;
          background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          margin-bottom: 20px;
        }

        .problem-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: #1a202c;
          margin-bottom: 12px;
        }

        .problem-description {
          color: #4a5568;
          line-height: 1.6;
        }

        /* Benefits Section */
        .benefits-section {
          background: white;
        }

        .benefits-group {
          margin-bottom: 60px;
        }

        .benefits-group:last-child {
          margin-bottom: 0;
        }

        .benefits-group-title {
          font-size: 1.75rem;
          font-weight: 700;
          color: #2563eb;
          margin-bottom: 32px;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .benefits-list {
          display: grid;
          gap: 20px;
        }

        .benefit-item {
          display: flex;
          gap: 16px;
          padding: 20px;
          background: #f9fafb;
          border-radius: 8px;
          transition: all 0.3s;
        }

        .benefit-item:hover {
          background: #f3f4f6;
        }

        .benefit-icon {
          color: #00B300;
          flex-shrink: 0;
          margin-top: 4px;
        }

        .benefit-title {
          font-size: 1.125rem;
          font-weight: 600;
          color: #1a202c;
          margin-bottom: 8px;
        }

        .benefit-description {
          color: #4a5568;
          line-height: 1.6;
        }

        /* Features Section */
        .features-section {
          background: white;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 32px;
        }

        .feature-card-about {
          text-align: center;
          padding: 32px;
          background: #f9fafb;
          border-radius: 12px;
          transition: all 0.3s;
        }

        .feature-card-about:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
          background: white;
        }

        .feature-card-icon {
          color: #2563eb;
          margin-bottom: 16px;
        }

        .feature-card-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: #1a202c;
          margin-bottom: 12px;
        }

        .feature-card-description {
          color: #4a5568;
          line-height: 1.6;
        }

        /* CTA Section */
        .cta-section {
          background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
          color: white;
        }

        .cta-content {
          text-align: center;
          max-width: 800px;
          margin: 0 auto;
        }

        .cta-title {
          font-size: clamp(2rem, 4vw, 2.75rem);
          font-weight: 700;
          margin-bottom: 16px;
        }

        .cta-description {
          font-size: 1.25rem;
          margin-bottom: 32px;
          opacity: 0.95;
        }

        .cta-actions {
          display: flex;
          gap: 16px;
          justify-content: center;
          flex-wrap: wrap;
        }

        .btn-cta-primary {
          background: #00B300;
          color: white;
          padding: 14px 32px;
          font-size: 16px;
          font-weight: 600;
          border-radius: 8px;
        }

        .btn-cta-primary:hover {
          background: #009900;
        }

        .btn-cta-secondary {
          background: white;
          color: #2563eb;
          padding: 14px 32px;
          font-size: 16px;
          font-weight: 600;
          border-radius: 8px;
        }

        .btn-cta-secondary:hover {
          background: #f3f4f6;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .content-container {
            padding: 60px 20px;
          }

          .problems-grid {
            grid-template-columns: 1fr;
          }

          .roadmap-item {
            flex-direction: column;
          }

          .features-grid {
            grid-template-columns: 1fr;
          }

          .hero-actions,
          .cta-actions {
            flex-direction: column;
            width: 100%;
          }

          .hero-actions button,
          .cta-actions button {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default AboutPlatform;
