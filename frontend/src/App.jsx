import { useCallback, useEffect, useState } from 'react';
import * as api from './api/usuarios.js';
import ListaUsuarios from './components/ListaUsuarios.jsx';
import FormularioUsuario from './components/FormularioUsuario.jsx';
import DialogoConfirmacao from './components/DialogoConfirmacao.jsx';

export default function App() {
  const [usuarios, setUsuarios] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erroLista, setErroLista] = useState(null);
  const [emEdicao, setEmEdicao] = useState(null);
  const [paraExcluir, setParaExcluir] = useState(null);
  const [idCarregando, setIdCarregando] = useState(null);
  const [feedback, setFeedback] = useState(null);

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErroLista(null);
    try {
      setUsuarios(await api.listar());
    } catch (erro) {
      setErroLista(erro.message);
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  useEffect(() => {
    if (!feedback) return undefined;
    const temporizador = setTimeout(() => setFeedback(null), 3000);
    return () => clearTimeout(temporizador);
  }, [feedback]);

  async function salvar(dados) {
    if (emEdicao) {
      await api.atualizar(emEdicao.id, dados);
      setEmEdicao(null);
      setFeedback({ texto: 'Usuário atualizado.', tipo: 'sucesso' });
    } else {
      await api.criar(dados);
      setFeedback({ texto: 'Usuário cadastrado.', tipo: 'sucesso' });
    }
    await carregar();
  }

  async function editar(usuario) {
    setIdCarregando(usuario.id);
    try {
      // rebusca na API porque a linha da lista pode estar defasada em relação ao banco
      setEmEdicao(await api.buscarPorId(usuario.id));
      window.scrollTo({ top: 0 });
    } catch (erro) {
      setFeedback({ texto: erro.message, tipo: 'erro' });
      await carregar();
    } finally {
      setIdCarregando(null);
    }
  }

  async function confirmarExclusao() {
    const alvo = paraExcluir;
    setParaExcluir(null);
    try {
      await api.remover(alvo.id);
      if (emEdicao?.id === alvo.id) setEmEdicao(null);
      setFeedback({ texto: 'Usuário excluído.', tipo: 'sucesso' });
      await carregar();
    } catch (erro) {
      setErroLista(erro.message);
    }
  }

  return (
    <div className="pagina">
      <header className="cabecalho">
        <h1>Cadastro de Usuários</h1>
        <p>Gerenciamento de usuários do sistema.</p>
      </header>

      {feedback && (
        <p className={feedback.tipo === 'erro' ? 'feedback feedback-erro' : 'feedback'}>
          {feedback.texto}
        </p>
      )}

      <FormularioUsuario usuario={emEdicao} onSalvar={salvar} onCancelar={() => setEmEdicao(null)} />

      <section className="secao-lista">
        <h2>Usuários cadastrados</h2>

        {carregando && <p className="estado-carregando">Carregando usuários...</p>}

        {!carregando && erroLista && (
          <div className="alerta-falha">
            <p>{erroLista}</p>
            <button type="button" className="botao" onClick={carregar}>
              Tentar novamente
            </button>
          </div>
        )}

        {!carregando && !erroLista && (
          <ListaUsuarios
            usuarios={usuarios}
            idCarregando={idCarregando}
            onEditar={editar}
            onExcluir={setParaExcluir}
          />
        )}
      </section>

      {paraExcluir && (
        <DialogoConfirmacao
          usuario={paraExcluir}
          onConfirmar={confirmarExclusao}
          onCancelar={() => setParaExcluir(null)}
        />
      )}
    </div>
  );
}
