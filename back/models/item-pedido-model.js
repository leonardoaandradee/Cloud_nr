// Importação da configuração do banco de dados
const db = require('../database/database-config');

// Classe responsável por gerenciar operações de itens do pedido no banco de dados
class ItemPedidoModel {
    // Cria um novo item de pedido associado a um pedido específico
    static criar(itemPedido, pedidoId) {
        return new Promise((resolve, reject) => {
            // Query SQL para inserir um novo item de pedido
            const sql = `
                INSERT INTO itens_pedido (
                    pedidos_id,
                    produtos_id,
                    quantidade, 
                    preco_unitario,
                    subtotal
                ) VALUES (?, ?, ?, ?, ?)
            `;
            
            // Executa a query com os parâmetros fornecidos
            db.run(
                sql,
                [
                    pedidoId,
                    itemPedido.produtos_id,
                    itemPedido.quantidade,
                    itemPedido.preco_unitario,
                    itemPedido.subtotal
                ],
                function(err) {
                    if (err) {
                        reject(err);
                        return;
                    }
                    resolve(this.lastID);
                }
            );
        });
    }

    // Busca todos os itens associados a um pedido específico, incluindo informações do produto
    static buscarPorPedido(pedidoId) {
        return new Promise((resolve, reject) => {
            // Query SQL para buscar itens de pedido e informações do produto
            const sql = `
                SELECT ip.*, p.sabor, p.categoria, p.tamanho
                FROM itens_pedido ip
                JOIN produtos p ON p.id = ip.produtos_id
                WHERE ip.pedidos_id = ?
            `;
            
            // Executa a query com o ID do pedido fornecido
            db.all(sql, [pedidoId], (err, rows) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(rows);
            });
        });
    }

    // Remove todos os itens associados a um pedido específico
    static excluirPorPedido(pedidoId) {
        return new Promise((resolve, reject) => {
            // Query SQL para excluir itens de pedido pelo ID do pedido
            const sql = `DELETE FROM itens_pedido WHERE pedidos_id = ?`;
            
            // Executa a query com o ID do pedido fornecido
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

// Exporta a classe para uso em outros módulos
module.exports = ItemPedidoModel;
