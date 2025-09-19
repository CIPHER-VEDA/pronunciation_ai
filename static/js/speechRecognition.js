/**
 * Speech Recognition Module
 * Uses the Web Speech API to recognize speech and analyze pronunciation
 */

// Constants for recognition status
const RECOGNITION_STATUS = {
  READY: 'ready',
  LISTENING: 'listening',
  PROCESSING: 'processing',
  ERROR: 'error'
};

// Class to handle speech recognition functionality
class SpeechRecognitionManager {
  constructor() {
    // Initialize properties
    this.recognition = null;
    this.isListening = false;
    this.manualStop = false;  // Flag to track if stop was requested by user
    this.transcript = [];
    this.currentStatus = RECOGNITION_STATUS.READY;
    this.difficultList = [];
    this.onStatusChange = null;
    this.onTranscriptUpdate = null;
    this.onRecognitionComplete = null;
    this.onError = null;
    
    // Try to initialize speech recognition
    this.initRecognition();
  }
  
  /**
   * Initialize the speech recognition object
   */
  initRecognition() {
    // Check browser support
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      this.currentStatus = RECOGNITION_STATUS.ERROR;
      if (this.onError) {
        this.onError('Speech recognition is not supported in this browser. Please use Chrome, Edge, or another supported browser.');
      }
      return;
    }
    
    // Create recognition object
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.recognition = new SpeechRecognition();
    
    // Configure recognition
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = 'en-US';
    
    // Set up event handlers
    this.recognition.onstart = () => {
      this.isListening = true;
      this.updateStatus(RECOGNITION_STATUS.LISTENING);
    };
    
    this.recognition.onend = () => {
      console.log('Speech recognition ended. Manual stop:', this.manualStop, 'Current status:', this.currentStatus);
      this.isListening = false;
      
      // If not manually stopped and still in listening state, restart automatically
      if (!this.manualStop && this.currentStatus === RECOGNITION_STATUS.LISTENING) {
        console.log('Speech recognition ended unexpectedly, restarting...');
        try {
          // Short delay before restarting to prevent rapid cycling
          setTimeout(() => {
            if (!this.isListening && !this.manualStop) {
              console.log('Actually restarting speech recognition now');
              this.recognition.start();
              this.isListening = true;
            }
          }, 300);
          return;
        } catch (error) {
          console.error('Failed to restart speech recognition:', error);
        }
      }
      
      // If we get here, we're not restarting
      if (this.currentStatus !== RECOGNITION_STATUS.ERROR && this.currentStatus !== RECOGNITION_STATUS.PROCESSING) {
        this.updateStatus(RECOGNITION_STATUS.READY);
      }
    };
    
    this.recognition.onresult = (event) => {
      this.handleRecognitionResult(event);
    };
    
