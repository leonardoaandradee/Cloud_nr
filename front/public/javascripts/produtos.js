document.addEventListener('DOMContentLoaded', () => {
    // Atualize a URL base para usar a URL do backend
    const API_URL = 'https://cuddly-disco-wrgrpq7gj56w299p9-4000.app.github.dev/produtos';
    
    const fetchConfig = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        mode: 'cors',
        credentials: 'same-origin'
    };

    // Função para carregar produtos atualizada
    function carregarProdutos() {
        fetch(API_URL, fetchConfig)
            .then(response => response.json())
            .then(data => {
                const container = document.getElementById('produtosContainer');
                container.innerHTML = '';
                
                data.dados.forEach(produto => {
                    const produtoDiv = document.createElement('div');
                    produtoDiv.className = 'produto-item';
                    produtoDiv.innerHTML = `
                        <h3>${produto.sabor}</h3>
                        <p>Descrição: ${produto.descricao || 'N/A'}</p>
                        <p>Categoria: ${produto.categoria || 'N/A'}</p>
                        <p>Tamanho: ${produto.tamanho}</p>
                        <p>Preço: R$ ${produto.preco.toFixed(2)}</p>
                        <button onclick="editarProduto(${produto.id})">Editar</button>
                        <button onclick="excluirProduto(${produto.id})">Excluir</button>
                    `;
                    container.appendChild(produtoDiv);
                });
            })
            .catch(error => console.error('Erro ao carregar produtos:', error));
    }

    // Atualizar o POST para usar a configuração correta
    document.getElementById('produtoForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const produto = {
            sabor: document.getElementById('sabor').value,
            descricao: document.getElementById('descricao').value,
            categoria: document.getElementById('categoria').value,
            tamanho: document.getElementById('tamanho').value,
            preco: parseFloat(document.getElementById('preco').value)
        };

        fetch(API_URL, {
            ...fetchConfig,
            method: 'POST',
            body: JSON.stringify(produto)
        })
        .then(response => response.json())
        .then(data => {
            alert('Produto cadastrado com sucesso!');
            document.getElementById('produtoForm').reset();
            carregarProdutos();
        })
        .catch(error => console.error('Erro ao cadastrar produto:', error));
    });

    // Atualizar DELETE para usar a configuração correta
    window.excluirProduto = (id) => {
        if (confirm('Deseja realmente excluir este produto?')) {
            fetch(`${API_URL}/${id}`, {
                ...fetchConfig,
                method: 'DELETE'
            })
            .then(response => response.json())
            .then(data => {
                alert('Produto excluído com sucesso!');
                carregarProdutos();
            })
            .catch(error => console.error('Erro ao excluir produto:', error));
        }
    };

    carregarProdutos();
});
