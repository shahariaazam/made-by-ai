/**
 * Game Controller - Main controller that integrates all game modules
 */
import Config from './config.js';
import Track from './track.js';
import Train from './train.js';
import Scenery from './scenery.js';
import Weather from './weather.js';
import Signals from './signals.js';
import Audio from './audio.js';
import Terrain from './terrain.js';

export default class Game {
    constructor(container) {
        this.container = container;
        this.trackPosition = 0;
        this.cabViewActive = false;
        
        // Initialize scene
        this.initScene();
        
        // Initialize game modules
        this.terrain = new Terrain(this.scene);
        this.track = new Track(this.scene);
        this.train = new Train(this.scene);
        this.scenery = new Scenery(this.scene, this.track.getPath());
        this.signals = new Signals(this.scene, this.track.getPath());
        this.weather = new Weather(this.scene);
        this.audio = new Audio();
        
        // Set up cameras
        this.setupCameras();
        
        // Initialize UI elements
        this.setupUI();
        
        // Start game loop
        this.animate();
        
        // Set up event handling
        this.setupEventListeners();
        
        // Start day/night cycle update
        this.updateTimeDisplay();
    }
    
    initScene() {
        // Create Three.js scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87CEEB);
        this.scene.fog = new THREE.Fog(0x87CEEB, 150, 500);
        
        // Initialize renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.container.appendChild(this.renderer.domElement);
        
        // Add lighting
        this.setupLighting();
    }
    
    setupLighting() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(
            0xffffff, 
            Config.initial.time > 6 * 60 && Config.initial.time < 18 * 60 ? 0.7 : 0.2
        );
        this.scene.add(ambientLight);
        
        // Directional light (sun/moon)
        const directionalLight = new THREE.DirectionalLight(
            0xffffff, 
            Config.initial.time > 6 * 60 && Config.initial.time < 18 * 60 ? 0.9 : 0.1
        );
        directionalLight.position.set(70, 120, 80);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 500;
        directionalLight.shadow.camera.left = -150;
        directionalLight.shadow.camera.right = 150;
        directionalLight.shadow.camera.top = 150;
        directionalLight.shadow.camera.bottom = -150;
        this.scene.add(directionalLight);
        
