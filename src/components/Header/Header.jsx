import { useState, useEffect, useRef } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useEntity } from "../../contexts/EntityContexts";
import {
  getActiveContext,
  saveActiveContext,
  clearActiveContext,
} from "../../utils/activeContext";
import userIcon from "../../assets/icons/user.png";
import about from "../../assets/icons/about.png";
import invitation from "../../assets/icons/invitation.png";
import members from "../../assets/icons/members.png";
import profile from "../../assets/icons/profile.png";
import organization from "../../assets/icons/organization.png";
import addOrganization from "../../assets/icons/cadastro_org.png";
import requests from "../../assets/icons/requests.png";
import volunteering from "../../assets/icons/volunteering.png";
import config from "../../assets/icons/config.png";
import lougout from "../../assets/icons/logout.png";
import notification from "../../assets/icons/sino.png";
import logo from "../../assets/logo.png";

import "./Header.css";

const Header = ({ userName }) => {
  const location = useLocation();
  const [openMenu, setOpenMenu] = useState(false);
  const [activeContext, setActiveContext] = useState(getActiveContext());
  const { membership } = useEntity();

  const menuRef = useRef(null);

  useEffect(() => {
    if (!openMenu) return;

    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openMenu]);

  useEffect(() => {
    const handleContextChange = () => setActiveContext(getActiveContext());

    window.addEventListener("active-context-updated", handleContextChange);

    return () =>
      window.removeEventListener("active-context-updated", handleContextChange);
  }, []);

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
      <div
        className="app-header__brand"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
        }}
      >
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
          <div ref={menuRef} className="app-header__user-wrapper">
            <button
              type="button"
              className="header-notifications"
              onMouseDown={(event) => event.stopPropagation()}
              onClick={(event) => {
                event.stopPropagation();
                setOpenMenu(false);
                window.location.href = "/notificacoes";
              }}
              aria-label="Notificações"
            >
              <img src={notification} alt="" />

              <span className="header-notifications__badge" />
            </button>

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
                {membership && (
                  <button
                    type="button"
                    className="app-header__dropdown-item dropdown-item"
                    onClick={() => switchMode("user")}
                  >
                    <img
                      src={userIcon}
                      alt="user.png"
                      className="dropdown-item__icon"
                    />
                    Conta pessoal
                  </button>
                )}

                <button
                  type="button"
                  className="app-header__dropdown-item dropdown-item"
                  onClick={() => {
                    window.location.href = "/editar-perfil";
                  }}
                >
                  <img
                    src={profile}
                    alt="Perfil"
                    className="spcd-dropdown-item__icon"
                  />
                  Perfil
                </button>

                <button
                  type="button"
                  onClick={() => {
                    window.location.href = "/convites";
                  }}
                  className="app-header__dropdown-item dropdown-item"
                >
                  <img
                    src={invitation}
                    alt="Convites"
                    className="spcd-dropdown-item__icon"
                  />
                  Convites
                </button>

                {!membership && (
                  <button
                    type="button"
                    onClick={() => {
                      window.location.href = "/entidade/cadastro";
                    }}
                    className="app-header__dropdown-item dropdown-item"
                  >
                    <img
                      src={addOrganization}
                      alt="Organização"
                      className="spcd-dropdown-item__icon"
                    />
                    Cadastrar organização
                  </button>
                )}

                {membership && (
                  <>
                    <button
                      type="button"
                      className="app-header__dropdown-item dropdown-item"
                      onClick={() => switchMode("entity")}
                      style={{ marginTop: "10px" }}
                    >
                      <img
                        src={organization}
                        alt="organization"
                        className="dropdown-item__icon"
                      />
                      Organização
                    </button>

                    <button
                      type="button"
                      className="app-header__dropdown-item dropdown-item"
                      onClick={() => {
                        window.location.href = `/entidade/sobre/${membership.entity.slug}`;
                      }}
                    >
                      <img
                        src={about}
                        alt="informações"
                        className="spcd-dropdown-item__icon"
                      />
                      Informações
                    </button>

                    <button
                      type="button"
                      className="app-header__dropdown-item dropdown-item"
                      onClick={() => {
                        window.location.href = "/entidade/solicitacoes";
                      }}
                    >
                      <img
                        src={requests}
                        alt="Solicitações"
                        className="spcd-dropdown-item__icon"
                      />
                      Solicitações
                    </button>

                    <button
                      type="button"
                      className="app-header__dropdown-item dropdown-item"
                      onClick={() => {
                        window.location.href = "/entidade/membros";
                      }}
                    >
                      <img
                        src={members}
                        alt="Membros"
                        className="spcd-dropdown-item__icon"
                      />
                      Membros
                    </button>

                    <button
                      type="button"
                      className="app-header__dropdown-item dropdown-item"
                      onClick={() => {
                        window.location.href = "/entidade/vagas";
                      }}
                    >
                      <img
                        src={volunteering}
                        alt="Vagas"
                        className="spcd-dropdown-item__icon"
                      />
                      Gerenciar vagas
                    </button>
                  </>
                )}

                <button
                  type="button"
                  className="app-header__dropdown-item dropdown-item"
                  onClick={() => {
                    window.location.href = "/configuracoes";
                  }}
                  style={{ marginTop: "10px" }}
                >
                  <img
                    src={config}
                    alt="configurations"
                    className="dropdown-item__icon"
                  />
                  Configurações
                </button>

                <button
                  type="button"
                  className="app-header__dropdown-item dropdown-item"
                  onClick={(event) => {
                    event.stopPropagation();
                    localStorage.removeItem("access_token");
                    localStorage.removeItem("user");
                    clearActiveContext();
                    setOpenMenu(false);
                    window.location.href = "/login";
                  }}
                >
                  <img
                    src={lougout}
                    alt="logout"
                    className="dropdown-item__icon"
                  />
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
