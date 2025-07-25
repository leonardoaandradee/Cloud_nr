// Função utilitária para fetch autenticado com JWT
async function fetchJWT(url, options = {}) {
    const token = localStorage.getItem('token');
    options.headers = options.headers || {};
    options.headers['Authorization'] = `Bearer ${token}`;
    return fetch(url, options);
}

function tratar401(response) {
    if (response.status === 401) {
        window.location.href = '/login';
        return true;
    }
    return false;
}

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
        const response = await fetchJWT(`${CONFIG.API_URL}/clientes`);
        if (tratar401(response)) return;
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
                        <button onclick="showClientHistory('${client.id}')" class="btn-small waves-effect waves-light blue">
                            <i class="material-icons">history</i>
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
            Swal.fire({
                title: 'CEP não encontrado',
                text: 'Por favor, insira os dados manualmente.',
                icon: 'warning'
            });
            return;
        }

        document.getElementById('clientRua').value = data.logradouro;
        document.getElementById('clientBairro').value = data.bairro;
        document.getElementById('clientCidade').value = data.localidade;
        document.getElementById('clientEstado').value = data.uf;
        M.updateTextFields();
    } catch (error) {
        console.error('Erro ao buscar CEP:', error);
        const modalInstance = M.Modal.getInstance(document.getElementById('modalCepNaoEncontrado'));
        modalInstance.open();
        Swal.fire({
            title: 'Erro',
            text: 'Não foi possível buscar o CEP. Por favor, insira os dados manualmente.',
            icon: 'error'
        });
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
            
        const response = await fetchJWT(url, {
            method: editingClientId ? 'PUT' : 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        if (tratar401(response)) return;

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
        const response = await fetchJWT(`${CONFIG.API_URL}/clientes/${clientId}`);
        if (tratar401(response)) return;
        if (!response.ok) throw new Error(MENSAGENS.ERRO_EDITAR);

        const data = await response.json();
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
        // Carregar histórico de pedidos do cliente
        await loadClientOrders(clientId);
    } catch (error) {
        console.error(MENSAGENS.ERRO_EDITAR, error);
        M.toast({html: error.message || MENSAGENS.ERRO_EDITAR});
    }
}

// Função para buscar e exibir histórico de pedidos do cliente
async function loadClientOrders(clientId) {
    let ordersDiv = document.getElementById('client-orders-list');
    if (!ordersDiv) {
        // Cria a div se não existir
        ordersDiv = document.createElement('div');
        ordersDiv.id = 'client-orders-list';
        // Insere após o formulário de edição
        const form = document.getElementById('registrationForm');
        form.parentNode.insertBefore(ordersDiv, form.nextSibling);
    }
    ordersDiv.innerHTML = '<p>Carregando histórico de pedidos...</p>';
    try {
        const response = await fetchJWT(`${CONFIG.API_URL}/pedidos?clienteId=${clientId}`);
        if (tratar401(response)) return;
        if (!response.ok) throw new Error('Erro ao carregar pedidos do cliente');
        const { dados: pedidos = [] } = await response.json();
        if (pedidos.length === 0) {
            ordersDiv.innerHTML = '<p>Nenhum pedido encontrado para este cliente.</p>';
            return;
        }
        ordersDiv.innerHTML = `<h6>Histórico de Pedidos</h6><table class="striped"><thead><tr><th>ID</th><th>Data</th><th>Total</th><th>Status</th></tr></thead><tbody>${pedidos.map(p => `
            <tr>
                <td>${p.id}</td>
                <td>${p.data ? new Date(p.data).toLocaleString('pt-BR') : ''}</td>
                <td>R$ ${p.preco_total ? p.preco_total.toFixed(2) : ''}</td>
                <td>${p.status || ''}</td>
            </tr>`).join('')}</tbody></table>`;
    } catch (error) {
        ordersDiv.innerHTML = '<p>Erro ao carregar histórico de pedidos.</p>';
    }
}

async function deleteClient(clientId) {
    const result = await Swal.fire({
        title: 'Confirmar exclusão',
        text: 'Tem certeza que deseja excluir este cliente?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sim, excluir!',
        cancelButtonText: 'Cancelar'
    });
    if (!result.isConfirmed) return;
    try {
        const response = await fetchJWT(`${CONFIG.API_URL}/clientes/${clientId}`, {
            method: 'DELETE'
        });

        if (tratar401(response)) return;

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.erro || MENSAGENS.ERRO_DELETAR);
        }
        const data = await response.json();
        M.toast({html: data.mensagem || MENSAGENS.SUCESSO_DELETAR});
        Swal.fire({
            title: 'Sucesso!',
            text: data.mensagem || MENSAGENS.SUCESSO_DELETAR,
            icon: 'success'
        });
        await loadClients();
    } catch (error) {
        console.error('Erro:', error);
        M.toast({html: error.message || MENSAGENS.ERRO_DELETAR});
        Swal.fire({
            title: 'Erro!',
            text: error.message || MENSAGENS.ERRO_DELETAR,
            icon: 'error'
        });
    }
}

