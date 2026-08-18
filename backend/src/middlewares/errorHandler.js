import AppError from '../errors/AppError.js';

function conflitoDuplicidade(erro) {
  const campo = erro.message.includes('uk_usuarios_cpf') ? 'cpf' : 'email';
  const mensagem = campo === 'cpf' ? 'CPF já cadastrado' : 'Email já cadastrado';
  return { mensagem, detalhes: [{ campo, mensagem }] };
}

export default function errorHandler(erro, req, res, next) {
  if (erro instanceof AppError) {
    const corpo = { erro: { mensagem: erro.message } };
    if (erro.detalhes) {
      corpo.erro.detalhes = erro.detalhes;
    }
    return res.status(erro.statusCode).json(corpo);
  }

  if (erro.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({ erro: conflitoDuplicidade(erro) });
  }

  if (erro.type === 'entity.parse.failed') {
    return res.status(400).json({ erro: { mensagem: 'Corpo da requisição não é um JSON válido' } });
  }

  console.error(erro.stack);
  return res.status(500).json({ erro: { mensagem: 'Erro interno do servidor' } });
}
