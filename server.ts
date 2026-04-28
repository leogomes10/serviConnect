// No seu server.ts, simplifique assim:
import express from "express";
import cors from "cors";
import { Pool } from "pg";

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'serviconnect_db',
  password: 'Ok243300.', // A senha que alteramos no terminal
  port: 5432,
});

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Rota dos profissionais
app.get("/profissionais", async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM profissionais");
    res.json(rows); // Isso DEVE retornar apenas texto/JSON
  } catch (err) {
    res.status(500).json({ error: "Erro no banco" });
  }
});

app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));