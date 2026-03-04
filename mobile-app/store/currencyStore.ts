import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface CurrencyInfo {
  code: string;
  symbol: string;
  label: string;
  locale: string;
}

export const CURRENCIES: CurrencyInfo[] = [
  { code: 'GBP', symbol: '£', label: 'British Pound',     locale: 'en-GB' },
  { code: 'USD', symbol: '$', label: 'US Dollar',          locale: 'en-US' },
  { code: 'EUR', symbol: '€', label: 'Euro',               locale: 'de-DE' },
  { code: 'ESP', symbol: 'E', label: 'Espees',             locale: 'en-GB' },
  { code: 'NGN', symbol: '₦', label: 'Nigerian Naira',     locale: 'en-NG' },
];

export const DEFAULT_CURRENCY = CURRENCIES[0]; // GBP

interface CurrencyState {
  currency: CurrencyInfo;
  setCurrency: (currency: CurrencyInfo) => void;
}

export const useCurrencyStore = create<CurrencyState>()(
  persist(
    (set) => ({
      currency: DEFAULT_CURRENCY,
      setCurrency: (currency) => set({ currency }),
    }),
    {
      name: 'currency-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
