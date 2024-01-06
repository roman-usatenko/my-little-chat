const express = require('express');
const router = express.Router();
const fs = require('fs');
const process = require('process');
const db = require('../db');
const config = require('../config');

function readAllMessages(res) {
    db.readAllMessages((rows) => {
        res.json(rows);
    });
}

router.get('/', (req, res) => {
    readAllMessages(res);
});

router.post('/', (req, res) => {
    const username = req.cookies.username;
    const message = req.body;
    if (message === '!q') {
        process.exit(); // Quit the Node.js app
    }
    db.insertMessage(username, message, null, (id) => {
        readAllMessages(res);
    });
});

router.delete('/:id', (req, res) => {
    const id = req.params.id;
    db.getFilename(id, (filename) => {
        if (filename) {
            const filePath = config.files + `/${id}`;
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

module.exports = router;