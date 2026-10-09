import { Routes, Route } from "react-router";
import Layout from "./components/Layout";
import CanvasPage from "./pages/CanvasPage";
import LoginPage from "./pages/LoginPage";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<CanvasPage />} />
        <Route path="/login" element={<LoginPage />} />
      </Route>
    </Routes>
  );
}