import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import userIcon from "../../assets/user_icon.png";
import clipboard from "../../assets/clipboard-form.png";
import plusCircle from "../../assets/plus-circle.png";

import "./Header.css";

const Header = ({ userName, userLoggedIn }) => {
  const location = useLocation();
  const [openMenu, setOpenMenu] = useState(false);

  const token = localStorage.getItem("access_token");
  const storedUser = localStorage.getItem("user");

  let parsedUser = null;

  if (storedUser) {
    try {
      parsedUser = JSON.parse(storedUser);
    } catch {
      parsedUser = storedUser;
    }
  }

  const rawName =
    userName ||
    parsedUser?.nome ||
    parsedUser?.name ||
    parsedUser?.fullName ||
    (typeof parsedUser === "string" ? parsedUser : "");

  const sessionUserName = rawName.trim().split(/\s+/)[0] || "";
  const isLoggedIn = Boolean(token && storedUser && sessionUserName);

  const getActivePage = () => {
    if (location.pathname === "/inicio") return "inicio";
    if (location.pathname === "/oportunidades") return "oportunidades";
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
      <div className="app-header__brand">Voluntários em Ação</div>

      <nav className="app-header__nav" aria-label="Navegacao principal">
        <NavLink
          to="/inicio"
          className={`app-header__link ${
            activePage === "inicio" ? "app-header__link--active" : ""
          }`}
        >
          Início
        </NavLink>

        <NavLink
          to="/oportunidades"
          className={`app-header__link ${
            activePage === "oportunidades" ? "app-header__link--active" : ""
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
          Organizações
        </NavLink>

        <NavLink
          to="/sobre"
          className={`app-header__link ${
            activePage === "sobre" ? "app-header__link--active" : ""
          }`}
        >
          Sobre nós
        </NavLink>
      </nav>

      {(userLoggedIn ?? isLoggedIn) && (
        <>
          <div className="app-header__user-wrapper">
            <div
              className="app-header__user"
              aria-label="Usuario logado"
              role="button"
              tabIndex={0}
              onClick={toggleMenu}
            >
              <div className="app-header__avatar">
                {(sessionUserName || userName || "U").charAt(0)}
              </div>
              <div>
                <p className="app-header__hello">
                  Olá, {sessionUserName || userName}!
                </p>
                <p className="app-header__meta">Conta pessoal</p>
              </div>
            </div>

            {openMenu && (
              <div className="app-header__dropdown dropdown-menu show">
                <button
                  type="button"
                  className="app-header__dropdown-item dropdown-item"
                >
                  <img
                    src={userIcon}
                    alt="Perfil"
                    className="dropdown-item__icon"
                  />
                  Ver perfil
                </button>
                <button
                  type="button"
                  className="app-header__dropdown-item dropdown-item"
                >
                  <img
                    src={clipboard}
                    alt="Solicitações"
                    className="dropdown-item__icon"
                  />
                  Solicitações
                </button>
                <button
                  type="button"
                  className="app-header__dropdown-item dropdown-item"
                >
                  <img
                    src={plusCircle}
                    alt="Perfil"
                    className="dropdown-item__icon"
                  />
                  Cadastre sua ONG
                </button>
                <button
                  type="button"
                  className="app-header__dropdown-item dropdown-item"
                  onClick={() => {
                    localStorage.removeItem("access_token");
                    localStorage.removeItem("user");
                    window.location.href = "/inicio";
                  }}
                >
                  Sair
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {!(userLoggedIn ?? isLoggedIn) && (
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

export default Header;
