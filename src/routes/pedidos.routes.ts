import { Router } from 'express';
import { pool } from '../config/db';

const router = Router();

// Rota: Criar Pedido de Serviço (Cliente)
router.post('/pedidos-servico', async (req, res) => {
  const { cliente_nome, cliente_telefone, categoria, especialidade, descricao, cidade } = req.body;
  const especialidadeFinal = especialidade || categoria || 'Geral';

  try {
    const query = `
      INSERT INTO pedidos_servico (cliente_nome, cliente_telefone, especialidade, descricao, cidade)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;
    const values = [cliente_nome, cliente_telefone, especialidadeFinal, descricao, cidade || 'Assis'];
    const result = await pool.query(query, values);

    res.status(201).json({
      mensagem: 'Pedido criado com sucesso!',
      pedido: result.rows[0]
    });
  } catch (error: any) {
    console.error('❌ ERRO NO POSTGRESQL:', error.message);
    res.status(500).json({ erro: error.message });
  }
});

// Rota: Listar Pedidos Disponíveis (Mural do Prestador)
router.get('/pedidos-servico', async (req, res) => {
  try {
    // Busca todos os pedidos salvos no banco de dados e traz ordenado do mais recente para o mais antigo
    const query = `
      SELECT 
        id,
        cliente_nome,
        cliente_telefone,
        especialidade,
        especialidade AS categoria,
        descricao,
        COALESCE(cidade, 'Assis') AS cidade,
        COALESCE(custo_moedas, 15) AS custo_moedas
      FROM pedidos_servico 
      ORDER BY id DESC;
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error: any) {
    console.error('❌ ERRO AO BUSCAR PEDIDOS:', error.message);
    res.status(500).json({ erro: 'Erro interno ao buscar pedidos.' });
  }
});

// Rota: Comprar Lead (Desconta moedas e revela contato)
router.post('/comprar-lead', async (req, res) => {
  const { profissional_id, pedido_id, custo_moedas } = req.body;

  try {
    const profResult = await pool.query('SELECT saldo_moedas FROM profissionais WHERE id = $1', [profissional_id]);
    if (profResult.rows.length === 0) {
      return res.status(404).json({ erro: 'Profissional não encontrado.' });
    }

    const saldoAtual = profResult.rows[0].saldo_moedas;
    if (saldoAtual < (custo_moedas || 15)) {
      return res.status(400).json({ erro: 'Saldo de moedas insuficiente para comprar este lead.' });
    }

    await pool.query('UPDATE profissionais SET saldo_moedas = saldo_moedas - $1 WHERE id = $2', [custo_moedas || 15, profissional_id]);
    
    await pool.query(
      'INSERT INTO leads_comprados (profissional_id, pedido_id, moedas_gastas) VALUES ($1, $2, $3)',
      [profissional_id, pedido_id, custo_moedas || 15]
    );

    const pedidoResult = await pool.query('SELECT * FROM pedidos_servico WHERE id = $1', [pedido_id]);

    res.json({
      mensagem: 'Lead adquirido com sucesso!',
      novo_saldo: saldoAtual - (custo_moedas || 15),
      contato_cliente: pedidoResult.rows[0]
    });
  } catch (error: any) {
    console.error('❌ ERRO AO COMPRAR LEAD:', error.message);
    res.status(500).json({ erro: 'Erro ao processar compra de lead.' });
  }
});

export default router;