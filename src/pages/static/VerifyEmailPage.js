import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import { AppContext } from '@/App';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ShieldCheck, Mail, RefreshCw } from 'lucide-react';

const RESEND_COOLDOWN = 60; // секунд

const VerifyEmailPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { API, setUser } = React.useContext(AppContext);

  const emailFromUrl = searchParams.get('email') || '';

  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0); // секунд до разблокировки кнопки

  // ── Таймер обратного отсчёта ─────────────────────────────────────────────
  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(id);
  }, [cooldown]);

  // ── Подтверждение кода ───────────────────────────────────────────────────
  const handleVerify = async (e) => {
    e.preventDefault();
    if (code.length < 6) return;
    setLoading(true);
    try {
      const response = await axios.post(`${API}/auth/verify-registration`, {
        email: emailFromUrl,
        code,
      });
      localStorage.setItem('token', response.data.token);
      if (setUser) setUser(response.data.user);
      toast.success('Email подтверждён! Добро пожаловать.');

      const role = response.data.user?.role;
      if (role === 'admin') navigate('/admin');
      else if (role === 'contractor') navigate('/contractor/dashboard');
      else navigate('/customer/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Неверный или устаревший код');
    } finally {
      setLoading(false);
    }
  };

  // ── Повторная отправка кода ──────────────────────────────────────────────
  const handleResend = async () => {
    if (cooldown > 0 || !emailFromUrl) return;
    setResending(true);
    try {
      await axios.post(`${API}/auth/resend-verification`, { email: emailFromUrl });
      toast.success('Код отправлен повторно');
      setCooldown(RESEND_COOLDOWN);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Не удалось отправить код');
    } finally {
      setResending(false);
    }
  };

  return (
    <div style={styles.root}>
      <div style={styles.card}>

        {/* Иконка */}
        <div style={styles.iconWrap}>
          <div style={styles.iconBg}>
            <ShieldCheck size={32} color="#2563eb" />
          </div>
        </div>

        {/* Заголовок */}
        <h1 style={styles.title}>Подтверждение email</h1>

        {/* Инструкция */}
        <div style={styles.infoBox}>
          <Mail size={16} style={{ color: '#2563eb', flexShrink: 0, marginTop: 2 }} />
          <p style={styles.infoText}>
            Мы отправили 6-значный код на{' '}
            <strong>{emailFromUrl || 'ваш email'}</strong> для подтверждения
            регистрации в <strong>HubContract</strong>. Проверьте папку «Входящие»
            и «Спам».
          </p>
        </div>

        {/* Форма */}
        <form onSubmit={handleVerify} style={styles.form}>
          <div style={styles.field}>
            <Label htmlFor="verify-code">Код подтверждения</Label>
            <Input
              id="verify-code"
              type="text"
              inputMode="numeric"
              pattern="[0-9]{6}"
              maxLength={6}
              placeholder="123456"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              autoFocus
              required
              style={styles.codeInput}
            />
            <span style={styles.codeHint}>{code.length}/6</span>
          </div>

          <Button
            type="submit"
            disabled={loading || code.length < 6}
            style={styles.submitBtn}
          >
            {loading ? 'Проверяем…' : 'Подтвердить'}
          </Button>
        </form>

        {/* Разделитель */}
        <div style={styles.divider}>
          <span style={styles.dividerText}>Не получили письмо?</span>
        </div>

        {/* Повторная отправка */}
        <button
          type="button"
          onClick={handleResend}
          disabled={cooldown > 0 || resending}
          style={{
            ...styles.resendBtn,
            opacity: cooldown > 0 || resending ? 0.5 : 1,
            cursor: cooldown > 0 || resending ? 'not-allowed' : 'pointer',
          }}
        >
          <RefreshCw size={14} style={{ marginRight: 6, flexShrink: 0 }} />
          {cooldown > 0
            ? `Отправить повторно через ${cooldown} с`
            : resending
            ? 'Отправляем…'
            : 'Отправить код повторно'}
        </button>

        {/* Назад */}
        <button
          type="button"
          onClick={() => navigate('/')}
          style={styles.backBtn}
        >
          ← На главную
        </button>
      </div>
    </div>
  );
};

// ── Стили ────────────────────────────────────────────────────────────────────
const styles = {
  root: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #eff6ff 0%, #f8fafc 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px 16px',
  },
  card: {
    background: '#fff',
    borderRadius: 20,
    boxShadow: '0 8px 40px rgba(37,99,235,0.10)',
    padding: '40px 36px',
    width: '100%',
    maxWidth: 440,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 0,
  },
  iconWrap: {
    marginBottom: 20,
  },
  iconBg: {
    width: 68,
    height: 68,
    borderRadius: 18,
    background: '#eff6ff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: '1.5rem',
    fontWeight: 700,
    color: '#111827',
    marginBottom: 16,
    textAlign: 'center',
  },
  infoBox: {
    display: 'flex',
    gap: 10,
    background: '#eff6ff',
    border: '1px solid #bfdbfe',
    borderRadius: 12,
    padding: '14px 16px',
    marginBottom: 28,
    width: '100%',
  },
  infoText: {
    fontSize: '0.875rem',
    color: '#374151',
    lineHeight: 1.6,
    margin: 0,
  },
  form: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    marginBottom: 8,
    position: 'relative',
  },
  codeInput: {
    fontSize: '1.5rem',
    letterSpacing: '0.4em',
    textAlign: 'center',
    padding: '14px',
    height: 'auto',
  },
  codeHint: {
    fontSize: '0.75rem',
    color: '#9ca3af',
    textAlign: 'right',
  },
  submitBtn: {
    width: '100%',
    height: 46,
    fontSize: '1rem',
    fontWeight: 600,
    background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 100%)',
    color: '#fff',
    border: 'none',
    borderRadius: 12,
    marginBottom: 20,
  },
  divider: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  dividerText: {
    fontSize: '0.8rem',
    color: '#9ca3af',
    whiteSpace: 'nowrap',
    width: '100%',
    textAlign: 'center',
  },
  resendBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'none',
    border: '1px solid #e5e7eb',
    borderRadius: 10,
    padding: '10px 20px',
    fontSize: '0.875rem',
    color: '#374151',
    fontWeight: 500,
    width: '100%',
    marginBottom: 16,
    transition: 'background 0.15s',
  },
  backBtn: {
    background: 'none',
    border: 'none',
    fontSize: '0.8rem',
    color: '#9ca3af',
    cursor: 'pointer',
    textDecoration: 'underline',
  },
};

export default VerifyEmailPage;
