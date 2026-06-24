const AdminError = require('./adminError');

function requiredText(value, fieldName) {
  const text = String(value || '').trim();

  if (!text) {
    throw new AdminError(400, `${fieldName} é obrigatório.`);
  }

  if (text.length > 2000) {
    throw new AdminError(400, `${fieldName} excede o tamanho permitido.`);
  }

  return text;
}

function positiveId(value, fieldName = 'Identificador') {
  const id = Number(value);

  if (!Number.isInteger(id) || id <= 0) {
    throw new AdminError(400, `${fieldName} inválido.`);
  }

  return id;
}

function serializeQuestion(question) {
  return {
    id: question.id,
    texto: question.texto,
    categoriaId: question.categoriaId,
    ativa: question.ativa,
    createdAt: question.createdAt,
    categoria: question.categoria,
    alternativas: question.alternativas
  };
}

async function ensureCategoryExists(db, categoriaId) {
  const category = await db.categoria.findUnique({ where: { id: categoriaId } });
  if (!category) {
    throw new AdminError(400, 'Categoria não encontrada.');
  }
}

async function ensureQuestionExists(db, perguntaId, include = undefined) {
  const question = await db.pergunta.findUnique({
    where: { id: perguntaId },
    ...(include ? { include } : {})
  });

  if (!question) {
    throw new AdminError(404, 'Pergunta não encontrada.');
  }

  return question;
}

async function listCategories(db) {
  return db.categoria.findMany({
    orderBy: { nome: 'asc' },
    include: {
      _count: {
        select: { perguntas: true }
      }
    }
  });
}

async function createCategory(db, input) {
  const nome = requiredText(input.nome, 'Nome da categoria');

  try {
    return await db.categoria.create({ data: { nome } });
  } catch (error) {
    if (error.code === 'P2002') {
      throw new AdminError(409, 'Já existe uma categoria com esse nome.');
    }
    throw error;
  }
}

async function updateCategory(db, idValue, input) {
  const id = positiveId(idValue, 'Categoria');
  const nome = requiredText(input.nome, 'Nome da categoria');

  try {
    return await db.categoria.update({ where: { id }, data: { nome } });
  } catch (error) {
    if (error.code === 'P2002') {
      throw new AdminError(409, 'Já existe uma categoria com esse nome.');
    }
    if (error.code === 'P2025') {
      throw new AdminError(404, 'Categoria não encontrada.');
    }
    throw error;
  }
}

async function deleteCategory(db, idValue) {
  const id = positiveId(idValue, 'Categoria');
  const category = await db.categoria.findUnique({
    where: { id },
    include: { _count: { select: { perguntas: true } } }
  });

  if (!category) {
    throw new AdminError(404, 'Categoria não encontrada.');
  }

  if (category._count.perguntas > 0) {
    throw new AdminError(
      409,
      'A categoria possui perguntas associadas. Mova ou exclua essas perguntas antes.'
    );
  }

  await db.categoria.delete({ where: { id } });
}

async function listQuestions(db) {
  const questions = await db.pergunta.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      categoria: true,
      alternativas: {
        orderBy: { id: 'asc' }
      }
    }
  });

  return questions.map(serializeQuestion);
}

function parseAlternatives(input) {
  if (!Array.isArray(input) || input.length === 0) {
    throw new AdminError(400, 'Informe ao menos uma alternativa.');
  }

  const alternatives = input.map((alternative) => ({
    texto: requiredText(alternative && alternative.texto, 'Texto da alternativa'),
    correta: alternative && alternative.correta === true
  }));

  if (alternatives.filter((alternative) => alternative.correta).length !== 1) {
    throw new AdminError(400, 'Defina exatamente uma alternativa correta.');
  }

  return alternatives;
}

async function createQuestion(db, input) {
  const texto = requiredText(input.texto, 'Texto da pergunta');
  const categoriaId = positiveId(input.categoriaId, 'Categoria');
  const alternativas = parseAlternatives(input.alternativas);

  await ensureCategoryExists(db, categoriaId);

  return db.pergunta.create({
    data: {
      texto,
      categoriaId,
      ativa: input.ativa !== false,
      alternativas: { create: alternativas }
    },
    include: {
      categoria: true,
      alternativas: { orderBy: { id: 'asc' } }
    }
  });
}

