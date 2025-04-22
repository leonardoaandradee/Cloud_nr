const express = require('express');
const fs = require('fs');
const path = require('path'); // Importar path para lidar com caminhos
const app = express();
const port = process.env.PORT || 3000;

const url = 'https://super-duper-fishstick-97qpjvvv4jj42pwgr-3000.app.github.dev/';

app.use(express.json());

// Servir arquivos estáticos da pasta atual
app.use(express.static(path.join(__dirname)));

// Rota para servir o arquivo pizzas.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'pizzas.html'));
});

// Iniciar o servidor
app.listen(port, () => {
  console.log('Servidor ativo');
});

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


