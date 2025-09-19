/**
 * Drilling Session Module
 * Provides functionality for personalized practice sessions
 */

class PronounceTrainer {
  constructor() {
    // Initialize properties
    this.difficultList = [];
    this.currentWordIndex = 0;
    this.attemptsPerWord = 3;
    this.currentAttempt = 0;
    this.sessionActive = false;
    this.sessionResults = [];
    this.onSessionComplete = null;
    this.onSessionProgress = null;
    this.recognitionManager = null;
    this.hasUserSpoken = false; // Flag to track if user has spoken during a word attempt
    
    // DOM elements
    this.sessionContainer = document.getElementById('drilling-session');
    this.wordDisplay = document.getElementById('practice-word');
    this.progressBar = document.getElementById('progress-bar');
    this.startButton = document.getElementById('start-drilling');
    this.nextButton = document.getElementById('next-word');
    this.finishButton = document.getElementById('finish-drilling');
  }
  
  /**
   * Initialize the drilling session
   * @param {Array} difficultList - Words that the user found difficult
   * @param {SpeechRecognitionManager} recognitionManager - Speech recognition manager
   */
  initialize(difficultList, recognitionManager) {
    this.difficultList = [...difficultList];
    this.recognitionManager = recognitionManager;
    this.currentWordIndex = 0;
    this.currentAttempt = 0;
    this.sessionResults = [];
    this.sessionActive = false;
    this.isListening = false;
    this.isPlayingAudio = false;
    
    // Set up speech recognition for verification
    if (this.recognitionManager) {
      // Save original callbacks
      this.originalStatusChange = this.recognitionManager.onStatusChange;
      this.originalTranscriptUpdate = this.recognitionManager.onTranscriptUpdate;
      this.originalRecognitionComplete = this.recognitionManager.onRecognitionComplete;
      this.originalError = this.recognitionManager.onError;
      
      // Set up our own speech recognition event handlers
      this.recognitionManager.onStatusChange = (status) => {
        console.log("Drilling session: Recognition status changed to", status);
        // Handle status changes during drilling session
        if (this.isListening) {
          if (status === RECOGNITION_STATUS.READY || status === RECOGNITION_STATUS.ERROR) {
            this.isListening = false;
            
            // Update UI to show we're not listening anymore
            const practiceArea = document.getElementById('practice-area');
            if (practiceArea) {
              practiceArea.classList.remove('listening');
            }
            
            // Update record button state
            this.updateUI();
          }
        }
        
        // Call original callback if it exists
        if (this.originalStatusChange) {
          this.originalStatusChange(status);
        }
      };
      
      this.recognitionManager.onTranscriptUpdate = (transcript) => {
        console.log("Drilling session: Got transcript update:", transcript);
        // Extract the text from transcript objects
        if (this.isListening && transcript && transcript.length > 0) {
          const fullText = transcript
            .filter(item => item.status !== 'interim')
            .map(item => item.word)
            .join(' ');
            
          if (fullText.trim()) {
            console.log("Drilling session: Processing transcript:", fullText);
            this.verifyPronunciation(fullText);
          }
        }
        
        // Call original callback if it exists
        if (this.originalTranscriptUpdate) {
          this.originalTranscriptUpdate(transcript);
        }
      };
      
      this.recognitionManager.onRecognitionComplete = (results) => {
        console.log("Drilling session: Recognition complete");
        // When recognition completes during drilling
        if (this.isListening) {
          this.isListening = false;
          
          // Get the full transcript
          const fullTranscript = results.transcript
            .filter(item => item.status !== 'interim')
            .map(item => item.word)
            .join(' ');
          
          // Verify pronunciation
          if (fullTranscript.trim()) {
            this.verifyPronunciation(fullTranscript);
          }
          
          // Update UI
          this.updateUI();
        }
        
        // Call original callback if it exists
        if (this.originalRecognitionComplete) {
          this.originalRecognitionComplete(results);
        }
      };
      
      this.recognitionManager.onError = (errorMessage) => {
        console.log("Drilling session: Recognition error:", errorMessage);
        // Handle errors during drilling
        this.isListening = false;
        
        // Show error to user
        const guidanceElement = document.getElementById('pronunciation-guidance');
        if (guidanceElement) {
          const notificationContainer = document.createElement('div');
          notificationContainer.className = 'pronunciation-notification error';
          notificationContainer.innerHTML = `
            <i class="fas fa-exclamation-circle"></i>
            <span>${errorMessage}</span>
          `;
          
          // Remove any existing notifications
          const existingNotification = guidanceElement.querySelector('#listening-notification');
          if (existingNotification) {
            guidanceElement.removeChild(existingNotification);
          }
          
          // Add the new notification
          guidanceElement.appendChild(notificationContainer);
          
          // Remove after 3 seconds
          setTimeout(() => {
            if (notificationContainer.parentNode === guidanceElement) {
              guidanceElement.removeChild(notificationContainer);
            }
          }, 3000);
        }
        
        // Update UI
        this.updateUI();
        
        // Call original callback if it exists
        if (this.originalError) {
          this.originalError(errorMessage);
        }
      };
    }
    
    // Update UI for initial state
    this.updateUI();
  }
  
