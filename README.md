# Snake Game — DSA Project (Queue)

## Files

| File | Purpose |
|------|---------|
| `index.html` | HTML structure — open this in browser to play |
| `styles.css` | All styling (linked to index.html) |
| `game.js` | All game logic in JavaScript (linked to index.html) |
| `snake_logic.cpp` | Same logic written in C++ to show DSA implementation |

## How to Play (Browser)
Just double-click `index.html` — it opens in any browser.
- Keyboard: Arrow Keys
- Mobile: D-Pad buttons or swipe on screen


## DSA — Queue Usage
- **ENQUEUE** → new head added to front every move
- **DEQUEUE** → old tail removed from rear every move (snake moves)
- **GROW** → food eaten? skip dequeue → queue size +1
- **SIZE** → queue size = snake length at all times
