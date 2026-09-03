/* =========================================================
   FORMATURAS.JS
   Reaproveita o mesmo motor de Reveal / Masonry / Filtros já
   usado na Home (mesma lógica, adaptada para a galeria desta
   página) e adiciona o Lightbox exclusivo do catálogo, além
   do parallax de scroll e tilt no mouse dos cards de
   Informações do evento.
   Vanilla JS puro, sem dependências externas.
   ========================================================= */

(() => {

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isTouch = window.matchMedia('(hover: none)').matches;

    /* ---------- Reveal on scroll (mesmo padrão do index.html) ---------- */
    const io = new IntersectionObserver((entries) => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                e.target.classList.add('in');
                io.unobserve(e.target);
            }
        });
    }, { threshold: 0.12 });

    function applyStagger(selector, step = 80) {
        document.querySelectorAll(selector).forEach(group => {
            Array.from(group.children).forEach((child, i) => {
                child.classList.add('reveal');
                child.style.transitionDelay = `${i * step}ms`;
            });
        });
    }
    applyStagger('.grad-info-grid', 70);
    applyStagger('.grad-process-line', 90);
    applyStagger('.grad-backstage-grid', 70);

    document.querySelectorAll('.reveal').forEach(el => io.observe(el));

    if (!prefersReducedMotion && !isTouch) {
        document.querySelectorAll('[data-intro-parallax]').forEach(el => {
            el.addEventListener('mousemove', (e) => {
                const rect = el.getBoundingClientRect();
                const x = (e.clientX - rect.left) / rect.width - .5;
                const y = (e.clientY - rect.top) / rect.height - .5;
                el.style.transform = `perspective(900px) translate3d(${x * 9}px, ${y * 9}px, 0) rotateX(${-y * 3}deg) rotateY(${x * 3}deg)`;
            });
            el.addEventListener('mouseleave', () => { el.style.transform = ''; });
        });
    }

    /* ---------- Masonry inteligente da galeria (mesmo algoritmo do index) ---------- */
    function layoutMasonry(containerSelector, itemSelector) {
        const container = document.querySelector(containerSelector);
        if (!container) return;

        const items = Array.from(container.querySelectorAll(itemSelector))
            .filter(el => !el.classList.contains('filtered-out'));

        if (!items.length) {
            container.style.height = '0px';
            return;
        }

        const gap = 20;
        const minColWidth = 260;
        const containerWidth = container.clientWidth;
        const cols = Math.max(1, Math.min(4, Math.floor((containerWidth + gap) / (minColWidth + gap))));
        const colWidth = (containerWidth - gap * (cols - 1)) / cols;
        const colHeights = new Array(cols).fill(0);

        items.forEach(item => {
            item.style.width = `${colWidth}px`;

            let shortest = 0;
            for (let i = 1; i < cols; i++) {
                if (colHeights[i] < colHeights[shortest]) shortest = i;
            }

            item.style.left = `${shortest * (colWidth + gap)}px`;
            item.style.top = `${colHeights[shortest]}px`;
            item.style.visibility = 'visible';

            colHeights[shortest] += item.offsetHeight + gap;
        });

        container.style.height = `${Math.max(...colHeights) - gap}px`;
    }

    const relayout = () => layoutMasonry('.grad-masonry', '.grad-item');

    window.addEventListener('load', relayout);
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(relayout, 150);
    });

    /* ---------- Filtro da galeria (mesmo componente visual dos filtros do index) ---------- */
    const filterBtns = document.querySelectorAll('.grad-filters .filter-btn');
    const gradItems = document.querySelectorAll('.grad-item');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filter = btn.dataset.filter;

            gradItems.forEach(item => {
                const cats = (item.dataset.category || '').split(' ');
                const show = filter === 'all' || cats.includes(filter);
                item.classList.toggle('filtered-out', !show);
            });

            relayout();
        });
    });

    /* ---------- Autoplay dos vídeos da galeria via IntersectionObserver ---------- */
    const galleryVideos = document.querySelectorAll('.grad-item video, .grad-feat-main video, .grad-feat-side video');
    const videoIO = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const v = entry.target;
            if (entry.isIntersecting) {
                v.play().catch(() => {});
            } else {
                v.pause();
            }
        });
    }, { threshold: 0.35 });
    galleryVideos.forEach(v => videoIO.observe(v));

    /* Hover no vídeo principal em destaque pausa os secundários (pedido do briefing) */
    const featMain = document.querySelector('.grad-feat-main video');
    const featSideVideos = document.querySelectorAll('.grad-feat-side video');
    if (featMain && featSideVideos.length && !isTouch) {
        featMain.addEventListener('mouseenter', () => featSideVideos.forEach(v => v.pause()));
        featMain.addEventListener('mouseleave', () => featSideVideos.forEach(v => v.play().catch(() => {})));
    }

    /* ---------- Parallax de scroll + tilt no mouse — Informações do evento ---------- */
    const infoCards = document.querySelectorAll('.grad-info-card');

    if (infoCards.length && !prefersReducedMotion) {

        // Parallax vertical ao rolar a página (velocidades diferentes por card)
        function parallaxInfoCards() {
            const viewportH = window.innerHeight;

            infoCards.forEach((card, i) => {
                const rect = card.getBoundingClientRect();
                const center = rect.top + rect.height / 2;
                const distFromCenter = (center - viewportH / 2) / viewportH;

                const speed = 14 + (i % 2) * 6; // varia entre os cards
                const y = distFromCenter * speed;

                card.style.setProperty('--parallaxY', `${y}px`);
            });
        }

        let ticking = false;
        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    parallaxInfoCards();
                    ticking = false;
                });
                ticking = true;
            }
        });
        window.addEventListener('load', parallaxInfoCards);
        window.addEventListener('resize', parallaxInfoCards);
        parallaxInfoCards();

        // Tilt 3D sutil no mouse (apenas desktop)
        if (!isTouch) {
            infoCards.forEach(card => {
                card.addEventListener('mousemove', (e) => {
                    const rect = card.getBoundingClientRect();
                    const x = e.clientX - rect.left - rect.width / 2;
                    const y = e.clientY - rect.top - rect.height / 2;

                    const rotateX = (-y / rect.height) * 8;
                    const rotateY = (x / rect.width) * 8;

                    card.style.setProperty('--tiltX', `${rotateX}deg`);
                    card.style.setProperty('--tiltY', `${rotateY}deg`);
                });

                card.addEventListener('mouseleave', () => {
                    card.style.setProperty('--tiltX', '0deg');
                    card.style.setProperty('--tiltY', '0deg');
                });
            });
        }
    }

    /* ---------- Lightbox ---------- */
    const lightbox = document.getElementById('gradLightbox');
    const lbStage = document.getElementById('gradLightboxStage');
    const lbCounter = document.getElementById('gradLightboxCounter');
    const lbCaption = document.getElementById('gradLightboxCaption');
    const lbPrev = document.getElementById('gradLightboxPrev');
    const lbNext = document.getElementById('gradLightboxNext');
    const lbClose = document.getElementById('gradLightboxClose');

    // Todos os itens clicáveis da galeria (fotos) entram no percurso do lightbox.
    const lightboxItems = Array.from(document.querySelectorAll('[data-lightbox="grad"]'));
    let currentIndex = 0;

    function renderLightbox(index) {
        const el = lightboxItems[index];
        if (!el) return;

        const type = el.dataset.type || 'image';
        const src = el.dataset.full || el.dataset.src;
        const caption = el.dataset.caption || '';

        lbStage.innerHTML = '';

        if (type === 'video') {
            const video = document.createElement('video');
            video.src = src;
            video.controls = true;
            video.autoplay = true;
            video.playsInline = true;
            lbStage.appendChild(video);
        } else {
            const img = document.createElement('img');
            img.src = src;
            img.alt = caption || 'Foto de formatura';
            lbStage.appendChild(img);
        }

        lbCaption.textContent = caption;
        lbCounter.textContent = `${index + 1} / ${lightboxItems.length}`;
        currentIndex = index;
    }

    function openLightbox(index) {
        renderLightbox(index);
        lightbox.classList.add('open');
        lightbox.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
        lightbox.classList.remove('open');
        lightbox.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        lbStage.innerHTML = '';
    }

    function showNext() { openLightbox((currentIndex + 1) % lightboxItems.length); }
    function showPrev() { openLightbox((currentIndex - 1 + lightboxItems.length) % lightboxItems.length); }

    lightboxItems.forEach((el, i) => {
        el.addEventListener('click', (e) => {
            e.preventDefault();
            openLightbox(i);
        });
        el.setAttribute('tabindex', '0');
        el.setAttribute('role', 'button');
        el.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openLightbox(i);
            }
        });
    });

    lbClose?.addEventListener('click', closeLightbox);
    lbNext?.addEventListener('click', showNext);
    lbPrev?.addEventListener('click', showPrev);

    lightbox?.addEventListener('click', (e) => {
        if (e.target === lightbox) closeLightbox();
    });

    document.addEventListener('keydown', (e) => {
        if (!lightbox.classList.contains('open')) return;
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowRight') showNext();
        if (e.key === 'ArrowLeft') showPrev();
    });

    /* Suporte a swipe no mobile */
    let touchStartX = 0;
    lbStage?.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].clientX;
    }, { passive: true });

    lbStage?.addEventListener('touchend', (e) => {
        const delta = e.changedTouches[0].clientX - touchStartX;
        if (Math.abs(delta) > 50) {
            delta < 0 ? showNext() : showPrev();
        }
    }, { passive: true });

    /* ---------- Depoimentos: pausa o carrossel ao passar o mouse já é feito via CSS (:hover) ---------- */

    /* ---------- CTA Spotlight (mesmo efeito da Home) ---------- */
    const ctaSection = document.getElementById('gradCtaSection');
    const ctaSpotlight = document.getElementById('gradCtaSpotlight');
    if (ctaSection && ctaSpotlight && !prefersReducedMotion && !isTouch) {
        ctaSection.addEventListener('mousemove', (e) => {
            const rect = ctaSection.getBoundingClientRect();
            ctaSpotlight.style.setProperty('--spotX', `${e.clientX - rect.left}px`);
            ctaSpotlight.style.setProperty('--spotY', `${e.clientY - rect.top}px`);
            ctaSpotlight.style.opacity = '1';
        });
        ctaSection.addEventListener('mouseleave', () => { ctaSpotlight.style.opacity = '0'; });
    }

    /* ---------- Botões magnéticos (reaproveita a mesma interação da Home) ---------- */
    if (!prefersReducedMotion && !isTouch) {
        document.querySelectorAll('.btn-magnetic').forEach(btn => {
            btn.addEventListener('mousemove', (e) => {
                const rect = btn.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                btn.style.transform = `translate(${x * 0.18}px, ${y * 0.35}px)`;
            });
            btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
        });
    }

    /* ---------- Navbar / menu mobile (idêntico ao index.html) ---------- */
    const header = document.getElementById('siteHeader');
    if (header) {
        window.addEventListener('scroll', () => {
            header.classList.toggle('scrolled', window.scrollY > 40);
        });
    }

    const burger = document.getElementById('burgerBtn');
    const panel = document.getElementById('mobilePanel');
    const closeBtn = document.getElementById('closeBtn');
    if (burger && panel && closeBtn) {
        burger.addEventListener('click', () => panel.classList.add('open'));
        closeBtn.addEventListener('click', () => panel.classList.remove('open'));
        panel.querySelectorAll('a').forEach(a => a.addEventListener('click', () => panel.classList.remove('open')));
    }

})();