async function showClientHistory(clientId) {
    try {
        const response = await fetchJWT(`${CONFIG.API_URL}/clientes/${clientId}/historico`);
        if (tratar401(response)) return;
        if (!response.ok) throw new Error('Erro ao carregar histórico');
        const data = await response.json();
        if (!data.sucesso) {
            throw new Error(data.erro || 'Erro ao carregar histórico');
        }
        const historicoList = document.getElementById('historicoList');
        const clienteNome = document.getElementById('clienteHistoricoNome');
        clienteNome.textContent = `Cliente: ${data.cliente_nome}`;
        if (data.historico && data.historico.length > 0) {
            historicoList.innerHTML = data.historico.map(pedido => `
                <tr>
                    <td>${new Date(pedido.data_pedido).toLocaleDateString('pt-BR')} ${new Date(pedido.data_pedido).toLocaleTimeString('pt-BR')}</td>
                    <td>${pedido.produtos.map(p => 
                        `${p.sabor} (${p.quantidade}x - ${p.tamanho})`
                    ).join(', ')}</td>
                    <td>R$ ${Number(pedido.preco_total).toFixed(2)}</td>
                </tr>
            `).join('');
        } else {
            historicoList.innerHTML = '<tr><td colspan="3" class="center-align">Cliente sem pedidos registrados</td></tr>';
        }
        const modal = M.Modal.getInstance(document.getElementById('modalHistoricoPedidos'));
        modal.open();
    } catch (error) {
        console.error('Erro ao carregar histórico:', error);
        M.toast({html: 'Erro ao carregar histórico de pedidos'});
        Swal.fire({
            title: 'Erro!',
            text: error.message || 'Erro ao carregar histórico de pedidos',
            icon: 'error'
        });
    }
}

// Função para alternar a visibilidade da lista de clientes
function toggleClientListVisibility() {
    const clientsTableSection = document.getElementById('clientsTableSection');
    const visibilityIcon = document.getElementById('visibilityIcon');
    const visibilityText = document.getElementById('visibilityText');
    
    // Alternar visibilidade
    if (clientsTableSection.style.display === 'none') {
        clientsTableSection.style.display = 'block';
        visibilityIcon.textContent = 'visibility';
        visibilityText.textContent = 'Ocultar';
    } else {
        clientsTableSection.style.display = 'none';
        visibilityIcon.textContent = 'visibility_off';
        visibilityText.textContent = 'Exibir';
    }
}

document.addEventListener('DOMContentLoaded', function() {
    loadClients();
    const modalElem = document.getElementById('modalCepNaoEncontrado');
    M.Modal.init(modalElem);
    const modalHistorico = document.getElementById('modalHistoricoPedidos');
    M.Modal.init(modalHistorico);
    // Implementação da máscara de telefone
    const phoneInput = document.getElementById('clientPhone');
    if (phoneInput) {
        IMask(phoneInput, { mask: '+55 (00) 0 0000-0000' });
    }
    // Implementação da máscara de CEP
    const cepInput = document.getElementById('clientCep');
    if (cepInput) {
        IMask(cepInput, { mask: '00000-000' });
    }
});
