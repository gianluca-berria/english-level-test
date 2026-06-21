const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const data = [
  {
    categoria: 'Grammar',
    texto: 'Choose the grammatically correct sentence.',
    alternativas: [
      { texto: 'She go to work every day.', correta: false },
      { texto: 'She goes to work every day.', correta: true },
      { texto: 'She going to work every day.', correta: false },
      { texto: 'She gone to work every day.', correta: false }
    ]
  },
  {
    categoria: 'Vocabulary',
    texto: 'Which word is closest in meaning to "rapid"?',
    alternativas: [
      { texto: 'Fast', correta: true },
      { texto: 'Quiet', correta: false },
      { texto: 'Heavy', correta: false },
      { texto: 'Late', correta: false }
    ]
  },
  {
    categoria: 'Reading',
    texto: 'Read: "Tom missed the bus because he woke up late." Why did Tom miss the bus?',
    alternativas: [
      { texto: 'He was sick.', correta: false },
      { texto: 'He woke up late.', correta: true },
      { texto: 'The bus was early.', correta: false },
      { texto: 'He lost his ticket.', correta: false }
    ]
  },
  {
    categoria: 'Verb Tenses',
    texto: 'Complete: "I ____ English for three years."',
    alternativas: [
      { texto: 'study', correta: false },
      { texto: 'am study', correta: false },
      { texto: 'have studied', correta: true },
      { texto: 'studying', correta: false }
    ]
  },
  {
    categoria: 'Prepositions',
    texto: 'Complete: "The keys are ____ the table."',
    alternativas: [
      { texto: 'on', correta: true },
      { texto: 'at', correta: false },
      { texto: 'to', correta: false },
      { texto: 'from', correta: false }
    ]
  },
  {
    categoria: 'Listening',
    texto: 'In a listening exercise, which response best shows understanding of "Could you repeat that, please?"',
    alternativas: [
      { texto: 'The speaker wants the information repeated.', correta: true },
      { texto: 'The speaker agrees completely.', correta: false },
      { texto: 'The speaker is ending the conversation.', correta: false },
      { texto: 'The speaker is asking for directions.', correta: false }
    ]
  },
  {
    categoria: 'Writing',
    texto: 'Which sentence is best for a formal email?',
    alternativas: [
      { texto: 'Hey, send me the file now.', correta: false },
      { texto: 'Please find the requested file attached.', correta: true },
      { texto: 'Gimme that document.', correta: false },
      { texto: 'I want it ASAP!!!', correta: false }
    ]
  },
  {
    categoria: 'Pronouns',
    texto: 'Complete: "Maria and Ana are here. ____ are studying English."',
    alternativas: [
      { texto: 'She', correta: false },
      { texto: 'It', correta: false },
      { texto: 'They', correta: true },
      { texto: 'He', correta: false }
    ]
  }
];

async function main() {
  for (const item of data) {
    const categoria = await prisma.categoria.upsert({
      where: { nome: item.categoria },
      update: {},
      create: { nome: item.categoria }
    });

    const perguntaExistente = await prisma.pergunta.findFirst({
      where: { texto: item.texto, categoriaId: categoria.id }
    });

    if (!perguntaExistente) {
      await prisma.pergunta.create({
        data: {
          texto: item.texto,
          categoriaId: categoria.id,
          alternativas: {
            create: item.alternativas
          }
        }
      });
    }
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
