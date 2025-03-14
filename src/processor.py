import json
from config import RENDER_SELECTION_JSON

def export_selected_render_image(selection, output_json):
    """
    Speichert die gewählte Wärmepumpe als JSON-Datei.
    """
    data = {
        "selected_model": selection.lower(),
        "model_path": f"assets/models/rendered_{selection.lower()}.glb"
    }

    with open(output_json, "w") as f:
        json.dump(data, f, indent=4)

    print(f"✅ {selection} wurde als Modell gespeichert.")
