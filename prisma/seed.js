const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const data = [
  {
    categoria: 'Reading Comprehension',
    texto: 'Read: "Anna works at a hospital. She helps doctors and takes care of patients." What is Anna\'s job probably related to?',
    alternativas: [
      { texto: 'Cooking', correta: false },
      { texto: 'Healthcare', correta: true },
      { texto: 'Construction', correta: false },
      { texto: 'Music', correta: false },
      { texto: 'Não sei', correta: false }
    ]
  },
  {
    categoria: 'Reading Comprehension',
    texto: 'Read: "Tom missed the bus because he woke up late." Why did Tom miss the bus?',
    alternativas: [
      { texto: 'He was sick', correta: false },
      { texto: 'He woke up late', correta: true },
      { texto: 'The bus was early', correta: false },
      { texto: 'He forgot his bag', correta: false },
      { texto: 'Não sei', correta: false }
    ]
  },
  {
    categoria: 'Reading Comprehension',
    texto: 'Read: "The restaurant was full, so we had to wait outside." What does "full" mean here?',
    alternativas: [
      { texto: 'Closed', correta: false },
      { texto: 'Expensive', correta: false },
      { texto: 'With no available seats', correta: true },
      { texto: 'Very quiet', correta: false },
      { texto: 'Não sei', correta: false }
    ]
  },
  {
    categoria: 'Reading Comprehension',
    texto: 'Read: "Maria studied every night for two weeks. She wanted to pass the exam." What can we infer?',
    alternativas: [
      { texto: 'Maria was preparing seriously', correta: true },
      { texto: 'Maria hated studying', correta: false },
      { texto: 'Maria missed the exam', correta: false },
      { texto: 'Maria was teaching the class', correta: false },
      { texto: 'Não sei', correta: false }
    ]
  },
  {
    categoria: 'Reading Comprehension',
    texto: 'Read: "The sky became dark, and people opened their umbrellas." What probably happened?',
    alternativas: [
      { texto: 'It started raining', correta: true },
      { texto: 'It became sunny', correta: false },
      { texto: 'People went swimming', correta: false },
      { texto: 'The weather became hot', correta: false },
      { texto: 'Não sei', correta: false }
    ]
  },
  {
    categoria: 'Reading Comprehension',
    texto: 'Read: "John usually walks to work, but today he took a taxi because he was late." How does John usually go to work?',
    alternativas: [
      { texto: 'By taxi', correta: false },
      { texto: 'By bus', correta: false },
      { texto: 'On foot', correta: true },
      { texto: 'By train', correta: false },
      { texto: 'Não sei', correta: false }
    ]
  },
  {
    categoria: 'Reading Comprehension',
    texto: 'Read: "Lisa bought a new laptop to finish her online course." Why did Lisa buy a laptop?',
    alternativas: [
      { texto: 'To play football', correta: false },
      { texto: 'To complete her online course', correta: true },
      { texto: 'To cook dinner', correta: false },
      { texto: 'To repair a car', correta: false },
      { texto: 'Não sei', correta: false }
    ]
  },
  {
    categoria: 'Reading Comprehension',
    texto: 'Read: "The meeting was postponed until Friday." What happened to the meeting?',
    alternativas: [
      { texto: 'It was canceled forever', correta: false },
      { texto: 'It was moved to Friday', correta: true },
      { texto: 'It happened yesterday', correta: false },
      { texto: 'It started earlier', correta: false },
      { texto: 'Não sei', correta: false }
    ]
  },
  {
    categoria: 'Reading Comprehension',
    texto: 'Read: "Although the movie was long, everyone enjoyed it." What is true?',
    alternativas: [
      { texto: 'Nobody liked the movie', correta: false },
      { texto: 'The movie was short', correta: false },
      { texto: 'People enjoyed the movie', correta: true },
      { texto: 'The movie was canceled', correta: false },
      { texto: 'Não sei', correta: false }
    ]
  },
  {
    categoria: 'Reading Comprehension',
    texto: 'Read: "The instructions were complicated, so Peter asked for help." Why did Peter ask for help?',
    alternativas: [
      { texto: 'The instructions were difficult', correta: true },
      { texto: 'He lost his phone', correta: false },
      { texto: 'He was hungry', correta: false },
      { texto: 'The task was finished', correta: false },
      { texto: 'Não sei', correta: false }
    ]
  },
  {
    categoria: 'Reading Comprehension',
    texto: 'Read: "Emma rarely eats fast food because she prefers healthy meals." How often does Emma eat fast food?',
    alternativas: [
      { texto: 'Very often', correta: false },
      { texto: 'Never', correta: false },
      { texto: 'Not often', correta: true },
      { texto: 'Every day', correta: false },
      { texto: 'Não sei', correta: false }
    ]
  },
  {
    categoria: 'Reading Comprehension',
    texto: 'Read: "The train leaves at 8:00, but passengers should arrive 20 minutes earlier." When should passengers arrive?',
    alternativas: [
      { texto: 'At 7:40', correta: true },
      { texto: 'At 8:20', correta: false },
      { texto: 'At 8:00', correta: false },
      { texto: 'At 9:00', correta: false },
      { texto: 'Não sei', correta: false }
    ]
  },
  {
    categoria: 'Reading Comprehension',
    texto: 'Read: "After several failed attempts, the team finally solved the problem." What does this show?',
    alternativas: [
      { texto: 'They gave up immediately', correta: false },
      { texto: 'They succeeded after trying many times', correta: true },
      { texto: 'They never found a solution', correta: false },
      { texto: 'They ignored the problem', correta: false },
      { texto: 'Não sei', correta: false }
    ]
  },
  {
    categoria: 'Reading Comprehension',
    texto: 'Read: "The product received mixed reviews: some customers loved it, while others complained." What does "mixed reviews" mean?',
    alternativas: [
      { texto: 'Only positive opinions', correta: false },
      { texto: 'Only negative opinions', correta: false },
      { texto: 'Both positive and negative opinions', correta: true },
      { texto: 'No opinions at all', correta: false },
      { texto: 'Não sei', correta: false }
    ]
  },
  {
    categoria: 'Reading Comprehension',
    texto: 'Read: "Despite the heavy traffic, Clara arrived on time." What can we conclude?',
    alternativas: [
      { texto: 'Clara was late', correta: false },
      { texto: 'There was no traffic', correta: false },
      { texto: 'Clara arrived at the correct time', correta: true },
      { texto: 'Clara missed the appointment', correta: false },
      { texto: 'Não sei', correta: false }
    ]
  },

  {
    categoria: 'Vocabulary',
    texto: 'Which word is closest in meaning to "big"?',
    alternativas: [
      { texto: 'Large', correta: true },
      { texto: 'Tiny', correta: false },
      { texto: 'Cold', correta: false },
      { texto: 'Fast', correta: false },
      { texto: 'Não sei', correta: false }
    ]
  },
  {
    categoria: 'Vocabulary',
    texto: 'Which word is the opposite of "cheap"?',
    alternativas: [
      { texto: 'Small', correta: false },
      { texto: 'Expensive', correta: true },
      { texto: 'Clean', correta: false },
      { texto: 'Easy', correta: false },
      { texto: 'Não sei', correta: false }
    ]
  },
  {
    categoria: 'Vocabulary',
    texto: 'Choose the best meaning of "begin".',
    alternativas: [
      { texto: 'Start', correta: true },
      { texto: 'Finish', correta: false },
      { texto: 'Break', correta: false },
      { texto: 'Forget', correta: false },
      { texto: 'Não sei', correta: false }
    ]
  },
  {
    categoria: 'Vocabulary',
    texto: 'Which word is closest in meaning to "difficult"?',
    alternativas: [
      { texto: 'Hard', correta: true },
      { texto: 'Simple', correta: false },
      { texto: 'Light', correta: false },
      { texto: 'Weak', correta: false },
      { texto: 'Não sei', correta: false }
    ]
  },
  {
    categoria: 'Vocabulary',
    texto: 'What does "customer" mean in a store?',
    alternativas: [
      { texto: 'A person who buys something', correta: true },
      { texto: 'A person who teaches', correta: false },
      { texto: 'A person who drives buses', correta: false },
      { texto: 'A person who repairs shoes', correta: false },
      { texto: 'Não sei', correta: false }
    ]
  },
  {
    categoria: 'Vocabulary',
    texto: 'Choose the best word: "I need to ____ my password."',
    alternativas: [
      { texto: 'remember', correta: true },
      { texto: 'listen', correta: false },
      { texto: 'drink', correta: false },
      { texto: 'paint', correta: false },
      { texto: 'Não sei', correta: false }
    ]
  },
  {
    categoria: 'Vocabulary',
    texto: 'Which word is related to weather?',
    alternativas: [
      { texto: 'Rainy', correta: true },
      { texto: 'Chair', correta: false },
      { texto: 'Wallet', correta: false },
      { texto: 'Keyboard', correta: false },
      { texto: 'Não sei', correta: false }
    ]
  },
  {
    categoria: 'Vocabulary',
    texto: 'What is a "deadline" at work or school?',
    alternativas: [
      { texto: 'The final time to complete something', correta: true },
      { texto: 'A type of food', correta: false },
      { texto: 'A place to sleep', correta: false },
      { texto: 'A small animal', correta: false },
      { texto: 'Não sei', correta: false }
    ]
  },
  {
    categoria: 'Vocabulary',
    texto: 'Which word is closest in meaning to "quickly"?',
    alternativas: [
      { texto: 'Slowly', correta: false },
      { texto: 'Fast', correta: true },
      { texto: 'Sadly', correta: false },
      { texto: 'Clearly', correta: false },
      { texto: 'Não sei', correta: false }
    ]
  },
  {
    categoria: 'Vocabulary',
    texto: 'What does "improve" mean?',
    alternativas: [
      { texto: 'To become better', correta: true },
      { texto: 'To become worse', correta: false },
      { texto: 'To disappear', correta: false },
      { texto: 'To refuse', correta: false },
      { texto: 'Não sei', correta: false }
    ]
  },
  {
    categoria: 'Vocabulary',
    texto: 'Choose the correct word: "She gave me useful ____."',
    alternativas: [
      { texto: 'advices', correta: false },
      { texto: 'advice', correta: true },
      { texto: 'advise', correta: false },
      { texto: 'advising', correta: false },
      { texto: 'Não sei', correta: false }
    ]
  },
  {
    categoria: 'Vocabulary',
    texto: 'What does the phrasal verb "give up" mean?',
    alternativas: [
      { texto: 'To continue', correta: false },
      { texto: 'To stop trying', correta: true },
      { texto: 'To wake up', correta: false },
      { texto: 'To arrive', correta: false },
      { texto: 'Não sei', correta: false }
    ]
  },

  {
    categoria: 'Verb Tenses',
    texto: 'Complete the sentence: "She ____ coffee every morning."',
    alternativas: [
      { texto: 'drink', correta: false },
      { texto: 'drinks', correta: true },
      { texto: 'is drink', correta: false },
      { texto: 'drank', correta: false },
      { texto: 'Não sei', correta: false }
    ]
  },
  {
    categoria: 'Verb Tenses',
    texto: 'Complete the sentence: "They ____ soccer now."',
    alternativas: [
      { texto: 'play', correta: false },
      { texto: 'played', correta: false },
      { texto: 'are playing', correta: true },
      { texto: 'plays', correta: false },
      { texto: 'Não sei', correta: false }
    ]
  },
  {
    categoria: 'Verb Tenses',
    texto: 'Complete the sentence: "I ____ my homework yesterday."',
    alternativas: [
      { texto: 'finish', correta: false },
      { texto: 'finished', correta: true },
      { texto: 'finishes', correta: false },
      { texto: 'am finishing', correta: false },
      { texto: 'Não sei', correta: false }
    ]
  },
  {
    categoria: 'Verb Tenses',
    texto: 'Complete the sentence: "We ____ to London next year."',
    alternativas: [
      { texto: 'travel', correta: false },
      { texto: 'traveled', correta: false },
      { texto: 'will travel', correta: true },
      { texto: 'travels', correta: false },
      { texto: 'Não sei', correta: false }
    ]
  },
  {
    categoria: 'Verb Tenses',
    texto: 'Complete the sentence: "He ____ here since 2020."',
    alternativas: [
      { texto: 'has lived', correta: true },
      { texto: 'lived', correta: false },
      { texto: 'lives', correta: false },
      { texto: 'is living yesterday', correta: false },
      { texto: 'Não sei', correta: false }
    ]
  },
  {
    categoria: 'Verb Tenses',
    texto: 'Complete the sentence: "When I called her, she ____."',
    alternativas: [
      { texto: 'was sleeping', correta: true },
      { texto: 'sleeps', correta: false },
      { texto: 'has slept', correta: false },
      { texto: 'will sleep', correta: false },
      { texto: 'Não sei', correta: false }
    ]
  },
  {
    categoria: 'Verb Tenses',
    texto: 'Complete the sentence: "By the time we arrived, the movie ____."',
    alternativas: [
      { texto: 'started', correta: false },
      { texto: 'had started', correta: true },
      { texto: 'starts', correta: false },
      { texto: 'is starting', correta: false },
      { texto: 'Não sei', correta: false }
    ]
  },
  {
    categoria: 'Verb Tenses',
    texto: 'Complete the sentence: "Look at those clouds! It ____ rain."',
    alternativas: [
      { texto: 'is going to', correta: true },
      { texto: 'was', correta: false },
      { texto: 'has', correta: false },
      { texto: 'did', correta: false },
      { texto: 'Não sei', correta: false }
    ]
  },
  {
    categoria: 'Verb Tenses',
    texto: 'Complete the sentence: "I ____ never ____ sushi before."',
    alternativas: [
      { texto: 'have / eaten', correta: true },
      { texto: 'did / ate', correta: false },
      { texto: 'am / eating', correta: false },
      { texto: 'was / eat', correta: false },
      { texto: 'Não sei', correta: false }
    ]
  },

  {
    categoria: 'Sentence Structure',
    texto: 'Choose the correct sentence about music.',
    alternativas: [
      { texto: 'She likes very much music.', correta: false },
      { texto: 'She likes music very much.', correta: true },
      { texto: 'Likes she music very much.', correta: false },
      { texto: 'She music likes very much.', correta: false },
      { texto: 'Não sei', correta: false }
    ]
  },
  {
    categoria: 'Sentence Structure',
    texto: 'Choose the correct question about residence.',
    alternativas: [
      { texto: 'Where you live?', correta: false },
      { texto: 'Where do you live?', correta: true },
      { texto: 'Where does you live?', correta: false },
      { texto: 'Where are you live?', correta: false },
      { texto: 'Não sei', correta: false }
    ]
  },
  {
    categoria: 'Sentence Structure',
    texto: 'Choose the correct negative sentence about tea.',
    alternativas: [
      { texto: 'He don\'t like tea.', correta: false },
      { texto: 'He doesn\'t like tea.', correta: true },
      { texto: 'He not likes tea.', correta: false },
      { texto: 'He doesn\'t likes tea.', correta: false },
      { texto: 'Não sei', correta: false }
    ]
  },
  {
    categoria: 'Sentence Structure',
    texto: 'Choose the correct sentence about learning English.',
    alternativas: [
      { texto: 'I am interested in learning English.', correta: true },
      { texto: 'I interested am in learning English.', correta: false },
      { texto: 'I am in learning English interested.', correta: false },
      { texto: 'Interested I am learning English.', correta: false },
      { texto: 'Não sei', correta: false }
    ]
  },
  {
    categoria: 'Sentence Structure',
    texto: 'Choose the correct sentence about people in a place.',
    alternativas: [
      { texto: 'There is many people here.', correta: false },
      { texto: 'There are many people here.', correta: true },
      { texto: 'There be many people here.', correta: false },
      { texto: 'There has many people here.', correta: false },
      { texto: 'Não sei', correta: false }
    ]
  },
  {
    categoria: 'Sentence Structure',
    texto: 'Choose the correct sentence for asking help.',
    alternativas: [
      { texto: 'Can you help me?', correta: true },
      { texto: 'You can help me?', correta: false },
      { texto: 'Help me can you?', correta: false },
      { texto: 'Can help you me?', correta: false },
      { texto: 'Não sei', correta: false }
    ]
  },
  {
    categoria: 'Sentence Structure',
    texto: 'Choose the correct sentence about speaking English.',
    alternativas: [
      { texto: 'She speaks English fluently.', correta: true },
      { texto: 'She speaks fluently English.', correta: false },
      { texto: 'Fluently she English speaks.', correta: false },
      { texto: 'She English fluently speaks.', correta: false },
      { texto: 'Não sei', correta: false }
    ]
  },
  {
    categoria: 'Sentence Structure',
    texto: 'Choose the correct sentence about a red car.',
    alternativas: [
      { texto: 'I have a car red.', correta: false },
      { texto: 'I have a red car.', correta: true },
      { texto: 'I a red car have.', correta: false },
      { texto: 'I have red a car.', correta: false },
      { texto: 'Não sei', correta: false }
    ]
  },
  {
    categoria: 'Sentence Structure',
    texto: 'Choose the correct conditional sentence.',
    alternativas: [
      { texto: 'If I have time, I will call you.', correta: true },
      { texto: 'If I will have time, I call you.', correta: false },
      { texto: 'If have I time, I will call you.', correta: false },
      { texto: 'If I had time, I will calls you.', correta: false },
      { texto: 'Não sei', correta: false }
    ]
  },

  {
    categoria: 'Prepositions & Connectors',
    texto: 'Complete the sentence: "The book is ____ the table."',
    alternativas: [
      { texto: 'on', correta: true },
      { texto: 'at', correta: false },
      { texto: 'to', correta: false },
      { texto: 'by', correta: false },
      { texto: 'Não sei', correta: false }
    ]
  },
  {
    categoria: 'Prepositions & Connectors',
    texto: 'Complete the sentence: "I was born ____ July."',
    alternativas: [
      { texto: 'at', correta: false },
      { texto: 'on', correta: false },
      { texto: 'in', correta: true },
      { texto: 'to', correta: false },
      { texto: 'Não sei', correta: false }
    ]
  },
  {
    categoria: 'Prepositions & Connectors',
    texto: 'Complete the sentence: "The meeting starts ____ 9 a.m."',
    alternativas: [
      { texto: 'on', correta: false },
      { texto: 'at', correta: true },
      { texto: 'in', correta: false },
      { texto: 'for', correta: false },
      { texto: 'Não sei', correta: false }
    ]
  },
  {
    categoria: 'Prepositions & Connectors',
    texto: 'Complete the sentence: "She has studied English ____ three years."',
    alternativas: [
      { texto: 'since', correta: false },
      { texto: 'for', correta: true },
      { texto: 'during', correta: false },
      { texto: 'until', correta: false },
      { texto: 'Não sei', correta: false }
    ]
  },
  {
    categoria: 'Prepositions & Connectors',
    texto: 'Complete the sentence: "He was tired, ____ he continued working."',
    alternativas: [
      { texto: 'because', correta: false },
      { texto: 'so', correta: false },
      { texto: 'but', correta: true },
      { texto: 'if', correta: false },
      { texto: 'Não sei', correta: false }
    ]
  },
  {
    categoria: 'Prepositions & Connectors',
    texto: 'Complete the sentence: "I stayed home ____ I was sick."',
    alternativas: [
      { texto: 'because', correta: true },
      { texto: 'although', correta: false },
      { texto: 'unless', correta: false },
      { texto: 'however', correta: false },
      { texto: 'Não sei', correta: false }
    ]
  },
  {
    categoria: 'Prepositions & Connectors',
    texto: 'Complete the sentence: "____ it was raining, they went for a walk."',
    alternativas: [
      { texto: 'Although', correta: true },
      { texto: 'Because', correta: false },
      { texto: 'So', correta: false },
      { texto: 'And', correta: false },
      { texto: 'Não sei', correta: false }
    ]
  },
  {
    categoria: 'Prepositions & Connectors',
    texto: 'Complete the sentence: "This gift is ____ you."',
    alternativas: [
      { texto: 'for', correta: true },
      { texto: 'at', correta: false },
      { texto: 'on', correta: false },
      { texto: 'since', correta: false },
      { texto: 'Não sei', correta: false }
    ]
  },
  {
    categoria: 'Prepositions & Connectors',
    texto: 'Complete the sentence: "She is interested ____ science."',
    alternativas: [
      { texto: 'on', correta: false },
      { texto: 'in', correta: true },
      { texto: 'at', correta: false },
      { texto: 'for', correta: false },
      { texto: 'Não sei', correta: false }
    ]
  },

  {
    categoria: 'Articles & Pronouns',
    texto: 'Complete the sentence: "I saw ____ elephant at the zoo."',
    alternativas: [
      { texto: 'a', correta: false },
      { texto: 'an', correta: true },
      { texto: 'the', correta: false },
      { texto: 'some', correta: false },
      { texto: 'Não sei', correta: false }
    ]
  },
  {
    categoria: 'Articles & Pronouns',
    texto: 'Complete the sentence: "This is my brother. ____ name is Lucas."',
    alternativas: [
      { texto: 'Her', correta: false },
      { texto: 'His', correta: true },
      { texto: 'Their', correta: false },
      { texto: 'Its', correta: false },
      { texto: 'Não sei', correta: false }
    ]
  },
  {
    categoria: 'Articles & Pronouns',
    texto: 'Complete the sentence: "____ are my friends, Ana and Julia."',
    alternativas: [
      { texto: 'This', correta: false },
      { texto: 'These', correta: true },
      { texto: 'That', correta: false },
      { texto: 'It', correta: false },
      { texto: 'Não sei', correta: false }
    ]
  },
  {
    categoria: 'Articles & Pronouns',
    texto: 'Complete the sentence: "Can you give ____ the book?"',
    alternativas: [
      { texto: 'I', correta: false },
      { texto: 'me', correta: true },
      { texto: 'my', correta: false },
      { texto: 'mine', correta: false },
      { texto: 'Não sei', correta: false }
    ]
  },
  {
    categoria: 'Articles & Pronouns',
    texto: 'Complete the sentence: "We visited ____ museum near the park."',
    alternativas: [
      { texto: 'a', correta: true },
      { texto: 'an', correta: false },
      { texto: 'some', correta: false },
      { texto: 'many', correta: false },
      { texto: 'Não sei', correta: false }
    ]
  },
  {
    categoria: 'Articles & Pronouns',
    texto: 'Complete the sentence: "The students finished ____ project."',
    alternativas: [
      { texto: 'they', correta: false },
      { texto: 'them', correta: false },
      { texto: 'their', correta: true },
      { texto: 'theirs', correta: false },
      { texto: 'Não sei', correta: false }
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
