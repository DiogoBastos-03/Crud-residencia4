import { useEffect, useState } from 'react';
import { cpfValido, mascararCpf, mascararTelefone, somenteDigitos } from '../utils/mascaras.js';

const CAMPOS_VAZIOS = { nome: '', email: '', cpf: '', telefone: '', data_nascimento: '' };

function hojeLocal() {
  // toISOString devolveria a data em UTC e adiantaria um dia no fim da tarde
  const agora = new Date();
  const mes = String(agora.getMonth() + 1).padStart(2, '0');
  const dia = String(agora.getDate()).padStart(2, '0');
  return `${agora.getFullYear()}-${mes}-${dia}`;
}

function paraFormulario(usuario) {
  if (!usuario) return CAMPOS_VAZIOS;
  return {
    nome: usuario.nome,
    email: usuario.email,
    cpf: mascararCpf(usuario.cpf),
    telefone: mascararTelefone(usuario.telefone),
    data_nascimento: usuario.data_nascimento.slice(0, 10)
  };
}

function validar(valores) {
  const erros = {};

  const nome = valores.nome.trim();
  if (!nome) erros.nome = 'Informe o nome.';
  else if (nome.length < 3) erros.nome = 'O nome deve ter ao menos 3 caracteres.';

  const email = valores.email.trim();
  if (!email) erros.email = 'Informe o e-mail.';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) erros.email = 'E-mail em formato inválido.';

  const cpf = somenteDigitos(valores.cpf);
  if (!cpf) erros.cpf = 'Informe o CPF.';
  else if (cpf.length !== 11) erros.cpf = 'O CPF deve ter 11 dígitos.';
  else if (!cpfValido(cpf)) erros.cpf = 'CPF inválido.';

  const telefone = somenteDigitos(valores.telefone);
  if (!telefone) erros.telefone = 'Informe o telefone.';
  else if (telefone.length < 10 || telefone.length > 11) {
    erros.telefone = 'O telefone deve ter 10 ou 11 dígitos com DDD.';
  }

  if (!valores.data_nascimento) erros.data_nascimento = 'Informe a data de nascimento.';
  else if (valores.data_nascimento >= hojeLocal()) {
    erros.data_nascimento = 'A data de nascimento não pode ser futura.';
  }

  return erros;
}

export default function FormularioUsuario({ usuario, onSalvar, onCancelar }) {
  const [valores, setValores] = useState(CAMPOS_VAZIOS);
  const [erros, setErros] = useState({});
  const [erroGeral, setErroGeral] = useState(null);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    setValores(paraFormulario(usuario));
    setErros({});
    setErroGeral(null);
  }, [usuario]);

  function alterar(campo, valor) {
    setValores((anterior) => ({ ...anterior, [campo]: valor }));
    setErros((anterior) => ({ ...anterior, [campo]: undefined }));
  }

  async function enviar(evento) {
    evento.preventDefault();
    setErroGeral(null);

    const encontrados = validar(valores);
    if (Object.keys(encontrados).length > 0) {
      setErros(encontrados);
      return;
    }

    setEnviando(true);
    try {
      await onSalvar({
        nome: valores.nome.trim(),
        email: valores.email.trim(),
        cpf: somenteDigitos(valores.cpf),
        telefone: somenteDigitos(valores.telefone),
        data_nascimento: valores.data_nascimento
      });
      setValores(CAMPOS_VAZIOS);
      setErros({});
    } catch (erro) {
      if (erro.detalhes?.length) {
        const porCampo = {};
        erro.detalhes.forEach((item) => {
          porCampo[item.campo] = item.mensagem;
        });
        setErros(porCampo);
      } else if (erro.status === 409) {
        // o 409 vem sem detalhes: a colisão só pode ser em email ou cpf, os dois campos únicos
        setErros({ [erro.message.startsWith('CPF') ? 'cpf' : 'email']: erro.message });
      } else {
        setErroGeral(erro.message);
      }
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form className="formulario" onSubmit={enviar} noValidate>
      <h2>{usuario ? 'Editar usuário' : 'Novo usuário'}</h2>

      {erroGeral && <p className="alerta-formulario">{erroGeral}</p>}

      <div className="campos">
        <div className="campo campo-largo">
          <label htmlFor="nome">Nome</label>
          <input
            id="nome"
            value={valores.nome}
            maxLength={120}
            onChange={(evento) => alterar('nome', evento.target.value)}
            className={erros.nome ? 'invalido' : undefined}
          />
          {erros.nome && <span className="erro-campo">{erros.nome}</span>}
        </div>

        <div className="campo campo-largo">
          <label htmlFor="email">E-mail</label>
          <input
            id="email"
            type="email"
            value={valores.email}
            maxLength={160}
            onChange={(evento) => alterar('email', evento.target.value)}
            className={erros.email ? 'invalido' : undefined}
          />
          {erros.email && <span className="erro-campo">{erros.email}</span>}
        </div>

        <div className="campo">
          <label htmlFor="cpf">CPF</label>
          <input
            id="cpf"
            inputMode="numeric"
            placeholder="000.000.000-00"
            value={valores.cpf}
            onChange={(evento) => alterar('cpf', mascararCpf(evento.target.value))}
            className={erros.cpf ? 'invalido' : undefined}
          />
          {erros.cpf && <span className="erro-campo">{erros.cpf}</span>}
        </div>

        <div className="campo">
          <label htmlFor="telefone">Telefone</label>
          <input
            id="telefone"
            inputMode="numeric"
            placeholder="(00) 00000-0000"
            value={valores.telefone}
            onChange={(evento) => alterar('telefone', mascararTelefone(evento.target.value))}
            className={erros.telefone ? 'invalido' : undefined}
          />
          {erros.telefone && <span className="erro-campo">{erros.telefone}</span>}
        </div>

        <div className="campo">
          <label htmlFor="data_nascimento">Data de nascimento</label>
          <input
            id="data_nascimento"
            type="date"
            value={valores.data_nascimento}
            onChange={(evento) => alterar('data_nascimento', evento.target.value)}
            className={erros.data_nascimento ? 'invalido' : undefined}
          />
          {erros.data_nascimento && <span className="erro-campo">{erros.data_nascimento}</span>}
        </div>
      </div>

      <div className="acoes-formulario">
        <button type="submit" className="botao botao-primario" disabled={enviando}>
          {enviando ? 'Salvando' : usuario ? 'Salvar alterações' : 'Cadastrar'}
        </button>
        {usuario && (
          <button type="button" className="botao" onClick={onCancelar} disabled={enviando}>
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}
