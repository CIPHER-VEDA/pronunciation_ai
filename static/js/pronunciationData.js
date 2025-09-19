/**
 * Pronunciation data module
 * Contains the dataset of phonetic sounds, their pronunciations, and example words
 */
const pronunciationData = [
  {
    sound: "/θ/",
    pronunciation: "th as in thin",
    exampleWords: ["theater", "theme", "thick", "thief", "think", "thirst", "thirty", "thermal", "thorn", "thought", "three", "thrill", "thumb", "thunder", "thanks"]
  },
  {
    sound: "/ð/",
    pronunciation: "th as in this",
    exampleWords: ["another", "brother", "father", "gather", "leather", "mother", "other", "rather", "that", "there", "these", "they", "those", "together", "weather"]
  },
  {
    sound: "/r/",
    pronunciation: "r as in run",
    exampleWords: ["rabbit", "race", "rain", "rat", "red", "ribbon", "rid", "rip", "ripe", "river", "road", "roar", "roast", "rock", "round", "ruler"]
  },
  {
    sound: "/l/",
    pronunciation: "l as in light",
    exampleWords: ["love", "list", "leaf", "lake", "lemon", "lamp", "laugh", "like", "life", "long", "land", "loss", "late", "left", "load"]
  },
  {
    sound: "/ʒ/",
    pronunciation: "zh as in measure",
    exampleWords: ["pleasure", "treasure", "vision", "leisure", "genre", "fusion", "erosion", "measure", "closure", "exposure", "composure", "seizure", "occasion", "delusion"]
  },
  {
    sound: "/ʃ/",
    pronunciation: "sh as in she",
    exampleWords: ["ship", "shine", "sugar", "shoe", "shout", "short", "shelter", "share", "shore", "shame", "shy", "shift", "shape", "shoot", "shower"]
  },
  {
    sound: "/ŋ/",
    pronunciation: "ng as in sing",
    exampleWords: ["banging", "belonging", "bring", "hanging", "king", "longing", "ring", "sing", "song", "spring", "string", "strong", "swing", "thing"]
  },
  {
    sound: "/æ/",
    pronunciation: "short a as in cat",
    exampleWords: ["bat", "cat", "clap", "fat", "flat", "hat", "lap", "mat", "pat", "rat", "sat", "slap", "spat", "that", "trap"]
  },
  {
    sound: "/ʊ/",
    pronunciation: "short u as in book",
    exampleWords: ["book", "brook", "cook", "could", "foot", "hook", "look", "nook", "put", "should", "shook", "soot", "took", "wood", "would"]
  },
  {
    sound: "/ə/",
    pronunciation: "uh as in sofa",
    exampleWords: ["about", "agenda", "banana", "cabin", "camera", "circus", "comma", "focus", "idea", "nation", "potion", "reason", "salad", "sofa", "teacher"]
  },
  {
    sound: "/tʃ/",
    pronunciation: "ch as in chair",
    exampleWords: ["chair", "cheese", "choose", "chain", "child", "church", "chart", "chief", "chapter", "chimney", "cherish", "chick", "chest", "charm", "chisel"]
  },
  {
    sound: "/dʒ/",
    pronunciation: "j as in judge",
    exampleWords: ["judge", "jam", "joy", "jungle", "jacket", "joke", "juice", "journey", "jump", "jealous", "journal", "juncture", "junction", "adjust", "adjoin"]
  },
  {
    sound: "/v/",
    pronunciation: "v as in very",
    exampleWords: ["vivid", "voice", "velvet", "vote", "van", "visit", "value", "view", "vision", "vow", "vulture", "viable", "vital", "evolve", "reverse"]
  },
  {
    sound: "/z/",
    pronunciation: "z as in zebra",
    exampleWords: ["buzz", "zip", "zone", "zero", "zebra", "quiz", "dizzy", "lazy", "pizza", "puzzle", "size", "prize", "fizz", "sneeze", "freeze"]
  },
  {
    sound: "/h/",
    pronunciation: "h as in hat",
    exampleWords: ["hello", "happy", "house", "heart", "hair", "help", "heal", "huge", "hope", "hill", "hot", "hat", "hold", "hunt", "haste"]
  }
];

/**
 * Creates and populates the pronunciation table with data
 * @param {string} containerId - The ID of the container where the table will be inserted
 */
