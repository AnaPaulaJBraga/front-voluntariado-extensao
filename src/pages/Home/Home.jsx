import { useEffect, useState } from "react";
import { api } from "../../services/api";
import { getActiveContext, saveActiveContext, clearActiveContext } from "../../utils/activeContext";
import Opportunities from "../Opportunities/Opportunities";
import EntityDashboard from "./EntityDashboard";

const Home = () => {
  const [entityMembership, setEntityMembership] = useState(null);
  const [activeMode, setActiveMode] = useState("user");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      clearActiveContext();
      return;
    }

    let isCurrentPage = true;
    api.get("/entities/me", true)
      .then((response) => {
        if (!isCurrentPage) return;
        const membership = response.data;
        const savedContext = getActiveContext();
        setEntityMembership(membership);

        if (!membership) {
          saveActiveContext("user");
          return;
        }

        if (savedContext?.mode === "user") {
          setActiveMode("user");
          return;
        }

        // A pessoa só pode participar de uma entidade.
        saveActiveContext("entity", membership.entity.id);
        setActiveMode("entity");
      })
      .catch((error) => {
        if (!isCurrentPage) return;
        if (error?.response?.status === 401) {
          localStorage.removeItem("access_token");
          localStorage.removeItem("user");
          clearActiveContext();
          window.location.href = "/login";
          return;
        }
        setErrorMessage("Não foi possível carregar sua entidade. Tente novamente.");
      })
      .finally(() => {
        if (isCurrentPage) setIsLoading(false);
      });

    return () => { isCurrentPage = false; };
  }, []);

  if (isLoading && localStorage.getItem("access_token")) return <p>Carregando...</p>;
  if (errorMessage) return <p role="alert">{errorMessage}</p>;
  if (activeMode === "entity" && entityMembership) {
    return <EntityDashboard membership={entityMembership} />;
  }
  return <Opportunities />;
};

export default Home;
