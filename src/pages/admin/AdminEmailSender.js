import React, { useState, useRef, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { BASE_URL as API } from '@/services/api';
import { parseApiError } from '@/utils/apiError';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Mail, Send, Eye, EyeOff, Loader2,
  Bold, Italic, Underline, List, ListOrdered, Link, Code2, Undo, Redo,
  Paperclip, X, FileText,
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// Конфигурация шаблонов
// ─────────────────────────────────────────────────────────────────────────────

const EMAIL_TEMPLATES = [
  {
    id: 'otp_email',
    label: 'OTP / Код подтверждения',
    fields: [
      { key: 'code',            label: 'Код OTP',       type: 'text', placeholder: '123456' },
      { key: 'subject_context', label: 'Контекст темы', type: 'text', placeholder: 'входа в систему' },
    ],
  },
  {
    id: 'password_reset',
    label: 'Сброс пароля',
    fields: [
      { key: 'user_name',  label: 'Имя пользователя', type: 'text' },
      { key: 'reset_link', label: 'Ссылка сброса',    type: 'text', placeholder: 'https://...' },
    ],
  },
  {
    id: 'bid_submitted',
    label: 'Заявка подана (подрядчику)',
    fields: [
      { key: 'contractor_name', label: 'Имя подрядчика',  type: 'text' },
      { key: 'tender_title',    label: 'Название тендера', type: 'text' },
      { key: 'tender_number',   label: 'Номер тендера',   type: 'text' },
    ],
  },
  {
    id: 'bid_won',
    label: 'Заявка выиграна',
    fields: [
      { key: 'contractor_name', label: 'Имя подрядчика',  type: 'text' },
      { key: 'tender_title',    label: 'Название тендера', type: 'text' },
      { key: 'tender_number',   label: 'Номер тендера',   type: 'text' },
    ],
  },
  {
    id: 'bid_rejected',
    label: 'Заявка отклонена',
    fields: [
      { key: 'contractor_name', label: 'Имя подрядчика',  type: 'text' },
      { key: 'tender_title',    label: 'Название тендера', type: 'text' },
      { key: 'tender_number',   label: 'Номер тендера',   type: 'text' },
    ],
  },
  {
    id: 'new_bid_for_customer',
    label: 'Новая заявка (заказчику)',
    fields: [
      { key: 'customer_name',   label: 'Имя заказчика',   type: 'text' },
      { key: 'tender_title',    label: 'Название тендера', type: 'text' },
      { key: 'tender_number',   label: 'Номер тендера',   type: 'text' },
      { key: 'contractor_name', label: 'Имя подрядчика',  type: 'text' },
    ],
  },
  {
    id: 'contract_ready',
    label: 'Договор готов',
    fields: [
      { key: 'user_name',       label: 'Имя пользователя', type: 'text' },
      { key: 'tender_title',    label: 'Название тендера',  type: 'text' },
      { key: 'contract_number', label: 'Номер договора',    type: 'text' },
      {
        key: 'role', label: 'Роль', type: 'select',
        options: [
          { value: 'contractor', label: 'Подрядчик' },
          { value: 'customer',   label: 'Заказчик' },
        ],
      },
    ],
  },
  {
    id: 'contract_signed',
    label: 'Договор подписан',
    fields: [
      { key: 'user_name',       label: 'Имя пользователя', type: 'text' },
      { key: 'tender_title',    label: 'Название тендера',  type: 'text' },
      { key: 'contract_number', label: 'Номер договора',    type: 'text' },
    ],
  },
  {
    id: 'tender_published',
    label: 'Тендер опубликован',
    fields: [
      { key: 'tender_title',  label: 'Название тендера', type: 'text' },
      { key: 'tender_number', label: 'Номер тендера',    type: 'text' },
      { key: 'deadline',      label: 'Дедлайн',          type: 'text', placeholder: '2025-06-01' },
      { key: 'budget',        label: 'Бюджет',           type: 'text', placeholder: '10 000 000' },
    ],
  },
  {
    id: 'agreement_received',
    label: 'Соглашение получено',
    fields: [
      { key: 'user_name',            label: 'Имя пользователя', type: 'text' },
      { key: 'agreement_type_label', label: 'Тип соглашения',   type: 'text' },
      { key: 'filename',             label: 'Имя файла',        type: 'text' },
    ],
  },
  {
    id: 'agreement_approved',
    label: 'Соглашение одобрено',
    fields: [
      { key: 'user_name',            label: 'Имя пользователя', type: 'text' },
      { key: 'agreement_type_label', label: 'Тип соглашения',   type: 'text' },
    ],
  },
  {
    id: 'agreement_rejected',
    label: 'Соглашение отклонено',
    fields: [
      { key: 'user_name',            label: 'Имя пользователя', type: 'text' },
      { key: 'agreement_type_label', label: 'Тип соглашения',   type: 'text' },
      { key: 'reason',               label: 'Причина',          type: 'text' },
    ],
  },
  {
    id: 'admin_new_agreement',
    label: 'Новое соглашение (администратору)',
    fields: [
      { key: 'user_name',            label: 'Имя пользователя',  type: 'text' },
      { key: 'user_email',           label: 'Email пользователя', type: 'text' },
      { key: 'agreement_type_label', label: 'Тип соглашения',    type: 'text' },
      { key: 'filename',             label: 'Имя файла',         type: 'text' },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Визуальный редактор (contenteditable + toolbar)
// ─────────────────────────────────────────────────────────────────────────────

const TOOLBAR = [
  { cmd: 'bold',          Icon: Bold,         title: 'Жирный' },
  { cmd: 'italic',        Icon: Italic,       title: 'Курсив' },
  { cmd: 'underline',     Icon: Underline,    title: 'Подчёркнутый' },
  null, // divider
  { cmd: 'insertUnorderedList', Icon: List,          title: 'Маркированный список' },
  { cmd: 'insertOrderedList',   Icon: ListOrdered,   title: 'Нумерованный список' },
  null,
  { cmd: 'createLink',    Icon: Link,         title: 'Ссылка' },
  null,
  { cmd: 'undo',          Icon: Undo,         title: 'Отменить' },
  { cmd: 'redo',          Icon: Redo,         title: 'Повторить' },
];

const RichEditor = ({ onChange }) => {
  const editorRef = useRef(null);

  const exec = useCallback((cmd) => {
    if (cmd === 'createLink') {
      const url = prompt('Введите URL ссылки:', 'https://');
      if (url) document.execCommand('createLink', false, url);
    } else {
      document.execCommand(cmd, false, null);
    }
    editorRef.current?.focus();
    onChange(editorRef.current?.innerHTML || '');
  }, [onChange]);

  return (
    <div style={{
      border: '1px solid var(--color-border-medium)',
      borderRadius: 'var(--radius-lg)',
      overflow: 'hidden',
    }}>
      {/* Toolbar */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 2,
        padding: '6px 8px',
        borderBottom: '1px solid var(--color-border-light)',
        background: 'var(--color-bg-warm)',
      }}>
        {TOOLBAR.map((item, idx) =>
          item === null ? (
            <div key={idx} style={{
              width: 1, height: 20, background: 'var(--color-border-medium)',
              margin: '4px 4px',
              alignSelf: 'center',
            }} />
          ) : (
            <button
              key={item.cmd}
              type="button"
              title={item.title}
              onMouseDown={(e) => { e.preventDefault(); exec(item.cmd); }}
              style={{
                padding: '4px 7px',
                background: 'none',
                border: 'none',
                borderRadius: 6,
                cursor: 'pointer',
                color: 'var(--color-text-dark)',
                display: 'flex',
                alignItems: 'center',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-border-light)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
            >
              <item.Icon size={15} />
            </button>
          )
        )}
      </div>

      {/* Editable area */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={() => onChange(editorRef.current?.innerHTML || '')}
        data-placeholder="Введите текст письма..."
        style={{
          minHeight: 220,
          padding: '14px 16px',
          outline: 'none',
          fontSize: 'var(--font-size-base)',
          lineHeight: 1.7,
          color: 'var(--color-text-dark)',
          background: 'white',
        }}
      />

      <style>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: var(--color-text-placeholder);
          pointer-events: none;
        }
        [contenteditable] a { color: var(--color-primary); text-decoration: underline; }
        [contenteditable] ul { list-style: disc; padding-left: 20px; }
        [contenteditable] ol { list-style: decimal; padding-left: 20px; }
      `}</style>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Вспомогательные утилиты
// ─────────────────────────────────────────────────────────────────────────────

const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
const buildEmptyArgs = (tpl) =>
  tpl ? Object.fromEntries(tpl.fields.map((f) => [f.key, ''])) : {};

// ─────────────────────────────────────────────────────────────────────────────
// Главный компонент
// ─────────────────────────────────────────────────────────────────────────────

const AdminEmailSender = () => {

  // Common
  const [email,   setEmail]   = useState('');
  const [subject, setSubject] = useState('');
  const [sending, setSending] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [activeTab, setActiveTab] = useState('template');

  // Template mode
  const [templateId, setTemplateId] = useState('');
  const [args,       setArgs]       = useState({});

  // Raw HTML mode
  const [rawHtml, setRawHtml] = useState('');

  // Visual editor mode
  const [richHtml, setRichHtml] = useState('');

  // Attachments
  const [attachments, setAttachments] = useState([]);
  const [dragOver, setDragOver]       = useState(false);

  // ── Template helpers ──────────────────────────────────────────────────────

  const selectedTemplate = EMAIL_TEMPLATES.find((t) => t.id === templateId) || null;

  const handleTemplateChange = (id) => {
    setTemplateId(id);
    setArgs(buildEmptyArgs(EMAIL_TEMPLATES.find((t) => t.id === id)));
    setShowPreview(false);
  };

  const missingTemplateFields = selectedTemplate
    ? selectedTemplate.fields.filter((f) => !args[f.key]?.trim())
    : [];

  // ── Validation per tab ────────────────────────────────────────────────────

  const emailOk = isValidEmail(email);

  const canSend = emailOk && (() => {
    if (activeTab === 'template') return selectedTemplate && missingTemplateFields.length === 0;
    if (activeTab === 'raw')     return subject.trim() && rawHtml.trim();
    if (activeTab === 'editor')  return subject.trim() && richHtml.replace(/<[^>]+>/g, '').trim();
    return false;
  })();

  // ── Attachment helpers ────────────────────────────────────────────────────

  const addFiles = (fileList) => {
    const incoming = Array.from(fileList);
    setAttachments((prev) => {
      const existing = new Set(prev.map((f) => `${f.name}|${f.size}`));
      return [...prev, ...incoming.filter((f) => !existing.has(`${f.name}|${f.size}`))];
    });
  };

  const removeAttachment = (idx) =>
    setAttachments((prev) => prev.filter((_, i) => i !== idx));

  // ── Build payload ─────────────────────────────────────────────────────────

  const buildPayload = () => {
    if (activeTab === 'template') {
      return { mode: 'template', email, template: templateId, variables: args };
    }
    if (activeTab === 'raw') {
      return { mode: 'raw_html', email, subject, html: rawHtml };
    }
    return { mode: 'rich_text', email, subject, html: richHtml };
  };

  // ── Send ──────────────────────────────────────────────────────────────────

  const handleSend = async () => {
    if (!canSend) return;
    setSending(true);
    try {
      if (attachments.length > 0) {
        const fd = new FormData();
        fd.append('payload', JSON.stringify(buildPayload()));
        attachments.forEach((f) => fd.append('files', f));
        await axios.post(`${API}/admin/send-email`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        await axios.post(`${API}/admin/send-email`, buildPayload());
      }
      toast.success(`Письмо отправлено на ${email}`);
      setEmail(''); setSubject(''); setTemplateId('');
      setArgs({}); setRawHtml(''); setRichHtml('');
      setAttachments([]);
      setShowPreview(false);
    } catch (err) {
      toast.error(parseApiError(err, 'Ошибка отправки письма'));
    } finally {
      setSending(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div style={{ maxWidth: 780, margin: '0 auto', padding: '32px 24px', display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* Заголовок */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 10,
          background: 'var(--color-primary-bg)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <Mail size={20} style={{ color: 'var(--color-primary)' }} />
        </div>
        <div>
          <h1 style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 'var(--font-weight-bold)', margin: 0 }}>
            Отправка Email
          </h1>
          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', margin: 0 }}>
            Транзакционные письма, кастомный HTML и визуальный редактор
          </p>
        </div>
      </div>

      {/* Основная карточка */}
      <Card style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Поле email — всегда видно */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <Label htmlFor="recipient-email">Кому (Email получателя)</Label>
          <Input
            id="recipient-email"
            type="email"
            placeholder="user@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={email && !emailOk ? { borderColor: 'var(--color-danger)' } : {}}
          />
          {email && !emailOk && (
            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-danger)' }}>
              Введите корректный email
            </span>
          )}
        </div>

        {/* Тема — для raw и editor */}
        {(activeTab === 'raw' || activeTab === 'editor') && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <Label htmlFor="email-subject">Тема письма</Label>
            <Input
              id="email-subject"
              placeholder="Уведомление от HubContract"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); setShowPreview(false); }}>
          <TabsList style={{ width: '100%', marginBottom: 4 }}>
            <TabsTrigger value="template" style={{ flex: 1 }}>Готовые шаблоны</TabsTrigger>
            <TabsTrigger value="editor"   style={{ flex: 1 }}>Визуальный редактор</TabsTrigger>
            <TabsTrigger value="raw"      style={{ flex: 1 }}>Свой HTML</TabsTrigger>
          </TabsList>

          {/* ── Tab 1: Готовые шаблоны ── */}
          <TabsContent value="template" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <Label>Шаблон письма</Label>
              <Select value={templateId} onValueChange={handleTemplateChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите шаблон..." />
                </SelectTrigger>
                <SelectContent>
                  {EMAIL_TEMPLATES.map((tpl) => (
                    <SelectItem key={tpl.id} value={tpl.id}>{tpl.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedTemplate && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <p style={{
                  fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-semibold)',
                  textTransform: 'uppercase', letterSpacing: '0.06em',
                  color: 'var(--color-text-placeholder)', marginBottom: 8,
                }}>
                  Переменные шаблона
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 16px' }}>
                  {selectedTemplate.fields.map((field) => (
                    <div key={field.key} style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                      <Label htmlFor={`arg-${field.key}`}>{field.label}</Label>
                      {field.type === 'select' ? (
                        <Select
                          value={args[field.key] || ''}
                          onValueChange={(v) => setArgs((p) => ({ ...p, [field.key]: v }))}
                        >
                          <SelectTrigger id={`arg-${field.key}`}>
                            <SelectValue placeholder="Выберите..." />
                          </SelectTrigger>
                          <SelectContent>
                            {field.options.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Input
                          id={`arg-${field.key}`}
                          placeholder={field.placeholder || field.label}
                          value={args[field.key] || ''}
                          onChange={(e) => setArgs((p) => ({ ...p, [field.key]: e.target.value }))}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedTemplate && missingTemplateFields.length > 0 && (
              <div style={{
                padding: '10px 14px',
                background: 'rgba(245,158,11,0.08)',
                border: '1px solid rgba(245,158,11,0.3)',
                borderRadius: 'var(--radius-md)',
                fontSize: 'var(--font-size-sm)',
                color: 'var(--color-warning)',
              }}>
                Не заполнены: {missingTemplateFields.map((f) => f.label).join(', ')}
              </div>
            )}
          </TabsContent>

          {/* ── Tab 2: Визуальный редактор ── */}
          <TabsContent value="editor">
            <RichEditor onChange={setRichHtml} />
          </TabsContent>

          {/* ── Tab 3: Свой HTML ── */}
          <TabsContent value="raw">
            <textarea
              placeholder={'<h1>Заголовок</h1>\n<p>Текст письма...</p>'}
              value={rawHtml}
              onChange={(e) => setRawHtml(e.target.value)}
              spellCheck={false}
              style={{
                width: '100%',
                minHeight: 240,
                padding: '12px 14px',
                fontFamily: '"Fira Code", "Consolas", monospace',
                fontSize: 13,
                lineHeight: 1.6,
                border: '1px solid var(--color-border-medium)',
                borderRadius: 'var(--radius-lg)',
                resize: 'vertical',
                outline: 'none',
                background: '#1e1e2e',
                color: '#cdd6f4',
                boxSizing: 'border-box',
              }}
            />
            {rawHtml && (
              <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-placeholder)', marginTop: 6 }}>
                {rawHtml.length} символов
              </p>
            )}
          </TabsContent>
        </Tabs>

        {/* ── Вложения ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Paperclip size={14} />
            Вложения {attachments.length > 0 && `(${attachments.length})`}
          </Label>

          {/* Drop zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); addFiles(e.dataTransfer.files); }}
            onClick={() => document.getElementById('email-attach-input').click()}
            style={{
              border: `2px dashed ${dragOver ? 'var(--color-primary)' : 'var(--color-border-medium)'}`,
              borderRadius: 'var(--radius-lg)',
              padding: '14px 16px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              color: dragOver ? 'var(--color-primary)' : 'var(--color-text-muted)',
              fontSize: 'var(--font-size-sm)',
              background: dragOver ? 'var(--color-primary-bg)' : 'transparent',
              transition: 'all var(--transition-fast)',
              userSelect: 'none',
            }}
          >
            <Paperclip size={15} />
            Перетащите файлы сюда или нажмите для выбора
          </div>
          <input
            id="email-attach-input"
            type="file"
            multiple
            style={{ display: 'none' }}
            onChange={(e) => { addFiles(e.target.files); e.target.value = ''; }}
          />

          {/* Chips */}
          {attachments.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {attachments.map((file, i) => (
                <div key={i} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                  padding: '4px 10px 4px 8px',
                  background: 'var(--color-primary-bg)',
                  border: '1px solid var(--color-primary-border)',
                  borderRadius: 'var(--radius-pill)',
                  fontSize: 'var(--font-size-xs)',
                  color: 'var(--color-primary)',
                  maxWidth: 260,
                }}>
                  <FileText size={12} style={{ flexShrink: 0 }} />
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {file.name}
                  </span>
                  <span style={{ color: 'var(--color-text-placeholder)', whiteSpace: 'nowrap' }}>
                    {file.size < 1024 * 1024
                      ? `${(file.size / 1024).toFixed(0)} KB`
                      : `${(file.size / 1024 / 1024).toFixed(1)} MB`}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeAttachment(i)}
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      padding: 0, display: 'flex', alignItems: 'center',
                      color: 'var(--color-text-muted)', flexShrink: 0,
                    }}
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Превью payload */}
        <div>
          <button
            type="button"
            onClick={() => setShowPreview((v) => !v)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', padding: 0,
            }}
          >
            {showPreview ? <EyeOff size={14} /> : <Eye size={14} />}
            {showPreview ? 'Скрыть payload' : 'Показать payload'}
          </button>
          {showPreview && (
            <pre style={{
              marginTop: 10, padding: '12px 16px',
              background: 'var(--color-bg-muted)', border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)', fontSize: 'var(--font-size-xs)',
              color: 'var(--color-text-dark)', overflowX: 'auto', lineHeight: 1.6,
            }}>
              {JSON.stringify(buildPayload(), null, 2)}
            </pre>
          )}
        </div>

        {/* Кнопка отправки */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            onClick={handleSend}
            disabled={!canSend || sending}
            style={{
              background: canSend ? 'var(--color-primary)' : undefined,
              display: 'flex', alignItems: 'center', gap: 8,
            }}
          >
            {sending
              ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
              : <Send size={16} />
            }
            {sending ? 'Отправка...' : 'Отправить письмо'}
          </Button>
        </div>
      </Card>

      {/* Справка по шаблонам */}
      <Card style={{ padding: 24 }}>
        <p style={{
          fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-semibold)',
          textTransform: 'uppercase', letterSpacing: '0.06em',
          color: 'var(--color-text-placeholder)', marginBottom: 14,
        }}>
          Все шаблоны ({EMAIL_TEMPLATES.length})
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {EMAIL_TEMPLATES.map((tpl) => {
            const active = templateId === tpl.id && activeTab === 'template';
            return (
              <div
                key={tpl.id}
                onClick={() => { setActiveTab('template'); handleTemplateChange(tpl.id); }}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '8px 12px', borderRadius: 'var(--radius-md)', cursor: 'pointer',
                  background: active ? 'var(--color-primary-bg)' : 'transparent',
                  border: `1px solid ${active ? 'var(--color-primary-border)' : 'transparent'}`,
                  transition: 'background 0.12s',
                }}
              >
                <div>
                  <span style={{
                    fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)',
                    color: active ? 'var(--color-primary)' : 'var(--color-text-dark)',
                  }}>
                    {tpl.label}
                  </span>
                  <span style={{ marginLeft: 8, fontSize: 'var(--font-size-xs)', color: 'var(--color-text-placeholder)' }}>
                    {tpl.id}
                  </span>
                </div>
                <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-placeholder)' }}>
                  {tpl.fields.length} пол.
                </span>
              </div>
            );
          })}
        </div>
      </Card>

    </div>
  );
};

export default AdminEmailSender;
