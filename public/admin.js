const state = {
  categories: [],
  questions: [],
  authenticated: false
};

const elements = {
  loginView: document.querySelector('#login-view'),
  dashboardView: document.querySelector('#dashboard-view'),
  loginForm: document.querySelector('#login-form'),
  username: document.querySelector('#admin-username'),
  password: document.querySelector('#admin-password'),
  logoutButton: document.querySelector('#logout-button'),
  message: document.querySelector('#admin-message'),
  tabs: document.querySelectorAll('.admin-tab'),
  questionsSection: document.querySelector('#questions-section'),
  categoriesSection: document.querySelector('#categories-section'),
  categoryForm: document.querySelector('#category-form'),
  categoryId: document.querySelector('#category-id'),
  categoryName: document.querySelector('#category-name'),
  categoryFormTitle: document.querySelector('#category-form-title'),
  cancelCategoryEdit: document.querySelector('#cancel-category-edit'),
  categoriesListHeading: document.querySelector('#categories-list-heading'),
  categoriesList: document.querySelector('#categories-list'),
  questionForm: document.querySelector('#question-form'),
  questionId: document.querySelector('#question-id'),
  questionText: document.querySelector('#question-text'),
  questionCategory: document.querySelector('#question-category'),
  questionActive: document.querySelector('#question-active'),
  questionFormTitle: document.querySelector('#question-form-title'),
  alternativesFieldset: document.querySelector('#new-alternatives-fieldset'),
  newAlternatives: document.querySelector('#new-alternatives'),
  addAlternativeRow: document.querySelector('#add-alternative-row'),
  cancelQuestionEdit: document.querySelector('#cancel-question-edit'),
  questionsListHeading: document.querySelector('#questions-list-heading'),
  questionsList: document.querySelector('#questions-list'),
  questionTotal: document.querySelector('#question-total')
};

init();

async function init() {
  bindEvents();
  resetQuestionForm();

  try {
    const session = await requestJson('/api/admin/auth/session');
    showDashboard(session.username);
    await loadData();
  } catch (_error) {
    showLogin();
  }
}

function bindEvents() {
  elements.loginForm.addEventListener('submit', handleLogin);
  elements.logoutButton.addEventListener('click', handleLogout);
  elements.tabs.forEach((tab) => tab.addEventListener('click', handleTab));
  elements.categoryForm.addEventListener('submit', handleCategorySubmit);
  elements.cancelCategoryEdit.addEventListener('click', resetCategoryForm);
  elements.categoriesList.addEventListener('click', handleCategoryAction);
  elements.questionForm.addEventListener('submit', handleQuestionSubmit);
  elements.cancelQuestionEdit.addEventListener('click', resetQuestionForm);
  elements.addAlternativeRow.addEventListener('click', () => addAlternativeRow());
  elements.newAlternatives.addEventListener('click', handleNewAlternativeAction);
  elements.questionsList.addEventListener('click', handleQuestionAction);
}

async function handleLogin(event) {
  event.preventDefault();
  clearMessage();

  try {
    const result = await requestJson('/api/admin/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        username: elements.username.value.trim(),
        password: elements.password.value
      })
    });

    elements.loginForm.reset();
    showDashboard(result.username);
    await loadData();
    setMessage('Login realizado com sucesso.', 'success');
  } catch (error) {
    setMessage(error.message);
  }
}

async function handleLogout() {
  await requestJson('/api/admin/auth/logout', { method: 'POST' }, true);
  state.authenticated = false;
  window.location.assign('/admin');
}

function handleTab(event) {
  const tabName = event.currentTarget.dataset.tab;
  elements.tabs.forEach((tab) => {
    tab.classList.toggle('is-active', tab.dataset.tab === tabName);
  });
  elements.questionsSection.classList.toggle('hidden', tabName !== 'questions');
  elements.categoriesSection.classList.toggle('hidden', tabName !== 'categories');
  clearMessage();
}

async function loadData() {
  const [categories, questions] = await Promise.all([
    requestJson('/api/admin/categorias'),
    requestJson('/api/admin/perguntas')
  ]);

  state.categories = categories;
  state.questions = questions;
  renderCategories();
  renderCategoryOptions();
  renderQuestions();
}

