# Camada de Banco de Dados — CRUD de Usuários

SGBD: **MySQL 8.0** (ou superior)
Banco: `crud_usuarios` · Tabela: `usuarios`

---

## Arquivos

| Arquivo | Função |
| --- | --- |
| `01_schema.sql` | Cria o banco, a tabela `usuarios`, os índices, as restrições de integridade e os triggers. |
| `02_seed.sql` | Insere 5 usuários fictícios para teste da aplicação. |

---

## Como executar

**1. Criar o banco e a estrutura:**

```bash
mysql -u root -p < database/01_schema.sql
```

**2. Popular com dados de teste:**

```bash
mysql -u root -p < database/02_seed.sql
```

Os comandos acima devem ser executados a partir da **raiz do projeto** (`crud-usuarios/`).

O `01_schema.sql` é **idempotente**: usa `CREATE DATABASE IF NOT EXISTS` e
`CREATE TABLE IF NOT EXISTS`, então rodar de novo não gera erro nem apaga dados.
Para recomeçar do zero, descomente a linha `DROP TABLE IF EXISTS usuarios;` no
Bloco 2 do script antes de executá-lo.

---

## Dicionário de dados — tabela `usuarios`

| Coluna | Tipo | Nulo | Restrição | Descrição |
| --- | --- | --- | --- | --- |
| `id` | `INT UNSIGNED` | Não | `PRIMARY KEY`, `AUTO_INCREMENT` | Identificador único do usuário, gerado pelo banco. |
| `nome` | `VARCHAR(120)` | Não | `CHECK (CHAR_LENGTH(TRIM(nome)) >= 3)`, índice `idx_usuarios_nome` | Nome completo do usuário. |
| `email` | `VARCHAR(160)` | Não | `UNIQUE (uk_usuarios_email)`, `CHECK (email LIKE '%_@_%._%')` | E-mail de contato; não pode se repetir entre usuários. |
| `cpf` | `CHAR(11)` | Não | `UNIQUE (uk_usuarios_cpf)`, `CHECK (CHAR_LENGTH(cpf) = 11)`, `CHECK (cpf REGEXP '^[0-9]{11}$')` | CPF armazenado apenas com dígitos, sem pontos e sem hífen. |
| `telefone` | `VARCHAR(20)` | Não | — | Telefone com DDD, somente dígitos (ex.: `11987654321`). |
| `data_nascimento` | `DATE` | Não | Trigger `BEFORE INSERT/UPDATE`: deve ser anterior à data atual | Data de nascimento do usuário. |
| `data_cadastro` | `DATETIME` | Não | `DEFAULT CURRENT_TIMESTAMP` | Momento em que o registro foi criado (preenchido pelo banco). |
| `data_atualizacao` | `DATETIME` | Sim | `ON UPDATE CURRENT_TIMESTAMP` | Momento da última alteração; `NULL` enquanto o registro nunca foi editado. |

**Engine:** `InnoDB` · **Charset:** `utf8mb4` · **Collation:** `utf8mb4_unicode_ci`

### Índices

| Nome | Colunas | Tipo | Motivo |
| --- | --- | --- | --- |
| `PRIMARY` | `id` | Primária | Identidade da linha; usada nas rotas `GET /usuarios/:id`, `PUT` e `DELETE`. |
| `uk_usuarios_email` | `email` | Único | Impede dois cadastros com o mesmo e-mail e acelera a checagem de duplicidade. |
| `uk_usuarios_cpf` | `cpf` | Único | Impede dois cadastros para a mesma pessoa física. |
| `idx_usuarios_nome` | `nome` | Comum | Dá desempenho à busca por nome e ao `ORDER BY nome` da listagem. |

---

## Justificativa das decisões de modelagem

**Por que `CHAR(11)` para o CPF, e sem máscara?**
O CPF tem tamanho fixo e conhecido: 11 dígitos. Para tamanho fixo, `CHAR` é mais
eficiente que `VARCHAR`, que reserva um byte adicional para guardar o
comprimento. Guardar **sem máscara** é a decisão mais importante: se o banco
aceitasse `123.456.789-09` e `12345678909`, o `UNIQUE` não reconheceria os dois
como o mesmo CPF e a mesma pessoa poderia se cadastrar duas vezes. Formatação é
responsabilidade da camada de apresentação (front-end); o banco guarda o dado
puro. O mesmo raciocínio vale para o telefone.

**Por que `INT UNSIGNED` no `id`?**
O identificador nunca é negativo. Marcar a coluna como `UNSIGNED` dobra o
intervalo útil (até ~4,29 bilhões de registros) sem consumir um byte a mais.

**Por que `utf8mb4` e não `utf8`?**
O `utf8` do MySQL é uma implementação incompleta de Unicode (máximo de 3 bytes
por caractere). O `utf8mb4` cobre o padrão completo, o que garante acentuação
portuguesa e evita erros de gravação em caracteres fora do plano básico.
A collation `utf8mb4_unicode_ci` é *case-insensitive*, então buscas por nome
funcionam independentemente de maiúsculas/minúsculas.

**Por que `data_cadastro` tem `DEFAULT CURRENT_TIMESTAMP`?**
Porque o carimbo de auditoria não deve depender do cliente. Se a aplicação (ou o
navegador) enviasse a data, um relógio errado — ou um usuário mal-intencionado —
gravaria um valor falso. Com o `DEFAULT`, a fonte da verdade é o servidor de
banco, e o `INSERT` fica mais simples, pois a coluna nem precisa ser informada.

**Por que `data_atualizacao` é `NULL` e usa `ON UPDATE`?**
Um registro recém-criado ainda não foi atualizado — `NULL` representa
corretamente essa ausência de evento, o que é mais honesto do que repetir a data
de cadastro. O `ON UPDATE CURRENT_TIMESTAMP` faz o próprio MySQL registrar o
instante de cada alteração, sem que o back-end precise lembrar de fazê-lo.

**Por que validar no banco se o front-end já valida?**
São camadas com propósitos diferentes. A validação do front-end é *conveniência*:
dá retorno imediato ao usuário. A validação do banco é *garantia*: vale mesmo que
alguém chame a API diretamente, burle o JavaScript ou insira dados pelo terminal
do MySQL. As `CHECK constraints` do MySQL 8 são a última linha de defesa da
integridade dos dados.

**Por que a regra "data de nascimento não pode ser futura" está em um trigger?**
O MySQL 8 só aceita expressões **determinísticas** dentro de uma `CHECK`, ou
seja, que devolvem sempre o mesmo resultado para a mesma entrada. `CURRENT_DATE`
muda a cada dia, então `CHECK (data_nascimento < CURRENT_DATE)` é rejeitada pelo
servidor com o erro **3814** (*"An expression of a check constraint contains
disallowed function"*). A constraint fica registrada como comentário no
`01_schema.sql` para documentar a intenção, e a regra é efetivamente aplicada por
dois triggers `BEFORE INSERT` e `BEFORE UPDATE`, que abortam a operação com
`SIGNAL SQLSTATE '45000'`. Foram criados **dois** triggers de propósito: validar
só no `INSERT` deixaria a regra burlável por uma edição (`PUT`).

**Por que `ENGINE=InnoDB`?**
É a engine padrão do MySQL 8 e a única que oferece transações
(`COMMIT`/`ROLLBACK`), chaves estrangeiras e a checagem efetiva das constraints —
recursos necessários caso o projeto evolua para mais de uma tabela.
