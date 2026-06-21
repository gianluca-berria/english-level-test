function normalizeCpf(cpf) {
  return String(cpf || '').replace(/\D/g, '');
}

function isValidCpf(cpf) {
  const value = normalizeCpf(cpf);

  if (!/^\d{11}$/.test(value)) {
    return false;
  }

  if (/^(\d)\1{10}$/.test(value)) {
    return false;
  }

  const digits = value.split('').map(Number);
  const firstDigit = calculateDigit(digits.slice(0, 9), 10);
  const secondDigit = calculateDigit([...digits.slice(0, 9), firstDigit], 11);

  return firstDigit === digits[9] && secondDigit === digits[10];
}

function calculateDigit(numbers, initialWeight) {
  const sum = numbers.reduce((total, number, index) => {
    return total + number * (initialWeight - index);
  }, 0);

  const remainder = (sum * 10) % 11;
  return remainder === 10 ? 0 : remainder;
}

module.exports = {
  normalizeCpf,
  isValidCpf
};
