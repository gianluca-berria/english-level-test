const express = require('express');
const prisma = require('../prisma');
const { isValidCpf, normalizeCpf } = require('../services/cpf');
const { serializeResult } = require('../services/resultSerializer');

const router = express.Router();

router.post('/verificar', async (req, res, next) => {
  try {
    const nome = String(req.body.nome || '').trim();
    const cpf = normalizeCpf(req.body.cpf);

    if (nome.length < 3) {
      return res.status(400).json({ message: 'Informe o nome completo.' });
    }

    if (!isValidCpf(cpf)) {
      return res.status(400).json({ message: 'CPF invalido.' });
    }

    const resultado = await prisma.resultado.findUnique({
      where: { cpf },
      include: { aluno: true }
    });

    if (resultado) {
      return res.json({
        jaRealizou: true,
        resultado: serializeResult(resultado)
      });
    }

    await prisma.aluno.upsert({
      where: { cpf },
      update: { nome },
      create: { nome, cpf }
    });

    return res.json({ jaRealizou: false, liberado: true });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
