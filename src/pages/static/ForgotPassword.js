import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { AppContext } from '@/App';
import { useLanguage } from '@/context/LanguageContext';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import useRecaptcha from '@/hooks/useRecaptcha';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const { API } = React.useContext(AppContext);
  const { t } = useLanguage();
  const { getToken } = useRecaptcha();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      toast.error(t('auth.email'));
      return;
    }

    try {
      setLoading(true);

      const captcha_token = await getToken('forgot_password');
      await axios.post(`${API}/auth/forgot-password`, { email, captcha_token });

      setEmailSent(true);
      toast.success(t('auth.emailSentMessage'));
    } catch (error) {
      const status = error.response?.status;
      const detail = error.response?.data?.detail;
      if (status === 403 && detail?.toLowerCase().includes('скоринг')) {
        toast.error('Система защиты посчитала действие подозрительным. Попробуйте обновить страницу.', { duration: 6000 });
      } else {
        toast.error(typeof detail === 'string' ? detail : t('auth.sending'));
      }
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="forgot-password-container">
        <Card className="forgot-password-card success-card">
          <div className="success-content">
            <CheckCircle size={64} className="success-icon" />
            <h1 className="success-title">{t('auth.emailSentTitle')}</h1>
            <p className="success-message">
              {t('auth.emailSentMessage')}
            </p>
            <p className="email-display">{email}</p>
            <p className="success-info">
              {t('auth.checkEmail')} {t('auth.linkValidFor')}
            </p>
            <p className="success-hint">
              {t('auth.checkSpam')}
            </p>
            <div className="success-actions">
              <Button
                onClick={() => navigate('/')}
                className="neon-button-filled"
              >
                {t('auth.backToLogin')}
              </Button>
            </div>
          </div>
        </Card>

        <style jsx>{`
          .forgot-password-container {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            //background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 20px;
          }

          .success-card {
            max-width: 500px;
            width: 100%;
            padding: 40px;
            text-align: center;
          }

          .success-content {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 20px;
          }

          .success-icon {
            color: var(--color-success-alt);
            animation: scaleIn 0.5s ease-out;
          }

          @keyframes scaleIn {
            from {
              transform: scale(0);
              opacity: 0;
            }
            to {
              transform: scale(1);
              opacity: 1;
            }
          }

          .success-title {
            font-size: var(--font-size-6xl);
            font-weight: var(--font-weight-bold);
            color: var(--color-text-dark);
            margin: 0;
          }

          .success-message {
            font-size: var(--font-size-lg);
            color: var(--color-text-muted);
            margin: 0;
          }

          .email-display {
            font-size: var(--font-size-lg);
            font-weight: var(--font-weight-semibold);
            color: var(--color-primary-dark);
            background: var(--color-primary-bg);
            padding: var(--space-3) var(--space-5);
            border-radius: var(--radius-lg);
            border: 1px solid var(--color-primary-border);
            word-break: break-all;
          }

          .success-info {
            font-size: var(--font-size-base);
            color: var(--color-text-muted);
            line-height: 1.6;
            margin: 0;
          }

          .success-hint {
            font-size: var(--font-size-base);
            color: var(--color-text-placeholder);
            margin: 0;
          }

          .success-actions {
            width: 100%;
            margin-top: 10px;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="forgot-password-container">
      <Card className="forgot-password-card">
        <div className="card-header">
          <Mail size={48} className="header-icon" />
          <h1 className="card-title">{t('auth.forgotPasswordTitle')}</h1>
          <p className="card-subtitle">
            {t('auth.forgotPasswordSubtitle')}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="forgot-password-form">
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              {t('auth.email')}
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('auth.emailPlaceholder')}
              disabled={loading}
              required
            />
          </div>

          <Button
            type="submit"
            className="neon-button-filled submit-button"
            disabled={loading}
          >
            {loading ? t('auth.sending') : t('auth.sendResetLink')}
          </Button>

          <p style={{ textAlign: 'center', fontSize: 'var(--font-size-xxs)', color: 'var(--color-text-placeholder)', margin: '-8px 0 0' }}>
            Защищено{' '}
            <a href="https://policies.google.com/privacy" target="_blank" rel="noreferrer"
               style={{ color: 'var(--color-text-muted)', textDecoration: 'underline' }}>
              reCAPTCHA v3
            </a>
          </p>

          <div className="back-link">
            <Link to="/" className="link-button">
              <ArrowLeft size={16} />
              <span>{t('auth.backToLogin')}</span>
            </Link>
          </div>
        </form>
      </Card>

      <style jsx>{`
        .forgot-password-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          //background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 20px;
        }

        .forgot-password-card {
          max-width: 450px;
          width: 100%;
          padding: 40px;
        }

        .card-header {
          text-align: center;
          margin-bottom: 32px;
        }

        .header-icon {
          color: var(--color-primary-dark);
          margin-bottom: 16px;
        }

        .card-title {
          font-size: var(--font-size-6xl);
          font-weight: var(--font-weight-bold);
          color: var(--color-text-dark);
          margin: 0 0 12px 0;
        }

        .card-subtitle {
          font-size: var(--font-size-base);
          color: var(--color-text-muted);
          line-height: 1.5;
          margin: 0;
        }

        .forgot-password-form {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .form-label {
          font-size: var(--font-size-base);
          font-weight: var(--font-weight-medium);
          color: var(--color-text-secondary);
        }

        .submit-button {
          width: 100%;
          padding: 12px;
          font-size: 1rem;
        }

        .back-link {
          text-align: center;
          padding-top: 8px;
        }

        .link-button {
          display: inline-flex;
          align-items: center;
          gap: var(--space-2);
          color: var(--color-primary-dark);
          text-decoration: none;
          font-size: var(--font-size-base);
          font-weight: var(--font-weight-medium);
          transition: all 0.2s;
        }

        .link-button:hover {
          color: var(--color-primary-dark);
          gap: 12px;
        }

        @media (max-width: 640px) {
          .forgot-password-card {
            padding: 30px 24px;
          }

          .card-title {
            font-size: var(--font-size-4xl);
          }
        }
      `}</style>
    </div>
  );
};

export default ForgotPassword;
