const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const db = require('./db');
const config = require('./config');

const app = express();

app.use(express.static(path.join(__dirname, 'static')));
app.use(cookieParser());
app.use(bodyParser.text({ type: 'text/*' }));

app.use('/messages', require('./routes/messages'));
app.use('/files', require('./routes/files'));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'static', 'index.html'));
});

app.get('/version', (req, res) => {
    res.send(config.version);
});

app.listen(config.port, () => {
    console.log(`Server v.${config.version} running on http://localhost:${config.port}`);
});
