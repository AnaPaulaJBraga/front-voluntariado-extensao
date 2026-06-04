import { Routes, Route } from "react-router-dom";
import Opportunities from "../pages/Opportunities/Opportunities";
import Login from "../pages/Login/Login";
import Register from "../pages/Register";
import About from "../pages/About";
import Organizations from "../pages/Organizations/Organizations";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/oportunidades" element={<Opportunities />} />
      <Route path="/login" element={<Login />} />
      <Route path="/cadastro" element={<Register />} />
      <Route path="/sobre" element={<About />} />
      <Route path="/inicio" element={<Register />} />
      <Route path="/organizacoes" element={<Organizations />} />
    </Routes>
  );
};

export default AppRoutes;
