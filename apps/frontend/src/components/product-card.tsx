interface ProductCardProps {
  id: string;
  name: string;
  price: number;
}

export default function ProductCard({ id, name, price }: ProductCardProps) {
  return (
    <div className="productCard">
      <h2 className="titleCard">{name}</h2>
      <p className="priceCard">Precio: ${price.toFixed(2)}</p>
      <div className="containerProduct">
        <small>ID: {id}</small>
        <button>ver producto</button>
      </div>
    </div>
  );
}
