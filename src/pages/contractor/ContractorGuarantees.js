import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, Plus, Trash2, Upload } from 'lucide-react';

const API = process.env.REACT_APP_BACKEND_URL;

const ContractorGuarantees = () => {
  const [loading, setLoading] = useState(true);
  const [guarantees, setGuarantees] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    guarantee_number: '',
    bank_name: '',
    amount: '',
    valid_until: '',
    document_data: '',
    document_filename: ''
  });

  useEffect(() => {
    fetchGuarantees();
  }, []);

  const fetchGuarantees = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get(`${API}/contractor/bank-guarantees`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setGuarantees(response.data);
    } catch (error) {
      console.error('Error fetching guarantees:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm({
          ...form,
          document_data: reader.result.split(',')[1],
          document_filename: file.name
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!form.guarantee_number || !form.bank_name || !form.amount || !form.document_data) {
      alert('Заполните все поля и загрузите файл');
      return;
    }

    const token = localStorage.getItem('token');
    try {
      await axios.post(`${API}/contractor/bank-guarantees`, form, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Гарантия добавлена!');
      setShowModal(false);
      setForm({ guarantee_number: '', bank_name: '', amount: '', valid_until: '', document_data: '', document_filename: '' });
      fetchGuarantees();
    } catch (error) {
      console.error('Error adding guarantee:', error);
      alert('Ошибка при добавлении гарантии');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Удалить гарантию?')) return;
    
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`${API}/contractor/bank-guarantees/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchGuarantees();
    } catch (error) {
      console.error('Error deleting guarantee:', error);
    }
  };

  if (loading) {
    return (
        <div className="loading-container">
          <div className="loading-spinner"></div>
        </div>
    );
  }

  return (
    <>
      <div className="guarantees-page">
        <div className="page-header">
          <div>
            <h1 className="page-title">Банковские гарантии</h1>
            <p className="page-subtitle">Управление банковскими гарантиями</p>
          </div>
          <Button onClick={() => setShowModal(true)}>
            <Plus size={16} />
            Добавить гарантию
          </Button>
        </div>

        <div className="guarantees-grid">
          {guarantees.length === 0 ? (
            <Card className="empty-state">
              <Shield size={48} />
              <p>У вас пока нет банковских гарантий</p>
              <Button onClick={() => setShowModal(true)}>Добавить первую</Button>
            </Card>
          ) : (
            guarantees.map((guarantee) => (
              <Card key={guarantee.id} className="guarantee-card">
                <div className="guarantee-header">
                  <Shield className="guarantee-icon" />
                  <span className={`status status-${guarantee.status}`}>
                    {guarantee.status === 'active' ? 'Активна' : 'Неактивна'}
                  </span>
                </div>
                <h3 className="guarantee-number">{guarantee.guarantee_number}</h3>
                <p className="guarantee-bank">Банк: {guarantee.bank_name}</p>
                <p className="guarantee-amount">Сумма: {Number(guarantee.amount).toLocaleString()} ₸</p>
                <p className="guarantee-date">Действительна до: {new Date(guarantee.valid_until).toLocaleDateString('ru-RU')}</p>
                <div className="guarantee-actions">
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(guarantee.id)}>
                    <Trash2 size={16} />
                    Удалить
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>

        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <h2>Добавить банковскую гарантию</h2>
              
              <div className="form-group">
                <label>Номер гарантии</label>
                <input
                  type="text"
                  value={form.guarantee_number}
                  onChange={(e) => setForm({...form, guarantee_number: e.target.value})}
                  placeholder="БГ-2025-001"
                />
              </div>

              <div className="form-group">
                <label>Банк</label>
                <input
                  type="text"
                  value={form.bank_name}
                  onChange={(e) => setForm({...form, bank_name: e.target.value})}
                  placeholder="Название банка"
                />
              </div>

              <div className="form-group">
                <label>Сумма (₸)</label>
                <input
                  type="number"
                  value={form.amount}
                  onChange={(e) => setForm({...form, amount: e.target.value})}
                  placeholder="0"
                />
              </div>

              <div className="form-group">
                <label>Действительна до</label>
                <input
                  type="date"
                  value={form.valid_until}
                  onChange={(e) => setForm({...form, valid_until: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label>Документ гарантии</label>
                <div className="file-upload">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileUpload}
                    id="file-upload"
                  />
                  <label htmlFor="file-upload" className="file-upload-label">
                    <Upload size={20} />
                    {form.document_filename || 'Выберите файл'}
                  </label>
                </div>
              </div>

              <div className="modal-actions">
                <Button onClick={handleSubmit}>Добавить</Button>
                <Button variant="outline" onClick={() => setShowModal(false)}>Отмена</Button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .guarantees-page {
          max-width: 1200px;
          margin: 0 auto;
          padding: var(--space-6);
        }

        .page-header {
          background: var(--color-bg-surface);
          padding: var(--space-6) var(--space-8);
          border-radius: var(--radius-lg);
          margin-bottom: var(--space-6);
          border: 1px solid var(--color-border);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .page-title {
          font-size: var(--font-size-4xl);
          font-weight: var(--font-weight-bold);
          color: var(--color-text-dark);
          margin: 0 0 var(--space-2) 0;
        }

        .page-subtitle {
          font-size: var(--font-size-base);
          color: var(--color-text-muted);
          margin: 0;
        }

        .guarantees-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: var(--space-5);
        }

        .guarantee-card {
          padding: var(--space-5);
          border: 1px solid var(--color-border);
        }

        .guarantee-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--space-4);
        }

        .guarantee-icon {
          color: var(--color-success-alt);
        }

        .status {
          padding: var(--space-1) var(--space-3);
          border-radius: var(--radius-4xl);
          font-size: var(--font-size-xs);
          font-weight: var(--font-weight-medium);
        }

        .status-active {
          background: var(--color-success-tint-10);
          color: var(--color-success-alt);
        }

        .guarantee-number {
          font-size: var(--font-size-xl3);
          font-weight: var(--font-weight-semibold);
          color: var(--color-text-dark);
          margin: 0 0 var(--space-2) 0;
        }

        .guarantee-bank,
        .guarantee-amount,
        .guarantee-date {
          font-size: var(--font-size-base);
          color: var(--color-text-muted);
          margin: var(--space-1) 0;
        }

        .guarantee-amount {
          font-weight: var(--font-weight-semibold);
          color: var(--color-success-alt);
        }

        .guarantee-actions {
          margin-top: var(--space-3);
          padding-top: var(--space-3);
          border-top: 1px solid var(--color-border);
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal {
          background: var(--color-bg-surface);
          padding: var(--space-6);
          border-radius: var(--radius-2xl);
          max-width: 500px;
          width: 90%;
          max-height: 90vh;
          overflow-y: auto;
        }

        .modal h2 {
          font-size: var(--font-size-3xl);
          font-weight: var(--font-weight-bold);
          margin: 0 0 var(--space-5) 0;
        }

        .form-group {
          margin: var(--space-4) 0;
        }

        .form-group label {
          display: block;
          font-size: var(--font-size-base);
          font-weight: var(--font-weight-medium);
          color: var(--color-text-secondary);
          margin-bottom: var(--space-1-5);
        }

        .form-group input {
          width: 100%;
          padding: var(--space-2-5) var(--space-3);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          font-size: var(--font-size-base);
        }

        .file-upload {
          position: relative;
        }

        .file-upload input[type="file"] {
          display: none;
        }

        .file-upload-label {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          padding: var(--space-2-5) var(--space-4);
          border: 2px dashed var(--color-border);
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: var(--transition-normal);
        }

        .file-upload-label:hover {
          border-color: var(--color-primary-dark);
          background: var(--color-primary-bg);
        }

        .modal-actions {
          display: flex;
          gap: var(--space-3);
          margin-top: var(--space-6);
        }

        .empty-state {
          text-align: center;
          padding: var(--space-12);
          color: var(--color-text-muted);
        }

        .empty-state svg {
          color: var(--color-text-placeholder);
          margin-bottom: var(--space-4);
        }

        .loading-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 400px;
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid var(--color-border);
          border-top: 3px solid var(--color-primary-dark);
          border-radius: var(--radius-circle);
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .guarantees-page {
            padding: var(--space-4);
          }

          .page-header {
            flex-direction: column;
            align-items: flex-start;
            gap: var(--space-4);
          }

          .guarantees-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </>
  );
};

export default ContractorGuarantees;