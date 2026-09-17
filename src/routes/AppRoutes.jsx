import { Navigate, Routes, Route } from "react-router-dom";
import Opportunities from "../pages/Opportunities/Opportunities";
import Login from "../pages/Login/Login";
import Register from "../pages/Register";
import Confirmation from "../pages/ConfirmEmail/Confirmation";
import ResendConfirmation from "../pages/ResendConfirmation/ResendConfirmation";
import About from "../pages/About";
import Organizations from "../pages/Organizations/Organizations";
import EditProfile from "../pages/EditProfile/editProfile";
import Entity from "../pages/Entity/Entity";
import Home from "../pages/Home/Home";
import ListVacancies from "../pages/Vacancies/ListVacancies";
import CreateVacancy from "../pages/Vacancies/CreateVacancy";
import EditVacancy from "../pages/Vacancies/EditVacancy";

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
      <Route path="/inicio" element={<Home />} />
      <Route path="/organizacoes" element={<Organizations />} />
      <Route path="/entidade/cadastro" element={<Entity />} />
      <Route path="/vagas" element={<ListVacancies />} />
      <Route path="/vagas/cadastro" element={<CreateVacancy />} />
      <Route path="/vagas/:id/editar" element={<EditVacancy />} />
    </Routes>
  );
};

export default AppRoutes;
