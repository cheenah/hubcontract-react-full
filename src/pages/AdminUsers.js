import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { AppContext } from '@/App';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle, XCircle, Search, Edit, Trash2, Eye } from 'lucide-react';

const AdminUsers = () => {
  const { API } = React.useContext(AppContext);
  const [customers, setCustomers] = useState([]);
  const [contractors, setContractors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const usersRes = await axios.get(`${API}/admin/users`);
      const allUsers = usersRes.data;
      
      setCustomers(allUsers.filter(u => u.role === 'customer'));
      setContractors(allUsers.filter(u => u.role === 'contractor'));
    } catch (error) {
      toast.error('Ошибка загрузки пользователей');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (userId, verified) => {
    try {
      await axios.put(`${API}/admin/users/${userId}/verify`, { verified });
      toast.success(verified ? 'Пользователь верифицирован' : 'Верификация отменена');
      fetchUsers();
    } catch (error) {
      toast.error('Ошибка изменения статуса');
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Вы уверены что хотите удалить этого пользователя?')) return;
    
    try {
      await axios.delete(`${API}/admin/users/${userId}`);
      toast.success('Пользователь удален');
      fetchUsers();
    } catch (error) {
      toast.error('Ошибка удаления пользователя');
    }
  };

  const UserTable = ({ users, title }) => {
    const filteredUsers = users.filter(user => 
      searchTerm === '' ||
      user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.company_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <Input
              placeholder="Поиск пользователей..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">Загрузка...</div>
        ) : filteredUsers.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-gray-500">Пользователи не найдены</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredUsers.map((user) => (
              <Card key={user.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-lg">{user.full_name || user.email}</h3>
                      {user.verified ? (
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full flex items-center gap-1">
                          <CheckCircle size={14} /> Верифицирован
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full flex items-center gap-1">
                          <XCircle size={14} /> Не верифицирован
                        </span>
                      )}
                    </div>
                    <div className="mt-2 grid grid-cols-2 gap-4 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Email:</span> {user.email}
                      </div>
                      <div>
                        <span className="font-medium">Компания:</span> {user.company_name || 'Не указана'}
                      </div>
                      <div>
                        <span className="font-medium">Телефон:</span> {user.phone || 'Не указан'}
                      </div>
                      <div>
                        <span className="font-medium">БИН:</span> {user.company_bin || 'Не указан'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {user.verified ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleVerify(user.id, false)}
                        className="text-orange-600 hover:text-orange-700"
                      >
                        <XCircle size={16} className="mr-1" />
                        Отменить верификацию
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleVerify(user.id, true)}
                        className="text-green-600 hover:text-green-700"
                      >
                        <CheckCircle size={16} className="mr-1" />
                        Верифицировать
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(user.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Управление пользователями</h1>
          <p className="text-gray-600">Просмотр и управление всеми пользователями платформы</p>
        </div>

        <Card className="p-6">
          <Tabs defaultValue="customers" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="customers">
                Заказчики ({customers.length})
              </TabsTrigger>
              <TabsTrigger value="contractors">
                Исполнители ({contractors.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="customers">
              <UserTable users={customers} title="Заказчики" />
            </TabsContent>

            <TabsContent value="contractors">
              <UserTable users={contractors} title="Исполнители" />
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </Layout>
  );
};

export default AdminUsers;
