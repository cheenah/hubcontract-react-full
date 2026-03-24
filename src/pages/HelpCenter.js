import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Book, 
  HelpCircle, 
  CheckCircle, 
  FileText, 
  Search, 
  DollarSign, 
  FileCheck, 
  Bell,
  Shield,
  Award,
  Users,
  Settings,
  MessageSquare
} from 'lucide-react';

const HelpCenter = () => {
  const [activeTab, setActiveTab] = useState('customer');

  return (
    <div className="help-center-page">
      <div className="help-header">
        <div className="help-header-content">
          <HelpCircle className="help-icon" size={48} />
          <h1 className="help-title">Центр помощи</h1>
          <p className="help-subtitle">
            Руководства, инструкции и ответы на часто задаваемые вопросы
          </p>
        </div>
      </div>

      <div className="help-content">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="help-tabs">
          <TabsList className="tabs-list">
            <TabsTrigger value="customer" className="tab-trigger">
              <Book size={20} />
              <span>Руководство заказчикам</span>
            </TabsTrigger>
            <TabsTrigger value="supplier" className="tab-trigger">
              <Users size={20} />
              <span>Руководство поставщикам</span>
            </TabsTrigger>
            <TabsTrigger value="faq" className="tab-trigger">
              <MessageSquare size={20} />
              <span>FAQ-AI</span>
            </TabsTrigger>
          </TabsList>

          {/* Руководство заказчикам */}
          <TabsContent value="customer" className="tab-content">
            <div className="guide-section">
              <Card className="guide-card">
                <CardHeader>
                  <div className="card-header-with-icon">
                    <div className="step-number">1</div>
                    <div>
                      <CardTitle>Регистрация и вход в систему</CardTitle>
                      <CardDescription>Первые шаги в платформе HubContract</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="instruction-steps">
                    <div className="instruction-step">
                      <CheckCircle size={20} className="step-icon" />
                      <div className="step-content">
                        <h4>Создание аккаунта</h4>
                        <p>
                          Нажмите кнопку "Регистрация" на главной странице. Выберите тип аккаунта 
                          "Заказчик", укажите email, пароль, БИН компании (12 цифр), номер телефона 
                          и название вашей организации. После регистрации войдите в систему.
                        </p>
                      </div>
                    </div>
                    <div className="instruction-step">
                      <CheckCircle size={20} className="step-icon" />
                      <div className="step-content">
                        <h4>Заполнение профиля организации</h4>
                        <p>
                          После входа перейдите в раздел "Профиль" → "Регистрационные данные" 
                          и заполните полную информацию о вашей организации: юридический адрес, 
                          ИИК, банковские реквизиты, контактную информацию руководителя.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="guide-card">
                <CardHeader>
                  <div className="card-header-with-icon">
                    <div className="step-number">2</div>
                    <div>
                      <CardTitle>Создание и публикация тендера</CardTitle>
                      <CardDescription>Как разместить заказ для поставщиков</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="instruction-steps">
                    <div className="instruction-step">
                      <FileText size={20} className="step-icon" />
                      <div className="step-content">
                        <h4>Создание тендера</h4>
                        <p>
                          Нажмите "Создать тендер" на панели управления. Заполните обязательные поля: 
                          название, описание, категорию, регион, бюджет, количество и цену за единицу. 
                          Добавьте техническую спецификацию и требования к поставщикам. Укажите сроки 
                          подачи заявок и условия выполнения работ.
                        </p>
                      </div>
                    </div>
                    <div className="instruction-step">
                      <CheckCircle size={20} className="step-icon" />
                      <div className="step-content">
                        <h4>Публикация тендера</h4>
                        <p>
                          После создания тендер сохраняется как черновик. Проверьте все данные и 
                          нажмите кнопку "Опубликовать". После публикации тендер становится доступен 
                          всем поставщикам на платформе. Редактирование после публикации ограничено.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="guide-card">
                <CardHeader>
                  <div className="card-header-with-icon">
                    <div className="step-number">3</div>
                    <div>
                      <CardTitle>Управление заявками и выбор победителя</CardTitle>
                      <CardDescription>Оценка предложений поставщиков</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="instruction-steps">
                    <div className="instruction-step">
                      <Search size={20} className="step-icon" />
                      <div className="step-content">
                        <h4>Просмотр поступивших заявок</h4>
                        <p>
                          Перейдите в "Мои тендеры" и выберите нужный тендер. Во вкладке "Заявки" 
                          вы увидите все поступившие предложения с AI-оценкой квалификации (0-100 баллов). 
                          Система автоматически анализирует цену, документы, опыт и репутацию каждого 
                          поставщика.
                        </p>
                      </div>
                    </div>
                    <div className="instruction-step">
                      <Award size={20} className="step-icon" />
                      <div className="step-content">
                        <h4>Выбор победителя</h4>
                        <p>
                          Изучите предложения, сравните цены и квалификацию. Нажмите кнопку 
                          "Автоматический выбор победителя" для AI-отбора по критериям или выберите 
                          вручную, нажав "Выбрать победителем" у нужной заявки. После выбора тендер 
                          автоматически закрывается.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="guide-card">
                <CardHeader>
                  <div className="card-header-with-icon">
                    <div className="step-number">4</div>
                    <div>
                      <CardTitle>Работа с договорами</CardTitle>
                      <CardDescription>Создание и подписание договора</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="instruction-steps">
                    <div className="instruction-step">
                      <FileCheck size={20} className="step-icon" />
                      <div className="step-content">
                        <h4>Создание договора</h4>
                        <p>
                          После выбора победителя в "Мои тендеры" появится кнопка "Создать договор". 
                          Система автоматически сгенерирует договор на основе данных тендера и 
                          победившей заявки. Проверьте все условия, при необходимости внесите правки 
                          в текст договора.
                        </p>
                      </div>
                    </div>
                    <div className="instruction-step">
                      <Shield size={20} className="step-icon" />
                      <div className="step-content">
                        <h4>Согласование и подписание</h4>
                        <p>
                          Нажмите "Отправить на согласование" для передачи договора поставщику. 
                          После согласования поставщиком и заполнения реквизитов нажмите 
                          "Отправить на подписание". Для цифровой подписи запросите OTP-код на email 
                          и введите его. После подписания обеими сторонами договор становится активным.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="guide-card">
                <CardHeader>
                  <div className="card-header-with-icon">
                    <div className="step-number">5</div>
                    <div>
                      <CardTitle>Аналитика и отчеты</CardTitle>
                      <CardDescription>Мониторинг эффективности закупок</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="instruction-steps">
                    <div className="instruction-step">
                      <DollarSign size={20} className="step-icon" />
                      <div className="step-content">
                        <h4>Просмотр аналитики</h4>
                        <p>
                          В разделе "Аналитика" доступна статистика по всем тендерам: общий бюджет, 
                          достигнутая экономия, количество завершенных закупок, распределение по 
                          категориям. Графики показывают динамику за последние 6 месяцев.
                        </p>
                      </div>
                    </div>
                    <div className="instruction-step">
                      <FileText size={20} className="step-icon" />
                      <div className="step-content">
                        <h4>Формирование отчетов</h4>
                        <p>
                          В разделе "Отчеты" можно выгрузить Excel-отчеты по тендерам за любой период. 
                          Отчеты содержат детальную информацию: название, категорию, бюджет, статус, 
                          даты проведения, победителя и итоговую стоимость контракта.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Руководство поставщикам */}
          <TabsContent value="supplier" className="tab-content">
            <div className="guide-section">
              <Card className="guide-card">
                <CardHeader>
                  <div className="card-header-with-icon">
                    <div className="step-number">1</div>
                    <div>
                      <CardTitle>Регистрация и верификация</CardTitle>
                      <CardDescription>Начало работы на платформе</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="instruction-steps">
                    <div className="instruction-step">
                      <CheckCircle size={20} className="step-icon" />
                      <div className="step-content">
                        <h4>Создание аккаунта поставщика</h4>
                        <p>
                          Нажмите "Регистрация" на главной странице. Выберите тип "Поставщики и подрядчики", 
                          заполните email, пароль, БИН компании, телефон и название организации. 
                          После регистрации войдите в систему для дальнейшей настройки профиля.
                        </p>
                      </div>
                    </div>
                    <div className="instruction-step">
                      <Shield size={20} className="step-icon" />
                      <div className="step-content">
                        <h4>Верификация документов</h4>
                        <p>
                          Для участия в тендерах необходима верификация. Загрузите скан-копии документов: 
                          свидетельство о регистрации, лицензии, сертификаты качества. Администратор 
                          проверит документы в течение 1-2 рабочих дней. О результатах вы получите 
                          уведомление.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="guide-card">
                <CardHeader>
                  <div className="card-header-with-icon">
                    <div className="step-number">2</div>
                    <div>
                      <CardTitle>Заполнение профиля квалификации</CardTitle>
                      <CardDescription>Повышение конкурентоспособности</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="instruction-steps">
                    <div className="instruction-step">
                      <Award size={20} className="step-icon" />
                      <div className="step-content">
                        <h4>Квалификация и опыт</h4>
                        <p>
                          В разделе "Личный кабинет" → "Квалификация и опыт" добавьте информацию 
                          о ваших специалистах, выполненных проектах, сертификатах и лицензиях. 
                          Подробный профиль повышает AI-оценку ваших заявок и доверие заказчиков.
                        </p>
                      </div>
                    </div>
                    <div className="instruction-step">
                      <FileText size={20} className="step-icon" />
                      <div className="step-content">
                        <h4>Добавление документов и проектов</h4>
                        <p>
                          Загрузите копии всех сертификатов, лицензий и разрешений. Добавьте описания 
                          выполненных проектов с указанием заказчика, стоимости, сроков и результатов. 
                          Это поможет системе автоматически оценить вашу квалификацию выше.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="guide-card">
                <CardHeader>
                  <div className="card-header-with-icon">
                    <div className="step-number">3</div>
                    <div>
                      <CardTitle>Поиск и подача заявок</CardTitle>
                      <CardDescription>Как найти подходящие тендеры</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="instruction-steps">
                    <div className="instruction-step">
                      <Search size={20} className="step-icon" />
                      <div className="step-content">
                        <h4>Поиск тендеров</h4>
                        <p>
                          В разделе "Обзор тендеров" доступны все опубликованные заказы. Используйте 
                          фильтры по категориям, регионам и бюджету для поиска подходящих тендеров. 
                          Обращайте внимание на сроки подачи заявок и требования заказчика.
                        </p>
                      </div>
                    </div>
                    <div className="instruction-step">
                      <FileCheck size={20} className="step-icon" />
                      <div className="step-content">
                        <h4>Подача заявки</h4>
                        <p>
                          Откройте интересующий тендер и нажмите "Подать заявку". Укажите вашу цену 
                          (₸), опишите ваш подход к выполнению работ, приложите дополнительные 
                          документы (технические предложения, портфолио). После подачи система 
                          автоматически оценит вашу заявку по AI-алгоритму (0-100 баллов).
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="guide-card">
                <CardHeader>
                  <div className="card-header-with-icon">
                    <div className="step-number">4</div>
                    <div>
                      <CardTitle>Работа с договорами</CardTitle>
                      <CardDescription>Согласование и выполнение работ</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="instruction-steps">
                    <div className="instruction-step">
                      <Bell size={20} className="step-icon" />
                      <div className="step-content">
                        <h4>Уведомление о победе</h4>
                        <p>
                          Если ваша заявка выбрана, вы получите уведомление. В разделе "Договоры" 
                          появится новый договор в статусе "На согласовании". Внимательно изучите 
                          все условия: объем работ, сроки, стоимость, штрафные санкции.
                        </p>
                      </div>
                    </div>
                    <div className="instruction-step">
                      <Shield size={20} className="step-icon" />
                      <div className="step-content">
                        <h4>Согласование и подписание</h4>
                        <p>
                          Заполните банковские реквизиты вашей организации в форме договора. 
                          Нажмите "Согласовать" для передачи договора заказчику на подпись. 
                          После отправки на подписание запросите OTP-код на ваш email и введите 
                          его для цифровой подписи. После этого договор становится активным.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="guide-card">
                <CardHeader>
                  <div className="card-header-with-icon">
                    <div className="step-number">5</div>
                    <div>
                      <CardTitle>Банковские гарантии и финансы</CardTitle>
                      <CardDescription>Управление финансовыми обязательствами</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="instruction-steps">
                    <div className="instruction-step">
                      <Shield size={20} className="step-icon" />
                      <div className="step-content">
                        <h4>Банковские гарантии</h4>
                        <p>
                          В разделе "Банковские гарантии" добавьте информацию о ваших гарантиях: 
                          тип (исполнение, возврат аванса), сумму, срок действия, номер и выпустивший 
                          банк. Загрузите скан-копию гарантии. Это повышает доверие заказчиков к вам.
                        </p>
                      </div>
                    </div>
                    <div className="instruction-step">
                      <DollarSign size={20} className="step-icon" />
                      <div className="step-content">
                        <h4>Отслеживание финансов</h4>
                        <p>
                          В разделе "Финансы" доступна полная статистика: заработанная сумма, 
                          ожидаемые платежи, история транзакций. Здесь же можно подавать акты 
                          выполненных работ для получения оплаты по этапам договора.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* FAQ-AI */}
          <TabsContent value="faq" className="tab-content">
            <div className="faq-section">
              <div className="faq-intro">
                <MessageSquare size={48} className="faq-icon" />
                <h2>Часто задаваемые вопросы</h2>
                <p>Ответы на самые популярные вопросы о работе платформы</p>
              </div>

              <div className="faq-list">
                <Card className="faq-card">
                  <CardHeader>
                    <CardTitle className="faq-question">
                      <HelpCircle size={20} />
                      Как долго проходит верификация документов?
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="faq-answer">
                      Верификация документов обычно занимает 1-2 рабочих дня. Администратор проверяет 
                      подлинность и актуальность предоставленных документов. Вы получите уведомление 
                      на email о результатах проверки. Если документы требуют дополнительных 
                      пояснений, с вами свяжутся напрямую.
                    </p>
                  </CardContent>
                </Card>

                <Card className="faq-card">
                  <CardHeader>
                    <CardTitle className="faq-question">
                      <HelpCircle size={20} />
                      Как работает AI-оценка заявок поставщиков?
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="faq-answer">
                      Система использует искусственный интеллект (GPT-4o-mini) для анализа каждой 
                      заявки по 4 критериям: цена предложения (0-40 баллов), наличие и качество 
                      документов (0-20 баллов), полнота профиля поставщика (0-20 баллов) и история 
                      выполненных проектов (0-20 баллов). Итоговая оценка от 0 до 100 баллов 
                      помогает заказчику объективно сравнить предложения.
                    </p>
                  </CardContent>
                </Card>

                <Card className="faq-card">
                  <CardHeader>
                    <CardTitle className="faq-question">
                      <HelpCircle size={20} />
                      Можно ли редактировать тендер после публикации?
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="faq-answer">
                      Нет, после публикации тендер редактировать нельзя в соответствии с принципами 
                      прозрачности и равных условий для всех поставщиков. Если обнаружили ошибку, 
                      можно отменить тендер, скопировать его, внести правки в копию и опубликовать 
                      заново. Все поставщики, подавшие заявки, получат уведомление об отмене.
                    </p>
                  </CardContent>
                </Card>

                <Card className="faq-card">
                  <CardHeader>
                    <CardTitle className="faq-question">
                      <HelpCircle size={20} />
                      Как работает цифровая подпись договора с OTP-кодом?
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="faq-answer">
                      При подписании договора система генерирует уникальный 6-значный OTP-код и 
                      отправляет его на ваш email. Код действителен 60 секунд. Введите полученный 
                      код в форму подписания. После успешной проверки кода в договор добавляется 
                      ваша цифровая подпись с точным временем подписания. Это обеспечивает 
                      юридическую значимость электронного документа.
                    </p>
                  </CardContent>
                </Card>

                <Card className="faq-card">
                  <CardHeader>
                    <CardTitle className="faq-question">
                      <HelpCircle size={20} />
                      Можно ли отозвать или изменить поданную заявку?
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="faq-answer">
                      Да, пока тендер находится в статусе "Прием заявок", вы можете отозвать или 
                      изменить свою заявку. Перейдите в "Мои заявки", найдите нужную заявку и 
                      нажмите "Редактировать" или "Отозвать". После закрытия тендера или выбора 
                      победителя изменить заявку уже нельзя.
                    </p>
                  </CardContent>
                </Card>

                <Card className="faq-card">
                  <CardHeader>
                    <CardTitle className="faq-question">
                      <HelpCircle size={20} />
                      Когда происходит оплата по договору?
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="faq-answer">
                      Условия оплаты указаны в каждом договоре индивидуально. Обычно оплата 
                      производится по этапам выполнения работ. Поставщик подает акт выполненных 
                      работ через систему, заказчик проверяет и подтверждает. После подтверждения 
                      оплата перечисляется на банковский счет поставщика в сроки, указанные в договоре 
                      (обычно 5-30 рабочих дней).
                    </p>
                  </CardContent>
                </Card>

                <Card className="faq-card">
                  <CardHeader>
                    <CardTitle className="faq-question">
                      <HelpCircle size={20} />
                      Как повысить свой рейтинг на платформе?
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="faq-answer">
                      Рейтинг поставщика формируется из нескольких факторов: процент успешно 
                      завершенных проектов, отзывы заказчиков, своевременность выполнения работ, 
                      полнота профиля квалификации, количество и качество предоставленных документов. 
                      Регулярно обновляйте портфолио выполненных проектов, загружайте новые 
                      сертификаты, поддерживайте высокое качество работ.
                    </p>
                  </CardContent>
                </Card>

                <Card className="faq-card">
                  <CardHeader>
                    <CardTitle className="faq-question">
                      <HelpCircle size={20} />
                      Что делать, если договор требует корректировок?
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="faq-answer">
                      Если договор в статусе "На согласовании", вы можете запросить изменения через 
                      комментарии к договору или связаться с заказчиком через систему сообщений. 
                      Заказчик может внести правки в текст договора до отправки на подпись. После 
                      подписания изменения вносятся только через дополнительные соглашения, которые 
                      также подписываются обеими сторонами.
                    </p>
                  </CardContent>
                </Card>

                <Card className="faq-card">
                  <CardHeader>
                    <CardTitle className="faq-question">
                      <HelpCircle size={20} />
                      Как работает автоматический выбор победителя?
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="faq-answer">
                      Автоматический выбор анализирует все заявки по комплексным критериям: цена 
                      (вес 40%), AI-оценка квалификации (30%), рейтинг поставщика (20%), срок 
                      выполнения (10%). Система выбирает оптимальное сочетание цены и качества. 
                      Заказчик всегда может отклонить автоматический выбор и выбрать победителя 
                      вручную на основе дополнительных факторов.
                    </p>
                  </CardContent>
                </Card>

                <Card className="faq-card">
                  <CardHeader>
                    <CardTitle className="faq-question">
                      <HelpCircle size={20} />
                      Доступна ли техническая поддержка?
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="faq-answer">
                      Да, техническая поддержка доступна в рабочие дни с 9:00 до 18:00 (GMT+6). 
                      Вы можете отправить сообщение через раздел "Коммуникации" или написать на 
                      email: support@hubcontract.kz. Среднее время ответа - 2-4 часа. Для срочных 
                      вопросов доступен телефон горячей линии: +7 (727) 123-45-67.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <style jsx>{`
        .help-center-page {
          min-height: calc(100vh - 108px);
          background: var(--bg-off-white, #f8f9fa);
        }

        .help-header {
          background: linear-gradient(135deg, var(--bg-blue, #1e40af) 0%, #1e3a8a 100%);
          color: white;
          padding: 48px 20px;
          margin-bottom: 32px;
        }

        .help-header-content {
          max-width: 1200px;
          margin: 0 auto;
          text-align: center;
        }

        .help-icon {
          margin: 0 auto 16px;
          opacity: 0.9;
        }

        .help-title {
          font-size: 2.5rem;
          font-weight: 700;
          margin-bottom: 12px;
          font-family: 'Roboto', sans-serif;
        }

        .help-subtitle {
          font-size: 1.125rem;
          opacity: 0.9;
          max-width: 600px;
          margin: 0 auto;
        }

        .help-content {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px 48px;
        }

        .help-tabs {
          width: 100%;
        }

        .tabs-list {
          display: flex;
          gap: 8px;
          margin-bottom: 32px;
          background: white;
          padding: 8px;
          border-radius: 8px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .tab-trigger {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 24px;
          border-radius: 6px;
          font-weight: 500;
          transition: all 0.2s ease;
        }

        .tab-content {
          animation: fadeIn 0.3s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .guide-section {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .guide-card {
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
          transition: all 0.3s ease;
        }

        .guide-card:hover {
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
          transform: translateY(-2px);
        }

        .card-header-with-icon {
          display: flex;
          align-items: flex-start;
          gap: 16px;
        }

        .step-number {
          width: 48px;
          height: 48px;
          background: linear-gradient(135deg, var(--btn-green, #10b981) 0%, #059669 100%);
          color: white;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          font-weight: 700;
          flex-shrink: 0;
        }

        .instruction-steps {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .instruction-step {
          display: flex;
          gap: 16px;
          padding: 16px;
          background: var(--bg-off-white, #f8f9fa);
          border-radius: 8px;
          border-left: 4px solid var(--btn-green, #10b981);
        }

        .step-icon {
          color: var(--btn-green, #10b981);
          flex-shrink: 0;
          margin-top: 2px;
        }

        .step-content h4 {
          font-size: 1.125rem;
          font-weight: 600;
          color: var(--text-dark-gray, #1a202c);
          margin-bottom: 8px;
        }

        .step-content p {
          color: var(--text-secondary, #4a5568);
          line-height: 1.6;
          margin: 0;
        }

        .faq-section {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .faq-intro {
          text-align: center;
          padding: 32px 20px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        }

        .faq-icon {
          color: var(--btn-green, #10b981);
          margin: 0 auto 16px;
        }

        .faq-intro h2 {
          font-size: 2rem;
          font-weight: 700;
          color: var(--text-dark-gray, #1a202c);
          margin-bottom: 12px;
        }

        .faq-intro p {
          font-size: 1.125rem;
          color: var(--text-secondary, #4a5568);
          max-width: 600px;
          margin: 0 auto;
        }

        .faq-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .faq-card {
          background: white;
          border-radius: 8px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          transition: all 0.2s ease;
        }

        .faq-card:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .faq-question {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 1.125rem;
          font-weight: 600;
          color: var(--text-dark-gray, #1a202c);
        }

        .faq-question :global(svg) {
          color: var(--btn-green, #10b981);
          flex-shrink: 0;
        }

        .faq-answer {
          color: var(--text-secondary, #4a5568);
          line-height: 1.7;
          font-size: 1rem;
          margin: 0;
        }

        @media (max-width: 768px) {
          .help-title {
            font-size: 1.875rem;
          }

          .help-subtitle {
            font-size: 1rem;
          }

          .tabs-list {
            flex-direction: column;
          }

          .tab-trigger {
            justify-content: center;
          }

          .step-number {
            width: 40px;
            height: 40px;
            font-size: 1.25rem;
          }

          .instruction-step {
            flex-direction: column;
          }

          .faq-intro h2 {
            font-size: 1.5rem;
          }
        }
      `}</style>
    </div>
  );
};

export default HelpCenter;
