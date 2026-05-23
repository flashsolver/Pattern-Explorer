/**
 * GAME CONFIGURATION
 */
const CONFIG = {
    TOTAL_LEVELS: 15,
    BASE_SCORE: 10,
    COMBO_BONUS: 5,
    PARTICLE_COUNT: 100,
    ANIMATION_DELAY: 0.1,
    FEEDBACK_DURATION: 1200,
    INITIAL_LIVES: 3
};

/**
 * AUDIO MANAGER
 * Handles all procedural sound effects using Web Audio API
 */
const AudioManager = {
    ctx: null,
    
    init() {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    },

    play(freq, type, duration, volume = 0.1) {
        if (!this.ctx) this.init();
        if (this.ctx.state === 'suspended') this.ctx.resume();
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        
        gain.gain.setValueAtTime(volume, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);
        
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        
        osc.start();
        osc.stop(this.ctx.currentTime + duration);
    },

    playSuccess() {
        this.play(523.25, 'sine', 0.15); // C5
        setTimeout(() => this.play(659.25, 'sine', 0.25), 100); // E5
    },

    playError() {
        this.play(220, 'triangle', 0.3, 0.15); // A3
        this.play(110, 'sawtooth', 0.3, 0.1); // Low buzz
    },

    playVictory() {
        const notes = [523.25, 659.25, 783.99, 1046.50];
        notes.forEach((f, i) => {
            setTimeout(() => this.play(f, 'square', 0.4, 0.05), i * 150);
        });
    },

    playGameOver() {
        this.play(220, 'sawtooth', 0.5, 0.1);
        setTimeout(() => this.play(110, 'sawtooth', 0.8, 0.1), 200);
    }
};

/**
 * VISUAL EFFECTS MANAGER
 * Handles theme-specific particles and animations
 */
