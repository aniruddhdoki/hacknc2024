// src/components/TextInput.jsx
import React, { useState } from 'react';
import axios from 'axios';

export const TextInput = ({ onSynthesize }) => {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) {
      alert('Please enter some text.');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post('http://localhost:3001/synthesize', { text });

      const { audio, speechMarks } = response.data;

      // Parse the speech marks data
      const speechMarksArray = speechMarks
        .trim()
        .split('\n')
        .map((line) => JSON.parse(line));

      onSynthesize(audio, speechMarksArray);
    } catch (error) {
      console.error('Error synthesizing speech:', error);
      alert('An error occurred while synthesizing speech.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ margin: '20px' }}>
      <textarea
        rows="4"
        cols="50"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Enter text for the avatar to speak..."
      />
      <br />
      <button type="submit" disabled={loading}>
        {loading ? 'Synthesizing...' : 'Speak'}
      </button>
    </form>
  );
};
