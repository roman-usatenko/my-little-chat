module.exports = {
    apps: [
        {
            name: 'my-little-chat-app',
            script: 'index.js',
            watch: false,
            env: {
                NODE_ENV: 'production'
            },
            post_update: ['npm install'],
        }
    ]
};
