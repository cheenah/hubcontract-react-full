import React, { useState } from 'react';
import { AppContext } from '@/App';
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
      bg: 'var(--color-primary-bg)',
      color: 'var(--color-primary-light)'
    },
    {
      id: 'financial',
      title: 'Финансовый отчет',
      description: 'Отчет по бюджетам и расходам',
      icon: TrendingUp,
      bg: 'var(--color-success-tint-10)',
      color: 'var(--color-success-alt)'
    },
    {
      id: 'contracts',
      title: 'Отчет по договорам',
      description: 'Статистика исполнения договоров',
      icon: FileText,
      bg: 'var(--color-primary-bg)',
      color: 'var(--color-primary)'
    },
    {
      id: 'suppliers',
      title: 'Отчет по поставщикам',
      description: 'Рейтинг и статистика по подрядчикам',
      icon: FileText,
      bg: 'var(--color-bg-muted)',
      color: 'var(--color-warning)'
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
    <>
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
                <div className="report-icon" style={{ background: report.bg }}>
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
          padding: var(--space-6);
        }

        .page-header {
          margin-bottom: var(--space-8);
          background: var(--color-bg-surface);
          padding: var(--space-6) var(--space-8);
          border-radius: var(--radius-lg);
          border: 1px solid var(--color-border);
          box-shadow: var(--shadow-card);
        }

        .page-title {
          font-size: var(--font-size-6xl);
          font-weight: var(--font-weight-bold);
          color: var(--color-text-dark);
          margin-bottom: var(--space-1);
        }

        .page-subtitle {
          font-size: var(--font-size-lg);
          color: var(--color-text-secondary);
        }

        .reports-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: var(--space-6);
          margin-bottom: var(--space-8);
        }

        .report-card {
          padding: var(--space-8) var(--space-6);
          background: var(--color-bg-surface);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
          text-align: center;
          transition: var(--transition-base);
        }

        .report-card:hover {
          box-shadow: var(--shadow-card-hover);
          border-color: var(--color-border-dark);
        }

        .report-icon {
          width: 80px;
          height: 80px;
          margin: 0 auto var(--space-5);
          border-radius: var(--radius-4xl);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .report-title {
          font-size: var(--font-size-2xl);
          font-weight: var(--font-weight-semibold);
          color: var(--color-text-dark);
          margin-bottom: var(--space-3);
        }

        .report-description {
          font-size: var(--font-size-base);
          color: var(--color-text-secondary);
          margin-bottom: var(--space-6);
        }

        .download-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--space-2);
          background: var(--color-primary);
          color: var(--color-text-inverse);
        }

        .custom-report {
          padding: var(--space-8);
          background: var(--color-bg-surface);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
        }

        .section-title {
          font-size: var(--font-size-3xl);
          font-weight: var(--font-weight-semibold);
          color: var(--color-text-dark);
          margin-bottom: var(--space-6);
        }

        .custom-form {
          display: flex;
          flex-direction: column;
          gap: var(--space-5);
        }

        .form-row {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: var(--space-5);
        }

        .form-field {
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
        }

        .form-field label {
          font-size: var(--font-size-base);
          font-weight: var(--font-weight-semibold);
          color: var(--color-text-dark);
        }

        .date-input {
          padding: var(--space-2) var(--space-3);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          font-size: var(--font-size-base);
        }

        .generate-btn {
          width: fit-content;
          display: flex;
          align-items: center;
          gap: var(--space-2);
          background: var(--color-primary);
          color: var(--color-text-inverse);
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
  </>
  );
};

export default Reports;