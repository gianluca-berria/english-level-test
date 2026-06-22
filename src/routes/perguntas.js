const express = require('express');
const prisma = require('../prisma');

const router = express.Router();

/*
 * Embaralha uma lista usando o algoritmo Fisher-Yates.
 * Uma nova lista é criada para evitar modificar os dados originais.
 */
function embaralhar(lista) {
  const copia = [...lista];

  for (let indice = copia.length - 1; indice > 0; indice -= 1) {
    const indiceAleatorio = Math.floor(
      Math.random() * (indice + 1)
    );

    [copia[indice], copia[indiceAleatorio]] = [
      copia[indiceAleatorio],
      copia[indice]
    ];
  }

  return copia;
}

router.get('/', async (_req, res, next) => {
  try {
    const perguntas = await prisma.pergunta.findMany({
      where: {
        ativa: true
      },
      include: {
        categoria: true,
        alternativas: {
          select: {
            id: true,
            texto: true
          }
        }
      }
    });

    const perguntasFormatadas = perguntas.map((pergunta) => ({
      id: pergunta.id,
      texto: pergunta.texto,
      categoria: {
        id: pergunta.categoria.id,
        nome: pergunta.categoria.nome
      },
      alternativas: embaralhar(pergunta.alternativas)
    }));

    const perguntasEmbaralhadas = embaralhar(
      perguntasFormatadas
    );

    return res.json(perguntasEmbaralhadas);
  } catch (error) {
    return next(error);
  }
});

module.exports = router;