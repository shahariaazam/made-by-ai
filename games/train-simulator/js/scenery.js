/**
 * Scenery module - Handles environment elements like trees, houses, and stations
 */
import Config from './config.js';

export default class Scenery {
    // ... existing code ...
    
    createTrees() {
        const { count, trackSafetyMargin } = Config.scenery.trees;
        
        // Materials for more realistic trees
        const treeMaterialDark = new THREE.MeshStandardMaterial({ 
            color: 0x1B5E20, 
            roughness: 0.85 
        });
        const treeMaterialLight = new THREE.MeshStandardMaterial({ 
            color: 0x388E3C, 
            roughness: 0.8 
        });
        const trunkMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x4E342E, 
            roughness: 0.9 
        });

        for (let i = 0; i < count; i++) {
            const treeGroup = new THREE.Group();
            
            // More realistic trunk - use scaled cylinder
            const trunkHeight = Math.random() * 4 + 4;
            const trunkGeo = new THREE.CylinderGeometry(
                0.3 + Math.random() * 0.2, 
                0.4 + Math.random() * 0.3, 
                trunkHeight, 
                8
            );
            const trunk = new THREE.Mesh(trunkGeo, trunkMaterial);
            trunk.position.y = trunkHeight / 2;
            trunk.castShadow = true;
            treeGroup.add(trunk);

            // More realistic foliage - use multiple cones for different layers
            const treeType = Math.floor(Math.random() * 3); // 0: pine, 1: broad, 2: mixed
            
            if (treeType === 0) {
                // Pine tree (multiple cones of decreasing size)
                const layers = Math.floor(Math.random() * 2) + 3;
                const baseRadius = Math.random() * 1.5 + 2;
                const baseHeight = Math.random() * 2 + 3;
                
                for (let j = 0; j < layers; j++) {
                    const layerScale = 1 - (j * 0.15);
                    const coneGeo = new THREE.ConeGeometry(
                        baseRadius * layerScale, 
                        baseHeight * layerScale, 
                        8
                    );
                    const cone = new THREE.Mesh(coneGeo, treeMaterialDark);
                    cone.position.y = trunkHeight + (j * baseHeight * 0.5);
                    cone.castShadow = true;
                    treeGroup.add(cone);
                }
            } else {
                // Broad or mixed trees (multiple spheres)
                const foliageSize = Math.random() * 3 + 2;
                const sphereGeo = new THREE.SphereGeometry(foliageSize, 8, 8);
                const material = treeType === 1 ? treeMaterialLight : 
                                 (Math.random() > 0.5 ? treeMaterialLight : treeMaterialDark);
                const foliage = new THREE.Mesh(sphereGeo, material);
                foliage.position.y = trunkHeight + foliageSize * 0.7;
                foliage.scale.y = 0.8; // Slightly flatten sphere
                foliage.castShadow = true;
                treeGroup.add(foliage);
            }

            // Find suitable position for tree
            let validPosition = this.findSafePosition(trackSafetyMargin);
            if (validPosition) {
                // Add some variation to rotation
                treeGroup.rotation.y = Math.random() * Math.PI * 2;
                treeGroup.position.copy(validPosition);
                this.sceneryObjects.add(treeGroup);
            }
        }
    }
    
    createHouses() {
        const { count, trackSafetyMargin } = Config.scenery.houses;
        
        // Materials
        const houseMaterials = [
            new THREE.MeshStandardMaterial({ color: 0xE8EAF6, roughness: 0.8 }), // White
            new THREE.MeshStandardMaterial({ color: 0xFFECB3, roughness: 0.8 }), // Yellow
            new THREE.MeshStandardMaterial({ color: 0xD7CCC8, roughness: 0.8 }), // Light brown
            new THREE.MeshStandardMaterial({ color: 0xBCAAA4, roughness: 0.8 })  // Darker brown
        ];
        
        const roofMaterials = [
            new THREE.MeshStandardMaterial({ color: 0x8B4513, roughness: 0.7 }), // Brown
            new THREE.MeshStandardMaterial({ color: 0x3E2723, roughness: 0.7 }), // Dark brown
            new THREE.MeshStandardMaterial({ color: 0x424242, roughness: 0.7 })  // Dark gray
        ];
        
        const windowMaterial = new THREE.MeshStandardMaterial({
            color: 0x84FFFF, 
            roughness: 0.2,
            metalness: 0.8,
            transparent: true,
            opacity: 0.7
        });
        
        const doorMaterial = new THREE.MeshStandardMaterial({
            color: 0x5D4037,
            roughness: 0.7
        });
        
        for (let i = 0; i < count; i++) {
            const houseGroup = new THREE.Group();
            
            // Random house dimensions
            const houseWidth = Math.random() * 5 + 8;
            const houseDepth = Math.random() * 4 + 6;
            const houseHeight = Math.random() * 2 + 4;
            
            // Select random materials for this house
            const wallMaterial = houseMaterials[Math.floor(Math.random() * houseMaterials.length)];
            const roofMaterial = roofMaterials[Math.floor(Math.random() * roofMaterials.length)];

            // House walls
            const wallGeo = new THREE.BoxGeometry(houseWidth, houseHeight, houseDepth);
            const walls = new THREE.Mesh(wallGeo, wallMaterial);
            walls.position.y = houseHeight / 2;
            walls.castShadow = true;
            walls.receiveShadow = true;
            houseGroup.add(walls);

            // Choose between different roof types
            const roofType = Math.floor(Math.random() * 3);
            
            if (roofType === 0) {
                // Pitched roof (pyramid/cone)
                const roofGeo = new THREE.ConeGeometry(
                    Math.max(houseWidth, houseDepth) * 0.6, 
                    houseHeight * 0.8, 
                    4
                );
                const roof = new THREE.Mesh(roofGeo, roofMaterial);
                roof.position.y = houseHeight + houseHeight * 0.4 - 0.1;
                roof.rotation.y = Math.PI / 4;
                roof.castShadow = true;
                houseGroup.add(roof);
            } else if (roofType === 1) {
                // Gabled roof (triangular prism)
                const roofHeight = houseHeight * 0.6;
                const roofGeo = new THREE.BufferGeometry();
                
                // Create vertices for a gabled roof
                const vertices = new Float32Array([
                    // Front triangle
                    -houseWidth/2, houseHeight, houseDepth/2,
                    houseWidth/2, houseHeight, houseDepth/2,
                    0, houseHeight + roofHeight, houseDepth/2,
                    
                    // Back triangle
                    -houseWidth/2, houseHeight, -houseDepth/2,
                    houseWidth/2, houseHeight, -houseDepth/2,
                    0, houseHeight + roofHeight, -houseDepth/2,
                    
                    // Side 1
                    -houseWidth/2, houseHeight, houseDepth/2,
                    0, houseHeight + roofHeight, houseDepth/2,
                    -houseWidth/2, houseHeight, -houseDepth/2,
                    0, houseHeight + roofHeight, -houseDepth/2,
                    
                    // Side 2
                    houseWidth/2, houseHeight, houseDepth/2,
                    0, houseHeight + roofHeight, houseDepth/2,
                    houseWidth/2, houseHeight, -houseDepth/2,
                    0, houseHeight + roofHeight, -houseDepth/2
                ]);
                
                const indices = [
                    0, 1, 2,
                    3, 5, 4,
                    6, 7, 8,
                    8, 7, 9,
                    10, 12, 11,
                    11, 12, 13
                ];
                
                roofGeo.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
                roofGeo.setIndex(indices);
                roofGeo.computeVertexNormals();
                
                const roof = new THREE.Mesh(roofGeo, roofMaterial);
                roof.castShadow = true;
                houseGroup.add(roof);
            } else {
                // Flat roof
                const roofGeo = new THREE.BoxGeometry(houseWidth * 1.1, 0.5, houseDepth * 1.1);
                const roof = new THREE.Mesh(roofGeo, roofMaterial);
                roof.position.y = houseHeight + 0.25;
                roof.castShadow = true;
                houseGroup.add(roof);
            }

            // Add windows
            this.addWindowsToHouse(walls, windowMaterial, houseWidth, houseHeight, houseDepth);
            
            // Add door
            const doorWidth = 1.5;
            const doorHeight = 2.5;
            const doorGeo = new THREE.PlaneGeometry(doorWidth, doorHeight);
            const door = new THREE.Mesh(doorGeo, doorMaterial);
            door.position.set(0, doorHeight/2, houseDepth/2 + 0.05);
            walls.add(door);

            // Find suitable position for house
            let validPosition = this.findSafePosition(trackSafetyMargin);
            if (validPosition) {
                houseGroup.position.copy(validPosition);
                houseGroup.rotation.y = Math.random() * Math.PI * 2;
                this.sceneryObjects.add(houseGroup);
            }
        }
    }
    
    addWindowsToHouse(house, windowMaterial, width, height, depth) {
        // Front and back windows
        const windowWidth = 1.2;
        const windowHeight = 1.2;
        const windowOffsetY = height * 0.6;
        
        // Place windows symmetrically
        const sides = [
            { z: depth/2 + 0.01, rotationY: 0 },             // Front
            { z: -depth/2 - 0.01, rotationY: Math.PI },      // Back
            { x: width/2 + 0.01, rotationY: Math.PI/2 },     // Right
            { x: -width/2 - 0.01, rotationY: -Math.PI/2 }    // Left
        ];
        
        sides.forEach(side => {
            // Place 1-3 windows depending on house size
            const numWindows = Math.floor(Math.random() * 3) + 1;
            
            for (let i = 0; i < numWindows; i++) {
                const windowGeo = new THREE.PlaneGeometry(windowWidth, windowHeight);
                const window = new THREE.Mesh(windowGeo, windowMaterial);
                
                if (side.z !== undefined) {
                    // Front/back window
                    const offset = (width - windowWidth) * (i/(numWindows-1 || 1) - 0.5);
                    window.position.set(offset, windowOffsetY, side.z);
                } else {
                    // Side window
                    const offset = (depth - windowWidth) * (i/(numWindows-1 || 1) - 0.5);
                    window.position.set(side.x, windowOffsetY, offset);
                }
                
                window.rotation.y = side.rotationY;
                house.add(window);
            }
        });
    }
    
    createStation() {
        // Place station at a specific point along the track
        const stationPoint = this.trackPath.getPointAt(0.1);
        const stationTangent = this.trackPath.getTangentAt(0.1).normalize();
        const stationBinormal = new THREE.Vector3().crossVectors(
            stationTangent, 
            new THREE.Vector3(0, 1, 0)
        ).normalize();

        const stationGroup = new THREE.Group();
        
        // Platform
        const platformGeo = new THREE.BoxGeometry(40, 1.5, 10);
        const platformMat = new THREE.MeshStandardMaterial({ 
            color: 0x9E9E9E, 
            roughness: 0.7 
        });
        const platform = new THREE.Mesh(platformGeo, platformMat);
        
        // Position platform beside the track with more offset to avoid collision
        platform.position.copy(stationPoint).add(stationBinormal.clone().multiplyScalar(15));
        platform.position.y = 0.75;

        // Align station platform with the track tangent
        const platformLookAtTarget = platform.position.clone().add(stationTangent);
        platform.lookAt(platformLookAtTarget);

        platform.receiveShadow = true;
        platform.castShadow = true;
        stationGroup.add(platform);

        // Station roof
        const stationRoofGeo = new THREE.BoxGeometry(42, 0.5, 12);
        const stationRoofMat = new THREE.MeshStandardMaterial({color: 0xA1887F});
        const stationRoof = new THREE.Mesh(stationRoofGeo, stationRoofMat);
        stationRoof.position.set(0, 4, 0);
        platform.add(stationRoof);
        
        // Support columns for roof
        this.addStationColumns(platform);

        // Add passengers on platform
        this.addPassengers(platform);
        
        // Add station sign
        this.addStationSign(platform);

        this.sceneryObjects.add(stationGroup);
    }
    
    addStationSign(platform) {
        // Add station name sign
        const signMaterial = new THREE.MeshStandardMaterial({
            color: 0x1976D2,
            roughness: 0.7
        });
        const textMaterial = new THREE.MeshStandardMaterial({
            color: 0xFFFFFF,
            roughness: 0.4
        });
        
        // Create a sign board
        const signGeo = new THREE.BoxGeometry(8, 1.5, 0.2);
        const sign = new THREE.Mesh(signGeo, signMaterial);
        sign.position.set(0, 3, -4.5);
        platform.add(sign);
        
        // Add posts for the sign
        const postGeo = new THREE.BoxGeometry(0.3, 3, 0.3);
        const leftPost = new THREE.Mesh(postGeo, signMaterial);
        leftPost.position.set(-3.5, 1.5, -4.5);
        platform.add(leftPost);
        
        const rightPost = new THREE.Mesh(postGeo, signMaterial);
        rightPost.position.set(3.5, 1.5, -4.5);
        platform.add(rightPost);
        
        // Create "STATION" text (simple boxes for each letter)
        const letters = [
            // S
            { x: -3.0, w: 0.8 },
            // T
            { x: -2.0, w: 0.8 },
            // A
            { x: -1.0, w: 0.8 },
            // T
            { x: 0.0, w: 0.8 },
            // I
            { x: 1.0, w: 0.4 },
            // O
            { x: 2.0, w: 0.8 },
            // N
            { x: 3.0, w: 0.8 }
        ];
        
        letters.forEach(letter => {
            const letterGeo = new THREE.BoxGeometry(letter.w, 0.8, 0.05);
            const letterMesh = new THREE.Mesh(letterGeo, textMaterial);
            letterMesh.position.set(letter.x, 0, 0.125);
            sign.add(letterMesh);
        });
    }
    
    // ... existing code ...
} 