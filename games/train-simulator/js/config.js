/**
 * Train Simulator Configuration
 * Contains game settings and constants
 */

const Config = {
    // Train physics
    train: {
        maxSpeed: 0.8,
        acceleration: 0.004,
        deceleration: 0.0015,
        brakingForce: 0.008,
        wheelRotationSpeed: 0.1
    },
    
    // Weather settings
    weather: {
        states: ['clear', 'cloudy', 'rainy', 'foggy', 'snowy'],
        timeRate: 0.5 // Time passes at 0.5 minutes per second
    },
    
    // Camera settings
    camera: {
        thirdPerson: {
            fov: 60,
            near: 0.1,
            far: 1000,
            position: { x: 0, y: 30, z: -40 },
            lookAt: { x: 0, y: 0, z: 0 }
        },
        cabView: {
            fov: 70,
            near: 0.1,
            far: 1000,
            position: { x: 0, y: 3, z: 0 }
        }
    },
    
    // Sound effects URLs
    sounds: {
        engine: 'https://assets.codepen.io/21542/steam-train-whistle.mp3',
        horn: 'https://assets.codepen.io/21542/steam-train-whistle.mp3',
        rail: 'https://assets.codepen.io/21542/train-track-clack.mp3',
        rain: 'https://assets.codepen.io/21542/rain-thunder.mp3'
    },
    
    // Track path points (Vector3 coordinates)
    trackPath: [
        { x: -200, y: 0.2, z: 0 },
        { x: 0, y: 0.2, z: 0 },
        { x: 100, y: 0.2, z: 100 },
        { x: 200, y: 0.2, z: 200 },
        { x: 300, y: 0.2, z: 200 },
        { x: 350, y: 0.2, z: 150 },
        { x: 350, y: 0.2, z: 50 },
        { x: 300, y: 0.2, z: -50 },
        { x: 200, y: 0.2, z: -150 },
        { x: 50, y: 0.2, z: -150 },
        { x: -100, y: 0.2, z: -100 },
        { x: -200, y: 0.2, z: 0 }
    ],
    
    // Signal system settings
    signals: {
        positions: [0.25, 0.5, 0.75], // Track positions (0-1)
        changeFrequency: 0.001 // Probability of random signal change per frame
    },
    
    // Track appearance
    track: {
        railWidth: 0.15,
        railHeight: 0.25,
        railOffset: 1.2,
        sleeperWidth: 3.2,
        sleeperHeight: 0.20,
        sleeperDepth: 0.5,
        ballastWidth: 5,
        ballastHeight: 0.4
    },
    
    // Initial settings
    initial: {
        time: 12 * 60, // Start at 12:00 (minutes since midnight)
        weather: 'clear'
    },
    
    // Scenery settings
    scenery: {
        trees: {
            count: 200,
            trackSafetyMargin: 15
        },
        houses: {
            count: 15,
            trackSafetyMargin: 25
        }
    }
};

export default Config; 