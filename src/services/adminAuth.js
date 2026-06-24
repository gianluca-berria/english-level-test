const crypto = require('crypto');

const COOKIE_NAME = 'english_level_admin';
const SESSION_DURATION_MS = 8 * 60 * 60 * 1000;

function getCredentials() {
  return {
    username: process.env.ADMIN_USERNAME || '',
    password: process.env.ADMIN_PASSWORD || '',
    secret: process.env.ADMIN_SESSION_SECRET || ''
  };
}

function isConfigured() {
  const credentials = getCredentials();
  return Boolean(credentials.username && credentials.password && credentials.secret.length >= 32);
}

function safeEqual(left, right) {
  const leftHash = crypto.createHash('sha256').update(String(left)).digest();
  const rightHash = crypto.createHash('sha256').update(String(right)).digest();
  return crypto.timingSafeEqual(leftHash, rightHash);
}

function validateCredentials(username, password) {
  const credentials = getCredentials();

  return isConfigured()
    && safeEqual(username, credentials.username)
    && safeEqual(password, credentials.password);
}

function sign(value) {
  return crypto
    .createHmac('sha256', getCredentials().secret)
    .update(value)
    .digest('base64url');
}

function createSessionToken(username) {
  const payload = Buffer.from(JSON.stringify({
    username,
    expiresAt: Date.now() + SESSION_DURATION_MS,
    nonce: crypto.randomBytes(16).toString('hex')
  })).toString('base64url');

  return `${payload}.${sign(payload)}`;
}

function verifySessionToken(token) {
  if (!isConfigured() || typeof token !== 'string') {
    return null;
  }

  const [payload, signature, extra] = token.split('.');
  if (!payload || !signature || extra || !safeEqual(signature, sign(payload))) {
    return null;
  }

  try {
    const session = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    const credentials = getCredentials();

    if (
      !safeEqual(session.username, credentials.username)
      || !Number.isFinite(session.expiresAt)
      || session.expiresAt <= Date.now()
    ) {
      return null;
    }

    return session;
  } catch (_error) {
    return null;
  }
}

function parseCookies(cookieHeader = '') {
  return cookieHeader.split(';').reduce((cookies, item) => {
    const separatorIndex = item.indexOf('=');
    if (separatorIndex === -1) {
      return cookies;
    }

    const name = item.slice(0, separatorIndex).trim();
    const value = item.slice(separatorIndex + 1).trim();
    try {
      cookies[name] = decodeURIComponent(value);
    } catch (_error) {
      cookies[name] = '';
    }
    return cookies;
  }, {});
}

function getSessionFromRequest(req) {
  const cookies = parseCookies(req.headers.cookie);
  return verifySessionToken(cookies[COOKIE_NAME]);
}

function setSessionCookie(res, token) {
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    maxAge: SESSION_DURATION_MS,
    path: '/'
  });
}

function clearSessionCookie(res) {
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    path: '/'
  });
}

module.exports = {
  clearSessionCookie,
  createSessionToken,
  getSessionFromRequest,
  isConfigured,
  setSessionCookie,
  validateCredentials
};
