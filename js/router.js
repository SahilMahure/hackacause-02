/* ══════════════════════════════════════
   ROUTER — Simple SPA hash-based routing
   ══════════════════════════════════════ */

export function initRouter() {
    // No complex routing needed — handled by navigateTo() in app.js
    // This module provides URL hash support if needed in the future

    window.addEventListener('hashchange', () => {
        const hash = window.location.hash.replace('#', '') || 'landing';
        if (typeof window.navigateTo === 'function') {
            window.navigateTo(hash);
        }
    });

    // Check initial hash
    const initialHash = window.location.hash.replace('#', '');
    if (initialHash && initialHash !== 'landing') {
        setTimeout(() => {
            if (typeof window.navigateTo === 'function') {
                window.navigateTo(initialHash);
            }
        }, 2500); // after loading overlay
    }
}
