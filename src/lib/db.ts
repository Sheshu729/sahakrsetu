import Database from "better-sqlite3";
import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "homework.db");
const LEGACY_JSON = path.join(DATA_DIR, "db.json");

export interface UserRecord {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  password_hash: string;
  role: "owner" | "worker" | "admin";
  avatar_url: string | null;
  bio: string;
  skills: string[];
  created_at: string;
}

export interface JobRecord {
  id: string;
  owner_id: string;
  title: string;
  description: string;
  category: string;
  budget: number;
  location: string;
  pincode: string;
  media_urls: string[];
  status: "open" | "assigned" | "completed" | "cancelled";
  created_at: string;
}

export interface ApplicationRecord {
  id: string;
  job_id: string;
  worker_id: string;
  message: string;
  proposed_rate: number;
  status: "pending" | "accepted" | "rejected";
  created_at: string;
}

export interface ReviewRecord {
  id: string;
  job_id: string;
  reviewer_id: string;
  reviewee_id: string;
  rating: number;
  comment: string;
  created_at: string;
}

export interface ConversationRecord {
  id: string;
  job_id: string;
  owner_id: string;
  worker_id: string;
  created_at: string;
}

export interface MessageRecord {
  id: string;
  conversation_id: string;
  sender_id: string;
  text: string;
  read: boolean;
  created_at: string;
}

export interface PaymentRecord {
  id: string;
  job_id: string;
  payer_id: string;
  payee_id: string;
  amount: number;
  status: "pending" | "completed" | "failed";
  razorpay_order_id: string | null;
  created_at: string;
  paid_at: string | null;
}

let _db: Database.Database | null = null;

function getDb(): Database.Database {
  if (_db) return _db;
  fs.mkdirSync(DATA_DIR, { recursive: true });
  _db = new Database(DB_PATH);
  _db.pragma("journal_mode = WAL");
  _db.pragma("foreign_keys = ON");
  migrate(_db);
  importLegacyJson(_db);
  return _db;
}

