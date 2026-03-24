import React, { useState, useEffect } from 'react';
import { AppContext } from '@/App';
import { useLanguage } from '@/context/LanguageContext';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageSquare, Bell, Mail, Send, Search, Filter } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const Communications = () => {
  const { user, API } = React.useContext(AppContext);
  const { t } = useLanguage();
  const [messages, setMessages] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCommunications();
  }, []);

  const fetchCommunications = async () => {
    setLoading(true);
    try {
      const [messagesRes, notificationsRes] = await Promise.all([
        axios.get(`${API}/messages`),
        axios.get(`${API}/notifications`)
      ]);
      
      setMessages(messagesRes.data);
      setNotifications(notificationsRes.data);
    } catch (error) {
      console.error('Error fetching communications:', error);
      setMessages([]);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      await axios.post(`${API}/messages`, {
        conversation_id: selectedConversation.id,
        message: newMessage
      });
      toast.success('Сообщение отправлено');
      setNewMessage('');
      fetchCommunications();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Ошибка при отправке сообщения');
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await axios.put(`${API}/notifications/${notificationId}/read`);
      fetchCommunications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'new_bid':
        return '📩';
      case 'deadline_soon':
        return '⏰';
      case 'contract_signed':
        return '✅';
      case 'message':
        return '💬';
      default:
        return '🔔';
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return `${diffMins} минут назад`;
    } else if (diffHours < 24) {
      return `${diffHours} часов назад`;
    } else if (diffDays === 1) {
      return 'вчера';
    } else {
      return date.toLocaleDateString('ru-RU');
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
      <div className="communications-container">
        <div className="page-header">
          <h1 className="page-title">Коммуникации</h1>
          <p className="page-subtitle">Сообщения и уведомления</p>
        </div>

        <Tabs defaultValue="messages" className="communications-tabs">
          <TabsList>
            <TabsTrigger value="messages">
              <MessageSquare size={18} />
              Сообщения
              {messages.filter(m => m.unread_count > 0).length > 0 && (
                <span className="unread-badge">
                  {messages.reduce((sum, m) => sum + m.unread_count, 0)}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="notifications">
              <Bell size={18} />
              Уведомления
              {notifications.filter(n => !n.read).length > 0 && (
                <span className="unread-badge">
                  {notifications.filter(n => !n.read).length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="messages">
            <div className="messages-layout">
              {/* Conversations List */}
              <Card className="conversations-panel">
                <div className="panel-header">
                  <h3 className="panel-title">Диалоги</h3>
                  <div className="search-box">
                    <Search size={16} />
                    <Input placeholder="Поиск..." />
                  </div>
                </div>
                <div className="conversations-list">
                  {messages.map((conversation) => (
                    <div
                      key={conversation.id}
                      className={`conversation-item ${selectedConversation?.id === conversation.id ? 'active' : ''} ${conversation.unread_count > 0 ? 'unread' : ''}`}
                      onClick={() => setSelectedConversation(conversation)}
                    >
                      <div className="conversation-avatar">
                        <MessageSquare size={20} />
                      </div>
                      <div className="conversation-details">
                        <div className="conversation-header">
                          <h4 className="conversation-title">{conversation.participant_name}</h4>
                          <span className="conversation-time">{formatTime(conversation.last_message_at)}</span>
                        </div>
                        <p className="conversation-tender">{conversation.tender_title}</p>
                        <p className="conversation-preview">{conversation.last_message}</p>
                      </div>
                      {conversation.unread_count > 0 && (
                        <span className="message-unread-badge">{conversation.unread_count}</span>
                      )}
                    </div>
                  ))}
                </div>
              </Card>

              {/* Message Thread */}
              <Card className="messages-panel">
                {selectedConversation ? (
                  <>
                    <div className="panel-header">
                      <div>
                        <h3 className="panel-title">{selectedConversation.participant_name}</h3>
                        <p className="panel-subtitle">{selectedConversation.tender_title}</p>
                      </div>
                    </div>
                    <div className="messages-content">
                      <div className="messages-empty">
                        <MessageSquare size={48} className="empty-icon" />
                        <p>Выберите диалог для просмотра сообщений</p>
                        <p className="empty-note">Функционал отправки сообщений будет доступен после подключения к backend</p>
                      </div>
                    </div>
                    <div className="message-input-area">
                      <Textarea
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Введите сообщение..."
                        rows={2}
                      />
                      <Button onClick={handleSendMessage} className="send-btn">
                        <Send size={18} />
                        Отправить
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="no-conversation-selected">
                    <MessageSquare size={64} className="empty-icon" />
                    <h3>Выберите диалог</h3>
                    <p>Выберите диалог из списка слева для просмотра сообщений</p>
                  </div>
                )}
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="notifications">
            <Card className="notifications-panel">
              <div className="panel-header">
                <h3 className="panel-title">Все уведомления</h3>
                <Button variant="outline" size="sm">
                  Отметить все как прочитанные
                </Button>
              </div>
              <div className="notifications-list">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`notification-item ${notification.read ? 'read' : 'unread'}`}
                    onClick={() => !notification.read && markAsRead(notification.id)}
                  >
                    <div className="notification-icon">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="notification-content">
                      <div className="notification-header">
                        <h4 className="notification-title">{notification.title}</h4>
                        <span className="notification-time">{formatTime(notification.created_at)}</span>
                      </div>
                      <p className="notification-message">{notification.message}</p>
                    </div>
                    {!notification.read && <div className="notification-unread-dot"></div>}
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <style jsx>{`
        .communications-container {
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

        .communications-tabs {
          width: 100%;
        }

        .unread-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 20px;
          height: 20px;
          padding: 0 6px;
          background: var(--danger);
          color: white;
          border-radius: 10px;
          font-size: 0.75rem;
          font-weight: 600;
          margin-left: 8px;
        }

        .messages-layout {
          display: grid;
          grid-template-columns: 400px 1fr;
          gap: 24px;
          height: 700px;
        }

        .conversations-panel,
        .messages-panel {
          background: white;
          border: 1px solid var(--border-light);
          border-radius: 8px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        .panel-header {
          padding: 20px 24px;
          border-bottom: 1px solid var(--border-light);
        }

        .panel-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 12px;
        }

        .panel-subtitle {
          font-size: 0.875rem;
          color: var(--text-secondary);
          margin: 0;
        }

        .search-box {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .conversations-list {
          flex: 1;
          overflow-y: auto;
        }

        .conversation-item {
          display: flex;
          gap: 12px;
          padding: 16px 24px;
          border-bottom: 1px solid var(--border-light);
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative;
        }

        .conversation-item:hover {
          background: var(--bg-hover);
        }

        .conversation-item.active {
          background: rgba(30, 64, 175, 0.05);
          border-left: 3px solid var(--primary);
        }

        .conversation-item.unread {
          background: rgba(30, 64, 175, 0.02);
        }

        .conversation-avatar {
          width: 48px;
          height: 48px;
          background: rgba(30, 64, 175, 0.1);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--primary);
          flex-shrink: 0;
        }

        .conversation-details {
          flex: 1;
          min-width: 0;
        }

        .conversation-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 4px;
        }

        .conversation-title {
          font-size: 1rem;
          font-weight: 600;
          color: var(--text-primary);
          margin: 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .conversation-time {
          font-size: 0.75rem;
          color: var(--text-muted);
          flex-shrink: 0;
          margin-left: 8px;
        }

        .conversation-tender {
          font-size: 0.75rem;
          color: var(--primary);
          margin: 0 0 4px 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .conversation-preview {
          font-size: 0.875rem;
          color: var(--text-secondary);
          margin: 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .message-unread-badge {
          position: absolute;
          right: 16px;
          top: 50%;
          transform: translateY(-50%);
          min-width: 24px;
          height: 24px;
          background: var(--danger);
          color: white;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.75rem;
          font-weight: 600;
          padding: 0 8px;
        }

        .messages-content {
          flex: 1;
          overflow-y: auto;
          padding: 24px;
        }

        .messages-empty {
          text-align: center;
          padding: 60px 20px;
          color: var(--text-secondary);
        }

        .empty-icon {
          color: var(--text-muted);
          margin-bottom: 16px;
        }

        .empty-note {
          font-size: 0.875rem;
          color: var(--text-muted);
          margin-top: 8px;
        }

        .message-input-area {
          padding: 16px 24px;
          border-top: 1px solid var(--border-light);
          display: flex;
          gap: 12px;
          align-items: flex-end;
        }

        .send-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          background: var(--primary);
          color: white;
          flex-shrink: 0;
        }

        .no-conversation-selected {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          color: var(--text-secondary);
        }

        .no-conversation-selected h3 {
          font-size: 1.5rem;
          color: var(--text-primary);
          margin: 16px 0 8px 0;
        }

        .notifications-panel {
          background: white;
          border: 1px solid var(--border-light);
          border-radius: 8px;
        }

        .notifications-list {
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .notification-item {
          display: flex;
          gap: 16px;
          padding: 20px;
          background: var(--bg-tertiary);
          border-radius: 8px;
          border: 1px solid var(--border-light);
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative;
        }

        .notification-item.unread {
          background: rgba(30, 64, 175, 0.05);
          border-left: 3px solid var(--primary);
        }

        .notification-item:hover {
          border-color: var(--border-medium);
          box-shadow: var(--shadow-sm);
        }

        .notification-icon {
          font-size: 2rem;
          flex-shrink: 0;
        }

        .notification-content {
          flex: 1;
        }

        .notification-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }

        .notification-title {
          font-size: 1rem;
          font-weight: 600;
          color: var(--text-primary);
          margin: 0;
        }

        .notification-time {
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .notification-message {
          font-size: 0.875rem;
          color: var(--text-secondary);
          line-height: 1.5;
          margin: 0;
        }

        .notification-unread-dot {
          width: 10px;
          height: 10px;
          background: var(--primary);
          border-radius: 50%;
          position: absolute;
          right: 16px;
          top: 50%;
          transform: translateY(-50%);
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
          border: 3px solid var(--border-light);
          border-top: 3px solid var(--primary);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @media (max-width: 1024px) {
          .messages-layout {
            grid-template-columns: 1fr;
            height: auto;
          }

          .conversations-panel {
            height: 400px;
          }

          .messages-panel {
            height: 500px;
          }
        }

        @media (max-width: 768px) {
          .message-input-area {
            flex-direction: column;
            align-items: stretch;
          }

          .send-btn {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </Layout>
  );
};

export default Communications;
