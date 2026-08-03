import { GAME_CONFIG } from './config.js';
import { Animal } from './Animals.js';

export class WorldManager {
    constructor(containerId, state) {
        this.container = document.getElementById(containerId);
        this.state = state;
        
        // Three.js Core Components
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        
        // Grid and Map state tracking
        this.gridSize = 30;
        this.tileSize = 2;
        this.tiles = {};             // Stores grid tiles (key: "x,z", value: { type, mesh })
        this.placedEntities = [];    // Stores active animated 3D entities (animals)

        this.init();
    }

    init() {
        // Setup Renderer
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.setClearColor(0x1e272e);
        this.renderer.shadowMap.enabled = true;
        this.container.appendChild(this.renderer.domElement);

        // Position Camera
        this.camera.position.set(0, 22, 26);
        this.camera.lookAt(0, 0, 0);

        // Lighting Setup
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.65);
        this.scene.add(ambientLight);

        const dirLight = new THREE.DirectionalLight(0xffffff, 0.85);
        dirLight.position.set(20, 40, 20);
        dirLight.castShadow = true;
        this.scene.add(dirLight);

        // Invisible Ground Plane for Raycasting
        const groundGeo = new THREE.PlaneGeometry(this.gridSize * this.tileSize, this.gridSize * this.tileSize);
        const groundMat = new THREE.MeshStandardMaterial({ color: 0x2f3640, roughness: 0.9 });
        this.groundMesh = new THREE.Mesh(groundGeo, groundMat);
        this.groundMesh.rotation.x = -Math.PI / 2;
        this.groundMesh.receiveShadow = true;
        this.scene.add(this.groundMesh);

        // Visual Grid Helper Lines
        const gridHelper = new THREE.GridHelper(this.gridSize * this.tileSize, this.gridSize, 0x444444, 0x333333);
        gridHelper.position.y = 0.01;
        this.scene.add(gridHelper);

        // Raycaster & Mouse Interactivity
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();

        // Event Listeners
        window.addEventListener('resize', () => this.onWindowResize());
        this.container.addEventListener('click', (e) => this.onClick(e));

        // Create initial starting pathway at the base of the map
        this.createInitialWorld();
    }

    createInitialWorld() {
        for (let x = -1; x <= 1; x++) {
            for (let z = 12; z <= 14; z++) {
                this.createPathTile(x, z);
            }
        }
    }

    createPathTile(x, z) {
        const geo = new THREE.BoxGeometry(this.tileSize * 0.95, 0.1, this.tileSize * 0.95);
        const mat = new THREE.MeshStandardMaterial({ color: 0x7f8c8d });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(x * this.tileSize, 0.05, z * this.tileSize);
        this.scene.add(mesh);
        this.tiles[`${x},${z}`] = { type: 'path', mesh };
    }

    setActiveTool(tool, subItem) {
        this.state.currentTool = tool;
        this.state.selectedSubItem = subItem;
    }

    onWindowResize() {
        this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    }

    onClick(event) {
        const rect = this.renderer.domElement.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObject(this.groundMesh);

        if (intersects.length > 0) {
            const point = intersects[0].point;
            const gx = Math.round(point.x / this.tileSize);
            const gz = Math.round(point.z / this.tileSize);

            this.handleToolAction(gx, gz);
        }
    }

    handleToolAction(gx, gz) {
        const key = `${gx},${gz}`;
        const tool = this.state.currentTool;
        const subItem = this.state.selectedSubItem;

        if (tool === 'bulldozer') {
            if (this.tiles[key]) {
                this.scene.remove(this.tiles[key].mesh);
                delete this.tiles[key];
                this.state.money += 15; // Small refund
            }
            return;
        }

        if (tool === 'path') {
            const cost = GAME_CONFIG.tools.path.cost;
            if (this.state.money >= cost && !this.tiles[key]) {
                this.state.money -= cost;
                this.createPathTile(gx, gz);
            }
        } else if (tool === 'habitat') {
            const habitatConfig = GAME_CONFIG.habitats[subItem];
            if (habitatConfig && this.state.money >= habitatConfig.cost && !this.tiles[key]) {
                this.state.money -= habitatConfig.cost;
                this.createHabitatTile(gx, gz, habitatConfig);
            }
        } else if (tool === 'animal') {
            const animalConfig = GAME_CONFIG.animals[subItem];
            if (animalConfig && this.state.money >= animalConfig.cost) {
                this.state.money -= animalConfig.cost;
                this.spawn3DAnimal(gx, gz, animalConfig);
                this.state.rating += 8;
            }
        } else if (tool === 'shop') {
            const shopConfig = GAME_CONFIG.shops[subItem];
            if (shopConfig && this.state.money >= shopConfig.cost && !this.tiles[key]) {
                this.state.money -= shopConfig.cost;
                this.spawnShop(gx, gz, shopConfig);
            }
        }
    }

    createHabitatTile(gx, gz, config) {
        const geo = new THREE.BoxGeometry(this.tileSize * 0.95, 0.15, this.tileSize * 0.95);
        const mat = new THREE.MeshStandardMaterial({ color: config.color, roughness: 0.8 });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(gx * this.tileSize, 0.075, gz * this.tileSize);
        this.scene.add(mesh);
        this.tiles[`${gx},${gz}`] = { type: 'habitat', subType: config.name, mesh };
    }

    spawn3DAnimal(gx, gz, config) {
        const group = new THREE.Group();

        if (config.modelType === 'kangaroo') {
            // Procedural 3D Kangaroo Builder
            const furMaterial = new THREE.MeshStandardMaterial({ color: 0xd4a373, roughness: 0.7 });
            
            // Torso
            const body = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.55, 0.35), furMaterial);
            body.position.y = 0.45;
            group.add(body);

            // Head
            const head = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.25, 0.3), furMaterial);
            head.position.set(0, 0.8, 0.15);
            group.add(head);

            // Tail
            const tail = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.12, 0.5), furMaterial);
            tail.rotation.x = Math.PI / 4;
            tail.position.set(0, 0.35, -0.25);
            group.add(tail);
        } else {
            // Default Quadruped Placeholder
            const mat = new THREE.MeshStandardMaterial({ color: 0x95a5a6 });
            const body = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.4, 0.8), mat);
            body.position.y = 0.4;
            group.add(body);
        }

        group.position.set(gx * this.tileSize, 0, gz * this.tileSize);
        this.scene.add(group);

        // Keep reference for animation updates in game loop
        this.placedEntities.push({
            type: 'animal',
            mesh: group,
            baseY: 0,
            hopSpeed: 6 + Math.random() * 2,
            offset: Math.random() * 10
        });
    }

    spawnShop(gx, gz, config) {
        const group = new THREE.Group();
        const boothGeo = new THREE.BoxGeometry(1.2, 1.2, 1.2);
        const mat = new THREE.MeshStandardMaterial({ color: 0xe67e22 });
        const booth = new THREE.Mesh(boothGeo, mat);
        booth.position.y = 0.6;
        group.add(booth);

        group.position.set(gx * this.tileSize, 0, gz * this.tileSize);
        this.scene.add(group);
        this.tiles[`${gx},${gz}`] = { type: 'shop', mesh: group };
    }

    update(delta, time) {
        // Animate placed 3D animals (hopping/bouncing effect)
        this.placedEntities.forEach(entity => {
            if (entity.type === 'animal') {
                const hop = Math.abs(Math.sin(time * 0.005 * entity.hopSpeed + entity.offset)) * 0.18;
                entity.mesh.position.y = entity.baseY + hop;
            }
        });

        // Render the 3D Scene
        this.renderer.render(this.scene, this.camera);
    }
}
