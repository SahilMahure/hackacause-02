let dashboardMap = null;
let routingMap = null;
let currentRoutePolylines = {};

// Village data — Maharashtra drought-prone regions
const villages = [
    { name: 'Parli', lat: 18.8527, lng: 76.5262, district: 'Beed', stress: 89, status: 'critical', pop: 3200, rainfall: -42 },
    { name: 'Ambejogai', lat: 18.7381, lng: 76.3860, district: 'Beed', stress: 82, status: 'critical', pop: 4500, rainfall: -38 },
    { name: 'Kaij', lat: 18.8570, lng: 76.3040, district: 'Beed', stress: 78, status: 'critical', pop: 2100, rainfall: -35 },
    { name: 'Gevrai', lat: 19.2661, lng: 76.0476, district: 'Beed', stress: 85, status: 'critical', pop: 2800, rainfall: -40 },
    { name: 'Dharur', lat: 18.8210, lng: 76.1180, district: 'Beed', stress: 91, status: 'critical', pop: 1900, rainfall: -45 },
    { name: 'Latur City', lat: 18.3968, lng: 76.5604, district: 'Latur', stress: 65, status: 'warning', pop: 12000, rainfall: -28 },
    { name: 'Udgir', lat: 18.3930, lng: 77.1160, district: 'Latur', stress: 72, status: 'warning', pop: 5500, rainfall: -32 },
    { name: 'Ausa', lat: 18.2461, lng: 76.4990, district: 'Latur', stress: 70, status: 'warning', pop: 3400, rainfall: -30 },
    { name: 'Nilanga', lat: 18.1167, lng: 76.7500, district: 'Latur', stress: 68, status: 'warning', pop: 4200, rainfall: -27 },
    { name: 'Osmanabad', lat: 18.1860, lng: 76.0430, district: 'Osmanabad', stress: 76, status: 'warning', pop: 8800, rainfall: -34 },
    { name: 'Tuljapur', lat: 18.0110, lng: 76.0730, district: 'Osmanabad', stress: 80, status: 'critical', pop: 5600, rainfall: -37 },
    { name: 'Umarga', lat: 17.8420, lng: 76.6260, district: 'Osmanabad', stress: 74, status: 'warning', pop: 3100, rainfall: -31 },
    { name: 'Jalna', lat: 19.8347, lng: 75.8816, district: 'Jalna', stress: 58, status: 'warning', pop: 15000, rainfall: -22 },
];

const tankerHubs = [
    { name: 'Beed Water Tank #3', lat: 18.9891, lng: 75.7580, type: 'wet' },
    { name: 'Latur Central Depot', lat: 18.3968, lng: 76.5604, type: 'wet' },
    { name: 'Osmanabad Reservoir', lat: 18.1860, lng: 76.0430, type: 'wet' },
    { name: 'Jalna Depot #1', lat: 19.8347, lng: 75.8816, type: 'wet' },
    { name: 'Nanded Water Hub', lat: 19.1383, lng: 77.3000, type: 'wet' }
];

function getMarkerColor(status) {
    switch (status) {
        case 'critical': return '#ef4444';
        case 'warning': return '#f59e0b';
        case 'stable': return '#22c55e';
        default: return '#3b82f6';
    }
}

function createPulsingIcon(color, size = 14) {
    return L.divIcon({
        className: 'custom-marker',
        html: `
      <div style="position:relative;width:${size}px;height:${size}px;">
        <div style="
          position:absolute;inset:0;border-radius:50%;
          background:${color};opacity:0.9;
          box-shadow: 0 0 ${size}px ${color}80, 0 0 ${size * 2}px ${color}40;
        "></div>
        <div style="
          position:absolute;inset:-${size / 2}px;border-radius:50%;
          border:2px solid ${color};opacity:0.3;
          animation: marker-pulse 2s ease-out infinite;
        "></div>
      </div>
    `,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
    });
}

function createPopup(v) {
    return `
    <div class="village-popup">
      <h4>${v.name}</h4>
      <div class="pop-row"><span class="pop-label">District</span><span class="pop-value">${v.district}</span></div>
      <div class="pop-row"><span class="pop-label">Stress Index</span><span class="pop-value" style="color:${getMarkerColor(v.status)}">${v.stress}/100</span></div>
      <div class="pop-row"><span class="pop-label">Population</span><span class="pop-value">${v.pop.toLocaleString()}</span></div>
    </div>
  `;
}

