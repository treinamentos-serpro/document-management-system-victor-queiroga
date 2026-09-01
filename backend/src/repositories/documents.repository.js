const documents = [];

function save(document) {
  documents.push(document);
  return document;
}

function findByOwner(owner) {
  return documents.filter((document) => document.owner === owner);
}

function findById(id) {
  return documents.find((document) => document.id === id);
}

module.exports = {
  save,
  findByOwner,
  findById,
};