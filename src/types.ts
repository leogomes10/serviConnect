export interface Service {
  id: number;
  title: string;
  provider: string;
  category: string;
  price: number;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'client' | 'provider';
}
