document.addEventListener('DOMContentLoaded', function() {
    checarLogin();

    const form = document.getElementById('login-form');
    if (form) {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            const username = form.username.value;
            const password = form.password.value;

            try {
                const response = await fetch('https://humble-space-halibut-5gqpw5x4p5vwc7q76-4000.app.github.dev/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password })
                });

                const data = await response.json();

                if (response.ok && data.token) {
                    // Salva o token JWT no localStorage
                    localStorage.setItem('token', data.token);
                    window.location.href = '/'; // Redireciona para a home após login
                } else {
                    alert(data.message || 'Usuário ou senha inválidos');
                }
            } catch (err) {
                alert('Erro ao tentar fazer login');
            }
        });
    }
});

// Função para checar se está logado (token presente e válido)
async function checarLogin() {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
        // Exemplo: checar status em uma rota protegida
        const response = await fetch('https://humble-space-halibut-5gqpw5x4p5vwc7q76-4000.app.github.dev/clientes', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (response.ok) {
            alert('login');
        } else {
            localStorage.removeItem('token');
        }
    } catch (err) {
        localStorage.removeItem('token');
    }
}

// Exemplo de fetch protegido para outras ações:
async function fetchProtegido(url, options = {}) {
    const token = localStorage.getItem('token');
    options.headers = options.headers || {};
    options.headers['Authorization'] = `Bearer ${token}`;
    return fetch(url, options);
}