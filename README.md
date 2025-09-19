# Pronunciation Assistant

An AI-powered web application that helps users improve their English pronunciation through real-time speech analysis and interactive practice sessions.

## 🌟 Features

- **Real-time Speech Recognition**: Uses browser Web Speech API for instant speech analysis
- **Individual Word Practice**: Step-by-step pronunciation drilling for challenging words
- **Phonetic Guidance**: IPA notation and pronunciation tips for accurate learning
- **Progress Tracking**: Session results and improvement analytics
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Privacy-First**: All processing happens in your browser - no data sent to servers


## 🔧 Browser Compatibility

### Fully Supported:
- Chrome 25+ (recommended)
- Edge 79+
- Safari 14.1+

### Limited Support:
- Firefox 76+ (speech recognition may not work)

## 📱 How to Use

1. **Start Speaking**: Click "Start Speaking" and speak clearly into your microphone and 			click "stop speaking" after the completion of speaking.
2. **View Analysis**: See your fluency score and challenging words identified
3. **Practice Session**: Click "Start Practice Session" to work on difficult words
4. **Individual Practice**: Listen to examples, then speak each word for feedback
5. **Track Progress**: Complete sessions to see your improvement over time

## 🛠️ Installation for Development

```bash
# Clone the repository
git clone https://github.com/CIPHER-VEDA/pronunciation-assistant.git

# Navigate to the project directory
cd pronunciation-assistant

# Serve locally (Python)
python -m http.server 8000

# Or with Node.js
npx http-server

# Open browser to http://localhost:8000
```

## 📁 Project Structure

```
pronunciation-assistant/
├── index.html                      # Main application page
├── static/
│   ├── css/
│   │   └── style.css               # All styling and themes
│   └── js/
│       ├── pronunciationData.js    # Phonetic sound database
│       ├── textToSpeech.js         # Audio playback functionality
│       ├── speechRecognition.js    # Speech analysis engine
│       ├── newDrillingSession.js   # Practice session management
│       ├── videoSuggestions.js     # Learning resource recommendations
│       └── script.js               # Main application logic
├── README.md                       # This file
└── DEPLOYMENT.md                   # Deployment guide
```

## 🎯 Key Technologies

- **HTML5 & CSS3**: Modern web standards with glassmorphism design
- **Vanilla JavaScript**: No frameworks - lightweight and fast
- **Web Speech API**: Browser-native speech recognition and synthesis
- **Bootstrap 5**: Responsive UI components
- **Font Awesome**: Professional icons
- **Google Fonts**: Typography (Roboto, Dancing Script)

## 🔒 Privacy & Security

- **No Data Collection**: All speech processing happens locally in your browser
- **No Account Required**: Use immediately without registration
- **No External APIs**: Doesn't send your voice data anywhere
- **Offline Capable**: Core functionality works without internet (after initial load)

## 👨‍💻 Development Team

- **Idea By**: DR.NEELIMA ADAPA & VEDA NARASIMHA SAI.D
- **Designed & Developed By**: VEDA NARASIMHA SAI .D
- **In Supervision**: DR. NEELIMA ADAPA


## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Support

