import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// Separate variables for both distinct models
let model1 = null;
let model2 = null;

// 1. Create the Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xaaaaaa); 

// 2. Create the Camera (Fixed position since we aren't orbiting it anymore)
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 2, 7); 

// 3. Create the Renderer and add it to the HTML
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// 4. Add Lights (Strong Omni-directional Setup)
const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
scene.add(ambientLight);

const createDirectionalLight = (x, y, z, intensity) => {
    const light = new THREE.DirectionalLight(0xffffff, intensity);
    light.position.set(x, y, z);
    scene.add(light);
};

createDirectionalLight(0, 10, 0, 1.5);    // Top
createDirectionalLight(0, -10, 0, 1.0);   // Bottom
createDirectionalLight(0, 0, 10, 1.5);    // Front
createDirectionalLight(0, 0, -10, 1.5);   // Back
createDirectionalLight(10, 0, 0, 1.5);    // Right
createDirectionalLight(-10, 0, 0, 1.5);   // Left


// 5. Load the Models Independently
const loader = new GLTFLoader();

loader.load('static/iqos.glb', function (gltf) {
    model1 = gltf.scene;
    model1.position.x = -1.5; 
    scene.add(model1);
    console.log("Model 1 loaded successfully!");
}, undefined, function (error) {
    console.error("An error happened while loading Model 1:", error);
});

loader.load('static/iqos.glb', function (gltf) {
    model2 = gltf.scene;
    model2.position.x = 1.5; 
    scene.add(model2);
    console.log("Model 2 loaded successfully!");
}, undefined, function (error) {
    console.error("An error happened while loading Model 2:", error);
});


// --- NEW: Manual Object Rotation Variables & Logic ---
let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };

// Track when user clicks down on the canvas
window.addEventListener('mousedown', (e) => {
    isDragging = true;
    previousMousePosition = { x: e.clientX, y: e.clientY };
});

// Track mouse movement and apply rotation to both objects
window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;

    const deltaMove = {
        x: e.clientX - previousMousePosition.x,
        y: e.clientY - previousMousePosition.y
    };

    // Sensitivity factor to control drag speed
    const sensitivity = 0.007;

    // Rotate both models synchronously based on drag
    if (model1) {
        model1.rotation.y += deltaMove.x * sensitivity;
        model1.rotation.x += deltaMove.y * sensitivity;
    }
    if (model2) {
        model2.rotation.y += deltaMove.x * sensitivity;
        model2.rotation.x += deltaMove.y * sensitivity;
    }

    previousMousePosition = { x: e.clientX, y: e.clientY };
});

// Stop dragging
window.addEventListener('mouseup', () => {
    isDragging = false;
});

// Optional: Also handle basic mobile touch support
window.addEventListener('touchstart', (e) => {
    isDragging = true;
    previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
});

window.addEventListener('touchmove', (e) => {
    if (!isDragging) return;
    const deltaMove = {
        x: e.touches[0].clientX - previousMousePosition.x,
        y: e.touches[0].clientY - previousMousePosition.y
    };
    const sensitivity = 0.007;

    if (model1) {
        model1.rotation.y += deltaMove.x * sensitivity;
        model1.rotation.x += deltaMove.y * sensitivity;
    }
    if (model2) {
        model2.rotation.y += deltaMove.x * sensitivity;
        model2.rotation.x += deltaMove.y * sensitivity;
    }
    previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
});

window.addEventListener('touchend', () => {
    isDragging = false;
});
// -----------------------------------------------------


// --- Color Change Logic (Targeting Model 1 Only) ---
function changeModel1Color(hexColor) {
    if (!model1) {
        console.log("Model 1 hasn't loaded yet!");
        return;
    }

    model1.traverse((child) => {
        if (child.isMesh) {
            child.material.color.setHex(parseInt(hexColor));
        }
    });
}

const buttons = document.querySelectorAll('.color-btn');
buttons.forEach(button => {
    button.addEventListener('click', (event) => {
        const hexColor = event.target.getAttribute('data-color');
        changeModel1Color(hexColor);
    });
});


// 6. The Animation/Render Loop
function animate() {
    requestAnimationFrame(animate);

    // Continuous slow auto-rotation on the Y axis (only when the user isn't actively dragging)
    if (!isDragging) {
        const autoRotationSpeed = 0.0025; 
        if (model1) model1.rotation.y += autoRotationSpeed;
        if (model2) model2.rotation.y += autoRotationSpeed;
    }

    renderer.render(scene, camera);
}

animate();

// 7. Handle window resizing smoothly
window.addEventListener('resize', onWindowResize, false);
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}
