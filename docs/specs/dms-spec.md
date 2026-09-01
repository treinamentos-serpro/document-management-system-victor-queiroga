# Especificação - Document Management System

## 1. Objetivo

Disponibilizar um sistema web para que usuários identifiquem-se por um
`owner`, enviem documentos ao armazenamento local, listem seus próprios
documentos e baixem um documento pelo seu identificador.

## 2. Escopo

### Dentro do escopo

- Upload de um único arquivo por requisição HTTP.
- Associação do documento a um usuário por meio do campo obrigatório `owner`.
- Gravação do arquivo no filesystem local da aplicação.
- Criação e manutenção em memória dos metadados do documento.
- Listagem dos documentos filtrada obrigatoriamente por usuário.
- Download de um documento pelo identificador único.
- Interface React que envia requisições ao backend pelo prefixo `/api`.

### Fora do escopo

- Autenticação, autorização e gestão de contas de usuário.
- Armazenamento externo, em nuvem, distribuído ou compartilhado.
- Banco de dados ou persistência dos metadados após reiniciar o processo.
- Versionamento, edição, exclusão, compartilhamento ou busca textual de documentos.
- Paginação, ordenação configurável e filtros além de `owner`.
- Validação ou restrição por extensão e tipo MIME de arquivo.

## 3. Requisitos funcionais

| ID | Requisito | Critério de aceite |
| --- | --- | --- |
| RF-01 | O usuário pode enviar um documento com seu identificador de dono. | `POST /upload` recebe exatamente um arquivo no campo `file` e um campo textual `owner` não vazio. Quando válidos, o arquivo é salvo localmente e a API responde `201` com os metadados públicos. |
| RF-02 | O sistema valida a requisição de upload antes de registrar seus metadados. | Arquivo ausente, `owner` ausente ou vazio e arquivo maior que 10 MB resultam em resposta de erro sem criar metadados. São aceitos arquivos de qualquer tipo MIME dentro do limite. |
| RF-03 | O sistema atribui um identificador único e imutável a cada documento aceito. | Cada documento criado possui `id` único, `uploadedAt` em ISO 8601, nome original, tamanho, dono e referência interna ao arquivo gravado. |
| RF-04 | O usuário pode listar seus documentos. | `GET /documents?owner={owner}` exige `owner` não vazio e retorna `200` com somente os metadados públicos dos documentos cujo `owner` corresponda exatamente ao parâmetro. Sem documentos, retorna uma lista vazia. |
| RF-05 | O usuário pode baixar um documento pelo identificador. | `GET /documents/:id/download` retorna o conteúdo binário do arquivo associado e sugere o nome original no download. Um identificador inexistente retorna `404`. |
| RF-06 | O backend expõe uma verificação simples de disponibilidade. | `GET /health` mantém a resposta `200` com `{ "status": "ok" }`. |

## 4. Requisitos não funcionais

| ID | Requisito |
| --- | --- |
| RNF-01 | O backend deve usar Node.js, Express e módulos CommonJS; o frontend deve usar React, Vite e módulos ESM. |
| RNF-02 | Os arquivos devem ser gravados exclusivamente no diretório local `backend/storage` usando `multer` com `diskStorage`. Não devem ser usados provedores externos. |
| RNF-03 | Os metadados devem residir somente em memória nesta fase. Ao reiniciar o processo, a lista de documentos é perdida, mesmo que os arquivos físicos permaneçam no diretório de armazenamento. |
| RNF-04 | O tamanho máximo de upload deve ser configurável por variável de ambiente, com valor padrão de 10 MB. A porta do servidor deve continuar configurável por `PORT`, com padrão `3000`. |
| RNF-05 | Erros de entrada e de acesso ao filesystem devem ser tratados no limite HTTP, com respostas JSON para erros da API. O backend não deve expor caminhos internos de armazenamento. |
| RNF-06 | O código backend deve respeitar o fluxo de dependências `routes -> controllers -> services -> repositories`; as camadas internas não conhecem HTTP nem componentes React. |
| RNF-07 | O backend deve ter testes automatizados com o runner nativo `node:test` para os fluxos de sucesso e erro dos endpoints. |
| RNF-08 | O frontend deve acessar o backend com `fetch` pelo prefixo `/api`, aproveitando o proxy já configurado no Vite. |