async function handleCategorySubmit(event) {
  event.preventDefault();
  clearMessage();
  const id = elements.categoryId.value;
  const nome = elements.categoryName.value.trim();

  if (!nome) {
    setMessage('Informe o nome da categoria.');
    return;
  }

  try {
    await requestJson(id ? `/api/admin/categorias/${id}` : '/api/admin/categorias', {
      method: id ? 'PUT' : 'POST',
      body: JSON.stringify({ nome })
    });
    resetCategoryForm();
    await loadData();
    setMessage(id ? 'Categoria atualizada.' : 'Categoria criada.', 'success');
  } catch (error) {
    setMessage(error.message);
  }
}

async function handleCategoryAction(event) {
  const button = event.target.closest('button[data-action]');
  if (!button) return;

  const category = state.categories.find((item) => item.id === Number(button.dataset.id));
  if (!category) return;

  if (button.dataset.action === 'edit-category') {
    elements.categoryId.value = category.id;
    elements.categoryName.value = category.nome;
    elements.categoryFormTitle.textContent = 'Editar categoria';
    elements.cancelCategoryEdit.classList.remove('hidden');
    elements.categoryName.focus();
    return;
  }

  if (
    button.dataset.action === 'delete-category'
    && window.confirm(`Excluir a categoria "${category.nome}"?`)
  ) {
    await performAction(
      `/api/admin/categorias/${category.id}`,
      { method: 'DELETE' },
      'Categoria excluída.'
    );
  }
}

async function handleQuestionSubmit(event) {
  event.preventDefault();
  clearMessage();
  const id = elements.questionId.value;
  const payload = {
    texto: elements.questionText.value.trim(),
    categoriaId: Number(elements.questionCategory.value),
    ativa: elements.questionActive.checked
  };

  if (!payload.texto || !payload.categoriaId) {
    setMessage('Informe o texto e a categoria da pergunta.');
    return;
  }

  if (!id) {
    payload.alternativas = readNewAlternatives();
    if (!payload.alternativas) return;
  }

  try {
    await requestJson(id ? `/api/admin/perguntas/${id}` : '/api/admin/perguntas', {
      method: id ? 'PUT' : 'POST',
      body: JSON.stringify(payload)
    });
    resetQuestionForm();
    await loadData();
    setMessage(id ? 'Pergunta atualizada.' : 'Pergunta criada.', 'success');
  } catch (error) {
    setMessage(error.message);
  }
}

function readNewAlternatives() {
  const rows = [...elements.newAlternatives.querySelectorAll('.alternative-edit-row')];
  const alternatives = rows.map((row) => ({
    texto: row.querySelector('input[type="text"]').value.trim(),
    correta: row.querySelector('input[type="radio"]').checked
  }));

  if (!alternatives.length || alternatives.some((item) => !item.texto)) {
    setMessage('Preencha o texto de todas as alternativas.');
    return null;
  }

  if (alternatives.filter((item) => item.correta).length !== 1) {
    setMessage('Marque exatamente uma alternativa correta.');
    return null;
  }

  return alternatives;
}

function handleNewAlternativeAction(event) {
  const button = event.target.closest('[data-action="remove-new-alternative"]');
  if (button) {
    button.closest('.alternative-edit-row').remove();
  }
}

async function handleQuestionAction(event) {
  const button = event.target.closest('button[data-action]');
  if (!button) return;

  const question = state.questions.find((item) => item.id === Number(button.dataset.questionId));
  if (!question) return;

  switch (button.dataset.action) {
    case 'edit-question':
      startQuestionEdit(question);
      break;
    case 'delete-question':
      if (window.confirm('Excluir esta pergunta e suas alternativas?')) {
        await performAction(
          `/api/admin/perguntas/${question.id}`,
          { method: 'DELETE' },
          'Pergunta excluída.'
        );
      }
      break;
    case 'add-alternative':
      await addAlternative(question);
      break;
    case 'edit-alternative':
      await editAlternative(question, Number(button.dataset.alternativeId));
      break;
    case 'make-correct':
      await makeAlternativeCorrect(question, Number(button.dataset.alternativeId));
      break;
    case 'delete-alternative':
      await removeAlternative(question, Number(button.dataset.alternativeId));
      break;
    default:
      break;
  }
}

function startQuestionEdit(question) {
  elements.questionId.value = question.id;
  elements.questionText.value = question.texto;
  elements.questionCategory.value = question.categoriaId;
  elements.questionActive.checked = question.ativa;
  elements.questionFormTitle.textContent = 'Editar pergunta';
  elements.alternativesFieldset.classList.add('hidden');
  elements.cancelQuestionEdit.classList.remove('hidden');
  elements.questionForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
  elements.questionText.focus({ preventScroll: true });
}

