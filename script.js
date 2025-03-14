// 📌 Three.js Szene erstellen
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById("container").appendChild(renderer.domElement);

// 📌 360°-Hintergrundbild laden
const textureLoader = new THREE.TextureLoader();
const inputImagePath = "web_app/data/input.png"; // Prüfe, ob der Pfad korrekt ist

textureLoader.load(inputImagePath, function (texture) {
    texture.mapping = THREE.EquirectangularReflectionMapping;
    texture.colorSpace = THREE.SRGBColorSpace;
    scene.background = texture;
}, undefined, function (error) {
    console.error("❌ Fehler beim Laden des Hintergrundbilds:", error);
});

// 📌 Lichtquelle für bessere Darstellung
const ambientLight = new THREE.AmbientLight(0xffffff, 1);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
directionalLight.position.set(1, 2, 3);
scene.add(directionalLight);

// 📌 GLTF-Loader für das Wärmepumpenmodell
const loader = new THREE.GLTFLoader();
let currentModel;
let modelPath = "assets/models/rendered_lg.glb";  // Standardmodell

function loadModel() {
    if (currentModel) {
        scene.remove(currentModel);
    }

    loader.load(modelPath, function (gltf) {
        currentModel = gltf.scene;
        currentModel.scale.set(0.8, 0.8, 0.8); // 📌 Modellgröße anpassen
        currentModel.position.set(0, -0.5, -2); // 📌 Standard-Position (wird später vom Marker gesetzt)
        scene.add(currentModel);
        console.log("✅ Modell geladen:", modelPath);
    }, undefined, function (error) {
        console.error("❌ Fehler beim Laden des Modells:", error);
    });
}

// 📌 Funktion zur Aktualisierung der Modellposition basierend auf `marker_data.json`
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
        .catch(error => console.error("⚠️ Fehler beim Laden der Marker-Daten:", error));
}

// 📌 Funktion zur Auswahl des Wärmepumpenmodells basierend auf `render_selection.json`
function updateModelSelection() {
    fetch("data/render_selection.json")
        .then(response => response.json())
        .then(data => {
            modelPath = data.selected_model === "lg" ? "assets/models/rendered_lg.glb" : "assets/models/rendered_buderus.glb";
            loadModel();
        })
        .catch(error => console.error("⚠️ Fehler beim Laden der Modell-Daten:", error));
}

// 📌 Button für Wärmepumpen-Wechsel
document.getElementById("switchModel").addEventListener("click", () => {
    updateModelSelection();
});

// 📌 Kamera-Steuerung mit OrbitControls
const controls = new THREE.OrbitControls(camera, renderer.domElement);
camera.position.set(0, 1, 3);
controls.enableDamping = true; // Sanfte Bewegung
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
