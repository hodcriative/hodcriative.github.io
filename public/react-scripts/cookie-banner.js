// Banner de cookies — exibido na primeira visita, lembra a escolha do usuário.
// Também controla o carregamento dos vídeos incorporados do Vimeo: eles só
// recebem "src" (e passam a fazer requisições/gravar cookies do Vimeo)
// depois que o usuário aceita o banner, ou clica manualmente em "Carregar
// vídeo" num embed específico (consentimento pontual, sem afetar a escolha
// global de cookies).
(function () {

    // ---------- Carregamento sob consentimento dos embeds do Vimeo ----------
    function loadVimeoEmbed(wrapper) {
        const iframe = wrapper.querySelector('iframe[data-vimeo-src]');
        if (!iframe) return;
        iframe.setAttribute('src', iframe.getAttribute('data-vimeo-src'));
        iframe.removeAttribute('data-vimeo-src');
        wrapper.classList.add('vimeo-loaded');
    }

    function loadAllVimeoEmbeds() {
        document.querySelectorAll('.vimeo-gate').forEach(loadVimeoEmbed);
    }

    document.querySelectorAll('.vimeo-gate-btn').forEach((btn) => {
        btn.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();
            loadVimeoEmbed(btn.closest('.vimeo-gate'));
        });
    });

    // ---------- Banner de cookies ----------
    const banner = document.getElementById('cookieBanner');
    const choice = localStorage.getItem('hod-cookie-choice');

    // Se o usuário já aceitou os cookies antes, carrega os vídeos direto.
    if (choice === 'accepted') {
        loadAllVimeoEmbeds();
    }

    if (!banner) return;

    const accept = document.getElementById('cookieAccept');
    const reject = document.getElementById('cookieReject');

    if (!choice) {
        setTimeout(() => banner.classList.add('show'), 600);
    }

    function hideBanner(value) {
        localStorage.setItem('hod-cookie-choice', value);
        banner.classList.remove('show');
    }

    accept?.addEventListener('click', () => {
        hideBanner('accepted');
        loadAllVimeoEmbeds();
    });
    reject?.addEventListener('click', () => hideBanner('rejected'));
})();