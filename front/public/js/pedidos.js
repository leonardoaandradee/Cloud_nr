/**
 * Gerenciamento do formulário de pedidos
 * Inclui funcionalidades de busca de clientes, produtos e criação de pedidos
 */

// Inicialização do documento
document.addEventListener('DOMContentLoaded', function() {
    inicializarComponentes();
    configurarEventListeners();
    // Inicializar modals
    var modals = document.querySelectorAll('.modal');
    M.Modal.init(modals);
    
    // Carregar clientes para o cache
    carregarClientes();
});

// Cache de dados global
let clientesData = {};
let clientesIds = [];
let produtosData = {};
let map = null;
let marker = null;
let editandoPedidoId = null; // Adicionar variável global para controle de edição

/**
 * Funções de inicialização
 */
function inicializarComponentes() {
    M.FormSelect.init(document.querySelectorAll('select'));
    carregarClientes();
    carregarProdutos();
    carregarPedidos(); // Garantir que esta linha está presente
}

function configurarEventListeners() {
    const phoneInput = document.getElementById('phoneSearch');
    phoneInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            buscarCliente();
        }
    });
    
    document.getElementById('orderForm').addEventListener('submit', async function(e) {
        e.preventDefault();

        const telefone = document.getElementById('phoneSearch').value.trim();
        if (!telefone) {
            Swal.fire({
                icon: 'error',
                title: 'Campo Obrigatório',
                text: 'Por favor, informe o telefone do cliente!',
                confirmButtonColor: '#900404'
            });
            return;
        }

        // Validar se há itens no pedido
        const items = document.querySelectorAll('.produto-item');
        let hasValidItems = false;

        items.forEach(item => {
            const sabor = item.querySelector('.sabor-select').value;
            const quantidade = item.querySelector('.quantidade').value;
            if (sabor && quantidade > 0) {
                hasValidItems = true;
            }
        });

        if (!hasValidItems) {
            Swal.fire({
                icon: 'error',
                title: 'Pedido Incompleto',
                text: 'Por favor, adicione pelo menos um item ao pedido!',
                confirmButtonColor: '#900404'
            });
            return;
        }

        // Validar endereço de entrega
        const endereco = document.getElementById('endereco').value;
        if (!endereco) {
            Swal.fire({
                icon: 'error',
                title: 'Campo Obrigatório',
                text: 'Por favor, selecione o endereço de entrega!',
                confirmButtonColor: '#900404'
            });
            return;
        }

        confirmarPedido();
    });
}

async function carregarClientes() {
    try {
        console.log('Iniciando carregamento de clientes...');
        const response = await fetch(`${CONFIG.API_URL}/clientes`);
        console.log('Response status:', response.status);
        
        if (!response.ok) throw new Error('Erro ao carregar clientes');
        
        const json = await response.json();
        console.log('Dados recebidos da API:', json);
        
        processarDadosClientes(json);
    } catch (error) {
        console.error('Erro ao carregar clientes:', error);
        Swal.fire({
            title: 'Erro!',
            text: 'Erro ao carregar clientes: ' + error.message,
            icon: 'error'
        });
    }
}

function processarDadosClientes(json) {
    const { dados } = json;
    if (!Array.isArray(dados)) throw new Error('Formato de dados inválido');
    
    clientesData = {};
    clientesIds = [];
    
    dados.forEach(cliente => {
        clientesIds.push(cliente.id);
        clientesData[cliente.id] = {
            id: cliente.id,
            nome: cliente.nome,
            telefone: cliente.telefone,
            rua: cliente.rua,
            bairro: cliente.bairro,
            cidade: cliente.cidade,
            estado: cliente.estado,
            complemento: cliente.complemento
        };
    });
    
    console.log('Cache de clientes atualizado:', clientesData);
    console.log('Total de clientes carregados:', clientesIds.length);
}

async function carregarProdutos() {
    try {
        const response = await fetch(`${CONFIG.API_URL}/produtos`);
        const data = await response.json();
        produtosData = data.dados;
        atualizarSelectsProdutos();
    } catch (error) {
        console.error('Erro ao carregar produtos:', error);
        Swal.fire({
            title: 'Erro!',
            text: 'Erro ao carregar produtos',
            icon: 'error'
        });
    }
}

