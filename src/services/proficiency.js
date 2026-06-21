function calculateLevel(percentual) {
  if (percentual <= 30) return 'Beginner';
  if (percentual <= 50) return 'Elementary';
  if (percentual <= 70) return 'Intermediate';
  if (percentual <= 85) return 'Upper Intermediate';
  return 'Advanced';
}

function calculatePerformance(answerRows) {
  const totalQuestoes = answerRows.length;
  const acertos = answerRows.filter((answer) => answer.correta).length;
  const percentualGeral = totalQuestoes === 0 ? 0 : roundPercent((acertos / totalQuestoes) * 100);
  const desempenhoPorCategoria = {};

  for (const answer of answerRows) {
    const categoria = answer.categoriaNomeSnapshot;

    if (!desempenhoPorCategoria[categoria]) {
      desempenhoPorCategoria[categoria] = {
        total: 0,
        acertos: 0,
        erros: 0,
        percentual: 0
      };
    }

    desempenhoPorCategoria[categoria].total += 1;
    if (answer.correta) {
      desempenhoPorCategoria[categoria].acertos += 1;
    } else {
      desempenhoPorCategoria[categoria].erros += 1;
    }
  }

  for (const categoria of Object.keys(desempenhoPorCategoria)) {
    const item = desempenhoPorCategoria[categoria];
    item.percentual = roundPercent((item.acertos / item.total) * 100);
  }

  return {
    totalQuestoes,
    acertos,
    percentualGeral,
    nivel: calculateLevel(percentualGeral),
    desempenhoPorCategoria
  };
}

function roundPercent(value) {
  return Math.round(value * 100) / 100;
}

module.exports = {
  calculateLevel,
  calculatePerformance
};
