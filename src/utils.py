import cv2
import json
import os

def load_image(image_path):
    """
    Lädt ein Bild und gibt es als OpenCV-Array zurück.
    """
    if not os.path.exists(image_path):
        print(f"❌ Bild nicht gefunden: {image_path}")
        return None
    return cv2.imread(image_path, cv2.IMREAD_UNCHANGED)

def save_json(data, output_path):
    """
    Speichert JSON-Daten in eine Datei.
    """
    with open(output_path, "w") as json_file:
        json.dump(data, json_file, indent=4)  # ❌ Hier war der Fehler (jetzt korrekt!)
    print(f"✅ JSON gespeichert: {output_path}")
