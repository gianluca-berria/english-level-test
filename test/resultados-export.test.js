const assert = require('node:assert/strict');
const test = require('node:test');

const { getResultCsvForCpf } = require('../src/services/resultCsvExport');

function createDbMock(findUnique) {
  return {
    resultado: {
      findUnique,
      findMany: async () => {
        throw new Error('findMany should not be used by individual export');
      }
    }
  };
}

test('exports one CSV row for a valid normalized CPF', async () => {
  let receivedArgs;
  const db = createDbMock(async (args) => {
    receivedArgs = args;

    return {
      id: 10,
      aluno: { nome: 'Maria, "Teste"' },
      cpf: '12345678909',
      dataRealizacao: new Date('2026-06-22T10:30:00.000Z'),
      acertos: 8,
      totalQuestoes: 10,
      percentualGeral: 80,
      nivel: 'Upper Intermediate',
      desempenhoPorCategoria: {
        Grammar: {
          acertos: 4,
          erros: 1,
          total: 5,
          percentual: 80
        }
      }
    };
  });

  const exportFile = await getResultCsvForCpf('123.456.789-09', db);

  assert.equal(exportFile.cpf, '12345678909');
  assert.equal(exportFile.filename, 'resultado-12345678909.csv');
  assert.deepEqual(receivedArgs, {
    where: { cpf: '12345678909' },
    include: { aluno: true }
  });
  assert.match(
    exportFile.csv,
    /^Nome,CPF,Nivel,Acertos,Total,Percentual,Data,DesempenhoPorCategoria\n/
  );
  assert.match(exportFile.csv, /"Maria, ""Teste""",12345678909,Upper Intermediate,8,10,80,/);
  assert.equal(exportFile.csv.split('\n').length, 2);
});

test('rejects invalid CPF before querying the database', async () => {
  let wasQueried = false;
  const db = createDbMock(async () => {
    wasQueried = true;
    return null;
  });

  await assert.rejects(
    () => getResultCsvForCpf('11111111111', db),
    (error) => {
      assert.equal(error.statusCode, 400);
      assert.equal(error.publicMessage, 'CPF invalido.');
      return true;
    }
  );
  assert.equal(wasQueried, false);
});

test('returns a public 404 error for valid CPF without result', async () => {
  const db = createDbMock(async () => null);

  await assert.rejects(
    () => getResultCsvForCpf('98765432100', db),
    (error) => {
      assert.equal(error.statusCode, 404);
      assert.equal(error.publicMessage, 'Resultado nao encontrado.');
      return true;
    }
  );
});
