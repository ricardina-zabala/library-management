import cors from "cors";
import express from "express";
import type { Request, Response } from "express";
import sqlite from "better-sqlite3";
import { ProductServiceImplementation } from "./service/product-service.js";
import { domainUseCases, type UseCaseName } from "app-domain";

function createDb() {
  const db = sqlite("data/data.db");
  db.pragma("journal_mode = WAL");

  db.prepare(
    "CREATE TABLE IF NOT EXISTS products (id TEXT PRIMARY KEY, name TEXT, price INTEGER)"
  ).run();
  return db;
}

const db = createDb();

const app = express();
const port = process.env.PORT || 3000;

app.use(
  cors({
    origin: "http://localhost:5173",
  })
);

app.use(express.json());

const dependencies = {
  productService: new ProductServiceImplementation(db),
};

for (const key in domainUseCases) {
  const useCase = domainUseCases[key as UseCaseName];
  if (!useCase) break;

  app.post(`/${key}`, async (req: Request, res: Response) => {
    const payload = req.body;
    if (!payload) {
      return res.status(400).send("Required data missing");
    }
    const result = await useCase.useCase(dependencies, payload);
    res.json(result);
  });
}

app.listen(port, () => {
  console.log(`Servidor backend escuchando en http://localhost:${port}`);
});
