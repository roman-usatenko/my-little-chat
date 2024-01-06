const express = require('express');
const router = express.Router();
const multer = require('multer');
const db = require('../db');
const config = require('../config');

const UPLOAD_ROUTE = '/upload';
const DOWNLOAD_ROUTE = '/download/:id';

const storage = multer.diskStorage({
    destination: config.files,
    filename: (req, file, cb) => {
        const username = req.cookies.username;
        const filename = decodeURIComponent(file.originalname);
        const message = decodeURIComponent(req.body.message);
        db.insertMessage(username, message, filename, (id) => {
            cb(null, "" + id);
        });
    }
});
const upload = multer({ storage });

router.post(UPLOAD_ROUTE, upload.single('file'), (req, res) => {
    db.readAllMessages((rows) => {
        res.json(rows);
    });
});

router.get(DOWNLOAD_ROUTE, (req, res) => {
    const id = req.params.id;
    db.getFilename(id, (filename) => {
        if (filename) {
            res.download(config.files + `/${id}`, filename, (err) => {
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

module.exports = router;
