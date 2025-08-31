import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./pages/home.js";
import ProductDetail from "./pages/product-detail.js";

export function App() {
  return (
    <div className="main">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/product/:id" element={<ProductDetail />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}
