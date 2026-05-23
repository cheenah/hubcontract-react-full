import React, {useState, useRef} from 'react';
import {useNavigate} from 'react-router-dom';
import {toast} from 'sonner';
import useAuthStore from '@/store/authStore';
import apiClient from '@/services/api';
import { parseApiError } from '@/utils/apiError';
import {useLanguage} from '@/context/LanguageContext';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
    Building2,
    Phone,
    ChevronRight,
    ChevronLeft,
    CheckCircle2,
    Upload,
    X,
    FileText,
    Loader2,
    Trash2,
    Plus,
    UserRound,
    ShieldCheck,
} from 'lucide-react';

// ── Constants ──────────────────────────────────────────────────────────────────

const ORG_TYPES = ['ТОО', 'АО', 'ИП', 'ГП', 'КТ'];

const ACCEPT = '.pdf,.jpg,.jpeg,.png';
const ACCEPT_TYPES = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
const MAX_BYTES = 10 * 1024 * 1024;

const FILE_KEYS = [{key: 'registration_certificate', tKey: 'completeReg.registrationCert'}, {
    key: 'tax_clearance',
    tKey: 'completeReg.taxClearance'
}, {key: 'director_id_doc', tKey: 'completeReg.directorDocs'}, {
    key: 'director_appointment_order',
    tKey: 'completeReg.directorOrder'
}, {key: 'company_charter', tKey: 'completeReg.charter'},];

// ── Validators ─────────────────────────────────────────────────────────────────

const RE_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const validatePhone = (raw) => /^\+7\d{10}$/.test(raw.replace(/[\s\-().]/g, ''));
const validateEmail = (raw) => RE_EMAIL.test(raw.trim());

const phoneError = (v, t) => !v.trim() ? t('completeReg.requiredField') : !validatePhone(v) ? t('completeReg.phoneFormat') : null;
const emailError = (v, t) => !v.trim() ? t('completeReg.requiredField') : !validateEmail(v) ? t('completeReg.invalidEmail') : null;
const requiredError = (v, t) => v.trim() ? null : t('completeReg.requiredField');

const newContact = () => ({id: Date.now() + Math.random(), name: '', position: '', phone: '', email: ''});

// ── Helpers ────────────────────────────────────────────────────────────────────

const fmtSize = (b) => b >= 1_000_000 ? `${(b / 1_000_000).toFixed(1)} МБ` : `${Math.round(b / 1024)} КБ`;

const toBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
});

// ── FileUploadField ────────────────────────────────────────────────────────────

