import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Building, 
  UserCheck, 
  FileText, 
  Search, 
  Send, 
  CheckCircle,
  FileSignature,
  BarChart,
  MessageSquare,
  TrendingUp,
  Shield,
  Clock,
  Award,
  Users,
  ArrowRight
} from 'lucide-react';

const Instructions = () => {
  const [activeTab, setActiveTab] = useState('customer');

  const customerSteps = [
    {
      icon: <UserCheck size={32} />,
      title: '1. Регистрация и верификация',
      description: 'Создайте аккаунт заказчика, заполните профиль компании и пройдите верификацию для получения полного доступа к функционалу платформы.',
      details: [
        'Укажите БИН компании (12 цифр)',
        'Загрузите учредительные документы',
        'Дождитесь верификации (обычно 1-2 рабочих дня)',
        'Получите доступ ко всем функциям'
      ]
    },
    {
      icon: <FileText size={32} />,
      title: '2. Создание тендера',
      description: 'Опубликуйте тендер с детальным описанием работ, техническими требованиями и бюджетом. Система автоматически рассчитает сроки приема заявок.',
      details: [
        'Заполните название и описание тендера',
        'Укажите категорию и бюджет',
        'Установите дату публикации',
        'Система автоматически рассчитает даты приема заявок',
        'Опубликуйте тендер или сохраните как черновик'
      ]
    },
    {
      icon: <Search size={32} />,
      title: '3. Прием и оценка заявок',
      description: 'Получайте заявки от исполнителей, оценивайте предложения с помощью AI-анализа и выбирайте лучших подрядчиков.',
      details: [
        'Просматривайте все поступившие заявки',
        'Используйте AI-скоринг для оценки исполнителей',
        'Сравнивайте цены и сроки выполнения',
        'Проверяйте рейтинг и отзывы исполнителей',
        'Определите победителя тендера'
      ]
    },
    {
      icon: <FileSignature size={32} />,
      title: '4. Создание и подписание договора',
      description: 'Создайте договор из выигравшего тендера, отредактируйте условия и отправьте на электронное подписание исполнителю.',
      details: [
        'Создайте договор из закрытого тендера',
        'Отредактируйте шаблон договора при необходимости',
        'Отправьте на согласование и подписание',
        'Подпишите договор с помощью OTP-кода',
        'Следите за статусом исполнения'
      ]
    },
    {
      icon: <BarChart size={32} />,
      title: '5. Управление и аналитика',
      description: 'Отслеживайте все договора, просматривайте аналитику по закупкам и оценивайте работу исполнителей.',
      details: [
        'Доступ к дашборду с ключевыми метриками',
        'Управление всеми активными договорами',
        'Просмотр истории закупок и тендеров',
        'Аналитика по бюджету и экономии',
        'Оценка работы исполнителей'
      ]
    }
  ];

  const contractorSteps = [
    {
      icon: <Building size={32} />,
      title: '1. Регистрация исполнителя',
      description: 'Зарегистрируйтесь как исполнитель, заполните профиль компании и загрузите необходимые документы для верификации.',
      details: [
        'Создайте аккаунт исполнителя',
        'Укажите БИН и реквизиты компании',
        'Загрузите лицензии и сертификаты',
        'Опишите опыт работы и выполненные проекты',
        'Пройдите верификацию администратором'
      ]
    },
    {
      icon: <Search size={32} />,
      title: '2. Поиск тендеров',
      description: 'Просматривайте актуальные тендеры, используйте фильтры по категориям, бюджету и срокам для поиска подходящих заказов.',
      details: [
        'Просмотр всех активных тендеров',
        'Фильтрация по категориям и бюджету',
        'Поиск по ключевым словам',
        'Изучение технических требований',
        'Проверка сроков подачи заявок'
      ]
    },
    {
      icon: <Send size={32} />,
      title: '3. Подача заявки',
      description: 'Подготовьте конкурентное предложение, укажите сроки и стоимость работ, приложите необходимые документы.',
      details: [
        'Укажите свою цену и сроки выполнения',
        'Опишите опыт в данной области',
        'Приложите портфолио и рекомендации',
        'Загрузите технические предложения',
        'Отправьте заявку на рассмотрение'
      ]
    },
    {
      icon: <CheckCircle size={32} />,
      title: '4. Получение договора',
      description: 'При победе в тендере получите уведомление, просмотрите условия договора и подпишите его электронной подписью.',
      details: [
        'Получите уведомление о победе',
        'Просмотрите условия договора',
        'Согласуйте финальные детали',
        'Подпишите договор с помощью OTP',
        'Начните выполнение работ'
      ]
    },
    {
      icon: <TrendingUp size={32} />,
      title: '5. Выполнение и репутация',
      description: 'Выполняйте договора качественно и в срок, получайте положительные отзывы и повышайте свой рейтинг на платформе.',
      details: [
        'Следите за сроками выполнения',
        'Отчитывайтесь о ходе работ',
        'Получайте оплату после завершения',
        'Накапливайте положительные отзывы',
        'Повышайте рейтинг и доверие'
      ]
    }
  ];

  const features = [
    {
      icon: <Shield size={40} />,
      title: 'Безопасность сделок',
      description: 'Электронная подпись с OTP верификацией и прозрачная система платежей'
    },
    {
      icon: <Clock size={40} />,
      title: 'Быстрый процесс',
      description: 'Автоматизация подбора исполнителей и оформления договоров'
    },
    {
      icon: <Award size={40} />,
      title: 'Качественные исполнители',
      description: 'AI-верификация и рейтинговая система исполнителей'
    },
    {
      icon: <Users size={40} />,
      title: 'Поддержка 24/7',
      description: 'Техническая поддержка и помощь на всех этапах сотрудничества'
    }
  ];

  return (
    <Layout>
      <div className="instructions-page" style={{ background: '#FCF8F5', minHeight: '100vh' }}>
        {/* Hero Section */}
        <div style={{
          background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
          padding: '80px 20px',
          color: 'white',
          textAlign: 'center'
        }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <h1 style={{
              fontSize: '3rem',
              fontWeight: '900',
              marginBottom: '20px',
              fontFamily: 'Roboto, sans-serif'
            }}>
              Как пользоваться платформой HubContract
            </h1>
            <p style={{
              fontSize: '1.25rem',
              opacity: 0.95,
              maxWidth: '800px',
              margin: '0 auto'
            }}>
              Полное руководство по работе с платформой для заказчиков и исполнителей
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div style={{ maxWidth: '1200px', margin: '-60px auto 0', padding: '0 20px 80px' }}>
          {/* Tabs */}
          <Card style={{ marginBottom: '60px', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList style={{
                width: '100%',
                background: 'white',
                padding: '8px',
                borderRadius: '12px',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr'
              }}>
                <TabsTrigger 
                  value="customer" 
                  style={{
                    fontSize: '1.1rem',
                    fontWeight: '700',
                    padding: '16px',
                    borderRadius: '8px'
                  }}
                >
                  📋 Для заказчиков
                </TabsTrigger>
                <TabsTrigger 
                  value="contractor"
                  style={{
                    fontSize: '1.1rem',
                    fontWeight: '700',
                    padding: '16px',
                    borderRadius: '8px'
                  }}
                >
                  🔨 Для исполнителей
                </TabsTrigger>
              </TabsList>

              {/* Customer Instructions */}
              <TabsContent value="customer">
                <div style={{ padding: '40px 20px' }}>
                  <div style={{ marginBottom: '60px', textAlign: 'center' }}>
                    <h2 style={{
                      fontSize: '2rem',
                      fontWeight: '700',
                      color: 'rgb(26,26,26)',
                      marginBottom: '16px'
                    }}>
                      Пошаговая инструкция для заказчиков
                    </h2>
                    <p style={{ color: 'rgb(100,100,100)', fontSize: '1.1rem' }}>
                      Следуйте этим шагам для успешной работы с исполнителями
                    </p>
                  </div>

                  {customerSteps.map((step, index) => (
                    <Card key={index} style={{
                      marginBottom: '32px',
                      border: '2px solid #E8E4E0',
                      transition: 'all 0.3s ease'
                    }}>
                      <CardContent style={{ padding: '40px' }}>
                        <div style={{ display: 'flex', gap: '32px', alignItems: 'flex-start' }}>
                          {/* Icon */}
                          <div style={{
                            width: '80px',
                            height: '80px',
                            borderRadius: '16px',
                            background: 'linear-gradient(135deg, #00CC00 0%, #00B300 100%)',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                            boxShadow: '0 10px 25px rgba(0, 179, 0, 0.3)',
                            position: 'relative'
                          }}>
                            <div style={{
                              position: 'absolute',
                              inset: 0,
                              borderRadius: '16px',
                              background: 'linear-gradient(135deg, rgba(255,255,255,0.4) 0%, transparent 50%, rgba(0,0,0,0.05) 100%)'
                            }} />
                            <div style={{ position: 'relative', zIndex: 1 }}>
                              {step.icon}
                            </div>
                          </div>

                          {/* Content */}
                          <div style={{ flex: 1 }}>
                            <h3 style={{
                              fontSize: '1.5rem',
                              fontWeight: '700',
                              color: 'rgb(26,26,26)',
                              marginBottom: '12px'
                            }}>
                              {step.title}
                            </h3>
                            <p style={{
                              color: 'rgb(60,60,60)',
                              fontSize: '1rem',
                              lineHeight: '1.6',
                              marginBottom: '20px'
                            }}>
                              {step.description}
                            </p>
                            <ul style={{
                              listStyle: 'none',
                              padding: 0,
                              margin: 0
                            }}>
                              {step.details.map((detail, idx) => (
                                <li key={idx} style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '12px',
                                  marginBottom: '10px',
                                  color: 'rgb(100,100,100)'
                                }}>
                                  <ArrowRight size={16} style={{ color: '#00B300', flexShrink: 0 }} />
                                  <span>{detail}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Contractor Instructions */}
              <TabsContent value="contractor">
                <div style={{ padding: '40px 20px' }}>
                  <div style={{ marginBottom: '60px', textAlign: 'center' }}>
                    <h2 style={{
                      fontSize: '2rem',
                      fontWeight: '700',
                      color: 'rgb(26,26,26)',
                      marginBottom: '16px'
                    }}>
                      Пошаговая инструкция для исполнителей
                    </h2>
                    <p style={{ color: 'rgb(100,100,100)', fontSize: '1.1rem' }}>
                      Как начать получать заказы и зарабатывать на платформе
                    </p>
                  </div>

                  {contractorSteps.map((step, index) => (
                    <Card key={index} style={{
                      marginBottom: '32px',
                      border: '2px solid #E8E4E0',
                      transition: 'all 0.3s ease'
                    }}>
                      <CardContent style={{ padding: '40px' }}>
                        <div style={{ display: 'flex', gap: '32px', alignItems: 'flex-start' }}>
                          {/* Icon */}
                          <div style={{
                            width: '80px',
                            height: '80px',
                            borderRadius: '16px',
                            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                            boxShadow: '0 10px 25px rgba(37, 99, 235, 0.3)',
                            position: 'relative'
                          }}>
                            <div style={{
                              position: 'absolute',
                              inset: 0,
                              borderRadius: '16px',
                              background: 'linear-gradient(135deg, rgba(255,255,255,0.4) 0%, transparent 50%, rgba(0,0,0,0.05) 100%)'
                            }} />
                            <div style={{ position: 'relative', zIndex: 1 }}>
                              {step.icon}
                            </div>
                          </div>

                          {/* Content */}
                          <div style={{ flex: 1 }}>
                            <h3 style={{
                              fontSize: '1.5rem',
                              fontWeight: '700',
                              color: 'rgb(26,26,26)',
                              marginBottom: '12px'
                            }}>
                              {step.title}
                            </h3>
                            <p style={{
                              color: 'rgb(60,60,60)',
                              fontSize: '1rem',
                              lineHeight: '1.6',
                              marginBottom: '20px'
                            }}>
                              {step.description}
                            </p>
                            <ul style={{
                              listStyle: 'none',
                              padding: 0,
                              margin: 0
                            }}>
                              {step.details.map((detail, idx) => (
                                <li key={idx} style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '12px',
                                  marginBottom: '10px',
                                  color: 'rgb(100,100,100)'
                                }}>
                                  <ArrowRight size={16} style={{ color: '#2563eb', flexShrink: 0 }} />
                                  <span>{detail}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </Card>

          {/* Features Section */}
          <div style={{ marginTop: '80px' }}>
            <h2 style={{
              fontSize: '2.5rem',
              fontWeight: '900',
              textAlign: 'center',
              color: 'rgb(26,26,26)',
              marginBottom: '60px'
            }}>
              Почему HubContract?
            </h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '32px'
            }}>
              {features.map((feature, index) => (
                <Card key={index} style={{
                  textAlign: 'center',
                  border: '2px solid #E8E4E0'
                }}>
                  <CardContent style={{ padding: '40px 24px' }}>
                    <div style={{
                      width: '80px',
                      height: '80px',
                      borderRadius: '16px',
                      background: 'linear-gradient(135deg, #00CC00 0%, #00B300 100%)',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 24px',
                      boxShadow: '0 10px 25px rgba(0, 179, 0, 0.3)',
                      position: 'relative'
                    }}>
                      <div style={{
                        position: 'absolute',
                        inset: 0,
                        borderRadius: '16px',
                        background: 'linear-gradient(135deg, rgba(255,255,255,0.4) 0%, transparent 50%, rgba(0,0,0,0.05) 100%)'
                      }} />
                      <div style={{ position: 'relative', zIndex: 1 }}>
                        {feature.icon}
                      </div>
                    </div>
                    <h3 style={{
                      fontSize: '1.25rem',
                      fontWeight: '700',
                      color: 'rgb(26,26,26)',
                      marginBottom: '12px'
                    }}>
                      {feature.title}
                    </h3>
                    <p style={{ color: 'rgb(100,100,100)', lineHeight: '1.6' }}>
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Instructions;