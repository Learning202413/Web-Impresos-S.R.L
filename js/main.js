// Inicializar Iconos Lucide
if (window.lucide) {
    window.lucide.createIcons();
}

// Lógica del Menú Móvil
document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('mobile-menu-btn');
    const menu = document.getElementById('mobile-menu');

    if (btn && menu) {
        btn.addEventListener('click', () => {
            menu.classList.toggle('hidden');
        });
    }
});