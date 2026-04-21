import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import { AppContext } from '@/App';
import { useLanguage } from '@/context/LanguageContext';
import ContractorLayout from '@/components/Layout';
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
      'draft': { label: 'Черновик', bg: 'var(--color-bg-muted)', color: 'var(--color-text-muted)' },
      'published': { label: 'Опубликован', bg: 'var(--color-primary-bg)', color: 'var(--color-primary-dark)' },
      'published_receiving_proposals': { label: 'Прием заявок', bg: 'var(--color-success-bg)', color: 'var(--color-success-mid)' },
      'active': { label: 'Активный', bg: 'var(--color-success-bg)', color: 'var(--color-success-mid)' },
      'under_review': { label: 'На рассмотрении', bg: 'var(--color-bg-muted)', color: 'var(--color-warning)' },
      'closed': { label: 'Завершен', bg: 'var(--color-bg-muted)', color: 'var(--color-text-muted)' },
      'cancelled': { label: 'Отменен', bg: 'var(--color-danger-tint-10)', color: 'var(--color-danger)' },
      'failed': { label: 'Не состоялся', bg: 'var(--color-danger-tint-10)', color: 'var(--color-danger)' }
    };

    const statusInfo = statusMap[status] || { label: status, bg: 'var(--color-bg-muted)', color: 'var(--color-text-muted)' };
    return (
      <span style={{padding:'var(--space-1) var(--space-3)',borderRadius:'var(--radius-pill)',fontSize:'var(--font-size-sm)',fontWeight:'var(--font-weight-medium)',background:statusInfo.bg,color:statusInfo.color}}>
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
      <ContractorLayout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Загрузка тендера...</p>
          </div>
        </div>
      </ContractorLayout>
    );
  }

  if (!tender) return null;

  return (
    <ContractorLayout>
      <div className="contractor-tender-view">
        {/* Header */}
        <div className="header-section">
          {/* Заголовок с кнопкой */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 style={{fontSize:'var(--font-size-3xl)',fontWeight:'var(--font-weight-bold)',color:'var(--color-text-primary)'}}>{tender.title}</h1>
              <p style={{fontSize:'var(--font-size-sm)',color:'var(--color-text-tertiary)',marginTop:'var(--space-1)'}}>Номер тендера: {tender.tender_number}</p>
            </div>
            
            {user && user.role === 'contractor' && (
              <>
                {userBid ? (
                  <Button
                    size="lg"
                    onClick={() => navigate('/contractor/bids')}
                    style={{background:'var(--color-primary)',color:'var(--color-text-inverse)'}}
                  >
                    Моя заявка
                  </Button>
                ) : canSubmitBid() ? (
                  <Button
                    size="lg"
                    onClick={() => navigate(`/tenders/${tender.id}/submit-bid`)}
                    style={{background:'var(--color-success-alt)',color:'var(--color-text-inverse)'}}
                  >
                    Подать заявку
                  </Button>
                ) : (
                  <Button
                    size="lg"
                    disabled
                    style={{background:'var(--color-text-placeholder)',color:'var(--color-text-inverse)',cursor:'not-allowed'}}
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
                    <label className="text-xs block mb-1" style={{color:'var(--color-text-muted)'}}>Номер объявления</label>
                    <div style={{padding:'var(--space-2-5)',background:'var(--color-bg-subtle)',borderRadius:'var(--radius-md)',border:'1px solid var(--color-border)',fontSize:'var(--font-size-sm)'}}>
                      {tender.tender_number || 'Не указан'}
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-xs block mb-1" style={{color:'var(--color-text-muted)'}}>Наименование объявления</label>
                    <div style={{padding:'var(--space-2-5)',background:'var(--color-bg-subtle)',borderRadius:'var(--radius-md)',border:'1px solid var(--color-border)',fontSize:'var(--font-size-sm)'}}>
                      {tender.title}
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-xs block mb-1" style={{color:'var(--color-text-muted)'}}>Статус объявления</label>
                    <div style={{padding:'var(--space-2-5)',background:'var(--color-bg-subtle)',borderRadius:'var(--radius-md)',border:'1px solid var(--color-border)',fontSize:'var(--font-size-sm)'}}>
                      {getStatusBadge(tender.status)}
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-xs block mb-1" style={{color:'var(--color-text-muted)'}}>Дата публикации объявления</label>
                    <div style={{padding:'var(--space-2-5)',background:'var(--color-bg-subtle)',borderRadius:'var(--radius-md)',border:'1px solid var(--color-border)',fontSize:'var(--font-size-sm)'}}>
                      {formatDate(tender.publication_date)}
                    </div>
                  </div>
                </div>
                
                {/* Правая колонка */}
                <div className="space-y-4">
                  <div>
                    <label className="text-xs block mb-1" style={{color:'var(--color-text-muted)'}}>Срок начала обсуждения</label>
                    <div style={{padding:'var(--space-2-5)',background:'var(--color-bg-subtle)',borderRadius:'var(--radius-md)',border:'1px solid var(--color-border)',fontSize:'var(--font-size-sm)'}}>
                      {formatDate(tender.publication_date)}
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-xs block mb-1" style={{color:'var(--color-text-muted)'}}>Срок окончания обсуждения</label>
                    <div style={{padding:'var(--space-2-5)',background:'var(--color-bg-subtle)',borderRadius:'var(--radius-md)',border:'1px solid var(--color-border)',fontSize:'var(--font-size-sm)'}}>
                      {formatDate(tender.submission_start)}
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-xs block mb-1" style={{color:'var(--color-text-muted)'}}>Предварительный срок начала приема заявок</label>
                    <div style={{padding:'var(--space-2-5)',background:'var(--color-bg-subtle)',borderRadius:'var(--radius-md)',border:'1px solid var(--color-border)',fontSize:'var(--font-size-sm)'}}>
                      {formatDate(tender.submission_start)}
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-xs block mb-1" style={{color:'var(--color-text-muted)'}}>Предварительный срок окончания приема заявок</label>
                    <div style={{padding:'var(--space-2-5)',background:'var(--color-bg-subtle)',borderRadius:'var(--radius-md)',border:'1px solid var(--color-border)',fontSize:'var(--font-size-sm)'}}>
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
          <TabsList className="w-full justify-start mb-6 rounded-none h-auto p-0" style={{background:'var(--color-bg-surface)',borderBottom:'1px solid var(--color-border-gray)'}}>
            <TabsTrigger 
              value="general" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-[var(--color-primary)] data-[state=active]:bg-[var(--color-primary-bg)] px-6 py-3 text-sm font-medium"
            >
              Общие сведения
            </TabsTrigger>
            <TabsTrigger 
              value="lots"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-[var(--color-primary)] data-[state=active]:bg-[var(--color-primary-bg)] px-6 py-3 text-sm font-medium"
            >
              Лоты
            </TabsTrigger>
            <TabsTrigger 
              value="documents"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-[var(--color-primary)] data-[state=active]:bg-[var(--color-primary-bg)] px-6 py-3 text-sm font-medium"
            >
              Документация
            </TabsTrigger>
            <TabsTrigger 
              value="protocols"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-[var(--color-primary)] data-[state=active]:bg-[var(--color-primary-bg)] px-6 py-3 text-sm font-medium"
            >
              Протоколы
            </TabsTrigger>
            <TabsTrigger 
              value="winners"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-[var(--color-primary)] data-[state=active]:bg-[var(--color-primary-bg)] px-6 py-3 text-sm font-medium"
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
                      <label className="text-sm font-semibold" style={{color:'var(--color-text-tertiary)'}}>Способ проведения закупки</label>
                      <p className="mt-1" style={{color:'var(--color-text-primary)'}}>
                        {tender.tender_type === 'price_proposals' && 'Ценовые предложения'}
                        {tender.tender_type === 'open_competition' && 'Открытый конкурс'}
                        {tender.tender_type === 'auction' && 'Аукцион'}
                        {tender.tender_type === 'single_source' && 'Единственный источник'}
                      </p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-semibold" style={{color:'var(--color-text-tertiary)'}}>Вид предмета закупок</label>
                      <p className="mt-1" style={{color:'var(--color-text-primary)'}}>
                        {tender.category === 'construction' && 'Строительство'}
                        {tender.category === 'it' && 'IT-услуги'}
                        {tender.category === 'consulting' && 'Консалтинг'}
                        {tender.category === 'logistics' && 'Логистика'}
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-semibold" style={{color:'var(--color-text-tertiary)'}}>Организатор</label>
                    <p className="mt-1" style={{color:'var(--color-text-primary)'}}>{tender.customer_organization || tender.customer_name || 'Не указано'}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-semibold" style={{color:'var(--color-text-tertiary)'}}>Юр. адрес организатора</label>
                    <p className="mt-1" style={{color:'var(--color-text-primary)'}}>{tender.customer_legal_address || tender.customer_email}</p>
                  </div>
                  
                  {tender.procurement_subject && (
                    <div>
                      <label className="text-sm font-semibold" style={{color:'var(--color-text-tertiary)'}}>Вид предмета закупок</label>
                      <p className="mt-1" style={{color:'var(--color-text-primary)'}}>
                        {tender.procurement_subject === 'goods' && 'Товары'}
                        {tender.procurement_subject === 'works' && 'Работы'}
                        {tender.procurement_subject === 'services' && 'Услуги'}
                      </p>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm font-semibold" style={{color:'var(--color-text-tertiary)'}}>Кол-во лотов в объявлении</label>
                      <p className="mt-1 text-lg font-bold" style={{color:'var(--color-text-primary)'}}>{tender.lots?.length || 1}</p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-semibold" style={{color:'var(--color-text-tertiary)'}}>Сумма закупки</label>
                      <p className="mt-1 text-lg font-bold" style={{color:'var(--color-text-primary)'}}>
                        {tender.budget?.toLocaleString('ru-RU')} ₸
                      </p>
                    </div>
                  </div>
                  
                  {(tender.special_conditions && tender.special_conditions.length > 0 && tender.special_conditions[0]) && (
                    <div>
                      <label className="text-sm font-semibold" style={{color:'var(--color-text-tertiary)'}}>Признаки</label>
                      <ul className="mt-2 space-y-1">
                        {tender.special_conditions.filter(cond => cond).map((cond, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <span style={{color:'var(--color-success-medium)'}}>✓</span>
                            <span style={{color:'var(--color-text-primary)'}}>{cond}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {tender.requirements && tender.requirements.length > 0 && tender.requirements[0] && (
                    <div>
                      <label className="text-sm font-semibold" style={{color:'var(--color-text-tertiary)'}}>Требования к участникам</label>
                      <ul className="mt-2 space-y-1">
                        {tender.requirements.filter(req => req).map((req, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <span style={{color:'var(--color-primary)'}}>•</span>
                            <span style={{color:'var(--color-text-primary)'}}>{req}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  <div>
                    <h4 className="font-semibold mb-2 mt-6" style={{color:'var(--color-text-primary)'}}>Информация об организаторе</h4>
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="text-sm font-semibold" style={{color:'var(--color-text-tertiary)'}}>ФИО представителя</label>
                        <p className="mt-1" style={{color:'var(--color-text-primary)'}}>{tender.customer_representative_name || tender.customer_name || 'Не указано'}</p>
                      </div>
                      
                      <div>
                        <label className="text-sm font-semibold" style={{color:'var(--color-text-tertiary)'}}>Должность</label>
                        <p className="mt-1" style={{color:'var(--color-text-primary)'}}>{tender.customer_representative_position || 'Руководитель отдела закупок'}</p>
                      </div>
                    </div>
                  </div>
                  
                  {tender.description && (
                    <div className="mt-6 p-4 rounded-lg" style={{background:'var(--color-primary-bg)',border:'1px solid var(--color-primary-border)'}}>
                      <h4 className="font-semibold mb-2">Описание закупки</h4>
                      <p className="whitespace-pre-wrap" style={{color:'var(--color-text-tertiary)'}}>{tender.description}</p>
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
                        <tr style={{background:'var(--color-bg-subtle)',borderBottom:'2px solid var(--color-border)'}}>
                          <th className="p-3 text-left text-sm font-semibold border whitespace-nowrap" style={{color:'var(--color-text-tertiary)'}}>№ п/п</th>
                          <th className="p-3 text-left text-sm font-semibold border whitespace-nowrap" style={{color:'var(--color-text-tertiary)'}}>Номер лота</th>
                          <th className="p-3 text-left text-sm font-semibold border whitespace-nowrap" style={{color:'var(--color-text-tertiary)'}}>Заказчик</th>
                          <th className="p-3 text-left text-sm font-semibold border whitespace-nowrap" style={{color:'var(--color-text-tertiary)'}}>Наименование</th>
                          <th className="p-3 text-left text-sm font-semibold border whitespace-nowrap" style={{color:'var(--color-text-tertiary)'}}>Дополнительная характеристика</th>
                          <th className="p-3 text-left text-sm font-semibold border whitespace-nowrap" style={{color:'var(--color-text-tertiary)'}}>Цена за ед.</th>
                          <th className="p-3 text-left text-sm font-semibold border whitespace-nowrap" style={{color:'var(--color-text-tertiary)'}}>Кол-во</th>
                          <th className="p-3 text-left text-sm font-semibold border whitespace-nowrap" style={{color:'var(--color-text-tertiary)'}}>Ед. изм.</th>
                          <th className="p-3 text-left text-sm font-semibold border whitespace-nowrap" style={{color:'var(--color-text-tertiary)'}}>Плановая сумма</th>
                          <th className="p-3 text-left text-sm font-semibold border whitespace-nowrap" style={{color:'var(--color-text-tertiary)'}}>Статус лота</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tender.lots.map((lot, index) => (
                          <tr key={lot.id || index} className="border-b hover:bg-[var(--color-bg-subtle)]">
                            <td className="p-3 text-sm border whitespace-nowrap">{index + 1}</td>
                            <td className="p-3 text-sm border whitespace-nowrap">
                              <span className="font-medium" style={{color:'var(--color-primary)'}}>
                                {tender.tender_number}-{lot.lot_number || (index + 1)}
                              </span>
                            </td>
                            <td className="p-3 text-sm border">{tender.customer_name || 'Не указано'}</td>
                            <td className="p-3 text-sm border font-medium">{lot.name}</td>
                            <td className="p-3 text-sm border" style={{color:'var(--color-text-tertiary)'}}>
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
                              <span className="px-2 py-1 rounded text-xs" style={{background:'var(--color-success-bg)',color:'var(--color-success-mid)'}}>
                                Опубликован
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-6 rounded text-center" style={{background:'var(--color-bg-subtle)'}}>
                    <p style={{color:'var(--color-text-tertiary)'}}>Закупка без разделения на лоты</p>
                    <div className="mt-4">
                      <p className="text-sm" style={{color:'var(--color-text-tertiary)'}}>Общая сумма закупки:</p>
                      <p className="text-2xl font-bold mt-1" style={{color:'var(--color-text-primary)'}}>
                        {tender.budget?.toLocaleString('ru-RU')} ₸
                      </p>
                    </div>
                    {tender.technical_specs && (
                      <div className="mt-4 p-4 bg-white rounded text-left">
                        <h4 className="font-semibold mb-2">Технические требования</h4>
                        <p className="text-sm whitespace-pre-wrap" style={{color:'var(--color-text-tertiary)'}}>{tender.technical_specs}</p>
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
                      <tr style={{background:'var(--color-bg-subtle)',borderBottom:'2px solid var(--color-border)'}}>
                        <th className="p-3 text-left text-sm font-semibold border" style={{color:'var(--color-text-tertiary)'}}>Наименование документа</th>
                        <th className="p-3 text-center text-sm font-semibold border w-32" style={{color:'var(--color-text-tertiary)'}}>Признак</th>
                        <th className="p-3 text-center text-sm font-semibold border w-32"></th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b hover:bg-[var(--color-bg-subtle)]">
                        <td className="p-3 text-sm border">Конкурсная документация</td>
                        <td className="p-3 text-sm border text-center">Нет</td>
                        <td className="p-3 text-sm border text-center"></td>
                      </tr>
                      <tr className="border-b hover:bg-[var(--color-bg-subtle)]">
                        <td className="p-3 text-sm border">Проект договора об электронных закупках</td>
                        <td className="p-3 text-sm border text-center">Нет</td>
                        <td className="p-3 text-sm border text-center"></td>
                      </tr>
                      {/* Дополнительные документы из tender.documents */}
                      {tender.documents && tender.documents.length > 0 ? (
                        tender.documents.map((doc, index) => (
                          <tr key={index} className="border-b hover:bg-[var(--color-bg-subtle)]">
                            <td className="p-3 text-sm border hover:underline cursor-pointer" style={{color:'var(--color-primary)'}}>
                              {doc.filename || `Документ ${index + 1}`}
                            </td>
                            <td className="p-3 text-sm border text-center">Да</td>
                            <td className="p-3 text-sm border text-center">
                              <Button 
                                variant="default" 
                                size="sm" 
                                style={{background:'var(--color-primary)',color:'var(--color-text-inverse)'}}
                                onClick={() => handleDownloadDocument(doc)}
                              >
                                Перейти
                              </Button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <>
                          <tr className="border-b hover:bg-[var(--color-bg-subtle)]">
                            <td className="p-3 text-sm border">Приложение 1 (Перечень лотов)</td>
                            <td className="p-3 text-sm border text-center">Нет</td>
                            <td className="p-3 text-sm border text-center"></td>
                          </tr>
                          <tr className="border-b hover:bg-[var(--color-bg-subtle)]">
                            <td className="p-3 text-sm border">Приложение 2 (Техническая спецификация)</td>
                            <td className="p-3 text-sm border text-center">Нет</td>
                            <td className="p-3 text-sm border text-center"></td>
                          </tr>
                        </>
                      )}
                    </tbody>
                  </table>
                </div>
                
                <div className="mt-6 p-4 rounded" style={{background:'var(--color-bg-muted)',border:'1px solid var(--color-border-gray)'}}>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <AlertCircle size={20} style={{color:'var(--color-warning)'}} />
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
                              <Award style={{color:'var(--color-success-medium)'}} size={20} />
                              Участники, прошедшие первый этап
                            </h3>
                            <div className="space-y-2">
                              {protocol.stage1_qualified.map((bid, bidIndex) => (
                                <div key={bidIndex} className="p-3 rounded" style={{background:'var(--color-success-bg-alt)',border:'1px solid var(--color-success-bg)'}}>
                                  <p className="font-medium">{bid.contractor_name}</p>
                                  <div className="flex gap-4 text-sm mt-1" style={{color:'var(--color-text-tertiary)'}}>
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
                              <FileText style={{color:'var(--color-danger)'}} size={20} />
                              Заявки, не прошедшие отбор
                            </h3>
                            <div className="space-y-2">
                              {protocol.rejected_bids.map((bid, bidIndex) => (
                                <div key={bidIndex} className="p-3 rounded" style={{background:'var(--color-danger-tint-05)',border:'1px solid var(--color-danger-tint-10)'}}>
                                  <p className="font-medium">{bid.contractor_name}</p>
                                  <p className="text-sm mt-1" style={{color:'var(--color-text-tertiary)'}}>
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
                              <Trophy style={{color:'var(--color-warning)'}} size={20} />
                              Итоговый протокол
                            </h3>
                            <div className="p-4 rounded-lg" style={{background:'var(--color-bg-warm)',border:'2px solid var(--color-border-dark)'}}>
                              <p className="text-sm mb-2" style={{color:'var(--color-text-tertiary)'}}>Победитель тендера:</p>
                              <p className="text-xl font-bold" style={{color:'var(--color-text-primary)'}}>{protocol.winner.contractor_name}</p>
                              <div className="grid grid-cols-3 gap-4 mt-3">
                                <div>
                                  <p className="text-sm" style={{color:'var(--color-text-tertiary)'}}>Сумма заявки</p>
                                  <p className="font-semibold">{protocol.winner.price?.toLocaleString('ru-RU')} ₸</p>
                                </div>
                                <div>
                                  <p className="text-sm" style={{color:'var(--color-text-tertiary)'}}>AI Оценка</p>
                                  <p className="font-semibold">{protocol.winner.ai_score}/100</p>
                                </div>
                                <div>
                                  <p className="text-sm" style={{color:'var(--color-text-tertiary)'}}>Экономия</p>
                                  <p className="font-semibold" style={{color:'var(--color-success-medium)'}}>
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
                  <div className="text-center py-8" style={{color:'var(--color-text-muted)'}}>
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
                    <div className="p-6 rounded-lg" style={{background:'var(--color-success-bg-alt)',border:'2px solid var(--color-success-bg)'}}>
                      <div className="flex items-center gap-3 mb-4">
                        <Trophy style={{color:'var(--color-warning)'}} size={32} />
                        <div>
                          <h3 className="text-2xl font-bold">Победитель определен</h3>
                          <p style={{color:'var(--color-text-tertiary)'}}>Тендер завершен, выбран исполнитель</p>
                        </div>
                      </div>

                      <div className="p-4 rounded mt-4" style={{background:'var(--color-bg-surface)'}}>
                        <h4 className="font-semibold mb-2">Победитель:</h4>
                        <p className="text-lg font-bold" style={{color:'var(--color-success-mid)'}}>{tender.winner_company || 'Информация обновляется'}</p>

                        {tender.winner_price && (
                          <div className="mt-4 grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm" style={{color:'var(--color-text-tertiary)'}}>Сумма контракта</p>
                              <p className="text-xl font-bold">{tender.winner_price.toLocaleString('ru-RU')} ₸</p>
                            </div>
                            <div>
                              <p className="text-sm" style={{color:'var(--color-text-tertiary)'}}>Экономия бюджета</p>
                              <p className="text-xl font-bold" style={{color:'var(--color-success-medium)'}}>
                                {((tender.budget - tender.winner_price) / tender.budget * 100).toFixed(1)}%
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="p-4 rounded" style={{background:'var(--color-primary-bg)'}}>
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
                  <div className="text-center py-8" style={{color:'var(--color-text-muted)'}}>
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
    </ContractorLayout>
  );
};

export default ContractorTenderView;
