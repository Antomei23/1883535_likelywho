const express = require('express');
const app = express();

app.use(express.json());

let votes = {};

app.post('/vote', (req, res) => {
    const { voter, voted } = req.body;
    votes[voted] = (votes[voted] || 0) + 1;
    res.send({ message: "Vote registered", votes });
});

app.get('/results', (req, res) => {
    res.json(votes);
});

app.listen(3003, () => {
    console.log('Voting Service running on port 3003');
});