function createPronunciationTable(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  // Create table element
  const table = document.createElement('table');
  table.className = 'pronunciation-table';
  
  // Create table header
  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');
  
  const headers = ['Sound', 'Pronunciation', 'Example Words', 'Practice'];
  headers.forEach(headerText => {
    const th = document.createElement('th');
    th.textContent = headerText;
    headerRow.appendChild(th);
  });
  
  thead.appendChild(headerRow);
  table.appendChild(thead);
  
  // Create table body
  const tbody = document.createElement('tbody');
  
  // Sort pronunciation data alphabetically by sound
  const sortedPronunciationData = [...pronunciationData].sort((a, b) => {
    return a.sound.localeCompare(b.sound);
  });
  
  sortedPronunciationData.forEach(item => {
    const row = document.createElement('tr');
    row.setAttribute('data-sound', item.sound);
    
    // Sound cell
    const soundCell = document.createElement('td');
    soundCell.textContent = item.sound;
    soundCell.className = 'sound-cell';
    row.appendChild(soundCell);
    
    // Pronunciation cell
    const pronunciationCell = document.createElement('td');
    pronunciationCell.textContent = item.pronunciation;
    pronunciationCell.className = 'pronunciation-cell';
    row.appendChild(pronunciationCell);
    
    // Example words cell
    const exampleWordsCell = document.createElement('td');
    exampleWordsCell.className = 'example-words-cell';
    const wordsList = document.createElement('div');
    wordsList.className = 'example-words-list';
    
    // Sort example words alphabetically
    const sortedExampleWords = [...item.exampleWords].sort((a, b) => {
      return a.localeCompare(b);
    });
    
    sortedExampleWords.forEach(word => {
      const wordSpan = document.createElement('span');
      wordSpan.className = 'example-word';
      wordSpan.textContent = word;
      wordSpan.setAttribute('data-sound', item.sound);
      wordSpan.setAttribute('data-word', word);
      
      // Add click event to each word for individual practice
      wordSpan.addEventListener('click', () => {
        if (window.drillingSession) {
          // Start a drilling session with just this word
          const wordObj = {
            word: word,
            sound: item.sound,
            pronunciation: item.pronunciation,
            type: 'practice'
          };
          window.drillingSession.initialize([wordObj], window.recognitionManager);
          document.getElementById('drilling-session').style.display = 'block';
          window.drillingSession.startSession();
          
          // Scroll to drilling section
          document.getElementById('drilling-session').scrollIntoView({ behavior: 'smooth' });
        }
      });
      
      wordsList.appendChild(wordSpan);
    });
    
    exampleWordsCell.appendChild(wordsList);
    row.appendChild(exampleWordsCell);
    
    // Practice cell
    const practiceCell = document.createElement('td');
    practiceCell.className = 'practice-cell';
    
    // Create practice button
    const practiceButton = document.createElement('button');
    practiceButton.className = 'practice-sound-button';
    practiceButton.textContent = 'Practice This Sound';
    practiceButton.setAttribute('data-sound', item.sound);
    
    // Add click event to practice this sound category
    practiceButton.addEventListener('click', () => {
      if (window.drillingSession) {
        // Create challenge words for this sound category - use alphabetically sorted words
        const difficultList = sortedExampleWords.slice(0, 5).map(word => ({
          word: word,
          sound: item.sound,
          pronunciation: item.pronunciation,
          type: 'practice'
        }));
        
        // Start a drilling session with these words
        window.drillingSession.initialize(difficultList, window.recognitionManager);
        document.getElementById('drilling-session').style.display = 'block';
        window.drillingSession.startSession();
        
        // Scroll to drilling section
        document.getElementById('drilling-session').scrollIntoView({ behavior: 'smooth' });
      }
    });
    
    practiceCell.appendChild(practiceButton);
    row.appendChild(practiceCell);
    
    tbody.appendChild(row);
  });
  
  table.appendChild(tbody);
  container.appendChild(table);
}

/**
 * Gets all example words from all phonetic categories
 * @returns {Array} Array of all example words
 */
function getAllExampleWords() {
  const allWords = [];
  pronunciationData.forEach(item => {
    item.exampleWords.forEach(word => {
      allWords.push({
        word: word,
        sound: item.sound,
        pronunciation: item.pronunciation
      });
    });
  });
  return allWords;
}

/**
 * Gets example words for a specific phonetic sound
 * @param {string} sound - The phonetic sound to search for
 * @returns {Array} Array of words for the given sound
 */
function getWordsForSound(sound) {
  const category = pronunciationData.find(item => item.sound === sound);
  return category ? category.exampleWords : [];
}

/**
 * Gets the phonetic sound category for a given word
 * @param {string} word - The word to find the phonetic sound for
 * @returns {Object|null} The phonetic sound category or null if not found
 */
function getSoundForWord(word) {
  for (const category of pronunciationData) {
    if (category.exampleWords.includes(word.toLowerCase())) {
      return {
        sound: category.sound,
        pronunciation: category.pronunciation
      };
    }
  }
  return null;
}