  /**
   * Start the drilling session
   */
  startSession() {
    if (this.difficultList.length === 0) {
      alert('No challenging words to practice!');
      return;
    }
    
    this.sessionActive = true;
    this.currentWordIndex = 0;
    this.currentAttempt = 0;
    
    // Show the session container
    this.sessionContainer.style.display = 'block';
    
    // Start with the first word
    this.trainNextWord();
    
    // Update UI
    this.updateUI();
    
    // Save session start to localStorage
    this.saveSessionData();
  }
  
  /**
   * Practice the current word
   */
  trainNextWord() {
    if (this.currentWordIndex >= this.difficultList.length) {
      this.completeSession();
      return;
    }
    
    const currentWord = this.difficultList[this.currentWordIndex];
    
    // Update the word display
    this.wordDisplay.textContent = currentWord.word;
    
    // Create rich pronunciation guidance with the sound category and tips
    const guidanceElement = document.getElementById('pronunciation-guidance');
    if (guidanceElement) {
      // Find matching category for more tips
      const soundCategory = pronunciationData.find(item => item.sound === currentWord.sound);
      
      // Build guidance HTML with detailed instructions
      let guidanceHTML = `
        <div class="guidance-main">
          <div class="guidance-sound">${currentWord.sound}</div>
          <div class="guidance-pronunciation">${currentWord.pronunciation}</div>
          <div class="pronunciation-step-indicator">
            <div class="step active">
              <i class="fas fa-volume-up"></i>
              <span>Listen</span>
            </div>
            <div class="step-arrow">→</div>
            <div class="step">
              <i class="fas fa-microphone"></i>
              <span>Speak</span>
            </div>
          </div>
          <button class="play-pronunciation-btn" data-word="${currentWord.word}">
            <i class="fas fa-volume-up"></i> Listen to "${currentWord.word}"
          </button>
          <div class="pronunciation-instruction">
            <i class="fas fa-info-circle"></i> 
            <span>Start by hearing it, then say it back.</span>
          </div>
        </div>
      `;
      
      // Add example words from the same sound category for context
      if (soundCategory) {
        const otherExamples = soundCategory.exampleWords
          .filter(word => word.toLowerCase() !== currentWord.word.toLowerCase())
          .slice(0, 3);
          
        if (otherExamples.length > 0) {
          guidanceHTML += `
            <div class="guidance-examples">
              <span class="guidance-label">Other examples with the same sound:</span>
              <div class="guidance-examples-list">
                ${otherExamples.map(word => 
                  `<div class="guidance-example-container">
                    <span class="guidance-example">${word}</span>
                    <button class="play-example-btn" data-word="${word}">
                      <i class="fas fa-volume-up"></i>
                    </button>
                   </div>`
                ).join('')}
              </div>
            </div>
          `;
        }
        
        // Add tip for pronunciation if available
        guidanceHTML += `
          <div class="guidance-tip">
            <i class="fas fa-lightbulb"></i> 
            <span>When pronouncing this sound, focus on ${currentWord.pronunciation}</span>
          </div>
        `;
      }
      
      guidanceElement.innerHTML = guidanceHTML;
      
      // Automatically play the example audio right away
      const playBtn = guidanceElement.querySelector('.play-pronunciation-btn');
      if (playBtn) {
        // Set a timeout to ensure the button resets even if speech synthesis fails completely
        playBtn.classList.add('playing');
        playBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Playing...';
        this.isPlayingAudio = true;
        
        // Function to handle completion of audio (or fallback)
        const audioCompleteHandler = () => {
          // When audio finishes, update the button and step indicator
          playBtn.classList.remove('playing');
          playBtn.innerHTML = '<i class="fas fa-volume-up"></i> Listen Again';
          this.isPlayingAudio = false;
          
          // Update step indicator to show "Speak" as active
          const stepIndicator = guidanceElement.querySelector('.pronunciation-step-indicator');
          if (stepIndicator) {
            const steps = stepIndicator.querySelectorAll('.step');
            steps[0].classList.remove('active');
            steps[1].classList.add('active');
          }
          
          // Update UI to show the record button
          console.log('Audio playback completed, updating UI');
          this.updateUI();
        };
        
        // Set a backup timeout in case speech synthesis completely fails
        const backupTimeout = setTimeout(() => {
          if (playBtn.classList.contains('playing')) {
            console.warn('Backup timeout triggered for speech synthesis');
            audioCompleteHandler();
          }
        }, 5000); // Increased timeout to give more time for speech synthesis
        
        // Try to use text-to-speech
        if (window.textToSpeechManager && window.textToSpeechManager.isSupported()) {
          // Play the pronunciation and update UI after completion
          window.textToSpeechManager.speak(currentWord.word, () => {
            clearTimeout(backupTimeout); // Clear the backup timeout since speech completed
            audioCompleteHandler();
          });
        } else {
          // If speech synthesis is not supported, still update the UI after a delay
          setTimeout(() => {
            clearTimeout(backupTimeout);
            audioCompleteHandler();
          }, 1000);
        }
      }
      
      // Add click handlers for pronunciation buttons
      const soundPlayBtn = guidanceElement.querySelector('.play-pronunciation-btn');
      if (soundPlayBtn) {
        soundPlayBtn.addEventListener('click', () => {
          // Visual indication that audio is playing
          soundPlayBtn.classList.add('playing');
          soundPlayBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Playing...';
          
          // Set a backup timeout to reset the button if something fails
          const backupTimeout = setTimeout(() => {
            if (soundPlayBtn.classList.contains('playing')) {
              console.warn('Backup timeout triggered for manual speech play');
              soundPlayBtn.classList.remove('playing');
              soundPlayBtn.innerHTML = '<i class="fas fa-volume-up"></i> Listen Again';
            }
          }, 3000);
          
          if (window.textToSpeechManager && window.textToSpeechManager.isSupported()) {
            // Play the word and update UI after completion
            window.textToSpeechManager.speak(currentWord.word, () => {
              clearTimeout(backupTimeout);
              soundPlayBtn.classList.remove('playing');
              soundPlayBtn.innerHTML = '<i class="fas fa-volume-up"></i> Listen Again';
            });
          } else {
            // Reset button after a delay if speech synthesis isn't supported
            setTimeout(() => {
              clearTimeout(backupTimeout);
              soundPlayBtn.classList.remove('playing');
              soundPlayBtn.innerHTML = '<i class="fas fa-volume-up"></i> Listen Again';
            }, 1000);
          }
        });
      }
      
      // Add click handlers for example word buttons
      const playExampleBtns = guidanceElement.querySelectorAll('.play-example-btn');
      playExampleBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          const word = btn.getAttribute('data-word');
          
          // Visual indication that audio is playing
          const originalContent = btn.innerHTML;
          btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
          btn.disabled = true;
          
          // Set a backup timeout to ensure the button resets
          const backupTimeout = setTimeout(() => {
            if (btn.disabled) {
              console.warn('Backup timeout triggered for example word button');
              btn.innerHTML = originalContent;
              btn.disabled = false;
            }
          }, 3000);
          
          if (window.textToSpeechManager && window.textToSpeechManager.isSupported()) {
            // Play the example word and restore button after completion
            window.textToSpeechManager.speak(word, () => {
              clearTimeout(backupTimeout);
              btn.innerHTML = originalContent;
              btn.disabled = false;
            });
          } else {
            // If speech synthesis isn't supported, still reset the button
            setTimeout(() => {
              clearTimeout(backupTimeout);
              btn.innerHTML = originalContent;
              btn.disabled = false;
            }, 1000);
          }
        });
      });
    }
    
    // Update progress
    const progressPercentage = (this.currentWordIndex / this.difficultList.length) * 100;
    this.progressBar.style.width = `${progressPercentage}%`;
    
    // Update attempt counter
    const trialCounter = document.getElementById('attempt-counter');
    if (trialCounter) {
      trialCounter.textContent = `Attempt ${this.currentAttempt + 1} of ${this.attemptsPerWord}`;
    }
    
    // Notify listeners
    if (this.onSessionProgress) {
      this.onSessionProgress({
        currentWord: currentWord.word,
        wordIndex: this.currentWordIndex,
        totalWords: this.difficultList.length,
        attempt: this.currentAttempt + 1,
        totalAttempts: this.attemptsPerWord
      });
    }
    
    // Log for debugging
    console.log('Practicing word:', currentWord);
  }
  
  /**
   * Move to the next word in the session
   */
  nextWord() {
    // Record result for current word
    const currentWord = this.difficultList[this.currentWordIndex];
    
    // Check if user has actually spoken the word
    const hasSpoken = this.currentAttempt > 0;
    
    this.sessionResults.push({
      word: currentWord.word,
      sound: currentWord.sound,
      attemptsNeeded: hasSpoken ? this.currentAttempt + 1 : 3, // If not spoken, mark as difficult
      spoken: hasSpoken
    });
    
    // Move to next word
    this.currentWordIndex++;
    this.currentAttempt = 0;
    this.hasUserSpoken = false; // Reset the flag for the next word
    
    // Check if session is complete
    if (this.currentWordIndex >= this.difficultList.length) {
      this.completeSession();
    } else {
      this.trainNextWord();
    }
    
    // Update UI
    this.updateUI();
    
    // Save progress
    this.saveSessionData();
    
    // If user hasn't spoken at all, show a notification
    if (!hasSpoken) {
      const notificationContainer = document.createElement('div');
      notificationContainer.className = 'pronunciation-notification warning';
      notificationContainer.innerHTML = `
        <i class="fas fa-exclamation-triangle"></i>
        <span>Try saying the word aloud now...</span>
      `;
      
      // Add to the DOM
      const guidanceElement = document.getElementById('pronunciation-guidance');
      if (guidanceElement) {
        guidanceElement.appendChild(notificationContainer);
        
        // Remove after 3 seconds
        setTimeout(() => {
          if (notificationContainer.parentNode === guidanceElement) {
            guidanceElement.removeChild(notificationContainer);
          }
        }, 3000);
      }
    }
  }
  
  /**
   * Begin capturing speech for this word pronunciation
   */
  startListening() {
    if (!this.sessionActive || !this.recognitionManager) {
      console.error("Cannot start listening: session inactive or recognition manager missing");
      return;
    }
    
    // Reset the recognition state first
    if (this.recognitionManager.isListening) {
      this.recognitionManager.stop();
      
      // Short delay to ensure recognition has fully stopped
      setTimeout(() => {
        this.actuallyStartListening();
      }, 300);
    } else {
      this.actuallyStartListening();
    }
  }
  
  /**
   * Helper method to actually start the listening process once recognition is ready
   */
  actuallyStartListening() {
    // Mark that we're now listening for this word
    this.isListening = true;
    
    // Clear any previous transcript
    this.recognitionManager.transcript = [];
    this.recognitionManager.difficultList = [];
    
    // Update UI to show we're listening
    const practiceArea = document.getElementById('practice-area');
    if (practiceArea) {
      practiceArea.classList.add('listening');
    }
    
    // Update microphone button to show we're listening
    const recordButton = document.getElementById('record-pronunciation');
    if (recordButton) {
      recordButton.classList.add('recording');
      recordButton.innerHTML = '<i class="fas fa-microphone-alt pulse"></i> Listening...';
      recordButton.disabled = true;
    }
    
    // Start the speech recognition
    console.log("Drilling session: Starting speech recognition for word:", 
                this.difficultList[this.currentWordIndex].word);
    this.recognitionManager.start();
    
    // Show listening notification
    const guidanceElement = document.getElementById('pronunciation-guidance');
    if (guidanceElement) {
      const notificationContainer = document.createElement('div');
      notificationContainer.className = 'pronunciation-notification info';
      notificationContainer.id = 'listening-notification';
      notificationContainer.innerHTML = `
        <i class="fas fa-microphone"></i>
        <span>Listening... Try pronouncing the word "${this.difficultList[this.currentWordIndex].word}"</span>
      `;
      
      // Remove any existing notifications
      const existingNotification = guidanceElement.querySelector('#listening-notification');
      if (existingNotification) {
        guidanceElement.removeChild(existingNotification);
      }
      
      // Add the new notification
      guidanceElement.appendChild(notificationContainer);
      
      // Set up an auto-stop after 5 seconds to prevent getting stuck in listening mode
      setTimeout(() => {
        if (this.isListening) {
          console.log("Drilling session: Auto-stopping recognition after timeout");
          this.isListening = false;
          if (this.recognitionManager.isListening) {
            this.recognitionManager.stop();
          }
          
          // Update UI
          if (recordButton) {
            recordButton.classList.remove('recording');
            recordButton.innerHTML = '<i class="fas fa-microphone"></i> Speak Word';
            recordButton.disabled = false;
          }
          
          // Remove notification
          const currentNotification = guidanceElement.querySelector('#listening-notification');
          if (currentNotification) {
            guidanceElement.removeChild(currentNotification);
            
            // Add timeout notification
            const timeoutNotification = document.createElement('div');
            timeoutNotification.className = 'pronunciation-notification warning';
            timeoutNotification.innerHTML = `
              <i class="fas fa-exclamation-circle"></i>
              <span>No speech detected. Please try again.</span>
            `;
            guidanceElement.appendChild(timeoutNotification);
            
            // Remove after 3 seconds
            setTimeout(() => {
              if (timeoutNotification.parentNode === guidanceElement) {
                guidanceElement.removeChild(timeoutNotification);
              }
            }, 3000);
          }
        }
      }, 5000);
    }
  }
  
  /**
   * Verify the spoken word against the target word
   * @param {string} transcript - The speech recognition transcript
   */
  verifyPronunciation(transcript) {
    if (!this.sessionActive || !this.isListening || this.currentWordIndex >= this.difficultList.length) return;
    
    const currentWord = this.difficultList[this.currentWordIndex];
    const targetWord = currentWord.word.toLowerCase().trim();
    const transcriptLower = transcript.toLowerCase().trim();
    
    console.log('Verifying pronunciation:', { 
      target: targetWord, 
      spoken: transcriptLower, 
      contains: transcriptLower.includes(targetWord),
      similarity: this.compareWordsRoughly(targetWord, transcriptLower) 
    });
    
    // Mark that the user has spoken
    this.hasUserSpoken = true;
    
    // Check if the transcript contains the target word or is very similar
    const similarity = this.compareWordsRoughly(targetWord, transcriptLower);
    const isCorrect = transcriptLower.includes(targetWord) || similarity > 0.7; // Accept pronunciation if closeness score > 0.7
    
    // Show feedback to the user
    this.showPronunciationFeedback(isCorrect, similarity);
    
    // Record this attempt
    this.recordAttempt(isCorrect);
  }
  
  /**
   * Calculate string similarity between two strings
   * @param {string} str1 - First string
   * @param {string} str2 - Second string
   * @returns {number} - Similarity score between 0 and 1
   */
  compareWordsRoughly(str1, str2) {
    // If either string is empty, return 0
    if (!str1.length || !str2.length) return 0;
    
    // If strings are identical, return 1
    if (str1 === str2) return 1;
    
    // Check if str2 contains str1
    if (str2.includes(str1)) return 0.9;
    
    // Calculate Levenshtein distance
    const len1 = str1.length;
    const len2 = str2.length;
    const matrix = Array(len1 + 1).fill().map(() => Array(len2 + 1).fill(0));
    
    for (let i = 0; i <= len1; i++) {
      matrix[i][0] = i;
    }
    
    for (let j = 0; j <= len2; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= len1; i++) {
      for (let j = 1; j <= len2; j++) {
        const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,       // deletion
          matrix[i][j - 1] + 1,       // insertion
          matrix[i - 1][j - 1] + cost // substitution
        );
      }
    }
    
    // Calculate normalized similarity score (0-1)
    const maxLen = Math.max(len1, len2);
    return maxLen > 0 ? (1 - matrix[len1][len2] / maxLen) : 1;
  }
  
  /**
   * Show feedback about pronunciation accuracy
   * @param {boolean} isCorrect - Whether pronunciation was correct
   * @param {number} similarity - Similarity score (0-1)
   */
  showPronunciationFeedback(isCorrect, similarity) {
    // Remove existing feedback
    const guidanceElement = document.getElementById('pronunciation-guidance');
    if (!guidanceElement) return;
    
    // Remove any existing notifications
    const existingNotification = guidanceElement.querySelector('#listening-notification');
    if (existingNotification) {
      guidanceElement.removeChild(existingNotification);
    }
    
    // Create new feedback notification
    const notificationContainer = document.createElement('div');
    notificationContainer.id = 'pronunciation-feedback';
    
    if (isCorrect) {
      // Correct pronunciation
      notificationContainer.className = 'pronunciation-notification success';
      notificationContainer.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <span>Great pronunciation! ${similarity > 0.9 ? 'Perfect!' : 'Keep practicing to perfect it.'}</span>
      `;
    } else {
      // Calculate feedback based on similarity
      let feedbackMessage = '';
      if (similarity > 0.5) {
        feedbackMessage = "You're close! Try again focusing on the pronunciation.";
      } else if (similarity > 0.3) {
        feedbackMessage = "Getting there. Listen to the example again and try once more.";
      } else {
        feedbackMessage = "Let's try again. Click 'Listen' to hear the correct pronunciation.";
      }
      
      notificationContainer.className = 'pronunciation-notification warning';
      notificationContainer.innerHTML = `
        <i class="fas fa-exclamation-circle"></i>
        <span>${feedbackMessage}</span>
      `;
    }
    
    // Add to the DOM
    guidanceElement.appendChild(notificationContainer);
    
    // Remove after 3 seconds
    setTimeout(() => {
      if (notificationContainer.parentNode === guidanceElement) {
        guidanceElement.removeChild(notificationContainer);
      }
    }, 3000);
    
    // Update UI to show we're not listening anymore
    const practiceArea = document.getElementById('practice-area');
    if (practiceArea) {
      practiceArea.classList.remove('listening');
    }
  }
  
  /**
   * Record an attempt for the current word
   * @param {boolean} success - Whether the attempt was successful
   */
  recordAttempt(success) {
    if (!this.sessionActive) return;
    
    // Mark that the user has spoken during this word practice
    this.hasUserSpoken = true;
    
    if (success) {
      // Success - move to next word
      this.nextWord();
    } else {
      // Failure - increment attempt counter
      this.currentAttempt++;
      
      // Check if we've reached the maximum attempts
      if (this.currentAttempt >= this.attemptsPerWord) {
        this.nextWord();
      }
    }
  }
  
  /**
   * Complete the drilling session
   */
  completeSession() {
    this.sessionActive = false;
    
    // Calculate session results
    const totalWords = this.sessionResults.length;
    const perfectWords = this.sessionResults.filter(result => result.attemptsNeeded === 1).length;
    const successRate = totalWords > 0 ? (perfectWords / totalWords) * 100 : 0;
    
    // Generate practice plan for difficult words
    const difficultWords = this.sessionResults.filter(result => result.attemptsNeeded > 2);
    const practicePlan = this.generatePracticePlan(difficultWords);
    
    // Notify listeners
    if (this.onSessionComplete) {
      this.onSessionComplete({
        totalWords,
        perfectWords,
        successRate,
        results: this.sessionResults,
        practicePlan
      });
    }
    
    // Save session completion
    this.saveSessionData(true);
    
    // Update UI
    this.updateUI();
  }
  
  /**
   * Build custom retry plan for tough words

 for difficult words
   * @param {Array} difficultWords - Words that were difficult to pronounce
   * @returns {Object} A practice plan
   */
  generatePracticePlan(difficultWords) {
    if (difficultWords.length === 0) {
      return null;
    }
    
    // Group words by sound
    const wordsBySound = {};
    difficultWords.forEach(wordData => {
      if (!wordsBySound[wordData.sound]) {
        wordsBySound[wordData.sound] = [];
      }
      wordsBySound[wordData.sound].push(wordData.word);
    });
    
    // Create a 5-day plan
    const practicePlan = {
      days: 5,
      schedule: []
    };
    
    // Distribute words across days
    const sounds = Object.keys(wordsBySound);
    
    for (let day = 1; day <= 5; day++) {
      const dayPlan = {
        day,
        sounds: []
      };
      
      // Assign sounds to practice each day
      sounds.forEach((sound, index) => {
        if (index % 5 === (day - 1) % 5) {
          dayPlan.sounds.push({
            sound,
            words: wordsBySound[sound]
          });
        }
      });
      
      practicePlan.schedule.push(dayPlan);
    }
    
    return practicePlan;
  }
  
  /**
   * Update the drilling session UI
   */
  updateUI() {
    if (!this.sessionContainer) return;
    
    // Show/hide session container
    this.sessionContainer.style.display = this.sessionActive || this.currentWordIndex > 0 ? 'block' : 'none';
    
    // Update buttons
    if (this.startButton) {
      this.startButton.style.display = this.sessionActive ? 'none' : 'inline-block';
    }
    
    // Handle record pronunciation button
    const recordButton = document.getElementById('record-pronunciation');
    if (recordButton) {
      // Show the record button only if we're in an active session and not currently playing audio
      if (this.sessionActive && !this.isPlayingAudio) {
        console.log('Showing record button - sessionActive:', this.sessionActive, 'isPlayingAudio:', this.isPlayingAudio);
        recordButton.style.display = 'inline-block';
      } else if (!this.sessionActive) {
        console.log('Hiding record button - session not active');
        recordButton.style.display = 'none';
      } else {
        console.log('Record button state - sessionActive:', this.sessionActive, 'isPlayingAudio:', this.isPlayingAudio);
      }
      
      // Disable if we're currently listening
      recordButton.disabled = this.isListening;
      
      // Add animation class when listening
      if (this.isListening) {
        recordButton.classList.add('recording');
        recordButton.innerHTML = '<i class="fas fa-microphone-alt pulse"></i> Listening...';
      } else {
        recordButton.classList.remove('recording');
        recordButton.innerHTML = '<i class="fas fa-microphone"></i> Speak Word';
      }
    }
    
    if (this.nextButton) {
      this.nextButton.style.display = this.sessionActive ? 'inline-block' : 'none';
    }
    
    if (this.finishButton) {
      this.finishButton.style.display = this.sessionActive ? 'inline-block' : 'none';
      this.finishButton.disabled = this.currentWordIndex < this.difficultList.length;
    }
    
    // Add a CSS class to the session container based on the active state
    if (this.sessionActive) {
      this.sessionContainer.classList.add('active-session');
    } else {
      this.sessionContainer.classList.remove('active-session');
    }
    
    // Update progress bar
    if (this.progressBar) {
      const progressPercentage = this.difficultList.length > 0 
        ? (this.currentWordIndex / this.difficultList.length) * 100 
        : 0;
      this.progressBar.style.width = `${progressPercentage}%`;
    }
    
    // Update attempt counter
    const trialCounter = document.getElementById('attempt-counter');
    if (trialCounter) {
      trialCounter.textContent = this.sessionActive 
        ? `Attempt ${this.currentAttempt + 1} of ${this.attemptsPerWord}` 
        : '';
    }
    
    // Update practice area styling if we're listening
    const practiceArea = document.getElementById('practice-word');
    if (practiceArea) {
      if (this.isListening) {
        practiceArea.classList.add('listening');
      } else {
        practiceArea.classList.remove('listening');
      }
    }
  }
  
  /**
   * Save session data to localStorage
   * @param {boolean} completed - Whether the session is completed
   */
  saveSessionData(completed = false) {
    // Get existing data
    let sessionData = JSON.parse(localStorage.getItem('drillingSessionData') || '{}');
    
    // Update with current session
    sessionData.lastSession = {
      timestamp: new Date().toISOString(),
      difficultList: this.difficultList,
      currentWordIndex: this.currentWordIndex,
      results: this.sessionResults,
      completed: completed
    };
    
    // Save 5-day plan if session is completed
    if (completed && this.sessionResults.length > 0) {
      const difficultWords = this.sessionResults.filter(result => result.attemptsNeeded > 2);
      if (difficultWords.length > 0) {
        sessionData.practicePlan = this.generatePracticePlan(difficultWords);
        sessionData.practicePlan.startDate = new Date().toISOString();
      }
    }
    
    // Save to localStorage
    localStorage.setItem('Data', JSON.stringify(sessionData));
  }
  
  /**
   * Load previous session data from localStorage
   * @returns {Object|null} Previous session data or null
   */
  loadPreviousSessionData() {
    const sessionData = JSON.parse(localStorage.getItem('drillingSessionData') || '{}');
    return sessionData.lastSession || null;
  }
  
  /**
   * Get the current 5-day practice plan if one exists
   * @returns {Object|null} Practice plan or null
   */
  getCurrentPracticePlan() {
    const sessionData = JSON.parse(localStorage.getItem('drillingSessionData') || '{}');
    return sessionData.practicePlan || null;
  }
}