async function addAlternative(question) {
  const texto = window.prompt('Texto da nova alternativa:');
  if (texto === null) return;
  const correta = window.confirm('Esta deve ser a alternativa correta?');

  await performAction(
    `/api/admin/perguntas/${question.id}/alternativas`,
    {
      method: 'POST',
      body: JSON.stringify({ texto, correta })
    },
    'Alternativa criada.'
  );
}

async function editAlternative(question, alternativeId) {
  const alternative = question.alternativas.find((item) => item.id === alternativeId);
  if (!alternative) return;
  const texto = window.prompt('Texto da alternativa:', alternative.texto);
  if (texto === null) return;

  await performAction(
    `/api/admin/alternativas/${alternative.id}`,
    {
      method: 'PUT',
      body: JSON.stringify({ texto, correta: alternative.correta })
    },
    'Alternativa atualizada.'
  );
}

async function makeAlternativeCorrect(question, alternativeId) {
  const alternative = question.alternativas.find((item) => item.id === alternativeId);
  if (!alternative || alternative.correta) return;

  await performAction(
    `/api/admin/alternativas/${alternative.id}`,
    {
      method: 'PUT',
      body: JSON.stringify({ texto: alternative.texto, correta: true })
    },
    'Alternativa correta atualizada.'
  );
}

async function removeAlternative(question, alternativeId) {
  const alternative = question.alternativas.find((item) => item.id === alternativeId);
  if (!alternative || !window.confirm(`Excluir a alternativa "${alternative.texto}"?`)) return;

  await performAction(
    `/api/admin/alternativas/${alternative.id}`,
    { method: 'DELETE' },
    'Alternativa excluída.'
  );
}

async function performAction(url, options, successMessage) {
  clearMessage();
  try {
    await requestJson(url, options, options.method === 'DELETE');
    await loadData();
    setMessage(successMessage, 'success');
  } catch (error) {
    setMessage(error.message);
  }
}

function renderCategories() {
  elements.categoriesList.replaceChildren();
  elements.categoriesListHeading.classList.toggle('hidden', !state.categories.length);

  if (!state.categories.length) {
    elements.categoriesList.append(createEmptyState('Nenhuma categoria cadastrada.'));
    return;
  }

  state.categories.forEach((category) => {
    const card = createElement('article', 'admin-card');
    const header = createElement('div', 'admin-card-header');
    const content = document.createElement('div');
    const title = createElement('h3', '', category.nome);
    const count = createElement(
      'p',
      'panel-copy',
      `${category._count.perguntas} pergunta(s) associada(s)`
    );
    const actions = createActions([
      ['edit-category', 'Editar', category.id],
      ['delete-category', 'Excluir', category.id, true]
    ]);

    content.append(title, count);
    header.append(content, actions);
    card.append(header);
    elements.categoriesList.append(card);
  });
}

function renderCategoryOptions() {
  const selected = elements.questionCategory.value;
  elements.questionCategory.replaceChildren();
  elements.questionCategory.append(new Option('Selecione uma categoria', ''));

  state.categories.forEach((category) => {
    elements.questionCategory.append(new Option(category.nome, String(category.id)));
  });

  if (selected) {
    elements.questionCategory.value = selected;
  }
}

function renderQuestions() {
  elements.questionsList.replaceChildren();
  elements.questionsListHeading.classList.toggle('hidden', !state.questions.length);
  elements.questionTotal.textContent = `${state.questions.length} pergunta(s) cadastrada(s).`;

  if (!state.questions.length) {
    elements.questionsList.append(createEmptyState('Nenhuma pergunta cadastrada.'));
    return;
  }

  state.questions.forEach((question) => {
    elements.questionsList.append(createQuestionCard(question));
  });
}

function createQuestionCard(question) {
  const card = createElement('article', 'admin-card');
  const header = createElement('div', 'admin-card-header');
  const title = createElement('h3', '', question.texto);
  const actions = createQuestionActions(question.id);
  const meta = createElement('div', 'admin-card-meta');
  const category = createElement('span', 'category-badge', question.categoria.nome);
  const status = createElement(
    'span',
    `status-badge${question.ativa ? ' is-active' : ''}`,
    question.ativa ? 'Ativa' : 'Inativa'
  );
  const alternatives = createElement('ul', 'admin-alternatives');

  question.alternativas.forEach((alternative) => {
    alternatives.append(createAlternativeItem(question.id, alternative));
  });

  header.append(title, actions);
  meta.append(category, status);
  card.append(header, meta, alternatives);
  card.append(createSingleAction('add-alternative', 'Adicionar alternativa', question.id));
  return card;
}

