const apiUrl = window.apiUrl || 'http://localhost:4000';
let editingPizzaId = null;

$(document).ready(() => { 
    loadPizzas();
    initializeMaterialize();
});

function initializeMaterialize() {
    const modals = document.querySelectorAll('.modal');
    M.Modal.init(modals);
    const sidenavs = document.querySelectorAll('.sidenav');
    M.Sidenav.init(sidenavs);
}

function showSuccessMessage(message) {
    const successModal = M.Modal.getInstance(document.getElementById("successModal"));
    document.getElementById("successModalMessage").textContent = message;
    successModal.open();
}

function savePizza() {
    const form = document.getElementById("registrationForm");
    const formData = new FormData(form);
    let pizza = {};
    let hasEmptyField = false;

    for (const [key, value] of formData) {
        if (!value.trim()) {
            hasEmptyField = true;
            break;
        }
        pizza[key] = value;
    }

    if (hasEmptyField) {
        M.toast({html: 'Por favor, preencha todos os campos.'});
        return;
    }

    const method = editingPizzaId ? "PUT" : "POST";
    const endpoint = editingPizzaId ? `${apiUrl}/produtos/${editingPizzaId}` : `${apiUrl}/produtos`;

    fetch(endpoint, {
        method: method,
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(pizza)
    }).then(response => {
        if (response.ok) {
            editingPizzaId = null;
            const message = method === "POST" ? "Pizza salva com sucesso!" : "Pizza alterada com sucesso!";
            M.toast({html: message});
            form.reset();
            loadPizzas();
        } else {
            M.toast({html: "Erro ao salvar os dados da pizza!"});
        }
    }).catch(err => {
        console.error('Erro:', err);
        M.toast({html: 'Erro ao salvar pizza: ' + err.message});
    });
}

function loadPizzas() {
    fetch(`${apiUrl}/produtos`)
        .then(res => {
            if (!res.ok) throw new Error('Erro ao carregar produtos');
            return res.json();
        })
        .then(response => {
            const pizzas = response.dados || [];
            const tbody = document.getElementById('products-list');
            if (!tbody) return;
            
            tbody.innerHTML = pizzas
                .sort((a, b) => a.sabor.localeCompare(b.sabor))
                .map(pizza => `
                    <tr>
                        <td>${pizza.sabor.toUpperCase()}</td>
                        <td>${pizza.descricao.toUpperCase()}</td>
                        <td>${pizza.categoria.toUpperCase()}</td>
                        <td>${pizza.tamanho.toUpperCase()}</td>
                        <td>R$ ${parseFloat(pizza.preco).toFixed(2)}</td>
                        <td>
                            <button class="btn-small waves-effect waves-light" onclick="editPizza(${pizza.id})">
                                <i class="material-icons">edit</i>
                            </button>
                            <button class="btn-small waves-effect waves-light red" onclick="deletePizza(${pizza.id})">
                                <i class="material-icons">delete</i>
                            </button>
                        </td>
                    </tr>
                `).join('');
        })
        .catch(err => {
            console.error('Erro:', err);
            M.toast({html: 'Erro ao carregar pizzas: ' + err.message});
        });
}

function editPizza(id) {
    fetch(`${apiUrl}/produtos/${id}`)
        .then(res => {
            if (!res.ok) throw new Error('Erro ao carregar pizza');
            return res.json();
        })
        .then(pizza => {
            document.getElementById("pizzaFlavor").value = pizza.sabor;
            document.getElementById("pizzaDescription").value = pizza.descricao;
            document.getElementById("pizzaCatg").value = pizza.categoria;
            document.getElementById("pizzaSize").value = pizza.tamanho;
            document.getElementById("pizzaPrice").value = pizza.preco;
            M.updateTextFields(); 
            editingPizzaId = id;
        })
        .catch(err => {
            console.error('Erro:', err);
            M.toast({html: 'Erro ao carregar pizza: ' + err.message});
        });
}

function deletePizza(id) {
    fetch(`${apiUrl}/produtos/${id}`, {
        method: "DELETE"
    })
    .then(response => {
        if (response.ok) {
            showSuccessMessage("Pizza deletada com sucesso!");
            setTimeout(() => location.reload(), 2000);
        } else {
            throw new Error('Erro ao deletar pizza');
        }
    })
    .catch(err => {
        console.error('Erro:', err);
        M.toast({html: 'Erro ao deletar pizza: ' + err.message});
    });
}