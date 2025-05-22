/**
 * Gerenciamento do formulário de pedidos
 * Inclui funcionalidades de busca de clientes, produtos e criação de pedidos
 */


// Função para tratar erro 401
function tratar401(response) {
    if (response.status === 401) {
        window.location.href = '/login';
        return true;
    }
    return false;
}

// Função utilitária para fetch autenticado com JWT
async function fetchJWT(url, options = {}) {
    const token = localStorage.getItem('token');
    options.headers = options.headers || {};
    options.headers['Authorization'] = `Bearer ${token}`;
    return fetch(url, options);
}

const MENSAGENS = {
    ERRO_CARREGAR: 'Erro ao carregar pedidos',
    ERRO_SALVAR: 'Erro ao salvar pedido',
    ERRO_DELETAR: 'Erro ao excluir pedido',
    ERRO_EDITAR: 'Erro ao carregar pedido para edição',
    CAMPOS_OBRIGATORIOS: 'Por favor, preencha os campos obrigatórios',
    SUCESSO_SALVAR: 'Pedido salvo com sucesso!',
    SUCESSO_DELETAR: 'Pedido excluído com sucesso!',
    CONFIRMA_DELETAR: 'Tem certeza que deseja excluir este pedido?'
};

let editingPedidoId = null;

// Inicialização do documento
document.addEventListener('DOMContentLoaded', function() {
    inicializarComponentes();
    configurarEventListeners();
    carregarPedidos();
    // Inicializar modals
    var modals = document.querySelectorAll('.modal');
    M.Modal.init(modals);
    // IMask para telefone do cliente
    const phoneInput = document.getElementById('phoneSearch');
    if (phoneInput) {
        IMask(phoneInput, { mask: '+55 (00) 0 0000-0000' });
    }
    // IMask para CEP (caso exista campo de CEP na tela de pedidos)
    const cepInput = document.getElementById('clientCep');
    if (cepInput) {
        IMask(cepInput, { mask: '00000-000' });
    }
});

// Cache de dados global
let clientesData = {};
let clientesIds = [];
let produtosData = {};
let map = null;
let marker = null;

/**
 * Funções de inicialização
 */
function inicializarComponentes() {
    M.FormSelect.init(document.querySelectorAll('select'));
    carregarClientes();
    carregarProdutos();
}

function configurarEventListeners() {
    const phoneInput = document.getElementById('phoneSearch');
    phoneInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            buscarCliente();
        }
    });
    
    document.getElementById('orderForm').addEventListener('submit', confirmarPedido);
}

/**
 * Funções de carregamento de dados
 */
