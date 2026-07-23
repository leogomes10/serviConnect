import express from 'express';
import cors from 'cors';
import { Pool } from 'pg';
import bcrypt from 'bcrypt';

const app = express();
app.use(cors());
app.use(express.json());

// Configuração do Banco de Dados PostgreSQL
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'serviconnect_db',
  password: process.env.DB_PASSWORD || 'Ok243300.', // Insira sua senha do Postgres aqui se necessário
  port: Number(process.env.DB_PORT) || 5432,
});

// ==========================================
// 1. ROTAS DE AUTENTICAÇÃO E PROFISSIONAIS
// ==========================================

// Cadastro de Profissional (com Hash de Senha e Bônus de 50 Moedas)
app.post('/cadastrar-profissional', async (req, res) => {
  const { nome, email, senha, especialidade, preco, role } = req.body;

  try {
    // Criptografa a senha antes de salvar
    const senhaHash = await bcrypt.hash(senha, 10);

    const query = `
      INSERT INTO profissionais (nome, email, senha, especialidade, preco, role, saldo_moedas)
      VALUES ($1, $2, $3, $4, $5, $6, 50)
      RETURNING id, nome, email, especialidade, saldo_moedas;
    `;
    const values = [nome, email, senhaHash, especialidade, preco || null, role || 'provider'];
    const result = await pool.query(query, values);

    return res.status(201).json({
      message: 'Profissional cadastrado com sucesso!',
      user: result.rows[0]
    });
  } catch (error: any) {
    console.error('Erro no cadastro:', error);
    if (error.code === '23505') { // Erro de e-mail duplicado no Postgres
      return res.status(400).json({ error: 'E-mail já cadastrado.' });
    }
    return res.status(500).json({ error: 'Erro interno ao cadastrar profissional.' });
  }
});

// Login de Profissional (Suporta senhas com bcrypt ou legadas)
app.post('/login-profissional', async (req, res) => {
  const { email, senha } = req.body;

  try {
    const result = await pool.query('SELECT * FROM profissionais WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'E-mail ou senha incorretos!' });
    }

    const usuario = result.rows[0];

    // Validação da senha (compara bcrypt ou texto limpo caso seja registro antigo)
    let senhaValida = false;
    if (usuario.senha.startsWith('$2b$')) {
      senhaValida = await bcrypt.compare(senha, usuario.senha);
    } else {
      senhaValida = usuario.senha === senha;
    }

    if (!senhaValida) {
      return res.status(400).json({ error: 'E-mail ou senha incorretos!' });
    }

    // Retorna os dados do usuário sem expor o hash da senha
    const { senha: _, ...dadosUsuario } = usuario;
    return res.json({ message: 'Login realizado com sucesso!', user: dadosUsuario });

  } catch (error) {
    console.error('Erro no login:', error);
    return res.status(500).json({ error: 'Erro interno no servidor.' });
  }
});

// Listagem/Busca de Profissionais por Especialidade ou Nome
app.get('/profissionais', async (req, res) => {
  const { busca } = req.query;

  try {
    let query = 'SELECT id, nome, email, especialidade, preco, data_cadastro, saldo_moedas FROM profissionais';
    let params: any[] = [];

    if (busca) {
      query += ' WHERE nome ILIKE $1 OR especialidade ILIKE $1';
      params.push(`%${busca}%`);
    }

    const result = await pool.query(query, params);
    return res.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar profissionais:', error);
    return res.status(500).json({ error: 'Erro ao carregar lista de profissionais.' });
  }
});

// ==========================================
// 2. ROTAS DO MODELO LEADS / GETNINJAS
// ==========================================

