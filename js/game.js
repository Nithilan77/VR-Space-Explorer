// VR Space Explorer - Game Logic
class VRSpaceGame {
    constructor() {
        this.score = 0;
        this.crystalsCollected = 0;
        this.totalCrystals = 10;
        this.gameStarted = false;
        this.soundEnabled = true;
        
        this.init();
    }
    
    init() {
        console.log('🚀 VR Space Explorer - Initializing...');
        
        // Wait for A-Frame to load
        document.addEventListener('DOMContentLoaded', () => {
            this.setupEventListeners();
            this.initializeGameElements();
            this.startGameLoop();
        });
    }
    
    setupEventListeners() {
        const scene = document.querySelector('a-scene');
        
        if (scene) {
            scene.addEventListener('loaded', () => {
                console.log('✅ A-Frame scene loaded');
                this.onSceneReady();
            });
        }
        
        // Collect crystal interactions
        const crystals = document.querySelectorAll('.collectible');
        crystals.forEach((crystal, index) => {
            crystal.addEventListener('click', () => {
                this.collectCrystal(crystal);
            });
            
            crystal.addEventListener('mouseenter', () => {
                crystal.setAttribute('animation__hover', {
                    property: 'scale',
                    to: '1.2 1.2 1.2',
                    dur: 200
                });
            });
            
            crystal.addEventListener('mouseleave', () => {
                crystal.setAttribute('animation__hover', {
                    property: 'scale',
                    to: '1 1 1',
                    dur: 200
                });
            });
        });
        
        // Teleport interactions
        const teleportPoints = document.querySelectorAll('.teleport-point');
        teleportPoints.forEach(point => {
            point.addEventListener('click', (event) => {
                this.teleportPlayer(event.target.getAttribute('position'));
            });
        });
        
        // Planet interactions
        const planets = document.querySelectorAll('.planet');
        planets.forEach(planet => {
            planet.addEventListener('click', () => {
                this.showPlanetInfo(planet);
            });
        });
        
        // VR mode detection
        scene.addEventListener('enter-vr', () => {
            console.log('🥽 Entered VR mode');
            this.onEnterVR();
        });
        
        scene.addEventListener('exit-vr', () => {
            console.log('👁️ Exited VR mode');
            this.onExitVR();
        });
    }
    
    initializeGameElements() {
        this.updateScoreDisplay();
        this.createFloatingParticles();
        this.setupRandomCrystalMovement();
    }
    
    onSceneReady() {
        // Start background music
        if (this.soundEnabled) {
            this.playBackgroundMusic();
        }
        
        // Add welcome message
        this.showWelcomeMessage();
        
        // Initialize hand tracking if available
        this.initializeHandTracking();
    }
    
    collectCrystal(crystalElement) {
        if (crystalElement.classList.contains('collected')) {
            return; // Already collected
        }
        
        crystalElement.classList.add('collected');
        
        const points = parseInt(crystalElement.getAttribute('data-points')) || 100;
        this.score += points;
        this.crystalsCollected++;
        
        // Play collection sound
        this.playSound('collectSound');
        
        // Visual feedback
        this.createCollectionEffect(crystalElement);
        
        // Remove crystal with animation
        crystalElement.setAttribute('animation__collect', {
            property: 'scale',
            to: '0 0 0',
            dur: 500
        });
        
        crystalElement.setAttribute('animation__float', {
            property: 'position',
            to: `${crystalElement.getAttribute('position').x} ${parseFloat(crystalElement.getAttribute('position').y) + 2} ${crystalElement.getAttribute('position').z}`,
            dur: 500
        });
        
        setTimeout(() => {
            crystalElement.parentNode.removeChild(crystalElement);
        }, 500);
        
        this.updateScoreDisplay();
        this.checkGameComplete();
    }
    
    teleportPlayer(targetPosition) {
        const cameraRig = document.querySelector('#cameraRig');
        const [x, y, z] = targetPosition.split(' ').map(parseFloat);
        
        // Play teleport sound
        this.playSound('teleportSound');
        
        // Teleport effect
        this.createTeleportEffect();
        
        // Move player
        cameraRig.setAttribute('animation__teleport', {
            property: 'position',
            to: `${x} ${y + 1.6} ${z}`,
            dur: 300,
            easing: 'easeOutCubic'
        });
    }
    
