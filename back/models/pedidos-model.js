const pedidosDB = require('../database/database-config');

// Busca todos os pedidos
function getPedidos(res) {
    pedidosDB.all(`
        SELECT 
            p.id,
            p.data_pedido,
            p.preco_total,
            p.endereco_entrega,
            p.status,
            c.nome as cliente_nome,
            c.telefone as cliente_telefone,
            GROUP_CONCAT(
                pr.id || '|' || pr.sabor || '|' || pr.tamanho || '|' || ip.quantidade || '|' || ip.preco_unitario || '|' || ip.subtotal,
                ';'
            ) as itens_concat
        FROM pedidos p
        LEFT JOIN clientes c ON p.clientes_id = c.id
        LEFT JOIN itens_pedido ip ON p.id = ip.pedidos_id
        LEFT JOIN produtos pr ON ip.produtos_id = pr.id
        GROUP BY p.id
        ORDER BY p.data_pedido DESC
    `, [], (err, rows) => {
        if (err) {
            console.error("Erro ao buscar pedidos:", err.message);
            return res.status(500).json({ 
                sucesso: false,
                erro: 'Erro ao buscar pedidos', 
                detalhes: err.message 
            });
        }
        // Transformar itens_concat em array de objetos
        const pedidos = rows.map(row => {
            let itens = [];
            if (row.itens_concat) {
                itens = row.itens_concat.split(';').map(str => {
                    const [produtos_id, sabor, tamanho, quantidade, preco_unitario, subtotal] = str.split('|');
                    return {
                        produtos_id: Number(produtos_id),
                        sabor,
                        tamanho,
                        quantidade: Number(quantidade),
                        preco_unitario: Number(preco_unitario),
                        subtotal: Number(subtotal)
                    };
                });
            }
            return {
                id: row.id,
                data_pedido: row.data_pedido,
                preco_total: row.preco_total,
                endereco_entrega: row.endereco_entrega,
                status: row.status,
                cliente_nome: row.cliente_nome,
                cliente_telefone: row.cliente_telefone,
                itens
            };
        });
        res.status(200).json({
            sucesso: true,
            dados: pedidos
        });
    });
}

// Cria um novo pedido com transação
function createPedido(pedido, res) {
    if (!pedido.clientes_id || !pedido.itens || !pedido.endereco_entrega) {
        return res.status(400).json({
            sucesso: false,
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
                pedido.status || 'Pendente'
            ],
            function(err) {
                if (err) {
                    pedidosDB.run('ROLLBACK');
                    console.error("Erro ao inserir pedido:", err.message);
                    return res.status(500).json({
                        sucesso: false,
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
                                    sucesso: false,
                                    erro: 'Erro ao inserir item do pedido',
                                    detalhes: err.message
                                });
                            }
                            
                            itensProcessados++;
                            if (itensProcessados === pedido.itens.length) {
                                pedidosDB.run('COMMIT');
                                res.status(201).json({
                                    sucesso: true,
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
    pedidosDB.serialize(() => {
        pedidosDB.run('BEGIN TRANSACTION');

        pedidosDB.run(
            `UPDATE pedidos 
             SET clientes_id = ?,
                 preco_total = ?, 
                 endereco_entrega = ?, 
                 status = ?
             WHERE id = ?`,
            [pedido.clientes_id, pedido.preco_total, pedido.endereco_entrega, 
             pedido.status || 'Pendente', id],
            function(err) {
                if (err) {
                    pedidosDB.run('ROLLBACK');
                    console.error("Erro ao atualizar pedido:", err.message);
                    return res.status(500).json({
                        sucesso: false,
                        erro: 'Erro ao atualizar pedido',
                        detalhes: err.message
                    });
                }

                // Se houver itens para atualizar
                if (pedido.itens && pedido.itens.length > 0) {
                    // Primeiro, remove todos os itens antigos
                    pedidosDB.run(
                        "DELETE FROM itens_pedido WHERE pedidos_id = ?",
                        [id],
                        (err) => {
                            if (err) {
                                pedidosDB.run('ROLLBACK');
                                return res.status(500).json({
                                    sucesso: false,
                                    erro: 'Erro ao atualizar itens do pedido',
                                    detalhes: err.message
                                });
                            }

                            // Depois, insere os novos itens
                            let itensProcessados = 0;
                            pedido.itens.forEach(item => {
                                pedidosDB.run(
                                    `INSERT INTO itens_pedido (pedidos_id, produtos_id, quantidade, 
                                                             preco_unitario, subtotal)
                                     VALUES (?, ?, ?, ?, ?)`,
                                    [id, item.produtos_id, item.quantidade, 
                                     item.preco_unitario, item.subtotal],
                                    (err) => {
                                        if (err) {
                                            pedidosDB.run('ROLLBACK');
                                            return res.status(500).json({
                                                sucesso: false,
                                                erro: 'Erro ao inserir novo item',
                                                detalhes: err.message
                                            });
                                        }
                                        
                                        itensProcessados++;
                                        if (itensProcessados === pedido.itens.length) {
                                            pedidosDB.run('COMMIT');
                                            res.json({
                                                sucesso: true,
                                                mensagem: 'Pedido atualizado com sucesso',
                                                id: id
                                            });
                                        }
                                    }
                                );
                            });
                        }
                    );
                } else {
                    pedidosDB.run('COMMIT');
                    res.json({
                        sucesso: true,
                        mensagem: 'Pedido atualizado com sucesso',
                        id: id
                    });
                }
            }
        );
    });
}

// Atualiza o status de um pedido
function updateStatus(id, status, res) {
    console.log('Recebendo requisição de atualização:', { id, status }); // Debug

    // Validar o status
    const statusValidos = ['Pendente', 'Em Preparo', 'Saiu para Entrega', 'Entregue', 'Cancelado'];
    if (!statusValidos.includes(status)) {
        return res.status(400).json({
            sucesso: false,
            mensagem: `Status inválido. Deve ser um dos seguintes: ${statusValidos.join(', ')}`
        });
    }

    pedidosDB.run(
        `UPDATE pedidos SET status = ? WHERE id = ?`,
        [status, id],
        function(err) {
            if (err) {
                console.error('Erro SQL ao atualizar status:', err);
                return res.status(500).json({
                    sucesso: false,
                    mensagem: 'Erro ao atualizar status do pedido'
                });
            }

            if (this.changes === 0) {
                return res.status(404).json({
                    sucesso: false,
                    mensagem: 'Pedido não encontrado'
                });
            }

            console.log('Status atualizado com sucesso:', { id, status }); // Debug
            return res.status(200).json({
                sucesso: true,
                mensagem: 'Status atualizado com sucesso',
                pedido: { id, status }
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