function migrate(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      full_name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      phone TEXT NOT NULL DEFAULT '',
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL,
      avatar_url TEXT,
      bio TEXT NOT NULL DEFAULT '',
      skills TEXT NOT NULL DEFAULT '[]',
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS jobs (
      id TEXT PRIMARY KEY,
      owner_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      category TEXT NOT NULL,
      budget REAL NOT NULL DEFAULT 0,
      location TEXT NOT NULL,
      pincode TEXT NOT NULL DEFAULT '',
      media_urls TEXT NOT NULL DEFAULT '[]',
      status TEXT NOT NULL DEFAULT 'open',
      created_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_jobs_owner ON jobs(owner_id);
    CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
    CREATE TABLE IF NOT EXISTS applications (
      id TEXT PRIMARY KEY,
      job_id TEXT NOT NULL,
      worker_id TEXT NOT NULL,
      message TEXT NOT NULL,
      proposed_rate REAL NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'pending',
      created_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_apps_job ON applications(job_id);
    CREATE INDEX IF NOT EXISTS idx_apps_worker ON applications(worker_id);
    CREATE TABLE IF NOT EXISTS reviews (
      id TEXT PRIMARY KEY,
      job_id TEXT NOT NULL,
      reviewer_id TEXT NOT NULL,
      reviewee_id TEXT NOT NULL,
      rating INTEGER NOT NULL,
      comment TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS conversations (
      id TEXT PRIMARY KEY,
      job_id TEXT NOT NULL,
      owner_id TEXT NOT NULL,
      worker_id TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      conversation_id TEXT NOT NULL,
      sender_id TEXT NOT NULL,
      text TEXT NOT NULL,
      read INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_msgs_conv ON messages(conversation_id);
    CREATE TABLE IF NOT EXISTS payments (
      id TEXT PRIMARY KEY,
      job_id TEXT NOT NULL UNIQUE,
      payer_id TEXT NOT NULL,
      payee_id TEXT NOT NULL,
      amount REAL NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      razorpay_order_id TEXT,
      created_at TEXT NOT NULL,
      paid_at TEXT
    );
  `);

  const jobCols = db.pragma("table_info(jobs)") as { name: string }[];
  if (!jobCols.some((c) => c.name === "pincode")) {
    db.exec("ALTER TABLE jobs ADD COLUMN pincode TEXT NOT NULL DEFAULT ''");
  }
}

function importLegacyJson(db: Database.Database) {
  if (!fs.existsSync(LEGACY_JSON)) return;
  const count = db.prepare("SELECT COUNT(*) AS c FROM users").get() as { c: number };
  if (count.c > 0) return;
  try {
    const raw = JSON.parse(fs.readFileSync(LEGACY_JSON, "utf-8"));
    const tx = db.transaction(() => {
      for (const u of raw.users || []) {
        db.prepare(
          `INSERT OR IGNORE INTO users (id, full_name, email, phone, password_hash, role, avatar_url, bio, skills, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        ).run(
          u.id, u.full_name, u.email, u.phone || "", u.password_hash, u.role,
          u.avatar_url ?? null, u.bio || "", JSON.stringify(u.skills || []), u.created_at
        );
      }
      for (const j of raw.jobs || []) {
        db.prepare(
          `INSERT OR IGNORE INTO jobs (id, owner_id, title, description, category, budget, location, pincode, media_urls, status, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        ).run(
          j.id, j.owner_id, j.title, j.description, j.category, j.budget || 0,
          j.location || "", j.pincode || "", JSON.stringify(j.media_urls || []),
          j.status || "open", j.created_at
        );
      }
      for (const a of raw.applications || []) {
        db.prepare(
          `INSERT OR IGNORE INTO applications (id, job_id, worker_id, message, proposed_rate, status, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?)`
        ).run(a.id, a.job_id, a.worker_id, a.message || "", a.proposed_rate || 0, a.status || "pending", a.created_at);
      }
      for (const r of raw.reviews || []) {
        db.prepare(
          `INSERT OR IGNORE INTO reviews (id, job_id, reviewer_id, reviewee_id, rating, comment, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?)`
        ).run(r.id, r.job_id, r.reviewer_id, r.reviewee_id, r.rating, r.comment || "", r.created_at);
      }
      for (const c of raw.conversations || []) {
        db.prepare(
          `INSERT OR IGNORE INTO conversations (id, job_id, owner_id, worker_id, created_at) VALUES (?, ?, ?, ?, ?)`
        ).run(c.id, c.job_id, c.owner_id, c.worker_id, c.created_at);
      }
      for (const m of raw.messages || []) {
        db.prepare(
          `INSERT OR IGNORE INTO messages (id, conversation_id, sender_id, text, read, created_at) VALUES (?, ?, ?, ?, ?, ?)`
        ).run(m.id, m.conversation_id, m.sender_id, m.text, m.read ? 1 : 0, m.created_at);
      }
    });
    tx();
    fs.renameSync(LEGACY_JSON, `${LEGACY_JSON}.imported`);
  } catch {
    // legacy import is best-effort
  }
}

function parseJson<T>(value: string, fallback: T): T {
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function rowToUser(row: Record<string, unknown>): UserRecord {
  return {
    id: row.id as string,
    full_name: row.full_name as string,
    email: row.email as string,
    phone: row.phone as string,
    password_hash: row.password_hash as string,
    role: row.role as UserRecord["role"],
    avatar_url: (row.avatar_url as string | null) ?? null,
    bio: (row.bio as string) || "",
    skills: parseJson<string[]>(row.skills as string, []),
    created_at: row.created_at as string,
  };
}

function rowToJob(row: Record<string, unknown>): JobRecord {
  return {
    id: row.id as string,
    owner_id: row.owner_id as string,
    title: row.title as string,
    description: row.description as string,
    category: row.category as string,
    budget: Number(row.budget) || 0,
    location: (row.location as string) || "",
    pincode: (row.pincode as string) || "",
    media_urls: parseJson<string[]>(row.media_urls as string, []),
    status: row.status as JobRecord["status"],
    created_at: row.created_at as string,
  };
}

// Users
export async function getUsers(): Promise<UserRecord[]> {
  return (getDb().prepare("SELECT * FROM users").all() as Record<string, unknown>[]).map(rowToUser);
}

export async function getUserByEmail(email: string): Promise<UserRecord | undefined> {
  const row = getDb().prepare("SELECT * FROM users WHERE email = ?").get(email.toLowerCase());
  return row ? rowToUser(row as Record<string, unknown>) : undefined;
}

export async function getUserById(id: string): Promise<UserRecord | undefined> {
  const row = getDb().prepare("SELECT * FROM users WHERE id = ?").get(id);
  return row ? rowToUser(row as Record<string, unknown>) : undefined;
}

export async function createUser(user: UserRecord): Promise<UserRecord> {
  getDb()
    .prepare(
      `INSERT INTO users (id, full_name, email, phone, password_hash, role, avatar_url, bio, skills, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      user.id, user.full_name, user.email, user.phone, user.password_hash, user.role,
      user.avatar_url, user.bio, JSON.stringify(user.skills), user.created_at
    );
  return user;
}

export async function updateUser(id: string, updates: Partial<UserRecord>): Promise<UserRecord | null> {
  const existing = await getUserById(id);
  if (!existing) return null;
  const merged = { ...existing, ...updates };
  getDb()
    .prepare(
      `UPDATE users SET full_name = ?, phone = ?, avatar_url = ?, bio = ?, skills = ?, role = ?, password_hash = ? WHERE id = ?`
    )
    .run(merged.full_name, merged.phone, merged.avatar_url, merged.bio, JSON.stringify(merged.skills), merged.role, merged.password_hash, id);
  return merged;
}

// Jobs
export async function getJobs(filters?: {
  owner_id?: string;
  status?: string;
  category?: string;
  search?: string;
  pincode?: string;
  page?: number;
  limit?: number;
}): Promise<{ items: JobRecord[]; total: number }> {
  const where: string[] = [];
  const params: unknown[] = [];
  if (filters?.owner_id) {
    where.push("owner_id = ?");
    params.push(filters.owner_id);
  }
  if (filters?.status) {
    where.push("status = ?");
    params.push(filters.status);
  }
  if (filters?.category) {
    where.push("category = ?");
    params.push(filters.category);
  }
  if (filters?.pincode) {
    where.push("pincode = ?");
    params.push(filters.pincode);
  }
  if (filters?.search) {
    where.push("(LOWER(title) LIKE ? OR LOWER(description) LIKE ? OR LOWER(location) LIKE ? OR pincode LIKE ?)");
    const q = `%${filters.search.toLowerCase()}%`;
    params.push(q, q, q, `%${filters.search}%`);
  }
  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";
  const total = (getDb().prepare(`SELECT COUNT(*) AS c FROM jobs ${whereSql}`).get(...params) as { c: number }).c;
  const page = filters?.page || 1;
  const limit = filters?.limit || 50;
  const rows = getDb()
    .prepare(`SELECT * FROM jobs ${whereSql} ORDER BY created_at DESC LIMIT ? OFFSET ?`)
    .all(...params, limit, (page - 1) * limit) as Record<string, unknown>[];
  return { items: rows.map(rowToJob), total };
}

export async function getJobById(id: string): Promise<JobRecord | undefined> {
  const row = getDb().prepare("SELECT * FROM jobs WHERE id = ?").get(id);
  return row ? rowToJob(row as Record<string, unknown>) : undefined;
}

export async function createJob(job: JobRecord): Promise<JobRecord> {
  getDb()
    .prepare(
      `INSERT INTO jobs (id, owner_id, title, description, category, budget, location, pincode, media_urls, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      job.id, job.owner_id, job.title, job.description, job.category, job.budget,
      job.location, job.pincode || "", JSON.stringify(job.media_urls), job.status, job.created_at
    );
  return job;
}

export async function updateJob(id: string, updates: Partial<JobRecord>): Promise<JobRecord | null> {
  const existing = await getJobById(id);
  if (!existing) return null;
  const merged = { ...existing, ...updates };
  getDb()
    .prepare(
      `UPDATE jobs SET title = ?, description = ?, category = ?, budget = ?, location = ?, pincode = ?, media_urls = ?, status = ? WHERE id = ?`
    )
    .run(
      merged.title, merged.description, merged.category, merged.budget, merged.location,
      merged.pincode || "", JSON.stringify(merged.media_urls), merged.status, id
    );
  return merged;
}

export async function deleteJob(id: string): Promise<void> {
  const db = getDb();
  const tx = db.transaction(() => {
    db.prepare("DELETE FROM applications WHERE job_id = ?").run(id);
    db.prepare("DELETE FROM reviews WHERE job_id = ?").run(id);
    db.prepare("DELETE FROM messages WHERE conversation_id IN (SELECT id FROM conversations WHERE job_id = ?)").run(id);
    db.prepare("DELETE FROM conversations WHERE job_id = ?").run(id);
    db.prepare("DELETE FROM payments WHERE job_id = ?").run(id);
    db.prepare("DELETE FROM jobs WHERE id = ?").run(id);
  });
  tx();
}

// Applications
export async function getApplications(filters?: {
  job_id?: string;
  worker_id?: string;
}): Promise<ApplicationRecord[]> {
  const where: string[] = [];
  const params: unknown[] = [];
  if (filters?.job_id) {
    where.push("job_id = ?");
    params.push(filters.job_id);
  }
  if (filters?.worker_id) {
    where.push("worker_id = ?");
    params.push(filters.worker_id);
  }
  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";
  const rows = getDb()
    .prepare(`SELECT * FROM applications ${whereSql} ORDER BY created_at DESC`)
    .all(...params) as Record<string, unknown>[];
  return rows.map((row) => ({
    id: row.id as string,
    job_id: row.job_id as string,
    worker_id: row.worker_id as string,
    message: row.message as string,
    proposed_rate: Number(row.proposed_rate) || 0,
    status: row.status as ApplicationRecord["status"],
    created_at: row.created_at as string,
  }));
}

export async function getApplicationById(id: string): Promise<ApplicationRecord | undefined> {
  const row = getDb().prepare("SELECT * FROM applications WHERE id = ?").get(id) as Record<string, unknown> | undefined;
  if (!row) return undefined;
  return {
    id: row.id as string,
    job_id: row.job_id as string,
    worker_id: row.worker_id as string,
    message: row.message as string,
    proposed_rate: Number(row.proposed_rate) || 0,
    status: row.status as ApplicationRecord["status"],
    created_at: row.created_at as string,
  };
}

export async function createApplication(app: ApplicationRecord): Promise<ApplicationRecord> {
  getDb()
    .prepare(
      `INSERT INTO applications (id, job_id, worker_id, message, proposed_rate, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)`
    )
    .run(app.id, app.job_id, app.worker_id, app.message, app.proposed_rate, app.status, app.created_at);
  return app;
}

export async function updateApplication(id: string, updates: Partial<ApplicationRecord>): Promise<ApplicationRecord | null> {
  const existing = await getApplicationById(id);
  if (!existing) return null;
  const merged = { ...existing, ...updates };
  getDb()
    .prepare("UPDATE applications SET message = ?, proposed_rate = ?, status = ? WHERE id = ?")
    .run(merged.message, merged.proposed_rate, merged.status, id);
  return merged;
}

// Reviews
export async function getReviews(filters?: {
  reviewee_id?: string;
  job_id?: string;
}): Promise<ReviewRecord[]> {
  const where: string[] = [];
  const params: unknown[] = [];
  if (filters?.reviewee_id) {
    where.push("reviewee_id = ?");
    params.push(filters.reviewee_id);
  }
  if (filters?.job_id) {
    where.push("job_id = ?");
    params.push(filters.job_id);
  }
  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";
  const rows = getDb()
    .prepare(`SELECT * FROM reviews ${whereSql} ORDER BY created_at DESC`)
    .all(...params) as Record<string, unknown>[];
  return rows.map((row) => ({
    id: row.id as string,
    job_id: row.job_id as string,
    reviewer_id: row.reviewer_id as string,
    reviewee_id: row.reviewee_id as string,
    rating: Number(row.rating),
    comment: (row.comment as string) || "",
    created_at: row.created_at as string,
  }));
}

export async function createReview(review: ReviewRecord): Promise<ReviewRecord> {
  getDb()
    .prepare(
      `INSERT INTO reviews (id, job_id, reviewer_id, reviewee_id, rating, comment, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)`
    )
    .run(review.id, review.job_id, review.reviewer_id, review.reviewee_id, review.rating, review.comment, review.created_at);
  return review;
}

export async function getAverageRating(userId: string): Promise<number> {
  const row = getDb()
    .prepare("SELECT AVG(rating) AS avg FROM reviews WHERE reviewee_id = ?")
    .get(userId) as { avg: number | null };
  return row?.avg ?? 0;
}

// Conversations
export async function getConversations(userId: string): Promise<ConversationRecord[]> {
  const rows = getDb()
    .prepare("SELECT * FROM conversations WHERE owner_id = ? OR worker_id = ? ORDER BY created_at DESC")
    .all(userId, userId) as Record<string, unknown>[];
  return rows.map((row) => ({
    id: row.id as string,
    job_id: row.job_id as string,
    owner_id: row.owner_id as string,
    worker_id: row.worker_id as string,
    created_at: row.created_at as string,
  }));
}

export async function getConversation(id: string): Promise<ConversationRecord | undefined> {
  const row = getDb().prepare("SELECT * FROM conversations WHERE id = ?").get(id) as Record<string, unknown> | undefined;
  if (!row) return undefined;
  return {
    id: row.id as string,
    job_id: row.job_id as string,
    owner_id: row.owner_id as string,
    worker_id: row.worker_id as string,
    created_at: row.created_at as string,
  };
}

export async function findConversation(
  job_id: string,
  owner_id: string,
  worker_id: string
): Promise<ConversationRecord | undefined> {
  const row = getDb()
    .prepare("SELECT * FROM conversations WHERE job_id = ? AND owner_id = ? AND worker_id = ?")
    .get(job_id, owner_id, worker_id) as Record<string, unknown> | undefined;
  if (!row) return undefined;
  return {
    id: row.id as string,
    job_id: row.job_id as string,
    owner_id: row.owner_id as string,
    worker_id: row.worker_id as string,
    created_at: row.created_at as string,
  };
}

export async function createConversation(conv: ConversationRecord): Promise<ConversationRecord> {
  getDb()
    .prepare("INSERT INTO conversations (id, job_id, owner_id, worker_id, created_at) VALUES (?, ?, ?, ?, ?)")
    .run(conv.id, conv.job_id, conv.owner_id, conv.worker_id, conv.created_at);
  return conv;
}

// Messages
export async function getMessages(conversation_id: string): Promise<MessageRecord[]> {
  const rows = getDb()
    .prepare("SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at ASC")
    .all(conversation_id) as Record<string, unknown>[];
  return rows.map((row) => ({
    id: row.id as string,
    conversation_id: row.conversation_id as string,
    sender_id: row.sender_id as string,
    text: row.text as string,
    read: Boolean(row.read),
    created_at: row.created_at as string,
  }));
}

export async function createMessage(msg: MessageRecord): Promise<MessageRecord> {
  getDb()
    .prepare("INSERT INTO messages (id, conversation_id, sender_id, text, read, created_at) VALUES (?, ?, ?, ?, ?, ?)")
    .run(msg.id, msg.conversation_id, msg.sender_id, msg.text, msg.read ? 1 : 0, msg.created_at);
  return msg;
}

export async function markMessagesRead(conversation_id: string, userId: string): Promise<void> {
  getDb()
    .prepare("UPDATE messages SET read = 1 WHERE conversation_id = ? AND sender_id != ?")
    .run(conversation_id, userId);
}

export async function getUnreadCount(userId: string): Promise<number> {
  const row = getDb()
    .prepare(
      `SELECT COUNT(*) AS c FROM messages m
       JOIN conversations c ON c.id = m.conversation_id
       WHERE (c.owner_id = ? OR c.worker_id = ?) AND m.sender_id != ? AND m.read = 0`
    )
    .get(userId, userId, userId) as { c: number };
  return row.c;
}

// Payments
export async function getPaymentByJob(job_id: string): Promise<PaymentRecord | undefined> {
  const row = getDb().prepare("SELECT * FROM payments WHERE job_id = ?").get(job_id) as Record<string, unknown> | undefined;
  if (!row) return undefined;
  return {
    id: row.id as string,
    job_id: row.job_id as string,
    payer_id: row.payer_id as string,
    payee_id: row.payee_id as string,
    amount: Number(row.amount) || 0,
    status: row.status as PaymentRecord["status"],
    razorpay_order_id: (row.razorpay_order_id as string | null) ?? null,
    created_at: row.created_at as string,
    paid_at: (row.paid_at as string | null) ?? null,
  };
}

export async function createPayment(payment: PaymentRecord): Promise<PaymentRecord> {
  getDb()
    .prepare(
      `INSERT INTO payments (id, job_id, payer_id, payee_id, amount, status, razorpay_order_id, created_at, paid_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      payment.id, payment.job_id, payment.payer_id, payment.payee_id, payment.amount,
      payment.status, payment.razorpay_order_id, payment.created_at, payment.paid_at
    );
  return payment;
}

export async function updatePayment(id: string, updates: Partial<PaymentRecord>): Promise<PaymentRecord | null> {
  const row = getDb().prepare("SELECT * FROM payments WHERE id = ?").get(id) as Record<string, unknown> | undefined;
  if (!row) return null;
  const merged: PaymentRecord = {
    id: row.id as string,
    job_id: row.job_id as string,
    payer_id: row.payer_id as string,
    payee_id: row.payee_id as string,
    amount: Number(row.amount) || 0,
    status: row.status as PaymentRecord["status"],
    razorpay_order_id: (row.razorpay_order_id as string | null) ?? null,
    created_at: row.created_at as string,
    paid_at: (row.paid_at as string | null) ?? null,
    ...updates,
  };
  getDb()
    .prepare("UPDATE payments SET status = ?, razorpay_order_id = ?, paid_at = ?, amount = ? WHERE id = ?")
    .run(merged.status, merged.razorpay_order_id, merged.paid_at, merged.amount, id);
  return merged;
}

// Stats (for landing page / admin)
export async function getStats() {
  const db = getDb();
  const users = (db.prepare("SELECT COUNT(*) AS c FROM users").get() as { c: number }).c;
  const workers = (db.prepare("SELECT COUNT(*) AS c FROM users WHERE role = 'worker'").get() as { c: number }).c;
  const jobs = (db.prepare("SELECT COUNT(*) AS c FROM jobs").get() as { c: number }).c;
  const completedJobs = (db.prepare("SELECT COUNT(*) AS c FROM jobs WHERE status = 'completed'").get() as { c: number }).c;
  const applications = (db.prepare("SELECT COUNT(*) AS c FROM applications").get() as { c: number }).c;
  const reviewsRow = db.prepare("SELECT COUNT(*) AS c, AVG(rating) AS avg FROM reviews").get() as {
    c: number;
    avg: number | null;
  };
  return {
    total_users: users,
    total_workers: workers,
    total_jobs: jobs,
    total_completed_jobs: completedJobs,
    total_applications: applications,
    total_reviews: reviewsRow.c,
    avg_rating: reviewsRow.avg ? Math.round(reviewsRow.avg * 10) / 10 : 0,
  };
}
