const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path'); 
const cookieParser = require('cookie-parser'); 
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

// Connect to SQLite database
const db = new sqlite3.Database('data/database.db');
// Serve static files (including your HTML file)
app.use(express.static(path.join(__dirname, 'static')));
app.use(cookieParser());
app.use(bodyParser.text({ type: 'text/plain' }));

// Create a table (example)
db.run('CREATE TABLE IF NOT EXISTS messages (id INTEGER PRIMARY KEY, timestamp INTEGER, username TEXT, message TEXT)');

// Express.js route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'static', 'index.html'));
});

function readAllMessages(res) {
    db.all('SELECT * FROM messages ORDER BY id', [], (err, rows) => {
        if (err) {
            throw err;
        }
        res.json(rows);
        //res.json(rows.map(row => ({user: row.username, ts: row.timestamp, msg:row.message})));
    });
}

app.get('/chat', (req, res) => {
    readAllMessages(res);
});

app.post('/chat', (req, res) => {
    const timestamp = Date.now();
    const username = req.cookies.username;
    const message = req.body;
    db.run('INSERT INTO messages (timestamp, username, message) VALUES (?, ?, ?)', [timestamp, username, message], (err) => {
        if (err) {
            throw err;
        }
    });
    readAllMessages(res);
});

// Start the Express.js server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
