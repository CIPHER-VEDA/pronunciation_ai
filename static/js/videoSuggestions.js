/**
 * Video Suggestions Module
 * Provides YouTube video suggestions based on pronunciation challenges
 */

// Video recommendation database
const videoRecommendations = {
  // Voiceless "th" sound
  "/θ/": [
    {
      title: "How to Pronounce TH - English Pronunciation Lesson",
      url: "https://www.youtube.com/watch?v=EgkVbwQOhWI",
      description: "Learn how to make the 'th' sound in words like 'think' and 'three'."
    },
    {
      title: "TH Voiceless Sound /θ/ - Learn English Pronunciation",
      url: "https://www.youtube.com/watch?v=Ap2wSCBR-W0",
      description: "Detailed instruction on the voiceless 'th' /θ/ sound with examples."
    }
  ],
  
  // Voiced "th" sound
  "/ð/": [
    {
      title: "How to pronounce TH /ð/ | BBC English Masterclass",
      url: "https://www.youtube.com/watch?v=h5LO0hHGfQg",
      description: "Learn the voiced 'th' sound in words like 'they' and 'this'."
    },
    {
      title: "Voiced TH /ð/ Sound - English Pronunciation",
      url: "https://www.youtube.com/watch?v=E1f0Oq4Q5jE",
      description: "Practice the voiced 'th' sound with clear examples and mouth positions."
    }
  ],
  
  // "r" sound
  "/r/": [
    {
      title: "How to Pronounce R | American English Pronunciation",
      url: "https://www.youtube.com/watch?v=3HUF1L9lurI",
      description: "Master the American English 'r' sound with detailed instructions."
    },
    {
      title: "How to pronounce the R sound | British vs American English",
      url: "https://www.youtube.com/watch?v=GL5IjJhZ8uQ",
      description: "Compare British and American 'r' sounds and learn both pronunciations."
    }
  ],
  
  // "l" sound
  "/l/": [
    {
      title: "How to Pronounce L | American English Pronunciation",
      url: "https://www.youtube.com/watch?v=pGX5tQDlEKQ",
      description: "Learn to pronounce the 'l' sound clearly at the beginning, middle, and end of words."
    },
    {
      title: "L Sound - How to pronounce the L Consonant",
      url: "https://www.youtube.com/watch?v=0V_wzGxfB1A",
      description: "Detailed tutorial on the 'l' sound with practice exercises."
    }
  ],
  
  // "zh" sound
  "/ʒ/": [
    {
      title: "How to Pronounce ZH /ʒ/ - American English Pronunciation",
      url: "https://www.youtube.com/watch?v=ULdrVT_04cw",
      description: "Learn the 'zh' sound in words like 'measure' and 'pleasure'."
    },
    {
      title: "The /ʒ/ sound in English - How to pronounce ZH correctly",
      url: "https://www.youtube.com/watch?v=QK_1G5EqCb8",
      description: "Practice the 'zh' sound with examples and mouth position guidance."
    }
  ],
  
  // "sh" sound
  "/ʃ/": [
    {
      title: "How to Pronounce SH /ʃ/ - American English Pronunciation",
      url: "https://www.youtube.com/watch?v=MhTFqBznXOw",
      description: "Master the 'sh' sound in words like 'ship' and 'wash'."
    },
    {
      title: "SH Sound /ʃ/ - English Pronunciation",
      url: "https://www.youtube.com/watch?v=WlL8M7ES4n0",
      description: "Clear instruction on the 'sh' sound with practice examples."
    }
  ],
  
  // "ng" sound
  "/ŋ/": [
    {
      title: "How to Pronounce NG /ŋ/ - English Pronunciation",
      url: "https://www.youtube.com/watch?v=rmx_VfaQKhQ",
      description: "Learn to pronounce the 'ng' sound correctly in words like 'sing' and 'bring'."
    },
    {
      title: "NG Sound /ŋ/ - How to Pronounce",
      url: "https://www.youtube.com/watch?v=FXhEwm4OmTo",
      description: "Detailed lesson on the 'ng' sound with mouth positions and examples."
    }
  ],
  
  // Short "a" sound
  "/æ/": [
    {
      title: "How to Pronounce the Short A /æ/ - American English Pronunciation",
      url: "https://www.youtube.com/watch?v=qpQXx7yKpSU",
      description: "Learn the short 'a' sound in words like 'cat' and 'map'."
    },
    {
      title: "The /æ/ Sound in American English - Short A",
      url: "https://www.youtube.com/watch?v=mynucZiy-Ug",
      description: "Practice the short 'a' sound with detailed examples."
    }
  ],
  
  // Short "u" sound
  "/ʊ/": [
    {
      title: "How to Pronounce /ʊ/ - English Short 'u' Sound",
      url: "https://www.youtube.com/watch?v=UCWPKeuQvL8",
      description: "Learn the short 'u' sound in words like 'book' and 'look'."
    },
    {
      title: "English Pronunciation: /ʊ/ COULD WOULD SHOULD",
      url: "https://www.youtube.com/watch?v=Rkb9UnLyDcA",
      description: "Practice the short 'u' sound in common modal verbs."
    }
  ],
  
  // Schwa sound
  "/ə/": [
    {
      title: "The SCHWA Sound! English Pronunciation",
      url: "https://www.youtube.com/watch?v=O_B-AZN_vG4",
      description: "Learn the most common sound in English - the schwa /ə/."
    },
    {
      title: "How to pronounce the Schwa /ə/ - American English Pronunciation",
      url: "https://www.youtube.com/watch?v=Em88V7rJZ0o",
      description: "Detailed lesson on the schwa sound with many examples."
    }
  ],
  
  // "ch" sound
  "/tʃ/": [
    {
      title: "How to Pronounce the CH sound /tʃ/ - American English Pronunciation",
      url: "https://www.youtube.com/watch?v=8Lc9n0GNmrE",
      description: "Learn to pronounce the 'ch' sound in words like 'chair' and 'lunch'."
    },
    {
      title: "CH Sound /tʃ/ - English Pronunciation",
      url: "https://www.youtube.com/watch?v=NCxsYoEcGmI",
      description: "Practice the 'ch' sound with examples and mouth positions."
    }
  ],
  
  // "j" sound
  "/dʒ/": [
    {
      title: "How to Pronounce J /dʒ/ - American English Pronunciation",
      url: "https://www.youtube.com/watch?v=hZlAf7aSYKc",
      description: "Master the 'j' sound in words like 'jump' and 'bridge'."
    },
    {
      title: "J Sound /dʒ/ - How to pronounce the J consonant",
      url: "https://www.youtube.com/watch?v=Ivhu0VxCK4I",
      description: "Detailed tutorial on the 'j' sound with practice exercises."
    }
  ],
  
  // "v" sound
  "/v/": [
    {
      title: "How to Pronounce V /v/ - American English Pronunciation",
      url: "https://www.youtube.com/watch?v=uDf2QXYZpzU",
      description: "Learn to pronounce the 'v' sound correctly in words like 'very' and 'love'."
    },
    {
      title: "V Sound /v/ - English Pronunciation",
      url: "https://www.youtube.com/watch?v=0y4AiXCi5rg",
      description: "Practice the 'v' sound with examples and lip positions."
    }
  ],
  
  // "z" sound
  "/z/": [
    {
      title: "How to Pronounce Z /z/ - American English Pronunciation",
      url: "https://www.youtube.com/watch?v=o9-ygx0LU9M",
      description: "Master the 'z' sound in words like 'zebra' and 'buzz'."
    },
    {
      title: "Z Sound /z/ - English Pronunciation",
      url: "https://www.youtube.com/watch?v=Zl1HYDPFdII",
      description: "Detailed lesson on the 'z' sound with mouth positions and examples."
    }
  ],
  
  // "h" sound
  "/h/": [
    {
      title: "How to Pronounce H /h/ - American English Pronunciation",
      url: "https://www.youtube.com/watch?v=QXr9MXa-7fU",
      description: "Learn to pronounce the 'h' sound correctly in words like 'home' and 'behind'."
    },
    {
      title: "H Sound /h/ - English Pronunciation",
      url: "https://www.youtube.com/watch?v=JxXbJ_xGHIk",
      description: "Practice the 'h' sound with examples and breathing techniques."
    }
  ],
  
  // Default recommendations for any sound
  "default": [
    {
      title: "English Pronunciation Training | Improve Your Accent & Speak Clearly",
      url: "https://www.youtube.com/watch?v=n4NVPg2kHv4",
      description: "General pronunciation training to improve your overall accent."
    },
    {
      title: "How to improve your English pronunciation | 5 tips",
      url: "https://www.youtube.com/watch?v=CpNxMJM-5tM",
      description: "Five practical tips to improve your English pronunciation."
    },
    {
      title: "Fluency Practice: English Pronunciation Exercises",
      url: "https://www.youtube.com/watch?v=VvqWzfFYrfs",
      description: "Exercises to improve your spoken fluency and reduce stuttering."
    }
  ],
  
  // Special recommendations for stuttering
  "stutter": [
    {
      title: "Stuttering: Tips for Managing and Reducing Stutters",
      url: "https://www.youtube.com/watch?v=jHIw0zA9hNA",
      description: "Practical techniques to manage and reduce stuttering."
    },
    {
      title: "Speech Exercises for Stuttering Treatment",
      url: "https://www.youtube.com/watch?v=9lkoUEL3Htc",
      description: "Exercises specifically designed to help with stuttering."
    },
    {
      title: "How To Stop Stuttering Today - 3 Easy Ways",
      url: "https://www.youtube.com/watch?v=8_MKsMB9uTE",
      description: "Three practical methods to help reduce stuttering immediately."
    }
  ]
};

