import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

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
    <section style={{
      padding: '100px 20px',
      background: 'white'
    }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <h2 style={{
            fontSize: '2.5rem',
            fontWeight: '900',
            color: 'rgb(26, 26, 26)',
            marginBottom: '16px',
            fontFamily: 'Roboto, sans-serif'
          }}>
            Часто задаваемые вопросы
          </h2>
          <p style={{
            fontSize: '1.1rem',
            color: 'rgb(100, 100, 100)'
          }}>
            Ответы на популярные вопросы о работе с платформой
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {faqs.map((faq, index) => (
            <div key={index} style={{
              background: '#FCF8F5',
              border: '2px solid ' + (openIndex === index ? '#00B300' : '#E8E4E0'),
              borderRadius: '12px',
              overflow: 'hidden',
              transition: 'all 0.3s ease',
              boxShadow: openIndex === index ? '0 4px 12px rgba(0, 179, 0, 0.1)' : 'none'
            }}>
              <button onClick={() => toggleFAQ(index)} style={{
                width: '100%',
                padding: '24px 28px',
                background: 'transparent',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                textAlign: 'left'
              }}>
                <span style={{
                  fontSize: '1.1rem',
                  fontWeight: '700',
                  color: 'rgb(26, 26, 26)',
                  flex: 1
                }}>
                  {faq.question}
                </span>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: openIndex === index ? '#00B300' : '#E8E4E0',
                  color: openIndex === index ? 'white' : 'rgb(100, 100, 100)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {openIndex === index ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>
              </button>
              <div style={{
                maxHeight: openIndex === index ? '500px' : '0',
                opacity: openIndex === index ? 1 : 0,
                overflow: 'hidden',
                transition: 'all 0.4s ease'
              }}>
                <div style={{
                  padding: '0 28px 28px',
                  color: 'rgb(60, 60, 60)',
                  fontSize: '1rem',
                  lineHeight: '1.7'
                }}>
                  {faq.answer}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div style={{
          marginTop: '60px',
          textAlign: 'center',
          padding: '40px',
          background: 'linear-gradient(135deg, #00CC00 0%, #00B300 100%)',
          borderRadius: '16px',
          color: 'white'
        }}>
          <h3 style={{
            fontSize: '1.75rem',
            fontWeight: '700',
            marginBottom: '16px'
          }}>
            Не нашли ответ на свой вопрос?
          </h3>
          <p style={{ fontSize: '1.1rem', marginBottom: '24px', opacity: 0.95 }}>
            Наша служба поддержки готова помочь вам 24/7
          </p>
          <a href="/instructions" style={{
            display: 'inline-block',
            padding: '14px 32px',
            background: 'white',
            color: '#00B300',
            borderRadius: '8px',
            fontWeight: '700',
            fontSize: '1rem',
            textDecoration: 'none',
            transition: 'all 0.3s ease'
          }}>
            Посмотреть полную инструкцию
          </a>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;