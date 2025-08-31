import { useEffect, useState } from "react";
import ProductCard from "../components/product-card.js";
import { api } from "../controller/api-controller.js";
import type { Product } from "app-domain";

export default function Home() {
  const [products, setProducts] = useState<Product[]>();

  useEffect(() => {
    async function fetchData() {
      const result: Product[] = await api("getProductsList");
      console.log(result);
      if (result) {
        setProducts(result);
      }
    }
    fetchData();
  }, []);

  if (!products) return <div>No hay nada que mostrar</div>;

  return (
    <div>
      {products.map((p) => (
        <ProductCard id={p.id} name={p.name} price={p.price} />
      ))}
    </div>
  );
}
