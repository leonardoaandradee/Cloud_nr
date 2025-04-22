const express = require('express');
const fs = require('fs');
const path = require('path'); // Importar path para lidar com caminhos
const app = express();
const port = 3000;

app.use(express.json());

// Servir arquivos estáticos da pasta atual
app.use(express.static(path.join(__dirname)));

// Funções para leitura e escrita no db.json
const readData = (file) => {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
};

const writeData = (file, data) => {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
};

// Rotas para db.json
app.get('/db/:collection', (req, res) => {
  const data = readData('./db.json');
  res.json(data[req.params.collection]);
});

app.post('/db/:collection', (req, res) => {
  const data = readData('./db.json');
  data[req.params.collection].push(req.body);
  writeData('./db.json', data);
  res.status(201).json(req.body);
});

// Iniciar o servidor
app.listen(port, '0.0.0.0', () => {
  console.log(`Servidor ativo em: http://0.0.0.0:${port}`);
});
