document.addEventListener('DOMContentLoaded', () => {
    const host = /** @type {Window & {PORTFOLIO_CONFIG?: {maintenanceMode?: boolean}, lucide?: {createIcons: () => void}}} */ (window);
    const root = document.documentElement;
    const indonesian = root.lang === 'id';
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    const systemTheme = matchMedia('(prefers-color-scheme: dark)');
    const themeToggle = document.getElementById('themeToggle');
    const themeColor = document.querySelector('meta[name="theme-color"]');

    const refreshIcons = () => {
        document.querySelectorAll('i[data-lucide]').forEach(icon => icon.setAttribute('aria-hidden', 'true'));
        if (!host.lucide || !document.querySelector('i[data-lucide]')) return;
        host.lucide.createIcons();
        // Rendered SVGs need no further replacement when new icons are added.
        document.querySelectorAll('svg[data-lucide]').forEach(icon => icon.removeAttribute('data-lucide'));
    };
    const savedTheme = () => {
        try {
            const saved = localStorage.getItem('portfolio-theme');
            return saved === 'light' || saved === 'dark' ? saved : null;
        } catch { return null; }
    };
    let preferredTheme = savedTheme();
    const applyTheme = () => {
        const dark = preferredTheme ? preferredTheme === 'dark' : systemTheme.matches;
        root.dataset.theme = dark ? 'dark' : 'light';
        if (themeToggle) {
            themeToggle.innerHTML = `<i data-lucide="${dark ? 'sun' : 'moon'}" aria-hidden="true"></i>`;
            themeToggle.setAttribute('aria-label', indonesian
                ? (dark ? 'Gunakan tema terang' : 'Gunakan tema gelap')
                : (dark ? 'Use light theme' : 'Use dark theme'));
        }
        if (themeColor instanceof HTMLMetaElement) themeColor.content = dark ? (document.body.dataset.themeDark || '#101012') : '#f5f5f7';
        refreshIcons();
    };
    applyTheme();
    themeToggle?.addEventListener('click', () => {
        preferredTheme = root.dataset.theme === 'dark' ? 'light' : 'dark';
        try { localStorage.setItem('portfolio-theme', preferredTheme); } catch { /* Theme remains usable without storage. */ }
        applyTheme();
    });
    systemTheme.addEventListener?.('change', () => {
        if (!preferredTheme) applyTheme();
    });
    window.addEventListener('storage', event => {
        if (event.key !== 'portfolio-theme' && event.key !== null) return;
        preferredTheme = savedTheme();
        applyTheme();
    });

    const maintenance = document.getElementById('maintenance');
    if (host.PORTFOLIO_CONFIG?.maintenanceMode && maintenance) {
        maintenance.hidden = false;
        const siteContent = document.getElementById('siteContent');
        if (siteContent) siteContent.hidden = true;
        document.body.style.overflow = 'hidden';
        return;
    }

    const siteHeader = document.getElementById('siteHeader');
    const menuToggle = document.getElementById('menuToggle');
    const mobileMenu = document.getElementById('mobileMenu');
    const menuOpen = () => Boolean(mobileMenu?.classList.contains('open'));
    const closeMenu = (restoreFocus = false) => {
        if (!menuToggle || !mobileMenu || !menuOpen()) return;
        mobileMenu.classList.remove('open');
        mobileMenu.inert = true;
        mobileMenu.setAttribute('aria-hidden', 'true');
        menuToggle.setAttribute('aria-expanded', 'false');
        menuToggle.setAttribute('aria-label', indonesian ? 'Buka menu' : 'Open menu');
            menuToggle.innerHTML = '<i data-lucide="menu" aria-hidden="true"></i><span>Menu</span>';
        document.body.classList.remove('menu-open');
        if (restoreFocus) menuToggle.focus();
        refreshIcons();
    };
    menuToggle?.addEventListener('click', event => {
        event.stopPropagation();
        if (!mobileMenu) return;
        if (menuOpen()) return closeMenu(true);
        mobileMenu.classList.add('open');
        mobileMenu.inert = false;
        mobileMenu.setAttribute('aria-hidden', 'false');
        menuToggle.setAttribute('aria-expanded', 'true');
        menuToggle.setAttribute('aria-label', indonesian ? 'Tutup menu' : 'Close menu');
        menuToggle.innerHTML = '<i data-lucide="x" aria-hidden="true"></i><span>Menu</span>';
        document.body.classList.add('menu-open');
        siteHeader?.classList.remove('nav-hidden');
        if (event.detail === 0) mobileMenu.querySelector('a')?.focus();
        refreshIcons();
    });
    mobileMenu?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => closeMenu()));
    document.addEventListener('keydown', event => {
        if (event.key === 'Escape' && menuOpen()) {
            event.preventDefault();
            closeMenu(true);
        }
    });
    document.addEventListener('click', event => {
        if (menuOpen() && event.target instanceof Node && !mobileMenu?.contains(event.target) && !siteHeader?.contains(event.target)) closeMenu();
    });
    document.addEventListener('focusin', event => {
        if (!(event.target instanceof Node)) return;
        if (siteHeader?.contains(event.target)) siteHeader.classList.remove('nav-hidden');
        if (menuOpen() && !mobileMenu?.contains(event.target) && !siteHeader?.contains(event.target)) closeMenu();
    });

    const progress = document.createElement('div');
    progress.className = 'reading-progress';
    progress.setAttribute('aria-hidden', 'true');
    document.body.append(progress);
    const backToTop = document.querySelector('.back-to-top');
    const navLinks = [...document.querySelectorAll('.desktop-nav a[href^="#"], .mobile-menu a[href^="#"]')];
    const sections = [...new Set(navLinks.map(link => document.getElementById(link.getAttribute('href')?.slice(1) || '')).filter(section => section !== null))];
    /** @type {{id: string, top: number}[]} */
    let sectionOffsets = [];
    let activeSection = '';
    let previousY = window.scrollY;
    let frame = 0;
    let measure = true;

    // One passive scroll listener and one scheduled frame for all scroll effects.
    const updateScroll = () => {
        frame = 0;
        const y = Math.max(0, window.scrollY);
        const viewport = window.innerHeight;
        const distance = Math.max(0, root.scrollHeight - viewport);
        if (measure) {
            sectionOffsets = sections.map(section => ({ id: section.id, top: section.getBoundingClientRect().top + y }));
            measure = false;
        }
        const marker = y + viewport * .35;
        let active = '';
        for (const section of sectionOffsets) if (section.top <= marker) active = section.id;
        if (distance > 0 && y >= distance - 4) active = sectionOffsets.at(-1)?.id || active;
        const protectedHeader = menuOpen() || document.body.classList.contains('dialog-open') || Boolean(siteHeader?.querySelector(':focus-visible'));
        if (Math.abs(y - previousY) >= 8 || y <= 100 || protectedHeader) {
            siteHeader?.classList.toggle('nav-hidden', !protectedHeader && y > previousY && y > 100);
            previousY = y;
        }
        progress.style.transform = `scaleX(${distance ? Math.min(1, y / distance) : 0})`;
        backToTop?.classList.toggle('visible', y > 320);
        if (active !== activeSection) {
            activeSection = active;
            navLinks.forEach(link => {
                if (link.getAttribute('href') === `#${active}`) link.setAttribute('aria-current', 'location');
                else link.removeAttribute('aria-current');
            });
        }
    };
    const requestScrollUpdate = () => {
        if (!frame) frame = requestAnimationFrame(updateScroll);
    };
    const refreshLayout = () => {
        measure = true;
        requestScrollUpdate();
    };
    window.addEventListener('scroll', requestScrollUpdate, { passive: true });
    window.addEventListener('resize', () => {
        if (window.innerWidth >= 800) closeMenu();
        refreshLayout();
    }, { passive: true });
    window.addEventListener('pageshow', refreshLayout);
    if ('ResizeObserver' in window) new ResizeObserver(refreshLayout).observe(document.body);
    document.addEventListener('load', refreshLayout, true);
    document.fonts?.ready.then(refreshLayout);
    backToTop?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: motion.matches ? 'auto' : 'smooth' }));
    updateScroll();

    const enhance = () => {
        refreshIcons();
        refreshLayout();
    };
    document.addEventListener('portfolio:render', enhance);
    const dialog = document.getElementById('projectDialog');
    const dialogButton = document.getElementById('projectDetailButton');
    const dialogClose = document.getElementById('dialogClose');
    if (dialog instanceof HTMLDialogElement) {
        dialogButton?.addEventListener('click', () => {
            dialog.showModal();
            document.body.classList.add('dialog-open');
            dialogClose?.focus();
        });
        dialogClose?.addEventListener('click', () => dialog.close());
        dialog.addEventListener('click', event => {
            const bounds = dialog.getBoundingClientRect();
            if (event.target === dialog && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) dialog.close();
        });
        dialog.addEventListener('close', () => {
            document.body.classList.remove('dialog-open');
            dialogButton?.focus({ preventScroll: true });
        });
    }
    enhance();
});
