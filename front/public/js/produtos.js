let editingProductId = null;

// Função para carregar a lista de produtos
async function loadProducts() {
    try {
        const response = await fetch(`${CONFIG.API_URL}/produtos`);
        const data = await response.json();
        
        // A API retorna { sucesso: true, dados: [...] }
        const products = data.dados || [];
        
        const productsList = document.getElementById('products-list');
        productsList.innerHTML = '';
        
        if (products.length === 0) {
            productsList.innerHTML = '<tr><td colspan="6">Nenhum produto encontrado</td></tr>';
            return;
        }
        
        products.forEach(product => {
            productsList.innerHTML += `
                <tr>
                    <td>${product.sabor}</td>
                    <td>${product.descricao || ''}</td>
                    <td>${product.categoria || ''}</td>
                    <td>${product.tamanho}</td>
                    <td>R$ ${parseFloat(product.preco).toFixed(2)}</td>
                    <td>
                        <button onclick="editProduct(${product.id})" class="btn-small waves-effect waves-light green">Editar
                            <i class="material-icons">edit</i>
                        </button>
                        <button onclick="deleteProduct(${product.id})" class="btn-small waves-effect waves-light red">Deletar
                            <i class="material-icons">delete</i>
                        </button>
                    </td>
                </tr>
            `;
        });
    } catch (error) {
        console.error('Erro ao carregar produtos:', error);
        M.toast({html: 'Erro ao carregar produtos'});
        const productsList = document.getElementById('products-list');
        productsList.innerHTML = '<tr><td colspan="6">Erro ao carregar produtos</td></tr>';
    }
}

// Função para salvar ou atualizar um produto
async function saveProduct() {
    const form = document.getElementById('registrationForm');
    const formData = {
        sabor: form.sabor.value.toUpperCase(),
        descricao: form.descricao.value.toUpperCase(),
        categoria: form.categoria.value.toUpperCase(),
        tamanho: form.tamanho.value.toUpperCase(),
        preco: parseFloat(form.preco.value)
    };

    if (!formData.sabor || !formData.tamanho || !formData.preco) {
        M.toast({html: 'Por favor, preencha os campos obrigatórios'});
        return;
    }

    try {
        const url = editingProductId 
            ? `${CONFIG.API_URL}/produtos/${editingProductId}`
            : `${CONFIG.API_URL}/produtos`;
            
        const method = editingProductId ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (response.ok) {
            M.toast({html: data.mensagem || 'Produto salvo com sucesso!'});
            form.reset();
            editingProductId = null;
            loadProducts();
        } else {
            throw new Error(data.erro || 'Erro ao salvar produto');
        }
    } catch (error) {
        console.error('Erro:', error);
        M.toast({html: error.message || 'Erro ao salvar produto'});
    }
}

// Função para editar um produto
async function editProduct(productId) {
    try {
        const response = await fetch(`${CONFIG.API_URL}/produtos/${productId}`);
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.erro || 'Erro ao carregar produto');
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
        console.error('Erro ao carregar produto:', error);
        M.toast({html: error.message || 'Erro ao carregar produto para edição'});
    }
}

// Função para deletar um produto
async function deleteProduct(productId) {
    if (confirm('Tem certeza que deseja excluir este produto?')) {
        try {
            const response = await fetch(`${CONFIG.API_URL}/produtos/${productId}`, {
                method: 'DELETE'
            });
            
            const data = await response.json();

            if (response.ok) {
                M.toast({html: data.mensagem || 'Produto excluído com sucesso!'});
                loadProducts();
            } else {
                throw new Error(data.erro || 'Erro ao excluir produto');
            }
        } catch (error) {
            console.error('Erro:', error);
            M.toast({html: error.message || 'Erro ao excluir produto'});
        }
    }
}

// Carregar produtos quando a página for carregada
document.addEventListener('DOMContentLoaded', function() {
    loadProducts();
    M.FormSelect.init(document.querySelectorAll('select'));
});
