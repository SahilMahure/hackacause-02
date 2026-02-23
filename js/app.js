import { initParticles } from './particles.js';
import { initAnimations } from './animations.js';
import { initMaps } from './maps.js';
import { initWeather } from './weather.js';
import { initRouter } from './router.js';
import { stateDistricts } from './data.js';

let currentUser = {
    email: '',
    mobile: '',
    dept: '',
    designation: '',
    state: '',
    district: ''
};

document.addEventListener('DOMContentLoaded', () => {
    // Initialize Lucide icons
    if (window.lucide) lucide.createIcons();

    // Boot sequence
    initParticles();
    initRouter();
    initAnimations();

    // Loading overlay
    const overlay = document.getElementById('loading-overlay');
    setTimeout(() => {
        overlay.classList.add('hidden');
        // Trigger hero animations after loading
        setTimeout(() => initAnimations.heroEntrance(), 400);
    }, 2200);

    // Login form
    document.getElementById('login-form')?.addEventListener('submit', (e) => {
        e.preventDefault();
        currentUser.email = document.getElementById('login-email').value;
        currentUser.mobile = document.getElementById('login-mobile').value;
        navigateTo('verify');
    });

    // Handle State Change
    const stateSelect = document.getElementById('verify-state');
    const districtSelect = document.getElementById('verify-jurisdiction');
    stateSelect?.addEventListener('change', () => {
        const state = stateSelect.value;
        districtSelect.innerHTML = '<option value="">Select District</option>';
        if (state && stateDistricts[state]) {
            stateDistricts[state].forEach(dist => {
                const opt = document.createElement('option');
                opt.value = dist;
                opt.textContent = dist;
                districtSelect.appendChild(opt);
            });
            districtSelect.disabled = false;
        } else {
            districtSelect.disabled = true;
        }
    });

    // Verify form  
    document.getElementById('verify-form')?.addEventListener('submit', (e) => {
        e.preventDefault();
        currentUser.dept = document.getElementById('verify-dept')?.value || '';
        currentUser.designation = document.getElementById('verify-designation')?.value || '';

        if (stateSelect && stateSelect.selectedIndex !== -1) {
            currentUser.state = stateSelect.options[stateSelect.selectedIndex].text;
        }
        if (districtSelect) {
            currentUser.district = districtSelect.value;
        }

        updateProfileUI();

        showLoadingTransition(() => {
            navigateTo('dashboard');
            setTimeout(() => {
                initMaps.dashboard();
                initWeather();
                animateDashboardEntry();
            }, 100);
        });
    });

    // Enter platform buttons
    ['btn-enter-platform', 'btn-cta-enter'].forEach(id => {
        document.getElementById(id)?.addEventListener('click', () => navigateTo('login'));
    });

    // Explore button — scroll down
    document.getElementById('btn-explore')?.addEventListener('click', () => {
        document.getElementById('section-narrative')?.scrollIntoView({ behavior: 'smooth' });
    });

    // Logout
    document.getElementById('btn-logout')?.addEventListener('click', () => {
        navigateTo('landing');
        setTimeout(() => initAnimations.heroEntrance(), 300);
    });

    // Nav links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = link.dataset.page;
            document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            switchAppPage(page);
        });
    });

    // Profile access via user card
    document.getElementById('nav-user')?.addEventListener('click', () => {
        document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
        switchAppPage('profile');
    });

    // File upload zone
    const uploadZone = document.getElementById('file-upload-zone');
    const uploadInput = document.getElementById('verify-id-upload');
    if (uploadZone && uploadInput) {
        uploadZone.addEventListener('click', () => uploadInput.click());
        uploadInput.addEventListener('change', () => {
            if (uploadInput.files.length > 0) {
                uploadZone.querySelector('p').textContent = uploadInput.files[0].name;
                uploadZone.style.borderColor = 'var(--green)';
                uploadZone.style.background = 'rgba(34,197,94,0.05)';
            }
        });
    }

    // Alert filters
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const filter = btn.dataset.filter;
            document.querySelectorAll('.alert-item').forEach(item => {
                if (filter === 'all' || item.dataset.severity === filter) {
                    item.style.display = 'block';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    });

    // Map layer buttons
    document.querySelectorAll('.map-ctrl-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.map-ctrl-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });

    // Refresh weather
    document.getElementById('btn-refresh-weather')?.addEventListener('click', () => {
        const grid = document.getElementById('weather-grid');
        grid.innerHTML = '<div class="weather-loading"><div class="loading-spinner"></div><span>Refreshing weather data...</span></div>';
        setTimeout(() => initWeather(), 800);
    });

    // Auto Optimize routes
    document.getElementById('btn-optimize-routes')?.addEventListener('click', () => {
        const btn = document.getElementById('btn-optimize-routes');
        const icon = btn.querySelector('i');
        const text = btn.querySelector('span');

        btn.disabled = true;
        text.textContent = 'Optimizing...';
        icon.classList.add('spinning'); // Add spinning animation if needed

        setTimeout(() => {
            initMaps.autoOptimize();
            btn.disabled = false;
            text.textContent = 'Auto-Optimize';
            icon.classList.remove('spinning');
        }, 1500);
    });

    // New Route button
    document.getElementById('btn-new-route')?.addEventListener('click', () => {
        initMaps.showDroughtSelection();
    });

    // Alert Details Modal Logic
    const modal = document.getElementById('alert-modal');
    const closeModal = document.getElementById('btn-close-modal');

    document.querySelectorAll('.alert-item .btn-glass').forEach(btn => {
        if (btn.textContent.includes('View Details')) {
            btn.addEventListener('click', () => {
                const item = btn.closest('.alert-item');
                const title = item.querySelector('.alert-title').textContent;
                const desc = item.querySelector('.alert-desc').textContent;
                const loc = item.querySelector('.alert-location').textContent;
                const time = item.querySelector('.alert-timestamp').textContent;
                const severity = item.dataset.severity;

                openAlertModal(title, desc, loc, time, severity);
            });
        }
    });

    closeModal?.addEventListener('click', () => modal.classList.add('hidden'));
    modal?.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.add('hidden');
    });
});

