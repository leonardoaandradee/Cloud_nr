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

// Variável para controlar o estado de visibilidade da lista de produtos
let isProductListVisible = true;

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

function mostrarErro(mensagem) {
    Swal.fire({
        title: 'Erro!',
        text: mensagem,
        icon: 'error'
    });
}

function mostrarSucesso(mensagem) {
    Swal.fire({
        title: 'Sucesso!',
        text: mensagem,
        icon: 'success'
    });
}

// Função para carregar a lista de produtos
async function loadProducts() {
    try {
        const response = await fetchJWT(`${CONFIG.API_URL}/produtos`);
        if (tratar401(response)) return;
        if (!response.ok) throw new Error(MENSAGENS.ERRO_CARREGAR);
        
        const { dados: products = [] } = await response.json();
        
        // Ordenar produtos por sabor em ordem alfabética
        products.sort((a, b) => a.sabor.localeCompare(b.sabor));
        
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
                            <i class="material-icons">edit</i>
                        </button>
                        <button onclick="deleteProduct(${product.id})" class="btn-small waves-effect waves-light red">
                            <i class="material-icons">delete</i>
                        </button>
                    </td>
                </tr>
            `).join('');
    } catch (error) {
        console.error(MENSAGENS.ERRO_CARREGAR, error);
        mostrarErro(MENSAGENS.ERRO_CARREGAR);
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
        mostrarErro(MENSAGENS.CAMPOS_OBRIGATORIOS);
        return;
    }

    try {
        const url = editingProductId 
            ? `${CONFIG.API_URL}/produtos/${editingProductId}`
            : `${CONFIG.API_URL}/produtos`;
            
        const response = await fetchJWT(url, {
            method: editingProductId ? 'PUT' : 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.erro || MENSAGENS.ERRO_SALVAR);

        mostrarSucesso(data.mensagem || MENSAGENS.SUCESSO_SALVAR);
        form.reset();
        editingProductId = null;
        await loadProducts();
    } catch (error) {
        console.error('Erro:', error);
        mostrarErro(error.message || MENSAGENS.ERRO_SALVAR);
    }
}

// Função para editar um produto
async function editProduct(productId) {
    try {
        const response = await fetchJWT(`${CONFIG.API_URL}/produtos/${productId}`);
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
        const response = await fetchJWT(`${CONFIG.API_URL}/produtos/${productId}`, {
            method: 'DELETE'
        });
        
        const data = await response.json();
        if (!response.ok) throw new Error(data.erro || MENSAGENS.ERRO_DELETAR);

        mostrarSucesso(data.mensagem || MENSAGENS.SUCESSO_DELETAR);
        await loadProducts();
    } catch (error) {
        console.error('Erro:', error);
        mostrarErro(error.message || MENSAGENS.ERRO_DELETAR);
    }
}

// Função para alternar a visibilidade da lista de produtos
function toggleProductListVisibility() {
    const productListContainer = document.getElementById('productListContainer');
    const visibilityIcon = document.getElementById('visibilityIcon');
    const visibilityText = document.getElementById('visibilityText');
    
    isProductListVisible = !isProductListVisible;
    
    if (isProductListVisible) {
        productListContainer.style.display = 'block';
        visibilityIcon.textContent = 'visibility';
        visibilityText.textContent = 'Ocultar';
    } else {
        productListContainer.style.display = 'none';
        visibilityIcon.textContent = 'visibility_off';
        visibilityText.textContent = 'Exibir';
    }
    
    // Salvar preferência do usuário no localStorage
    localStorage.setItem('productListVisible', isProductListVisible);
}

// Carregar produtos quando a página for carregada
document.addEventListener('DOMContentLoaded', function() {
    loadProducts();
    M.FormSelect.init(document.querySelectorAll('select'));
    
    // Recuperar preferência do usuário para visibilidade da lista
    const savedVisibility = localStorage.getItem('productListVisible');
    if (savedVisibility !== null) {
        isProductListVisible = savedVisibility === 'true';
        if (!isProductListVisible) {
            // Se a preferência for ocultar, atualizamos a interface
            const productListContainer = document.getElementById('productListContainer');
            const visibilityIcon = document.getElementById('visibilityIcon');
            const visibilityText = document.getElementById('visibilityText');
            
            productListContainer.style.display = 'none';
            visibilityIcon.textContent = 'visibility_off';
            visibilityText.textContent = 'Exibir';
        }
    }
});
