import { NavLink } from "react-router-dom";
import "./HomeHeader/HomeHeader.css";

export default function Header() {
  return (
    <header className="app-header">
      <div className="app-header__brand">Voluntários em Ação</div>

      <nav className="app-header__nav">
        <NavLink to="/inicio" className="app-header__link">
          Início
        </NavLink>

        <NavLink to="/home" className="app-header__link">
          Oportunidades
        </NavLink>

        <NavLink to="/organizacoes" className="app-header__link">
          Organizações
        </NavLink>

        <NavLink to="/sobre" className="app-header__link">
          Sobre nós
        </NavLink>
      </nav>

      <div className="app-header__auth">
        <NavLink to="/login" className="app-header__auth-link">
          Entrar
        </NavLink>

        <NavLink to="/cadastro" className="app-header__auth-link">
          Cadastrar
        </NavLink>
      </div>
    </header>
  );
}