import pool from '../config/database.js';

const CAMPOS = 'id, nome, email, cpf, telefone, data_nascimento, data_cadastro, data_atualizacao';

export async function listar() {
  const [linhas] = await pool.query(
    `SELECT ${CAMPOS} FROM usuarios ORDER BY data_cadastro DESC, id DESC`
  );
  return linhas;
}

export async function buscarPorId(id) {
  const [linhas] = await pool.execute(`SELECT ${CAMPOS} FROM usuarios WHERE id = ?`, [id]);
  return linhas[0] ?? null;
}

export async function buscarPorEmail(email) {
  const [linhas] = await pool.execute('SELECT id FROM usuarios WHERE email = ?', [email]);
  return linhas[0] ?? null;
}

export async function buscarPorCpf(cpf) {
  const [linhas] = await pool.execute('SELECT id FROM usuarios WHERE cpf = ?', [cpf]);
  return linhas[0] ?? null;
}

export async function inserir(usuario) {
  const [resultado] = await pool.execute(
    'INSERT INTO usuarios (nome, email, cpf, telefone, data_nascimento) VALUES (?, ?, ?, ?, ?)',
    [usuario.nome, usuario.email, usuario.cpf, usuario.telefone, usuario.data_nascimento]
  );
  return buscarPorId(resultado.insertId);
}

export async function atualizar(id, usuario) {
  await pool.execute(
    'UPDATE usuarios SET nome = ?, email = ?, cpf = ?, telefone = ?, data_nascimento = ? WHERE id = ?',
    [usuario.nome, usuario.email, usuario.cpf, usuario.telefone, usuario.data_nascimento, id]
  );
  return buscarPorId(id);
}

export async function remover(id) {
  const [resultado] = await pool.execute('DELETE FROM usuarios WHERE id = ?', [id]);
  return resultado.affectedRows > 0;
}
