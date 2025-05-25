/**
 * Weather module - Handles weather effects and day/night cycle
 */
import Config from './config.js';

export default class Weather {
    constructor(scene) {
        this.scene = scene;
        this.weatherObjects = new THREE.Group();
        this.currentWeather = Config.initial.weather;
        this.gameTime = Config.initial.time;
        this.timeRate = Config.weather.timeRate;
        this.weatherStates = Config.weather.states;
        
        // Add weather objects container to scene
        scene.add(this.weatherObjects);
        
        // Start the day/night cycle
        this.updateDayNightCycle();
    }
    
    updateDayNightCycle() {
        // Update game time
        this.gameTime += this.timeRate;
        if (this.gameTime >= 24 * 60) this.gameTime -= 24 * 60;
        
        // Format time for display
        const hours = Math.floor(this.gameTime / 60);
        const minutes = Math.floor(this.gameTime % 60);
        const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        
        // Calculate sun position and light intensity based on time
        const dayNightFactor = Math.sin((this.gameTime / (24 * 60)) * Math.PI * 2 - Math.PI / 2) * 0.5 + 0.5;
        
        // Update lighting if references exist
        if (this.scene.userData.ambientLight) {
            this.scene.userData.ambientLight.intensity = 0.2 + dayNightFactor * 0.6;
        }
        if (this.scene.userData.directionalLight) {
            this.scene.userData.directionalLight.intensity = dayNightFactor * 0.9;
            
            // Move directional light to simulate sun position
            const sunAngle = (this.gameTime / (24 * 60)) * Math.PI * 2;
            const radius = 500;
            this.scene.userData.directionalLight.position.x = Math.sin(sunAngle) * radius;
            this.scene.userData.directionalLight.position.y = Math.sin(sunAngle - Math.PI/2) * radius + 120;
            this.scene.userData.directionalLight.position.z = Math.cos(sunAngle) * radius;
        }
        
        // Update sky color
        const skyHue = dayNightFactor > 0.3 ? 0.6 : 0.7;
        const skySaturation = dayNightFactor > 0.3 ? 0.7 : 0.2;
        const skyLightness = 0.2 + dayNightFactor * 0.6;
        
        // Convert HSL to RGB for sky color
        const skyColor = new THREE.Color().setHSL(skyHue, skySaturation, skyLightness);
        this.scene.background = skyColor;
        this.scene.fog.color = skyColor;
        
        // Return formatted time for display
        return formattedTime;
    }
    
    cycleWeather() {
        // Find current weather index
        const currentIndex = this.weatherStates.indexOf(this.currentWeather);
        // Move to next weather state
        const nextIndex = (currentIndex + 1) % this.weatherStates.length;
        this.currentWeather = this.weatherStates[nextIndex];
        
        // Apply weather effects
        this.applyWeatherEffects(this.currentWeather);
        
        // Return updated weather for display
        return this.currentWeather.charAt(0).toUpperCase() + this.currentWeather.slice(1);
    }
    
    applyWeatherEffects(weatherType) {
        // Clear previous weather effects
        while (this.weatherObjects.children.length > 0) {
            const object = this.weatherObjects.children[0];
            this.weatherObjects.remove(object);
        }
        
        // Apply new weather effects
        switch (weatherType) {
            case 'clear':
                // Clear weather, no special effects
                this.scene.fog.near = 150;
                this.scene.fog.far = 500;
                break;
                
            case 'cloudy':
                // Add some fog for cloudy weather
                this.scene.fog.near = 100;
                this.scene.fog.far = 300;
                break;
                
            case 'rainy':
                // Create rain effect
                this.createRainEffect();
                this.scene.fog.near = 70;
                this.scene.fog.far = 200;
                break;
                
            case 'foggy':
                // Heavy fog
                this.scene.fog.near = 20;
                this.scene.fog.far = 100;
                break;
                
            case 'snowy':
                // Create snow effect
                this.createSnowEffect();
                this.scene.fog.near = 80;
                this.scene.fog.far = 250;
                break;
        }
        
        return weatherType;
    }
    
