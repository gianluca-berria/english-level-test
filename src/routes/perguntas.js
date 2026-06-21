const express = require('express');
const prisma = require('../prisma');

const router = express.Router();

router.get('/', async (_req, res, next) => {
  try {
    const perguntas = await prisma.pergunta.findMany({
      where: { ativa: true },
      orderBy: { id: 'asc' },
      include: {
        categoria: true,
        alternativas: {
          orderBy: { id: 'asc' },
          select: {
            id: true,
            texto: true
          }
        }
      }
    });

    return res.json(perguntas.map((pergunta) => ({
      id: pergunta.id,
      texto: pergunta.texto,
      categoria: {
        id: pergunta.categoria.id,
        nome: pergunta.categoria.nome
      },
      alternativas: pergunta.alternativas
    })));
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
