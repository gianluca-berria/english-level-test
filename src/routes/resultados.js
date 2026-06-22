const express = require('express');
const prisma = require('../prisma');
const { isValidCpf, normalizeCpf } = require('../services/cpf');
const { calculatePerformance } = require('../services/proficiency');
const { getResultCsvForCpf } = require('../services/resultCsvExport');
const { serializeResult } = require('../services/resultSerializer');

const router = express.Router();

router.post('/', async (req, res, next) => {
  try {
    const nome = String(req.body.nome || '').trim();
    const cpf = normalizeCpf(req.body.cpf);
    const respostas = Array.isArray(req.body.respostas) ? req.body.respostas : [];

    if (nome.length < 3) {
      return res.status(400).json({ message: 'Informe o nome completo.' });
    }

    if (!isValidCpf(cpf)) {
      return res.status(400).json({ message: 'CPF invalido.' });
    }

    const existingResult = await prisma.resultado.findUnique({ where: { cpf } });
    if (existingResult) {
      return res.status(409).json({ message: 'Este CPF ja possui resultado cadastrado.' });
    }

    const activeQuestions = await prisma.pergunta.findMany({
      where: { ativa: true },
      include: {
        categoria: true,
        alternativas: true
      }
    });

    if (activeQuestions.length === 0) {
      return res.status(400).json({ message: 'Nao ha perguntas cadastradas.' });
    }

    if (respostas.length !== activeQuestions.length) {
      return res.status(400).json({ message: 'Todas as perguntas devem ser respondidas.' });
    }

    const questionById = new Map(activeQuestions.map((question) => [question.id, question]));
    const submittedQuestionIds = new Set();
    const answerRows = [];

    for (const resposta of respostas) {
      const perguntaId = Number(resposta.perguntaId);
      const alternativaId = Number(resposta.alternativaId);
      const pergunta = questionById.get(perguntaId);

      if (!pergunta || submittedQuestionIds.has(perguntaId)) {
        return res.status(400).json({ message: 'Resposta invalida.' });
      }

      submittedQuestionIds.add(perguntaId);

      const alternativa = pergunta.alternativas.find((item) => item.id === alternativaId);
      if (!alternativa) {
        return res.status(400).json({ message: 'Alternativa invalida para a pergunta informada.' });
      }

      answerRows.push({
        perguntaId,
        alternativaId,
        correta: alternativa.correta,
        categoriaNomeSnapshot: pergunta.categoria.nome,
        perguntaTextoSnapshot: pergunta.texto,
        alternativaTextoSnapshot: alternativa.texto
      });
    }

    const performance = calculatePerformance(answerRows);

    const resultado = await prisma.$transaction(async (tx) => {
      const aluno = await tx.aluno.upsert({
        where: { cpf },
        update: { nome },
        create: { nome, cpf }
      });

      return tx.resultado.create({
        data: {
          alunoId: aluno.id,
          cpf,
          acertos: performance.acertos,
          totalQuestoes: performance.totalQuestoes,
          percentualGeral: performance.percentualGeral,
          nivel: performance.nivel,
          desempenhoPorCategoria: performance.desempenhoPorCategoria,
          respostas: {
            create: answerRows
          }
        },
        include: { aluno: true }
      });
    });

    return res.status(201).json(serializeResult(resultado));
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(409).json({ message: 'Este CPF ja possui resultado cadastrado.' });
    }

    return next(error);
  }
});

router.get('/:cpf/exportar/csv', async (req, res, next) => {
  try {
    const exportFile = await getResultCsvForCpf(req.params.cpf, prisma);

    res.header('Content-Type', 'text/csv; charset=utf-8');
    res.header('Content-Disposition', `attachment; filename="${exportFile.filename}"`);
    return res.send(exportFile.csv);
  } catch (error) {
    if (error.statusCode && error.publicMessage) {
      return res.status(error.statusCode).json({ message: error.publicMessage });
    }

    return next(error);
  }
});

router.get('/:cpf', async (req, res, next) => {
  try {
    const cpf = normalizeCpf(req.params.cpf);

    if (!isValidCpf(cpf)) {
      return res.status(400).json({ message: 'CPF invalido.' });
    }

    const resultado = await prisma.resultado.findUnique({
      where: { cpf },
      include: { aluno: true }
    });

    if (!resultado) {
      return res.status(404).json({ message: 'Resultado nao encontrado.' });
    }

    return res.json(serializeResult(resultado));
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