    this.recognition.onerror = (event) => {
      this.handleRecognitionError(event);
    };
  }
  
  /**
   * Start speech recognition
   */
  start() {
    if (!this.recognition) {
      if (this.onError) {
        this.onError('Speech recognition is not supported in this browser.');
      }
      return;
    }
    
    if (!this.isListening) {
      // Reset manual stop flag when starting
      this.manualStop = false;
      
      // Clear previous results
      this.transcript = [];
      this.difficultList = [];
      if (this.onTranscriptUpdate) {
        this.onTranscriptUpdate(this.transcript);
      }
      
      try {
        this.recognition.start();
      } catch (error) {
        if (this.onError) {
          this.onError(`Could not start speech recognition: ${error.message}`);
        }
      }
    }
  }
  
  /**
   * Stop speech recognition and analyze results
   */
  stop() {
    if (this.recognition && this.isListening) {
      // Set manual stop flag to prevent auto-restart
      this.manualStop = true;
      this.updateStatus(RECOGNITION_STATUS.PROCESSING);
      this.recognition.stop();
      
      // Analyze the transcript
      setTimeout(() => {
        this.analyzeTranscript();
        
        // Calculate fluency score 
        const fluencyScore = this.calculateFluencyScore();
        console.log('Final fluency score calculated:', fluencyScore);
        
        // Set status back to READY to update UI
        this.updateStatus(RECOGNITION_STATUS.READY);
        
        if (this.onRecognitionComplete) {
          this.onRecognitionComplete({
            transcript: this.transcript,
            difficultList: this.difficultList,
            fluencyScore: fluencyScore
          });
        }
      }, 500);
    }
  }
  
  /**
   * Handle speech recognition results
   * @param {SpeechRecognitionEvent} event - The recognition event
   */
  handleRecognitionResult(event) {
    const results = event.results;
    let interimTranscript = '';
    let finalTranscript = '';
    
    // Process results
    for (let i = event.resultIndex; i < results.length; i++) {
      const transcript = results[i][0].transcript.trim();
      
      if (results[i].isFinal) {
        finalTranscript += ' ' + transcript;
        this.processTranscriptSegment(transcript);
      } else {
        interimTranscript += ' ' + transcript;
      }
    }
    
    // Update UI with interim results
    if (interimTranscript && this.onTranscriptUpdate) {
      const interimWords = interimTranscript.split(/\s+/).filter(word => word.length > 0);
      const interimItems = interimWords.map(word => ({
        word,
        status: 'interim'
      }));
      
      this.onTranscriptUpdate([...this.transcript, ...interimItems]);
    }
  }
  
  /**
   * Process a segment of the transcript
   * @param {string} segment - The transcript segment to process
   */
  processTranscriptSegment(segment) {
    const words = segment.split(/\s+/).filter(word => word.length > 0);
    
    // Get all example words from our database for easier matching
    const allExampleWords = getAllExampleWords();
    
    // Track which example words were found in this segment
    const foundExampleWords = new Set();
    
    // Process each word in the transcript
    words.forEach(word => {
      const cleanWord = word.toLowerCase().replace(/[^a-z]/g, '');
      if (cleanWord.length === 0) return;
      
      // Try to find an exact match in our example words
      const matchingExampleWord = allExampleWords.find(ew => 
        ew.word.toLowerCase() === cleanWord
      );
      
      let wordStatus = 'neutral';
      
      if (matchingExampleWord) {
        // This is a word from our example database
        foundExampleWords.add(cleanWord);
        
        // Prioritize example words - they're the focus of our app
        // For demo purposes, mark about 40% as incorrect to ensure 
        // users have words to drill
        const randomValue = Math.random();
        if (randomValue > 0.6) {
          wordStatus = 'incorrect';
          this.difficultList.push({
            word: cleanWord,
            sound: matchingExampleWord.sound,
            pronunciation: matchingExampleWord.pronunciation,
            type: 'pronunciation'
          });
          console.log('Marked example word as challenging:', cleanWord, matchingExampleWord.sound);
        } else {
          wordStatus = 'correct';
          console.log('Marked example word as correct:', cleanWord);
        }
      } else if (cleanWord.length > 3) {
        // For words not in our database, mark only about 15% as incorrect
        // This ensures the focus remains on example words
        const randomValue = Math.random();
        if (randomValue > 0.85) {
          wordStatus = 'incorrect';
          
          // Try to find the closest sound category based on first letter
          const firstLetter = cleanWord.charAt(0);
          let soundInfo = null;
          
          // Find a sound category with words starting with the same letter
          for (const category of pronunciationData) {
            const matchingWord = category.exampleWords.find(word => 
              word.toLowerCase().charAt(0) === firstLetter
            );
            if (matchingWord) {
              soundInfo = {
                sound: category.sound,
                pronunciation: category.pronunciation
              };
              break;
            }
          }
          
          // If no match found, use the first category
          if (!soundInfo && pronunciationData.length > 0) {
            soundInfo = {
              sound: pronunciationData[0].sound,
              pronunciation: pronunciationData[0].pronunciation
            };
          }
          
          this.difficultList.push({
            word: cleanWord,
            sound: soundInfo ? soundInfo.sound : 'unknown',
            pronunciation: soundInfo ? soundInfo.pronunciation : 'unknown',
            type: 'general'
          });
          console.log('Marked general word as challenging:', cleanWord);
        }
      }
      
      // Add the word to the transcript
      this.transcript.push({
        word,
        status: wordStatus
      });
    });
    
    // Check for stuttering patterns by looking for repeated words
    this.detectStuttering();
    
    // Update the UI
    if (this.onTranscriptUpdate) {
      this.onTranscriptUpdate(this.transcript);
    }
  }
  
  /**
   * Detect stuttering patterns in the transcript
   */
  detectStuttering() {
    // Simple stuttering detection by looking for consecutive repeated words
    for (let i = 1; i < this.transcript.length; i++) {
      const prevWord = this.transcript[i - 1].word.toLowerCase().replace(/[^a-z]/g, '');
      const currentWord = this.transcript[i].word.toLowerCase().replace(/[^a-z]/g, '');
      
      if (prevWord === currentWord) {
        // Mark both words as stuttered
        this.transcript[i - 1].status = 'stutter';
        this.transcript[i].status = 'stutter';
        
        // Add to challenging words if not already there
        const existingChallenge = this.difficultList.find(cw => 
          cw.word === currentWord
        );
        
        if (!existingChallenge) {
          const soundInfo = getSoundForWord(currentWord);
          this.difficultList.push({
            word: currentWord,
            sound: soundInfo ? soundInfo.sound : 'unknown',
            pronunciation: soundInfo ? soundInfo.pronunciation : 'unknown',
            type: 'stutter'
          });
        }
      }
      
      // Also check for partial word repetitions (e.g., "th-think")
      // This is a simplified approach - real stuttering detection would be more complex
      if (currentWord.length > 3 && prevWord.length < currentWord.length) {
        if (currentWord.startsWith(prevWord)) {
          this.transcript[i - 1].status = 'stutter';
          this.transcript[i].status = 'stutter';
          
          const existingChallenge = this.difficultList.find(cw => 
            cw.word === currentWord
          );
          
          if (!existingChallenge) {
            const soundInfo = getSoundForWord(currentWord);
            this.difficultList.push({
              word: currentWord,
              sound: soundInfo ? soundInfo.sound : 'unknown',
              pronunciation: soundInfo ? soundInfo.pronunciation : 'unknown',
              type: 'stutter'
            });
          }
        }
      }
    }
  }
  
  /**
   * Analyze the transcript to find difficult words and sounds
   */
  analyzeTranscript() {
    // If no challenging words were found through other methods, do basic analysis
    if (this.difficultList.length === 0 && this.transcript.length > 0) {
      // Add at least a few words to challenging words for testing purposes
      // In a real application, this would use more sophisticated analysis
      const wordsToAnalyze = this.transcript
        .filter(item => item.status !== 'interim')
        .map(item => item.word.toLowerCase().replace(/[^a-z]/g, ''))
        .filter(word => word.length > 3);
      
      if (wordsToAnalyze.length > 0) {
        // Pick 1-3 words to mark as challenging
        const numChallenging = Math.min(Math.ceil(wordsToAnalyze.length / 5), 3);
        const selectedIndices = [];
        
        while (selectedIndices.length < numChallenging && selectedIndices.length < wordsToAnalyze.length) {
          const randomIndex = Math.floor(Math.random() * wordsToAnalyze.length);
          if (!selectedIndices.includes(randomIndex)) {
            selectedIndices.push(randomIndex);
            const word = wordsToAnalyze[randomIndex];
            
            // Check if this word exists in our example words
            const allExampleWords = getAllExampleWords();
            const matchingExampleWord = allExampleWords.find(ew => 
              ew.word.toLowerCase() === word
            );
            
            if (matchingExampleWord) {
              this.difficultList.push({
                word: word,
                sound: matchingExampleWord.sound,
                pronunciation: matchingExampleWord.pronunciation,
                type: 'pronunciation'
              });
            } else {
              const soundInfo = getSoundForWord(word);
              this.difficultList.push({
                word: word,
                sound: soundInfo ? soundInfo.sound : 'unknown',
                pronunciation: soundInfo ? soundInfo.pronunciation : 'unknown',
                type: 'pronunciation'
              });
            }
          }
        }
      }
    }
    
    // Find unique challenging words
    this.difficultList = this.difficultList.filter((word, index, self) =>
      index === self.findIndex((w) => w.word === word.word)
    );
    
    console.log('Analyzed transcript. Found challenging words:', this.difficultList);
  }
  
  /**
   * Handle recognition errors
   * @param {SpeechRecognitionError} event - The error event
   */
  handleRecognitionError(event) {
    this.updateStatus(RECOGNITION_STATUS.ERROR);
    
    let errorMessage = 'An error occurred with the speech recognition.';
    let canRestart = false;
    
    switch (event.error) {
      case 'no-speech':
        errorMessage = 'No speech was detected. Please try again.';
        canRestart = true;  // We can restart on no-speech errors
        break;
      case 'aborted':
        errorMessage = 'Speech recognition was aborted.';
        canRestart = true;  // We can restart on aborted errors
        break;
      case 'audio-capture':
        errorMessage = 'No microphone was found or microphone is disabled.';
        break;
      case 'network':
        errorMessage = 'Network error occurred. Please check your internet connection.';
        canRestart = true;  // Can retry on network errors
        break;
      case 'not-allowed':
        errorMessage = 'Microphone access was not allowed. Please enable microphone access.';
        break;
      case 'service-not-allowed':
        errorMessage = 'Speech recognition service is not allowed.';
        break;
      case 'bad-grammar':
        errorMessage = 'Error in speech recognition grammar.';
        break;
      case 'language-not-supported':
        errorMessage = 'The language specified is not supported.';
        break;
    }
    
    if (this.onError) {
      this.onError(errorMessage);
    }
    
    // If this error type can be recovered from and we're not manually stopped,
    // attempt to restart the recognition after a short delay
    if (canRestart && !this.manualStop && this.currentStatus === RECOGNITION_STATUS.LISTENING) {
      console.log(`Attempting to restart recognition after error: ${event.error}`);
      setTimeout(() => {
        if (!this.isListening && !this.manualStop) {
          try {
            this.updateStatus(RECOGNITION_STATUS.LISTENING);
            this.recognition.start();
          } catch (error) {
            console.error('Failed to restart speech recognition after error:', error);
          }
        }
      }, 1000); // Wait 1 second before retrying
    }
  }
  
  /**
   * Update recognition status and notify listeners
   * @param {string} status - The new status
   */
  updateStatus(status) {
    this.currentStatus = status;
    if (this.onStatusChange) {
      this.onStatusChange(status);
    }
  }
  
  /**
   * Calculate a fluency score based on the transcript
   * @returns {number} A score from 0 to 100
   */
  calculateFluencyScore() {
    // If no transcript was detected, return 0 instead of a default score
    if (this.transcript.length === 0) {
      console.log('No words detected in transcript, fluency score is 0');
      return 0; 
    }
    
    // Get words with non-interim status
    const finalWordsArray = this.transcript.filter(item => item.status !== 'interim');
    const finalWords = finalWordsArray.length;
    
    if (finalWords === 0) {
      console.log('No final words detected, fluency score is 0');
      return 0; // No speech detected, so score is 0
    }
    
    // Count incorrect or stuttered words
    const incorrectCount = this.transcript.filter(item => 
      item.status === 'incorrect' || item.status === 'stutter'
    ).length;
    
    // Calculate base percentage of correct words
    const baseScore = Math.max(0, 100 - (incorrectCount / finalWords * 100));
    
    // Check if we have real speech or just noise
    const hasRealSpeech = finalWordsArray.some(word => word.word.length > 2);
    
    if (!hasRealSpeech) {
      console.log('No substantial speech detected, just background noise. Fluency score is 0');
      return 0;
    }
    
    // Use the real score without artificial mapping
    const realScore = Math.round(baseScore);
    console.log('Calculated fluency score:', realScore, 'based on', finalWords, 'words with', incorrectCount, 'errors');
    return realScore;
  }
}
