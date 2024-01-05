const { exec } = require('child_process');

const exp = {};

exec('git rev-parse HEAD', (err, stdout, stderr) => {
    if (err) {
        exp.version = "unknown";
    } else {
        exp.version = stdout.slice(0, 8);
    }
});

module.exports = exp;