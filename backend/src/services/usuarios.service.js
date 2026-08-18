import AppError from '../errors/AppError.js';
import * as repositorio from '../repositories/usuarios.repository.js';
import { validarUsuario } from '../validators/usuario.validator.js';

async function garantirUnicidade(usuario, idIgnorado = null) {
  const comMesmoEmail = await repositorio.buscarPorEmail(usuario.email);
  if (comMesmoEmail && comMesmoEmail.id !== idIgnorado) {
    throw new AppError('Email já cadastrado', 409);
  }

  const comMesmoCpf = await repositorio.buscarPorCpf(usuario.cpf);
  if (comMesmoCpf && comMesmoCpf.id !== idIgnorado) {
    throw new AppError('CPF já cadastrado', 409);
  }
}

export async function listar() {
  return repositorio.listar();
}

export async function buscarPorId(id) {
  const usuario = await repositorio.buscarPorId(id);
  if (!usuario) {
    throw new AppError('Usuário não encontrado', 404);
  }
  return usuario;
}

export async function criar(corpo) {
  const usuario = validarUsuario(corpo);
  await garantirUnicidade(usuario);
  return repositorio.inserir(usuario);
}

export async function atualizar(id, corpo) {
  await buscarPorId(id);
  const usuario = validarUsuario(corpo);
  await garantirUnicidade(usuario, id);
  return repositorio.atualizar(id, usuario);
}

export async function remover(id) {
  await buscarPorId(id);
  await repositorio.remover(id);
}
