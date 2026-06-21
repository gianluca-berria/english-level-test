const state = {
  aluno: null,
  perguntas: []
};

const startView = document.querySelector('#start-view');
const testView = document.querySelector('#test-view');
const resultView = document.querySelector('#result-view');
const studentForm = document.querySelector('#student-form');
const testForm = document.querySelector('#test-form');
const nameInput = document.querySelector('#name-input');
const cpfInput = document.querySelector('#cpf-input');
const message = document.querySelector('#message');
const questionsContainer = document.querySelector('#questions-container');
const questionCount = document.querySelector('#question-count');
const resultLevel = document.querySelector('#result-level');
const resultSummary = document.querySelector('#result-summary');
const categoryPerformance = document.querySelector('#category-performance');
const newSearchButton = document.querySelector('#new-search-button');

cpfInput.addEventListener('input', () => {
  cpfInput.value = cpfInput.value.replace(/\D/g, '').slice(0, 11);
});

studentForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  setMessage('');

  const nome = nameInput.value.trim();
  const cpf = cpfInput.value.trim();

  if (!nome || cpf.length !== 11 || !/^\d+$/.test(cpf)) {
    setMessage('Informe nome completo e CPF com exatamente 11 numeros.');
    return;
  }

  try {
    const verification = await requestJson('/api/alunos/verificar', {
      method: 'POST',
      body: JSON.stringify({ nome, cpf })
    });

    if (verification.jaRealizou) {
      renderResult(verification.resultado);
      showView(resultView);
      return;
    }

    state.aluno = { nome, cpf };
    await loadQuestions();
    showView(testView);
  } catch (error) {
    setMessage(error.message);
  }
});

testForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  setMessage('');

  const respostas = state.perguntas.map((pergunta) => {
    const selected = document.querySelector(`input[name="pergunta-${pergunta.id}"]:checked`);
    return {
      perguntaId: pergunta.id,
      alternativaId: selected ? Number(selected.value) : null
    };
  });

  if (respostas.some((resposta) => !resposta.alternativaId)) {
    setMessage('Responda todas as perguntas antes de finalizar.');
    return;
  }

  try {
    const result = await requestJson('/api/resultados', {
      method: 'POST',
      body: JSON.stringify({
        nome: state.aluno.nome,
        cpf: state.aluno.cpf,
        respostas
      })
    });

    renderResult(result);
    showView(resultView);
  } catch (error) {
    setMessage(error.message);
  }
});

newSearchButton.addEventListener('click', () => {
  setMessage('');
  testForm.reset();
  showView(startView);
});

async function loadQuestions() {
  state.perguntas = await requestJson('/api/perguntas');

  if (!state.perguntas.length) {
    throw new Error('Nao ha perguntas cadastradas.');
  }

  renderQuestions(state.perguntas);
}

function renderQuestions(perguntas) {
  questionsContainer.replaceChildren();
  questionCount.textContent = `${perguntas.length} perguntas`;

  perguntas.forEach((pergunta, index) => {
    const article = document.createElement('article');
    article.className = 'question';

    const header = document.createElement('div');
    header.className = 'question-header';

    const title = document.createElement('h3');
    title.textContent = `${index + 1}. ${pergunta.texto}`;

    const category = document.createElement('span');
    category.className = 'category-badge';
    category.textContent = pergunta.categoria.nome;

    header.append(title, category);

    const alternatives = document.createElement('div');
    alternatives.className = 'alternatives';

    pergunta.alternativas.forEach((alternativa) => {
      const label = document.createElement('label');
      label.className = 'alternative';

      const input = document.createElement('input');
      input.type = 'radio';
      input.name = `pergunta-${pergunta.id}`;
      input.value = String(alternativa.id);

      const text = document.createElement('span');
      text.textContent = alternativa.texto;

      label.append(input, text);
      alternatives.append(label);
    });

    article.append(header, alternatives);
    questionsContainer.append(article);
  });
}

function renderResult(result) {
  resultLevel.textContent = result.nivel;
  resultSummary.replaceChildren();
  categoryPerformance.replaceChildren();

  const date = new Date(result.dataRealizacao);
  const metrics = [
    ['Nome', result.nome],
    ['CPF', result.cpf],
    ['Data', Number.isNaN(date.getTime()) ? result.dataRealizacao : date.toLocaleString('pt-BR')],
    ['Acertos', `${result.acertos} de ${result.totalQuestoes}`],
    ['Percentual', `${result.percentualGeral}%`],
    ['Nivel', result.nivel]
  ];

  metrics.forEach(([label, value]) => {
    const metric = document.createElement('div');
    metric.className = 'metric';

    const span = document.createElement('span');
    span.textContent = label;

    const strong = document.createElement('strong');
    strong.textContent = value;

    metric.append(span, strong);
    resultSummary.append(metric);
  });

  Object.entries(result.desempenhoPorCategoria || {}).forEach(([categoria, item]) => {
    const row = document.createElement('div');
    row.className = 'category-row';

    const header = document.createElement('div');
    header.className = 'category-row-header';

    const title = document.createElement('span');
    title.textContent = categoria;

    const values = document.createElement('span');
    values.textContent = `${item.acertos} acertos, ${item.erros} erros (${item.percentual}%)`;

    const bar = document.createElement('div');
    bar.className = 'bar';
    bar.style.setProperty('--correct-width', `${item.percentual}%`);

    const correct = document.createElement('div');
    correct.className = 'bar-correct';

    const wrong = document.createElement('div');
    wrong.className = 'bar-wrong';

    header.append(title, values);
    bar.append(correct, wrong);
    row.append(header, bar);
    categoryPerformance.append(row);
  });
}

async function requestJson(url, options = {}) {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    },
    ...options
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || 'Nao foi possivel concluir a operacao.');
  }

  return data;
}

function showView(view) {
  startView.classList.add('hidden');
  testView.classList.add('hidden');
  resultView.classList.add('hidden');
  view.classList.remove('hidden');
}

function setMessage(text) {
  message.textContent = text;
}
