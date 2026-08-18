-- =============================================================================
-- 01_schema.sql  |  CRUD de Usuários - Camada de Banco de Dados
-- SGBD alvo: MySQL 8.0 ou superior
-- -----------------------------------------------------------------------------
-- Script IDEMPOTENTE: pode ser executado várias vezes seguidas sem gerar erro.
-- Execução:  mysql -u root -p < database/01_schema.sql
-- =============================================================================


-- -----------------------------------------------------------------------------
-- BLOCO 1 - CRIAÇÃO DO BANCO DE DADOS
-- -----------------------------------------------------------------------------
-- IF NOT EXISTS evita erro caso o banco já tenha sido criado antes (idempotência).
--
-- CHARACTER SET utf8mb4: conjunto de caracteres Unicode completo (4 bytes). É o
-- indicado para português, pois acomoda acentuação (ã, ç, é) e também emojis.
-- O antigo "utf8" do MySQL usa apenas 3 bytes e é incompleto.
--
-- COLLATE utf8mb4_unicode_ci: regra de comparação/ordenação. O sufixo "ci" =
-- case-insensitive, ou seja, 'Maria' e 'maria' são considerados iguais nas
-- comparações e a ordenação alfabética respeita acentos corretamente.
-- -----------------------------------------------------------------------------
CREATE DATABASE IF NOT EXISTS crud_usuarios
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

-- Define o banco crud_usuarios como o banco corrente da sessão. A partir daqui,
-- todos os comandos abaixo se aplicam a ele.
USE crud_usuarios;


-- -----------------------------------------------------------------------------
-- BLOCO 2 - RESET DA TABELA (OPCIONAL)
-- -----------------------------------------------------------------------------
-- A linha abaixo está COMENTADA de propósito. Descomente-a apenas quando quiser
-- ZERAR a tabela e recriá-la do zero (por exemplo, ao refazer a carga de testes).
-- ATENÇÃO: DROP TABLE apaga a estrutura E todos os dados, sem confirmação.
-- -----------------------------------------------------------------------------
-- DROP TABLE IF EXISTS usuarios;