    createRainEffect() {
        const rainGeometry = new THREE.BufferGeometry();
        const rainVertices = [];
        
        // Create rain drops
        for (let i = 0; i < 5000; i++) {
            const x = (Math.random() - 0.5) * 500;
            const y = (Math.random() - 0.5) * 100 + 50;
            const z = (Math.random() - 0.5) * 500;
            
            rainVertices.push(x, y, z);
        }
        
        rainGeometry.setAttribute('position', new THREE.Float32BufferAttribute(rainVertices, 3));
        
        const rainMaterial = new THREE.PointsMaterial({
            color: 0xaaaaaa,
            size: 0.5,
            transparent: true,
            opacity: 0.6
        });
        
        const rain = new THREE.Points(rainGeometry, rainMaterial);
        rain.userData.velocity = [];
        
        // Set individual raindrop velocities
        for (let i = 0; i < rainVertices.length / 3; i++) {
            rain.userData.velocity.push(-Math.random() * 2 - 1); // y velocity (falling)
        }
        
        this.weatherObjects.add(rain);
        
        return rain;
    }
    
    createSnowEffect() {
        const snowGeometry = new THREE.BufferGeometry();
        const snowVertices = [];
        
        // Create snow flakes
        for (let i = 0; i < 3000; i++) {
            const x = (Math.random() - 0.5) * 300;
            const y = (Math.random() - 0.5) * 100 + 50;
            const z = (Math.random() - 0.5) * 300;
            
            snowVertices.push(x, y, z);
        }
        
        snowGeometry.setAttribute('position', new THREE.Float32BufferAttribute(snowVertices, 3));
        
        const snowMaterial = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 0.7,
            transparent: true,
            opacity: 0.8
        });
        
        const snow = new THREE.Points(snowGeometry, snowMaterial);
        snow.userData.velocity = [];
        snow.userData.drift = [];
        
        // Set individual snowflake velocities and drift patterns
        for (let i = 0; i < snowVertices.length / 3; i++) {
            snow.userData.velocity.push(-Math.random() * 0.5 - 0.1); // y velocity (falling)
            snow.userData.drift.push((Math.random() - 0.5) * 0.1); // x drift (side to side)
        }
        
        this.weatherObjects.add(snow);
        
        return snow;
    }
    
    updateWeatherAnimation() {
        // Update weather animations based on current weather
        if (this.currentWeather === 'rainy') {
            this.updateRain();
        } else if (this.currentWeather === 'snowy') {
            this.updateSnow();
        }
    }
    
    updateRain() {
        if (this.weatherObjects.children.length === 0) return;
        
        const rain = this.weatherObjects.children[0];
        if (!rain || !rain.userData.velocity) return;
        
        const positions = rain.geometry.attributes.position.array;
        
        for (let i = 0; i < positions.length; i += 3) {
            // Update y position of raindrop
            positions[i + 1] += rain.userData.velocity[i/3];
            
            // Reset position if raindrop goes too low
            if (positions[i + 1] < -20) {
                positions[i + 1] = 50 + Math.random() * 20;
            }
        }
        
        rain.geometry.attributes.position.needsUpdate = true;
    }
    
    updateSnow() {
        if (this.weatherObjects.children.length === 0) return;
        
        const snow = this.weatherObjects.children[0];
        if (!snow || !snow.userData.velocity) return;
        
        const positions = snow.geometry.attributes.position.array;
        
        for (let i = 0; i < positions.length; i += 3) {
            // Update positions
            positions[i] += snow.userData.drift[i/3]; // x drift
            positions[i + 1] += snow.userData.velocity[i/3]; // y fall
            
            // Reset position if snowflake goes too low
            if (positions[i + 1] < -20) {
                positions[i] = (Math.random() - 0.5) * 300;
                positions[i + 1] = 50 + Math.random() * 20;
                positions[i + 2] = (Math.random() - 0.5) * 300;
            }
        }
        
        snow.geometry.attributes.position.needsUpdate = true;
    }
    
    getCurrentWeather() {
        return this.currentWeather;
    }
    
    getCurrentTime() {
        const hours = Math.floor(this.gameTime / 60);
        const minutes = Math.floor(this.gameTime % 60);
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }
} 