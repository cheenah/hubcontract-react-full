import React, { useState, useEffect } from 'react';
import axios from 'axios';
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
        <div className="loading-container">
          <div className="loading-spinner"></div>
        </div>
    );
  }

  return (
    <>
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
          background: var(--color-bg-surface);
          padding: var(--space-6) var(--space-8);
          border-radius: var(--radius-lg);
          margin-bottom: var(--space-6);
          border: 1px solid var(--color-border);
        }

        .page-title {
          font-size: var(--font-size-3xl);
          font-weight: var(--font-weight-bold);
          color: var(--color-text-dark);
          margin: 0 0 var(--space-2) 0;
        }

        .page-subtitle {
          font-size: var(--font-size-base);
          color: var(--color-text-muted);
          margin: 0;
        }

        .contracts-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 20px;
        }

        .contract-card {
          padding: var(--space-5);
          border: 1px solid var(--color-border);
        }

        .contract-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--space-4);
          padding-bottom: var(--space-3);
          border-bottom: 1px solid var(--color-border);
        }

        .contract-number {
          font-size: var(--font-size-xl3);
          font-weight: var(--font-weight-semibold);
          color: var(--color-text-dark);
          margin: 0;
        }

        .contract-status {
          padding: var(--space-1) var(--space-3);
          border-radius: var(--radius-2xl);
          font-size: var(--font-size-xs);
          font-weight: var(--font-weight-medium);
        }

        .status-active {
          background: var(--color-primary-bg);
          color: var(--color-primary-light);
        }

        .status-signed {
          background: var(--color-success-tint-10);
          color: var(--color-success-alt);
        }

        .status-completed {
          background: var(--color-bg-muted);
          color: var(--color-text-muted);
        }

        .contract-body {
          margin-bottom: var(--space-4);
        }

        .contract-title {
          font-size: var(--font-size-lg);
          font-weight: var(--font-weight-semibold);
          color: var(--color-text-dark);
          margin: 0 0 var(--space-2) 0;
        }

        .contract-customer,
        .contract-amount {
          font-size: var(--font-size-base);
          color: var(--color-text-muted);
          margin: var(--space-1) 0;
        }

        .contract-amount {
          font-weight: var(--font-weight-semibold);
          color: var(--color-success-alt);
        }

        .progress-section {
          margin-top: var(--space-3);
        }

        .progress-header {
          display: flex;
          justify-content: space-between;
          font-size: var(--font-size-base);
          color: var(--color-text-muted);
          margin-bottom: var(--space-2);
        }

        .progress-bar {
          width: 100%;
          height: 8px;
          background: var(--color-border);
          border-radius: var(--radius-sm);
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--color-primary-light), var(--color-success-alt));
          transition: width var(--transition-slow) ease;
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
          color: var(--color-text-dark);
          margin: 0 0 var(--space-4) 0;
        }

        .modal p {
          margin: var(--space-2) 0;
          color: var(--color-text-muted);
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

        .form-group input,
        .form-group textarea {
          width: 100%;
          padding: var(--space-2-5) var(--space-3);
          border: 1px solid var(--color-border-gray);
          border-radius: var(--radius-md);
          font-size: var(--font-size-base);
        }

        .form-group textarea {
          resize: vertical;
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
          .contracts-page {
            padding: 16px;
          }

          .contracts-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </>
  );
};

export default ContractorContracts;
