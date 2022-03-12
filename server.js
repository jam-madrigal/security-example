const fs = require('fs');
const path = require('path');
const https = require('https');
const helmet = require('helmet');
const express = require('express');
const passport = require('passport');
const { Strategy } = require('passport-google-oauth20');
const cookieSession = require('cookie-session');

require('dotenv').config();

const PORT = process.env.PORT || 3000;

const config = {
    CLIENT_ID: process.env.CLIENT_ID,
    CLIENT_SECRET: process.env.CLIENT_SECRET,
    COOKIE_KEY_1: process.env.COOKIE_KEY_1,
    COOKIE_KEY_2: process.env.COOKIE_KEY_2
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
// Mounting helmet middleware to cover common security vulnerabilities
app.use(helmet());
// We still want helmet to check our headers before we do anything with our sessions, so it goes above our initialization of our sessions. cookieSession can take in options in an object, such as the name of the cookie, and the time before the user has to log in again (maxAge) in milliseconds. The current example will make the session last a day, and can be multiplied further.
// The keys option is how you secure your cookie by listing secret values. This is how the cookie is signed by the server: with this secret key. The server will check that any cookies sent back also use the same key so we know they haven't been tampered with. We set it as an array in case we have to change it; usually it is generated by a password manager. We could add another key to the front of the array, then remove the old one to invalidate it when we're sure all the new sessions are signed by the new key. It's a good idea to always be using 2 keys to sign your session and not hard code them. We'll set them in .env for now.
app.use(cookieSession({
    name: 'session',
    maxAge: 24 * 60 * 60 * 1000,
    keys: [ 'secret key' ]
}));
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

// Login endpoint. Also using passport's authenticate function, but instead of redirects, we specify the scope property which points to the data we need from google when everything succeeds. Right now, we are just getting the email of our authenticated user
app.get('/auth/google', 
    passport.authenticate('google', {
        scope: ['email']
    }));

// The callback url is what specifies the redirect from our authorization server (Google in this case) when it sends back the authorization code, which is what we use to get back our access token for all of our requests to gain access to restricted data in our application. See Oauth flow diagram for more details. Here we just pass in the passport authenticate function, specifying we are using google, as our callback, the second parameter is an object which specifies what to do on success/failure, with redirects. Sessions are also handled here.
app.get('/auth/google/callback', 
    passport.authenticate('google', {
        failureRedirect: '/failure',
        successRedirect: '/',
        session: false
    }), 
    (req, res) => {
    console.log('Received response from google');
    }
);

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