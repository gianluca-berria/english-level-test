const state = {
  aluno: null,
  currentResult: null,
  perguntas: [],
  isCheckingStudent: false,
  isSubmittingTest: false,
  isExportingCsv: false
};

const elements = {
  startView: document.querySelector('#start-view'),
  testView: document.querySelector('#test-view'),
  resultView: document.querySelector('#result-view'),
  studentForm: document.querySelector('#student-form'),
  testForm: document.querySelector('#test-form'),
  nameInput: document.querySelector('#name-input'),
  cpfInput: document.querySelector('#cpf-input'),
  nameError: document.querySelector('#name-error'),
  cpfError: document.querySelector('#cpf-error'),
  message: document.querySelector('#message'),
  questionsContainer: document.querySelector('#questions-container'),
  questionCount: document.querySelector('#question-count'),
  questionProgressText: document.querySelector('#question-progress-text'),
  questionProgress: document.querySelector('#question-progress'),
  resultLevel: document.querySelector('#result-level'),
  resultSummary: document.querySelector('#result-summary'),
  categoryPerformance: document.querySelector('#category-performance'),
  levelScale: document.querySelector('#level-scale'),
  newSearchButton: document.querySelector('#new-search-button'),
  exportResultButton: document.querySelector('#export-result-button'),
  studentSubmitButton: document.querySelector('#student-submit-button'),
  finishButton: document.querySelector('#finish-button')
};

init();

function init() {
  elements.cpfInput.addEventListener('input', handleCpfInput);
  elements.nameInput.addEventListener('input', validateStudentFields);
  elements.studentForm.addEventListener('submit', handleStudentSubmit);
  elements.testForm.addEventListener('submit', handleTestSubmit);
  elements.questionsContainer.addEventListener('change', handleAnswerChange);
  elements.newSearchButton.addEventListener('click', resetToStart);
  elements.exportResultButton.addEventListener('click', handleResultExport);

  updateQuestionProgress();
}

function handleCpfInput() {
  elements.cpfInput.value = elements.cpfInput.value.replace(/\D/g, '').slice(0, 11);
  validateStudentFields();
}

async function handleStudentSubmit(event) {
  event.preventDefault();
  clearGlobalMessage();

  if (state.isCheckingStudent || !validateStudentFields()) {
    return;
  }

  const aluno = getStudentPayload();
  setButtonLoading(elements.studentSubmitButton, true, 'Consultando...');
  state.isCheckingStudent = true;

  try {
    const verification = await requestJson('/api/alunos/verificar', {
      method: 'POST',
      body: JSON.stringify(aluno)
    });

    if (verification.jaRealizou) {
      renderResult(verification.resultado);
      showView(elements.resultView);
      setGlobalMessage('Resultado existente localizado para este CPF.', 'success');
      return;
    }

    state.aluno = aluno;
    await loadQuestions();
    showView(elements.testView);
    setGlobalMessage('Teste liberado. Responda todas as questoes para finalizar.', 'success');
  } catch (error) {
    setGlobalMessage(error.message);
  } finally {
    state.isCheckingStudent = false;
    setButtonLoading(elements.studentSubmitButton, false);
  }
}

async function handleTestSubmit(event) {
  event.preventDefault();
  clearGlobalMessage();

  if (state.isSubmittingTest) {
    return;
  }

  const respostas = collectAnswers();
  const firstIncomplete = findFirstIncompleteQuestion(respostas);

  if (firstIncomplete) {
    markIncompleteQuestions(respostas);
    setGlobalMessage('Responda todas as perguntas antes de finalizar. A primeira pendencia foi destacada.');
    focusQuestion(firstIncomplete);
    return;
  }

  setButtonLoading(elements.finishButton, true, 'Enviando...');
  state.isSubmittingTest = true;

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
    showView(elements.resultView);
    setGlobalMessage('Teste finalizado e resultado salvo com sucesso.', 'success');
  } catch (error) {
    setGlobalMessage(error.message);
  } finally {
    state.isSubmittingTest = false;
    setButtonLoading(elements.finishButton, false);
  }
}

function handleAnswerChange(event) {
  if (event.target.matches('input[type="radio"]')) {
    const question = event.target.closest('.question');
    if (question) {
      question.classList.remove('is-incomplete');
    }

    updateQuestionProgress();
  }
}

async function loadQuestions() {
  state.perguntas = await requestJson('/api/perguntas');

  if (!state.perguntas.length) {
    throw new Error('Nao ha perguntas cadastradas.');
  }

  renderQuestions(state.perguntas);
  updateQuestionProgress();
}

function renderQuestions(perguntas) {
  elements.questionsContainer.replaceChildren();
  elements.questionCount.textContent = `${perguntas.length} perguntas cadastradas para esta avaliacao.`;

  perguntas.forEach((pergunta, index) => {
    elements.questionsContainer.append(createQuestionCard(pergunta, index, perguntas.length));
  });
}

