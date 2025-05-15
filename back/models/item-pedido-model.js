const db = require('../database/database-config');

class ItemPedidoModel {
    static criar(itemPedido, pedidoId) {
        return new Promise((resolve, reject) => {
            const sql = `
                INSERT INTO itens_pedido (
                    pedidos_id, produtos_id, quantidade, 
                    preco_unitario, subtotal
                ) VALUES (?, ?, ?, ?, ?)
            `;
            
            db.run(sql, [
                pedidoId,
                itemPedido.produtos_id,
                itemPedido.quantidade,
                itemPedido.preco_unitario,
                itemPedido.subtotal
            ], function(err) {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(this.lastID);
            });
        });
    }

    static buscarPorPedido(pedidoId) {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT ip.*, p.sabor, p.categoria, p.tamanho
                FROM itens_pedido ip
                JOIN produtos p ON p.id = ip.produtos_id
                WHERE ip.pedidos_id = ?
            `;
            
            db.all(sql, [pedidoId], (err, rows) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(rows);
            });
        });
    }

    static excluirPorPedido(pedidoId) {
        return new Promise((resolve, reject) => {
            const sql = `DELETE FROM itens_pedido WHERE pedidos_id = ?`;
            
            db.run(sql, [pedidoId], (err) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve();
            });
        });
    }
}

module.exports = ItemPedidoModel;
