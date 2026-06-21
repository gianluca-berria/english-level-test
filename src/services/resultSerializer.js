function serializeResult(resultado) {
  return {
    id: resultado.id,
    nome: resultado.aluno.nome,
    cpf: resultado.cpf,
    dataRealizacao: resultado.dataRealizacao,
    acertos: resultado.acertos,
    totalQuestoes: resultado.totalQuestoes,
    percentualGeral: resultado.percentualGeral,
    nivel: resultado.nivel,
    desempenhoPorCategoria: resultado.desempenhoPorCategoria
  };
}

module.exports = {
  serializeResult
};
