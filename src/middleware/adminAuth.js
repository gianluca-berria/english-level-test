const { getSessionFromRequest } = require('../services/adminAuth');

function requireAdmin(req, res, next) {
  const session = getSessionFromRequest(req);

  if (!session) {
    return res.status(401).json({
      message: 'Sessão administrativa inválida ou expirada.'
    });
  }

  req.admin = { username: session.username };
  return next();
}

module.exports = requireAdmin;
