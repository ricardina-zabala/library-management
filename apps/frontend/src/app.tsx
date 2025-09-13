import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./pages/home.js";

export function App() {
  return (
    <div className="main">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}