function createQuestionCard(pergunta, index, total) {
  const article = document.createElement('article');
  article.className = 'question';
  article.id = `question-${pergunta.id}`;
  article.tabIndex = -1;

  const header = document.createElement('div');
  header.className = 'question-header';

  const title = document.createElement('h3');
  title.textContent = pergunta.texto;

  const meta = document.createElement('div');
  meta.className = 'question-meta';

  const position = document.createElement('span');
  position.className = 'question-position';
  position.textContent = `Questao ${index + 1} de ${total}`;

  const category = document.createElement('span');
  category.className = 'category-badge';
  category.textContent = pergunta.categoria.nome;

  meta.append(position, category);
  header.append(title, meta);

  const alternatives = document.createElement('div');
  alternatives.className = 'alternatives';
  alternatives.setAttribute('role', 'radiogroup');
  alternatives.setAttribute('aria-label', `Alternativas da questao ${index + 1}`);

  pergunta.alternativas.forEach((alternativa) => {
    alternatives.append(createAlternative(pergunta.id, alternativa));
  });

  article.append(header, alternatives);
  return article;
}

function createAlternative(perguntaId, alternativa) {
  const label = document.createElement('label');
  label.className = 'alternative';

  const input = document.createElement('input');
  input.type = 'radio';
  input.name = `pergunta-${perguntaId}`;
  input.value = String(alternativa.id);

  const text = document.createElement('span');
  text.textContent = alternativa.texto;

  label.append(input, text);
  return label;
}

function collectAnswers() {
  return state.perguntas.map((pergunta) => {
    const selected = document.querySelector(`input[name="pergunta-${pergunta.id}"]:checked`);

    return {
      perguntaId: pergunta.id,
      alternativaId: selected ? Number(selected.value) : null
    };
  });
}

function findFirstIncompleteQuestion(respostas) {
  const incomplete = respostas.find((resposta) => !resposta.alternativaId);
  return incomplete ? document.querySelector(`#question-${incomplete.perguntaId}`) : null;
}

function markIncompleteQuestions(respostas) {
  respostas.forEach((resposta) => {
    const question = document.querySelector(`#question-${resposta.perguntaId}`);
    if (question) {
      question.classList.toggle('is-incomplete', !resposta.alternativaId);
    }
  });
}

function focusQuestion(question) {
  question.scrollIntoView({ behavior: getScrollBehavior(), block: 'center' });
  question.focus({ preventScroll: true });
}

function updateQuestionProgress() {
  const total = state.perguntas.length;
  const answered = total === 0 ? 0 : collectAnswers().filter((resposta) => resposta.alternativaId).length;
  const percent = total === 0 ? 0 : Math.round((answered / total) * 100);

  elements.questionProgress.max = total || 1;
  elements.questionProgress.value = answered;
  elements.questionProgress.textContent = `${percent}%`;
  elements.questionProgressText.textContent = `Questão ${answered} de ${total}`;
}

function renderResult(result) {
  state.currentResult = result;
  elements.resultLevel.textContent = result.nivel;
  elements.resultSummary.replaceChildren();
  elements.categoryPerformance.replaceChildren();
  elements.exportResultButton.classList.toggle('hidden', !result.cpf);

  renderResultMetrics(result);
  renderCategoryPerformance(result.desempenhoPorCategoria || {});
  highlightLevel(result.nivel);
}

async function handleResultExport() {
  clearGlobalMessage();

  if (state.isExportingCsv || !state.currentResult || !state.currentResult.cpf) {
    return;
  }

  state.isExportingCsv = true;
  setButtonLoading(elements.exportResultButton, true, 'Preparando...');

  try {
    const cpf = encodeURIComponent(state.currentResult.cpf);
    const response = await fetch(`/api/resultados/${cpf}/exportar/csv`);

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.message || 'Nao foi possivel exportar o resultado.');
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = getCsvFilename(response) || `resultado-${state.currentResult.cpf}.csv`;
    document.body.append(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    setGlobalMessage('CSV do resultado preparado com sucesso.', 'success');
  } catch (error) {
    setGlobalMessage(error.message || 'Nao foi possivel exportar o resultado.');
  } finally {
    state.isExportingCsv = false;
    setButtonLoading(elements.exportResultButton, false);
  }
}

function getCsvFilename(response) {
  const disposition = response.headers.get('Content-Disposition') || '';
  const match = disposition.match(/filename="?([^"]+)"?/i);
  return match ? match[1] : '';
}

