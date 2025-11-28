import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { LanguageCode, CurrencyCode } from '@/types';

interface UIState {
  // Preferences
  language: LanguageCode;
  currency: CurrencyCode;
  isPrivacyEnabled: boolean;
  
  // Actions
  setLanguage: (lang: LanguageCode) => void;
  setCurrency: (curr: CurrencyCode) => void;
  togglePrivacy: () => void;
  
  // Modal State Management (Global)
  activeModal: string | null;
  modalData: any | null;
  openModal: (modalId: string, data?: any) => void;
  closeModal: () => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      language: 'pt',
      currency: 'EUR',
      isPrivacyEnabled: false,
      activeModal: null,
      modalData: null,

      setLanguage: (language) => set({ language }),
      setCurrency: (currency) => set({ currency }),
      togglePrivacy: () => set((state) => ({ isPrivacyEnabled: !state.isPrivacyEnabled })),
      
      openModal: (modalId, data = null) => set({ activeModal: modalId, modalData: data }),
      closeModal: () => set({ activeModal: null, modalData: null }),
    }),
    {
      name: 'financeflow-ui-storage',
      partialize: (state) => ({ 
        language: state.language, 
        currency: state.currency, 
        isPrivacyEnabled: state.isPrivacyEnabled 
      }), // Only persist preferences, not modal state
    }
  )
);