/**
 * Get video recommendations based on challenging sounds
 * @param {Array} difficultList - Words that the user found difficult
 * @returns {Array} Recommended videos
 */
function getVideoRecommendations(difficultList) {
  if (!difficultList || difficultList.length === 0) {
    return videoRecommendations.default;
  }
  
  // Count occurrences of each sound
  const soundCounts = {};
  let hasStuttering = false;
  
  difficultList.forEach(word => {
    if (word.type === 'stutter') {
      hasStuttering = true;
    }
    
    if (word.sound && word.sound !== 'unknown') {
      soundCounts[word.sound] = (soundCounts[word.sound] || 0) + 1;
    }
  });
  
  // Sort sounds by frequency
  const sortedSounds = Object.keys(soundCounts).sort((a, b) => 
    soundCounts[b] - soundCounts[a]
  );
  
  // Get recommendations for top 3 sounds
  const recommendations = [];
  const maxSounds = Math.min(3, sortedSounds.length);
  
  for (let i = 0; i < maxSounds; i++) {
    const sound = sortedSounds[i];
    if (videoRecommendations[sound]) {
      // Add the top recommendation for this sound
      recommendations.push({
        ...videoRecommendations[sound][0],
        sound: sound
      });
      
      // If we have space and there's another recommendation, add it too
      if (recommendations.length < 5 && videoRecommendations[sound].length > 1) {
        recommendations.push({
          ...videoRecommendations[sound][1],
          sound: sound
        });
      }
    }
  }
  
  // If stuttering was detected, add stuttering recommendations
  if (hasStuttering && recommendations.length < 5) {
    recommendations.push({
      ...videoRecommendations.stutter[0],
      sound: "Stuttering"
    });
    
    if (recommendations.length < 5) {
      recommendations.push({
        ...videoRecommendations.stutter[1],
        sound: "Stuttering"
      });
    }
  }
  
  // If we still have fewer than 3 recommendations, add default ones
  while (recommendations.length < 3) {
    const defaultRec = videoRecommendations.default.find(rec => 
      !recommendations.some(r => r.url === rec.url)
    );
    
    if (defaultRec) {
      recommendations.push({
        ...defaultRec,
        sound: "General Pronunciation"
      });
    } else {
      break; // No more unique default recommendations
    }
  }
  
  return recommendations;
}

