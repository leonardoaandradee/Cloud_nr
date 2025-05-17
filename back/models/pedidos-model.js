const pedidosDB = require('../database/database-config');

// Busca todos os pedidos
function getPedidos(res) {
    pedidosDB.all(`
        SELECT p.*, c.nome as cliente_nome, c.telefone as cliente_telefone,
               GROUP_CONCAT(pr.sabor || ' (' || ip.quantidade || 'x)') as itens,
               p.preco_total as total
        FROM pedidos p
        JOIN clientes c ON p.clientes_id = c.id
        JOIN itens_pedido ip ON p.id = ip.pedidos_id
        JOIN produtos pr ON ip.produtos_id = pr.id
        GROUP BY p.id
        ORDER BY p.data_pedido DESC
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

// Cria um novo pedido com transação
function createPedido(pedido, res) {
    if (!pedido.clientes_id || !pedido.itens || !pedido.endereco_entrega) {
        return res.status(400).json({
            erro: 'Dados incompletos',
            detalhes: 'Cliente, itens e endereço são obrigatórios!'
        });
    }

    pedidosDB.serialize(() => {
        pedidosDB.run('BEGIN TRANSACTION');

        pedidosDB.run(
            `INSERT INTO pedidos (clientes_id, preco_total, endereco_entrega, data_pedido, status) 
             VALUES (?, ?, ?, ?, ?)`,
            [
                pedido.clientes_id,
                pedido.preco_total,
                pedido.endereco_entrega,
                new Date().toISOString(),
                'Pendente'
            ],
            function(err) {
                if (err) {
                    pedidosDB.run('ROLLBACK');
                    console.error("Erro ao inserir pedido:", err.message);
                    return res.status(500).json({
                        erro: 'Erro ao criar pedido',
                        detalhes: err.message
                    });
                }

                const pedidoId = this.lastID;
                let itensProcessados = 0;

                pedido.itens.forEach(item => {
                    pedidosDB.run(
                        `INSERT INTO itens_pedido (pedidos_id, produtos_id, quantidade, 
                                                 preco_unitario, subtotal)
                         VALUES (?, ?, ?, ?, ?)`,
                        [pedidoId, item.produtos_id, item.quantidade, 
                         item.preco_unitario, item.subtotal],
                        (err) => {
                            if (err) {
                                pedidosDB.run('ROLLBACK');
                                console.error("Erro ao inserir item:", err.message);
                                return res.status(500).json({
                                    erro: 'Erro ao inserir item do pedido',
                                    detalhes: err.message
                                });
                            }
                            
                            itensProcessados++;
                            if (itensProcessados === pedido.itens.length) {
                                pedidosDB.run('COMMIT');
                                res.status(201).json({
                                    mensagem: 'Pedido criado com sucesso',
                                    id: pedidoId
                                });
                            }
                        }
                    );
                });
            }
        );
    });
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
        `SELECT p.*, c.nome as cliente_nome, c.telefone as cliente_telefone, c.complemento
         FROM pedidos p
         JOIN clientes c ON p.clientes_id = c.id
         WHERE p.id = ?`,
        [id],
        async (err, pedido) => {
            if (err) {
                console.error("Erro ao buscar pedido:", err.message);
                return res.status(500).json({ 
                    erro: 'Erro ao buscar pedido', 
                    detalhes: err.message 
                });
            }
            if (!pedido) {
                return res.status(404).json({ 
                    sucesso: false,
                    mensagem: 'Pedido não encontrado' 
                });
            }

            // Buscar os itens do pedido
            pedidosDB.all(
                `SELECT ip.*, p.sabor, p.tamanho
                 FROM itens_pedido ip
                 JOIN produtos p ON ip.produtos_id = p.id
                 WHERE ip.pedidos_id = ?`,
                [id],
                (err, itens) => {
                    if (err) {
                        console.error("Erro ao buscar itens do pedido:", err.message);
                        return res.status(500).json({ 
                            erro: 'Erro ao buscar itens do pedido', 
                            detalhes: err.message 
                        });
                    }

                    // Montar objeto completo do pedido
                    const pedidoCompleto = {
                        ...pedido,
                        itens: itens
                    };

                    res.status(200).json({
                        sucesso: true,
                        dados: pedidoCompleto
                    });
                }
            );
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

// Atualiza o status de um pedido
function updateStatus(id, status, res) {
    pedidosDB.run(
        `UPDATE pedidos SET status = ? WHERE id = ?`,
        [status, id],
        function(err) {
            if (err) {
                console.error("Erro ao atualizar status do pedido:", err.message);
                return res.status(500).json({
                    erro: 'Erro ao atualizar status do pedido',
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
                mensagem: 'Status atualizado com sucesso'
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
    updatePedido,
    updateStatus
};