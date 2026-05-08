CREATE TABLE users ( -- Cria a tabela de usuários (o coração do sistema).
  id SERIAL PRIMARY KEY, -- ID único que aumenta sozinho (1, 2, 3...) para identificar cada pessoa.
  email VARCHAR(255) UNIQUE NOT NULL, -- Guarda o e-mail. 'UNIQUE' garante que ninguém use o mesmo e-mail duas vezes.
  password_hash VARCHAR(255) NOT NULL, -- Guarda a senha criptografada (nunca guardamos a senha pura!).
  role VARCHAR(50) CHECK (role IN ('client', 'provider')) NOT NULL, -- Só permite que o usuário seja 'cliente' ou 'prestador'.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP --  Registra automaticamente o dia e a hora que a conta foi criada.
);

CREATE TABLE services ( -- Cria a tabela de serviços que os prestadores oferecem.
  id SERIAL PRIMARY KEY, -- Identificador único do serviço.
  provider_id INTEGER REFERENCES users(id) ON DELETE CASCADE, -- Liga o serviço a um usuário da tabela 'users'. Se o usuário for deletado, o serviço também some.
  title VARCHAR(255) NOT NULL, -- Nome do serviço (ex: 'Reparo Elétrico').
  category VARCHAR(100) NOT NULL, -- Categoria (aquela que usamos para escolher os ícones no React!).
  price_estimate DECIMAL(10, 2), -- Valor estimado com duas casas decimais (ex: 150.50).
);

CREATE TABLE bookings ( -- Tabela de agendamentos (quando o cliente clica em 'Reservar').
  id SERIAL PRIMARY KEY, -- ID da reserva.
  client_id INTEGER REFERENCES users(id), -- Quem está contratando.
  service_id INTEGER REFERENCES services(id), -- Qual serviço está sendo contratado.
  status VARCHAR(50) DEFAULT 'pending', -- Começa como 'pendente' até o prestador aceitar.
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL -- O dia e hora que o serviço foi marcado em Assis.
);

CREATE TABLE profissionais (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    especialidade VARCHAR(100),
    preco DECIMAL(10, 2),
    data_cadastro TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);