async function updateQuestion(db, idValue, input) {
  const id = positiveId(idValue, 'Pergunta');
  const texto = requiredText(input.texto, 'Texto da pergunta');
  const categoriaId = positiveId(input.categoriaId, 'Categoria');

  await ensureQuestionExists(db, id);
  await ensureCategoryExists(db, categoriaId);

  return db.pergunta.update({
    where: { id },
    data: {
      texto,
      categoriaId,
      ativa: input.ativa !== false
    },
    include: {
      categoria: true,
      alternativas: { orderBy: { id: 'asc' } }
    }
  });
}

async function deleteQuestion(db, idValue) {
  const id = positiveId(idValue, 'Pergunta');
  const question = await ensureQuestionExists(db, id, {
    _count: { select: { respostas: true } }
  });

  if (question._count.respostas > 0) {
    throw new AdminError(
      409,
      'A pergunta já possui respostas registradas e não pode ser excluída. Desative-a para removê-la de novos testes.'
    );
  }

  await db.$transaction([
    db.alternativa.deleteMany({ where: { perguntaId: id } }),
    db.pergunta.delete({ where: { id } })
  ]);
}

async function listAlternatives(db, perguntaIdValue) {
  const perguntaId = positiveId(perguntaIdValue, 'Pergunta');
  await ensureQuestionExists(db, perguntaId);

  return db.alternativa.findMany({
    where: { perguntaId },
    orderBy: { id: 'asc' }
  });
}

async function createAlternative(db, perguntaIdValue, input) {
  const perguntaId = positiveId(perguntaIdValue, 'Pergunta');
  const texto = requiredText(input.texto, 'Texto da alternativa');
  const correta = input.correta === true;
  const question = await ensureQuestionExists(db, perguntaId, { alternativas: true });

  if (!correta && !question.alternativas.some((alternative) => alternative.correta)) {
    throw new AdminError(400, 'A pergunta precisa ter uma alternativa correta.');
  }

  return db.$transaction(async (tx) => {
    if (correta) {
      await tx.alternativa.updateMany({
        where: { perguntaId, correta: true },
        data: { correta: false }
      });
    }

    return tx.alternativa.create({
      data: { perguntaId, texto, correta }
    });
  });
}

async function updateAlternative(db, idValue, input) {
  const id = positiveId(idValue, 'Alternativa');
  const texto = requiredText(input.texto, 'Texto da alternativa');
  const correta = input.correta === true;
  const alternative = await db.alternativa.findUnique({ where: { id } });

  if (!alternative) {
    throw new AdminError(404, 'Alternativa não encontrada.');
  }

  if (alternative.correta && !correta) {
    throw new AdminError(
      400,
      'Defina outra alternativa como correta antes de desmarcar esta.'
    );
  }

  return db.$transaction(async (tx) => {
    if (correta) {
      await tx.alternativa.updateMany({
        where: {
          perguntaId: alternative.perguntaId,
          correta: true,
          NOT: { id }
        },
        data: { correta: false }
      });
    }

    return tx.alternativa.update({
      where: { id },
      data: { texto, correta }
    });
  });
}

async function deleteAlternative(db, idValue) {
  const id = positiveId(idValue, 'Alternativa');
  const alternative = await db.alternativa.findUnique({
    where: { id },
    include: { _count: { select: { respostas: true } } }
  });

  if (!alternative) {
    throw new AdminError(404, 'Alternativa não encontrada.');
  }

  if (alternative.correta) {
    throw new AdminError(
      409,
      'Defina outra alternativa como correta antes de excluir esta.'
    );
  }

  if (alternative._count.respostas > 0) {
    throw new AdminError(
      409,
      'A alternativa já possui respostas registradas e não pode ser excluída.'
    );
  }

  await db.alternativa.delete({ where: { id } });
}

module.exports = {
  createAlternative,
  createCategory,
  createQuestion,
  deleteAlternative,
  deleteCategory,
  deleteQuestion,
  listAlternatives,
  listCategories,
  listQuestions,
  updateAlternative,
  updateCategory,
  updateQuestion
};
