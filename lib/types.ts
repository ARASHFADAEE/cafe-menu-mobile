export type Category = {
  id: string;
  name: string;
  order: number;
};

export type Product = {
  id: number;
  name: string;
  desc: string;
  price: number;
  category: string;
  tag: string;
  image: string;
  active: boolean;
};

export type Banner = {
  id: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  ctaLabel: string;
  image: string;
  badge: string;
  active: boolean;
};

export type CafeInfo = {
  name: string;
  tagline: string;
  phone: string;
  phoneDisplay: string;
  address: string;
  hours: string;
  lat: number;
  lng: number;
  instagram: string;
};

export type AppData = {
  cafe: CafeInfo;
  categories: Category[];
  products: Product[];
  banners: Banner[];
};

export const ADMIN_PASSWORD = 'estila2024';
export const STORAGE_KEY = 'estila-cafe-data-v1';
export const AUTH_KEY = 'estila-admin-auth';
