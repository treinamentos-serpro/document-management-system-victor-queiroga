const fs = require('node:fs');
const path = require('node:path');
const { randomUUID } = require('node:crypto');
const express = require('express');
const multer = require('multer');
const documentsController = require('../controllers/documents.controller');

const router = express.Router();
const storageDirectory = path.resolve(__dirname, '../../storage');
const defaultMaxFileSizeBytes = 10 * 1024 * 1024;
const configuredMaxFileSize = Number.parseInt(process.env.MAX_FILE_SIZE_BYTES, 10);
const maxFileSizeBytes = Number.isSafeInteger(configuredMaxFileSize) && configuredMaxFileSize > 0
  ? configuredMaxFileSize
  : defaultMaxFileSizeBytes;

const storage = multer.diskStorage({
  destination(req, file, callback) {
    fs.mkdirSync(storageDirectory, { recursive: true });
    callback(null, storageDirectory);
  },
  filename(req, file, callback) {
    callback(null, `${randomUUID()}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: maxFileSizeBytes, files: 1 },
});

router.post('/upload', upload.single('file'), documentsController.uploadDocument);
router.get('/documents', documentsController.listDocuments);
router.get('/documents/:id/download', documentsController.downloadDocument);

router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ error: 'O arquivo excede o limite máximo permitido.' });
  }

  if (error instanceof multer.MulterError) {
    return res.status(400).json({ error: 'Não foi possível processar o arquivo enviado.' });
  }

  return next(error);
});

module.exports = router;