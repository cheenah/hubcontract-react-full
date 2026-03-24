import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '@/components/Layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, CheckCircle, Clock, Download, Upload } from 'lucide-react';
import { getContractStatusText } from '@/utils/statusHelpers';

const API = process.env.REACT_APP_BACKEND_URL;

const ContractorContracts = () => {
  const [loading, setLoading] = useState(true);
  const [contracts, setContracts] = useState([]);
  const [selectedContract, setSelectedContract] = useState(null);
  const [showSignModal, setShowSignModal] = useState(false);
  const [showActModal, setShowActModal] = useState(false);
  const [actForm, setActForm] = useState({
    work_description: '',
    amount: '',
    act_date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchContracts();
  }, []);

  const fetchContracts = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get(`${API}/contractor/contracts`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setContracts(response.data);
    } catch (error) {
      console.error('Error fetching contracts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignContract = async (contractId) => {
    const token = localStorage.getItem('token');
    try {
      await axios.post(
        `${API}/contractor/contracts/${contractId}/sign`,
        { agreed: true, signature_comment: 'Согласен с условиями договора' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Договор успешно подписан!');
      fetchContracts();
      setShowSignModal(false);
    } catch (error) {
      console.error('Error signing contract:', error);
      alert('Ошибка при подписании договора');
    }
  };

  const handleSubmitAct = async () => {
    if (!actForm.work_description || !actForm.amount) {
      alert('Заполните все поля');
      return;
    }

    const token = localStorage.getItem('token');
    try {
      await axios.post(
        `${API}/contractor/contracts/${selectedContract.id}/acts`,
        actForm,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Акт выполненных работ подан!');
      setShowActModal(false);
      setActForm({ work_description: '', amount: '', act_date: new Date().toISOString().split('T')[0] });
      fetchContracts();
    } catch (error) {
      console.error('Error submitting act:', error);
      alert('Ошибка при подаче акта');
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
      <div className="contracts-page">
        <div className="page-header">
          <h1 className="page-title">Договоры</h1>
          <p className="page-subtitle">Управление договорами и актами выполненных работ</p>
        </div>

        <div className="contracts-grid">
          {contracts.length === 0 ? (
            <Card className="empty-state">
              <FileText size={48} />
              <p>У вас пока нет договоров</p>
            </Card>
          ) : (
            contracts.map((contract) => (
              <Card key={contract.id} className="contract-card">
                <div className="contract-header">
                  <h3 className="contract-number">{contract.contract_number}</h3>
                  <span className={`contract-status status-${contract.status}`}>
                    {getContractStatusText(contract.status)}
                  </span>
                </div>

                <div className="contract-body">
                  <p className="contract-title">{contract.tender_title}</p>
                  <p className="contract-customer">Заказчик: {contract.customer_name}</p>
                  <p className="contract-amount">Сумма: {contract.contract_amount?.toLocaleString()} ₸</p>
                  
                  {contract.completion_percentage !== undefined && (
                    <div className="progress-section">
                      <div className="progress-header">
                        <span>Прогресс</span>
                        <span>{contract.completion_percentage}%</span>
                      </div>
                      <div className="progress-bar">
                        <div 
                          className="progress-fill"
                          style={{ width: `${contract.completion_percentage}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="contract-actions">
                  {!contract.contractor_signed && (
                    <Button
                      onClick={() => {
                        setSelectedContract(contract);
                        setShowSignModal(true);
                      }}
                      className="btn-primary"
                    >
                      <CheckCircle size={16} />
                      Подписать договор
                    </Button>
                  )}
                  
                  {contract.contractor_signed && (
                    <Button
                      onClick={() => {
                        setSelectedContract(contract);
                        setShowActModal(true);
                      }}
                      variant="outline"
                    >
                      <Upload size={16} />
                      Подать акт работ
                    </Button>
                  )}
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Sign Contract Modal */}
        {showSignModal && (
          <div className="modal-overlay" onClick={() => setShowSignModal(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <h2>Подписание договора</h2>
              <p>Договор: {selectedContract?.contract_number}</p>
              <p>Заказчик: {selectedContract?.customer_name}</p>
              <p>Сумма: {selectedContract?.contract_amount?.toLocaleString()} ₸</p>
              
              <div className="modal-actions">
                <Button onClick={() => handleSignContract(selectedContract.id)}>
                  Подтвердить подпись
                </Button>
                <Button variant="outline" onClick={() => setShowSignModal(false)}>
                  Отмена
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Submit Work Act Modal */}
        {showActModal && (
          <div className="modal-overlay" onClick={() => setShowActModal(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <h2>Акт выполненных работ</h2>
              
              <div className="form-group">
                <label>Описание работ</label>
                <textarea
                  value={actForm.work_description}
                  onChange={(e) => setActForm({...actForm, work_description: e.target.value})}
                  placeholder="Опишите выполненные работы"
                  rows={4}
                />
              </div>

              <div className="form-group">
                <label>Сумма (₸)</label>
                <input
                  type="number"
                  value={actForm.amount}
                  onChange={(e) => setActForm({...actForm, amount: e.target.value})}
                  placeholder="0"
                />
              </div>

              <div className="form-group">
                <label>Дата акта</label>
                <input
                  type="date"
                  value={actForm.act_date}
                  onChange={(e) => setActForm({...actForm, act_date: e.target.value})}
                />
              </div>

              <div className="modal-actions">
                <Button onClick={handleSubmitAct}>Подать акт</Button>
                <Button variant="outline" onClick={() => setShowActModal(false)}>
                  Отмена
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .contracts-page {
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

        .contracts-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 20px;
        }

        .contract-card {
          padding: 20px;
          border: 1px solid #e5e7eb;
        }

        .contract-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
          padding-bottom: 12px;
          border-bottom: 1px solid #e5e7eb;
        }

        .contract-number {
          font-size: 1.125rem;
          font-weight: 600;
          color: #1a1a1a;
          margin: 0;
        }

        .contract-status {
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 500;
        }

        .status-active {
          background: rgba(59, 130, 246, 0.1);
          color: #3b82f6;
        }

        .status-signed {
          background: rgba(16, 185, 129, 0.1);
          color: #10b981;
        }

        .status-completed {
          background: rgba(107, 114, 128, 0.1);
          color: #6b7280;
        }

        .contract-body {
          margin-bottom: 16px;
        }

        .contract-title {
          font-size: 1rem;
          font-weight: 600;
          color: #1a1a1a;
          margin: 0 0 8px 0;
        }

        .contract-customer,
        .contract-amount {
          font-size: 0.875rem;
          color: #6b7280;
          margin: 4px 0;
        }

        .contract-amount {
          font-weight: 600;
          color: #10b981;
        }

        .progress-section {
          margin-top: 12px;
        }

        .progress-header {
          display: flex;
          justify-content: space-between;
          font-size: 0.875rem;
          color: #6b7280;
          margin-bottom: 8px;
        }

        .progress-bar {
          width: 100%;
          height: 8px;
          background: #e5e7eb;
          border-radius: 4px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #3b82f6, #10b981);
          transition: width 0.3s ease;
        }

        .contract-actions {
          display: flex;
          gap: 8px;
        }

        .contract-actions button {
          display: flex;
          align-items: center;
          gap: 6px;
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
          color: #1a1a1a;
          margin: 0 0 16px 0;
        }

        .modal p {
          margin: 8px 0;
          color: #6b7280;
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

        .form-group input,
        .form-group textarea {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 0.875rem;
        }

        .form-group textarea {
          resize: vertical;
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
          .contracts-page {
            padding: 16px;
          }

          .contracts-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </Layout>
  );
};

export default ContractorContracts;
