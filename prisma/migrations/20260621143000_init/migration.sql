CREATE TABLE "Aluno" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "cpf" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Aluno_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Categoria" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,

    CONSTRAINT "Categoria_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Pergunta" (
    "id" SERIAL NOT NULL,
    "texto" TEXT NOT NULL,
    "categoriaId" INTEGER NOT NULL,
    "ativa" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Pergunta_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Alternativa" (
    "id" SERIAL NOT NULL,
    "texto" TEXT NOT NULL,
    "correta" BOOLEAN NOT NULL DEFAULT false,
    "perguntaId" INTEGER NOT NULL,

    CONSTRAINT "Alternativa_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Resultado" (
    "id" SERIAL NOT NULL,
    "alunoId" INTEGER NOT NULL,
    "cpf" TEXT NOT NULL,
    "dataRealizacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "acertos" INTEGER NOT NULL,
    "totalQuestoes" INTEGER NOT NULL,
    "percentualGeral" DOUBLE PRECISION NOT NULL,
    "nivel" TEXT NOT NULL,
    "desempenhoPorCategoria" JSONB NOT NULL,

    CONSTRAINT "Resultado_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Resposta" (
    "id" SERIAL NOT NULL,
    "resultadoId" INTEGER NOT NULL,
    "perguntaId" INTEGER NOT NULL,
    "alternativaId" INTEGER NOT NULL,
    "correta" BOOLEAN NOT NULL,
    "categoriaNomeSnapshot" TEXT NOT NULL,
    "perguntaTextoSnapshot" TEXT NOT NULL,
    "alternativaTextoSnapshot" TEXT NOT NULL,

    CONSTRAINT "Resposta_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Aluno_cpf_key" ON "Aluno"("cpf");
CREATE UNIQUE INDEX "Categoria_nome_key" ON "Categoria"("nome");
CREATE UNIQUE INDEX "Resultado_cpf_key" ON "Resultado"("cpf");

ALTER TABLE "Pergunta" ADD CONSTRAINT "Pergunta_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "Categoria"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Alternativa" ADD CONSTRAINT "Alternativa_perguntaId_fkey" FOREIGN KEY ("perguntaId") REFERENCES "Pergunta"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Resultado" ADD CONSTRAINT "Resultado_alunoId_fkey" FOREIGN KEY ("alunoId") REFERENCES "Aluno"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Resposta" ADD CONSTRAINT "Resposta_resultadoId_fkey" FOREIGN KEY ("resultadoId") REFERENCES "Resultado"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Resposta" ADD CONSTRAINT "Resposta_perguntaId_fkey" FOREIGN KEY ("perguntaId") REFERENCES "Pergunta"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Resposta" ADD CONSTRAINT "Resposta_alternativaId_fkey" FOREIGN KEY ("alternativaId") REFERENCES "Alternativa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
