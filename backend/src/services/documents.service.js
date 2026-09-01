const { randomUUID } = require('node:crypto');
const documentRepository = require('../repositories/documents.repository');

function createValidationError(message) {
  const error = new Error(message);
  error.code = 'VALIDATION_ERROR';
  return error;
}

function toPublicDocument(document) {
  const { id, originalName, size, uploadedAt, owner } = document;
  return { id, originalName, size, uploadedAt, owner };
}

function createDocument(file, owner) {
  const normalizedOwner = owner?.trim();

  if (!file || !normalizedOwner) {
    throw createValidationError('Arquivo e owner são obrigatórios.');
  }

  const document = {
    id: randomUUID(),
    originalName: file.originalname,
    size: file.size,
    uploadedAt: new Date().toISOString(),
    owner: normalizedOwner,
    storedName: file.filename,
    storagePath: file.path,
    mimeType: file.mimetype,
  };

  return toPublicDocument(documentRepository.save(document));
}

function listDocuments(owner) {
  const normalizedOwner = owner?.trim();

  if (!normalizedOwner) {
    throw createValidationError('O parâmetro owner é obrigatório.');
  }

  return documentRepository.findByOwner(normalizedOwner).map(toPublicDocument);
}

function getDocumentForDownload(id) {
  const document = documentRepository.findById(id);

  if (!document) {
    const error = new Error('Documento não encontrado.');
    error.code = 'DOCUMENT_NOT_FOUND';
    throw error;
  }

  return document;
}

module.exports = {
  createDocument,
  listDocuments,
  getDocumentForDownload,
};