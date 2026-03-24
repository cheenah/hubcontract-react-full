import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import { AppContext } from '@/App';
import { useLanguage } from '@/context/LanguageContext';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, MapPin, DollarSign, FileText, Package, Trophy, Award, AlertCircle } from 'lucide-react';

const ContractorTenderView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, API } = React.useContext(AppContext);
  const { t } = useLanguage();
  
  const [tender, setTender] = useState(null);
  const [protocols, setProtocols] = useState([]);
  const [userBid, setUserBid] = useState(null); // Заявка текущего пользователя
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTenderData();
    fetchProtocols();
    if (user && user.role === 'contractor') {
      checkUserBid();
    }
  }, [id, user]);

  const fetchTenderData = async () => {
    try {
      const response = await axios.get(`${API}/tenders/${id}`);
      setTender(response.data);
    } catch (error) {
      toast.error('Ошибка при загрузке тендера');
      navigate('/tenders');
    } finally {
      setLoading(false);
    }
  };

  const fetchProtocols = async () => {
    try {
      // Пытаемся получить протоколы для этого тендера
      const response = await axios.get(`${API}/public/protocols/tender/${id}`);
      if (response.data) {
        setProtocols([response.data]);
      }
    } catch (error) {
      // Протоколы могут отсутствовать для активных тендеров
      console.log('No protocols available yet');
    }
  };

  const checkUserBid = async () => {
    try {
      const response = await axios.get(`${API}/bids/tender/${id}/user`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      setUserBid(response.data);
    } catch (error) {
      // Заявка не найдена - это нормально
      setUserBid(null);
    }
  };

  const canSubmitBid = () => {
    if (!user || user.role !== 'contractor') return false;
    if (!tender) return false;
    if (userBid) return false; // Уже подана заявка
    
    const activeStatuses = ['active', 'published_receiving_proposals', 'published'];
    return activeStatuses.includes(tender.status);
  };

  const handleDownloadDocument = async (doc) => {
    if (!doc || !doc.content) {
      toast.error('Документ недоступен для скачивания');
      return;
    }

    try {
      // Если content - это base64
      const link = document.createElement('a');
      link.href = doc.content;
      link.download = doc.filename || 'document.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success(`Документ "${doc.filename}" скачан`);
    } catch (error) {
      console.error('Error downloading document:', error);
      toast.error('Ошибка при скачивании документа');
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'draft': { label: 'Черновик', color: 'bg-gray-100 text-gray-800' },
      'published': { label: 'Опубликован', color: 'bg-blue-100 text-blue-800' },
      'published_receiving_proposals': { label: 'Прием заявок', color: 'bg-green-100 text-green-800' },
      'active': { label: 'Активный', color: 'bg-green-100 text-green-800' },
      'under_review': { label: 'На рассмотрении', color: 'bg-yellow-100 text-yellow-800' },
      'closed': { label: 'Завершен', color: 'bg-gray-100 text-gray-800' },
      'cancelled': { label: 'Отменен', color: 'bg-red-100 text-red-800' },
      'failed': { label: 'Не состоялся', color: 'bg-red-100 text-red-800' }
    };
    
    const statusInfo = statusMap[status] || { label: status, color: 'bg-gray-100 text-gray-800' };
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color}`}>
        {statusInfo.label}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Не указано';
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Загрузка тендера...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!tender) return null;

  return (
    <Layout>
      <div className="contractor-tender-view">
        {/* Header */}
        <div className="header-section">
          {/* Заголовок с кнопкой */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{tender.title}</h1>
              <p className="text-sm text-gray-600 mt-1">Номер тендера: {tender.tender_number}</p>
            </div>
            
            {user && user.role === 'contractor' && (
              <>
                {userBid ? (
                  <Button
                    size="lg"
                    onClick={() => navigate('/my-bids')}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Моя заявка
                  </Button>
                ) : canSubmitBid() ? (
                  <Button
                    size="lg"
                    onClick={() => navigate(`/tenders/${tender.id}/submit-bid`)}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    Подать заявку
                  </Button>
                ) : (
                  <Button
                    size="lg"
                    disabled
                    className="bg-gray-400 text-white cursor-not-allowed"
                  >
                    {tender.status === 'closed' ? 'Тендер завершен' : 'Прием заявок завершен'}
                  </Button>
                )}
              </>
            )}
          </div>

          {/* Фиксированная форма с деталями объявления */}
          <Card className="mb-6 shadow-sm">
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 gap-6">
                {/* Левая колонка */}
                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Номер объявления</label>
                    <div className="p-2.5 bg-gray-50 rounded border border-gray-200 text-sm">
                      {tender.tender_number || 'Не указан'}
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Наименование объявления</label>
                    <div className="p-2.5 bg-gray-50 rounded border border-gray-200 text-sm">
                      {tender.title}
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Статус объявления</label>
                    <div className="p-2.5 bg-gray-50 rounded border border-gray-200 text-sm">
                      {getStatusBadge(tender.status)}
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Дата публикации объявления</label>
                    <div className="p-2.5 bg-gray-50 rounded border border-gray-200 text-sm">
                      {formatDate(tender.publication_date)}
                    </div>
                  </div>
                </div>
                
                {/* Правая колонка */}
                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Срок начала обсуждения</label>
                    <div className="p-2.5 bg-gray-50 rounded border border-gray-200 text-sm">
                      {formatDate(tender.publication_date)}
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Срок окончания обсуждения</label>
                    <div className="p-2.5 bg-gray-50 rounded border border-gray-200 text-sm">
                      {formatDate(tender.submission_start)}
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Предварительный срок начала приема заявок</label>
                    <div className="p-2.5 bg-gray-50 rounded border border-gray-200 text-sm">
                      {formatDate(tender.submission_start)}
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Предварительный срок окончания приема заявок</label>
                    <div className="p-2.5 bg-gray-50 rounded border border-gray-200 text-sm">
                      {formatDate(tender.submission_end)}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="w-full justify-start mb-6 bg-white border-b border-gray-300 rounded-none h-auto p-0">
            <TabsTrigger 
              value="general" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-blue-50 px-6 py-3 text-sm font-medium"
            >
              Общие сведения
            </TabsTrigger>
            <TabsTrigger 
              value="lots"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-blue-50 px-6 py-3 text-sm font-medium"
            >
              Лоты
            </TabsTrigger>
            <TabsTrigger 
              value="documents"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-blue-50 px-6 py-3 text-sm font-medium"
            >
              Документация
            </TabsTrigger>
            <TabsTrigger 
              value="protocols"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-blue-50 px-6 py-3 text-sm font-medium"
            >
              Протоколы
            </TabsTrigger>
            <TabsTrigger 
              value="winners"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-blue-50 px-6 py-3 text-sm font-medium"
            >
              Информация о победителях
            </TabsTrigger>
          </TabsList>

          {/* Tab 1: Общие сведения */}
          <TabsContent value="general">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Общие сведения</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm font-semibold text-gray-700">Способ проведения закупки</label>
                      <p className="mt-1 text-gray-900">
                        {tender.tender_type === 'price_proposals' && 'Ценовые предложения'}
                        {tender.tender_type === 'open_competition' && 'Открытый конкурс'}
                        {tender.tender_type === 'auction' && 'Аукцион'}
                        {tender.tender_type === 'single_source' && 'Единственный источник'}
                      </p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-semibold text-gray-700">Вид предмета закупок</label>
                      <p className="mt-1 text-gray-900">
                        {tender.category === 'construction' && 'Строительство'}
                        {tender.category === 'it' && 'IT-услуги'}
                        {tender.category === 'consulting' && 'Консалтинг'}
                        {tender.category === 'logistics' && 'Логистика'}
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-semibold text-gray-700">Организатор</label>
                    <p className="mt-1 text-gray-900">{tender.customer_organization || tender.customer_name || 'Не указано'}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-semibold text-gray-700">Юр. адрес организатора</label>
                    <p className="mt-1 text-gray-900">{tender.customer_legal_address || tender.customer_email}</p>
                  </div>
                  
                  {tender.procurement_subject && (
                    <div>
                      <label className="text-sm font-semibold text-gray-700">Вид предмета закупок</label>
                      <p className="mt-1 text-gray-900">
                        {tender.procurement_subject === 'goods' && 'Товары'}
                        {tender.procurement_subject === 'works' && 'Работы'}
                        {tender.procurement_subject === 'services' && 'Услуги'}
                      </p>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm font-semibold text-gray-700">Кол-во лотов в объявлении</label>
                      <p className="mt-1 text-gray-900 text-lg font-bold">{tender.lots?.length || 1}</p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-semibold text-gray-700">Сумма закупки</label>
                      <p className="mt-1 text-gray-900 text-lg font-bold">
                        {tender.budget?.toLocaleString('ru-RU')} ₸
                      </p>
                    </div>
                  </div>
                  
                  {(tender.special_conditions && tender.special_conditions.length > 0 && tender.special_conditions[0]) && (
                    <div>
                      <label className="text-sm font-semibold text-gray-700">Признаки</label>
                      <ul className="mt-2 space-y-1">
                        {tender.special_conditions.filter(cond => cond).map((cond, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <span className="text-green-600">✓</span>
                            <span className="text-gray-900">{cond}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {tender.requirements && tender.requirements.length > 0 && tender.requirements[0] && (
                    <div>
                      <label className="text-sm font-semibold text-gray-700">Требования к участникам</label>
                      <ul className="mt-2 space-y-1">
                        {tender.requirements.filter(req => req).map((req, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <span className="text-blue-600">•</span>
                            <span className="text-gray-900">{req}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2 mt-6">Информация об организаторе</h4>
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="text-sm font-semibold text-gray-700">ФИО представителя</label>
                        <p className="mt-1 text-gray-900">{tender.customer_representative_name || tender.customer_name || 'Не указано'}</p>
                      </div>
                      
                      <div>
                        <label className="text-sm font-semibold text-gray-700">Должность</label>
                        <p className="mt-1 text-gray-900">{tender.customer_representative_position || 'Руководитель отдела закупок'}</p>
                      </div>
                    </div>
                  </div>
                  
                  {tender.description && (
                    <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <h4 className="font-semibold mb-2">Описание закупки</h4>
                      <p className="text-gray-700 whitespace-pre-wrap">{tender.description}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 2: Лоты */}
          <TabsContent value="lots">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Лоты</CardTitle>
              </CardHeader>
              <CardContent>
                {tender.lots && tender.lots.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse" style={{ minWidth: '1200px' }}>
                      <thead>
                        <tr className="bg-gray-50 border-b-2 border-gray-200">
                          <th className="p-3 text-left text-sm font-semibold text-gray-700 border whitespace-nowrap">№ п/п</th>
                          <th className="p-3 text-left text-sm font-semibold text-gray-700 border whitespace-nowrap">Номер лота</th>
                          <th className="p-3 text-left text-sm font-semibold text-gray-700 border whitespace-nowrap">Заказчик</th>
                          <th className="p-3 text-left text-sm font-semibold text-gray-700 border whitespace-nowrap">Наименование</th>
                          <th className="p-3 text-left text-sm font-semibold text-gray-700 border whitespace-nowrap">Дополнительная характеристика</th>
                          <th className="p-3 text-left text-sm font-semibold text-gray-700 border whitespace-nowrap">Цена за ед.</th>
                          <th className="p-3 text-left text-sm font-semibold text-gray-700 border whitespace-nowrap">Кол-во</th>
                          <th className="p-3 text-left text-sm font-semibold text-gray-700 border whitespace-nowrap">Ед. изм.</th>
                          <th className="p-3 text-left text-sm font-semibold text-gray-700 border whitespace-nowrap">Плановая сумма</th>
                          <th className="p-3 text-left text-sm font-semibold text-gray-700 border whitespace-nowrap">Статус лота</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tender.lots.map((lot, index) => (
                          <tr key={lot.id || index} className="border-b hover:bg-gray-50">
                            <td className="p-3 text-sm border whitespace-nowrap">{index + 1}</td>
                            <td className="p-3 text-sm border whitespace-nowrap">
                              <span className="text-blue-600 font-medium">
                                {tender.tender_number}-{lot.lot_number || (index + 1)}
                              </span>
                            </td>
                            <td className="p-3 text-sm border">{tender.customer_name || 'Не указано'}</td>
                            <td className="p-3 text-sm border font-medium">{lot.name}</td>
                            <td className="p-3 text-sm border text-gray-600">
                              {lot.technical_spec || 'Не указано'}
                            </td>
                            <td className="p-3 text-sm border text-right font-semibold whitespace-nowrap">
                              {lot.unit_price?.toLocaleString('ru-RU')} ₸
                            </td>
                            <td className="p-3 text-sm border text-center whitespace-nowrap">{lot.quantity}</td>
                            <td className="p-3 text-sm border text-center whitespace-nowrap">{lot.unit}</td>
                            <td className="p-3 text-sm border text-right font-bold whitespace-nowrap">
                              {lot.total_price?.toLocaleString('ru-RU')} ₸
                            </td>
                            <td className="p-3 text-sm border whitespace-nowrap">
                              <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                                Опубликован
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-6 bg-gray-50 rounded text-center">
                    <p className="text-gray-600">Закупка без разделения на лоты</p>
                    <div className="mt-4">
                      <p className="text-sm text-gray-600">Общая сумма закупки:</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">
                        {tender.budget?.toLocaleString('ru-RU')} ₸
                      </p>
                    </div>
                    {tender.technical_specs && (
                      <div className="mt-4 p-4 bg-white rounded text-left">
                        <h4 className="font-semibold mb-2">Технические требования</h4>
                        <p className="text-gray-700 text-sm whitespace-pre-wrap">{tender.technical_specs}</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 3: Документация */}
          <TabsContent value="documents">
            <Card>
              <CardHeader>
                <CardTitle>Документация</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-50 border-b-2 border-gray-200">
                        <th className="p-3 text-left text-sm font-semibold text-gray-700 border">Наименование документа</th>
                        <th className="p-3 text-center text-sm font-semibold text-gray-700 border w-32">Признак</th>
                        <th className="p-3 text-center text-sm font-semibold text-gray-700 border w-32"></th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b hover:bg-gray-50">
                        <td className="p-3 text-sm border">Конкурсная документация</td>
                        <td className="p-3 text-sm border text-center">Нет</td>
                        <td className="p-3 text-sm border text-center"></td>
                      </tr>
                      <tr className="border-b hover:bg-gray-50">
                        <td className="p-3 text-sm border">Проект договора об электронных закупках</td>
                        <td className="p-3 text-sm border text-center">Нет</td>
                        <td className="p-3 text-sm border text-center"></td>
                      </tr>
                      {/* Дополнительные документы из tender.documents */}
                      {tender.documents && tender.documents.length > 0 ? (
                        tender.documents.map((doc, index) => (
                          <tr key={index} className="border-b hover:bg-gray-50">
                            <td className="p-3 text-sm border text-blue-600 hover:underline cursor-pointer">
                              {doc.filename || `Документ ${index + 1}`}
                            </td>
                            <td className="p-3 text-sm border text-center">Да</td>
                            <td className="p-3 text-sm border text-center">
                              <Button 
                                variant="default" 
                                size="sm" 
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                                onClick={() => handleDownloadDocument(doc)}
                              >
                                Перейти
                              </Button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <>
                          <tr className="border-b hover:bg-gray-50">
                            <td className="p-3 text-sm border">Приложение 1 (Перечень лотов)</td>
                            <td className="p-3 text-sm border text-center">Нет</td>
                            <td className="p-3 text-sm border text-center"></td>
                          </tr>
                          <tr className="border-b hover:bg-gray-50">
                            <td className="p-3 text-sm border">Приложение 2 (Техническая спецификация)</td>
                            <td className="p-3 text-sm border text-center">Нет</td>
                            <td className="p-3 text-sm border text-center"></td>
                          </tr>
                        </>
                      )}
                    </tbody>
                  </table>
                </div>
                
                <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <AlertCircle size={20} className="text-yellow-600" />
                    Требуемые документы для участия
                  </h4>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Банковская гарантия на 1% от суммы заявки</li>
                    <li>Подтверждение оплаты комиссии 1%</li>
                    <li>Лицензии и сертификаты (при необходимости)</li>
                    <li>Портфолио выполненных работ</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 4: Протоколы */}
          <TabsContent value="protocols">
            <Card>
              <CardHeader>
                <CardTitle>Протоколы AI-анализа</CardTitle>
                <CardDescription>Результаты обработки заявок с помощью искусственного интеллекта</CardDescription>
              </CardHeader>
              <CardContent>
                {protocols.length > 0 ? (
                  <div className="space-y-6">
                    {protocols.map((protocol, index) => (
                      <div key={index}>
                        {/* Протокол первого этапа */}
                        {protocol.stage1_qualified && protocol.stage1_qualified.length > 0 && (
                          <div className="mb-6">
                            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                              <Award className="text-green-600" size={20} />
                              Участники, прошедшие первый этап
                            </h3>
                            <div className="space-y-2">
                              {protocol.stage1_qualified.map((bid, bidIndex) => (
                                <div key={bidIndex} className="p-3 bg-green-50 border border-green-200 rounded">
                                  <p className="font-medium">{bid.contractor_name}</p>
                                  <div className="flex gap-4 text-sm text-gray-600 mt-1">
                                    <span>Цена: {bid.price?.toLocaleString('ru-RU')} ₸</span>
                                    <span>AI Оценка: {bid.ai_score}/100</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Отклоненные заявки */}
                        {protocol.rejected_bids && protocol.rejected_bids.length > 0 && (
                          <div className="mb-6">
                            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                              <FileText className="text-red-600" size={20} />
                              Заявки, не прошедшие отбор
                            </h3>
                            <div className="space-y-2">
                              {protocol.rejected_bids.map((bid, bidIndex) => (
                                <div key={bidIndex} className="p-3 bg-red-50 border border-red-200 rounded">
                                  <p className="font-medium">{bid.contractor_name}</p>
                                  <p className="text-sm text-gray-600 mt-1">
                                    Причина: {bid.rejection_reason || 'Не соответствует требованиям'}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Итоговый протокол */}
                        {protocol.winner && (
                          <div>
                            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                              <Trophy className="text-yellow-600" size={20} />
                              Итоговый протокол
                            </h3>
                            <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-lg">
                              <p className="text-sm text-gray-600 mb-2">Победитель тендера:</p>
                              <p className="text-xl font-bold text-gray-900">{protocol.winner.contractor_name}</p>
                              <div className="grid grid-cols-3 gap-4 mt-3">
                                <div>
                                  <p className="text-sm text-gray-600">Сумма заявки</p>
                                  <p className="font-semibold">{protocol.winner.price?.toLocaleString('ru-RU')} ₸</p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-600">AI Оценка</p>
                                  <p className="font-semibold">{protocol.winner.ai_score}/100</p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-600">Экономия</p>
                                  <p className="font-semibold text-green-600">
                                    {protocol.savings?.toLocaleString('ru-RU')} ₸
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <FileText size={48} className="mx-auto mb-3 opacity-50" />
                    <p>Протоколы будут опубликованы после завершения тендера</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 5: Информация о победителях */}
          <TabsContent value="winners">
            <Card>
              <CardHeader>
                <CardTitle>Информация о победителях</CardTitle>
                <CardDescription>Результаты тендера и информация о выбранных исполнителях</CardDescription>
              </CardHeader>
              <CardContent>
                {tender.winner_id ? (
                  <div className="space-y-4">
                    <div className="p-6 bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-300 rounded-lg">
                      <div className="flex items-center gap-3 mb-4">
                        <Trophy className="text-yellow-500" size={32} />
                        <div>
                          <h3 className="text-2xl font-bold">Победитель определен</h3>
                          <p className="text-gray-600">Тендер завершен, выбран исполнитель</p>
                        </div>
                      </div>

                      <div className="bg-white p-4 rounded mt-4">
                        <h4 className="font-semibold mb-2">Победитель:</h4>
                        <p className="text-lg font-bold text-green-700">{tender.winner_company || 'Информация обновляется'}</p>
                        
                        {tender.winner_price && (
                          <div className="mt-4 grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-gray-600">Сумма контракта</p>
                              <p className="text-xl font-bold">{tender.winner_price.toLocaleString('ru-RU')} ₸</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Экономия бюджета</p>
                              <p className="text-xl font-bold text-green-600">
                                {((tender.budget - tender.winner_price) / tender.budget * 100).toFixed(1)}%
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="p-4 bg-blue-50 rounded">
                      <h4 className="font-semibold mb-2">Следующие шаги:</h4>
                      <ul className="list-disc list-inside space-y-1 text-sm">
                        <li>Подписание договора между заказчиком и победителем</li>
                        <li>Предоставление банковской гарантии 3% от суммы договора</li>
                        <li>Возврат комиссии участникам, не прошедшим отбор</li>
                        <li>Начало выполнения работ согласно условиям тендера</li>
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Trophy size={48} className="mx-auto mb-3 opacity-50" />
                    <p>Победитель еще не определен</p>
                    <p className="text-sm mt-2">Информация появится после завершения тендера</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <style jsx>{`
          .contractor-tender-view {
            max-width: 1400px;
            margin: 0 auto;
            padding: 24px;
          }

          .header-section {
            margin-bottom: 24px;
          }

          @media (max-width: 768px) {
            .contractor-tender-view {
              padding: 16px;
            }

            .grid-cols-4 {
              grid-template-columns: 1fr;
            }
          }
        `}</style>
      </div>
    </Layout>
  );
};

export default ContractorTenderView;
