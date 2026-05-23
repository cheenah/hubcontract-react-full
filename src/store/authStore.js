import { create } from 'zustand';
import { toast } from 'sonner';
import apiClient from '@/services/api';

const useAuthStore = create((set) => ({
  user: null,
  loading: true,

  setUser: (user) => set({ user }),

  checkAuth: async () => {
    const token = localStorage.getItem('token');
    if (!token) { set({ loading: false }); return; }
    try {
      const { data } = await apiClient.get('/auth/me');
      set({ user: data, loading: false });
    } catch {
      localStorage.removeItem('token');
      set({ user: null, loading: false });
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ user: null });
    toast.success('Вы вышли из системы');
  },
}));

// Вызывается Axios-интерцептором при истечении JWT в середине сессии
window.addEventListener('auth:logout', () => {
  useAuthStore.getState().setUser(null);
  toast.error('Сессия истекла. Пожалуйста, войдите снова.');
});

export default useAuthStore;
