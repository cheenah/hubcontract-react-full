import React, { useState, useEffect } from 'react';
import { RefreshCw, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import clsx from 'clsx';
import { resendOtp } from '@/services/otpService';
import useRecaptcha from '@/hooks/useRecaptcha';

const COOLDOWN = 60;

/**
 * Кнопка повторной отправки OTP с таймером.
 * Props:
 *   email       {string}  — адрес для отправки
 *   autoStart   {boolean} — запустить таймер сразу при монтировании (default: true)
 *   onResent    {()=>void} — коллбэк после успешной отправки
 */
const ResendOtpButton = ({ email, autoStart = true, onResent }) => {
  const { getToken } = useRecaptcha();
  const [timer, setTimer] = useState(autoStart ? COOLDOWN : 0);
  const [loading, setLoading] = useState(false);

  const canResend = timer === 0 && !loading;

  useEffect(() => {
    if (timer <= 0) return;
    const id = setInterval(() => setTimer((t) => t - 1), 1000);
    return () => clearInterval(id);
  }, [timer]);

  const handleClick = async () => {
    if (!canResend) return;
    setLoading(true);
    try {
      const captcha_token = await getToken('resend_otp');
      await resendOtp(email, captcha_token);
      setTimer(COOLDOWN);
      toast.success(`Код отправлен на ${email}`);
      onResent?.();
    } catch (error) {
      const status = error.response?.status;
      const detail = error.response?.data?.detail;

      if (status === 429) {
        toast.error('Слишком много попыток. Подождите перед повторной отправкой.', { duration: 6000 });
        setTimer(COOLDOWN);
      } else if (status === 404) {
        toast.error('Email не найден в системе.');
      } else {
        toast.error(detail || 'Не удалось отправить код. Попробуйте позже.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        disabled={!canResend}
        className={clsx('resend-otp-btn', canResend ? 'resend-otp-btn--enabled' : 'resend-otp-btn--disabled')}
      >
        {loading
          ? <Loader2 size={14} className="resend-otp-spinner" />
          : <RefreshCw size={14} />
        }
        {loading
          ? 'Отправляем…'
          : timer > 0
          ? `Повтор через ${String(timer).padStart(2, '0')}с`
          : 'Отправить код ещё раз'}
      </button>

      <style>{`
        .resend-otp-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--space-1-5);
          background: none;
          border: 1px solid var(--color-border);
          border-radius: var(--radius-xl);
          padding: var(--space-2-5) var(--space-5);
          font-size: var(--font-size-base);
          font-weight: var(--font-weight-medium);
          width: 100%;
          transition: background var(--transition-fast), border-color var(--transition-fast);
        }
        .resend-otp-btn--enabled {
          color: var(--color-text-secondary);
          cursor: pointer;
        }
        .resend-otp-btn--enabled:hover {
          background: var(--color-bg-subtle);
        }
        .resend-otp-btn--disabled {
          color: var(--color-text-placeholder);
          cursor: not-allowed;
        }
        @keyframes resend-spin {
          to { transform: rotate(360deg); }
        }
        .resend-otp-spinner {
          animation: resend-spin 1s linear infinite;
        }
      `}</style>
    </>
  );
};

export default ResendOtpButton;
