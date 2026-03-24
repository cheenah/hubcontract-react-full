import React, { useState } from 'react';
import { AppContext } from '@/App';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Download, FileText, Calendar, TrendingUp } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const Reports = () => {
  const { API } = React.useContext(AppContext);
  const [loading, setLoading] = useState(false);

  const reports = [
    {
      id: 'tenders',
      title: 'Отчет по тендерам',
      description: 'Сводка по всем тендерам за период',
      icon: FileText,
      color: '#3b82f6'
    },
    {
      id: 'financial',
      title: 'Финансовый отчет',
      description: 'Отчет по бюджетам и расходам',
      icon: TrendingUp,
      color: '#10b981'
    },
    {
      id: 'contracts',
      title: 'Отчет по договорам',
      description: 'Статистика исполнения договоров',
      icon: FileText,
      color: '#8b5cf6'
    },
    {
      id: 'suppliers',
      title: 'Отчет по поставщикам',
      description: 'Рейтинг и статистика по подрядчикам',
      icon: FileText,
      color: '#f59e0b'
    }
  ];

  const handleDownload = async (reportId) => {
    setLoading(true);
    try {
      const response = await axios.get(`${API}/reports/${reportId}`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `report_${reportId}_${Date.now()}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Отчет загружен');
    } catch (error) {
      toast.error('Ошибка при загрузке отчета');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="reports-container">
        <div className="page-header">
          <div>
            <h1 className="page-title">Отчеты</h1>
            <p className="page-subtitle">Скачайте отчеты по закупочной деятельности</p>
          </div>
        </div>

        <div className="reports-grid">
          {reports.map((report) => {
            const Icon = report.icon;
            return (
              <Card key={report.id} className="report-card">
                <div className="report-icon" style={{ background: `${report.color}20` }}>
                  <Icon size={32} color={report.color} />
                </div>
                <h3 className="report-title">{report.title}</h3>
                <p className="report-description">{report.description}</p>
                <Button
                  onClick={() => handleDownload(report.id)}
                  disabled={loading}
                  className="download-btn"
                >
                  <Download size={18} />
                  Скачать отчет
                </Button>
              </Card>
            );
          })}
        </div>

        <Card className="custom-report">
          <h3 className="section-title">Настроить отчет</h3>
          <div className="custom-form">
            <div className="form-row">
              <div className="form-field">
                <label>Период с:</label>
                <input type="date" className="date-input" />
              </div>
              <div className="form-field">
                <label>Период по:</label>
                <input type="date" className="date-input" />
              </div>
            </div>
            <Button className="generate-btn">
              <Calendar size={18} />
              Сформировать отчет
            </Button>
          </div>
        </Card>
      </div>

      <style jsx>{`
        .reports-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 24px;
        }

        .page-header {
          margin-bottom: 32px;
          background: white;
          padding: 24px 32px;
          border-radius: 8px;
          border: 1px solid var(--border-light);
          box-shadow: var(--shadow-card);
        }

        .page-title {
          font-size: 2rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 4px;
        }

        .page-subtitle {
          font-size: 1rem;
          color: var(--text-secondary);
        }

        .reports-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 24px;
          margin-bottom: 32px;
        }

        .report-card {
          padding: 32px 24px;
          background: white;
          border: 1px solid var(--border-light);
          border-radius: 8px;
          text-align: center;
          transition: all 0.2s ease;
        }

        .report-card:hover {
          box-shadow: var(--shadow-md);
          border-color: var(--border-medium);
        }

        .report-icon {
          width: 80px;
          height: 80px;
          margin: 0 auto 20px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .report-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 12px;
        }

        .report-description {
          font-size: 0.875rem;
          color: var(--text-secondary);
          margin-bottom: 24px;
        }

        .download-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          background: var(--primary);
          color: white;
        }

        .custom-report {
          padding: 32px;
          background: white;
          border: 1px solid var(--border-light);
          border-radius: 8px;
        }

        .section-title {
          font-size: 1.5rem;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 24px;
        }

        .custom-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .form-row {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
        }

        .form-field {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .form-field label {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        .date-input {
          padding: 8px 12px;
          border: 1px solid var(--border-medium);
          border-radius: 6px;
          font-size: 0.875rem;
        }

        .generate-btn {
          width: fit-content;
          display: flex;
          align-items: center;
          gap: 8px;
          background: var(--accent);
          color: white;
        }

        @media (max-width: 768px) {
          .reports-grid {
            grid-template-columns: 1fr;
          }

          .form-row {
            grid-template-columns: 1fr;
          }

          .generate-btn {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </Layout>
  );
};

export default Reports;