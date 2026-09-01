import { useState } from 'react';
import { uploadDocument } from '../services/documentsApi';

export default function UploadComponent({ owner, onUploaded }) {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(event) {
    event.preventDefault();

    if (!file || !owner) {
      setError('Selecione um arquivo e informe o usuário.');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      await uploadDocument(file, owner);
      setFile(null);
      event.target.reset();
      onUploaded();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input type="file" onChange={(event) => setFile(event.target.files[0] ?? null)} />
      <button type="submit" disabled={isUploading}>
        {isUploading ? 'Enviando...' : 'Enviar documento'}
      </button>
      {error && <p role="alert">{error}</p>}
    </form>
  );
}
