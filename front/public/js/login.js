document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('login-form');
    if (form) {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            const username = form.username.value;
            const password = form.password.value;

            try {
                // Mostrar mensagem de processamento
                const toast = M.toast({html: 'Processando login...', classes: 'blue'});
                
                console.log(`Enviando requisição para ${CONFIG.API_URL}/login`);
                const response = await fetch(`${CONFIG.API_URL}/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password })
                });

                toast.dismiss();
                console.log('Resposta recebida:', response.status);
                
                // Tentar ler o corpo da resposta
                let data;
                try {
                    data = await response.json();
                    console.log('Dados recebidos:', data);
                } catch (jsonError) {
                    console.error('Erro ao processar resposta JSON:', jsonError);
                    data = { message: 'Erro ao processar resposta do servidor' };
                }

                if (response.ok && data.token) {
                    // Salva o token JWT no localStorage
                    localStorage.setItem('token', data.token);
                    M.toast({html: 'Login realizado com sucesso!', classes: 'green'});
                    
                    // Redireciona para a página inicial sempre
                    window.location.href = '/';
                } else {
                    // Exibe mensagem de erro
                    M.toast({html: data.message || 'Usuário ou senha inválidos', classes: 'red'});
                }
            } catch (err) {
                console.error('Erro ao fazer login:', err);
                M.toast({html: 'Erro ao tentar fazer login. Verifique se a API está disponível.', classes: 'red'});
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
        const response = await fetch(`${CONFIG.API_URL}/clientes`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (response.ok) {
            console.log('Login verificado com sucesso');
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