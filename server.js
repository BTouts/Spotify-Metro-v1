const express = require('express');
const path = require('path');
const session = require('express-session');

const app = express();
const PORT = process.env.PORT || 3000;

// Set up session middleware
app.use(session({
    secret: 'your_secret_key', // Replace with a secret key for session encryption
    resave: false,
    saveUninitialized: true
}));

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Define route for handling login
app.get('/login', (req, res) => {
    // Replace 'your_client_id' and 'your_redirect_uri' with your actual Spotify client ID and redirect URI
    const clientId = '7b9e6e75bbff4e0e9fc099ba7890ec5b';
    const redirectUri = encodeURIComponent('http://localhost:3000/callback');
    const scopes = encodeURIComponent('user-read-private playlist-modify-public');
    const authUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=token&redirect_uri=${redirectUri}&scope=${scopes}`;

    // Redirect the user to the Spotify login page
    res.redirect(authUrl);
});

// Define route for handling callback from Spotify
app.get('/callback', (req, res) => {
    // Extract the access token from the URL fragment
    const accessToken = req.query.access_token;

    // Store the access token securely (e.g., in session)
    req.session.accessToken = accessToken;

    // Redirect the user to the site.html page
    res.redirect('/site.html');
});

// Define route for handling requests to the root URL ("/")
app.get('/', (req, res) => {
    // Respond with some content or HTML
    res.send('Hello, Express!');
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
