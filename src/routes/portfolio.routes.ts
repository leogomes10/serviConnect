import { Router } from 'express';
import { pool } from '../config/db';
import { autenticarToken, RequestAutenticado } from '../config/auth.middleware';

const router = Router();

// Rota: Profissional cadastra um serviço no seu portfólio
router.post('/adicionar-servico-realizado', autenticarToken, async (req: RequestAutenticado, res) => {
  const profissional_id = req.usuario?.id;
  const { titulo, descricao, imagem_url, data_conclusao } = req.body;

  if (!profissional_id || !titulo) {
    return res.status(400).json({ erro: 'Título do serviço é obrigatório.' });
  }

  try {
    const query = `
      INSERT INTO servicos_realizados (profissional_id, titulo, descricao, imagem_url, data_conclusao)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;
    const values = [
      profissional_id, 
      titulo, 
      descricao || '', 
      imagem_url || '', 
      data_conclusao || ''
    ];

    const result = await pool.query(query, values);
    res.status(201).json({
      mensagem: 'Serviço adicionado ao portfólio com sucesso!',
      servico: result.rows[0]
    });
  } catch (error: any) {
    console.error('Erro ao adicionar serviço ao portfólio:', error);
    res.status(500).json({ erro: 'Erro interno ao salvar portfólio.' });
  }
});

// Rota: Atualizar foto e biografia do prestador
router.put('/perfil-profissional', autenticarToken, async (req: RequestAutenticado, res) => {
  const profissional_id = req.usuario?.id;
  const { foto_url, biografia } = req.body;

  try {
    const query = `
      UPDATE profissionais
      SET foto_url = COALESCE($1, foto_url),
          biografia = COALESCE($2, biografia)
      WHERE id = $3
      RETURNING id, nome, especialidade, foto_url, biografia;
    `;
    const result = await pool.query(query, [foto_url, biografia, profissional_id]);

    res.json({
      mensagem: 'Perfil atualizado!',
      profissional: result.rows[0]
    });
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    res.status(500).json({ erro: 'Erro ao atualizar dados do perfil.' });
  }
});

export default router;