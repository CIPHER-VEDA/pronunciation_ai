/**
 * Simplified Drilling Session Module
 * Provides one-word-at-a-time practice with clear feedback
 */

class SimpleDrillingSession {
  constructor() {
    this.difficultList = [];
    this.currentWordIndex = 0;
    this.sessionActive = false;
    this.sessionResults = [];
  }

  /**
   * Initialize the drilling session
   */
  initialize(difficultList) {
    this.difficultList = [...difficultList];
    this.currentWordIndex = 0;
    this.sessionResults = [];
    this.sessionActive = false;
    console.log('Initialized drilling session with words:', this.difficultList);
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
    
    // Show the session container
    const sessionContainer = document.getElementById('drilling-session');
    if (sessionContainer) {
      sessionContainer.style.display = 'block';
    }
    
    // Hide the start button
    const startButton = document.getElementById('start-drilling');
    if (startButton) {
      startButton.style.display = 'none';
    }
    
    this.showCurrentWord();
  }

  /**
   * Show the current word practice interface
   */
  showCurrentWord() {
    if (this.currentWordIndex >= this.difficultList.length) {
      this.completeSession();
      return;
    }

    const currentWord = this.difficultList[this.currentWordIndex];
    const container = document.getElementById('practice-drill-container');
    
    if (!container) {
      console.error('Practice drill container not found');
      return;
    }

    container.innerHTML = `
      <div class="word-practice-interface">
        <div class="word-header">
          <h2 class="current-word">${currentWord.word}</h2>
          <p class="word-progress">Word ${this.currentWordIndex + 1} of ${this.difficultList.length}</p>
          <p class="phonetic-info">
            <strong>Sound:</strong> /${currentWord.sound}/ 
            <br><strong>How to say:</strong> ${currentWord.pronunciation}
          </p>
        </div>

        <div class="practice-steps">
          <!-- Step 1: Listen -->
          <div class="practice-step" id="listen-step">
            <h3><i class="fas fa-headphones"></i> Step 1: Listen to the Example</h3>
            <button class="btn btn-primary btn-lg" id="play-example">
              <i class="fas fa-volume-up"></i> Play Example
            </button>
          </div>

          <!-- Step 2: Speak (hidden initially) -->
          <div class="practice-step" id="speak-step" style="display: none;">
            <h3><i class="fas fa-microphone"></i> Step 2: Try pronouncing the word:</h3>
            <p class="instruction">Click the button below and clearly say: <strong>"${currentWord.word}"</strong></p>
            <button class="btn btn-success btn-lg" id="speak-word">
              <i class="fas fa-microphone"></i> Start Recording
            </button>
          </div>

          <!-- Step 3: Feedback (hidden initially) -->
          <div class="practice-step" id="feedback-step" style="display: none;">
            <h3><i class="fas fa-clipboard-check"></i> Step 3: Your Result</h3>
            <div id="feedback-content"></div>
          </div>
        </div>

        <div class="word-controls">
          <button class="btn btn-secondary" id="replay-audio" style="display: none;">
            <i class="fas fa-redo"></i> Replay Example
          </button>
          <button class="btn btn-warning" id="try-again" style="display: none;">
            <i class="fas fa-redo"></i> Try Again
          </button>
          <button class="btn btn-success" id="next-word" style="display: none;">
            <i class="fas fa-arrow-right"></i> Next Word
          </button>
          <button class="btn btn-info" id="finish-session" style="display: none;">
            <i class="fas fa-check"></i> Finish Session
          </button>
        </div>
      </div>
    `;

    this.attachEventListeners(currentWord);
  }

