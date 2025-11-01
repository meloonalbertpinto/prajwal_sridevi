// Get references to the HTML elements
const video = document.getElementById('webcam');
const canvas = document.getElementById('captureCanvas');
const context = canvas.getContext('2d');
const emotionLabel = document.getElementById('emotion-label');
const songSuggestion = document.getElementById('song-suggestion');

// --- NEW ---
// Create a single Audio object to play/pause music
let currentSong = new Audio();
let lastEmotion = null;
let userHasInteracted = false; // To handle browser autoplay rules

/**
 * Starts the webcam and sets up the detection loop.
 */
async function startWebcam() {
    try {
        // Request access to the webcam
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { width: 640, height: 480 } 
        });
        
        // Display the webcam feed in the <video> element
        video.srcObject = stream;
        
        // Set canvas dimensions
        video.addEventListener('loadedmetadata', () => {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;

            // Start sending frames to the server every 2 seconds
            // (Increased time to 2s to prevent songs from changing too rapidly)
            setInterval(detectEmotion, 2000); 
        });

    } catch (error) {
        console.error("Error accessing webcam:", error);
        emotionLabel.textContent = "Could not access webcam.";
    }
}

/**
 * Captures a frame, sends it to the server, and updates the UI.
 */
async function detectEmotion() {
    if (video.readyState < 3 || !userHasInteracted) {
        // Wait for video to be ready AND for the user to click
        if(!userHasInteracted) {
            emotionLabel.textContent = "Click anywhere to start detection.";
        }
        return;
    }

    // 1. Draw the current video frame onto the hidden canvas
    context.translate(canvas.width, 0);
    context.scale(-1, 1);
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    context.setTransform(1, 0, 0, 1, 0, 0); 

    // 2. Get the frame data as a base64 JPEG image
    const imageData = canvas.toDataURL('image/jpeg', 0.7);

    try {
        // 3. Send the image data to the Flask API
        const response = await fetch('/detect', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ image: imageData }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        // 4. Get the JSON response
        const data = await response.json();
        
        // 5. Update the UI and play music
        updateUI(data);

    } catch (error) {
        console.error("Error during detection:", error);
    }
}

/**
 * Updates the HTML elements and PLAYS the song.
 */
function updateUI(data) {
    // Update the emotion label
    emotionLabel.textContent = data.label;

    // Check if we have a new suggestion for a new emotion
    if (data.suggestion && data.label !== lastEmotion) {
        
        // 1. Update the suggestion text
        songSuggestion.innerHTML = 
            `How about: <span>${data.suggestion.title}</span> by <span>${data.suggestion.artist}</span>`;
        
        // 2. Stop the old song
        currentSong.pause();
        
        // 3. Set the new song's source
        // This builds the URL: e.g., "/songs/happy.mp3"
        currentSong.src = '/songs/' + data.suggestion.file;
        
        // 4. Play the new song
        currentSong.play().catch(e => console.warn("Autoplay was blocked:", e));

        // 5. Remember this emotion
        lastEmotion = data.label;

    } else if (data.label === "No Face" && lastEmotion !== "No Face") {
        // Clear suggestion and stop music if no face is found
        songSuggestion.innerHTML = "";
        currentSong.pause();
        lastEmotion = "No Face";
    }
}

// --- NEW: Handle Autoplay Rules ---
// Browsers block audio until the user interacts with the page (e.g., clicks).
document.body.addEventListener('click', () => {
    if (!userHasInteracted) {
        userHasInteracted = true;
        // Play a silent "test" sound to activate the audio context
        currentSong.play().then(() => {
            currentSong.pause(); // Stop it immediately
            console.log("Audio context is now active.");
            emotionLabel.textContent = "Detecting...";
        }).catch(() => {});
    }
}, { once: true }); // This event listener will only run once


// Start the whole process
startWebcam();