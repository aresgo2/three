import cv2
import numpy as np
from src.utils import load_image

def detect_marker(image_path):
    """
    Erkennt den Marker im Bild und gibt die Koordinaten zurück.
    """
    image = load_image(image_path)
    if image is None:
        return None

    # Konvertiere Bild in HSV (für Farbfilterung)
    hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)

    # Definiere Orange als HSV-Farbwerte
    lower_orange = np.array([10, 100, 100])
    upper_orange = np.array([25, 255, 255])

    # Erstelle Maske für orange Bereiche
    mask = cv2.inRange(hsv, lower_orange, upper_orange)

    # Finde Konturen in der Maske
    contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    if contours:
        x, y, w, h = cv2.boundingRect(contours[0])  # Erste erkannte Form nehmen
        return (x + w // 2, y + h // 2)  # Mittelpunkt des Markers

    return None
