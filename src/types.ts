/* define a estrutura de um profissional de manutencao */
export interface Service {
  id: number;
  provider_id: number;
  category: string;       
  price_estimate: number; 
  provider_name: string;
}

/* define a estrutura do usuario que acessa o sitema */
export interface User {
  id: number;
  name: string;
  email: string;
  /* o cargo SÓ pode ser um desses dois valores especificos */
  role: 'client' | 'provider';
}

export interface Profissional {
  id: number;
  nome: string;
  especialidade: string;
  preco: number;
  email: string;
}