// Ajustar a função carregarPedidos para garantir que está formatando os dados corretamente
async function carregarPedidos() {
    try {
        const response = await fetch(`${CONFIG.API_URL}/pedidos`);
        const data = await response.json();
        
        if (!data.sucesso) {
            throw new Error('Erro ao carregar pedidos');
        }

        const tbody = document.getElementById('pedidos-list');
        tbody.innerHTML = '';

        if (!data.dados || data.dados.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="center-align">Nenhum pedido encontrado</td></tr>';
            return;
        }

        const pedidosOrdenados = data.dados.sort((a, b) => 
            new Date(b.data_pedido) - new Date(a.data_pedido)
        );

        pedidosOrdenados.forEach(pedido => {
            // Formatar a descrição dos itens
            const descricaoItens = Array.isArray(pedido.itens) && pedido.itens.length > 0
                ? pedido.itens.map(item => 
                    `${item.sabor} (${item.quantidade}x - ${item.tamanho})`
                  ).join(', ')
                : 'Sem itens';

            const dataHora = formatarDataPedido(pedido.data_pedido);

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>
                    <i class="material-icons" style="vertical-align: middle; color: #900404; margin-right: 5px;">assignment</i>
                    <a href="#" onclick="mostrarDetalhesPedido(${pedido.id}); return false;" 
                       class="blue-text text-darken-2">
                        <b>Nº ${pedido.id}</b>
                    </a>
                </td>
                <td>${dataHora}</td>
                <td>
                    <b>${pedido.cliente_nome || 'Não informado'}</b><br>
                    <small>Tel: ${pedido.cliente_telefone || 'N/A'}</small>
                </td>
                <td>
                    <div style="max-width: 300px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                        ${descricaoItens}
                    </div>
                </td>
                <td>
                    <select class="browser-default status-select" 
                            onchange="atualizarStatus(${pedido.id}, this.value)">
                        ${gerarOpcoesStatus(pedido.status || 'Pendente')}
                    </select>
                </td>
                <td class="pedido-acoes center-align">
                    <button class="btn-small waves-effect waves-light green" 
                            onclick="editarPedido(${pedido.id})">
                        <i class="material-icons">edit</i>
                    </button>
                    <button class="btn-small waves-effect waves-light red" 
                            onclick="deletarPedido(${pedido.id})">
                        <i class="material-icons">delete</i>
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });

        // Reinicializar selects do Materialize
        M.FormSelect.init(document.querySelectorAll('.status-select'));
    } catch (error) {
        console.error('Erro ao carregar pedidos:', error);
        Swal.fire({
            title: 'Erro!',
            text: 'Erro ao carregar pedidos',
            icon: 'error'
        });
    }
}

// Adicionar função auxiliar para formatar descrição do pedido
function formatarDescricaoPedido(itens) {
    if (!itens || !Array.isArray(itens) || itens.length === 0) {
        return 'Sem itens';
    }
    return itens.map(item => 
        `${item.sabor || 'N/A'} (${item.quantidade || 0}x - ${item.tamanho || 'N/A'})`
    ).join(', ');
}

