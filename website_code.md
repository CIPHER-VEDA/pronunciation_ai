# Pronunciation Assistant - Complete Website Code

This document contains the complete codebase for the Pronunciation Assistant web application, organized by file type.

## Backend Code

### main.py
```python
from app import app

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
```

### app.py
```python
import os
import logging
from flask import Flask, render_template

# Configure logging
logging.basicConfig(level=logging.DEBUG)

# Create the Flask application
app = Flask(__name__)
app.secret_key = os.environ.get("SESSION_SECRET", "default-secret-key-for-development")

@app.route('/')
def index():
    """Render the main application page."""
    return render_template('index.html')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
```

## Front-end Code

### templates/index.html
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pronunciation Assistant</title>
    
    <!-- Bootstrap CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">
    
    <!-- Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&family=Dancing+Script:wght@600&display=swap" rel="stylesheet">
    
    <!-- Font Awesome for Icons -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
    
    <!-- Custom CSS -->
    <link rel="stylesheet" href="{{ url_for('static', filename='css/style.css') }}">
</head>
<body>
    <div class="container">
        <!-- Header Section -->
        <header>
            <h1 class="app-title">Pronunciation Assistant</h1>
            <p class="app-description">AI-powered fluency checker to help improve your pronunciation</p>
        </header>
        
        <!-- Browser Warning Message -->
        <div id="browser-warning" class="browser-warning" style="display: none;"></div>
        
        <!-- Error Message Container -->
        <div id="error-message" class="error-message" style="display: none;"></div>
        
        <!-- Speech Recognition Section -->
        <section class="card">
            <h2 class="card-header">Speech Recognition</h2>
            <div class="recognition-container">
                <div id="recognition-status" class="recognition-status">Ready to start</div>
                <div class="recognition-buttons">
                    <button id="start-speaking" class="btn btn-primary">
                        <i class="fas fa-microphone"></i> Start Speaking
                    </button>
                    <button id="stop-speaking" class="btn btn-danger" disabled>
                        <i class="fas fa-stop"></i> Stop Speaking
                    </button>
                </div>
                <div id="transcription" class="transcription"></div>
            </div>
        </section>
        
        <!-- Analysis Results Section -->
        <section id="analysis-results" class="card" style="display: none;">
            <h2 class="card-header">Analysis Results</h2>
            <div id="fluency-score" class="fluency-score">Fluency Score: 0%</div>
            <h3>Challenging Words</h3>
            <div id="challenging-words-container" class="challenging-words">
                <!-- Challenging words will be inserted here -->
            </div>
        </section>
        
        <!-- Pronunciation Table Section -->
        <section class="card">
            <h2 class="card-header">Pronunciation Guide</h2>
            <div id="pronunciation-table-container">
                <!-- Table will be inserted here by JavaScript -->
            </div>
        </section>
        
        <!-- Drilling Session Section -->
        <section id="drilling-session" class="card" style="display: none;">
            <h2 class="card-header">Pronunciation Drilling Session</h2>
            <div class="drilling-container">
                <div class="practice-word-container">
                    <div id="practice-word" class="practice-word">Word</div>
                    <div id="pronunciation-guidance" class="pronunciation-guidance"></div>
                </div>
                <div class="session-progress-container">
                    <div class="session-progress">
                        <div id="progress-bar" class="progress-bar"></div>
                    </div>
                    <div id="attempt-counter" class="attempt-counter"></div>
                </div>
                <div class="drilling-buttons">
                    <button id="start-drilling" class="btn btn-primary">
                        <i class="fas fa-play"></i> Start Drilling
                    </button>
                    <button id="record-pronunciation" class="btn btn-primary" style="display: none;">
                        <i class="fas fa-microphone"></i> Speak Word
                    </button>
                    <button id="next-word" class="btn btn-success" style="display: none;">
                        <i class="fas fa-forward"></i> Next Word
                    </button>
                    <button id="finish-drilling" class="btn btn-danger" style="display: none;">
                        <i class="fas fa-check-circle"></i> Finish Session
                    </button>
                </div>
                <div id="session-results" class="session-results"></div>
                <div id="practice-plan-container" class="practice-plan" style="display: none;"></div>
            </div>
        </section>
        
        <!-- Reference Videos Section -->
        <section class="card">
            <h2 class="card-header">Reference Videos</h2>
            <div id="video-suggestions-container" class="video-suggestions">
                <p>Complete a speaking exercise to get personalized reference videos from YouTube.</p>
            </div>
        </section>
        
        <!-- Footer Section -->
        <footer class="footer">
            <div class="credits">
                IDEA BY: SURYA GOWD.R<br>
                DESIGNED & DEVELOPED BY: VEDA NARASIMHA SAI .D<br>
                GUIDED BY: DR. NEELIMA ADAPA
            </div>
        </footer>
    </div>
    
    <!-- JavaScript Libraries -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js"></script>
    
    <!-- Custom JavaScript -->
    <script src="{{ url_for('static', filename='js/pronunciationData.js') }}"></script>
    <script src="{{ url_for('static', filename='js/textToSpeech.js') }}"></script>
    <script src="{{ url_for('static', filename='js/speechRecognition.js') }}"></script>
    <script src="{{ url_for('static', filename='js/drillingSession.js') }}"></script>
    <script src="{{ url_for('static', filename='js/videoSuggestions.js') }}"></script>
    <script src="{{ url_for('static', filename='js/script.js') }}"></script>
