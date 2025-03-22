import * as THREE from 'https://unpkg.com/three@0.150.0/build/three.module.js';
import { GLTFLoader } from 'https://unpkg.com/three@0.150.0/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'https://unpkg.com/three@0.150.0/examples/jsm/controls/OrbitControls.js';

// 📌 Szene & Renderer erstellen
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById("container").appendChild(renderer.domElement);

// 📌 360°-Hintergrundbild laden
const textureLoader = new THREE.TextureLoader();
textureLoader.load(
    "./data/input.png",
    function (texture) {
        texture.mapping = THREE.EquirectangularReflectionMapping;
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.flipY = false;
        scene.background = texture;
        console.log("✅ 360°-Bild erfolgreich geladen");
    },
    undefined,
    function (error) {
        console.warn("⚠️ 360°-Bild konnte nicht geladen werden. Verwende Standardfarbe.", error);
        scene.background = new THREE.Color(0x888888);
    }
);

// 📌 Lichtquelle für bessere Darstellung
const ambientLight = new THREE.AmbientLight(0xffffff, 1);
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
directionalLight.position.set(1, 2, 3);
scene.add(directionalLight);

// 📌 GLTFLoader für Wärmepumpe
const loader = new GLTFLoader();
let currentModel;
let modelPath = "assets/models/rendered_lg.glb"; // Standardmodell

function loadModel() {
    if (currentModel) {
        scene.remove(currentModel);
    }
    loader.load(
        modelPath,
        function (gltf) {
            currentModel = gltf.scene;
            currentModel.scale.set(0.8, 0.8, 0.8);
            currentModel.position.set(0, -0.5, -2);
            scene.add(currentModel);
            console.log("✅ Modell geladen:", modelPath);
        },
        function (xhr) {
            console.log(`📥 Modell lädt: ${(xhr.loaded / xhr.total * 100).toFixed(2)}%`);
        },
        function (error) {
            console.error("❌ Fehler beim Laden des Modells:", error);
        }
    );
}

// 📌 Wärmepumpe-Position basierend auf Marker
function updateModelPosition() {
    fetch("data/marker_data.json")
        .then(response => response.json())
        .then(data => {
            if (data.marker_x && data.marker_y) {
                console.log("📍 Marker gefunden:", data);
                let xPos = (data.marker_x - 500) / 100;
                let zPos = -((data.marker_y - 300) / 100);
                if (currentModel) {
                    currentModel.position.set(xPos, -0.5, zPos);
                    console.log("📌 Modell neu positioniert:", xPos, zPos);
                }
            }
        })
        .catch(error => console.warn("⚠️ Fehler beim Laden der Marker-Daten:", error));
}

// 📌 Wärmepumpenmodell wechseln
function updateModelSelection() {
    fetch("data/render_selection.json")
        .then(response => response.json())
        .then(data => {
            modelPath = data.selected_model === "lg"
                ? "assets/models/rendered_lg.glb"
                : "assets/models/rendered_buderus.glb";
            loadModel();
        })
        .catch(error => console.warn("⚠️ Fehler beim Laden der Modell-Daten:", error));
}

// 📌 Button für Wärmepumpen-Wechsel
document.getElementById("switchModel").addEventListener("click", updateModelSelection);

// 📌 Kamera-Steuerung mit OrbitControls
const controls = new OrbitControls(camera, renderer.domElement);
camera.position.set(0, 1, 3);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.update();

// 📌 Animations-Loop
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

// 📌 Initialisierung
loadModel();
updateModelPosition();
animate();
