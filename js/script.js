url="https://jubilant-dollop-g4v5wv4vgp5cwv7q-3000.app.github.dev/"; // URL do servidor

let editingPizzaId = null;

$(document).ready(() => { 
    // Fetch pizzas and populate the table
    fetch(url + "pizzas")
        .then((res) => res.json())
        .then((pizzas) => {
            pizzas.sort((a, b) => a.flavor.localeCompare(b.flavor)); 
            let pizzaList = "";
            pizzas.forEach(pizza => {
                pizzaList += `
                    <tr>
                        <td>${pizza.flavor.toUpperCase()}</td>
                        <td>${pizza.description.toUpperCase()}</td>
                        <td>${pizza.category.toUpperCase()}</td>
                        <td>${pizza.size.toUpperCase()}</td>
                        <td>${parseFloat(pizza.price).toFixed(2)}</td> 
                        <td>
                            <a class="waves-effect waves-light btn-small">
                                <i class="material-icons" onclick="editPizza(${pizza.id})">edit</i>
                            </a>
                            <a class="waves-effect waves-light btn-small">
                                <i class="material-icons" onclick="deletePizza(${pizza.id})">delete</i>
                            </a>
                        </td>
                    </tr>
                `;
            });
            $("#products-list").html(pizzaList);
        })
        .catch(err => console.error("Error fetching pizzas:", err));
});

document.addEventListener("DOMContentLoaded", function () {
    const modals = document.querySelectorAll(".modal");
    M.Modal.init(modals);
});

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
        alert("Por favor, preencha todos os campos.");
        return;
    }

    const method = editingPizzaId ? "PUT" : "POST";
    const endpoint = editingPizzaId ? url + "pizzas/" + editingPizzaId : url + "pizzas";

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
            showSuccessMessage(message);
            setTimeout(() => location.reload(), 2000);
        } else {
            console.error("Erro ao salvar os dados da pizza!");
        }
    });
}

function editPizza(id) {
    fetch(url + "pizzas/" + id)
        .then(res => res.json())
        .then(pizza => {
            document.getElementById("pizzaFlavor").value = pizza.flavor;
            document.getElementById("pizzaDescription").value = pizza.description;
            document.getElementById("pizzaCatg").value = pizza.category;
            document.getElementById("pizzaSize").value = pizza.size;
            document.getElementById("pizzaPrice").value = pizza.price;
            M.updateTextFields(); 
            editingPizzaId = id;
        });
}

function deletePizza(id) {
    fetch(url + "pizzas/" + id, {
        method: "DELETE"
    })
    .then(response => {
        if (response.ok) {
            showSuccessMessage("Pizza deletada com sucesso!");
            setTimeout(() => location.reload(), 2000);
        } else {
            console.error("Erro ao deletar a pizza com ID:", id);
        }
    });
}