const documentService = require('../services/documents.service');

function sendError(res, error, defaultMessage) {
  if (error.code === 'VALIDATION_ERROR') {
    return res.status(400).json({ error: error.message });
  }

  if (error.code === 'DOCUMENT_NOT_FOUND') {
    return res.status(404).json({ error: error.message });
  }

  return res.status(500).json({ error: defaultMessage });
}

function uploadDocument(req, res) {
  try {
    const document = documentService.createDocument(req.file, req.body.owner);
    return res.status(201).json(document);
  } catch (error) {
    return sendError(res, error, 'Não foi possível enviar o documento.');
  }
}

function listDocuments(req, res) {
  try {
    const documents = documentService.listDocuments(req.query.owner);
    return res.status(200).json(documents);
  } catch (error) {
    return sendError(res, error, 'Não foi possível listar os documentos.');
  }
}

function downloadDocument(req, res) {
  try {
    const document = documentService.getDocumentForDownload(req.params.id);

    return res.download(document.storagePath, document.originalName, (error) => {
      if (!error || res.headersSent) {
        return;
      }

      if (error.code === 'ENOENT') {
        return res.status(404).json({ error: 'Documento não encontrado.' });
      }

      return res.status(500).json({ error: 'Não foi possível baixar o documento.' });
    });
  } catch (error) {
    return sendError(res, error, 'Não foi possível baixar o documento.');
  }
}

module.exports = {
  uploadDocument,
  listDocuments,
  downloadDocument,
};