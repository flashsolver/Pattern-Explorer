import { CONFIG } from './config.js';

/**
 * VISUAL EFFECTS MANAGER
 * Handles theme-specific particles and animations
 */
export const VisualManager = {
    canvas: null,
    ctx: null,
    particles: [],
    isActive: false,
    isSetup: false,

    init() {
        if (this.isSetup) return;
        this.canvas = document.getElementById('confetti-canvas');
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        window.addEventListener('resize', () => this.resize());
        this.resize();
        this.isSetup = true;
    },

    resize() {
        if (this.canvas) {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
        }
    },

    createParticles(theme) {
        this.init();
        if (!this.canvas || !this.ctx) return;

        const props = this.getThemeProps(theme);
        this.particles = Array.from({length: CONFIG.PARTICLE_COUNT}, () => ({
            x: Math.random() * this.canvas.width,
            y: props.spawnY === 'bottom' ? this.canvas.height + 20 : -20,
            size: Math.random() * props.maxSize + props.minSize,
            color: props.colors ? props.colors[Math.floor(Math.random() * props.colors.length)] : `hsl(${Math.random() * 360}, 75%, 60%)`,
            speedX: Math.random() * 4 - 2,
            speedY: props.spawnY === 'bottom' ? -(Math.random() * 3 + 1) : Math.random() * 4 + 2,
            angle: Math.random() * 6.28,
            spin: Math.random() * 0.2 - 0.1,
            shape: props.shape || 'rect'
        }));
        if (!this.isActive) this.animate();
    },

    getThemeProps(theme) {
        const themes = {
            forest: { colors: ["#2d6a4f", "#40916c", "#74c69d"], minSize: 6, maxSize: 10, shape: 'leaf' },
            space: { colors: ["#7b2ff7", "#f72585", "#3a0ca3"], minSize: 2, maxSize: 5, shape: 'star' },
            candy: { colors: ["#e91e8c", "#ffbe0b", "#fb5607"], minSize: 5, maxSize: 12, shape: 'rect' },
            ocean: { colors: ["#0077b6", "#f0a500", "#0096c7"], minSize: 8, maxSize: 15, shape: 'circle', spawnY: 'bottom' },
            retro: { colors: ["#39ff14", "#ff00ff", "#00ffff"], minSize: 8, maxSize: 12, shape: 'rect' },
            winter: { colors: ["#2196f3", "#90e0ef", "#00b4d8"], minSize: 4, maxSize: 8, shape: 'circle' },
            desert: { colors: ["#e85d04", "#ffba08", "#dc2f02"], minSize: 4, maxSize: 7, shape: 'rect' }
        };
        return themes[theme] || themes.forest;
    },

    animate() {
        if (!this.canvas || !this.ctx) return;

        if (this.particles.length === 0) {
            this.isActive = false;
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            return;
        }
        
        this.isActive = true;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.speedX;
            p.y += p.speedY;
            p.angle += p.spin;
            
            this.ctx.save();
            this.ctx.translate(p.x, p.y);
            this.ctx.rotate(p.angle);
            this.ctx.fillStyle = p.color;
            
            if (p.shape === 'circle') {
                this.ctx.beginPath();
                this.ctx.arc(0, 0, p.size/2, 0, Math.PI * 2);
                this.ctx.fill();
            } else if (p.shape === 'star') {
                this.drawStar(0, 0, 5, p.size, p.size/2);
            } else if (p.shape === 'leaf') {
                this.ctx.beginPath();
                this.ctx.ellipse(0, 0, p.size, p.size/2, 0, 0, Math.PI * 2);
                this.ctx.fill();
            } else {
                this.ctx.fillRect(-p.size/2, -p.size/2, p.size, p.size);
            }
            
            this.ctx.restore();

            if (p.y > this.canvas.height + 50 || p.y < -50 || p.x > this.canvas.width + 50 || p.x < -50) {
                this.particles.splice(i, 1);
            }
        }

        if (this.particles.length > 0) {
            requestAnimationFrame(() => this.animate());
        } else {
            this.isActive = false;
        }
    },

    drawStar(cx, cy, spikes, outerRadius, innerRadius) {
        if (!this.ctx) return;
        let rot = Math.PI / 2 * 3;
        let x = cx;
        let y = cy;
        let step = Math.PI / spikes;

        this.ctx.beginPath();
        this.ctx.moveTo(cx, cy - outerRadius);
        for (let i = 0; i < spikes; i++) {
            x = cx + Math.cos(rot) * outerRadius;
            y = cy + Math.sin(rot) * outerRadius;
            this.ctx.lineTo(x, y);
            rot += step;

            x = cx + Math.cos(rot) * innerRadius;
            y = cy + Math.sin(rot) * innerRadius;
            this.ctx.lineTo(x, y);
            rot += step;
        }
        this.ctx.lineTo(cx, cy - outerRadius);
        this.ctx.closePath();
        this.ctx.fill();
    }
};
