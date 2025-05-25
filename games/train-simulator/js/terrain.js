/**
 * Terrain module - Handles creation of detailed landscape
 */
import Config from './config.js';

export default class Terrain {
    constructor(scene) {
        this.scene = scene;
        
        // Create detailed ground with height map
        this.createDetailedTerrain();
    }
    
    createDetailedTerrain() {
        // Create a terrain with height map
        const terrainSize = 1500;
        const resolution = 128;
        const heightMultiplier = 15;
        
        // Create heightmap
        const heightMap = this.generateHeightMap(resolution);
        
        // Create ground geometry
        const groundGeometry = new THREE.PlaneGeometry(
            terrainSize, 
            terrainSize, 
            resolution - 1, 
            resolution - 1
        );
        
        // Apply height map to vertices
        const vertices = groundGeometry.attributes.position.array;
        for (let i = 0; i < vertices.length; i += 3) {
            const x = Math.floor((i/3) % resolution);
            const y = Math.floor((i/3) / resolution);
            
            if (x < resolution && y < resolution) {
                const height = heightMap[y][x] * heightMultiplier;
                vertices[i+2] = height; // z-coordinate is the height
            }
        }
        
        // Need to update normals after changing vertices
        groundGeometry.computeVertexNormals();
        
        // Create detailed ground materials
        const groundMaterial = new THREE.MeshStandardMaterial({
            color: 0x556B2F,
            roughness: 0.95,
            metalness: 0.05
        });
        
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        
        // Add ground to scene
        this.scene.add(ground);
        
        return ground;
    }
    
    generateHeightMap(resolution) {
        // Create a simple procedural height map
        const heightMap = [];
        
        // Generate base noise
        for (let y = 0; y < resolution; y++) {
            heightMap[y] = [];
            
            for (let x = 0; x < resolution; x++) {
                // Create some gentle hills, with a flat area in the middle for tracks
                let dx = x / resolution - 0.5;
                let dy = y / resolution - 0.5;
                let dist = Math.sqrt(dx * dx + dy * dy) * 2;
                
                // Keep the middle area flat for the train tracks
                if (dist < 0.3) {
                    heightMap[y][x] = 0;
                } else {
                    // Create some noise for terrain outside the track area
                    let noise = Math.sin(x * 0.1) * Math.cos(y * 0.1) * 0.25;
                    noise += Math.sin(x * 0.05 + y * 0.05) * 0.35;
                    
                    // Add some random variation
                    noise += (Math.random() * 0.1 - 0.05);
                    
                    // Scale based on distance from center
                    heightMap[y][x] = Math.max(0, noise * (dist - 0.3) * 2);
                }
            }
        }
        
        // Smooth the heightmap
        this.smoothHeightMap(heightMap, resolution);
        
        return heightMap;
    }
    
    smoothHeightMap(heightMap, resolution) {
        // Apply simple smoothing filter
        const smoothed = JSON.parse(JSON.stringify(heightMap)); // Deep copy
        
        for (let y = 1; y < resolution - 1; y++) {
            for (let x = 1; x < resolution - 1; x++) {
                // Apply 3x3 average filter
                smoothed[y][x] = (
                    heightMap[y-1][x-1] + heightMap[y-1][x] + heightMap[y-1][x+1] +
                    heightMap[y][x-1] + heightMap[y][x] + heightMap[y][x+1] +
                    heightMap[y+1][x-1] + heightMap[y+1][x] + heightMap[y+1][x+1]
                ) / 9;
            }
        }
        
        // Copy back to original height map
        for (let y = 1; y < resolution - 1; y++) {
            for (let x = 1; x < resolution - 1; x++) {
                heightMap[y][x] = smoothed[y][x];
            }
        }
    }
    
    // Add water to the terrain (lakes, rivers)
    addWater() {
        const waterGeometry = new THREE.PlaneGeometry(1000, 1000);
        const waterMaterial = new THREE.MeshPhongMaterial({
            color: 0x0055ff,
            transparent: true,
            opacity: 0.6,
            specular: 0x111111,
            shininess: 50
        });
        
        const water = new THREE.Mesh(waterGeometry, waterMaterial);
        water.rotation.x = -Math.PI / 2;
        water.position.y = -1; // Just below terrain level
        
        this.scene.add(water);
        
        return water;
    }
} 