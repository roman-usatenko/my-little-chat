const express = require('express');
const db = require('./db');
const utils = require('./utils');
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const multer = require('multer');
const fs = require('fs');
const process = require('process');

const app = express();
const port = 3000;
const filesPath = 'data/files';

// Serve static files (including your HTML file)
app.use(express.static(path.join(__dirname, 'static')));
app.use(cookieParser());
app.use(bodyParser.text({ type: 'text/*' }));

// Set up multer storage
const storage = multer.diskStorage({
    destination: filesPath,
    filename: (req, file, cb) => {
        const username = req.cookies.username;
        const filename = decodeURIComponent(file.originalname);
        db.insertMessage(username, null, filename, (id) => {
            cb(null, "" + id);
        });
    }
});

// Create multer upload instance
const upload = multer({ storage });

function readAllMessages(res) {
    db.readAllMessages((rows) => {
        res.json(rows);
    });
}

// Express.js route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'static', 'index.html'));
});

app.get('/chat', (req, res) => {
    readAllMessages(res);
});

app.post('/chat', (req, res) => {
    const username = req.cookies.username;
    const message = req.body;
    if (message === '!q') {
        process.exit(); // Quit the Node.js app
    }
    db.insertMessage(username, message, null, (id) => {
        readAllMessages(res);
    });
});

app.delete('/chat/:id', (req, res) => {
    const id = req.params.id;
    db.getFilename(id, (filename) => {
        if (filename) {
            const filePath = filesPath + `/${id}`;
            fs.unlink(filePath, (err) => {
                if (err) {
                    if (err.code !== 'ENOENT') {
                        console.error(`Error deleting file: ${err}`);
                    }
                }
            });
        }
        db.deleteMessage(id, () => {
            readAllMessages(res);
        });
    });
});

app.post('/upload', upload.single('file'), (req, res) => {
    readAllMessages(res);
});

app.get('/download/:id', (req, res) => {
    const id = req.params.id;
    db.getFilename(id, (filename) => {
        if (filename) {
            res.download(filesPath + `/${id}`, filename, (err) => {
                if (err) {
                    console.error(`Error downloading file: ${err}`);
                    throw err;
                }
            });
        } else {
            res.status(404).send('File not found');
        }
    });
});

app.get('/version', (req, res) => {
    res.send(utils.version);
});

// Start the Express.js server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
