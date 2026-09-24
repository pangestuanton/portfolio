document.addEventListener('DOMContentLoaded', () => {
    const config = window.PORTFOLIO_CONFIG || {};
    const maintenance = document.getElementById('maintenance');
    const siteContent = document.getElementById('siteContent');

    if (config.maintenanceMode && maintenance && siteContent) {
        maintenance.hidden = false;
        siteContent.hidden = true;
        document.body.style.overflow = 'hidden';
        return;
    }

    const navbar = document.getElementById('navbar');
    const menuButton = document.getElementById('menuButton');
    const mobileMenu = document.getElementById('mobileMenu');
    const mobileLinks = mobileMenu ? mobileMenu.querySelectorAll('a') : [];
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const closeMenu = () => {
        if (!menuButton || !mobileMenu) return;
        menuButton.classList.remove('active');
        mobileMenu.classList.remove('open');
        menuButton.setAttribute('aria-expanded', 'false');
        menuButton.setAttribute('aria-label', 'Buka menu');
        mobileMenu.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('menu-open');
    };

    if (menuButton && mobileMenu) {
        menuButton.addEventListener('click', () => {
            const open = !mobileMenu.classList.contains('open');
            menuButton.classList.toggle('active', open);
            mobileMenu.classList.toggle('open', open);
            menuButton.setAttribute('aria-expanded', String(open));
            menuButton.setAttribute('aria-label', open ? 'Tutup menu' : 'Buka menu');
            mobileMenu.setAttribute('aria-hidden', String(!open));
            document.body.classList.toggle('menu-open', open);
        });
        mobileLinks.forEach(link => link.addEventListener('click', closeMenu));
    }

    let scrollFrame;
    window.addEventListener('scroll', () => {
        if (scrollFrame) return;
        scrollFrame = requestAnimationFrame(() => {
            if (navbar) navbar.classList.toggle('compact', window.scrollY > 60);
            scrollFrame = null;
        });
    }, { passive: true });

    const revealElements = document.querySelectorAll('.reveal, .image-reveal');
    if (reducedMotion || !('IntersectionObserver' in window)) {
        revealElements.forEach(element => element.classList.add('is-visible'));
    } else {
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.14, rootMargin: '0px 0px -6% 0px' });
        revealElements.forEach(element => observer.observe(element));
    }

    const heroVisual = document.getElementById('heroVisual');
    const heroPhoto = document.getElementById('heroPhoto');
    if (heroVisual && heroPhoto && !reducedMotion && window.matchMedia('(pointer: fine)').matches) {
        heroVisual.addEventListener('pointermove', event => {
            const bounds = heroVisual.getBoundingClientRect();
            const x = (event.clientX - bounds.left) / bounds.width - 0.5;
            const y = (event.clientY - bounds.top) / bounds.height - 0.5;
            heroPhoto.style.transform = `scale(1.05) translate(${x * 8}px, ${y * 8}px)`;
        });
        heroVisual.addEventListener('pointerleave', () => {
            heroPhoto.style.transform = 'scale(1.02)';
        });
    }

    document.querySelectorAll('.magnetic').forEach(button => {
        if (reducedMotion || !window.matchMedia('(pointer: fine)').matches) return;
        button.addEventListener('pointermove', event => {
            const bounds = button.getBoundingClientRect();
            const x = event.clientX - bounds.left - bounds.width / 2;
            const y = event.clientY - bounds.top - bounds.height / 2;
            button.style.transform = `translate(${x * 0.1}px, ${y * 0.16}px)`;
        });
        button.addEventListener('pointerleave', () => button.style.transform = '');
    });

    const toast = document.getElementById('toast');
    const cvButton = document.getElementById('cvButton');
    if (cvButton) {
        if (config.cvUrl) {
            cvButton.href = config.cvUrl;
        } else {
            cvButton.removeAttribute('target');
            cvButton.addEventListener('click', event => {
                event.preventDefault();
                if (!toast) return;
                toast.textContent = 'Link CV belum dipasang. Isi cvUrl di config.js.';
                toast.classList.add('show');
                window.setTimeout(() => toast.classList.remove('show'), 3200);
            });
        }
    }

    const dialog = document.getElementById('projectDialog');
    const dialogButton = document.getElementById('projectDetailButton');
    const dialogClose = document.getElementById('dialogClose');
    if (dialog && dialogButton && dialogClose) {
        const closeDialog = () => {
            dialog.close();
            document.body.classList.remove('dialog-open');
            dialogButton.focus();
        };
        dialogButton.addEventListener('click', () => {
            dialog.showModal();
            document.body.classList.add('dialog-open');
            dialogClose.focus();
        });
        dialogClose.addEventListener('click', closeDialog);
        dialog.addEventListener('click', event => {
            if (event.target === dialog) closeDialog();
        });
        dialog.addEventListener('cancel', event => {
            event.preventDefault();
            closeDialog();
        });
    }
});
