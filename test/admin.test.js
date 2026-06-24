const assert = require('node:assert/strict');
const test = require('node:test');

const {
  createSessionToken,
  getSessionFromRequest,
  validateCredentials
} = require('../src/services/adminAuth');
const catalog = require('../src/services/adminCatalog');

function withAdminEnvironment(callback) {
  const previous = {
    ADMIN_USERNAME: process.env.ADMIN_USERNAME,
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
    ADMIN_SESSION_SECRET: process.env.ADMIN_SESSION_SECRET
  };

  process.env.ADMIN_USERNAME = 'manager';
  process.env.ADMIN_PASSWORD = 'strong-password';
  process.env.ADMIN_SESSION_SECRET = 'a-secret-with-more-than-thirty-two-characters';

  try {
    return callback();
  } finally {
    Object.entries(previous).forEach(([key, value]) => {
      if (value === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    });
  }
}

test('validates admin credentials and reads a signed session cookie', () => {
  withAdminEnvironment(() => {
    assert.equal(validateCredentials('manager', 'strong-password'), true);
    assert.equal(validateCredentials('manager', 'wrong-password'), false);

    const token = createSessionToken('manager');
    const session = getSessionFromRequest({
      headers: { cookie: `english_level_admin=${token}` }
    });

    assert.equal(session.username, 'manager');
    assert.equal(
      getSessionFromRequest({
        headers: { cookie: `english_level_admin=${token}changed` }
      }),
      null
    );
  });
});

test('rejects question creation without exactly one correct alternative', async () => {
  const db = {
    categoria: {
      findUnique: async () => ({ id: 1 })
    },
    pergunta: {
      create: async () => {
        throw new Error('Question should not be created');
      }
    }
  };

  await assert.rejects(
    () => catalog.createQuestion(db, {
      texto: 'Question',
      categoriaId: 1,
      alternativas: [
        { texto: 'A', correta: false },
        { texto: 'B', correta: false }
      ]
    }),
    (error) => {
      assert.equal(error.statusCode, 400);
      assert.equal(error.publicMessage, 'Defina exatamente uma alternativa correta.');
      return true;
    }
  );
});

test('blocks deleting a category that still has questions', async () => {
  const db = {
    categoria: {
      findUnique: async () => ({
        id: 1,
        _count: { perguntas: 2 }
      }),
      delete: async () => {
        throw new Error('Category should not be deleted');
      }
    }
  };

  await assert.rejects(
    () => catalog.deleteCategory(db, 1),
    (error) => {
      assert.equal(error.statusCode, 409);
      assert.match(error.publicMessage, /perguntas associadas/);
      return true;
    }
  );
});

test('does not allow the sole correct alternative to be unset or deleted', async () => {
  const db = {
    alternativa: {
      findUnique: async (args) => ({
        id: args.where.id,
        perguntaId: 7,
        texto: 'Correct',
        correta: true,
        _count: { respostas: 0 }
      })
    }
  };

  await assert.rejects(
    () => catalog.updateAlternative(db, 3, { texto: 'Correct', correta: false }),
    (error) => {
      assert.equal(error.statusCode, 400);
      return true;
    }
  );

  await assert.rejects(
    () => catalog.deleteAlternative(db, 3),
    (error) => {
      assert.equal(error.statusCode, 409);
      return true;
    }
  );
});
