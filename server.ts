import express from "express";
import cors from "cors";
import { Pool } from "pg";
import dotenv from 'dotenv';  

dotenv.config();


const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'serviconnect_db',
  password: process.env.DB_PASSWORD, 
  port: 5432,
});

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Rota dos profissionais
app.get("/profissionais", async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM services");
    res.json(rows); // Isso DEVE retornar apenas texto/JSON
  } catch (err) { // 27. Captura o erro
  console.error("ERRO DETALHADO NO BANCO:", err); // 28. ISSO vai aparecer no terminal 'node'
  res.status(500).json({ error: "Erro interno no servidor" });
  }
});

app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));