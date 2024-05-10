let accessToken = null;

// Function to handle user login
async function login() {
    try {
        const clientId = 'your_client_id'; // Replace with your Spotify client ID
        const redirectUri = encodeURIComponent('https://your-redirect-uri.com/callback'); // Replace with your redirect URI
        const scopes = encodeURIComponent('user-read-private playlist-modify-public'); // Define required scopes
        const authUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=token&redirect_uri=${redirectUri}&scope=${scopes}`;

        // Redirect user to Spotify login page
        window.location.href = authUrl;
    } catch (error) {
        console.error('Error during login:', error);
    }
}

// Function to handle obtaining access token from URL hash
function handleAccessToken() {
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    accessToken = params.get('access_token');
}

// Check if the user is already logged in
if (window.location.hash) {
    handleAccessToken();
}

// Function to get recommendations
async function getRecommendations() {
    try {
        if (!accessToken) {
            console.error('Access token not found. Please log in.');
            return;
        }

        const trackID = document.getElementById('trackID').value;
        const minBPM = document.getElementById('minBPM').value;
        const maxBPM = document.getElementById('maxBPM').value;

        const url = `https://api.spotify.com/v1/recommendations?seed_tracks=${trackID}&min_tempo=${minBPM}&max_tempo=${maxBPM}`;
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const data = await response.json();
            const trackURIs = data.tracks.map(track => track.uri);
            console.log(trackURIs); // Extracting track URIs
            createPlaylist(trackURIs, minBPM, maxBPM); // Call createPlaylist function here
        } else {
            console.error('Failed to fetch recommendations:', response.status);
        }
    } catch (error) {
        console.error('Error fetching recommendations:', error);
    }
}

// Function to create playlist
async function createPlaylist(tracks, minBPM, maxBPM) {
    try {
        if (!accessToken) {
            console.error('Access token not found. Please log in.');
            return;
        }

        const userId = 'b.toutkoushian'; // Replace 'your_user_id' with your Spotify user ID
        const playlistName = minBPM + ' - ' + maxBPM + ' Recommendations'; // Name of the playlist
        
        const createPlaylistResponse = await fetch(`https://api.spotify.com/v1/users/${userId}/playlists`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: playlistName,
                public: true
            })
        });

        if (!createPlaylistResponse.ok) {
            console.error('Failed to create playlist:', createPlaylistResponse.status);
            return;
        }

        const playlistData = await createPlaylistResponse.json();
        const playlistId = playlistData.id;

        // Add tracks to the playlist
        const addTracksResponse = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                uris: tracks
            })
        });

        if (!addTracksResponse.ok) {
            console.error('Failed to add tracks to the playlist:', addTracksResponse.status);
            return;
        }

        console.log('Playlist created successfully:', playlistData.external_urls.spotify);
        alert('Playlist created successfully! You can listen to it here: ' + playlistData.external_urls.spotify);
    } catch (error) {
        console.error('Error creating playlist:', error);
    }
}
