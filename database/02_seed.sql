-- =============================================================================
-- 02_seed.sql  |  CRUD de Usuários - Carga de dados de teste (seed)
-- -----------------------------------------------------------------------------
-- Pré-requisito: 01_schema.sql já executado.
-- Execução:  mysql -u root -p < database/02_seed.sql
--
-- Observações sobre os dados:
--   * Os 5 usuários são FICTÍCIOS, criados apenas para testar a listagem, a
--     busca por nome e as regras de unicidade do CRUD.
--   * Os CPFs têm dígitos verificadores matematicamente VÁLIDOS (passam no
--     algoritmo do módulo 11), mas são gravados SEM MÁSCARA — só os 11 dígitos.
--   * Os telefones seguem a mesma regra: apenas dígitos, começando pelo DDD.
--   * data_cadastro é omitida de propósito: o DEFAULT CURRENT_TIMESTAMP da
--     tabela preenche o campo sozinho.
--   * data_atualizacao também é omitida: nasce NULL, pois nenhum destes
--     registros foi editado ainda.
-- =============================================================================

USE crud_usuarios;

INSERT INTO usuarios (nome, email, cpf, telefone, data_nascimento) VALUES
  ('Ana Beatriz Cardoso',   'ana.cardoso@email.com.br',      '52998224725', '11987654321', '1992-03-14'),
  ('Bruno Martins Silva',   'bruno.martins@email.com.br',    '30841726507', '21996541230', '1985-11-02'),
  ('Carla Regina Nogueira', 'carla.nogueira@email.com.br',   '67109382478', '31988774455', '1998-07-25'),
  ('Diego Almeida Rocha',   'diego.rocha@email.com.br',      '48260513790', '4133221100',  '1979-01-09'),
  ('Elaine Souza Pereira',  'elaine.pereira@email.com.br',   '91573840610', '51991234567', '2001-09-30');

-- -----------------------------------------------------------------------------
-- Conferência rápida da carga (opcional).
-- -----------------------------------------------------------------------------
SELECT id, nome, email, cpf, telefone, data_nascimento, data_cadastro
FROM usuarios
ORDER BY nome;
