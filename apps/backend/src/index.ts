import cors from "cors";
import express from "express";
import type { Request, Response } from "express";
import sqlite from "better-sqlite3";
import { domainUseCases, type UseCaseName } from "app-domain";
import { DatabaseUserService } from "./service/user-service.js";
import { DatabaseBookService } from "./service/book-service.js";
import { DatabaseLoanService } from "./service/loan-service.js";

function createDb() {
  const db = sqlite(process.env.DATABASE_PATH || "data/data.db");
  db.pragma("journal_mode = WAL");

  db.prepare(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      firstName TEXT NOT NULL,
      lastName TEXT NOT NULL,
      role TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    )
  `).run();

  db.prepare(`
    CREATE TABLE IF NOT EXISTS books (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      author TEXT NOT NULL,
      isbn TEXT UNIQUE NOT NULL,
      category TEXT NOT NULL,
      publishedYear INTEGER NOT NULL,
      totalCopies INTEGER NOT NULL,
      availableCopies INTEGER NOT NULL,
      status TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    )
  `).run();

  db.prepare(`
    CREATE TABLE IF NOT EXISTS loans (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      bookId TEXT NOT NULL,
      loanDate TEXT NOT NULL,
      dueDate TEXT NOT NULL,
      returnDate TEXT,
      status TEXT NOT NULL,
      renewalCount INTEGER NOT NULL,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      FOREIGN KEY (userId) REFERENCES users (id),
      FOREIGN KEY (bookId) REFERENCES books (id)
    )
  `).run();

  return db;
}

const db = createDb();

const userService = new DatabaseUserService(db);
const bookService = new DatabaseBookService(db);
const loanService = new DatabaseLoanService(db);

const app = express();
const port = process.env.PORT || 3000;

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
  })
);

app.use(express.json());

const dependencies = {
  authService: userService,
  userService: userService,
  bookService: bookService,
  loanService: loanService,
};

app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
});

for (const key in domainUseCases) {
  const useCase = domainUseCases[key as UseCaseName];
  if (!useCase) break;

  app.post(`/${key}`, async (req: Request, res: Response) => {
    try {
      const payload = req.body;
      if (!payload && req.method === 'POST') {
        return res.status(400).json({ error: "Required data missing" });
      }
      const result = await useCase.useCase(dependencies, payload);
      res.json(result);
    } catch (error) {
      console.error(`Error in ${key}:`, error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
}

app.listen(port, () => {
  console.log(`Servidor backend escuchando en http://localhost:${port}`);
});
