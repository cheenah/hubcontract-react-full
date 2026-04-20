import React, { useState, useRef, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { AppContext } from '@/App';
import apiClient from '@/services/api';
import { useLanguage } from '@/context/LanguageContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Building2, Phone, ChevronRight, ChevronLeft,
  CheckCircle2, Upload, X, FileText, Loader2,
  Trash2, Plus, UserRound,
} from 'lucide-react';

// ── Constants ──────────────────────────────────────────────────────────────────

const ORG_TYPES = ['ТОО', 'АО', 'ИП', 'ГП', 'КТ'];

const ACCEPT       = '.pdf,.jpg,.jpeg,.png';
const ACCEPT_TYPES = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
const MAX_BYTES    = 10 * 1024 * 1024;

// Keys into translation map (labels resolved inside components via t())
const FILE_KEYS = [
  { key: 'registration_cert', tKey: 'completeReg.registrationCert' },
  { key: 'tax_clearance',     tKey: 'completeReg.taxClearance' },
  { key: 'director_docs',     tKey: 'completeReg.directorDocs' },
  { key: 'director_order',    tKey: 'completeReg.directorOrder' },
  { key: 'company_charter',   tKey: 'completeReg.charter' },
];

// ── Validators ─────────────────────────────────────────────────────────────────

const RE_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const validatePhone = (raw) => /^\+7\d{10}$/.test(raw.replace(/[\s\-().]/g, ''));
const validateEmail = (raw) => RE_EMAIL.test(raw.trim());

const phoneError    = (v) => !v.trim() ? 'Обязательное поле' : !validatePhone(v) ? 'Формат: +7XXXXXXXXXX (11 цифр)' : null;
const emailError    = (v) => !v.trim() ? 'Обязательное поле' : !validateEmail(v) ? 'Некорректный email' : null;
const requiredError = (v) => v.trim() ? null : 'Обязательное поле';

const newContact = () => ({ id: Date.now() + Math.random(), name: '', position: '', phone: '', email: '' });

// ── Helpers ────────────────────────────────────────────────────────────────────

const fmtSize = (b) =>
  b >= 1_000_000 ? `${(b / 1_000_000).toFixed(1)} МБ` : `${Math.round(b / 1024)} КБ`;

const toBase64 = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload  = () => resolve(reader.result.split(',')[1]);
  reader.onerror = reject;
  reader.readAsDataURL(file);
});

// ── FileUploadField ────────────────────────────────────────────────────────────

const FileUploadField = ({ label, name, file, onSelect, onRemove, hasError }) => {
  const ref = useRef(null);
  const [processing, setProcessing] = useState(false);

  const handleChange = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!ACCEPT_TYPES.includes(f.type)) {
      toast.error('Допустимые форматы: PDF, JPG, PNG');
      e.target.value = '';
      return;
    }
    if (f.size > MAX_BYTES) {
      toast.error(`${label}: файл превышает 10 МБ`);
      e.target.value = '';
      return;
    }
    if (f.size > 1_000_000) {
      setProcessing(true);
      await new Promise(r => setTimeout(r, 350));
      setProcessing(false);
    }
    onSelect(name, f);
    e.target.value = '';
  };

  return (
    <div className="cr-file-wrap">
      <Label className="cr-file-label">
        {label} <span style={{ color: 'var(--color-danger)' }}>*</span>
      </Label>

      {file ? (
        <div className="cr-file-preview">
          <FileText size={16} className="cr-file-icon" />
          <span className="cr-file-name" title={file.name}>{file.name}</span>
          <span className="cr-file-size">{fmtSize(file.size)}</span>
          <button type="button" aria-label="Удалить файл" className="cr-file-remove" onClick={() => onRemove(name)}>
            <X size={14} />
          </button>
        </div>
      ) : (
        <button
          type="button"
          className={`cr-file-zone${hasError ? ' cr-file-zone-err' : ''}`}
          onClick={() => ref.current?.click()}
          disabled={processing}
        >
          {processing
            ? <><Loader2 size={16} className="cr-spin" /><span>Обработка…</span></>
            : <><Upload size={16} /><span>Выбрать файл</span></>
          }
          <span className="cr-file-hint">PDF, JPG, PNG · до 10 МБ</span>
        </button>
      )}

      <input ref={ref} type="file" accept={ACCEPT} className="hidden" onChange={handleChange} />
      {hasError && <p className="cr-err">Файл обязателен</p>}
    </div>
  );
};

// ── ContactCard ────────────────────────────────────────────────────────────────

