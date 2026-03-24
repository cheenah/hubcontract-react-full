import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import { AppContext } from '../App';
import { useLanguage } from '@/context/LanguageContext';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Lock, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { API } = React.useContext(AppContext);
  const { t } = useLanguage();
  
  const [token, setToken] = useState('');
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [verifyingToken, setVerifyingToken] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [passwordReset, setPasswordReset] = useState(false);

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    if (tokenParam) {
      setToken(tokenParam);
      verifyToken(tokenParam);
    } else {
      toast.error('Invalid reset link');
      setVerifyingToken(false);
    }
  }, []);

  const verifyToken = async (resetToken) => {
    try {
      console.log('Verifying token:', resetToken);
      const response = await axios.get(`${API}/auth/verify-reset-token`, {
        params: { token: resetToken }
      });
      
      console.log('Token verification response:', response.data);
      if (response.data.valid) {
        setTokenValid(true);
        setEmail(response.data.email);
      }
    } catch (error) {
      console.error('Token verification error:', error.response?.data || error.message);
      const errorMsg = error.response?.data?.detail || 'Invalid or expired reset link';
      toast.error(typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg));
      setTokenValid(false);
    } finally {
      setVerifyingToken(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!newPassword || !confirmPassword) {
      toast.error(t('auth.email'));
      return;
    }

    if (newPassword.length < 6) {
      toast.error(t('auth.passwordMinLength'));
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      setLoading(true);
      
      await axios.post(`${API}/auth/reset-password`, {
        token,
        new_password: newPassword
      });
      
      setPasswordReset(true);
      toast.success(t('auth.passwordChangedTitle'));
      
      setTimeout(() => {
        navigate('/');
      }, 3000);
      
    } catch (error) {
      const errorMsg = error.response?.data?.detail || t('auth.changing');
      toast.error(typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg));
    } finally {
      setLoading(false);
    }
  };

  if (verifyingToken) {
    return (
      <div className="reset-password-container">
        <Card className="reset-password-card">
          <div className="loading-content">
            <div className="loading-spinner"></div>
            <p>{t('auth.verifying')}</p>
          </div>
        </Card>

        <style jsx>{`
          .reset-password-container {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 20px;
          }
          .reset-password-card {
            max-width: 450px;
            width: 100%;
            padding: 60px 40px;
          }
          .loading-content {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 20px;
            color: #666;
          }
          .loading-spinner {
            width: 48px;
            height: 48px;
            border: 4px solid #e5e7eb;
            border-top-color: #1e40af;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (!tokenValid) {
    return (
      <div className="reset-password-container">
        <Card className="reset-password-card error-card">
          <div className="error-content">
            <AlertCircle size={64} className="error-icon" />
            <h1 className="error-title">{t('auth.invalidLink')}</h1>
            <p className="error-message">{t('auth.invalidLinkMessage')}</p>
            <p className="error-info">{t('auth.invalidLinkInfo')}</p>
            <div className="error-actions">
              <Button onClick={() => navigate('/forgot-password')} className="neon-button-filled">
                {t('auth.requestNewLink')}
              </Button>
              <Link to="/" className="link-button">{t('auth.backToLogin')}</Link>
            </div>
          </div>
        </Card>

        <style jsx>{`
          .reset-password-container {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 20px;
          }
          .error-card {
            max-width: 500px;
            width: 100%;
            padding: 40px;
            text-align: center;
          }
          .error-content {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 20px;
          }
          .error-icon {
            color: #ef4444;
          }
          .error-title {
            font-size: 2rem;
            font-weight: 700;
            color: #1a1a1a;
            margin: 0;
          }
          .error-message, .error-info {
            font-size: 1rem;
            color: #666;
            margin: 0;
            line-height: 1.6;
          }
          .error-actions {
            width: 100%;
            display: flex;
            flex-direction: column;
            gap: 16px;
            margin-top: 10px;
          }
          .link-button {
            color: #1e40af;
            text-decoration: none;
            font-size: 0.95rem;
            font-weight: 500;
            transition: color 0.2s;
          }
          .link-button:hover {
            color: #1e3a8a;
          }
        `}</style>
      </div>
    );
  }

  if (passwordReset) {
    return (
      <div className="reset-password-container">
        <Card className="reset-password-card success-card">
          <div className="success-content">
            <CheckCircle size={64} className="success-icon" />
            <h1 className="success-title">{t('auth.passwordChangedTitle')}</h1>
            <p className="success-message">{t('auth.passwordChangedMessage')}</p>
            <p className="redirect-info">{t('auth.redirecting')}</p>
          </div>
        </Card>

        <style jsx>{`
          .reset-password-container {
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
            from { transform: scale(0); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
          }
          .success-title {
            font-size: 2rem;
            font-weight: 700;
            color: #1a1a1a;
            margin: 0;
          }
          .success-message, .redirect-info {
            font-size: 1rem;
            color: #666;
            margin: 0;
          }
          .redirect-info {
            font-size: 0.875rem;
            color: #999;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="reset-password-container">
      <Card className="reset-password-card">
        <div className="card-header">
          <Lock size={48} className="header-icon" />
          <h1 className="card-title">{t('auth.setNewPassword')}</h1>
          <p className="card-subtitle">
            {t('auth.email')}: <strong>{email}</strong>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="reset-password-form">
          <div className="form-group">
            <label htmlFor="newPassword" className="form-label">{t('auth.newPassword')}</label>
            <Input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder={t('auth.newPasswordPlaceholder')}
              disabled={loading}
              required
            />
            <span className="form-hint">{t('auth.passwordMinLength')}</span>
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label">{t('auth.confirmPassword')}</label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder={t('auth.confirmPasswordPlaceholder')}
              disabled={loading}
              required
            />
          </div>

          <Button type="submit" className="neon-button-filled submit-button" disabled={loading}>
            {loading ? t('auth.changing') : t('auth.changePassword')}
          </Button>
        </form>
      </Card>

      <style jsx>{`
        .reset-password-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 20px;
        }
        .reset-password-card {
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
          margin: 0;
        }
        .card-subtitle strong {
          color: #1e40af;
        }
        .reset-password-form {
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
        .form-hint {
          font-size: 0.875rem;
          color: #999;
        }
        .submit-button {
          width: 100%;
          padding: 12px;
          font-size: 1rem;
          margin-top: 8px;
        }
        @media (max-width: 640px) {
          .reset-password-card {
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

export default ResetPassword;
