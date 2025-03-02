// 📌 Three.js Szene erstellen
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById("container").appendChild(renderer.domElement);

// 📌 360°-Hintergrundbild laden
const textureLoader = new THREE.TextureLoader();
textureLoader.load("data/input.png", function (texture) {
    texture.mapping = THREE.EquirectangularReflectionMapping;
    scene.background = texture;
});

// 📌 Licht hinzufügen
const light = new THREE.AmbientLight(0xffffff, 1);
scene.add(light);

// 📌 3D-Modell laden (GLTF)
let currentModel;
const loader = new THREE.GLTFLoader();
let modelPath = "assets/models/rendered_lg.glb";  // Standardmodell

function loadModel() {
    // Falls schon ein Modell existiert, entfernen
    if (currentModel) {
        scene.remove(currentModel);
    }

    loader.load(modelPath, function (gltf) {
        currentModel = gltf.scene;
        currentModel.position.set(0, 0, 0); // 📌 Startposition (wird später durch Marker ersetzt)
        currentModel.scale.set(1, 1, 1);
        scene.add(currentModel);
    });
}

// 📌 Modellplatzierung anhand von `marker_data.json`
fetch("data/marker_data.json")
    .then(response => response.json())
    .then(data => {
        if (data.marker_x && data.marker_y) {
            console.log("📍 Marker gefunden:", data);
            currentModel.position.set(data.marker_x / 100, 0, -data.marker_y / 100);
        }
    });

// 📌 Wärmepumpen-Modell wechseln
document.getElementById("switchModel").addEventListener("click", () => {
    fetch("data/render_selection.json")
        .then(response => response.json())
        .then(data => {
            modelPath = data.selected_model === "lg" ? "assets/models/rendered_lg.glb" : "assets/models/rendered_buderus.glb";
            loadModel();
        });
});

// 📌 Kamera-Steuerung
const controls = new THREE.OrbitControls(camera, renderer.domElement);
camera.position.set(0, 1, 3);
controls.update();

// 📌 Animations-Loop
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

loadModel();
animate();
