import express from "express";
import cors from "cors";
import path from "path";
import { createServer as createViteServer } from "vite";
import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

// Configuração do Pool do PostgreSQL
// Em produção, utilize variáveis de ambiente
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // --- API ROUTES ---

  // Rota de saúde e teste de banco
  app.get("/api/health", async (req, res) => {
    try {
      await pool.query("SELECT NOW()");
      res.json({ status: "ok", db: "connected" });
    } catch (err) {
      res.status(500).json({ status: "error", db: "disconnected", message: (err as Error).message });
    }
  });

  // Listagem de serviços (Exemplo inicial)
  app.get("/api/services", async (req, res) => {
    try {
      // Mock de dados caso o banco não esteja configurado
      // Em um ambiente real, seria: const result = await pool.query("SELECT * FROM services");
      const mockServices = [
        { id: 1, title: "Eletricista Residencial", provider: "João Silva", category: "Elétrica", price: 150 },
        { id: 2, title: "Reparo de Vazamentos", provider: "Maria Souza", category: "Hidráulica", price: 120 },
        { id: 3, title: "Pintura de Paredes", provider: "Carlos Lima", category: "Pintura", price: 300 },
      ];
      res.json(mockServices);
    } catch (err) {
      res.status(500).json({ message: "Erro ao buscar serviços" });
    }
  });

  // --- VITE MIDDLEWARE ---

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
  });
}

startServer();
