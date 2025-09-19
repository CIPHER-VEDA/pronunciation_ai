/**
 * Main application script
 * Initializes and coordinates all modules of the Pronunciation Assistant
 */

// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
  // Initialize components
  initializePronunciationTable();
  initializeSpeechRecognition();
  initializeDrillingSession();
  checkBrowserCompatibility();
});

/**
 * Initialize the pronunciation table
 */
function initializePronunciationTable() {
  createPronunciationTable('pronunciation-table-container');
}

/**
 * Initialize speech recognition functionality
 */
function initializeSpeechRecognition() {
  // Create speech recognition manager
  const recognitionManager = new SpeechRecognitionManager();
  
  // Store in window for access from other modules
  window.recognitionManager = recognitionManager;
  
  // Get UI elements
  const startButton = document.getElementById('start-speaking');
  const stopButton = document.getElementById('stop-speaking');
  const statusElement = document.getElementById('recognition-status');
  const transcriptionElement = document.getElementById('transcription');
  const errorElement = document.getElementById('error-message');
  
  // Set up event handlers for speech recognition
  recognitionManager.onStatusChange = (status) => {
    // Update status display
    switch(status) {
      case RECOGNITION_STATUS.READY:
        statusElement.textContent = 'Ready to start';
        statusElement.classList.remove('recording');
        startButton.disabled = false;
        stopButton.disabled = true;
        break;
      case RECOGNITION_STATUS.LISTENING:
        statusElement.textContent = 'Listening... (continuously active until you press Stop)';
        statusElement.classList.add('recording');
        startButton.disabled = true;
        stopButton.disabled = false;
        break;
      case RECOGNITION_STATUS.PROCESSING:
        statusElement.textContent = 'Processing...';
        statusElement.classList.remove('recording');
        startButton.disabled = true;
        stopButton.disabled = true;
        break;
      case RECOGNITION_STATUS.ERROR:
        statusElement.textContent = 'Error occurred';
        statusElement.classList.remove('recording');
        startButton.disabled = false;
        stopButton.disabled = true;
        break;
    }
  };
  
  // Handle transcript updates
  recognitionManager.onTranscriptUpdate = (transcript) => {
    // Clear the transcription element
    transcriptionElement.innerHTML = '';
    
    // Add each word with appropriate styling
    transcript.forEach(item => {
      const wordSpan = document.createElement('span');
      wordSpan.textContent = item.word + ' ';
      
      // Add CSS class based on word status
      switch(item.status) {
        case 'correct':
          wordSpan.className = 'word correct';
          break;
        case 'incorrect':
          wordSpan.className = 'word incorrect';
          break;
        case 'stutter':
          wordSpan.className = 'word stutter';
          break;
        case 'interim':
          wordSpan.className = 'word interim';
          break;
        default:
          wordSpan.className = 'word';
      }
      
      transcriptionElement.appendChild(wordSpan);
    });
    
    // Scroll to bottom
    transcriptionElement.scrollTop = transcriptionElement.scrollHeight;
  };
  
  // Handle recognition errors
  recognitionManager.onError = (errorMessage) => {
    errorElement.textContent = errorMessage;
    errorElement.style.display = 'block';
    
    // Hide after 5 seconds
    setTimeout(() => {
      errorElement.style.display = 'none';
    }, 5000);
  };
  
  // Handle recognition completion
  recognitionManager.onRecognitionComplete = (results) => {
    // Store results for drilling session
    window.lastAnalysisResults = results;
    
    // Show analysis results
    showAnalysisResults(results);
    
    // Generate video recommendations
    const recommendations = getVideoRecommendations(results.difficultList);
    renderVideoRecommendations('video-suggestions-container', recommendations);
    
    // Initialize drilling session with challenging words
    if (window.drillingSession && results.difficultList.length > 0) {
      window.drillingSession.initialize(results.difficultList, recognitionManager);
      document.getElementById('drilling-session').style.display = 'block';
    }
  };
  
  // Set up button handlers
  startButton.addEventListener('click', () => {
    errorElement.style.display = 'none';
    recognitionManager.start();
  });
  
  stopButton.addEventListener('click', () => {
    recognitionManager.stop();
  });
  
  // Initial status update
  recognitionManager.updateStatus(RECOGNITION_STATUS.READY);
}

/**
 * Initialize the drilling session functionality
 */
