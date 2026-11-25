'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { defaultData } from './defaults';
import {
  ADMIN_PASSWORD,
  AUTH_KEY,
  STORAGE_KEY,
  type AppData,
  type Banner,
  type CafeInfo,
  type Category,
  type Product,
} from './types';

type StoreValue = {
  data: AppData;
  ready: boolean;
  isAdmin: boolean;
  login: (password: string) => boolean;
  logout: () => void;
  resetData: () => void;
  updateCafe: (cafe: CafeInfo) => void;
  setCategories: (categories: Category[]) => void;
  upsertCategory: (category: Category) => void;
  deleteCategory: (id: string) => void;
  setProducts: (products: Product[]) => void;
  upsertProduct: (product: Product) => void;
  deleteProduct: (id: number) => void;
  setBanners: (banners: Banner[]) => void;
  upsertBanner: (banner: Banner) => void;
  deleteBanner: (id: string) => void;
};

const StoreContext = createContext<StoreValue | null>(null);

function loadData(): AppData {
  if (typeof window === 'undefined') return defaultData;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultData;
    const parsed = JSON.parse(raw) as AppData;
    return {
      ...defaultData,
      ...parsed,
      cafe: { ...defaultData.cafe, ...parsed.cafe },
      categories: parsed.categories?.length ? parsed.categories : defaultData.categories,
      products: parsed.products?.length ? parsed.products : defaultData.products,
      banners: parsed.banners?.length ? parsed.banners : defaultData.banners,
    };
  } catch {
    return defaultData;
  }
}

export function DataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(defaultData);
  const [ready, setReady] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    setData(loadData());
    setIsAdmin(sessionStorage.getItem(AUTH_KEY) === '1');
    setReady(true);
  }, []);

  const persist = useCallback((next: AppData) => {
    setData(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }, []);

  const login = useCallback((password: string) => {
    if (password === ADMIN_PASSWORD) {
      sessionStorage.setItem(AUTH_KEY, '1');
      setIsAdmin(true);
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem(AUTH_KEY);
    setIsAdmin(false);
  }, []);

  const resetData = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    persist(structuredClone(defaultData));
  }, [persist]);

  const value = useMemo<StoreValue>(
    () => ({
      data,
      ready,
      isAdmin,
      login,
      logout,
      resetData,
      updateCafe: (cafe) => persist({ ...data, cafe }),
      setCategories: (categories) => persist({ ...data, categories }),
      upsertCategory: (category) => {
        const exists = data.categories.some((c) => c.id === category.id);
        const categories = exists
          ? data.categories.map((c) => (c.id === category.id ? category : c))
          : [...data.categories, category];
        persist({ ...data, categories });
      },
      deleteCategory: (id) => {
        if (id === 'all') return;
        persist({ ...data, categories: data.categories.filter((c) => c.id !== id) });
      },
      setProducts: (products) => persist({ ...data, products }),
      upsertProduct: (product) => {
        const exists = data.products.some((p) => p.id === product.id);
        const products = exists
          ? data.products.map((p) => (p.id === product.id ? product : p))
          : [...data.products, product];
        persist({ ...data, products });
      },
      deleteProduct: (id) => persist({ ...data, products: data.products.filter((p) => p.id !== id) }),
      setBanners: (banners) => persist({ ...data, banners }),
      upsertBanner: (banner) => {
        const exists = data.banners.some((b) => b.id === banner.id);
        const banners = exists
          ? data.banners.map((b) => (b.id === banner.id ? banner : b))
          : [...data.banners, banner];
        persist({ ...data, banners });
      },
      deleteBanner: (id) => persist({ ...data, banners: data.banners.filter((b) => b.id !== id) }),
    }),
    [data, ready, isAdmin, login, logout, resetData, persist],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within DataProvider');
  return ctx;
}
