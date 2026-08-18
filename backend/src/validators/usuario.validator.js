import AppError from '../errors/AppError.js';

const FORMATO_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const FORMATO_DATA = /^\d{4}-\d{2}-\d{2}$/;

function somenteDigitos(valor) {
  return String(valor).replace(/\D/g, '');
}

function cpfValido(cpf) {
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) {
    return false;
  }

  let soma = 0;
  for (let i = 0; i < 9; i++) {
    soma += Number(cpf[i]) * (10 - i);
  }
  if (((soma * 10) % 11) % 10 !== Number(cpf[9])) {
    return false;
  }

  soma = 0;
  for (let i = 0; i < 10; i++) {
    soma += Number(cpf[i]) * (11 - i);
  }
  return ((soma * 10) % 11) % 10 === Number(cpf[10]);
}

function dataValida(data) {
  const [ano, mes, dia] = data.split('-').map(Number);
  const referencia = new Date(Date.UTC(ano, mes - 1, dia));
  return (
    referencia.getUTCFullYear() === ano &&
    referencia.getUTCMonth() === mes - 1 &&
    referencia.getUTCDate() === dia
  );
}

function hoje() {
  const agora = new Date();
  const mes = String(agora.getMonth() + 1).padStart(2, '0');
  const dia = String(agora.getDate()).padStart(2, '0');
  return `${agora.getFullYear()}-${mes}-${dia}`;
}

export function validarId(valor) {
  if (!/^\d+$/.test(String(valor))) {
    throw new AppError('Identificador inválido', 400);
  }
  return Number(valor);
}

export function validarUsuario(corpo) {
  const dados = corpo && typeof corpo === 'object' ? corpo : {};
  const detalhes = [];

  const nome = typeof dados.nome === 'string' ? dados.nome.trim() : '';
  if (!nome) {
    detalhes.push({ campo: 'nome', mensagem: 'Nome é obrigatório' });
  } else if (nome.length < 3 || nome.length > 120) {
    detalhes.push({ campo: 'nome', mensagem: 'Nome deve ter entre 3 e 120 caracteres' });
  }

  const email = typeof dados.email === 'string' ? dados.email.trim().toLowerCase() : '';
  if (!email) {
    detalhes.push({ campo: 'email', mensagem: 'Email é obrigatório' });
  } else if (email.length > 160) {
    detalhes.push({ campo: 'email', mensagem: 'Email deve ter no máximo 160 caracteres' });
  } else if (!FORMATO_EMAIL.test(email)) {
    detalhes.push({ campo: 'email', mensagem: 'Email em formato inválido' });
  }

  const cpf = dados.cpf === undefined || dados.cpf === null ? '' : somenteDigitos(dados.cpf);
  if (!cpf) {
    detalhes.push({ campo: 'cpf', mensagem: 'CPF é obrigatório' });
  } else if (cpf.length !== 11) {
    detalhes.push({ campo: 'cpf', mensagem: 'CPF deve conter 11 dígitos' });
  } else if (!cpfValido(cpf)) {
    detalhes.push({ campo: 'cpf', mensagem: 'CPF inválido' });
  }

  const telefone =
    dados.telefone === undefined || dados.telefone === null ? '' : somenteDigitos(dados.telefone);
  if (!telefone) {
    detalhes.push({ campo: 'telefone', mensagem: 'Telefone é obrigatório' });
  } else if (telefone.length < 10 || telefone.length > 11) {
    detalhes.push({ campo: 'telefone', mensagem: 'Telefone deve conter 10 ou 11 dígitos com DDD' });
  }

  const dataNascimento =
    typeof dados.data_nascimento === 'string' ? dados.data_nascimento.trim() : '';
  if (!dataNascimento) {
    detalhes.push({ campo: 'data_nascimento', mensagem: 'Data de nascimento é obrigatória' });
  } else if (!FORMATO_DATA.test(dataNascimento) || !dataValida(dataNascimento)) {
    detalhes.push({
      campo: 'data_nascimento',
      mensagem: 'Data de nascimento deve ser uma data válida no formato YYYY-MM-DD'
    });
  } else if (dataNascimento >= hoje()) {
    detalhes.push({ campo: 'data_nascimento', mensagem: 'Data de nascimento não pode ser futura' });
  }

  if (detalhes.length > 0) {
    throw new AppError('Dados inválidos', 400, detalhes);
  }

  return { nome, email, cpf, telefone, data_nascimento: dataNascimento };
}
