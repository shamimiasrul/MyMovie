const { ipcRenderer } = require('electron');

const movieTitleInput = document.getElementById('movieTitle');
const movieGenreInput = document.getElementById('movieGenre');
const movieNotesInput = document.getElementById('movieNotes');
const saveBtn = document.getElementById('saveBtn');
const editIndexInput = document.getElementById('editIndex');
const watchlistBody = document.getElementById('watchlistBody');


// 2. Handle the incoming search data
ipcRenderer.on('load-movie-data', (event, movie) => {
    if (movie && movie.Title) {
        movieTitleInput.value = movie.Title;
        movieGenreInput.value = movie.Genre || '';
        
        // Can still change the title and genre
        movieTitleInput.readOnly = false;
        movieGenreInput.readOnly = false;
    }
});

// Load and display saved records on startup (READ / VIEW)
document.addEventListener('DOMContentLoaded', displayWatchlist);

// CREATE or UPDATE Operation
saveBtn.addEventListener('click', () => {
    const title = movieTitleInput.value.trim();
    const genre = movieGenreInput.value.trim();
    const notes = movieNotesInput.value.trim();
    const editIndex = parseInt(editIndexInput.value);
    
    if (!title || !notes) {
        alert('Please fill out the movie title and notes.');
        return;
    }

    try {
        let watchlist = JSON.parse(localStorage.getItem('movieWatchlist')) || [];
        const movieRecord = { title, genre, notes };

        if (editIndex === -1) {
            // CREATE: Add new record
            watchlist.push(movieRecord);
        } else {
            // UPDATE: Modify existing record
            watchlist[editIndex] = movieRecord;
            editIndexInput.value = '-1';
            document.getElementById('form-title').textContent = 'Add Movie Plan';
            saveBtn.textContent = '💾 Save Movie Plan';
        }

        // Save to Browser Local Storage (Rubric requirement)
        localStorage.setItem('movieWatchlist', JSON.stringify(watchlist));
        console.log("SUCCESS! Current LocalStorage:", localStorage.getItem('movieWatchlist'));

        // Send to main process to record into movies.json
        ipcRenderer.send('save-movie-plan', movieRecord);

        // Clear form inputs
        movieTitleInput.value = '';
        movieGenreInput.value = '';
        movieNotesInput.value = '';

        displayWatchlist();
        alert('Movie plan saved successfully!');
    } catch (error) {
        console.error("ERROR while saving to localStorage:", error);
    }
});

// READ / VIEW Operation: Render saved items into the HTML table
function displayWatchlist() {
    let watchlist = JSON.parse(localStorage.getItem('movieWatchlist')) || [];
    watchlistBody.innerHTML = '';

    if (watchlist.length === 0) {
        watchlistBody.innerHTML = `<tr><td colspan="4" style="text-align:center;">No saved movies in watchlist.</td></tr>`;
        return;
    }

    watchlist.forEach((movie, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${movie.title}</td>
            <td>${movie.genre || 'N/A'}</td>
            <td>${movie.notes}</td>
            <td>
                <button class="edit-btn" onclick="editMovie(${index})" style="background-color:#f0ad4e; color:white; border:none; padding:5px 10px; border-radius:4px; cursor:pointer;">Edit</button>
                <button class="delete-btn" onclick="deleteMovie(${index})" style="background-color:#d9534f; color:white; border:none; padding:5px 10px; border-radius:4px; cursor:pointer;">Delete</button>
            </td>
        `;
        watchlistBody.appendChild(row);
    });
}

// UPDATE Setup: Load data into form for editing
window.editMovie = function(index) {
    let watchlist = JSON.parse(localStorage.getItem('movieWatchlist')) || [];
    const movie = watchlist[index];

    movieTitleInput.value = movie.title;
    movieGenreInput.value = movie.genre;
    movieNotesInput.value = movie.notes;
    editIndexInput.value = index;

    document.getElementById('form-title').textContent = 'Edit Movie Plan';
    saveBtn.textContent = '✏️ Update Movie Plan';
}

// DELETE Operation: Remove item from Local Storage
window.deleteMovie = function(index) {
    if (confirm('Are you sure you want to delete this movie plan?')) {
        let watchlist = JSON.parse(localStorage.getItem('movieWatchlist')) || [];
        watchlist.splice(index, 1);
        localStorage.setItem('movieWatchlist', JSON.stringify(watchlist));
        displayWatchlist();
    }
}