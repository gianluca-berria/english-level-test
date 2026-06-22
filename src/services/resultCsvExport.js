const { isValidCpf, normalizeCpf } = require('./cpf');
const { resultToCsv } = require('./csv');

async function getResultCsvForCpf(cpfValue, db) {
  const cpf = normalizeCpf(cpfValue);

  if (!isValidCpf(cpf)) {
    throw createPublicError(400, 'CPF invalido.');
  }

  const resultado = await db.resultado.findUnique({
    where: { cpf },
    include: { aluno: true }
  });

  if (!resultado) {
    throw createPublicError(404, 'Resultado nao encontrado.');
  }

  return {
    cpf,
    filename: `resultado-${cpf}.csv`,
    csv: resultToCsv(resultado)
  };
}

function createPublicError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.publicMessage = message;
  return error;
}

module.exports = {
  getResultCsvForCpf
};
