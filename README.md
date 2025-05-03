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

/backend
|-- server.js
|-- routes/
|-- controllers/
|-- models/

/frontend
|-- public/
|-- src/
|-- components/
|-- pages/

# Arquivos estáticos:
pizzas.html

## Alunos participantes:
Eduardo Cadiz eduardo.cadiz@faculdadenovaroma.com.br
Leonardo Andrade 
Kaio kaioguilherme649@gmail.com