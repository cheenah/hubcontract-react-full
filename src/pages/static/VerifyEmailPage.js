import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import useAuthStore from '@/store/authStore';
import { BASE_URL as API } from '@/services/api';
import { parseApiError } from '@/utils/apiError';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ShieldCheck, Mail } from 'lucide-react';
import ResendOtpButton from '@/components/ResendOtpButton';

const VerifyEmailPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setUser } = useAuthStore();

  const emailFromUrl = searchParams.get('email') || '';

  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

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

      if (response.data.user?.onboarding_completed === false) {
        navigate('/complete-registration');
      } else {
        const role = response.data.user?.role;
        if (role === 'admin') navigate('/admin');
        else if (role === 'contractor') navigate('/contractor/dashboard');
        else navigate('/customer/dashboard');
      }
    } catch (error) {
      const status = error.response?.status;
      const detail = error.response?.data?.detail;
      if (status === 410) {
        toast.error('Код истёк. Запросите новый.', { duration: 5000 });
      } else {
        toast.error(parseApiError(error, 'Неверный или устаревший код'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="vep-root">
      <div className="vep-card">

        <div className="vep-icon-wrap">
          <div className="vep-icon-bg">
            <ShieldCheck size={32} color="var(--color-primary)" />
          </div>
        </div>

        <h1 className="vep-title">Подтверждение email</h1>

        <div className="vep-info-box">
          <Mail size={16} className="vep-info-icon" />
          <p className="vep-info-text">
            Мы отправили 6-значный код на{' '}
            <strong>{emailFromUrl || 'ваш email'}</strong> для подтверждения
            регистрации в <strong>HubContract</strong>. Проверьте папку «Входящие»
            и «Спам».
          </p>
        </div>

        <form onSubmit={handleVerify} className="vep-form">
          <div className="vep-field">
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
              className="vep-code-input"
            />
            <span className="vep-code-hint">{code.length}/6</span>
          </div>

          <Button
            type="submit"
            disabled={loading || code.length < 6}
            className="vep-submit-btn"
          >
            {loading ? 'Проверяем…' : 'Подтвердить'}
          </Button>
        </form>

        <div className="vep-divider">
          <span className="vep-divider-text">Не получили письмо?</span>
        </div>

        <ResendOtpButton
          email={emailFromUrl}
          autoStart={true}
          onResent={() => setCode('')}
        />

        <button
          type="button"
          onClick={() => navigate('/')}
          className="vep-back-btn"
        >
          ← На главную
        </button>
      </div>

      <style>{`
        .vep-root {
          min-height: 100vh;
          background: linear-gradient(135deg, var(--color-primary-bg) 0%, var(--color-bg-subtle) 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: var(--space-6) var(--space-4);
        }
        .vep-card {
          background: var(--color-bg-surface);
          border-radius: var(--radius-4xl);
          box-shadow: var(--shadow-card-hover);
          padding: var(--space-10) 36px;
          width: 100%;
          max-width: 440px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0;
        }
        .vep-icon-wrap {
          margin-bottom: var(--space-5);
        }
        .vep-icon-bg {
          width: 68px;
          height: 68px;
          border-radius: var(--radius-2xl);
          background: var(--color-primary-bg);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .vep-title {
          font-size: var(--font-size-3xl);
          font-weight: var(--font-weight-bold);
          color: var(--color-text-primary);
          margin-bottom: var(--space-4);
          text-align: center;
        }
        .vep-info-box {
          display: flex;
          gap: var(--space-2-5);
          background: var(--color-primary-bg);
          border: 1px solid var(--color-primary-border);
          border-radius: var(--radius-2xl);
          padding: 14px var(--space-4);
          margin-bottom: var(--space-7);
          width: 100%;
        }
        .vep-info-icon {
          color: var(--color-primary);
          flex-shrink: 0;
          margin-top: 2px;
        }
        .vep-info-text {
          font-size: var(--font-size-base);
          color: var(--color-text-secondary);
          line-height: var(--line-height-relaxed);
          margin: 0;
        }
        .vep-form {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
        }
        .vep-field {
          display: flex;
          flex-direction: column;
          gap: var(--space-1-5);
          margin-bottom: var(--space-2);
          position: relative;
        }
        .vep-code-input {
          font-size: var(--font-size-3xl) !important;
          letter-spacing: 0.4em;
          text-align: center;
          padding: 14px !important;
          height: auto !important;
        }
        .vep-code-hint {
          font-size: var(--font-size-xs);
          color: var(--color-text-placeholder);
          text-align: right;
        }
        .vep-submit-btn {
          width: 100%;
          height: 46px;
          font-size: var(--font-size-lg) !important;
          font-weight: var(--font-weight-semibold) !important;
          background: var(--color-primary-gradient) !important;
          color: var(--color-text-inverse) !important;
          border: none !important;
          border-radius: var(--radius-2xl) !important;
          margin-bottom: var(--space-5);
        }
        .vep-divider {
          width: 100%;
          display: flex;
          align-items: center;
          gap: var(--space-3);
          margin-bottom: 14px;
        }
        .vep-divider-text {
          font-size: var(--font-size-sm);
          color: var(--color-text-placeholder);
          white-space: nowrap;
          width: 100%;
          text-align: center;
        }
        .vep-back-btn {
          background: none;
          border: none;
          font-size: var(--font-size-sm);
          color: var(--color-text-placeholder);
          cursor: pointer;
          text-decoration: underline;
          margin-top: var(--space-4);
        }
        .vep-back-btn:hover {
          color: var(--color-text-muted);
        }
      `}</style>
    </div>
  );
};

export default VerifyEmailPage;
