const db = require('../database/database-config');

class HistoricoPedidosModel {
    // Adiciona um novo registro ao histórico
    static async adicionarAoHistorico(clienteId, pedidoId, produtosPedidos) {
        return new Promise((resolve, reject) => {
            const sql = `
                INSERT INTO historico_pedidos (cliente_id, pedido_id, data_pedido, produtos_pedidos)
                VALUES (?, ?, datetime('now'), ?)
            `;
            
            db.run(sql, [clienteId, pedidoId, JSON.stringify(produtosPedidos)], function(err) {
                if (err) reject(err);
                else resolve(this.lastID);
            });
        });
    }

    // Busca os últimos 5 pedidos de um cliente
    static async buscarUltimosPedidos(clienteId) {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT 
                    p.id,
                    p.data_pedido,
                    p.preco_total,
                    c.nome as cliente_nome,
                    json_group_array(
                        json_object(
                            'sabor', pr.sabor,
                            'quantidade', ip.quantidade,
                            'tamanho', pr.tamanho,
                            'preco', ip.preco_unitario
                        )
                    ) as produtos
                FROM pedidos p
                JOIN clientes c ON p.clientes_id = c.id
                JOIN itens_pedido ip ON p.id = ip.pedidos_id
                JOIN produtos pr ON ip.produtos_id = pr.id
                WHERE p.clientes_id = ?
                GROUP BY p.id
                ORDER BY p.data_pedido DESC
                LIMIT 5
            `;
            
            db.all(sql, [clienteId], (err, rows) => {
                if (err) {
                    console.error('Erro ao buscar histórico:', err);
                    reject(err);
                } else {
                    resolve(rows.map(row => ({
                        ...row,
                        produtos: JSON.parse(row.produtos)
                    })));
                }
            });
        });
    }
}

module.exports = HistoricoPedidosModel;
