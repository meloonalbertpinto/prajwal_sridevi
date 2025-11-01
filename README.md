🤖 Project Title:
AI Emotion-Aware Robotic Face with Dynamic OLED Expressions and Touch Interaction

🧠 Project Overview:
This project combines AI-based emotion detection, human–robot interaction, and visual emotion expression using an ESP32 microcontroller and an OLED display.
The bot displays expressive eyes on an OLED screen that react to both human emotions detected by AI and user touch inputs via capacitive sensors.

The system creates a life-like robotic personality by blending facial AI, gesture input, and animated visual feedback.
⚙️ Hardware Components:
ESP32 Dev Kit V1
1.3-inch OLED Display (SH1106 / SSD1306)
(Library used: U8g2 for better graphics support)
TTP223 Touch Sensors (x2) – connected to GPIO 4 and GPIO 5
Power Supply (3.3V / USB)

💡Functional Description:
AI Emotion Integration:
The ESP32 receives emotional data (e.g., Angry, Neutral, Confused, Happy) from an AI module running on a computer or cloud service.
Communication can be serial-based or via MQTT.
Depending on the detected emotion:
Neutral → Calm eyes with slow left-right movement
Angry → Sharp, narrowed eyes with frowning mouth
Happy → Uplifted eyes with a smiling mouth
Confused → Blinking eyes or wavy mouth animation
No face detected → “Searching” animation with blinking or random motion

All emotion changes are printed on the Serial Monitor for debugging and visualization.

🫳 Touch Sensor Controls:
Two capacitive touch sensors connected to GPIO 4 and 5 control the robot’s mood manually:

Touch Pattern	Emotion Triggered	Description
Single tap	Neutral	Calm and steady expression
Double tap	Angry/Frustrated	Displays frowning eyes and downward mouth
Multiple (rubbing motion)	Happy/Relaxed	Displays smiling eyes and curved mouth

Every interaction is displayed in the Serial Monitor with clear logs like:

“Touch detected on GPIO 4 – Angry mode activated”
“Touch pattern: Rubbing – Switching to Happy mode”

👁️ OLED Display Features (U8g2 Library):
Eyes are displayed as rounded rectangles to simulate robotic eyes.
Eyes are positioned centered on the screen for symmetry.
Smooth eye animation mimics natural left–right movement.
Blink animation occurs periodically (every few seconds).
Mouth expressions (happy, sad, neutral, confused) are drawn using curved lines and arcs, made possible by U8g2’s extended graphics functions.
Every face transition is accompanied by a brief blink for realism.

🔄 Idle Behavior:
When the bot is idle (no face detection and no touch input):
The eyes move slowly left and right.
The bot occasionally blinks or tilts the eyes slightly.

Serial monitor displays:
“Idle Mode: No face detected – Random motion active”

🧩 Software Architecture:
Component	Function
ESP32	Controls OLED display, reads touch sensors, handles emotion updates
U8g2 Library	Handles graphical rendering with curves and arcs
AI Emotion Detection (Python / Edge Device)	Sends facial emotion data to ESP32
Serial Monitor / MQTT	Displays all real-time activity logs and events

📡 Communication Flow:
AI Camera / Emotion Model → Serial/MQTT → ESP32 → OLED Display
                                   ↑
                              Touch Sensors

🔍 Serial Monitor Output Example:
[AI] Face detected: Angry
[Display] Switching to Angry Expression
[Touch] GPIO 5 single tap → Neutral Mode
[Touch] Rubbing detected → Happy Mode
[AI] No face detected – entering Confused Blink Mode

🧠 Key Highlights:
Emotion-aware visual feedback
Multi-input control (AI + Touch sensors)
OLED-based facial animation with U8g2 library
Real-time serial monitoring of all actions
Modular and extensible design for further emotion addition

🧰 Libraries Used:
Wire.h
U8g2lib.h
Adafruit_GFX.h (optional if U8g2 fully replaces GFX)

🖥️ Next Extensions:
Integrate voice feedback (text-to-speech module)
Add sound expressions for emotions
Extend AI detection to include more emotions (fear, surprise, etc.)
Implement MQTT-based cloud monitoring of robot’s mood states
