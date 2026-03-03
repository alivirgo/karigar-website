/* ═══════════════════════════════════════════════════
   KARIGAR — Frontend Application JS
   Handles: service grid, form validation, API submit
═══════════════════════════════════════════════════ */

// ─── WORKER ENDPOINT (update after deploying worker) ───
const WORKER_URL = 'https://karigar-worker.alivirgo123.workers.dev';

// ─── SCROLL ANIMATIONS (IntersectionObserver) ───
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

function updateObservers() {
    // Robust reveal: ensure elements are revealed even if they're already in view or observer fails
    const revealed = document.querySelectorAll('.reveal');
    if (revealed.length === 0) return;

    revealed.forEach(el => {
        // Fallback: if user is on very old browser or script timing is weird
        observer.observe(el);
        // Force active if already deeply scrolled to
        if (el.getBoundingClientRect().top < window.innerHeight) {
            el.classList.add('active');
        }
    });
}

// Mobile App / Touch Check
function checkMobile() {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
        || (window.innerWidth <= 768);
    if (isMobile) {
        document.body.classList.add('is-mobile');
        document.body.setAttribute('data-view', 'mobile');
    } else {
        document.body.setAttribute('data-view', 'desktop');
    }
}

// Make globally available immediately
window.updateObservers = updateObservers;

// ─── SERVICES DATA ───
const SERVICES = [
    { name: 'CCTV Camera', emoji: '📹' },
    { name: 'Gardening', emoji: '🌿' },
    { name: 'General Supply', emoji: '📦' },
    { name: 'Ceiling Services', emoji: '🏠' },
    { name: 'Solar System', emoji: '☀️' },
    { name: 'Security System', emoji: '🔒' },
    { name: 'Electrical Services', emoji: '⚡' },
    { name: 'Interior Design', emoji: '🛋️' },
    { name: 'Data Networking', emoji: '🌐' },
    { name: 'IT Services', emoji: '💻' },
    { name: 'Cleaning', emoji: '🧹' },
    { name: 'Carpenter', emoji: '🪚' },
    { name: 'Fire Alarm', emoji: '🚨' },
    { name: 'Paint & Polish', emoji: '🖌️' },
    { name: 'Plumbing', emoji: '🔧' },
    { name: 'AC Services', emoji: '❄️' },
    { name: 'Civil Work Services', emoji: '🏗️' },
    { name: 'PBX', emoji: '☎️' },
    { name: 'Biometric', emoji: '🔏' },
    { name: 'Glass & Aluminium', emoji: '🪟' },
    { name: 'PA System', emoji: '📢' },
    { name: 'Maintenance', emoji: '🔨' },
];

// ─── NAVBAR SCROLL EFFECT ───
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
    if (navbar) {
        navbar.classList.toggle('scrolled', window.scrollY > 40);
    }
}, { passive: true });

// ─── HAMBURGER MENU ───
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');

if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('open');
        mobileMenu.classList.toggle('open');
    });
}

function closeMobileMenu() {
    if (hamburger) hamburger.classList.remove('open');
    if (mobileMenu) mobileMenu.classList.remove('open');
}

// ─── RENDER SERVICES GRID ───
let selectedService = '';

function renderServicesGrid() {
    const grid = document.getElementById('servicesGrid');
    const select = document.getElementById('serviceType');
    if (!grid || !select) return;

    // Populate grid
    grid.innerHTML = SERVICES.map((s, i) => `
    <div class="service-card reveal" data-service="${s.name}" id="svc-${i}" onclick="selectService('${s.name}', ${i})">
      <span class="service-emoji">${s.emoji}</span>
      <span class="service-name">${s.name}</span>
      <div class="service-check">✓</div>
    </div>
  `).join('');

    updateObservers();

    // Hide all checks initially
    document.querySelectorAll('.service-check').forEach(el => el.style.display = 'none');

    // Populate select dropdown
    SERVICES.forEach(s => {
        const opt = document.createElement('option');
        opt.value = s.name;
        opt.textContent = `${s.emoji}  ${s.name}`;
        select.appendChild(opt);
    });
}

