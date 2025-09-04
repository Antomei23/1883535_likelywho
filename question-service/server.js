const express = require('express');
const axios = require('axios');
const app = express();

app.use(express.json());

app.get('/', (req, res) => {
    res.send('Question Service is Running');
});

// Genera una domanda con OpenAI API
app.get('/generate', async (req, res) => {
    const openaiResponse = await axios.post('https://api.openai.com/v1/completions', {
        model: "gpt-3.5-turbo",
        prompt: "Generate a fun question for a group voting game",
        max_tokens: 50
    }, {
        headers: {
            "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
        }
    });

    res.json({ question: openaiResponse.data.choices[0].text.trim() });
});

app.listen(3002, () => {
    console.log('Question Service running on port 3002');
});
