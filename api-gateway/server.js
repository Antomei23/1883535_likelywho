const express = require('express');
const app = express();
const axios = require('axios');

app.use(express.json());

app.get('/', (req, res) => {
    res.send('API Gateway is Running');
});

// Route verso il User Service
app.get('/users', async (req, res) => {
    const response = await axios.get('http://user-service:3001/');
    res.send(response.data);
});

// Route verso il Question Service
app.get('/questions', async (req, res) => {
    const response = await axios.get('http://question-service:3002/');
    res.send(response.data);
});

app.listen(8080, () => {
    console.log('API Gateway running on port 8080');
});