const ContactCard = ({ idx, contact, errs = {}, onChange, onRemove, canRemove, labels }) => {
  const field = (key, type = 'text', placeholder = '') => (
    <div className="form-field">
      <Label htmlFor={`c-${idx}-${key}`}>
        {labels[key]} <span style={{ color: 'var(--color-danger)' }}>*</span>
      </Label>
      <Input
        id={`c-${idx}-${key}`}
        type={type}
        className={`h-11 mt-1${errs[key] ? ' cr-input-err' : ''}`}
        placeholder={placeholder}
        value={contact[key]}
        onChange={e => onChange(idx, key, e.target.value)}
      />
      {errs[key] && <p className="cr-err">{errs[key]}</p>}
    </div>
  );

  return (
    <div className="cr-contact-card">
      <div className="cr-contact-header">
        <div className="cr-contact-badge">
          <UserRound size={14} />
          <span>Контактное лицо {idx + 1}</span>
        </div>
        {canRemove && (
          <button type="button" className="cr-contact-remove" onClick={() => onRemove(idx)} aria-label="Удалить контакт">
            <Trash2 size={15} />
          </button>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {field('name',     'text',  'Иванов Иван Иванович')}
        {field('position', 'text',  'Менеджер по закупкам')}
        {field('phone',    'tel',   '+77001234567')}
        {field('email',    'email', 'contact@company.kz')}
      </div>
    </div>
  );
};

// ── Main component ─────────────────────────────────────────────────────────────

const CompleteRegistration = () => {
  const { user, logout, checkAuth } = useContext(AppContext);
  const { t } = useLanguage();
  const navigate = useNavigate();

  // Resolved once per render so sub-components get translated strings
  const STEPS = [
    { id: 1, label: t('completeReg.step1Title'), icon: Building2 },
    { id: 2, label: t('completeReg.step2Title'), icon: Phone },
  ];

  const FILE_FIELDS = FILE_KEYS.map(f => ({ ...f, label: t(f.tKey) }));

  const contactLabels = {
    name:     t('completeReg.fullName'),
    position: t('completeReg.position'),
    phone:    t('completeReg.phone'),
    email:    t('completeReg.email'),
  };

  const [step,    setStep]    = useState(1);
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState(false);

  // Step 1
  const [form, setForm] = useState({ org_type: '', legal_address: '', director_name: '' });
  const [files, setFiles] = useState({
    registration_cert: null,
    tax_clearance:     null,
    director_docs:     null,
    director_order:    null,
    company_charter:   null,
  });

  // Step 2
  const [director,  setDirector]  = useState({ phone: '', email: '' });
  const [contacts,  setContacts]  = useState([newContact()]);
  const [step2Errs, setStep2Errs] = useState(null);

  // Step 1 validity
  const step1TextOk  = !!form.org_type && !!form.legal_address.trim() && !!form.director_name.trim();
  const step1FilesOk = FILE_FIELDS.every(f => !!files[f.key]);
  const step1Valid   = step1TextOk && step1FilesOk;

  // Setters
  const setField     = (f, v) => setForm(p => ({ ...p, [f]: v }));
  const onFileSelect = (n, f) => setFiles(p => ({ ...p, [n]: f }));
  const onFileRemove = (n)    => setFiles(p => ({ ...p, [n]: null }));

  const setDirField = (f, v) => {
    setDirector(p => ({ ...p, [f]: v }));
    if (step2Errs) setStep2Errs(p => ({ ...p, director: { ...p?.director, [f]: null } }));
  };

  const onContactChange = (idx, key, val) => {
    setContacts(p => p.map((c, i) => i === idx ? { ...c, [key]: val } : c));
    if (step2Errs) setStep2Errs(p => {
      const ca = [...(p?.contacts ?? [])];
      if (ca[idx]) ca[idx] = { ...ca[idx], [key]: null };
      return { ...p, contacts: ca };
    });
  };

  const addContact    = () => setContacts(p => [...p, newContact()]);
  const removeContact = (idx) => setContacts(p => p.filter((_, i) => i !== idx));

  // Navigation
  const handleNext = () => {
    setTouched(true);
    if (step1Valid) { setStep(2); setTouched(false); }
  };
  const handleBack = () => setStep(1);

  // Step 2 validation
  const buildStep2Errors = () => {
    const errs = { director: {}, contacts: [] };
    let hasErr = false;

    const dPhone = phoneError(director.phone);
    const dEmail = emailError(director.email);
    if (dPhone) { errs.director.phone = dPhone; hasErr = true; }
    if (dEmail) { errs.director.email = dEmail; hasErr = true; }

    contacts.forEach(c => {
      const ce = {
        name:     requiredError(c.name),
        position: requiredError(c.position),
        phone:    phoneError(c.phone),
        email:    emailError(c.email),
      };
      errs.contacts.push(ce);
      if (Object.values(ce).some(Boolean)) hasErr = true;
    });

    return hasErr ? errs : null;
  };

  // Submit — sequential API calls
  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = buildStep2Errors();
    setStep2Errs(errs);
    if (errs) return;

    setLoading(true);
    try {
      // 1. Organization profile
      await apiClient.put('/organization/profile', {
        company_type:   form.org_type,
        legal_address:  form.legal_address,
        director_name:  form.director_name,
        director_phone: director.phone,
        director_email: director.email,
      });

      // 2. Contact persons
      for (const c of contacts) {
        await apiClient.post('/organization/employees', {
          full_name: c.name,
          position:  c.position,
          phone:     c.phone,
          email:     c.email,
        });
      }

      // 3. Documents (base64)
      for (const { key } of FILE_FIELDS) {
        const file = files[key];
        if (!file) continue;
        const file_data = await toBase64(file);
        await apiClient.post('/documents/upload', {
          document_type: key,
          file_data,
          filename: file.name,
        });
      }

      // Refresh auth state, then navigate to role dashboard
      await checkAuth();
      toast.success(t('completeReg.successMessage'));
      const role = user?.role;
      if (role === 'admin') navigate('/admin');
      else if (role === 'contractor') navigate('/contractor/dashboard');
      else navigate('/customer/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Ошибка при сохранении данных');
    } finally {
      setLoading(false);
    }
  };

  // Input error class helper
  const inputErr = (ok) => `h-11 mt-1${(!ok && touched) ? ' cr-input-err' : ''}`;
  const dirErr   = step2Errs?.director ?? {};

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="cr-page">
      <div className="cr-page-inner">

        {/* Progress bar */}
        <div className="cr-progress">
          {STEPS.map((s, i) => {
            const done  = step > s.id;
            const active = step === s.id;
            const Icon  = s.icon;
            return (
              <React.Fragment key={s.id}>
                <div className="cr-step">
                  <div className={`cr-step-circle ${active ? 'cr-step-active' : done ? 'cr-step-done' : 'cr-step-idle'}`}>
                    {done ? <CheckCircle2 size={18} /> : <Icon size={18} />}
                  </div>
                  <div className="cr-step-meta">
                    <span className="cr-step-num">
                      {t('completeReg.stepOf')
                        .replace('{current}', s.id)
                        .replace('{total}', STEPS.length)}
                    </span>
                    <span className={`cr-step-label${active ? ' cr-step-label-active' : ''}`}>{s.label}</span>
                  </div>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`cr-connector${done ? ' cr-connector-done' : ''}`} />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Card */}
        <div className="cr-card">
          <div className="cr-card-body">

            <div className="cr-card-heading">
              <h1 className="cr-card-title">
                {step === 1 ? t('completeReg.step1Title') : t('completeReg.step2Title')}
              </h1>
              <p className="cr-card-subtitle">
                {step === 1 ? t('completeReg.step1Subtitle') : t('completeReg.step2Subtitle')}
              </p>
            </div>

            {/* ── ШАГ 1 ─────────────────────────────────────────────────── */}
            {step === 1 && (
              <div className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="form-field">
                    <Label htmlFor="org_type">
                      {t('completeReg.companyType')} <span style={{ color: 'var(--color-danger)' }}>*</span>
                    </Label>
                    <Select value={form.org_type} onValueChange={v => setField('org_type', v)}>
                      <SelectTrigger className={`h-11 mt-1${(!form.org_type && touched) ? ' cr-input-err' : ''}`}>
                        <SelectValue placeholder="Выберите тип" />
                      </SelectTrigger>
                      <SelectContent>
                        {ORG_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    {!form.org_type && touched && <p className="cr-err">Обязательное поле</p>}
                  </div>

                  <div className="form-field">
                    <Label htmlFor="director_name">
                      {t('completeReg.directorName')} <span style={{ color: 'var(--color-danger)' }}>*</span>
                    </Label>
                    <Input
                      id="director_name"
                      className={inputErr(form.director_name.trim())}
                      placeholder="Иванов Иван Иванович"
                      value={form.director_name}
                      onChange={e => setField('director_name', e.target.value)}
                    />
                    {!form.director_name.trim() && touched && <p className="cr-err">Обязательное поле</p>}
                  </div>
                </div>

                <div className="form-field">
                  <Label htmlFor="legal_address">
                    {t('completeReg.legalAddress')} <span style={{ color: 'var(--color-danger)' }}>*</span>
                  </Label>
                  <Input
                    id="legal_address"
                    className={inputErr(form.legal_address.trim())}
                    placeholder="г. Алматы, ул. Примерная, 1"
                    value={form.legal_address}
                    onChange={e => setField('legal_address', e.target.value)}
                  />
                  {!form.legal_address.trim() && touched && <p className="cr-err">Обязательное поле</p>}
                </div>

                <div className="cr-section-divider"><span>{t('completeReg.docsSection')}</span></div>

                <div className="space-y-3">
                  {FILE_FIELDS.map(f => (
                    <FileUploadField
                      key={f.key}
                      name={f.key}
                      label={f.label}
                      file={files[f.key]}
                      onSelect={onFileSelect}
                      onRemove={onFileRemove}
                      hasError={!files[f.key] && touched}
                    />
                  ))}
                </div>

                {touched && !step1Valid && (
                  <p className="cr-err">
                    Заполните все поля и прикрепите все документы для продолжения
                  </p>
                )}

                <button
                  type="button"
                  onClick={handleNext}
                  className={`cr-btn-next ${step1Valid ? 'cr-btn-next-active' : 'cr-btn-next-inactive'}`}
                >
                  {t('completeReg.next')} <ChevronRight size={20} style={{ marginLeft: 'var(--space-1)' }} />
                </button>
              </div>
            )}

            {/* ── ШАГ 2 ─────────────────────────────────────────────────── */}
            {step === 2 && (
              <form onSubmit={handleSubmit} className="space-y-7" noValidate>

                {/* Контактные данные директора */}
                <div className="cr-block">
                  <h2 className="cr-block-title">{t('completeReg.directorContacts')}</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="form-field">
                      <Label htmlFor="dir-phone">
                        {t('completeReg.directorPhone')} <span style={{ color: 'var(--color-danger)' }}>*</span>
                      </Label>
                      <Input
                        id="dir-phone"
                        type="tel"
                        className={`h-11 mt-1${dirErr.phone ? ' cr-input-err' : ''}`}
                        placeholder="+77001234567"
                        value={director.phone}
                        onChange={e => setDirField('phone', e.target.value)}
                      />
                      {dirErr.phone && <p className="cr-err">{dirErr.phone}</p>}
                    </div>

                    <div className="form-field">
                      <Label htmlFor="dir-email">
                        {t('completeReg.directorEmail')} <span style={{ color: 'var(--color-danger)' }}>*</span>
                      </Label>
                      <Input
                        id="dir-email"
                        type="email"
                        className={`h-11 mt-1${dirErr.email ? ' cr-input-err' : ''}`}
                        placeholder="director@company.kz"
                        value={director.email}
                        onChange={e => setDirField('email', e.target.value)}
                      />
                      {dirErr.email && <p className="cr-err">{dirErr.email}</p>}
                    </div>
                  </div>
                </div>

                {/* Контактные лица */}
                <div className="cr-block">
                  <div className="cr-block-header">
                    <h2 className="cr-block-title">{t('completeReg.contactPersons')}</h2>
                    <button type="button" className="cr-add-btn" onClick={addContact}>
                      <Plus size={15} />
                      {t('completeReg.addContact')}
                    </button>
                  </div>
                  <div className="space-y-4">
                    {contacts.map((c, idx) => (
                      <ContactCard
                        key={c.id}
                        idx={idx}
                        contact={c}
                        errs={step2Errs?.contacts?.[idx] ?? {}}
                        onChange={onContactChange}
                        onRemove={removeContact}
                        canRemove={contacts.length > 1}
                        labels={contactLabels}
                      />
                    ))}
                  </div>
                </div>

                <div className="cr-btn-row">
                  <button
                    type="button"
                    className="cr-btn-back"
                    onClick={handleBack}
                    disabled={loading}
                  >
                    <ChevronLeft size={20} style={{ marginRight: 'var(--space-1)' }} />
                    {t('completeReg.back')}
                  </button>
                  <button
                    type="submit"
                    className="cr-btn-submit"
                    disabled={loading}
                  >
                    {loading
                      ? <><Loader2 size={18} className="cr-spin" />{t('completeReg.submit')}…</>
                      : t('completeReg.submit')
                    }
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>

        {/* Exit footer */}
        <div className="cr-exit-footer">
          <button
            type="button"
            className="cr-exit-btn"
            onClick={() => navigate(-1)}
          >
            ← {t('completeReg.back')}
          </button>
          <span className="cr-exit-sep" />
          <button
            type="button"
            className="cr-exit-btn"
            onClick={() => { logout(); navigate('/registration'); }}
          >
            {t('completeReg.tryAnotherEmail')}
          </button>
        </div>

      </div>
    </div>
  );
};

export default CompleteRegistration;
