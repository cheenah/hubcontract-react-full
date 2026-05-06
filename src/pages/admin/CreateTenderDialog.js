import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import apiClient from '@/services/api';
import useDictionaryStore from '@/store/dictionaryStore';

const lotSchema = z.object({
  title: z.string().min(1, 'Название лота обязательно'),
  quantity: z.coerce.number().min(0.01, 'Укажите количество'),
  unit: z.string().min(1, 'Укажите единицу измерения'),
  budget: z.coerce.number().min(0.01, 'Укажите стоимость'),
  technical_spec: z.string().optional().default(''),
});

const tenderSchema = z.object({
  title: z.string().min(1, 'Название тендера обязательно'),
  description: z.string().optional().default(''),
  category: z.string().optional().default(''),
  region: z.string().optional().default(''),
  tender_type: z.enum(
    ['price_proposals', 'open_competition', 'auction', 'single_source'],
    { required_error: 'Выберите тип тендера' }
  ),
  deadline: z.string().optional().default(''),
  submission_start: z.string().optional().default(''),
  submission_end: z.string().optional().default(''),
  technical_specs: z.string().optional().default(''),
  requirements: z.string().optional().default(''),
  special_conditions: z.string().optional().default(''),
  customer_organization: z.string().optional().default(''),
  customer_legal_address: z.string().optional().default(''),
  customer_representative_name: z.string().optional().default(''),
  customer_representative_position: z.string().optional().default(''),
  procurement_subject: z.string().optional().default(''),
  lots: z.array(lotSchema).min(1, 'Добавьте хотя бы один лот'),
});

const DEFAULT_LOT = { title: '', quantity: 1, unit: '', budget: 0, technical_spec: '' };

const DEFAULT_VALUES = {
  title: '',
  description: '',
  category: '',
  region: '',
  tender_type: undefined,
  deadline: '',
  submission_start: '',
  submission_end: '',
  technical_specs: '',
  requirements: '',
  special_conditions: '',
  customer_organization: '',
  customer_legal_address: '',
  customer_representative_name: '',
  customer_representative_position: '',
  procurement_subject: '',
  lots: [{ ...DEFAULT_LOT }],
};


