# 🍕 Pizzaria CRUD App:

A aplicação simula o funcionamento básico de uma pizzaria, permitindo o gerenciamento de clientes, produtos (pizzas) e pedidos por meio de operações CRUD.
O sistema é dividido em frontend e backend, que se comunicam através de uma API utilizando Express.

## 🚀 Visão Geral:

O objetivo principal é criar uma estrutura funcional para uma pizzaria digital, onde:
- Clientes podem ser cadastrados, editados e removidos.
- Pizzas (produtos) podem ser adicionadas, editada ou removidas do sistema.
- Pedidos podem ser feitos relacionando clientes aos produtos escolhidos.

## Ferramentas e recursos utlizados:

### Backend:
- **Node.js**
- **Express** – Facilita a criação da API e o roteamento.
- **NPM** – Gerenciador de pacotes (versão 0.17.4 utilizada no projeto).
- Estrutura CRUD para: clientes, produtos e pedidos.
- O servidor BACKEND usado estará rodando na porta 4000 e deverá estar em visibilidade pública.

### Frontend:
- Comunicação com o backend via requisições HTTP.
- Usou-se como base ferramentas dispostas no site https://materializecss.com/
- A aplicação FRONTEND usará a porta 3000 e deverá estar em visibilidade pública.

## 🔗 Estrutura de Comunicação:

A aplicação é dividida entre cliente e servidor:
- O **frontend** envia requisições HTTP (GET, POST, PUT, DELETE) para o backend.
- O **backend (API Express)** processa essas requisições, interage com a base de dados (ou estrutura simulada) e retorna as respostas adequadas.

## 📁 Estrutura de Pastas:
Aqui você encontra detalhes da estrutura de pastas do projeto;

/back
|-- bin/        -> Gerencia a porta de comunicação (4000) e cria servidor
|-- database/   -> contém o banco de dados
|-- public/
|-- routes/     -> Contém as rotas (index.js | clients.js | orders.js | pizzas.js)


/front
|-- bin/        -> gerencia a porta de comunicação (3000) e cria servidor
|-- public/     -> Contém o arquivo principal (index.html)
    |-- css/    -> Arquivos CSS
    |-- js/     -> Arquivos JS
|-- src/
|-- components/ -> Contém compontes das páginas (Imagens e demais assets)
|-- pages/

# Arquivos estáticos:
index.html
pizzas.html

## Participantes do projeto:
Eduardo Cadiz eduardo.cadiz@faculdadenovaroma.com.br
Leonardo Andrade leonardo.lima@novaroma.edu.br
Kaio kaioguilherme649@gmail.com