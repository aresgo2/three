from flask import Flask, request, jsonify, send_from_directory
import os
from config import RESULTS_FOLDER, INPUT_IMAGE, MARKER_DATA_JSON, RENDER_SELECTION_JSON
from src.detector import detect_marker
from src.processor import export_selected_render_image
from src.utils import save_json

app = Flask(__name__)

# 📌 Route für das Hochladen eines Bildes
@app.route("/upload", methods=["POST"])
def upload_image():
    if "image" not in request.files:
        return jsonify({"error": "Kein Bild hochgeladen"}), 400

    file = request.files["image"]
    file_path = INPUT_IMAGE
    file.save(file_path)

    return jsonify({"message": "Bild erfolgreich hochgeladen", "image_path": file_path}), 200

# 📌 Route zur Erkennung des Markers
@app.route("/detect_marker", methods=["POST"])
def detect_marker_api():
    marker_coords = detect_marker(INPUT_IMAGE)

    if not marker_coords:
        return jsonify({"error": "Kein Marker erkannt"}), 400

    marker_data = {
        "marker_x": marker_coords[0],
        "marker_y": marker_coords[1]
    }
    save_json(marker_data, MARKER_DATA_JSON)

    return jsonify({"message": "Marker erkannt", "marker_data": marker_data}), 200

# 📌 Route zur Auswahl des 3D-Modells (LG oder Buderus)
@app.route("/select_model", methods=["POST"])
def select_model():
    data = request.json
    selection = data.get("selection", "").lower()

    if selection not in ["lg", "buderus"]:
        return jsonify({"error": "Ungültige Auswahl"}), 400

    export_selected_render_image(selection, RENDER_SELECTION_JSON)
    return jsonify({"message": f"{selection.capitalize()} wurde gewählt"}), 200

# 📌 Route zur Bereitstellung von JSON-Daten für die Web-App
@app.route("/get_marker_data", methods=["GET"])
def get_marker_data():
    return send_from_directory(RESULTS_FOLDER, "marker_data.json")

@app.route("/get_render_selection", methods=["GET"])
def get_render_selection():
    return send_from_directory(RESULTS_FOLDER, "render_selection.json")

if __name__ == "__main__":
    app.run(debug=True)
