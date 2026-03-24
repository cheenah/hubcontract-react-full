import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import { AppContext } from '@/App';
import { useLanguage } from '@/context/LanguageContext';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, ArrowRight, Check, Upload, FileText, X, AlertCircle } from 'lucide-react';

const SubmitBid = () => {
  const { tenderId } = useParams();
  const navigate = useNavigate();
  const { user, API } = React.useContext(AppContext);
  const { t } = useLanguage();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 6;
  
  const [tender, setTender] = useState(null);
  const [selectedLots, setSelectedLots] = useState([]);
  
  // Шаг 1: Реквизиты подрядчика
  const [requisites, setRequisites] = useState({
    company_name: '',
    bin: '',
    legal_address: '',
    contact_person: '',
    phone: '',
    email: ''
  });
  
  // Шаг 2: Выбор лотов (для мультилотовых тендеров)
  const [lotBids, setLotBids] = useState({});
  
  // Шаг 3: Технические спецификации и документы для каждого лота
  const [lotDocs, setLotDocs] = useState({}); // { lotId: { techSpec: '', documents: [] } }
  
  // Дополнительные документы (для совместимости)
  const [documents, setDocuments] = useState([]);
  const [techSpecs, setTechSpecs] = useState('');
  
  // Шаг 4: Банковская гарантия и оплата
  const [guaranteeFile, setGuaranteeFile] = useState(null);
  const [receiptFile, setReceiptFile] = useState(null);
  
  // Шаг 5: Согласие и подпись
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [bidId, setBidId] = useState(null);

  useEffect(() => {
    fetchTenderData();
    if (user) {
      loadUserRequisites();
    }
  }, [tenderId]);

  const fetchTenderData = async () => {
    try {
      const response = await axios.get(`${API}/tenders/${tenderId}`);
      setTender(response.data);
      
      // Инициализация лотов
      if (response.data.lots && response.data.lots.length > 0) {
        const initialLotBids = {};
        response.data.lots.forEach(lot => {
          initialLotBids[lot.id] = {
            price: '',
            delivery_time: '',
            proposal: ''
          };
        });
        setLotBids(initialLotBids);
        setSelectedLots(response.data.lots.map(lot => lot.id));
      }
    } catch (error) {
      toast.error('Ошибка при загрузке тендера');
      navigate('/tenders');
    } finally {
      setLoading(false);
    }
  };

  const loadUserRequisites = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API}/users/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setRequisites({
        company_name: response.data.company_name || '',
        bin: response.data.company_bin || '',
        legal_address: response.data.legal_address || '',
        contact_person: response.data.full_name || '',
        phone: response.data.phone || '',
        email: response.data.email || ''
      });
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  // Загрузка документов
  const handleDocumentUpload = async (e) => {
    const files = Array.from(e.target.files);
    
    for (const file of files) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`Файл ${file.name} превышает 10MB`);
        continue;
      }
      
      const base64 = await convertToBase64(file);
      setDocuments(prev => [...prev, {
        filename: file.name,
        content: base64,
        type: file.type,
        size: file.size
      }]);
    }
  };

  const handleGuaranteeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      toast.error('Банковская гарантия должна быть в формате PDF');
      return;
    }
    
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Файл превышает 10MB');
      return;
    }
    
    setGuaranteeFile(file);
  };

  const handleReceiptUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Чек должен быть в формате PDF, JPG или PNG');
      return;
    }
    
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Файл превышает 10MB');
      return;
    }
    
    setReceiptFile(file);
  };

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Навигация
  const nextStep = () => {
    // Валидация перед переходом
    if (currentStep === 1) {
      if (!requisites.company_name || !requisites.bin || !requisites.phone) {
        toast.error('Заполните все обязательные поля реквизитов');
        return;
      }
    }
    
    if (currentStep === 2) {
      // Проверка выбора лотов
      if (tender?.lots && tender.lots.length > 0 && selectedLots.length === 0) {
        toast.error('Выберите хотя бы один лот для участия');
        return;
      }
    }

    if (currentStep === 3) {
      // Проверка заполнения технических спецификаций для выбранных лотов
      let hasError = false;
      if (tender?.lots && tender.lots.length > 0) {
        selectedLots.forEach(lotId => {
          if (!lotDocs[lotId]?.techSpec || lotDocs[lotId].techSpec.trim() === '') {
            hasError = true;
          }
        });
      } else {
        if (!lotDocs['single']?.techSpec || lotDocs['single'].techSpec.trim() === '') {
          hasError = true;
        }
      }
      if (hasError) {
        toast.error('Заполните техническую спецификацию для всех лотов');
        return;
      }
    }

    if (currentStep === 4) {
      // Проверка заполнения цен для выбранных лотов и валидация максимальной цены
      let hasError = false;
      let errorMessage = '';
      
      if (tender?.lots && tender.lots.length > 0) {
        selectedLots.forEach(lotId => {
          const lot = tender.lots.find(l => l.id === lotId);
          const price = parseFloat(lotBids[lotId]?.price);
          
          if (!lotBids[lotId]?.price || price <= 0) {
            hasError = true;
            errorMessage = 'Укажите цены для всех выбранных лотов';
          } else if (price > lot.unit_price) {
            hasError = true;
            errorMessage = `Цена для лота ${lot.lot_number} не должна превышать ${lot.unit_price?.toLocaleString('ru-RU')} ₸`;
          }
        });
      } else {
        const price = parseFloat(lotBids['single']?.price);
        if (!lotBids['single']?.price || price <= 0) {
          hasError = true;
          errorMessage = 'Укажите цену';
        } else if (price > tender?.budget) {
          hasError = true;
          errorMessage = `Цена не должна превышать ${tender?.budget?.toLocaleString('ru-RU')} ₸`;
        }
      }
      
      if (hasError) {
        toast.error(errorMessage);
        return;
      }
    }
    
    if (currentStep === 5) {
      if (!guaranteeFile) {
        toast.error('Загрузите банковскую гарантию (1% от суммы заявки)');
        return;
      }
      if (!receiptFile) {
        toast.error('Загрузите чек об оплате комиссии (1%)');
        return;
      }
    }
    
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Создание заявки
  const createBid = async () => {
    if (!agreedToTerms) {
      toast.error('Необходимо согласиться с условиями участия в тендере');
      return;
    }

    try {
      setSubmitting(true);
      const token = localStorage.getItem('token');
      
      // Формируем данные лотов с ценами и техспецификациями
      const lotBidsData = [];
      
      if (tender?.lots && tender.lots.length > 0) {
        selectedLots.forEach(lotId => {
          const lot = tender.lots.find(l => l.id === lotId);
          const bidInfo = lotBids[lotId] || {};
          const docInfo = lotDocs[lotId] || {};
          
          lotBidsData.push({
            lot_id: lotId,
            lot_number: lot.lot_number,
            price: parseFloat(bidInfo.price) * (lot.quantity || 1), // Общая сумма по лоту
            technical_proposal: docInfo.techSpec || 'Техническое предложение'
          });
        });
      } else {
        // Единая закупка без лотов
        const bidInfo = lotBids['single'] || {};
        const docInfo = lotDocs['single'] || {};
        
        lotBidsData.push({
          lot_id: 'single',
          lot_number: 1,
          price: parseFloat(bidInfo.price) || calculateTotalPrice(),
          technical_proposal: docInfo.techSpec || 'Техническое предложение'
        });
      }
      
      // Создаем заявку
      const bidData = {
        tender_id: tenderId,
        delivery_time: lotBids[selectedLots[0]]?.delivery_time || '30',
        documents: [],
        agreed_to_terms: true,
        supplier_details: {
          name: requisites.company_name || '',
          legal_address: requisites.legal_address || '',
          iik: requisites.iik || '',
          bank_name: requisites.bank_name || '',
          bik: requisites.bik || '',
          kbe: requisites.kbe || '',
          bin: requisites.company_bin || '',
          representative: requisites.representative_name || '',
          phone: requisites.phone || '',
          position: requisites.representative_position || '',
          taxpayer_type: requisites.taxpayer_type || 'ТОО'
        },
        lot_bids: lotBidsData,
        technical_spec: lotBidsData[0]?.technical_proposal || 'Техническое предложение'
      };
      
      console.log('Creating bid with data:', bidData);
      
      const response = await axios.post(`${API}/bids`, bidData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const newBidId = response.data.id;
      setBidId(newBidId);
      
      // Загружаем документы для каждого лота
      if (tender?.lots && tender.lots.length > 0) {
        for (const lotId of selectedLots) {
          const docs = lotDocs[lotId]?.documents || [];
          for (const doc of docs) {
            const formData = new FormData();
            formData.append('file', doc);
            formData.append('lot_id', lotId);
            
            await axios.post(`${API}/bids/${newBidId}/upload-document`, formData, {
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'multipart/form-data'
              }
            });
          }
        }
      } else {
        // Загрузка документов для единой закупки
        const docs = lotDocs['single']?.documents || [];
        for (const doc of docs) {
          const formData = new FormData();
          formData.append('file', doc);
          
          await axios.post(`${API}/bids/${newBidId}/upload-document`, formData, {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            }
          });
        }
      }
      
      // Загружаем банковскую гарантию
      if (guaranteeFile) {
        const formData = new FormData();
        formData.append('file', guaranteeFile);
        
        await axios.post(`${API}/bids/${newBidId}/upload-bid-guarantee`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });
      }
      
      // Загружаем чек оплаты
      if (receiptFile) {
        const formData = new FormData();
        formData.append('file', receiptFile);
        
        await axios.post(`${API}/bids/${newBidId}/upload-payment-receipt`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });
      }
      
      toast.success('Заявка создана. Переходим к подписанию...');
      
      // Запрашиваем OTP для подписания
      await requestOTP(newBidId);
      
    } catch (error) {
      console.error('Error creating bid:', error);
      console.error('Error details:', error.response?.data);
      const errorMsg = typeof error.response?.data?.detail === 'string' 
        ? error.response.data.detail 
        : 'Ошибка при создании заявки';
      toast.error(errorMsg);
      setSubmitting(false);
    }
  };

  const calculateTotalPrice = () => {
    if (tender?.lots && tender.lots.length > 0) {
      return selectedLots.reduce((sum, lotId) => {
        const lot = tender.lots.find(l => l.id === lotId);
        const price = parseFloat(lotBids[lotId]?.price) || 0;
        const quantity = lot?.quantity || 1;
        return sum + (price * quantity);
      }, 0);
    }
    return parseFloat(lotBids['single']?.price) || 0;
  };

  // Запрос OTP кода
  const requestOTP = async (bidIdToSign) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API}/bids/${bidIdToSign}/request-signature-code`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setOtpSent(true);
      
      // В тестовом режиме показываем код
      if (response.data.test_mode && response.data.verification_code) {
        toast.success(`Код подтверждения (тестовый режим): ${response.data.verification_code}`, {
          duration: 10000
        });
      } else {
        toast.success('Код подтверждения отправлен на ваш email');
      }
      
      setSubmitting(false);
    } catch (error) {
      toast.error('Ошибка при отправке кода');
      setSubmitting(false);
    }
  };

  // Подписание заявки с OTP
  const signBidWithOTP = async () => {
    if (!otpCode || otpCode.length !== 6) {
      toast.error('Введите 6-значный код подтверждения');
      return;
    }
    
    try {
      setSubmitting(true);
      const token = localStorage.getItem('token');
      
      await axios.post(
        `${API}/bids/${bidId}/sign`,
        { code: otpCode },  // Backend expects 'code', not 'verification_code'
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      toast.success('Заявка успешно подписана и отправлена!');
      navigate(`/my-bids`);
      
    } catch (error) {
      const errorMsg = typeof error.response?.data?.detail === 'string' 
        ? error.response.data.detail 
        : 'Ошибка при подписании заявки';
      toast.error(errorMsg);
      setSubmitting(false);
    }
  };

  // Рендер прогресс-бара
  const renderProgressBar = () => {
    const steps = [
      { number: 1, title: 'Реквизиты', desc: 'Данные подрядчика' },
      { number: 2, title: 'Выбор лотов', desc: 'Выберите лоты' },
      { number: 3, title: 'Документы', desc: 'Техспецификация и файлы' },
      { number: 4, title: 'Ценовое предложение', desc: 'Укажите цену' },
      { number: 5, title: 'Гарантия и оплата', desc: 'БГ и чек оплаты' },
      { number: 6, title: 'Подпись', desc: 'OTP подписание' }
    ];
    
    return (
      <div className="workflow-status">
        <div className="status-flow">
          {steps.map((step) => {
            const isActive = currentStep === step.number;
            const isCompleted = currentStep > step.number;
            
            return (
              <div key={step.number} className={`status-step ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}>
                <div className="step-number">{step.number}</div>
                <div className="step-info">
                  <div className="step-title">{step.title}</div>
                  <div className="step-desc">{step.desc}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Шаг 1: Реквизиты
  const renderStep1 = () => (
    <Card>
      <CardHeader>
        <CardTitle>Реквизиты подрядчика</CardTitle>
        <CardDescription>Укажите реквизиты вашей компании</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="company_name">Наименование компании *</Label>
          <Input
            id="company_name"
            value={requisites.company_name}
            onChange={(e) => setRequisites({...requisites, company_name: e.target.value})}
            placeholder="ТОО Строительная компания"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="bin">БИН *</Label>
            <Input
              id="bin"
              value={requisites.bin}
              onChange={(e) => setRequisites({...requisites, bin: e.target.value})}
              placeholder="123456789012"
            />
          </div>
          <div>
            <Label htmlFor="phone">Телефон *</Label>
            <Input
              id="phone"
              value={requisites.phone}
              onChange={(e) => setRequisites({...requisites, phone: e.target.value})}
              placeholder="+7 (777) 123-45-67"
            />
          </div>
        </div>
        
        <div>
          <Label htmlFor="legal_address">Юридический адрес</Label>
          <Input
            id="legal_address"
            value={requisites.legal_address}
            onChange={(e) => setRequisites({...requisites, legal_address: e.target.value})}
            placeholder="г. Алматы, ул. Абая, д. 1"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="contact_person">Контактное лицо</Label>
            <Input
              id="contact_person"
              value={requisites.contact_person}
              onChange={(e) => setRequisites({...requisites, contact_person: e.target.value})}
              placeholder="Иванов Иван Иванович"
            />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={requisites.email}
              onChange={(e) => setRequisites({...requisites, email: e.target.value})}
              placeholder="company@example.com"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // Шаг 2: Выбор лотов (только выбор, без цен)
  const renderStep2 = () => (
    <Card>
      <CardHeader>
        <CardTitle>Выбор лотов для участия</CardTitle>
        <CardDescription>Выберите лоты, в которых вы хотите участвовать</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {tender?.lots && tender.lots.length > 0 ? (
          tender.lots.map(lot => {
            const isSelected = selectedLots.includes(lot.id);
            return (
              <Card 
                key={lot.id} 
                className={`p-4 bg-gray-50 cursor-pointer relative ${isSelected ? 'border-l-4 border-l-green-500' : ''}`}
                onClick={() => {
                  if (isSelected) {
                    setSelectedLots(selectedLots.filter(id => id !== lot.id));
                  } else {
                    setSelectedLots([...selectedLots, lot.id]);
                  }
                }}
                style={{ transition: 'none' }}
              >
                {isSelected && (
                  <div className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-green-500 rounded-full"></div>
                )}
                <div className="flex items-start gap-4 ml-4">
                  <div className="flex-1">
                    <h4 className="font-semibold text-lg">Лот {lot.lot_number}: {lot.name}</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Количество: {lot.quantity} {lot.unit}
                    </p>
                    <p className="text-sm text-gray-600">
                      Начальная цена за единицу: {lot.unit_price?.toLocaleString('ru-RU')} ₸
                    </p>
                    <p className="font-semibold mt-2">
                      Общая сумма: {lot.total_price?.toLocaleString('ru-RU')} ₸
                    </p>
                  </div>
                </div>
              </Card>
            );
          })
        ) : (
          <Card className="p-4 bg-gray-50 border-l-4 border-l-green-500 relative">
            <div className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-green-500 rounded-full"></div>
            <div className="flex items-center gap-3 ml-4">
              <div className="flex-1">
                <h4 className="font-semibold text-lg">Единая закупка без разделения на лоты</h4>
                <p className="text-sm text-gray-600 mt-1">
                  Общая сумма: {tender?.budget?.toLocaleString('ru-RU')} ₸
                </p>
              </div>
            </div>
          </Card>
        )}
        
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex gap-3">
            <AlertCircle className="text-yellow-600 flex-shrink-0" size={20} />
            <p className="text-sm text-yellow-800">
              <strong>Обратите внимание:</strong> На следующем этапе вы заполните данные для каждого выбранного лота
            </p>
          </div>
        </div>
        
        <div className="mt-4 text-center">
          <p className="text-lg font-semibold">
            Выбрано лотов: <span className="text-blue-600">{selectedLots.length}</span>
          </p>
        </div>
      </CardContent>
    </Card>
  );

  // Шаг 3: Документы и техспецификация для каждого лота
  const renderStep3 = () => {
    const handleLotDocUpload = (lotId, files) => {
      const newFiles = Array.from(files);
      setLotDocs({
        ...lotDocs,
        [lotId]: {
          ...lotDocs[lotId],
          documents: [...(lotDocs[lotId]?.documents || []), ...newFiles]
        }
      });
    };

    const removeLotDoc = (lotId, index) => {
      const updatedDocs = [...(lotDocs[lotId]?.documents || [])];
      updatedDocs.splice(index, 1);
      setLotDocs({
        ...lotDocs,
        [lotId]: { ...lotDocs[lotId], documents: updatedDocs }
      });
    };

    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Документы и техническая спецификация</CardTitle>
            <CardDescription>Заполните техническую спецификацию и загрузите документы для каждого лота</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {tender?.lots && tender.lots.length > 0 ? (
              selectedLots.map(lotId => {
                const lot = tender.lots.find(l => l.id === lotId);
                if (!lot) return null;
                
                return (
                  <Card key={lotId} className="p-4 bg-gray-50">
                    <h4 className="font-semibold text-lg mb-4">
                      Лот {lot.lot_number}: {lot.name}
                    </h4>
                    
                    <div className="space-y-4">
                      <div>
                        <Label>Техническая спецификация *</Label>
                        <Textarea
                          value={lotDocs[lotId]?.techSpec || ''}
                          onChange={(e) => setLotDocs({
                            ...lotDocs,
                            [lotId]: { ...lotDocs[lotId], techSpec: e.target.value }
                          })}
                          placeholder="Опишите техническое предложение, методы выполнения работ, используемые материалы и оборудование..."
                          rows={6}
                        />
                      </div>
                      
                      <div>
                        <Label>Документы (сертификаты, лицензии, портфолио)</Label>
                        <div className="mt-2">
                          <input
                            type="file"
                            multiple
                            onChange={(e) => handleLotDocUpload(lotId, e.target.files)}
                            className="hidden"
                            id={`doc-upload-${lotId}`}
                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => document.getElementById(`doc-upload-${lotId}`).click()}
                          >
                            <Upload size={16} className="mr-2" />
                            Загрузить файлы
                          </Button>
                        </div>
                        
                        {lotDocs[lotId]?.documents && lotDocs[lotId].documents.length > 0 && (
                          <div className="mt-3 space-y-2">
                            {lotDocs[lotId].documents.map((file, index) => (
                              <div key={index} className="flex items-center justify-between p-2 bg-white rounded border">
                                <div className="flex items-center gap-2">
                                  <FileText size={16} />
                                  <span className="text-sm">{file.name}</span>
                                  <span className="text-xs text-gray-500">
                                    ({(file.size / 1024).toFixed(1)} KB)
                                  </span>
                                </div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeLotDoc(lotId, index)}
                                >
                                  <X size={16} />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })
            ) : (
              <div className="space-y-4">
                <div>
                  <Label>Техническая спецификация *</Label>
                  <Textarea
                    value={lotDocs['single']?.techSpec || ''}
                    onChange={(e) => setLotDocs({
                      ...lotDocs,
                      single: { ...lotDocs['single'], techSpec: e.target.value }
                    })}
                    placeholder="Опишите техническое предложение, методы выполнения работ, используемые материалы и оборудование..."
                    rows={6}
                  />
                </div>
                
                <div>
                  <Label>Документы (сертификаты, лицензии, портфолио)</Label>
                  <div className="mt-2">
                    <input
                      type="file"
                      multiple
                      onChange={(e) => handleLotDocUpload('single', e.target.files)}
                      className="hidden"
                      id="doc-upload-single"
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('doc-upload-single').click()}
                    >
                      <Upload size={16} className="mr-2" />
                      Загрузить файлы
                    </Button>
                  </div>
                  
                  {lotDocs['single']?.documents && lotDocs['single'].documents.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {lotDocs['single'].documents.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-white rounded border">
                          <div className="flex items-center gap-2">
                            <FileText size={16} />
                            <span className="text-sm">{file.name}</span>
                            <span className="text-xs text-gray-500">
                              ({(file.size / 1024).toFixed(1)} KB)
                            </span>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeLotDoc('single', index)}
                          >
                            <X size={16} />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };
  // Шаг 4: Ценовое предложение для каждого лота
  const renderStep4 = () => {
    const validatePrice = (price, maxPrice) => {
      const numPrice = parseFloat(price);
      return numPrice > 0 && numPrice <= maxPrice;
    };

    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Ценовое предложение</CardTitle>
            <CardDescription>Укажите свою цену за единицу для каждого лота (не более указанной заказчиком)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {tender?.lots && tender.lots.length > 0 ? (
              selectedLots.map(lotId => {
                const lot = tender.lots.find(l => l.id === lotId);
                if (!lot) return null;
                
                const currentPrice = parseFloat(lotBids[lotId]?.price) || 0;
                const isPriceValid = currentPrice > 0 && currentPrice <= lot.unit_price;
                
                return (
                  <Card key={lotId} className="p-4 bg-gray-50">
                    <h4 className="font-semibold text-lg mb-4">
                      Лот {lot.lot_number}: {lot.name}
                    </h4>
                    
                    <div className="space-y-4">
                      <div>
                        <Label>Ваша цена за единицу (₸) *</Label>
                        <Input
                          type="number"
                          value={lotBids[lotId]?.price || ''}
                          onChange={(e) => {
                            const value = e.target.value;
                            setLotBids({
                              ...lotBids,
                              [lotId]: { ...lotBids[lotId], price: value }
                            });
                          }}
                          placeholder={`Максимум: ${lot.unit_price?.toLocaleString('ru-RU')} ₸`}
                          className={!isPriceValid && currentPrice > 0 ? 'border-red-500' : ''}
                        />
                        {currentPrice > lot.unit_price && (
                          <p className="text-sm text-red-600 mt-1">
                            ⚠️ Цена не должна превышать {lot.unit_price?.toLocaleString('ru-RU')} ₸
                          </p>
                        )}
                        {isPriceValid && (
                          <p className="text-sm text-gray-600 mt-1">
                            Общая сумма по лоту: {(currentPrice * lot.quantity).toLocaleString('ru-RU')} ₸
                          </p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                          Начальная цена заказчика: {lot.unit_price?.toLocaleString('ru-RU')} ₸ за {lot.unit}
                        </p>
                      </div>
                      
                      <div>
                        <Label>Срок поставки (дней)</Label>
                        <Input
                          type="number"
                          value={lotBids[lotId]?.delivery_time || ''}
                          onChange={(e) => setLotBids({
                            ...lotBids,
                            [lotId]: { ...lotBids[lotId], delivery_time: e.target.value }
                          })}
                          placeholder="Количество дней"
                        />
                      </div>
                    </div>
                  </Card>
                );
              })
            ) : (
              <div className="space-y-4">
                <div>
                  <Label>Ваша цена (₸) *</Label>
                  <Input
                    type="number"
                    value={lotBids['single']?.price || ''}
                    onChange={(e) => setLotBids({
                      ...lotBids,
                      single: { ...lotBids['single'], price: e.target.value }
                    })}
                    placeholder={`Максимум: ${tender?.budget?.toLocaleString('ru-RU')} ₸`}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Бюджет заказчика: {tender?.budget?.toLocaleString('ru-RU')} ₸
                  </p>
                </div>
                
                <div>
                  <Label>Срок выполнения (дней)</Label>
                  <Input
                    type="number"
                    value={lotBids['single']?.delivery_time || ''}
                    onChange={(e) => setLotBids({
                      ...lotBids,
                      single: { ...lotBids['single'], delivery_time: e.target.value }
                    })}
                    placeholder="Количество дней"
                  />
                </div>
              </div>
            )}
            
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-lg">Итого по заявке:</span>
                <span className="text-2xl font-bold text-blue-600">
                  {calculateTotalPrice().toLocaleString('ru-RU')} ₸
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  // Шаг 5: Банковская гарантия и оплата
  const renderStep5 = () => {
    const totalPrice = calculateTotalPrice();
    const guaranteeAmount = totalPrice * 0.01;
    const commissionAmount = totalPrice * 0.01;
    
    return (
      <Card>
        <CardHeader>
          <CardTitle>Банковская гарантия и оплата комиссии</CardTitle>
          <CardDescription>
            Загрузите банковскую гарантию на 1% и чек об оплате комиссии 1%
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex gap-3">
            <AlertCircle className="text-yellow-600 flex-shrink-0" size={20} />
            <div className="text-sm">
              <p className="font-semibold mb-1">Требования для участия:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Банковская гарантия на сумму {guaranteeAmount.toLocaleString('ru-RU')} ₸ (1% от суммы заявки)</li>
                <li>Оплата комиссии платформы {commissionAmount.toLocaleString('ru-RU')} ₸ (1% от суммы заявки)</li>
                <li>При победе комиссия удерживается, при проигрыше - возвращается</li>
              </ul>
            </div>
          </div>
          
          <div>
            <Label>Банковская гарантия (PDF) *</Label>
            <p className="text-sm text-gray-600 mb-2">
              Банковская гарантия на сумму {guaranteeAmount.toLocaleString('ru-RU')} ₸
            </p>
            <input
              type="file"
              accept=".pdf"
              onChange={handleGuaranteeUpload}
              className="hidden"
              id="guarantee-upload"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => document.getElementById('guarantee-upload').click()}
            >
              <Upload size={16} className="mr-2" />
              Загрузить банковскую гарантию
            </Button>
            
            {guaranteeFile && (
              <div className="mt-2 flex items-center gap-2 p-2 bg-green-50 rounded">
                <FileText size={16} className="text-green-600" />
                <span className="text-sm">{guaranteeFile.name}</span>
              </div>
            )}
          </div>
          
          <div>
            <Label>Чек об оплате комиссии (PDF, JPG, PNG) *</Label>
            <p className="text-sm text-gray-600 mb-2">
              Чек на сумму {commissionAmount.toLocaleString('ru-RU')} ₸ (комиссия платформы)
            </p>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleReceiptUpload}
              className="hidden"
              id="receipt-upload"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => document.getElementById('receipt-upload').click()}
            >
              <Upload size={16} className="mr-2" />
              Загрузить чек оплаты
            </Button>
            
            {receiptFile && (
              <div className="mt-2 flex items-center gap-2 p-2 bg-green-50 rounded">
                <FileText size={16} className="text-green-600" />
                <span className="text-sm">{receiptFile.name}</span>
              </div>
            )}
          </div>
          
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold mb-2">Реквизиты для оплаты:</h4>
            <div className="space-y-1 text-sm">
              <p>Получатель: ТОО "HubContract"</p>
              <p>БИН: 123456789012</p>
              <p>ИИК: KZ12345678901234567890</p>
              <p>Банк: АО "Bereke Bank"</p>
              <p>БИК: TSESKZKA</p>
              <p className="font-semibold mt-2">
                Сумма к оплате: {commissionAmount.toLocaleString('ru-RU')} ₸
              </p>
              <p className="text-xs text-gray-600 mt-2">
                Назначение платежа: Комиссия за участие в тендере {tender?.tender_number}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  // Шаг 6: Согласие и подпись
  const renderStep6 = () => (
    <Card>
      <CardHeader>
        <CardTitle>Согласие с условиями и подписание</CardTitle>
        <CardDescription>
          Ознакомьтесь с условиями и подпишите заявку с помощью OTP-кода
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="p-4 border rounded-lg space-y-3">
          <h4 className="font-semibold">Условия участия в тендере:</h4>
          <ul className="list-disc list-inside space-y-2 text-sm">
            <li>Я подтверждаю достоверность предоставленной информации</li>
            <li>Я согласен с условиями тендерной документации</li>
            <li>Я обязуюсь выполнить работы в указанные сроки</li>
            <li>Я понимаю, что банковская гарантия удерживается до окончания тендера</li>
            <li>Я согласен, что комиссия платформы возвращается только проигравшим участникам</li>
            <li>При победе я обязуюсь предоставить банковскую гарантию на 3% от суммы договора</li>
          </ul>
        </div>
        
        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border-2 border-gray-200">
          <input
            type="checkbox"
            id="terms"
            checked={agreedToTerms}
            onChange={(e) => setAgreedToTerms(e.target.checked)}
            disabled={submitting || otpSent}
            className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500 cursor-pointer"
          />
          <label htmlFor="terms" className="text-sm font-medium cursor-pointer flex-1">
            Я согласен со всеми условиями участия в тендере
          </label>
        </div>
        
        {!otpSent ? (
          <Button
            onClick={createBid}
            disabled={!agreedToTerms || submitting}
            className="w-full"
            size="lg"
          >
            {submitting ? 'Создание заявки...' : 'Создать заявку и получить код подписания'}
          </Button>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm">
                ✓ Заявка создана успешно! Код подтверждения отправлен на ваш email.
              </p>
            </div>
            
            <div>
              <Label htmlFor="otp">Введите 6-значный код подтверждения</Label>
              <Input
                id="otp"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="123456"
                maxLength={6}
                className="text-center text-2xl tracking-widest"
              />
            </div>
            
            <Button
              onClick={signBidWithOTP}
              disabled={otpCode.length !== 6 || submitting}
              className="w-full"
              size="lg"
            >
              {submitting ? 'Подписание...' : 'Подписать и отправить заявку'}
            </Button>
            
            <Button
              variant="outline"
              onClick={() => requestOTP(bidId)}
              disabled={submitting}
              className="w-full"
            >
              Отправить код повторно
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Загрузка...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="submit-bid-page">
        <div className="page-header">
          <Button
            variant="ghost"
            onClick={() => navigate(`/tenders/${tenderId}`)}
            className="mb-4"
          >
            <ArrowLeft size={20} className="mr-2" />
            Назад к тендеру
          </Button>
          
          <h1 className="page-title">Подача заявки на участие</h1>
          <p className="page-subtitle">
            {tender?.title || 'Загрузка...'}
          </p>
        </div>

        {renderProgressBar()}

        <div className="form-container">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStep4()}
          {currentStep === 5 && renderStep5()}
          {currentStep === 6 && renderStep6()}

          {currentStep < 6 && (
            <div className="form-navigation">
              {currentStep > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                >
                  <ArrowLeft size={16} className="mr-2" />
                  Назад
                </Button>
              )}
              
              <div className="flex-1" />

              <Button
                type="button"
                onClick={nextStep}
              >
                Далее
                <ArrowRight size={16} className="ml-2" />
              </Button>
            </div>
          )}
        </div>

        <style jsx>{`
          .submit-bid-page {
            max-width: 1000px;
            margin: 0 auto;
            padding: 24px;
          }

          .page-header {
            margin-bottom: 32px;
          }

          .page-title {
            font-size: 2rem;
            font-weight: 700;
            color: #1a202c;
            margin-bottom: 8px;
          }

          .page-subtitle {
            font-size: 1.125rem;
            color: #2d3748;
            font-weight: 600;
          }

          .workflow-status {
            margin-bottom: 32px;
            padding: 24px;
            background: #f9fafb;
            border-radius: 8px;
          }

          .status-flow {
            display: flex;
            justify-content: space-between;
            gap: 12px;
            margin-top: 20px;
          }

          .status-step {
            flex: 1;
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
            position: relative;
          }

          .status-step:not(:last-child)::after {
            content: '→';
            position: absolute;
            right: -20px;
            top: 20px;
            font-size: 1.5rem;
            color: #d1d5db;
          }

          .status-step.active .step-number {
            background: #3b82f6;
            color: white;
            border-color: #3b82f6;
          }

          .status-step.completed .step-number {
            background: #10b981;
            color: white;
            border-color: #10b981;
          }

          .status-step.completed:not(:last-child)::after {
            color: #10b981;
          }

          .step-number {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            border: 3px solid #d1d5db;
            background: white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            font-size: 1.125rem;
            margin-bottom: 8px;
          }

          .step-info {
          }

          .step-title {
            font-weight: 600;
            font-size: 0.875rem;
            color: #1a1a1a;
            margin-bottom: 4px;
          }

          .step-desc {
            font-size: 0.75rem;
            color: #666;
            line-height: 1.4;
          }

          .form-container {
            margin-bottom: 24px;
          }

          .form-navigation {
            display: flex;
            gap: 16px;
            margin-top: 32px;
            padding-top: 24px;
            border-top: 1px solid #e5e7eb;
          }

          @media (max-width: 768px) {
            .submit-bid-page {
              padding: 16px;
            }

            .page-title {
              font-size: 1.5rem;
            }

            .status-flow {
              gap: 8px;
            }
            
            .step-desc {
              font-size: 0.7rem;
            }
            
            .status-step:not(:last-child)::after {
              right: -15px;
              font-size: 1.2rem;
            }
            
            .step-number {
              width: 36px;
              height: 36px;
              font-size: 1rem;
            }
          }
        `}</style>
      </div>
    </Layout>
  );
};

export default SubmitBid;
