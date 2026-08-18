import * as servico from '../services/usuarios.service.js';
import { validarId } from '../validators/usuario.validator.js';

export async function criar(req, res, next) {
  try {
    const usuario = await servico.criar(req.body);
    res.status(201).json(usuario);
  } catch (erro) {
    next(erro);
  }
}

export async function listar(req, res, next) {
  try {
    const usuarios = await servico.listar();
    res.status(200).json(usuarios);
  } catch (erro) {
    next(erro);
  }
}

export async function buscarPorId(req, res, next) {
  try {
    const id = validarId(req.params.id);
    const usuario = await servico.buscarPorId(id);
    res.status(200).json(usuario);
  } catch (erro) {
    next(erro);
  }
}

export async function atualizar(req, res, next) {
  try {
    const id = validarId(req.params.id);
    const usuario = await servico.atualizar(id, req.body);
    res.status(200).json(usuario);
  } catch (erro) {
    next(erro);
  }
}

export async function remover(req, res, next) {
  try {
    const id = validarId(req.params.id);
    await servico.remover(id);
    res.status(204).send();
  } catch (erro) {
    next(erro);
  }
}
