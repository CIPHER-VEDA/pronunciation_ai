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