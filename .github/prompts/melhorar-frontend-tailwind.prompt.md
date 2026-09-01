---
description: Melhora a interface do frontend aplicando Tailwind CSS 3 nos componentes existentes.
name: melhorar-frontend-tailwind
agent: tailwind-ui
---

# Melhorar frontend com Tailwind CSS 3

Aplique melhorias visuais no frontend do DMS usando **Tailwind CSS 3**,
mantendo toda a funcionalidade atual (upload, listagem e download de
documentos).

## Passos

1. Verifique se o Tailwind CSS 3 está instalado e configurado em
   `frontend/` (dependências, `tailwind.config.js`, `postcss.config.js` e
   diretivas `@tailwind` no CSS importado em `main.jsx`). Caso não esteja,
   configure-o primeiro.
2. Estilize `App.jsx` com um layout de página centralizado, cabeçalho claro e
   espaçamento consistente.
3. Estilize `UploadComponent.jsx` como um formulário com boa hierarquia
   visual (campo de usuário, seleção de arquivo, botão de envio) e feedback de
   estado (enviando, sucesso, erro).
4. Estilize `DocumentList.jsx` como uma tabela responsiva com estados de
   carregamento, erro e lista vazia bem sinalizados.
5. Estilize `DownloadButton.jsx` como um botão de ação consistente com o
   restante da interface.

## Requisitos

- Use somente classes utilitárias do Tailwind CSS 3.
- Não altere a lógica de chamadas à API (`documentsApi.js`) nem o backend.
- Mantenha o código legível, sem duplicar longas cadeias de classes quando um
  componente puder ser reaproveitado.
- Garanta responsividade (mobile-first) e acessibilidade básica.
