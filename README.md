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
├── index.html          # Main structure (No inline scripts)
├── README.md           # Project documentation
├── css/
│   └── style.css       # Visual styling and custom animations
├── js/
│   └── main.js        # Refactored game engine and managers
└── assets/            # Empty placeholder for future assets
```

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
**Version:** 1.5.1
**Date:** May 2026