## 5. Modelo de dados

### Metadados persistidos em memória

| Campo | Tipo | Obrigatório | Exposto pela API | Descrição |
| --- | --- | --- | --- | --- |
| `id` | string | Sim | Sim | Identificador único e imutável gerado pelo serviço no momento do upload. |
| `originalName` | string | Sim | Sim | Nome informado pelo cliente para o arquivo enviado. |
| `size` | number | Sim | Sim | Tamanho do arquivo em bytes. |
| `uploadedAt` | string | Sim | Sim | Data e hora de criação do registro, no formato ISO 8601 em UTC. |
| `owner` | string | Sim | Sim | Identificador textual do usuário dono, enviado no corpo do upload. |
| `storedName` | string | Sim | Não | Nome único atribuído ao arquivo no diretório de armazenamento, sem caminho absoluto. |
| `storagePath` | string | Sim | Não | Caminho interno utilizado pelo repositório para localizar o arquivo físico. |

### Regras do modelo

- `owner` deve conter ao menos um caractere diferente de espaço em branco.
- `id`, `storedName` e `storagePath` são gerados ou definidos internamente; o cliente não pode controlá-los.
- O nome do arquivo físico deve ser único para evitar sobrescrever uploads com nomes originais iguais.
- A representação pública de um documento contém somente `id`, `originalName`, `size`, `uploadedAt` e `owner`.
- Como o repositório de metadados é em memória, um arquivo físico sem metadado após uma reinicialização não pode ser listado nem baixado pela API.

## 6. Contratos de API

### Convenções gerais

- A API responde JSON em operações de metadados e erros.
- O corpo de erro segue o formato `{ "error": "mensagem em português" }`.
- O frontend utiliza as rotas com o prefixo `/api`; o proxy do Vite remove esse prefixo antes de encaminhar ao backend.

### POST /upload

Recebe e armazena um documento.

**Requisição**

- `Content-Type`: `multipart/form-data`.
- Campo `file`: arquivo obrigatório; um único arquivo; tamanho máximo padrão de 10 MB.
- Campo `owner`: texto obrigatório, não vazio após remoção dos espaços nas extremidades.

**Resposta de sucesso: `201 Created`**

```json
{
  "id": "doc_123",
  "originalName": "relatorio.pdf",
  "size": 24576,
  "uploadedAt": "2026-09-01T14:30:00.000Z",
  "owner": "usuario-42"
}
```

**Respostas de erro**

| Status | Condição | Corpo |
| --- | --- | --- |
| `400 Bad Request` | Ausência de `file`, ausência de `owner`, `owner` vazio ou formato multipart inválido. | `{ "error": "Arquivo e owner são obrigatórios." }` ou mensagem equivalente. |
| `413 Payload Too Large` | Arquivo excede o limite configurado. | `{ "error": "O arquivo excede o limite máximo de 10 MB." }` |
| `500 Internal Server Error` | Falha inesperada ao salvar arquivo ou metadados. | `{ "error": "Não foi possível enviar o documento." }` |

### GET /documents?owner={owner}

Lista os documentos de um único usuário.

**Parâmetros de consulta**

| Parâmetro | Obrigatório | Regra |
| --- | --- | --- |
| `owner` | Sim | Texto não vazio; a correspondência com o metadado é exata. |

**Resposta de sucesso: `200 OK`**

```json
[
  {
    "id": "doc_123",
    "originalName": "relatorio.pdf",
    "size": 24576,
    "uploadedAt": "2026-09-01T14:30:00.000Z",
    "owner": "usuario-42"
  }
]
```

Quando não houver documentos para o dono informado, a resposta deve ser `[]`.

**Respostas de erro**

| Status | Condição | Corpo |
| --- | --- | --- |
| `400 Bad Request` | `owner` ausente ou vazio. | `{ "error": "O parâmetro owner é obrigatório." }` |
| `500 Internal Server Error` | Falha inesperada ao consultar os metadados. | `{ "error": "Não foi possível listar os documentos." }` |

### GET /documents/:id/download

