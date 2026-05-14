import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import userIcon from "../../assets/user_icon.png";
import clipboard from "../../assets/clipboard-form.png";
import plusCircle from "../../assets/plus-circle.png";

import "./HomeHeader.css";

const HomeHeader = ({ userName = "Ana", userLoggedIn = true }) => {
  const location = useLocation();
  const [openMenu, setOpenMenu] = useState(false);

  const getActivePage = () => {
    if (location.pathname === "/inicio") return "inicio";
    if (location.pathname === "/home") return "home";
    if (location.pathname === "/organizacoes") return "organizacoes";
    if (location.pathname === "/sobre") return "sobre";
    return "";
  };

  const activePage = getActivePage();

  const toggleMenu = () => {
    setOpenMenu((prev) => !prev);
  };

  return (
    <header className="app-header">
      <div className="app-header__brand">Voluntarios em Acao</div>

      <nav className="app-header__nav" aria-label="Navegacao principal">
        <NavLink
          to="/inicio"
          className={`app-header__link ${
            activePage === "inicio" ? "app-header__link--active" : ""
          }`}
        >
          Inicio
        </NavLink>

        <NavLink
          to="/home"
          className={`app-header__link ${
            activePage === "home" ? "app-header__link--active" : ""
          }`}
        >
          Oportunidades
        </NavLink>

        <NavLink
          to="/organizacoes"
          className={`app-header__link ${
            activePage === "organizacoes" ? "app-header__link--active" : ""
          }`}
        >
          Organizacoes
        </NavLink>

        <NavLink
          to="/sobre"
          className={`app-header__link ${
            activePage === "sobre" ? "app-header__link--active" : ""
          }`}
        >
          Sobre nos
        </NavLink>
      </nav>

      {userLoggedIn && (
        <>
          <div className="app-header__user-wrapper">
            <div
              className="app-header__user"
              aria-label="Usuario logado"
              role="button"
              tabIndex={0}
              onClick={toggleMenu}
            >
              <div className="app-header__avatar">{userName.charAt(0)}</div>
              <div>
                <p className="app-header__hello">Olá, {userName}!</p>
                <p className="app-header__meta">Conta pessoal</p>
              </div>
            </div>

            {openMenu && (
              <div className="app-header__dropdown">
                <div className="dropdown-item">
                  <img
                    src={userIcon}
                    alt="Perfil"
                    className="dropdown-item__icon"
                  />
                  Ver perfil
                </div>
                <div className="dropdown-item">
                  <img
                    src={clipboard}
                    alt="Solicitações"
                    className="dropdown-item__icon"
                  />
                  Solicitações
                </div>
                <div className="dropdown-item">
                  <img
                    src={plusCircle}
                    alt="Perfil"
                    className="dropdown-item__icon"
                  />
                  Cadastre sua ONG
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {!userLoggedIn && (
        <div className="app-header__auth">
          <NavLink
            to="/login"
            className="app-header__auth-link app-header__auth-link--primary"
          >
            Entrar
          </NavLink>
          <NavLink
            to="/cadastro"
            className="app-header__auth-link app-header__auth-link--primary"
          >
            Cadastrar
          </NavLink>
        </div>
      )}
    </header>
  );
};

export default HomeHeader;
