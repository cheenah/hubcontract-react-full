export const DOCUMENT_LABELS = {
  registration_certificate:   'Свидетельство о регистрации',
  tax_clearance:              'Справка об отсутствии задолженностей',
  director_id_doc:            'Документы директора',
  director_appointment_order: 'Приказ о назначении директора',
  company_charter:            'Устав компании',
};

export const getStatusConfig = (status) => {
  const map = {
    draft:                            { label: 'Черновик' },
    published:                        { label: 'Опубликован' },
    active:                           { label: 'Активен' },
    published_receiving_proposals:    { label: 'Приём предложений' },
    published_receiving_applications: { label: 'Приём заявок' },
    under_review:                     { label: 'На рассмотрении' },
    awarded:                          { label: 'Победитель выбран' },
    cancelled:                        { label: 'Отменён' },
    completed:                        { label: 'Завершён' },
    pending:                          { label: 'Ожидает' },
    signed:                           { label: 'Подписан' },
    rejected:                         { label: 'Отклонён' },
    verified:                         { label: 'Верифицирован' },
    not_verified:                     { label: 'Не верифицирован' },
    contractor:                       { label: 'Исполнитель' },
    customer:                         { label: 'Заказчик' },
    admin:                            { label: 'Администратор' },
  };
  return map[status] ?? { label: status || '—' };
};

// Backend may return verification_status as a per-document map instead of a plain string.
// Collapse it to a single priority-ordered string.
export const resolveVerificationStatus = (status) => {
  if (!status) return 'not_verified';
  if (typeof status === 'string') return status;
  if (typeof status === 'object') {
    const vals = Object.values(status);
    if (vals.some(v => v === 'rejected'))                     return 'rejected';
    if (vals.some(v => v === 'pending'))                      return 'pending';
    if (vals.length > 0 && vals.every(v => v === 'verified')) return 'verified';
    return 'not_verified';
  }
  return 'not_verified';
};
