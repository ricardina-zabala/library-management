import type { ProductService } from "../../services/product-service.js";

interface GetProductDeps {
  productService: ProductService;
}

interface GetProductPayload {
  id: string;
}

export async function getProduct(
  deps: GetProductDeps,
  payload: GetProductPayload
) {
  if (!payload.id) return;

  return await deps.productService.findById(payload.id);
}
