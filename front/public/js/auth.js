// Usar o CONFIG definido globalmente em vez de tentar importar com require
// O require não funciona no navegador, apenas no Node.js
// const CONFIG = require('./config');

/**
 * Verifica se o usuário está autenticado
 * Redireciona para login se não tiver token válido
 */
async function verificarAutenticacao() {
    const token = localStorage.getItem('token');
    
    // Se não tiver token, retorna falso
    if (!token) {
        console.log('Nenhum token encontrado');
        return false;
    }

    try {
        // Verificar se o token é válido - podemos usar a rota de clientes como alternativa
        const response = await fetch(`${CONFIG.API_URL}/clientes`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        console.log('Verificação de token retornou:', response.status);

        if (!response.ok) {
            // Token inválido ou expirado
            console.log('Token inválido, removendo...');
            localStorage.removeItem('token');
            return false;
        }

        console.log('Token válido');
        return true;
    } catch (err) {
        console.error('Erro ao verificar autenticação:', err);
        localStorage.removeItem('token');
        return false;
    }
}

/**
 * Redireciona para a página de login
 */
function redirecionarParaLogin() {
    // Salva a URL atual para retornar após o login
    if (window.location.pathname !== '/login') {
        localStorage.setItem('urlAnterior', window.location.pathname);
        window.location.href = '/login';
    }
}

/**
 * Logout - remove o token e redireciona para login
 */
function logout() {
    console.log('Realizando logout...');
    // Remover o token de autenticação do localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('urlAnterior');
    
    // Redirecionar para a página de login
    window.location.href = '/login';
}

// Exporta as funções para uso global
window.auth = {
    verificarAutenticacao,
    redirecionarParaLogin,
    logout
};

// Verifica autenticação imediatamente ao carregar qualquer página
document.addEventListener('DOMContentLoaded', async function() {
    // Não verificamos na página de login
    if (window.location.pathname === '/login') {
        return;
    }
    
    try {
        const autenticado = await verificarAutenticacao();
        if (!autenticado) {
            redirecionarParaLogin();
        }
    } catch (err) {
        console.error('Erro na verificação de autenticação:', err);
        redirecionarParaLogin();
    }
});
