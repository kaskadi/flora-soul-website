module.exports = {
  apps: [
    {
      name: 'Florasoul admin',
      script: './index.js',
      watch: true,
      exec_mode: 'cluster',
      instances: 1
    },
    {
      name: 'Florasoul admin - Image API',
      script: './services/images/index.js',
      watch: true,
      exec_mode: 'cluster',
      instances: 1
    }
  ]
}
