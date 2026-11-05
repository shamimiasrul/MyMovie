const { ipcRenderer } = require('electron');
const searchBtn = document.getElementById('searchBtn');
const resultDiv = document.getElementById('result');
const watchlistBtn = document.getElementById('watchlistBtn');
const suggestionBox = document.getElementById('suggestionBox');

let currentMovie = {};

searchBtn.addEventListener('click', async () => {
    const title = document.getElementById('movieInput').value.trim();
    if (!title) {
        alert('Please enter a movie title.');
        return;
    }

    // Free OMDb API key 
    const apiKey = '38d066e'; 
    const url = `https://www.omdbapi.com/?t=${encodeURIComponent(title)}&apikey=${apiKey}`;

    try {
        const res = await fetch(url);
        const data = await res.json();

        // Error handling for API response
        if (data.Response === 'False') {
            throw new Error('Movie not found');
        }

        currentMovie = data;

        // --- MEANINGFUL CALCULATION (Task 4) ---
        // Converts movie runtime in minutes (e.g. "148 min") into Hours and Minutes
        const runtimeMinutes = parseInt(data.Runtime) || 0;
        const hours = Math.floor(runtimeMinutes / 60);
        const mins = runtimeMinutes % 60;
        const formattedRuntime = hours > 0 ? `${hours} hr ${mins} mins` : `${mins} mins`;

        // Display Movie Details (DOM Manipulation)
        resultDiv.style.display = 'block';
        resultDiv.innerHTML = `
            <h3>${data.Title} (${data.Year})</h3>
            <p><strong>Genre:</strong> ${data.Genre}</p>
            <p><strong>Director:</strong> ${data.Director}</p>
            <p><strong>IMDb Rating:</strong> ${data.imdbRating} / 10</p>
            <p><strong>Calculated Runtime:</strong> ${formattedRuntime}</p>
        `;

        // --- CUSTOM SUGGESTION LOGIC USING CONTROL STATEMENTS (Task 3) ---
        let suggestion = "";
        const genres = data.Genre ? data.Genre.toLowerCase() : "";

        if (genres.includes('action') || genres.includes('adventure')) {
            suggestion = "🍿 Suggestion: High-energy action movie! Best watched with surround sound and snacks.";
        } else if (genres.includes('animation') || genres.includes('family')) {
            suggestion = "👨‍👩‍👧‍👦 Suggestion: Perfect family-friendly choice! Great for all age groups.";
        } else if (genres.includes('horror') || genres.includes('thriller')) {
            suggestion = "👻 Suggestion: Watch this late at night with the lights turned off for maximum suspense!";
        } else if (genres.includes('comedy')) {
            suggestion = "😂 Suggestion: A fun comedy pick to lift your mood and laugh with friends.";
        } else if (genres.includes('fantasy')) {
            suggestion = "🧙‍♂️ Suggestion: Magical family-friendly choice! Great for all age groups.";
        } else {
            suggestion = "🛋️ Suggestion: A solid pick for a calm, relaxed movie night.";
        }
        
        suggestionBox.textContent = suggestion;
        watchlistBtn.style.display = 'inline-block';

    } catch (error) {
        // Error handling for failed requests or empty results (Task 6/Rubric)
        resultDiv.style.display = 'block';
        resultDiv.innerHTML = `<p style="color:red;">Movie not found. Please check the spelling and try again.</p>`;
        suggestionBox.textContent = '';
        watchlistBtn.style.display = 'none';
    }
});

// Event listener to open watchlist management window
watchlistBtn.addEventListener('click', () => {
    ipcRenderer.send('open-watchlist-window', currentMovie);
});

// ==========================================
// --- ADDED: CATEGORY / GENRE SUGGESTIONS ---
// ==========================================
const genreButtons = document.querySelectorAll('.genre-filter-btn');
const categoryResultsDiv = document.getElementById('categoryResults');

genreButtons.forEach(button => {
    button.addEventListener('click', async () => {
        const genreQuery = button.getAttribute('data-query');
        categoryResultsDiv.innerHTML = `<p style="color: #38bdf8;">Finding suitable ${genreQuery} movies...</p>`;

        const apiKey = '38d066e';
        const url = `https://www.omdbapi.com/?s=${encodeURIComponent(genreQuery)}&apikey=${apiKey}`;

        try {
            const res = await fetch(url);
            const data = await res.json();

            if (data.Response === 'False') {
                categoryResultsDiv.innerHTML = `<p style="color: red;">No movies found for this category.</p>`;
                return;
            }

            // Pull top 3 suggested movies from the OMDb list
            const movies = data.Search.slice(0, 3);
            
            let html = `<div style="background: #1e293b; padding: 10px; border-radius: 6px; border: 1px solid #334155; margin-top: 8px;">`;
            html += `<p style="color: #f8fafc; font-weight: bold; margin-bottom: 6px;">Top ${genreQuery} Suggestions:</p><ul style="padding-left: 20px; margin: 0;">`;
            
            movies.forEach(movie => {
                html += `<li style="color: #94a3b8; margin-bottom: 4px;">${movie.Title} (${movie.Year})</li>`;
            });
            
            html += `</ul></div>`;
            categoryResultsDiv.innerHTML = html;

        } catch (error) {
            categoryResultsDiv.innerHTML = `<p style="color: red;">Failed to fetch category suggestions.</p>`;
        }
    });
});