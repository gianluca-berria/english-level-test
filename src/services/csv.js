function resultsToCsv(resultados) {
  const headers = [
    'Nome',
    'CPF',
    'Nivel',
    'Acertos',
    'Total',
    'Percentual',
    'Data',
    'DesempenhoPorCategoria'
  ];

  const rows = resultados.map((resultado) => [
    resultado.aluno.nome,
    resultado.cpf,
    resultado.nivel,
    resultado.acertos,
    resultado.totalQuestoes,
    resultado.percentualGeral,
    resultado.dataRealizacao.toISOString(),
    JSON.stringify(resultado.desempenhoPorCategoria)
  ]);

  return [headers, ...rows].map((row) => row.map(escapeCsv).join(',')).join('\n');
}

function resultToCsv(resultado) {
  return resultsToCsv([resultado]);
}

function escapeCsv(value) {
  const text = String(value ?? '');
  if (/[",\n\r]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }

  return text;
}

module.exports = {
  resultToCsv,
  resultsToCsv
};
