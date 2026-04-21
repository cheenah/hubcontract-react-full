import { create } from 'zustand';
import { BASE_URL } from '@/services/api';

const DICT_TYPES = [
  'company_type',
  'procurement_category',
  'procurement_quarter',
  'plan_status',
  'tender_type',
  'tender_category',
  'region',
];

const useDictionaryStore = create((set, get) => ({
  dictionaries: {
    company_type: [],
    procurement_category: [],
    procurement_quarter: [],
    plan_status: [],
    tender_type: [],
    tender_category: [],
    region: [],
  },
  isLoading: false,

  fetchInitial: async () => {
    if (get().isLoading) return;
    set({ isLoading: true });
    try {
      const results = await Promise.all(
        DICT_TYPES.map((type) => apiClient.get(`/dictionaries/${type}`))
      );
      const dictionaries = {};
      DICT_TYPES.forEach((type, i) => {
        dictionaries[type] = results[i].data ?? [];
      });
      set({ dictionaries });
    } catch (err) {
      console.error('Dictionary fetch failed:', err);
    } finally {
      set({ isLoading: false });
    }
  },

  refreshDictionary: async (dictType, isAdmin = false) => {
    try {
      const url = isAdmin
        ? `/dictionaries/${dictType}/all`
        : `/dictionaries/${dictType}`;
      const res = await apiClient.get(url);
      set((state) => ({
        dictionaries: {
          ...state.dictionaries,
          [dictType]: res.data ?? [],
        },
      }));
    } catch (err) {
      console.error(`Dictionary refresh failed for ${dictType}:`, err);
    }
  },
}));

export default useDictionaryStore;
