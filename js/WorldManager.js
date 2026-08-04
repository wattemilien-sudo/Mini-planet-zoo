import { GAME_CONFIG } from './config.js';
import { Animal } from './Animals.js';
import { Visitor } from './Visitor.js';
import { Shop } from './shop.js';
import { Staff } from './staff.js';

export class WorldManager {
    constructor(containerId, state) {
        this.container = document.getElementById(containerId);
        this.state = state;
        
        // Three.js Core Components
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = null;
        
        // Grid and Map state tracking
        this.gridSize = 30;
        this.tileSize = 2;
        this.tiles = {};             // Stores grid tiles (key: "x,z", value: { type, mesh, entity })
        this.placedEntities = [];    // Stores active animated 3D entities (animals)
        this.visitors = [];          // Stores walking visitors
        this.shops = [];             // Stores active shops
        this.staff = [];             // Stores active staff members

        this.init();
    }

init() {
        if (this.container) {
            this.container.innerHTML = '';
        } else {
            console.error("Game container element not found!");
            return;
        }

        // Programmatically check if WebGL is supported before running Three.js
        const hasWebGL = (() => {
            try {
                const canvas = document.createElement('canvas');
                return !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
            } catch (e) {
                return false;
            }
        })();

        if (!hasWebGL) {
            this.container.innerHTML = `
                <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; color: white; font-family: sans-serif; text-align: center; padding: 20px;">
                    <h3 style="color: #e74c3c; margin-bottom: 10px;">⚠️ WebGL Context Not Available</h3>
                    <p style="font-size: 14px; color: #b2bec3; max-width: 400px; line-height: 1.5;">
                        Your current environment or browser settings do not support WebGL 3D graphics. Please open this game link in a standard desktop browser (like Google Chrome or Microsoft Edge) with Hardware Acceleration enabled.
                    </p>
                </div>
            `;
            return;
        }

        try {
            this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
        } catch (e) {
            console.error("Renderer creation failed:", e);
            return;
        }

        this.renderer.setSize(this.container.clientWidth || window.innerWidth, this.container.clientHeight || window.innerHeight);
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

        // Create initial starting pathway and spawn initial entities
        this.createInitialWorld();
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
                if (this.tiles[key].entity && typeof this.tiles[key].entity.destroy === 'function') {
                    this.tiles[key].entity.destroy();
                } else if (this.tiles[key].mesh) {
                    this.scene.remove(this.tiles[key].mesh);
                }
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
                this.spawn3DAnimal(gx, gz, subItem, animalConfig);
                this.state.rating += 8;
            }
        } else if (tool === 'shop') {
            const shopConfig = GAME_CONFIG.shops[subItem];
            if (shopConfig && this.state.money >= shopConfig.cost && !this.tiles[key]) {
                this.state.money -= shopConfig.cost;
                this.spawnShop(gx, gz, subItem, shopConfig);
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

    spawn3DAnimal(gx, gz, subItem, config) {
        const newAnimal = new Animal(this.scene, subItem, config, gx, gz, this.tileSize);
        this.placedEntities.push(newAnimal);
    }

    spawnShop(gx, gz, subItem, config) {
        const newShop = new Shop(this.scene, subItem, config, gx, gz, this.tileSize);
        this.shops.push(newShop);
        this.tiles[`${gx},${gz}`] = { type: 'shop', entity: newShop };
    }

    update(delta, time) {
        // Animate placed 3D animals
        this.placedEntities.forEach(entity => {
            if (entity.update) {
                entity.update(delta, time);
            }
        });

        // Animate visitors
        this.visitors.forEach(visitor => {
            if (visitor.update) {
                visitor.update(delta, time);
            }
        });

        // Animate staff members
        this.staff.forEach(member => {
            if (member.update) {
                member.update(delta, time, this.state);
            }
        });

        // Update shops (revenue generation)
        this.shops.forEach(shop => {
            if (shop.update) {
                shop.update(delta, this.state);
            }
        });

        // Render the 3D Scene
        this.renderer.render(this.scene, this.camera);
    }
}
