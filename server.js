const fs = require('fs');
const path = require('path');
const https = require('https');
const helmet = require('helmet');
const express = require('express');
const passport = require('passport');
const { Strategy } = require('passport-google-oauth20');

require('dotenv').config();

const PORT = process.env.PORT || 3000;

const config = {
    CLIENT_ID: process.env.CLIENT_ID,
    CLIENT_SECRET: process.env.CLIENT_SECRET
}

const AUTH_OPTIONS = {
    callbackURL: '/auth/google/callback',
    clientID: config.CLIENT_ID,
    clientSecret: config.CLIENT_SECRET
}

// Verify function for google strategy. Checks if the access token/refresh token are valid, then calls done() to supply passport with the authenticated user, or return an error. Since google will be providing tokens, and if it does we know the user is valid, we do not need to use the parameters to be passwords we check ourselves like we would if not using google oauth. We would use this function to check the values against our database somehow if not using oauth.
function verifyCallback(accessToken, refreshToken, profile, done) {
    console.log('Google profile', profile);
    done(null, profile);
}
// Setting up passport to use google's Strategy, taking in an object with the required options for google, and the verify function as parameters
passport.use(new Strategy(AUTH_OPTIONS, verifyCallback))

const app = express();
// Keep security middleware at the top, before any routes, so that every request is secured
// Mounting helmet middleware to cover common security vulnerabilities, and initializing the "passport session" so we can setup passport for authentication
app.use(helmet());
app.use(passport.initialize());

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

// The callback url is what specifies the redirect from our authorization server (Google in this case) when it sends back the authorization code, which is what we use to get back our access token for all of our requests to gain access to restricted data in our application. See Oauth flow diagram for more details. Here we just pass in the passport authenticate function, specifying we are using google, as our callback, the third parameter is an object which specifies what to do on success/failure, with redirects. Sessions are also handled here.
app.get('/auth/google/callback', passport.authenticate('google'), {
    failureRedirect: '/failure',
    successRedirect: '/',
    session: false
});

// Logout endpoint, logging out doesn't require the user to pass in any data; it will be the same for any provider
app.get('/auth/logout', (req, res) => {

});

// Secret endpoint to test authentication/authorization
app.get('/secret', checkLoggedIn, (req, res) => {
    return res.send('Your secret talent is magic.');
});

app.get('/failure', (req, res) => {
    return res.send('Failed to login, or invalid login credentials');
})

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