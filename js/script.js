document.addEventListener('DOMContentLoaded', () => {
    const config = window.PORTFOLIO_CONFIG || {};
    const maintenance = document.getElementById('maintenance');
    const siteContent = document.getElementById('siteContent');
    const themeToggle = document.getElementById('themeToggle');
    const themeColor = document.querySelector('meta[name="theme-color"]');

    const refreshIcons = () => {
        if (window.lucide) window.lucide.createIcons();
    };

    const updateThemeControl = () => {
        const dark = document.documentElement.dataset.theme === 'dark';
        if (themeToggle) {
            themeToggle.innerHTML = `<i data-lucide="${dark ? 'sun' : 'moon'}"></i>`;
            themeToggle.setAttribute('aria-label', dark ? 'Use light theme' : 'Use dark theme');
        }
        if (themeColor) themeColor.content = dark ? '#101012' : '#f5f5f7';
        refreshIcons();
    };

    updateThemeControl();

    themeToggle?.addEventListener('click', () => {
        const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
        document.documentElement.dataset.theme = next;
        localStorage.setItem('portfolio-theme', next);
        updateThemeControl();
    });

    if (config.maintenanceMode && maintenance) {
        maintenance.hidden = false;
        if (siteContent) siteContent.hidden = true;
        document.body.style.overflow = 'hidden';
        refreshIcons();
        return;
    }

    const siteHeader = document.getElementById('siteHeader');
    const menuToggle = document.getElementById('menuToggle');
    const mobileMenu = document.getElementById('mobileMenu');
    let previousScrollY = window.scrollY;
    let headerFrame;

    const updateHeaderVisibility = () => {
        const currentScrollY = Math.max(window.scrollY, 0);
        const menuOpen = mobileMenu?.classList.contains('open');
        const scrollingDown = currentScrollY > previousScrollY;
        siteHeader?.classList.toggle('nav-hidden', !menuOpen && scrollingDown && currentScrollY > 100);
        previousScrollY = currentScrollY;
        headerFrame = null;
    };

    window.addEventListener('scroll', () => {
        if (headerFrame) return;
        headerFrame = requestAnimationFrame(updateHeaderVisibility);
    }, { passive: true });

    const closeMenu = () => {
        if (!menuToggle || !mobileMenu) return;
        mobileMenu.classList.remove('open');
        mobileMenu.setAttribute('aria-hidden', 'true');
        menuToggle.setAttribute('aria-expanded', 'false');
        menuToggle.setAttribute('aria-label', 'Open menu');
        menuToggle.innerHTML = '<i data-lucide="menu"></i>';
        document.body.classList.remove('menu-open');
        refreshIcons();
    };

    menuToggle?.addEventListener('click', () => {
        if (!mobileMenu) return;
        const open = !mobileMenu.classList.contains('open');
        mobileMenu.classList.toggle('open', open);
        mobileMenu.setAttribute('aria-hidden', String(!open));
        menuToggle.setAttribute('aria-expanded', String(open));
        menuToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
        menuToggle.innerHTML = `<i data-lucide="${open ? 'x' : 'menu'}"></i>`;
        document.body.classList.toggle('menu-open', open);
        siteHeader?.classList.remove('nav-hidden');
        refreshIcons();
    });

    mobileMenu?.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
    window.addEventListener('resize', () => {
        if (window.innerWidth >= 720) closeMenu();
    });

    const backToTop = document.querySelector('.back-to-top');
    const updateBackToTop = () => backToTop?.classList.toggle('visible', window.scrollY > 320);
    backToTop?.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    });
    window.addEventListener('scroll', updateBackToTop, { passive: true });
    updateBackToTop();

    const revealItems = document.querySelectorAll('.reveal');
    if (matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) {
        revealItems.forEach(item => item.classList.add('is-visible'));
    } else {
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -4% 0px' });
        revealItems.forEach(item => observer.observe(item));
    }

    const dialog = document.getElementById('projectDialog');
    const dialogButton = document.getElementById('projectDetailButton');
    const dialogClose = document.getElementById('dialogClose');
    const closeDialog = () => {
        if (!dialog) return;
        dialog.close();
        document.body.classList.remove('dialog-open');
        dialogButton?.focus();
    };

    dialogButton?.addEventListener('click', () => {
        dialog?.showModal();
        document.body.classList.add('dialog-open');
        dialogClose?.focus();
    });
    dialogClose?.addEventListener('click', closeDialog);
    dialog?.addEventListener('click', event => {
        if (event.target === dialog) closeDialog();
    });
    dialog?.addEventListener('cancel', event => {
        event.preventDefault();
        closeDialog();
    });

    refreshIcons();
});
