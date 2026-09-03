// ---------- Tema claro/escuro (compartilhado entre todas as páginas) ----------
(function () {
    const root = document.documentElement;
    const toggles = [
        document.getElementById('themeToggle'),
        document.getElementById('themeToggleMobile')
    ].filter(Boolean);

    function applyTheme(theme) {
        root.setAttribute('data-theme', theme);
        localStorage.setItem('hod-theme', theme);
        toggles.forEach(btn => btn.setAttribute('aria-pressed', theme === 'dark'));
    }

    toggles.forEach(btn => {
        btn.addEventListener('click', () => {
            const current = root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
            applyTheme(current === 'dark' ? 'light' : 'dark');
        });
    });

    if (window.matchMedia) {
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (!localStorage.getItem('hod-theme')) {
                root.setAttribute('data-theme', e.matches ? 'dark' : 'light');
            }
        });
    }
})();