const mitigationMeasures = {
    critical: [
        { icon: 'droplet', text: 'Immediate activation of emergency tanker supply to affected tehsils.' },
        { icon: 'ban', text: 'Strict prohibition of groundwater extraction for non-potable use.' },
        { icon: 'alert-circle', text: 'Daily water rationing protocols to be enforced at community taps.' },
        { icon: 'users', text: 'Mobilization of local NGOs for water conservation awareness.' }
    ],
    warning: [
        { icon: 'search', text: 'Conduct intensive survey of functional community bore wells.' },
        { icon: 'trending-down', text: 'Implement voluntary water usage reduction targets for industry.' },
        { icon: 'cloud-lightning', text: 'Prepare for cloud seeding operations in watershed catchments.' },
        { icon: 'clipboard', text: 'Update drought contingency plan for the current quarter.' }
    ],
    info: [
        { icon: 'check-circle', text: 'Regular maintenance schedule for existing desalination units.' },
        { icon: 'bar-chart', text: 'Data collation for monthly hydrological status report.' },
        { icon: 'info', text: 'Routine inspection of canal distribution networks.' }
    ]
};

function openAlertModal(title, desc, loc, time, severity) {
    const modal = document.getElementById('alert-modal');
    const mTitle = document.getElementById('modal-title');
    const mDesc = document.getElementById('modal-desc');
    const mLoc = document.getElementById('modal-location');
    const mTime = document.getElementById('modal-time');
    const mBadge = document.getElementById('modal-severity');
    const mList = document.getElementById('modal-measures-list');

    mTitle.textContent = title;
    mDesc.textContent = desc;
    mLoc.innerHTML = `<i data-lucide="map-pin"></i> ${loc}`;
    mTime.innerHTML = `<i data-lucide="clock"></i> ${time}`;

    mBadge.className = `alert-severity-badge ${severity}`;
    mBadge.querySelector('span').textContent = severity.toUpperCase();

    // Clear and inject measures
    mList.innerHTML = '';
    const measures = mitigationMeasures[severity] || mitigationMeasures.info;

    measures.forEach(m => {
        const li = document.createElement('li');
        li.className = 'measure-item';
        li.innerHTML = `
            <i data-lucide="${m.icon}" class="measure-icon"></i>
            <span class="measure-text">${m.text}</span>
        `;
        mList.appendChild(li);
    });

    modal.classList.remove('hidden');
    if (window.lucide) lucide.createIcons();
}

function updateProfileUI() {
    document.getElementById('profile-name-display').textContent = currentUser.designation || 'Collector Office';
    document.getElementById('profile-role-display').textContent = currentUser.district + ' ' + (currentUser.dept ? currentUser.dept : 'Authority');
    document.getElementById('profile-email-display').textContent = currentUser.email;
    document.getElementById('profile-mobile-display').textContent = "+91 " + currentUser.mobile;
    document.getElementById('profile-dept-display').textContent = currentUser.dept;
    document.getElementById('profile-desig-display').textContent = currentUser.designation;
    document.getElementById('profile-state-display').textContent = currentUser.state;
    document.getElementById('profile-juris-display').textContent = currentUser.district;

    // Also update nav user info
    document.querySelector('.user-name').textContent = currentUser.designation || 'Collector Office';
    document.querySelector('.user-role').textContent = currentUser.district + ' District';
}

