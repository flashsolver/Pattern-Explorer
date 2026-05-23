/**
 * AUDIO MANAGER
 * Handles all procedural sound effects using Web Audio API
 */
export const AudioManager = {
    ctx: null,
    
    init() {
        try {
            const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
            if (AudioCtxClass) {
                this.ctx = new AudioCtxClass();
            } else {
                console.warn("Web Audio API is not supported in this browser environment.");
            }
        } catch (error) {
            console.error("Failed to initialize Web Audio Context:", error);
        }
    },

    play(freq, type, duration, volume = 0.1) {
        if (!this.ctx) {
            this.init();
        }
        if (!this.ctx) {
            return; // Exit if initialization failed or is unsupported
        }

        try {
            if (this.ctx.state === 'suspended') {
                this.ctx.resume();
            }
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
        } catch (error) {
            console.error("Failed to synthesize procedural audio tone:", error);
        }
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
