import { MongoClient } from "mongodb";

const uri = process.env.DATABASE_URL!;
const options = {};

declare global {
  // نحطها هنا عشان TypeScript يفهم إنها موجودة
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

let client;
let clientPromise: Promise<MongoClient>;

if (!global._mongoClientPromise) {
  client = new MongoClient(uri, options);
  global._mongoClientPromise = client.connect();
}

clientPromise = global._mongoClientPromise;

export default clientPromise;
