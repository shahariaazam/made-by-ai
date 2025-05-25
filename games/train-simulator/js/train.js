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
    
    createLocomotive() {
        const locomotive = new THREE.Group();
        
        // Main body
        const bodyMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xA93226,
            roughness: 0.4, 
            metalness: 0.6
        });
        
        const locoBodyGeo = new THREE.BoxGeometry(4, 3.8, 12);
        const locomotiveBody = new THREE.Mesh(locoBodyGeo, bodyMaterial);
        locomotiveBody.position.y = 2;
        locomotiveBody.castShadow = true;
        locomotive.add(locomotiveBody);
        
        // Locomotive cab
        const cabMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xA93226, 
            roughness: 0.4, 
            metalness: 0.6 
        });
        const locoCabGeo = new THREE.BoxGeometry(3.8, 3, 4);
        const locoCab = new THREE.Mesh(locoCabGeo, cabMaterial);
        locoCab.position.set(0, 0, -5.5);
        locoCab.castShadow = true;
        locomotiveBody.add(locoCab);
        
        // Add windows
        this.addWindows(locoCab);
        
        // Add smokestack
        this.addSmokestack(locomotiveBody);
        
        // Add headlight
        this.addHeadlight(locomotiveBody);
        
        // Add wheels with connecting rods
        this.addDetailedWheels(locomotiveBody, 3.8, 12, 1.2);
        this.addConnectingRods(locomotiveBody);
        
        // Add coupling
        this.addCoupling(locomotiveBody, 0, 0, 6);
        
        return locomotive;
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
        
        // Add wheels
        this.addDetailedWheels(carriageBody, 3.2, 16, 1.0);
        
        // Add couplings
        this.addCoupling(carriageBody, 0, 0, 8);
        this.addCoupling(carriageBody, 0, 0, -8);
        
        return carriage;
    }
    
    // Methods for adding details to the train
    addWindows(locoCab) {
        // Add windows to the train cab
        const windowMaterial = new THREE.MeshStandardMaterial({
            color: 0x87CEFA,
            roughness: 0.2,
            metalness: 0.8,
            transparent: true,
            opacity: 0.7
        });
        
        // Front window
        const frontWindowGeo = new THREE.BoxGeometry(3, 1.5, 0.1);
        const frontWindow = new THREE.Mesh(frontWindowGeo, windowMaterial);
        frontWindow.position.set(0, 1, -2);
        locoCab.add(frontWindow);
        
        // Side windows
        const sideWindowGeo = new THREE.BoxGeometry(0.1, 1.5, 2);
        const leftWindow = new THREE.Mesh(sideWindowGeo, windowMaterial);
        leftWindow.position.set(-1.95, 1, 0);
        locoCab.add(leftWindow);
        
        const rightWindow = new THREE.Mesh(sideWindowGeo, windowMaterial);
        rightWindow.position.set(1.95, 1, 0);
        locoCab.add(rightWindow);
    }
    
    addSmokestack(locomotiveBody) {
        // Add smokestack to the locomotive
        const smokestackGeo = new THREE.CylinderGeometry(0.5, 0.7, 2, 12);
        const smokestackMat = new THREE.MeshStandardMaterial({
            color: 0x333333,
            roughness: 0.8
        });
        const smokestack = new THREE.Mesh(smokestackGeo, smokestackMat);
        smokestack.position.set(0, 3.5, 4);
        smokestack.castShadow = true;
        locomotiveBody.add(smokestack);
    }
    
    addHeadlight(locomotiveBody) {
        // Add headlight to the locomotive
        const headlightGeo = new THREE.CylinderGeometry(0.4, 0.4, 0.3, 16);
        const headlightMat = new THREE.MeshStandardMaterial({
            color: 0xFFFFFF,
            emissive: 0xFFFF00,
            emissiveIntensity: 0.5
        });
        const headlight = new THREE.Mesh(headlightGeo, headlightMat);
        headlight.rotation.x = Math.PI/2;
        headlight.position.set(0, 1, 6.25);
        locomotiveBody.add(headlight);
    }
    
    addDetailedWheels(vehiclePartMesh, vehicleHeight, vehicleLength, wheelRadius) {
        const wheelMat = new THREE.MeshStandardMaterial({ 
            color: 0x333333, 
            roughness: 0.6, 
            metalness: 0.5 
        });
        
        const wheelGeo = new THREE.CylinderGeometry(wheelRadius, wheelRadius, 0.6, 16);
        const wheelRimGeo = new THREE.TorusGeometry(wheelRadius * 0.8, wheelRadius * 0.1, 8, 24);
        
        const axleRadius = 0.2;
        const axleMat = new THREE.MeshStandardMaterial({
            color: 0x777777, 
            roughness: 0.5, 
            metalness: 0.6
        });
        const axleGeo = new THREE.CylinderGeometry(
            axleRadius, 
            axleRadius, 
            vehiclePartMesh.geometry.parameters.width + 0.8, 
            8
        );
        
        const wheelYOffset = -(vehicleHeight / 2) + wheelRadius;
        const numWheelPairs = 3; // Increase wheel pairs for realism
        
        for (let i = 0; i < numWheelPairs; i++) {
            // Calculate z position for wheels spread along vehicle length
            const zPos = (vehicleLength / (numWheelPairs + 1)) * (i + 1) - vehicleLength/2;
            
            // Left wheel with rim detail
            const wheelGroupL = new THREE.Group();
            const wheelL = new THREE.Mesh(wheelGeo, wheelMat);
            wheelL.castShadow = true;
            wheelGroupL.add(wheelL);
            
            // Add rim
            const wheelRimL = new THREE.Mesh(wheelRimGeo, wheelMat);
            wheelRimL.rotation.x = Math.PI/2;
            wheelL.add(wheelRimL);
            
            // Position wheel group
            wheelGroupL.rotation.x = Math.PI/2;
            wheelGroupL.position.set(
                -vehiclePartMesh.geometry.parameters.width/2 - 0.3, 
                wheelYOffset, 
                zPos
            );
            vehiclePartMesh.add(wheelGroupL);
            
            // Right wheel with rim detail
            const wheelGroupR = new THREE.Group();
            const wheelR = new THREE.Mesh(wheelGeo, wheelMat);
            wheelR.castShadow = true;
            wheelGroupR.add(wheelR);
            
            // Add rim
            const wheelRimR = new THREE.Mesh(wheelRimGeo, wheelMat);
            wheelRimR.rotation.x = Math.PI/2;
            wheelR.add(wheelRimR);
            
            // Position wheel group
            wheelGroupR.rotation.x = Math.PI/2;
            wheelGroupR.position.set(
                vehiclePartMesh.geometry.parameters.width/2 + 0.3, 
                wheelYOffset, 
                zPos
            );
            vehiclePartMesh.add(wheelGroupR);
            
            // Axle
            const axle = new THREE.Mesh(axleGeo, axleMat);
            axle.rotation.x = Math.PI/2;
            axle.position.set(0, wheelYOffset, zPos);
            vehiclePartMesh.add(axle);
            
            // Store wheels for rotation animation
            if (!vehiclePartMesh.userData.wheels) vehiclePartMesh.userData.wheels = [];
            vehiclePartMesh.userData.wheels.push(wheelGroupL, wheelGroupR);
        }
    }
    
    addConnectingRods(locomotiveBody) {
        // Create connecting rods between wheels for steam locomotive effect
        const rodMaterial = new THREE.MeshStandardMaterial({
            color: 0x777777,
            roughness: 0.4,
            metalness: 0.8
        });
        
        // Main driving rod
        const mainRodGeo = new THREE.BoxGeometry(0.2, 0.2, 6);
        const mainRod = new THREE.Mesh(mainRodGeo, rodMaterial);
        mainRod.position.set(-2.3, -1.5, 0);
        locomotiveBody.add(mainRod);
        
        // Piston rod
        const pistonRodGeo = new THREE.CylinderGeometry(0.15, 0.15, 2, 8);
        const pistonRod = new THREE.Mesh(pistonRodGeo, rodMaterial);
        pistonRod.rotation.z = Math.PI/2;
        pistonRod.position.set(-2.3, -1.5, 4);
        locomotiveBody.add(pistonRod);
        
        // Create same rods for other side
        const mainRod2 = mainRod.clone();
        mainRod2.position.x = 2.3;
        locomotiveBody.add(mainRod2);
        
        const pistonRod2 = pistonRod.clone();
        pistonRod2.position.x = 2.3;
        locomotiveBody.add(pistonRod2);
        
        // Store rods for animation
        locomotiveBody.userData.connectingRods = [mainRod, mainRod2, pistonRod, pistonRod2];
    }
    
    addCoupling(vehiclePartMesh, x, y, z) {
        // Create a realistic coupling system
        const couplingMat = new THREE.MeshStandardMaterial({
            color: 0x555555,
            roughness: 0.6,
            metalness: 0.5
        });
        
        const couplingBase = new THREE.BoxGeometry(1.5, 0.5, 0.5);
        const couplingRod = new THREE.CylinderGeometry(0.2, 0.2, 1.5, 8);
        const couplingHook = new THREE.TorusGeometry(0.3, 0.1, 8, 16, Math.PI);
        
        const couplingGroup = new THREE.Group();
        
        // Base mount
        const base = new THREE.Mesh(couplingBase, couplingMat);
        couplingGroup.add(base);
        
        // Rod
        const rod = new THREE.Mesh(couplingRod, couplingMat);
        rod.rotation.x = Math.PI/2;
        rod.position.z = 0.75;
        couplingGroup.add(rod);
        
        // Hook
        const hook = new THREE.Mesh(couplingHook, couplingMat);
        hook.rotation.y = Math.PI/2;
        hook.position.z = 1.5;
        couplingGroup.add(hook);
        
        // Position the coupling group
        couplingGroup.position.set(x, y, z);
        vehiclePartMesh.add(couplingGroup);
        
        return couplingGroup;
    }
    
    // Train control methods
    updatePhysics() {
        const { maxSpeed, acceleration, deceleration, brakingForce } = Config.train;
        
        const maxThrottle = 100;
        const maxBrake = 100;
        
        // Update throttle based on input
        if (this.isAccelerating && this.throttleValue < maxThrottle) {
            this.throttleValue += 1;
        } else if (!this.isAccelerating && this.throttleValue > 0) {
            this.throttleValue -= 1;
        }
        
        // Update brake based on input
        if (this.isBraking && this.brakeValue < maxBrake) {
            this.brakeValue += 2;
        } else if (!this.isBraking && this.brakeValue > 0) {
            this.brakeValue -= 1;
        }
        
        // Calculate forces
        const throttleForce = (this.throttleValue / maxThrottle) * acceleration;
        const brakeForce = (this.brakeValue / maxBrake) * brakingForce;
        const rollingResistance = this.speed * 0.0001;
        
        // Apply momentum physics
        const netForce = throttleForce - brakeForce - rollingResistance;
        this.speed = Math.max(0, Math.min(this.speed + netForce, maxSpeed));
        
        return {
            speed: this.speed,
            throttle: this.throttleValue,
            brake: this.brakeValue
        };
    }
    
    updatePosition(trackPath, trackPosition) {
        const currentPoint = trackPath.getPointAt(trackPosition);
        const tangent = trackPath.getTangentAt(trackPosition).normalize();

        this.trainGroup.position.copy(currentPoint);
        this.trainGroup.position.y = 0.8; // Account for ballast height
        
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
    
    setAccelerating(value) {
        this.isAccelerating = value;
    }
    
    setBraking(value) {
        this.isBraking = value;
    }
    
    getPosition() {
        return this.trainGroup.position;
    }
    
    getQuaternion() {
        return this.trainGroup.quaternion;
    }
} 