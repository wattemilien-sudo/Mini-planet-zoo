export class UIManager {
    constructor(state, worldManager) {
        this.state = state;
        this.worldManager = worldManager;
        this.initUI();
    }

    initUI() {
        // Cache DOM elements
        this.moneyEl = document.getElementById('money-display');
        this.visitorsEl = document.getElementById('visitors-display');
        this.ratingEl = document.getElementById('rating-display');

        // Setup tool button click listeners
        const toolButtons = document.querySelectorAll('.tool-btn');
        toolButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tool = btn.getAttribute('data-tool');
                const subItem = btn.getAttribute('data-subitem') || null;
                
                toolButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                this.worldManager.setActiveTool(tool, subItem);
            });
        });
    }

    update() {
        if (this.moneyEl) this.moneyEl.textContent = `$${Math.floor(this.state.money)}`;
        if (this.visitorsEl) this.visitorsEl.textContent = this.state.visitors;
        if (this.ratingEl) this.ratingEl.textContent = this.state.rating;
    }
}
