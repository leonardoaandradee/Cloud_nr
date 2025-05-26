const MENSAGENS = {
    ERRO_CARREGAR: 'Erro ao carregar produtos',
    ERRO_SALVAR: 'Erro ao salvar produto',
    ERRO_DELETAR: 'Erro ao excluir produto',
    ERRO_EDITAR: 'Erro ao carregar produto para edição',
    CAMPOS_OBRIGATORIOS: 'Por favor, preencha os campos obrigatórios',
    SUCESSO_SALVAR: 'Produto salvo com sucesso!',
    SUCESSO_DELETAR: 'Produto excluído com sucesso!',
    CONFIRMA_DELETAR: 'Tem certeza que deseja excluir este produto?'
};

let editingProductId = null;

// Função para salvar ou atualizar um produto
async function saveProduto() {
    const form = document.getElementById('registrationForm');
    const formData = {
        sabor: form.sabor.value.trim().toUpperCase(),
        descricao: form.descricao.value.trim().toUpperCase(),
        categoria: form.categoria.value.trim().toUpperCase(),
        tamanho: form.tamanho.value.trim().toUpperCase(),
        preco: parseFloat(form.preco.value)
    };

    if (!formData.sabor || !formData.tamanho || isNaN(formData.preco)) {
        mostrarErro(MENSAGENS.CAMPOS_OBRIGATORIOS);
        return;
    }

    try {
        const url = editingProductId 
            ? `${CONFIG.API_URL}/produtos/${editingProductId}`
            : `${CONFIG.API_URL}/produtos`;
            
        const response = await fetch(url, {
            method: editingProductId ? 'PUT' : 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.erro || MENSAGENS.ERRO_SALVAR);

        mostrarSucesso(data.mensagem || MENSAGENS.SUCESSO_SALVAR);
        form.reset();
        editingProductId = null;
        await loadProdutos();
    } catch (error) {
        console.error('Erro:', error);
        mostrarErro(error.message || MENSAGENS.ERRO_SALVAR);
    }
}

// Função para editar um produto
async function editProduct(productId) {
    try {
        const response = await fetch(`${CONFIG.API_URL}/produtos/${productId}`);
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.erro || MENSAGENS.ERRO_EDITAR);
        }

        const product = data.dados;
        
        const form = document.getElementById('registrationForm');
        form.sabor.value = product.sabor;
        form.descricao.value = product.descricao || '';
        form.categoria.value = product.categoria || '';
        form.tamanho.value = product.tamanho;
        form.preco.value = product.preco;
        
        editingProductId = productId;
        M.updateTextFields();
        
        // Atualizar os selects do Materialize
        M.FormSelect.init(document.querySelectorAll('select'));
    } catch (error) {
        console.error(MENSAGENS.ERRO_EDITAR, error);
        mostrarErro(error.message || MENSAGENS.ERRO_EDITAR);
    }
}

// Função para deletar um produto
async function deleteProduct(productId) {
    const result = await Swal.fire({
        title: 'Confirmar exclusão',
        text: MENSAGENS.CONFIRMA_DELETAR,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sim, excluir!',
        cancelButtonText: 'Cancelar'
    });

    if (!result.isConfirmed) return;
    
    try {
        const response = await fetch(`${CONFIG.API_URL}/produtos/${productId}`, {
            method: 'DELETE'
        });
        
        const data = await response.json();
        if (!response.ok) throw new Error(data.erro || MENSAGENS.ERRO_DELETAR);

        mostrarSucesso(data.mensagem || MENSAGENS.SUCESSO_DELETAR);
        await loadProdutos();
    } catch (error) {
        console.error('Erro:', error);
        mostrarErro(error.message || MENSAGENS.ERRO_DELETAR);
    }
}

// Função para carregar a lista de produtos
async function loadProdutos() {
    try {
        const response = await fetch(`${CONFIG.API_URL}/produtos`);
        if (!response.ok) throw new Error(MENSAGENS.ERRO_CARREGAR);
        
        const { dados: produtos = [] } = await response.json();
        
        // Ordenando os produtos por sabor em ordem alfabética
        const sortedProdutos = produtos.sort((a, b) => 
            a.sabor.localeCompare(b.sabor, 'pt-BR', { sensitivity: 'base' })
        );
        
        const produtosList = document.getElementById('produtos-list');
        
        produtosList.innerHTML = sortedProdutos.length === 0 
            ? '<tr><td colspan="6">Nenhum produto encontrado</td></tr>'
            : sortedProdutos.map(produto => `
                <tr>
                    <td>${produto.sabor || ''}</td>
                    <td>${produto.descricao || ''}</td>
                    <td>${produto.categoria || ''}</td>
                    <td>${produto.tamanho || ''}</td>
                    <td>R$ ${produto.preco ? Number(produto.preco).toFixed(2) : '0.00'}</td>
                    <td>
                        <button onclick="editProduct(${produto.id})" class="btn-small waves-effect waves-light green">
                            <i class="material-icons">edit</i>
                        </button>
                        <button onclick="deleteProduct(${produto.id})" class="btn-small waves-effect waves-light red">
                            <i class="material-icons">delete</i>
                        </button>
                    </td>
                </tr>
            `).join('');
    } catch (error) {
        console.error('Erro ao carregar produtos:', error);
        M.toast({html: MENSAGENS.ERRO_CARREGAR});
    }
}

function toggleProdutosList() {
    const table = $('#produtosTable');
    if (table.is(':visible')) {
        table.hide();
    } else {
        loadProdutos(); // Recarrega a lista antes de exibir
        table.show();
    }
}

// Funções auxiliares para mostrar mensagens
function mostrarErro(mensagem) {
    Swal.fire({
        icon: 'error',
        title: 'Erro',
        text: mensagem
    });
}

function mostrarSucesso(mensagem) {
    Swal.fire({
        icon: 'success',
        title: 'Sucesso',
        text: mensagem
    });
}

// Carregar produtos quando a página for carregada
document.addEventListener('DOMContentLoaded', function() {
    loadProdutos(); // Alterado de loadProducts para loadProdutos
    M.FormSelect.init(document.querySelectorAll('select'));
    $('#produtosTable').hide();
});
