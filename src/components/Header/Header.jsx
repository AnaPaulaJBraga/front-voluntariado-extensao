import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { api } from "../../services/api";
import { getActiveContext, saveActiveContext, clearActiveContext } from "../../utils/activeContext";
import userIcon from "../../assets/user_icon.png";
import clipboard from "../../assets/clipboard-form.png";
import plusCircle from "../../assets/plus-circle.png";
import logo from "../../assets/logo.png";

import "./Header.css";

const Header = ({ userName }) => {
  const location = useLocation();
  const [openMenu, setOpenMenu] = useState(false);
  const [membership, setMembership] = useState(undefined);
  const activeContext = getActiveContext();

  const token = localStorage.getItem("access_token");
  const storedUser = localStorage.getItem("user");

  useEffect(() => {
    if (!token) return;
    let isCurrentPage = true;
    api.get("/entities/me", true)
      .then((response) => {
        if (isCurrentPage) setMembership(response.data);
      })
      .catch(() => {});
    return () => { isCurrentPage = false; };
  }, [token]);

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
  const displayName = sessionUserName || "Usuario";
  const isLoggedIn = Boolean(token);

  const switchMode = (mode) => {
    saveActiveContext(mode, mode === "entity" ? membership.entity.id : null);
    window.location.href = "/inicio";
  };

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
      <div className="app-header__brand" style={{display: "flex", alignItems: "center", gap: "10px"}}>
        <img src={logo} alt="logo" style={{ width: "40px", height: "auto" }} />
        Voluntários em Ação
        </div>

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

      {isLoggedIn && (
        <>
          <div className="app-header__user-wrapper">
            <div
              className="app-header__user"
              aria-label="Usuario logado"
              role="button"
              tabIndex={0}
              onClick={toggleMenu}
            >
              <div className="app-header__avatar">{displayName.charAt(0)}</div>
              <div>
                <p className="app-header__hello">Olá, {displayName}!</p>
                <p className="app-header__meta">
                  {activeContext?.mode === "entity" && membership
                    ? membership.entity.name
                    : "Conta pessoal"}
                </p>
              </div>
            </div>

            {openMenu && (
              <div className="app-header__dropdown dropdown-menu show">
                <button
                  type="button"
                  className="app-header__dropdown-item dropdown-item"
                  onClick={() => {
                    window.location.href = "/editar-perfil";
                  }}
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
                {membership && (
                  <>
                    <button type="button" className="app-header__dropdown-item dropdown-item"
                      onClick={() => switchMode("user")}>Conta pessoal</button>
                    <button type="button" className="app-header__dropdown-item dropdown-item"
                      onClick={() => switchMode("entity")}>Minha entidade</button>
                  </>
                )}
                {membership === null && (
                <button
                  type="button"
                  className="app-header__dropdown-item dropdown-item"
                  onClick={() => {
                    window.location.href = "/entidade/cadastro";
                  }}
                >
                  <img
                    src={plusCircle}
                    alt="Perfil"
                    className="dropdown-item__icon"
                  />
                  Cadastre sua ONG
                </button>
                )}
                <button
                  type="button"
                  className="app-header__dropdown-item dropdown-item"
                  onClick={() => {
                    localStorage.removeItem("access_token");
                    localStorage.removeItem("user");
                    clearActiveContext();
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

      {!isLoggedIn && (
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
