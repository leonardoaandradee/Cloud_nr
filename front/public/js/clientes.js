const MENSAGENS = {
    ERRO_CARREGAR: 'Erro ao carregar clientes',
    ERRO_SALVAR: 'Erro ao salvar cliente',
    ERRO_DELETAR: 'Erro ao excluir cliente',
    ERRO_EDITAR: 'Erro ao carregar cliente para edição',
    CAMPOS_OBRIGATORIOS: 'Por favor, preencha os campos obrigatórios',
    SUCESSO_SALVAR: 'Cliente salvo com sucesso!',
    SUCESSO_DELETAR: 'Cliente excluído com sucesso!',
    CONFIRMA_DELETAR: 'Tem certeza que deseja excluir este cliente?'
};

let editingClientId = null;

async function loadClients() {
    try {
        const response = await fetch(`${CONFIG.API_URL}/clientes`);
        if (!response.ok) throw new Error(MENSAGENS.ERRO_CARREGAR);
        
        const { dados: clients = [] } = await response.json();
        const clientsList = document.getElementById('clients-list');
        
        clientsList.innerHTML = clients.length === 0 
            ? '<tr><td colspan="6">Nenhum cliente encontrado</td></tr>'
            : clients.map(client => `
                <tr>
                    <td>${client.nome}</td>
                    <td>${client.email || ''}</td>
                    <td>${client.telefone || ''}</td>
                    <td>${client.CEP || ''}</td>
                    <td>${client.complemento || ''}</td>
                    <td>
                        <button onclick="editClient(${client.id})" class="btn-small waves-effect waves-light green">
                            Editar<i class="material-icons">edit</i>
                        </button>
                        <button onclick="deleteClient(${client.id})" class="btn-small waves-effect waves-light red">
                            Deletar<i class="material-icons">delete</i>
                        </button>
                    </td>
                </tr>
            `).join('');
    } catch (error) {
        console.error(MENSAGENS.ERRO_CARREGAR, error);
        M.toast({html: MENSAGENS.ERRO_CARREGAR});
        document.getElementById('clients-list').innerHTML = 
            '<tr><td colspan="6">Erro ao carregar clientes</td></tr>';
    }
}

async function saveClient() {
    const form = document.getElementById('registrationForm');
    const formData = {
        nome: form.nome.value.trim().toUpperCase(),
        email: form.email.value.trim().toLowerCase(),
        telefone: form.telefone.value.trim(),
        CEP: form.cep.value.trim(),
        complemento: form.complemento.value.trim().toUpperCase()
    };

    if (!formData.nome || !formData.email || !formData.telefone) {
        M.toast({html: MENSAGENS.CAMPOS_OBRIGATORIOS});
        return;
    }

    try {
        const url = editingClientId 
            ? `${CONFIG.API_URL}/clientes/${editingClientId}`
            : `${CONFIG.API_URL}/clientes`;
            
        const response = await fetch(url, {
            method: editingClientId ? 'PUT' : 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.erro || MENSAGENS.ERRO_SALVAR);

        M.toast({html: data.mensagem || MENSAGENS.SUCESSO_SALVAR});
        form.reset();
        editingClientId = null;
        await loadClients();
    } catch (error) {
        console.error('Erro:', error);
        M.toast({html: error.message || MENSAGENS.ERRO_SALVAR});
    }
}

async function editClient(clientId) {
    try {
        const response = await fetch(`${CONFIG.API_URL}/clientes/${clientId}`);
        const data = await response.json();
        
        if (!response.ok) throw new Error(data.erro || MENSAGENS.ERRO_EDITAR);

        const client = data.dados;
        const form = document.getElementById('registrationForm');
        form.nome.value = client.nome;
        form.email.value = client.email || '';
        form.telefone.value = client.telefone;
        form.cep.value = client.CEP || '';
        form.complemento.value = client.complemento || '';
        
        editingClientId = clientId;
        M.updateTextFields();
    } catch (error) {
        console.error(MENSAGENS.ERRO_EDITAR, error);
        M.toast({html: error.message || MENSAGENS.ERRO_EDITAR});
    }
}

async function deleteClient(clientId) {
    if (!confirm(MENSAGENS.CONFIRMA_DELETAR)) return;
    
    try {
        const response = await fetch(`${CONFIG.API_URL}/clientes/${clientId}`, {
            method: 'DELETE'
        });
        
        const data = await response.json();
        if (!response.ok) throw new Error(data.erro || MENSAGENS.ERRO_DELETAR);

        M.toast({html: data.mensagem || MENSAGENS.SUCESSO_DELETAR});
        await loadClients();
    } catch (error) {
        console.error('Erro:', error);
        M.toast({html: error.message || MENSAGENS.ERRO_DELETAR});
    }
}

document.addEventListener('DOMContentLoaded', function() {
    loadClients();
});
