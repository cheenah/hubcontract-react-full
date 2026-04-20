import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import clsx from 'clsx';

const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      question: 'Что такое HubContract и как работает платформа?',
      answer: 'HubContract - это электронная платформа для поиска надежных поставщиков и подрядчиков. Мы соединяем заказчиков с проверенными исполнителями через прозрачную систему тендеров, автоматическую верификацию и безопасное заключение договоров с электронной подписью.'
    },
    {
      question: 'Как зарегистрироваться на платформе?',
      answer: 'Выберите тип аккаунта (заказчик или исполнитель), заполните регистрационную форму с БИН компании, загрузите учредительные документы и дождитесь верификации администратором. Обычно процесс занимает 1-2 рабочих дня.'
    },
    {
      question: 'Какие гарантии безопасности сделок?',
      answer: 'Мы используем систему электронной подписи с OTP-верификацией, проводим AI-проверку документов всех участников, используем прозрачную систему рейтингов и отзывов, а также обеспечиваем безопасное хранение всех договоров и документов.'
    },
    {
      question: 'Сколько стоит использование платформы?',
      answer: 'Регистрация и поиск тендеров бесплатны для всех пользователей. Комиссия платформы взимается только при успешном заключении договора. Точные тарифы зависят от объема сделки и доступны в разделе "Тарифы".'
    },
    {
      question: 'Как происходит выбор победителя тендера?',
      answer: 'Заказчик получает все заявки от исполнителей и может использовать AI-скоринг для объективной оценки. Система анализирует цену, сроки, опыт исполнителя, рейтинг и отзывы. Окончательное решение остается за заказчиком.'
    }
  ];

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="faq-section">
      <div className="faq-container">
        <div className="faq-header">
          <h2 className="faq-title">Часто задаваемые вопросы</h2>
          <p className="faq-subtitle">Ответы на популярные вопросы о работе с платформой</p>
        </div>

        <div className="faq-list">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div key={index} className={clsx('faq-item', isOpen && 'faq-item--open')}>
                <button onClick={() => toggleFAQ(index)} className="faq-question-btn">
                  <span className="faq-question-text">{faq.question}</span>
                  <div className={clsx('faq-chevron', isOpen && 'faq-chevron--open')}>
                    {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </div>
                </button>
                <div className={clsx('faq-answer-wrap', isOpen && 'faq-answer-wrap--open')}>
                  <div className="faq-answer-text">{faq.answer}</div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="faq-cta">
          <h3 className="faq-cta-title">Не нашли ответ на свой вопрос?</h3>
          <p className="faq-cta-sub">Наша служба поддержки готова помочь вам 24/7</p>
          <a href="/instructions" className="faq-cta-btn">
            Посмотреть полную инструкцию
          </a>
        </div>
      </div>

      <style>{`
        .faq-section {
          padding: var(--space-20) var(--space-5);
          background: var(--color-bg-surface);
        }
        .faq-container {
          max-width: 900px;
          margin: 0 auto;
        }
        .faq-header {
          text-align: center;
          margin-bottom: var(--space-12);
        }
        .faq-title {
          font-size: var(--font-size-7xl);
          font-weight: var(--font-weight-black);
          color: var(--color-text-dark);
          margin-bottom: var(--space-4);
          font-family: Roboto, sans-serif;
        }
        .faq-subtitle {
          font-size: var(--font-size-xl3);
          color: var(--color-text-muted);
        }
        .faq-list {
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
        }
        .faq-item {
          background: var(--color-bg-warm);
          border: 2px solid var(--color-border-light);
          border-radius: var(--radius-2xl);
          overflow: hidden;
          transition: all var(--transition-slow) ease;
        }
        .faq-item--open {
          border-color: var(--color-success);
          box-shadow: 0 4px 12px var(--color-success-tint-10);
        }
        .faq-question-btn {
          width: 100%;
          padding: var(--space-6) var(--space-7);
          background: transparent;
          border: none;
          display: flex;
          align-items: center;
          justify-content: space-between;
          cursor: pointer;
          text-align: left;
        }
        .faq-question-text {
          font-size: var(--font-size-xl3);
          font-weight: var(--font-weight-bold);
          color: var(--color-text-dark);
          flex: 1;
        }
        .faq-chevron {
          width: 32px;
          height: 32px;
          border-radius: var(--radius-circle);
          background: var(--color-border-light);
          color: var(--color-text-muted);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: background var(--transition-slow), color var(--transition-slow);
        }
        .faq-chevron--open {
          background: var(--color-success);
          color: var(--color-text-inverse);
        }
        .faq-answer-wrap {
          max-height: 0;
          opacity: 0;
          overflow: hidden;
          transition: max-height var(--transition-slow) ease, opacity var(--transition-slow) ease;
        }
        .faq-answer-wrap--open {
          max-height: 500px;
          opacity: 1;
        }
        .faq-answer-text {
          padding: 0 var(--space-7) var(--space-7);
          color: var(--color-text-dark3);
          font-size: var(--font-size-lg);
          line-height: 1.7;
        }
        .faq-cta {
          margin-top: var(--space-12);
          text-align: center;
          padding: var(--space-10);
          background: linear-gradient(135deg, var(--color-success-light) 0%, var(--color-success) 100%);
          border-radius: var(--radius-3xl);
          color: var(--color-text-inverse);
        }
        .faq-cta-title {
          font-size: var(--font-size-4xl);
          font-weight: var(--font-weight-bold);
          margin-bottom: var(--space-4);
        }
        .faq-cta-sub {
          font-size: var(--font-size-xl3);
          margin-bottom: var(--space-6);
          opacity: 0.95;
        }
        .faq-cta-btn {
          display: inline-block;
          padding: 14px var(--space-8);
          background: var(--color-bg-surface);
          color: var(--color-success);
          border-radius: var(--radius-lg);
          font-weight: var(--font-weight-bold);
          font-size: var(--font-size-lg);
          text-decoration: none;
          transition: all var(--transition-slow) ease;
        }
        .faq-cta-btn:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
        }
      `}</style>
    </section>
  );
};

export default FAQSection;
