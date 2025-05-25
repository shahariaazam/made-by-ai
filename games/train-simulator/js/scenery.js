/**
 * Scenery module - Handles environment elements like trees, houses, and stations
 */
import Config from './config.js';

export default class Scenery {
    constructor(scene, trackPath) {
        this.scene = scene;
        this.trackPath = trackPath;
        this.sceneryObjects = new THREE.Group();
        
        this.createTrees();
        this.createHouses();
        this.createStation();
        
        scene.add(this.sceneryObjects);
    }
    
    createTrees() {
        const { count, trackSafetyMargin } = Config.scenery.trees;
        
        // Materials
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
            
            // Trunk
            const trunkHeight = Math.random() * 4 + 4;
            const trunkGeo = new THREE.CylinderGeometry(
                0.4 + Math.random() * 0.3, 
                0.5 + Math.random() * 0.4, 
                trunkHeight, 
                8
            );
            const trunk = new THREE.Mesh(trunkGeo, trunkMaterial);
            trunk.position.y = trunkHeight / 2;
            trunk.castShadow = true;
            treeGroup.add(trunk);

            // Foliage
            const leavesHeight = Math.random() * 5 + 5;
            const leavesRadius = Math.random() * 2 + 2;
            const leavesGeo = new THREE.ConeGeometry(leavesRadius, leavesHeight, 12);
            const leavesMaterial = Math.random() < 0.5 ? treeMaterialDark : treeMaterialLight;
            const leaves = new THREE.Mesh(leavesGeo, leavesMaterial);
            leaves.position.y = trunkHeight + leavesHeight / 2 - 0.8;
            leaves.castShadow = true;
            treeGroup.add(leaves);

            // Find suitable position for tree
            let validPosition = this.findSafePosition(trackSafetyMargin);
            if (validPosition) {
                treeGroup.position.copy(validPosition);
                this.sceneryObjects.add(treeGroup);
            }
        }
    }
    
    createHouses() {
        const { count, trackSafetyMargin } = Config.scenery.houses;
        
        // Materials
        const houseWallMat = new THREE.MeshStandardMaterial({
            color: 0xD2B48C, 
            roughness: 0.8
        });
        const houseRoofMat = new THREE.MeshStandardMaterial({
            color: 0x8B4513, 
            roughness: 0.7
        });
        
        for (let i = 0; i < count; i++) {
            const houseGroup = new THREE.Group();
            
            // Random house dimensions
            const houseWidth = Math.random() * 5 + 8;
            const houseDepth = Math.random() * 4 + 6;
            const houseHeight = Math.random() * 2 + 4;

            // House walls
            const wallGeo = new THREE.BoxGeometry(houseWidth, houseHeight, houseDepth);
            const walls = new THREE.Mesh(wallGeo, houseWallMat);
            walls.position.y = houseHeight / 2;
            walls.castShadow = true;
            houseGroup.add(walls);

            // House roof
            const roofGeo = new THREE.ConeGeometry(houseWidth * 0.7, houseHeight * 0.8, 4);
            const roof = new THREE.Mesh(roofGeo, houseRoofMat);
            roof.position.y = houseHeight + houseHeight * 0.4 - 0.1;
            roof.rotation.y = Math.PI / 4;
            roof.castShadow = true;
            houseGroup.add(roof);

            // Find suitable position for house
            let validPosition = this.findSafePosition(trackSafetyMargin);
            if (validPosition) {
                houseGroup.position.copy(validPosition);
                houseGroup.rotation.y = Math.random() * Math.PI * 2;
                this.sceneryObjects.add(houseGroup);
            }
        }
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
        
        // Position platform beside the track
        platform.position.copy(stationPoint).add(stationBinormal.clone().multiplyScalar(10));
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

        this.sceneryObjects.add(stationGroup);
    }
    
    addStationColumns(platform) {
        const columnMaterial = new THREE.MeshStandardMaterial({
            color: 0x6D4C41,
            roughness: 0.7
        });
        
        // Add columns to support the roof
        const columnPositions = [
            [-18, 0, -4], [-18, 0, 4],
            [-9, 0, -4], [-9, 0, 4],
            [0, 0, -4], [0, 0, 4],
            [9, 0, -4], [9, 0, 4],
            [18, 0, -4], [18, 0, 4]
        ];
        
        columnPositions.forEach(pos => {
            const columnGeo = new THREE.CylinderGeometry(0.3, 0.3, 4, 8);
            const column = new THREE.Mesh(columnGeo, columnMaterial);
            column.position.set(pos[0], 2, pos[1]);
            column.castShadow = true;
            platform.add(column);
        });
    }
    
    addPassengers(platform) {
        // Add some passengers waiting on the platform
        const passengerMat = new THREE.MeshStandardMaterial({ 
            color: 0x4FC3F7, 
            roughness: 0.6 
        });
        const passengerGeo = new THREE.CylinderGeometry(0.3, 0.3, 1.7, 8);
        
        for (let i = 0; i < 8; i++) {
            const passenger = new THREE.Mesh(passengerGeo, passengerMat);
            passenger.position.set(-15 + i * 4, 1.7 / 2, Math.random() * 4 - 2);
            passenger.castShadow = true;
            platform.add(passenger);
        }
    }
    
    findSafePosition(safetyMargin) {
        let validPosition = null;
        let attempts = 0;
        const maxAttempts = 10;
        
        while (!validPosition && attempts < maxAttempts) {
            // Select random point along track
            const randomTrackPoint = this.trackPath.getPointAt(Math.random());
            
            // Generate random angle and distance from track
            const randomAngle = Math.random() * Math.PI * 2;
            const randomDistance = Math.random() * 100 + safetyMargin;
            
            // Calculate candidate position
            const candidatePos = new THREE.Vector3(
                randomTrackPoint.x + Math.cos(randomAngle) * randomDistance,
                0,
                randomTrackPoint.z + Math.sin(randomAngle) * randomDistance
            );
            
            // Check if position is safe distance from all track points
            let minDistanceToTrack = Infinity;
            let isSafe = true;
            
            // Sample points along track to check distance
            for (let j = 0; j < 50; j++) {
                const checkPoint = this.trackPath.getPointAt(j / 50);
                const distance = candidatePos.distanceTo(checkPoint);
                
                if (distance < minDistanceToTrack) {
                    minDistanceToTrack = distance;
                }
                
                if (distance < safetyMargin) {
                    isSafe = false;
                    break;
                }
            }
            
            if (isSafe) {
                validPosition = candidatePos;
            }
            
            attempts++;
        }
        
        return validPosition;
    }
} 