-- -----------------------------------------------------------------------------
-- BLOCO 3 - TABELA usuarios
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS usuarios (

  -- CHAVE PRIMÁRIA (PRIMARY KEY)
  -- Identificador único e imutável de cada linha da tabela. É a "identidade" do
  -- registro: nunca se repete e nunca é NULL. É por ela que o back-end vai
  -- localizar um usuário nas rotas GET /usuarios/:id, PUT e DELETE.
  -- AUTO_INCREMENT: o próprio MySQL gera o próximo número da sequência, evitando
  -- que a aplicação precise controlar isso (e evitando corrida entre requisições).
  -- INT UNSIGNED: inteiro sem sinal (0 a ~4,29 bilhões). Como id nunca é negativo,
  -- UNSIGNED dobra o intervalo útil sem gastar bytes a mais.
  id                INT UNSIGNED    NOT NULL AUTO_INCREMENT,

  -- Nome completo. VARCHAR(120) é folgado o bastante para nomes brasileiros
  -- compostos. VARCHAR (e não CHAR) porque o tamanho varia muito de um nome
  -- para outro e VARCHAR só ocupa o espaço realmente usado.
  nome              VARCHAR(120)    NOT NULL,

  -- E-mail. UNIQUE porque é o identificador "de negócio" do usuário: dois
  -- cadastros não podem compartilhar o mesmo e-mail (evita duplicidade de conta
  -- e garante que comunicações cheguem a uma única pessoa).
  -- 160 caracteres cobre com sobra o padrão de e-mails reais.
  email             VARCHAR(160)    NOT NULL,

  -- CPF armazenado SEM MÁSCARA (somente os 11 dígitos, sem pontos e sem hífen).
  -- Motivos da decisão:
  --   1) Consistência: "123.456.789-09" e "12345678909" são a mesma pessoa; se a
  --      máscara fosse gravada, o UNIQUE não impediria o cadastro duplicado.
  --   2) Busca e comparação ficam diretas, sem precisar limpar a string antes.
  --   3) Máscara é assunto de APRESENTAÇÃO: quem formata é o front-end.
  -- CHAR(11) (e não VARCHAR) porque o tamanho é FIXO e sempre conhecido: 11
  -- dígitos, nem mais nem menos. Para tamanho fixo, CHAR é mais eficiente,
  -- pois dispensa o byte extra de controle de comprimento do VARCHAR.
  cpf               CHAR(11)        NOT NULL,

  -- Telefone com DDD, também somente dígitos (ex.: 11987654321).
  -- VARCHAR(20) dá margem para fixo (10 dígitos), celular (11) e eventual
  -- prefixo internacional, sem travar o formato.
  telefone          VARCHAR(20)     NOT NULL,

  -- Data de nascimento. Tipo DATE (só dia/mês/ano, sem hora), pois horário não
  -- faz sentido aqui. Usar DATE em vez de texto permite ordenar, comparar e
  -- calcular idade diretamente no SQL.
  data_nascimento   DATE            NOT NULL,

  -- Data/hora em que o registro foi criado (auditoria).
  -- DEFAULT CURRENT_TIMESTAMP: o banco preenche sozinho no INSERT. Assim a
  -- aplicação não precisa enviar esse campo e o valor não depende do relógio
  -- (nem da boa-fé) do cliente — a fonte da verdade é o servidor de banco.
  data_cadastro     DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,

  -- Data/hora da última alteração (auditoria).
  -- Nasce NULL: um registro recém-criado ainda nunca foi atualizado.
  -- ON UPDATE CURRENT_TIMESTAMP: a cada UPDATE que realmente mude algum valor,
  -- o MySQL grava o instante atual automaticamente.
  data_atualizacao  DATETIME        NULL ON UPDATE CURRENT_TIMESTAMP,

  -- ---------------------------------------------------------------------------
  -- CHAVE PRIMÁRIA E ÍNDICES ÚNICOS
  -- ---------------------------------------------------------------------------
  PRIMARY KEY (id),

  -- Índices ÚNICOS nomeados explicitamente. Nomear (uk_ = unique key) é boa
  -- prática: quando o INSERT falha, o erro cita o nome da constraint violada,
  -- e o back-end consegue devolver uma mensagem clara do tipo
  -- "e-mail já cadastrado" em vez de um erro genérico.
  -- Todo índice único também acelera as consultas por essas colunas — o que é
  -- exatamente o que o CRUD faz ao checar se o e-mail/CPF já existe.
  UNIQUE KEY uk_usuarios_email (email),
  UNIQUE KEY uk_usuarios_cpf   (cpf),

  -- Índice COMUM (não único) em nome: nomes podem se repetir (dois "João Silva"
  -- são possíveis), então aqui não cabe UNIQUE. Ele existe para dar desempenho
  -- à busca por nome na tela de listagem
  -- (ex.: WHERE nome LIKE 'Ana%' e ORDER BY nome).
  KEY idx_usuarios_nome (nome),

  -- ---------------------------------------------------------------------------
  -- RESTRIÇÕES DE INTEGRIDADE (CHECK CONSTRAINTS - MySQL 8)
  -- ---------------------------------------------------------------------------
  -- As CHECKs são a ÚLTIMA linha de defesa dos dados. Mesmo que a validação do
  -- front-end seja burlada ou que alguém insira dados direto pelo terminal do
  -- MySQL, o banco recusa o registro inválido. Validar no front é conveniência;
  -- validar no banco é garantia.
  -- ---------------------------------------------------------------------------

  -- CPF precisa ter exatamente 11 caracteres.
  CONSTRAINT chk_usuarios_cpf_tamanho
    CHECK (CHAR_LENGTH(cpf) = 11),

  -- CPF precisa conter apenas algarismos de 0 a 9 (reforça a regra de gravar
  -- sem máscara: pontos e hífen são rejeitados aqui).
  CONSTRAINT chk_usuarios_cpf_numerico
    CHECK (cpf REGEXP '^[0-9]{11}$'),

  -- Formato mínimo de e-mail: pelo menos 1 caractere antes do "@", pelo menos 1
  -- depois, e um ponto seguido de mais caracteres (domínio). No LIKE do SQL o
  -- "_" casa com exatamente um caractere e o "%" com zero ou mais.
  -- Não é uma validação completa de RFC — é uma barreira barata contra lixo
  -- óbvio como "abc" ou "@dominio.com".
  CONSTRAINT chk_usuarios_email_formato
    CHECK (email LIKE '%_@_%._%'),

  -- Nome com no mínimo 3 caracteres DEPOIS de remover espaços das pontas.
  -- O TRIM é essencial: sem ele, uma string com três espaços ("   ") passaria.
  CONSTRAINT chk_usuarios_nome_tamanho
    CHECK (CHAR_LENGTH(TRIM(nome)) >= 3)

  -- ---------------------------------------------------------------------------
  -- Data de nascimento não pode ser futura.
  --
  -- IMPORTANTE (limitação documentada do MySQL 8): uma CHECK constraint só
  -- aceita expressões DETERMINÍSTICAS, isto é, que devolvem sempre o mesmo
  -- resultado para a mesma entrada. CURRENT_DATE muda a cada dia, então o
  -- MySQL REJEITA a constraint abaixo com o erro 3814
  -- ("An expression of a check constraint contains disallowed function").
  -- Por isso ela fica registrada aqui apenas como documentação da regra:
  --
  --   CONSTRAINT chk_usuarios_nascimento_passado
  --     CHECK (data_nascimento < CURRENT_DATE),
  --
  -- A mesma regra é efetivamente aplicada pelos TRIGGERS do Bloco 4, logo
  -- abaixo, que rodam antes de cada INSERT e de cada UPDATE.
  -- ---------------------------------------------------------------------------

)
-- ENGINE=InnoDB: mecanismo de armazenamento padrão do MySQL 8. É ele que dá
-- suporte a transações (COMMIT/ROLLBACK), a chaves estrangeiras e à checagem
-- das constraints acima — recursos que o antigo MyISAM não oferece.
ENGINE = InnoDB
DEFAULT CHARSET = utf8mb4
COLLATE = utf8mb4_unicode_ci
COMMENT = 'Cadastro de usuários do sistema CRUD';