    createCollectionEffect(crystal) {
        const position = crystal.getAttribute('position');
        
        // Create sparkle effect
        for (let i = 0; i < 8; i++) {
            const particle = document.createElement('a-sphere');
            particle.setAttribute('radius', '0.05');
            particle.setAttribute('color', '#ffff00');
            particle.setAttribute('position', position);
            
            const randomX = (Math.random() - 0.5) * 4;
            const randomY = Math.random() * 3 + 1;
            const randomZ = (Math.random() - 0.5) * 4;
            
            particle.setAttribute('animation__spread', {
                property: 'position',
                to: `${parseFloat(position.x) + randomX} ${parseFloat(position.y) + randomY} ${parseFloat(position.z) + randomZ}`,
                dur: 1000
            });
            
            particle.setAttribute('animation__fade', {
                property: 'material.opacity',
                to: 0,
                dur: 1000
            });
            
            document.querySelector('a-scene').appendChild(particle);
            
            setTimeout(() => {
                if (particle.parentNode) {
                    particle.parentNode.removeChild(particle);
                }
            }, 1000);
        }
    }
    
    createTeleportEffect() {
        const camera = document.querySelector('#camera');
        const cameraPos = camera.getAttribute('position');
        
        // Create teleport rings
        for (let i = 0; i < 3; i++) {
            const ring = document.createElement('a-torus');
            ring.setAttribute('radius', '1');
            ring.setAttribute('radius-tubular', '0.1');
            ring.setAttribute('color', '#00ffff');
            ring.setAttribute('position', `${cameraPos.x} 0.1 ${cameraPos.z}`);
            ring.setAttribute('material', 'transparent: true; opacity: 0.8');
            
            ring.setAttribute('animation__expand', {
                property: 'radius',
                to: '3',
                dur: 500,
                delay: i * 100
            });
            
            ring.setAttribute('animation__fade', {
                property: 'material.opacity',
                to: 0,
                dur: 500,
                delay: i * 100
            });
            
            document.querySelector('a-scene').appendChild(ring);
            
            setTimeout(() => {
                if (ring.parentNode) {
                    ring.parentNode.removeChild(ring);
                }
            }, 600);
        }
    }
    