function initializeDrillingSession() {
  // Create simplified drilling session manager
  const drillingSession = new SimpleDrillingSession();
  
  // Store in window for access from other modules
  window.drillingSession = drillingSession;
  
  // Get UI elements
  const startButton = document.getElementById('start-drilling');
  const nextButton = document.getElementById('next-word');
  const finishButton = document.getElementById('finish-drilling');
  const recordButton = document.getElementById('record-pronunciation');
  const practicePlanContainer = document.getElementById('practice-plan-container');
  
  // Set up event handlers
  if (startButton) {
    startButton.addEventListener('click', () => {
      // Get challenging words from previous analysis or use sample words
      let difficultList = window.lastAnalysisResults?.difficultList;
      
      if (!difficultList || difficultList.length === 0) {
        console.log('No previous analysis results, generating random practice words');
        difficultList = getRandomPracticeWords(5);
      }
      
      console.log('Starting drilling session with words:', difficultList);
      
      if (difficultList && difficultList.length > 0) {
        drillingSession.initialize(difficultList);
        drillingSession.startSession();
      } else {
        alert('Unable to generate practice words. Please make sure the pronunciation data is loaded.');
      }
    });
  }
  
  if (nextButton) {
    nextButton.addEventListener('click', () => {
      drillingSession.nextWord();
    });
  }
  
  if (recordButton) {
    recordButton.addEventListener('click', () => {
      // Don't start listening if not in an active session
      if (!drillingSession.sessionActive) return;
      
      // Begin capturing speech for this word
      drillingSession.startListening();
    });
  }
  
  if (finishButton) {
    finishButton.addEventListener('click', () => {
      drillingSession.completeSession();
    });
  }
  
  // Handle session completion
  drillingSession.onSessionComplete = (results) => {
    // Show session results
    showSessionResults(results);
    
    // Show practice plan if available
    if (results.practicePlan && practicePlanContainer) {
      showPracticePlan(results.practicePlan, practicePlanContainer);
    }
  };
  
  // Add functionality to the example words in the pronunciation table
  initializePronunciationTableAudio();
}

/**
 * Show analysis results in the UI
 * @param {Object} results - Analysis results from speech recognition
 */
function showAnalysisResults(results) {
  const fluencyScoreElement = document.getElementById('fluency-score');
  const challengingWordsElement = document.getElementById('challenging-words-container');
  const analysisContainer = document.getElementById('analysis-results');
  
  if (!analysisContainer) return;
  
  // Show the analysis container
  analysisContainer.style.display = 'block';
  
  // Display fluency score
  if (fluencyScoreElement) {
    // Calculate score directly from results to ensure it's current
    const score = results.fluencyScore || window.recognitionManager.calculateFluencyScore();
    
    // Check if no speech was detected
    const noSpeechDetected = score === 0 || 
                            (results.transcript && results.transcript.length === 0);
    
    if (noSpeechDetected) {
      console.log('No speech detected, showing appropriate message');
      fluencyScoreElement.textContent = 'No speech recognized';
      fluencyScoreElement.className = 'fluency-score no-speech';
    } else {
      // Ensure we always have a valid number
      const displayScore = (typeof score === 'number' && !isNaN(score)) ? score : 0;
      
      console.log('Displaying fluency score:', displayScore);
      fluencyScoreElement.textContent = `Fluency Score: ${displayScore}%`;
      
      // Add color based on score
      fluencyScoreElement.className = 'fluency-score';
      if (displayScore >= 90) {
        fluencyScoreElement.classList.add('excellent');
      } else if (displayScore >= 70) {
        fluencyScoreElement.classList.add('good');
      } else if (displayScore >= 50) {
        fluencyScoreElement.classList.add('average');
      } else {
        fluencyScoreElement.classList.add('needs-improvement');
      }
    }
  }
  
  // Display challenging words
  if (challengingWordsElement) {
    challengingWordsElement.innerHTML = '';
    
    if (results.difficultList.length === 0) {
      challengingWordsElement.innerHTML = '<p>No challenging words detected. Great job!</p>';
    } else {
      // Add a header with instructions
      const header = document.createElement('p');
      header.className = 'challenging-words-header';
      header.textContent = 'Click on any word below to practice it:';
      challengingWordsElement.appendChild(header);
      
      // Create a container for the words
      const wordsContainer = document.createElement('div');
      wordsContainer.className = 'challenging-words-list';
      
      // Add each challenging word with click functionality
      results.difficultList.forEach(word => {
        const wordElement = document.createElement('div');
        wordElement.className = 'challenging-word';
        wordElement.textContent = word.word;
        wordElement.title = `${word.sound} - ${word.pronunciation}`;
        
        // Add click handler to practice this specific word
        wordElement.addEventListener('click', () => {
          if (window.drillingSession) {
            // Start a drilling session with just this word
            window.drillingSession.initialize([word], window.recognitionManager);
            document.getElementById('drilling-session').style.display = 'block';
            window.drillingSession.startSession();
            
            // Scroll to drilling section
            document.getElementById('drilling-session').scrollIntoView({ behavior: 'smooth' });
          }
        });
        
        wordsContainer.appendChild(wordElement);
      });
      
      challengingWordsElement.appendChild(wordsContainer);
      
      // Add a Practice All button
      const practiceAllButton = document.createElement('button');
      practiceAllButton.className = 'btn btn-primary practice-all-button';
      practiceAllButton.textContent = 'Practice All Challenging Words';
      practiceAllButton.addEventListener('click', () => {
        if (window.drillingSession) {
          window.drillingSession.initialize(results.difficultList, window.recognitionManager);
          document.getElementById('drilling-session').style.display = 'block';
          window.drillingSession.startSession();
          
          // Scroll to drilling section
          document.getElementById('drilling-session').scrollIntoView({ behavior: 'smooth' });
        }
      });
      
      challengingWordsElement.appendChild(practiceAllButton);
    }
  }
}

