import { useEffect } from 'react';

export default function DialogoConfirmacao({ usuario, onConfirmar, onCancelar }) {
  useEffect(() => {
    function aoTeclar(evento) {
      if (evento.key === 'Escape') onCancelar();
    }
    document.addEventListener('keydown', aoTeclar);
    return () => document.removeEventListener('keydown', aoTeclar);
  }, [onCancelar]);

  return (
    <div className="cortina" onClick={onCancelar}>
      <div
        className="dialogo"
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-dialogo"
        onClick={(evento) => evento.stopPropagation()}
      >
        <h2 id="titulo-dialogo">Excluir usuário</h2>
        <p>
          Deseja realmente excluir <strong>{usuario.nome}</strong>? Esta ação não pode ser desfeita.
        </p>
        <div className="acoes-dialogo">
          <button type="button" className="botao" onClick={onCancelar} autoFocus>
            Cancelar
          </button>
          <button type="button" className="botao botao-perigo" onClick={onConfirmar}>
            Excluir
          </button>
        </div>
      </div>
    </div>
  );
}
