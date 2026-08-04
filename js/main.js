import { WorldManager } from './WorldManager.js';
import { UIManager } from './uimanager.js';

// Prevent duplicate initialization loops
if (window._gameInitialized) {
    console.warn("Game already initialized.");
} else {
    window._gameInitialized = true;

    document.addEventListener('DOMContentLoaded', () => {
        // Game global state
        const state = {
            money: 2000,
            visitors: 0,
            rating: 50,
            currentTool: null,
            selectedSubItem: null
        };

        // Initialize managers
        const worldManager = new WorldManager('game-container', state);
        const uiManager = new UIManager(state, worldManager);

        // Main Game Loop
        let lastTime = performance.now();
        function gameLoop(time) {
            const delta = (time - lastTime) / 1000;
            lastTime = time;

            worldManager.update(delta, time);
            uiManager.update();

            requestAnimationFrame(gameLoop);
        }

        requestAnimationFrame(gameLoop);
    });
}
