module.exports = {
  apps: [{
    name: "transitnode-backend",
    script: "./src/server.js",
    env: {
      NODE_ENV: "development",
    },
    env_production: {
      NODE_ENV: "production",
    }
  }]
}
