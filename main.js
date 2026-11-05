const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;
let watchlistWindow;

function createMainWindow() {
    mainWindow = new BrowserWindow({
        width: 900,
        height: 750,
        webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
        },
    });
    mainWindow.loadFile('renderer/index.html');
}

function createWatchlistWindow(movieData) {
    watchlistWindow = new BrowserWindow({
        width: 650,
        height: 650,
        webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
        },
    });
    watchlistWindow.loadFile('renderer/watchlist.html');
    
    // Send the selected movie data over to the watchlist window when loaded
    watchlistWindow.webContents.on('did-finish-load', () => {
        watchlistWindow.webContents.send('load-movie-data', movieData);
    });
}

// IPC handler to open the secondary window from the main page
ipcMain.on('open-watchlist-window', (event, movieData) => {
    createWatchlistWindow(movieData);
});

// IPC handler to save movie plan into movies.json file
ipcMain.on('save-movie-plan', (event, data) => {
    const filePath = path.join(__dirname, 'data', 'movies.json');
    let movies = [];
    
    if (fs.existsSync(filePath)) {
        movies = JSON.parse(fs.readFileSync(filePath));
    }
    
    movies.push(data);
    fs.writeFileSync(filePath, JSON.stringify(movies, null, 2));
});

app.whenReady().then(createMainWindow);