    createFloatingParticles() {
        const particleCount = 20;
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('a-sphere');
            particle.setAttribute('radius', '0.02');
            particle.setAttribute('color', `hsl(${Math.random() * 360}, 70%, 70%)`);
            particle.setAttribute('material', 'transparent: true; opacity: 0.6');
            
            const x = (Math.random() - 0.5) * 40;
            const y = Math.random() * 20 + 2;
            const z = (Math.random() - 0.5) * 40 - 10;
            
            particle.setAttribute('position', `${x} ${y} ${z}`);
            
            particle.setAttribute('animation__float', {
                property: 'position',
                to: `${x + (Math.random() - 0.5) * 10} ${y + Math.random() * 5} ${z + (Math.random() - 0.5) * 10}`,
                dur: Math.random() * 10000 + 5000,
                loop: true,
                dir: 'alternate'
            });
            
            particle.setAttribute('animation__twinkle', {
                property: 'material.opacity',
                to: Math.random() * 0.8 + 0.2,
                dur: Math.random() * 2000 + 1000,
                loop: true,
                dir: 'alternate'
            });
            
            document.querySelector('#particleEffects').appendChild(particle);
        }
    }
    
    setupRandomCrystalMovement() {
        const crystals = document.querySelectorAll('.crystal');
        
        crystals.forEach(crystal => {
            const basePosition = crystal.getAttribute('position');
            const [x, y, z] = basePosition.split(' ').map(parseFloat);
            
            crystal.setAttribute('animation__float', {
                property: 'position',
                to: `${x} ${y + Math.random() * 2 + 0.5} ${z}`,
                dur: Math.random() * 3000 + 2000,
                loop: true,
                dir: 'alternate'
            });
            
            crystal.setAttribute('animation__pulse', {
                property: 'material.emissiveIntensity',
                to: '0.5',
                dur: Math.random() * 1500 + 1000,
                loop: true,
                dir: 'alternate'
            });
        });
    }
    
    showPlanetInfo(planet) {
        const planetName = planet.id;
        let info = '';
        
        switch(planetName) {
            case 'earth':
                info = 'Earth - Our beautiful home planet';
                break;
            case 'mars':
                info = 'Mars - The red planet, future human colony';
                break;
            case 'sun':
                info = 'Sun - The center of our solar system';
                break;
            default:
                info = 'Unknown celestial body';
        }
        
        this.showFloatingText(info, planet.getAttribute('position'));
    }
    
    showFloatingText(text, position) {
        const textEl = document.createElement('a-text');
        textEl.setAttribute('value', text);
        textEl.setAttribute('position', position);
        textEl.setAttribute('align', 'center');
        textEl.setAttribute('color', '#ffffff');
        textEl.setAttribute('width', '6');
        
        textEl.setAttribute('animation__appear', {
            property: 'scale',
            from: '0 0 0',
            to: '1 1 1',
            dur: 300
        });
        
        textEl.setAttribute('animation__float', {
            property: 'position',
            to: `${parseFloat(position.x)} ${parseFloat(position.y) + 2} ${parseFloat(position.z)}`,
            dur: 2000
        });
        
        textEl.setAttribute('animation__fade', {
            property: 'material.opacity',
            to: 0,
            dur: 500,
            delay: 2000
        });
        
        document.querySelector('a-scene').appendChild(textEl);
        
        setTimeout(() => {
            if (textEl.parentNode) {
                textEl.parentNode.removeChild(textEl);
            }
        }, 2500);
    }
    
    showWelcomeMessage() {
        const welcomeText = document.createElement('a-text');
        welcomeText.setAttribute('value', 'Welcome to VR Space Explorer!\nMeta Quest Compatible\nCollect all crystals!');
        welcomeText.setAttribute('position', '0 3 -4');
        welcomeText.setAttribute('align', 'center');
        welcomeText.setAttribute('color', '#00ff00');
        welcomeText.setAttribute('width', '8');
        
        welcomeText.setAttribute('animation__fade', {
            property: 'material.opacity',
            from: 0,
            to: 1,
            dur: 1000
        });
        
        welcomeText.setAttribute('animation__fadeout', {
            property: 'material.opacity',
            to: 0,
            dur: 1000,
            delay: 4000
        });
        
        document.querySelector('a-scene').appendChild(welcomeText);
        
        setTimeout(() => {
            if (welcomeText.parentNode) {
                welcomeText.parentNode.removeChild(welcomeText);
            }
        }, 5000);
    }
    
    initializeHandTracking() {
        // Check if hand tracking is available
        if (navigator.xr) {
            navigator.xr.isSessionSupported('immersive-vr').then((supported) => {
                if (supported) {
                    console.log('✅ WebXR VR supported');
                } else {
                    console.log('❌ WebXR VR not supported');
                }
            });
        }
    }
    
    onEnterVR() {
        // Hide UI overlays in VR
        document.querySelectorAll('.ui-overlay, .controls').forEach(el => {
            el.style.display = 'none';
        });
        
        // Show VR-specific UI
        this.createVRUI();
    }
    
    onExitVR() {
        // Show UI overlays again
        document.querySelectorAll('.ui-overlay, .controls').forEach(el => {
            el.style.display = 'block';
        });
        
        // Remove VR-specific UI
        const vrUI = document.querySelector('#vrUI');
        if (vrUI) {
            vrUI.parentNode.removeChild(vrUI);
        }
    }
    
    createVRUI() {
        const vrUI = document.createElement('a-entity');
        vrUI.id = 'vrUI';
        vrUI.setAttribute('position', '0 2 -3');
        
        // Score display in VR
        const scoreText = document.createElement('a-text');
        scoreText.id = 'vrScore';
        scoreText.setAttribute('value', `Score: ${this.score}\nCrystals: ${this.crystalsCollected}/${this.totalCrystals}`);
        scoreText.setAttribute('position', '0 0.5 0');
        scoreText.setAttribute('align', 'center');
        scoreText.setAttribute('color', '#00ff00');
        scoreText.setAttribute('width', '6');
        
        vrUI.appendChild(scoreText);
        document.querySelector('a-scene').appendChild(vrUI);
    }
    
    updateScoreDisplay() {
        // Update DOM elements
        document.getElementById('score').textContent = this.score;
        document.getElementById('crystals').textContent = this.crystalsCollected;
        
        // Update VR UI if it exists
        const vrScore = document.querySelector('#vrScore');
        if (vrScore) {
            vrScore.setAttribute('value', `Score: ${this.score}\nCrystals: ${this.crystalsCollected}/${this.totalCrystals}`);
        }
    }
    
    checkGameComplete() {
        if (this.crystalsCollected >= this.totalCrystals) {
            this.gameComplete();
        }
    }
    
    gameComplete() {
        console.log('🎉 Game Complete!');
        
        // Show completion message
        this.showFloatingText('🎉 CONGRATULATIONS! 🎉\nAll crystals collected!\nYou are a true Space Explorer!', '0 4 -3');
        
        // Create fireworks effect
        this.createFireworks();
        
        // Play victory sound
        this.playVictorySound();
    }
    
    createFireworks() {
        for (let i = 0; i < 20; i++) {
            setTimeout(() => {
                const firework = document.createElement('a-sphere');
                firework.setAttribute('radius', '0.1');
                firework.setAttribute('color', `hsl(${Math.random() * 360}, 100%, 50%)`);
                firework.setAttribute('position', `${(Math.random() - 0.5) * 20} ${Math.random() * 10 + 5} ${Math.random() * -20 - 5}`);
                
                firework.setAttribute('animation__explode', {
                    property: 'scale',
                    to: '3 3 3',
                    dur: 1000
                });
                
                firework.setAttribute('animation__fade', {
                    property: 'material.opacity',
                    to: 0,
                    dur: 1000
                });
                
                document.querySelector('a-scene').appendChild(firework);
                
                setTimeout(() => {
                    if (firework.parentNode) {
                        firework.parentNode.removeChild(firework);
                    }
                }, 1000);
            }, i * 200);
        }
    }
    
    playSound(soundId) {
        if (!this.soundEnabled) return;
        
        const sound = document.getElementById(soundId);
        if (sound) {
            sound.currentTime = 0;
            sound.play().catch(e => console.log('Audio play failed:', e));
        }
    }
    
    playBackgroundMusic() {
        const music = document.getElementById('backgroundMusic');
        if (music && this.soundEnabled) {
            music.volume = 0.3;
            music.play().catch(e => console.log('Background music play failed:', e));
        }
    }
    
    playVictorySound() {
        // Create victory sound effect
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(523, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(659, audioContext.currentTime + 0.1);
        oscillator.frequency.setValueAtTime(784, audioContext.currentTime + 0.2);
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
    }
    
    startGameLoop() {
        // Simple game loop for updates
        setInterval(() => {
            this.gameUpdate();
        }, 100);
    }
    
    gameUpdate() {
        // Perform any continuous updates here
        // This could include checking for new VR controllers, updating animations, etc.
    }
    
    resetGame() {
        this.score = 0;
        this.crystalsCollected = 0;
        this.updateScoreDisplay();
        
        // Reload the page to reset everything
        location.reload();
    }
    
    toggleSound() {
        this.soundEnabled = !this.soundEnabled;
        
        const music = document.getElementById('backgroundMusic');
        if (music) {
            if (this.soundEnabled) {
                music.play();
            } else {
                music.pause();
            }
        }
        
        // Update button text
        const soundButton = document.querySelector('.vr-button:last-child');
        soundButton.textContent = this.soundEnabled ? '🔊 Sound' : '🔇 Muted';
    }
}

// Global functions for UI buttons
function enterVR() {
    const scene = document.querySelector('a-scene');
    if (scene) {
        scene.enterVR();
    }
}

function resetGame() {
    if (window.vrGame) {
        window.vrGame.resetGame();
    }
}

function toggleSound() {
    if (window.vrGame) {
        window.vrGame.toggleSound();
    }
}

// Initialize the game
window.addEventListener('DOMContentLoaded', () => {
    window.vrGame = new VRSpaceGame();
});

console.log('🚀 VR Space Explorer Game Script Loaded');