async function carregarClientes() {
    try {
        console.log('Iniciando carregamento de clientes...');
        const response = await fetchJWT(`${CONFIG.API_URL}/clientes`);
        if (tratar401(response)) return;
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
        const response = await fetchJWT(`${CONFIG.API_URL}/produtos`);
        if (tratar401(response)) return;
        if (!response.ok) throw new Error('Erro ao carregar produtos');
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

async function carregarPedidos() {
    try {
        const response = await fetchJWT(`${CONFIG.API_URL}/pedidos`);
        if (tratar401(response)) return;
        if (!response.ok) throw new Error('Erro ao carregar pedidos');
        const data = await response.json();
        if (!data.sucesso) throw new Error('Erro ao carregar pedidos');
        const tbody = document.getElementById('pedidos-list');
        tbody.innerHTML = '';
        data.dados.forEach(pedido => {
            const row = document.createElement('tr');
            const dataFormatada = formatarDataPedido(pedido.data_pedido);
            const status = pedido.status || 'Pendente';
            const telefone = pedido.cliente_telefone || 'Não informado';
            row.innerHTML = `
                <td class="pedido-id">
                    <a href="#" onclick="mostrarDetalhesPedido(${pedido.id}); return false;" class="blue-text text-darken-2">
                        <b>N.${pedido.id}</b>
                    </a>
                </td>
                <td class="pedido-data">${dataFormatada}</td>
                <td class="pedido-cliente">
                    <span class="cliente-nome">${pedido.cliente_nome}</span><br>
                    <small class="cliente-telefone black-text">Telefone: ${telefone}</small>
                </td>
                <td class="pedido-status">
                    <select class="browser-default status-select" onchange="atualizarStatus(${pedido.id}, this.value)">
                        ${gerarOpcoesStatus(status)}
                    </select>
                </td>
                <td class="pedido-acoes center-align">
                    <button class="btn-small waves-effect waves-light red" onclick="deletarPedido(${pedido.id})">
                        <i class="material-icons">delete</i>
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    } catch (error) {
        console.error('Erro ao carregar pedidos:', error);
        Swal.fire({
            title: 'Erro!',
            text: 'Erro ao carregar pedidos',
            icon: 'error'
        });
    }
}

async function atualizarStatus(pedidoId, novoStatus) {
    try {
        Swal.fire({
            title: 'Atualizando status...',
            text: 'Por favor, aguarde.',
            icon: 'info',
            showConfirmButton: false,
            timer: 1500
        });
        const response = await fetchJWT(`${CONFIG.API_URL}/pedidos/${pedidoId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: novoStatus })
        });
        if (tratar401(response)) return;
        if (!response.ok) throw new Error('Erro ao atualizar status');
        const data = await response.json();
        if (!data.sucesso) throw new Error(data.mensagem || 'Erro ao atualizar status');
        Swal.fire({
            title: 'Sucesso!',
            text: 'Status atualizado com sucesso!',
            icon: 'success'
        });
        await carregarPedidos();
    } catch (error) {
        console.error('Erro ao atualizar status:', error);
        Swal.fire({
            title: 'Erro!',
            text: error.message,
            icon: 'error'
        });
    }
}

/**
 * Funções de manipulação de pedidos
 */
async function buscarCliente() {
    const telefone = document.getElementById('phoneSearch').value.trim();
    console.log('Buscando cliente com telefone:', telefone);
    
    if (!telefone) {
        Swal.fire({
            title: 'Erro!',
            text: 'Por favor, insira um telefone',
            icon: 'error'
        });
        return;
    }

    try {
        const clienteEncontrado = Object.values(clientesData).find(
            cliente => cliente.telefone === telefone
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
        const response = await fetchJWT(`${CONFIG.API_URL}/clientes/${clienteEncontrado.id}`);
        if (tratar401(response)) return;
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

async function confirmarPedido(event) {
    event.preventDefault();
    
    const telefone = document.getElementById('phoneSearch').value;
    const clienteEncontrado = Object.values(clientesData).find(
        cliente => cliente.telefone === telefone
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
            // Adicionar informações para o modal
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
        endereco_entrega: endereco
    };

    try {
        const response = await fetchJWT(`${CONFIG.API_URL}/pedidos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(pedido)
        });

        if (!response.ok) throw new Error('Erro ao criar pedido');

        const result = await response.json();
        
        // Exibir modal com detalhes do pedido
        exibirModalPedido(result.id, clienteEncontrado, pedido, itens);
        
        await carregarPedidos(); // Recarrega a lista de pedidos
    } catch (error) {
        console.error('Erro:', error);
        Swal.fire({
            title: 'Erro!',
            text: 'Erro ao criar pedido',
            icon: 'error'
        });
    }
}

function exibirModalPedido(numeroPedido, cliente, pedido, itens) {
    // Formatar data e hora atual
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

    // Preencher dados do pedido no modal
    document.getElementById('numeroPedido').textContent = numeroPedido;
    document.getElementById('modalDataHora').textContent = `${dataFormatada} ${horaFormatada}`;
    document.getElementById('modalClienteNome').textContent = cliente.nome;
    document.getElementById('modalClienteTelefone').textContent = cliente.telefone;
    document.getElementById('modalClienteEndereco').textContent = pedido.endereco_entrega;
    document.getElementById('modalClienteComplemento').textContent = cliente.complemento || 'Sem complemento';
    document.getElementById('modalTotalPedido').textContent = pedido.preco_total.toFixed(2);

    // Preencher tabela de itens
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

    // Configurar o modal
    const modalInstance = M.Modal.getInstance(document.getElementById('detalhePedidoModal'));
    
    // Configurar evento para quando o modal for fechado
    modalInstance.options.onCloseEnd = () => {
        limparFormularioCompleto();
        carregarPedidos(); // Recarrega a lista de pedidos
    };
    
    // Abrir o modal
    modalInstance.open();
}

// Nova função para limpeza completa do formulário
function limparFormularioCompleto() {
    // Limpar campo de telefone
    document.getElementById('phoneSearch').value = '';
    
    // Limpar dados do cliente
    limparDadosCliente();
    
    // Limpar itens do pedido
    const produtos = document.getElementById('produtosList');
    while (produtos.children.length > 1) {
        produtos.removeChild(produtos.lastChild);
    }
    
    // Resetar primeiro item
    const primeiroItem = produtos.firstChild;
    if (primeiroItem) {
        // Limpar e reinicializar selects
        primeiroItem.querySelectorAll('select').forEach(select => {
            select.innerHTML = select.classList.contains('sabor-select') 
                ? '<option value="" disabled selected>Escolha o sabor</option>'
                : '<option value="" disabled selected>Tamanho</option>';
            M.FormSelect.init(select);
        });

        // Limpar todos os inputs
        primeiroItem.querySelectorAll('input').forEach(input => {
            if (input.type === 'number') {
                input.value = '1'; // Reseta quantidade para 1
            } else {
                input.value = ''; // Limpa outros inputs
            }
        });

        // Garantir que os labels permaneçam na posição correta
        primeiroItem.querySelectorAll('label').forEach(label => {
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
    if (!Array.isArray(produtosData) || produtosData.length === 0) return;
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
    const tamanhoAtual = tamanhoSelect.value;

    // Configurar select de sabores apenas se não estiver selecionado
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
            categoriaInput.value = selectedOption.dataset.categoria;
            
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

async function savePedido() {
    const form = document.getElementById('pedidoForm');
    // Monte o objeto pedidoData conforme seu formulário
    const pedidoData = {
        // exemplo:
        // clienteId: form.clienteId.value,
        // produtos: [...],
        // total: ...
    };

    // Validação dos campos obrigatórios
    // if (!pedidoData.clienteId || ...) {
    //     Swal.fire({
    //         title: 'Erro!',
    //         text: MENSAGENS.CAMPOS_OBRIGATORIOS,
    //         icon: 'error'
    //     });
    //     return;
    // }

    try {
        const url = editingPedidoId 
            ? `${CONFIG.API_URL}/pedidos/${editingPedidoId}`
            : `${CONFIG.API_URL}/pedidos`;

        const response = await fetchJWT(url, {
            method: editingPedidoId ? 'PUT' : 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(pedidoData)
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.erro || MENSAGENS.ERRO_SALVAR);

        Swal.fire({
            title: 'Sucesso!',
            text: data.mensagem || MENSAGENS.SUCESSO_SALVAR,
            icon: 'success'
        });
        form.reset();
        editingPedidoId = null;
        await carregarPedidos();
    } catch (error) {
        console.error('Erro:', error);
        Swal.fire({
            title: 'Erro!',
            text: error.message || MENSAGENS.ERRO_SALVAR,
            icon: 'error'
        });
    }
}

async function editPedido(pedidoId) {
    try {
        const response = await fetchJWT(`${CONFIG.API_URL}/pedidos/${pedidoId}`);
        if (!response.ok) throw new Error(MENSAGENS.ERRO_EDITAR);

        const data = await response.json();
        const pedido = data.dados;
        const form = document.getElementById('pedidoForm');
        // Preencha os campos do formulário com os dados do pedido
        // form.clienteId.value = pedido.clienteId;
        // ...
        editingPedidoId = pedidoId;
        M.updateTextFields();
    } catch (error) {
        console.error(MENSAGENS.ERRO_EDITAR, error);
        Swal.fire({
            title: 'Erro!',
            text: error.message || MENSAGENS.ERRO_EDITAR,
            icon: 'error'
        });
    }
}

async function deletePedido(pedidoId) {
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
        const response = await fetchJWT(`${CONFIG.API_URL}/pedidos/${pedidoId}`, {
            method: 'DELETE'
        });
        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.erro || MENSAGENS.ERRO_DELETAR);
        }
        const data = await response.json();
        Swal.fire({
            title: 'Sucesso!',
            text: data.mensagem || MENSAGENS.SUCESSO_DELETAR,
            icon: 'success'
        });
        await carregarPedidos();
    } catch (error) {
        console.error('Erro:', error);
        Swal.fire({
            title: 'Erro!',
            text: error.message || MENSAGENS.ERRO_DELETAR,
            icon: 'error'
        });
    }
}
