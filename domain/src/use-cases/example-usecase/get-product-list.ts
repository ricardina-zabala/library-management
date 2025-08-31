import type { ProductService } from "../../services/product-service.js";

export interface GetProductListDeps {
  productService: ProductService;
}

export async function getProductsList(deps: GetProductListDeps) {
  return await deps.productService.findAll();
}
