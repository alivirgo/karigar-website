/* ═══════════════════════════════════════════════════
   KARIGAR MOBILE-ONLY — v2 LOGIC
═══════════════════════════════════════════════════ */

const WORKER_URL = 'https://karigar-worker.alivirgo123.workers.dev';
const SERVICES = [
    'AC Services', 'CCTV Camera', 'Electrical Services', 'Plumbing',
    'Interior Design', 'IT Services', 'Biometric', 'Fire Alarm',
    'Paint & Polish', 'Gardening', 'Cleaning', 'Carpenter',
    'Solar System', 'Security System', 'Ceiling Services', 'General Supply'
];

document.addEventListener('DOMContentLoaded', () => {
    // Populate Services Dropdown
    const serviceSelect = document.getElementById('m_service');
    if (serviceSelect) {
        SERVICES.forEach(s => {
            const opt = document.createElement('option');
            opt.value = s;
            opt.textContent = s;
            serviceSelect.appendChild(opt);
        });
    }

    // Form Handling
    const form = document.getElementById('mobileForm');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = document.getElementById('m_submitBtn');
            const toast = document.getElementById('m_toast');

            btn.disabled = true;
            btn.textContent = 'Sending...';
            toast.style.display = 'none';

            const payload = {
                customerName: document.getElementById('m_name').value,
                customerPhone: document.getElementById('m_phone').value,
                customerArea: document.getElementById('m_area').value,
                serviceType: document.getElementById('m_service').value,
                source: 'mobile_v2'
            };

            try {
                const res = await fetch(`${WORKER_URL}/api/service-request`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                if (res.ok) {
                    toast.textContent = '✅ Success! We will call you back.';
                    toast.style.color = '#30d158';
                    form.reset();
                } else {
                    toast.textContent = '❌ Error. Please call 0333 5210543.';
                    toast.style.color = '#ff453a';
                }
            } catch (err) {
                toast.textContent = '❌ Connection failed. Call us instead.';
                toast.style.color = '#ff453a';
            } finally {
                toast.style.display = 'block';
                btn.disabled = false;
                btn.textContent = 'Send Request';
            }
        });
    }

    // Hamburger Menu Logic
    const mHamburger = document.getElementById('m_hamburger');
    const mMobileMenu = document.getElementById('m_mobileMenu');
    const mCloseMenu = document.getElementById('m_closeMenu');

    if (mHamburger && mMobileMenu) {
        mHamburger.addEventListener('click', () => {
            mHamburger.classList.toggle('open');
            mMobileMenu.classList.toggle('active');
            document.body.style.overflow = mMobileMenu.classList.contains('active') ? 'hidden' : '';
        });
    }

    if (mCloseMenu && mMobileMenu) {
        mCloseMenu.addEventListener('click', () => {
            mHamburger.classList.remove('open');
            mMobileMenu.classList.remove('active');
            document.body.style.overflow = '';
        });
    }
});

// Helper to select service from grid
window.selectService = (name) => {
    const select = document.getElementById('m_service');
    if (select) {
        select.value = name;
        document.getElementById('request').scrollIntoView({ behavior: 'smooth' });
    }
};
