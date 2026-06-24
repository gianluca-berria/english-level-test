# English Level Test

Aplicacao web full stack para nivelamento de proficiencia em ingles.

## Arquitetura

Fluxo obrigatorio da aplicacao:

Frontend HTML/CSS/JavaScript puro -> Backend Node.js/Express -> Prisma ORM -> PostgreSQL

O frontend nao acessa o banco diretamente. Toda validacao sensivel, bloqueio de reaplicacao, calculo de resultado, calculo de nivel, auditoria, persistencia e exportacao CSV individual ficam no backend.

## Stack

- Frontend: HTML, CSS e JavaScript puro em `public/`
- Backend: Node.js com Express em `src/`
- ORM: Prisma
- Banco: PostgreSQL
- Seed: `prisma/seed.js`

## Configuracao local

1. Instale as dependencias:

```bash
npm install
```

2. Crie o arquivo `.env` a partir do exemplo:

```bash
cp .env.example .env
```

3. Ajuste `DATABASE_URL` no `.env` para apontar para seu PostgreSQL:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/english_level_test?schema=public"
DIRECT_URL="postgresql://postgres:postgres@localhost:5432/english_level_test?schema=public"
PORT=3000
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="substitua-por-uma-senha-forte"
ADMIN_SESSION_SECRET="gere-uma-chave-aleatoria-com-pelo-menos-32-caracteres"
```

4. Execute as migrations:

```bash
npm run prisma:migrate
```

5. Cadastre perguntas iniciais:

```bash
npm run prisma:seed
```

6. Rode a aplicacao:

```bash
npm run dev
```

Acesse `http://localhost:3000`.

## Área administrativa

Acesse `http://localhost:3000/admin` e faça login com `ADMIN_USERNAME` e
`ADMIN_PASSWORD`. A credencial configurada no ambiente não é embutida nem
retornada pelo frontend; o backend valida o login. `ADMIN_SESSION_SECRET`
assina uma sessão temporária de oito horas armazenada em cookie `HttpOnly`,
`SameSite=Strict` e `Secure` em produção.

O painel permite:

- criar, listar, editar e excluir categorias;
- criar, listar, editar, ativar, desativar e excluir perguntas;
- criar, listar, editar e excluir alternativas;
- trocar a alternativa correta de uma pergunta.

Categorias com perguntas associadas não podem ser excluídas. Perguntas e
alternativas utilizadas em resultados também são preservadas para manter a
integridade do histórico. Nesse caso, a pergunta pode ser desativada para não
aparecer em novos testes.

## Scripts

- `npm run dev`: inicia o servidor com `nodemon`
- `npm start`: inicia o servidor com Node
- `npm test`: executa os testes automatizados com `node:test`
- `npm run prisma:migrate`: executa migrations do Prisma
- `npm run prisma:seed`: popula categorias, perguntas e alternativas iniciais

## API REST

### POST `/api/alunos/verificar`

Recebe:

```json
{
  "nome": "Aluno Teste",
  "cpf": "12345678909"
}
```

Valida CPF no backend. Se ja existir resultado valido para o CPF, retorna `jaRealizou: true` e o resultado. Se nao existir, cria/atualiza o aluno e libera o teste.

### GET `/api/perguntas`

Retorna perguntas ativas, categoria e alternativas. O campo `correta` nunca e retornado ao frontend.

### API administrativa

Todos os endpoints abaixo de `/api/admin`, exceto o login, exigem a sessão
administrativa assinada:

- `POST /api/admin/auth/login`
- `GET /api/admin/auth/session`
- `POST /api/admin/auth/logout`
- `GET|POST /api/admin/categorias`
- `PUT|DELETE /api/admin/categorias/:id`
- `GET|POST /api/admin/perguntas`
- `PUT|DELETE /api/admin/perguntas/:id`
- `GET|POST /api/admin/perguntas/:perguntaId/alternativas`
- `PUT|DELETE /api/admin/alternativas/:id`

### POST `/api/resultados`

Recebe CPF, nome e respostas:

```json
{
  "nome": "Aluno Teste",
  "cpf": "12345678909",
  "respostas": [
    {
      "perguntaId": 1,
      "alternativaId": 2
    }
  ]
}
```

O backend valida CPF, impede nova tentativa para CPF com resultado, valida perguntas/alternativas, calcula acertos, percentual geral, percentual por categoria e nivel. O frontend nao envia acertos calculados.

### GET `/api/resultados/:cpf`

Consulta resultado individual por CPF.

### GET `/api/resultados/:cpf/exportar/csv`

Exporta somente o resultado individual do CPF informado em CSV.

- O CPF e normalizado e validado no backend.
- CPF invalido retorna `400`.
- CPF sem resultado retorna `404`.
- O arquivo e retornado como `resultado-<cpf>.csv`.
- A rota publica nao exporta resultados de outros alunos.

## Regras de negocio implementadas

- Nome completo e CPF sao obrigatorios.
- CPF e unico para resultado valido.
- CPF e validado no frontend quanto a formato numerico com 11 digitos.
- CPF e validado no backend com tamanho, repeticao de digitos e digitos verificadores.
- CPF com resultado existente nao pode refazer o teste.
- Tentativa incompleta nao gera resultado nem bloqueio.
- Perguntas sao cadastradas por seed.
- Perguntas pertencem a categorias.
- O endpoint de perguntas nao revela alternativa correta.
- O resultado armazena acertos, total, percentual geral, nivel e desempenho por categoria em JSON.
- Cada resposta salva snapshots de categoria, pergunta e alternativa escolhida para preservar historico.
- Resultados antigos mantem vinculo com as perguntas respondidas.
- A persistencia usa Prisma, sem SQL manual no codigo da aplicacao.
- CSV individual e gerado no backend.
- A exportacao publica geral de resultados nao esta disponivel.

## Nivel de proficiencia

- 0 a 30%: Beginner
- 31 a 50%: Elementary
- 51 a 70%: Intermediate
- 71 a 85%: Upper Intermediate
- 86 a 100%: Advanced

## Modelos principais

- `Aluno`: nome, CPF unico e resultados
- `Categoria`: nome unico e perguntas
- `Pergunta`: texto, categoria, ativa, data de criacao e alternativas
- `Alternativa`: texto, marcador interno de correta e pergunta
- `Resultado`: aluno, CPF, data/hora, acertos, total, percentual, nivel e desempenho por categoria
- `Resposta`: vinculo com resultado, pergunta, alternativa, indicador de acerto e snapshots historicos

## Seguranca

- `helmet` configurado no Express.
- Entradas principais sao validadas no backend.
- O backend nao confia em dados calculados no frontend.
- Renderizacao do frontend usa `textContent` para textos dinamicos.
- `DATABASE_URL` e lida por variavel de ambiente.
- `.env` esta no `.gitignore`; use `.env.example` como base.
- Rotas administrativas exigem cookie assinado e verificam a origem de
  requisicoes de escrita.
- Tentativas de login administrativo possuem limite simples por endereco IP.
- Erros internos retornam mensagem generica, sem stack trace para o cliente.
