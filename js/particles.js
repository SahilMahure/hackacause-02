/* ══════════════════════════════════════
   ATMOSPHERIC PARTICLES
   Dust / heat haze effect
   ══════════════════════════════════════ */
export function initParticles() {
    const canvas = document.getElementById('particles-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let particles = [];
    let w, h;

    function resize() {
        w = canvas.width = window.innerWidth;
        h = canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    class Particle {
        constructor() { this.reset(); }
        reset() {
            this.x = Math.random() * w;
            this.y = Math.random() * h;
            this.size = Math.random() * 2 + 0.5;
            this.speedX = (Math.random() - 0.5) * 0.3;
            this.speedY = (Math.random() - 0.5) * 0.15 - 0.1;
            this.opacity = Math.random() * 0.4 + 0.1;
            this.life = Math.random() * 300 + 200;
            this.maxLife = this.life;
            this.hue = 30 + Math.random() * 20; // warm tones
        }
        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            this.life--;
            const lifeRatio = this.life / this.maxLife;
            this.currentOpacity = this.opacity * (lifeRatio < 0.2 ? lifeRatio / 0.2 : lifeRatio > 0.8 ? (1 - lifeRatio) / 0.2 : 1);
            if (this.life <= 0 || this.x < -10 || this.x > w + 10 || this.y < -10 || this.y > h + 10) {
                this.reset();
            }
        }
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = `hsla(${this.hue}, 60%, 70%, ${this.currentOpacity})`;
            ctx.fill();
        }
    }

    // Create particles
    const count = Math.min(80, Math.floor((w * h) / 15000));
    for (let i = 0; i < count; i++) {
        particles.push(new Particle());
    }

    function animate() {
        ctx.clearRect(0, 0, w, h);
        particles.forEach(p => { p.update(); p.draw(); });
        requestAnimationFrame(animate);
    }
    animate();
}
