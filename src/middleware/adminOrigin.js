function requireSameOrigin(req, res, next) {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  const origin = req.get('origin');
  if (!origin) {
    return next();
  }

  try {
    if (new URL(origin).host !== req.get('host')) {
      return res.status(403).json({ message: 'Origem da requisição não autorizada.' });
    }
  } catch (_error) {
    return res.status(403).json({ message: 'Origem da requisição inválida.' });
  }

  return next();
}

module.exports = requireSameOrigin;
