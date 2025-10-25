// VR Interactions Handler for Meta Quest Compatibility
class VRInteractions {
    constructor() {
        this.isVRMode = false;
        this.controllers = {
            left: null,
            right: null
        };
        this.handTracking = false;
        
        this.init();
    }
    
    init() {
        console.log('🎮 VR Interactions - Initializing...');
        
        document.addEventListener('DOMContentLoaded', () => {
            this.setupControllers();
            this.setupHandTracking();
            this.setupTeleportation();
            this.setupGrabInteractions();
        });
    }
    
    setupControllers() {
        const scene = document.querySelector('a-scene');
        
        scene.addEventListener('controllerconnected', (event) => {
            console.log('🎮 Controller connected:', event.detail.name);
            
            const controller = event.detail.target;
            const hand = controller.getAttribute('laser-controls').hand;
            
            this.controllers[hand] = controller;
            
            // Add controller-specific event listeners
            this.setupControllerEvents(controller, hand);
        });
        
        scene.addEventListener('controllerdisconnected', (event) => {
            console.log('🎮 Controller disconnected');
            
            const hand = event.detail.target.getAttribute('laser-controls').hand;
            this.controllers[hand] = null;
        });
    }
    
    setupControllerEvents(controller, hand) {
        // Trigger button (for selection/interaction)
        controller.addEventListener('triggerdown', (event) => {
            this.onTriggerPress(hand, event);
        });
        
        controller.addEventListener('triggerup', (event) => {
            this.onTriggerRelease(hand, event);
        });
        
        // Grip button (for grabbing)
        controller.addEventListener('gripdown', (event) => {
            this.onGripPress(hand, event);
        });
        
        controller.addEventListener('gripup', (event) => {
            this.onGripRelease(hand, event);
        });
        
        // Thumbstick (for movement)
        controller.addEventListener('thumbstickmoved', (event) => {
            this.onThumbstickMove(hand, event);
        });
        
        // A/X button
        controller.addEventListener('abuttondown', (event) => {
            this.onAButtonPress(hand, event);
        });
        
        // B/Y button  
        controller.addEventListener('bbuttondown', (event) => {
            this.onBButtonPress(hand, event);
        });
    }
    
    onTriggerPress(hand, event) {
        console.log(`🎯 ${hand} trigger pressed`);
        
        // Get the intersected object
        const controller = this.controllers[hand];
        if (controller) {
            const raycaster = controller.components.raycaster;
            const intersection = raycaster.getIntersection();
            
            if (intersection) {
                this.handleInteraction(intersection.object.el, 'trigger', hand);
            }
        }
    }
    
    onTriggerRelease(hand, event) {
        console.log(`🎯 ${hand} trigger released`);
    }
    
    onGripPress(hand, event) {
        console.log(`✊ ${hand} grip pressed`);
        
        const controller = this.controllers[hand];
        if (controller) {
            const raycaster = controller.components.raycaster;
            const intersection = raycaster.getIntersection();
            
            if (intersection) {
                this.grabObject(intersection.object.el, hand);
            }
        }
    }
    
    onGripRelease(hand, event) {
        console.log(`✋ ${hand} grip released`);
        this.releaseObject(hand);
    }
    
    onThumbstickMove(hand, event) {
        const { x, y } = event.detail;
        
        // Use thumbstick for smooth locomotion
        if (Math.abs(x) > 0.1 || Math.abs(y) > 0.1) {
            this.smoothLocomotion(x, y);
        }
    }
    
    onAButtonPress(hand, event) {
        console.log(`🅰️ ${hand} A button pressed`);
        // Quick teleport to nearest teleport point
        this.quickTeleport();
    }
    
    onBButtonPress(hand, event) {
        console.log(`🅱️ ${hand} B button pressed`);
        // Reset player position
        this.resetPlayerPosition();
    }
    
    handleInteraction(element, interactionType, hand) {
        if (!element) return;
        
        const classList = Array.from(element.classList);
        
        if (classList.includes('collectible')) {
            // Trigger crystal collection
            element.dispatchEvent(new Event('click'));
        } else if (classList.includes('teleport-point')) {
            // Trigger teleportation
            element.dispatchEvent(new Event('click'));
        } else if (classList.includes('planet')) {
            // Show planet information
            element.dispatchEvent(new Event('click'));
        } else if (classList.includes('interactive')) {
            // Generic interactive element
            this.createInteractionFeedback(element);
        }
    }
    
