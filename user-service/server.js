const express = require('express');
const app = express();

app.use(express.json());

app.get('/', (req, res) => {
    res.send('User Service is Running');
});

app.listen(3001, () => {
    console.log('User Service running on port 3001');
});
