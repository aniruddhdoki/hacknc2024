// src/App.jsx
import React, { useState, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { Avatar } from './components/Avatar';
import axios from 'axios';
import './index.css';

function App() {
  const [inputText, setInputText] = useState('');
  const [voiceId, setVoiceId] = useState('Matthew'); // Default voice
  const [audioData, setAudioData] = useState(null);
  const [speechMarksData, setSpeechMarksData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const recognitionRef = useRef(null);

  const handleRun = async (event) => {
    event.preventDefault();

    if (!inputText.trim()) {
      alert('Please enter some text.');
      return;
    }

    setIsLoading(true);

    try {
      
      const response = await axios.post('http://localhost:3001/synthesize', {
        text: inputText, // Use the response from the chatbot
        voiceId: voiceId, // Include the selected VoiceId
      });
      const { audio, speechMarks } = response.data;

      // Parse the speech marks data
      const speechMarksArray = speechMarks
        .trim()
        .split('\n')
        .map((line) => JSON.parse(line));

      setAudioData(audio);

      setSpeechMarksData(speechMarksArray);

      // Clear the input text for the next input
      setInputText('');
    } catch (error) {
      console.error('Error synthesizing speech:', error);
    
      if (error.response) {
        console.error('Synthesize API error response:', error.response.data);
      }
    
      alert('An error occurred while synthesizing speech.');
    } finally {
      setIsLoading(false);
    }
  };

  // List of available voices (you can customize this list)
  const voiceOptions = [
    { id: 'Matthew', name: 'Matthew (Male, US English)' },
    { id: 'Joanna', name: 'Joanna (Female, US English)' },
    { id: 'Salli', name: 'Salli (Female, US English)' },
    { id: 'Brian', name: 'Brian (Male, British English)' },
    { id: 'Emma', name: 'Emma (Female, British English)' },
    { id: 'Raveena', name: 'Raveena (Female, Indian English)' },
    // Add more voices as needed
  ];

  
  // Speech Recognition Logic
  const startListening = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.continuous = false; // Set to false to automatically stop on silence

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInputText(transcript);
      handleRun(); // Automatically submit the transcribed text
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      alert('An error occurred during speech recognition.');
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };


  return (
<div className="container">
      {/* Text Input and Button */}
      <div className="input-container">
        <form onSubmit={handleRun}>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Enter text or use speech input..."
          />
          <br />
          <label htmlFor="voice-select">Select Voice:</label>
          <select
            id="voice-select"
            value={voiceId}
            onChange={(e) => setVoiceId(e.target.value)}
          >
            {voiceOptions.map((voice) => (
              <option key={voice.id} value={voice.id}>
                {voice.name}
              </option>
            ))}
          </select>
          <br />
          <button type="submit" disabled={isLoading || isListening}>
            {isLoading ? 'Synthesizing...' : 'Run'}
          </button>
          <button
            type="button"
            onClick={toggleListening}
            disabled={isLoading}
            style={{ marginLeft: '10px' }}
          >
            {isListening ? 'Stop Listening' : 'Start Listening'}
          </button>
        </form>
      </div>

      {/* Canvas */}
      <Canvas
        camera={{ position: [0, 1.2, 3], fov: 30 }}
        style={{ background: '#000000' }} /* Set Canvas background to black */
      >
        <ambientLight intensity={0.5} />
        <directionalLight
          intensity={0.8}
          position={[0, 5, 5]}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        <Avatar
          audioData={audioData}
          speechMarksData={speechMarksData}
        />
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.5, 0]}>
          <planeBufferGeometry args={[10, 10]} />
          <meshStandardMaterial color="#000000" />
        </mesh>
      </Canvas>
      
    </div>
  );
}

export default App;
