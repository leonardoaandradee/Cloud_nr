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
        
        // Ordenando os clientes por nome em ordem alfabética
        const sortedClients = clients.sort((a, b) => 
            a.nome.localeCompare(b.nome, 'pt-BR', { sensitivity: 'base' })
        );
        
        const clientsList = document.getElementById('clients-list');
        
        clientsList.innerHTML = sortedClients.length === 0 
            ? '<tr><td colspan="6">Nenhum cliente encontrado</td></tr>'
            : sortedClients.map(client => `
                <tr>
                    <td>${client.nome || ''}</td>
                    <td>${client.email || ''}</td>
                    <td>${client.telefone || ''}</td>
                    <td>${client.CEP || ''}</td>
                    <td>
                        ${client.rua || ''} ${client.complemento ? ', ' + client.complemento : ''}<br>
                        ${client.bairro ? client.bairro + ', ' : ''}${client.cidade || ''} - ${client.estado || ''}
                    </td>
                    <td>
                        <button onclick="editClient('${client.id}')" class="btn-small waves-effect waves-light green">
                            <i class="material-icons">edit</i>
                        </button>
                        <button onclick="deleteClient('${client.id}')" class="btn-small waves-effect waves-light red">
                            <i class="material-icons">delete</i>
                        </button>
                    </td>
                </tr>
            `).join('');
    } catch (error) {
        console.error('Erro ao carregar clientes:', error);
        M.toast({html: MENSAGENS.ERRO_CARREGAR});
        document.getElementById('clients-list').innerHTML = 
            '<tr><td colspan="6">Erro ao carregar clientes</td></tr>';
    }
}

async function buscarCep() {
    const cepInput = document.getElementById('clientCep');
    const cep = cepInput.value.replace(/\D/g, '');

    if (cep.length !== 8) {
        return;
    }

    try {
        const response = await fetch(`${CONFIG.API_URL}/viacep/${cep}`);
        const data = await response.json();

        if (data.erro) {
            M.toast({html: 'CEP não encontrado. Por favor, preencha os dados manualmente.'});
            return;
        }

        document.getElementById('clientRua').value = data.logradouro;
        document.getElementById('clientBairro').value = data.bairro;
        document.getElementById('clientCidade').value = data.localidade;
        document.getElementById('clientEstado').value = data.uf;
        
        M.updateTextFields();
    } catch (error) {
        console.error('Erro ao buscar CEP:', error);
        M.toast({html: 'Erro ao buscar CEP. Por favor, preencha os dados manualmente.'});
    }
}

async function saveClient() {
    const form = document.getElementById('registrationForm');
    const formData = {
        nome: form.nome.value.trim().toUpperCase(),
        email: form.email.value.trim().toLowerCase(),
        telefone: form.telefone.value.trim(),
        CEP: form.cep.value.trim(),
        rua: form.rua.value.trim().toUpperCase(),
        bairro: form.bairro.value.trim().toUpperCase(),
        cidade: form.cidade.value.trim().toUpperCase(),
        estado: form.estado.value.trim().toUpperCase(),
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
        form.rua.value = client.rua || '';
        form.bairro.value = client.bairro || '';
        form.cidade.value = client.cidade || '';
        form.estado.value = client.estado || '';
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
