import { WorldManager } from './WorldManager.js';
import { UIManager } from './uimanager.js'; // Ensure file name matches your project

document.addEventListener('DOMContentLoaded', () => {
    // Game global state
    const state = {
        money: 2000,
        visitors: 0,
        rating: 50,
        currentTool: null,
        selectedSubItem: null
    };

    // Initialize World Manager ONCE
    const worldManager = new WorldManager('game-container', state);
    
    // Initialize UI Manager ONCE
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

// Main Animation & Game Loop
let lastTime = 0;
function gameLoop(time) {
    requestAnimationFrame(gameLoop);

    const delta = (time - lastTime) / 1000;
    lastTime = time;

    // Update 3D world elements, animations, and physics
    world.update(delta, time);
}

// Start the Loop
requestAnimationFrame(gameLoop);
