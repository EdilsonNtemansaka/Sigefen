const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ erro: 'Token em falta' });
  }
  const token = header.split(' ')[1];
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ erro: 'Token inválido ou expirado' });
  }
}

function requirePapel(...papeis) {
  return (req, res, next) => {
    if (!papeis.includes(req.user.papel)) {
      return res.status(403).json({ erro: 'Sem permissão' });
    }
    next();
  };
}

module.exports = { authMiddleware, requirePapel };