function animateProfile() {
    const card = document.querySelector('.profile-card');
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    requestAnimationFrame(() => {
        card.style.transition = 'all 0.6s var(--ease-out)';
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
    });
}


// ─── Navigation ───
function navigateTo(page) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const targetPage = document.getElementById(`page-${page}`);
    if (targetPage) {
        targetPage.classList.add('active');
        window.scrollTo(0, 0);
    }

    const nav = document.getElementById('main-nav');
    const appPages = ['dashboard', 'routing', 'alerts', 'weather', 'profile'];
    if (appPages.includes(page)) {
        nav.classList.remove('hidden');
    } else {
        nav.classList.add('hidden');
    }

    // Animate login/verify cards
    if (page === 'login' || page === 'verify') {
        const card = document.querySelector(`#page-${page} .glass-card`);
        if (card) {
            card.style.transition = 'none';
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px) scale(0.98)';
            requestAnimationFrame(() => {
                card.style.transition = 'opacity 0.6s var(--ease-out), transform 0.6s var(--ease-out)';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0) scale(1)';
            });
        }
    }
}
window.navigateTo = navigateTo;

function switchAppPage(page) {
    const appPageIds = ['dashboard', 'routing', 'alerts', 'weather', 'profile'];
    appPageIds.forEach(id => {
        const el = document.getElementById(`page-${id}`);
        if (el) el.classList.remove('active');
    });
    const target = document.getElementById(`page-${page}`);
    if (target) {
        target.classList.add('active');
        window.scrollTo(0, 0);
    }

    if (page === 'routing') initMaps.routing();
    if (page === 'weather') initWeather();
    if (page === 'dashboard') {
        initMaps.dashboard();
        animateDashboardEntry();
    }
    if (page === 'alerts') animateAlerts();
    if (page === 'profile') animateProfile();
}

function showLoadingTransition(callback) {
    const overlay = document.getElementById('loading-overlay');
    overlay.classList.remove('hidden');
    overlay.querySelector('.loading-text').textContent = 'Verifying credentials...';
    const fill = overlay.querySelector('.loading-bar-fill');
    fill.style.animation = 'none';
    fill.offsetHeight; // reflow
    fill.style.width = '0%';
    requestAnimationFrame(() => {
        fill.style.transition = 'width 1.5s var(--ease-out)';
        fill.style.width = '100%';
    });
    setTimeout(() => {
        overlay.classList.add('hidden');
        fill.style.transition = 'none';
        callback();
    }, 1800);
}

function animateDashboardEntry() {
    const cards = document.querySelectorAll('#dashboard-stats .stat-card');
    cards.forEach((card, i) => {
        card.style.transition = 'none';
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        requestAnimationFrame(() => {
            setTimeout(() => {
                card.style.transition = 'opacity 0.5s var(--ease-out), transform 0.5s var(--ease-out)';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, i * 100);
        });
    });

    // Animate counter values
    setTimeout(() => {
        document.querySelectorAll('#dashboard-stats .stat-card-value').forEach(el => {
            animateCounter(el, parseInt(el.dataset.count) || 0);
        });
    }, 300);
}

function animateAlerts() {
    const items = document.querySelectorAll('.alert-item');
    items.forEach((item, i) => {
        item.style.transition = 'none';
        item.style.opacity = '0';
        item.style.transform = 'translateX(-20px)';
        requestAnimationFrame(() => {
            setTimeout(() => {
                item.style.transition = 'opacity 0.5s var(--ease-out), transform 0.5s var(--ease-out)';
                item.style.opacity = '1';
                item.style.transform = 'translateX(0)';
            }, i * 120);
        });
    });
}

function animateCounter(el, target) {
    const duration = 1500;
    const start = performance.now();
    const isNeg = target < 0;
    const absTarget = Math.abs(target);

    function update(now) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        let current = Math.round(eased * absTarget);
        if (absTarget >= 10000) {
            el.textContent = (isNeg ? '-' : '') + (current / 1000).toFixed(0) + 'K';
        } else {
            el.textContent = (isNeg ? '' : '') + current;
            if (isNeg) el.textContent = '-' + current;
        }
        if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
}
window.animateCounter = animateCounter;