/**
 * Render video recommendations to the provided container
 * @param {string} containerId - ID of the container element
 * @param {Array} recommendations - Video recommendations to display
 */
function renderVideoRecommendations(containerId, recommendations) {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  // Clear existing content
  container.innerHTML = '';
  
  if (!recommendations || recommendations.length === 0) {
    container.innerHTML = '<p>No reference videos available. Complete a speaking exercise first to get personalized YouTube videos.</p>';
    return;
  }
  
  // Add a heading about the source
  const sourceInfo = document.createElement('div');
  sourceInfo.className = 'video-source-info';
  sourceInfo.innerHTML = '<p><i class="fab fa-youtube"></i> All reference videos are sourced from YouTube, the world\'s leading pronunciation learning resource.</p>';
  container.appendChild(sourceInfo);
  
  // Create a container for video cards
  const videoCardsContainer = document.createElement('div');
  videoCardsContainer.className = 'video-cards-container';
  
  // Create video cards
  recommendations.forEach(video => {
    const videoCard = document.createElement('div');
    videoCard.className = 'video-card';
    
    // Extract YouTube video ID from URL
    let videoId = '';
    if (video.url.includes('youtube.com/watch')) {
      const urlParams = new URLSearchParams(new URL(video.url).search);
      videoId = urlParams.get('v');
    } else if (video.url.includes('youtu.be/')) {
      videoId = video.url.split('youtu.be/')[1];
    }
    
    // Create card content
    videoCard.innerHTML = `
      <div class="video-thumbnail">
        ${videoId ? `<iframe width="100%" height="100%" 
                     src="https://www.youtube.com/embed/${videoId}" 
                     frameborder="0" allowfullscreen
                     style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;">
                     </iframe>` 
                  : `<div class="placeholder-thumbnail">Video</div>`}
      </div>
      <div class="video-info">
        <h3 class="video-title">${video.title}</h3>
        <div class="video-sound">Sound: ${video.sound}</div>
        <p>${video.description}</p>
        <div class="video-source">
          <i class="fab fa-youtube" style="color: #FF0000;"></i> 
          <a href="${video.url}" target="_blank" class="video-link">Watch on YouTube</a>
        </div>
      </div>
    `;
    
    videoCardsContainer.appendChild(videoCard);
  });
  
  // Add the cards container to the main container
  container.appendChild(videoCardsContainer);
}
