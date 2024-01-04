const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path'); 
const cookieParser = require('cookie-parser'); 
const bodyParser = require('body-parser');
const multer = require('multer');
const fs = require('fs');

const app = express();
const port = 3000;
const filesPath = 'data/files';
const dbPath = 'data/database.db';

// Connect to SQLite database
const db = new sqlite3.Database(dbPath);

// Serve static files (including your HTML file)
app.use(express.static(path.join(__dirname, 'static')));
app.use(cookieParser());
app.use(bodyParser.text({ type: 'text/*' }));

// Set up multer storage
const storage = multer.diskStorage({
    destination: filesPath,
    filename: (req, file, cb) => {
        const timestamp = Date.now();
        const username = req.cookies.username;
        const filename = decodeURIComponent(file.originalname);
        db.run('INSERT INTO messages (timestamp, username, filename) VALUES (?, ?, ?)', [timestamp, username, filename], function(err) {
            if (err) {
                throw err;
            }
            cb(null, "" + this.lastID);
        });
    }
});

// Create multer upload instance
const upload = multer({ storage });

function readAllMessages(res) {
    db.all('SELECT * FROM messages ORDER BY id', [], (err, rows) => {
        if (err) {
            throw err;
        }
        res.json(rows);
        //res.json(rows.map(row => ({user: row.username, ts: row.timestamp, msg:row.message})));
    });
}

// Create a table (example)
db.run('CREATE TABLE IF NOT EXISTS messages (id INTEGER PRIMARY KEY, timestamp INTEGER, username TEXT, message TEXT, filename TEXT)');

// Express.js route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'static', 'index.html'));
});

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
        readAllMessages(res);
    });
});

app.delete('/chat/:id', (req, res) => {
    const id = req.params.id;
    db.run('DELETE FROM messages WHERE id = ?', id, (err) => {
        if (err) {
            throw err;
        }
        const filePath = filesPath + `/${id}`;
        fs.unlink(filePath, (err) => {
            if (err) {
                if (err.code !== 'ENOENT') {
                    console.error(`Error deleting file: ${err}`);
                }
            }
        });
        readAllMessages(res);
    });
});

app.post('/upload', upload.single('file'), (req, res) => {
    readAllMessages(res);
});

app.get('/download/:id', (req, res) => {
    const id = req.params.id;
    db.get('SELECT filename FROM messages WHERE id = ?', id, (err, row) => {
        if (err) {
            throw err;
        }
        const filename = row.filename;
        res.download(filesPath + `/${id}`, filename, (err) => {
            if (err) {
                throw err;
            }
        });
    });
});

// Start the Express.js server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