    grabObject(element, hand) {
        if (!element || !element.classList.contains('grabbable')) {
            return;
        }
        
        const controller = this.controllers[hand];
        if (!controller) return;
        
        // Store original parent and position
        element.originalParent = element.parentNode;
        element.originalPosition = element.getAttribute('position');
        element.originalRotation = element.getAttribute('rotation');
        
        // Attach to controller
        controller.appendChild(element);
        element.setAttribute('position', '0 0 -0.5');
        element.setAttribute('rotation', '0 0 0');
        
        // Add visual feedback
        element.setAttribute('material', 'color: #ffff00; emissive: #ffff00; emissiveIntensity: 0.3');
        
        console.log(`✊ Grabbed ${element.id || 'object'} with ${hand} hand`);
    }
    
    releaseObject(hand) {
        const controller = this.controllers[hand];
        if (!controller) return;
        
        // Find grabbed object
        const grabbedObject = controller.querySelector('.grabbable');
        if (grabbedObject && grabbedObject.originalParent) {
            // Return to original parent
            grabbedObject.originalParent.appendChild(grabbedObject);
            
            // Get controller position for drop location
            const controllerPos = controller.getAttribute('position');
            grabbedObject.setAttribute('position', controllerPos);
            
            // Remove visual feedback
            grabbedObject.removeAttribute('material');
            
            // Clean up
            delete grabbedObject.originalParent;
            delete grabbedObject.originalPosition;
            delete grabbedObject.originalRotation;
            
            console.log(`✋ Released ${grabbedObject.id || 'object'} from ${hand} hand`);
        }
    }
    
    setupTeleportation() {
        // Enhanced teleportation system
        const cameraRig = document.querySelector('#cameraRig');
        
        // Create teleportation arc visualization
        this.createTeleportArc();
    }
    
    createTeleportArc() {
        const leftController = document.querySelector('#leftHand');
        const rightController = document.querySelector('#rightHand');
        
        [leftController, rightController].forEach(controller => {
            if (controller) {
                // Create arc curve for teleportation preview
                const arc = document.createElement('a-curve');
                arc.setAttribute('id', `teleportArc-${controller.id}`);
                arc.style.display = 'none';
                
                // Add arc points
                for (let i = 0; i <= 10; i++) {
                    const point = document.createElement('a-curve-point');
                    point.setAttribute('position', `0 ${-i * 0.5} ${-i * 0.8}`);
                    arc.appendChild(point);
                }
                
                controller.appendChild(arc);
            }
        });
    }
    
    smoothLocomotion(x, y) {
        const cameraRig = document.querySelector('#cameraRig');
        const currentPos = cameraRig.getAttribute('position');
        
        // Calculate movement based on camera direction
        const camera = document.querySelector('#camera');
        const rotation = camera.getAttribute('rotation');
        
        const speed = 0.1;
        const moveX = x * speed * Math.cos((rotation.y * Math.PI) / 180);
        const moveZ = -y * speed * Math.sin((rotation.y * Math.PI) / 180);
        
        const newPos = {
            x: currentPos.x + moveX,
            y: currentPos.y,
            z: currentPos.z + moveZ
        };
        
        cameraRig.setAttribute('position', newPos);
    }
    
    quickTeleport() {
        // Find nearest teleport point
        const teleportPoints = document.querySelectorAll('.teleport-point');
        const camera = document.querySelector('#camera');
        const cameraPos = camera.getAttribute('position');
        
        let nearestPoint = null;
        let nearestDistance = Infinity;
        
        teleportPoints.forEach(point => {
            const pointPos = point.getAttribute('position');
            const distance = this.calculateDistance(cameraPos, pointPos);
            
            if (distance < nearestDistance) {
                nearestDistance = distance;
                nearestPoint = point;
            }
        });
        
        if (nearestPoint) {
            nearestPoint.dispatchEvent(new Event('click'));
        }
    }
    
    calculateDistance(pos1, pos2) {
        const dx = pos1.x - pos2.x;
        const dy = pos1.y - pos2.y;
        const dz = pos1.z - pos2.z;
        
        return Math.sqrt(dx * dx + dy * dy + dz * dz);
    }
    
    resetPlayerPosition() {
        const cameraRig = document.querySelector('#cameraRig');
        
        cameraRig.setAttribute('animation__reset', {
            property: 'position',
            to: '0 0 3',
            dur: 1000,
            easing: 'easeInOutCubic'
        });
        
        console.log('🏠 Player position reset');
    }
    
