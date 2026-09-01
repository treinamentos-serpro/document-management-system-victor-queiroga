import { useCallback, useEffect, useState } from 'react';
import UploadComponent from './components/UploadComponent';
import DocumentList from './components/DocumentList';
import { listDocuments } from './services/documentsApi';

export default function App() {
  const [owner, setOwner] = useState('');
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchDocuments = useCallback(async (currentOwner) => {
    if (!currentOwner) {
      setDocuments([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await listDocuments(currentOwner);
      setDocuments(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDocuments(owner);
  }, [owner, fetchDocuments]);

  return (
    <main style={{ fontFamily: 'system-ui, sans-serif', padding: '2rem' }}>
      <h1>Document Management System</h1>

      <div>
        <label htmlFor="owner">Usuário</label>
        <input
          id="owner"
          value={owner}
          onChange={(event) => setOwner(event.target.value)}
          placeholder="Informe o nome do usuário"
        />
      </div>

      <UploadComponent owner={owner} onUploaded={() => fetchDocuments(owner)} />

      <DocumentList documents={documents} isLoading={isLoading} error={error} />
    </main>
  );
}
