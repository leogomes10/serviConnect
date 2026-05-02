/* define a estrutura de um profissional de manutencao */
export interface Service {
  id: number;
  nome: string;
  servico: string;
  avaliacao: string;
  valor_hora: number;
}

/* define a estrutura do usuario que acessa o sitema */
export interface User {
  id: number;
  name: string;
  email: string;
  /* o cargo SÓ pode ser um desses dois valores especificos */
  role: 'client' | 'provider';
}
