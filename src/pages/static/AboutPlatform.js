import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle, Target, Users, TrendingUp, Shield, Award, Clock, DollarSign, FileText, Zap, Building } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
          background: var(--color-bg-subtle);
        }

        /* Hero Section */
        .hero-section {
          background: var(--color-primary-gradient);
          color: var(--color-text-inverse);
          padding: var(--space-20) 0;
        }

        .hero-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 var(--space-8);
        }

        .hero-content {
          max-width: 900px;
          margin: 0 auto;
          text-align: center;
        }

        .hero-title {
          font-size: var(--font-size-7xl);
          font-weight: var(--font-weight-bold);
          line-height: var(--line-height-tight);
          margin-bottom: var(--space-6);
          color: var(--color-text-inverse);
        }

        .hero-description {
          font-size: var(--font-size-xl3);
          line-height: var(--line-height-relaxed);
          margin-bottom: var(--space-10);
          opacity: 0.95;
        }

        .hero-actions {
          display: flex;
          gap: var(--space-4);
          justify-content: center;
          flex-wrap: wrap;
        }

        .btn-primary-large {
          background: var(--color-success);
          color: var(--color-text-inverse);
          padding: var(--space-3-5) var(--space-8);
          font-size: var(--font-size-lg);
          font-weight: var(--font-weight-semibold);
          border-radius: var(--radius-lg);
          display: flex;
          align-items: center;
          gap: var(--space-2);
          transition: all var(--transition-slow);
        }

        .btn-primary-large:hover {
          background: var(--color-success-dark);
          transform: translateY(-2px);
          box-shadow: var(--shadow-lg);
        }

        .btn-secondary-large {
          background: var(--color-bg-surface);
          color: var(--color-primary);
          padding: var(--space-3-5) var(--space-8);
          font-size: var(--font-size-lg);
          font-weight: var(--font-weight-semibold);
          border-radius: var(--radius-lg);
        }

        .btn-secondary-large:hover {
          background: var(--color-bg-muted);
        }

        /* Common Sections */
        .content-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: var(--space-20) var(--space-8);
        }

        .section-header-center {
          text-align: center;
          margin-bottom: var(--space-12);
        }

        .section-header-left {
          margin-bottom: var(--space-12);
        }

        .section-icon {
          color: var(--color-primary);
          margin-bottom: var(--space-4);
        }

        .section-title {
          font-size: var(--font-size-6xl);
          font-weight: var(--font-weight-bold);
          color: var(--color-text-dark2);
          margin-bottom: var(--space-4);
        }

        .section-subtitle {
          font-size: var(--font-size-lg);
          color: var(--color-text-tertiary);
          margin-top: var(--space-3);
        }

        .section-description {
          font-size: var(--font-size-lg);
          color: var(--color-text-tertiary);
          max-width: 800px;
          margin: 0 auto;
          line-height: var(--line-height-relaxed);
        }

        /* Mission Section */
        .mission-section {
          background: var(--color-bg-surface);
        }

        /* Problems Section */
        .problems-section {
          background: var(--color-bg-subtle);
        }

        .problems-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: var(--space-6);
        }

        .problem-card {
          background: var(--color-bg-surface);
          padding: var(--space-8);
          border-radius: var(--radius-2xl);
          box-shadow: var(--shadow-xs);
          transition: all var(--transition-slow);
        }

        .problem-card:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-xl);
        }

        .problem-icon {
          width: 64px;
          height: 64px;
          background: var(--color-primary-gradient);
          border-radius: var(--radius-2xl);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--color-text-inverse);
          margin-bottom: var(--space-5);
        }

        .problem-title {
          font-size: var(--font-size-xl3);
          font-weight: var(--font-weight-semibold);
          color: var(--color-text-dark2);
          margin-bottom: var(--space-3);
        }

        .problem-description {
          color: var(--color-text-tertiary);
          line-height: var(--line-height-relaxed);
        }

        /* Benefits Section */
        .benefits-section {
          background: var(--color-bg-surface);
        }

        .benefits-group {
          margin-bottom: var(--space-12);
        }

        .benefits-group:last-child {
          margin-bottom: 0;
        }

        .benefits-group-title {
          font-size: var(--font-size-4xl);
          font-weight: var(--font-weight-bold);
          color: var(--color-primary);
          margin-bottom: var(--space-8);
          display: flex;
          align-items: center;
          gap: var(--space-3);
        }

        .benefits-list {
          display: grid;
          gap: var(--space-5);
        }

        .benefit-item {
          display: flex;
          gap: var(--space-4);
          padding: var(--space-5);
          background: var(--color-bg-subtle);
          border-radius: var(--radius-lg);
          transition: all var(--transition-slow);
        }

        .benefit-item:hover {
          background: var(--color-bg-muted);
        }

        .benefit-icon {
          color: var(--color-success);
          flex-shrink: 0;
          margin-top: var(--space-1);
        }

        .benefit-title {
          font-size: var(--font-size-lg);
          font-weight: var(--font-weight-semibold);
          color: var(--color-text-dark2);
          margin-bottom: var(--space-2);
        }

        .benefit-description {
          color: var(--color-text-tertiary);
          line-height: var(--line-height-relaxed);
        }

        /* Features Section */
        .features-section {
          background: var(--color-bg-surface);
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: var(--space-8);
        }

        .feature-card-about {
          text-align: center;
          padding: var(--space-8);
          background: var(--color-bg-subtle);
          border-radius: var(--radius-2xl);
          transition: all var(--transition-slow);
        }

        .feature-card-about:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-xl);
          background: var(--color-bg-surface);
        }

        .feature-card-icon {
          color: var(--color-primary);
          margin-bottom: var(--space-4);
        }

        .feature-card-title {
          font-size: var(--font-size-xl3);
          font-weight: var(--font-weight-semibold);
          color: var(--color-text-dark2);
          margin-bottom: var(--space-3);
        }

        .feature-card-description {
          color: var(--color-text-tertiary);
          line-height: var(--line-height-relaxed);
        }

        /* CTA Section */
        .cta-section {
          background: var(--color-primary-gradient);
          color: var(--color-text-inverse);
        }

        .cta-content {
          text-align: center;
          max-width: 800px;
          margin: 0 auto;
        }

        .cta-title {
          font-size: var(--font-size-6xl);
          font-weight: var(--font-weight-bold);
          margin-bottom: var(--space-4);
        }

        .cta-description {
          font-size: var(--font-size-xl3);
          margin-bottom: var(--space-8);
          opacity: 0.95;
        }

        .cta-actions {
          display: flex;
          gap: var(--space-4);
          justify-content: center;
          flex-wrap: wrap;
        }

        .btn-cta-primary {
          background: var(--color-success);
          color: var(--color-text-inverse);
          padding: var(--space-3-5) var(--space-8);
          font-size: var(--font-size-lg);
          font-weight: var(--font-weight-semibold);
          border-radius: var(--radius-lg);
        }

        .btn-cta-primary:hover {
          background: var(--color-success-dark);
        }

        .btn-cta-secondary {
          background: var(--color-bg-surface);
          color: var(--color-primary);
          padding: var(--space-3-5) var(--space-8);
          font-size: var(--font-size-lg);
          font-weight: var(--font-weight-semibold);
          border-radius: var(--radius-lg);
        }

        .btn-cta-secondary:hover {
          background: var(--color-bg-muted);
        }

        /* Responsive */
        @media (max-width: 768px) {
          .content-container {
            padding: var(--space-12) var(--space-5);
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
