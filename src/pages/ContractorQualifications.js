import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '@/components/Layout';
import { Card } from '@/components/ui/card';
import { Award, Briefcase, Users, Plus, Upload } from 'lucide-react';

const API = process.env.REACT_APP_BACKEND_URL;

const ContractorQualifications = () => {
  const [loading, setLoading] = useState(true);
  const [qualifications, setQualifications] = useState({
    documents: [],
    past_projects: [],
    staff: [],
    ai_score: 0
  });
  const [activeTab, setActiveTab] = useState('documents');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [documentForm, setDocumentForm] = useState({
    document_type: 'certificate',
    title: '',
    description: '',
    issue_date: '',
    document_data: '',
    document_filename: ''
  });
  const [projectForm, setProjectForm] = useState({
    project_name: '',
    client_name: '',
    project_value: '',
    start_date: '',
    end_date: '',
    description: '',
    category: ''
  });
  const [staffForm, setStaffForm] = useState({
    full_name: '',
    position: '',
    qualifications: '',
    experience_years: '',
    certifications: []
  });

  useEffect(() => {
    fetchQualifications();
  }, []);

  const fetchQualifications = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get(`${API}/contractor/qualifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setQualifications(response.data);
    } catch (error) {
      console.error('Error fetching qualifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setDocumentForm({
          ...documentForm,
          document_data: reader.result.split(',')[1],
          document_filename: file.name
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddDocument = async () => {
    const token = localStorage.getItem('token');
    try {
      await axios.post(`${API}/contractor/qualifications/documents`, documentForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Документ добавлен!');
      setShowModal(false);
      fetchQualifications();
    } catch (error) {
      console.error('Error adding document:', error);
    }
  };

  const handleAddProject = async () => {
    const token = localStorage.getItem('token');
    try {
      await axios.post(`${API}/contractor/qualifications/projects`, projectForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Проект добавлен!');
      setShowModal(false);
      fetchQualifications();
    } catch (error) {
      console.error('Error adding project:', error);
    }
  };

  const handleAddStaff = async () => {
    const token = localStorage.getItem('token');
    try {
      await axios.post(`${API}/contractor/qualifications/staff`, staffForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Сотрудник добавлен!');
      setShowModal(false);
      fetchQualifications();
    } catch (error) {
      console.error('Error adding staff:', error);
    }
  };

  const openModal = (type) => {
    setModalType(type);
    setShowModal(true);
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
      <div className="qualifications-page">
        <div className="page-header">
          <div>
            <h1 className="page-title">Квалификация и опыт</h1>
            <p className="page-subtitle">Управление портфолио для AI-оценки</p>
          </div>
        </div>

        {qualifications.ai_score > 0 && (
          <Card className="ai-score-card">
            <div className="ai-score-content">
              <Award className="ai-score-icon" />
              <div>
                <h3>AI-оценка квалификации</h3>
                <p className="ai-score">{qualifications.ai_score}/100</p>
              </div>
            </div>
          </Card>
        )}

        <div className="tabs">
          <button
            className={`tab ${activeTab === 'documents' ? 'active' : ''}`}
            onClick={() => setActiveTab('documents')}
          >
            <Award size={18} />
            Документы
          </button>
          <button
            className={`tab ${activeTab === 'projects' ? 'active' : ''}`}
            onClick={() => setActiveTab('projects')}
          >
            <Briefcase size={18} />
            Проекты
          </button>
          <button
            className={`tab ${activeTab === 'staff' ? 'active' : ''}`}
            onClick={() => setActiveTab('staff')}
          >
            <Users size={18} />
            Персонал
          </button>
        </div>

        {activeTab === 'documents' && (
          <div className="tab-content">
            <div className="section-header">
              <h2>Сертификаты и лицензии</h2>
              <button className="add-button" onClick={() => openModal('document')}>
                <Plus size={16} />
                Добавить документ
              </button>
            </div>
            <div className="items-grid">
              {qualifications.documents.length === 0 ? (
                <div className="empty-state">
                  <Award size={48} />
                  <p>Нет документов. Добавьте первый документ.</p>
                </div>
              ) : (
                qualifications.documents.map((doc) => (
                  <Card key={doc.id} className="item-card">
                    <h3>{doc.title}</h3>
                    <p className="doc-type">{doc.document_type}</p>
                    <p className="doc-date">Выдан: {new Date(doc.issue_date).toLocaleDateString('ru-RU')}</p>
                  </Card>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'projects' && (
          <div className="tab-content">
            <div className="section-header">
              <h2>Прошлые проекты</h2>
              <button className="add-button" onClick={() => openModal('project')}>
                <Plus size={16} />
                Добавить проект
              </button>
            </div>
            <div className="items-grid">
              {qualifications.past_projects.length === 0 ? (
                <div className="empty-state">
                  <Briefcase size={48} />
                  <p>Нет проектов. Добавьте первый проект.</p>
                </div>
              ) : (
                qualifications.past_projects.map((project) => (
                  <Card key={project.id} className="item-card">
                    <h3>{project.project_name}</h3>
                    <p>Заказчик: {project.client_name}</p>
                    <p>Стоимость: {Number(project.project_value).toLocaleString()} ₸</p>
                    <p className="project-dates">
                      {new Date(project.start_date).toLocaleDateString('ru-RU')} - {new Date(project.end_date).toLocaleDateString('ru-RU')}
                    </p>
                  </Card>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'staff' && (
          <div className="tab-content">
            <div className="section-header">
              <h2>Сотрудники</h2>
              <button className="add-button" onClick={() => openModal('staff')}>
                <Plus size={16} />
                Добавить сотрудника
              </button>
            </div>
            <div className="items-grid">
              {qualifications.staff.length === 0 ? (
                <div className="empty-state">
                  <Users size={48} />
                  <p>Нет сотрудников. Добавьте первого сотрудника.</p>
                </div>
              ) : (
                qualifications.staff.map((member) => (
                  <Card key={member.id} className="item-card">
                    <h3>{member.full_name}</h3>
                    <p className="staff-position">{member.position}</p>
                    <p>Опыт: {member.experience_years} лет</p>
                    <p className="staff-quals">{member.qualifications}</p>
                  </Card>
                ))
              )}
            </div>
          </div>
        )}

        {showModal && modalType === 'document' && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <h2>Добавить документ</h2>
              <div className="form-group">
                <label>Тип документа</label>
                <select value={documentForm.document_type} onChange={(e) => setDocumentForm({...documentForm, document_type: e.target.value})}>
                  <option value="certificate">Сертификат</option>
                  <option value="license">Лицензия</option>
                  <option value="diploma">Диплом</option>
                </select>
              </div>
              <div className="form-group">
                <label>Название</label>
                <input type="text" value={documentForm.title} onChange={(e) => setDocumentForm({...documentForm, title: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Дата выдачи</label>
                <input type="date" value={documentForm.issue_date} onChange={(e) => setDocumentForm({...documentForm, issue_date: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Файл документа</label>
                <input type="file" onChange={handleFileUpload} />
              </div>
              <div className="modal-actions">
                <button className="modal-button primary" onClick={handleAddDocument}>Добавить</button>
                <button className="modal-button secondary" onClick={() => setShowModal(false)}>Отмена</button>
              </div>
            </div>
          </div>
        )}

        {showModal && modalType === 'project' && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <h2>Добавить проект</h2>
              <div className="form-group">
                <label>Название проекта</label>
                <input type="text" value={projectForm.project_name} onChange={(e) => setProjectForm({...projectForm, project_name: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Заказчик</label>
                <input type="text" value={projectForm.client_name} onChange={(e) => setProjectForm({...projectForm, client_name: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Стоимость (₸)</label>
                <input type="number" value={projectForm.project_value} onChange={(e) => setProjectForm({...projectForm, project_value: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Дата начала</label>
                <input type="date" value={projectForm.start_date} onChange={(e) => setProjectForm({...projectForm, start_date: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Дата окончания</label>
                <input type="date" value={projectForm.end_date} onChange={(e) => setProjectForm({...projectForm, end_date: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Категория</label>
                <input type="text" value={projectForm.category} onChange={(e) => setProjectForm({...projectForm, category: e.target.value})} />
              </div>
              <div className="modal-actions">
                <button className="modal-button primary" onClick={handleAddProject}>Добавить</button>
                <button className="modal-button secondary" onClick={() => setShowModal(false)}>Отмена</button>
              </div>
            </div>
          </div>
        )}

        {showModal && modalType === 'staff' && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <h2>Добавить сотрудника</h2>
              <div className="form-group">
                <label>ФИО</label>
                <input type="text" value={staffForm.full_name} onChange={(e) => setStaffForm({...staffForm, full_name: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Должность</label>
                <input type="text" value={staffForm.position} onChange={(e) => setStaffForm({...staffForm, position: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Квалификация</label>
                <input type="text" value={staffForm.qualifications} onChange={(e) => setStaffForm({...staffForm, qualifications: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Опыт работы (лет)</label>
                <input type="number" value={staffForm.experience_years} onChange={(e) => setStaffForm({...staffForm, experience_years: e.target.value})} />
              </div>
              <div className="modal-actions">
                <button className="modal-button primary" onClick={handleAddStaff}>Добавить</button>
                <button className="modal-button secondary" onClick={() => setShowModal(false)}>Отмена</button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .qualifications-page {
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

        .ai-score-card {
          padding: 20px;
          margin-bottom: 24px;
          border: 2px solid #10b981;
        }

        .ai-score-content {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .ai-score-icon {
          color: #10b981;
          width: 48px;
          height: 48px;
        }

        .ai-score {
          font-size: 2rem;
          font-weight: 700;
          color: #10b981;
          margin: 8px 0 0 0;
        }

        .tabs {
          display: flex;
          gap: 8px;
          margin-bottom: 24px;
          background: white;
          padding: 8px;
          border-radius: 8px;
        }

        .tab {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 24px;
          border: none;
          background: transparent;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
          color: #6b7280;
          transition: all 0.2s;
        }

        .tab.active {
          background: #1e40af;
          color: white;
        }

        .tab:hover {
          background: rgba(30, 64, 175, 0.1);
        }

        .tab-content {
          background: white;
          padding: 24px;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .section-header h2 {
          font-size: 1.25rem;
          font-weight: 600;
          color: #1a1a1a;
          margin: 0;
        }

        .add-button {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          background: #1e40af;
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .add-button:hover {
          background: #1e3a8a;
        }

        .items-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 16px;
        }

        .item-card {
          padding: 20px;
          border: 1px solid #e5e7eb;
        }

        .item-card h3 {
          font-size: 1rem;
          font-weight: 600;
          color: #1a1a1a;
          margin: 0 0 8px 0;
        }

        .item-card p {
          font-size: 0.875rem;
          color: #6b7280;
          margin: 4px 0;
        }

        .doc-type {
          text-transform: capitalize;
          color: #3b82f6;
          font-weight: 500;
        }

        .doc-date {
          font-size: 0.75rem;
        }

        .project-dates {
          font-size: 0.75rem;
          color: #9ca3af;
        }

        .staff-position {
          color: #3b82f6;
          font-weight: 500;
        }

        .staff-quals {
          font-style: italic;
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

        .form-group input,
        .form-group select {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 0.875rem;
          color: #1a1a1a;
          background: white;
        }

        .form-group input[type="file"] {
          padding: 8px;
        }

        .modal-actions {
          display: flex;
          gap: 12px;
          margin-top: 24px;
        }

        .modal-button {
          flex: 1;
          padding: 10px 20px;
          border: none;
          border-radius: 6px;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .modal-button.primary {
          background: #1e40af;
          color: white;
        }

        .modal-button.primary:hover {
          background: #1e3a8a;
        }

        .modal-button.secondary {
          background: white;
          color: #374151;
          border: 1px solid #d1d5db;
        }

        .modal-button.secondary:hover {
          background: #f9fafb;
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
          .qualifications-page {
            padding: 16px;
          }

          .items-grid {
            grid-template-columns: 1fr;
          }

          .tabs {
            flex-direction: column;
          }
        }
      `}</style>
    </Layout>
  );
};

export default ContractorQualifications;