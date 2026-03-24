import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { AppContext } from '@/App';
import { useLanguage } from '@/context/LanguageContext';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Upload, Shield } from 'lucide-react';

const Profile = () => {
  const { user, API } = React.useContext(AppContext);
  const { t } = useLanguage();
  const [uploading, setUploading] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);

  const handleFileUpload = async (docType, file) => {
    if (!file) return;

    setUploading(true);
    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const base64Data = reader.result.split(',')[1];
        
        await axios.post(`${API}/documents/upload`, {
          document_type: docType,
          file_data: base64Data,
          filename: file.name
        });
        
        toast.success('Document uploaded successfully!');
        window.location.reload();
      };
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  const documentTypes = [
    { key: 'id_card', label: t('profile.idCard'), description: t('profile.idCardDesc') },
    { key: 'company_cert', label: t('profile.companyCert'), description: t('profile.companyCertDesc') },
    { key: 'director_order', label: t('profile.directorOrder'), description: t('profile.directorOrderDesc') },
    { key: 'selfie', label: t('profile.selfie'), description: t('profile.selfieDesc') },
    { key: 'bank_statement', label: t('profile.bankStatement'), description: t('profile.bankStatementDesc') },
  ];

  const getVerificationStatus = () => {
    if (user.documents_verified) {
      return { text: t('profile.verified'), color: 'var(--primary)', icon: '✓' };
    } else if (user.verification_status === 'pending') {
      return { text: t('profile.pendingReview'), color: 'var(--warning)', icon: '⏳' };
    } else if (user.verification_status === 'rejected') {
      return { text: t('profile.rejected'), color: '#ff4444', icon: '✗' };
    }
    return { text: t('profile.notVerified'), color: 'var(--text-secondary)', icon: '⚠️' };
  };

  const status = getVerificationStatus();

  return (
    <Layout>
      <div className="profile-container" data-testid="profile-page">
        <div className="page-header">
          <h1 className="page-title">{t('profile.title')}</h1>
          <p className="page-subtitle">{t('profile.subtitle')}</p>
        </div>

        <Tabs defaultValue="info" className="profile-tabs">
          <TabsList className="tabs-list">
            <TabsTrigger value="info" data-testid="info-tab">
              <User size={18} />
              <span>{t('profile.accountInfo')}</span>
            </TabsTrigger>
            <TabsTrigger value="documents" data-testid="documents-tab">
              <Upload size={18} />
              <span>{t('profile.documents')}</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="tab-content">
            <Card className="info-card neon-card">
              <div className="card-header">
                <h3 className="card-title">{t('profile.accountInfo')}</h3>
                <div className="verification-badge" style={{ borderColor: status.color }}>
                  <Shield size={16} style={{ color: status.color }} />
                  <span style={{ color: status.color }}>{status.text}</span>
                </div>
              </div>

              <div className="info-grid">
                <div className="info-field">
                  <Label>{t('profile.email')}</Label>
                  <Input value={user.email} disabled data-testid="profile-email" />
                </div>

                <div className="info-field">
                  <Label>{t('profile.role')}</Label>
                  <Input value={user.role} disabled className="capitalize" data-testid="profile-role" />
                </div>

                <div className="info-field">
                  <Label>{t('profile.bin')}</Label>
                  <Input value={user.company_bin} disabled data-testid="profile-bin" />
                </div>

                <div className="info-field">
                  <Label>{t('profile.phone')}</Label>
                  <Input value={user.phone} disabled data-testid="profile-phone" />
                </div>

                {user.company_name && (
                  <div className="info-field full-width">
                    <Label>{t('profile.companyName')}</Label>
                    <Input value={user.company_name} disabled data-testid="profile-company" />
                  </div>
                )}
              </div>

              {!user.documents_verified && (
                <div className="verification-notice">
                  <p>
                    {status.icon} {t('profile.verificationNotice')}
                  </p>
                </div>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="documents" className="tab-content">
            <Card className="documents-card neon-card">
              <div className="card-header">
                <h3 className="card-title">{t('profile.verificationDocs')}</h3>
                <p className="card-subtitle">{t('profile.uploadAllDocs')}</p>
              </div>

              <div className="documents-list">
                {documentTypes.map((docType) => {
                  const uploaded = user.documents && user.documents[docType.key];
                  
                  return (
                    <div key={docType.key} className="document-item" data-testid={`doc-${docType.key}`}>
                      <div className="document-info">
                        <h4 className="document-label">{docType.label}</h4>
                        <p className="document-description">{docType.description}</p>
                        {uploaded && (
                          <p className="document-status">
                            ✓ {t('profile.uploaded')} {new Date(uploaded.uploaded_at).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      <div className="document-action">
                        <Input
                          type="file"
                          id={`file-${docType.key}`}
                          style={{ display: 'none' }}
                          onChange={(e) => handleFileUpload(docType.key, e.target.files[0])}
                          accept="image/*,.pdf"
                          data-testid={`file-input-${docType.key}`}
                        />
                        <Button
                          onClick={() => document.getElementById(`file-${docType.key}`).click()}
                          variant={uploaded ? 'outline' : 'default'}
                          className={uploaded ? 'neon-button' : 'neon-button-filled'}
                          disabled={uploading}
                          data-testid={`upload-btn-${docType.key}`}
                        >
                          <Upload size={16} />
                          {uploaded ? t('profile.reupload') : t('profile.upload')}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {user.verification_status === 'rejected' && (
                <div className="rejection-notice">
                  <p>⚠️ {t('profile.rejectionNotice')}</p>
                </div>
              )}

              {user.verification_status === 'pending' && (
                <div className="pending-notice">
                  <p>⏳ {t('profile.pendingNotice')}</p>
                </div>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <style jsx>{`
        .profile-container {
          max-width: 1000px;
          margin: 0 auto;
          padding: 40px 24px;
        }

        .page-header {
          margin-bottom: 32px;
        }

        .page-title {
          font-size: 2.5rem;
          font-weight: 700;
          color: #1a1a1a !important;
          margin-bottom: 8px;
        }

        .page-subtitle {
          font-size: 1.1rem;
          color: var(--text-secondary);
        }

        .profile-tabs {
          width: 100%;
        }

        .tabs-list {
          background: var(--bg-secondary);
          border: 1px solid rgba(0, 255, 170, 0.2);
          margin-bottom: 32px;
        }

        .tab-content {
          min-height: 400px;
        }

        .info-card, .documents-card {
          padding: 32px;
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          flex-wrap: wrap;
          gap: 16px;
        }

        .card-title {
          font-size: 1.5rem;
          font-weight: 600;
          color: #1a1a1a !important;
        }

        .card-subtitle {
          font-size: 0.95rem;
          color: var(--text-secondary);
          margin-top: 4px;
        }

        .verification-badge {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          border: 2px solid;
          border-radius: 20px;
          font-size: 0.9rem;
          font-weight: 600;
        }

        .info-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
        }

        .info-field {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .info-field.full-width {
          grid-column: 1 / -1;
        }

        .capitalize {
          text-transform: capitalize;
        }

        .verification-notice {
          margin-top: 24px;
          padding: 16px;
          background: rgba(255, 170, 0, 0.1);
          border: 1px solid var(--neon-warning);
          border-radius: 8px;
          color: var(--text-secondary);
          line-height: 1.6;
        }

        .documents-list {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .document-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px;
          background: rgba(0, 255, 170, 0.05);
          border: 1px solid rgba(0, 255, 170, 0.2);
          border-radius: 8px;
          gap: 20px;
        }

        .document-info {
          flex: 1;
        }

        .document-label {
          font-size: 1.1rem;
          font-weight: 600;
          color: #1a1a1a !important;
          margin-bottom: 4px;
        }

        .document-description {
          font-size: 0.9rem;
          color: var(--text-secondary);
          margin-bottom: 4px;
        }

        .document-status {
          font-size: 0.85rem;
          color: var(--neon-primary);
          margin-top: 8px;
        }

        .document-action {
          flex-shrink: 0;
        }

        .rejection-notice {
          margin-top: 24px;
          padding: 16px;
          background: rgba(255, 68, 68, 0.1);
          border: 1px solid #ff4444;
          border-radius: 8px;
          color: #ff4444;
          text-align: center;
        }

        .pending-notice {
          margin-top: 24px;
          padding: 16px;
          background: rgba(255, 170, 0, 0.1);
          border: 1px solid var(--neon-warning);
          border-radius: 8px;
          color: var(--neon-warning);
          text-align: center;
        }

        @media (max-width: 768px) {
          .page-title {
            font-size: 2rem;
          }

          .info-grid {
            grid-template-columns: 1fr;
          }

          .document-item {
            flex-direction: column;
            align-items: stretch;
          }

          .document-action {
            width: 100%;
          }
        }
      `}</style>
    </Layout>
  );
};

export default Profile;