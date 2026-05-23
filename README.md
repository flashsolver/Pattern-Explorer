# Pattern Explorer Pro

A fun and interactive pattern-matching game where players predict the next item in a sequence. Built with a focus on polished visuals, smooth animations, and engaging feedback.

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
├── index.html          # Main entry point
├── README.md           # Project documentation
├── css/
│   └── style.css       # Visual styling and animations
├── js/
│   └── main.js        # Game engine and managers
└── assets/            # Future resources (images, sounds, etc.)
```

## 🎮 How to Play

1. Observe the pattern sequence displayed in the center card.
2. Identify the logic (e.g., ABAB, AABAAB, or ABCABC).
3. Click on the correct emoji from the choices at the bottom.
4. Build your combo for higher scores!
5. Complete all 15 levels to win.

## 🛠️ Technical Details

- **Vanilla JS:** No external frameworks used.
- **Web Audio API:** Procedural sounds generated in real-time.
- **CSS Grid/Flexbox:** Responsive layout for various screen sizes.
- **Canvas API:** High-performance particle system for confetti.

---
**Version:** 1.0.0
**Date:** May 2026
