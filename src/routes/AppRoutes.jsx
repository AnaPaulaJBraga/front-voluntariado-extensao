import { Navigate, Routes, Route } from "react-router-dom";
import Opportunities from "../pages/Opportunities/Opportunities";
import Login from "../pages/Login/Login";
import Register from "../pages/Register";
import Confirmation from "../pages/ConfirmEmail/Confirmation";
import ResendConfirmation from "../pages/ResendConfirmation/ResendConfirmation";
import About from "../pages/About";
import Organizations from "../pages/Organizations/Organizations";
import EditProfile from "../pages/EditProfile/editProfile";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/inicio" replace />} />
      <Route path="/oportunidades" element={<Opportunities />} />
      <Route path="/login" element={<Login />} />
      <Route path="/cadastro" element={<Register />} />
      <Route path="/confirmacao" element={<Confirmation />} />
      <Route path="/reenviar-confirmacao" element={<ResendConfirmation />} />
      <Route path="/editar-perfil" element={<EditProfile />} />
      <Route path="/sobre" element={<About />} />
      <Route path="/inicio" element={<Register />} />
      <Route path="/organizacoes" element={<Organizations />} />
    </Routes>
  );
};

export default AppRoutes;
