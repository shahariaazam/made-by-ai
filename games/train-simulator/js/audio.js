/**
 * Audio module - Handles sound effects for the train simulator
 */
import Config from './config.js';

export default class Audio {
    constructor() {
        this.sounds = {};
        this.loaded = false;
        this.init();
    }
    
    init() {
        // Initialize all sound effects
        this.sounds.engine = new Howl({
            src: [Config.sounds.engine],
            loop: true,
            volume: 0,
            rate: 1.0,
            onload: () => {
                this.checkLoaded();
            }
        });
        
        this.sounds.horn = new Howl({
            src: [Config.sounds.horn],
            loop: false,
            volume: 0.6,
            onload: () => {
                this.checkLoaded();
            }
        });
        
        this.sounds.rail = new Howl({
            src: [Config.sounds.rail],
            loop: true,
            volume: 0,
            rate: 1.0,
            onload: () => {
                this.checkLoaded();
            }
        });
        
        this.sounds.rain = new Howl({
            src: [Config.sounds.rain],
            loop: true,
            volume: 0,
            onload: () => {
                this.checkLoaded();
            }
        });
        
        // Start looped sounds immediately
        this.sounds.engine.play();
        this.sounds.rail.play();
    }
    
    checkLoaded() {
        // Check if all sounds are loaded
        const totalSounds = Object.keys(Config.sounds).length;
        const loadedSounds = Object.keys(this.sounds).length;
        
        if (loadedSounds >= totalSounds) {
            this.loaded = true;
        }
    }
    
    updateEngineSounds(speed) {
        if (!this.loaded) return;
        
        // Update engine sound based on speed
        this.sounds.engine.volume(Math.min(speed * 5, 0.7));
        this.sounds.engine.rate(0.8 + speed * 0.5);
        
        // Update rail clacking sound based on speed
        this.sounds.rail.volume(Math.min(speed * 2, 0.5));
        this.sounds.rail.rate(0.7 + speed * 0.8);
    }
    
    playHorn() {
        if (!this.loaded) return;
        
        // Play the horn sound effect
        this.sounds.horn.play();
    }
    
    updateWeatherSounds(weatherType) {
        if (!this.loaded) return;
        
        // Adjust weather-related sounds
        if (weatherType === 'rainy') {
            this.sounds.rain.volume(0.5);
            if (!this.sounds.rain.playing()) {
                this.sounds.rain.play();
            }
        } else {
            this.sounds.rain.volume(0);
        }
    }
    
    isLoaded() {
        return this.loaded;
    }
    
    // Mute/unmute all sounds
    setMute(isMuted) {
        if (!this.loaded) return;
        
        Howler.mute(isMuted);
    }
} 