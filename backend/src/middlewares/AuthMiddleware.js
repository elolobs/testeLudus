import jwt from 'jsonwebtoken';

function obterJwtSecret() {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET deve estar configurado com pelo menos 32 caracteres.');
  }
  return process.env.JWT_SECRET;
}

export function autenticar(req, res, next) {
  const headerAuth = req.headers.authorization;
  const [tipo, token] = typeof headerAuth === 'string' ? headerAuth.split(' ') : [];

  if (tipo !== 'Bearer' || !token) {
    return res.status(401).json({ sucesso: false, erro: 'Token de autenticação ausente.' });
  }

  try {
    const payload = jwt.verify(token, obterJwtSecret());
    req.usuario = {
      id: Number(payload.sub),
      cargo: payload.cargo
    };
    if (!Number.isInteger(req.usuario.id) || req.usuario.id <= 0) {
      return res.status(401).json({ sucesso: false, erro: 'Token inválido ou expirado.' });
    }
    return next();
  } catch {
    return res.status(401).json({ sucesso: false, erro: 'Token inválido ou expirado.' });
  }
}

export function autorizarPerfis(...perfisPermitidos) {
  return function autorizar(req, res, next) {
    if (!req.usuario) {
      return res.status(401).json({ sucesso: false, erro: 'Autenticação necessária.' });
    }
    if (!perfisPermitidos.includes(req.usuario.cargo)) {
      return res.status(403).json({ sucesso: false, erro: 'Você não tem permissão para acessar este recurso.' });
    }
    return next();
  };
}

export const autorizarAdmin = autorizarPerfis('ADMIN');