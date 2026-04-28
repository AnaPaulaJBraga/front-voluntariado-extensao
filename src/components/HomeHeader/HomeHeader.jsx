import { NavLink } from "react-router-dom";
import "./HomeHeader.css";

const HomeHeader = ({ userName = "Ana", showMenu = true }) => {
  return (
    <header className="app-header">
      <div className="app-header__brand">Voluntarios em Acao</div>

      <nav className="app-header__nav" aria-label="Navegacao principal">
        <NavLink className="app-header__link" to="/">
          Inicio
        </NavLink>
        <a
          className="app-header__link app-header__link--active"
          href="#oportunidades"
        >
          Oportunidades
        </a>
        <a className="app-header__link" href="#organizacoes">
          Organizacoes
        </a>
        <a className="app-header__link" href="#sobre">
          Sobre nos
        </a>
      </nav>

      {showMenu && (
        <div className="app-header__user" aria-label="Usuario logado">
          <div className="app-header__avatar" aria-hidden="true">
            A
          </div>
          <div>
            <p className="app-header__hello">Ola, {userName}!</p>
            <p className="app-header__meta">Conta pessoal</p>
          </div>
        </div>
      )}
    </header>
  );
};

export default HomeHeader;
