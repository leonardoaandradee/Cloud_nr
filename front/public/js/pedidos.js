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
function buscarCliente() {
    const telefone = document.getElementById('phoneSearch').value;
    const cliente = clientesData[telefone];
    const clienteInfo = document.getElementById('clienteInfo');
    
    if (cliente) {
        clienteInfo.style.display = 'block';
        clienteInfo.innerHTML = `
            <h6><b>Dados do Cliente:</b></h6>
            <p><b>Nome:</b> ${cliente.nome}</p>
            <p><b>Email:</b> ${cliente.email || 'Não informado'}</p>
            <p><b>Telefone:</b> ${cliente.telefone}</p>
        `;

        // Atualiza select de endereços
        const enderecoSelect = document.getElementById('endereco');
        if (cliente.CEP && cliente.complemento) {
            enderecoSelect.innerHTML = `
                <option value="" disabled>Selecione o endereço</option>
                <option value="${cliente.CEP},${cliente.complemento}" selected>
                    CEP: ${cliente.CEP} - ${cliente.complemento}
                </option>
            `;
        }
        M.toast({html: 'Cliente encontrado!', classes: 'green'});
    } else {
        clienteInfo.style.display = 'none';
        clienteInfo.innerHTML = '';
        document.getElementById('endereco').innerHTML = 
            '<option value="" disabled selected>Selecione o endereço de entrega</option>';
        M.toast({html: 'Cliente não encontrado', classes: 'red'});
    }
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
    const tamanho = row.querySelector('.tamanho-select').value;
    const saborId = parseInt(row.querySelector('.sabor-select').value);
    
    if (tamanho && saborId) {
        const produto = produtosData.find(p => 
            p.id === saborId && p.tamanho === tamanho
        );
        
        if (produto) {
            const subtotal = produto.preco * quantidade;
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
        M.toast({html: 'Por favor, selecione um cliente e endereço de entrega'});
        return;
    }

    const itens = [];
    let total = 0;

    document.querySelectorAll('.produto-item').forEach(row => {
        const saborId = row.querySelector('.sabor-select').value;
        const quantidade = parseInt(row.querySelector('.quantidade').value);
        const subtotal = parseFloat(row.querySelector('.subtotal').value);

        if (saborId && quantidade) {
            itens.push({
                produtos_id: parseInt(saborId),
                quantidade,
                preco_total: subtotal
            });
            total += subtotal;
        }
    });

    if (itens.length === 0) {
        M.toast({html: 'Adicione pelo menos um produto ao pedido'});
        return;
    }

    try {
        const response = await fetch(`${API_URL}/pedidos`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                clientes_id: cliente.id,
                produtos_id: itens[0].produtos_id, // Temporário: ajustar para múltiplos produtos
                quantidade: itens[0].quantidade,
                preco_total: total,
                endereco_entrega: endereco
            })
        });

        if (response.ok) {
            M.toast({html: 'Pedido realizado com sucesso!'});
            document.getElementById('orderForm').reset();
        } else {
            throw new Error('Erro ao criar pedido');
        }
    } catch (error) {
        console.error('Erro ao confirmar pedido:', error);
        M.toast({html: 'Erro ao criar pedido. Tente novamente.'});
    }
}

function atualizarSelectsProdutos() {
    const sabores = produtosData.reduce((acc, p) => {
        if (!acc.find(item => item.id === p.id)) {
            acc.push({ id: p.id, sabor: p.sabor });
        }
        return acc;
    }, []);

    const tamanhos = [...new Set(produtosData.map(p => p.tamanho))];
    
    const saborOptions = sabores.map(s => 
        `<option value="${s.id}">${s.sabor}</option>`
    ).join('');
    
    const tamanhoOptions = tamanhos.map(t => 
        `<option value="${t}">${t}</option>`
    ).join('');
    
    document.querySelectorAll('.sabor-select').forEach(select => {
        select.innerHTML = '<option value="" disabled selected>Escolha o sabor</option>' + saborOptions;
    });
    
    document.querySelectorAll('.tamanho-select').forEach(select => {
        select.innerHTML = '<option value="" disabled selected>Tamanho</option>' + tamanhoOptions;
    });
    
    M.FormSelect.init(document.querySelectorAll('select'));
}