function createAlternativeItem(questionId, alternative) {
  const item = createElement('li', 'admin-alternative');
  const content = createElement('div', 'admin-alternative-text');
  const text = createElement('span', '', alternative.texto);
  content.append(text);

  if (alternative.correta) {
    content.append(createElement('span', 'status-badge correct-badge', 'Correta'));
  }

  const actions = createElement('div', 'card-actions');
  actions.append(createActionButton('edit-alternative', 'Editar', questionId, alternative.id));
  if (!alternative.correta) {
    actions.append(createActionButton('make-correct', 'Marcar correta', questionId, alternative.id));
  }
  actions.append(createActionButton(
    'delete-alternative',
    'Excluir',
    questionId,
    alternative.id,
    true
  ));

  item.append(content, actions);
  return item;
}

function createQuestionActions(questionId) {
  const actions = createElement('div', 'card-actions');
  actions.append(createActionButton('edit-question', 'Editar', questionId));
  actions.append(createActionButton('delete-question', 'Excluir', questionId, null, true));
  return actions;
}

function createSingleAction(action, label, questionId) {
  const actions = createElement('div', 'card-actions');
  actions.append(createActionButton(action, label, questionId));
  return actions;
}

function createActions(items) {
  const actions = createElement('div', 'card-actions');
  items.forEach(([action, label, id, danger]) => {
    const button = createActionButton(action, label, null, null, danger);
    button.dataset.id = id;
    actions.append(button);
  });
  return actions;
}

function createActionButton(action, label, questionId, alternativeId, danger = false) {
  const button = createElement(
    'button',
    `small-button${danger ? ' danger-button' : ''}`,
    label
  );
  button.type = 'button';
  button.dataset.action = action;
  if (questionId) button.dataset.questionId = questionId;
  if (alternativeId) button.dataset.alternativeId = alternativeId;
  return button;
}

function addAlternativeRow(text = '', correct = false) {
  const row = createElement('div', 'alternative-edit-row');
  const input = document.createElement('input');
  input.type = 'text';
  input.placeholder = 'Texto da alternativa';
  input.value = text;
  input.required = true;

  const label = document.createElement('label');
  const radio = document.createElement('input');
  radio.type = 'radio';
  radio.name = 'new-correct-alternative';
  radio.checked = correct;
  label.append(radio, document.createTextNode('Correta'));

  const remove = createElement('button', 'small-button danger-button', 'Remover');
  remove.type = 'button';
  remove.dataset.action = 'remove-new-alternative';

  row.append(input, label, remove);
  elements.newAlternatives.append(row);
}

function resetQuestionForm() {
  elements.questionForm.reset();
  elements.questionId.value = '';
  elements.questionActive.checked = true;
  elements.questionFormTitle.textContent = 'Nova pergunta';
  elements.alternativesFieldset.classList.remove('hidden');
  elements.cancelQuestionEdit.classList.add('hidden');
  elements.newAlternatives.replaceChildren();
  addAlternativeRow('', true);
  addAlternativeRow();
}

function resetCategoryForm() {
  elements.categoryForm.reset();
  elements.categoryId.value = '';
  elements.categoryFormTitle.textContent = 'Nova categoria';
  elements.cancelCategoryEdit.classList.add('hidden');
}

function showDashboard(username) {
  state.authenticated = true;
  elements.logoutButton.setAttribute('aria-label', `Sair da sessão de ${username}`);
  elements.logoutButton.classList.remove('hidden');
  elements.loginView.classList.add('hidden');
  elements.dashboardView.classList.remove('hidden');
}

function showLogin() {
  elements.logoutButton.classList.add('hidden');
  elements.dashboardView.classList.add('hidden');
  elements.loginView.classList.remove('hidden');
}

function createElement(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}

function createEmptyState(text) {
  return createElement('p', 'empty-state', text);
}

async function requestJson(url, options = {}, allowEmpty = false) {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    },
    ...options
  });

  if (response.status === 401 && state.authenticated) {
    state.authenticated = false;
    showLogin();
  }

  if (allowEmpty && response.ok && response.status === 204) {
    return null;
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || 'Não foi possível concluir a operação.');
  }

  return data;
}

function setMessage(text, type) {
  elements.message.textContent = text;
  elements.message.classList.toggle('success', type === 'success');
}

function clearMessage() {
  setMessage('');
}
