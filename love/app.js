/**
 * Moments Archive - iOS Style Gallery Controller
 * Clean, modular, and dependency-free JavaScript.
 */

(function () {
    'use strict';

    // DOM Elements
    const root = document.documentElement;
    const galleryGrid = document.getElementById('galleryGrid');
    const statTimeline = document.getElementById('statTimeline');
    const statCount = document.getElementById('statCount');
    const statLocation = document.getElementById('statLocation');
    const sectionCounter = document.getElementById('sectionCounter');

    const themeToggle = document.getElementById('themeToggle');
    const themeIcon = document.getElementById('themeIcon');

    const dialog = document.getElementById('photoDialog');
    const dialogImage = document.getElementById('dialogImage');
    const dialogTitle = document.getElementById('dialogTitle');
    const dialogDesc = document.getElementById('dialogDesc');
    const dialogMeta = document.getElementById('dialogMeta');
    const dialogClose = document.getElementById('dialogClose');

    /* -------------------------------------------------------------------------
       Theme Management
       ------------------------------------------------------------------------- */
    function updateThemeIcon(isDark) {
        if (!themeIcon) return;
        themeIcon.setAttribute('data-lucide', isDark ? 'sun' : 'moon');
        if (window.lucide && typeof window.lucide.createIcons === 'function') {
            window.lucide.createIcons();
        }
    }

    if (themeToggle) {
        updateThemeIcon(root.dataset.theme === 'dark');

        themeToggle.addEventListener('click', () => {
            const isDark = root.dataset.theme === 'dark';
            const nextTheme = isDark ? 'light' : 'dark';
            root.dataset.theme = nextTheme;
            localStorage.setItem('portfolio-theme', nextTheme);
            updateThemeIcon(!isDark);
        });
    }

    /* -------------------------------------------------------------------------
       Dialog / Modal Management
       ------------------------------------------------------------------------- */
    function openModal(item) {
        if (!dialog) return;

        dialogImage.src = item.image;
        dialogImage.alt = item.alt || item.title;
        dialogTitle.textContent = item.title;
        dialogDesc.textContent = item.description;
        dialogMeta.textContent = `${item.location} · ${item.date || item.year}`;

        dialog.showModal();
        document.body.classList.add('dialog-open');
    }

    function closeModal() {
        if (!dialog) return;
        dialog.close();
        document.body.classList.remove('dialog-open');
    }

    if (dialogClose) {
        dialogClose.addEventListener('click', closeModal);
    }

    if (dialog) {
        dialog.addEventListener('click', (event) => {
            // Close when clicking directly on the backdrop
            const rect = dialog.getBoundingClientRect();
            const isInDialog = (
                rect.top <= event.clientY &&
                event.clientY <= rect.top + rect.height &&
                rect.left <= event.clientX &&
                event.clientX <= rect.left + rect.width
            );
            if (!isInDialog) {
                closeModal();
            }
        });

        dialog.addEventListener('close', () => {
            document.body.classList.remove('dialog-open');
        });
    }

    /* -------------------------------------------------------------------------
       Stats Calculation
       ------------------------------------------------------------------------- */
    function updateStats(moments) {
        if (!moments || moments.length === 0) return;

        // Count
        if (statCount) {
            statCount.textContent = String(moments.length);
        }

        if (sectionCounter) {
            sectionCounter.textContent = `01 / ${String(moments.length).padStart(2, '0')}`;
        }

        // Years range
        const years = moments
            .map(m => parseInt(m.year, 10))
            .filter(y => !isNaN(y));

        if (years.length > 0 && statTimeline) {
            const minYear = Math.min(...years);
            const maxYear = Math.max(...years);
            statTimeline.textContent = minYear === maxYear 
                ? `${minYear}—Present` 
                : `${minYear}—${maxYear}`;
        }

        // Locations
        const uniqueLocations = new Set(moments.map(m => m.location.trim()));
        if (statLocation) {
            if (uniqueLocations.size === 1) {
                statLocation.textContent = [...uniqueLocations][0];
            } else {
                statLocation.textContent = `${uniqueLocations.size} Spots`;
            }
        }
    }

    /* -------------------------------------------------------------------------
       Card Builder (Safe DOM Generation)
       ------------------------------------------------------------------------- */
    function createMomentCard(item) {
        const article = document.createElement('article');
        article.className = 'card';
        article.tabIndex = 0;
        article.setAttribute('role', 'button');
        article.setAttribute('aria-label', `View details for ${item.title}`);

        // Media wrapper
        const mediaDiv = document.createElement('div');
        mediaDiv.className = 'card-media';

        const badge = document.createElement('span');
        badge.className = 'card-badge';
        badge.textContent = item.year;

        const img = document.createElement('img');
        img.src = item.image;
        img.alt = item.alt || item.title;
        img.loading = 'lazy';

        mediaDiv.appendChild(badge);
        mediaDiv.appendChild(img);

        // Body wrapper
        const bodyDiv = document.createElement('div');
        bodyDiv.className = 'card-body';

        const metaDiv = document.createElement('div');
        metaDiv.className = 'card-meta';

        const locSpan = document.createElement('span');
        locSpan.className = 'card-location';
        locSpan.textContent = item.location;

        const dateSpan = document.createElement('span');
        dateSpan.className = 'card-date';
        dateSpan.textContent = item.date || item.year;

        metaDiv.appendChild(locSpan);
        metaDiv.appendChild(dateSpan);

        const heading = document.createElement('h3');
        heading.className = 'card-title';
        heading.textContent = item.title;

        const desc = document.createElement('p');
        desc.className = 'card-note';
        desc.textContent = item.description;

        bodyDiv.appendChild(metaDiv);
        bodyDiv.appendChild(heading);
        bodyDiv.appendChild(desc);

        article.appendChild(mediaDiv);
        article.appendChild(bodyDiv);

        // Interactions
        article.addEventListener('click', () => openModal(item));
        article.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openModal(item);
            }
        });

        return article;
    }

    /* -------------------------------------------------------------------------
       Gallery Render
       ------------------------------------------------------------------------- */
    function renderGallery(moments) {
        if (!galleryGrid) return;
        galleryGrid.innerHTML = '';

        updateStats(moments);

        const fragment = document.createDocumentFragment();
        moments.forEach(item => {
            const card = createMomentCard(item);
            fragment.appendChild(card);
        });

        galleryGrid.appendChild(fragment);
    }

    /* -------------------------------------------------------------------------
       Data Loader with Fallback
       ------------------------------------------------------------------------- */
    async function loadData() {
        try {
            const response = await fetch('moments.json');
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const data = await response.json();
            renderGallery(data);
        } catch (err) {
            // Local file fallback if opened via file:// protocol
            if (window.MOMENTS_DATA && Array.isArray(window.MOMENTS_DATA)) {
                renderGallery(window.MOMENTS_DATA);
            } else {
                console.warn('Unable to load moments from moments.json or fallback script.', err);
            }
        }
    }

    // Initialize
    loadData();

    if (window.lucide && typeof window.lucide.createIcons === 'function') {
        window.lucide.createIcons();
    }
})();

