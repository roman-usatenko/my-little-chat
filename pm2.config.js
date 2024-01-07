module.exports = {
    apps: [
        {
            name: 'my-little-chat-app',
            script: 'index.js',
            env: {
                NODE_ENV: 'production',
                PORT: 3000,
                HOST: 'localhost',
                DATA: 'data'
            }
        }
    ]
};
