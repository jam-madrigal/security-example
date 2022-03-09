const fs = require('fs');
const path = require('path');
const https = require('https');
const helmet = require('helmet');
const express = require('express');

const PORT = process.env.PORT || 3000;

const app = express();
// Keep security middleware at the top, before any routes, so that every request is secured
app.use(helmet());

// Creating a function for user authentication and authorization, then running next(); to allow access to the following endpoints if permitted. In express, this or any number of other functions can now be reused and passed in before the req, res handlers in our endpoints to restrict access as needed
function checkLoggedIn(req, res, next) {
    const isLoggedIn = true; // TODO
    if (!isLoggedIn) {
        return res.status(401).json({
            error: "You are not logged in"
        });
    }
    next();
}

// Login endpoint
app.get('/auth/google', (req, res) => {

});

// The callback url is what specifies the redirect from our authorization server (Google in this case) when it sends back the authorization code, which is what we use to get back our access token for all of our requests to gain access to restricted data in our application
app.get('/auth/google/callback', (req, res) => {

});

// Logout endpoint, logging out doesn't require the user to pass in any data; it will be the same for any provider
app.get('/auth/logout', (req, res) => {

});

// Secret endpoint to test authentication/authorization
app.get('/secret', checkLoggedIn, (req, res) => {
    return res.send('Your secret talent is magic.');
});

// Root & homepage html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Creating and listening to our server
https.createServer({
    key: fs.readFileSync('key.pem'),
    cert: fs.readFileSync('cert.pem')
}, app).listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});

// TO MAKE A CERT: openssl req -x509 -newkey rsa:4096 -nodes -keyout key.pem -out cert.pem 
// For local certs, just leave everything blank, set common name to your name you want to use