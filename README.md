# Pattern Explorer Pro

A fun and interactive pattern-matching game where players predict the next item in a sequence. Built with a focus on polished visuals, smooth animations, and engaging feedback.

[![Play Live](https://img.shields.io/badge/Play_Live-Pattern_Explorer-2d6a4f?style=for-the-badge&logo=github)](https://flashsolver.github.io/Pattern-Explorer/)

## 🌟 Features

- **Procedural Levels:** 15 dynamic levels that generate fresh patterns every game.
- **Theme System:** Choose between **Forest** 🌲, **Space** 🚀, and **Candy** 🍭 themes.
- **Combo System:** Earn bonus points for consecutive correct answers.
- **Sound Effects:** Immersive audio feedback for success, mistakes, and victory.
- **Visual Polish:** CSS animations and canvas-based confetti for celebratory moments.
- **Clean Architecture:** Modular code structure with specialized managers for Audio, Visuals, and Game Logic.

## 📁 Project Structure

```text
patterns/
├── .gitignore          # Git security and exclusion rules
├── index.html          # Main structure (ES Module entry)
├── README.md           # Project documentation
├── css/
│   ├── style.css       # Main entry stylesheet importing modules
│   ├── variables.css   # Color schemes for all 7 themes
│   └── drawer.css      # Styling for settings drawer and mobile overrides
├── js/
│   ├── main.js         # Entry script importing Game
│   ├── game.js         # Core gameplay logic and levels orchestrator
│   ├── config.js       # Game configuration and constants
│   ├── audio.js        # Procedural Audio Synthesizer (try-catch safe)
│   └── visuals.js      # Procedural Canvas Particle manager
└── assets/            # Empty placeholder for future assets
```

## 🚀 Running Locally

Because this game is built using modern **ES Modules** (`type="module"`), running it directly by double-clicking `index.html` (using the `file://` protocol) will trigger browser CORS security blocks. You **must** run the game using a local development server.

Choose one of the options below to serve the files:

### Option A: Using Node.js (Recommended)
If you have **Node.js** installed, run the following in your terminal inside the project directory:
```bash
npx http-server -p 8080
```
Then, open **[http://localhost:8080](http://localhost:8080)** in your browser.

### Option B: Using Python
If you have **Python** installed, run the following in your terminal inside the project directory:
```bash
python -m http.server 8000
```
Then, open **[http://localhost:8000](http://localhost:8000)** in your browser.

### Option C: VS Code Live Server
If you use VS Code, install the **Live Server** extension, right-click `index.html`, and select **Open with Live Server**.

## 🎮 How to Play

1. Observe the pattern sequence displayed in the center card.
2. Identify the logic (e.g., ABAB, AABAAB, or ABCABC).
3. Click on the correct emoji from the choices at the bottom.
4. Build your combo for higher scores!
5. Complete all 15 levels to win.

## 🛠️ Technical Details

- **Vanilla JS (ES6+):** Refactored for modularity with specialized managers.
- **Centralized Config:** All gameplay constants (scores, timing) are managed via a `CONFIG` object.
- **Performance Optimized:** Implements DOM element caching and efficient particle loop management.
- **Web Audio API:** High-fidelity procedural sounds generated in real-time.
- **Canvas API:** High-performance particle system for confetti effects.
- **CSS Variables:** Dynamic theme switching using CSS custom properties.
- **Security:** Pre-configured `.gitignore` for safe Git publication.

---
**Version:** 1.6.0
**Date:** May 2026