If you encounter any issues or have questions, please [open an issue](https://github.com/CIPHER-VEDA/pronunciation-assistant/issues) on GitHub.

---

**Note**: This application requires microphone access to function properly. Make sure to allow microphone permissions when prompted by your browser.

## 📚 References

The following sources, publications, and submitted works were referenced or reviewed for this research project:

### Internet Sources
1. openi.pcl.ac.cn (8%)
2. forge.citizen4.eu (<1%)
3. codepen.io (<1%)
4. code.hackerspace.pl (<1%)
5. git.tilde.town (<1%)
6. mykidreports.com (<1%)
7. searchfox.org (<1%)
8. www.subframe.com (<1%)
9. freedlaw.ca  (<1%)
 

### Publications
1. Karagöz, Emre. "Akıllı Tahliye Sistemlerinin Tasarımında Teknoloji Tabanlı Karar V…" (1%)
2. Ηλίας, Ζανιάς. "Ανάπτυξη πλατφόρμας αξιολόγησης του επιπέδου ωριμότητας σ…" (<1%)
3. Sufyan bin Uzayr. "Bootstrap - The Ultimate Guide", CRC Press, 2022 ( <1%)
4. Ajay Ohri. "Data Input", Wiley, 2017 (<1%)
5. Sufyan bin Uzayr. "Mastering Bootstrap - A Beginner's Guide", CRC Press, 2022 (<1%)
6. Yatong Jiang, Tao Shang, Jianwei Liu. "Secure Gene Sequence Alignment Based on…" (<1%)
7. Traxler, Kristan. "The Implementation of Artificial Intelligence and Transparency i…" (<1%)
8. Arindam Ganguly. "Scaling Enterprise Solutions with Large Language Models", Springer (<1%)
9. Kim, Paul. "Encoding Counter-Memories: Artificial Intelligence as a Tool for APIA …" (<1%)
10. Caramelo, Filipe Manuel Salvador. "Geneanalyst - A Web Application for Whole Ge…" (<1%)
11. Mahmoud Sakr, Alejandro Vaisman, Esteban Zimányi. "Mobility Data Science", Springer (<1%)
12. Ribeiro, Bruno Rafael Leite. "Data Modeling for the Internet of Things", Universidade (<1%)
13. Damasceno, Carlos Humberto Vieira. "Software Educacional: Ferramenta Pedagó…" (<1%)
14. R B Walter, G S Laszlo, J M Lionberger, J A Pollard et al. "Heterogeneity of clonal e…" (<1%)
15. Ruchika Gupta, Sugandha Sharma, Sarika Verma, Lavleen Singh, Chhabi R. Gupta,… (<1%)
16. Sufyan bin Uzayr. "Conquering JavaScript - D3.js", CRC Press, 2023 (<1%)
17. Kanta Igarashi, Ian Wilson. "Improving Japanese English pronunciation with spee…" (<1%)

### Submitted Works
- RDI Distance Learning on 2025-06-17 (2%)
- Universidad Nacional Abierta y a Distancia, UNAD,UNAD on 2022-10-17 (<1%)
- City University on 2025-04-29 (<1%)
- Strongsville High School on 2010-03-01 (<1%)
- Kaplan International Colleges on 2025-07-06 (<1%)
- University of Northampton on 2025-05-19 (<1%)
- RDI Distance Learning on 2025-01-14 (<1%)
- University of Northampton on 2025-04-27 (<1%)
- Sekolah Pelita Harapan on 2025-04-29 (<1%)
- Florida Virtual School on 2015-02-25 (<1%)
- RDI Distance Learning on 2025-07-03 (<1%)
- Bahrain Polytechnic on 2025-05-15 (<1%)
- Brampton Manor Academy on 2025-05-07 (<1%)
- Vrije Universiteit Amsterdam on 2025-06-21 (<1%)
- University of Hertfordshire on 2025-06-24 (<1%)
- RDI Distance Learning on 2025-04-28 (<1%)
- University of North Texas on 2024-01-27 (<1%)
- Bahrain Polytechnic on 2025-05-15 (<1%)
- Ton Duc Thang University (<1%)
- BB9.1 PROD on 2025-05-05 (<1%)
- National School of Business Management NSBM, Sri Lanka on 2025-05-01 (<1%)
- Caterham High School on 2025-05-13 (<1%)
- City University on 2025-05-01 (<1%)
- Teaching and Learning with Technology on 2024-11-20 (<1%)
- Vrije Universiteit Amsterdam on 2025-06-22 (<1%)
- Panipat Institute of Engineering & Technology on 2025-05-27 (<1%)
- University of Hertfordshire on 2025-06-24 (<1%)
- University of Winchester on 2025-05-30 (<1%)
- University of Ulster on 2025-04-14 (<1%)
- University of Northampton on 2023-05-07 (<1%)
- Miva Open University on 2025-03-15 (<1%)
- University of Wales, Lampeter on 2021-11-18 (<1%)
- ESoft Metro Campus, Sri Lanka on 2025-06-17 (<1%)
- Nanyang Technological University on 2024-11-15 (<1%)
- Swinburne University of Technology on 2025-05-09 (<1%)
- University of Gloucestershire on 2025-06-03 (<1%)
- American University of Central Asia on 2023-09-21 (<1%)
- Cranfield University on 2025-03-26 (<1%)
- University of Gloucestershire on 2025-05-24 (<1%)
- Vrije Universiteit Amsterdam on 2025-06-22 (<1%)
- Damasceno, Carlos Humberto Vieira. "Software Educacional: Ferramenta Pedagó…" (<1%)
- RDI Distance Learning on 2025-07-14 (<1%)
- University of Northampton on 2025-05-18 (<1%)
- yfcnu on 2025-06-09 (<1%)
- RDI Distance Learning on 2025-06-17 (<1%)
- Vrije Universiteit Amsterdam on 2025-06-22 (<1%)
- Colorado Technical University Online on 2025-07-06 (<1%)
- Sheffield Hallam University on 2024-09-11 (<1%)