const VisualManager = {
    canvas: null,
    ctx: null,
    particles: [],
    isActive: false,
    isSetup: false,

    init() {
        if (this.isSetup) return;
        this.canvas = document.getElementById('confetti-canvas');
        this.ctx = this.canvas.getContext('2d');
        window.addEventListener('resize', () => this.resize());
        this.resize();
        this.isSetup = true;
    },

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    },

    createParticles(theme) {
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

/**
 * MAIN GAME ENGINE
 * Orchestrates state, levels, and logic
 */
const Game = {
    elements: {},
    
    state: {
        levelIndex: 0,
        score: 0,
        combo: 0,
        lives: CONFIG.INITIAL_LIVES,
        canClick: true,
        currentTheme: 'forest',
        levels: []
    },

    themes: {
        forest: { emojis: ["🐻", "🦊", "🦁", "🍎", "🌳", "🍄", "🥕", "🍓", "🦉", "🌲"], class: 'theme-forest' },
        space: { emojis: ["🚀", "🪐", "👽", "⭐", "🛰️", "🛸", "☄️", "🌙", "🌍", "👾"], class: 'theme-space' },
        candy: { emojis: ["🍭", "🍬", "🍦", "🍩", "🍪", "🍰", "🧁", "🍫", "🍯", "🍮"], class: 'theme-candy' },
        ocean: { emojis: ["🐙", "🐬", "🦈", "🐚", "🦀", "🐳", "🐡", "🌊", "⚓", "🏝️"], class: 'theme-ocean' },
        retro: { emojis: ["👾", "🕹️", "📺", "💿", "🎮", "⌨️", "📠", "🔋", "🔌", "💾"], class: 'theme-retro' },
        winter: { emojis: ["❄️", "🐧", "⛄", "🏔️", "🐻‍❄️", "⛸️", "🧣", "🧤", "🦌", "🌨️"], class: 'theme-winter' },
        desert: { emojis: ["🏜️", "🐫", "🌵", "☀️", "🦎", "🦂", "🐍", "🏺", "⛺", "🌅"], class: 'theme-desert' }
    },

    boot() {
        this.cacheElements();
        this.attachEventListeners();
        VisualManager.init();
        this.startGame();
    },

    startGame() {
        this.state.score = 0;
        this.state.combo = 0;
        this.state.levelIndex = 0;
        this.state.lives = CONFIG.INITIAL_LIVES;
        this.state.levels = this.generateLevels();
        this.elements.endScreen.style.display = 'none';
        this.elements.gameOverScreen.style.display = 'none';
        this.updateHearts();
        this.loadLevel();
    },

    cacheElements() {
        this.elements = {
            container: document.getElementById('game-container'),
            display: document.getElementById('pattern-display'),
            choices: document.getElementById('choices-container'),
            feedback: document.getElementById('feedback-message'),
            score: document.getElementById('score-text'),
            level: document.getElementById('level-indicator'),
            badge: document.getElementById('combo-badge'),
            endScreen: document.getElementById('end-screen'),
            gameOverScreen: document.getElementById('game-over-screen'),
            finalScore: document.getElementById('final-score'),
            failScore: document.getElementById('fail-score'),
            themeBtns: document.querySelectorAll('.theme-option'),
            restartBtns: document.querySelectorAll('.restart-btn'),
            progress: document.getElementById('progress-fill'),
            lives: document.getElementById('lives-container'),
            drawer: document.getElementById('settings-drawer'),
            drawerToggle: document.getElementById('drawer-toggle'),
            drawerClose: document.getElementById('drawer-close'),
            drawerOverlay: document.getElementById('drawer-overlay')
        };
    },

    attachEventListeners() {
        this.elements.themeBtns.forEach(btn => {
            btn.onclick = () => this.setTheme(btn.dataset.theme);
        });
        this.elements.restartBtns.forEach(btn => {
            btn.onclick = () => this.startGame();
        });
        
        // Drawer toggle
        this.elements.drawerToggle.onclick = () => this.toggleDrawer(true);
        this.elements.drawerClose.onclick = () => this.toggleDrawer(false);
        this.elements.drawerOverlay.onclick = () => this.toggleDrawer(false);
    },

    toggleDrawer(open) {
        this.elements.drawer.classList.toggle('open', open);
        this.elements.drawerOverlay.classList.toggle('visible', open);
        
        // Mark active theme
        if (open) {
            this.elements.themeBtns.forEach(btn => {
                btn.classList.toggle('active', btn.dataset.theme === this.state.currentTheme);
            });
        }
    },

    setTheme(key) {
        this.state.currentTheme = key;
        document.body.className = `theme-${key}`;
        // Always regenerate levels so emojis match the new theme
        this.state.levels = this.generateLevels();
        this.toggleDrawer(false); // Close drawer after selection
        this.loadLevel();
    },

    generateLevels() {
        const emojis = this.themes[this.state.currentTheme].emojis;
        return Array.from({length: CONFIG.TOTAL_LEVELS}, (_, i) => {
            const isBoss = (i + 1) % 5 === 0;
            const pool = [...emojis].sort(() => Math.random() - 0.5);
            const [a, b, c] = pool;

            if (isBoss) {
                const bossTypes = [
                    { pattern: [a, b, a, a, b, b, a, a, a], answer: b },
                    { pattern: [a, b, c, c, a, b, c, c], answer: a },
                    { pattern: [a, b, c, b, a, a, b, c], answer: b },
                    { pattern: [a, a, b, b, c, c, a, a], answer: b }
                ];
                const boss = bossTypes[Math.floor(Math.random() * bossTypes.length)];
                return { ...boss, isBoss: true };
            }

            // Difficulty tiers
            if (i < 4) { // Basic
                const types = [
                    { pattern: [a, b, a, b], answer: a },
                    { pattern: [b, a, b, a], answer: b },
                    { pattern: [a, a, b, b, a, a], answer: b }
                ];
                return types[Math.floor(Math.random() * types.length)];
            } else if (i < 9) { // Intermediate
                const types = [
                    { pattern: [a, b, b, a, b], answer: b },
                    { pattern: [a, b, c, a, b], answer: c },
                    { pattern: [a, a, b, a, a, b], answer: a }
                ];
                return types[Math.floor(Math.random() * types.length)];
            } else { // Hard
                const types = [
                    { pattern: [a, a, b, b, a, a, b], answer: b },
                    { pattern: [a, b, c, c, b, a], answer: a },
                    { pattern: [a, b, a, c, a, b, a], answer: c }
                ];
                return types[Math.floor(Math.random() * types.length)];
            }
        });
    },

    loadLevel() {
        if (this.state.levelIndex >= this.state.levels.length) return this.showVictory();

        const level = this.state.levels[this.state.levelIndex];
        this.state.canClick = true;

        if (level.isBoss) {
            this.elements.container.classList.add('boss-level');
            AudioManager.play(110, 'sawtooth', 0.5, 0.05);
        } else {
            this.elements.container.classList.remove('boss-level');
        }

        this.updateUI(level);
    },

    updateUI(level) {
        this.elements.feedback.textContent = '';
        this.elements.score.textContent = `Score: ${this.state.score}`;
        this.elements.level.textContent = `Level: ${this.state.levelIndex + 1}/${this.state.levels.length}`;
        
        const progress = ((this.state.levelIndex) / CONFIG.TOTAL_LEVELS) * 100;
        this.elements.progress.style.width = `${progress}%`;

        this.elements.display.innerHTML = level.pattern
            .map((item, idx) => `<span class="pattern-item appear" style="animation-delay: ${idx * CONFIG.ANIMATION_DELAY}s">${item}</span>`)
            .join('') + 
            `<span class="question-mark pattern-item appear" style="animation-delay: ${level.pattern.length * CONFIG.ANIMATION_DELAY}s">?</span>`;

        const choices = [level.answer];
        const pool = this.themes[this.state.currentTheme].emojis;
        while(choices.length < (level.isBoss ? 4 : 3)) {
            const rand = pool[Math.floor(Math.random() * pool.length)];
            if(!choices.includes(rand)) choices.push(rand);
        }

        this.elements.choices.innerHTML = '';
        choices.sort(() => Math.random() - 0.5).forEach(emoji => {
            const btn = document.createElement('button');
            btn.className = 'choice-button';
            btn.textContent = emoji;
            btn.setAttribute('aria-label', `Select ${emoji}`);
            btn.onclick = (e) => this.handleChoice(emoji, level.answer, e.target);
            this.elements.choices.appendChild(btn);
        });
    },

    updateHearts() {
        this.elements.lives.innerHTML = Array.from({length: CONFIG.INITIAL_LIVES}, (_, i) => 
            `<span class="heart ${i >= this.state.lives ? 'lost' : ''}">❤️</span>`
        ).join('');
    },

    handleChoice(selected, correct, btn) {
        if (!this.state.canClick) return;
        this.state.canClick = false; // Disable immediately to prevent spam
        
        if (selected === correct) {
            this.state.combo++;
            const points = CONFIG.BASE_SCORE + (this.state.combo > 1 ? this.state.combo * CONFIG.COMBO_BONUS : 0);
            this.state.score += points;

            AudioManager.playSuccess();
            btn.classList.add('correct');
            this.showFeedback(`✨ Excellent! +${points} ✨`, 'var(--primary)');
            
            if (this.state.combo > 1) this.toggleComboBadge(true);
            this.elements.display.querySelector('.question-mark').textContent = correct;

            setTimeout(() => {
                this.toggleComboBadge(false);
                this.state.levelIndex++;
                this.loadLevel();
            }, CONFIG.FEEDBACK_DURATION);
        } else {
            this.state.combo = 0;
            this.state.lives--;
            this.updateHearts();
            
            AudioManager.playError();
            btn.classList.add('wrong');
            this.showFeedback('Try again!', 'var(--error)');
            
            if (this.state.lives <= 0) {
                setTimeout(() => {
                    btn.classList.remove('wrong');
                    this.showGameOver();
                }, 500);
            } else {
                setTimeout(() => {
                    btn.classList.remove('wrong');
                    this.state.canClick = true; // Re-enable for retry
                }, 400);
            }
        }
        this.elements.score.textContent = `Score: ${this.state.score}`;
    },

    showFeedback(msg, color) {
        this.elements.feedback.innerHTML = `<span style="color: ${color}">${msg}</span>`;
    },

    toggleComboBadge(show) {
        this.elements.badge.textContent = `Combo x${this.state.combo}!`;
        this.elements.badge.classList.toggle('active', show);
    },

    showVictory() {
        AudioManager.playVictory();
        VisualManager.createParticles(this.state.currentTheme);
        this.elements.finalScore.textContent = `Final Score: ${this.state.score}`;
        this.elements.endScreen.style.display = 'flex';
    },

    showGameOver() {
        AudioManager.playGameOver();
        this.elements.failScore.textContent = `Score: ${this.state.score}`;
        this.elements.gameOverScreen.style.display = 'flex';
    }
};

// Boot
window.onload = () => Game.boot();