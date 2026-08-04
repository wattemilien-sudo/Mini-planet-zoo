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

        this.revenueTimer = 0;
    }

    buildModel() {
        let color = 0xe67e22; 
        if (this.type === 'giftShop') color = 0x9b59b6; 
        if (this.type === 'restroom') color = 0x3498db; 

        const material = new THREE.MeshStandardMaterial({ color: color, roughness: 0.6 });
        
        const boothGeo = new THREE.BoxGeometry(1.2, 1.2, 1.2);
        const booth = new THREE.Mesh(boothGeo, material);
        booth.position.y = 0.6;
        booth.castShadow = true;
        booth.receiveShadow = true;
        this.group.add(booth);

        const roofMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.5 });
        const roofGeo = new THREE.BoxGeometry(1.3, 0.2, 1.3);
        const roof = new THREE.Mesh(roofGeo, roofMat);
        roof.position.y = 1.3;
        roof.castShadow = true;
        this.group.add(roof);
    }

    update(delta, state) {
        if (this.config.revenue) {
            this.revenueTimer += delta;
            if (this.revenueTimer >= 5.0) {
                this.revenueTimer = 0;
                state.money += this.config.revenue;
            }
        }
    }

    destroy() {
        this.scene.remove(this.group);
    }
}
