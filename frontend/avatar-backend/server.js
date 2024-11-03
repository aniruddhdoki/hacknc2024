// server.js
const express = require('express');
const AWS = require('aws-sdk');
const cors = require('cors');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Configure AWS Polly
AWS.config.update({ region: 'us-east-1' });

const polly = new AWS.Polly();

app.post('/synthesize', async (req, res) => {
    const { text, voiceId } = req.body;

   // Validate voiceId (optional but recommended)
   const validVoiceIds = [
    'Matthew',
    'Joanna',
    'Salli',
    'Brian',
    'Emma',
    'Raveena',
    // Add other valid VoiceIds as needed
  ];

  //const selectedVoiceId = validVoiceIds.includes(voiceId) ? voiceId : 'Matthew';

  try {
    
    // console.log("before llm")
    // const llmapicall = await axios.post('http://localhost:8000/chat', { query: text });
    // const llmresponse = llmapicall.data.response;
    // console.log('llmresponse:', llmresponse);
    // console.log(typeof llmresponse);

        // Parameters for audio synthesis
    const audioParams = {
        Text: "Financial options are contracts that grant the holder the right, but not the obligation, to buy or sell a specific financial product at an agreed price on or before a specified date. They are derivatives, deriving their value from underlying assets like stocks or ETFs. The two main types are call options (right to buy) and put options (right to sell).",
        OutputFormat: 'mp3',
        VoiceId: voiceId,
        Engine: 'standard', // Use 'standard' engine for speech marks compatibility
    };


    // Parameters for speech marks
    const speechMarksParams = {
        Text: "Financial options are contracts that grant the holder the right, but not the obligation, to buy or sell a specific financial product at an agreed price on or before a specified date. They are derivatives, deriving their value from underlying assets like stocks or ETFs. The two main types are call options (right to buy) and put options (right to sell).",
        OutputFormat: 'json',
        VoiceId: 'Matthew',
        Engine: 'standard', // Changed to 'standard'
        SpeechMarkTypes: ['viseme'],
    };

    // Request the speech audio
    const audioDataPromise = polly.synthesizeSpeech(audioParams).promise();

    // Request the speech marks (viseme data)
    const speechMarksDataPromise = polly.synthesizeSpeech(speechMarksParams).promise();

    // Wait for both promises to resolve
    const [audioData, speechMarksData] = await Promise.all([
      audioDataPromise,
      speechMarksDataPromise,
    ]);

    // Convert audio stream to base64
    const audioBase64 = audioData.AudioStream.toString('base64');

    // Convert speech marks stream to string
    const speechMarksJson = speechMarksData.AudioStream.toString();

    console.log(audioBase64)

    res.json({
      audio: audioBase64,
      speechMarks: speechMarksJson,
    });
  } catch (error) {
    console.error('Error synthesizing speech:', error.stack || error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
