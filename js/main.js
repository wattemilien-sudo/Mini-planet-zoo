import { WorldManager } from './WorldManager.js';
import { UIManager } from './UIManager.js';
import { GAME_CONFIG } from './config.js';

// Central Game State
const state = {
    money: 5000,
    visitors: 0,
    rating: 50,
    currentTool: 'inspect',
    selectedSubItem: null
};

// Initialize Core Managers
const world = new WorldManager('canvas-container', state);
const ui = new UIManager(state, GAME_CONFIG);

// Bind UI Toolbar Interactions with the 3D World
ui.initToolbar((tool, subItem) => {
    state.currentTool = tool;
    state.selectedSubItem = subItem;
    world.setActiveTool(tool, subItem);
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
