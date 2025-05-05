# 🍕 Pizzaria CRUD App:
A aplicação simula o funcionamento básico de uma pizzaria, permitindo o gerenciamento de clientes, produtos (pizzas) e pedidos por meio de operações CRUD.
O sistema é dividido em frontend e backend, que se comunicam através de uma API utilizando Express.

# Para "rodar" o projeto via:
- BACKEND: /back/npm run dev  -> Acesso direto na pasta /back via terminal
- FRONTEND: 


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
- SGBD sqlite3 será usado para gerenciar os arquivos de banco de dados separados: clients, orders e pizzas. Tais
arquivos estão separados na pasta /back/database/

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

- /back
- ├── bin/          # Gerencia a porta de comunicação (4000) e cria o servidor
- ├── database/     # Contém os arquivos de banco de dados
- ├── public/       # (Opcional) Arquivos estáticos se necessário
- ├── routes/       # Rotas da API (index.js, clients.js, orders.js, pizzas.js)

- /front
- ├── bin/              # Gerencia a porta de comunicação (3000) e cria o servidor do frontend
- ├── public/           # Contém o arquivo principal index.html e recursos públicos
- │   ├── css/          # Arquivos de estilo (CSS)
- │   ├── js/           # Scripts JS do frontend
- │   ├── components/   # Componentes de interface (imagens, assets, partes de páginas)
- ├── src/              # (Opcional) Scripts JS organizados por funcionalidade
- ├── pages/            # Páginas HTML adicionais (caso exista mais que o index.html)

# Arquivos estáticos:
- index.html
- pizzas.html
- orders.html
- clients.html 

## Participantes do projeto:
- Eduardo Cadiz eduardo.cadiz@faculdadenovaroma.com.br
- Leonardo Andrade leonardo.lima@novaroma.edu.br
- Kaio kaioguilherme649@gmail.com