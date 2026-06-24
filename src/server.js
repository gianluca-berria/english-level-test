require('dotenv').config();

const path = require('path');
const express = require('express');
const helmet = require('helmet');

const adminRouter = require('./routes/admin');
const adminAuthRouter = require('./routes/adminAuth');
const alunosRouter = require('./routes/alunos');
const perguntasRouter = require('./routes/perguntas');
const resultadosRouter = require('./routes/resultados');

const app = express();

const port = Number(process.env.PORT) || 3000;
const host = '0.0.0.0';

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'"],
        imgSrc: ["'self'", 'data:'],
        connectSrc: ["'self'"]
      }
    }
  })
);

app.use(express.json({ limit: '1mb' }));

app.use(express.static(path.join(__dirname, '..', 'public')));

app.use('/api/admin/auth', adminAuthRouter);
app.use('/api/admin', adminRouter);
app.use('/api/alunos', alunosRouter);
app.use('/api/perguntas', perguntasRouter);
app.use('/api/resultados', resultadosRouter);

app.get('/admin', (_req, res) => {
  return res.sendFile(
    path.join(__dirname, '..', 'public', 'admin.html')
  );
});

app.use((req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({
      message: 'Rota não encontrada.'
    });
  }

  return res.sendFile(
    path.join(__dirname, '..', 'public', 'index.html')
  );
});

app.use((error, _req, res, _next) => {
  console.error(error);

  return res.status(500).json({
    message: 'Erro interno do servidor.'
  });
});

if (require.main === module) {
  app.listen(port, host, () => {
    console.log(`Servidor rodando na porta ${port}`);
  });
}

module.exports = app;