Envia o conteúdo do arquivo relacionado ao documento identificado.

**Parâmetros de rota**

| Parâmetro | Obrigatório | Regra |
| --- | --- | --- |
| `id` | Sim | Deve corresponder a um documento existente nos metadados em memória. |

**Resposta de sucesso: `200 OK`**

- Corpo: conteúdo binário do arquivo.
- `Content-Type`: tipo MIME registrado pelo upload quando disponível; caso contrário, tipo binário genérico.
- `Content-Disposition`: `attachment` com o `filename` baseado em `originalName`.

**Respostas de erro**

| Status | Condição | Corpo |
| --- | --- | --- |
| `404 Not Found` | Não existe metadado para o `id`, ou o arquivo físico associado não está disponível. | `{ "error": "Documento não encontrado." }` |
| `500 Internal Server Error` | Falha inesperada na leitura do arquivo. | `{ "error": "Não foi possível baixar o documento." }` |

### GET /health

Endpoint de infraestrutura já existente para verificar a disponibilidade do backend.

**Resposta: `200 OK`**

```json
{
  "status": "ok"
}
```

## 7. Decisões arquiteturais

### Backend

O backend seguirá uma Clean Architecture simples dentro de `backend/src`, com o
fluxo de dependências abaixo:

```text
routes -> controllers -> services -> repositories
```

| Camada | Responsabilidade |
| --- | --- |
| `routes/` | Declara `POST /upload`, `GET /documents` e `GET /documents/:id/download`; configura o middleware de upload e encaminha as requisições aos controllers. |
| `controllers/` | Lê `params`, `query`, `body` e o arquivo processado pelo Multer; valida entradas básicas; converte resultados e erros do serviço em respostas HTTP. |
| `services/` | Aplica as regras de negócio: valida `owner`, cria o identificador e `uploadedAt`, monta metadados públicos e decide erros de documento inexistente. |
| `repositories/` | Mantém a coleção de metadados em memória e encapsula a localização e leitura de arquivos no filesystem local. |

O Multer com `diskStorage` integra-se na borda HTTP para salvar o arquivo em
`backend/storage`. O controller deve receber somente os dados normalizados pelo
middleware e não deve implementar regras de persistência.

### Frontend

O frontend será organizado em `components/`, `pages/` e `services/`. Um serviço
de API concentrará chamadas `fetch` para `/api/upload`,
`/api/documents?owner=...` e `/api/documents/:id/download`; componentes devem
apresentar o formulário de upload, a lista de documentos e a ação de download.

### Configuração e dados

- `PORT` configura a porta do backend, com padrão `3000`.
- Uma variável de ambiente, por exemplo `MAX_FILE_SIZE_BYTES`, configura o
  limite de upload, com padrão de `10485760` bytes (10 MB).
- Nenhum segredo, caminho absoluto ou configuração de infraestrutura deve ser
  incorporado ao código.
- Não será adicionada dependência para banco de dados, autenticação ou
  armazenamento externo.

## 8. Plano de execução

As etapas abaixo são futuras e não são executadas como parte desta criação de
especificação.

1. Criar o repositório de documentos em `backend/src/repositories/` para manter metadados em memória e localizar arquivos em `backend/storage`.
2. Configurar `multer.diskStorage` e os limites de tamanho, usando as variáveis de ambiente definidas nesta especificação.
3. Implementar o serviço de documentos em `backend/src/services/` para geração de metadados, validação de regras e recuperação de documentos.
4. Implementar controllers e rotas em `backend/src/controllers/` e `backend/src/routes/`, incluindo a tradução dos erros para os contratos HTTP definidos.
5. Montar as novas rotas no `backend/src/app.js`, preservando o endpoint `GET /health`.
6. Adicionar testes com `node:test` em `backend/test/` para upload válido, validações, listagem por dono, download e documento inexistente.
7. Criar o serviço de API e os componentes React em `frontend/src/services/`, `frontend/src/components/` e `frontend/src/pages/`, integrando-os em `frontend/src/App.jsx` pelo proxy `/api`.
8. Verificar manualmente o fluxo de upload, listagem filtrada e download, incluindo respostas de erro, sem introduzir armazenamento externo ou persistência de metadados.