// Cliente publica uma solicitação de serviço
app.post('/pedidos-servico', async (req, res) => {
  const { cliente_nome, cliente_telefone, especialidade, descricao, cidade } = req.body;

  try {
    const query = `
      INSERT INTO pedidos_servico (cliente_nome, cliente_telefone, especialidade, descricao, cidade)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;
    const values = [cliente_nome, cliente_telefone, especialidade, descricao, cidade || 'Assis'];
    const result = await pool.query(query, values);

    return res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar pedido:', error);
    return res.status(500).json({ error: 'Erro ao criar solicitação de serviço.' });
  }
});

// Listagem de Pedidos Abertos no Mural do Prestador
app.get('/pedidos-servico', async (req, res) => {
  const { especialidade } = req.query;

  try {
    let query = "SELECT id, especialidade, descricao, cidade, custo_moedas, limite_respostas, data_criacao FROM pedidos_servico WHERE status = 'Aberto'";
    let params: any[] = [];

    if (especialidade) {
      query += ' AND especialidade ILIKE $1';
      params.push(`%${especialidade}%`);
    }

    query += ' ORDER BY data_criacao DESC';

    const result = await pool.query(query, params);
    return res.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar pedidos:', error);
    return res.status(500).json({ error: 'Erro ao carregar lista de pedidos.' });
  }
});

// Prestador gasta moedas para comprar o Lead (Desbloquear WhatsApp do cliente)
app.post('/comprar-lead', async (req, res) => {
  const { id_profissional, id_pedido } = req.body;

  try {
    // 1. Busca os dados do profissional e do pedido
    const proResult = await pool.query('SELECT saldo_moedas FROM profissionais WHERE id = $1', [id_profissional]);
    const pedidoResult = await pool.query('SELECT * FROM pedidos_servico WHERE id = $1', [id_pedido]);

    if (proResult.rows.length === 0 || pedidoResult.rows.length === 0) {
      return res.status(404).json({ error: 'Profissional ou Pedido não encontrado.' });
    }

    const saldoAtual = proResult.rows[0].saldo_moedas;
    const pedido = pedidoResult.rows[0];

    // 2. Verifica se o pedido ainda está aberto e não ultrapassou o limite de 3 prestadores
    const contagemLeads = await pool.query('SELECT COUNT(*) FROM leads_comprados WHERE id_pedido = $1', [id_pedido]);
    const totalCompradores = parseInt(contagemLeads.rows[0].count);

    if (totalCompradores >= pedido.limite_respostas) {
      return res.status(400).json({ error: 'Este pedido já atingiu o limite máximo de 3 profissionais.' });
    }

    // 3. Verifica se o prestador tem saldo suficiente
    if (saldoAtual < pedido.custo_moedas) {
      return res.status(400).json({ error: 'Saldo insuficiente de moedas. Recarregue sua carteira!' });
    }

    // 4. Inicia transação no banco
    await pool.query('BEGIN');

    // Debita o valor das moedas
    await pool.query('UPDATE profissionais SET saldo_moedas = saldo_moedas - $1 WHERE id = $2', [pedido.custo_moedas, id_profissional]);
    
    // Registra a compra do lead
    await pool.query('INSERT INTO leads_comprados (id_profissional, id_pedido) VALUES ($1, $2)', [id_profissional, id_pedido]);

    // Se atingiu o limite de 3 compradores, atualiza o status para 'Preenchido'
    if (totalCompradores + 1 >= pedido.limite_respostas) {
      await pool.query("UPDATE pedidos_servico SET status = 'Preenchido' WHERE id = $1", [id_pedido]);
    }

    await pool.query('COMMIT');

    // 5. Retorna o contato do cliente desbloqueado
    return res.json({
      message: 'Contato liberado com sucesso!',
      cliente_nome: pedido.cliente_nome,
      cliente_telefone: pedido.cliente_telefone,
      novo_saldo: saldoAtual - pedido.custo_moedas
    });

  } catch (error: any) {
    await pool.query('ROLLBACK');
    console.error('Erro na compra do lead:', error);
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Você já comprou este contato anteriormente!' });
    }
    return res.status(500).json({ error: 'Erro ao processar compra do contato.' });
  }
});

// Inicialização do Servidor (Escutando na porta 5000 e aceitando conexões locais)
const PORT = 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor ServiConnect rodando na porta ${PORT}`);
  console.log(`📱 Acesso local para o app mobile: http://192.168.1.12:${PORT}`);
});