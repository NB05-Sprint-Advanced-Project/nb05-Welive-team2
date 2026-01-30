module.exports = {
  apps: [
    {
      name: 'my-app',
      script: 'dist/index.js',
      env: {
        NODE_ENV: 'production',
        PORT: 4000,
      },
    },
  ],
};
