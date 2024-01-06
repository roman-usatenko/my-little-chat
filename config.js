const { execSync } = require('child_process');

const config = {};

config.port = process.env.PORT || 3000;
config.db = "data/database.db";
config.files = "data/files";

try {
    const stdout = execSync('git rev-parse HEAD');
    config.version = stdout.toString().slice(0, 8);
} catch (err) {
    config.version = "unknown";
}

module.exports = config;