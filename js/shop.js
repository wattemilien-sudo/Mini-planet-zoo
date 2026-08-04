export class Shop {
    constructor(scene, type, config, gx, gz, tileSize) {
        this.scene = scene;
        this.type = type;
        this.config = config;
        this.tileSize = tileSize;

        this.x = gx * tileSize;
        this.z = gz * tileSize;

        this.group = new THREE.Group();
        this.buildModel();

        this.group.position.set(this.x, 0, this.z);
        this.scene.add(this.group);

        // Revenue generation timer tracking
        this.revenueTimer = 0;
    }

    // Build procedural 3D shop structures
    buildModel() {
        let color = 0xe67e22; // Default orange (e.g., Ice Cream Stand)
        if (this.type === 'giftShop') color = 0x9b59b6; // Purple
        if (this.type === 'restroom') color = 0x3498db; // Blue

        const material = new THREE.MeshStandardMaterial({ color: color, roughness: 0.6 });
        
        // Main Booth Body
        const boothGeo = new THREE.BoxGeometry(1.2, 1.2, 1.2);
        const booth = new THREE.Mesh(boothGeo, material);
        booth.position.y = 0.6;
        booth.castShadow = true;
        booth.receiveShadow = true;
        this.group.add(booth);

        // Roof / Awning Detail
        const roofMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.5 });
        const roofGeo = new THREE.BoxGeometry(1.3, 0.2, 1.3);
        const roof = new THREE.Mesh(roofGeo, roofMat);
        roof.position.y = 1.3;
        roof.castShadow = true;
        this.group.add(roof);
    }

    // Called every frame inside the game loop to handle periodic income generation
    update(delta, state) {
        if (this.config.revenue) {
            this.revenueTimer += delta;
            // Generate revenue every 5 seconds
            if (this.revenueTimer >= 5.0) {
                this.revenueTimer = 0;
                state.money += this.config.revenue;
            }
        }
    }

    // Clean up shop mesh from Three.js scene when bulldozed
    destroy() {
        this.scene.remove(this.group);
    }
}