    createInteractionFeedback(element) {
        // Visual feedback for interactions
        const originalColor = element.getAttribute('material').color || '#ffffff';
        
        element.setAttribute('animation__feedback', {
            property: 'material.color',
            from: originalColor,
            to: '#ffff00',
            dur: 200,
            dir: 'alternate',
            loop: 2
        });
        
        // Haptic feedback (if supported)
        this.triggerHapticFeedback();
    }
    
    triggerHapticFeedback(intensity = 0.5, duration = 100) {
        // Attempt to trigger haptic feedback on controllers
        Object.values(this.controllers).forEach(controller => {
            if (controller && controller.components && controller.components['tracked-controls']) {
                const gamepad = controller.components['tracked-controls'].controller;
                if (gamepad && gamepad.hapticActuators && gamepad.hapticActuators[0]) {
                    gamepad.hapticActuators[0].pulse(intensity, duration);
                }
            }
        });
    }
    
    setupHandTracking() {
        // Enhanced hand tracking setup
        console.log('👋 Setting up hand tracking...');
        
        // Check for hand tracking support
        if (navigator.xr) {
            navigator.xr.isSessionSupported('immersive-vr').then(supported => {
                if (supported) {
                    console.log('✅ Hand tracking potentially supported');
                    this.initializeHandGestures();
                }
            });
        }
    }
    
    initializeHandGestures() {
        // Basic hand gesture recognition
        const scene = document.querySelector('a-scene');
        
        // Pinch gesture for selection
        document.addEventListener('pinchstarted', (event) => {
            console.log('👌 Pinch gesture detected');
            this.onPinchGesture(event);
        });
        
        // Point gesture for UI interaction
        document.addEventListener('pointing', (event) => {
            console.log('👉 Pointing gesture detected');
            this.onPointGesture(event);
        });
    }
    
    onPinchGesture(event) {
        // Handle pinch gesture (similar to trigger press)
        const hand = event.detail.handedness;
        
        // Find objects near the pinch position
        const pinchPos = event.detail.position;
        const nearbyObjects = this.findNearbyObjects(pinchPos, 0.5);
        
        nearbyObjects.forEach(obj => {
            if (obj.classList.contains('interactive')) {
                this.handleInteraction(obj, 'pinch', hand);
            }
        });
    }
    
    onPointGesture(event) {
        // Handle pointing gesture for UI elements
        const hand = event.detail.handedness;
        const direction = event.detail.direction;
        
        // Cast ray in pointing direction
        this.castHandRay(event.detail.position, direction, hand);
    }
    
    findNearbyObjects(position, radius) {
        const allObjects = document.querySelectorAll('.interactive');
        const nearby = [];
        
        allObjects.forEach(obj => {
            const objPos = obj.getAttribute('position');
            const distance = this.calculateDistance(position, objPos);
            
            if (distance <= radius) {
                nearby.push(obj);
            }
        });
        
        return nearby;
    }
    
    castHandRay(origin, direction, hand) {
        // Simple ray casting for hand pointing
        const scene = document.querySelector('a-scene');
        const intersections = [];
        
        // This would need a proper ray casting implementation
        // For now, we'll use the existing raycaster logic
        console.log(`👉 Hand ray cast from ${hand} hand`);
    }
    
    setupGrabInteractions() {
        // Make certain objects grabbable
        const grabbableElements = [
            // Add IDs of elements that should be grabbable
            // 'crystal1', 'crystal2', etc.
        ];
        
        grabbableElements.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.classList.add('grabbable');
            }
        });
        
        // Add visual indicators for grabbable objects
        document.querySelectorAll('.grabbable').forEach(element => {
            element.addEventListener('mouseenter', () => {
                element.setAttribute('animation__grabbable-highlight', {
                    property: 'material.emissiveIntensity',
                    to: '0.2',
                    dur: 200
                });
            });
            
            element.addEventListener('mouseleave', () => {
                element.setAttribute('animation__grabbable-highlight', {
                    property: 'material.emissiveIntensity',
                    to: '0',
                    dur: 200
                });
            });
        });
    }
}

// Initialize VR Interactions
window.addEventListener('DOMContentLoaded', () => {
    window.vrInteractions = new VRInteractions();
});

console.log('🎮 VR Interactions Script Loaded');