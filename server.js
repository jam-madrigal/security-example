const https = require('https');
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

https.createServer({
    key:'key.pem',
    cert:'cert.pem'
}).listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});

// TO MAKE A CERT: openssl req -x509 -newkey rsa:4096 -nodes -keyout key.pem -out cert.pem 
// For local certs, just leave everything blank, set common name to your name you want to use