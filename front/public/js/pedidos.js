/**
 * Gerenciamento do formulário de pedidos
 * Inclui funcionalidades de busca de clientes, produtos e criação de pedidos
 */

// Inicialização do documento
document.addEventListener('DOMContentLoaded', function() {
    inicializarComponentes();
    configurarEventListeners();
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
            estado: cliente.estado
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
        
    } catch (error) {
        console.error('Erro ao exibir mapa:', error);
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
    element.closest('.produto-item').remove();
    calcularTotal();
}

function adicionarProdutoRow() {
    const container = document.getElementById('produtosList');
    const novoProduto = document.querySelector('.produto-item').cloneNode(true);
    
    novoProduto.querySelectorAll('input').forEach(input => input.value = '');
    novoProduto.querySelectorAll('select').forEach(select => {
        select.selectedIndex = 0;
        M.FormSelect.init(select);
    });
    
    container.appendChild(novoProduto);
    
    novoProduto.querySelector('.quantidade').addEventListener('change', calcularSubtotal);
    novoProduto.querySelector('.tamanho-select').addEventListener('change', calcularSubtotal);
    novoProduto.querySelector('.sabor-select').addEventListener('change', calcularSubtotal);
}

function calcularSubtotal(event) {
    const row = event.target.closest('.produto-item');
    const quantidade = parseInt(row.querySelector('.quantidade').value) || 0;
    const saborSelect = row.querySelector('.sabor-select');
    const tamanhoSelect = row.querySelector('.tamanho-select');
    
    if (saborSelect.value && tamanhoSelect.value) {
        const produto = produtosData.find(p => 
            p.id === parseInt(saborSelect.value) && p.tamanho === tamanhoSelect.value
        );
        
        if (produto) {
            const subtotal = produto.preco * quantidade;
            row.querySelector('.preco-unitario').value = produto.preco.toFixed(2);
            row.querySelector('.subtotal').value = subtotal.toFixed(2);
            calcularTotal();
        }
    }
}

function calcularTotal() {
    const subtotais = [...document.querySelectorAll('.subtotal')]
        .map(input => parseFloat(input.value) || 0);
    const total = subtotais.reduce((acc, curr) => acc + curr, 0);
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
            subtotal: subtotal
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

        M.toast({html: 'Pedido realizado com sucesso!', classes: 'green'});
        limparFormulario();
    } catch (error) {
        console.error('Erro:', error);
        M.toast({html: 'Erro ao criar pedido', classes: 'red'});
    }
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
        const saborSelect = item.querySelector('.sabor-select');
        const categoriaInput = item.querySelector('.categoria-display');
        const tamanhoSelect = item.querySelector('.tamanho-select');

        saborSelect.innerHTML = '<option value="" disabled selected>Escolha o sabor</option>' +
            Object.entries(sabores).map(([id, produto]) => 
                `<option value="${id}">${produto.sabor}</option>`
            ).join('');

        saborSelect.addEventListener('change', function() {
            const produto = sabores[this.value];
            if (produto) {
                categoriaInput.value = produto.categoria || '';
                tamanhoSelect.innerHTML = '<option value="" disabled selected>Escolha o tamanho</option>' +
                    produto.tamanhos.map(t => 
                        `<option value="${t.tamanho}" data-preco="${t.preco}">
                            ${t.tamanho} - R$ ${t.preco.toFixed(2)}
                        </option>`
                    ).join('');
                M.FormSelect.init(tamanhoSelect);
            }
        });

        tamanhoSelect.addEventListener('change', function() {
            const option = this.selectedOptions[0];
            if (option) {
                const preco = parseFloat(option.dataset.preco);
                const row = this.closest('.produto-item');
                row.querySelector('.preco-unitario').value = preco.toFixed(2);
                calcularSubtotal(row);
            }
        });
    });

    M.FormSelect.init(document.querySelectorAll('select'));
}
