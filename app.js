/* ═══════════════════════════════════════════════════
   KARIGAR — Frontend Application JS
   Handles: mobile menu, service grid, WA modal
═══════════════════════════════════════════════════ */

const WORKER_URL = 'https://karigar-worker.alivirgo123.workers.dev';

// ─── UTILS ───
const observerOptions = { threshold: 0.1, rootMargin: '0px 0px -50px 0px' };
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

function updateObservers() {
    document.querySelectorAll('.reveal').forEach(el => {
        observer.observe(el);
        if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add('active');
    });
}

function checkMobile() {
    const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isSmallScreen = window.innerWidth <= 768;
    if (isMobileUA || (isSmallScreen && 'ontouchstart' in window)) {
        document.body.classList.add('is-mobile');
        document.body.setAttribute('data-view', 'mobile');
    } else {
        document.body.classList.remove('is-mobile');
        document.body.setAttribute('data-view', 'desktop');
    }
}

// ─── SERVICES DATA ───
const SERVICES = [
    { name: 'AC Services', emoji: '❄️' },
    { name: 'CCTV Camera', emoji: '📹' },
    { name: 'Electrical Services', emoji: '⚡' },
    { name: 'Plumbing', emoji: '🔧' },
    { name: 'Interior Design', emoji: '🛋️' },
    { name: 'IT Services', emoji: '💻' },
    { name: 'Biometric', emoji: '🔏' },
    { name: 'Fire Alarm', emoji: '🚨' },
    { name: 'Paint & Polish', emoji: '🖌️' },
    { name: 'Gardening', emoji: '🌿' },
    { name: 'Cleaning', emoji: '🧹' },
    { name: 'Carpenter', emoji: '🪚' },
    { name: 'Solar System', emoji: '☀️' },
    { name: 'Security System', emoji: '🔒' },
    { name: 'Ceiling Services', emoji: '🏠' },
    { name: 'General Supply', emoji: '📦' }
];

// ─── CORE INITIALIZATION ───
document.addEventListener('DOMContentLoaded', () => {
    checkMobile();
    updateObservers();

    // Navbar Scroll
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (navbar) navbar.classList.toggle('scrolled', window.scrollY > 40);
    }, { passive: true });

    // Mobile Menu
    const hamburger = document.getElementById('hamburger');
    const mobileMenu = document.getElementById('mobileMenu');
    const closeBtn = document.getElementById('closeMenu');

    if (hamburger && mobileMenu) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('open');
            mobileMenu.classList.toggle('active');
            document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
        });
    }
    if (closeBtn && mobileMenu) {
        closeBtn.addEventListener('click', () => {
            hamburger.classList.remove('open');
            mobileMenu.classList.remove('active');
            document.body.style.overflow = '';
        });
    }

    // WhatsApp Modal
    const waOpenBtn = document.getElementById('waOpenBtn');
    const waCloseBtn = document.getElementById('waCloseBtn');
    const waModal = document.getElementById('waModal');
    const waForm = document.getElementById('waForm');

    if (waOpenBtn && waModal) {
        waOpenBtn.addEventListener('click', () => {
            waModal.classList.add('active');
            document.body.style.overflow = 'hidden';
            // Populate services if dropdown exists
            const waService = document.getElementById('waService');
            if (waService && waService.options.length <= 1) {
                SERVICES.forEach(s => {
                    const opt = document.createElement('option');
                    opt.value = s.name;
                    opt.textContent = `${s.emoji} ${s.name}`;
                    waService.appendChild(opt);
                });
            }
        });
    }

    if (waCloseBtn && waModal) {
        waCloseBtn.addEventListener('click', () => {
            waModal.classList.remove('active');
            document.body.style.overflow = '';
        });
    }

    if (waForm) {
        waForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('waName').value;
            const service = document.getElementById('waService').value;
            const area = document.getElementById('waArea').value;
            const msg = document.getElementById('waMsg').value;

            const text = `*New Lead from Karigar Website*\n\n*Name:* ${name}\n*Service:* ${service}\n*Area:* ${area}\n*Message:* ${msg}`;
            const encoded = encodeURIComponent(text);
            window.open(`https://wa.me/923335210543?text=${encoded}`, '_blank');
            waModal.classList.remove('active');
            document.body.style.overflow = '';
        });
    }

    // Service Grid (if on index)
    renderServicesGrid();

    // Back to top
    const btt = document.getElementById('backToTop');
    if (btt) {
        window.addEventListener('scroll', () => {
            btt.classList.toggle('visible', window.scrollY > 500);
        });
        btt.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    }
});

let selectedService = '';
function renderServicesGrid() {
    const grid = document.getElementById('servicesGrid');
    const select = document.getElementById('serviceType');
    if (!grid || !select) return;

    grid.innerHTML = SERVICES.map((s, i) => `
        <div class="service-card reveal" onclick="selectService('${s.name}', this)">
            <span class="service-emoji">${s.emoji}</span>
            <span class="service-name">${s.name}</span>
            <div class="service-check">✓</div>
        </div>
    `).join('');

    updateObservers();

    if (select.options.length <= 1) {
        SERVICES.forEach(s => {
            const opt = document.createElement('option');
            opt.value = s.name;
            opt.textContent = `${s.emoji} ${s.name}`;
            select.appendChild(opt);
        });
    }
}

window.selectService = (name, el) => {
    selectedService = name;
    document.querySelectorAll('.service-card').forEach(c => c.classList.remove('selected'));
    el.classList.add('selected');
    const select = document.getElementById('serviceType');
    if (select) select.value = name;
};
