const { execSync } = require('child_process');

const exp = {};

try {
    const stdout = execSync('git rev-parse HEAD');
    exp.version = stdout.toString().slice(0, 8);
} catch (err) {
    exp.version = "unknown";
}

module.exports = exp;