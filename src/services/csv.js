function resultsToCsv(resultados) {
  const headers = [
    'id',
    'nome',
    'cpf',
    'dataRealizacao',
    'acertos',
    'totalQuestoes',
    'percentualGeral',
    'nivel',
    'desempenhoPorCategoria'
  ];

  const rows = resultados.map((resultado) => [
    resultado.id,
    resultado.aluno.nome,
    resultado.cpf,
    resultado.dataRealizacao.toISOString(),
    resultado.acertos,
    resultado.totalQuestoes,
    resultado.percentualGeral,
    resultado.nivel,
    JSON.stringify(resultado.desempenhoPorCategoria)
  ]);

  return [headers, ...rows].map((row) => row.map(escapeCsv).join(',')).join('\n');
}

function escapeCsv(value) {
  const text = String(value ?? '');
  if (/[",\n\r]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }

  return text;
}

module.exports = {
  resultsToCsv
};