export const initMaps = {
    dashboard() {
        const el = document.getElementById('dashboard-map');
        if (!el) return;
        if (dashboardMap) { dashboardMap.remove(); dashboardMap = null; }

        dashboardMap = L.map(el, {
            center: [18.7, 76.2],
            zoom: 8,
            zoomControl: true,
            attributionControl: false,
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(dashboardMap);

        villages.forEach(v => {
            const size = v.status === 'critical' ? 16 : 12;
            L.marker([v.lat, v.lng], {
                icon: createPulsingIcon(getMarkerColor(v.status), size)
            }).addTo(dashboardMap).bindPopup(createPopup(v));
        });
        setTimeout(() => dashboardMap.invalidateSize(), 300);
    },

    routing() {
        const el = document.getElementById('routing-map');
        if (!el) return;
        if (routingMap) { routingMap.remove(); routingMap = null; }

        routingMap = L.map(el, {
            center: [18.5, 76.4],
            zoom: 9,
            zoomControl: true,
            attributionControl: false,
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(routingMap);

        // Optimized paths (pre-baked multi-point segments to look like roads)
        const path1 = [[18.9891, 75.7580], [18.95, 75.9], [18.92, 76.1], [18.88, 76.3], [18.8527, 76.5262]];
        const path2 = [[18.3968, 76.5604], [18.39, 76.7], [18.4, 76.9], [18.3930, 77.1160]];
        const path3 = [[18.1860, 76.0430], [18.1, 76.05], [18.0110, 76.0730]];
        const path4 = [[19.8347, 75.8816], [19.7, 75.9], [19.6106, 75.9521]];

        currentRoutePolylines['route-1'] = addAnimatedRoute(routingMap, path1, '#22c55e', 'TK-0847: Beed → Parli');
        currentRoutePolylines['route-2'] = addAnimatedRoute(routingMap, path2, '#3b82f6', 'TK-0923: Latur → Udgir');
        currentRoutePolylines['route-3'] = addAnimatedRoute(routingMap, path3, '#64748b', 'TK-0756: Osmanabad → Tuljapur');
        currentRoutePolylines['route-4'] = addAnimatedRoute(routingMap, path4, '#f59e0b', 'TK-1002: Jalna → Ambad', true);

        // Add Hub Markers
        tankerHubs.forEach(h => {
            L.marker([h.lat, h.lng], {
                icon: L.divIcon({
                    className: 'depot-marker',
                    html: `<div style="width:20px;height:20px;border-radius:6px;background:#f59e0b;display:flex;align-items:center;justify-content:center;box-shadow:0 0 12px rgba(245,158,11,0.4);font-size:10px;font-weight:bold;color:#000;">⬤</div>`,
                    iconSize: [20, 20], iconAnchor: [10, 10],
                })
            }).addTo(routingMap).bindPopup(`<h4>${h.name}</h4>`);
        });

        // Add Interactivity for sidebar cards
        document.querySelectorAll('.route-card').forEach(card => {
            card.addEventListener('click', () => {
                const routeId = card.id;
                highlightRoute(routeId);
            });
        });

        setTimeout(() => routingMap.invalidateSize(), 300);
    },

    autoOptimize() {
        if (!routingMap) return;
        // Generate a new route from Nanded (Wet) to a random Critical village
        const wetHub = tankerHubs[4]; // Nanded
        const target = villages[0]; // Parli

        const path = [
            [wetHub.lat, wetHub.lng],
            [19.0, 77.0],
            [18.9, 76.8],
            [target.lat, target.lng]
        ];

        const newRouteId = 'route-auto-' + Date.now();
        const poly = addAnimatedRoute(routingMap, path, '#06b6d4', 'OPTIMIZED: Nanded → ' + target.name);
        routingMap.fitBounds(poly.getBounds(), { padding: [50, 50] });

        // Add to side panel
        const sidePanel = document.querySelector('.routing-side');
        const newCard = document.createElement('div');
        newCard.className = 'route-card glass-card';
        newCard.id = newRouteId;
        newCard.innerHTML = `
            <div class="route-header">
                <div class="route-status active" style="background:rgba(6,182,212,0.1); color:#06b6d4">
                    <span class="route-status-dot" style="background:#06b6d4"></span>
                    <span>Optimized</span>
                </div>
                <span class="route-id">AUTO-OP</span>
            </div>
            <div class="route-details">
                <div class="route-path">
                    <div class="route-point start"><span>${wetHub.name}</span></div>
                    <div class="route-point end"><span>${target.name}</span></div>
                </div>
            </div>
        `;
        sidePanel.prepend(newCard);
        currentRoutePolylines[newRouteId] = poly;

        newCard.addEventListener('click', () => highlightRoute(newRouteId));
        newCard.style.animation = 'slideIn 0.5s var(--ease-out) forwards';
    },

    showDroughtSelection() {
        if (!routingMap) return;
        // Zoom out and show all critical points broadly
        routingMap.setView([18.7, 76.5], 8);

        villages.filter(v => v.status === 'critical').forEach(v => {
            L.circle([v.lat, v.lng], {
                color: '#ef4444',
                fillColor: '#ef4444',
                fillOpacity: 0.2,
                radius: 5000
            }).addTo(routingMap).bindTooltip("Drought Area: " + v.name, { permanent: true });
        });
    }
};

function addAnimatedRoute(map, coords, color, tooltip, dashed = false) {
    const polyline = L.polyline(coords, {
        color: color, weight: 4, opacity: 0.6,
        dashArray: dashed ? '8 8' : null,
    }).addTo(map);

    polyline.bindTooltip(tooltip);

    // Add start/end
    L.circleMarker(coords[0], { radius: 5, color: color, fillOpacity: 1 }).addTo(map);
    L.circleMarker(coords[coords.length - 1], { radius: 8, color: color, fillOpacity: 1 }).addTo(map);

    return polyline;
}

function highlightRoute(id) {
    Object.keys(currentRoutePolylines).forEach(key => {
        const poly = currentRoutePolylines[key];
        if (key === id) {
            poly.setStyle({ weight: 8, opacity: 1 });
            poly.bringToFront();
            routingMap.fitBounds(poly.getBounds(), { padding: [100, 100], maxZoom: 10 });
        } else {
            poly.setStyle({ weight: 4, opacity: 0.3 });
        }
    });
}

