import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  // devolve DATE e DATETIME como string: sem isso o driver converte para Date e
  // o fuso horário do processo desloca o dia gravado
  dateStrings: true
});

export async function testarConexao() {
  const conexao = await pool.getConnection();
  await conexao.ping();
  conexao.release();
}

export default pool;
