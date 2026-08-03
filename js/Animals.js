export class Animal {
    constructor(scene, type, config, gx, gz, tileSize) {
        this.scene = scene;
        this.type = type;
        this.config = config;
        this.tileSize = tileSize;
        
        // Grid and world positioning
        this.originX = gx;
        this.originZ = gz;
        this.currentX = gx * tileSize;
        this.currentZ = gz * tileSize;
        
        // 3D Group container for all body parts
        this.group = new THREE.Group();
        this.buildModel();
        
        this.group.position.set(this.currentX, 0, this.currentZ);
        this.scene.add(this.group);
        
        // Animation variables
        this.hopSpeed = 6 + Math.random() * 2;
        this.offset = Math.random() * 10;
        this.baseY = 0;
    }

    // Build procedural 3D shapes depending on the animal type
    buildModel() {
        if (this.config.modelType === 'kangaroo') {
            const furMaterial = new THREE.MeshStandardMaterial({ color: 0xd4a373, roughness: 0.7 });
            
            // Torso
            const body = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.55, 0.35), furMaterial);
            body.position.y = 0.45;
            body.castShadow = true;
            this.group.add(body);

            // Head
            const head = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.25, 0.3), furMaterial);
            head.position.set(0, 0.8, 0.15);
            head.castShadow = true;
            this.group.add(head);

            // Tail
            const tail = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.12, 0.5), furMaterial);
            tail.rotation.x = Math.PI / 4;
            tail.position.set(0, 0.35, -0.25);
            this.group.add(tail);

        } else if (this.config.modelType === 'biped') {
            // Penguin / Biped style
            const bodyMat = new THREE.MeshStandardMaterial({ color: 0x2f3640, roughness: 0.6 });
            const bellyMat = new THREE.MeshStandardMaterial({ color: 0xf5f6fa, roughness: 0.6 });

            const body = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.45, 0.25), bodyMat);
            body.position.y = 0.3;
            body.castShadow = true;
            this.group.add(body);

            const belly = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.35, 0.05), bellyMat);
            belly.position.set(0, 0.28, 0.13);
            this.group.add(belly);

        } else {
            // Default Quadruped (e.g., Lion / Bear)
            const mat = new THREE.MeshStandardMaterial({ color: 0xe58e26, roughness: 0.7 });
            
            const body = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.35, 0.8), mat);
            body.position.y = 0.35;
            body.castShadow = true;
            this.group.add(body);

            const head = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.3, 0.35), mat);
            head.position.set(0, 0.5, 0.45);
            head.castShadow = true;
            this.group.add(head);
        }
    }

    // Called every frame inside the game loop to handle bouncing/hopping animations
    update(delta, time) {
        const hop = Math.abs(Math.sin(time * 0.005 * this.hopSpeed + this.offset)) * 0.18;
        this.group.position.y = this.baseY + hop;
    }

    // Clean up meshes from the Three.js scene when demolished
    destroy() {
        this.scene.remove(this.group);
    }
}
