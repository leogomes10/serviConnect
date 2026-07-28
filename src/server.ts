import dotenv from 'dotenv'; // Importa a biblioteca dotenv para inicialização de variáveis
dotenv.config(); // Carrega o arquivo de ambiente .env no processo Node

import express from 'express'; // Importa o servidor web Express
import cors from 'cors'; // Importa o middleware CORS de segurança

// Importa os arquivos com os módulos de rotas separados
import authRoutes from './routes/auth.routes'; // Importa as rotas de Cadastro e Login
import pedidosRoutes from './routes/pedidos.routes'; // Importa as rotas de Pedidos e Leads
import moedasRoutes from './routes/moedas.routes'; // Importa as rotas de Pix e Recarga

const app = express(); // Instancia a aplicação do servidor Express

// Middlewares Globais da Aplicação
app.use(cors()); // Ativa o CORS para permitir requisições do frontend React
app.use(express.json()); // Ativa o interpretador automático de JSON nas requisições

// Registro e conexão de todas as rotas no app Express
app.use(authRoutes); // Conecta as rotas de autenticação
app.use(pedidosRoutes); // Conecta as rotas de pedidos e compra de leads
app.use(moedasRoutes); // Conecta as rotas de moedas e Pix

// Configuração da porta de execução
const PORT = process.env.PORT || 5000; // Define a porta vinda do .env ou usa 5000 por padrão

// Inicia o servidor e coloca a aplicação para escutar a porta definida
app.listen(PORT, () => { // Inicialização do servidor HTTP
  console.log(`🚀 Servidor ServiConnect rodando com sucesso na porta ${PORT}!`); // Log no terminal confirmando a execução
}); // Finaliza escuta do servidor