        // Store light references for day/night cycle
        this.scene.userData.ambientLight = ambientLight;
        this.scene.userData.directionalLight = directionalLight;
    }
    
    setupCameras() {
        const aspect = this.container.clientWidth / this.container.clientHeight;
        
        // Third-person chase camera
        this.camera3rdPerson = new THREE.PerspectiveCamera(
            Config.camera.thirdPerson.fov, 
            aspect,
            Config.camera.thirdPerson.near, 
            Config.camera.thirdPerson.far
        );
        this.camera3rdPerson.position.set(
            Config.camera.thirdPerson.position.x,
            Config.camera.thirdPerson.position.y,
            Config.camera.thirdPerson.position.z
        );
        this.camera3rdPerson.lookAt(
            Config.camera.thirdPerson.lookAt.x,
            Config.camera.thirdPerson.lookAt.y,
            Config.camera.thirdPerson.lookAt.z
        );
        
        // First-person cab view camera
        this.cameraCabView = new THREE.PerspectiveCamera(
            Config.camera.cabView.fov,
            aspect,
            Config.camera.cabView.near,
            Config.camera.cabView.far
        );
        this.cameraCabView.position.set(
            Config.camera.cabView.position.x,
            Config.camera.cabView.position.y,
            Config.camera.cabView.position.z
        );
        
        // Set active camera
        this.camera = this.camera3rdPerson;
    }
    
    setupUI() {
        // Get UI elements
        this.speedDisplay = document.getElementById('speedDisplay');
        this.timeDisplay = document.getElementById('timeDisplay');
        this.weatherDisplay = document.getElementById('weatherDisplay');
        this.hornMessageElement = document.getElementById('hornMessage');
        this.throttleDisplay = document.getElementById('throttleDisplay');
        this.brakeDisplay = document.getElementById('brakeDisplay');
        this.directionDisplay = document.getElementById('directionDisplay');
        
        // Initialize UI values
        this.timeDisplay.textContent = this.weather.getCurrentTime();
        this.weatherDisplay.textContent = this.weather.getCurrentWeather().charAt(0).toUpperCase() 
            + this.weather.getCurrentWeather().slice(1);
    }
    
    toggleCabView() {
        this.cabViewActive = !this.cabViewActive;
        
        if (this.cabViewActive) {
            // Switch to cab view
            this.camera = this.cameraCabView;
            document.getElementById('cabViewBtn').textContent = 'Chase View (V)';
        } else {
            // Switch to chase view
            this.camera = this.camera3rdPerson;
            document.getElementById('cabViewBtn').textContent = 'Cab View (V)';
        }
        
        // Update camera aspect ratio and projection
        this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
        this.camera.updateProjectionMatrix();
    }
    
    cycleWeather() {
        const weatherName = this.weather.cycleWeather();
        this.weatherDisplay.textContent = weatherName;
        this.audio.updateWeatherSounds(this.weather.getCurrentWeather());
    }
    
    updateTrain() {
        // Update train physics
        const trainData = this.train.updatePhysics();
        
        // Update UI
        this.speedDisplay.textContent = Math.floor(trainData.speed * 150);
        this.throttleDisplay.textContent = Math.round(trainData.throttle);
        this.brakeDisplay.textContent = Math.round(trainData.brake);
        
        // Update sounds
        this.audio.updateEngineSounds(trainData.speed);
        
        // Show advanced controls once the train is moving
        if (trainData.speed > 0.01) {
            document.getElementById('advanced-controls').style.display = 'block';
        }
        
        // Move train along track
        let actualSpeedFactor = trainData.speed * 0.0015;
        
        if (trainData.speed > 0.0001) {
            this.trackPosition += actualSpeedFactor;
            if (this.trackPosition >= 1) this.trackPosition -= 1;
            if (this.trackPosition < 0) this.trackPosition += 1;
        }
        
        // Update train position on track
        this.train.updatePosition(this.track.getPath(), this.trackPosition);
        
        // Check for signal collisions
        const signalCheck = this.signals.checkSignalCollisions(this.trackPosition);
        if (signalCheck.collision && trainData.speed > 0.1) {
            // Apply emergency braking if running a red signal at speed
            this.train.setBraking(true);
        }
    }
    
    updateCameraPosition() {
        if (this.cabViewActive) {
            // Update cab view camera position and orientation
            const trainPosition = this.train.getPosition();
            const trainQuaternion = this.train.getQuaternion();
            
            // Position cab camera slightly above and forward in the locomotive
            const cabOffset = new THREE.Vector3(0, 2.5, 2);
            cabOffset.applyQuaternion(trainQuaternion);
            
            this.cameraCabView.position.copy(trainPosition).add(cabOffset);
            
            // Look forward along the track
            const lookDirection = new THREE.Vector3(0, 0, 10);
            lookDirection.applyQuaternion(trainQuaternion);
            const lookTarget = this.cameraCabView.position.clone().add(lookDirection);
            
            this.cameraCabView.lookAt(lookTarget);
        } else {
            // Third-person chase camera
            const trainPosition = this.train.getPosition();
            const trainQuaternion = this.train.getQuaternion();
            
            // Calculate ideal camera position and target
            const idealOffset = new THREE.Vector3(0, 18, -30);
            const idealLookAt = new THREE.Vector3(0, 3, 40);
            
            // Apply train's rotation to these offsets
            const offset = idealOffset.clone().applyQuaternion(trainQuaternion);
            const cameraTargetPosition = trainPosition.clone().add(offset);
            
            const lookAtTargetPosition = trainPosition.clone()
                .add(idealLookAt.clone().applyQuaternion(trainQuaternion));
            
            // Smoothly move the camera to the target position
            this.camera3rdPerson.position.lerp(cameraTargetPosition, 0.07);
            this.camera3rdPerson.lookAt(lookAtTargetPosition);
        }
    }
    
    animate() {
        requestAnimationFrame(this.animate.bind(this));
        
        // Update train position and physics
        this.updateTrain();
        
        // Update camera position
        this.updateCameraPosition();
        
        // Update weather animations
        this.weather.updateWeatherAnimation();
        
        // Randomly change signals occasionally
        if (Math.random() < Config.signals.changeFrequency) {
            this.signals.updateRandomSignal();
        }
        
        // Render scene with current camera
        this.renderer.render(this.scene, this.camera);
    }
    
    updateTimeDisplay() {
        // Update time display every second
        const formattedTime = this.weather.updateDayNightCycle();
        this.timeDisplay.textContent = formattedTime;
        
        setTimeout(this.updateTimeDisplay.bind(this), 1000);
    }
    
    setupEventListeners() {
        // Button event listeners
        document.getElementById('speedUpBtn').addEventListener('mousedown', () => this.train.setAccelerating(true));
        document.getElementById('speedUpBtn').addEventListener('mouseup', () => this.train.setAccelerating(false));
        document.getElementById('speedUpBtn').addEventListener('mouseleave', () => this.train.setAccelerating(false));
        
        document.getElementById('slowDownBtn').addEventListener('mousedown', () => this.train.setBraking(true));
        document.getElementById('slowDownBtn').addEventListener('mouseup', () => this.train.setBraking(false));
        document.getElementById('slowDownBtn').addEventListener('mouseleave', () => this.train.setBraking(false));
        
        document.getElementById('hornBtn').addEventListener('click', () => {
            this.hornMessageElement.style.opacity = '1';
            setTimeout(() => { this.hornMessageElement.style.opacity = '0'; }, 1000);
            this.audio.playHorn();
        });
        
        document.getElementById('cabViewBtn').addEventListener('click', () => this.toggleCabView());
        document.getElementById('weatherBtn').addEventListener('click', () => this.cycleWeather());
        
        // Keyboard controls
        window.addEventListener('keydown', (e) => {
            switch (e.key) {
                case 'ArrowUp':
                    this.train.setAccelerating(true);
                    break;
                case 'ArrowDown':
                    this.train.setBraking(true);
                    break;
                case ' ':
                case 'Spacebar':
                    e.preventDefault();
                    if (this.hornMessageElement.style.opacity !== '1') {
                        this.hornMessageElement.style.opacity = '1';
                        setTimeout(() => { this.hornMessageElement.style.opacity = '0'; }, 1000);
                        this.audio.playHorn();
                    }
                    break;
                case 'v':
                case 'V':
                    this.toggleCabView();
                    break;
                case 'w':
                case 'W':
                    this.cycleWeather();
                    break;
            }
        });
        
        window.addEventListener('keyup', (e) => {
            switch (e.key) {
                case 'ArrowUp':
                    this.train.setAccelerating(false);
                    break;
                case 'ArrowDown':
                    this.train.setBraking(false);
                    break;
            }
        });
        
        // Touch controls for mobile devices
        document.getElementById('speedUpBtn').addEventListener('touchstart', (e) => { 
            e.preventDefault();
            this.train.setAccelerating(true); 
        });
        document.getElementById('speedUpBtn').addEventListener('touchend', (e) => { 
            e.preventDefault();
            this.train.setAccelerating(false); 
        });
        
        document.getElementById('slowDownBtn').addEventListener('touchstart', (e) => { 
            e.preventDefault();
            this.train.setBraking(true); 
        });
        document.getElementById('slowDownBtn').addEventListener('touchend', (e) => { 
            e.preventDefault();
            this.train.setBraking(false); 
        });
        
        document.getElementById('hornBtn').addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.hornMessageElement.style.opacity = '1';
            setTimeout(() => { this.hornMessageElement.style.opacity = '0'; }, 1000);
            this.audio.playHorn();
        });
        
        document.getElementById('cabViewBtn').addEventListener('touchstart', (e) => { 
            e.preventDefault();
            this.toggleCabView(); 
        });
        
        document.getElementById('weatherBtn').addEventListener('touchstart', (e) => { 
            e.preventDefault();
            this.cycleWeather(); 
        });
        
        // Handle window resize
        window.addEventListener('resize', () => {
            this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        });
    }
} 