import { formatarData, mascararCpf, mascararTelefone } from '../utils/mascaras.js';

export default function ListaUsuarios({ usuarios, onEditar, onExcluir }) {
  if (usuarios.length === 0) {
    return <p className="estado-vazio">Nenhum usuário cadastrado até o momento.</p>;
  }

  return (
    <div className="tabela-envolucro">
      {/* os data-rotulo alimentam os rótulos via CSS quando a tabela vira cartão no celular */}
      <table className="tabela">
        <thead>
          <tr>
            <th>Nome</th>
            <th>E-mail</th>
            <th>CPF</th>
            <th>Telefone</th>
            <th>Nascimento</th>
            <th>Cadastro</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.map((usuario) => (
            <tr key={usuario.id}>
              <td data-rotulo="Nome">{usuario.nome}</td>
              <td data-rotulo="E-mail">{usuario.email}</td>
              <td data-rotulo="CPF">{mascararCpf(usuario.cpf)}</td>
              <td data-rotulo="Telefone">{mascararTelefone(usuario.telefone)}</td>
              <td data-rotulo="Nascimento">{formatarData(usuario.data_nascimento)}</td>
              <td data-rotulo="Cadastro">{formatarData(usuario.data_cadastro)}</td>
              <td className="celula-acoes">
                <button type="button" className="botao" onClick={() => onEditar(usuario)}>
                  Editar
                </button>
                <button type="button" className="botao botao-perigo" onClick={() => onExcluir(usuario)}>
                  Excluir
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
