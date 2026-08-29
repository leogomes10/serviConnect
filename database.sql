-- ============================================================================
-- SERVICONNECT - MODELAGEM E ESTRUTURA DO BANCO DE DADOS (PostgreSQL)
-- ============================================================================

-- 1. Tabela de Profissionais / Prestadores
CREATE TABLE IF NOT EXISTS profissionais (
  id SERIAL PRIMARY KEY, -- ID único incremental
  nome VARCHAR(255) NOT NULL, -- Nome completo do profissional
  email VARCHAR(255) UNIQUE NOT NULL, -- E-mail único para login
  senha VARCHAR(255) NOT NULL, -- Senha criptografada com bcryptjs
  especialidade VARCHAR(100), -- Área de atuação (ex: Elétrica, Hidráulica, Pintura)
  preco DECIMAL(10, 2) DEFAULT 0.00, -- Preço base / hora
  role VARCHAR(50) DEFAULT 'profissional', -- Papel de acesso no sistema
  saldo_moedas INTEGER DEFAULT 50, -- Saldo de créditos virtuais (bônus inicial de 50)
  data_cadastro TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP -- Data e hora de criação da conta
);

-- 2. Tabela de Pedidos de Serviço (Mural de Chamados dos Clientes)
CREATE TABLE IF NOT EXISTS pedidos_servico (
  id SERIAL PRIMARY KEY, -- ID único do pedido
  cliente_nome VARCHAR(255) NOT NULL, -- Nome do cliente solicitante
  cliente_telefone VARCHAR(50) NOT NULL, -- Contato do cliente (revelado após compra do lead)
  especialidade VARCHAR(100) NOT NULL, -- Categoria/especialidade demandada
  descricao TEXT NOT NULL, -- Detalhamento do problema/serviço solicitado
  cidade VARCHAR(100) DEFAULT 'Assis', -- Cidade do chamado
  custo_moedas INTEGER DEFAULT 15, -- Custo em moedas para desbloqueio do contato
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP -- Data e hora do pedido
);

-- 3. Tabela de Leads Comprados (Controle de Desbloqueios por Prestador)
CREATE TABLE IF NOT EXISTS leads_comprados (
  id SERIAL PRIMARY KEY, -- ID do registro de compra
  profissional_id INTEGER REFERENCES profissionais(id) ON DELETE CASCADE, -- Prestador que adquiriu
  pedido_id INTEGER REFERENCES pedidos_servico(id) ON DELETE CASCADE, -- Pedido correspondente
  moedas_gastas INTEGER NOT NULL, -- Quantidade de moedas debitadas
  comprado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP -- Data e hora da transação
);

-- 4. Tabela de Transações de Moedas / Cobranças PIX
CREATE TABLE IF NOT EXISTS transacoes_moedas (
  id SERIAL PRIMARY KEY, -- ID único da transação
  profissional_id INTEGER REFERENCES profissionais(id) ON DELETE CASCADE, -- Profissional que solicitou recarga
  quantidade_moedas INTEGER NOT NULL, -- Pacote de moedas escolhido
  valor_reais DECIMAL(10, 2) NOT NULL, -- Valor em R$ da cobrança
  status VARCHAR(50) DEFAULT 'PENDENTE', -- Status da cobrança ('PENDENTE' ou 'APROVADO')
  codigo_pix TEXT NOT NULL, -- Código Copia e Cola formatado no padrão BACEN
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP -- Data e hora da geração
);

-- ============================================================================
-- ESTRUTURA BASE / AGENDAMENTOS (Legado / Módulos Complementares)
-- ============================================================================

-- 5. Tabela de Usuários Gerais
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) CHECK (role IN ('client', 'provider')) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Tabela de Catálogo de Serviços
CREATE TABLE IF NOT EXISTS services (
  id SERIAL PRIMARY KEY,
  provider_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  price_estimate DECIMAL(10, 2)
);

-- 7. Tabela de Agendamentos / Bookings
CREATE TABLE IF NOT EXISTS bookings (
  id SERIAL PRIMARY KEY,
  client_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  service_id INTEGER REFERENCES services(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'pending',
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL
);