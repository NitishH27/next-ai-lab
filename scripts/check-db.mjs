import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { MongoClient } from "mongodb";

for (const file of [".env.local", ".env"]) {
  const envPath = resolve(process.cwd(), file);
  if (existsSync(envPath)) {
    if (typeof process.loadEnvFile === "function") {
      process.loadEnvFile(envPath);
    } else {
      console.warn("Node.js 20.12+ is required to load .env files automatically.");
    }
  }
}

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || "jobflow_dev";
const username = process.env.MONGODB_USER;
const password = process.env.MONGODB_PASSWORD;

if (!uri) {
  console.error("MONGODB_URI is missing. Add it to .env.local (see .env.example).");
  process.exit(1);
}

// Credentials stay separate so an @ in the password is never parsed from the URI.
const options = { serverSelectionTimeoutMS: 15000 };
if (username && password) {
  options.auth = { username, password };
  options.authSource = "admin";
}

const client = new MongoClient(uri, options);

try {
  await client.connect();
  await client.db("admin").command({ ping: 1 });
  const collections = await client.db(dbName).listCollections().toArray();
  const names = collections.map((collection) => collection.name).sort();
  console.log(`Connected to MongoDB database "${dbName}".`);
  console.log(`Collections: ${names.join(", ") || "(none)"}`);
} catch (error) {
  console.error(`MongoDB connection failed: ${error.message}`);
  console.error("Verify the database user and password in Atlas, the IP access list, and .env.local.");
  process.exitCode = 1;
} finally {
  await client.close();
}
