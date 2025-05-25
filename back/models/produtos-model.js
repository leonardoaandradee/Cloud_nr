const produtosDB = require('../database/database-config');

// Listagem de produtos: getProdutos
function getProdutos(res) {
    produtosDB.all("SELECT * FROM produtos", [], (err, rows) => {
        if (err) {
            console.error("Erro ao buscar produtos:", err.message);
            return res.status(500).json({ 
                erro: 'Erro ao buscar produtos', 
                detalhes: err.message 
            });
        }
        res.status(200).json({
            sucesso: true,
            dados: rows
        });
    });
}

// Criar um novo produto: createProdutos
function createProdutos(produto, res) {
    if (!produto.sabor || !produto.tamanho || !produto.preco) {
        return res.status(400).json({        
            erro: 'Dados incompletos',
            detalhes: 'Sabor, tamanho e preço são obrigatórios!'
        });
    }
    
    produtosDB.run(
        `INSERT INTO produtos (sabor, descricao, categoria, tamanho, preco) 
         VALUES (?, ?, ?, ?, ?)`,
        [produto.sabor, produto.descricao, produto.categoria, produto.tamanho, produto.preco],
        function(err) {
            if (err) {
                console.error("Erro ao inserir produto:", err.message);
                return res.status(500).json({
                    erro: 'Erro ao inserir produto',
                    detalhes: err.message
                });
            }
            res.status(201).json({
                mensagem: 'Produto criado com sucesso',
                id: this.lastID,
                produto: produto
            });
        }
    );
}

// Excluir um produto: deleteProdutos
function deleteProdutos(id, res) {
    produtosDB.run(
        "DELETE FROM produtos WHERE id = ?",
        [id],
        function(err) {
            if (err) {
                console.error("Erro ao excluir produto:", err.message);
                return res.status(500).json({
                    erro: 'Erro ao excluir produto',
                    detalhes: err.message
                });
            }
            if (this.changes === 0) {
                return res.status(404).json({
                    mensagem: 'Produto não encontrado para exclusão'
                });
            }
            res.json({
                sucesso: true,
                mensagem: 'Produto excluído com sucesso'
            });
        }
    );
}

// Buscar um produto por ID: getProdutoById
function getProdutoById(id, res) {
    produtosDB.get(
        "SELECT * FROM produtos WHERE id = ?",
        [id],
        (err, row) => {
            if (err) {
                console.error("Erro ao buscar produto:", err.message);
                return res.status(500).json({ 
                    erro: 'Erro ao buscar produto', 
                    detalhes: err.message 
                });
            }
            if (!row) {
                return res.status(404).json({ 
                    sucesso: false,
                    mensagem: 'Produto não encontrado' 
                });
            }
            res.status(200).json({
                sucesso: true,
                dados: row
            });
        }
    );
}

// Atualizar um produto: updateProduto
function updateProduto(id, produto, res) {
    produtosDB.run(
        `UPDATE produtos SET sabor = ?, descricao = ?, categoria = ?, tamanho = ?, preco = ? 
         WHERE id = ?`,
        [produto.sabor, produto.descricao, produto.categoria, produto.tamanho, produto.preco, id],
        function(err) {
            if (err) {
                console.error("Erro ao atualizar produto:", err.message);
                return res.status(500).json({
                    erro: 'Erro ao atualizar produto',
                    detalhes: err.message
                });
            }
            if (this.changes === 0) {
                return res.status(404).json({
                    sucesso: false,
                    mensagem: 'Produto não encontrado para atualização'
                });
            }
            res.json({
                sucesso: true,
                mensagem: 'Produto atualizado com sucesso',
                id: id
            });
        }
    );
}

// Exporta as funções para serem usadas em outros módulos
module.exports = {
    getProdutos,
    createProdutos,
    deleteProdutos,
    getProdutoById,
    updateProduto
};