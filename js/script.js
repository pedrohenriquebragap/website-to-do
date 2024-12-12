// Seleção de elementos DOM
const hamburger = document.querySelector('.hamburger');
const navOverlay = document.querySelector('.nav-overlay');
const navLinks = document.querySelectorAll('.nav-menu a');

// Verifica se todos os elementos necessários existem
if (!hamburger || !navOverlay) {
    console.warn('Elementos necessários da navbar não encontrados');
    throw new Error('Elementos da navbar não encontrados');
}

// Estado do menu
let isMenuOpen = false;

/**
 * Toggle do menu
 * @param {boolean} force - Força um estado específico (opcional)
 */
function toggleMenu(force) {
    isMenuOpen = force !== undefined ? force : !isMenuOpen;
    
    // Atualiza classes e atributos ARIA
    hamburger.classList.toggle('active', isMenuOpen);
    navOverlay.classList.toggle('active', isMenuOpen);
    hamburger.setAttribute('aria-expanded', isMenuOpen);
    navOverlay.setAttribute('aria-hidden', !isMenuOpen);
    
    // Bloqueia/desbloqueia scroll do body
    document.body.style.overflow = isMenuOpen ? 'hidden' : '';
    
    // Atualiza o texto do leitor de tela
    hamburger.setAttribute('aria-label', 
        isMenuOpen ? 'Fechar menu' : 'Abrir menu'
    );
}

/**
 * Fecha o menu ao pressionar Esc
 * @param {KeyboardEvent} event 
 */
function handleKeyDown(event) {
    if (event.key === 'Escape' && isMenuOpen) {
        toggleMenu(false);
    }
}

/**
 * Fecha o menu ao clicar fora
 * @param {MouseEvent} event 
 */
function handleOutsideClick(event) {
    const isOutside = !event.target.closest('.nav-menu') && 
                     !event.target.closest('.hamburger');
    
    if (isMenuOpen && isOutside) {
        toggleMenu(false);
    }
}

// Inicialização segura dos event listeners
function initializeEventListeners() {
    // Event listener para o hamburger
    hamburger.addEventListener('click', () => toggleMenu());

    // Event listeners para os links do menu (se existirem)
    if (navLinks.length > 0) {
        navLinks.forEach(link => {
            if (link) {
                link.addEventListener('click', () => toggleMenu(false));
            }
        });
    }

    // Event listeners globais
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('click', handleOutsideClick);

    // Gerenciamento de eventos de redimensionamento
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            if (window.innerWidth > 768 && isMenuOpen) {
                toggleMenu(false);
            }
        }, 250);
    });
}

// Inicializa os event listeners quando o DOM estiver completamente carregado
/**
 * Gerencia o tema da aplicação
 */
function initializeTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
}

/**
 * Alterna entre os temas
 * @param {string} theme - Nome do tema ('light' ou 'dark')
 */
function toggleTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
}

// Inicializa os event listeners e o tema
document.addEventListener('DOMContentLoaded', () => {
    initializeEventListeners();
    initializeTheme();

    // Event listeners para os botões de tema
    document.querySelectorAll('.theme-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const theme = btn.dataset.theme;
            toggleTheme(theme);
        });
    });
});