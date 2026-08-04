export class Staff {
    constructor(scene, type, config, startX, startZ, tileSize) {
        this.scene = scene;
        this.type = type;
        this.config = config;
        this.tileSize = tileSize;

        this.x = startX * tileSize;
        this.z = startZ * tileSize;

        this.group = new THREE.Group();
        this.buildModel();

        this.group.position.set(this.x, 0, this.z);
        this.scene.add(this.group);

        // Animation tracking variables
        this.walkCycle = Math.random() * 10;
    }

    // Build procedural 3D staff model with a uniform and hat
    buildModel() {
        const uniformMat = new THREE.MeshStandardMaterial({ color: 0x27ae60, roughness: 0.6 }); // Zookeeper green
        const skinMat = new THREE.MeshStandardMaterial({ color: 0xffdbac, roughness: 0.7 });
        const pantsMat = new THREE.MeshStandardMaterial({ color: 0x7f8c8d, roughness: 0.8 });
        const hatMat = new THREE.MeshStandardMaterial({ color: 0xd35400, roughness: 0.5 }); // Distinct hat

        // Torso / Uniform Shirt
        const body = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.35, 0.15), uniformMat);
        body.position.y = 0.35;
        body.castShadow = true;
        this.group.add(body);

        // Head
        const head = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.2, 0.2), skinMat);
        head.position.set(0, 0.62, 0);
        head.castShadow = true;
        this.group.add(head);

        // Staff Hat
        const hat = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.08, 0.24), hatMat);
        hat.position.set(0, 0.75, 0);
        hat.castShadow = true;
        this.group.add(hat);

        // Legs
        const leftLeg = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.25, 0.1), pantsMat);
        leftLeg.position.set(-0.07, 0.12, 0);
        this.group.add(leftLeg);

        const rightLeg = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.25, 0.1), pantsMat);
        rightLeg.position.set(0.07, 0.12, 0);
        this.group.add(rightLeg);
    }

    // Called every frame inside the game loop to manage animation updates
    update(delta, time, state) {
        this.walkCycle += delta * 8;
        const bob = Math.abs(Math.sin(this.walkCycle)) * 0.05;
        this.group.position.y = bob;
    }

    // Clean up staff mesh from Three.js scene when removed
    destroy() {
        this.scene.remove(this.group);
    }
}
