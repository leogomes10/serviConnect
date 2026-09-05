import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';

// Módulos de rotas
import authRoutes from './routes/auth.routes';
import pedidosRoutes from './routes/pedidos.routes';
import moedasRoutes from './routes/moedas.routes';
import portfolioRoutes from './routes/portfolio.routes'; // <-- NOVO

const app = express();

app.use(cors());
app.use(express.json());

// Registro das rotas
app.use(authRoutes);
app.use(pedidosRoutes);
app.use(moedasRoutes);
app.use(portfolioRoutes); // <-- NOVO

const PORT = Number(process.env.PORT) || 5000;

// O '0.0.0.0' permite que o celular acesse pelo IP (192.168.5.109:5000)
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor ServiConnect rodando com sucesso na porta ${PORT}!`);
});