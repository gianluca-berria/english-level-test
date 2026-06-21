require('dotenv').config();

const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const alunosRouter = require('./routes/alunos');
const perguntasRouter = require('./routes/perguntas');
const resultadosRouter = require('./routes/resultados');

const app = express();
const port = process.env.PORT || 3000;
const host = process.env.HOST || '127.0.0.1';
const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:3000';

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'"],
      imgSrc: ["'self'", 'data:'],
      connectSrc: ["'self'", corsOrigin]
    }
  }
}));
app.use(cors({ origin: corsOrigin }));
app.use(express.json({ limit: '1mb' }));
app.use(express.static(path.join(__dirname, '..', 'public')));

app.use('/api/alunos', alunosRouter);
app.use('/api/perguntas', perguntasRouter);
app.use('/api/resultados', resultadosRouter);

app.use((req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ message: 'Rota nao encontrada.' });
  }

  return res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

app.use((error, _req, res, _next) => {
  console.error(error);
  return res.status(500).json({ message: 'Erro interno do servidor.' });
});

app.listen(port, host, () => {
  console.log(`Servidor rodando em http://${host}:${port}`);
});
