module.exports = (req, res, next) => {
   
    if (!req.usuario || req.usuario.cargo !== 'ADMIN') {
        return res.status(403).json({ error: "Acesso negado. Apenas administradores." });
    }
    next();
};