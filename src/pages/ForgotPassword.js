import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { AppContext } from '../App';
import { useLanguage } from '@/context/LanguageContext';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const { API } = React.useContext(AppContext);
  const { t } = useLanguage();
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
      
      await axios.post(`${API}/auth/forgot-password`, { email });
      
      setEmailSent(true);
      toast.success(t('auth.emailSentMessage'));
      
    } catch (error) {
      const errorMsg = error.response?.data?.detail || t('auth.sending');
      toast.error(typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg));
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
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
            color: #10b981;
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
            font-size: 2rem;
            font-weight: 700;
            color: #1a1a1a;
            margin: 0;
          }

          .success-message {
            font-size: 1rem;
            color: #666;
            margin: 0;
          }

          .email-display {
            font-size: 1.1rem;
            font-weight: 600;
            color: #1e40af;
            background: #f0f9ff;
            padding: 12px 20px;
            border-radius: 8px;
            border: 1px solid #bfdbfe;
            word-break: break-all;
          }

          .success-info {
            font-size: 0.95rem;
            color: #666;
            line-height: 1.6;
            margin: 0;
          }

          .success-hint {
            font-size: 0.875rem;
            color: #999;
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
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
          color: #1e40af;
          margin-bottom: 16px;
        }

        .card-title {
          font-size: 2rem;
          font-weight: 700;
          color: #1a1a1a;
          margin: 0 0 12px 0;
        }

        .card-subtitle {
          font-size: 0.95rem;
          color: #666;
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
          font-size: 0.95rem;
          font-weight: 500;
          color: #333;
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
          gap: 8px;
          color: #1e40af;
          text-decoration: none;
          font-size: 0.95rem;
          font-weight: 500;
          transition: all 0.2s;
        }

        .link-button:hover {
          color: #1e3a8a;
          gap: 12px;
        }

        @media (max-width: 640px) {
          .forgot-password-card {
            padding: 30px 24px;
          }

          .card-title {
            font-size: 1.75rem;
          }
        }
      `}</style>
    </div>
  );
};

export default ForgotPassword;
