/**
 * Train module - Handles train creation and behavior
 */
import Config from './config.js';

export default class Train {
    constructor(scene) {
        this.scene = scene;
        this.trainGroup = new THREE.Group();
        this.speed = 0;
        this.throttleValue = 0;
        this.brakeValue = 0;
        this.isAccelerating = false;
        this.isBraking = false;
        
        this.create();
        scene.add(this.trainGroup);
    }
    
    create() {
        // Create locomotive and cars
        const locomotive = this.createLocomotive();
        this.trainGroup.add(locomotive);
        
        // Passenger cars
        const carriage1 = this.createPassengerCar();
        carriage1.position.set(0, 0, -18);
        this.trainGroup.add(carriage1);
        
        const carriage2 = this.createPassengerCar();
        carriage2.position.set(0, 0, -36);
        this.trainGroup.add(carriage2);
    }
    
    updatePosition(trackPath, trackPosition) {
        const currentPoint = trackPath.getPointAt(trackPosition);
        const tangent = trackPath.getTangentAt(trackPosition).normalize();

        this.trainGroup.position.copy(currentPoint);
        this.trainGroup.position.y = 0.4; // Lower position to sit properly on tracks (was 0.8)
        
        const lookAtPoint = currentPoint.clone().add(tangent);
        this.trainGroup.lookAt(lookAtPoint);
        
        // Update wheel rotation based on speed
        this.trainGroup.traverse((object) => {
            if (object.isMesh && object.parent && object.parent.userData.wheels && 
                object.parent.userData.wheels.includes(object)) {
                object.rotation.x -= this.speed * 20 * Config.train.wheelRotationSpeed;
            }
        });
    }

    createPassengerCar() {
        // Implementation details...
        const carriage = new THREE.Group();
        
        // Basic passenger car implementation
        const carriageMat = new THREE.MeshStandardMaterial({ 
            color: 0x2471A3, 
            roughness: 0.5, 
            metalness: 0.2 
        });
        
        const carriageBodyGeo = new THREE.BoxGeometry(3.8, 3.2, 16);
        const carriageBody = new THREE.Mesh(carriageBodyGeo, carriageMat);
        carriageBody.position.y = 2;
        carriageBody.castShadow = true;
        carriage.add(carriageBody);
        
        // Add windows to passenger car
        const windowMaterial = new THREE.MeshStandardMaterial({
            color: 0x87CEFA,
            roughness: 0.2,
            metalness: 0.8,
            transparent: true,
            opacity: 0.7
        });
        
        // Add windows along the sides
        for (let i = -6; i <= 6; i += 3) {
            // Left side windows
            const leftWindow = new THREE.Mesh(
                new THREE.PlaneGeometry(2, 1.2),
                windowMaterial
            );
            leftWindow.position.set(-1.91, 2.2, i);
            leftWindow.rotation.y = Math.PI / 2;
            carriageBody.add(leftWindow);
            
            // Right side windows
            const rightWindow = new THREE.Mesh(
                new THREE.PlaneGeometry(2, 1.2),
                windowMaterial
            );
            rightWindow.position.set(1.91, 2.2, i);
            rightWindow.rotation.y = -Math.PI / 2;
            carriageBody.add(rightWindow);
        }
        
        // Add wheels
        this.addDetailedWheels(carriageBody, 3.2, 16, 1.0);
        
        // Add couplings
        this.addCoupling(carriageBody, 0, 0, 8);
        this.addCoupling(carriageBody, 0, 0, -8);
        
        return carriage;
    } 
} 