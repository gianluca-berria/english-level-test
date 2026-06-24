const express = require('express');
const requireSameOrigin = require('../middleware/adminOrigin');
const {
  clearSessionCookie,
  createSessionToken,
  getSessionFromRequest,
  isConfigured,
  setSessionCookie,
  validateCredentials
} = require('../services/adminAuth');

const router = express.Router();
const loginAttempts = new Map();
const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const MAX_LOGIN_ATTEMPTS = 10;

router.use(requireSameOrigin);
router.use((_req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
});

function getAttemptState(ip) {
  const current = loginAttempts.get(ip);

  if (!current || current.resetAt <= Date.now()) {
    const fresh = { count: 0, resetAt: Date.now() + LOGIN_WINDOW_MS };
    loginAttempts.set(ip, fresh);
    return fresh;
  }

  return current;
}

router.post('/login', (req, res) => {
  if (!isConfigured()) {
    return res.status(503).json({
      message: 'A autenticação administrativa não foi configurada no servidor.'
    });
  }

  const username = String(req.body.username || '').trim();
  const password = String(req.body.password || '');
  const attempts = getAttemptState(req.ip);

  if (attempts.count >= MAX_LOGIN_ATTEMPTS) {
    return res.status(429).json({
      message: 'Muitas tentativas de login. Aguarde alguns minutos.'
    });
  }

  if (!username || !password || !validateCredentials(username, password)) {
    attempts.count += 1;
    return res.status(401).json({ message: 'Usuário ou senha inválidos.' });
  }

  loginAttempts.delete(req.ip);
  setSessionCookie(res, createSessionToken(username));
  return res.json({ authenticated: true, username });
});

router.get('/session', (req, res) => {
  const session = getSessionFromRequest(req);

  if (!session) {
    return res.status(401).json({ authenticated: false });
  }

  return res.json({
    authenticated: true,
    username: session.username
  });
});

router.post('/logout', (_req, res) => {
  clearSessionCookie(res);
  return res.status(204).send();
});

module.exports = router;
