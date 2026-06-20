-- SIGEFEN — Esquema da Base de Dados
-- Correr uma vez para criar todas as tabelas

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Camiões
CREATE TABLE IF NOT EXISTS camioes (
  id        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  matricula VARCHAR(20) UNIQUE NOT NULL,
  marca     VARCHAR(50),
  modelo    VARCHAR(100),
  ano       INTEGER,
  capacidade_t DECIMAL(8,2),
  chassis   VARCHAR(100),
  km_total  INTEGER DEFAULT 0,
  estado    VARCHAR(30) DEFAULT 'disponivel',
  combustivel_pct INTEGER DEFAULT 100,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Motoristas
CREATE TABLE IF NOT EXISTS motoristas (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome          VARCHAR(150) NOT NULL,
  bi            VARCHAR(50),
  licenca_cat   VARCHAR(20),
  licenca_val   DATE,
  contacto      VARCHAR(30),
  cidade        VARCHAR(100),
  camiao_id     UUID REFERENCES camioes(id) ON DELETE SET NULL,
  total_viagens INTEGER DEFAULT 0,
  total_km      INTEGER DEFAULT 0,
  rating        DECIMAL(3,1) DEFAULT 5.0,
  estado        VARCHAR(30) DEFAULT 'disponivel',
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Viagens
CREATE TABLE IF NOT EXISTS viagens (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  camiao_id     UUID REFERENCES camioes(id),
  motorista_id  UUID REFERENCES motoristas(id),
  origem        VARCHAR(150),
  destino       VARCHAR(150),
  tipo_carga    VARCHAR(100),
  peso_t        DECIMAL(8,2),
  cliente       VARCHAR(150),
  data_partida  TIMESTAMPTZ,
  data_chegada  TIMESTAMPTZ,
  km_percorridos INTEGER DEFAULT 0,
  custo_total   DECIMAL(12,2) DEFAULT 0,
  estado        VARCHAR(30) DEFAULT 'agendada',
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Manutenções
CREATE TABLE IF NOT EXISTS manutencoes (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  camiao_id      UUID REFERENCES camioes(id),
  tipo           VARCHAR(100),
  data_agendada  DATE,
  data_conclusao DATE,
  oficina        VARCHAR(150),
  custo          DECIMAL(12,2) DEFAULT 0,
  prioridade     VARCHAR(20) DEFAULT 'normal',
  estado         VARCHAR(30) DEFAULT 'agendada',
  observacoes    TEXT,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- Abastecimentos
CREATE TABLE IF NOT EXISTS abastecimentos (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  camiao_id     UUID REFERENCES camioes(id),
  motorista_id  UUID REFERENCES motoristas(id),
  posto         VARCHAR(150),
  litros        DECIMAL(8,2),
  preco_litro   DECIMAL(8,2),
  total_mt      DECIMAL(12,2),
  km_momento    INTEGER,
  data          TIMESTAMPTZ DEFAULT NOW(),
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Documentos dos camiões
CREATE TABLE IF NOT EXISTS documentos (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  camiao_id  UUID REFERENCES camioes(id) ON DELETE CASCADE,
  tipo       VARCHAR(50),
  numero     VARCHAR(100),
  validade   DATE,
  estado     VARCHAR(20) DEFAULT 'valido',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Utilizadores
CREATE TABLE IF NOT EXISTS utilizadores (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome         VARCHAR(150) NOT NULL,
  email        VARCHAR(200) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  papel        VARCHAR(30) DEFAULT 'gestor',
  motorista_id UUID REFERENCES motoristas(id) ON DELETE SET NULL,
  ativo        BOOLEAN DEFAULT TRUE,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);
