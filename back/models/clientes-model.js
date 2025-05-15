const clientesDB = require('../database/database-config');

// Busca todos os clientes
function getClientes(res) {
    clientesDB.all("SELECT * FROM clientes", [], (err, rows) => {
        if (err) {
            console.error("Erro ao buscar clientes:", err.message);
            return res.status(500).json({ 
                erro: 'Erro ao buscar clientes', 
                detalhes: err.message 
            });
        }
        res.status(200).json({
            sucesso: true,
            dados: rows
        });
    });
}

// Cria um novo cliente
function createCliente(cliente, res) {
    if (!cliente.nome || !cliente.telefone) {
        return res.status(400).json({        
            erro: 'Dados incompletos',
            detalhes: 'Nome e telefone são obrigatórios!'
        });
    }
    
    clientesDB.run(
        `INSERT INTO clientes (nome, email, telefone, CEP, rua, bairro, cidade, estado, complemento) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [cliente.nome, cliente.email, cliente.telefone, cliente.CEP, 
         cliente.rua, cliente.bairro, cliente.cidade, cliente.estado, cliente.complemento],
        function(err) {
            if (err) {
                console.error("Erro ao inserir cliente:", err.message);
                return res.status(500).json({
                    erro: 'Erro ao inserir cliente',
                    detalhes: err.message
                });
            }
            res.status(201).json({
                mensagem: 'Cliente criado com sucesso',
                id: this.lastID,
                cliente: cliente
            });
        }
    );
}

// Excluir um cliente
function deleteCliente(id, res) {
    clientesDB.run(
        "DELETE FROM clientes WHERE id = ?",
        [id],
        function(err) {
            if (err) {
                console.error("Erro ao excluir cliente:", err.message);
                return res.status(500).json({
                    erro: 'Erro ao excluir cliente',
                    detalhes: err.message
                });
            }
            if (this.changes === 0) {
                return res.status(404).json({
                    mensagem: 'Cliente não encontrado para exclusão'
                });
            }
            res.json({
                sucesso: true,
                mensagem: 'Cliente excluído com sucesso'
            });
        }
    );
}

// Busca um cliente específico por ID
function getClienteById(id, res) {
    clientesDB.get(
        "SELECT * FROM clientes WHERE id = ?",
        [id],
        (err, row) => {
            if (err) {
                console.error("Erro ao buscar cliente:", err.message);
                return res.status(500).json({ 
                    erro: 'Erro ao buscar cliente', 
                    detalhes: err.message 
                });
            }
            if (!row) {
                return res.status(404).json({ 
                    sucesso: false,
                    mensagem: 'Cliente não encontrado' 
                });
            }
            res.status(200).json({
                sucesso: true,
                dados: row
            });
        }
    );
}

// Busca um cliente específico por telefone
function getClienteByTelefone(telefone, res) {
    clientesDB.get(
        "SELECT * FROM clientes WHERE telefone = ?",
        [telefone],
        (err, row) => {
            if (err) {
                console.error("Erro ao buscar cliente:", err.message);
                return res.status(500).json({
                    sucesso: false,
                    erro: 'Erro ao buscar cliente',
                    detalhes: err.message
                });
            }
            if (!row) {
                return res.status(404).json({
                    sucesso: false,
                    mensagem: 'Cliente não encontrado'
                });
            }
            res.status(200).json({
                sucesso: true,
                dados: row
            });
        }
    );
}

// Atualiza um cliente
function updateCliente(id, cliente, res) {
    clientesDB.run(
        `UPDATE clientes SET nome = ?, email = ?, telefone = ?, CEP = ?, 
         rua = ?, bairro = ?, cidade = ?, estado = ?, complemento = ? 
         WHERE id = ?`,
        [cliente.nome, cliente.email, cliente.telefone, cliente.CEP,
         cliente.rua, cliente.bairro, cliente.cidade, cliente.estado, 
         cliente.complemento, id],
        function(err) {
            if (err) {
                console.error("Erro ao atualizar cliente:", err.message);
                return res.status(500).json({
                    erro: 'Erro ao atualizar cliente',
                    detalhes: err.message
                });
            }
            if (this.changes === 0) {
                return res.status(404).json({
                    sucesso: false,
                    mensagem: 'Cliente não encontrado para atualização'
                });
            }
            res.json({
                sucesso: true,
                mensagem: 'Cliente atualizado com sucesso',
                id: id
            });
        }
    );
}

// Exporta as funções para uso em outros módulos
module.exports = {
    getClientes,
    createCliente,
    deleteCliente,
    getClienteById,
    getClienteByTelefone,
    updateCliente
};