-- -----------------------------------------------------------------------------
-- BLOCO 4 - TRIGGERS: DATA DE NASCIMENTO NÃO PODE SER FUTURA
-- -----------------------------------------------------------------------------
-- Como explicado no Bloco 3, o MySQL 8 não permite CURRENT_DATE dentro de uma
-- CHECK. A alternativa oficial é o TRIGGER: um bloco de código que o banco
-- executa automaticamente ANTES (BEFORE) de gravar a linha. Se a data for
-- futura, o SIGNAL interrompe a operação e devolve um erro à aplicação.
--
-- SQLSTATE '45000' é o código genérico de "exceção definida pelo usuário".
-- DELIMITER troca temporariamente o terminador de comando de ";" para "$$",
-- para que os ";" internos do corpo do trigger não encerrem o comando antes da
-- hora. Ao final, voltamos o delimitador para ";".
-- -----------------------------------------------------------------------------
DROP TRIGGER IF EXISTS trg_usuarios_bi_nascimento;
DROP TRIGGER IF EXISTS trg_usuarios_bu_nascimento;

DELIMITER $$

-- BEFORE INSERT: valida no cadastro.
CREATE TRIGGER trg_usuarios_bi_nascimento
BEFORE INSERT ON usuarios
FOR EACH ROW
BEGIN
  IF NEW.data_nascimento >= CURRENT_DATE THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'data_nascimento deve ser anterior à data atual';
  END IF;
END$$

-- BEFORE UPDATE: valida também na edição, senão a regra seria burlável por PUT.
CREATE TRIGGER trg_usuarios_bu_nascimento
BEFORE UPDATE ON usuarios
FOR EACH ROW
BEGIN
  IF NEW.data_nascimento >= CURRENT_DATE THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'data_nascimento deve ser anterior à data atual';
  END IF;
END$$

DELIMITER ;


-- =============================================================================
-- FIM DO SCHEMA. Próximo passo: database/02_seed.sql (carga de dados de teste).
-- =============================================================================