</body>
</html>
```

## JavaScript Modules

### static/js/textToSpeech.js
```javascript
/**
 * Text-to-Speech Module
 * Uses the Web Speech API to provide text-to-speech functionality
 */

class TextToSpeechManager {
  constructor() {
    // Check if speech synthesis is supported
    this.supported = 'speechSynthesis' in window;
    
    // Initialize synthesis object if supported
    if (this.supported) {
      this.synth = window.speechSynthesis;
      this.voices = [];
      this.defaultVoice = null;
      
      // Load voices when available
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = this.loadVoices.bind(this);
      }
      
      // Initial load of voices
      this.loadVoices();
    }
  }
  
  /**
   * Load available voices and set default voice
   */
  loadVoices() {
    // Get all available voices
    this.voices = this.synth.getVoices();
    
    if (this.voices.length > 0) {
      // Try to find a good English voice
      // Preference: 1) English US female, 2) English female, 3) Any English, 4) First available
      
      // Look for English US female voice
      this.defaultVoice = this.voices.find(voice => 
        voice.lang.includes('en-US') && voice.name.includes('Female')
      );
      
      // If not found, try any English female voice
      if (!this.defaultVoice) {
        this.defaultVoice = this.voices.find(voice => 
          voice.lang.includes('en') && voice.name.includes('Female')
        );
      }
      
      // If still not found, try any English voice
      if (!this.defaultVoice) {
        this.defaultVoice = this.voices.find(voice => 
          voice.lang.includes('en')
        );
      }
      
      // Last resort: use the first available voice
      if (!this.defaultVoice && this.voices.length > 0) {
        this.defaultVoice = this.voices[0];
      }
      
      console.log('Text-to-speech initialized with voice:', this.defaultVoice?.name);
    }
  }
  
  /**
   * Speak the provided text
   * @param {string} text - The text to speak
   * @param {Function} onEnd - Callback function when speech ends
   * @param {string} voiceName - Specific voice name to use (optional)
   */
  speak(text, onEnd = null, voiceName = null) {
    if (!this.supported || !this.synth) {
      console.warn('Speech synthesis not supported');
      // Call the callback even if speech synthesis is not supported
      if (onEnd && typeof onEnd === 'function') {
        setTimeout(onEnd, 500);
      }
      return;
    }
    
    // Cancel any ongoing speech
    this.stop();
    
    // Create a new utterance
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Set voice
    if (voiceName && this.voices.length > 0) {
      const requestedVoice = this.voices.find(voice => voice.name === voiceName);
      utterance.voice = requestedVoice || this.defaultVoice;
    } else {
      utterance.voice = this.defaultVoice;
    }
    
    // Configure utterance
    utterance.pitch = 1;
    utterance.rate = 0.9; // Slightly slower for better pronunciation clarity
    utterance.volume = 1;
    
    // Set up end callback if provided
    if (onEnd && typeof onEnd === 'function') {
      // Setup both onend and onerror to ensure callback is triggered
      utterance.onend = () => {
        console.log('Speech completed for:', text);
        onEnd();
      };
      
      utterance.onerror = (event) => {
        console.warn('Speech synthesis error:', event);
        onEnd();
      };
      
      // Fallback timeout in case the callback is never triggered
      setTimeout(() => {
        // Check if synthesis is still speaking this utterance
        if (this.synth.speaking) {
          console.warn('Speech timeout for:', text);
          this.stop();
          onEnd();
        }
      }, 5000); // 5 second timeout
    }
    
    // Log the speech for debugging
    console.log('Speaking:', text, 'using voice:', utterance.voice?.name);
    
    // Start speaking
    this.synth.speak(utterance);
    
    // For very short texts, sometimes the onend event doesn't fire
    // Add a manual timeout for short texts
    if (text.length < 5 && onEnd && typeof onEnd === 'function') {
      setTimeout(() => {
        if (!this.synth.speaking) {
          console.log('Short text speech completed via timeout:', text);
          onEnd();
        }
      }, 1000);
    }
  }
  
  /**
   * Stop current speech
   */
  stop() {
    if (this.supported && this.synth) {
      this.synth.cancel();
    }
  }
  
  /**
   * Check if the browser supports speech synthesis
   * @returns {boolean} Whether speech synthesis is supported
   */
  isSupported() {
    return this.supported;
  }
  
  /**
   * Get available voices
   * @returns {Array} List of available voices
   */
  getVoices() {
    return this.voices;
  }
}

// Create a global instance of the Text to Speech Manager
window.textToSpeechManager = new TextToSpeechManager();
```