  /**
   * Attach event listeners for current word practice
   */
  attachEventListeners(currentWord) {
    const playBtn = document.getElementById('play-example');
    const speakBtn = document.getElementById('speak-word');
    const replayBtn = document.getElementById('replay-audio');
    const tryAgainBtn = document.getElementById('try-again');
    const nextBtn = document.getElementById('next-word');
    const finishBtn = document.getElementById('finish-session');

    // Play example audio
    if (playBtn) {
      playBtn.addEventListener('click', () => {
        this.playExampleAudio(currentWord.word, playBtn);
      });
    }

    // Speak word
    if (speakBtn) {
      speakBtn.addEventListener('click', () => {
        this.startListening(currentWord, speakBtn);
      });
    }

    // Replay audio
    if (replayBtn) {
      replayBtn.addEventListener('click', () => {
        this.playExampleAudio(currentWord.word, replayBtn);
      });
    }

    // Try again
    if (tryAgainBtn) {
      tryAgainBtn.addEventListener('click', () => {
        this.resetWordPractice();
      });
    }

    // Next word
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        this.nextWord();
      });
    }

    // Finish session
    if (finishBtn) {
      finishBtn.addEventListener('click', () => {
        this.completeSession();
      });
    }
  }

  /**
   * Play example audio for the current word
   */
  playExampleAudio(word, button) {
    button.disabled = true;
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Playing...';

    const onComplete = () => {
      button.disabled = false;
      button.innerHTML = '<i class="fas fa-volume-up"></i> Play Example';
      
      // Show the speak step
      const speakStep = document.getElementById('speak-step');
      const replayBtn = document.getElementById('replay-audio');
      if (speakStep) speakStep.style.display = 'block';
      if (replayBtn) replayBtn.style.display = 'inline-block';
    };

    if (window.textToSpeechManager && window.textToSpeechManager.isSupported()) {
      window.textToSpeechManager.speak(word, onComplete);
    } else {
      // Fallback if TTS not available
      setTimeout(onComplete, 1500);
    }
  }

  /**
   * Start listening for user pronunciation
   */
  startListening(currentWord, button) {
    button.disabled = true;
    button.innerHTML = '<i class="fas fa-microphone-alt pulse"></i> Listening...';

    // Check if Speech Recognition is available
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      this.showFeedback(false, 0, 'Speech recognition not supported in this browser', currentWord);
      button.disabled = false;
      button.innerHTML = '<i class="fas fa-microphone"></i> Start Recording';
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript.toLowerCase().trim();
      const targetWord = currentWord.word.toLowerCase();
      
      console.log('User said:', transcript, 'Target:', targetWord);
      
      // Calculate similarity
      const similarity = this.compareWordsRoughly(transcript, targetWord);
      const isCorrect = similarity >= 0.7 || transcript.includes(targetWord);
      
      this.showFeedback(isCorrect, similarity, transcript, currentWord);
      
      button.disabled = false;
      button.innerHTML = '<i class="fas fa-microphone"></i> Start Recording';
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      
      let errorMessage = 'Recognition failed. ';
      switch (event.error) {
        case 'no-speech':
          errorMessage = 'No speech detected. Please try speaking louder.';
          break;
        case 'not-allowed':
          errorMessage = 'Microphone access denied. Please allow microphone access and try again.';
          break;
        case 'network':
          errorMessage = 'Network error. Please check your internet connection.';
          break;
        default:
          errorMessage = 'Speech recognition failed. Please try again.';
      }
      
      this.showFeedback(false, 0, errorMessage, currentWord);
      
      button.disabled = false;
      button.innerHTML = '<i class="fas fa-microphone"></i> Start Recording';
    };

    recognition.onend = () => {
      if (button.innerHTML.includes('Listening')) {
        button.disabled = false;
        button.innerHTML = '<i class="fas fa-microphone"></i> Start Recording';
      }
    };

    try {
      recognition.start();
    } catch (error) {
      console.error('Failed to start recognition:', error);
      this.showFeedback(false, 0, 'Failed to start recording. Please try again.', currentWord);
      button.disabled = false;
      button.innerHTML = '<i class="fas fa-microphone"></i> Start Recording';
    }
  }

  /**
   * Show feedback for pronunciation attempt
   */
  showFeedback(isCorrect, similarity, transcript, currentWord) {
    const feedbackStep = document.getElementById('feedback-step');
    const feedbackContent = document.getElementById('feedback-content');
    const tryAgainBtn = document.getElementById('try-again');
    const nextBtn = document.getElementById('next-word');
    const finishBtn = document.getElementById('finish-session');

    if (!feedbackStep || !feedbackContent) return;

    feedbackStep.style.display = 'block';

    const accuracyPercentage = Math.round(similarity * 100);
    
    if (isCorrect) {
      feedbackContent.innerHTML = `
        <div class="feedback-success">
          <i class="fas fa-check-circle fa-3x text-success"></i>
          <h4 class="text-success">Excellent!</h4>
          <p>You pronounced "<strong>${currentWord.word}</strong>" correctly!</p>
          <p class="accuracy-score">Accuracy: ${accuracyPercentage}%</p>
          ${transcript && !transcript.includes('failed') ? `<p class="transcript">You said: "${transcript}"</p>` : ''}
        </div>
      `;
      
      // Record successful attempt
      this.sessionResults.push({
        word: currentWord.word,
        success: true,
        accuracy: similarity,
        attempts: 1
      });
      
      // Show next word or finish button
      if (this.currentWordIndex < this.difficultList.length - 1) {
        nextBtn.style.display = 'inline-block';
      } else {
        finishBtn.style.display = 'inline-block';
      }
      
    } else {
      feedbackContent.innerHTML = `
        <div class="feedback-error">
          <i class="fas fa-times-circle fa-3x text-warning"></i>
          <h4 class="text-warning">Keep Practicing!</h4>
          <p>Try to pronounce "<strong>${currentWord.word}</strong>" more clearly.</p>
          <p class="accuracy-score">Accuracy: ${accuracyPercentage}%</p>
          ${transcript && !transcript.includes('failed') && !transcript.includes('error') ? `<p class="transcript">You said: "${transcript}"</p>` : ''}
          <div class="pronunciation-tip">
            <p><strong>Tip:</strong> Listen to the example again and try to match the pronunciation exactly.</p>
            <p><strong>Focus on:</strong> ${currentWord.pronunciation}</p>
          </div>
        </div>
      `;
      
      // Show try again button
      tryAgainBtn.style.display = 'inline-block';
    }
  }

  /**
   * Reset word practice to try again
   */
  resetWordPractice() {
    const feedbackStep = document.getElementById('feedback-step');
    const tryAgainBtn = document.getElementById('try-again');
    const nextBtn = document.getElementById('next-word');
    const finishBtn = document.getElementById('finish-session');

    if (feedbackStep) feedbackStep.style.display = 'none';
    if (tryAgainBtn) tryAgainBtn.style.display = 'none';
    if (nextBtn) nextBtn.style.display = 'none';
    if (finishBtn) finishBtn.style.display = 'none';
  }

  /**
   * Move to next word
   */
  nextWord() {
    this.currentWordIndex++;
    this.showCurrentWord();
  }

  /**
   * Complete the session
   */
  completeSession() {
    this.sessionActive = false;
    
    // Calculate session statistics
    const totalWords = this.difficultList.length;
    const successfulWords = this.sessionResults.filter(r => r.success).length;
    const averageAccuracy = this.sessionResults.reduce((sum, r) => sum + r.accuracy, 0) / this.sessionResults.length;
    
    const container = document.getElementById('practice-drill-container');
    if (container) {
      container.innerHTML = `
        <div class="session-complete">
          <h2><i class="fas fa-trophy"></i> Session Complete!</h2>
          <div class="session-stats">
            <div class="stat-item">
              <h3>${successfulWords}/${totalWords}</h3>
              <p>Words Mastered</p>
            </div>
            <div class="stat-item">
              <h3>${Math.round((successfulWords/totalWords) * 100)}%</h3>
              <p>Success Rate</p>
            </div>
            <div class="stat-item">
              <h3>${Math.round(averageAccuracy * 100)}%</h3>
              <p>Average Accuracy</p>
            </div>
          </div>
          
          ${successfulWords < totalWords ? `
            <div class="practice-recommendation">
              <h4>Words to Keep Practicing:</h4>
              <ul class="words-to-practice">
                ${this.difficultList.map((word, index) => {
                  const result = this.sessionResults.find(r => r.word === word.word);
                  if (!result || !result.success) {
                    return `<li>${word.word} - Focus on: ${word.pronunciation}</li>`;
                  }
                  return '';
                }).join('')}
              </ul>
            </div>
          ` : '<div class="congratulations"><h4>🎉 Congratulations! You mastered all the words!</h4></div>'}
          
          <div class="session-actions">
            <button class="btn btn-primary" id="new-session">
              <i class="fas fa-redo"></i> Practice Again
            </button>
            <button class="btn btn-secondary" id="back-to-main">
              <i class="fas fa-home"></i> Back to Main
            </button>
          </div>
        </div>
      `;
      
      // Add event listeners for session actions
      const newSessionBtn = document.getElementById('new-session');
      const backBtn = document.getElementById('back-to-main');
      
      if (newSessionBtn) {
        newSessionBtn.addEventListener('click', () => {
          this.resetSession();
        });
      }
      
      if (backBtn) {
        backBtn.addEventListener('click', () => {
          window.location.reload();
        });
      }
    }
  }

  /**
   * Reset session for another round
   */
  resetSession() {
    this.currentWordIndex = 0;
    this.sessionResults = [];
    this.startSession();
  }

  /**
   * Calculate similarity between two strings
   */
  compareWordsRoughly(str1, str2) {
    if (str1 === str2) return 1.0;
    
    // Simple similarity calculation
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    // Check if the shorter string is contained in the longer one
    if (longer.includes(shorter)) {
      return 0.8;
    }
    
    // Levenshtein distance calculation
    const editDistance = this.levenshteinDistance(str1, str2);
    return (longer.length - editDistance) / longer.length;
  }

  /**
   * Calculate Levenshtein distance
   */
  levenshteinDistance(str1, str2) {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  }
}

// Export for use in other modules
window.SimpleDrillingSession = SimpleDrillingSession;