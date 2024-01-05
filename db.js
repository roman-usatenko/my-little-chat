const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = 'data/database.db';
const db = new sqlite3.Database(path.resolve(__dirname, dbPath));

db.run('CREATE TABLE IF NOT EXISTS messages (id INTEGER PRIMARY KEY, timestamp INTEGER, username TEXT, message TEXT, filename TEXT)');

function checkError(err) {
    if (err) {
        console.error(err);
        throw err;
    }
}

function readAllMessages(cb) {
    db.all('SELECT * FROM messages ORDER BY id DESC', [], (err, rows) => {
        checkError(err);
        cb(rows);
    });
}

function insertMessage(username, message, filename, cb) {
    const timestamp = Date.now();
    db.run('INSERT INTO messages (timestamp, username, message, filename) VALUES (?, ?, ?, ?)', [timestamp, username, message, filename],
        function (err) {
            checkError(err);
            cb(this.lastID);
        });
}

function deleteMessage(id, cb) {
    db.run('DELETE FROM messages WHERE id = ?', [id], (err) => {
        checkError(err);
        cb();
    });
}

function getFilename(id, cb) {
    db.get('SELECT filename FROM messages WHERE id = ?', [id], (err, row) => {
        checkError(err);
        cb(row.filename);
    });
}

module.exports = {
    readAllMessages: readAllMessages,
    insertMessage: insertMessage,
    deleteMessage: deleteMessage,
    getFilename: getFilename
};