/**
 * Show session results in the UI
 * @param {Object} results - Results from drilling session
 */
function showSessionResults(results) {
  const resultsContainer = document.getElementById('session-results');
  
  if (!resultsContainer) return;
  
  resultsContainer.innerHTML = '';
  
  // Create results summary with animation
  const summary = document.createElement('div');
  summary.className = 'session-summary';
  
  // Calculate the success rate and determine the message
  const successRate = Math.round(results.successRate);
  let successMessage = '';
  let successClass = '';
  
  if (successRate >= 90) {
    successMessage = 'Excellent! Your pronunciation is very clear.';
    successClass = 'success-excellent';
  } else if (successRate >= 70) {
    successMessage = 'Great job! You\'re making good progress.';
    successClass = 'success-great';
  } else if (successRate >= 50) {
    successMessage = 'Good effort! Keep practicing to improve.';
    successClass = 'success-good';
  } else {
    successMessage = 'Don\'t give up! Regular practice will help you improve.';
    successClass = 'success-needs-practice';
  }
  
  summary.innerHTML = `
    <h3>Session Results</h3>
    <div class="results-score ${successClass}">
      <div class="results-score-value">${successRate}%</div>
      <div class="results-score-label">Success Rate</div>
    </div>
    <p class="results-message">${successMessage}</p>
    <div class="results-stats">
      <div class="results-stat">
        <div class="stat-value">${results.totalWords}</div>
        <div class="stat-label">Words Practiced</div>
      </div>
      <div class="results-stat">
        <div class="stat-value">${results.perfectWords}</div>
        <div class="stat-label">Perfect Pronunciations</div>
      </div>
    </div>
  `;
  
  resultsContainer.appendChild(summary);
  
  // Show details if there are results
  if (results.results.length > 0) {
    const details = document.createElement('div');
    details.className = 'session-details';
    details.innerHTML = '<h4>Word Performance</h4>';
    
    // Create a more visually appealing word performance list
    const wordTable = document.createElement('div');
    wordTable.className = 'word-performance-table';
    
    // Headers
    const tableHeader = document.createElement('div');
    tableHeader.className = 'word-performance-header';
    tableHeader.innerHTML = `
      <div class="performance-col word-col">Word</div>
      <div class="performance-col sound-col">Sound</div>
      <div class="performance-col attempts-col">Attempts</div>
      <div class="performance-col status-col">Status</div>
    `;
    wordTable.appendChild(tableHeader);
    
    // Sort results to show difficult words first
    const sortedResults = [...results.results].sort((a, b) => b.attemptsNeeded - a.attemptsNeeded);
    
    sortedResults.forEach(word => {
      const tableRow = document.createElement('div');
      tableRow.className = 'word-performance-row';
      
      // Determine status based on attempts
      let status = '';
      let statusClass = '';
      
      if (word.attemptsNeeded === 1) {
        status = 'Perfect';
        statusClass = 'status-perfect';
      } else if (word.attemptsNeeded === 2) {
        status = 'Good';
        statusClass = 'status-good';
      } else {
        status = 'Needs Practice';
        statusClass = 'status-needs-practice';
      }
      
      tableRow.innerHTML = `
        <div class="performance-col word-col">${word.word}</div>
        <div class="performance-col sound-col">${word.sound}</div>
        <div class="performance-col attempts-col">${word.attemptsNeeded}</div>
        <div class="performance-col status-col ${statusClass}">${status}</div>
      `;
      
      // Add click handler to practice this specific word again
      tableRow.addEventListener('click', () => {
        if (window.drillingSession) {
          // Find the full word data
          const wordData = {
            word: word.word,
            sound: word.sound,
            pronunciation: getPronunciationForSound(word.sound)
          };
          
          // Start a drilling session with just this word
          window.drillingSession.initialize([wordData], window.recognitionManager);
          document.getElementById('drilling-session').style.display = 'block';
          window.drillingSession.startSession();
          
          // Scroll to drilling section
          document.getElementById('drilling-session').scrollIntoView({ behavior: 'smooth' });
        }
      });
      
      wordTable.appendChild(tableRow);
    });
    
    details.appendChild(wordTable);
    
    // Add a tip for the user
    const tip = document.createElement('div');
    tip.className = 'session-tip';
    tip.innerHTML = `
      <i class="fas fa-lightbulb"></i>
      <span>Click on any word in the table above to practice it again.</span>
    `;
    details.appendChild(tip);
    
    resultsContainer.appendChild(details);
  }
}