async function mostrarDetalhesPedido(pedidoId) {
    try {
        console.log('Buscando detalhes do pedido:', pedidoId);
        const response = await fetch(`${CONFIG.API_URL}/pedidos/${pedidoId}`);
        const data = await response.json();
        
        if (!data.sucesso) throw new Error('Erro ao carregar dados do pedido');

        const pedido = data.dados;
        console.log('Dados do pedido recebidos:', pedido);

        // Formatar data e hora
        const dataHora = formatarDataPedido(pedido.data_pedido);

        // Preencher dados no modal
        document.getElementById('numeroPedido').textContent = pedido.id;
        document.getElementById('modalDataHora').textContent = dataHora;
        document.getElementById('modalClienteNome').textContent = pedido.cliente_nome || 'N/A';
        document.getElementById('modalClienteTelefone').textContent = pedido.cliente_telefone || 'N/A';
        document.getElementById('modalClienteEndereco').textContent = pedido.endereco_entrega || 'N/A';
        document.getElementById('modalClienteComplemento').textContent = pedido.complemento || 'Sem complemento';
        document.getElementById('modalTotalPedido').textContent = pedido.preco_total.toFixed(2);

        // Preencher tabela de itens
        const tbody = document.getElementById('modalItensPedido');
        tbody.innerHTML = '';
        
        if (Array.isArray(pedido.itens)) {
            pedido.itens.forEach(item => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${item.sabor || 'N/A'}</td>
                    <td>${item.tamanho || 'N/A'}</td>
                    <td>${item.quantidade}</td>
                    <td>R$ ${Number(item.preco_unitario).toFixed(2)}</td>
                    <td>R$ ${Number(item.subtotal).toFixed(2)}</td>
                `;
                tbody.appendChild(tr);
            });
        }

        // Inicializar e abrir o modal
        const modalElement = document.getElementById('detalhePedidoModal');
        const modalInstance = M.Modal.init(modalElement, {
            dismissible: true,
            opacity: 0.5,
            inDuration: 250,
            outDuration: 250,
            startingTop: '4%',
            endingTop: '10%'
        });
        modalInstance.open();

    } catch (error) {
        console.error('Erro ao carregar detalhes do pedido:', error);
        Swal.fire({
            title: 'Erro!',
            text: 'Erro ao carregar detalhes do pedido',
            icon: 'error'
        });
    }
}

async function atualizarStatus(pedidoId, novoStatus) {
    try {
        // Mostrar indicador de carregamento
        Swal.fire({
            title: 'Atualizando status...',
            text: 'Por favor, aguarde.',
            icon: 'info',
            showConfirmButton: false,
            timer: 1500
        });
        
        // Fazer a atualização apenas do status
        const response = await fetch(`${CONFIG.API_URL}/pedidos/${pedidoId}`, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status: novoStatus })
        });

        if (!response.ok) {
            throw new Error('Erro ao atualizar status');
        }

        const data = await response.json();
        
        if (!data.sucesso) {
            throw new Error(data.mensagem || 'Erro ao atualizar status');
        }
        
        Swal.fire({
            title: 'Sucesso!',
            text: 'Status atualizado com sucesso!',
            icon: 'success'
        });
        await carregarPedidos(); // Recarrega a lista
    } catch (error) {
        console.error('Erro ao atualizar status:', error);
        Swal.fire({
            title: 'Erro!',
            text: error.message,
            icon: 'error'
        });
    }
}

async function deletarPedido(pedidoId) {
    const result = await Swal.fire({
        title: 'Confirmar exclusão',
        text: 'Tem certeza que deseja excluir este pedido?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sim, excluir!',
        cancelButtonText: 'Cancelar'
    });

    if (!result.isConfirmed) return;

    try {
        const response = await fetch(`${CONFIG.API_URL}/pedidos/${pedidoId}`, {
            method: 'DELETE'
        });

        if (!response.ok) throw new Error('Erro ao deletar pedido');

        Swal.fire({
            title: 'Sucesso!',
            text: 'Pedido deletado com sucesso!',
            icon: 'success'
        });
        carregarPedidos();
    } catch (error) {
        console.error('Erro ao deletar pedido:', error);
        Swal.fire({
            title: 'Erro!',
            text: 'Erro ao deletar pedido',
            icon: 'error'
        });
    }
}

/**
 * Funções de manipulação de pedidos
 */
async function buscarCliente() {
    const telefoneInput = document.getElementById('phoneSearch').value.trim();
    // Normaliza para comparar apenas os números finais (11 dígitos)
    const telefone = telefoneInput.replace(/\D/g, '').slice(-11);

    console.log('Buscando cliente com telefone:', telefoneInput);

    if (!telefone) {
        Swal.fire({
            title: 'Erro!',
            text: 'Por favor, insira um telefone',
            icon: 'error'
        });
        return;
    }

    try {
        // Busca por telefone normalizado
        const clienteEncontrado = Object.values(clientesData).find(
            cliente => (cliente.telefone || '').replace(/\D/g, '').slice(-11) === telefone
        );

        if (!clienteEncontrado) {
            throw new Error('Cliente não encontrado');
        }

        await buscarDadosAtualizadosCliente(clienteEncontrado);
    } catch (error) {
        tratarErrosBuscaCliente(error);
    }
}

async function buscarDadosAtualizadosCliente(clienteEncontrado) {
    try {
        const response = await fetch(`${CONFIG.API_URL}/clientes/${clienteEncontrado.id}`);
        
        if (!response.ok) {
            throw new Error('Erro ao buscar dados do cliente');
        }

        const json = await response.json();
        
        if (!json.sucesso || !json.dados) {
            throw new Error('Dados do cliente não encontrados');
        }

        clientesData[clienteEncontrado.id] = json.dados;
        exibirDadosCliente(json.dados);
    } catch (error) {
        console.error('Erro ao buscar dados atualizados do cliente:', error);
        limparDadosCliente();
        Swal.fire({
            title: 'Erro!',
            text: error.message,
            icon: 'error'
        });
    }
}

function tratarErrosBuscaCliente(error) {
    console.error('Erro ao buscar cliente:', error);
    limparDadosCliente();
    Swal.fire({
        title: 'Erro!',
        text: error.message,
        icon: 'error'
    });
}

async function exibirDadosCliente(cliente) {
    const clienteInfo = document.getElementById('clienteInfo');
    const mapCard = document.getElementById('mapCard');
    clienteInfo.style.display = 'block';
    mapCard.style.display = 'block';
    
    document.getElementById('clienteNome').textContent = cliente.nome;
    document.getElementById('clienteTelefone').textContent = cliente.telefone;
    
    const endereco = formatarEnderecoCompleto(cliente);
    document.getElementById('clienteEndereco').textContent = endereco;
    if (cliente.complemento) {
        document.getElementById('clienteComplemento').textContent = cliente.complemento;
    } else {
        document.getElementById('clienteComplemento').textContent = 'Sem complemento';
    }

    const enderecoSelect = document.getElementById('endereco');
    enderecoSelect.innerHTML = `
        <option value="${endereco}" selected>${endereco}</option>
    `;
    M.FormSelect.init(enderecoSelect);
    
    Swal.fire({
        title: 'Sucesso!',
        text: 'Cliente encontrado!',
        icon: 'success'
    });

    // Geocodificar e exibir mapa
    await exibirMapa(cliente);
}

async function exibirMapa(cliente) {
    try {
        const endereco = `${cliente.rua}, ${cliente.bairro}, ${cliente.cidade}, ${cliente.estado}`;
        const coordenadas = await geocodificarEndereco(endereco);
        
        const mapCard = document.getElementById('mapCard');
        
        if (!map) {
            map = L.map('map');
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors'
            }).addTo(map);
        }

        map.setView([coordenadas.lat, coordenadas.lon], 16);

        if (marker) {
            marker.remove();
        }
        
        marker = L.marker([coordenadas.lat, coordenadas.lon]).addTo(map);
        marker.bindPopup(endereco).openPopup();
        
        // Garantir que o mapa está visível
        mapCard.style.display = 'block';
        document.getElementById('map').style.display = 'block';
        
    } catch (error) {
        console.error('Erro ao exibir mapa:', error);
        const mapCard = document.getElementById('mapCard');
        // Exibir mensagem de erro no card
        mapCard.innerHTML = `
            <div class="center-align" style="padding: 20px; height: 100%;">
                <i class="material-icons medium" style="color: #900404">location_off</i>
                <p style="color: #666;">Não foi possível apresentar o mapa de localização aproximada do cliente através do CEP informado.</p>
            </div>
        `;
        mapCard.style.display = 'block';
        Swal.fire({
            title: 'Erro!',
            text: 'Erro ao carregar o mapa',
            icon: 'error'
        });
    }
}

async function geocodificarEndereco(endereco) {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(endereco)}`;
    
    try {
        const response = await fetch(url);
        const data = await response.json();
        
        if (data && data.length > 0) {
            return {
                lat: parseFloat(data[0].lat),
                lon: parseFloat(data[0].lon)
            };
        }
        throw new Error('Endereço não encontrado');
    } catch (error) {
        throw new Error('Erro na geocodificação: ' + error.message);
    }
}

function formatarEnderecoCompleto(cliente) {
    const componentes = [];
    
    if (cliente.rua) componentes.push(cliente.rua);
    if (cliente.bairro) componentes.push(cliente.bairro);
    if (cliente.cidade) componentes.push(cliente.cidade);
    if (cliente.estado) componentes.push(cliente.estado);
    
    return componentes.length > 0 ? componentes.join(', ') : 'Endereço não disponível';
}

function limparDadosCliente() {
    const clienteInfo = document.getElementById('clienteInfo');
    clienteInfo.style.display = 'none';
    document.getElementById('clienteNome').textContent = '';
    document.getElementById('clienteTelefone').textContent = '';
    document.getElementById('clienteEndereco').textContent = '';
    document.getElementById('clienteComplemento').textContent = '';
    document.getElementById('endereco').innerHTML = '<option value="" disabled selected>Selecione o endereço de entrega</option>';
    M.FormSelect.init(document.getElementById('endereco'));
    const mapCard = document.getElementById('mapCard');
    mapCard.style.display = 'none';
    if (map) {
        map.remove();
        map = null;
        marker = null;
    }
}

function removeProduto(element) {
    if (document.querySelectorAll('.produto-item').length > 1) {
        element.closest('.produto-item').remove();
        calcularTotal();
    } else {
        Swal.fire({
            title: 'Erro!',
            text: 'O pedido deve ter pelo menos um item',
            icon: 'error'
        });
    }
}

function adicionarProdutoRow() {
    const container = document.getElementById('produtosList');
    const novoProduto = document.querySelector('.produto-item').cloneNode(true);
    
    // Limpar valores dos inputs do novo item
    novoProduto.querySelectorAll('input').forEach(input => {
        if (input.type === 'number') {
            input.value = '1';
        } else {
            input.value = '';
        }
        // Remover placeholder e label para os novos itens
        input.removeAttribute('placeholder');
        const label = input.nextElementSibling;
        if (label && label.tagName === 'LABEL') {
            label.remove();
        }
    });
    
    // Resetar apenas os selects do novo item
    novoProduto.querySelectorAll('select').forEach(select => {
        select.selectedIndex = 0;
    });
    
    container.appendChild(novoProduto);
    
    // Atualizar apenas os selects do novo item
    const novoItem = container.lastElementChild;
    configurarSelectsProduto(novoItem);
    
    calcularTotal();
}

function calcularSubtotal(row) {
    const quantidade = parseInt(row.querySelector('.quantidade').value) || 0;
    const tamanhoSelect = row.querySelector('.tamanho-select');
    const precoUnitario = row.querySelector('.preco-unitario');
    const subtotalInput = row.querySelector('.subtotal');
    
    if (tamanhoSelect.value) {
        const preco = parseFloat(tamanhoSelect.selectedOptions[0].dataset.preco);
        precoUnitario.value = preco.toFixed(2);
        const subtotal = preco * quantidade;
        subtotalInput.value = subtotal.toFixed(2);
        calcularTotal();
    }
}

function calcularTotal() {
    const total = Array.from(document.querySelectorAll('.subtotal'))
        .reduce((sum, input) => sum + (parseFloat(input.value) || 0), 0);
    document.getElementById('totalPedido').textContent = total.toFixed(2);
}

async function confirmarPedido() {
    const telefoneComMascara = document.getElementById('phoneSearch').value.trim();
    const telefone = telefoneComMascara.replace(/\D/g, '').slice(-11);
    const clienteEncontrado = Object.values(clientesData).find(
        cliente => cliente.telefone.replace(/\D/g, '').slice(-11) === telefone
    );
    const endereco = document.getElementById('endereco').value;
    
    if (!clienteEncontrado || !endereco) {
        Swal.fire({
            title: 'Erro!',
            text: 'Por favor, selecione um cliente e endereço de entrega',
            icon: 'error'
        });
        return;
    }

    const itens = [];
    let erroValidacao = false;

    document.querySelectorAll('.produto-item').forEach(row => {
        const saborSelect = row.querySelector('.sabor-select');
        const tamanhoSelect = row.querySelector('.tamanho-select');
        const quantidade = parseInt(row.querySelector('.quantidade').value);
        const precoUnitario = parseFloat(row.querySelector('.preco-unitario').value);
        const subtotal = parseFloat(row.querySelector('.subtotal').value);

        if (!saborSelect.value || !quantidade || isNaN(precoUnitario)) {
            erroValidacao = true;
            return;
        }

        itens.push({
            produtos_id: parseInt(saborSelect.value),
            quantidade: quantidade,
            preco_unitario: precoUnitario,
            subtotal: subtotal,
            sabor: saborSelect.options[saborSelect.selectedIndex].text,
            tamanho: tamanhoSelect.value
        });
    });

    if (erroValidacao || itens.length === 0) {
        Swal.fire({
            title: 'Erro!',
            text: 'Por favor, verifique os produtos do pedido',
            icon: 'error'
        });
        return;
    }

    const pedido = {
        clientes_id: clienteEncontrado.id,
        itens: itens,
        preco_total: parseFloat(document.getElementById('totalPedido').textContent),
        endereco_entrega: endereco,
        status: editandoPedidoId ? 'Em Preparo' : 'Pendente'
    };

    try {
        const url = editandoPedidoId 
            ? `${CONFIG.API_URL}/pedidos/${editandoPedidoId}`
            : `${CONFIG.API_URL}/pedidos`;
        
        const method = editandoPedidoId ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(pedido)
        });

        if (!response.ok) throw new Error(`Erro ao ${editandoPedidoId ? 'atualizar' : 'criar'} pedido`);

        const result = await response.json();
        
        // Exibir modal com detalhes do pedido ou mensagem de sucesso
        await exibirModalPedido(
            editandoPedidoId || result.id, 
            clienteEncontrado, 
            pedido,
            itens
        );

        // Reabilitar campo de telefone
        document.getElementById('phoneSearch').disabled = false;
        
        // Limpar o ID do pedido em edição
        editandoPedidoId = null;
        
        // Recarregar lista de pedidos
        await carregarPedidos();

    } catch (error) {
        console.error('Erro:', error);
        document.getElementById('phoneSearch').disabled = false;
        Swal.fire({
            title: 'Erro!',
            text: `Erro ao ${editandoPedidoId ? 'atualizar' : 'criar'} pedido`,
            icon: 'error'
        });
    }
}

// Mover esta função para antes de confirmarPedido
function exibirModalPedido(numeroPedido, cliente, pedido, itens) {
    // Se for uma atualização, mostrar mensagem de sucesso e limpar formulário
    if (editandoPedidoId) {
        Swal.fire({
            title: 'Pedido Atualizado!',
            text: `Pedido Nº ${numeroPedido} atualizado com sucesso!`,
            icon: 'success',
            confirmButtonColor: '#28a745'
        }).then((result) => {
            // Após fechar o SweetAlert, limpar o formulário
            limparFormularioCompleto();
            // Recarregar lista de pedidos
            carregarPedidos();
            // Mostrar tabela de pedidos
            document.getElementById('pedidosTable').style.display = 'block';
        });
        return;
    }

    // Resto do código existente para novos pedidos
    const agora = new Date();
    const dataFormatada = agora.toLocaleDateString('pt-BR', { 
        day: '2-digit',
        month: '2-digit',
        year: '2-digit'
    });
    const horaFormatada = agora.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
    });

    document.getElementById('numeroPedido').textContent = numeroPedido;
    document.getElementById('modalDataHora').textContent = `${dataFormatada} ${horaFormatada}`;
    document.getElementById('modalClienteNome').textContent = cliente.nome;
    document.getElementById('modalClienteTelefone').textContent = cliente.telefone;
    document.getElementById('modalClienteEndereco').textContent = pedido.endereco_entrega;
    document.getElementById('modalClienteComplemento').textContent = cliente.complemento || 'Sem complemento';
    document.getElementById('modalTotalPedido').textContent = pedido.preco_total.toFixed(2);

    const tbody = document.getElementById('modalItensPedido');
    tbody.innerHTML = '';
    
    itens.forEach(item => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${item.sabor}</td>
            <td>${item.tamanho}</td>
            <td>${item.quantidade}</td>
            <td>R$ ${item.preco_unitario.toFixed(2)}</td>
            <td>R$ ${item.subtotal.toFixed(2)}</td>
        `;
        tbody.appendChild(tr);
    });

    const modalElement = document.getElementById('detalhePedidoModal');
    const modalInstance = M.Modal.getInstance(modalElement) || M.Modal.init(modalElement);
    
    modalInstance.options.onCloseEnd = () => {
        limparFormularioCompleto();
        carregarPedidos();
    };
    
    modalInstance.open();
}

// Modificar também a função limparFormularioCompleto
function limparFormularioCompleto() {
    // Reabilitar campo de telefone
    const phoneInput = document.getElementById('phoneSearch');
    phoneInput.disabled = false;
    phoneInput.value = '';
    
    // Limpar ID de edição
    editandoPedidoId = null;
    
    // Limpar campo de telefone
    document.getElementById('phoneSearch').value = '';
    
    // Limpar dados do cliente
    limparDadosCliente();
    
    // Limpar itens do pedido
    const produtos = document.getElementById('produtosList');
    while (produtos.children.length > 1) {
        produtos.removeChild(produtos.lastChild);
    }
    
    // Resetar primeiro item - CORREÇÃO AQUI
    const primeiroItem = produtos.querySelector('.produto-item');
    if (primeiroItem) {
        // Limpar e reinicializar selects
        const selects = primeiroItem.querySelectorAll('select');
        selects.forEach(select => {
            select.innerHTML = select.classList.contains('sabor-select') 
                ? '<option value="" disabled selected>Escolha o sabor</option>'
                : '<option value="" disabled selected>Tamanho</option>';
            M.FormSelect.init(select);
        });

        // Limpar todos os inputs
        const inputs = primeiroItem.querySelectorAll('input');
        inputs.forEach(input => {
            if (input.type === 'number') {
                input.value = '1';
            } else {
                input.value = '';
            }
        });

        // Garantir que os labels permaneçam na posição correta
        const labels = primeiroItem.querySelectorAll('label');
        labels.forEach(label => {
            if (label) {
                label.classList.add('active');
            }
        });

        // Limpar campos específicos dos produtos
        ['categoria-display', 'preco-unitario', 'subtotal'].forEach(className => {
            const elemento = primeiroItem.querySelector(`.${className}`);
            if (elemento) {
                elemento.value = '';
            }
        });
    }

    // Limpar total do pedido
    document.getElementById('totalPedido').textContent = '0.00';

    // Reset completo do formulário
    document.getElementById('orderForm').reset();
    
    // Fechar mapa
    const mapCard = document.getElementById('mapCard');
    mapCard.style.display = 'none';
    if (map) {
        map.remove();
        map = null;
        marker = null;
    }

    // Esconder informações do cliente
    document.getElementById('clienteInfo').style.display = 'none';

    // Recarregar os selects de produtos
    atualizarSelectsProdutos();

    // Reinicializar todos os selects do Materialize
    M.FormSelect.init(document.querySelectorAll('select'));
}

function limparFormulario() {
    document.getElementById('orderForm').reset();
    document.getElementById('clienteInfo').style.display = 'none';
    document.getElementById('totalPedido').textContent = '0.00';
    
    const produtos = document.getElementById('produtosList');
    while (produtos.children.length > 1) {
        produtos.removeChild(produtos.lastChild);
    }
    
    const primeiroItem = produtos.firstChild;
    primeiroItem.querySelectorAll('select').forEach(select => {
        select.selectedIndex = 0;
        M.FormSelect.init(select);
    });
    primeiroItem.querySelectorAll('input').forEach(input => input.value = '');
}

function atualizarSelectsProdutos() {
    const sabores = produtosData.reduce((acc, produto) => {
        if (!acc[produto.id]) {
            acc[produto.id] = {
                id: produto.id,
                sabor: produto.sabor,
                categoria: produto.categoria,
                tamanhos: []
            };
        }
        acc[produto.id].tamanhos.push({
            tamanho: produto.tamanho,
            preco: produto.preco
        });
        return acc;
    }, {});

    document.querySelectorAll('.produto-item').forEach(item => {
        configurarSelectsProduto(item, sabores);
    });
}

// Nova função para configurar os selects de um item específico
function configurarSelectsProduto(item, saboresCache) {
    const sabores = saboresCache || produtosData.reduce((acc, produto) => {
        if (!acc[produto.id]) {
            acc[produto.id] = {
                id: produto.id,
                sabor: produto.sabor,
                categoria: produto.categoria,
                tamanhos: []
            };
        }
        acc[produto.id].tamanhos.push({
            tamanho: produto.tamanho,
            preco: produto.preco
        });
        return acc;
    }, {});

    const saborSelect = item.querySelector('.sabor-select');
    const categoriaInput = item.querySelector('.categoria-display');
    const tamanhoSelect = item.querySelector('.tamanho-select');
    const quantidadeInput = item.querySelector('.quantidade');

    // Verificar se o select já tem um valor selecionado
    const saborAtual = saborSelect.value;
    
    // Configurar select de sabores
    if (!saborAtual) {
        saborSelect.innerHTML = '<option value="" disabled selected>Escolha o sabor</option>' +
            Object.entries(sabores).map(([id, produto]) => 
                `<option value="${id}" data-categoria="${produto.categoria}">${produto.sabor}</option>`
            ).join('');
    }

    // Eventos
    saborSelect.addEventListener('change', function() {
        const selectedOption = this.options[this.selectedIndex];
        const produto = sabores[this.value];
        
        if (produto) {
            // Atualizar o campo categoria com o valor correto
            categoriaInput.value = produto.categoria;
            
            tamanhoSelect.innerHTML = '<option value="" disabled selected>Escolha o tamanho</option>' +
                produto.tamanhos.map(t => 
                    `<option value="${t.tamanho}" data-preco="${t.preco}">
                        ${t.tamanho} - R$ ${t.preco.toFixed(2)}
                    </option>`
                ).join('');
            
            M.FormSelect.init(tamanhoSelect);
            calcularSubtotal(item);
        }
    });

    tamanhoSelect.addEventListener('change', function() {
        calcularSubtotal(item);
    });

    quantidadeInput.addEventListener('change', function() {
        if (this.value < 1) this.value = 1;
        calcularSubtotal(item);
    });

    M.FormSelect.init(saborSelect);
    M.FormSelect.init(tamanhoSelect);
}

// Funções auxiliares
function formatarDataPedido(data) {
    return data 
        ? new Date(data).toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })
        : 'Data não disponível';
}

function gerarOpcoesStatus(statusAtual) {
    const statusOptions = [
        'Pendente',
        'Em Preparo',
        'Saiu para Entrega',
        'Entregue',
        'Cancelado'
    ];
    
    return statusOptions.map(status => 
        `<option value="${status}" ${status === statusAtual ? 'selected' : ''}>
            ${status}
         </option>`
    ).join('');
}

function togglePedidosList() {
    const table = $('#pedidosTable');
    const buttonText = document.getElementById('toggleButtonText');
    if (table.is(':visible')) {
        table.hide();
        buttonText.textContent = 'Exibir Pedidos';
    } else {
        carregarPedidos();
        table.show();
        buttonText.textContent = 'Ocultar Lista';
    }
}

// Adicionar nova função para edição de pedido
async function editarPedido(pedidoId) {
    try {
        editandoPedidoId = pedidoId; // Salvar o ID do pedido sendo editado
        const response = await fetch(`${CONFIG.API_URL}/pedidos/${pedidoId}`);
        const data = await response.json();
        
        if (!data.sucesso) throw new Error('Erro ao carregar dados do pedido');

        const pedido = data.dados;
        
        // Preencher e desabilitar campo de telefone
        const phoneInput = document.getElementById('phoneSearch');
        phoneInput.value = pedido.cliente_telefone;
        phoneInput.disabled = true; // Desabilitar edição do telefone
        const phoneLabel = document.querySelector('label[for="phoneSearch"]');
        phoneLabel.classList.add('active');
        
        await buscarCliente(); // Isso irá carregar os dados do cliente e o mapa

        // Limpar lista de produtos atual
        const produtosList = document.getElementById('produtosList');
        while (produtosList.children.length > 1) {
            produtosList.removeChild(produtosList.lastChild);
        }

        // Adicionar itens do pedido
        if (Array.isArray(pedido.itens)) {
            pedido.itens.forEach((item, index) => {
                if (index > 0) adicionarProdutoRow(); // Adiciona nova linha para itens após o primeiro
                
                const rows = document.querySelectorAll('.produto-item');
                const currentRow = rows[index];
                
                // Selecionar sabor
                const saborSelect = currentRow.querySelector('.sabor-select');
                saborSelect.value = item.produtos_id;
                M.FormSelect.init(saborSelect);
                
                // Disparar evento change para carregar categorias e tamanhos
                const event = new Event('change');
                saborSelect.dispatchEvent(event);
                
                // Aguardar um momento para que os tamanhos sejam carregados
                setTimeout(() => {
                    // Selecionar tamanho
                    const tamanhoSelect = currentRow.querySelector('.tamanho-select');
                    tamanhoSelect.value = item.tamanho;
                    M.FormSelect.init(tamanhoSelect);
                    
                    // Atualizar quantidade
                    currentRow.querySelector('.quantidade').value = item.quantidade;
                    
                    // Atualizar preços
                    currentRow.querySelector('.preco-unitario').value = item.preco_unitario.toFixed(2);
                    currentRow.querySelector('.subtotal').value = item.subtotal.toFixed(2);
                }, 100);
            });
        }

        // Atualizar total
        document.getElementById('totalPedido').textContent = pedido.preco_total.toFixed(2);

        // Ocultar tabela de pedidos
        document.getElementById('pedidosTable').style.display = 'none';

        // Rolar para o topo do formulário
        window.scrollTo({ top: 0, behavior: 'smooth' });

    } catch (error) {
        console.error('Erro ao editar pedido:', error);
        limparFormularioCompleto();
        Swal.fire({
            title: 'Erro!',
            text: 'Erro ao carregar dados do pedido para edição',
            icon: 'error'
        });
    }
}

// Adicionar estas novas funções após as funções existentes

async function abrirModalClientes() {
    try {
        await carregarClientesParaModal();
        const modal = M.Modal.getInstance(document.getElementById('modalListaClientes'));
        modal.open();
        document.getElementById('filtroClientes').focus();
    } catch (error) {
        console.error('Erro ao abrir modal de clientes:', error);
        Swal.fire({
            title: 'Erro!',
            text: 'Não foi possível carregar a lista de clientes',
            icon: 'error'
        });
    }
}

async function carregarClientesParaModal() {
    try {
        const tbody = document.getElementById('listaClientesModal');
        tbody.innerHTML = '<tr><td colspan="4" class="center-align">Carregando...</td></tr>';

        const clientesOrdenados = Object.values(clientesData).sort((a, b) => 
            a.nome.localeCompare(b.nome, 'pt-BR', { sensitivity: 'base' })
        );

        tbody.innerHTML = clientesOrdenados.map(cliente => {
            // Formatar o telefone para exibição
            const telefoneNumeros = cliente.telefone.replace(/\D/g, '');
            const telefoneFormatado = telefoneNumeros.length === 11 
                ? `+55 (${telefoneNumeros.slice(0,2)}) ${telefoneNumeros.slice(2,3)} ${telefoneNumeros.slice(3,7)}-${telefoneNumeros.slice(7)}`
                : cliente.telefone;
            
            return `
                <tr>
                    <td>${cliente.nome || ''}</td>
                    <td>${telefoneFormatado}</td>
                    <td>${formatarEnderecoCompleto(cliente)}</td>
                    <td>
                        <button onclick="selecionarCliente('${cliente.telefone}')" 
                                class="btn-small waves-effect waves-light green">
                            <i class="material-icons">check</i>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');

    } catch (error) {
        console.error('Erro ao carregar clientes para modal:', error);
        throw error;
    }
}

function filtrarClientes() {
    const filtro = document.getElementById('filtroClientes').value.toLowerCase();
    const linhas = document.getElementById('listaClientesModal').getElementsByTagName('tr');

    Array.from(linhas).forEach(linha => {
        const texto = linha.textContent.toLowerCase();
        linha.style.display = texto.includes(filtro) ? '' : 'none';
    });
}

function selecionarCliente(telefone) {
    const phoneInput = document.getElementById('phoneSearch');
    phoneInput.value = telefone;
    // Atualize o campo para garantir que a máscara seja aplicada corretamente
    if (window.IMask && phoneInput.inputMask) {
        // Força atualização da máscara se necessário
        phoneInput.inputMask.updateValue();
    }
    const modal = M.Modal.getInstance(document.getElementById('modalListaClientes'));
    modal.close();
    M.updateTextFields();
    buscarCliente();
}
