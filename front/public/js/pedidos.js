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
        const response = await fetch(`${CONFIG.API_URL}/clientes`);
        console.log('Response status:', response.status);
        
        if (!response.ok) throw new Error('Erro ao carregar clientes');
        
        const json = await response.json();
        console.log('Dados recebidos da API:', json);
        
        processarDadosClientes(json);
    } catch (error) {
        console.error('Erro ao carregar clientes:', error);
        M.toast({html: 'Erro ao carregar clientes: ' + error.message, classes: 'red'});
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
    }
}

/**
 * Funções de manipulação de pedidos
 */
async function buscarCliente() {
    const telefone = document.getElementById('phoneSearch').value.trim();
    console.log('Buscando cliente com telefone:', telefone);
    
    if (!telefone) {
        M.toast({html: 'Por favor, insira um telefone', classes: 'red'});
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
        M.toast({html: error.message, classes: 'red'});
    }
}

function tratarErrosBuscaCliente(error) {
    console.error('Erro ao buscar cliente:', error);
    limparDadosCliente();
    M.toast({html: error.message, classes: 'red'});
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
    
    M.toast({html: 'Cliente encontrado!', classes: 'green'});

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
        M.toast({html: 'Erro ao carregar o mapa', classes: 'red'});
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
        M.toast({html: 'O pedido deve ter pelo menos um item', classes: 'red'});
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
        M.toast({html: 'Por favor, selecione um cliente e endereço de entrega', classes: 'red'});
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
        M.toast({html: 'Por favor, verifique os produtos do pedido', classes: 'red'});
        return;
    }

    const pedido = {
        clientes_id: clienteEncontrado.id,
        itens: itens,
        preco_total: parseFloat(document.getElementById('totalPedido').textContent),
        endereco_entrega: endereco
    };

    try {
        const response = await fetch(`${CONFIG.API_URL}/pedidos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(pedido)
        });

        if (!response.ok) throw new Error('Erro ao criar pedido');

        const result = await response.json();
        
        // Exibir modal com detalhes do pedido
        exibirModalPedido(result.id, clienteEncontrado, pedido, itens);
        
        // Remover manipulador de evento anterior para não limpar o formulário
        const modalInstance = M.Modal.getInstance(document.getElementById('detalhePedidoModal'));
        modalInstance.options.onCloseEnd = () => {
            window.location.href = '/';  // Redirecionar para home ao fechar
        };
    } catch (error) {
        console.error('Erro:', error);
        M.toast({html: 'Erro ao criar pedido', classes: 'red'});
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

    // Abrir o modal
    const modalInstance = M.Modal.getInstance(document.getElementById('detalhePedidoModal'));
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
        // Limpar selects
        primeiroItem.querySelectorAll('select').forEach(select => {
            select.selectedIndex = 0;
            M.FormSelect.init(select);
        });

        // Limpar inputs
        primeiroItem.querySelectorAll('input').forEach(input => {
            if (input.type === 'number') {
                input.value = '1';
            } else {
                input.value = '';
            }
            // Manter apenas os labels do primeiro item
            if (!input.readOnly) {
                const label = input.nextElementSibling;
                if (label && label.tagName === 'LABEL') {
                    label.style.transform = 'translateY(-14px)'; // Resetar posição do label
                }
            }
        });

        // Limpar categoria, preço unitário e subtotal
        primeiroItem.querySelector('.categoria-display').value = '';
        primeiroItem.querySelector('.preco-unitario').value = '';
        primeiroItem.querySelector('.subtotal').value = '';
    }

    // Limpar total
    document.getElementById('totalPedido').textContent = '0.00';

    // Reset do formulário
    document.getElementById('orderForm').reset();
    
    // Fechar mapa se estiver aberto
    const mapCard = document.getElementById('mapCard');
    mapCard.style.display = 'none';
    if (map) {
        map.remove();
        map = null;
        marker = null;
    }

    // Esconder card de informações do cliente
    document.getElementById('clienteInfo').style.display = 'none';

    // Recarregar os selects de produtos para garantir estado inicial
    atualizarSelectsProdutos();
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
