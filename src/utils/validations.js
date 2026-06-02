// Validação de email
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validação de senha (mínimo 8 caracteres)
export const isValidPassword = (password) => {
  return password.length >= 8;
};

// Validação de nome completo
export const isValidFullName = (name) => {
  return name.trim().length >= 3 && name.includes(" ");
};

// Validação de data (DD/MM/YYYY)
export const isValidDate = (date) => {
  const dateRegex = /^(0[1-9]|[12]\d|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;
  if (!dateRegex.test(date)) return false;

  const [day, month, year] = date.split("/").map(Number);
  const actualDate = new Date(year, month - 1, day);

  return (
    actualDate.getDate() === day &&
    actualDate.getMonth() === month - 1 &&
    actualDate.getFullYear() === year
  );
};

// Máscara para data (DD/MM/YYYY)
export const maskDate = (value) => {
  let masked = value.replace(/\D/g, "");

  if (masked.length >= 2) {
    masked = masked.slice(0, 2) + "/" + masked.slice(2);
  }
  if (masked.length >= 5) {
    masked = masked.slice(0, 5) + "/" + masked.slice(5, 9);
  }

  return masked;
};

// Máscara para nome (apenas letras e espaços)
export const maskName = (value) => {
  return value.replace(/[^a-záàâãéèêíïóôõöúçñ\s]/gi, "");
};

// Máscara para email (remove espaços)
export const maskEmail = (value) => {
  return value.trim();
};

// Máscara para telefone (XX) XXXXX-XXXX
export const maskPhone = (value) => {
  let masked = value.replace(/\D/g, "");

  if (masked.length <= 2) {
    return masked;
  } else if (masked.length <= 7) {
    return "(" + masked.slice(0, 2) + ") " + masked.slice(2);
  } else {
    return (
      "(" +
      masked.slice(0, 2) +
      ") " +
      masked.slice(2, 7) +
      "-" +
      masked.slice(7, 11)
    );
  }
};

// Máscara para CPF (XXX.XXX.XXX-XX)
export const maskCPF = (value) => {
  let masked = value.replace(/\D/g, "");

  if (masked.length <= 3) {
    return masked;
  } else if (masked.length <= 6) {
    return masked.slice(0, 3) + "." + masked.slice(3);
  } else if (masked.length <= 9) {
    return masked.slice(0, 3) + "." + masked.slice(3, 6) + "." + masked.slice(6);
  } else {
    return (
      masked.slice(0, 3) +
      "." +
      masked.slice(3, 6) +
      "." +
      masked.slice(6, 9) +
      "-" +
      masked.slice(9, 11)
    );
  }
};

// Validação de CPF
export const isValidCPF = (cpf) => {
  const cpfClean = cpf.replace(/\D/g, "");

  if (cpfClean.length !== 11) return false;

  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1{10}$/.test(cpfClean)) return false;

  // Calcula primeiro dígito verificador
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cpfClean[i]) * (10 - i);
  }
  let remainder = sum % 11;
  let firstDigit = remainder < 2 ? 0 : 11 - remainder;

  // Calcula segundo dígito verificador
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cpfClean[i]) * (11 - i);
  }
  remainder = sum % 11;
  let secondDigit = remainder < 2 ? 0 : 11 - remainder;

  return (
    firstDigit === parseInt(cpfClean[9]) &&
    secondDigit === parseInt(cpfClean[10])
  );
};