/**
 * Show 5-day practice plan in the UI
 * @param {Object} plan - The practice plan to display
 * @param {HTMLElement} container - The container to render the plan in
 */
function showPracticePlan(plan, container) {
  container.innerHTML = '';
  
  // Create plan header
  const header = document.createElement('div');
  header.className = 'plan-header';
  header.innerHTML = `<h3>Your 5-Day Practice Plan</h3>
                      <p>Focus on these sounds and words over the next 5 days to improve your pronunciation.</p>`;
  container.appendChild(header);
  
  // Create schedule
  const schedule = document.createElement('div');
  schedule.className = 'practice-schedule';
  
  plan.schedule.forEach(day => {
    const dayElement = document.createElement('div');
    dayElement.className = 'practice-day';
    
    dayElement.innerHTML = `<h4>Day ${day.day}</h4>`;
    
    if (day.sounds.length === 0) {
      dayElement.innerHTML += '<p>No specific practice for today.</p>';
    } else {
      const soundsList = document.createElement('ul');
      
      day.sounds.forEach(sound => {
        const soundItem = document.createElement('li');
        soundItem.innerHTML = `
          <div class="sound-category">${sound.sound} - ${getPronunciationForSound(sound.sound)}</div>
          <div class="practice-words">
            ${sound.words.map(word => `<span class="practice-word-item">${word}</span>`).join('')}
          </div>
        `;
        soundsList.appendChild(soundItem);
      });
      
      dayElement.appendChild(soundsList);
    }
    
    schedule.appendChild(dayElement);
  });
  
  container.appendChild(schedule);
  
  // Show the container
  container.style.display = 'block';
}

/**
 * Get pronunciation description for a phonetic sound
 * @param {string} sound - The phonetic sound
 * @returns {string} The pronunciation description
 */
function getPronunciationForSound(sound) {
  const data = pronunciationData.find(item => item.sound === sound);
  return data ? data.pronunciation : '';
}

/**
 * Check browser compatibility for speech recognition
 */
function checkBrowserCompatibility() {
  const warningElement = document.getElementById('browser-warning');
  
  if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
    warningElement.style.display = 'block';
    warningElement.textContent = 'Speech recognition is not supported in your browser. Please use Chrome, Edge, or another supported browser for the best experience.';
  } else {
    warningElement.style.display = 'none';
  }
}

/**
 * Get a random selection of words to practice
 * @param {number} count - Number of words to select
 * @returns {Array} Selected words
 */
function getRandomPracticeWords(count = 10) {
  const allWords = getAllExampleWords();
  const selectedWords = [];
  
  // Shuffle array and take first 'count' elements
  const shuffled = allWords.sort(() => 0.5 - Math.random());
  for (let i = 0; i < Math.min(count, shuffled.length); i++) {
    const word = shuffled[i];
    // Find the sound category for this word
    const soundCategory = getSoundForWord(word);
    
    selectedWords.push({
      word: word,
      sound: soundCategory ? soundCategory.sound : '/unknown/',
      pronunciation: soundCategory ? soundCategory.pronunciation : 'Practice pronunciation',
      type: 'practice'
    });
  }
  
  return selectedWords;
}

/**
 * Initialize audio playback for words in the pronunciation table
 */
function initializePronunciationTableAudio() {
  // Check if text-to-speech is supported
  if (!window.textToSpeechManager || !window.textToSpeechManager.isSupported()) {
    console.warn('Text-to-speech not supported for pronunciation table');
    return;
  }
  
  // Add event listeners to all example words
  document.querySelectorAll('.pronunciation-table .example-word').forEach(wordElement => {
    wordElement.addEventListener('click', () => {
      const word = wordElement.textContent.trim();
      window.textToSpeechManager.speak(word);
    });
  });
  
  // Add event listeners to practice buttons
  document.querySelectorAll('.pronunciation-table .practice-sound-button').forEach(button => {
    button.addEventListener('click', () => {
      // Find the sound and example words
      const row = button.closest('tr');
      const exampleWords = row.querySelector('.example-words-list').querySelectorAll('.example-word');
      
      if (exampleWords.length > 0) {
        // Select a random example word
        const randomIndex = Math.floor(Math.random() * exampleWords.length);
        const word = exampleWords[randomIndex].textContent.trim();
        
        // Speak the word
        window.textToSpeechManager.speak(word);
      }
    });
  });
}
