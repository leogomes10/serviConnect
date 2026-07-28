import { Router } from 'express'; // Importa a função de roteamento do Express
import { pool } from '../config/db'; // Importa a conexão compartilhada com o PostgreSQL

const router = Router(); // Instancia o roteador de moedas

// Rota: Gerar Cobrança Pix para Compra de Pacote de Moedas
router.post('/gerar-pix-moedas', async (req, res) => { // Declara rota POST de geração de Pix
  const { profissional_id, quantidade_moedas, valor_reais } = req.body; // Obtém os dados do pacote escolhido

  try { // Inicia tratamento de exceções
    // String fictícia formatada no padrão do Banco Central (Simulação Pix)
    const codigoPixSimulado = `00020126580014BR.GOV.BCB.PIX0136serviconnect-assis-pix-key5204000053039865405${valor_reais.toFixed(2)}5802BR5912SERVICONNECT6005ASSIS62070503***6304E2CA`; // Formata o código com o valor em reais

    // Query para armazenar a intenção de recarga com status PENDENTE no banco
    const query = `
      INSERT INTO transacoes_moedas (profissional_id, quantidade_moedas, valor_reais, status, codigo_pix)
      VALUES ($1, $2, $3, 'PENDENTE', $4)
      RETURNING *;
    `; // Retorna a transação registrada com o ID único gerado

    const result = await pool.query(query, [profissional_id, quantidade_moedas, valor_reais, codigoPixSimulado]); // Executa inserção

    res.status(201).json({ // Retorna HTTP status 201
      mensagem: 'Cobrança PIX gerada com sucesso!', // Notificação de sucesso
      transacao: result.rows[0] // Devolve o objeto contendo o ID e o código Pix para o App renderizar
    }); // Fecha objeto JSON de retorno

  } catch (error) { // Captura falhas na geração da cobrança
    console.error('Erro ao gerar PIX:', error); // Registra log no console
    res.status(500).json({ erro: 'Erro interno ao gerar chave PIX.' }); // Resposta HTTP 500
  } // Fecha bloco catch
}); // Fecha rota /gerar-pix-moedas

// Rota: Confirmar Pagamento do Pix e Creditar Moedas na Carteira
router.post('/confirmar-recarga', async (req, res) => { // Declara rota POST de confirmação do pagamento
  const { transacao_id, profissional_id, quantidade_moedas } = req.body; // Extrai os dados da transação

  try { // Inicia bloco try
    // 1. Atualiza a transação Pix de PENDENTE para APROVADO
    await pool.query("UPDATE transacoes_moedas SET status = 'APROVADO' WHERE id = $1", [transacao_id]); // Executa atualização do status

    // 2. Incrementa as novas moedas adquiridas ao saldo existente do prestador
    const querySaldo = `
      UPDATE profissionais 
      SET saldo_moedas = saldo_moedas + $1 
      WHERE id = $2 
      RETURNING id, nome, saldo_moedas;
    `; // Soma de forma atômica o valor no PostgreSQL
    const result = await pool.query(querySaldo, [quantidade_moedas, profissional_id]); // Executa o incremento do saldo

    res.json({ // Retorna resposta HTTP status 200
      mensagem: 'Recarga efetuada com sucesso!', // Mensagem de sucesso
      profissional: result.rows[0] // Devolve o perfil do prestador atualizado com o novo saldo
    }); // Fecha objeto JSON de resposta

  } catch (error) { // Trata falha no processamento do crédito
    console.error('Erro ao confirmar recarga:', error); // Exibe o erro no terminal
    res.status(500).json({ erro: 'Erro ao processar adição de moedas.' }); // Responde HTTP 500
  } // Fecha bloco catch
}); // Fecha rota /confirmar-recarga

export default router; // Exporta o roteador de moedas