/* ══════════════════════════════════════
   SCROLL ANIMATIONS & HERO ENTRANCE
   ══════════════════════════════════════ */

export function initAnimations() {
    setupScrollAnimations();
}

// Hero entrance animation
initAnimations.heroEntrance = function () {
    const badge = document.getElementById('hero-badge');
    const lines = document.querySelectorAll('.title-line');
    const subtitle = document.querySelector('.hero-subtitle');
    const actions = document.querySelector('.hero-actions');
    const stats = document.querySelector('.hero-stats');

    const ease = 'cubic-bezier(0.16, 1, 0.3, 1)';
    let delay = 0;

    if (badge) {
        setTimeout(() => {
            badge.style.transition = `opacity 0.6s ${ease}, transform 0.6s ${ease}`;
            badge.style.opacity = '1';
            badge.style.transform = 'translateY(0)';
        }, delay);
        delay += 200;
    }

    lines.forEach((line, i) => {
        setTimeout(() => {
            line.style.transition = `opacity 0.7s ${ease}, transform 0.7s ${ease}`;
            line.style.opacity = '1';
            line.style.transform = 'translateY(0)';
        }, delay + i * 150);
    });
    delay += lines.length * 150 + 200;

    if (subtitle) {
        setTimeout(() => {
            subtitle.style.transition = `opacity 0.6s ${ease}, transform 0.6s ${ease}`;
            subtitle.style.opacity = '1';
            subtitle.style.transform = 'translateY(0)';
        }, delay);
        delay += 200;
    }

    if (actions) {
        setTimeout(() => {
            actions.style.transition = `opacity 0.6s ${ease}, transform 0.6s ${ease}`;
            actions.style.opacity = '1';
            actions.style.transform = 'translateY(0)';
        }, delay);
        delay += 200;
    }

    if (stats) {
        setTimeout(() => {
            stats.style.transition = `opacity 0.6s ${ease}, transform 0.6s ${ease}`;
            stats.style.opacity = '1';
            stats.style.transform = 'translateY(0)';
            // Animate stat counters
            document.querySelectorAll('.hero-stat .stat-value').forEach(el => {
                const target = parseInt(el.dataset.count) || 0;
                window.animateCounter?.(el, target);
            });
        }, delay);
    }
};

function setupScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const delay = parseFloat(el.dataset.delay || 0) * 1000;
                setTimeout(() => {
                    el.style.transition = 'opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1), transform 0.7s cubic-bezier(0.16, 1, 0.3, 1)';
                    el.style.opacity = '1';
                    el.style.transform = 'translateY(0)';
                }, delay);
                observer.unobserve(el);
            }
        });
    }, { threshold: 0.15 });

    // Observe narrative cards
    document.querySelectorAll('.narrative-card').forEach(card => observer.observe(card));

    // Observe flow steps
    document.querySelectorAll('.flow-step').forEach((step, i) => {
        step.dataset.delay = i * 0.2;
        observer.observe(step);
    });
}
