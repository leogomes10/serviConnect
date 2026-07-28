import { Router } from 'express'; // Importa a função Router do Express para criar módulos de rotas
import bcrypt from 'bcryptjs'; // Importa a biblioteca de criptografia de senhas
import { pool } from '../config/db'; // Importa o pool de conexões com o PostgreSQL

const router = Router(); // Cria uma nova instância de roteador do Express

// Rota: Cadastro de Profissional
router.post('/cadastrar-profissional', async (req, res) => { // Define a rota HTTP POST de cadastro
  const { nome, email, senha, especialidade, preco, role } = req.body; // Extrai os campos do corpo da requisição JSON

  try { // Bloco de tentativa para capturar erros
    const senhaHash = await bcrypt.hash(senha, 10); // Criptografa a senha com algoritmo bcrypt em 10 rodadas

    // Query SQL parametrizada para inserir o novo prestador com bônus inicial de 50 moedas
    const query = `
      INSERT INTO profissionais (nome, email, senha, especialidade, preco, role, saldo_moedas)
      VALUES ($1, $2, $3, $4, $5, $6, 50)
      RETURNING id, nome, email, especialidade, saldo_moedas;
    `; // O RETURNING devolve o registro criado sem expor o hash da senha

    const values = [nome, email, senhaHash, especialidade, preco || 0, role || 'profissional']; // Array de valores limpos para prevenir SQL Injection
    const result = await pool.query(query, values); // Executa a query no PostgreSQL de forma assíncrona

    res.status(201).json({ // Responde com código 201 (Criado)
      mensagem: 'Profissional cadastrado com sucesso!', // Mensagem de confirmação
      profissional: result.rows[0] // Retorna os dados do profissional recém-cadastrado
    }); // Fecha o objeto de resposta

  } catch (error: any) { // Captura eventuais erros de execução
    console.error('Erro ao cadastrar profissional:', error); // Imprime a falha no console para depuração
    if (error.code === '23505') { // Verifica se o erro é de violação de e-mail duplicado (código 23505 do Postgres)
      return res.status(400).json({ erro: 'Este e-mail já está cadastrado no sistema.' }); // Notifica e-mail duplicado
    } // Fecha a verificação de e-mail
    res.status(500).json({ erro: 'Erro interno ao cadastrar profissional.' }); // Retorna erro genérico de servidor
  } // Fecha o bloco catch
}); // Fecha a rota /cadastrar-profissional

// Rota: Login de Profissional
router.post('/login-profissional', async (req, res) => { // Define a rota HTTP POST de autenticação
  const { email, senha } = req.body; // Extrai o e-mail e a senha informados pelo usuário

  try { // Inicia o bloco try
    const result = await pool.query('SELECT * FROM profissionais WHERE email = $1', [email]); // Busca o prestador pelo e-mail

    if (result.rows.length === 0) { // Se a busca não retornar registros
      return res.status(401).json({ erro: 'E-mail ou senha inválidos.' }); // Retorna status 401 (Não Autorizado)
    } // Fecha verificação de existência do e-mail

    const profissional = result.rows[0]; // Recupera o objeto do profissional encontrado
    const senhaValida = await bcrypt.compare(senha, profissional.senha); // Compara a senha digitada com o hash salvo no banco

    if (!senhaValida) { // Se a senha for incorreta
      return res.status(401).json({ erro: 'E-mail ou senha inválidos.' }); // Retorna aviso de credenciais incorretas
    } // Fecha verificação da senha

    delete profissional.senha; // Remove o hash da senha do objeto antes de enviar para o frontend por segurança

    res.json({ // Retorna resposta de sucesso com status 200 HTTP
      mensagem: 'Login realizado com sucesso!', // Notificação de login
      profissional // Envia os dados e o saldo de moedas do profissional
    }); // Fecha a resposta JSON

  } catch (error) { // Trata exceções do login
    console.error('Erro no login:', error); // Loga o erro no terminal
    res.status(500).json({ erro: 'Erro interno no servidor ao fazer login.' }); // Responde com erro 500
  } // Fecha o bloco catch
}); // Fecha a rota /login-profissional

// Rota: Listar todos os Profissionais para a busca do Cliente
router.get('/profissionais', async (req, res) => { // Declara rota HTTP GET para listar prestadores
  try { // Abre bloco try
    const query = `
      SELECT id, nome, email, especialidade, preco, role, saldo_moedas
      FROM profissionais
      ORDER BY nome ASC;
    `; // Busca os dados públicos dos profissionais cadastrados (sem expor as senhas)
    
    const result = await pool.query(query); // Executa a consulta no PostgreSQL
    res.json(result.rows); // Retorna a lista de profissionais em formato JSON para o React

  } catch (error) { // Captura falhas
    console.error('Erro ao buscar profissionais:', error); // Log no terminal
    res.status(500).json({ erro: 'Erro interno ao buscar profissionais.' }); // Resposta de erro
  } // Fecha catch
}); // Fecha rota GET /profissionais

export default router; // Exporta o módulo de rotas para uso no server.ts