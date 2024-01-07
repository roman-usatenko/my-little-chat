const { execSync } = require('child_process');
const sanitizeHtml = require('sanitize-html');

const config = {};

config.port = process.env.PORT || 3000;
config.host = process.env.HOST || 'localhost';
config.dataPath = process.env.DATA || 'data';
config.db = config.dataPath + "/database.db";
config.files = config.dataPath + "/files";

try {
    const stdout = execSync('git rev-parse HEAD');
    config.version = stdout.toString().slice(0, 8);
} catch (err) {
    config.version = "unknown";
}

// defining utility functions

function getUsername(request) {
    var username = 'Anonymous';
    if(request.cookies && request.cookies.username) {
        username = request.cookies.username;
    } 
    const sanitizedUsername = username.replace(/[^a-zA-Z0-9\s._-]/g, '').trim();
    return sanitizedUsername;
}

function sanitizeMessage(message) {
    const sanitizedMessage = sanitizeHtml(message, {
        allowedTags: sanitizeHtml.defaults.allowedTags.concat([ 'img' ]),
        allowedAttributes: {'img': ['src']},
        allowedSchemes: [ 'data']
    });
    if(sanitizedMessage !== message) {
        console.log(`Message sanitized: ${message} -> ${sanitizedMessage}`);
    }
    return sanitizedMessage;
}

const utils = {
    getUsername,
    sanitizeMessage
};

config.utils = utils;

module.exports = config;