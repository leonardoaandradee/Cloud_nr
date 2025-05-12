## 🍕 Pizzaria CRUD App:
A aplicação simula o funcionamento básico de um sistema para uma pizzaria, permitindo o gerenciamento de clientes, produtos e pedidos por meio de operações CRUD.

## 🚀 Visão Geral:
O objetivo principal é criar uma estrutura funcional para uma pizzaria digital, onde:
- Clientes podem ser cadastrados, editados e removidos.
- Pizzas (produtos) podem ser adicionadas, editada ou removidas do sistema.
- Pedidos podem ser feitos relacionando clientes aos produtos escolhidos.

## Para rodar projeto:
#### BACKEND: /back/npm run dev
- Após "levantar" seu servidor Backend, libere a porta para modo público e copie o endereço HTTP;    
#### FRONTEND: /front/npm start
- Antes de "levantar" sua aplicação Frontend, adicione à variável API_URL, contida em /front/public/js o endereço HTTP de sua aplicação (API) Backend;
- Libere a porta para modo público;  

## Ferramentas e recursos utlizados:

### Backend:
- **Node.js**
- **Express** – Facilita a criação da API e o roteamento.
- **NPM** – Gerenciador de pacotes (versão 0.17.4 utilizada no projeto).
- Estrutura CRUD para: clientes, produtos e pedidos.
- O servidor BACKEND usado estará rodando na porta 4000 e deverá estar em visibilidade pública.
- SGBD sqlite3 será usado para gerenciar o arquivos de banco de dados /pizzariaDataBase.db.
- A API Via CEP está implementada para complementação de endereços de forma automática através do CEP.

### Frontend:
- Comunicação com o backend via requisições HTTP.
- Usou-se como base de estilo CSS, framework https://materializecss.com/
- A aplicação FRONTEND usará a porta 3000 e deverá estar em visibilidade pública.
- Insira os dados de endereço de sua API Backend na variável contida em /front/public/js/config.js

#### Bibliotecas:
- AXIOS
- EJS
- SQLITE3

## 🔗 Estrutura de Comunicação:
A aplicação é dividida entre cliente e servidor:
- O **frontend** envia requisições HTTP (GET, POST, PUT, DELETE) para o backend.
- O **backend (API Express)** processa essas requisições, interage com a base de dados.

## Estrutura das tabelas usadas:
- Por favor verifique o arquivo /back/database/database-config.js para detalhes. Atente-se às informações abaixo:

#### Produtos:
- sabor 
- descricao 
- categoria
- tamanho 
- preco 
#### Clientes:
- nome
- email
- telefone
- CEP
- complemento
#### Pedidos:
- quantidade
- preco_total
- endereço_entrega
- data_pedido
- status

## Arquivos estáticos:
- Imagens: /front/components/images

## Participantes do projeto:
- Eduardo Cadiz eduardo.cadiz@faculdadenovaroma.com.br
- Leonardo Andrade leonardo.lima@novaroma.edu.br
- Kaio kaioguilherme649@gmail.com