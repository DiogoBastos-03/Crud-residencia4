export function somenteDigitos(valor) {
  return String(valor ?? '').replace(/\D/g, '');
}

export function mascararCpf(valor) {
  const digitos = somenteDigitos(valor).slice(0, 11);
  let saida = digitos.slice(0, 3);
  if (digitos.length > 3) saida += `.${digitos.slice(3, 6)}`;
  if (digitos.length > 6) saida += `.${digitos.slice(6, 9)}`;
  if (digitos.length > 9) saida += `-${digitos.slice(9)}`;
  return saida;
}

export function mascararTelefone(valor) {
  const digitos = somenteDigitos(valor).slice(0, 11);
  if (!digitos) return '';
  const corte = digitos.length > 10 ? 7 : 6;
  let saida = `(${digitos.slice(0, 2)}`;
  if (digitos.length > 2) saida += `) ${digitos.slice(2, corte)}`;
  if (digitos.length > corte) saida += `-${digitos.slice(corte)}`;
  return saida;
}

export function formatarData(valor) {
  if (!valor) return '';
  const [ano, mes, dia] = valor.slice(0, 10).split('-');
  return `${dia}/${mes}/${ano}`;
}

export function cpfValido(cpf) {
  const digitos = somenteDigitos(cpf);
  if (digitos.length !== 11 || /^(\d)\1{10}$/.test(digitos)) {
    return false;
  }

  let soma = 0;
  for (let i = 0; i < 9; i++) {
    soma += Number(digitos[i]) * (10 - i);
  }
  if (((soma * 10) % 11) % 10 !== Number(digitos[9])) {
    return false;
  }

  soma = 0;
  for (let i = 0; i < 10; i++) {
    soma += Number(digitos[i]) * (11 - i);
  }
  return ((soma * 10) % 11) % 10 === Number(digitos[10]);
}
