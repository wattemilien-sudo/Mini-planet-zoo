export class UIManager {
    constructor(state, config) {
        this.state = state;
        this.config = config;

        // Cache DOM elements
        this.moneyDisplay = document.getElementById('money-display');
        this.visitorDisplay = document.getElementById('visitor-display');
        this.ratingDisplay = document.getElementById('rating-display');
        this.toolbarButtons = document.querySelectorAll('.tool-btn');
        this.subMenu = document.getElementById('sub-menu');
        this.uiOverlay = document.getElementById('ui-overlay');
    }

    // Initialize toolbar interactions and sub-menus
    initToolbar(onToolChange) {
        this.toolbarButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                // Update active state visual styles
                this.toolbarButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                const tool = btn.getAttribute('data-tool');
                let defaultSubItem = null;

                // Handle sub-menus depending on the selected tool category
                if (tool === 'animal') {
                    defaultSubItem = Object.keys(this.config.animals)[0];
                    this.populateSubMenu(this.config.animals, (subKey) => {
                        onToolChange(tool, subKey);
                    });
                } else if (tool === 'shop') {
                    defaultSubItem = Object.keys(this.config.shops)[0];
                    this.populateSubMenu(this.config.shops, (subKey) => {
                        onToolChange(tool, subKey);
                    });
                } else if (tool === 'habitat') {
                    defaultSubItem = Object.keys(this.config.habitats)[0];
                    this.populateSubMenu(this.config.habitats, (subKey) => {
                        onToolChange(tool, subKey);
                    });
                } else {
                    this.hideSubMenu();
                }

                // Trigger callback back to main/world controller
                onToolChange(tool, defaultSubItem);
            });
        });
    }

    // Populate the sub-menu options dynamically from config data
    populateSubMenu(itemsObj, onSelect) {
        this.subMenu.innerHTML = '';
        this.subMenu.classList.remove('hidden');

        let isFirst = true;
        for (const [key, item] of Object.entries(itemsObj)) {
            const btn = document.createElement('button');
            btn.className = 'sub-item-btn';
            btn.innerHTML = `${item.emoji || ''} ${item.name} ($${item.cost})`;
            
            if (isFirst) {
                btn.style.background = '#44bd32';
                isFirst = false;
            }

            btn.addEventListener('click', () => {
                // Reset styling for all sub-buttons and highlight clicked one
                const allSubBtns = this.subMenu.querySelectorAll('.sub-item-btn');
                allSubBtns.forEach(b => b.style.background = '#353b48');
                btn.style.background = '#44bd32';

                onSelect(key);
            });

            this.subMenu.appendChild(btn);
        }
    }

    // Hide the sub-menu when standard tools (path, bulldozer, inspect) are active
    hideSubMenu() {
        this.subMenu.classList.add('hidden');
        this.subMenu.innerHTML = '';
    }

    // Refresh the HUD counter texts based on current game state
    updateHUD() {
        if (this.moneyDisplay) this.moneyDisplay.textContent = this.state.money;
        if (this.visitorDisplay) this.visitorDisplay.textContent = this.state.visitors;
        if (this.ratingDisplay) this.ratingDisplay.textContent = this.state.rating;
    }

    // Spawn a floating reaction/thought bubble emoji over screen coordinates
    showThoughtBubble(screenX, screenY, emoji) {
        const bubble = document.createElement('div');
        bubble.className = 'thought-bubble';
        bubble.textContent = emoji;
        bubble.style.left = `${screenX}px`;
        bubble.style.top = `${screenY}px`;
        
        this.uiOverlay.appendChild(bubble);

        // Remove element from DOM after CSS animation finishes (~1.8s)
        setTimeout(() => {
            bubble.remove();
        }, 1800);
    }
}
