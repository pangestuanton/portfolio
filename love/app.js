/**
 * Moments Archive - iOS Style Gallery Controller
 * Clean, modular, and dependency-free JavaScript.
 */

(function () {
    'use strict';

    /** @typedef {{id: string, title: string, location: string, year: string, date?: string, description: string, image: string, alt?: string, driveUrl?: string, drivePreview?: string}} Moment */
    const host = /** @type {Window & {MOMENTS_DATA?: Moment[]}} */ (window);

    // DOM Elements
    const galleryGrid = document.getElementById('galleryGrid');
    const statTimeline = document.getElementById('statTimeline');
    const statCount = document.getElementById('statCount');
    const statLocation = document.getElementById('statLocation');
    const sectionCounter = document.getElementById('sectionCounter');

    const dialog = /** @type {HTMLDialogElement | null} */ (document.getElementById('photoDialog'));
    const dialogImage = /** @type {HTMLImageElement | null} */ (document.getElementById('dialogImage'));
    const dialogTitle = document.getElementById('dialogTitle');
    const dialogDesc = document.getElementById('dialogDesc');
    const dialogMeta = document.getElementById('dialogMeta');
    const dialogClose = document.getElementById('dialogClose');
    const dialogDriveLink = /** @type {HTMLAnchorElement | null} */ (document.getElementById('dialogDriveLink'));
    /** @type {HTMLElement | null} */
    let lastTrigger = null;

    /* -------------------------------------------------------------------------
       Theme Management
       ------------------------------------------------------------------------- */
    // Theme, reduced motion and dialog entry effects use the shared controller.

    /* -------------------------------------------------------------------------
       Dialog / Modal Management
       ------------------------------------------------------------------------- */
    /** @param {Moment} item @param {HTMLElement} trigger */
    function openModal(item, trigger) {
        if (!dialog || !dialogImage || !dialogTitle || !dialogDesc || !dialogMeta) return;
        lastTrigger = trigger;

        dialogImage.src = item.image;
        dialogImage.alt = item.alt || item.title;
        dialogTitle.textContent = item.title;
        dialogDesc.textContent = item.description;
        dialogMeta.textContent = `${item.location} · ${item.date || item.year}`;

        if (dialogDriveLink) {
            dialogDriveLink.href = item.driveUrl || 'https://drive.google.com/drive/folders/1ePLngeOGsV-Xbj445LhmuLf_L7J7qtck?usp=drive_link';
        }

        dialog.showModal();
        document.body.classList.add('dialog-open');
        dialogClose?.focus();
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
            if (event.target === dialog && !isInDialog) {
                closeModal();
            }
        });

        dialog.addEventListener('close', () => {
            document.body.classList.remove('dialog-open');
            lastTrigger?.focus({ preventScroll: true });
        });
    }

    /* -------------------------------------------------------------------------
       Stats Calculation
       ------------------------------------------------------------------------- */
    /** @param {Moment[]} moments */
    function updateStats(moments) {
        // Count
        if (statCount) {
            statCount.textContent = String(moments.length);
        }

        if (sectionCounter) {
            sectionCounter.textContent = `${moments.length ? '01' : '00'} / ${String(moments.length).padStart(2, '0')}`;
        }

        // Years range
        const years = moments
            .map(m => parseInt(m.year, 10))
            .filter(y => !isNaN(y));

        if (years.length > 0 && statTimeline) {
            const minYear = Math.min(...years);
            const maxYear = Math.max(...years);
            statTimeline.textContent = minYear === maxYear 
                ? `${minYear}` 
                : `${minYear} - ${maxYear}`;
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
    /** @param {Moment} item */
    function createMomentCard(item) {
        const article = document.createElement('article');
        article.className = 'card';
        article.tabIndex = 0;
        article.setAttribute('role', 'button');
        article.setAttribute('aria-haspopup', 'dialog');
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
        img.decoding = 'async';
        img.onerror = () => {
            if (item.drivePreview && img.src !== item.drivePreview) {
                img.src = item.drivePreview;
            }
        };

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
        article.addEventListener('click', () => openModal(item, article));
        article.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openModal(item, article);
            }
        });

        return article;
    }

    /* -------------------------------------------------------------------------
       Gallery Render
       ------------------------------------------------------------------------- */
    /** @param {Moment[]} moments */
    function renderGallery(moments) {
        if (!galleryGrid) return;
        galleryGrid.innerHTML = '';

        if (moments.length === 1) {
            galleryGrid.classList.add('single-item');
        } else {
            galleryGrid.classList.remove('single-item');
        }

        updateStats(moments);

        const fragment = document.createDocumentFragment();
        moments.forEach(item => {
            const card = createMomentCard(item);
            fragment.appendChild(card);
        });

        galleryGrid.appendChild(fragment);
        if (!moments.length) galleryGrid.textContent = 'Belum ada momen yang ditampilkan.';
        document.dispatchEvent(new CustomEvent('portfolio:render', { detail: { root: galleryGrid } }));
    }

    /* -------------------------------------------------------------------------
       Data Loader with Fallback
       ------------------------------------------------------------------------- */
    async function loadData() {
        if (!galleryGrid) return;
        galleryGrid.setAttribute('aria-busy', 'true');
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 8000);
        try {
            const response = await fetch('moments.json', { signal: controller.signal });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const data = await response.json();
            if (!Array.isArray(data) || !data.every(item => item && ['title', 'location', 'year', 'image', 'description'].every(key => typeof item[key] === 'string'))) throw new Error('Invalid gallery data');
            renderGallery(data);
        } catch (err) {
            // Local file fallback if opened via file:// protocol
            if (host.MOMENTS_DATA && Array.isArray(host.MOMENTS_DATA)) {
                renderGallery(host.MOMENTS_DATA);
            } else {
                galleryGrid.textContent = 'Foto belum dapat dimuat. ';
                const retry = document.createElement('button');
                retry.type = 'button';
                retry.className = 'drive-button';
                retry.textContent = 'Coba lagi';
                retry.addEventListener('click', () => { galleryGrid.replaceChildren(); loadData(); }, { once: true });
                galleryGrid.append(retry);
                console.warn('Unable to load moments from moments.json or fallback script.', err);
            }
        } finally {
            clearTimeout(timeout);
            galleryGrid.setAttribute('aria-busy', 'false');
        }
    }

    // Initialize
    loadData();

})();

