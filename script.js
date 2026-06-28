document.addEventListener('DOMContentLoaded', () => {
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    const bar1 = document.getElementById('bar1');
    const bar2 = document.getElementById('bar2');
    const bar3 = document.getElementById('bar3');
    const mobileLinks = document.querySelectorAll('.mobile-link');

    let menuOpen = false;

    function toggleMenu() {
        menuOpen = !menuOpen;
        mobileMenu.classList.toggle('open', menuOpen);
        bar1.classList.toggle('open', menuOpen);
        bar2.classList.toggle('open', menuOpen);
        bar3.classList.toggle('open', menuOpen);
        hamburgerBtn.setAttribute('aria-expanded', menuOpen ? 'true' : 'false');
        document.body.style.overflow = menuOpen ? 'hidden' : '';
    }

    hamburgerBtn.setAttribute('aria-expanded', 'false');
    hamburgerBtn.addEventListener('click', toggleMenu);

    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (menuOpen) toggleMenu();
        });
    });

    // Smooth scroll for all anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                e.preventDefault();
                const navbarHeight = document.getElementById('navbar').offsetHeight;
                const targetPos = target.getBoundingClientRect().top + window.pageYOffset - navbarHeight;
                window.scrollTo({ top: targetPos, behavior: 'smooth' });
            }
        });
    });

    // Active nav link on scroll
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    function updateActiveNav() {
        const scrollPos = window.scrollY + 120;
        sections.forEach(section => {
            const top = section.offsetTop;
            const height = section.offsetHeight;
            const id = section.getAttribute('id');
            if (scrollPos >= top && scrollPos < top + height) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === '#' + id) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }

    window.addEventListener('scroll', updateActiveNav);
    updateActiveNav();

    window.addEventListener('resize', () => {
        if (window.innerWidth >= 768 && menuOpen) {
            toggleMenu();
        }
    });

    // ═══════════════ INTERACTIVE CV PAGE LOGIC ═══════════════
    const btnPrintCV = document.getElementById('btnPrintCV');
    if (btnPrintCV) {
        btnPrintCV.addEventListener('click', () => {
            window.print();
        });
    }

    const cvSearch = document.getElementById('cvSearch');
    const clearSearch = document.getElementById('clearSearch');
    const typeFilters = document.getElementById('typeFilters');
    const yearFilters = document.getElementById('yearFilters');
    const timelineItems = document.querySelectorAll('.timeline-item');
    const noResults = document.getElementById('noResults');

    if (cvSearch && typeFilters && yearFilters) {
        let currentType = 'all';
        let currentYear = 'all';
        let searchQuery = '';

        function filterTimeline() {
            let visibleCount = 0;

            timelineItems.forEach(item => {
                const itemType = item.getAttribute('data-type');
                const itemYears = item.getAttribute('data-year').split(' ');
                
                const titleText = item.querySelector('.timeline-title').textContent.toLowerCase();
                const roleText = item.querySelector('.timeline-role').textContent.toLowerCase();
                const bodyText = item.querySelector('.muted').textContent.toLowerCase();
                
                const matchesType = (currentType === 'all' || itemType === currentType);
                const matchesYear = (currentYear === 'all' || itemYears.includes(currentYear));
                const matchesSearch = (searchQuery === '' || 
                                       titleText.includes(searchQuery) || 
                                       roleText.includes(searchQuery) || 
                                       bodyText.includes(searchQuery));

                if (matchesType && matchesYear && matchesSearch) {
                    item.classList.remove('filtered-out');
                    visibleCount++;
                } else {
                    item.classList.add('filtered-out');
                }
            });

            if (visibleCount === 0) {
                noResults.style.display = 'block';
            } else {
                noResults.style.display = 'none';
            }

            // Show/hide clear search button
            if (searchQuery !== '') {
                clearSearch.style.display = 'flex';
            } else {
                clearSearch.style.display = 'none';
            }
        }

        // Search Input Event
        cvSearch.addEventListener('input', (e) => {
            searchQuery = e.target.value.toLowerCase().trim();
            filterTimeline();
        });

        // Clear Search Click
        clearSearch.addEventListener('click', () => {
            cvSearch.value = '';
            searchQuery = '';
            filterTimeline();
        });

        // Type Filter Click
        typeFilters.addEventListener('click', (e) => {
            if (e.target.classList.contains('filter-btn')) {
                typeFilters.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
                e.target.classList.add('active');
                currentType = e.target.getAttribute('data-type');
                filterTimeline();
            }
        });

        // Year Filter Click
        yearFilters.addEventListener('click', (e) => {
            if (e.target.classList.contains('filter-btn')) {
                yearFilters.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
                e.target.classList.add('active');
                currentYear = e.target.getAttribute('data-year');
                filterTimeline();
            }
        });
    }

    // ═══════════════ PROJECT CASE STUDY MODAL ═══════════════
    const btnDeconstruct = document.getElementById('btnDeconstruct');
    const projectModal = document.getElementById('projectModal');
    const modalCloseBtn = document.getElementById('modalCloseBtn');
    const modalOverlay = document.getElementById('modalOverlay');

    if (btnDeconstruct && projectModal && modalCloseBtn && modalOverlay) {
        function openModal() {
            projectModal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }

        function closeModal() {
            projectModal.style.display = 'none';
            document.body.style.overflow = '';
        }

        btnDeconstruct.addEventListener('click', openModal);
        modalCloseBtn.addEventListener('click', closeModal);
        modalOverlay.addEventListener('click', closeModal);

        // Escape key to close modal
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && projectModal.style.display === 'flex') {
                closeModal();
            }
        });
    }
});
