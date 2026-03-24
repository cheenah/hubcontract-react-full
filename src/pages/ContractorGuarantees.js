import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '@/components/Layout';
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
      <Layout>
        <div className="loading-container">
          <div className="loading-spinner"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
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
          padding: 24px;
        }

        .page-header {
          background: white;
          padding: 24px 32px;
          border-radius: 8px;
          margin-bottom: 24px;
          border: 1px solid #e5e7eb;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .page-title {
          font-size: 1.875rem;
          font-weight: 700;
          color: #1a1a1a;
          margin: 0 0 8px 0;
        }

        .page-subtitle {
          font-size: 0.875rem;
          color: #6b7280;
          margin: 0;
        }

        .guarantees-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 20px;
        }

        .guarantee-card {
          padding: 20px;
          border: 1px solid #e5e7eb;
        }

        .guarantee-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        .guarantee-icon {
          color: #10b981;
        }

        .status {
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 500;
        }

        .status-active {
          background: rgba(16, 185, 129, 0.1);
          color: #10b981;
        }

        .guarantee-number {
          font-size: 1.125rem;
          font-weight: 600;
          color: #1a1a1a;
          margin: 0 0 8px 0;
        }

        .guarantee-bank,
        .guarantee-amount,
        .guarantee-date {
          font-size: 0.875rem;
          color: #6b7280;
          margin: 4px 0;
        }

        .guarantee-amount {
          font-weight: 600;
          color: #10b981;
        }

        .guarantee-actions {
          margin-top: 12px;
          padding-top: 12px;
          border-top: 1px solid #e5e7eb;
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
          background: white;
          padding: 24px;
          border-radius: 12px;
          max-width: 500px;
          width: 90%;
          max-height: 90vh;
          overflow-y: auto;
        }

        .modal h2 {
          font-size: 1.5rem;
          font-weight: 700;
          margin: 0 0 20px 0;
        }

        .form-group {
          margin: 16px 0;
        }

        .form-group label {
          display: block;
          font-size: 0.875rem;
          font-weight: 500;
          color: #374151;
          margin-bottom: 6px;
        }

        .form-group input {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 0.875rem;
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
          gap: 8px;
          padding: 10px 16px;
          border: 2px dashed #d1d5db;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .file-upload-label:hover {
          border-color: #1e40af;
          background: rgba(30, 64, 175, 0.05);
        }

        .modal-actions {
          display: flex;
          gap: 12px;
          margin-top: 24px;
        }

        .empty-state {
          text-align: center;
          padding: 48px;
          color: #6b7280;
        }

        .empty-state svg {
          color: #9ca3af;
          margin-bottom: 16px;
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
          border: 3px solid #e5e7eb;
          border-top: 3px solid #1e40af;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .guarantees-page {
            padding: 16px;
          }

          .page-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 16px;
          }

          .guarantees-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </Layout>
  );
};

export default ContractorGuarantees;