import flask
from flask import Flask, request, jsonify, send_from_directory
import base64
import cv2
import numpy as np
import tensorflow as tf
from tensorflow.keras.models import load_model
import random

# --- Flask App Setup ---
app = Flask(__name__, static_folder="../frontend", static_url_path="")

# --- Load Model and Classifier ---
try:
    # Load emotion detection model
    emotion_model = load_model("emotion_model_full.keras")
    
    # Load face detector
    face_detector = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")
except Exception as e:
    print(f"Error loading model or cascade classifier: {e}")
    print("Please make sure 'emotion_model_full.keras' is in the same directory.")
    exit()

# --- Dictionaries ---
emotion_dict = {
    0: "Angry", 1: "Disgusted", 2: "Fearful",
    3: "Happy", 4: "Neutral", 5: "Sad", 6: "Surprised"
}

song_suggestions = {
    "Happy": [
        {"title": "Happy", "artist": "Pharrell Williams", "file": "happy.mp3"},
        {"title": "Don't Stop Me Now", "artist": "Queen"},
    ],
    "Sad": [
        {"title": "Someone Like You", "artist": "Adele","file": "sad.mp3"},
        {"title": "Fix You", "artist": "Coldplay"}
    ],
    "Angry": [
        {"title": "Break Stuff", "artist": "Limp Bizkit","file": "angry.mp3"},
        {"title": "Killing in the Name", "artist": "Rage Against the Machine"},
    ],
    "Neutral": [
        {"title": "Weightless", "artist": "Marconi Union","file": "neutral.mp3"},
        {"title": "Here Comes The Sun", "artist": "The Beatles"}
    ],
    "Surprised": [
        {"title": "Bohemian Rhapsody", "artist": "Queen"},
        {"title": "Blinding Lights", "artist": "The Weeknd"}
    ],
    "Fearful": [
        {"title": "Thriller", "artist": "Michael Jackson"},
    ],
    "Disgusted": [
        {"title": "Creep", "artist": "Radiohead"},
    ]
}

# --- Routes ---

@app.route('/')
def index():
    """Serve the main HTML page."""
    return send_from_directory(app.static_folder, "index.html")

@app.route('/detect', methods=['POST'])
def detect_emotion():
    """Receive an image, detect emotion, and return a suggestion."""
    data = request.json
    if 'image' not in data:
        return jsonify({"error": "No image data"}), 400

    try:
        # Decode the base64 image
        header, encoded = data['image'].split(",", 1)
        nparr = np.frombuffer(base64.b64decode(encoded), np.uint8)
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    except Exception as e:
        print(f"Frame decode failed: {e}")
        return jsonify({"error": "Frame decode failed"}), 400

    label = "No Face"
    suggestion = None
    
    gray_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    faces = face_detector.detectMultiScale(gray_frame, scaleFactor=1.1, minNeighbors=5, minSize=(30, 30))

    if len(faces) > 0:
        # Get the first face
        (x, y, w, h) = faces[0]
        
        # Extract Region of Interest (ROI)
        roi_gray = gray_frame[y:y+h, x:x+w]
        cropped_img = cv2.resize(roi_gray, (48, 48))
        
        # Preprocess the image for the model
        cropped_img_expanded = np.expand_dims(np.expand_dims(cropped_img, -1), 0) / 255.0
        
        # Predict
        prediction = emotion_model.predict(cropped_img_expanded, verbose=0)[0]
        maxindex = int(np.argmax(prediction))
        label = emotion_dict[maxindex]
        
        # Get a random song suggestion
        if label in song_suggestions:
            suggestion = random.choice(song_suggestions[label])

    # Return the result as JSON
    return jsonify({
        "label": label,
        "suggestion": suggestion
    })

# --- Run the App ---
if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5000, debug=True)