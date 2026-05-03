import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AnalyzeRepo from "./components/AnalyzeRepo";

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<App />} />

      <Route path="/analyze" element={<AnalyzeRepo />} />
    </Routes>
  </BrowserRouter>,
);
