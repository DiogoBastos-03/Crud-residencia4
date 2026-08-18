const BASE = `${import.meta.env.VITE_API_URL}/usuarios`;

class ErroApi extends Error {
  constructor(mensagem, detalhes) {
    super(mensagem);
    this.name = 'ErroApi';
    this.detalhes = detalhes ?? [];
  }
}

async function requisitar(caminho = '', opcoes = {}) {
  let resposta;
  try {
    resposta = await fetch(`${BASE}${caminho}`, {
      headers: { 'Content-Type': 'application/json' },
      ...opcoes
    });
  } catch {
    // fetch só rejeita quando a requisição nem chegou ao servidor; erro de HTTP vem abaixo
    throw new ErroApi('Não foi possível comunicar com o servidor.');
  }

  if (resposta.status === 204) {
    return null;
  }

  const corpo = await resposta.json().catch(() => null);
  if (!resposta.ok) {
    throw new ErroApi(corpo?.erro?.mensagem ?? 'Erro inesperado no servidor.', corpo?.erro?.detalhes);
  }
  return corpo;
}

export function listar() {
  return requisitar();
}

export function buscarPorId(id) {
  return requisitar(`/${id}`);
}

export function criar(usuario) {
  return requisitar('', { method: 'POST', body: JSON.stringify(usuario) });
}

export function atualizar(id, usuario) {
  return requisitar(`/${id}`, { method: 'PUT', body: JSON.stringify(usuario) });
}

export function remover(id) {
  return requisitar(`/${id}`, { method: 'DELETE' });
}
