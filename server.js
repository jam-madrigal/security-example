const fs = require('fs');
const path = require('path');
const https = require('https');
const helmet = require('helmet');
const express = require('express');

const PORT = process.env.PORT || 3000;

const app = express();
// Keep security middleware at the top, before any routes, so that every request is secured
app.use(helmet());

// Creating a function for user authentication and authorization, then running next(); to allow access to the following endpoints if permitted. This function can now be reused and passed in before the req, res handlers in our endpoints to restrict access as needed
function checkLoggedIn(req, res, next) {
    const isLoggedIn = true; // TODO
    if (!isLoggedIn) {
        return res.status(401).json({
            error: "You are not logged in"
        });
    }
    next();
}

app.get('/secret', checkLoggedIn, (req, res) => {
    return res.send('Your secret talent is magic.');
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

https.createServer({
    key: fs.readFileSync('key.pem'),
    cert: fs.readFileSync('cert.pem')
}, app).listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});

// TO MAKE A CERT: openssl req -x509 -newkey rsa:4096 -nodes -keyout key.pem -out cert.pem 
// For local certs, just leave everything blank, set common name to your name you want to use