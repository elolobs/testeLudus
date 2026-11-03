import multer from 'multer';
import { randomUUID } from 'node:crypto';
import { mkdirSync } from 'node:fs';
import { extname, resolve } from 'node:path';


// Garante que o diretório 'uploads/produtos' exista fisicamente no disco
const DIRETORIO_UPLOADS = resolve('uploads/produtos');
mkdirSync(DIRETORIO_UPLOADS, { recursive: true });


// Formatos aceitos
const MIME_TYPES_VALIDOS = ['image/jpeg', 'image/png', 'image/webp'];


const storage = multer.diskStorage({
  destination: (_req, _file, callback) => {
    callback(null, DIRETORIO_UPLOADS);
  },
  filename: (_req, file, callback) => {
    const extensao = extname(file.originalname).toLowerCase();
    callback(null, `${randomUUID()}${extensao}`);
  }
});


const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // Limite: 2 MB
  fileFilter: (_req, file, callback) => {
    if (!MIME_TYPES_VALIDOS.includes(file.mimetype)) {
      const erro = new Error('Envie uma imagem válida (JPEG, PNG ou WebP).');
      erro.status = 415;
      return callback(erro);
    }
    return callback(null, true);
  }
});


export function uploadImagem(req, res, next) {
  upload.single('imagem')(req, res, (erro) => {
    if (erro instanceof multer.MulterError && erro.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({ sucesso: false, erro: 'A imagem deve ter no máximo 2 MB.' });
    }
    if (erro && erro.status === 415) {
      return res.status(415).json({ sucesso: false, erro: erro.message });
    }
    if (erro) {
      return next(erro);
    }
    if (!req.file) {
      return res.status(400).json({ sucesso: false, erro: 'Envie um arquivo no campo imagem.' });
    }
    return next();
  });
}
