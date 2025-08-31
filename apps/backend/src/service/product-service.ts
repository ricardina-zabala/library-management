import type { ProductService } from "app-domain";
import { type Database } from "better-sqlite3";

interface ProductSQL {
  id: string;
  name: string;
  price: number;
}

export class ProductServiceImplementation implements ProductService {
  db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  async findById(id: string) {
    const product = this.db
      .prepare<any, ProductSQL>("SELECT * FROM products WHERE id = ?")
      .get(id);

    return product;
  }

  async findAll() {
    const products = this.db
      .prepare<unknown[], ProductSQL>("SELECT * FROM products")
      .all();

    return products;
  }
}
