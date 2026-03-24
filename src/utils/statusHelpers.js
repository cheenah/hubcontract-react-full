// Утилиты для работы со статусами договоров и тендеров

/**
 * Переводит статус договора на русский язык
 */
export const getContractStatusText = (status) => {
  const statuses = {
    draft: 'Черновик',
    pending_approval: 'На согласовании',
    approved: 'Согласован',
    pending_signature: 'Ожидает подписания',
    signed: 'Подписан',
    active: 'Действующий',
    completed: 'Завершен',
    terminated: 'Расторгнут',
    cancelled: 'Отменен'
  };
  return statuses[status] || status;
};

/**
 * Переводит статус тендера на русский язык
 */
export const getTenderStatusText = (status) => {
  const statuses = {
    draft: 'Черновик',
    published_receiving_proposals: 'Прием заявок',
    published_under_review: 'На рассмотрении',
    closed: 'Закрыт',
    cancelled: 'Отменен',
    active: 'Активный',
    under_review: 'На рассмотрении'
  };
  return statuses[status] || status;
};

/**
 * Возвращает CSS класс для статуса
 */
export const getStatusClass = (status) => {
  return `status-badge status-${status}`;
};

/**
 * Возвращает цветовую схему для статуса договора
 */
export const getContractStatusColor = (status) => {
  const colors = {
    draft: '#9ca3af', // gray
    pending_approval: '#f59e0b', // orange
    approved: '#3b82f6', // blue
    pending_signature: '#8b5cf6', // purple
    signed: '#10b981', // green
    active: '#10b981', // green
    completed: '#6366f1', // indigo
    terminated: '#ef4444', // red
    cancelled: '#ef4444' // red
  };
  return colors[status] || '#9ca3af';
};

/**
 * Переводит действие в истории договора на русский язык
 */
export const getContractActionText = (action) => {
  const actions = {
    created: 'Создан',
    sent_for_approval: 'Отправлен на согласование',
    details_filled: 'Реквизиты заполнены',
    approved: 'Согласован',
    approved_by_contractor: 'Согласован подрядчиком',
    sent_for_signature: 'Отправлен на подписание',
    signed_by_customer: 'Подписан заказчиком',
    signed_by_contractor: 'Подписан подрядчиком',
    signed: 'Подписан',
    activated: 'Активирован',
    completed: 'Завершен',
    terminated: 'Расторгнут',
    cancelled: 'Отменен',
    edited: 'Отредактирован',
    work_act_submitted: 'Подан акт выполненных работ',
    payment_made: 'Произведена оплата'
  };
  return actions[action] || action;
};
