var sqlite3 = require('sqlite3');

// Conexão com o banco de dados SQLite:
const db = new sqlite3.Database('../pizzariaDataBase.db', (err) => {
    if (err) {
        console.error('Erro conectando ao banco de dados.', err.message);
    } else {
        console.log('Conectado ao banco de dados.');
    }
}
);

// Criar tabelas no banco de dados se não existirem:
db.serialize(() => {

    // Tabela Produtos:
    db.run(`CREATE TABLE IF NOT EXISTS produtos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sabor TEXT NOT NULL,
    descricao TEXT,
    categoria TEXT,
    tamanho TEXT NOT NULL,
    preco REAL NOT NULL    
)`, (err) => {
        if (err) {
            console.error('Erro criando tabela em pizzariaDataBase.db', err.message);
        } else {
            console.log('Produtos: Tabela criada com sucesso em pizzariaDataBase.db.');
        }
    });

    // Tabela Clientes:
    //
    db.run(`CREATE TABLE IF NOT EXISTS clientes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    email TEXT,
    telefone TEXT NOT NULL
    whatsapp TEXT NOT NULL,
)`, (err) => {
        if (err) {
            console.error('Erro criando tabela em pizzariaDataBase.db', err.message);
        } else {
            console.log('clientes: Tabela criada com sucesso em pizzariaDataBase.db.');
        }
    });

    // Tabela Pedidos
    //
db.run(`CREATE TABLE IF NOT EXISTS pedidos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    clientes_id INTEGER NOT NULL,
    produtos_id INTEGER NOT NULL,
    quantidade INTEGER NOT NULL,
    preco_total REAL NOT NULL,
    endereco_entrega TEXT NOT NULL,
    data_pedido TEXT NOT NULL,
    status TEXT NOT NULL,
    FOREIGN KEY (cliente_id) REFERENCES clientes(id)
)`,(err) => {
    if (err) {
        console.error('Erro criando tabela em pizzariaDataBase.db', err.message);
    } else {
        console.log('Pedidos: Tabela criada com sucesso em pizzariaDataBase.db.');
    }
});

});

// Export the database connection
module.exports = db;