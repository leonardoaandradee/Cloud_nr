const sqlite3 = require('sqlite3');
const path = require('path');

// Caminho correto para o banco de dados
const dbPath = path.join(__dirname, '../../pizzariaDataBase.db');

// Conexão com o banco de dados
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
    if (err) {
        console.error('Erro na conexão com o banco de dados:', err.message);
        process.exit(1);
    }
    console.log('Conexão com banco de dados estabelecida em:', dbPath);
});

// Criação das tabelas
db.serialize(() => {
    // Tabela Produtos
    db.run(`
        CREATE TABLE IF NOT EXISTS produtos (
            id         INTEGER PRIMARY KEY AUTOINCREMENT,
            sabor      TEXT NOT NULL,
            descricao  TEXT,
            categoria  TEXT,
            tamanho    TEXT NOT NULL,
            preco      REAL NOT NULL    
        )`, (err) => {
        if (err) {
            console.error('Erro criando tabela produtos:', err.message);
        } else {
            console.log('Tabela produtos criada com sucesso.');
        }
    });

    // Tabela Clientes
    db.run(`
        CREATE TABLE IF NOT EXISTS clientes (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            nome        TEXT NOT NULL,
            email       TEXT,
            telefone    TEXT NOT NULL,
            CEP         TEXT,
            rua         TEXT,
            bairro      TEXT,
            cidade      TEXT,
            estado      TEXT,
            complemento TEXT
        )`, (err) => {
        if (err) {
            console.error('Erro criando tabela clientes:', err.message);
        } else {
            console.log('Tabela clientes criada com sucesso.');
        }
    });

    // Tabela Pedidos
    db.run(`
        CREATE TABLE IF NOT EXISTS pedidos (
            id                INTEGER PRIMARY KEY AUTOINCREMENT,
            clientes_id      INTEGER NOT NULL,
            preco_total      REAL NOT NULL,
            endereco_entrega TEXT NOT NULL,
            data_pedido      TEXT NOT NULL,
            status           TEXT NOT NULL,
            FOREIGN KEY (clientes_id) REFERENCES clientes(id)
        )`, (err) => {
        if (err) {
            console.error('Erro criando tabela pedidos:', err.message);
        } else {
            console.log('Tabela pedidos criada com sucesso.');
        }
    });
    
    // Tabela Itens do Pedido
    db.run(`
        CREATE TABLE IF NOT EXISTS itens_pedido (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            pedidos_id  INTEGER NOT NULL,
            produtos_id INTEGER NOT NULL,
            quantidade  INTEGER NOT NULL,
            preco_unitario REAL NOT NULL,
            subtotal   REAL NOT NULL,
            FOREIGN KEY (pedidos_id) REFERENCES pedidos(id),
            FOREIGN KEY (produtos_id) REFERENCES produtos(id)
        )`, (err) => {
        if (err) {
            console.error('Erro criando tabela itens_pedido:', err.message);
        } else {
            console.log('Tabela itens_pedido criada com sucesso.');
        }
    });
});

module.exports = db;