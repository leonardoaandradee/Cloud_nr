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

// Função para carregar a lista de produtos
async function loadProducts() {
    try {
        const response = await fetch(`${CONFIG.API_URL}/produtos`);
        if (!response.ok) throw new Error(MENSAGENS.ERRO_CARREGAR);
        
        const { dados: products = [] } = await response.json();
        const productsList = document.getElementById('products-list');
        
        productsList.innerHTML = products.length === 0 
            ? '<tr><td colspan="6">Nenhum produto encontrado</td></tr>'
            : products.map(product => `
                <tr>
                    <td>${product.sabor}</td>
                    <td>${product.descricao || ''}</td>
                    <td>${product.categoria || ''}</td>
                    <td>${product.tamanho}</td>
                    <td>R$ ${parseFloat(product.preco).toFixed(2)}</td>
                    <td>
                        <button onclick="editProduct(${product.id})" class="btn-small waves-effect waves-light green">
                            Editar<i class="material-icons">edit</i>
                        </button>
                        <button onclick="deleteProduct(${product.id})" class="btn-small waves-effect waves-light red">
                            Deletar<i class="material-icons">delete</i>
                        </button>
                    </td>
                </tr>
            `).join('');
    } catch (error) {
        console.error(MENSAGENS.ERRO_CARREGAR, error);
        M.toast({html: MENSAGENS.ERRO_CARREGAR});
        document.getElementById('products-list').innerHTML = 
            '<tr><td colspan="6">Erro ao carregar produtos</td></tr>';
    }
}

// Função para salvar ou atualizar um produto
async function saveProduct() {
    const form = document.getElementById('registrationForm');
    const formData = {
        sabor: form.sabor.value.trim().toUpperCase(),
        descricao: form.descricao.value.trim().toUpperCase(),
        categoria: form.categoria.value.trim().toUpperCase(),
        tamanho: form.tamanho.value.trim().toUpperCase(),
        preco: parseFloat(form.preco.value)
    };

    if (!formData.sabor || !formData.tamanho || isNaN(formData.preco)) {
        M.toast({html: MENSAGENS.CAMPOS_OBRIGATORIOS});
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

        M.toast({html: data.mensagem || MENSAGENS.SUCESSO_SALVAR});
        form.reset();
        editingProductId = null;
        await loadProducts();
    } catch (error) {
        console.error('Erro:', error);
        M.toast({html: error.message || MENSAGENS.ERRO_SALVAR});
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
        M.toast({html: error.message || MENSAGENS.ERRO_EDITAR});
    }
}

// Função para deletar um produto
async function deleteProduct(productId) {
    if (!confirm(MENSAGENS.CONFIRMA_DELETAR)) return;
    
    try {
        const response = await fetch(`${CONFIG.API_URL}/produtos/${productId}`, {
            method: 'DELETE'
        });
        
        const data = await response.json();
        if (!response.ok) throw new Error(data.erro || MENSAGENS.ERRO_DELETAR);

        M.toast({html: data.mensagem || MENSAGENS.SUCESSO_DELETAR});
        await loadProducts();
    } catch (error) {
        console.error('Erro:', error);
        M.toast({html: error.message || MENSAGENS.ERRO_DELETAR});
    }
}

// Carregar produtos quando a página for carregada
document.addEventListener('DOMContentLoaded', function() {
    loadProducts();
    M.FormSelect.init(document.querySelectorAll('select'));
});
