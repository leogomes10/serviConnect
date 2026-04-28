export interface Service {
  id: number;
  nome: string;
  servico: string;
  avaliacao: string;
  valor_hora: number;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'client' | 'provider';
}
