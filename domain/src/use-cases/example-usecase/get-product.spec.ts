import { describe, expect, test } from "vitest";
import { getProduct } from "./get-product.js";
import { MockedProductService } from "../../services/mocks/mock-product-service.js";

describe("GetProduct", async () => {
  const productService = new MockedProductService([
    { id: "1", name: "test", price: 10 },
  ]);

  test("with a valid id, should return a product", async () => {
    const result = await getProduct({ productService }, { id: "1" });

    expect(result).toStrictEqual({ id: "1", name: "test", price: 10 });
  });

  test("should return undefined", async () => {
    const result = await getProduct({ productService }, { id: "2" });

    expect(result).toBeUndefined();
  });
});
