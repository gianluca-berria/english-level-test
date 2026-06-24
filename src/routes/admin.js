const express = require('express');
const prisma = require('../prisma');
const requireAdmin = require('../middleware/adminAuth');
const requireSameOrigin = require('../middleware/adminOrigin');
const AdminError = require('../services/adminError');
const catalog = require('../services/adminCatalog');

const router = express.Router();

router.use(requireSameOrigin);
router.use((_req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
});
router.use(requireAdmin);

function route(handler) {
  return async (req, res, next) => {
    try {
      await handler(req, res);
    } catch (error) {
      if (error instanceof AdminError) {
        return res.status(error.statusCode).json({ message: error.publicMessage });
      }

      return next(error);
    }
  };
}

router.get('/categorias', route(async (_req, res) => {
  res.json(await catalog.listCategories(prisma));
}));

router.post('/categorias', route(async (req, res) => {
  res.status(201).json(await catalog.createCategory(prisma, req.body));
}));

router.put('/categorias/:id', route(async (req, res) => {
  res.json(await catalog.updateCategory(prisma, req.params.id, req.body));
}));

router.delete('/categorias/:id', route(async (req, res) => {
  await catalog.deleteCategory(prisma, req.params.id);
  res.status(204).send();
}));

router.get('/perguntas', route(async (_req, res) => {
  res.json(await catalog.listQuestions(prisma));
}));

router.post('/perguntas', route(async (req, res) => {
  res.status(201).json(await catalog.createQuestion(prisma, req.body));
}));

router.put('/perguntas/:id', route(async (req, res) => {
  res.json(await catalog.updateQuestion(prisma, req.params.id, req.body));
}));

router.delete('/perguntas/:id', route(async (req, res) => {
  await catalog.deleteQuestion(prisma, req.params.id);
  res.status(204).send();
}));

router.get('/perguntas/:perguntaId/alternativas', route(async (req, res) => {
  res.json(await catalog.listAlternatives(prisma, req.params.perguntaId));
}));

router.post('/perguntas/:perguntaId/alternativas', route(async (req, res) => {
  res.status(201).json(
    await catalog.createAlternative(prisma, req.params.perguntaId, req.body)
  );
}));

router.put('/alternativas/:id', route(async (req, res) => {
  res.json(await catalog.updateAlternative(prisma, req.params.id, req.body));
}));

router.delete('/alternativas/:id', route(async (req, res) => {
  await catalog.deleteAlternative(prisma, req.params.id);
  res.status(204).send();
}));

module.exports = router;
