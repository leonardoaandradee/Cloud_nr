var produtosDB = require('../database/database-config');

// Listagem de produtos: getProdutos
//
function getProdutos(res) {
    produtosDB.all("SELECT * FROM produtos", [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json(rows);
        }
    });
}

// Criar um novo produto: createProdutos
//
function createProdutos(produto, res) {
    produtosDB.run(`INSERT INTO produtos (sabor, descricao, categoria, tamanho, preco) VALUES (?, ?, ?, ?, ?)`,
        [produtos.sabor, produtos.descricao, produtos.categoria, produtos.tamanho, produtos.preco],
        function (err) {
            if (err) {
                throw (err);
            } else {
                res.send(produto);
            }
        }
    );

}

module.exports = {
    getProdutos,
    createProdutos,
    // Other CRUD operations can be added here
};