const FileUploadField = ({label, name, file, onSelect, onRemove, hasError}) => {
    const ref = useRef(null);
    const [processing, setProcessing] = useState(false);
    const {t} = useLanguage();

    const handleChange = async (e) => {
        const f = e.target.files?.[0];
        if (!f) return;
        if (!ACCEPT_TYPES.includes(f.type)) {
            toast.error(t('completeReg.fileFormats'));
            e.target.value = '';
            return;
        }
        if (f.size > MAX_BYTES) {
            toast.error(`${label}: ${t('completeReg.fileSizeLimit')}`);
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

    return (<div className="cr-file-wrap">
            <Label className="cr-file-label">
                {label} <span className="text-[var(--color-danger)]">*</span>
            </Label>

            {file ? (<div className="cr-file-preview">
                    <FileText size={16} className="cr-file-icon"/>
                    <span className="cr-file-name" title={file.name}>{file.name}</span>
                    <span className="cr-file-size">{fmtSize(file.size)}</span>
                    <button type="button" aria-label="Удалить файл" className="cr-file-remove"
                            onClick={() => onRemove(name)}>
                        <X size={14}/>
                    </button>
                </div>) : (<button
                    type="button"
                    className={`cr-file-zone${hasError ? ' cr-file-zone-err' : ''}`}
                    onClick={() => ref.current?.click()}
                    disabled={processing}
                >
                    {processing ? <><Loader2 size={16} className="cr-spin"/><span>Обработка…</span></> : <><Upload
                        size={16}/><span>Выбрать файл</span></>}
                    <span className="cr-file-hint">PDF, JPG, PNG · до 10 МБ</span>
                </button>)}

            <input ref={ref} type="file" accept={ACCEPT} className="hidden" onChange={handleChange}/>
            {hasError && <p className="cr-err">{t('completeReg.requiredField')}</p>}
        </div>);
};

// ── ContactCard ────────────────────────────────────────────────────────────────

const ContactCard = ({idx, contact, errs = {}, onChange, onRemove, canRemove, labels, contactLabel}) => {
    const field = (key, type = 'text', placeholder = '') => (<div className="flex flex-col gap-1">
            <Label htmlFor={`c-${idx}-${key}`} className="text-sm font-medium text-[var(--color-text-secondary)]">
                {labels[key]} <span className="text-[var(--color-danger)]">*</span>
            </Label>
            <Input
                id={`c-${idx}-${key}`}
                type={type}
                className={`h-11${errs[key] ? ' cr-input-err' : ''}`}
                placeholder={placeholder}
                value={contact[key]}
                onChange={e => onChange(idx, key, e.target.value)}
            />
            {errs[key] && <p className="cr-err">{errs[key]}</p>}
        </div>);

    return (<div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-5 space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-semibold text-[var(--color-text-secondary)]">
                    <UserRound size={15} className="text-[var(--color-primary)]"/>
                    <span>{contactLabel} {idx + 1}</span>
                </div>
                {canRemove && (<button
                        type="button"
                        onClick={() => onRemove(idx)}
                        aria-label="Удалить контакт"
                        className="p-1.5 rounded-lg text-[var(--color-danger)] hover:bg-[var(--color-danger)]/10 transition-colors"
                    >
                        <Trash2 size={15}/>
                    </button>)}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {field('name', 'text', 'Иванов Иван Иванович')}
                {field('position', 'text', 'Менеджер по закупкам')}
                {field('phone', 'tel', '+77001234567')}
                {field('email', 'email', 'contact@company.kz')}
            </div>
        </div>);
};

// ── Main component ─────────────────────────────────────────────────────────────

const CompleteRegistration = () => {
    const {user, logout, checkAuth} = useAuthStore();
    const {t} = useLanguage();
    const navigate = useNavigate();

    const STEPS = [{id: 1, label: t('completeReg.step1Title'), icon: Building2}, {
        id: 2,
        label: t('completeReg.step2Title'),
        icon: Phone
    }, {id: 3, label: t('completeReg.step3Title'), icon: ShieldCheck},];

    const FILE_FIELDS = FILE_KEYS.map(f => ({...f, label: t(f.tKey)}));

    const contactLabels = {
        name: t('completeReg.fullName'),
        position: t('completeReg.position'),
        phone: t('completeReg.phone'),
        email: t('completeReg.email'),
    };

    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [touched, setTouched] = useState(false);

    const [form, setForm] = useState({org_type: '', legal_address: '', director_name: ''});
    const [files, setFiles] = useState({
        registration_certificate: null,
        tax_clearance: null,
        director_id_doc: null,
        director_appointment_order: null,
        company_charter: null,
    });

    const [director, setDirector] = useState({phone: '', email: ''});
    const [contacts, setContacts] = useState([newContact()]);
    const [step2Errs, setStep2Errs] = useState(null);

    const [agreed, setAgreed] = useState({privacy: false, disclaimer: false});
    const step3Valid = agreed.privacy && agreed.disclaimer;

    const step1TextOk = !!form.org_type && !!form.legal_address.trim() && !!form.director_name.trim();
    const step1FilesOk = FILE_FIELDS.every(f => !!files[f.key]);
    const step1Valid = step1TextOk && step1FilesOk;

    const setField = (f, v) => setForm(p => ({...p, [f]: v}));
    const onFileSelect = (n, f) => setFiles(p => ({...p, [n]: f}));
    const onFileRemove = (n) => setFiles(p => ({...p, [n]: null}));

    const setDirField = (f, v) => {
        setDirector(p => ({...p, [f]: v}));
        if (step2Errs) setStep2Errs(p => ({...p, director: {...p?.director, [f]: null}}));
    };

    const onContactChange = (idx, key, val) => {
        setContacts(p => p.map((c, i) => i === idx ? {...c, [key]: val} : c));
        if (step2Errs) setStep2Errs(p => {
            const ca = [...(p?.contacts ?? [])];
            if (ca[idx]) ca[idx] = {...ca[idx], [key]: null};
            return {...p, contacts: ca};
        });
    };

    const addContact = () => setContacts(p => [...p, newContact()]);
    const removeContact = (idx) => setContacts(p => p.filter((_, i) => i !== idx));

    const handleNext = () => {
        setTouched(true);
        if (step1Valid) {
            setStep(2);
            setTouched(false);
        }
    };
    const handleBack = () => setStep(s => s - 1);

    const buildStep2Errors = () => {
        const errs = {director: {}, contacts: []};
        let hasErr = false;

        const dPhone = phoneError(director.phone, t);
        const dEmail = emailError(director.email, t);
        if (dPhone) {
            errs.director.phone = dPhone;
            hasErr = true;
        }
        if (dEmail) {
            errs.director.email = dEmail;
            hasErr = true;
        }

        contacts.forEach(c => {
            const ce = {
                name: requiredError(c.name, t),
                position: requiredError(c.position, t),
                phone: phoneError(c.phone, t),
                email: emailError(c.email, t),
            };
            errs.contacts.push(ce);
            if (Object.values(ce).some(Boolean)) hasErr = true;
        });

        return hasErr ? errs : null;
    };

    const handleStep2Next = (e) => {
        e.preventDefault();
        const errs = buildStep2Errors();
        setStep2Errs(errs);
        if (!errs) setStep(3);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!step3Valid) return;

        setLoading(true);
        try {
            // 1. Organization profile
            await apiClient.put('/organization/profile', {
                company_type: form.org_type,
                legal_address: form.legal_address,
                director_name: form.director_name,
                director_phone: director.phone,
                director_email: director.email,
            });

            // 2. Contact persons — role field required by backend
            for (const c of contacts) {
                await apiClient.post('/organization/employees', {
                    full_name: c.name, position: c.position, phone: c.phone, email: c.email, role: 'contact_person',
                });
            }

            // 3. Documents (base64)
            for (const {key} of FILE_FIELDS) {
                const file = files[key];
                if (!file) continue;
                const file_data = await toBase64(file);
                await apiClient.post('/documents/upload', {
                    document_type: key, file_data, filename: file.name,
                });
            }

            await checkAuth();
            toast.success(t('completeReg.successMessage'));
            setTimeout(() => {
                window.location.href = '/';
            }, 500);
        } catch (error) {
            toast.error(parseApiError(error, 'Ошибка при сохранении данных'));
        } finally {
            setLoading(false);
        }
    };

    const inputErr = (ok) => `h-11${(!ok && touched) ? ' cr-input-err' : ''}`;
    const dirErr = step2Errs?.director ?? {};

    // ── Shared button styles ────────────────────────────────────────────────────
    const btnBack = `inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl border border-[var(--color-border)]
    text-sm font-medium text-[var(--color-text-secondary)]
    hover:bg-[var(--color-bg-muted)] transition-colors
    disabled:opacity-50 disabled:cursor-not-allowed`;

    const btnSubmit = `inline-flex items-center justify-center gap-2 px-8 py-2.5 rounded-xl
    bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)]
    text-white text-sm font-semibold transition-colors
    disabled:opacity-50 disabled:cursor-not-allowed`;

    // ── Render ─────────────────────────────────────────────────────────────────
    return (<div className="min-h-screen bg-[var(--color-bg-subtle)] py-10 px-4 flex flex-col items-center">
            <div className="w-full max-w-4xl space-y-8">

                {/* Progress stepper */}
                <div className="cr-progress">
                    {STEPS.map((s, i) => {
                        const done = step > s.id;
                        const active = step === s.id;
                        const Icon = s.icon;
                        return (<React.Fragment key={s.id}>
                                <div className="cr-step">
                                    <div
                                        className={`cr-step-circle ${active ? 'cr-step-active' : done ? 'cr-step-done' : 'cr-step-idle'}`}>
                                        {done ? <CheckCircle2 size={18}/> : <Icon size={18}/>}
                                    </div>
                                    <div className="cr-step-meta">
                    <span className="cr-step-num">
                      {t('completeReg.stepOf')
                          .replace('{current}', s.id)
                          .replace('{total}', STEPS.length)}
                    </span>
                                        <span
                                            className={`cr-step-label${active ? ' cr-step-label-active' : ''}`}>{s.label}</span>
                                    </div>
                                </div>
                                {i < STEPS.length - 1 && (
                                    <div className={`cr-connector${done ? ' cr-connector-done' : ''}`}/>)}
                            </React.Fragment>);
                    })}
                </div>

                {/* Main card */}
                <div className="bg-[var(--color-bg-surface)] rounded-2xl shadow-lg border border-[var(--color-border)]">
                    <div className="p-8 md:p-10">

                        {/* Heading */}
                        <div className="mb-8">
                            <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
                                {step === 1 ? t('completeReg.step1Title') : step === 2 ? t('completeReg.step2Title') : t('completeReg.step3Title')}
                            </h1>
                            <p className="text-sm text-[var(--color-text-muted)] mt-1.5">
                                {step === 1 ? t('completeReg.step1Subtitle') : step === 2 ? t('completeReg.step2Subtitle') : t('completeReg.consentSubtitle')}
                            </p>
                        </div>

                        {/* ── STEP 1 ──────────────────────────────────────────────────── */}
                        {step === 1 && (<div className="space-y-6">
                                {/* Company type + Director name */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="flex flex-col gap-1.5">
                                        <Label htmlFor="org_type"
                                               className="text-sm font-medium text-[var(--color-text-secondary)]">
                                            {t('completeReg.companyType')} <span
                                            className="text-[var(--color-danger)]">*</span>
                                        </Label>
                                        <Select value={form.org_type} onValueChange={v => setField('org_type', v)}>
                                            <SelectTrigger
                                                className={`h-11${(!form.org_type && touched) ? ' cr-input-err' : ''}`}>
                                                <SelectValue placeholder="Выберите тип"/>
                                            </SelectTrigger>
                                            <SelectContent>
                                                {ORG_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                        {!form.org_type && touched &&
                                            <p className="cr-err">{t('completeReg.requiredField')}</p>}
                                    </div>

                                    <div className="flex flex-col gap-1.5">
                                        <Label htmlFor="director_name"
                                               className="text-sm font-medium text-[var(--color-text-secondary)]">
                                            {t('completeReg.directorName')} <span
                                            className="text-[var(--color-danger)]">*</span>
                                        </Label>
                                        <Input
                                            id="director_name"
                                            className={inputErr(form.director_name.trim())}
                                            placeholder="Иванов Иван Иванович"
                                            value={form.director_name}
                                            onChange={e => setField('director_name', e.target.value)}
                                        />
                                        {!form.director_name.trim() && touched &&
                                            <p className="cr-err">{t('completeReg.requiredField')}</p>}
                                    </div>
                                </div>

                                {/* Legal address — full width */}
                                <div className="flex flex-col gap-1.5">
                                    <Label htmlFor="legal_address"
                                           className="text-sm font-medium text-[var(--color-text-secondary)]">
                                        {t('completeReg.legalAddress')} <span
                                        className="text-[var(--color-danger)]">*</span>
                                    </Label>
                                    <Input
                                        id="legal_address"
                                        className={inputErr(form.legal_address.trim())}
                                        placeholder="г. Алматы, ул. Примерная, 1"
                                        value={form.legal_address}
                                        onChange={e => setField('legal_address', e.target.value)}
                                    />
                                    {!form.legal_address.trim() && touched &&
                                        <p className="cr-err">{t('completeReg.requiredField')}</p>}
                                </div>

                                {/* Section divider */}
                                <div className="cr-section-divider"><span>{t('completeReg.docsSection')}</span></div>

                                {/* File uploads */}
                                <div className="space-y-3">
                                    {FILE_FIELDS.map(f => (<FileUploadField
                                            key={f.key}
                                            name={f.key}
                                            label={f.label}
                                            file={files[f.key]}
                                            onSelect={onFileSelect}
                                            onRemove={onFileRemove}
                                            hasError={!files[f.key] && touched}
                                        />))}
                                </div>

                                {touched && !step1Valid && (
                                    <p className="cr-err">{t('completeReg.allFieldsRequired')}</p>)}

                                {/* Next button — full width */}
                                <button
                                    type="button"
                                    onClick={handleNext}
                                    className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-colors
                    ${step1Valid ? 'bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white cursor-pointer' : 'bg-[var(--color-bg-muted)] text-[var(--color-text-placeholder)] cursor-not-allowed'}`}
                                >
                                    {t('completeReg.next')} <ChevronRight size={18}/>
                                </button>
                            </div>)}

                        {/* ── STEP 2 ──────────────────────────────────────────────────── */}
                        {step === 2 && (<form onSubmit={handleStep2Next} className="space-y-6" noValidate>

                                {/* Director contacts */}
                                <div
                                    className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)] p-6 space-y-4">
                                    <h2 className="text-base font-semibold text-[var(--color-text-dark)]">
                                        {t('completeReg.directorContacts')}
                                    </h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="flex flex-col gap-1.5">
                                            <Label htmlFor="dir-phone"
                                                   className="text-sm font-medium text-[var(--color-text-secondary)]">
                                                {t('completeReg.directorPhone')} <span
                                                className="text-[var(--color-danger)]">*</span>
                                            </Label>
                                            <Input
                                                id="dir-phone"
                                                type="tel"
                                                className={`h-11${dirErr.phone ? ' cr-input-err' : ''}`}
                                                placeholder="+77001234567"
                                                value={director.phone}
                                                onChange={e => setDirField('phone', e.target.value)}
                                            />
                                            {dirErr.phone && <p className="cr-err">{dirErr.phone}</p>}
                                        </div>

                                        <div className="flex flex-col gap-1.5">
                                            <Label htmlFor="dir-email"
                                                   className="text-sm font-medium text-[var(--color-text-secondary)]">
                                                {t('completeReg.directorEmail')} <span
                                                className="text-[var(--color-danger)]">*</span>
                                            </Label>
                                            <Input
                                                id="dir-email"
                                                type="email"
                                                className={`h-11${dirErr.email ? ' cr-input-err' : ''}`}
                                                placeholder="director@company.kz"
                                                value={director.email}
                                                onChange={e => setDirField('email', e.target.value)}
                                            />
                                            {dirErr.email && <p className="cr-err">{dirErr.email}</p>}
                                        </div>
                                    </div>
                                </div>

                                {/* Contact persons */}
                                <div
                                    className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)] p-6 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h2 className="text-base font-semibold text-[var(--color-text-dark)]">
                                            {t('completeReg.contactPersons')}
                                        </h2>
                                        <button
                                            type="button"
                                            onClick={addContact}
                                            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg
                        border border-[var(--color-primary-border)] bg-[var(--color-primary-bg)]
                        text-sm font-medium text-[var(--color-primary)]
                        hover:bg-[var(--color-primary)]/10 transition-colors"
                                        >
                                            <Plus size={14}/>
                                            {t('completeReg.addContact')}
                                        </button>
                                    </div>
                                    <div className="space-y-4">
                                        {contacts.map((c, idx) => (<ContactCard
                                                key={c.id}
                                                idx={idx}
                                                contact={c}
                                                errs={step2Errs?.contacts?.[idx] ?? {}}
                                                onChange={onContactChange}
                                                onRemove={removeContact}
                                                canRemove={contacts.length > 1}
                                                labels={contactLabels}
                                                contactLabel={t('completeReg.contactPersons')}
                                            />))}
                                    </div>
                                </div>

                                {/* Nav buttons */}
                                <div className="flex items-center justify-between gap-4 pt-2">
                                    <button type="button" className={btnBack} onClick={handleBack} disabled={loading}>
                                        <ChevronLeft size={18}/> {t('completeReg.back')}
                                    </button>
                                    <button type="submit" className={btnSubmit}>
                                        {t('completeReg.next')} <ChevronRight size={18}/>
                                    </button>
                                </div>
                            </form>)}

                        {/* ── STEP 3 ──────────────────────────────────────────────────── */}
                        {step === 3 && (<form onSubmit={handleSubmit} className="space-y-6" noValidate>

                                {/* Privacy policy */}
                                <div
                                    className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)] p-6 space-y-4">
                                    <h2 className="text-base font-semibold text-[var(--color-text-dark)]">
                                        {t('completeReg.privacyTitle')}
                                    </h2>
                                    <div className="cr-legal-scroll">
                                        <p>Настоящая Политика конфиденциальности определяет порядок обработки и защиты
                                            персональных данных пользователей электронной платформы HubContract,
                                            предназначенной для проведения электронных государственных и коммерческих
                                            закупок.</p>
                                        <p>Администратор Платформы уважает конфиденциальность всех пользователей и
                                            обязуется защищать их персональные данные в соответствии с законодательством
                                            Республики Казахстан, включая Закон РК «О персональных данных и их
                                            защите».</p>
                                        <p><strong>Собираемые данные:</strong> При регистрации и использовании Платформы
                                            собираются следующие данные: ФИО, ИИН/БИН, адрес электронной почты, номер
                                            телефона, юридический адрес, контактные данные представителя, банковские
                                            реквизиты, технические данные (IP-адрес, тип браузера), а также загружаемые
                                            документы (лицензии, сертификаты, банковские гарантии).</p>
                                        <p><strong>Цели обработки:</strong> Данные используются для идентификации
                                            пользователей, проведения закупочных процедур, верификации участников,
                                            формирования договоров, направления уведомлений и обеспечения безопасности
                                            Платформы.</p>
                                        <p><strong>Срок хранения:</strong> Персональные данные хранятся в течение 5 лет
                                            с момента последней активности, если иное не предусмотрено законодательством
                                            РК.</p>
                                        <p><strong>Права пользователя:</strong> Вы вправе запросить доступ к своим
                                            данным, потребовать их исправления или удаления, отозвать согласие на
                                            обработку, а также обратиться с жалобой в уполномоченный орган по защите
                                            персональных данных.</p>
                                        <p><strong>Передача третьим лицам:</strong> Данные не передаются третьим лицам
                                            без вашего согласия, за исключением случаев, предусмотренных
                                            законодательством РК или необходимых для исполнения договорных обязательств.
                                        </p>
                                    </div>
                                    <label className="cr-agree-row">
                                        <input
                                            type="checkbox"
                                            className="cr-agree-check"
                                            checked={agreed.privacy}
                                            onChange={e => setAgreed(p => ({...p, privacy: e.target.checked}))}
                                        />
                                        <span>{t('completeReg.privacyAgree')}</span>
                                    </label>
                                </div>

                                {/* Disclaimer */}
                                <div
                                    className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)] p-6 space-y-4">
                                    <h2 className="text-base font-semibold text-[var(--color-text-dark)]">
                                        {t('completeReg.disclaimerTitle')}
                                    </h2>
                                    <div className="cr-legal-scroll">
                                        <p>Настоящий документ определяет ограничения ответственности оператора
                                            электронной платформы HubContract при использовании сервиса
                                            пользователями.</p>
                                        <p><strong>Информация на Платформе:</strong> Администратор Платформы не несёт
                                            ответственности за точность, полноту и актуальность информации, размещаемой
                                            пользователями; содержание тендерной документации, предоставленной
                                            заказчиками; качество товаров/работ/услуг, указанных в заявках поставщиков;
                                            подлинность документов, загруженных пользователями.</p>
                                        <p><strong>Технические аспекты:</strong> Администратор не гарантирует
                                            бесперебойную работу Платформы 24/7, отсутствие ошибок в программном
                                            обеспечении, совместимость со всеми устройствами и браузерами, абсолютную
                                            защиту от кибератак.</p>
                                        <p><strong>Финансовые риски:</strong> Платформа является инструментом для
                                            проведения закупочных процедур. Все финансовые решения принимаются
                                            участниками самостоятельно. Администратор не несёт ответственности за
                                            финансовые потери, возникшие в результате использования Платформы.</p>
                                        <p><strong>Форс-мажор:</strong> Администратор освобождается от ответственности
                                            за нарушение условий обслуживания вследствие обстоятельств непреодолимой
                                            силы (стихийные бедствия, действия государственных органов, сбои в работе
                                            интернет-провайдеров).</p>
                                        <p><strong>Ограничение ответственности:</strong> В максимально допустимой
                                            законом мере совокупная ответственность Администратора перед пользователем
                                            не может превышать сумму комиссионного вознаграждения, уплаченного
                                            пользователем за последние 12 месяцев.</p>
                                    </div>
                                    <label className="cr-agree-row">
                                        <input
                                            type="checkbox"
                                            className="cr-agree-check"
                                            checked={agreed.disclaimer}
                                            onChange={e => setAgreed(p => ({...p, disclaimer: e.target.checked}))}
                                        />
                                        <span>{t('completeReg.disclaimerAgree')}</span>
                                    </label>
                                </div>

                                {/* Nav buttons */}
                                <div className="flex items-center justify-between gap-4 pt-2">
                                    <button type="button" className={btnBack} onClick={handleBack} disabled={loading}>
                                        <ChevronLeft size={18}/> {t('completeReg.back')}
                                    </button>
                                    <button
                                        type="submit"
                                        className={btnSubmit}
                                        disabled={loading || !step3Valid}
                                        style={{
                                            opacity: step3Valid ? 1 : 0.5,
                                            cursor: step3Valid ? 'pointer' : 'not-allowed'
                                        }}
                                    >
                                        {loading ? <><Loader2 size={16}
                                                              className="cr-spin"/> {t('completeReg.submit')}…</> : t('completeReg.submit')}
                                    </button>
                                </div>
                            </form>)}

                    </div>
                </div>

                {/* Exit footer */}
                <div className="flex items-center justify-center gap-4 pb-4">
                    <button
                        type="button"
                        className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] transition-colors"
                        onClick={() => navigate(-1)}
                    >
                        ← {t('completeReg.back')}
                    </button>
                    <span className="w-px h-4 bg-[var(--color-border)]"/>
                    <button
                        type="button"
                        className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] transition-colors"
                        onClick={() => {
                            logout();
                            navigate('/registration');
                        }}
                    >
                        {t('completeReg.tryAnotherEmail')}
                    </button>
                </div>

            </div>
        </div>);
};

export default CompleteRegistration;
