import express from "express"; // importa o framework para criar e gerenciar o servidor web
import cors from "cors"; // importa o cors para permitir que o front-end acesse esta API de diferentes origens
import { Pool } from "pg"; // importa a classe pool do pacote 'pg' para gerenciar a conexão com o banco postgreSQL
import dotenv from 'dotenv'; // importa o dotenv para carregar as variaveis de ambiente do arquivo .env

dotenv.config(); // configura o dotenv para que as variaveis do arquivo .env fiquem disponiveis no processo.env

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

// Rota para listar profissionais (usada pela CustomerView)
app.get("/profissionais", async (req, res) => {
  try {
    // Buscando apenas os campos necessários, sem a antiga coluna de preços
    const { rows } = await pool.query(
      "SELECT id, nome, email, especialidade FROM profissionais ORDER BY id DESC"
    );
    res.json(rows); 
  } catch (err) { 
    console.error("ERRO DETALHADO NO BANCO:", err); 
    res.status(500).json({ error: "Erro interno no servidor" });
  }
});

// Rota para cadastrar novo profissional
app.post("/cadastro-profissional", async (req, res) => {
  const { nome, email, senha, categoria } = req.body; // Recebe os dados do formulário frontend

  try {
    const queryText = `
      INSERT INTO profissionais (nome, email, senha, especialidade)
      VALUES ($1, $2, $3, $4)
      RETURNING id, nome, email, especialidade;
    `;
    
    // Mapeia a 'categoria' do front para a coluna 'especialidade' do banco
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

// Rota para o profissional fazer login
app.post("/login-profissional", async (req, res) => {
  const { email, senha } = req.body; // Pega os dados vindos do formulário de login

  try {
    // 1. Procura o profissional no banco pelo e-mail
    const { rows } = await pool.query("SELECT * FROM profissionais WHERE email = $1", [email]);

    // 2. Se não encontrar ninguém, retorna erro
    if (rows.length === 0) {
      return res.status(401).json({ error: "E-mail não encontrado!" });
    }

    const profissional = rows[0];

    // 3. Compara a senha digitada com a senha do banco
    if (profissional.senha !== senha) {
      return res.status(401).json({ error: "Senha incorreta!" });
    }

    // 4. Se der tudo certo, manda os dados de volta (menos a senha)
    console.log(`✅ Login realizado: ${profissional.nome}`);
    res.json({
      id: profissional.id,
      nome: profissional.nome,
      especialidade: profissional.especialidade
    });

  } catch (err) {
    console.error("❌ ERRO NO LOGIN:", err);
    res.status(500).json({ error: "Erro interno no servidor ao tentar logar." });
  }
});

// Rota para o painel do profissional buscar os seus chamados específicos
app.get("/chamados/profissional/:id", async (req, res) => {
  const { id } = req.params; // Pega o ID do profissional que veio na URL

  try {
    const { rows } = await pool.query(
      "SELECT id, nome_cliente, descricao_servico, status, data_criacao FROM chamados WHERE profissional_id = $1 ORDER BY id DESC",
      [id]
    );
    res.json(rows); // Devolve a lista de chamados achados para o frontend
  } catch (err) {
    console.error("❌ ERRO AO BUSCAR CHAMADOS:", err);
    res.status(500).json({ error: "Erro interno ao buscar chamados no servidor." });
  }
});

app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));