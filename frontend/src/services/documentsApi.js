// Cliente HTTP para a API de documentos do backend (prefixo /api).

async function parseErrorMessage(response, fallbackMessage) {
  try {
    const data = await response.json();
    return data.error || fallbackMessage;
  } catch {
    return fallbackMessage;
  }
}

export async function uploadDocument(file, owner) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('owner', owner);

  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response, 'Não foi possível enviar o documento.'));
  }

  return response.json();
}

export async function listDocuments(owner) {
  const response = await fetch(`/api/documents?owner=${encodeURIComponent(owner)}`);

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response, 'Não foi possível listar os documentos.'));
  }

  return response.json();
}

export function getDownloadUrl(documentId) {
  return `/api/documents/${documentId}/download`;
}
