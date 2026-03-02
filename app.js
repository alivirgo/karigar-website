/* ═══════════════════════════════════════════════════
   KARIGAR — Frontend Application JS
   Handles: service grid, form validation, API submit
═══════════════════════════════════════════════════ */

// ─── WORKER ENDPOINT (update after deploying worker) ───
const WORKER_URL = 'https://karigar-worker.alivirgo123.workers.dev';

// ─── SERVICES DATA ───
const SERVICES = [
    { name: 'CCTV Camera', emoji: '📷' },
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
    navbar.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });

// ─── HAMBURGER MENU ───
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');
hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    mobileMenu.classList.toggle('open');
});
function closeMobileMenu() {
    hamburger.classList.remove('open');
    mobileMenu.classList.remove('open');
}

// ─── RENDER SERVICES GRID ───
let selectedService = '';

function renderServicesGrid() {
    const grid = document.getElementById('servicesGrid');
    const select = document.getElementById('serviceType');

    // Populate grid
    grid.innerHTML = SERVICES.map((s, i) => `
    <div class="service-card" data-service="${s.name}" id="svc-${i}" onclick="selectService('${s.name}', ${i})">
      <span class="service-emoji">${s.emoji}</span>
      <span class="service-name">${s.name}</span>
      <span class="service-check" style="display:flex">✓</span>
    </div>
  `).join('');

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
    card.querySelector('.service-check').style.display = 'flex';

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

    document.getElementById('serviceType').addEventListener('change', (e) => {
        selectedService = e.target.value;
        SERVICES.forEach((s, i) => {
            const card = document.getElementById(`svc-${i}`);
            const check = card.querySelector('.service-check');
            if (s.name === selectedService) {
                card.classList.add('selected');
                check.style.display = 'flex';
            } else {
                card.classList.remove('selected');
                check.style.display = 'none';
            }
        });
    });
});

// ─── FORM VALIDATION ───
function getVal(id) { return document.getElementById(id).value.trim(); }
function showError(id, msg) { document.getElementById(id).textContent = msg; }
function clearError(id) { document.getElementById(id).textContent = ''; }

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
document.getElementById('serviceForm').addEventListener('submit', async (e) => {
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

function showToast(el, msg, type) {
    el.textContent = msg;
    el.className = `form-toast ${type}`;
    el.style.display = 'block';
    setTimeout(() => { el.style.display = 'none'; }, 7000);
}

// ─── SCROLL ANIMATIONS (IntersectionObserver) ───
const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
        if (e.isIntersecting) {
            e.target.style.opacity = '1';
            e.target.style.transform = 'translateY(0)';
        }
    });
}, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

document.querySelectorAll('.service-card, .step-card, .contact-card').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    observer.observe(el);
});
