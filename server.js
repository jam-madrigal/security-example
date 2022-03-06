const path = require('path');
const express = require('express');
const res = require('express/lib/response');

const PORT = process.env.PORT || 3000;

const app = express();

app.get('/secret', (req, res) => {
    return res.send('Your secret talent is magic.');
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});