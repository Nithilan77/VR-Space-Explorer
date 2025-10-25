// Audio Manager for VR Space Explorer
class AudioManager {
    constructor() {
        this.sounds = {
            backgroundMusic: null,
            collectSound: null,
            teleportSound: null,
            ambientSpace: null
        };
        
        this.audioContext = null;
        this.spatialAudio = {};
        this.masterVolume = 0.7;
        this.musicVolume = 0.3;
        this.sfxVolume = 0.8;
        this.isInitialized = false;
        
        this.init();
    }
    
    init() {
        console.log('🔊 Audio Manager - Initializing...');
        
        // Initialize Web Audio Context
        this.initializeAudioContext();
        
        // Create procedural audio when DOM is loaded
        document.addEventListener('DOMContentLoaded', () => {
            this.createProceduralAudio();
            this.setupSpatialAudio();
        });
        
        // Handle user interaction to enable audio
        document.addEventListener('click', () => this.enableAudio(), { once: true });
        document.addEventListener('touchstart', () => this.enableAudio(), { once: true });
    }
    
    initializeAudioContext() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            console.log('✅ Web Audio Context initialized');
        } catch (error) {
            console.warn('❌ Web Audio Context not supported:', error);
        }
    }
    
    async enableAudio() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            try {
                await this.audioContext.resume();
                console.log('✅ Audio context resumed');
                this.isInitialized = true;
                this.startBackgroundMusic();
            } catch (error) {
                console.warn('Failed to resume audio context:', error);
            }
        }
    }
    
    createProceduralAudio() {
        if (!this.audioContext) return;
        
        // Create background music
        this.createSpaceAmbientMusic();
        
        // Create sound effects
        this.createCollectSound();
        this.createTeleportSound();
        this.createAmbientSpaceSounds();
    }
    
    createSpaceAmbientMusic() {
        if (!this.audioContext) return;
        
        // Create a space-like ambient background music
        const oscillator1 = this.audioContext.createOscillator();
        const oscillator2 = this.audioContext.createOscillator();
        const oscillator3 = this.audioContext.createOscillator();
        
        const gain1 = this.audioContext.createGain();
        const gain2 = this.audioContext.createGain();
        const gain3 = this.audioContext.createGain();
        const masterGain = this.audioContext.createGain();
        
        // Low frequency pad
        oscillator1.type = 'sine';
        oscillator1.frequency.setValueAtTime(55, this.audioContext.currentTime); // A1
        gain1.gain.setValueAtTime(0.1, this.audioContext.currentTime);
        
        // Mid frequency harmony
        oscillator2.type = 'triangle';
        oscillator2.frequency.setValueAtTime(110, this.audioContext.currentTime); // A2
        gain2.gain.setValueAtTime(0.05, this.audioContext.currentTime);
        
        // High frequency sparkle
        oscillator3.type = 'sine';
        oscillator3.frequency.setValueAtTime(880, this.audioContext.currentTime); // A5
        gain3.gain.setValueAtTime(0.02, this.audioContext.currentTime);
        
        // Connect nodes
        oscillator1.connect(gain1);
        oscillator2.connect(gain2);
        oscillator3.connect(gain3);
        
        gain1.connect(masterGain);
        gain2.connect(masterGain);
        gain3.connect(masterGain);
        
        masterGain.connect(this.audioContext.destination);
        masterGain.gain.setValueAtTime(this.musicVolume, this.audioContext.currentTime);
        
        // Add subtle modulation
        const lfo = this.audioContext.createOscillator();
        const lfoGain = this.audioContext.createGain();
        
        lfo.type = 'sine';
        lfo.frequency.setValueAtTime(0.1, this.audioContext.currentTime);
        lfoGain.gain.setValueAtTime(5, this.audioContext.currentTime);
        
        lfo.connect(lfoGain);
        lfoGain.connect(oscillator2.frequency);
        
        // Store references
        this.sounds.backgroundMusic = {
            oscillators: [oscillator1, oscillator2, oscillator3, lfo],
            gains: [gain1, gain2, gain3, masterGain, lfoGain],
            masterGain: masterGain
        };
    }
    
    createCollectSound() {
        // Crystal collection sound generator
        this.sounds.collectSound = () => {
            if (!this.audioContext) return;
            
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            // Ascending chime sound
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(523, this.audioContext.currentTime); // C5
            oscillator.frequency.exponentialRampToValueAtTime(1047, this.audioContext.currentTime + 0.1); // C6
            oscillator.frequency.exponentialRampToValueAtTime(1568, this.audioContext.currentTime + 0.2); // G6
            
            gainNode.gain.setValueAtTime(this.sfxVolume * 0.3, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.3);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + 0.3);
        };
    }
    
    createTeleportSound() {
        // Teleportation sound generator
        this.sounds.teleportSound = () => {
            if (!this.audioContext) return;
            
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            const filter = this.audioContext.createBiquadFilter();
            
            oscillator.connect(filter);
            filter.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            // Swoosh sound
            oscillator.type = 'sawtooth';
            oscillator.frequency.setValueAtTime(200, this.audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(50, this.audioContext.currentTime + 0.5);
            
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(2000, this.audioContext.currentTime);
            filter.frequency.exponentialRampToValueAtTime(100, this.audioContext.currentTime + 0.5);
            
            gainNode.gain.setValueAtTime(this.sfxVolume * 0.2, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.5);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + 0.5);
        };
    }
    
    createAmbientSpaceSounds() {
        // Create periodic ambient space sounds
        this.sounds.ambientSpace = () => {
            if (!this.audioContext) return;
            
            // Random space ambience
            const sounds = [
                () => this.createRandomTone(100, 300, 2000, 'sine'),
                () => this.createRandomTone(200, 500, 1500, 'triangle'),
                () => this.createRandomNoise(1000, 0.05)
            ];
            
            const randomSound = sounds[Math.floor(Math.random() * sounds.length)];
            randomSound();
        };
    }
    
    createRandomTone(minFreq, maxFreq, duration, type = 'sine') {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        const filter = this.audioContext.createBiquadFilter();
        
        oscillator.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.type = type;
        const freq = minFreq + Math.random() * (maxFreq - minFreq);
        oscillator.frequency.setValueAtTime(freq, this.audioContext.currentTime);
        
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(freq * 2, this.audioContext.currentTime);
        
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.02, this.audioContext.currentTime + 0.1);
        gainNode.gain.linearRampToValueAtTime(0.01, this.audioContext.currentTime + duration / 1000 - 0.1);
        gainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + duration / 1000);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration / 1000);
    }
    
    createRandomNoise(duration, volume) {
        const bufferSize = this.audioContext.sampleRate * (duration / 1000);
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);
        
        // Generate pink noise
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * volume;
        }
        
        const source = this.audioContext.createBufferSource();
        const gainNode = this.audioContext.createGain();
        const filter = this.audioContext.createBiquadFilter();
        
        source.buffer = buffer;
        source.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        filter.type = 'highpass';
        filter.frequency.setValueAtTime(1000, this.audioContext.currentTime);
        
        gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration / 1000);
        
        source.start(this.audioContext.currentTime);
    }
    
    setupSpatialAudio() {
        // Setup 3D spatial audio for VR
        if (!this.audioContext) return;
        
        console.log('🌍 Setting up spatial audio...');
        
        // Create spatial audio nodes for different game elements
        this.createSpatialAudioForElements();
        this.startAmbientSoundLoop();
    }
    
    createSpatialAudioForElements() {
        // Add spatial audio to planets, crystals, etc.
        const planets = document.querySelectorAll('.planet');
        const crystals = document.querySelectorAll('.crystal');
        
        planets.forEach((planet, index) => {
            this.createPlanetAmbientSound(planet, index);
        });
        
        crystals.forEach((crystal, index) => {
            this.createCrystalHumSound(crystal, index);
        });
    }
    
    createPlanetAmbientSound(planet, index) {
        if (!this.audioContext) return;
        
        const panner = this.audioContext.createPanner();
        panner.panningModel = 'HRTF';
        panner.distanceModel = 'inverse';
        panner.refDistance = 1;
        panner.maxDistance = 10;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(panner);
        panner.connect(this.audioContext.destination);
        
        // Different sound for each planet
        const frequencies = [82, 110, 146, 196]; // E2, A2, D3, G3
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(frequencies[index % frequencies.length], this.audioContext.currentTime);
        
        gainNode.gain.setValueAtTime(0.01, this.audioContext.currentTime);
        
        // Update position based on planet position
        const updatePosition = () => {
            const position = planet.getAttribute('position');
            if (position) {
                panner.positionX.setValueAtTime(position.x, this.audioContext.currentTime);
                panner.positionY.setValueAtTime(position.y, this.audioContext.currentTime);
                panner.positionZ.setValueAtTime(position.z, this.audioContext.currentTime);
            }
        };
        
        updatePosition();
        setInterval(updatePosition, 100); // Update position periodically
        
        this.spatialAudio[`planet-${index}`] = {
            oscillator,
            gainNode,
            panner
        };
    }
    
    createCrystalHumSound(crystal, index) {
        if (!this.audioContext) return;
        
        const panner = this.audioContext.createPanner();
        panner.panningModel = 'HRTF';
        panner.distanceModel = 'inverse';
        panner.refDistance = 0.5;
        panner.maxDistance = 5;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        const filter = this.audioContext.createBiquadFilter();
        
        oscillator.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(panner);
        panner.connect(this.audioContext.destination);
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(440 + index * 55, this.audioContext.currentTime); // Harmonic series
        
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(440 + index * 55, this.audioContext.currentTime);
        filter.Q.setValueAtTime(10, this.audioContext.currentTime);
        
        gainNode.gain.setValueAtTime(0.005, this.audioContext.currentTime);
        
        // Pulsing effect
        const lfo = this.audioContext.createOscillator();
        const lfoGain = this.audioContext.createGain();
        
        lfo.type = 'sine';
        lfo.frequency.setValueAtTime(0.5 + index * 0.1, this.audioContext.currentTime);
        lfoGain.gain.setValueAtTime(0.003, this.audioContext.currentTime);
        
        lfo.connect(lfoGain);
        lfoGain.connect(gainNode.gain);
        
        // Update position
        const updatePosition = () => {
            const position = crystal.getAttribute('position');
            if (position) {
                panner.positionX.setValueAtTime(position.x, this.audioContext.currentTime);
                panner.positionY.setValueAtTime(position.y, this.audioContext.currentTime);
                panner.positionZ.setValueAtTime(position.z, this.audioContext.currentTime);
            }
        };
        
        updatePosition();
        
        this.spatialAudio[`crystal-${index}`] = {
            oscillator,
            gainNode,
            panner,
            lfo,
            updatePosition
        };
        
        // Remove audio when crystal is collected
        crystal.addEventListener('click', () => {
            setTimeout(() => {
                this.removeCrystalAudio(index);
            }, 500);
        });
    }
    
    removeCrystalAudio(index) {
        const audio = this.spatialAudio[`crystal-${index}`];
        if (audio) {
            audio.oscillator.stop();
            audio.lfo.stop();
            delete this.spatialAudio[`crystal-${index}`];
        }
    }
    
    updateListenerPosition() {
        // Update listener position based on camera/VR headset position
        if (!this.audioContext || !this.audioContext.listener) return;
        
        const camera = document.querySelector('#camera');
        if (!camera) return;
        
        const position = camera.getAttribute('position');
        const rotation = camera.getAttribute('rotation');
        
        if (position) {
            this.audioContext.listener.positionX.setValueAtTime(position.x, this.audioContext.currentTime);
            this.audioContext.listener.positionY.setValueAtTime(position.y, this.audioContext.currentTime);
            this.audioContext.listener.positionZ.setValueAtTime(position.z, this.audioContext.currentTime);
        }
        
        if (rotation) {
            // Convert rotation to forward and up vectors
            const forwardX = -Math.sin(rotation.y * Math.PI / 180);
            const forwardZ = -Math.cos(rotation.y * Math.PI / 180);
            
            this.audioContext.listener.forwardX.setValueAtTime(forwardX, this.audioContext.currentTime);
            this.audioContext.listener.forwardY.setValueAtTime(0, this.audioContext.currentTime);
            this.audioContext.listener.forwardZ.setValueAtTime(forwardZ, this.audioContext.currentTime);
            
            this.audioContext.listener.upX.setValueAtTime(0, this.audioContext.currentTime);
            this.audioContext.listener.upY.setValueAtTime(1, this.audioContext.currentTime);
            this.audioContext.listener.upZ.setValueAtTime(0, this.audioContext.currentTime);
        }
    }
    
    startBackgroundMusic() {
        if (!this.isInitialized || !this.sounds.backgroundMusic) return;
        
        const music = this.sounds.backgroundMusic;
        const currentTime = this.audioContext.currentTime;
        
        music.oscillators.forEach(osc => {
            try {
                osc.start(currentTime);
            } catch (error) {
                console.warn('Failed to start oscillator:', error);
            }
        });
        
        console.log('🎵 Background music started');
    }
    
    startAmbientSoundLoop() {
        // Play random ambient sounds periodically
        const playAmbientSound = () => {
            if (this.isInitialized && this.sounds.ambientSpace) {
                this.sounds.ambientSpace();
            }
        };
        
        // Start ambient sound loop
        setInterval(playAmbientSound, 5000 + Math.random() * 10000); // 5-15 seconds
        
        // Update listener position regularly
        setInterval(() => this.updateListenerPosition(), 100);
    }
    
    playCollectSound() {
        if (this.isInitialized && this.sounds.collectSound) {
            this.sounds.collectSound();
        }
    }
    
    playTeleportSound() {
        if (this.isInitialized && this.sounds.teleportSound) {
            this.sounds.teleportSound();
        }
    }
    
    setMasterVolume(volume) {
        this.masterVolume = Math.max(0, Math.min(1, volume));
        
        if (this.sounds.backgroundMusic) {
            this.sounds.backgroundMusic.masterGain.gain.setValueAtTime(
                this.musicVolume * this.masterVolume, 
                this.audioContext.currentTime
            );
        }
    }
    
    toggleMusic() {
        if (!this.sounds.backgroundMusic) return;
        
        const masterGain = this.sounds.backgroundMusic.masterGain;
        const currentGain = masterGain.gain.value;
        
        if (currentGain > 0) {
            masterGain.gain.setValueAtTime(0, this.audioContext.currentTime);
        } else {
            masterGain.gain.setValueAtTime(this.musicVolume * this.masterVolume, this.audioContext.currentTime);
        }
    }
}

// Global audio manager instance
window.audioManager = new AudioManager();

// Hook into game events
document.addEventListener('DOMContentLoaded', () => {
    // Connect to game events
    document.addEventListener('crystal-collected', () => {
        window.audioManager.playCollectSound();
    });
    
    document.addEventListener('player-teleported', () => {
        window.audioManager.playTeleportSound();
    });
});

console.log('🔊 Audio Manager Script Loaded');