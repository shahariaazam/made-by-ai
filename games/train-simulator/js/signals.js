/**
 * Signals module - Handles railroad signal system
 */
import Config from './config.js';

export default class Signals {
    constructor(scene, trackPath) {
        this.scene = scene;
        this.trackPath = trackPath;
        this.signalObjects = new THREE.Group();
        this.signalStates = {};
        
        this.setupSignals();
        scene.add(this.signalObjects);
    }
    
    setupSignals() {
        // Create signals at specific points along the track
        const signalPositions = Config.signals.positions;
        
        signalPositions.forEach((trackPos, index) => {
            // Get position and orientation from track
            const signalPoint = this.trackPath.getPointAt(trackPos);
            const tangent = this.trackPath.getTangentAt(trackPos).normalize();
            const binormal = new THREE.Vector3().crossVectors(
                tangent, 
                new THREE.Vector3(0, 1, 0)
            ).normalize();
            
            // Create signal object
            const signalGroup = new THREE.Group();
            
            // Signal post
            const postMaterial = new THREE.MeshStandardMaterial({
                color: 0x444444,
                roughness: 0.7,
                metalness: 0.5
            });
            const postGeometry = new THREE.CylinderGeometry(0.2, 0.2, 5, 8);
            const post = new THREE.Mesh(postGeometry, postMaterial);
            post.position.y = 2.5;
            post.castShadow = true;
            signalGroup.add(post);
            
            // Signal head
            const headGeometry = new THREE.BoxGeometry(1, 2, 0.5);
            const headMaterial = new THREE.MeshStandardMaterial({
                color: 0x111111,
                roughness: 0.8
            });
            const head = new THREE.Mesh(headGeometry, headMaterial);
            head.position.y = 4.5;
            head.castShadow = true;
            signalGroup.add(head);
            
            // Signal lights
            const lightGeometry = new THREE.CircleGeometry(0.3, 16);
            const redLight = this.createSignalLight(0xff0000, lightGeometry, 0, 5.3, 0.26);
            const yellowLight = this.createSignalLight(0xffff00, lightGeometry, 0, 4.5, 0.26);
            const greenLight = this.createSignalLight(0x00ff00, lightGeometry, 0, 3.7, 0.26);
            
            signalGroup.add(redLight, yellowLight, greenLight);
            
            // Position signal beside track
            signalGroup.position.copy(signalPoint);
            signalGroup.position.y = 0.2;
            signalGroup.position.add(binormal.clone().multiplyScalar(-3)); // Adjust distance from track
            
            // Rotate signal to face the track
            signalGroup.lookAt(signalPoint);
            signalGroup.rotateY(Math.PI / 2);
            
            // Store signal data
            this.signalStates[`signal_${index}`] = {
                group: signalGroup,
                lights: { red: redLight, yellow: yellowLight, green: greenLight },
                state: 'green' // Start with green signals
            };
            
            // Add to signal objects group
            this.signalObjects.add(signalGroup);
        });
        
        // Set initial signal states
        this.updateSignals();
    }
    
    createSignalLight(color, geometry, x, y, z) {
        const lightMaterial = new THREE.MeshStandardMaterial({
            color: color,
            emissive: color,
            emissiveIntensity: 0.1, // Dim by default
            roughness: 0.2
        });
        
        const light = new THREE.Mesh(geometry, lightMaterial);
        light.position.set(x, y, z);
        light.rotation.x = Math.PI / 2; // Orient the circle to face forward
        
        return light;
    }
    
    updateSignals() {
        // Update all signal states - activate the current state light
        Object.keys(this.signalStates).forEach(key => {
            const signal = this.signalStates[key];
            
            // Reset all lights to dim
            signal.lights.red.material.emissiveIntensity = 0.1;
            signal.lights.yellow.material.emissiveIntensity = 0.1;
            signal.lights.green.material.emissiveIntensity = 0.1;
            
            // Activate current state light
            if (signal.state === 'red') {
                signal.lights.red.material.emissiveIntensity = 1;
            } else if (signal.state === 'yellow') {
                signal.lights.yellow.material.emissiveIntensity = 1;
            } else {
                signal.lights.green.material.emissiveIntensity = 1;
            }
        });
    }
    
    updateRandomSignal() {
        // Randomly update one signal's state
        const signalKeys = Object.keys(this.signalStates);
        if (signalKeys.length === 0) return;
        
        const randomSignal = signalKeys[Math.floor(Math.random() * signalKeys.length)];
        const states = ['red', 'yellow', 'green'];
        this.signalStates[randomSignal].state = states[Math.floor(Math.random() * states.length)];
        
        this.updateSignals();
    }
    
    getSignalAt(trackPosition) {
        // Find the closest signal to the given track position
        const signalPositions = Config.signals.positions;
        let closestIndex = 0;
        let closestDistance = Math.abs(signalPositions[0] - trackPosition);
        
        for (let i = 1; i < signalPositions.length; i++) {
            const distance = Math.abs(signalPositions[i] - trackPosition);
            if (distance < closestDistance) {
                closestDistance = distance;
                closestIndex = i;
            }
        }
        
        return this.signalStates[`signal_${closestIndex}`];
    }
    
    checkSignalCollisions(trackPosition) {
        // Check if train is approaching a red signal
        const signalPositions = Config.signals.positions;
        let result = { collision: false, signalState: null };
        
        signalPositions.forEach((pos, index) => {
            // Calculate distance to next signal, accounting for loop
            let signalDistance;
            if (pos > trackPosition) {
                signalDistance = pos - trackPosition;
            } else {
                signalDistance = 1 - trackPosition + pos;
            }
            
            // If approaching a signal (within a threshold)
            if (signalDistance < 0.05) {
                const signalKey = `signal_${index}`;
                const signalState = this.signalStates[signalKey].state;
                
                result = {
                    collision: signalState === 'red',
                    signalState: signalState
                };
            }
        });
        
        return result;
    }
} 