import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Layout from '../components/Layout';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { AppContext } from '../App';
import { ArrowLeft, Send, CheckCircle, FileSignature, Printer, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { getContractStatusText, getContractActionText } from '../utils/statusHelpers';

const ContractDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, API } = useContext(AppContext);
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDetailsForm, setShowDetailsForm] = useState(false);
  const [showSignatureDialog, setShowSignatureDialog] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [codeRequested, setCodeRequested] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [editingTemplate, setEditingTemplate] = useState(false);
  const [editedTemplate, setEditedTemplate] = useState('');
  
  const [contractorDetails, setContractorDetails] = useState({
    bin_iin: '',
    iik: '',
    bik: '',
    bank_name: '',
    legal_address: '',
    contact_phone: '',
    contact_email: '',
    basis: '',
    director_name: ''
  });

  useEffect(() => {
    fetchContract();
  }, [id]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const fetchContract = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API}/contracts/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setContract(response.data);
      setEditedTemplate(response.data.contract_template || '');
      
      // Pre-fill contractor details if they exist
      if (response.data.contractor_details) {
        setContractorDetails(response.data.contractor_details);
      }
    } catch (error) {
      console.error('Error fetching contract:', error);
      toast.error('Ошибка при загрузке договора');
    } finally {
      setLoading(false);
    }
  };

  const handleSendForApproval = async () => {
    if (!window.confirm('Отправить договор на согласование исполнителю?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API}/contracts/${id}/send-for-approval`, {}, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      toast.success('Договор отправлен на согласование исполнителю');
      fetchContract();
    } catch (error) {
      const errorMsg = typeof error.response?.data?.detail === 'string' 
        ? error.response.data.detail 
        : 'Ошибка при отправке';
      toast.error(errorMsg);
    }
  };

  const handleSaveTemplate = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API}/contracts/${id}`, {
        contract_template: editedTemplate
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      toast.success('Договор сохранен');
      setEditingTemplate(false);
      fetchContract();
    } catch (error) {
      const errorMsg = typeof error.response?.data?.detail === 'string' 
        ? error.response.data.detail 
        : 'Ошибка при сохранении';
      toast.error(errorMsg);
    }
  };

  const handleSendForSignature = async () => {
    if (!window.confirm('Отправить договор на подписание исполнителю?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API}/contracts/${id}/send-for-signature`, {}, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      toast.success('Договор отправлен на подписание исполнителю');
      fetchContract();
    } catch (error) {
      const errorMsg = typeof error.response?.data?.detail === 'string' 
        ? error.response.data.detail 
        : 'Ошибка при отправке';
      toast.error(errorMsg);
    }
  };

  const handleSaveContractorDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API}/contracts/${id}/contractor-details`, contractorDetails, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      toast.success('Реквизиты сохранены');
      setShowDetailsForm(false);
      fetchContract();
    } catch (error) {
      const errorMsg = typeof error.response?.data?.detail === 'string' 
        ? error.response.data.detail 
        : 'Ошибка при сохранении';
      toast.error(errorMsg);
    }
  };

  const handleApproveContract = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API}/contracts/${id}/approve`, {}, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      toast.success('Договор утвержден и готов к подписанию');
      fetchContract();
    } catch (error) {
      const errorMsg = typeof error.response?.data?.detail === 'string' 
        ? error.response.data.detail 
        : 'Ошибка при утверждении';
      toast.error(errorMsg);
    }
  };

  const handleRequestCode = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API}/contracts/${id}/request-signature-code`, {}, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      toast.success('Код отправлен на ваш email');
      setCodeRequested(true);
      setCountdown(60);
    } catch (error) {
      if (error.response?.status === 429) {
        const remaining = error.response?.data?.detail?.match(/\d+/);
        if (remaining) {
          setCountdown(parseInt(remaining[0]));
        }
        const errorMsg = typeof error.response?.data?.detail === 'string' 
          ? error.response.data.detail 
          : 'Слишком много попыток';
        toast.error(errorMsg);
      } else {
        toast.error('Ошибка при запросе кода');
      }
    }
  };

  const handleSignContract = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      toast.error('Введите 6-значный код');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API}/contracts/${id}/sign`, 
        { verification_code: verificationCode },
        {
          headers: { 'Authorization': `Bearer ${token}` },
          params: { verification_code: verificationCode }
        }
      );
      toast.success('Договор успешно подписан!');
      setShowSignatureDialog(false);
      setVerificationCode('');
      setCodeRequested(false);
      fetchContract();
    } catch (error) {
      const errorMsg = typeof error.response?.data?.detail === 'string' 
        ? error.response.data.detail 
        : 'Ошибка при подписании';
      toast.error(errorMsg);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <Layout>
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Загрузка договора...</p>
        </div>
      </Layout>
    );
  }

  if (!contract) {
    return (
      <Layout>
        <Card className="empty-state">
          <p>Договор не найден</p>
          <Button onClick={() => navigate('/contracts')}>Вернуться к списку</Button>
        </Card>
      </Layout>
    );
  }

  const isCustomer = user?.id === contract.customer_id;
  const isContractor = user?.id === contract.contractor_id;

  const getStatusText = (status) => {
    const statuses = {
      draft: 'Черновик',
      pending_approval: 'На согласовании',
      approved: 'Согласован',
      pending_signature: 'Ожидает подписания',
      signed: 'Подписан',
      active: 'Действующий',
      terminated: 'Расторгнут'
    };
    return statuses[status] || status;
  };

  return (
    <Layout>
      <div className="contract-detail-page">
        <div className="page-header">
          <Button variant="outline" onClick={() => navigate('/contracts')}>
            <ArrowLeft size={20} />
            Назад
          </Button>
          <div className="header-content">
            <h1>Договор №{contract.contract_number}</h1>
            <p className="subtitle">Тендер: {contract.tender_title}</p>
          </div>
          <div className="header-actions">
            {/* Заказчик - Черновик */}
            {isCustomer && contract.status === 'draft' && (
              <>
                <Button onClick={() => setEditingTemplate(!editingTemplate)} variant="outline">
                  {editingTemplate ? 'Отменить редактирование' : 'Редактировать договор'}
                </Button>
                <Button onClick={handleSendForApproval}>
                  <Send size={16} />
                  Отправить на согласование
                </Button>
              </>
            )}
            
            {/* Исполнитель - На согласовании */}
            {isContractor && contract.status === 'pending_approval' && (
              <>
                {!contract.contractor_details && (
                  <Button onClick={() => setShowDetailsForm(true)} variant="outline">
                    Заполнить реквизиты
                  </Button>
                )}
                {contract.contractor_details && (
                  <Button onClick={handleApproveContract}>
                    <CheckCircle size={16} />
                    Согласовать договор
                  </Button>
                )}
              </>
            )}
            
            {/* Заказчик - Согласовано, отправить на подписание */}
            {isCustomer && contract.status === 'approved' && (
              <Button onClick={handleSendForSignature}>
                <FileSignature size={16} />
                Отправить на подписание
              </Button>
            )}
            
            {/* Исполнитель - На подписании */}
            {isContractor && contract.status === 'pending_signature' && (
              <Button onClick={() => setShowSignatureDialog(true)}>
                <FileSignature size={16} />
                Подписать договор
              </Button>
            )}
            
            {/* Подписанный договор - печать */}
            {(contract.status === 'signed' || contract.status === 'active') && (
              <Button onClick={handlePrint} variant="outline">
                <Printer size={16} />
                Распечатать
              </Button>
            )}
          </div>
        </div>

        <Tabs defaultValue="general" className="contract-tabs">
          <TabsList>
            <TabsTrigger value="general">Общее</TabsTrigger>
            <TabsTrigger value="items">Предметы договора</TabsTrigger>
            <TabsTrigger value="parties">Заказчик и поставщик</TabsTrigger>
            <TabsTrigger value="agreement">Договор и согласование</TabsTrigger>
            <TabsTrigger value="termination">Одностороннее расторжение</TabsTrigger>
            <TabsTrigger value="payment">Информация об оплате</TabsTrigger>
            <TabsTrigger value="guarantee">Обеспечение исполнения</TabsTrigger>
            <TabsTrigger value="additional">Доп. соглашения</TabsTrigger>
            <TabsTrigger value="documents">Подтверждающие документы</TabsTrigger>
          </TabsList>

          {/* General Tab */}
          <TabsContent value="general">
            <Card className="tab-content">
              <h3>Общая информация</h3>
              <div className="info-grid">
                <div className="info-item">
                  <Label>Номер договора</Label>
                  <p>{contract.contract_number}</p>
                </div>
                <div className="info-item">
                  <Label>Дата создания</Label>
                  <p>{new Date(contract.created_at).toLocaleDateString('ru-RU')}</p>
                </div>
                <div className="info-item">
                  <Label>Дата договора</Label>
                  <p>{contract.contract_date ? new Date(contract.contract_date).toLocaleDateString('ru-RU') : '-'}</p>
                </div>
                <div className="info-item">
                  <Label>Статус</Label>
                  <p className="status-text">{getStatusText(contract.status)}</p>
                </div>
                <div className="info-item">
                  <Label>Тендер</Label>
                  <p>{contract.tender_title}</p>
                </div>
                <div className="info-item">
                  <Label>Номер тендера</Label>
                  <p>{contract.tender_number}</p>
                </div>
                <div className="info-item">
                  <Label>Сумма договора (без НДС)</Label>
                  <p className="amount">{contract.contract_amount?.toLocaleString()} ₸</p>
                </div>
                <div className="info-item">
                  <Label>НДС (12%)</Label>
                  <p>{((contract.contract_amount || 0) * 0.12).toLocaleString()} ₸</p>
                </div>
                <div className="info-item">
                  <Label>Сумма с НДС</Label>
                  <p className="amount">{contract.contract_amount_with_vat?.toLocaleString()} ₸</p>
                </div>
              </div>
              
              <div className="history-section">
                <h4>История изменений</h4>
                {contract.history && contract.history.length > 0 ? (
                  <div className="history-list">
                    {contract.history.map((entry, idx) => (
                      <div key={idx} className="history-item">
                        <div className="history-time">{new Date(entry.timestamp).toLocaleString('ru-RU')}</div>
                        <div className="history-action">{getContractActionText(entry.action)}</div>
                        <div className="history-user">{entry.user_name}</div>
                        {entry.comment && <div className="history-comment">{entry.comment}</div>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="empty-text">История изменений отсутствует</p>
                )}
              </div>
            </Card>
          </TabsContent>

          {/* Items Tab */}
          <TabsContent value="items">
            <Card className="tab-content">
              <h3>Предметы договора</h3>
              <div className="items-section">
                <div className="item-card">
                  <Label>Наименование</Label>
                  <p>{contract.tender_title}</p>
                </div>
                <div className="item-details-grid">
                  <div className="item-detail">
                    <Label>Категория</Label>
                    <p>{contract.contract_data?.category || 'Не указана'}</p>
                  </div>
                  <div className="item-detail">
                    <Label>Количество</Label>
                    <p>{contract.contract_data?.quantity || '-'}</p>
                  </div>
                  <div className="item-detail">
                    <Label>Единица измерения</Label>
                    <p>{contract.contract_data?.unit || 'шт.'}</p>
                  </div>
                  <div className="item-detail">
                    <Label>Цена за единицу</Label>
                    <p>{contract.contract_data?.unit_price?.toLocaleString() || '-'} ₸</p>
                  </div>
                  <div className="item-detail">
                    <Label>Итоговая сумма</Label>
                    <p className="amount">{contract.contract_amount?.toLocaleString()} ₸</p>
                  </div>
                  <div className="item-detail">
                    <Label>Срок исполнения</Label>
                    <p>{contract.contract_data?.contract_end_date ? new Date(contract.contract_data.contract_end_date).toLocaleDateString('ru-RU') : '-'}</p>
                  </div>
                </div>
                {contract.contract_data?.technical_specs && (
                  <div className="technical-specs">
                    <Label>Технические характеристики</Label>
                    <p>{contract.contract_data.technical_specs}</p>
                  </div>
                )}
              </div>
            </Card>
          </TabsContent>

          {/* Parties Tab */}
          <TabsContent value="parties">
            <Card className="tab-content">
              <h3>Стороны договора</h3>
              
              <div className="party-section">
                <h4>Заказчик</h4>
                <div className="party-grid">
                  <div className="party-item">
                    <Label>Наименование организации</Label>
                    <p>{contract.customer_name}</p>
                  </div>
                  <div className="party-item">
                    <Label>БИН</Label>
                    <p>{contract.contract_data?.customer_bin || '-'}</p>
                  </div>
                  <div className="party-item">
                    <Label>Юридический адрес</Label>
                    <p>{contract.contract_data?.customer_address || '-'}</p>
                  </div>
                  <div className="party-item">
                    <Label>Телефон</Label>
                    <p>{contract.contract_data?.customer_phone || '-'}</p>
                  </div>
                  <div className="party-item">
                    <Label>ИИК</Label>
                    <p>{contract.contract_data?.customer_iik || '-'}</p>
                  </div>
                  <div className="party-item">
                    <Label>БИК</Label>
                    <p>{contract.contract_data?.customer_bik || '-'}</p>
                  </div>
                  <div className="party-item">
                    <Label>Банк</Label>
                    <p>{contract.contract_data?.customer_bank || '-'}</p>
                  </div>
                  <div className="party-item">
                    <Label>Регион</Label>
                    <p>{contract.contract_data?.customer_region || '-'}</p>
                  </div>
                </div>
              </div>

              <div className="party-section">
                <h4>Поставщик (Исполнитель)</h4>
                <div className="party-grid">
                  <div className="party-item">
                    <Label>Наименование организации</Label>
                    <p>{contract.contractor_name}</p>
                  </div>
                  <div className="party-item">
                    <Label>БИН/ИИН</Label>
                    <p>{contract.contractor_details?.bin_iin || 'Не заполнено'}</p>
                  </div>
                  <div className="party-item">
                    <Label>Юридический адрес</Label>
                    <p>{contract.contractor_details?.legal_address || 'Не заполнено'}</p>
                  </div>
                  <div className="party-item">
                    <Label>Телефон</Label>
                    <p>{contract.contractor_details?.contact_phone || 'Не заполнено'}</p>
                  </div>
                  <div className="party-item">
                    <Label>Email</Label>
                    <p>{contract.contractor_details?.contact_email || 'Не заполнено'}</p>
                  </div>
                  <div className="party-item">
                    <Label>ИИК</Label>
                    <p>{contract.contractor_details?.iik || 'Не заполнено'}</p>
                  </div>
                  <div className="party-item">
                    <Label>БИК</Label>
                    <p>{contract.contractor_details?.bik || 'Не заполнено'}</p>
                  </div>
                  <div className="party-item">
                    <Label>Банк</Label>
                    <p>{contract.contractor_details?.bank_name || 'Не заполнено'}</p>
                  </div>
                  <div className="party-item">
                    <Label>ФИО директора</Label>
                    <p>{contract.contractor_details?.director_name || 'Не заполнено'}</p>
                  </div>
                  <div className="party-item">
                    <Label>Действует на основании</Label>
                    <p>{contract.contractor_details?.basis || 'Не заполнено'}</p>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Agreement Tab */}
          <TabsContent value="agreement">
            <Card className="tab-content">
              <h3>Согласование и подписание договора</h3>
              
              <div className="workflow-status">
                <h4>Текущий этап согласования</h4>
                <div className="status-flow">
                  <div className={`status-step ${contract.status === 'draft' ? 'active' : 'completed'}`}>
                    <div className="step-number">1</div>
                    <div className="step-info">
                      <div className="step-title">Черновик</div>
                      <div className="step-desc">Заказчик редактирует договор</div>
                    </div>
                  </div>
                  
                  <div className={`status-step ${contract.status === 'pending_approval' ? 'active' : contract.status !== 'draft' ? 'completed' : ''}`}>
                    <div className="step-number">2</div>
                    <div className="step-info">
                      <div className="step-title">На согласовании</div>
                      <div className="step-desc">Исполнитель заполняет реквизиты и согласовывает</div>
                    </div>
                  </div>
                  
                  <div className={`status-step ${contract.status === 'approved' ? 'active' : ['pending_signature', 'signed', 'active'].includes(contract.status) ? 'completed' : ''}`}>
                    <div className="step-number">3</div>
                    <div className="step-info">
                      <div className="step-title">Согласовано</div>
                      <div className="step-desc">Заказчик отправляет на подписание</div>
                    </div>
                  </div>
                  
                  <div className={`status-step ${contract.status === 'pending_signature' ? 'active' : ['signed', 'active'].includes(contract.status) ? 'completed' : ''}`}>
                    <div className="step-number">4</div>
                    <div className="step-info">
                      <div className="step-title">На подписании</div>
                      <div className="step-desc">Исполнитель подписывает с OTP</div>
                    </div>
                  </div>
                  
                  <div className={`status-step ${['signed', 'active'].includes(contract.status) ? 'active completed' : ''}`}>
                    <div className="step-number">5</div>
                    <div className="step-info">
                      <div className="step-title">Действует</div>
                      <div className="step-desc">Исполнитель выполняет работы</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Инструкции по текущему этапу */}
              <div className="current-stage-info">
                {contract.status === 'draft' && isCustomer && (
                  <div className="info-box draft">
                    <h4>📝 Этап 1: Редактирование договора</h4>
                    <p>Вы можете отредактировать текст договора ниже. После завершения редактирования нажмите "Отправить на согласование" чтобы передать договор исполнителю.</p>
                    <ul>
                      <li>Проверьте все реквизиты заказчика</li>
                      <li>Убедитесь в правильности суммы и условий</li>
                      <li>Отредактируйте текст договора при необходимости</li>
                    </ul>
                  </div>
                )}

                {contract.status === 'pending_approval' && isContractor && (
                  <div className="info-box pending">
                    <h4>⏳ Этап 2: Согласование договора</h4>
                    <p>Договор ожидает вашего согласования. Заполните реквизиты вашей организации и согласуйте договор.</p>
                    <ul>
                      <li>Заполните реквизиты вашей организации (БИН, ИИК, банк, адрес)</li>
                      <li>Проверьте условия договора</li>
                      <li>Срок согласования: 5 рабочих дней</li>
                    </ul>
                    {!contract.contractor_details && (
                      <p className="warning-text">⚠️ Необходимо заполнить реквизиты исполнителя перед согласованием</p>
                    )}
                  </div>
                )}

                {contract.status === 'pending_approval' && isCustomer && (
                  <div className="info-box waiting">
                    <h4>⏳ Ожидание согласования исполнителем</h4>
                    <p>Договор отправлен на согласование исполнителю. Исполнитель должен заполнить свои реквизиты и согласовать договор в течение 5 рабочих дней.</p>
                  </div>
                )}

                {contract.status === 'approved' && isCustomer && (
                  <div className="info-box approved">
                    <h4>✅ Этап 3: Договор согласован</h4>
                    <p>Исполнитель согласовал договор. Теперь вы можете отправить договор на финальное подписание исполнителю.</p>
                    <ul>
                      <li>Проверьте реквизиты исполнителя</li>
                      <li>Убедитесь в корректности всех данных</li>
                      <li>Нажмите "Отправить на подписание"</li>
                    </ul>
                  </div>
                )}

                {contract.status === 'approved' && isContractor && (
                  <div className="info-box waiting">
                    <h4>⏳ Ожидание отправки на подписание</h4>
                    <p>Вы согласовали договор. Ожидайте, когда заказчик отправит договор на подписание.</p>
                  </div>
                )}

                {contract.status === 'pending_signature' && isContractor && (
                  <div className="info-box signature">
                    <h4>✍️ Этап 4: Подписание договора</h4>
                    <p>Договор готов к подписанию. Для подписания вам необходимо получить код подтверждения на ваш email и ввести его.</p>
                    <ul>
                      <li>Нажмите "Подписать договор" в правом верхнем углу</li>
                      <li>Получите код подтверждения на email</li>
                      <li>Введите 6-значный код для подписания</li>
                    </ul>
                  </div>
                )}

                {contract.status === 'pending_signature' && isCustomer && (
                  <div className="info-box waiting">
                    <h4>⏳ Ожидание подписания исполнителем</h4>
                    <p>Договор отправлен на подписание исполнителю. После подписания договор перейдет в статус "Действует".</p>
                  </div>
                )}

                {(contract.status === 'signed' || contract.status === 'active') && (
                  <div className="info-box success">
                    <h4>✅ Этап 5: Договор действует</h4>
                    <p>Договор успешно подписан всеми сторонами и действует.</p>
                    {contract.contractor_signature && (
                      <div className="signature-info-inline">
                        <strong>Подписан исполнителем:</strong> {new Date(contract.contractor_signature.signed_at).toLocaleString('ru-RU')}
                      </div>
                    )}
                    <p className="success-text">🎉 Исполнитель может приступать к выполнению работ согласно условиям договора и технической спецификации.</p>
                  </div>
                )}
              </div>

              {/* Текст договора */}
              <div className="contract-template-section">
                <div className="template-header">
                  <h4>Текст договора</h4>
                  {isCustomer && contract.status === 'draft' && !editingTemplate && (
                    <Button onClick={() => setEditingTemplate(true)} size="sm" variant="outline">
                      Редактировать
                    </Button>
                  )}
                  {editingTemplate && (
                    <div className="edit-actions">
                      <Button onClick={handleSaveTemplate} size="sm">
                        Сохранить изменения
                      </Button>
                      <Button onClick={() => { setEditingTemplate(false); setEditedTemplate(contract.contract_template); }} size="sm" variant="outline">
                        Отменить
                      </Button>
                    </div>
                  )}
                </div>
                
                <div className="template-content">
                  {editingTemplate ? (
                    <Textarea
                      value={editedTemplate}
                      onChange={(e) => setEditedTemplate(e.target.value)}
                      className="contract-editor"
                      rows={25}
                    />
                  ) : (
                    <pre className="contract-text">{contract.contract_template || 'Шаблон договора не загружен'}</pre>
                  )}
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Termination Tab */}
          <TabsContent value="termination">
            <Card className="tab-content">
              <h3>Одностороннее расторжение договора</h3>
              <div className="termination-info">
                <h4>Условия расторжения</h4>
                <p>В соответствии со статьей 56 Закона Республики Казахстан "О государственных закупках", Заказчик вправе в одностороннем порядке отказаться от исполнения договора о государственных закупках в следующих случаях:</p>
                <ul>
                  <li>Нарушение Поставщиком существенных условий договора;</li>
                  <li>Неоднократное нарушение сроков поставки товаров, выполнения работ, оказания услуг;</li>
                  <li>Поставка товаров, выполнение работ, оказание услуг ненадлежащего качества;</li>
                  <li>Нарушение обязательств по обеспечению исполнения договора;</li>
                  <li>Банкротство Поставщика или введение процедуры ликвидации.</li>
                </ul>
                
                {contract.status === 'terminated' ? (
                  <div className="terminated-info">
                    <p className="warning-text">⚠️ Договор расторгнут</p>
                    {contract.termination_reason && (
                      <div>
                        <Label>Причина расторжения</Label>
                        <p>{contract.termination_reason}</p>
                      </div>
                    )}
                    {contract.terminated_at && (
                      <div>
                        <Label>Дата расторжения</Label>
                        <p>{new Date(contract.terminated_at).toLocaleString('ru-RU')}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="termination-warning">
                    <p>Договор в настоящее время действует. Расторжение возможно только при наличии оснований согласно законодательству.</p>
                  </div>
                )}
              </div>
            </Card>
          </TabsContent>

          {/* Payment Tab */}
          <TabsContent value="payment">
            <Card className="tab-content">
              <h3>Информация об оплате</h3>
              
              <div className="payment-summary">
                <h4>Сводка по оплате</h4>
                <div className="payment-grid">
                  <div className="payment-item">
                    <Label>Общая сумма договора</Label>
                    <p className="amount">{contract.contract_amount?.toLocaleString()} ₸</p>
                  </div>
                  <div className="payment-item">
                    <Label>НДС (12%)</Label>
                    <p>{((contract.contract_amount || 0) * 0.12).toLocaleString()} ₸</p>
                  </div>
                  <div className="payment-item">
                    <Label>Итого к оплате</Label>
                    <p className="amount">{contract.contract_amount_with_vat?.toLocaleString()} ₸</p>
                  </div>
                  <div className="payment-item">
                    <Label>Условия оплаты</Label>
                    <p>В течение 30 календарных дней после подписания акта оказанных услуг</p>
                  </div>
                </div>
              </div>

              <div className="payment-schedule">
                <h4>График платежей</h4>
                {contract.payment_schedule && contract.payment_schedule.length > 0 ? (
                  <table className="payment-table">
                    <thead>
                      <tr>
                        <th>№</th>
                        <th>Описание</th>
                        <th>Срок</th>
                        <th>Сумма (₸)</th>
                        <th>Статус</th>
                      </tr>
                    </thead>
                    <tbody>
                      {contract.payment_schedule.map((payment, idx) => (
                        <tr key={idx}>
                          <td>{idx + 1}</td>
                          <td>{payment.description}</td>
                          <td>{new Date(payment.due_date).toLocaleDateString('ru-RU')}</td>
                          <td>{payment.amount?.toLocaleString()}</td>
                          <td><span className={`payment-status ${payment.status}`}>{payment.status}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="empty-text">График платежей будет сформирован после подписания договора</p>
                )}
              </div>

              <div className="payment-details">
                <h4>Реквизиты для оплаты (Исполнителя)</h4>
                <div className="payment-requisites">
                  <div className="requisite-item">
                    <Label>Получатель</Label>
                    <p>{contract.contractor_name}</p>
                  </div>
                  <div className="requisite-item">
                    <Label>БИН/ИИН</Label>
                    <p>{contract.contractor_details?.bin_iin || 'Не указано'}</p>
                  </div>
                  <div className="requisite-item">
                    <Label>ИИК</Label>
                    <p>{contract.contractor_details?.iik || 'Не указано'}</p>
                  </div>
                  <div className="requisite-item">
                    <Label>БИК</Label>
                    <p>{contract.contractor_details?.bik || 'Не указано'}</p>
                  </div>
                  <div className="requisite-item">
                    <Label>Банк</Label>
                    <p>{contract.contractor_details?.bank_name || 'Не указано'}</p>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Guarantee Tab */}
          <TabsContent value="guarantee">
            <Card className="tab-content">
              <h3>Обеспечение исполнения договора</h3>
              
              <div className="guarantee-info">
                <p>В соответствии с законодательством Республики Казахстан о государственных закупках, Поставщик обязан предоставить обеспечение исполнения договора.</p>
                
                <div className="guarantee-requirements">
                  <h4>Требования к обеспечению</h4>
                  <div className="guarantee-grid">
                    <div className="guarantee-item">
                      <Label>Размер обеспечения</Label>
                      <p>{((contract.contract_amount || 0) * 0.025).toLocaleString()} ₸ (2.5% от суммы договора)</p>
                    </div>
                    <div className="guarantee-item">
                      <Label>Форма обеспечения</Label>
                      <p>Банковская гарантия или денежное обеспечение</p>
                    </div>
                    <div className="guarantee-item">
                      <Label>Срок действия</Label>
                      <p>До полного исполнения обязательств по договору + 30 дней</p>
                    </div>
                  </div>
                </div>

                {contract.guarantee_info ? (
                  <div className="guarantee-provided">
                    <h4>Предоставленное обеспечение</h4>
                    <div className="guarantee-details">
                      <div className="detail-item">
                        <Label>Тип обеспечения</Label>
                        <p>{contract.guarantee_info.type}</p>
                      </div>
                      <div className="detail-item">
                        <Label>Номер гарантии</Label>
                        <p>{contract.guarantee_info.number}</p>
                      </div>
                      <div className="detail-item">
                        <Label>Банк</Label>
                        <p>{contract.guarantee_info.bank}</p>
                      </div>
                      <div className="detail-item">
                        <Label>Сумма</Label>
                        <p>{contract.guarantee_info.amount?.toLocaleString()} ₸</p>
                      </div>
                      <div className="detail-item">
                        <Label>Срок действия</Label>
                        <p>{new Date(contract.guarantee_info.valid_until).toLocaleDateString('ru-RU')}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="guarantee-warning">
                    <p className="warning-text">⚠️ Обеспечение исполнения договора не предоставлено</p>
                    <p>Исполнитель должен предоставить обеспечение до начала выполнения работ.</p>
                  </div>
                )}
              </div>
            </Card>
          </TabsContent>

          {/* Additional Agreements Tab */}
          <TabsContent value="additional">
            <Card className="tab-content">
              <h3>Дополнительные соглашения</h3>
              
              <div className="additional-agreements-info">
                <p>Любые изменения и дополнения к настоящему договору оформляются дополнительными соглашениями и подписываются обеими сторонами.</p>
                
                {contract.additional_agreements && contract.additional_agreements.length > 0 ? (
                  <div className="agreements-list">
                    {contract.additional_agreements.map((agreement, idx) => (
                      <div key={idx} className="agreement-card">
                        <div className="agreement-header">
                          <h4>Дополнительное соглашение №{agreement.number}</h4>
                          <span className="agreement-date">{new Date(agreement.date).toLocaleDateString('ru-RU')}</span>
                        </div>
                        <div className="agreement-content">
                          <Label>Предмет изменения</Label>
                          <p>{agreement.subject}</p>
                          {agreement.description && (
                            <>
                              <Label>Описание</Label>
                              <p>{agreement.description}</p>
                            </>
                          )}
                          {agreement.amount_change && (
                            <div className="amount-change">
                              <Label>Изменение суммы</Label>
                              <p className={agreement.amount_change > 0 ? 'increase' : 'decrease'}>
                                {agreement.amount_change > 0 ? '+' : ''}{agreement.amount_change.toLocaleString()} ₸
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state-small">
                    <FileText size={32} />
                    <p>Дополнительные соглашения отсутствуют</p>
                  </div>
                )}
              </div>
            </Card>
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents">
            <Card className="tab-content">
              <h3>Подтверждающие документы</h3>
              
              <div className="documents-section">
                <h4>Документы договора</h4>
                {contract.documents && contract.documents.length > 0 ? (
                  <div className="documents-list">
                    {contract.documents.map((doc, idx) => (
                      <div key={idx} className="document-item">
                        <FileText size={20} />
                        <div className="document-info">
                          <p className="document-name">{doc.name}</p>
                          <p className="document-meta">{doc.type} • {new Date(doc.uploaded_at).toLocaleDateString('ru-RU')}</p>
                        </div>
                        <Button size="sm" variant="outline">Скачать</Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="empty-text">Документы отсутствуют</p>
                )}
              </div>

              <div className="documents-section">
                <h4>Акты выполненных работ</h4>
                {contract.work_acts && contract.work_acts.length > 0 ? (
                  <div className="documents-list">
                    {contract.work_acts.map((act, idx) => (
                      <div key={idx} className="document-item">
                        <CheckCircle size={20} />
                        <div className="document-info">
                          <p className="document-name">Акт №{act.number} от {new Date(act.date).toLocaleDateString('ru-RU')}</p>
                          <p className="document-meta">Сумма: {act.amount?.toLocaleString()} ₸ • Статус: {act.status}</p>
                        </div>
                        <Button size="sm" variant="outline">Просмотр</Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="empty-text">Акты выполненных работ отсутствуют</p>
                )}
              </div>

              <div className="documents-section">
                <h4>Счета и платежные документы</h4>
                {contract.invoices && contract.invoices.length > 0 ? (
                  <div className="documents-list">
                    {contract.invoices.map((invoice, idx) => (
                      <div key={idx} className="document-item">
                        <FileText size={20} />
                        <div className="document-info">
                          <p className="document-name">Счет №{invoice.number} от {new Date(invoice.date).toLocaleDateString('ru-RU')}</p>
                          <p className="document-meta">Сумма: {invoice.amount?.toLocaleString()} ₸</p>
                        </div>
                        <Button size="sm" variant="outline">Скачать</Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="empty-text">Счета отсутствуют</p>
                )}
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Contractor Details Form Dialog */}
        <Dialog open={showDetailsForm} onOpenChange={setShowDetailsForm}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Заполнение реквизитов исполнителя</DialogTitle>
            </DialogHeader>
            <div className="form-grid">
              <div className="form-field">
                <Label>БИН/ИИН *</Label>
                <Input
                  value={contractorDetails.bin_iin}
                  onChange={(e) => setContractorDetails({...contractorDetails, bin_iin: e.target.value})}
                />
              </div>
              <div className="form-field">
                <Label>ИИК (Банковский счет) *</Label>
                <Input
                  value={contractorDetails.iik}
                  onChange={(e) => setContractorDetails({...contractorDetails, iik: e.target.value})}
                />
              </div>
              <div className="form-field">
                <Label>БИК *</Label>
                <Input
                  value={contractorDetails.bik}
                  onChange={(e) => setContractorDetails({...contractorDetails, bik: e.target.value})}
                />
              </div>
              <div className="form-field">
                <Label>Название банка *</Label>
                <Input
                  value={contractorDetails.bank_name}
                  onChange={(e) => setContractorDetails({...contractorDetails, bank_name: e.target.value})}
                />
              </div>
              <div className="form-field full-width">
                <Label>Юридический адрес *</Label>
                <Input
                  value={contractorDetails.legal_address}
                  onChange={(e) => setContractorDetails({...contractorDetails, legal_address: e.target.value})}
                />
              </div>
              <div className="form-field">
                <Label>Контактный телефон *</Label>
                <Input
                  value={contractorDetails.contact_phone}
                  onChange={(e) => setContractorDetails({...contractorDetails, contact_phone: e.target.value})}
                />
              </div>
              <div className="form-field">
                <Label>Email *</Label>
                <Input
                  value={contractorDetails.contact_email}
                  onChange={(e) => setContractorDetails({...contractorDetails, contact_email: e.target.value})}
                />
              </div>
              <div className="form-field">
                <Label>Основание (например: на основании Устава) *</Label>
                <Input
                  value={contractorDetails.basis}
                  onChange={(e) => setContractorDetails({...contractorDetails, basis: e.target.value})}
                />
              </div>
              <div className="form-field">
                <Label>ФИО директора *</Label>
                <Input
                  value={contractorDetails.director_name}
                  onChange={(e) => setContractorDetails({...contractorDetails, director_name: e.target.value})}
                />
              </div>
            </div>
            <div className="dialog-actions">
              <Button variant="outline" onClick={() => setShowDetailsForm(false)}>Отмена</Button>
              <Button onClick={handleSaveContractorDetails}>Сохранить</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Signature Dialog */}
        <Dialog open={showSignatureDialog} onOpenChange={setShowSignatureDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Подписание договора</DialogTitle>
            </DialogHeader>
            <div className="signature-form">
              <p>Для подписания договора вам необходимо получить код подтверждения на email.</p>
              
              <Button 
                onClick={handleRequestCode} 
                disabled={countdown > 0}
                className="w-full"
              >
                {countdown > 0 ? `Повторный запрос через ${countdown}с` : 'Получить код'}
              </Button>

              {codeRequested && (
                <div className="code-input-section">
                  <Label>Введите 6-значный код из email</Label>
                  <Input
                    type="text"
                    maxLength={6}
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="000000"
                    className="text-center text-2xl"
                  />
                  <Button onClick={handleSignContract} className="w-full">
                    Подписать договор
                  </Button>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

        <style jsx>{`
          .contract-detail-page { padding: 24px; max-width: 1400px; margin: 0 auto; }
          .page-header { display: flex; gap: 16px; align-items: flex-start; margin-bottom: 24px; }
          .header-content { flex: 1; }
          .header-content h1 { font-size: 1.75rem; font-weight: 700; margin: 0; }
          .subtitle { color: #666; margin-top: 4px; }
          .header-actions { display: flex; gap: 12px; }
          .header-actions button { min-width: 180px; }
          .header-actions button:not([variant="outline"]) { background: #3b82f6; color: white; }
          .header-actions button:not([variant="outline"]):hover { background: #2563eb; }
          .header-actions button[variant="outline"] { border: 2px solid #3b82f6; color: #3b82f6; background: white; }
          .header-actions button[variant="outline"]:hover { background: #f0f9ff; }
          .contract-tabs { margin-top: 24px; }
          .tab-content { padding: 24px; }
          .tab-content h3 { font-size: 1.5rem; font-weight: 600; margin-bottom: 20px; color: #1a1a1a; }
          .tab-content h4 { font-size: 1.125rem; font-weight: 600; margin: 24px 0 16px; color: #333; }
          
          .info-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-top: 20px; }
          .info-item { }
          .info-item p { margin-top: 4px; font-weight: 500; color: #333; }
          .info-item .amount { color: #16a34a; font-weight: 700; font-size: 1.125rem; }
          .info-item .status-text { text-transform: capitalize; font-weight: 600; }
          
          .history-section { margin-top: 32px; }
          .history-list { display: flex; flex-direction: column; gap: 12px; margin-top: 16px; }
          .history-item { padding: 16px; background: #f9fafb; border-radius: 8px; border-left: 4px solid #3b82f6; }
          .history-time { font-size: 0.875rem; color: #666; margin-bottom: 4px; }
          .history-action { font-weight: 600; color: #1a1a1a; margin-bottom: 4px; }
          .history-user { font-size: 0.875rem; color: #666; }
          .history-comment { margin-top: 8px; font-size: 0.875rem; color: #333; }
          
          .items-section { display: flex; flex-direction: column; gap: 24px; }
          .item-card { padding: 16px; background: #f9fafb; border-radius: 8px; }
          .item-card p { margin-top: 8px; font-weight: 600; color: #1a1a1a; }
          .item-details-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
          .item-detail { }
          .item-detail p { margin-top: 4px; font-weight: 500; color: #333; }
          .technical-specs { margin-top: 16px; }
          .technical-specs p { margin-top: 8px; line-height: 1.6; color: #333; }
          
          .party-section { margin-bottom: 32px; }
          .party-section h4 { font-size: 1.125rem; font-weight: 600; margin-bottom: 16px; padding-bottom: 8px; border-bottom: 2px solid #e5e7eb; }
          .party-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
          .party-item { }
          .party-item p { margin-top: 4px; font-weight: 500; color: #333; }
          
          .agreement-info { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-bottom: 24px; }
          .agreement-actions { padding: 20px; background: #f0f9ff; border: 2px solid #3b82f6; border-radius: 8px; margin-bottom: 24px; }
          .agreement-actions.success { background: #f0fdf4; border-color: #16a34a; }
          .agreement-actions p { margin: 0 0 12px 0; color: #1a1a1a; }
          .warning-text { color: #f59e0b; font-weight: 600; }
          .signature-info { margin-top: 16px; }
          .signature-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-top: 12px; }
          .signature-item { }
          .signature-item p { margin-top: 4px; font-weight: 500; }
          
          .contract-template-section { margin-top: 32px; }
          .template-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
          .template-header button { background: #3b82f6; color: white; }
          .template-header button:hover { background: #2563eb; }
          .template-header button[variant="outline"] { background: white; border: 2px solid #3b82f6; color: #3b82f6; }
          .template-header button[variant="outline"]:hover { background: #f0f9ff; }
          .edit-actions { display: flex; gap: 8px; }
          .template-content { padding: 20px; background: #f9fafb; border-radius: 8px; margin-top: 16px; }
          .contract-text { white-space: pre-wrap; font-family: 'Courier New', monospace; font-size: 0.875rem; line-height: 1.6; color: #333; max-height: 600px; overflow-y: auto; }
          .contract-editor { width: 100%; font-family: 'Courier New', monospace; font-size: 0.875rem; line-height: 1.6; min-height: 500px; }
          
          .workflow-status { margin-bottom: 32px; padding: 24px; background: #f9fafb; border-radius: 8px; }
          .status-flow { display: flex; justify-content: space-between; gap: 12px; margin-top: 20px; }
          .status-step { flex: 1; display: flex; flex-direction: column; align-items: center; text-align: center; position: relative; }
          .status-step:not(:last-child)::after { content: '→'; position: absolute; right: -20px; top: 20px; font-size: 1.5rem; color: #d1d5db; }
          .status-step.active .step-number { background: #3b82f6; color: white; border-color: #3b82f6; }
          .status-step.completed .step-number { background: #10b981; color: white; border-color: #10b981; }
          .status-step.completed:not(:last-child)::after { color: #10b981; }
          .step-number { width: 40px; height: 40px; border-radius: 50%; border: 3px solid #d1d5db; background: white; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 1.125rem; margin-bottom: 8px; }
          .step-info { }
          .step-title { font-weight: 600; font-size: 0.875rem; color: #1a1a1a; margin-bottom: 4px; }
          .step-desc { font-size: 0.75rem; color: #666; line-height: 1.4; }
          
          .current-stage-info { margin-bottom: 32px; }
          .info-box { padding: 20px; border-radius: 8px; margin-bottom: 16px; }
          .info-box h4 { font-size: 1.125rem; font-weight: 600; margin-bottom: 12px; }
          .info-box p { margin-bottom: 12px; line-height: 1.6; }
          .info-box ul { margin: 12px 0; padding-left: 24px; }
          .info-box li { margin-bottom: 8px; line-height: 1.6; }
          .info-box.draft { background: #f0f9ff; border: 2px solid #3b82f6; }
          .info-box.pending { background: #fef3c7; border: 2px solid #f59e0b; }
          .info-box.waiting { background: #f3f4f6; border: 2px solid #9ca3af; }
          .info-box.approved { background: #dcfce7; border: 2px solid #10b981; }
          .info-box.signature { background: #ede9fe; border: 2px solid #8b5cf6; }
          .info-box.success { background: #dcfce7; border: 2px solid #16a34a; }
          .signature-info-inline { padding: 12px; background: white; border-radius: 6px; margin: 12px 0; }
          .success-text { color: #16a34a; font-weight: 600; margin-top: 12px; }
          
          .termination-info { }
          .termination-info p { line-height: 1.6; color: #333; margin-bottom: 16px; }
          .termination-info ul { margin: 16px 0; padding-left: 24px; }
          .termination-info li { margin-bottom: 8px; line-height: 1.6; color: #333; }
          .terminated-info { padding: 20px; background: #fef2f2; border: 2px solid #ef4444; border-radius: 8px; margin-top: 16px; }
          .termination-warning { padding: 20px; background: #f0f9ff; border: 2px solid #3b82f6; border-radius: 8px; margin-top: 16px; }
          
          .payment-summary, .payment-schedule, .payment-details { margin-bottom: 32px; }
          .payment-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-top: 16px; }
          .payment-item { }
          .payment-item p { margin-top: 4px; font-weight: 500; color: #333; }
          .payment-table { width: 100%; border-collapse: collapse; margin-top: 16px; }
          .payment-table th { text-align: left; padding: 12px; background: #f9fafb; font-weight: 600; border-bottom: 2px solid #e5e7eb; }
          .payment-table td { padding: 12px; border-bottom: 1px solid #e5e7eb; }
          .payment-status { padding: 4px 12px; border-radius: 12px; font-size: 0.875rem; font-weight: 500; }
          .payment-status.paid { background: #dcfce7; color: #16a34a; }
          .payment-status.pending { background: #fef3c7; color: #f59e0b; }
          .payment-requisites { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-top: 16px; }
          .requisite-item { }
          .requisite-item p { margin-top: 4px; font-weight: 500; color: #333; }
          
          .guarantee-info { }
          .guarantee-info > p { line-height: 1.6; color: #333; margin-bottom: 24px; }
          .guarantee-requirements, .guarantee-provided { margin-bottom: 32px; }
          .guarantee-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-top: 16px; }
          .guarantee-item { }
          .guarantee-item p { margin-top: 4px; font-weight: 500; color: #333; }
          .guarantee-details { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-top: 16px; }
          .detail-item { }
          .detail-item p { margin-top: 4px; font-weight: 500; color: #333; }
          .guarantee-warning { padding: 20px; background: #fef3c7; border: 2px solid #f59e0b; border-radius: 8px; margin-top: 16px; }
          
          .additional-agreements-info { }
          .additional-agreements-info > p { line-height: 1.6; color: #333; margin-bottom: 24px; }
          .agreements-list { display: flex; flex-direction: column; gap: 16px; }
          .agreement-card { padding: 20px; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; }
          .agreement-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; padding-bottom: 12px; border-bottom: 1px solid #e5e7eb; }
          .agreement-header h4 { margin: 0; font-size: 1rem; font-weight: 600; }
          .agreement-date { font-size: 0.875rem; color: #666; }
          .agreement-content { }
          .agreement-content p { margin-top: 4px; margin-bottom: 12px; line-height: 1.6; color: #333; }
          .amount-change { margin-top: 12px; padding-top: 12px; border-top: 1px solid #e5e7eb; }
          .amount-change .increase { color: #16a34a; font-weight: 700; }
          .amount-change .decrease { color: #ef4444; font-weight: 700; }
          
          .documents-section { margin-bottom: 32px; }
          .documents-list { display: flex; flex-direction: column; gap: 12px; margin-top: 16px; }
          .document-item { display: flex; align-items: center; gap: 16px; padding: 16px; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; }
          .document-info { flex: 1; }
          .document-name { font-weight: 600; color: #1a1a1a; margin-bottom: 4px; }
          .document-meta { font-size: 0.875rem; color: #666; }
          
          .empty-text { text-align: center; padding: 24px; color: #9ca3af; font-style: italic; }
          .empty-state-small { text-align: center; padding: 40px; color: #9ca3af; }
          .empty-state-small svg { margin: 0 auto 12px; }
          
          .form-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-top: 20px; }
          .form-field { display: flex; flex-direction: column; gap: 8px; }
          .form-field.full-width { grid-column: 1 / -1; }
          .dialog-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px; }
          .signature-form { display: flex; flex-direction: column; gap: 16px; }
          .code-input-section { display: flex; flex-direction: column; gap: 12px; margin-top: 16px; }
          .loading-container { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 400px; gap: 16px; }
          .spinner { width: 40px; height: 40px; border: 4px solid #f3f4f6; border-top-color: #3b82f6; border-radius: 50%; animation: spin 1s linear infinite; }
          @keyframes spin { to { transform: rotate(360deg); } }
          
          @media (max-width: 768px) {
            .info-grid, .party-grid, .payment-grid, .guarantee-grid { grid-template-columns: 1fr; }
            .header-actions { flex-direction: column; width: 100%; }
            .header-actions button { width: 100%; }
          }
        `}</style>
      </div>
    </Layout>
  );
};

export default ContractDetail;
