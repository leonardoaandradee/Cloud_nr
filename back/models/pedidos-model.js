const pedidosDB = require('../database/database-config');

// Busca todos os pedidos
function getPedidos(res) {
    pedidosDB.all(`
        SELECT p.*, c.nome as cliente_nome, pr.sabor as produto_sabor
        FROM pedidos p
        JOIN clientes c ON p.clientes_id = c.id
        JOIN produtos pr ON p.produtos_id = pr.id
    `, [], (err, rows) => {
        if (err) {
            console.error("Erro ao buscar pedidos:", err.message);
            return res.status(500).json({ 
                erro: 'Erro ao buscar pedidos', 
                detalhes: err.message 
            });
        }
        res.status(200).json({
            sucesso: true,
            dados: rows
        });
    });
}

// Cria um novo pedido
function createPedido(pedido, res) {
    if (!pedido.clientes_id || !pedido.produtos_id || !pedido.quantidade || !pedido.endereco_entrega) {
        return res.status(400).json({        
            erro: 'Dados incompletos',
            detalhes: 'Cliente, produto, quantidade e endereço são obrigatórios!'
        });
    }

    // Adiciona data atual e status inicial
    pedido.data_pedido = new Date().toISOString();
    pedido.status = 'Pendente';
    
    pedidosDB.run(
        `INSERT INTO pedidos (clientes_id, produtos_id, quantidade, preco_total, 
            endereco_entrega, data_pedido, status) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [pedido.clientes_id, pedido.produtos_id, pedido.quantidade, 
         pedido.preco_total, pedido.endereco_entrega, pedido.data_pedido, 
         pedido.status],
        function(err) {
            if (err) {
                console.error("Erro ao inserir pedido:", err.message);
                return res.status(500).json({
                    erro: 'Erro ao inserir pedido',
                    detalhes: err.message
                });
            }
            res.status(201).json({
                mensagem: 'Pedido criado com sucesso',
                id: this.lastID,
                pedido: pedido
            });
        }
    );
}

// Exclui um pedido
function deletePedido(id, res) {
    pedidosDB.run(
        "DELETE FROM pedidos WHERE id = ?",
        [id],
        function(err) {
            if (err) {
                console.error("Erro ao excluir pedido:", err.message);
                return res.status(500).json({
                    erro: 'Erro ao excluir pedido',
                    detalhes: err.message
                });
            }
            if (this.changes === 0) {
                return res.status(404).json({
                    mensagem: 'Pedido não encontrado para exclusão'
                });
            }
            res.json({
                sucesso: true,
                mensagem: 'Pedido excluído com sucesso'
            });
        }
    );
}

// Busca um pedido específico por ID
function getPedidoById(id, res) {
    pedidosDB.get(
        `SELECT p.*, c.nome as cliente_nome, pr.sabor as produto_sabor
         FROM pedidos p
         JOIN clientes c ON p.clientes_id = c.id
         JOIN produtos pr ON p.produtos_id = pr.id
         WHERE p.id = ?`,
        [id],
        (err, row) => {
            if (err) {
                console.error("Erro ao buscar pedido:", err.message);
                return res.status(500).json({ 
                    erro: 'Erro ao buscar pedido', 
                    detalhes: err.message 
                });
            }
            if (!row) {
                return res.status(404).json({ 
                    sucesso: false,
                    mensagem: 'Pedido não encontrado' 
                });
            }
            res.status(200).json({
                sucesso: true,
                dados: row
            });
        }
    );
}

// Atualiza um pedido
function updatePedido(id, pedido, res) {
    pedidosDB.run(
        `UPDATE pedidos 
         SET quantidade = ?, preco_total = ?, endereco_entrega = ?, status = ?
         WHERE id = ?`,
        [pedido.quantidade, pedido.preco_total, pedido.endereco_entrega, 
         pedido.status, id],
        function(err) {
            if (err) {
                console.error("Erro ao atualizar pedido:", err.message);
                return res.status(500).json({
                    erro: 'Erro ao atualizar pedido',
                    detalhes: err.message
                });
            }
            if (this.changes === 0) {
                return res.status(404).json({
                    sucesso: false,
                    mensagem: 'Pedido não encontrado para atualização'
                });
            }
            res.json({
                sucesso: true,
                mensagem: 'Pedido atualizado com sucesso',
                id: id
            });
        }
    );
}

// Exporta as funções para uso em outros módulos
module.exports = {
    getPedidos,
    createPedido,
    deletePedido,
    getPedidoById,
    updatePedido
};