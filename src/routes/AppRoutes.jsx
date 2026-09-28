import { Navigate, Routes, Route } from "react-router-dom";
import Opportunities from "../pages/Opportunities/Opportunities";
import Login from "../pages/Login/Login";
import Register from "../pages/Register";
import Confirmation from "../pages/ConfirmEmail/Confirmation";
import ResendConfirmation from "../pages/ResendConfirmation/ResendConfirmation";

import Home from "../pages/Home/Home";
import About from "../pages/About";
import Organizations from "../pages/Organizations/Organizations";

import EditProfile from "../pages/EditProfile/editProfile";
import Invitations from "../pages/Invitations/Invitations";

import Entity from "../pages/Entity/Entity";
import Informations from "../pages/Informations/Informations";
import Requests from "../pages/Requests/Requests";
import Members from "../pages/Members/Members";
import Volunteering from "../pages/Volunteering/Volunteering";

import ListVacancies from "../pages/Vacancies/ListVacancies";
import CreateVacancy from "../pages/Vacancies/CreateVacancy";
import EditVacancy from "../pages/Vacancies/EditVacancy";
import VacancyDetail from "../pages/Vacancies/VacancyDetail";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/inicio" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/cadastro" element={<Register />} />
      <Route path="/confirmacao" element={<Confirmation />} />
      <Route path="/reenviar-confirmacao" element={<ResendConfirmation />} />

      <Route path="/editar-perfil" element={<EditProfile />} />
      <Route path="/sobre" element={<About />} />
      <Route path="/convites" element={<Invitations />} />

      <Route path="/inicio" element={<Home />} />
      <Route path="/organizacoes" element={<Organizations />} />
      <Route path="/oportunidades" element={<Opportunities />} />

      <Route path="/entidade/cadastro" element={<Entity />} />
      <Route path="/entidade/sobre" element={<Informations />} />
      <Route path="/entidade/solicitacoes" element={<Requests />} />
      <Route path="/entidade/membros" element={<Members />} />
      <Route path="/entidade/vagas" element={<Volunteering />} />


      <Route path="/vagas" element={<ListVacancies />} />
      <Route path="/vagas/cadastro" element={<CreateVacancy />} />
      <Route path="/vagas/:id" element={<VacancyDetail />} />
      <Route path="/vagas/:id/editar" element={<EditVacancy />} />
    </Routes>
  );
};

export default AppRoutes;