const CreateTenderDialog = ({ open, onOpenChange, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const { tender_category, tender_type: tenderTypeDict, region: regionDict } = useDictionaryStore((s) => s.dictionaries);

  const form = useForm({
    resolver: zodResolver(tenderSchema),
    defaultValues: DEFAULT_VALUES,
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'lots',
  });

  const watchedLots = form.watch('lots');
  const totalBudget = watchedLots.reduce((sum, lot) => sum + (Number(lot.budget) || 0), 0);

  const handleOpenChange = (val) => {
    if (!val) form.reset(DEFAULT_VALUES);
    onOpenChange(val);
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const payload = {
        title: data.title,
        description: data.description,
        category: data.category,
        region: data.region,
        tender_type: data.tender_type,
        deadline: data.deadline || null,
        submission_start: data.submission_start || null,
        submission_end: data.submission_end || null,
        technical_specs: data.technical_specs,
        requirements: data.requirements
          ? data.requirements.split('\n').map((s) => s.trim()).filter(Boolean)
          : [],
        special_conditions: data.special_conditions
          ? data.special_conditions.split('\n').map((s) => s.trim()).filter(Boolean)
          : [],
        customer_organization: data.customer_organization,
        customer_legal_address: data.customer_legal_address,
        customer_representative_name: data.customer_representative_name,
        customer_representative_position: data.customer_representative_position,
        procurement_subject: data.procurement_subject,
        budget: totalBudget,
        lots: data.lots.map((lot, idx) => ({
          lot_number: idx + 1,
          name: lot.title,
          quantity: Number(lot.quantity),
          unit: lot.unit,
          total_price: Number(lot.budget),
          technical_spec: lot.technical_spec || '',
        })),
      };

      await apiClient.post('/tenders', payload);
      toast.success('Тендер успешно создан');
      form.reset(DEFAULT_VALUES);
      onSuccess();
      onOpenChange(false);
    } catch (err) {
      toast.error(err?.response?.data?.detail || 'Ошибка при создании тендера');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Создание тендера</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

            {/* Секция 1: Основная информация */}
            <Card>
              <CardHeader>
                <CardTitle>Основная информация</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>Название тендера *</FormLabel>
                      <FormControl>
                        <Input placeholder="Введите название тендера" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>Описание</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Описание тендера" rows={3} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Категория</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Выберите категорию" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {tender_category.map(c => (
                            <SelectItem key={c.code} value={c.code}>{c.name_ru}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="region"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Регион</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Выберите регион" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {regionDict.map(r => (
                            <SelectItem key={r.code} value={r.code}>{r.name_ru}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tender_type"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>Тип тендера *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Выберите тип тендера" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {tenderTypeDict.map(tt => (
                            <SelectItem key={tt.code} value={tt.code}>{tt.name_ru}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="deadline"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Дедлайн</FormLabel>
                      <FormControl>
                        <Input type="datetime-local" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="submission_start"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Начало приёма заявок</FormLabel>
                      <FormControl>
                        <Input type="datetime-local" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="submission_end"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Конец приёма заявок</FormLabel>
                      <FormControl>
                        <Input type="datetime-local" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="technical_specs"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>Технические требования</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Технические требования к закупке" rows={3} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="col-span-2">
                  <label className="text-sm font-medium leading-none text-[var(--color-text-dark3)]">
                    Общий бюджет (рассчитывается автоматически)
                  </label>
                  <Input
                    readOnly
                    value={totalBudget.toLocaleString('ru-RU') + ' ₸'}
                    className="mt-1.5 bg-[var(--color-bg-warm)] cursor-default"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Секция 2: Данные заказчика */}
            <Card>
              <CardHeader>
                <CardTitle>Данные заказчика</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="customer_organization"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Организация</FormLabel>
                      <FormControl>
                        <Input placeholder="Наименование организации" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="customer_legal_address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Юридический адрес</FormLabel>
                      <FormControl>
                        <Input placeholder="Юридический адрес" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="customer_representative_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Представитель (ФИО)</FormLabel>
                      <FormControl>
                        <Input placeholder="ФИО представителя" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="customer_representative_position"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Должность представителя</FormLabel>
                      <FormControl>
                        <Input placeholder="Должность" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="procurement_subject"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>Предмет закупки</FormLabel>
                      <FormControl>
                        <Input placeholder="Предмет закупки" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="requirements"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>Требования к участникам</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Каждое требование с новой строки"
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="special_conditions"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>Особые условия</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Каждое условие с новой строки"
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Секция 3: Лоты */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Лоты</CardTitle>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => append({ ...DEFAULT_LOT })}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Добавить лот
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {fields.map((field, idx) => (
                  <Card key={field.id} className="border border-dashed">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <span className="text-sm font-semibold text-[var(--color-text-dark3)]">
                        Лот #{idx + 1}
                      </span>
                      {fields.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => remove(idx)}
                          className="h-7 px-2 text-[var(--color-danger-alt)] hover:text-[var(--color-danger-alt)] hover:bg-[var(--color-danger-tint-10)]"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-3">
                      <FormField
                        control={form.control}
                        name={`lots.${idx}.title`}
                        render={({ field: f }) => (
                          <FormItem className="col-span-2">
                            <FormLabel>Название лота *</FormLabel>
                            <FormControl>
                              <Input placeholder="Название лота" {...f} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`lots.${idx}.quantity`}
                        render={({ field: f }) => (
                          <FormItem>
                            <FormLabel>Количество *</FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="0" min="0" step="any" {...f} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`lots.${idx}.unit`}
                        render={({ field: f }) => (
                          <FormItem>
                            <FormLabel>Единица измерения *</FormLabel>
                            <FormControl>
                              <Input placeholder="шт, кг, л, м²..." {...f} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`lots.${idx}.budget`}
                        render={({ field: f }) => (
                          <FormItem className="col-span-2">
                            <FormLabel>Стоимость (₸) *</FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="0" min="0" step="any" {...f} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`lots.${idx}.technical_spec`}
                        render={({ field: f }) => (
                          <FormItem className="col-span-2">
                            <FormLabel>Техническая спецификация</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Описание технических характеристик"
                                rows={2}
                                {...f}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>
                ))}

                {form.formState.errors.lots?.message && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.lots.message}
                  </p>
                )}
              </CardContent>
            </Card>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={loading}
              >
                Отмена
              </Button>
              <Button type="submit" disabled={loading} className="neon-button-filled">
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Создать тендер
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateTenderDialog;
