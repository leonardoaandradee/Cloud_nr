// Endereço completo de minha API
/* Lembre de mudar o endereço abaixo para o endereço do seu servidor Backend*/
const CONFIG = {
    API_URL: 'https://glowing-journey-jjqjvp5qwqvxfqjxj-4000.app.github.dev',
    URL_FRONT:'https://glowing-journey-jjqjvp5qwqvxfqjxj-3000.app.github.dev'    
};

// Exportar para Node.js quando estiver no servidor
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}
