import express from "express"; // importa o framework para criar e gerenciar o servidor web
import cors from "cors"; // importa o cors para permitir que o front-end acesse esta API de diferentes origens
import { Pool } from "pg"; // importa a classe pool do pacote 'pg' para gerenciar a conexão com o banco postgreSQL
import dotenv from 'dotenv'; // importa o dotenv para carregar as variaveis de ambiente do arquivo .env
import bcrypt from "bcrypt";

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

// =================================================================
// ROTA ATUALIZADA: Cadastrar novo profissional com senha protegida
// =================================================================
app.post("/cadastro-profissional", async (req, res) => {
  const { nome, email, senha, categoria } = req.body;

  // Validação para garantir que nenhum campo chegue vazio
  if (!nome || !email || !senha || !categoria) {
    return res.status(400).json({ erro: "Todos os campos são obrigatórios." });
  }

  try {
    // 🔥 GERANDO O HASH DA SENHA:
    // O número 10 indica o custo computacional (Salt). Quanto maior, mais segura e mais demorada para gerar.
    const senhaCriptografada = await bcrypt.hash(senha, 10);

    const queryText = `
      INSERT INTO profissionais (nome, email, senha, especialidade)
      VALUES ($1, $2, $3, $4)
      RETURNING id, nome, email, especialidade;
    `;
    
    // Passamos a 'senhaCriptografada' no lugar da senha aberta ($3)
    const values = [nome, email, senhaCriptografada, categoria];
    const result = await pool.query(queryText, values);

    console.log("🔒 Novo profissional salvo com senha protegida:", result.rows[0].nome);

    res.status(201).json({ 
      mensagem: "Profissional cadastrado com sucesso!", 
      profissional: result.rows[0] 
    });
    
  } catch (err: any) {
    if (err.code === '23505') { 
      return res.status(400).json({ erro: "Este e-mail já está cadastrado." });
    }
    console.error("❌ ERRO NO CADASTRO:", err);
    res.status(500).json({ erro: "Erro ao salvar no banco de dados." });
  }
});

// =================================================================
// ROTA ATUALIZADA: Login comparando os hashes criptografados
// =================================================================
app.post("/login-profissional", async (req, res) => {
  const { email, senha } = req.body;

  try {
    const { rows } = await pool.query("SELECT * FROM profissionais WHERE email = $1", [email]);

    if (rows.length === 0) {
      return res.status(401).json({ error: "E-mail ou senha incorretos!" });
    }

    const profissional = rows[0];

    // 🔥 COMPARANDO A SENHA SEGURAMENTE:
    // Como a senha no banco é um hash irreconhecível, o bcrypt pega a senha digitada, 
    // gera o hash dela e compara internamente com o hash guardado.
    const senhaCorreta = await bcrypt.compare(senha, profissional.senha);

    if (!senhaCorreta) {
      return res.status(401).json({ error: "E-mail ou senha incorretos!" });
    }

    console.log(`✅ Login realizado de forma segura: ${profissional.nome}`);
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
//Rota para o cliente criar um novo agendamento (botão reservar)
app.post("/chamados", async (req, res) => {
  //pegamos os dados que o frontend enviou no corpo da requisição (req.body)
  const {nome_cliente, descricao_servico, profissional_id} = req.body;

  //validação simples: garante que o front enviou tudo que é obrigatório
  if(!nome_cliente || !descricao_servico || !profissional_id) {
    return res.status(400).json({error: "por favor, preencha todos os campos obrigatórios!"});
  }
  
  try {
    //2. Fazemos a query SQL para inserir o chamado no banco de dados
    // Usamos o RETURNING * para o POSTGRES ja devolver o chamado criado com o ID gerado automaticamente
    const querySQL = `
    INSERT INTO chamados (nome_cliente, descricao_servico, profissional_id, status)
    VALUES ($1, $2, $3, 'pending')
    RETURNING *
    `;

    //Passamos os valores de um array para evitar problemas de segurança (SQL injection)
    const valores = [nome_cliente, descricao_servico, profissional_id];

    const { rows } = await pool.query(querySQL, valores);

    //3. pegamos p chamado recém criado (posição 0 do retorno)
    const novoChamado = rows[0];

    console.log(`✨ Novo chamado criado com sucesso para o profissional ID: ${profissional_id}`);

    //4 Respondemos ao front-end com status 21 (CRIADO) e os dados do chamdado
    res.status(201).json(novoChamado);
  } catch (err) {
    console.log("Erro ao criar chamado no banco de dados:", err);
    res.status(500).json({error: "Erro interno no servidor ao tentar agendar."})
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

// Rota do Painel do Administrador (Estatísticas globais + Listagem completa)
app.post("/admin/dashboard", async (req, res) => {
  // Nota: No futuro, colocaremos a validação do Token JWT aqui para garantir que só o admin acesse!
  try {
    // 1. Buscamos a contagem total de profissionais cadastrados
    const totalProfissionais = await pool.query("SELECT COUNT(*) FROM profissionais");
    
    // 2. Buscamos a contagem total de chamados criados no sistema
    const totalChamados = await pool.query("SELECT COUNT(*) FROM chamados");

    // 3. Buscamos a lista completa de todos os chamados para exibir na tabela do admin
    const listaCompletaChamados = await pool.query(`
      SELECT id, nome_cliente, descricao_servico, status, data_criacao 
      FROM chamados 
      ORDER BY id DESC
    `);

    // 4. Respondemos ao front com o consolidado de dados
    res.json({
      estatisticas: {
        profissionais: parseInt(totalProfissionais.rows[0].count),
        chamados: parseInt(totalChamados.rows[0].count)
      },
      chamados: listaCompletaChamados.rows
    });

  } catch (err) {
    console.error("❌ Erro no dashboard do administrador:", err);
    res.status(500).json({ error: "Erro interno no servidor ao carregar painel admin." });
  }
});

app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));