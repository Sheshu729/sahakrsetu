/* Seed demo data into SQLite: npm run seed */
import Database from "better-sqlite3";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, "..", "data");
const DB_PATH = path.join(DATA_DIR, "homework.db");

fs.mkdirSync(DATA_DIR, { recursive: true });
const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY, full_name TEXT NOT NULL, email TEXT NOT NULL UNIQUE,
    phone TEXT NOT NULL DEFAULT '', password_hash TEXT NOT NULL, role TEXT NOT NULL,
    avatar_url TEXT, bio TEXT NOT NULL DEFAULT '', skills TEXT NOT NULL DEFAULT '[]',
    created_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS jobs (
    id TEXT PRIMARY KEY, owner_id TEXT NOT NULL, title TEXT NOT NULL,
    description TEXT NOT NULL, category TEXT NOT NULL, budget REAL NOT NULL DEFAULT 0,
    location TEXT NOT NULL, pincode TEXT NOT NULL DEFAULT '',
    media_urls TEXT NOT NULL DEFAULT '[]', status TEXT NOT NULL DEFAULT 'open',
    created_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS applications (
    id TEXT PRIMARY KEY, job_id TEXT NOT NULL, worker_id TEXT NOT NULL,
    message TEXT NOT NULL, proposed_rate REAL NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'pending', created_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS reviews (
    id TEXT PRIMARY KEY, job_id TEXT NOT NULL, reviewer_id TEXT NOT NULL,
    reviewee_id TEXT NOT NULL, rating INTEGER NOT NULL, comment TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS conversations (
    id TEXT PRIMARY KEY, job_id TEXT NOT NULL, owner_id TEXT NOT NULL,
    worker_id TEXT NOT NULL, created_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY, conversation_id TEXT NOT NULL, sender_id TEXT NOT NULL,
    text TEXT NOT NULL, read INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS payments (
    id TEXT PRIMARY KEY, job_id TEXT NOT NULL UNIQUE, payer_id TEXT NOT NULL,
    payee_id TEXT NOT NULL, amount REAL NOT NULL, status TEXT NOT NULL DEFAULT 'pending',
    razorpay_order_id TEXT, created_at TEXT NOT NULL, paid_at TEXT
  );
`);

const count = db.prepare("SELECT COUNT(*) AS c FROM users").get().c;
if (count > 0 && !process.env.SEED_FORCE) {
  console.log("DB already has users. Delete data/homework.db or set SEED_FORCE=1 to reseed.");
  process.exit(0);
}

if (count > 0) {
  db.exec("DELETE FROM messages; DELETE FROM conversations; DELETE FROM payments; DELETE FROM reviews; DELETE FROM applications; DELETE FROM jobs; DELETE FROM users;");
}

const now = new Date().toISOString();
const hash = bcrypt.hashSync("demo123", 10);
const id = () => crypto.randomUUID();

const owner = {
  id: id(),
  full_name: "Asha Owner",
  email: "owner@demo.com",
  phone: "9876500001",
  password_hash: hash,
  role: "owner",
  avatar_url: null,
  bio: "Homeowner in Indiranagar",
  skills: "[]",
  created_at: now,
};
const worker = {
  id: id(),
  full_name: "Ravi Kumar",
  email: "worker@demo.com",
  phone: "9876500002",
  password_hash: hash,
  role: "worker",
  avatar_url: null,
  bio: "10+ years in plumbing and electrical work",
  skills: JSON.stringify(["Plumbing", "Electrical", "Appliance Repair"]),
  created_at: now,
};
const admin = {
  id: id(),
  full_name: "Admin",
  email: "admin@homework.com",
  phone: "9876500000",
  password_hash: bcrypt.hashSync("admin123", 10),
  role: "admin",
  avatar_url: null,
  bio: "",
  skills: "[]",
  created_at: now,
};

const insertUser = db.prepare(
  `INSERT INTO users (id, full_name, email, phone, password_hash, role, avatar_url, bio, skills, created_at)
   VALUES (@id, @full_name, @email, @phone, @password_hash, @role, @avatar_url, @bio, @skills, @created_at)`
);
insertUser.run(owner);
insertUser.run(worker);
insertUser.run(admin);

const job1 = {
  id: id(),
  owner_id: owner.id,
  title: "Leaking kitchen pipe under sink",
  description:
    "There is a steady leak under the kitchen sink. Water is pooling in the cabinet. Need someone today if possible.",
  category: "plumbing",
  budget: 600,
  location: "Indiranagar, Bengaluru",
  pincode: "560038",
  media_urls: "[]",
  status: "open",
  created_at: now,
};
const job2 = {
  id: id(),
  owner_id: owner.id,
  title: "Replace 3 bedroom light fixtures",
  description:
    "Three ceiling light fixtures need replacing. Materials already purchased. Evening or weekend slots preferred.",
  category: "electrical",
  budget: 900,
  location: "Koramangala, Bengaluru",
  pincode: "560034",
  media_urls: "[]",
  status: "open",
  created_at: now,
};

const insertJob = db.prepare(
  `INSERT INTO jobs (id, owner_id, title, description, category, budget, location, pincode, media_urls, status, created_at)
   VALUES (@id, @owner_id, @title, @description, @category, @budget, @location, @pincode, @media_urls, @status, @created_at)`
);
insertJob.run(job1);
insertJob.run(job2);

console.log("Seeded demo data.");
console.log("  Owner:  owner@demo.com / demo123");
console.log("  Worker: worker@demo.com / demo123");
console.log("  Admin:  admin@homework.com / admin123");
