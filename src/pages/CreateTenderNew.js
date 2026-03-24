import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, ArrowRight, Plus, Trash2, Upload, FileText, Check } from 'lucide-react';

const CreateTenderNew = () => {
  const navigate = useNavigate();
  const { API } = React.useContext(AppContext);
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 2;
  
  // Шаг 1: Общие данные
  const [generalData, setGeneralData] = useState({
    title: '',
    description: '',
    tender_type: 'price_proposals',
    category: 'construction',
    region: '',
    publication_date: '',
    submission_start: '',
    submission_end: '',
    requirements: [''],
    status: 'draft',
    // Дополнительные поля для "Общие сведения"
    customer_organization: '',
    customer_legal_address: '',
    customer_representative_name: '',
    customer_representative_position: '',
    procurement_subject: '',
    special_conditions: ['']
  });
  
  // Шаг 2: Лоты
  const [lots, setLots] = useState([
    {
      id: Date.now(),
      lot_number: 1,
      name: '',
      quantity: 1,
      unit: 'шт',
      unit_price: '',
      total_price: 0,
      technical_spec: '',
      technical_spec_file: null,
      documents: []
    }
  ]);

  // Рассчитать общий бюджет из всех лотов
  const calculateTotalBudget = () => {
    return lots.reduce((sum, lot) => sum + (parseFloat(lot.total_price) || 0), 0);
  };

  // Обновить данные лота
  const updateLot = (index, field, value) => {
    const updatedLots = [...lots];
    updatedLots[index][field] = value;
    
    // Автоматически рассчитать total_price
    if (field === 'quantity' || field === 'unit_price') {
      const quantity = parseFloat(updatedLots[index].quantity) || 0;
      const unitPrice = parseFloat(updatedLots[index].unit_price) || 0;
      updatedLots[index].total_price = quantity * unitPrice;
    }
    
    setLots(updatedLots);
  };

  // Добавить новый лот
  const addLot = () => {
    const newLot = {
      id: Date.now(),
      lot_number: lots.length + 1,
      name: '',
      quantity: 1,
      unit: 'шт',
      unit_price: '',
      total_price: 0,
      technical_spec: '',
      technical_spec_file: null,
      documents: []
    };
    setLots([...lots, newLot]);
  };

  // Удалить лот
  const removeLot = (index) => {
    if (lots.length === 1) {
      toast.error('Должен быть хотя бы один лот');
      return;
    }
    const updatedLots = lots.filter((_, i) => i !== index);
    // Обновить номера лотов
    updatedLots.forEach((lot, i) => {
      lot.lot_number = i + 1;
    });
    setLots(updatedLots);
  };

  // Загрузить файл тех.спецификации для лота
  const uploadLotTechSpec = async (index, file) => {
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      updateLot(index, 'technical_spec_file', {
        name: file.name,
        data: e.target.result,
        type: file.type
      });
      toast.success(`Файл "${file.name}" загружен`);
    };
    reader.readAsDataURL(file);
  };

  // Обновить требования
  const updateRequirement = (index, value) => {
    const updated = [...generalData.requirements];
    updated[index] = value;
    setGeneralData({ ...generalData, requirements: updated });
  };

  const addRequirement = () => {
    setGeneralData({
      ...generalData,
      requirements: [...generalData.requirements, '']
    });
  };

  const removeRequirement = (index) => {
    if (generalData.requirements.length === 1) return;
    const updated = generalData.requirements.filter((_, i) => i !== index);
    setGeneralData({ ...generalData, requirements: updated });
  };
  // Обновить признак
  const updateSpecialCondition = (index, value) => {
    const updated = [...generalData.special_conditions];
    updated[index] = value;
    setGeneralData({ ...generalData, special_conditions: updated });
  };

  // Добавить признак
  const addSpecialCondition = () => {
    setGeneralData({
      ...generalData,
      special_conditions: [...generalData.special_conditions, '']
    });
  };

  // Удалить признак
  const removeSpecialCondition = (index) => {
    if (generalData.special_conditions.length > 1) {
      const updated = generalData.special_conditions.filter((_, i) => i !== index);
      setGeneralData({ ...generalData, special_conditions: updated });
    }
  };

  // Навигация по шагам
  const nextStep = () => {
    // Валидация перед переходом
    if (currentStep === 1) {
      if (!generalData.title) {
        toast.error('Укажите название тендера');
        return;
      }
      if (!generalData.description) {
        toast.error('Укажите описание тендера');
        return;
      }
      if (!generalData.region) {
        toast.error('Укажите регион');
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

  // Сохранить тендер
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Валидация лотов
    for (let i = 0; i < lots.length; i++) {
      const lot = lots[i];
      if (!lot.name) {
        toast.error(`Укажите наименование для лота ${lot.lot_number}`);
        return;
      }
      if (!lot.unit_price || parseFloat(lot.unit_price) <= 0) {
        toast.error(`Укажите цену за единицу для лота ${lot.lot_number}`);
        return;
      }
    }
    
    setLoading(true);
    
    try {
      const tenderData = {
        ...generalData,
        budget: calculateTotalBudget(),
        technical_specs: '',  // Пустое поле, т.к. спецификации теперь только в лотах
        lots: lots.map(lot => ({
          id: lot.id.toString(),
          lot_number: lot.lot_number,
          name: lot.name,
          quantity: parseFloat(lot.quantity),
          unit: lot.unit,
          unit_price: parseFloat(lot.unit_price),
          total_price: parseFloat(lot.total_price),
          technical_spec: lot.technical_spec || '',
          technical_spec_file: lot.technical_spec_file ? lot.technical_spec_file.data : null,
          documents: lot.documents || []
        }))
      };
      
      const response = await axios.post(`${API}/tenders`, tenderData);
      
      toast.success('Тендер успешно создан!');
      navigate('/my-tenders');
    } catch (error) {
      console.error('Error creating tender:', error);
      toast.error(error.response?.data?.detail || 'Ошибка при создании тендера');
    } finally {
      setLoading(false);
    }
  };

  // Рендер прогресс-бара
  const renderProgressBar = () => {
    return (
      <div className="progress-container">
        <div className="progress-bar">
          {[1, 2].map(step => (
            <div
              key={step}
              className={`progress-step ${currentStep >= step ? 'active' : ''}`}
            >
              <div className="step-circle">
                {currentStep > step ? <Check size={20} /> : step}
              </div>
              <div className="step-label">
                {step === 1 ? 'Общие данные' : 'Лоты'}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Рендер Шаг 1: Общие данные
  const renderStep1 = () => {
    return (
      <div className="form-step">
        <Card>
          <CardHeader>
            <CardTitle style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1a202c' }}>
              Общие данные тендера
            </CardTitle>
            <CardDescription style={{ fontSize: '1rem', color: '#2d3748', fontWeight: '500' }}>
              Укажите основную информацию о закупке
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Название */}
            <div className="form-field">
              <Label htmlFor="title">Название тендера *</Label>
              <Input
                id="title"
                value={generalData.title}
                onChange={(e) => setGeneralData({ ...generalData, title: e.target.value })}
                placeholder="Например: Поставка офисного оборудования"
              />
            </div>

            {/* Описание */}
            <div className="form-field">
              <Label htmlFor="description">Описание *</Label>
              <Textarea
                id="description"
                value={generalData.description}
                onChange={(e) => setGeneralData({ ...generalData, description: e.target.value })}
                placeholder="Подробное описание закупки..."
                rows={4}
              />
            </div>

            {/* Тип тендера */}
            <div className="form-field">
              <Label htmlFor="tender_type">Тип закупки *</Label>
              <Select
                value={generalData.tender_type}
                onValueChange={(value) => setGeneralData({ ...generalData, tender_type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите тип" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="price_proposals">Ценовые предложения</SelectItem>
                  <SelectItem value="open_competition">Открытый конкурс</SelectItem>
                  <SelectItem value="auction">Аукцион</SelectItem>
                  <SelectItem value="single_source">Единственный источник</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Категория и Регион */}
            <div className="grid grid-cols-2 gap-4">
              <div className="form-field">
                <Label htmlFor="category">Категория *</Label>
                <Select
                  value={generalData.category}
                  onValueChange={(value) => setGeneralData({ ...generalData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите категорию" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="construction">Строительство</SelectItem>
                    <SelectItem value="equipment">Оборудование</SelectItem>
                    <SelectItem value="services">Услуги</SelectItem>
                    <SelectItem value="materials">Материалы</SelectItem>
                    <SelectItem value="technology">Технологии</SelectItem>
                    <SelectItem value="consulting">Консалтинг</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="form-field">
                <Label htmlFor="region">Регион *</Label>
                <Input
                  id="region"
                  value={generalData.region}
                  onChange={(e) => setGeneralData({ ...generalData, region: e.target.value })}
                  placeholder="Например: Алматы"
                />
              </div>
            </div>

            {/* Даты */}
            <div className="form-field">
              <Label>Даты публикации и приема заявок</Label>
              <div className="grid grid-cols-3 gap-4 mt-2">
                <div>
                  <Label htmlFor="publication_date" className="text-sm">Дата публикации</Label>
                  <Input
                    id="publication_date"
                    type="datetime-local"
                    value={generalData.publication_date}
                    onChange={(e) => setGeneralData({ ...generalData, publication_date: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="submission_start" className="text-sm">Начало приема</Label>
                  <Input
                    id="submission_start"
                    type="datetime-local"
                    value={generalData.submission_start}
                    onChange={(e) => setGeneralData({ ...generalData, submission_start: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="submission_end" className="text-sm">Окончание приема</Label>
                  <Input
                    id="submission_end"
                    type="datetime-local"
                    value={generalData.submission_end}
                    onChange={(e) => setGeneralData({ ...generalData, submission_end: e.target.value })}
                  />
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Если не указать, система установит автоматически: публикация сейчас, прием через 5 дней на 7 дней
              </p>
            </div>

            {/* Требования */}
            <div className="form-field">
              <Label>Требования к поставщикам</Label>
              {generalData.requirements.map((req, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <Input
                    value={req}
                    onChange={(e) => updateRequirement(index, e.target.value)}
                    placeholder={`Требование ${index + 1}`}
                  />
                  {generalData.requirements.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => removeRequirement(index)}
                    >
                      <Trash2 size={16} />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={addRequirement}
                className="mt-2"
              >
                <Plus size={16} className="mr-2" />
                Добавить требование
              </Button>
            </div>

            {/* Информация об организаторе */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-lg mb-4">Информация об организаторе</h3>
              
              <div className="space-y-4">
                <div className="form-field">
                  <Label htmlFor="customer_organization">Наименование организации *</Label>
                  <Input
                    id="customer_organization"
                    value={generalData.customer_organization}
                    onChange={(e) => setGeneralData({ ...generalData, customer_organization: e.target.value })}
                    placeholder="Например: ТОО 'Строительная компания'"
                  />
                </div>

                <div className="form-field">
                  <Label htmlFor="customer_legal_address">Юридический адрес *</Label>
                  <Input
                    id="customer_legal_address"
                    value={generalData.customer_legal_address}
                    onChange={(e) => setGeneralData({ ...generalData, customer_legal_address: e.target.value })}
                    placeholder="Например: г. Алматы, ул. Абая, д. 10"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="form-field">
                    <Label htmlFor="customer_representative_name">ФИО представителя *</Label>
                    <Input
                      id="customer_representative_name"
                      value={generalData.customer_representative_name}
                      onChange={(e) => setGeneralData({ ...generalData, customer_representative_name: e.target.value })}
                      placeholder="Иванов Иван Иванович"
                    />
                  </div>

                  <div className="form-field">
                    <Label htmlFor="customer_representative_position">Должность представителя *</Label>
                    <Input
                      id="customer_representative_position"
                      value={generalData.customer_representative_position}
                      onChange={(e) => setGeneralData({ ...generalData, customer_representative_position: e.target.value })}
                      placeholder="Руководитель отдела закупок"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Дополнительные характеристики */}
            <div className="form-field">
              <Label htmlFor="procurement_subject">Вид предмета закупок</Label>
              <Select
                value={generalData.procurement_subject}
                onValueChange={(value) => setGeneralData({ ...generalData, procurement_subject: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите вид предмета" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="goods">Товары</SelectItem>
                  <SelectItem value="works">Работы</SelectItem>
                  <SelectItem value="services">Услуги</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Признаки закупки */}
            <div className="form-field">
              <Label>Признаки закупки</Label>
              {generalData.special_conditions.map((cond, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <Input
                    value={cond}
                    onChange={(e) => updateSpecialCondition(index, e.target.value)}
                    placeholder={`Признак ${index + 1} (например: Без учета НДС)`}
                  />
                  {generalData.special_conditions.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => removeSpecialCondition(index)}
                    >
                      <Trash2 size={16} />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={addSpecialCondition}
                className="mt-2"
              >
                <Plus size={16} className="mr-2" />
                Добавить признак
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  // Рендер Шаг 2: Лоты
  const renderStep2 = () => {
    return (
      <div className="form-step">
        <Card>
          <CardHeader>
            <CardTitle style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1a202c' }}>
              Лоты тендера
            </CardTitle>
            <CardDescription style={{ fontSize: '1rem', color: '#2d3748', fontWeight: '500' }}>
              Добавьте информацию о закупаемых товарах/услугах
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {lots.map((lot, index) => (
              <Card key={lot.id} className="lot-card">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg">Лот {lot.lot_number}</CardTitle>
                  {lots.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeLot(index)}
                    >
                      <Trash2 size={18} />
                    </Button>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Наименование */}
                  <div className="form-field">
                    <Label>Наименование *</Label>
                    <Input
                      value={lot.name}
                      onChange={(e) => updateLot(index, 'name', e.target.value)}
                      placeholder="Например: Ноутбуки Dell"
                    />
                  </div>

                  {/* Количество, Единица, Цена */}
                  <div className="grid grid-cols-4 gap-4">
                    <div className="form-field">
                      <Label>Количество *</Label>
                      <Input
                        type="number"
                        value={lot.quantity}
                        onChange={(e) => updateLot(index, 'quantity', e.target.value)}
                        min="1"
                        step="1"
                      />
                    </div>
                    <div className="form-field">
                      <Label>Единица измерения *</Label>
                      <Select
                        value={lot.unit}
                        onValueChange={(value) => updateLot(index, 'unit', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="шт">Штука</SelectItem>
                          <SelectItem value="услуга">Услуга</SelectItem>
                          <SelectItem value="комплект">Комплект</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="form-field">
                      <Label>Цена за единицу (₸) *</Label>
                      <Input
                        type="number"
                        value={lot.unit_price}
                        onChange={(e) => updateLot(index, 'unit_price', e.target.value)}
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                      />
                    </div>
                    <div className="form-field">
                      <Label>Общая сумма (₸)</Label>
                      <Input
                        type="number"
                        value={lot.total_price.toFixed(2)}
                        disabled
                        className="bg-gray-100"
                      />
                    </div>
                  </div>

                  {/* Техническая спецификация */}
                  <div className="form-field">
                    <Label>Техническая спецификация лота</Label>
                    <Textarea
                      value={lot.technical_spec}
                      onChange={(e) => updateLot(index, 'technical_spec', e.target.value)}
                      placeholder="Подробные требования для данного лота..."
                      rows={3}
                    />
                  </div>

                  {/* Загрузка файла тех.спецификации */}
                  <div className="form-field">
                    <Label>Техническая спецификация (документ)</Label>
                    <div className="flex items-center gap-4">
                      <input
                        type="file"
                        accept="*"
                        onChange={(e) => uploadLotTechSpec(index, e.target.files[0])}
                        className="hidden"
                        id={`lot-file-${index}`}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById(`lot-file-${index}`).click()}
                      >
                        <Upload size={16} className="mr-2" />
                        Загрузить файл
                      </Button>
                      {lot.technical_spec_file && (
                        <div className="flex items-center gap-2">
                          <FileText size={16} />
                          <span className="text-sm">{lot.technical_spec_file.name}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Кнопка добавить лот */}
            <Button
              type="button"
              variant="outline"
              onClick={addLot}
              className="w-full"
            >
              <Plus size={16} className="mr-2" />
              Добавить еще один лот
            </Button>

            {/* Итоговая сумма */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-6">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">Общий бюджет тендера:</span>
                  <span className="text-2xl font-bold text-blue-600">
                    {calculateTotalBudget().toLocaleString('ru-RU')} ₸
                  </span>
                </div>
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <Layout>
      <div className="create-tender-page">
        <div className="page-header">
          <Button
            variant="ghost"
            onClick={() => navigate('/my-tenders')}
            className="mb-4"
          >
            <ArrowLeft size={20} className="mr-2" />
            Назад к тендерам
          </Button>
          <h1 className="page-title">Создание тендера</h1>
          <p className="page-subtitle">Заполните информацию о закупке</p>
        </div>

        {renderProgressBar()}

        <form onSubmit={handleSubmit}>
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}

          {/* Навигация */}
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

            {currentStep < totalSteps && (
              <Button
                type="button"
                onClick={nextStep}
              >
                Далее
                <ArrowRight size={16} className="ml-2" />
              </Button>
            )}

            {currentStep === totalSteps && (
              <Button
                type="submit"
                disabled={loading}
              >
                {loading ? 'Создание...' : 'Создать тендер'}
              </Button>
            )}
          </div>
        </form>

        <style jsx>{`
          .create-tender-page {
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

          .progress-container {
            margin-bottom: 32px;
          }

          .progress-bar {
            display: flex;
            justify-content: space-between;
            align-items: center;
            position: relative;
            padding: 0 40px;
          }

          .progress-bar::before {
            content: '';
            position: absolute;
            top: 24px;
            left: 80px;
            right: 80px;
            height: 3px;
            background: #cbd5e0;
            z-index: 0;
          }

          .progress-step {
            display: flex;
            flex-direction: column;
            align-items: center;
            position: relative;
            z-index: 1;
          }

          .step-circle {
            width: 48px;
            height: 48px;
            border-radius: 50%;
            background: white;
            border: 3px solid #cbd5e0;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            font-size: 1.125rem;
            color: #4a5568;
            transition: all 0.3s ease;
          }

          .progress-step.active .step-circle {
            background: var(--btn-green);
            border-color: var(--btn-green);
            color: white;
          }

          .step-label {
            margin-top: 8px;
            font-size: 0.9375rem;
            color: #4a5568;
            font-weight: 600;
          }

          .progress-step.active .step-label {
            color: #1a202c;
            font-weight: 700;
          }

          .form-step {
            margin-bottom: 24px;
          }

          .form-field {
            margin-bottom: 16px;
          }

          .form-field label {
            color: var(--text-dark-gray);
            font-weight: 500;
            font-size: 0.9375rem;
            margin-bottom: 8px;
            display: block;
          }

          .form-field input,
          .form-field textarea {
            color: var(--text-dark-gray);
            font-size: 1rem;
          }

          .form-field input::placeholder,
          .form-field textarea::placeholder {
            color: #9ca3af;
          }

          .lot-card {
            background: #f9fafb;
            border: 1px solid #e5e7eb;
          }

          .form-navigation {
            display: flex;
            gap: 16px;
            margin-top: 32px;
            padding-top: 24px;
            border-top: 1px solid #e5e7eb;
          }

          @media (max-width: 768px) {
            .create-tender-page {
              padding: 16px;
            }

            .page-title {
              font-size: 1.5rem;
            }

            .progress-bar {
              padding: 0 20px;
            }

            .grid-cols-2,
            .grid-cols-3,
            .grid-cols-4 {
              grid-template-columns: 1fr;
            }
          }
        `}</style>
      </div>
    </Layout>
  );
};

export default CreateTenderNew;
