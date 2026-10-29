/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');

// Load the same env files Next.js uses so migrations share the app's MONGODB_URI.
for (const file of ['.env.local', '.env']) {
  const envPath = path.resolve(__dirname, file);
  if (fs.existsSync(envPath) && typeof process.loadEnvFile === 'function') {
    process.loadEnvFile(envPath);
  }
}

// Credentials are passed separately so an @ in the password is not parsed as
// part of the connection string.
const mongoOptions = {};

if (process.env.MONGODB_USER && process.env.MONGODB_PASSWORD) {
  mongoOptions.auth = {
    username: process.env.MONGODB_USER,
    password: process.env.MONGODB_PASSWORD,
  };
  mongoOptions.authSource = 'admin';
}

const config = {
  mongodb: {
    url: process.env.MONGODB_URI,
    databaseName: process.env.MONGODB_DB || 'jobflow',
    options: mongoOptions,
  },
  migrationsDir: "migrations",
  changelogCollectionName: "changelog",
  migrationFileExtension: ".js",
  useFileHash: false,
  moduleSystem: 'commonjs',
};

module.exports = config;
