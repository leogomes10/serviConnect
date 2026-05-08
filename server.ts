import express from "express"; //importa o framework para criar e gerenciar o servidor web
import cors from "cors"; //importa o cors para permitir que o front-end acesse esta API de diferentes origens
import { Pool } from "pg"; //importa a classe pool do pacote 'pg' para gerenciar a conexão com o banco postgreSQL
import dotenv from 'dotenv'; //importa o dotenv para carregar as variaveis de ambiente do arquivo .env

dotenv.config(); //configura o dotenv para que as variaveis do arquivo .env fiqeum disponives non processo.env


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

// Rota para cadastrar novo profissional
app.post("/cadastro-profissional", async (req, res) => {
  const { nome, email, senha, categoria } = req.body; // Recebe os dados do formulário

  try {
    const queryText = `
      INSERT INTO profissionais (nome, email, senha, especialidade)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;
    
    const values = [nome, email, senha, categoria];
    const result = await pool.query(queryText, values);

    console.log("✅ Novo profissional salvo:", result.rows[0].nome);

    res.status(201).json({ 
      mensagem: "Profissional cadastrado com sucesso!", 
      profissional: result.rows[0] 
    });
    
  } catch (err: any) {
    if (err.code === '23505') { // Erro de e-mail duplicado no Postgres
      return res.status(400).json({ erro: "Este e-mail já está cadastrado." });
    }
    console.error("❌ ERRO NO CADASTRO:", err);
    res.status(500).json({ erro: "Erro ao salvar no banco de dados." });
  }
});

app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));