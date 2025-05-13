document.addEventListener('DOMContentLoaded', function() {
    // Inicializa componentes do Materialize
    M.AutoComplete.init(document.querySelectorAll('.autocomplete'));
    M.FormSelect.init(document.querySelectorAll('select'));

    // Carrega dados iniciais
    carregarClientes();
    carregarProdutos();

    // Event listeners
    document.getElementById('phoneSearch').addEventListener('change', buscarCliente);
    document.getElementById('addProduto').addEventListener('click', adicionarProdutoRow);
    document.getElementById('orderForm').addEventListener('submit', confirmarPedido);
});

// Cache de dados
let clientesData = {};
let produtosData = {};

// Funções de carregamento inicial
async function carregarClientes() {
    try {
        const response = await fetch(`${API_URL}/clientes`);
        const data = await response.json();
        clientesData = data.dados.reduce((acc, cliente) => {
            acc[cliente.telefone] = cliente;
            return acc;
        }, {});

        // Prepara dados para autocomplete
        let autoCompleteData = {};
        data.dados.forEach(cliente => {
            autoCompleteData[cliente.telefone] = null;
        });

        const elem = document.querySelector('.autocomplete');
        M.Autocomplete.init(elem, {
            data: autoCompleteData,
            onAutocomplete: buscarCliente
        });
    } catch (error) {
        console.error('Erro ao carregar clientes:', error);
    }
}

async function carregarProdutos() {
    try {
        const response = await fetch(`${API_URL}/produtos`);
        const data = await response.json();
        produtosData = data.dados;
        atualizarSelectsProdutos();
    } catch (error) {
        console.error('Erro ao carregar produtos:', error);
    }
}

// Funções de manipulação do formulário
async function buscarCliente() {
    const telefone = document.getElementById('phoneSearch').value;
    const cliente = clientesData[telefone];
    const clienteInfo = document.getElementById('clienteInfo');
    
    if (cliente) {
        clienteInfo.style.display = 'block';
        document.getElementById('clienteNome').textContent = `Nome: ${cliente.nome}`;
        document.getElementById('clienteTelefone').textContent = `Telefone: ${cliente.telefone}`;
        document.getElementById('clienteEndereco').textContent = 
            `Endereço: ${cliente.rua}, ${cliente.bairro}, ${cliente.cidade} - ${cliente.estado}`;

        // Atualiza select de endereços
        const enderecoSelect = document.getElementById('endereco');
        const enderecoCompleto = `${cliente.rua}, ${cliente.bairro}, ${cliente.cidade} - ${cliente.estado}`;
        enderecoSelect.innerHTML = `
            <option value="" disabled>Selecione o endereço</option>
            <option value="${enderecoCompleto}" selected>${enderecoCompleto}</option>
        `;
        
        M.FormSelect.init(enderecoSelect);
        M.toast({html: 'Cliente encontrado!', classes: 'green'});
    } else {
        limparDadosCliente();
        M.toast({html: 'Cliente não encontrado', classes: 'red'});
    }
}

function limparDadosCliente() {
    const clienteInfo = document.getElementById('clienteInfo');
    clienteInfo.style.display = 'none';
    document.getElementById('clienteNome').textContent = '';
    document.getElementById('clienteTelefone').textContent = '';
    document.getElementById('clienteEndereco').textContent = '';
    document.getElementById('endereco').innerHTML = 
        '<option value="" disabled selected>Selecione o endereço de entrega</option>';
}

function removeProduto(element) {
    element.closest('.produto-item').remove();
    calcularTotal();
}

// Atualiza função adicionarProdutoRow para usar o novo layout
function adicionarProdutoRow() {
    const container = document.getElementById('produtosList');
    const novoProduto = document.querySelector('.produto-item').cloneNode(true);
    
    // Limpa valores
    novoProduto.querySelectorAll('input').forEach(input => input.value = '');
    novoProduto.querySelectorAll('select').forEach(select => {
        select.selectedIndex = 0;
        M.FormSelect.init(select);
    });
    
    container.appendChild(novoProduto);
    
    // Adiciona event listeners
    novoProduto.querySelector('.quantidade').addEventListener('change', calcularSubtotal);
    novoProduto.querySelector('.tamanho-select').addEventListener('change', calcularSubtotal);
    novoProduto.querySelector('.sabor-select').addEventListener('change', calcularSubtotal);
}

// Atualiza calcularSubtotal para considerar o preço correto
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
    const cliente = clientesData[telefone];
    const endereco = document.getElementById('endereco').value;
    
    if (!cliente || !endereco) {
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
        clientes_id: cliente.id,
        itens: itens,
        preco_total: parseFloat(document.getElementById('totalPedido').textContent),
        endereco_entrega: endereco
    };

    try {
        const response = await fetch(`${API_URL}/pedidos`, {
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

        // Preenche sabores
        saborSelect.innerHTML = '<option value="" disabled selected>Escolha o sabor</option>' +
            Object.entries(sabores).map(([id, produto]) => 
                `<option value="${id}">${produto.sabor}</option>`
            ).join('');

        // Event listener para sabor
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

        // Event listener para tamanho
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
