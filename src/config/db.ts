import dotenv from 'dotenv'; // Importa a biblioteca para carregar variáveis de ambiente
dotenv.config(); // Inicializa as variáveis do arquivo .env no process.env

import { Pool } from 'pg'; // Importa a classe Pool do driver PostgreSQL

// Exporta a instância do Pool para ser reutilizada em todos os arquivos de rotas
export const pool = new Pool({
  user: process.env.DB_USER || 'postgres', // Define o usuário do banco (ou 'postgres' como padrão)
  host: process.env.DB_HOST || 'localhost', // Define o endereço do servidor (ou 'localhost' como padrão)
  database: process.env.DB_NAME || 'serviconnect_db', // Define o nome do banco de dados
  password: String(process.env.DB_PASSWORD), // Converte a senha para formato string por segurança
  port: Number(process.env.DB_PORT) || 5432, // Converte a porta para número (padrão 5432)
});