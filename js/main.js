import { Game } from './game.js';

// Boot the game immediately (ES modules execute after the DOM has been fully parsed)
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    Game.boot();
} else {
    window.addEventListener('DOMContentLoaded', () => Game.boot());
}