function renderResultMetrics(result) {
  const date = new Date(result.dataRealizacao);
  const formattedDate = Number.isNaN(date.getTime())
    ? result.dataRealizacao
    : date.toLocaleString('pt-BR');

  const metrics = [
    ['Nome', result.nome],
    ['CPF', result.cpf],
    ['Data', formattedDate],
    ['Acertos', `${result.acertos} de ${result.totalQuestoes}`],
    ['Percentual', `${result.percentualGeral}%`],
    ['Nivel', result.nivel]
  ];

  metrics.forEach(([label, value]) => {
    elements.resultSummary.append(createMetric(label, value));
  });
}

function createMetric(label, value) {
  const metric = document.createElement('div');
  metric.className = 'metric';

  const labelElement = document.createElement('span');
  labelElement.textContent = label;

  const valueElement = document.createElement('strong');
  valueElement.textContent = value;

  metric.append(labelElement, valueElement);
  return metric;
}

function renderCategoryPerformance(performance) {
  Object.entries(performance).forEach(([categoria, item]) => {
    elements.categoryPerformance.append(createCategoryRow(categoria, item));
  });
}

function createCategoryRow(categoria, item) {
  const row = document.createElement('div');
  row.className = 'category-row';

  const header = document.createElement('div');
  header.className = 'category-row-header';

  const title = document.createElement('span');
  title.textContent = categoria;

  const values = document.createElement('span');
  values.className = 'category-values';
  values.textContent = `${item.acertos} acertos, ${item.erros} erros, ${item.percentual}% de aproveitamento`;

  const barGroup = document.createElement('div');
  barGroup.className = 'category-bar-group';

  const barLabel = document.createElement('div');
  barLabel.className = 'category-bar-label';

  const labelStart = document.createElement('strong');
  labelStart.textContent = 'Acertos';

  const labelEnd = document.createElement('span');
  labelEnd.textContent = `${item.acertos}/${item.total}`;

  const progress = document.createElement('progress');
  progress.max = item.total || 1;
  progress.value = item.acertos;
  progress.textContent = `${item.percentual}%`;
  progress.setAttribute('aria-label', `${categoria}: ${item.acertos} acertos de ${item.total}`);

  header.append(title, values);
  barLabel.append(labelStart, labelEnd);
  barGroup.append(barLabel, progress);
  row.append(header, barGroup);

  return row;
}

function highlightLevel(level) {
  elements.levelScale.querySelectorAll('li').forEach((item) => {
    const isCurrent = item.dataset.level === level;
    item.classList.toggle('is-current', isCurrent);

    if (isCurrent) {
      item.setAttribute('aria-current', 'true');
    } else {
      item.removeAttribute('aria-current');
    }
  });
}

function validateStudentFields() {
  const { nome, cpf } = getStudentPayload();
  let isValid = true;

  clearFieldError(elements.nameInput, elements.nameError);
  clearFieldError(elements.cpfInput, elements.cpfError);

  if (nome.length < 3) {
    setFieldError(elements.nameInput, elements.nameError, 'Informe o nome completo.');
    isValid = false;
  }

  if (!/^\d{11}$/.test(cpf)) {
    setFieldError(elements.cpfInput, elements.cpfError, 'Digite exatamente 11 numeros.');
    isValid = false;
  }

  return isValid;
}

function getStudentPayload() {
  return {
    nome: elements.nameInput.value.trim(),
    cpf: elements.cpfInput.value.trim()
  };
}

function setFieldError(input, output, text) {
  input.setAttribute('aria-invalid', 'true');
  output.textContent = text;
}

function clearFieldError(input, output) {
  input.removeAttribute('aria-invalid');
  output.textContent = '';
}

function resetToStart() {
  clearGlobalMessage();
  elements.testForm.reset();
  state.aluno = null;
  state.currentResult = null;
  elements.exportResultButton.classList.add('hidden');
  showView(elements.startView);
  elements.nameInput.focus();
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
  elements.startView.classList.add('hidden');
  elements.testView.classList.add('hidden');
  elements.resultView.classList.add('hidden');
  view.classList.remove('hidden');
  window.scrollTo({ top: 0, behavior: getScrollBehavior() });
}

function getScrollBehavior() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
}

function setButtonLoading(button, isLoading, loadingText) {
  const label = button.querySelector('.button-label');

  button.disabled = isLoading;
  button.setAttribute('aria-busy', String(isLoading));

  if (isLoading) {
    button.dataset.defaultLabel = label.textContent;
    label.textContent = loadingText || label.textContent;
    return;
  }

  if (button.dataset.defaultLabel) {
    label.textContent = button.dataset.defaultLabel;
    delete button.dataset.defaultLabel;
  }
}

function setGlobalMessage(text, type) {
  elements.message.textContent = text;
  elements.message.classList.toggle('success', type === 'success');
}

function clearGlobalMessage() {
  setGlobalMessage('');
}