function selectService(name, idx) {
    selectedService = name;
    // Update grid highlight
    document.querySelectorAll('.service-card').forEach(c => {
        c.classList.remove('selected');
        c.querySelector('.service-check').style.display = 'none';
    });
    const card = document.getElementById(`svc-${idx}`);
    card.classList.add('selected');

    // Sync dropdown
    const select = document.getElementById('serviceType');
    select.value = name;
    clearError('serviceError');

    // Scroll to form smoothly
    setTimeout(() => {
        document.getElementById('request').scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 300);
}

// Sync grid when dropdown changes
document.addEventListener('DOMContentLoaded', () => {
    renderServicesGrid();

    const serviceTypeSelect = document.getElementById('serviceType');
    if (serviceTypeSelect) {
        serviceTypeSelect.addEventListener('change', (e) => {
            selectedService = e.target.value;
            SERVICES.forEach((s, i) => {
                const card = document.getElementById(`svc-${i}`);
                if (card) {
                    if (s.name === selectedService) {
                        card.classList.add('selected');
                    } else {
                        card.classList.remove('selected');
                    }
                }
            });
        });
    }
});

// ─── FORM VALIDATION ───
function getVal(id) {
    const el = document.getElementById(id);
    return el ? el.value.trim() : '';
}
function showError(id, msg) {
    const el = document.getElementById(id);
    if (el) el.textContent = msg;
}
function clearError(id) {
    const el = document.getElementById(id);
    if (el) el.textContent = '';
}

function validatePhone(phone) {
    // Accept Pakistani formats: 03XX-XXXXXXX, +923XXXXXXXXX, etc.
    return /^(\+92|0092|0)?[3][0-9]{9}$/.test(phone.replace(/[\s\-]/g, ''));
}

function validateForm() {
    let valid = true;
    const name = getVal('customerName');
    const phone = getVal('customerPhone');
    const area = getVal('customerArea');
    const svc = getVal('serviceType');
    const pin = getVal('mapsPin');

    clearError('nameError'); clearError('phoneError');
    clearError('areaError'); clearError('serviceError');

    if (!name || name.length < 2) {
        showError('nameError', 'Please enter your full name (min 2 characters).');
        document.getElementById('customerName').classList.add('error');
        valid = false;
    } else { document.getElementById('customerName').classList.remove('error'); }

    if (!validatePhone(phone)) {
        showError('phoneError', 'Enter a valid Pakistani phone number (e.g. 03001234567).');
        document.getElementById('customerPhone').classList.add('error');
        valid = false;
    } else { document.getElementById('customerPhone').classList.remove('error'); }

    if (!area || area.length < 2) {
        showError('areaError', 'Please enter your area or sector.');
        document.getElementById('customerArea').classList.add('error');
        valid = false;
    } else { document.getElementById('customerArea').classList.remove('error'); }

    if (!svc) {
        showError('serviceError', 'Please select a service.');
        document.getElementById('serviceType').classList.add('error');
        valid = false;
    } else { document.getElementById('serviceType').classList.remove('error'); }

    if (pin && !pin.startsWith('http')) {
        showError('pinError', 'Please paste a valid URL from Google Maps.');
        valid = false;
    }

    return valid;
}

// ─── FORM SUBMISSION ───
const serviceForm = document.getElementById('serviceForm');
if (serviceForm) {
    serviceForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        const btn = document.getElementById('submitBtn');
        const btnText = btn.querySelector('.btn-text');
        const btnLoader = document.getElementById('btnLoader');
        const toast = document.getElementById('formToast');

        // Loading state
        btn.disabled = true;
        btnText.style.display = 'none';
        btnLoader.style.display = 'inline';
        toast.style.display = 'none';

        const payload = {
            customerName: getVal('customerName'),
            customerPhone: getVal('customerPhone'),
            customerArea: getVal('customerArea'),
            serviceType: getVal('serviceType'),
            mapsPin: getVal('mapsPin') || null,
            notes: getVal('notes') || null,
            submittedAt: new Date().toISOString(),
            source: 'website',
        };

        try {
            const res = await fetch(`${WORKER_URL}/api/service-request`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                showToast(toast, '✅ Request submitted! Our team will call you shortly.', 'success');
                document.getElementById('serviceForm').reset();
                // Clear service selection
                selectedService = '';
                document.querySelectorAll('.service-card').forEach(c => {
                    c.classList.remove('selected');
                    c.querySelector('.service-check').style.display = 'none';
                });
            } else {
                const err = await res.json().catch(() => ({}));
                showToast(toast, `❌ ${err.message || 'Something went wrong. Please try again or call us directly.'}`, 'error');
            }
        } catch (err) {
            showToast(toast, '❌ Could not reach the server. Please call us at 0333 5210543.', 'error');
            console.error('Submission error:', err);
        } finally {
            btn.disabled = false;
            btnText.style.display = 'inline';
            btnLoader.style.display = 'none';
        }
    });
}
function showToast(el, msg, type) {
    el.textContent = msg;
    el.className = `form-toast ${type}`;
    el.style.display = 'block';
    setTimeout(() => { el.style.display = 'none'; }, 7000);
}

document.addEventListener('DOMContentLoaded', () => {
    checkMobile();
    updateObservers();
});

// ─── WHATSAPP MODAL LOGIC ───
const waOpenBtn = document.getElementById('waOpenBtn');
const waCloseBtn = document.getElementById('waCloseBtn');
const waModal = document.getElementById('waModal');
const waForm = document.getElementById('waForm');

if (waOpenBtn && waModal) {
    // Populate Service Dropdown (if present)
    const waService = document.getElementById('waService');
    if (waService) {
        SERVICES.forEach(s => {
            const opt = document.createElement('option');
            opt.value = s.name;
            opt.textContent = `${s.emoji}  ${s.name}`;
            waService.appendChild(opt);
        });
    }

    // Open/Close Handlers
    waOpenBtn.addEventListener('click', () => waModal.classList.add('active'));

    if (waCloseBtn) {
        waCloseBtn.addEventListener('click', () => waModal.classList.remove('active'));
    }

    waModal.addEventListener('click', (e) => {
        if (e.target === waModal) waModal.classList.remove('active');
    });
}

if (waForm) {
    waForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('wa_name')?.value.trim();
        const service = document.getElementById('waService')?.value.trim();
        const area = document.getElementById('wa_area')?.value.trim();
        const msg = document.getElementById('wa_msg')?.value.trim();

        if (!name || !service || !area) {
            alert('Please fill out Name, Service, and Area.');
            return;
        }

        const submitBtn = waForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerText;
        submitBtn.disabled = true;
        submitBtn.innerText = 'Connecting...';

        try {
            let text = `*New Request via WhatsApp*\n\n`;
            text += `*Name:* ${name}\n`;
            text += `*Service:* ${service}\n`;
            text += `*Area:* ${area}\n`;
            if (msg) text += `*Message:* ${msg}`;

            const waLink = `https://wa.me/923015334468?text=${encodeURIComponent(text)}`;

            if (waModal) waModal.classList.remove('active');
            waForm.reset();
            window.open(waLink, '_blank');
        } catch (err) {
            console.error('WA Error:', err);
            alert('Could not open WhatsApp.');
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerText = originalText;
        }
    });
}
