import type { Product } from "../../entities/product.js";
import type { ProductService } from "../product-service.js";

export class MockedProductService implements ProductService {
  products: Product[] = [];

  constructor(products: Product[]) {
    this.products = products;
  }

  async findById(id: string) {
    return this.products.find((p) => p.id == id);
  }

  async findAll() {
    return this.products;
  }
}
