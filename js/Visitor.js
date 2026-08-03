export class Visitor {
    constructor(scene, startX, startZ, tileSize) {
        this.scene = scene;
        this.tileSize = tileSize;

        // Current world coordinates
        this.x = startX * tileSize;
        this.z = startZ * tileSize;

        // 3D Group container for human body parts
        this.group = new THREE.Group();
        this.buildModel();

        this.group.position.set(this.x, 0, this.z);
        this.scene.add(this.group);

        // Animation tracking variables
        this.walkCycle = Math.random() * 10;
        this.speed = 2.0;
        this.happiness = 80; // Out of 100
    }

    // Build procedural 3D blocky human model
    buildModel() {
        const shirtColors = [0x3498db, 0xe74c3c, 0x2ecc71, 0x9b59b6, 0xf1c40f];
        const randomShirtColor = shirtColors[Math.floor(Math.random() * shirtColors.length)];

        const shirtMat = new THREE.MeshStandardMaterial({ color: randomShirtColor, roughness: 0.6 });
        const skinMat = new THREE.MeshStandardMaterial({ color: 0xffdbac, roughness: 0.7 });
        const pantsMat = new THREE.MeshStandardMaterial({ color: 0x2c3e50, roughness: 0.8 });

        // Torso / Shirt
        const body = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.35, 0.15), shirtMat);
        body.position.y = 0.35;
        body.castShadow = true;
        this.group.add(body);

        // Head
        const head = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.2, 0.2), skinMat);
        head.position.set(0, 0.62, 0);
        head.castShadow = true;
        this.group.add(head);

        // Legs
        const leftLeg = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.25, 0.1), pantsMat);
        leftLeg.position.set(-0.07, 0.12, 0);
        this.group.add(leftLeg);

        const rightLeg = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.25, 0.1), pantsMat);
        rightLeg.position.set(0.07, 0.12, 0);
        this.group.add(rightLeg);
    }

    // Called every frame inside the game loop to manage walking bob and movement
    update(delta, time) {
        // Simple walking bob animation loop
        this.walkCycle += delta * 10;
        const bob = Math.abs(Math.sin(this.walkCycle)) * 0.06;
        this.group.position.y = bob;
    }

    // Clean up visitor mesh from Three.js scene when they leave the zoo
    destroy() {
        this.scene.remove(this.group);
    }
}
