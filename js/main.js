/**
 * GAME CONFIGURATION
 */
const CONFIG = {
    TOTAL_LEVELS: 15,
    BASE_SCORE: 10,
    COMBO_BONUS: 5,
    PARTICLE_COUNT: 120,
    ANIMATION_DELAY: 0.1,
    FEEDBACK_DURATION: 1200
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
    },

    playVictory() {
        const notes = [523.25, 659.25, 783.99, 1046.50];
        notes.forEach((f, i) => {
            setTimeout(() => this.play(f, 'square', 0.4, 0.05), i * 150);
        });
    }
};

/**
 * VISUAL EFFECTS MANAGER
 * Handles confetti and canvas animations
 */
const VisualManager = {
    canvas: null,
    ctx: null,
    particles: [],
    isActive: false,

    init() {
        this.canvas = document.getElementById('confetti-canvas');
        this.ctx = this.canvas.getContext('2d');
        window.addEventListener('resize', () => this.resize());
        this.resize();
    },

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    },

    createConfetti() {
        this.particles = Array.from({length: CONFIG.PARTICLE_COUNT}, () => ({
            x: Math.random() * this.canvas.width,
            y: -20,
            size: Math.random() * 8 + 4,
            color: `hsl(${Math.random() * 360}, 75%, 60%)`,
            speed: Math.random() * 4 + 2,
            angle: Math.random() * 6.28,
            spin: Math.random() * 0.2 - 0.1
        }));
        if (!this.isActive) this.animate();
    },

    animate() {
        if (this.particles.length === 0) {
            this.isActive = false;
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            return;
        }
        this.isActive = true;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Loop backwards for safe splicing
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.y += p.speed;
            p.angle += p.spin;
            
            this.ctx.save();
            this.ctx.translate(p.x, p.y);
            this.ctx.rotate(p.angle);
            this.ctx.fillStyle = p.color;
            this.ctx.fillRect(-p.size/2, -p.size/2, p.size, p.size);
            this.ctx.restore();

            if (p.y > this.canvas.height) this.particles.splice(i, 1);
        }
        requestAnimationFrame(() => this.animate());
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

    init() {
        this.cacheElements();
        this.attachEventListeners();
        VisualManager.init();
        this.state.score = 0;
        this.state.combo = 0;
        this.state.levelIndex = 0;
        this.state.levels = this.generateLevels();
        this.elements.endScreen.style.display = 'none';
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
            finalScore: document.getElementById('final-score'),
            themeBtns: document.querySelectorAll('.theme-btn'),
            restartBtn: document.querySelector('.restart-btn'),
            progress: document.getElementById('progress-fill')
        };
    },

    attachEventListeners() {
        this.elements.themeBtns.forEach(btn => {
            btn.onclick = () => this.setTheme(btn.dataset.theme);
        });
        this.elements.restartBtn.onclick = () => this.init();
    },

    setTheme(key) {
        this.state.currentTheme = key;
        document.body.className = this.themes[key].class;
        if (this.state.levelIndex === 0) this.init();
        else this.loadLevel();
    },

    generateLevels() {
        const emojis = this.themes[this.state.currentTheme].emojis;
        return Array.from({length: CONFIG.TOTAL_LEVELS}, (_, i) => {
            const isBoss = (i + 1) % 5 === 0;
            const [a, b, c] = [...emojis].sort(() => Math.random() - 0.5);

            if (isBoss) {
                if (Math.random() > 0.5) {
                    return { pattern: [a, b, a, a, b, b, a, a, a], answer: b, isBoss: true };
                } else {
                    return { pattern: [a, b, c, c, a, b, c, c], answer: a, isBoss: true };
                }
            }

            if (i < 4) return { pattern: [a, b, a, b], answer: a };
            if (i < 8) return { pattern: [a, b, b, a, b], answer: b };
            return Math.random() > 0.5 
                ? { pattern: [a, a, b, a, a], answer: b }
                : { pattern: [a, b, c, a, b], answer: c };
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
        
        // Update progress bar
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
            btn.onclick = (e) => this.handleChoice(emoji, level.answer, e.target);
            this.elements.choices.appendChild(btn);
        });
    },

    handleChoice(selected, correct, btn) {
        if (!this.state.canClick) return;
        
        if (selected === correct) {
            this.state.canClick = false;
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
            AudioManager.playError();
            btn.classList.add('wrong');
            this.showFeedback('Try again!', 'var(--error)');
            setTimeout(() => btn.classList.remove('wrong'), 400);
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
        VisualManager.createConfetti();
        this.elements.finalScore.textContent = `Final Score: ${this.state.score}`;
        this.elements.endScreen.style.display = 'flex';
    }
};

// Boot
window.onload = () => Game.init();